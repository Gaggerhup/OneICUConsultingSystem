'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { authenticateWithCode } from '@/actions/authActions';
import { Loader2, AlertCircle } from 'lucide-react';
import styles from './style.module.css';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigate = router.push;
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const completeAuth = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError('Authorization code missing');
        return;
      }

      try {
        setStatus('Exchanging token and verifying identity securely...');
        const callbackUrl = authService.getCallbackUrl();
        const result = await authenticateWithCode(code, callbackUrl);

        if (!result.success || !result.profile) {
          throw new Error(result.error || 'Identity verification failed');
        }

        authService.saveSession(result.profile);
        authService.initializeProfile(result.profile);

        setStatus('Success! Redirecting...');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    completeAuth();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className={styles['callback-container']}>
        <div className={styles['error-card']}>
          <AlertCircle size={48} color="#ef4444" />
          <h1>Authentication Failed</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className={styles['retry-btn']}>
            Return to Login
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
        <p>Please wait while we secure your connection</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className={styles['callback-container']}>
        <div className={styles['loading-card']}>
          <Loader2 className={styles['spinner']} size={48} color="#16a34a" />
          <h1>Initializing...</h1>
          <p>Please wait while we secure your connection</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
