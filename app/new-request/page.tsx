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
import './style.css';

interface RequestForm {
  patientName: string;
  hn: string;
  cid: string;
  age: string;
  gender: string;
  specialty: string;
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
  specialty: '',
  hospital: '',
  complaint: '',
  vitals: { bp: '', hr: '', temp: '', rr: '' },
  urgency: 'URGENT',
};

// ─── Mock Patient Database ────────────────────────────────────────────────────
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
  'A12345678':     { patientName: 'John Smith (Passport)', hn: 'HN-400001', age: '45', gender: 'male' },
  'B98765432':     { patientName: 'Jane Doe (Passport)', hn: 'HN-400002', age: '38', gender: 'female' },
};

type Workflow = 'id-entry' | 'loading' | 'review';

function NewRequest() {
  const router = useRouter();
  const navigate = router.push;
  const { addRequest } = useApp();

  const [workflow, setWorkflow] = useState<Workflow>('id-entry');
  const [cidInput, setCidInput] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [formData, setFormData] = useState<RequestForm>(initialForm);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('consultation_draft');
    if (savedDraft) setShowDraftBanner(true);
  }, []);

  // Auto-save logic (only when in review step)
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
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof RequestForm] as Record<string, string>), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('consultation_draft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setFormData(draft);
      setCidInput(draft.cid || '');
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

  const handleLookup = () => {
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

    setTimeout(() => {
      const found = MOCK_PATIENTS[trimmed];
      if (found) {
        setFormData({ 
          ...initialForm, 
          ...found, 
          cid: trimmed 
        });
      } else {
        // Not found — still let the user fill in manually
        setFormData({ ...initialForm, cid: trimmed });
      }
      setWorkflow('review');
    }, 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addRequest({
      patientName: formData.patientName,
      hospital: formData.hospital || 'Source Hospital',
      priority: formData.urgency,
      specialty: formData.specialty,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      reason: formData.complaint
    });
    localStorage.removeItem('consultation_draft');
    navigate('/request-submitted?caseId=' + newId);
  };

  const patientFound = workflow === 'review' && !!MOCK_PATIENTS[cidInput.trim()];
  const patientNotFound = workflow === 'review' && !MOCK_PATIENTS[cidInput.trim()];

  // ── Step Indicator ─────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="cid-steps">
      {['กรอก ID', 'ดึงข้อมูล', 'ตรวจสอบ', 'ส่งคำขอ'].map((label, i) => {
        const stepNum = i + 1;
        const currentStep = workflow === 'id-entry' ? 1 : workflow === 'loading' ? 2 : 3;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={label} className={`step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
            <div className="step-circle">
              {done ? <CheckCircle2 size={14} /> : stepNum}
            </div>
            <span className="step-label">{label}</span>
            {i < 3 && <ChevronRight size={14} className="step-arrow" />}
          </div>
        );
      })}
    </div>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="new-request-container">
        {showDraftBanner && (
          <div className="draft-banner">
            <div className="icon-bg"><RotateCcw size={18} color="#2563eb" /></div>
            <div className="draft-info">คุณมีแบบร่างที่บันทึกไว้ล่าสุด ต้องการกู้คืนข้อมูลหรือไม่?</div>
            <div className="draft-actions">
              <button className="btn-restore-sm" onClick={handleRestoreDraft}>กู้คืนข้อมูล</button>
              <button className="btn-discard-sm" onClick={handleDiscardDraft}>ละทิ้ง</button>
            </div>
          </div>
        )}

        <div className="nr-header">
          <h1>New Consultation Request</h1>
          <p>ส่งต่อข้อมูลคนไข้เพื่อรับการปรึกษาจากแพทย์ผู้เชี่ยวชาญแบบเรียลไทม์</p>
        </div>

        <StepIndicator />

        {/* ─── STEP 1: ID Entry ─────────────────────────────────────────── */}
        {workflow === 'id-entry' && (
          <div className="cid-lookup-step">
            <div className="cid-lookup-card">
              <div className="cid-lookup-icon"><IdCard size={36} /></div>
              <h2>ค้นหาผู้ป่วยจากเลขประจำตัว</h2>
              <p>กรอกเลขบัตรประชาชน (13 หลัก) หรือหมายเลข Passport</p>

              <div className={`cid-input-wrap ${lookupError ? 'has-error' : ''}`}>
                <Search size={20} className="cid-search-icon" />
                <input
                  type="text"
                  className="cid-input-large"
                  placeholder="เลข CID (1234567890123) หรือ Passport (A12345678)"
                  value={cidInput}
                  maxLength={20}
                  onChange={e => {
                    setCidInput(e.target.value.toUpperCase());
                    setLookupError('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                />
              </div>

              {lookupError && (
                <div className="cid-error">
                  <AlertCircle size={16} />
                  {lookupError}
                </div>
              )}

              <button className="btn-cid-lookup" onClick={handleLookup}>
                <Search size={18} /> ค้นหาข้อมูลผู้ป่วย
              </button>

              <p className="cid-hint">
                ตัวอย่างใน Mock Database: <code>1234567890123</code>, <code>9876543210987</code>, <code>A12345678</code>
              </p>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Loading ──────────────────────────────────────────── */}
        {workflow === 'loading' && (
          <div className="cid-lookup-step">
            <div className="lookup-loading-card">
              <Loader2 size={48} className="spin-icon" />
              <h2>กำลังดึงข้อมูลผู้ป่วย…</h2>
              <p>กำลังเชื่อมต่อฐานข้อมูลและตรวจสอบเลข <code>{cidInput}</code></p>
              <div className="lookup-progress-bar">
                <div className="lookup-progress-fill" />
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Review Form ─────────────────────────────────────── */}
        {workflow === 'review' && (
          <>
            {patientFound && (
              <div className="review-banner success">
                <CheckCircle2 size={20} />
                <div>
                  <strong>ข้อมูลผ่านการตรวจสอบโดยระบบ</strong>
                  <span>ข้อมูลผู้ป่วยถูก Auto-fill มาจากฐานข้อมูล — กรุณาตรวจสอบความถูกต้องก่อน Submit</span>
                </div>
                <button className="btn-change-cid" onClick={() => { setWorkflow('id-entry'); setCidInput(''); }}>
                  เปลี่ยน CID
                </button>
              </div>
            )}
            {patientNotFound && (
              <div className="review-banner warning">
                <AlertCircle size={20} />
                <div>
                  <strong>ไม่พบข้อมูลในฐานข้อมูล</strong>
                  <span>CID: <code>{cidInput}</code> — กรุณากรอกข้อมูลผู้ป่วยด้วยตนเอง</span>
                </div>
                <button className="btn-change-cid" onClick={() => { setWorkflow('id-entry'); setCidInput(''); }}>
                  ลองใหม่
                </button>
              </div>
            )}

            <form className="nr-grid" onSubmit={handleSubmit}>
              <div className="nr-form-sections">
                {/* Section 1: Patient Information */}
                <section className="nr-card">
                  <div className="nr-card-title">
                    <div className="icon-bg"><User size={18} /></div>
                    <h2>Patient Information</h2>
                  </div>
                  <div className="nr-row">
                    <div className="nr-group">
                      <label>เลขประจำตัว (CID / Passport)</label>
                      <input type="text" value={formData.cid} readOnly className="input-readonly" />
                    </div>
                    <div className="nr-group">
                      <label>Hospital Number (HN)</label>
                      <input 
                        type="text" 
                        placeholder="HN-000000"
                        value={formData.hn}
                        onChange={e => handleInputChange('hn', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="nr-row">
                    <div className="nr-group">
                      <label>Patient Full Name</label>
                      <input 
                        type="text" 
                        placeholder="ชื่อ-นามสกุล ผู้ป่วย"
                        value={formData.patientName}
                        onChange={e => handleInputChange('patientName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="nr-row">
                    <div className="nr-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        placeholder="ปี"
                        value={formData.age}
                        onChange={e => handleInputChange('age', e.target.value)}
                      />
                    </div>
                    <div className="nr-group">
                      <label>Gender</label>
                      <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Section 2: Clinical Details */}
                <section className="nr-card">
                  <div className="nr-card-title">
                    <div className="icon-bg"><Activity size={18} /></div>
                    <h2>Clinical Presentation</h2>
                  </div>
                  <div className="nr-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Primary Complaint &amp; Symptoms</label>
                    <textarea 
                      rows={4} 
                      placeholder="รายละเอียดอาการเบื้องต้นและประวัติการเจ็บป่วย..."
                      value={formData.complaint}
                      onChange={e => handleInputChange('complaint', e.target.value)}
                    />
                  </div>
                  <div className="nr-row">
                    <div className="nr-group">
                      <label>BP (mmHg)</label>
                      <input type="text" placeholder="120/80" value={formData.vitals.bp} onChange={e => handleInputChange('vitals.bp', e.target.value)} />
                    </div>
                    <div className="nr-group">
                      <label>HR (bpm)</label>
                      <input type="text" placeholder="72" value={formData.vitals.hr} onChange={e => handleInputChange('vitals.hr', e.target.value)} />
                    </div>
                    <div className="nr-group">
                      <label>Temp (°C)</label>
                      <input type="text" placeholder="36.5" value={formData.vitals.temp} onChange={e => handleInputChange('vitals.temp', e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* Section 3: Consultation Specifics */}
                <section className="nr-card">
                  <div className="nr-card-title">
                    <div className="icon-bg"><Hospital size={18} /></div>
                    <h2>Consultation Specifics</h2>
                  </div>
                  <div className="nr-row">
                    <div className="nr-group">
                      <label>Requested Specialty</label>
                      <select value={formData.specialty} onChange={e => handleInputChange('specialty', e.target.value)}>
                        <option value="">Select Specialty</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Internal Medicine">Internal Medicine</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Oncology">Oncology</option>
                        <option value="Emergency Medicine">Emergency Medicine</option>
                        <option value="General Surgery">General Surgery</option>
                      </select>
                    </div>
                    <div className="nr-group">
                      <label>Target Hospital</label>
                      <select value={formData.hospital} onChange={e => handleInputChange('hospital', e.target.value)}>
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

                {/* Section 4: Attachments */}
                <section className="nr-card">
                  <div className="nr-card-title">
                    <div className="icon-bg"><FileText size={18} /></div>
                    <h2>Attachments &amp; Diagnostics</h2>
                  </div>
                  <div className="nr-upload-zone">
                    <div className="nr-upload-icon"><UploadCloud size={24} /></div>
                    <h3>Click or drag files here</h3>
                    <p>Supports Imaging (DICOM), PDF, and Medical Reports (Max 50MB)</p>
                  </div>
                </section>
              </div>

              <aside className="nr-sidebar">
                <div className="nr-summary-card">
                  <div className="nr-summary-title">
                    <ShieldCheck size={20} />
                    Submission Secure
                  </div>
                  <p className="nr-summary-desc">
                    คำขอของคุณจะถูกเข้ารหัสระดับสูงสุด (256-bit AES) และส่งตรงไปยังแผนกที่เกี่ยวข้องทันที
                  </p>

                  <div className="nr-urgency-list">
                    {([
                      { id: 'IMMEDIATE', label: '1. Immediate', desc: 'Life-threatening', time: 'Stat' },
                      { id: 'EMERGENCY', label: '2. Emergency', desc: 'High risk', time: '< 15m' },
                      { id: 'URGENT', label: '3. Urgency', desc: 'Serious', time: '< 60m' },
                      { id: 'SEMI-URGENT', label: '4. Semi-urgency', desc: 'Stable', time: '< 2h' },
                      { id: 'NON-URGENT', label: '5. Non-urgency', desc: 'Routine', time: '2-4h' }
                    ] as const).map((level) => (
                      <div 
                        key={level.id}
                        className={`nr-urgency-item level-${level.id.toLowerCase()} ${formData.urgency === level.id ? 'selected' : ''}`}
                        onClick={() => handleInputChange('urgency', level.id)}
                      >
                        <div className="nr-urgency-dot" />
                        <div className="nr-urgency-content">
                          <span className="nr-urgency-label">{level.label}</span>
                          <p className="nr-urgency-desc">{level.desc}</p>
                        </div>
                        <span className="nr-urgency-time">{level.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="nr-actions">
                    <button type="submit" className="btn-submit-large">
                      <Send size={18} /> Submit Request
                    </button>
                    <button 
                      type="button" 
                      className="btn-draft-outline"
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : <><Save size={16} /> Save as Draft</>}
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancel-flat"
                      onClick={() => navigate('/dashboard')}
                    >
                      <X size={16} /> Cancel Request
                    </button>
                  </div>
                </div>

                <div className="nr-card" style={{ padding: '1.25rem' }}>
                  <div className="nr-group">
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>System Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Encryption Active</span>
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
