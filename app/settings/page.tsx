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
import styles from './style.module.css';

type SettingsTab = 'profile' | 'notifications' | 'security';

function Settings() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile, updateUserProfile, showToast } = useApp();
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

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
    summary: 'ผู้เชี่ยวชาญด้านสุขภาพที่ได้รับการรับรอง มีประสบการณ์ทางคลินิกอย่างกว้างขวาง',
  });

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
      summary: form.summary,
    });
    setAcceptingPatients(userProfile.isAcceptingCases);
    setAvatarUrl(userProfile.avatarUrl);
  }, [userProfile]);

  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome บน macOS', location: 'พิษณุโลก, ประเทศไทย', time: 'วันนี้ 07:30 น.', isCurrent: true, type: 'laptop' },
    { id: '2', device: 'Safari บน iPhone', location: 'พิษณุโลก, ประเทศไทย', time: 'เมื่อวาน 18:12 น.', isCurrent: false, type: 'mobile' },
    { id: '3', device: 'Firefox บน Windows', location: 'กรุงเทพฯ, ประเทศไทย', time: '15 ต.ค. 2023 10:45 น.', isCurrent: false, type: 'laptop' }
  ]);

  const revokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const updated = { ...form, avatarUrl, isAcceptingCases: acceptingPatients };
    updateUserProfile(updated);
    authService.saveUserProfile({ ...userProfile, ...updated });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleDiscard = () => {
    router.back();
  };

  const [notifPrefs, setNotifPrefs] = useState(userProfile.notifPrefs);
  const [acceptingNotifications, setAcceptingNotifications] = useState(userProfile.isAcceptingNotifications);

  useEffect(() => {
    setNotifPrefs(userProfile.notifPrefs);
    setAcceptingNotifications(userProfile.isAcceptingNotifications);
  }, [userProfile.notifPrefs, userProfile.isAcceptingNotifications]);

  const handleSaveNotifPrefs = () => {
    updateUserProfile({
      notifPrefs,
      isAcceptingNotifications: acceptingNotifications
    });
    authService.saveUserProfile({
      ...userProfile,
      notifPrefs,
      isAcceptingNotifications: acceptingNotifications
    });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'โปรไฟล์', icon: <User size={18} /> },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: <Bell size={18} /> },
    { id: 'security', label: 'ความปลอดภัย', icon: <ShieldCheck size={18} /> },
  ];

  const userInitials = `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`;
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleDeactivate = () => {
    authService.clearProfileInitialization();
    authService.logout();
    setShowDeactivateModal(false);
    showToast('ปิดใช้งานบัญชีเรียบร้อยแล้ว', 'info');
  };

  return (
    <Layout>
      <div className={styles['settings-page']}>
        <aside className={styles['settings-sidebar']}>
          <nav className={styles['settings-nav']}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={cx('settings-nav-item', activeTab === item.id && 'active')}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles['settings-user-card']}>
            <div className={styles['settings-user-avatar']}>
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className={styles['sidebar-avatar-img']} />
              ) : userInitials}
            </div>
            <div>
              <p className={styles['settings-user-name']}>{userProfile.title} {userProfile.firstName} {userProfile.lastName}</p>
              <p className={styles['settings-user-email']}>{userProfile.email}</p>
            </div>
          </div>
        </aside>

        <div className={styles['settings-content']}>
          {activeTab === 'profile' && (
            <div className={styles['settings-panel']}>
              <div className={styles['settings-panel-header']}>
                <h1>โปรไฟล์บุคลากรทางการแพทย์</h1>
              </div>

              <div className={styles['settings-card']}>
                <div className={styles['photo-section']}>
                  <div className={styles['photo-avatar-wrap']}>
                    <div
                      className={cx('photo-avatar', avatarUrl && 'photo-avatar-has-image')}
                      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                    >
                      {!avatarUrl && userInitials}
                    </div>
                    <button className={styles['photo-camera-btn']} onClick={() => fileInputRef.current?.click()}>
                      <Camera size={14} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className={styles['hidden-input']}
                      accept="image/*"
                    />
                  </div>
                  <div className={styles['photo-info']}>
                    <div className={styles['photo-title-row']}>
                      <span className={styles['photo-label']}>รูปโปรไฟล์</span>
                      <span className={styles['verified-badge']}>
                        <ShieldCheck size={13} /> บุคลากรทางการแพทย์ที่ได้รับการยืนยัน
                      </span>
                    </div>
                    <div className={styles['photo-actions']}>
                      <button className={styles['btn-primary-sm']} onClick={() => fileInputRef.current?.click()}>อัปโหลดรูป</button>
                      <button className={styles['btn-outline-sm']} onClick={() => setAvatarUrl(null)}>ลบรูป</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles['settings-card']}>
                <div className={styles['form-row-2']}>
                  <div className={styles['form-group']}>
                    <label>ชื่อ-นามสกุล</label>
                    <div className={styles['name-input-group']}>
                      <div className={`${styles['select-wrap']} ${styles['small']}`}>
                        <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
                          <option>Dr.</option>
                          <option>RN</option>
                        </select>
                        <ChevronDown size={14} className={styles['select-chevron']} />
                      </div>
                      <input
                        type="text"
                        value={`${form.firstName} ${form.lastName}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(' ');
                          setForm({ ...form, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') });
                        }}
                        className={styles['flex-1']}
                      />
                    </div>
                  </div>
                  <div className={styles['form-group']}>
                    <label>เลขใบอนุญาต</label>
                    <input type="text" value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} />
                  </div>
                </div>

                <div className={styles['form-row-2']}>
                  <div className={styles['form-group']}>
                    <label>สาขาเฉพาะทาง</label>
                    <div className={`${styles['select-wrap']} ${styles['full']}`}>
                      <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
                        <option>Anatomical Pathology</option><option>Anesthesiology</option><option>Cardiology</option><option>Child and Adolescent Psychiatry</option>
                        <option>Clinical Pathology</option><option>Colon and Rectal Surgery</option><option>Diagnostic Radiology</option><option>Emergency Medicine</option>
                        <option>Endocrinology and Metabolism</option><option>Family Medicine</option><option>Forensic Medicine</option><option>Gastroenterology</option>
                        <option>General Practitioner (GP)</option><option>Geriatric Medicine</option><option>Hematology</option><option>Infectious Diseases</option>
                        <option>Internal Medicine</option><option>Medical Oncology</option><option>Neonatal and Perinatal Medicine</option><option>Nephrology</option>
                        <option>Neurology</option><option>Neurosurgery</option><option>Nuclear Medicine</option><option>Obstetrics and Gynecology</option>
                        <option>Ophthalmology</option><option>Orthopedic Surgery</option><option>Otolaryngology</option><option>Pathology</option>
                        <option>Pediatric Cardiology</option><option>Pediatric Endocrinology</option><option>Pediatric Hematology and Oncology</option><option>Pediatric Infectious Diseases</option>
                        <option>Pediatric Nephrology</option><option>Pediatric Neurology</option><option>Pediatric Pulmonology</option><option>Pediatric Surgery</option>
                        <option>Pediatrics</option><option>Plastic Surgery</option><option>Preventive Medicine</option><option>Psychiatry</option>
                        <option>Pulmonary Medicine and Critical Care</option><option>Radiation Oncology</option><option>Radiology</option><option>Rehabilitation Medicine</option>
                        <option>Rheumatology</option><option>Surgery</option><option>Thoracic Surgery</option><option>Urology</option><option>Vascular Surgery</option>
                      </select>
                      <ChevronDown size={14} className={styles['select-chevron']} />
                    </div>
                  </div>
                  <div className={styles['form-group']}>
                    <label>สังกัดโรงพยาบาล/คลินิกหลัก</label>
                    <input type="text" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
                  </div>
                </div>

                <div className={styles['form-group']}>
                    <label>อีเมล</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>

                <div className={styles['form-group']}>
                    <label>เบอร์โทรศัพท์</label>
                  <div className={styles['phone-input-wrap']}>
                    <span className={styles['phone-prefix']}>+66</span>
                    <input
                      type="tel"
                      value={form.phoneNumber ? form.phoneNumber.replace('+66', '') : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setForm({ ...form, phoneNumber: '+66' + val });
                      }}
                      placeholder="812345678"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className={styles['form-group']}>
                  <label>สรุปประวัติวิชาชีพ</label>
                  <textarea rows={4} value={form.summary} maxLength={500} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                  <p className={styles['form-hint']}>ไม่เกิน 500 ตัวอักษร สรุปนี้จะแสดงในไดเรกทอรีผู้ให้บริการสาธารณะ</p>
                </div>

                <div className={styles['toggle-row']}>
                  <div>
                    <p className={styles['toggle-label']}>รับเคสใหม่</p>
                    <p className={styles['toggle-hint']}>สถานะการรับเคสใหม่</p>
                  </div>
                  <button className={cx('toggle-switch', acceptingPatients && 'on')} onClick={() => setAcceptingPatients(!acceptingPatients)} role="switch" aria-checked={acceptingPatients}>
                    <span className={styles['toggle-knob']} />
                  </button>
                </div>
              </div>

              <div className={styles['settings-footer']}>
                <button className={styles['btn-ghost']} onClick={handleDiscard}><X size={15} /> ยกเลิก</button>
                <button className={styles['btn-primary-lg']} onClick={handleSave}><Save size={15} /> บันทึกโปรไฟล์</button>
              </div>

              {showSaveToast && (
                <div className={styles['settings-toast']}>
                  <CheckCircle2 size={18} />
                  อัปเดตโปรไฟล์เรียบร้อยแล้ว
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles['settings-panel']}>
              <div className={styles['settings-panel-header']}>
                <h1>การตั้งค่าการแจ้งเตือน</h1>
                <p>กำหนดว่าคุณจะได้รับการแจ้งเตือนเกี่ยวกับเคสและเหตุการณ์ระบบเมื่อใดและอย่างไร</p>
              </div>
              <div className={styles['settings-card']}>
                <div className={cx('toggle-row', 'spaced-toggle-row')}>
                  <div>
                    <p className={styles['toggle-label']}>เปิดรับการแจ้งเตือนใหม่</p>
                    <p className={styles['toggle-hint']}>สถานะการเปิดรับการแจ้งเตือนใหม่</p>
                  </div>
                  <button className={cx('toggle-switch', acceptingNotifications && 'on')} onClick={() => setAcceptingNotifications(!acceptingNotifications)} role="switch" aria-checked={acceptingNotifications}>
                    <span className={styles['toggle-knob']} />
                  </button>
                </div>

                <p className={styles['notif-section-title']}>การแจ้งเตือนเคสและคำขอ</p>
                {[
                  { key: 'newRequest', label: 'มีคำขอปรึกษาใหม่', hint: 'แจ้งเมื่อมีการส่งคำขอปรึกษาใหม่' },
                  { key: 'requestApproved', label: 'สถานะคำขอเปลี่ยน', hint: 'เมื่อคำขอของคุณได้รับการอนุมัติหรือปฏิเสธ' },
                  { key: 'newMessage', label: 'มีข้อความใหม่จากผู้เชี่ยวชาญ', hint: 'ข้อความแชตและความคิดเห็นในเคส' },
                  { key: 'caseUpdate', label: 'อัปเดตกิจกรรมของเคส', hint: 'อัปเดตสัญญาณชีพ แล็บ และบันทึกเคส' },
                ].map(({ key, label, hint }) => (
                  <div key={key} className={cx('toggle-row', 'bordered')}>
                    <div>
                      <p className={styles['toggle-label']}>{label}</p>
                      <p className={styles['toggle-hint']}>{hint}</p>
                    </div>
                    <button className={cx('toggle-switch', notifPrefs[key as keyof typeof notifPrefs] && 'on')} onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof notifPrefs] }))}>
                      <span className={styles['toggle-knob']} />
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles['settings-footer']}>
                <button className={styles['btn-primary-lg']} onClick={handleSaveNotifPrefs}><Save size={15} /> บันทึกการตั้งค่า</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles['settings-panel']}>
              <div className={styles['settings-panel-header']}>
                <h1>การตั้งค่าความปลอดภัย</h1>
                <p>จัดการความปลอดภัยของบัญชี การยืนยันตัวตน และการควบคุมการเข้าถึง</p>
              </div>

              <div className={styles['settings-card']}>
                <p className={styles['notif-section-title']}>การยืนยันตัวตน</p>

                <div className={styles['security-row']}>
                  <div className={`${styles['security-icon-wrap']} ${styles['purple']}`}><ShieldCheck size={20} /></div>
                  <div className={styles['security-info']}>
                    <p className={styles['security-label']}>Provider ID (OAuth)</p>
                    <p className={styles['security-hint']}>เชื่อมต่อแล้ว — ใช้ล่าสุดวันนี้เวลา 07:30 น.</p>
                  </div>
                  <span className={`${styles['security-status']} ${styles['connected']}`}>เชื่อมต่อแล้ว</span>
                </div>

                <p className={`${styles['notif-section-title']} ${styles['mt-6']}`}>เซสชันที่ใช้งานอยู่</p>
                <p className={`${styles['security-hint']} ${styles['mb-4']}`}>จัดการและออกจากระบบของอุปกรณ์อื่นที่ยังใช้งานอยู่</p>

                <div className={styles['sessions-list']}>
                  {sessions.map((session) => (
                    <div key={session.id} className={styles['session-row']}>
                      <div className={`${styles['session-device-icon']} ${styles[session.type]}`}>
                        {session.type === 'laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                      </div>
                      <div className={styles['session-info']}>
                        <p className={styles['session-name']}>{session.device}</p>
                        <p className={styles['session-meta']}><Globe size={12} />{session.location} · {session.time}</p>
                      </div>
                      {session.isCurrent && <span className={styles['session-current']}>เซสชันปัจจุบัน</span>}
                      {!session.isCurrent && <button className={styles['revoke-btn']} onClick={() => revokeSession(session.id)}>ออกจากระบบ</button>}
                    </div>
                  ))}
                </div>

                {(() => {
                  // @ts-ignore
                  const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
                  const isInTelegram = tg && tg.platform !== 'unknown';
                  if (!isInTelegram) return null;

                  return (
                    <>
                      <p className={`${styles['notif-section-title']} ${styles['mt-8']}`}>การเข้าถึงภายนอก</p>
                      <div className={cx('security-row', 'browser-redirect')}>
                        <div className={`${styles['security-icon-wrap']} ${styles['blue']}`}><Globe size={20} /></div>
                        <div className={styles['security-info']}>
                          <p className={styles['security-label']}>เปิดในเบราว์เซอร์ภายนอก</p>
                          <p className={styles['security-hint']}>เปิด Antigravity ใน Chrome หรือ Safari เพื่อใช้งานแบบเว็บปกติ และต้องเข้าสู่ระบบใหม่</p>
                        </div>
                        <button className={styles['btn-outline-sm']} onClick={() => { tg.openLink(window.location.origin, { try_browser: true }); }}>
                          เปิดเบราว์เซอร์
                        </button>
                      </div>
                    </>
                  );
                })()}

                <p className={`${styles['notif-section-title']} ${styles['danger']} ${styles['mt-6']}`}>พื้นที่เสี่ยง</p>
                <div className={styles['danger-row']}>
                  <div>
                    <p className={styles['security-label']}>ปิดใช้งานบัญชี</p>
                    <p className={styles['security-hint']}>ปิดการใช้งานบัญชีชั่วคราว และเปิดใช้งานอีกครั้งได้ภายหลัง</p>
                  </div>
                  <button className={styles['btn-danger-outline']} onClick={() => setShowDeactivateModal(true)}>
                    ปิดใช้งาน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeactivateModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={`${styles['modal-icon-wrap']} ${styles['danger']}`}>
              <ShieldCheck size={32} />
            </div>
            <h2>ต้องการปิดใช้งานบัญชีหรือไม่?</h2>
            <p>
              การดำเนินการนี้จะปิดใช้งานบัญชีชั่วคราวและออกจากระบบทุกอุปกรณ์
              คุณสามารถเปิดใช้งานบัญชีอีกครั้งได้ด้วยการเข้าสู่ระบบใหม่เมื่อใดก็ได้
            </p>
            <div className={styles['modal-actions']}>
              <button className={styles['btn-outline-lg']} onClick={() => setShowDeactivateModal(false)}>
                ยกเลิก
              </button>
              <button className={styles['btn-danger-lg']} onClick={handleDeactivate}>
                ยืนยันการปิดใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Settings;
