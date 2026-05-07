'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { authService, type ServerAuthSession } from '@/services/auth';
import {
  DeactivateModal,
  NotificationsTab,
  ProfileTab,
  SaveToast,
  SecurityTab,
  SettingsSidebar,
  settingsNavIconMap,
  type SecuritySession,
  type SettingsTab,
  type SettingsUserProfile,
} from './settings-sections';
import styles from './style.module.css';

const normalizeNotifPrefs = (
  prefs: Partial<SettingsUserProfile['notifPrefs']> | null | undefined,
): SettingsUserProfile['notifPrefs'] => ({
  telegram: prefs?.telegram !== false,
  newRequest: prefs?.newRequest !== false,
  requestApproved: prefs?.requestApproved !== false,
  newMessage: prefs?.newMessage !== false,
  caseUpdate: prefs?.caseUpdate !== false,
  systemAlert: prefs?.systemAlert !== false,
});

const detectBrowser = (userAgent: string) => {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/CriOS|Chrome\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Browser';
};

const detectOs = (userAgent: string, platform?: string) => {
  const value = `${userAgent} ${platform || ''}`;
  if (/iPhone|iPad|iPod/.test(value)) return 'iOS';
  if (/Android/.test(value)) return 'Android';
  if (/Mac/.test(value)) return 'macOS';
  if (/Win/.test(value)) return 'Windows';
  if (/Linux/.test(value)) return 'Linux';
  return 'this device';
};

