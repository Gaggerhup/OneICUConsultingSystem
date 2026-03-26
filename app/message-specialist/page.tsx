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
import './style.css';

function MessageSpecialist() {
  const router = useRouter();
  const navigate = router.push;

  return (
    <div className="message-page">
      {/* Sidebar */}
      <aside className="message-sidebar">
        <div className="sidebar-header" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="4" width="6" height="16" rx="2" fill="white" fillOpacity="0.9"/>
              <rect x="4" y="9" width="16" height="6" rx="2" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div className="sidebar-brand">
            <span className="brand-title">Phitsanulok</span>
            <span className="brand-subtitle">Med Consultation</span>
          </div>
        </div>

        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input type="text" placeholder="Search cases..." />
        </div>

        <div className="sidebar-section">
          <h3 className="section-label">ACTIVE CASES</h3>
          <div className="case-list">
            <div className="case-item active">
              <div className="case-icon-wrap">
                <Folder size={16} />
              </div>
              <div className="case-item-info">
                <div className="case-id">Case #CD-88219</div>
                <div className="case-desc">John Doe • General Surgery</div>
              </div>
              <div className="case-unread-dot"></div>
            </div>

            <div className="case-item">
              <div className="case-icon-wrap bg-gray">
                <Folder size={16} />
              </div>
              <div className="case-item-info">
                <div className="case-id">Case #HC-8822</div>
                <div className="case-desc text-gray">Jane Smith • Oncology</div>
              </div>
            </div>

            <div className="case-item">
              <div className="case-icon-wrap bg-gray">
                <Folder size={16} />
              </div>
              <div className="case-item-info">
                <div className="case-id">Case #AX-1044</div>
                <div className="case-desc text-gray">Robert Brown • Cardiology</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="section-label">FILES IN THIS CASE</h3>
          <div className="file-shortcut-list">
            <div className="file-shortcut">
              <FileText size={14} /> Chest_Scan_Oct25.dcm
            </div>
            <div className="file-shortcut">
              <FileText size={14} /> Full_Report_JD.pdf
            </div>
            <div className="file-shortcut">
              <FileText size={14} /> Lab_Results_Oct24.csv
            </div>
          </div>
          <button className="see-all-files-btn">See all 8 files</button>
        </div>

        <div className="sidebar-footer">
          <div className="current-user-profile">
            <div className="user-avatar">
              <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="Dr. Sarah Mitchell" />
            </div>
            <div className="user-details">
              <div className="user-name">Dr. Sarah Mitchell</div>
              <div className="user-status">
                <span className="status-dot"></span> ONLINE
              </div>
            </div>
          </div>
          <button className="settings-btn">
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Chat Header */}
        <header className="chat-header">
          <div className="chat-header-info">
             <div className="chat-participants-avatars">
                <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="Dr. Sarah Mitchell" className="avatar-overlap" />
                <img src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff" alt="Dr. James Wilson" />
             </div>
             <div className="chat-case-title">
               <h2>Case #CD-88219 - John Doe</h2>
               <p>Dr. Sarah Mitchell (Surgeon) & Dr. James Wilson (Radiologist)</p>
             </div>
          </div>
          <div className="chat-header-actions">
            <button className="chat-action-btn"><Phone size={18} /></button>
            <button className="chat-action-btn"><Video size={18} /></button>
            <div className="action-divider"></div>
            {/* The info button linking to patient detail page */}
            <button className="chat-action-btn" onClick={() => navigate('/patient-detail')} title="View Patient Details">
              <Info size={18} />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="chat-messages-container">
          <div className="date-divider">
            <span>CONSULTATION STARTED OCT 24, 2023</span>
          </div>

          {/* Message from Wilson */}
          <div className="message-group received">
            <div className="message-sender-info">
              <span className="sender-name">Dr. James Wilson</span>
              <span className="message-time">09:12 AM</span>
            </div>
            <div className="message-bubble text-message">
              I've reviewed the latest CT scans for Case #CD-88219. The inflammation seems localized to the descending colon, but there's some thickening we should discuss.
            </div>

            <div className="message-bubble media-message">
              <div className="media-preview">
                {/* Simulated CT Scan Image */}
                <div className="mock-ct-scan">
                   <div className="mock-ct-inner"></div>
                </div>
              </div>
              <div className="media-footer">
                <div className="media-info">
                  <div className="media-icon bg-purple-light">
                    <ImageIcon size={16} className="text-purple" />
                  </div>
                  <div>
                    <div className="media-name">CT_Scan_Abdominal_A.jpg</div>
                    <div className="media-meta">4.2 MB • Imaging</div>
                  </div>
                </div>
                <button className="media-download"><Download size={16} /></button>
              </div>
            </div>
            {/* Avatar for receiver positioned at bottom of the group */}
            <div className="message-avatar sender-avatar">
               <img src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff" alt="Dr. James Wilson" />
            </div>
          </div>

          {/* Message from Sarah */}
          <div className="message-group sent">
            <div className="message-sender-info">
              <span className="message-time">09:45 AM</span>
              <span className="sender-name">Dr. Sarah Mitchell</span>
            </div>
            <div className="message-bubble text-message primary-bg">
              Thank you, James. Based on that thickening, do you think we should proceed with the laparoscopic approach or move to open surgery?
            </div>
            <div className="message-avatar receiver-avatar">
               <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="Dr. Sarah Mitchell" />
            </div>
          </div>
          
           {/* Typing indicator from Wilson */}
           <div className="message-group received typing-indicator-group">
            <div className="message-sender-info">
              <span className="sender-name">Dr. James Wilson</span>
              <span className="message-time">09:47 AM</span>
            </div>
             <div className="typing-dots">
               <span></span><span></span><span></span>
             </div>
          </div>

        </div>

        {/* Chat Input */}
        <div className="chat-input-area">
           <div className="chat-input-wrapper">
             <button className="input-action-btn"><Paperclip size={20} /></button>
             <button className="input-action-btn"><ImageIcon size={20} /></button>
             <input type="text" placeholder="Type your medical observation or reply..." />
             <button className="input-action-btn"><Mic size={20} /></button>
             <button className="send-btn"><Send size={18} /></button>
           </div>
           <div className="chat-security-footer">
              <div className="security-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                HIPAA COMPLIANT
              </div>
              <div className="security-item">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
                END-TO-END ENCRYPTED
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}

export default MessageSpecialist;
