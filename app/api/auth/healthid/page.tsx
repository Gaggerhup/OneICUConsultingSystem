'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { authenticateWithCode } from '@/actions/authActions';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import styles from './style.module.css';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const hasStartedAuth = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(t('authCallback.authenticating'));

  useEffect(() => {
    if (hasStartedAuth.current) {
      return;
    }
    hasStartedAuth.current = true;

    const completeAuth = async () => {
      const code = searchParams.get('code');

      if (!code) {
        authService.clearSession();
        setError(t('authCallback.missingCode'));
        return;
      }

      try {
        setStatus(t('authCallback.exchange'));
        const callbackUrl = authService.getCallbackUrl();
        const result = await authenticateWithCode(code, callbackUrl);

        if (!result.success || !result.profile) {
          throw new Error(result.error || 'Identity verification failed');
        }

        authService.saveSession(result.profile);
        await authService.registerServerSession(result.profile);
        authService.initializeProfile(result.profile);

        setStatus(t('authCallback.success'));

        setTimeout(() => {
          // Use a full navigation so AppProvider rehydrates from the freshly
          // saved Provider ID session instead of carrying callback-page state.
          window.location.href = '/dashboard';
        }, 1000);
      } catch (err: any) {
        console.error('Auth error:', err);
        authService.clearSession();
        setError(err.message || t('authCallback.failed'));
      }
    };

    completeAuth();
  }, [searchParams, t]);

  if (error) {
    return (
      <div className={styles['callback-container']}>
        <div className={styles['error-card']}>
          <AlertCircle size={48} color="#ef4444" />
          <h1>{t('authCallback.authFailedTitle')}</h1>
          <p>{error}</p>
          <button onClick={() => { window.location.href = '/login'; }} className={styles['retry-btn']}>
            {t('authCallback.returnToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['callback-container']}>
      <div className={styles['loading-card']}>
        <Loader2 className={styles['spinner']} size={48} color="#16a34a" />
        <h1>{status}</h1>
        <p>{t('authCallback.pleaseWait')}</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  const { t } = useLocale();
  return (
    <div className={styles['callback-container']}>
      <div className={styles['loading-card']}>
        <Loader2 className={styles['spinner']} size={48} color="#16a34a" />
        <h1>{t('authCallback.initializing')}</h1>
        <p>{t('authCallback.pleaseWait')}</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
