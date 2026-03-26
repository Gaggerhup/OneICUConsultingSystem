'use client';
// src/pages/RequestSubmitted/index.tsx
import { 
  Check, 
  LayoutDashboard,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import './style.css';

function RequestSubmitted() {
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

          <div className="success-actions">
            <button className="btn-track" onClick={() => navigate('/consultation-status')}>
              <ClipboardList size={20} /> Track Status
            </button>
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

export default RequestSubmitted;

