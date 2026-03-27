'use client';
import { useState, useRef, useEffect } from 'react';
import {
  User,
  Bell,
  ShieldCheck,
  Camera,
  ChevronDown,
  Save,
  X,
  CheckCircle2,
  Laptop,
  Smartphone,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { authService } from '@/services/auth';
import Layout from '@/components/Layout';
import './style.css';

type SettingsTab = 'profile' | 'notifications' | 'security';

function Settings() {
  const router = useRouter();
  const navigate = router.push;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile, updateUserProfile, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [acceptingPatients, setAcceptingPatients] = useState(userProfile.isAcceptingCases);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile.avatarUrl);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [form, setForm] = useState({
    title: userProfile.title,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    license: userProfile.license || '',
    specialty: userProfile.specialty,
    hospital: userProfile.hospital,
    email: userProfile.email,
    phoneNumber: userProfile.phoneNumber || '+66',
    summary: 'Board-certified healthcare professional with extensive clinical experience.',
  });

  // Update form if userProfile changes (e.g. from another component or initial load)
  useEffect(() => {
    setForm({
      title: userProfile.title,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      license: userProfile.license || '',
      specialty: userProfile.specialty,
      hospital: userProfile.hospital,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber || '+66',
      summary: form.summary, // keep current summary
    });
    setAcceptingPatients(userProfile.isAcceptingCases);
    setAvatarUrl(userProfile.avatarUrl);
  }, [userProfile]);

  // Active Sessions State
  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Chrome on macOS',
      browser: 'Chrome',
      location: 'Phitsanulok, Thailand',
      time: 'Today 07:30 AM',
      isCurrent: true,
      type: 'laptop'
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      browser: 'Safari',
      location: 'Phitsanulok, Thailand',
      time: 'Yesterday 6:12 PM',
      isCurrent: false,
      type: 'mobile'
    },
    {
      id: '3',
      device: 'Firefox on Windows',
      browser: 'Firefox',
      location: 'Bangkok, Thailand',
      time: 'Oct 15, 2023 10:45 AM',
      isCurrent: false,
      type: 'laptop'
    }
  ]);

  const revokeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSave = () => {
    const updated = {
      ...form,
      avatarUrl,
      isAcceptingCases: acceptingPatients
    };
    updateUserProfile(updated);
    // Persist user edits so they survive page refreshes and future logins
    authService.saveUserProfile({ ...userProfile, ...updated });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleDiscard = () => {
    router.back();
  };

  // Notification preferences initialized from context
  const [notifPrefs, setNotifPrefs] = useState(userProfile.notifPrefs);
  const [acceptingNotifications, setAcceptingNotifications] = useState(userProfile.isAcceptingNotifications);

  // Sync notifPrefs if userProfile changes
  useEffect(() => {
    setNotifPrefs(userProfile.notifPrefs);
    setAcceptingNotifications(userProfile.isAcceptingNotifications);
  }, [userProfile.notifPrefs, userProfile.isAcceptingNotifications]);

  const handleSaveNotifPrefs = () => {
    updateUserProfile({ 
      notifPrefs,
      isAcceptingNotifications: acceptingNotifications
    });
    // Also persist via authService for the combined profile
    authService.saveUserProfile({ 
      ...userProfile, 
      notifPrefs,
      isAcceptingNotifications: acceptingNotifications
    });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={18} /> },
  ];

  const userInitials = `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`;

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleDeactivate = () => {
    // Clear profile initialization so next login applies Provider ID defaults again
    authService.clearProfileInitialization();
    authService.logout(); // clears provider_session
    setShowDeactivateModal(false);
    showToast('Account deactivated successfully', 'info');
  };


  return (
    <Layout>
      <div className="settings-page">
        {/* Settings Sidebar */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* User card at bottom */}
          <div className="settings-user-card">
            <div className="settings-user-avatar">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="sidebar-avatar-img" />
              ) : userInitials}
            </div>
            <div>
              <p className="settings-user-name">{userProfile.title} {userProfile.firstName} {userProfile.lastName}</p>
              <p className="settings-user-email">{userProfile.email}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="settings-content">
          {/* ─── PROFILE TAB ─── */}
          {activeTab === 'profile' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h1>Healthcare Professional Profile</h1>
              </div>

              {/* Photo Section */}
              <div className="settings-card">
                <div className="photo-section">
                  <div className="photo-avatar-wrap">
                    <div className="photo-avatar" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}>
                      {!avatarUrl && userInitials}
                    </div>
                    <button className="photo-camera-btn" onClick={() => fileInputRef.current?.click()}>
                      <Camera size={14} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                    />
                  </div>
                  <div className="photo-info">
                    <div className="photo-title-row">
                      <span className="photo-label">Profile Photo</span>
                      <span className="verified-badge">
                        <ShieldCheck size={13} /> Verified Medical Professional
                      </span>
                    </div>
                    <div className="photo-actions">
                      <button className="btn-primary-sm" onClick={() => fileInputRef.current?.click()}>Upload Photo</button>
                      <button className="btn-outline-sm" onClick={() => setAvatarUrl(null)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="settings-card">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="name-input-group">
                      <div className="select-wrap small">
                        <select value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}>
                          <option>Dr.</option>
                          <option>RN</option>
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                      </div>
                      <input
                        type="text"
                        value={`${form.firstName} ${form.lastName}`}
                        onChange={e => {
                          const parts = e.target.value.split(' ');
                          setForm({ ...form, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') });
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>License Number</label>
                    <input
                      type="text"
                      value={form.license}
                      onChange={e => setForm({ ...form, license: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Specialty</label>
                    <div className="select-wrap full">
                      <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}>
                        <option>Anatomical Pathology</option>
                        <option>Anesthesiology</option>
                        <option>Cardiology</option>
                        <option>Child and Adolescent Psychiatry</option>
                        <option>Clinical Pathology</option>
                        <option>Colon and Rectal Surgery</option>
                        <option>Diagnostic Radiology</option>
                        <option>Emergency Medicine</option>
                        <option>Endocrinology and Metabolism</option>
                        <option>Family Medicine</option>
                        <option>Forensic Medicine</option>
                        <option>Gastroenterology</option>
                        <option>General Practitioner (GP)</option>
                        <option>Geriatric Medicine</option>
                        <option>Hematology</option>
                        <option>Infectious Diseases</option>
                        <option>Internal Medicine</option>
                        <option>Medical Oncology</option>
                        <option>Neonatal and Perinatal Medicine</option>
                        <option>Nephrology</option>
                        <option>Neurology</option>
                        <option>Neurosurgery</option>
                        <option>Nuclear Medicine</option>
                        <option>Obstetrics and Gynecology</option>
                        <option>Ophthalmology</option>
                        <option>Orthopedic Surgery</option>
                        <option>Otolaryngology</option>
                        <option>Pathology</option>
                        <option>Pediatric Cardiology</option>
                        <option>Pediatric Endocrinology</option>
                        <option>Pediatric Hematology and Oncology</option>
                        <option>Pediatric Infectious Diseases</option>
                        <option>Pediatric Nephrology</option>
                        <option>Pediatric Neurology</option>
                        <option>Pediatric Pulmonology</option>
                        <option>Pediatric Surgery</option>
                        <option>Pediatrics</option>
                        <option>Plastic Surgery</option>
                        <option>Preventive Medicine</option>
                        <option>Psychiatry</option>
                        <option>Pulmonary Medicine and Critical Care</option>
                        <option>Radiation Oncology</option>
                        <option>Radiology</option>
                        <option>Rehabilitation Medicine</option>
                        <option>Rheumatology</option>
                        <option>Surgery</option>
                        <option>Thoracic Surgery</option>
                        <option>Urology</option>
                        <option>Vascular Surgery</option>
                      </select>
                      <ChevronDown size={14} className="select-chevron" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Primary Hospital/Clinic Affiliation</label>
                    <input
                      type="text"
                      value={form.hospital}
                      onChange={e => setForm({ ...form, hospital: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">+66</span>
                    <input
                      type="tel"
                      value={form.phoneNumber ? form.phoneNumber.replace('+66', '') : ''}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setForm({ ...form, phoneNumber: '+66' + val });
                      }}
                      placeholder="812345678"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Professional Summary</label>
                  <textarea
                    rows={4}
                    value={form.summary}
                    maxLength={500}
                    onChange={e => setForm({ ...form, summary: e.target.value })}
                  />
                  <p className="form-hint">Maximum 500 characters. This summary will be displayed on the public provider directory.</p>
                </div>

                {/* Toggle */}
                <div className="toggle-row">
                  <div>
                    <p className="toggle-label">Accepting New Cases</p>
                    <p className="toggle-hint">Accepting New Cases Status.</p>
                  </div>
                  <button
                    className={`toggle-switch ${acceptingPatients ? 'on' : ''}`}
                    onClick={() => setAcceptingPatients(!acceptingPatients)}
                    role="switch"
                    aria-checked={acceptingPatients}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>

              {/* Footer actions */}
              <div className="settings-footer">
                <button className="btn-ghost" onClick={handleDiscard}><X size={15} /> Discard</button>
                <button className="btn-primary-lg" onClick={handleSave}><Save size={15} /> Save Profile</button>
              </div>

              {/* Toast Notification */}
              {showSaveToast && (
                <div className="settings-toast">
                  <CheckCircle2 size={18} />
                  Profile updated successfully!
                </div>
              )}
            </div>
          )}

          {/* ─── NOTIFICATIONS TAB ─── */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h1>Notification Preferences</h1>
                <p>Control how and when you receive alerts about cases and system events.</p>
              </div>
              <div className="settings-card">
                <div className="toggle-row" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                  <div>
                    <p className="toggle-label">Accepting New Notifications</p>
                    <p className="toggle-hint">Accepting New Notifications Status.</p>
                  </div>
                  <button
                    className={`toggle-switch ${acceptingNotifications ? 'on' : ''}`}
                    onClick={() => setAcceptingNotifications(!acceptingNotifications)}
                    role="switch"
                    aria-checked={acceptingNotifications}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <p className="notif-section-title">Case & Request Alerts</p>
                {[
                  { key: 'newRequest', label: 'New consultation request received', hint: 'Alert when a new consultation request is submitted' },
                  { key: 'requestApproved', label: 'Request status updated', hint: 'When your request is approved or declined' },
                  { key: 'newMessage', label: 'New message from specialist', hint: 'Chat messages and case comments' },
                  { key: 'caseUpdate', label: 'Case activity updates', hint: 'Updates on vitals, labs, and case notes' },
                ].map(({ key, label, hint }) => (
                  <div key={key} className="toggle-row bordered">
                    <div>
                      <p className="toggle-label">{label}</p>
                      <p className="toggle-hint">{hint}</p>
                    </div>
                    <button
                      className={`toggle-switch ${notifPrefs[key as keyof typeof notifPrefs] ? 'on' : ''}`}
                      onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key as keyof typeof notifPrefs] }))}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                ))}

              </div>
              <div className="settings-footer">
                <button className="btn-primary-lg" onClick={handleSaveNotifPrefs}><Save size={15} /> Save Preferences</button>
              </div>
            </div>
          )}

          {/* ─── SECURITY TAB ─── */}
          {activeTab === 'security' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h1>Security Settings</h1>
                <p>Manage your account security, authentication, and access controls.</p>
              </div>

              <div className="settings-card">
                <p className="notif-section-title">Authentication</p>

                <div className="security-row">
                  <div className="security-icon-wrap purple">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="security-info">
                    <p className="security-label">Provider ID (OAuth)</p>
                    <p className="security-hint">Connected — Last used today at 07:30 AM</p>
                  </div>
                  <span className="security-status connected">Connected</span>
                </div>

                <p className="notif-section-title" style={{ marginTop: '1.5rem' }}>Active Sessions</p>
                <p className="security-hint" style={{ marginBottom: '1rem' }}>Manage and sign out of your active sessions on other devices.</p>

                <div className="sessions-list">
                  {sessions.map((session) => (
                    <div key={session.id} className="session-row">
                      <div className={`session-device-icon ${session.type}`}>
                        {session.type === 'laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                      </div>
                      <div className="session-info">
                        <p className="session-name">
                          {session.device} 
                        </p>
                        <p className="session-meta">
                          <Globe size={12} />
                          {session.location} · {session.time}
                        </p>
                      </div>
                      {session.isCurrent && <span className="session-current">Current Session</span>}
                      {!session.isCurrent && (
                        <button className="revoke-btn" onClick={() => revokeSession(session.id)}>Sign Out</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* --- Phase 3: External Browser Redirection --- */}
                {(() => {
                  // @ts-ignore
                  const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
                  const isInTelegram = tg && tg.platform !== 'unknown';
                  
                  if (!isInTelegram) return null;

                  return (
                    <>
                      <p className="notif-section-title" style={{ marginTop: '2rem' }}>External Access</p>
                      <div className="security-row browser-redirect">
                        <div className="security-icon-wrap blue">
                          <Globe size={20} />
                        </div>
                        <div className="security-info">
                          <p className="security-label">Open in External Browser</p>
                          <p className="security-hint">Launch Antigravity in Chrome or Safari for a standard web experience. You will be required to log in again.</p>
                        </div>
                        <button 
                          className="btn-outline-sm" 
                          onClick={() => {
                            tg.openLink(window.location.origin, { try_browser: true });
                          }}
                        >
                          Open Browser
                        </button>
                      </div>
                    </>
                  );
                })()}
                {/* --------------------------------------------- */}

                <p className="notif-section-title danger" style={{ marginTop: '1.5rem' }}>Danger Zone</p>
                <div className="danger-row">
                  <div>
                    <p className="security-label">Deactivate Account</p>
                    <p className="security-hint">Temporarily disable your account. You can reactivate later.</p>
                  </div>
                  <button 
                    className="btn-danger-outline"
                    onClick={() => setShowDeactivateModal(true)}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="modal-content danger-modal">
            <div className="modal-icon-wrap danger">
              <ShieldCheck size={32} />
            </div>
            <h2>Deactivate Account?</h2>
            <p>
              This will temporarily disable your account and sign you out of all devices. 
              You can reactivate your account by logging in again at any time.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-outline-lg" 
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger-lg" 
                onClick={handleDeactivate}
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Settings;
