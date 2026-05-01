'use client';

import Image from 'next/image';
import {
  Download,
  FileText,
  Folder,
  Image as ImageIcon,
  Info,
  Mic,
  Paperclip,
  Phone,
  Search,
  Send,
  Settings,
  Video,
} from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './style.module.css';

type TFunction = (key: string) => string;

export function MessageSidebar({
  language,
  t,
  onNavigateDashboard,
}: {
  language: string;
  t: TFunction;
  onNavigateDashboard: () => void;
}) {
  return (
    <aside className={styles['message-sidebar']}>
      <div className={styles['sidebar-header']} onClick={onNavigateDashboard}>
        <div className={styles['sidebar-logo']}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="4" width="6" height="16" rx="2" fill="white" fillOpacity="0.9"/>
            <rect x="4" y="9" width="16" height="6" rx="2" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <div className={styles['sidebar-brand']}>
          <span className={styles['brand-title']}>{t('messageSpecialist.phitsanulok')}</span>
          <span className={styles['brand-subtitle']}>{t('common.medConsultation')}</span>
        </div>
      </div>

      <div className={styles['sidebar-search']}>
        <Search size={14} className={styles['search-icon']} />
        <input type="text" placeholder={t('messageSpecialist.searchPlaceholder')} />
      </div>

      <div className={styles['sidebar-section']}>
        <h3 className={styles['section-label']}>{t('messageSpecialist.activeCases')}</h3>
        <div className={styles['case-list']}>
          <div className={cx(styles, 'case-item', 'active')}>
            <div className={styles['case-icon-wrap']}>
              <Folder size={16} />
            </div>
            <div className={styles['case-item-info']}>
              <div className={styles['case-id']}>Case #CD-88219</div>
              <div className={styles['case-desc']}>Somchai Jaidee • General Surgery</div>
            </div>
            <div className={styles['case-unread-dot']}></div>
          </div>

          <div className={styles['case-item']}>
            <div className={cx(styles, 'case-icon-wrap', 'bg-gray')}>
              <Folder size={16} />
            </div>
            <div className={styles['case-item-info']}>
              <div className={styles['case-id']}>Case #HC-8822</div>
              <div className={cx(styles, 'case-desc', 'text-gray')}>Malee Chanphen • Oncology</div>
            </div>
          </div>

          <div className={styles['case-item']}>
            <div className={cx(styles, 'case-icon-wrap', 'bg-gray')}>
              <Folder size={16} />
            </div>
            <div className={styles['case-item-info']}>
              <div className={styles['case-id']}>Case #AX-1044</div>
              <div className={cx(styles, 'case-desc', 'text-gray')}>Pichate Wongchai • Cardiology</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['sidebar-section']}>
        <h3 className={styles['section-label']}>{t('messageSpecialist.caseFiles')}</h3>
        <div className={styles['file-shortcut-list']}>
          <div className={styles['file-shortcut']}>
            <FileText size={14} /> Chest_Scan_Oct25.dcm
          </div>
          <div className={styles['file-shortcut']}>
            <FileText size={14} /> Full_Report_JD.pdf
          </div>
          <div className={styles['file-shortcut']}>
            <FileText size={14} /> Lab_Results_Oct24.csv
          </div>
        </div>
        <button className={styles['see-all-files-btn']}>{t('messageSpecialist.viewAllFiles')} 8</button>
      </div>

      <div className={styles['sidebar-footer']}>
        <div className={styles['current-user-profile']}>
          <div className={styles['user-avatar']}>
            <Image
              src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff"
              alt="Dr. Sarah Mitchell"
              width={40}
              height={40}
              unoptimized
            />
          </div>
          <div className={styles['user-details']}>
            <div className={styles['user-name']}>Dr. Sarah Mitchell</div>
            <div className={styles['user-status']}>
              <span className={styles['status-dot']}></span> {t('messageSpecialist.online')}
            </div>
          </div>
        </div>
        <button className={styles['settings-btn']}>
          <Settings size={18} />
        </button>
      </div>
    </aside>
  );
}

