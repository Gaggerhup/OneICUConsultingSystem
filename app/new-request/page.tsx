'use client';
import { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Send,
  ShieldCheck,
  FileText,
  Hospital,
  Save,
  RotateCcw,
  X,
  UploadCloud,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  IdCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { getPatientByIdentifier } from '@/actions/patients';
import styles from './style.module.css';

interface RequestForm {
  patientName: string;
  hn: string;
  cid: string;
  age: string;
  gender: string;
  hospital: string;
  complaint: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    rr: string;
  };
  urgency: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
}

const initialForm: RequestForm = {
  patientName: '',
  hn: '',
  cid: '',
  age: '',
  gender: '',
  hospital: '',
  complaint: '',
  vitals: { bp: '', hr: '', temp: '', rr: '' },
  urgency: 'URGENT',
};

interface MockPatient {
  patientName: string;
  hn: string;
  age: string;
  gender: string;
}

const MOCK_PATIENTS: Record<string, MockPatient> = {
  '1234567890123': { patientName: 'สมชาย ใจดี', hn: 'HN-100001', age: '52', gender: 'male' },
  '9876543210987': { patientName: 'สมหญิง มีสุข', hn: 'HN-100045', age: '34', gender: 'female' },
  '1109900123456': { patientName: 'วิชัย แสนดี', hn: 'HN-200312', age: '68', gender: 'male' },
  '3456789012345': { patientName: 'อรอุมา รักดี', hn: 'HN-300087', age: '29', gender: 'female' },
  'A12345678': { patientName: 'สมชาย ศรีสุข (Passport)', hn: 'HN-400001', age: '45', gender: 'male' },
  'B98765432': { patientName: 'มาลี จันทร์เพ็ญ (Passport)', hn: 'HN-400002', age: '38', gender: 'female' },
};

type Workflow = 'id-entry' | 'loading' | 'review';

