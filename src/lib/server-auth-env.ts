import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';

const isProduction = process.env.NODE_ENV === 'production';
const envFileOrder = isProduction
  ? ['.env.production.local', '.env.production', '.env']
  : ['.env.local', '.env.development.local', '.env.development', '.env'];

const loadedFileEnv = envFileOrder
  .map((filename) => {
    const filepath = join(process.cwd(), filename);
    if (!existsSync(filepath)) return null;
    return dotenv.parse(readFileSync(filepath));
  })
  .filter((entry): entry is Record<string, string> => Boolean(entry));

const firstDefined = (...keys: Array<string | undefined>) => {
  for (const key of keys) {
    if (!key) continue;
    const fromProcess = process.env[key];
    if (fromProcess && fromProcess.trim()) return fromProcess.trim();

    for (const source of loadedFileEnv) {
      const value = source[key];
      if (value && value.trim()) return value.trim();
    }
  }
  return '';
};

export const serverAuthEnv = {
  healthClientId: () => firstDefined('NEXT_PUBLIC_HEALTH_CLIENT_ID', 'HEALTH_CLIENT_ID'),
  healthClientSecret: () => firstDefined('NEXT_PUBLIC_HEALTH_CLIENT_SECRET', 'HEALTH_CLIENT_SECRET'),
  healthBaseUrl: () => firstDefined('NEXT_PUBLIC_HEALTH_BASE_URL', 'HEALTH_BASE_URL'),
  healthRedirectUri: () => firstDefined('NEXT_PUBLIC_HEALTH_REDIRECT_URI', 'HEALTH_REDIRECT_URI'),
  providerBaseUrl: () => firstDefined('NEXT_PUBLIC_PROVIDER_BASE_URL', 'PROVIDER_BASE_URL'),
  providerClientId: () => firstDefined('NEXT_PUBLIC_PROVIDER_CLIENT_ID', 'PROVIDER_CLIENT_ID'),
  providerClientSecret: () =>
    firstDefined('NEXT_PUBLIC_PROVIDER_CLIENT_SECRET', 'PROVIDER_CLIENT_SECRET'),
  telegramBotToken: () => firstDefined('TELEGRAM_BOT_TOKEN'),
  telegramChatId: () => firstDefined('TELEGRAM_CHAT_ID'),
} as const;
