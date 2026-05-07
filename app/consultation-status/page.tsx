'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import styles from './style.module.css';
import {
  ConsultationStatusHeader,
  ConsultationStatusMainPanel,
  ConsultationStatusSidebar,
  type TeamMember,
} from './consultation-status-sections';

const DEFAULT_REASON = 'Persistent sharp abdominal pain (lower right quadrant), low-grade fever (100.4°F), nausea for 24 hours.';

function ConsultationStatus() {
  const router = useRouter();
  const navigate = router.push;
  const { selectedCase } = useApp();
  const { t, language } = useLocale();
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes' | 'medications' | 'labs' | 'imaging'>('vitals');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Dr. Aris Vance, MD',
      specialty: 'Interventional Cardiology',
      role: t('consultationStatus.lead'),
      avatar: 'https://ui-avatars.com/api/?name=Aris+Vance&background=4318FF&color=fff',
      status: t('consultationStatus.reviewing'),
    },
    {
      id: '2',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Internal Medicine',
      role: t('consultationStatus.consultant'),
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=14b8a6&color=fff',
      status: t('consultationStatus.replied'),
    },
  ]);

  const addConsultant = () => {
    const newConsultant: TeamMember = {
      id: Math.random().toString(36).slice(2, 11),
      name: 'Dr. Michael Chen',
      specialty: 'Radiology',
      role: t('consultationStatus.consultant'),
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=f43f5e&color=fff',
      status: t('consultationStatus.invited'),
    };

    setTeamMembers((current) => [...current, newConsultant]);
  };

  const patientInitials = selectedCase
    ? selectedCase.patientName.split(' ').map((name) => name[0]).join('')
    : 'JD';

  const getUrgencyBadge = (priority?: string) => {
    if (!priority) return null;

    const labelMapping: Record<string, string> = {
      IMMEDIATE: `1. ${language === 'th' ? 'อันตรายถึงชีวิตทันที' : 'Immediate'}`,
      EMERGENCY: `2. ${language === 'th' ? 'ฉุกเฉิน' : 'Emergency'}`,
      URGENT: `3. ${language === 'th' ? 'เร่งด่วน' : 'Urgent'}`,
      'SEMI-URGENT': `4. ${language === 'th' ? 'กึ่งเร่งด่วน' : 'Semi-urgent'}`,
      'NON-URGENT': `5. ${language === 'th' ? 'ไม่เร่งด่วน' : 'Non-urgent'}`,
    };

    return (
      <span className={styles[`badge-${priority.toLowerCase()}`]}>
        {priority === 'IMMEDIATE' && '! '}
        {labelMapping[priority] || priority}
      </span>
    );
  };

  const tabOptions = [
    { id: 'vitals' as const, label: t('consultationStatus.vitalsLabs') },
    { id: 'notes' as const, label: t('consultationStatus.consultationNotes') },
    { id: 'medications' as const, label: t('consultationStatus.medications') },
    { id: 'labs' as const, label: t('consultationStatus.labs') },
    { id: 'imaging' as const, label: t('consultationStatus.imaging') },
  ];

  return (
    <Layout>
      <div className={styles['case-overview-wrapper']}>
        <ConsultationStatusHeader
          caseId={selectedCase?.id}
          patientName={selectedCase?.patientName || t('consultationStatus.defaultPatientName')}
          patientInitials={patientInitials}
          patientAge={selectedCase?.age || 34}
          patientGender={selectedCase?.gender || t('consultationStatus.female')}
          reason={selectedCase?.reason || t('consultationStatus.defaultReason')}
          urgencyBadge={selectedCase ? getUrgencyBadge(selectedCase.priority) : <span className={styles['badge-urgent']}>{language === 'th' ? '! เร่งด่วน' : '! Urgent'}</span>}
          onBack={() => navigate('/dashboard')}
          t={t}
        />

        <div className={styles['case-details-grid']}>
          <ConsultationStatusSidebar
            reason={selectedCase?.reason || t('consultationStatus.defaultReason')}
            teamMembers={teamMembers}
            addConsultant={addConsultant}
            t={t}
          />
          <ConsultationStatusMainPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabOptions={tabOptions}
            t={t}
          />
        </div>
      </div>
    </Layout>
  );
}

export default ConsultationStatus;
