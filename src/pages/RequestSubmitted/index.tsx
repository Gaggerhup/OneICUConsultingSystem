// src/pages/RequestSubmitted/index.tsx
import { 
  Check, 
  LayoutDashboard,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import './style.css';

function RequestSubmitted() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the Case ID passed from the NewRequest page
  const caseId = location.state?.caseId || 'Pending';
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

