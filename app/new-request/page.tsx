'use client';
// src/pages/NewRequest/index.tsx
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
  UploadCloud
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import './style.css';

interface RequestForm {
  patientName: string;
  hn: string;
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
  age: '',
  gender: '',
  specialty: '',
  hospital: '',
  complaint: '',
  vitals: {
    bp: '',
    hr: '',
    temp: '',
    rr: '',
  },
  urgency: 'URGENT',
};

function NewRequest() {
  const router = useRouter();
  const navigate = router.push;
  const { addRequest } = useApp();
  const [formData, setFormData] = useState<RequestForm>(initialForm);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('consultation_draft');
    if (savedDraft) {
      setShowDraftBanner(true);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify(initialForm)) {
        localStorage.setItem('consultation_draft', JSON.stringify(formData));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RequestForm] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('consultation_draft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('consultation_draft');
    setShowDraftBanner(false);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    localStorage.setItem('consultation_draft', JSON.stringify(formData));
    setTimeout(() => {
      setIsSaving(false);
      // Optional: Add toast notification
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add to global state
    const newId = addRequest({
      patientName: formData.patientName,
      hospital: formData.hospital || 'Source Hospital',
      priority: formData.urgency,
      specialty: formData.specialty,
      age: parseInt(formData.age),
      gender: formData.gender,
      reason: formData.complaint
    });

    localStorage.removeItem('consultation_draft');
    
    // Pass the actual sequential ID to the success page
    navigate('/request-submitted?caseId=' + newId);
  };

  return (
    <Layout>
      <div className="new-request-container">
        {showDraftBanner && (
          <div className="draft-banner">
            <div className="icon-bg">
              <RotateCcw size={18} color="#2563eb" />
            </div>
            <div className="draft-info">
              คุณมีแบบร่างที่บันทึกไว้ล่าสุด ต้องการกู้คืนข้อมูลหรือไม่?
            </div>
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
                  <label>Patient Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                  />
                </div>
                <div className="nr-group">
                  <label>Hospital Number (HN)</label>
                  <input 
                    type="text" 
                    placeholder="HN-000000"
                    value={formData.hn}
                    onChange={(e) => handleInputChange('hn', e.target.value)}
                  />
                </div>
              </div>
              <div className="nr-row">
                <div className="nr-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    placeholder="Years"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
                <div className="nr-group">
                  <label>Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
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
                <label>Primary Complaint & Symptoms</label>
                <textarea 
                  rows={4} 
                  placeholder="รายละเอียดอาการเบื้องต้นและประวัติการเจ็บป่วย..."
                  value={formData.complaint}
                  onChange={(e) => handleInputChange('complaint', e.target.value)}
                ></textarea>
              </div>
              <div className="nr-row">
                <div className="nr-group">
                  <label>BP (mmHg)</label>
                  <input 
                    type="text" 
                    placeholder="120/80"
                    value={formData.vitals.bp}
                    onChange={(e) => handleInputChange('vitals.bp', e.target.value)}
                  />
                </div>
                <div className="nr-group">
                  <label>HR (bpm)</label>
                  <input 
                    type="text" 
                    placeholder="72"
                    value={formData.vitals.hr}
                    onChange={(e) => handleInputChange('vitals.hr', e.target.value)}
                  />
                </div>
                <div className="nr-group">
                  <label>Temp (°C)</label>
                  <input 
                    type="text" 
                    placeholder="36.5"
                    value={formData.vitals.temp}
                    onChange={(e) => handleInputChange('vitals.temp', e.target.value)}
                  />
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
                  <select
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                  >
                    <option value="">Select Specialty</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                  </select>
                </div>
                <div className="nr-group">
                  <label>Target Hospital</label>
                  <select
                    value={formData.hospital}
                    onChange={(e) => handleInputChange('hospital', e.target.value)}
                  >
                    <option value="">Select Hospital</option>
                    <option value="Phitsanulok Hospital">Phitsanulok Hospital</option>
                    <option value="Buddhachinaraj Hospital">Buddhachinaraj Hospital</option>
                    <option value="Naresuan University Hospital">Naresuan University Hospital</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 4: Attachments */}
            <section className="nr-card">
              <div className="nr-card-title">
                <div className="icon-bg"><FileText size={18} /></div>
                <h2>Attachments & Diagnostics</h2>
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
                    <div className="nr-urgency-dot"></div>
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
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Encryption Active</span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </Layout>
  );
}

export default NewRequest;

