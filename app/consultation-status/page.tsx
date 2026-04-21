'use client';
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
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import styles from './style.module.css';

interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  role: 'Lead' | 'Consultant';
  avatar: string;
  status: 'Reviewing' | 'Replied' | 'Invited';
}

function ConsultationStatus() {
  const router = useRouter();
  const navigate = router.push;
  const { selectedCase } = useApp();
  const [activeTab, setActiveTab] = useState('Vitals & Labs');
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');
  
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
      <span className={styles[`badge-${priority.toLowerCase()}`]}>
        {priority === 'IMMEDIATE' && '! '}
        {labelMapping[priority] || priority}
      </span>
    );
  };

  return (
    <Layout>
      <div className={styles['case-overview-wrapper']}>
        
        {/* Breadcrumb / Back Navigation */}
        <nav className={styles['breadcrumb-nav']}>
          <a href="#" className={styles['back-link']} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Previous
          </a>
          <span className={styles['case-number']}>Case #{selectedCase?.id || 'CD-88219'}</span>
        </nav>

        {/* Top Patient Header Card */}
        <div className={styles['case-patient-header']}>
          <div className={styles['patient-identity']}>
            <div className={styles['patient-circle-jd']}>{patientInitials}</div>
            <div className={styles['patient-text-block']}>
              <h1>
                {selectedCase?.patientName || 'Sarah Jenkins'}
                {selectedCase && getUrgencyBadge(selectedCase.priority)}
                {!selectedCase && <span className={styles['badge-urgent']}>! Urgent</span>}
              </h1>
              <div className={styles['patient-meta-row']}>
                {selectedCase?.age || 34} years old • {selectedCase?.gender || 'Female'} • +1 (555) 012-3456
              </div>
              <div className={styles['patient-id-list']}>
                HN: 5822-01 • AN: 2024-991 • REQ: {selectedCase?.id || 'CD-88219'}
              </div>
            </div>
          </div>

          <div className={styles['header-action-buttons']}>
            <button className={cx('btn-header', 'btn-send-msg')}>
              <MessageSquare size={18} /> Send Message
            </button>
            <button className={cx('btn-header', 'btn-outline-purple')}>
              <Upload size={18} /> Upload Imaging
            </button>
            <button className={cx('btn-header', 'btn-outline-purple')}>
              <Edit3 size={18} /> Update Diagnosis
            </button>
            <button className={cx('btn-header', 'btn-close-case')}>
              <CheckCircle size={18} /> Close Case
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className={styles['case-details-grid']}>
          
          {/* Left Sidebar: Medical History */}
          <aside className={styles['medical-history-sidebar']}>
            <div className={styles['sidebar-section-header']}>
              <Activity size={18} color="#4318FF" />
              <span>MEDICAL HISTORY</span>
            </div>

            <div className={styles['medical-data-group']}>
              <label>Pre-existing Conditions</label>
              <p>Type 2 Diabetes, Mild Hypertension</p>
            </div>

            <div className={styles['medical-data-group']}>
              <label>Allergies</label>
              <p>Penicillin, Latex</p>
            </div>

            <div className={styles['medical-data-group']}>
              <label>Current Symptoms</label>
              <p>
                {selectedCase?.reason || 'Persistent sharp abdominal pain (lower right quadrant), low-grade fever (100.4°F), nausea for 24 hours.'}
              </p>
            </div>

            <div className={styles['initial-diagnosis-box']}>
              <label>INITIAL DIAGNOSIS</label>
              <h4>Acute Appendicitis (Suspected)</h4>
            </div>

            {/* Consultation Team Section (Integrated from previous requirement) */}
            <div className={cx('sidebar-section-header', 'team-section-header')}>
              <UserPlus size={18} color="#4318FF" />
              <span>CONSULTATION TEAM</span>
            </div>
            
            <div className={styles['team-grid']}>
              {teamMembers.map((member) => (
                <div key={member.id} className={styles['team-member-card']}>
                  <img src={member.avatar} className={styles['team-member-avatar']} alt="" />
                  <div className={styles['team-member-meta']}>
                    <div className={styles['team-member-name']}>{member.name}</div>
                    <div className={styles['team-member-specialty']}>{member.specialty}</div>
                  </div>
                </div>
              ))}
              <button
                className={styles['invite-consultant-btn']}
                onClick={addConsultant}
              >
                <Plus size={14} /> Invite Consultant
              </button>
            </div>
          </aside>

          {/* Right Main Content area with Tabs */}
          <main className={styles['main-clinical-area']}>
            <nav className={styles['tabs-nav']}>
              {['Vitals & Labs', 'Consultation Notes', 'Medications', 'Labs', 'Imaging'].map((tab) => (
                <button 
                  key={tab}
                  className={cx('tab-btn', activeTab === tab && 'active')}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {tab === 'Imaging' && <span className={styles['imaging-count']}>(3)</span>}
                </button>
              ))}
            </nav>

            <div className={styles['tab-content-pane']}>
              {activeTab === 'Vitals & Labs' && (
                <>
                  <div className={styles['vitals-header']}>CURRENT VITALS</div>
                  <div className={styles['vitals-grid-row']}>
                    <div className={styles['vital-card-mini']}>
                      <label>BP (MMHG)</label>
                      <span className={styles['vital-value']}>118/76</span>
                    </div>
                    <div className={styles['vital-card-mini']}>
                      <label>HEART RATE</label>
                      <span className={styles['vital-value']}>78</span>
                      <span className={styles['vital-unit']}>bpm</span>
                    </div>
                    <div className={styles['vital-card-mini']}>
                      <label>TEMP (°F)</label>
                      <span className={styles['vital-value']}>100.4</span>
                    </div>
                    <div className={styles['vital-card-mini']}>
                      <label>RESPIRATION</label>
                      <span className={styles['vital-value']}>18</span>
                      <span className={styles['vital-unit']}>/min</span>
                    </div>
                  </div>

                  <div className={styles['labs-section-header']}>RECENT LAB RESULTS</div>
                  <table className={styles['modern-labs-table']}>
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Result</th>
                        <th>Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={styles['col-test']}>WBC Count</td>
                        <td className={styles['col-result']}>14.2</td>
                        <td className={styles['col-ref']}>4.5-11.0</td>
                      </tr>
                      <tr>
                        <td className={styles['col-test']}>Hemoglobin</td>
                        <td className={styles['col-result']}>13.8</td>
                        <td className={styles['col-ref']}>13.5-17.5</td>
                      </tr>
                      <tr>
                        <td className={styles['col-test']}>Glucose (F)</td>
                        <td className={styles['col-result']}>105</td>
                        <td className={styles['col-ref']}>70-100</td>
                      </tr>
                      <tr>
                        <td className={styles['col-test']}>Creatinine</td>
                        <td className={styles['col-result']}>0.9</td>
                        <td className={styles['col-ref']}>0.7-1.3</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
              
              {activeTab !== 'Vitals & Labs' && (
                <div className={styles['placeholder-pane']}>
                  <Activity size={48} strokeWidth={1} className={styles['placeholder-icon']} />
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
