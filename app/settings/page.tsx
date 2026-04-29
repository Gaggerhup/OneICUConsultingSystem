'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { authService } from '@/services/auth';
import {
  DeactivateModal,
  NotificationsTab,
  ProfileTab,
  SaveToast,
  SecurityTab,
  SettingsSidebar,
  settingsNavIconMap,
  type SettingsTab,
} from './settings-sections';
import styles from './style.module.css';

function Settings() {
  const router = useRouter();
  const { userProfile, updateUserProfile, showToast } = useApp();
  const { t, language } = useLocale();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome บน macOS', location: 'พิษณุโลก, ประเทศไทย', time: 'วันนี้ 07:30 น.', isCurrent: true, type: 'laptop' as const },
    { id: '2', device: 'Safari บน iPhone', location: 'พิษณุโลก, ประเทศไทย', time: 'เมื่อวาน 18:12 น.', isCurrent: false, type: 'mobile' as const },
    { id: '3', device: 'Firefox บน Windows', location: 'กรุงเทพฯ, ประเทศไทย', time: '15 ต.ค. 2023 10:45 น.', isCurrent: false, type: 'laptop' as const },
  ]);
  const [notifPrefs, setNotifPrefs] = useState(() => userProfile.notifPrefs);
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

  const revokeSession = (id: string) => {
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
    showToast(language === 'th' ? 'ปิดใช้งานบัญชีเรียบร้อยแล้ว' : 'Account deactivated successfully', 'info');
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
