import { useEffect, useRef, useState } from 'react';
import {
  User,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Laptop,
  Smartphone,
  Globe,
  ClipboardCheck,
  ClipboardPlus,
  MessageSquare,
  Activity,
  Siren,
  Send,
} from 'lucide-react';
import { SPECIALTY_OPTIONS } from '@/constants/specialties';
import { cx } from '@/lib/cx';
import styles from './style.module.css';
import {
  ProfileActions,
  ProfileEditableFields,
  ProfileIdentityFields,
  ProfilePhotoCard,
  SettingsSidebarAvatar,
} from './settings-profile-sections';

type TFunction = (key: string) => string;

export type SettingsTab = 'profile' | 'notifications' | 'security';

export type SettingsUserProfile = {
  title?: string | null;
  firstName?: string;
  lastName?: string;
  specialty?: string | null;
  hospital?: string | null;
  email?: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  isAcceptingCases: boolean;
  isAcceptingNotifications: boolean;
  license?: string | null;
  summary?: string | null;
  telegramChatId?: string | null;
  notifPrefs: {
    telegram: boolean;
    newRequest: boolean;
    requestApproved: boolean;
    newMessage: boolean;
    caseUpdate: boolean;
    systemAlert: boolean;
  };
};

type ProfileTabProps = {
  userProfile: SettingsUserProfile;
  language: string;
  t: TFunction;
  onSaveProfile: (profile: Record<string, unknown>) => void;
  onCancel: () => void;
  onSaved: () => void;
};

type NotificationsTabProps = {
  acceptingNotifications: boolean;
  telegramChatId: string | null;
  notifPrefs: SettingsUserProfile['notifPrefs'];
  setAcceptingNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  setTelegramChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setNotifPrefs: React.Dispatch<React.SetStateAction<SettingsUserProfile['notifPrefs']>>;
  onSave: () => void;
  t: TFunction;
};

export type SecuritySession = {
  id: string;
  device: string;
  location: string;
  time: string;
  isCurrent: boolean;
  isOnline: boolean;
  statusLabel: string;
  type: 'laptop' | 'mobile';
};

type SecurityTabProps = {
  language: string;
  sessions: SecuritySession[];
  authStatusText: string;
  hasProviderSession: boolean;
  revokeSession: (id: string) => void;
  setShowDeactivateModal: React.Dispatch<React.SetStateAction<boolean>>;
  t: TFunction;
};

type DeactivateModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  t: TFunction;
};

const notificationToggleKeys: Array<{
  key: keyof SettingsUserProfile['notifPrefs'];
  labelKey: string;
  hintKey: string;
  icon: React.ReactNode;
  tone: 'green' | 'blue' | 'violet' | 'amber' | 'red';
}> = [
  { key: 'newRequest', labelKey: 'settings.notificationNewRequest', hintKey: 'settings.notificationNewRequestHint', icon: <ClipboardPlus size={18} />, tone: 'green' },
  { key: 'requestApproved', labelKey: 'settings.notificationRequestApproved', hintKey: 'settings.notificationRequestApprovedHint', icon: <ClipboardCheck size={18} />, tone: 'blue' },
  { key: 'newMessage', labelKey: 'settings.notificationNewMessage', hintKey: 'settings.notificationNewMessageHint', icon: <MessageSquare size={18} />, tone: 'violet' },
  { key: 'caseUpdate', labelKey: 'settings.notificationCaseUpdate', hintKey: 'settings.notificationCaseUpdateHint', icon: <Activity size={18} />, tone: 'amber' },
  { key: 'systemAlert', labelKey: 'settings.notificationSystemAlert', hintKey: 'settings.notificationSystemAlertHint', icon: <Siren size={18} />, tone: 'red' },
];

