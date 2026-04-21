'use client';
import { 
  Search, 
  Folder, 
  FileText, 
  Settings, 
  Phone, 
  Video, 
  Info,
  Download,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';

function MessageSpecialist() {
  const router = useRouter();
  const navigate = router.push;
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  return (
    <div className={styles['message-page']}>
      {/* Sidebar */}
      <aside className={styles['message-sidebar']}>
        <div className={styles['sidebar-header']} onClick={() => navigate('/dashboard')}>
          <div className={styles['sidebar-logo']}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="4" width="6" height="16" rx="2" fill="white" fillOpacity="0.9"/>
              <rect x="4" y="9" width="16" height="6" rx="2" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div className={styles['sidebar-brand']}>
            <span className={styles['brand-title']}>พิษณุโลก</span>
            <span className={styles['brand-subtitle']}>ระบบปรึกษาแพทย์</span>
          </div>
        </div>

        <div className={styles['sidebar-search']}>
          <Search size={14} className={styles['search-icon']} />
          <input type="text" placeholder="ค้นหาเคส..." />
        </div>

        <div className={styles['sidebar-section']}>
          <h3 className={styles['section-label']}>เคสที่กำลังดำเนินการ</h3>
          <div className={styles['case-list']}>
            <div className={cx('case-item', 'active')}>
              <div className={styles['case-icon-wrap']}>
                <Folder size={16} />
              </div>
              <div className={styles['case-item-info']}>
                <div className={styles['case-id']}>เคส #CD-88219</div>
                <div className={styles['case-desc']}>สมชาย ใจดี • ศัลยกรรมทั่วไป</div>
              </div>
              <div className={styles['case-unread-dot']}></div>
            </div>

            <div className={styles['case-item']}>
              <div className={cx('case-icon-wrap', 'bg-gray')}>
                <Folder size={16} />
              </div>
              <div className={styles['case-item-info']}>
                <div className={styles['case-id']}>Case #HC-8822</div>
                <div className={cx('case-desc', 'text-gray')}>มาลี จันทร์เพ็ญ • มะเร็งวิทยา</div>
              </div>
            </div>

            <div className={styles['case-item']}>
              <div className={cx('case-icon-wrap', 'bg-gray')}>
                <Folder size={16} />
              </div>
              <div className={styles['case-item-info']}>
                <div className={styles['case-id']}>Case #AX-1044</div>
                <div className={cx('case-desc', 'text-gray')}>พิเชษฐ์ วงศ์ชัย • โรคหัวใจ</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles['sidebar-section']}>
          <h3 className={styles['section-label']}>ไฟล์ในเคสนี้</h3>
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
          <button className={styles['see-all-files-btn']}>ดูไฟล์ทั้งหมด 8 รายการ</button>
        </div>

        <div className={styles['sidebar-footer']}>
          <div className={styles['current-user-profile']}>
            <div className={styles['user-avatar']}>
              <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="ดร. ซาราห์ มิทเชลล์" />
            </div>
            <div className={styles['user-details']}>
              <div className={styles['user-name']}>ดร. ซาราห์ มิทเชลล์</div>
              <div className={styles['user-status']}>
                <span className={styles['status-dot']}></span> ออนไลน์
              </div>
            </div>
          </div>
          <button className={styles['settings-btn']}>
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={styles['chat-main']}>
        {/* Chat Header */}
        <header className={styles['chat-header']}>
          <div className={styles['chat-header-info']}>
             <div className={styles['chat-participants-avatars']}>
              <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="ดร. ซาราห์ มิทเชลล์" className={styles['avatar-overlap']} />
                <img src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff" alt="ดร. เจมส์ วิลสัน" />
             </div>
             <div className={styles['chat-case-title']}>
               <h2>เคส #CD-88219 - สมชาย ใจดี</h2>
               <p>ดร. ซาราห์ มิทเชลล์ (ศัลยแพทย์) และ ดร. เจมส์ วิลสัน (รังสีแพทย์)</p>
             </div>
          </div>
          <div className={styles['chat-header-actions']}>
            <button className={styles['chat-action-btn']}><Phone size={18} /></button>
            <button className={styles['chat-action-btn']}><Video size={18} /></button>
            <div className={styles['action-divider']}></div>
            {/* The info button linking to patient detail page */}
            <button className={styles['chat-action-btn']} onClick={() => navigate('/patient-detail')} title="ดูรายละเอียดผู้ป่วย">
              <Info size={18} />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className={styles['chat-messages-container']}>
          <div className={styles['date-divider']}>
            <span>เริ่มปรึกษาเมื่อ 24 ต.ค. 2023</span>
          </div>

          {/* Message from Wilson */}
          <div className={cx('message-group', 'received')}>
            <div className={styles['message-sender-info']}>
              <span className={styles['sender-name']}>ดร. เจมส์ วิลสัน</span>
              <span className={styles['message-time']}>09:12 น.</span>
            </div>
            <div className={cx('message-bubble', 'text-message')}>
              ฉันตรวจ CT ล่าสุดของเคส #CD-88219 แล้ว พบการอักเสบจำกัดอยู่ที่ลำไส้ใหญ่ส่วนลง แต่ยังมีผนังหนาตัวเล็กน้อยที่ควรคุยกันต่อ
            </div>

            <div className={cx('message-bubble', 'media-message')}>
              <div className={styles['media-preview']}>
                {/* Simulated CT Scan Image */}
                <div className={styles['mock-ct-scan']}>
                   <div className={styles['mock-ct-inner']}></div>
                </div>
              </div>
              <div className={styles['media-footer']}>
                <div className={styles['media-info']}>
                  <div className={cx('media-icon', 'bg-purple-light')}>
                    <ImageIcon size={16} className={styles['text-purple']} />
                  </div>
                  <div>
                    <div className={styles['media-name']}>CT_Scan_Abdominal_A.jpg</div>
                    <div className={styles['media-meta']}>4.2 MB • ภาพถ่ายทางการแพทย์</div>
                  </div>
                </div>
                <button className={styles['media-download']}><Download size={16} /></button>
              </div>
            </div>
            {/* Avatar for receiver positioned at bottom of the group */}
            <div className={cx('message-avatar', 'sender-avatar')}>
               <img src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff" alt="ดร. เจมส์ วิลสัน" />
            </div>
          </div>

          {/* Message from Sarah */}
          <div className={cx('message-group', 'sent')}>
            <div className={styles['message-sender-info']}>
              <span className={styles['message-time']}>09:45 น.</span>
              <span className={styles['sender-name']}>ดร. ซาราห์ มิทเชลล์</span>
            </div>
            <div className={cx('message-bubble', 'text-message', 'primary-bg')}>
              ขอบคุณ เจมส์ จากความหนาตัวที่เห็น คุณคิดว่าเราควรใช้วิธีส่องกล้อง หรือเปลี่ยนเป็นผ่าตัดเปิดดี?
            </div>
            <div className={cx('message-avatar', 'receiver-avatar')}>
               <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="ดร. ซาราห์ มิทเชลล์" />
            </div>
          </div>
          
           {/* Typing indicator from Wilson */}
           <div className={cx('message-group', 'received', 'typing-indicator-group')}>
            <div className={styles['message-sender-info']}>
              <span className={styles['sender-name']}>ดร. เจมส์ วิลสัน</span>
              <span className={styles['message-time']}>09:47 น.</span>
            </div>
             <div className={styles['typing-dots']}>
               <span></span><span></span><span></span>
             </div>
          </div>

        </div>

        {/* Chat Input */}
        <div className={styles['chat-input-area']}>
           <div className={styles['chat-input-wrapper']}>
             <button className={styles['input-action-btn']}><Paperclip size={20} /></button>
             <button className={styles['input-action-btn']}><ImageIcon size={20} /></button>
             <input type="text" placeholder="พิมพ์ข้อสังเกตทางการแพทย์หรือคำตอบ..." />
             <button className={styles['input-action-btn']}><Mic size={20} /></button>
             <button className={styles['send-btn']}><Send size={18} /></button>
           </div>
           <div className={styles['chat-security-footer']}>
              <div className={styles['security-item']}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                เป็นไปตาม HIPAA
              </div>
              <div className={styles['security-item']}>
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
                เข้ารหัสครบวงจร
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}

export default MessageSpecialist;
