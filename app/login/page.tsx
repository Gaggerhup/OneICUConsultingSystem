'use client';
import styles from './style.module.css';
import { authService } from '@/services/auth';
import { Globe, ChevronRight } from 'lucide-react';
import Image from 'next/image';

function Login() {
  const handleProviderLogin = () => {
    authService.redirectToLogin();
  };

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
          ระบบปรึกษาแพทย์พิษณุโลก
        </div>
      </header>

      <main className={styles['main-content']}>
        <div className={styles['login-card']}>
          <div className={styles['card-header-img']}>
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop"
              alt="ภาพรวมแดชบอร์ดทางการแพทย์"
              fill
              sizes="(max-width: 640px) 100vw, 460px"
              priority
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
            <h1 className={styles['title']}>เข้าสู่ระบบ</h1>
            <p className={styles['subtitle']}>เข้าสู่พอร์ทัลผู้ให้บริการด้านสุขภาพที่ปลอดภัย</p>

            <div className={styles['login-options']}>
              <button className={styles['provider-id-btn']} type="button" onClick={handleProviderLogin}>
                <Image
                  src="/provider-id-logo.png"
                  alt="Provider ID"
                  width={120}
                  height={28}
                  className={styles['provider-logo-img']}
                />
                <span>เข้าสู่ระบบด้วย Provider ID</span>
              </button>

              <button
                className={styles['dev-access-btn']}
                type="button"
                onClick={() => authService.setupMockSession()}
              >
                เข้าสู่ระบบสำหรับทดสอบ
              </button>

              {(() => {
                // @ts-ignore
                const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
                const isInTelegram = tg && tg.platform !== 'unknown';

                if (!isInTelegram) return null;

                return (
                  <button
                    className={styles['external-browser-btn']}
                    type="button"
                    onClick={() => {
                      tg.openLink(window.location.origin, { try_browser: true });
                    }}
                  >
                    <div className={styles['ext-icon-wrap']}>
                      <Globe size={18} />
                    </div>
                    <div className={styles['ext-text']}>
                      <span className={styles['ext-label']}>เปิดในเบราว์เซอร์ภายนอก</span>
                      <span className={styles['ext-hint']}>Chrome, Safari หรือ Desktop</span>
                    </div>
                    <ChevronRight size={16} className={styles['ext-chevron']} />
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </main>

      <footer className={styles['page-footer']}>
        <div>© 2026 สำนักงานสาธารณสุขจังหวัดพิษณุโลก สงวนลิขสิทธิ์</div>
      </footer>
    </div>
  );
}

export default Login;
