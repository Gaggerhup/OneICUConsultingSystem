'use client';

import Image from 'next/image';
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Edit3,
  MessageSquare,
  Plus,
  Upload,
  UserPlus,
} from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './style.module.css';

type TFunction = (key: string, vars?: Record<string, string>) => string;

export interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  role: 'Lead' | 'Consultant';
  avatar: string;
  status: 'Reviewing' | 'Replied' | 'Invited';
}

type TabOption = {
  id: 'vitals' | 'notes' | 'medications' | 'labs' | 'imaging';
  label: string;
};

export function ConsultationStatusHeader({
  caseId,
  patientName,
  patientInitials,
  patientAge,
  patientGender,
  reason,
  urgencyBadge,
  onBack,
  t,
}: {
  caseId: string | number | undefined;
  patientName: string;
  patientInitials: string;
  patientAge: number | string;
  patientGender: string;
  reason: string;
  urgencyBadge: React.ReactNode;
  onBack: () => void;
  t: TFunction;
}) {
  return (
    <>
      <nav className={styles['breadcrumb-nav']}>
        <a href="#" className={styles['back-link']} onClick={onBack}>
          <ArrowLeft size={16} /> {t('consultationStatus.backToPrevious')}
        </a>
        <span className={styles['case-number']}>Case #{caseId || 'CD-88219'}</span>
      </nav>

      <div className={styles['case-patient-header']}>
        <div className={styles['patient-identity']}>
          <div className={styles['patient-circle-jd']}>{patientInitials}</div>
          <div className={styles['patient-text-block']}>
            <h1>
              {patientName}
              {urgencyBadge}
            </h1>
            <div className={styles['patient-meta-row']}>
              {patientAge} years old • {patientGender} • +1 (555) 012-3456
            </div>
            <div className={styles['patient-id-list']}>
              HN: 5822-01 • AN: 2024-991 • REQ: {caseId || 'CD-88219'}
            </div>
          </div>
        </div>

        <div className={styles['header-action-buttons']}>
          <button className={cx(styles, 'btn-header', 'btn-send-msg')}>
            <MessageSquare size={18} /> {t('consultationStatus.sendMessage')}
          </button>
          <button className={cx(styles, 'btn-header', 'btn-outline-purple')}>
            <Upload size={18} /> {t('consultationStatus.uploadImaging')}
          </button>
          <button className={cx(styles, 'btn-header', 'btn-outline-purple')}>
            <Edit3 size={18} /> {t('consultationStatus.updateDiagnosis')}
          </button>
          <button className={cx(styles, 'btn-header', 'btn-close-case')}>
            <CheckCircle size={18} /> {t('consultationStatus.closeCase')}
          </button>
        </div>
      </div>
    </>
  );
}

export function ConsultationStatusSidebar({
  reason,
  teamMembers,
  addConsultant,
  t,
}: {
  reason: string;
  teamMembers: TeamMember[];
  addConsultant: () => void;
  t: TFunction;
}) {
  return (
    <aside className={styles['medical-history-sidebar']}>
      <div className={styles['sidebar-section-header']}>
        <Activity size={18} color="#4318FF" />
        <span>{t('consultationStatus.medicalHistory')}</span>
      </div>

      <div className={styles['medical-data-group']}>
        <label>{t('consultationStatus.preExistingConditions')}</label>
        <p>Type 2 Diabetes, Mild Hypertension</p>
      </div>

      <div className={styles['medical-data-group']}>
        <label>{t('consultationStatus.allergies')}</label>
        <p>Penicillin, Latex</p>
      </div>

      <div className={styles['medical-data-group']}>
        <label>{t('consultationStatus.currentSymptoms')}</label>
        <p>{reason}</p>
      </div>

      <div className={styles['initial-diagnosis-box']}>
        <label>{t('consultationStatus.initialDiagnosis')}</label>
        <h4>Acute Appendicitis (Suspected)</h4>
      </div>

      <div className={cx(styles, 'sidebar-section-header', 'team-section-header')}>
        <UserPlus size={18} color="#4318FF" />
        <span>{t('consultationStatus.consultationTeam')}</span>
      </div>

      <div className={styles['team-grid']}>
        {teamMembers.map((member) => (
          <div key={member.id} className={styles['team-member-card']}>
            <Image
              src={member.avatar}
              className={styles['team-member-avatar']}
              alt=""
              width={36}
              height={36}
              unoptimized
            />
            <div className={styles['team-member-meta']}>
              <div className={styles['team-member-name']}>{member.name}</div>
              <div className={styles['team-member-specialty']}>{member.specialty}</div>
            </div>
          </div>
        ))}
        <button className={styles['invite-consultant-btn']} onClick={addConsultant}>
          <Plus size={14} /> {t('consultationStatus.inviteConsultant')}
        </button>
      </div>
    </aside>
  );
}

export function ConsultationStatusMainPanel({
  activeTab,
  setActiveTab,
  tabOptions,
  t,
}: {
  activeTab: 'vitals' | 'notes' | 'medications' | 'labs' | 'imaging';
  setActiveTab: React.Dispatch<React.SetStateAction<'vitals' | 'notes' | 'medications' | 'labs' | 'imaging'>>;
  tabOptions: TabOption[];
  t: TFunction;
}) {
  return (
    <main className={styles['main-clinical-area']}>
      <nav className={styles['tabs-nav']}>
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            className={cx(styles, 'tab-btn', activeTab === tab.id && 'active')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'imaging' && <span className={styles['imaging-count']}>(3)</span>}
          </button>
        ))}
      </nav>

      <div className={styles['tab-content-pane']}>
        {activeTab === 'vitals' && (
          <>
            <div className={styles['vitals-header']}>{t('consultationStatus.currentVitals')}</div>
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

            <div className={styles['labs-section-header']}>{t('consultationStatus.recentLabResults')}</div>
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

        {activeTab !== 'vitals' && (
          <div className={styles['placeholder-pane']}>
            <Activity size={48} strokeWidth={1} className={styles['placeholder-icon']} />
            <p>{t('consultationStatus.placeholder', { tab: activeTab })}</p>
          </div>
        )}
      </div>
    </main>
  );
}
