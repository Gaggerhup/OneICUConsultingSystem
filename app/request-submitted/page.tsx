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
import './style.css';

function RequestSubmittedContent() {
  const router = useRouter();
  const navigate = router.push;
  const searchParams = useSearchParams();
  
  // Get the Case ID passed via query param from NewRequest page
  const caseId = searchParams.get('caseId') || 'Pending';
  const referenceId = `REQ-${caseId.padStart(6, '0')}`;

  return (
    <Layout>
      <div className="submitted-container">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <Check size={48} strokeWidth={3} />
          </div>

          <h1>Consultation Submitted!</h1>
          
          <p>
            คำขอรับการปรึกษาของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว โดยข้อมูลทั้งหมดจะถูกจัดเก็บและส่งต่อภายใต้มารตฐานความปลอดภัยระดับสูงสุด (HIPAA Compliant)
          </p>

          <div className="ref-box">
            <span className="ref-label">Reference ID</span>
            <span className="ref-value">{referenceId}</span>
          </div>

          <div className="success-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </button>
          </div>
        </div>

        <div className="secure-footer">
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
        <div className="submitted-container">
          <div className="loading-card">
            <Loader2 className="spinner" size={48} color="#16a34a" />
            <h1>Loading...</h1>
          </div>
        </div>
      </Layout>
    }>
      <RequestSubmittedContent />
    </Suspense>
  );
}