export function ProfileTab({ userProfile, language, t, onSaveProfile, onCancel, onSaved }: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultSummary = language === 'th'
    ? 'ผู้เชี่ยวชาญด้านสุขภาพที่ได้รับการรับรอง มีประสบการณ์ทางคลินิกอย่างกว้างขวาง'
    : 'Certified healthcare professional with extensive clinical experience';

  const [acceptingPatients, setAcceptingPatients] = useState(() => userProfile.isAcceptingCases);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => userProfile.avatarUrl || null);
  const [form, setForm] = useState(() => ({
    title: userProfile.title || 'Dr.',
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    license: userProfile.license || '',
    specialty: userProfile.specialty || '',
    hospital: userProfile.hospital || '',
    email: userProfile.email || '',
    phoneNumber: userProfile.phoneNumber || '+66',
    summary: userProfile.summary || defaultSummary,
  }));

  useEffect(() => {
    setAcceptingPatients(userProfile.isAcceptingCases);
    setAvatarUrl(userProfile.avatarUrl || null);
    setForm({
      title: userProfile.title || 'Dr.',
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      license: userProfile.license || '',
      specialty: userProfile.specialty || '',
      hospital: userProfile.hospital || '',
      email: userProfile.email || '',
      phoneNumber: userProfile.phoneNumber || '+66',
      summary: userProfile.summary || defaultSummary,
    });
  }, [
    defaultSummary,
    userProfile.avatarUrl,
    userProfile.email,
    userProfile.firstName,
    userProfile.hospital,
    userProfile.isAcceptingCases,
    userProfile.lastName,
    userProfile.license,
    userProfile.phoneNumber,
    userProfile.specialty,
    userProfile.summary,
    userProfile.title,
  ]);

  const userInitials = `${(userProfile.firstName || '').charAt(0)}${(userProfile.lastName || '').charAt(0)}`;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveProfile({
      ...form,
      title: userProfile.title,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      license: userProfile.license || '',
      specialty: form.specialty.trim() || null,
      hospital: userProfile.hospital || null,
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim() || null,
      avatarUrl,
      isAcceptingCases: acceptingPatients,
    });
    onSaved();
  };

  return (
    <div className={styles['settings-panel']}>
      <div className={styles['settings-panel-header']}>
        <h1>{t('settings.profileTitle')}</h1>
      </div>

      <ProfilePhotoCard
        avatarUrl={avatarUrl}
        userInitials={userInitials}
        fileInputRef={fileInputRef}
        handlePhotoUpload={handlePhotoUpload}
        setAvatarUrl={setAvatarUrl}
        t={t}
      />

      <div className={styles['settings-card']}>
        <ProfileIdentityFields form={form} t={t} />
        <ProfileEditableFields form={form} setForm={setForm} t={t} />

        <div className={styles['toggle-row']}>
          <div>
            <p className={styles['toggle-label']}>{t('settings.acceptNewCases')}</p>
            <p className={styles['toggle-hint']}>{t('settings.statusAcceptingCases')}</p>
          </div>
          <button className={acceptingPatients ? `${styles['toggle-switch']} ${styles['on']}` : styles['toggle-switch']} onClick={() => setAcceptingPatients(!acceptingPatients)} role="switch" aria-checked={acceptingPatients}>
            <span className={styles['toggle-knob']} />
          </button>
        </div>
      </div>

      <ProfileActions onCancel={onCancel} onSave={handleSave} t={t} />
    </div>
  );
}

