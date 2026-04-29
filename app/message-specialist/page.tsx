'use client';

import { useRouter } from 'next/navigation';
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
  const { t, language } = useLocale();

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
          onOpenPatientDetail={() => navigate('/patient-detail')}
        />
        <MessageConversation t={t} />
        <MessageComposer t={t} />
      </main>
    </div>
  );
}

export default MessageSpecialist;