function NewRequest() {
  const router = useRouter();
  const navigate = router.push;
  const { addRequest } = useApp();
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  const [workflow, setWorkflow] = useState<Workflow>('id-entry');
  const [cidInput, setCidInput] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [formData, setFormData] = useState<RequestForm>(initialForm);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientLookupMatched, setPatientLookupMatched] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem('consultation_draft');
    if (savedDraft) setShowDraftBanner(true);
  }, []);

  useEffect(() => {
    if (workflow !== 'review') return;
    const timer = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify(initialForm)) {
        localStorage.setItem('consultation_draft', JSON.stringify(formData));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, workflow]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof RequestForm] as Record<string, string>), [child]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('consultation_draft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setFormData(draft);
      setCidInput(draft.cid || '');
      setPatientLookupMatched(Boolean(draft.patientName));
      setShowDraftBanner(false);
      setWorkflow('review');
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('consultation_draft');
    setShowDraftBanner(false);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    localStorage.setItem('consultation_draft', JSON.stringify(formData));
    setTimeout(() => setIsSaving(false), 600);
  };

  const handleLookup = async () => {
    const trimmed = cidInput.trim();
    if (!trimmed) {
      setLookupError('กรุณากรอกเลข CID หรือ Passport Number ก่อนค้นหา');
      return;
    }
    const isValidCID = /^\d{13}$/.test(trimmed);
    const isValidPassport = /^[A-Z][0-9]{8}$/.test(trimmed);
    if (!isValidCID && !isValidPassport) {
      setLookupError('รูปแบบไม่ถูกต้อง — CID ต้องเป็นตัวเลข 13 หลัก หรือ Passport (เช่น A12345678)');
      return;
    }
    setLookupError('');
    setWorkflow('loading');

    try {
      const dbPatient = await getPatientByIdentifier(trimmed);
      if (dbPatient) {
        setPatientLookupMatched(true);
        setFormData({
          ...initialForm,
          patientName: dbPatient.patientName,
          hn: dbPatient.hn,
          cid: dbPatient.cid || trimmed,
          age: dbPatient.age?.toString() || '',
          gender: dbPatient.gender || '',
        });
      } else {
        const mockPatient = MOCK_PATIENTS[trimmed];
        if (mockPatient) {
          setPatientLookupMatched(true);
          setFormData({ ...initialForm, ...mockPatient, cid: trimmed });
        } else {
          setPatientLookupMatched(false);
          setFormData({ ...initialForm, cid: trimmed });
        }
      }
      setWorkflow('review');
    } catch (error) {
      console.error('[NewRequest] lookup failed', error);
      setPatientLookupMatched(false);
      setLookupError('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้ในขณะนี้');
      setWorkflow('id-entry');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const newId = await addRequest({
        patientName: formData.patientName,
        hospital: formData.hospital || 'Source Hospital',
        priority: formData.urgency,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        reason: formData.complaint
      });
      localStorage.removeItem('consultation_draft');
      navigate('/request-submitted?caseId=' + newId);
    } catch (error) {
      console.error('[NewRequest] submit failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const patientFound = workflow === 'review' && patientLookupMatched;
  const patientNotFound = workflow === 'review' && !patientLookupMatched;

  const StepIndicator = () => (
    <div className={styles['cid-steps']}>
      {['กรอก ID', 'ดึงข้อมูล', 'ตรวจสอบ', 'ส่งคำขอ'].map((label, i) => {
        const stepNum = i + 1;
        const currentStep = workflow === 'id-entry' ? 1 : workflow === 'loading' ? 2 : 3;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={label} className={cx('step-item', active && 'active', done && 'done')}>
            <div className={styles['step-circle']}>
              {done ? <CheckCircle2 size={14} /> : stepNum}
            </div>
            <span className={styles['step-label']}>{label}</span>
            {i < 3 && <ChevronRight size={14} className={styles['step-arrow']} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <Layout>
      <div className={styles['new-request-container']}>
        {showDraftBanner && (
          <div className={styles['draft-banner']}>
            <div className={styles['icon-bg']}><RotateCcw size={18} color="#2563eb" /></div>
            <div className={styles['draft-info']}>คุณมีแบบร่างที่บันทึกไว้ล่าสุด ต้องการกู้คืนข้อมูลหรือไม่?</div>
            <div className={styles['draft-actions']}>
              <button className={styles['btn-restore-sm']} onClick={handleRestoreDraft}>กู้คืนข้อมูล</button>
              <button className={styles['btn-discard-sm']} onClick={handleDiscardDraft}>ละทิ้ง</button>
            </div>
          </div>
        )}

        <div className={styles['nr-header']}>
          <h1>New Consultation Request</h1>
          <p>ส่งต่อข้อมูลคนไข้เพื่อรับการปรึกษาจากแพทย์ผู้เชี่ยวชาญแบบเรียลไทม์</p>
        </div>

        <StepIndicator />

        {workflow === 'id-entry' && (
          <div className={styles['cid-lookup-step']}>
            <div className={styles['cid-lookup-card']}>
              <div className={styles['cid-lookup-icon']}><IdCard size={36} /></div>
              <h2>ค้นหาผู้ป่วยจากเลขประจำตัว</h2>
              <p>กรอกเลขบัตรประชาชน (13 หลัก) หรือหมายเลข Passport</p>

              <div className={cx('cid-input-wrap', lookupError && 'has-error')}>
                <Search size={20} className={styles['cid-search-icon']} />
                <input
                  type="text"
                  className={styles['cid-input-large']}
                  placeholder="เลข CID (1234567890123) หรือ Passport (A12345678)"
                  value={cidInput}
                  maxLength={20}
                  onChange={(e) => {
                    setCidInput(e.target.value.toUpperCase());
                    setLookupError('');
                    setPatientLookupMatched(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                />
              </div>

              {lookupError && (
                <div className={styles['cid-error']}>
                  <AlertCircle size={16} />
                  {lookupError}
                </div>
              )}

              <button className={styles['btn-cid-lookup']} onClick={handleLookup}>
                <Search size={18} /> ค้นหาข้อมูลผู้ป่วย
              </button>

              <p className={styles['cid-hint']}>
                ระบบจะค้นจากฐานข้อมูลจริงก่อน และ fallback เป็นตัวอย่างทดสอบเช่น <code>1234567890123</code>, <code>9876543210987</code>, <code>A12345678</code>
              </p>
            </div>
          </div>
        )}

        {workflow === 'loading' && (
          <div className={styles['cid-lookup-step']}>
            <div className={styles['lookup-loading-card']}>
              <Loader2 size={48} className={styles['spin-icon']} />
              <h2>กำลังดึงข้อมูลผู้ป่วย…</h2>
              <p>กำลังเชื่อมต่อฐานข้อมูลและตรวจสอบเลข <code>{cidInput}</code></p>
              <div className={styles['lookup-progress-bar']}>
                <div className={styles['lookup-progress-fill']} />
              </div>
            </div>
          </div>
        )}

        {workflow === 'review' && (
          <>
            {patientFound && (
              <div className={cx('review-banner', 'success')}>
                <CheckCircle2 size={20} />
                <div>
                  <strong>ข้อมูลผ่านการตรวจสอบโดยระบบ</strong>
                  <span>ข้อมูลผู้ป่วยถูก Auto-fill มาจากฐานข้อมูล — กรุณาตรวจสอบความถูกต้องก่อน Submit</span>
                </div>
                <button className={styles['btn-change-cid']} onClick={() => { setWorkflow('id-entry'); setCidInput(''); setPatientLookupMatched(false); }}>
                  เปลี่ยน CID
                </button>
              </div>
            )}
            {patientNotFound && (
              <div className={cx('review-banner', 'warning')}>
                <AlertCircle size={20} />
                <div>
                  <strong>ไม่พบข้อมูลในฐานข้อมูล</strong>
                  <span>CID: <code>{cidInput}</code> — กรุณากรอกข้อมูลผู้ป่วยด้วยตนเอง</span>
                </div>
                <button className={styles['btn-change-cid']} onClick={() => { setWorkflow('id-entry'); setCidInput(''); setPatientLookupMatched(false); }}>
                  เปลี่ยน CID
                </button>
              </div>
            )}

            <form className={styles['nr-grid']} onSubmit={handleSubmit}>
              <div className={styles['nr-form-sections']}>
                <section className={styles['nr-card']}>
                  <div className={styles['nr-card-title']}>
                    <div className={styles['icon-bg']}><User size={18} /></div>
                    <h2>Patient Information</h2>
                  </div>
                  <div className={styles['nr-row']}>
                    <div className={styles['nr-group']}>
                      <label>เลขประจำตัว (CID / Passport)</label>
                      <input type="text" value={formData.cid} readOnly className={styles['input-readonly']} />
                    </div>
                    <div className={styles['nr-group']}>
                      <label>Hospital Number (HN)</label>
                      <input type="text" placeholder="HN-000000" value={formData.hn} onChange={(e) => handleInputChange('hn', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles['nr-row']}>
                    <div className={styles['nr-group']}>
                      <label>Patient Full Name</label>
                      <input type="text" placeholder="ชื่อ-นามสกุล ผู้ป่วย" value={formData.patientName} onChange={(e) => handleInputChange('patientName', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles['nr-row']}>
                    <div className={styles['nr-group']}>
                      <label>Age</label>
                      <input type="number" placeholder="ปี" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} />
                    </div>
                    <div className={styles['nr-group']}>
                      <label>Gender</label>
                      <select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className={styles['nr-card']}>
                  <div className={styles['nr-card-title']}>
                    <div className={styles['icon-bg']}><Activity size={18} /></div>
                    <h2>Clinical Presentation</h2>
                  </div>
                  <div className={cx('nr-group', 'spaced-group')}>
                    <label>Primary Complaint &amp; Symptoms</label>
                    <textarea rows={4} placeholder="รายละเอียดอาการเบื้องต้นและประวัติการเจ็บป่วย..." value={formData.complaint} onChange={(e) => handleInputChange('complaint', e.target.value)} />
                  </div>
                  <div className={styles['nr-row']}>
                    <div className={styles['nr-group']}>
                      <label>BP (mmHg)</label>
                      <input type="text" placeholder="120/80" value={formData.vitals.bp} onChange={(e) => handleInputChange('vitals.bp', e.target.value)} />
                    </div>
                    <div className={styles['nr-group']}>
                      <label>HR (bpm)</label>
                      <input type="text" placeholder="72" value={formData.vitals.hr} onChange={(e) => handleInputChange('vitals.hr', e.target.value)} />
                    </div>
                    <div className={styles['nr-group']}>
                      <label>Temp (°C)</label>
                      <input type="text" placeholder="36.5" value={formData.vitals.temp} onChange={(e) => handleInputChange('vitals.temp', e.target.value)} />
                    </div>
                  </div>
                </section>

                <section className={styles['nr-card']}>
                  <div className={styles['nr-card-title']}>
                    <div className={styles['icon-bg']}><Hospital size={18} /></div>
                    <h2>Consultation Specifics</h2>
                  </div>
                  <div className={styles['nr-row']}>
                    <div className={styles['nr-group']}>
                      <label>Target Hospital</label>
                      <select value={formData.hospital} onChange={(e) => handleInputChange('hospital', e.target.value)}>
                        <option value="">Select Hospital</option>
                        <option>โรงพยาบาลพุทธชินราช พิษณุโลก</option>
                        <option>โรงพยาบาลวังทอง</option>
                        <option>โรงพยาบาลวัดโบสถ์</option>
                        <option>โรงพยาบาลพรหมพิราม</option>
                        <option>โรงพยาบาลบางระกำ</option>
                        <option>โรงพยาบาลบางกระทุ่ม</option>
                        <option>โรงพยาบาลเนินมะปราง</option>
                        <option>โรงพยาบาลสมเด็จพระยุพราชนครไทย</option>
                        <option>โรงพยาบาลชาติตระการ</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className={styles['nr-card']}>
                  <div className={styles['nr-card-title']}>
                    <div className={styles['icon-bg']}><FileText size={18} /></div>
                    <h2>Attachments &amp; Diagnostics</h2>
                  </div>
                  <div className={styles['nr-upload-zone']}>
                    <div className={styles['nr-upload-icon']}><UploadCloud size={24} /></div>
                    <h3>Click or drag files here</h3>
                    <p>Supports Imaging (DICOM), PDF, and Medical Reports (Max 50MB)</p>
                  </div>
                </section>
              </div>

              <aside className={styles['nr-sidebar']}>
                <div className={styles['nr-summary-card']}>
                  <div className={styles['nr-summary-title']}>
                    <ShieldCheck size={20} />
                    Submission Secure
                  </div>
                  <p className={styles['nr-summary-desc']}>
                    คำขอของคุณจะถูกเข้ารหัสระดับสูงสุด (256-bit AES) และส่งตรงไปยังแผนกที่เกี่ยวข้องทันที
                  </p>

                  <div className={styles['nr-urgency-list']}>
                    {([
                      { id: 'IMMEDIATE', label: '1. Immediate', desc: 'Life-threatening', time: 'Stat' },
                      { id: 'EMERGENCY', label: '2. Emergency', desc: 'High risk', time: '< 15m' },
                      { id: 'URGENT', label: '3. Urgency', desc: 'Serious', time: '< 60m' },
                      { id: 'SEMI-URGENT', label: '4. Semi-urgency', desc: 'Stable', time: '< 2h' },
                      { id: 'NON-URGENT', label: '5. Non-urgency', desc: 'Routine', time: '2-4h' }
                    ] as const).map((level) => (
                      <div
                        key={level.id}
                        className={cx('nr-urgency-item', `level-${level.id.toLowerCase()}`, formData.urgency === level.id && 'selected')}
                        onClick={() => handleInputChange('urgency', level.id)}
                      >
                        <div className={styles['nr-urgency-dot']} />
                        <div className={styles['nr-urgency-content']}>
                          <span className={styles['nr-urgency-label']}>{level.label}</span>
                          <p className={styles['nr-urgency-desc']}>{level.desc}</p>
                        </div>
                        <span className={styles['nr-urgency-time']}>{level.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles['nr-actions']}>
                    <button type="submit" className={styles['btn-submit-large']} disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 size={18} className={styles['spin-icon']} /> Submitting...</> : <><Send size={18} /> Submit Request</>}
                    </button>
                    <button type="button" className={styles['btn-draft-outline']} onClick={handleSaveDraft} disabled={isSaving || isSubmitting}>
                      {isSaving ? 'Saving...' : <><Save size={16} /> Save as Draft</>}
                    </button>
                    <button type="button" className={styles['btn-cancel-flat']} onClick={() => navigate('/dashboard')}>
                      <X size={16} /> Cancel Request
                    </button>
                  </div>
                </div>

                <div className={`${styles['nr-card']} ${styles['system-status-card']}`}>
                  <div className={styles['nr-group']}>
                    <label className={styles['status-label']}>System Status</label>
                    <div className={styles['status-row']}>
                      <div className={styles['status-dot']} />
                      <span className={styles['status-text']}>Encryption Active</span>
                    </div>
                  </div>
                </div>
              </aside>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}

export default NewRequest;
