'use client';
import {
  Check,
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Layout from '@/components/Layout';
import { useLocale } from '@/context/LocaleContext';
import styles from './style.module.css';

function RequestSubmittedContent() {
  const router = useRouter();
  const navigate = router.push;
  const searchParams = useSearchParams();
  const { t, language } = useLocale();

  const caseId = searchParams.get('caseId') || 'Pending';
  const referenceId = `REQ-${caseId}`;

  return (
    <Layout>
      <div className={styles['submitted-container']}>
        <div className={styles['success-card']}>
          <div className={styles['success-icon-wrapper']}>
            <Check size={48} strokeWidth={3} />
          </div>

          <h1>{t('requestSubmitted.title')}</h1>

          <p>
            {t('requestSubmitted.body')}
          </p>

          <div className={styles['ref-box']}>
            <span className={styles['ref-label']}>{t('requestSubmitted.referenceId')}</span>
            <span className={styles['ref-value']}>{referenceId}</span>
          </div>

          <div className={`${styles['success-actions']} ${styles['centered-actions']}`}>
            <button className={styles['btn-dashboard']} onClick={() => navigate('/requests')}>
              <ClipboardList size={20} /> {t('nav.requests')}
            </button>
            <button className={styles['btn-dashboard']} onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={20} /> {t('requestSubmitted.dashboard')}
            </button>
          </div>
        </div>

        <div className={styles['secure-footer']}>
          <ShieldCheck size={16} />
          <span>{t('requestSubmitted.footer')}</span>
        </div>
      </div>
    </Layout>
  );
}

export default function RequestSubmitted() {
  const { t } = useLocale();

  return (
    <Suspense fallback={
      <Layout>
        <div className={styles['submitted-container']}>
          <div className={styles['loading-card']}>
            <Loader2 className={styles['spinner']} size={48} color="#16a34a" />
            <h1>{t('requestSubmitted.loading')}</h1>
          </div>
        </div>
      </Layout>
    }>
      <RequestSubmittedContent />
    </Suspense>
  );
}
