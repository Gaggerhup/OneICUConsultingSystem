'use client';
import {
  Check,
  LayoutDashboard,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Layout from '@/components/Layout';
import styles from './style.module.css';

function RequestSubmittedContent() {
  const router = useRouter();
  const navigate = router.push;
  const searchParams = useSearchParams();

  const caseId = searchParams.get('caseId') || 'Pending';
  const referenceId = `REQ-${caseId}`;

  return (
    <Layout>
      <div className={styles['submitted-container']}>
        <div className={styles['success-card']}>
          <div className={styles['success-icon-wrapper']}>
            <Check size={48} strokeWidth={3} />
          </div>

          <h1>Consultation Submitted!</h1>

          <p>
            คำขอรับการปรึกษาของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว โดยข้อมูลทั้งหมดจะถูกจัดเก็บและส่งต่อภายใต้มารตฐานความปลอดภัยระดับสูงสุด (HIPAA Compliant)
          </p>

          <div className={styles['ref-box']}>
            <span className={styles['ref-label']}>Reference ID</span>
            <span className={styles['ref-value']}>{referenceId}</span>
          </div>

          <div className={`${styles['success-actions']} ${styles['centered-actions']}`}>
            <button className={styles['btn-dashboard']} onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </button>
          </div>
        </div>

        <div className={styles['secure-footer']}>
          <ShieldCheck size={16} />
          <span>Encrypted Submission • Real-time Routing Active</span>
        </div>
      </div>
    </Layout>
  );
}

export default function RequestSubmitted() {
  return (
    <Suspense fallback={
      <Layout>
        <div className={styles['submitted-container']}>
          <div className={styles['loading-card']}>
            <Loader2 className={styles['spinner']} size={48} color="#16a34a" />
            <h1>Loading...</h1>
          </div>
        </div>
      </Layout>
    }>
      <RequestSubmittedContent />
    </Suspense>
  );
}