export function NotificationsTab({
  acceptingNotifications,
  telegramChatId,
  notifPrefs,
  setAcceptingNotifications,
  setTelegramChatId,
  setNotifPrefs,
  onSave,
  t,
}: NotificationsTabProps) {
  const telegramNotifications = notifPrefs.telegram !== false;

  return (
    <div className={styles['settings-panel']}>
      <div className={styles['settings-panel-header']}>
        <h1>{t('settings.notificationsTitle')}</h1>
        <p>{t('settings.notificationsSubtitle')}</p>
      </div>
      <div className={styles['settings-card']}>
        <p className={styles['notif-section-title']}>{t('settings.notificationDelivery')}</p>
        <div className={cx(styles, 'notification-channel-row', !acceptingNotifications && 'disabled')}>
          <div className={cx(styles, 'notification-icon-wrap', 'blue')}><Bell size={18} /></div>
          <div className={styles['notification-channel-info']}>
            <p className={styles['toggle-label']}>{t('settings.inAppNotifications')}</p>
            <p className={styles['toggle-hint']}>{t('settings.inAppNotificationsHint')}</p>
          </div>
          <button
            className={cx(styles, 'toggle-switch', acceptingNotifications && 'on')}
            onClick={() => setAcceptingNotifications(!acceptingNotifications)}
            role="switch"
            aria-checked={acceptingNotifications}
            aria-label={t('settings.inAppNotifications')}
          >
            <span className={styles['toggle-knob']} />
          </button>
        </div>

        <div className={cx(styles, 'notification-channel-row', !telegramNotifications && 'disabled')}>
          <div className={cx(styles, 'notification-icon-wrap', 'green')}><Send size={18} /></div>
          <div className={styles['notification-channel-info']}>
            <p className={styles['toggle-label']}>{t('settings.telegramNotifications')}</p>
            <p className={styles['toggle-hint']}>{t('settings.telegramNotificationsHint')}</p>
          </div>
          <button
            className={cx(styles, 'toggle-switch', telegramNotifications && 'on')}
            onClick={() => setNotifPrefs((prev) => ({ ...prev, telegram: !(prev.telegram !== false) }))}
            role="switch"
            aria-checked={telegramNotifications}
            aria-label={t('settings.telegramNotifications')}
          >
            <span className={styles['toggle-knob']} />
          </button>
        </div>

        <div className={cx(styles, 'notification-channel-row', !telegramNotifications && 'disabled')}>
          <div className={cx(styles, 'notification-icon-wrap', 'green')}><Send size={18} /></div>
          <div className={styles['notification-channel-info']}>
            <p className={styles['toggle-label']}>{t('settings.telegramPersonalChat')}</p>
            <p className={styles['toggle-hint']}>{t('settings.telegramChatIdHint')}</p>
            <input
              type="text"
              value={telegramChatId || ''}
              onChange={(e) => setTelegramChatId(e.target.value.trim() || null)}
              disabled={!telegramNotifications}
              placeholder="e.g. 123456789"
              className={styles['telegram-chat-input']}
            />
          </div>
        </div>

        <p className={styles['notif-section-title']}>{t('settings.notificationCases')}</p>
        <div className={styles['notification-pref-list']}>
          {notificationToggleKeys.map(({ key, labelKey, hintKey, icon, tone }) => (
          <div key={key} className={styles['notification-pref-row']}>
            <div className={cx(styles, 'notification-icon-wrap', tone)}>{icon}</div>
            <div className={styles['notification-pref-copy']}>
              <p className={styles['toggle-label']}>{t(labelKey)}</p>
              <p className={styles['toggle-hint']}>{t(hintKey)}</p>
            </div>
            <button
              className={cx(styles, 'toggle-switch', notifPrefs[key] && 'on')}
              onClick={() => setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
              role="switch"
              aria-checked={notifPrefs[key]}
            >
              <span className={styles['toggle-knob']} />
            </button>
          </div>
          ))}
        </div>
      </div>
      <div className={styles['settings-footer']}>
        <button className={styles['btn-primary-lg']} onClick={onSave}><Save size={15} /> {t('settings.save')}</button>
      </div>
    </div>
  );
}

export function SecurityTab({
  language,
  sessions,
  authStatusText,
  hasProviderSession,
  revokeSession,
  setShowDeactivateModal,
  t,
}: SecurityTabProps) {
  return (
    <div className={styles['settings-panel']}>
      <div className={styles['settings-panel-header']}>
        <h1>{t('settings.securityTitle')}</h1>
        <p>{t('settings.securitySubtitle')}</p>
      </div>

      <div className={styles['settings-card']}>
        <p className={styles['notif-section-title']}>{t('settings.securityTab')}</p>

        <div className={styles['security-row']}>
          <div className={`${styles['security-icon-wrap']} ${styles['purple']}`}><ShieldCheck size={20} /></div>
          <div className={styles['security-info']}>
            <p className={styles['security-label']}>{t('settings.providerIdOauth')}</p>
            <p className={styles['security-hint']}>{authStatusText}</p>
          </div>
          <span className={`${styles['security-status']} ${hasProviderSession ? styles['connected'] : ''}`}>{hasProviderSession ? t('settings.connected') : t('settings.notConnected')}</span>
        </div>

        <p className={`${styles['notif-section-title']} ${styles['mt-6']}`}>{t('settings.activeSessions')}</p>
        <p className={`${styles['security-hint']} ${styles['mb-4']}`}>{t('settings.activeSessionsHint')}</p>

        <div className={styles['sessions-list']}>
          {sessions.length > 0 ? sessions.map((session) => (
            <div key={session.id} className={styles['session-row']}>
              <div className={`${styles['session-device-icon']} ${styles[session.type]}`}>
                {session.type === 'laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
              </div>
              <div className={styles['session-info']}>
                <p className={styles['session-name']}>
                  {session.device}
                  <span className={`${styles['session-presence']} ${session.isOnline ? styles['online'] : styles['idle']}`}>
                    {session.statusLabel}
                  </span>
                </p>
                <p className={styles['session-meta']}><Globe size={12} />{session.location} · {session.time}</p>
              </div>
              {session.isCurrent && <span className={styles['session-current']}>{t('settings.currentSession')}</span>}
              {!session.isCurrent && <button className={styles['revoke-btn']} onClick={() => revokeSession(session.id)}>{t('settings.logout')}</button>}
            </div>
          )) : (
            <div className={styles['session-empty']}>
              {t('settings.noProviderSession')}
            </div>
          )}
        </div>

        {(() => {
          // @ts-ignore
          const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
          const isInTelegram = tg && tg.platform !== 'unknown';
          if (!isInTelegram) return null;

          return (
            <>
              <p className={`${styles['notif-section-title']} ${styles['mt-8']}`}>{t('settings.externalAccess')}</p>
              <div className={cx(styles, 'security-row', 'browser-redirect')}>
                <div className={`${styles['security-icon-wrap']} ${styles['blue']}`}><Globe size={20} /></div>
                <div className={styles['security-info']}>
                  <p className={styles['security-label']}>{t('settings.openExternalBrowser')}</p>
                  <p className={styles['security-hint']}>{t('settings.openExternalBrowserHint')}</p>
                </div>
                <button className={styles['btn-outline-sm']} onClick={() => { tg.openLink(window.location.origin, { try_browser: true }); }}>
                  {t('settings.openBrowser')}
                </button>
              </div>
            </>
          );
        })()}

        <p className={`${styles['notif-section-title']} ${styles['danger']} ${styles['mt-6']}`}>{t('settings.deactivateAccount')}</p>
        <div className={styles['danger-row']}>
          <div>
            <p className={styles['security-label']}>{t('settings.deactivateAccount')}</p>
            <p className={styles['security-hint']}>{t('settings.deactivateAccountHint')}</p>
          </div>
          <button className={styles['btn-danger-outline']} onClick={() => setShowDeactivateModal(true)}>
            {t('settings.deactivateAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeactivateModal({ onCancel, onConfirm, t }: DeactivateModalProps) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={`${styles['modal-icon-wrap']} ${styles['danger']}`}>
          <ShieldCheck size={32} />
        </div>
        <h2>{t('settings.deactivateQuestion')}</h2>
        <p>{t('settings.deactivateDescription')}</p>
        <div className={styles['modal-actions']}>
          <button className={styles['btn-outline-lg']} onClick={onCancel}>
            {t('settings.cancel')}
          </button>
          <button className={styles['btn-danger-lg']} onClick={onConfirm}>
            {t('settings.confirmDeactivate')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsSidebar({
  activeTab,
  setActiveTab,
  navItems,
  userProfile,
}: {
  activeTab: SettingsTab;
  setActiveTab: React.Dispatch<React.SetStateAction<SettingsTab>>;
  navItems: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }>;
  userProfile: SettingsUserProfile;
}) {
  const userInitials = `${(userProfile.firstName || '').charAt(0)}${(userProfile.lastName || '').charAt(0)}`;

  return (
    <aside className={styles['settings-sidebar']}>
      <nav className={styles['settings-nav']}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cx(styles, 'settings-nav-item', activeTab === item.id && 'active')}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles['settings-user-card']}>
        <SettingsSidebarAvatar avatarUrl={userProfile.avatarUrl} userInitials={userInitials} />
        <div>
          <p className={styles['settings-user-name']}>{userProfile.title} {userProfile.firstName} {userProfile.lastName}</p>
          <p className={styles['settings-user-email']}>{userProfile.email}</p>
        </div>
      </div>
    </aside>
  );
}

export function SaveToast({ t }: { t: TFunction }) {
  return (
    <div className={styles['settings-toast']}>
      <CheckCircle2 size={18} />
      {t('settings.profileUpdated')}
    </div>
  );
}

export const settingsNavIconMap = {
  profile: <User size={18} />,
  notifications: <Bell size={18} />,
  security: <ShieldCheck size={18} />,
} satisfies Record<SettingsTab, React.ReactNode>;
