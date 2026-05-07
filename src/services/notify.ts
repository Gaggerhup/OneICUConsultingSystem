/**
 * Server-side Notification Dispatch Service
 *
 * Responsible for:
 * 1. Querying the `provider` table to find users whose notifPrefs match the event type
 * 2. Inserting a row into the `notification` table for each matching user (In-App)
 * 3. Sending a Telegram message to the default chat via Bot API (Push)
 */

import { db } from '@/database';
import { users } from '@/database/schemas/users';
import { notifications } from '@/database/schemas/notifications';
import { resolvePublicAppUrl } from '@/lib/public-url';
import { serverAuthEnv } from '@/lib/server-auth-env';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotifyEventType =
  | 'newRequest'
  | 'requestApproved'
  | 'newMessage'
  | 'caseUpdate'
  | 'systemAlert';

export type DispatchParams = {
  eventType: NotifyEventType;
  title: string;
  message: string;
  caseId?: string;
  priority?: string;
  excludeUserId?: number; // e.g. the person who submitted shouldn't be notified
};

// Map eventType → the key inside the notifPrefs JSON
const EVENT_TO_PREF_KEY: Record<NotifyEventType, string> = {
  newRequest: 'newRequest',
  requestApproved: 'requestApproved',
  newMessage: 'newMessage',
  caseUpdate: 'caseUpdate',
  systemAlert: 'systemAlert',
};

// Map priority → emoji
const PRIORITY_EMOJI: Record<string, string> = {
  IMMEDIATE: '🔴',
  EMERGENCY: '🩷',
  URGENT: '🟠',
  'SEMI-URGENT': '🟢',
  'NON-URGENT': '⚪',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseNotifPrefs(raw: string | null): Record<string, boolean> {
  const fallback: Record<string, boolean> = {
    telegram: true,
    newRequest: true,
    requestApproved: true,
    newMessage: true,
    caseUpdate: true,
    systemAlert: true,
  };
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

/**
 * Send a Telegram message using the Bot API directly.
 * Falls back silently if token or chatId is missing.
 */
async function sendTelegram(inputText: string, targetChatId: string, caseId?: string): Promise<void> {
  let text = inputText;
  const token = serverAuthEnv.telegramBotToken() || process.env.TELEGRAM_BOT_TOKEN;

  if (!token || !targetChatId) {
    console.warn('[Notify] Telegram skipped — TELEGRAM_BOT_TOKEN or targetChatId not set');
    return;
  }

  const webAppUrl = (process.env.WEB_APP_URL || resolvePublicAppUrl()).split(' -> ')[0].trim();
  const isHttps = webAppUrl.startsWith('https://');

  // Telegram requires HTTPS for Web App inline keyboard buttons.
  // On local HTTP, we fall back to a plain URL link in the body.
  const inlineKeyboard = caseId && isHttps
    ? {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🏥 เปิดระบบ OneICU',
                web_app: { url: `${webAppUrl}/?caseId=${caseId}&ref=telegram_bot` },
              },
            ],
          ],
        },
      }
    : {};

  // Append a clickable link when no inline keyboard is used
  if (caseId && !isHttps) {
    text += `\n\n🔗 ${webAppUrl}/?caseId=${caseId}`;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: 'HTML',
        ...inlineKeyboard,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Notify] Telegram API error:', res.status, body);
    } else {
      console.log(`[Notify] Telegram sent to chat ${targetChatId}`);
    }
  } catch (err) {
    console.error('[Notify] Telegram fetch failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

export async function dispatchNotification(params: DispatchParams): Promise<void> {
  const { eventType, title, message, caseId, priority, excludeUserId } = params;
  const prefKey = EVENT_TO_PREF_KEY[eventType];

  try {
    // 1. Query providers and let channel preferences decide delivery.
    const allProviders = await db
      .select()
      .from(users);

    // 2. Filter by notifPrefs
    const recipients = allProviders.filter((provider) => {
      if (excludeUserId && provider.id === excludeUserId) return false;
      const prefs = parseNotifPrefs(provider.notifPrefs);
      return prefs[prefKey] === true;
    });
    const inAppRecipients = recipients.filter((provider) => provider.isAcceptingNotifications);
    const telegramRecipients = recipients.filter((provider) => {
      const prefs = parseNotifPrefs(provider.notifPrefs);
      return prefs.telegram !== false;
    });

    console.log(
      `[Notify] Event "${eventType}" → ${recipients.length}/${allProviders.length} recipients (${inAppRecipients.length} in-app, ${telegramRecipients.length} Telegram)`,
    );

    // 3. Insert in-app notification for each matching user
    const now = new Date();
    const notifyDate = now.toISOString().slice(0, 10);
    const notifyTime = now.toTimeString().slice(0, 8);

    // Map eventType → notification type column
    const notifTypeMap: Record<NotifyEventType, string> = {
      newRequest: 'request',
      requestApproved: 'request',
      newMessage: 'message',
      caseUpdate: 'alert',
      systemAlert: 'alert',
    };

    if (inAppRecipients.length > 0) {
      const rows = inAppRecipients.map((provider) => ({
        userId: provider.id,
        notifyDate,
        notifyTime,
        title,
        message,
        read: false,
        type: notifTypeMap[eventType] || 'alert',
      }));

      await db.insert(notifications).values(rows);
      console.log(`[Notify] Inserted ${rows.length} in-app notification(s)`);
    }

    // 4. Send Telegram to individual chats and default chat
    const emoji = priority ? (PRIORITY_EMOJI[priority] || '🔔') : '🔔';
    const telegramText =
      `${emoji} <b>${title}</b>\n\n` +
      `${message}\n\n` +
      `<i>ระบบ OneICU Consulting</i>`;

    // 4.1 Send to each recipient's personal Telegram if they have one linked
    const sentChats = new Set<string>();
    
    for (const provider of telegramRecipients) {
      if (provider.telegramChatId) {
        await sendTelegram(telegramText, provider.telegramChatId, caseId);
        sentChats.add(provider.telegramChatId);
      }
    }

    // 4.2 Also send to the default global chat as a broadcast feed,
    // unless the default chat happens to be one of the personal chats we just sent to.
    const defaultChatId = serverAuthEnv.telegramChatId() || process.env.TELEGRAM_CHAT_ID;
    if (defaultChatId && telegramRecipients.length > 0 && !sentChats.has(defaultChatId)) {
      await sendTelegram(telegramText, defaultChatId, caseId);
    }
  } catch (err) {
    // Notification failures should never break the main flow
    console.error('[Notify] dispatchNotification failed:', err);
  }
}
