import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * TelegramAuth Component
 * 
 * This component acts as a bridge between the Telegram Web App environment and the React application.
 * It mounts silently and intercepts the `initDataUnsafe` payload provided by Telegram when the app
 * is opened via an Inline Web App Button.
 */
const TelegramAuth: React.FC = () => {
  const { updateUserProfile, showToast } = useApp();

  useEffect(() => {
    // Check if the app is running inside a Telegram Webview
    // @ts-ignore - Telegram is injected globally by the script in index.html
    const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;

    if (tg) {
      // 1. Tell Telegram the app is ready to be displayed
      tg.ready();

      // 2. Expand the Webview to take up the full screen height (better UX for complex apps)
      tg.expand();

      // 3. Authenticate the user securely using the Telegram payload
      const telegramUser = tg.initDataUnsafe?.user;

      if (telegramUser) {
        console.log('[Telegram Auth] Secure Web App Payload received:', telegramUser);
        
        // In a real production app, you would send this telegramUser.id to your backend 
        // to verify against a database of registered clinicians.
        
        // For this demo, we auto-authenticate them and update their profile
        updateUserProfile({
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          specialty: 'Verified via Telegram',
          // Optionally use their Telegram avatar
          // avatarUrl: telegramUser.photo_url || null, 
        });

        // Show a welcome toast to confirm the seamless login
        showToast(`Welcome back, Dr. ${telegramUser.first_name}! Authenticated via Telegram.`, 'success');
      }
    }
  }, []);

  // This component doesn't render any visible UI
  return null;
};

export default TelegramAuth;
