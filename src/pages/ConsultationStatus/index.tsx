import { useState } from 'react';
import { 
  ArrowLeft,
  MessageSquare,
  Upload,
  Edit3,
  CheckCircle,
  Plus,
  Activity,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import './style.css';

interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  role: 'Lead' | 'Consultant';
  avatar: string;
  status: 'Reviewing' | 'Replied' | 'Invited';
}

function ConsultationStatus() {
  const navigate = useNavigate();
  const { selectedCase } = useApp();
  const [activeTab, setActiveTab] = useState('Vitals & Labs');
  
  // State for the consultation team (retained from previous design)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Dr. Aris Vance, MD',
      specialty: 'Interventional Cardiology',
      role: 'Lead',
      avatar: 'https://ui-avatars.com/api/?name=Aris+Vance&background=4318FF&color=fff',
      status: 'Reviewing'
    },
    {
      id: '2',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Internal Medicine',
      role: 'Consultant',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=14b8a6&color=fff',
      status: 'Replied'
    }
  ]);

  const addConsultant = () => {
    const newConsultant: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Dr. Michael Chen',
      specialty: 'Radiology',
      role: 'Consultant',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=f43f5e&color=fff',
      status: 'Invited'
    };
    setTeamMembers([...teamMembers, newConsultant]);
  };

  const patientInitials = selectedCase 
    ? selectedCase.patientName.split(' ').map(n => n[0]).join('') 
    : 'JD';

  const getUrgencyBadge = (priority?: string) => {
    if (!priority) return null;
    const labelMapping: Record<string, string> = {
      'IMMEDIATE': '1. Immediate',
      'EMERGENCY': '2. Emergency',
      'URGENT': '3. Urgent',
      'SEMI-URGENT': '4. Semi-urgent',
      'NON-URGENT': '5. Non-urgent'
    };
    return (
      <span className={`badge-${priority.toLowerCase()}`}>
        {priority === 'IMMEDIATE' && '! '}
        {labelMapping[priority] || priority}
      </span>
    );
  };

  return (
    <Layout>
      <div className="case-overview-wrapper">
        
        {/* Breadcrumb / Back Navigation */}
        <nav className="breadcrumb-nav">
          <a href="#" className="back-link" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Previous
          </a>
          <span className="case-number">Case #{selectedCase?.id || 'CD-88219'}</span>
        </nav>

        {/* Top Patient Header Card */}
        <div className="case-patient-header">
          <div className="patient-identity">
            <div className="patient-circle-jd">{patientInitials}</div>
            <div className="patient-text-block">
              <h1>
                {selectedCase?.patientName || 'Sarah Jenkins'}
                {selectedCase && getUrgencyBadge(selectedCase.priority)}
                {!selectedCase && <span className="badge-urgent">! Urgent</span>}
              </h1>
              <div className="patient-meta-row">
                {selectedCase?.age || 34} years old • {selectedCase?.gender || 'Female'} • +1 (555) 012-3456
              </div>
              <div className="patient-id-list">
                HN: 5822-01 • AN: 2024-991 • REQ: {selectedCase?.id || 'CD-88219'}
              </div>
            </div>
          </div>

          <div className="header-action-buttons">
            <button className="btn-header btn-send-msg">
              <MessageSquare size={18} /> Send Message
            </button>
            <button className="btn-header btn-outline-purple">
              <Upload size={18} /> Upload Imaging
            </button>
            <button className="btn-header btn-outline-purple">
              <Edit3 size={18} /> Update Diagnosis
            </button>
            <button className="btn-header btn-close-case">
              <CheckCircle size={18} /> Close Case
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="case-details-grid">
          
          {/* Left Sidebar: Medical History */}
          <aside className="medical-history-sidebar">
            <div className="sidebar-section-header">
              <Activity size={18} color="#4318FF" />
              <span>MEDICAL HISTORY</span>
            </div>

            <div className="medical-data-group">
              <label>Pre-existing Conditions</label>
              <p>Type 2 Diabetes, Mild Hypertension</p>
            </div>

            <div className="medical-data-group">
              <label>Allergies</label>
              <p>Penicillin, Latex</p>
            </div>

            <div className="medical-data-group">
              <label>Current Symptoms</label>
              <p>
                {selectedCase?.reason || 'Persistent sharp abdominal pain (lower right quadrant), low-grade fever (100.4°F), nausea for 24 hours.'}
              </p>
            </div>

            <div className="initial-diagnosis-box">
              <label>INITIAL DIAGNOSIS</label>
              <h4>Acute Appendicitis (Suspected)</h4>
            </div>

            {/* Consultation Team Section (Integrated from previous requirement) */}
            <div className="sidebar-section-header" style={{ marginTop: '3rem' }}>
              <UserPlus size={18} color="#4318FF" />
              <span>CONSULTATION TEAM</span>
            </div>
            
            <div className="team-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {teamMembers.map((member) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: '#f8fafc' }}>
                  <img src={member.avatar} style={{ width: '32px', height: '32px', borderRadius: '8px' }} alt="" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b' }}>{member.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{member.specialty}</div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addConsultant}
                style={{ width: '100%', padding: '0.75rem', border: '1px dashed #e2e8f0', borderRadius: '12px', background: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus size={14} /> Invite Consultant
              </button>
            </div>
          </aside>

          {/* Right Main Content area with Tabs */}
          <main className="main-clinical-area">
            <nav className="tabs-nav">
              {['Vitals & Labs', 'Consultation Notes', 'Medications', 'Labs', 'Imaging'].map((tab) => (
                <button 
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {tab === 'Imaging' && <span className="imaging-count">(3)</span>}
                </button>
              ))}
            </nav>

            <div className="tab-content-pane">
              {activeTab === 'Vitals & Labs' && (
                <>
                  <div className="vitals-header">CURRENT VITALS</div>
                  <div className="vitals-grid-row">
                    <div className="vital-card-mini">
                      <label>BP (MMHG)</label>
                      <span className="vital-value">118/76</span>
                    </div>
                    <div className="vital-card-mini">
                      <label>HEART RATE</label>
                      <span className="vital-value">78</span>
                      <span className="vital-unit">bpm</span>
                    </div>
                    <div className="vital-card-mini">
                      <label>TEMP (°F)</label>
                      <span className="vital-value">100.4</span>
                    </div>
                    <div className="vital-card-mini">
                      <label>RESPIRATION</label>
                      <span className="vital-value">18</span>
                      <span className="vital-unit">/min</span>
                    </div>
                  </div>

                  <div className="labs-section-header">RECENT LAB RESULTS</div>
                  <table className="modern-labs-table">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Result</th>
                        <th>Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="col-test">WBC Count</td>
                        <td className="col-result">14.2</td>
                        <td className="col-ref">4.5-11.0</td>
                      </tr>
                      <tr>
                        <td className="col-test">Hemoglobin</td>
                        <td className="col-result">13.8</td>
                        <td className="col-ref">13.5-17.5</td>
                      </tr>
                      <tr>
                        <td className="col-test">Glucose (F)</td>
                        <td className="col-result">105</td>
                        <td className="col-ref">70-100</td>
                      </tr>
                      <tr>
                        <td className="col-test">Creatinine</td>
                        <td className="col-result">0.9</td>
                        <td className="col-ref">0.7-1.3</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
              
              {activeTab !== 'Vitals & Labs' && (
                <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                  <Activity size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Clinical data for <strong>{activeTab}</strong> is being compiled...</p>
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </Layout>
  );
}

export default ConsultationStatus;