export function MessageChatHeader({
  t,
  onOpenPatientDetail,
}: {
  t: TFunction;
  onOpenPatientDetail: () => void;
}) {
  return (
    <header className={styles['chat-header']}>
      <div className={styles['chat-header-info']}>
        <div className={styles['chat-participants-avatars']}>
          <Image
            src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff"
            alt="ดร. ซาราห์ มิทเชลล์"
            width={40}
            height={40}
            unoptimized
            className={styles['avatar-overlap']}
          />
          <Image
            src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff"
            alt="ดร. เจมส์ วิลสัน"
            width={40}
            height={40}
            unoptimized
          />
        </div>
        <div className={styles['chat-case-title']}>
          <h2>Case #CD-88219 - Somchai Jaidee</h2>
          <p>Dr. Sarah Mitchell (Surgeon) and Dr. James Wilson (Radiologist)</p>
        </div>
      </div>
      <div className={styles['chat-header-actions']}>
        <button className={styles['chat-action-btn']}><Phone size={18} /></button>
        <button className={styles['chat-action-btn']}><Video size={18} /></button>
        <div className={styles['action-divider']}></div>
        <button className={styles['chat-action-btn']} onClick={onOpenPatientDetail} title={t('messageSpecialist.viewPatientDetail')}>
          <Info size={18} />
        </button>
      </div>
    </header>
  );
}

export function MessageConversation({ t }: { t: TFunction }) {
  return (
    <div className={styles['chat-messages-container']}>
      <div className={styles['date-divider']}>
        <span>{t('messageSpecialist.startConsultation')} 24 Oct 2023</span>
      </div>

      <div className={cx(styles, 'message-group', 'received')}>
        <div className={styles['message-sender-info']}>
          <span className={styles['sender-name']}>Dr. James Wilson</span>
          <span className={styles['message-time']}>09:12 น.</span>
        </div>
        <div className={cx(styles, 'message-bubble', 'text-message')}>
          I reviewed the latest CT for case #CD-88219. The inflammation appears limited to the descending colon, but there is still mild wall thickening we should discuss.
        </div>

        <div className={cx(styles, 'message-bubble', 'media-message')}>
          <div className={styles['media-preview']}>
            <div className={styles['mock-ct-scan']}>
              <div className={styles['mock-ct-inner']}></div>
            </div>
          </div>
          <div className={styles['media-footer']}>
            <div className={styles['media-info']}>
              <div className={cx(styles, 'media-icon', 'bg-purple-light')}>
                <ImageIcon size={16} className={styles['text-purple']} />
              </div>
              <div>
                <div className={styles['media-name']}>CT_Scan_Abdominal_A.jpg</div>
                <div className={styles['media-meta']}>4.2 MB • Medical imaging</div>
              </div>
            </div>
            <button className={styles['media-download']}><Download size={16} /></button>
          </div>
        </div>
        <div className={cx(styles, 'message-avatar', 'sender-avatar')}>
          <Image
            src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff"
            alt="ดร. เจมส์ วิลสัน"
            width={36}
            height={36}
            unoptimized
          />
        </div>
      </div>

      <div className={cx(styles, 'message-group', 'sent')}>
        <div className={styles['message-sender-info']}>
          <span className={styles['message-time']}>09:45</span>
          <span className={styles['sender-name']}>Dr. Sarah Mitchell</span>
        </div>
        <div className={cx(styles, 'message-bubble', 'text-message', 'primary-bg')}>
          Thanks, James. Based on the thickening, do you think we should proceed with endoscopy or convert to open surgery?
        </div>
        <div className={cx(styles, 'message-avatar', 'receiver-avatar')}>
          <Image
            src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff"
            alt="ดร. ซาราห์ มิทเชลล์"
            width={36}
            height={36}
            unoptimized
          />
        </div>
      </div>

      <div className={cx(styles, 'message-group', 'received', 'typing-indicator-group')}>
        <div className={styles['message-sender-info']}>
          <span className={styles['sender-name']}>Dr. James Wilson</span>
          <span className={styles['message-time']}>09:47 น.</span>
        </div>
        <div className={styles['typing-dots']}>
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}

export function MessageComposer({ t }: { t: TFunction }) {
  return (
    <div className={styles['chat-input-area']}>
      <div className={styles['chat-input-wrapper']}>
        <button className={styles['input-action-btn']}><Paperclip size={20} /></button>
        <button className={styles['input-action-btn']}><ImageIcon size={20} /></button>
        <input type="text" placeholder={t('messageSpecialist.typedPlaceholder')} />
        <button className={styles['input-action-btn']}><Mic size={20} /></button>
        <button className={styles['send-btn']}><Send size={18} /></button>
      </div>
      <div className={styles['chat-security-footer']}>
        <div className={styles['security-item']}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          {t('messageSpecialist.hipaa')}
        </div>
        <div className={styles['security-item']}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          {t('messageSpecialist.endToEnd')}
        </div>
      </div>
    </div>
  );
}
