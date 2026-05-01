'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import styles from './style.module.css';
import {
  MessageChatHeader,
  MessageComposer,
  MessageConversation,
  MessageSidebar,
} from './message-specialist-sections';

function MessageSpecialist() {
  const router = useRouter();
  const navigate = router.push;
  const { selectedCase } = useApp();
  const { t, language } = useLocale();
  const patientDetailPath = selectedCase?.id
    ? `/patient-detail?caseId=${encodeURIComponent(selectedCase.id)}`
    : '/patient-detail';

  return (
    <div className={styles['message-page']}>
      <MessageSidebar
        language={language}
        t={t}
        onNavigateDashboard={() => navigate('/dashboard')}
      />

      <main className={styles['chat-main']}>
        <MessageChatHeader
          t={t}
          onOpenPatientDetail={() => navigate(patientDetailPath)}
        />
        <MessageConversation t={t} />
        <MessageComposer t={t} />
      </main>
    </div>
  );
}

export default MessageSpecialist;