const formatSessionTime = (isoDate: string | undefined, language: string, t: (key: string, vars?: Record<string, string>) => string) => {
  if (!isoDate) {
    return t('settings.lastUsedUnavailable');
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return t('settings.lastUsedUnavailable');
  }

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (sameDay) {
    return t('settings.todayAt', { time });
  }

  return date.toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildCurrentSecuritySession = (language: string, t: (key: string, vars?: Record<string, string>) => string): SecuritySession[] => {
  const session = authService.getSession();
  if (!session) return [];

  const meta = authService.getSessionMeta();
  const userAgent = meta?.userAgent || window.navigator.userAgent;
  const platform = meta?.platform || window.navigator.platform;
  const browser = detectBrowser(userAgent);
  const os = detectOs(userAgent, platform);
  const joiner = t('settings.onDevice');

  return [{
    id: 'current',
    device: `${browser} ${joiner} ${os}`,
    location: t('settings.thisDevice'),
    time: formatSessionTime(meta?.lastUsedAt, language, t),
    isCurrent: true,
    isOnline: true,
    statusLabel: t('settings.sessionOnline'),
    type: /Mobile|Android|iPhone|iPad|iPod/.test(userAgent) ? 'mobile' : 'laptop',
  }];
};

const buildServerSecuritySessions = (serverSessions: ServerAuthSession[], language: string, t: (key: string, vars?: Record<string, string>) => string): SecuritySession[] => {
  return serverSessions.map((session) => {
    const userAgent = session.userAgent || '';
    const displayDevice = language === 'th'
      ? session.device.replace(' on ', ` ${t('settings.onDevice')} `)
      : session.device;

    return {
      id: session.id,
      device: displayDevice,
      location: session.isCurrent
        ? t('settings.thisDevice')
        : (session.ipAddress || t('settings.otherDevice')),
      time: formatSessionTime(session.lastSeenAt, language, t),
      isCurrent: session.isCurrent,
      isOnline: session.isOnline,
      statusLabel: session.isOnline ? t('settings.sessionOnline') : t('settings.sessionIdle'),
      type: /Mobile|Android|iPhone|iPad|iPod/.test(userAgent) ? 'mobile' : 'laptop',
    };
  });
};

function Settings() {
  const router = useRouter();
  const { userProfile, updateUserProfile, showToast } = useApp();
  const { t, language } = useLocale();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [hasProviderSession, setHasProviderSession] = useState(false);
  const [authStatusText, setAuthStatusText] = useState(t('settings.checkingSession'));
  const [notifPrefs, setNotifPrefs] = useState(() => normalizeNotifPrefs(userProfile.notifPrefs));
  const [acceptingNotifications, setAcceptingNotifications] = useState(() => userProfile.isAcceptingNotifications);
  const [telegramChatId, setTelegramChatId] = useState<string | null>(() => userProfile.telegramChatId || null);

  const navItems = [
    { id: 'profile' as const, label: t('settings.profileTab'), icon: settingsNavIconMap.profile },
    { id: 'notifications' as const, label: t('settings.notificationsTab'), icon: settingsNavIconMap.notifications },
    { id: 'security' as const, label: t('settings.securityTab'), icon: settingsNavIconMap.security },
  ];

  const handleSaved = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  useEffect(() => {
    setNotifPrefs(normalizeNotifPrefs(userProfile.notifPrefs));
    setAcceptingNotifications(userProfile.isAcceptingNotifications);
    setTelegramChatId(userProfile.telegramChatId || null);
  }, [userProfile.isAcceptingNotifications, userProfile.notifPrefs, userProfile.telegramChatId]);

  useEffect(() => {
    let isMounted = true;

    const loadSessions = async () => {
      try {
        const serverSessions = await authService.getServerSessions();
        if (!isMounted) return;

        const mappedSessions = serverSessions.length > 0
          ? buildServerSecuritySessions(serverSessions, language, t)
          : buildCurrentSecuritySession(language, t);
        const currentSession = mappedSessions.find((session) => session.isCurrent) || mappedSessions[0];

        setSessions(mappedSessions);
        setHasProviderSession(mappedSessions.length > 0);
        setAuthStatusText(
          currentSession
            ? t('settings.connectedLastUsed', { time: currentSession.time })
            : t('settings.noProviderSession'),
        );
      } catch (error) {
        if (!isMounted) return;

        const fallbackSessions = buildCurrentSecuritySession(language, t);
        const latestSession = fallbackSessions[0];

        setSessions(fallbackSessions);
        setHasProviderSession(fallbackSessions.length > 0);
        setAuthStatusText(
          latestSession
            ? t('settings.connectedLastUsed', { time: latestSession.time })
            : t('settings.noProviderSession'),
        );
      }
    };

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, [language, t]);

  const revokeSession = async (id: string) => {
    await authService.revokeServerSession(id);
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  const handleSaveNotifPrefs = () => {
    updateUserProfile({
      notifPrefs,
      isAcceptingNotifications: acceptingNotifications,
      telegramChatId,
    });
    authService.saveUserProfile({
      ...userProfile,
      notifPrefs,
      isAcceptingNotifications: acceptingNotifications,
      telegramChatId,
    });
    handleSaved();
  };

  const handleDeactivate = () => {
    authService.clearProfileInitialization();
    authService.logout();
    setShowDeactivateModal(false);
    showToast(t('settings.accountDeactivated'), 'info');
  };

  return (
    <Layout>
      <div className={styles['settings-page']}>
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navItems={navItems}
          userProfile={userProfile}
        />

        <div className={styles['settings-content']}>
          {activeTab === 'profile' && (
            <>
              <ProfileTab
                key={`${userProfile.title || 'title'}|${userProfile.firstName}|${userProfile.lastName}|${userProfile.license || ''}|${userProfile.specialty || ''}|${userProfile.hospital || ''}|${userProfile.email || ''}|${userProfile.phoneNumber || ''}|${userProfile.avatarUrl || ''}|${userProfile.isAcceptingCases ? '1' : '0'}|${userProfile.isAcceptingNotifications ? '1' : '0'}|${userProfile.summary || ''}`}
                userProfile={userProfile}
                language={language}
                t={t}
                onSaveProfile={updateUserProfile}
                onCancel={() => router.back()}
                onSaved={handleSaved}
              />
              {showSaveToast && <SaveToast t={t} />}
            </>
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab
              acceptingNotifications={acceptingNotifications}
              telegramChatId={telegramChatId}
              notifPrefs={notifPrefs}
              setAcceptingNotifications={setAcceptingNotifications}
              setTelegramChatId={setTelegramChatId}
              setNotifPrefs={setNotifPrefs}
              onSave={handleSaveNotifPrefs}
              t={t}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              language={language}
              sessions={sessions}
              authStatusText={authStatusText}
              hasProviderSession={hasProviderSession}
              revokeSession={revokeSession}
              setShowDeactivateModal={setShowDeactivateModal}
              t={t}
            />
          )}
        </div>
      </div>

      {showDeactivateModal && (
        <DeactivateModal
          onCancel={() => setShowDeactivateModal(false)}
          onConfirm={handleDeactivate}
          t={t}
        />
      )}
    </Layout>
  );
}

export default Settings;
