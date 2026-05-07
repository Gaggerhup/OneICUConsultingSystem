'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/context/LocaleContext';
import { authService } from '@/services/auth';
import styles from './style.module.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop';

function Login() {
  const { language, t } = useLocale();

  useEffect(() => {
    authService.clearSession();
  }, []);

  return (
    <div className={styles['app-container']}>
      <header className={styles['header']}>
        <div className={styles['logo-container']}>
          <div className={styles['logo-icon']}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="4" width="6" height="16" rx="2" fill="currentColor" fillOpacity="0.9"/>
              <rect x="4" y="9" width="16" height="6" rx="2" fill="currentColor" fillOpacity="0.9"/>
              <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          {t('common.appName')}
        </div>
        <div className={styles['language-wrap']}>
          <LanguageSwitcher />
        </div>
      </header>

      <main className={styles['main-content']}>
        <div className={styles['login-card']}>
          <div className={styles['card-header-img']}>
            <Image
              src={HERO_IMAGE}
              alt={language === 'th' ? 'ภาพรวมแดชบอร์ดทางการแพทย์' : 'Medical dashboard overview'}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 460px"
              className={styles['card-header-image']}
            />
            <div className={styles['card-header-icon']}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
          </div>
          <div className={styles['card-body']}>
            <h1 className={styles['title']}>{t('login.title')}</h1>
            <p className={styles['subtitle']}>{t('login.subtitle')}</p>

            <div className={styles['login-options']}>
              <a className={styles['provider-id-btn']} href="/api/auth/provider-login">
                <Image
                  src="/provider-id-logo.png"
                  alt="Provider ID"
                  width={120}
                  height={28}
                  className={styles['provider-logo-img']}
                />
                <span>{t('login.providerLogin')}</span>
              </a>
              <button
                type="button"
                className={styles['test-login-btn']}
                onClick={() => authService.setupTestSession()}
              >
                <span>{t('login.testLogin')}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles['page-footer']}>
        <div>{t('login.footer')}</div>
      </footer>
    </div>
  );
}

export default Login;
