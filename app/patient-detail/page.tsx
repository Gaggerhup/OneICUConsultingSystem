'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  UploadCloud,
  Edit3,
  CheckCircle,
  Activity,
  Pill,
  AlertTriangle,
  ImageIcon,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  ChevronRight,
  FlaskConical,
  Stethoscope,
  X,
  Paperclip,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Clock,
  ShieldAlert,
  Plus,
  BriefcaseMedical,
  CornerDownRight,
  MessageCircle,
  Syringe,
  Download,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';

// Import Server Actions
import { getCaseById } from '@/actions/cases';
import { getVitals, getLabs, getMedications } from '@/actions/clinical';
import { getCaseNotes, addCaseNote as dbAddCaseNote, getCaseMessages, getCaseTeam } from '@/actions/collaboration';
import { getPatientByCaseId, getCaseFiles, uploadCaseFile } from '@/actions/patients';

import styles from './style.module.css';

// ─── Types ──────────────────────────────────────────────────────────────────
interface LabRow {
  name: string;
  result: string;
  unit: string;
  ref: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

interface MedRow {
  name: string;
  dose: string;
  freq: string;
  route: string;
  start: string;
  category: string;
}

interface TeamMember {
  name: string;
  role: string;
  color: string;
  online: boolean;
}

interface FileRecord {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  mimeType: string | null;
  fileUrl: string | null;
  sizeKb: number | null;
  description: string | null;
  isPreviewable: boolean;
  createdAt?: string | Date;
}

interface PatientRecord {
  name: string; hn: string; an: string; cid: string;
  age: number; gender: string; bloodType: string; phone: string; dob: string;
  district: string; province: string;
  conditions: string[];
  allergies: string[];
  currentSymptoms: string;
  initialDiagnosis: string;
  vitals: { bp: string; hr: number; temp: number; rr: number; spo2: number; gcs: string };
  labs: LabRow[];
  medications: MedRow[];
  clinicalNotes: string;
  team: TeamMember[];
  files: FileRecord[];
}

// Clinical records are now fetched from the database via Server Actions

// ─── Helper Functions ───────────────────────────────────────────────────────
function getStatusColor(s: string) {
  if (s === 'critical') return '#ef4444';
  if (s === 'high') return '#f97316';
  if (s === 'low') return '#3b82f6';
  return '#10b981';
}
function getStatusLabel(s: string) {
  if (s === 'critical') return '▲ CRITICAL';
  if (s === 'high') return '▲ HIGH';
  if (s === 'low') return '▼ LOW';
  return '✓ Normal';
}
function getTrendIcon(s: string) {
  if (s === 'high' || s === 'critical') return <TrendingUp size={13} />;
  if (s === 'low') return <TrendingDown size={13} />;
  return <Minus size={13} />;
}
const urgencyPalette: Record<string, { bg: string; text: string; label: string }> = {
  'IMMEDIATE': { bg: '#fef2f2', text: '#ef4444', label: '1. Immediate Life-Threatening' },
  'EMERGENCY': { bg: '#fff7ed', text: '#f97316', label: '2. Emergency' },
  'URGENT':    { bg: '#fefce8', text: '#ca8a04', label: '3. Urgent' },
  'SEMI-URGENT': { bg: '#f0fdf4', text: '#16a34a', label: '4. Semi-Urgent' },
  'NON-URGENT': { bg: '#eff6ff', text: '#2563eb', label: '5. Non-Urgent' },
};

type Tab = 'overview' | 'labs' | 'medications' | 'imaging';
type FileCategoryFilter = 'all' | 'imaging' | 'lab' | 'report' | 'medication' | 'note' | 'other';

const fileCategoryOptions: Array<{ id: FileCategoryFilter; label: string }> = [
  { id: 'all', label: 'All Files' },
  { id: 'imaging', label: 'Imaging' },
  { id: 'lab', label: 'Lab' },
  { id: 'report', label: 'Report' },
  { id: 'medication', label: 'Medication' },
  { id: 'note', label: 'Note' },
  { id: 'other', label: 'Other' },
];

// ─── Default fallback case data ─────────────────────────────────────────────
function buildFallback(selectedCase: any): PatientRecord {
  return {
    name: selectedCase?.patientName || 'Unknown Patient',
    hn: 'HN-N/A', an: 'AN-N/A',
    cid: selectedCase?.cid || 'N/A',
    age: selectedCase?.age || 0,
    gender: selectedCase?.gender || '—',
    bloodType: '—',
    phone: '—',
    dob: '—',
    district: '—',
    province: '—',
    conditions: ['No data available'],
    allergies: ['NKDA (No Known Drug Allergies)'],
    currentSymptoms: selectedCase?.reason || 'Reason not recorded',
    initialDiagnosis: 'Pending evaluation',
    vitals: { bp: '—', hr: 0, temp: 0.0, rr: 0, spo2: 0, gcs: '—' },
    labs: [],
    medications: [],
    clinicalNotes: '',
    team: [],
    files: []
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Skel({ h = 16, r = 8 }: { h?: number; r?: number }) {
  return <div className={styles['pd-skel']} style={{ height: h, borderRadius: r }} />;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function PatientDetail() {
  const router = useRouter();
  const { selectedCase, closeCase, showToast } = useApp();
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedFileCategory, setSelectedFileCategory] = useState<FileCategoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<'Discharge' | 'Referred' | 'Dead'>('Discharge');
  const [noteInput, setNoteInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activePanel, setActivePanel] = useState<'notes' | 'chat'>('notes');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState([
    { id: 1, author: 'Dr. Sarah Mitchell', role: 'General Surgeon', body: 'Recommended immediate laparoscopic appendectomy. Patient currently NPO.', time: '2h ago', color: '14b8a6' },
    { id: 2, author: 'Dr. James Wilson', role: 'Radiologist', body: 'CT abdomen confirms inflamed appendix, Ø 9mm. Mild periappendiceal fat stranding. No perforation.', time: '4h ago', color: '0ea5e9' }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Mitchell', text: 'Has the patient been prepped for surgery?', time: '14:15', isSelf: false, isSystem: false },
    { id: 2, sender: '', text: '🔔 Lab WBC result updated — 16.2 x10³/µL (CRITICAL)', time: '14:30', isSelf: false, isSystem: true },
    { id: 3, sender: 'You', text: 'Yes, prepped and NPO since 10 AM. OR scheduled for 16:00 today.', time: '14:35', isSelf: true, isSystem: false },
  ]);

  // cid-based data fetch from database
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!selectedCase) {
        setRecord(buildFallback(null));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      try {
        const caseId = selectedCase.id;
        
        // 1. Fetch Case details (extended clinical data)
        const dbCase = await getCaseById(caseId);
        
        // 2. Fetch Time-series Vitals (get latest)
        const dbVitals = await getVitals(caseId);
        const latestV = dbVitals[0]; // Desc order by createdAt
        
        // 3. Fetch Labs, Meds, Notes, Team, Messages, Patient, Files
        const [dbLabs, dbMeds, dbNotes, dbTeam, dbMsgs, dbPatient, dbFiles] = await Promise.all([
          getLabs(caseId),
          getMedications(caseId),
          getCaseNotes(caseId),
          getCaseTeam(caseId),
          getCaseMessages(caseId),
          getPatientByCaseId(caseId),
          getCaseFiles(caseId)
        ]);

        if (!isMounted) return;

        if (dbCase) {
          const birthDate = dbPatient?.birthDate ? new Date(dbPatient.birthDate) : null;
          setRecord({
            name: dbCase.patientName,
            hn: dbPatient?.hn || dbCase.hn || 'HN-N/A',
            an: dbCase.an || 'AN-N/A',
            cid: dbPatient?.cid || dbCase.cid || 'N/A',
            age: dbPatient?.age || dbCase.age || 0,
            gender: dbPatient?.gender || dbCase.gender || '—',
            bloodType: dbPatient?.bloodType || dbCase.bloodType || '—',
            phone: dbPatient?.phoneNumber || '—',
            dob: birthDate ? birthDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
            district: dbPatient?.district || '—',
            province: dbPatient?.province || '—',
            conditions: dbPatient?.conditions || dbCase.conditions || [],
            allergies: dbPatient?.allergies || dbCase.allergies || [],
            currentSymptoms: dbCase.currentSymptoms || '',
            initialDiagnosis: dbCase.initialDiagnosis || '',
            clinicalNotes: dbCase.clinicalNotes || '',
            vitals: {
              bp: latestV?.bp || '—',
              hr: latestV?.hr || 0,
              temp: latestV?.temp || 0.0,
              rr: latestV?.rr || 0,
              spo2: latestV?.spo2 || 0,
              gcs: latestV?.gcs || '—'
            },
            labs: dbLabs.map(l => ({ name: l.name, result: l.result, unit: l.unit, ref: l.refRange || '', status: l.status as any })),
            medications: dbMeds.map(m => ({ name: m.name, dose: m.dose, freq: m.freq, route: m.route, start: m.start || '', category: m.category || '' })),
            team: dbTeam.map(t => ({ name: 'Team Member', role: t.role, color: '64748b', online: false })), // Simplified mapping
            files: dbFiles.map(f => ({
              id: f.id,
              fileName: f.fileName,
              fileType: f.fileType,
              category: f.category,
              mimeType: f.mimeType,
              fileUrl: f.fileUrl,
              sizeKb: f.sizeKb,
              description: f.description,
              isPreviewable: f.isPreviewable,
              createdAt: f.createdAt
            }))
          });
          
          setNotes(dbNotes.map(n => ({
            id: Number(n.id) || Date.now(),
            author: n.authorName || 'Unknown',
            role: n.authorRole || 'Medical Staff',
            body: n.body,
            time: n.time || 'recently',
            color: n.authorColor || '64748b'
          })));
          
          setMessages(dbMsgs.map(m => ({
            id: Number(m.id) || Date.now(),
            sender: m.senderName || '',
            text: m.text,
            time: m.time || '',
            isSelf: m.isSelf || false,
            isSystem: m.isSystem || false
          })));
        } else {
          setRecord(buildFallback(selectedCase));
        }
      } catch (err) {
        console.error('[PatientDetail] Load failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedCase?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePanel]);

  const filteredFiles = record?.files.filter(file => selectedFileCategory === 'all' || file.category === selectedFileCategory) || [];

  const openFilePicker = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const openFilePreview = (file: FileRecord) => {
    if (!file.fileUrl) return;
    setPreviewFile(file);
  };

  const downloadFile = (file: FileRecord) => {
    if (!file.fileUrl || typeof window === 'undefined') return;
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedCase || !record) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadCaseFile({
        caseId: selectedCase.id,
        file,
        uploadedById: selectedCase.senderId || null,
        category: selectedFileCategory === 'all' ? 'other' : selectedFileCategory,
        description: `Uploaded from patient detail: ${file.name}`,
      });

      if (!uploaded) {
        showToast('Upload failed', 'error');
        return;
      }

      setRecord(prev => prev ? ({ ...prev, files: [uploaded as FileRecord, ...prev.files] }) : prev);
      const uploadedCategory = uploaded.category as FileCategoryFilter;
      setSelectedFileCategory(prev => prev === 'all' || prev === uploadedCategory ? prev : 'all');
      setActiveTab('imaging');
      showToast('File uploaded to case_files', 'success');
    } catch (err) {
      console.error('[PatientDetail] Upload failed:', err);
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostNote = async () => {
    if (!noteInput.trim() || !selectedCase) return;
    try {
      const newNote = {
        id: `note_${Date.now()}`,
        caseId: selectedCase.id,
        authorId: 's1', // Hardcoded for mockup, should be current user
        authorName: 'Dr. มนตรีวิฒน์',
        authorRole: 'Attending Physician',
        authorColor: '4318FF',
        body: noteInput,
        time: 'Just now'
      };
      await dbAddCaseNote(newNote);
      setNotes(prev => [{
        id: Date.now(),
        author: newNote.authorName,
        role: newNote.authorRole,
        body: newNote.body,
        time: 'Just now',
        color: newNote.authorColor
      }, ...prev]);
      setNoteInput('');
      showToast('Consult note posted to database', 'success');
    } catch (err) {
      showToast('Failed to post note', 'error');
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const m = { id: Date.now(), sender: 'You', text: chatInput, time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), isSelf: true, isSystem: false };
    setMessages(prev => [...prev, m]);
    setChatInput('');
  };

  const handleClose = () => {
    if (selectedCase) {
      closeCase(selectedCase.id, closeOutcome);
      setShowCloseModal(false);
      showToast(`Case closed — ${closeOutcome}`, 'success');
      router.push('/active-cases');
    }
  };

  const urg = urgencyPalette[selectedCase?.priority || 'URGENT'] || urgencyPalette['URGENT'];
  const accentColor = urg.text;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <Stethoscope size={15} /> },
    { id: 'labs', label: 'Labs', icon: <FlaskConical size={15} />, badge: record?.labs.filter(l => l.status !== 'normal').length.toString() },
    { id: 'medications', label: 'Medications', icon: <Pill size={15} /> },
    { id: 'imaging', label: 'Imaging', icon: <ImageIcon size={15} /> },
  ];

  return (
    <Layout>
      <div className={styles['pd-root']}>

        {/* ── TOP STRIP ─────────────────────────────────────────────────── */}
        <div className={styles['pd-topstrip']}>
          <div className={styles['pd-topstrip-left']}>
            <button className={styles['pd-btn-back']} onClick={() => router.back()}>
              <ArrowLeft size={15} /> Back
            </button>
            <span className={styles['pd-bc-sep']}><ChevronRight size={14} /></span>
            <span className={styles['pd-bc-page']}>Active Cases</span>
            <span className={styles['pd-bc-sep']}><ChevronRight size={14} /></span>
            <span className={styles['pd-bc-current']}>Case #{selectedCase?.id || '—'}</span>
          </div>
          <div className={styles['pd-topstrip-right']}>
            <div className={styles['pd-track-badge']}>
              <span className={styles['pd-track-dot']} />
              Active Consultation
            </div>
            <button className={styles['pd-icon-btn']} title="Update Diagnosis"><Edit3 size={16} /></button>
            <button className={styles['pd-icon-btn']} title="Upload Files" onClick={openFilePicker} disabled={isUploading}>
              <UploadCloud size={16} />
            </button>
            <button className={cx('pd-icon-btn', 'pd-icon-btn--danger')} onClick={() => setShowCloseModal(true)} title="Close Case">
              <CheckCircle size={16} /> Close Case
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className={styles['pd-file-input']}
          onChange={handleFileSelected}
          accept=".dcm,.dicom,.png,.jpg,.jpeg,.pdf,.csv,.txt,.doc,.docx,.rtf,.md,image/*,application/pdf,application/dicom,text/csv"
        />

        {/* ── HERO CARD ──────────────────────────────────────────────────── */}
        <div className={styles['pd-hero']} style={{ borderTopColor: accentColor }}>
          {isLoading ? (
            <div className={cx('pd-hero-body', 'pd-stack-gap-sm')}>
              <Skel h={50} r={14} />
              <Skel h={24} r={8} />
              <Skel h={20} r={6} />
            </div>
          ) : (
            <>
              <div className={styles['pd-hero-body']}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record?.name || '??')}&background=4318FF&color=fff&size=72&bold=true`}
                  className={styles['pd-hero-avatar']}
                  alt=""
                />
                <div className={styles['pd-hero-info']}>
                  <div className={styles['pd-hero-name-row']}>
                    <h1>{record?.name || '—'}</h1>
                    <span className={styles['pd-urg-badge']} style={{ background: urg.bg, color: urg.text }}>{urg.label}</span>
                  </div>
                  <div className={styles['pd-hero-subrow']}>
                    <span>{record?.age}y · {record?.gender} · {record?.bloodType}</span>
                    <span className={styles['pd-hero-dot']}>·</span>
                    <span className={styles['pd-hero-chip']}><User size={12} />CID: {record?.cid}</span>
                    <span className={styles['pd-hero-chip']}><BriefcaseMedical size={12} />HN: {record?.hn}</span>
                    <span className={styles['pd-hero-chip']}><FileText size={12} />AN: {record?.an}</span>
                  </div>
                </div>
              </div>
              <div className={styles['pd-vitals-row']}>
                <div className={cx('pd-vital-pill', 'pd-v-red')}><Heart size={14} /><span>{record?.vitals.hr || '—'}</span><small>HR bpm</small></div>
                <div className={cx('pd-vital-pill', 'pd-v-blue')}><Activity size={14} /><span>{record?.vitals.bp || '—'}</span><small>BP mmHg</small></div>
                <div className={cx('pd-vital-pill', 'pd-v-orange')}><Thermometer size={14} /><span>{record?.vitals.temp ? `${record.vitals.temp}°C` : '—'}</span><small>Temp</small></div>
                <div className={cx('pd-vital-pill', 'pd-v-teal')}><Wind size={14} /><span>{record?.vitals.rr || '—'}</span><small>RR /min</small></div>
                <div className={cx('pd-vital-pill', 'pd-v-green')}><Droplets size={14} /><span>{record?.vitals.spo2 ? `${record.vitals.spo2}%` : '—'}</span><small>SpO₂</small></div>
                <div className={cx('pd-vital-pill', 'pd-v-purple')}><BriefcaseMedical size={14} /><span>{record?.vitals.gcs || '—'}</span><small>GCS</small></div>
              </div>
            </>
          )}
        </div>

        {/* ── 3-COLUMN BODY ──────────────────────────────────────────────── */}
        <div className={styles['pd-cols']}>

          {/* ─ COL 1: LEFT SIDEBAR ──────────────────────────────────────── */}
          <aside className={styles['pd-col-l']}>
            {isLoading ? (
              <div className={cx('pd-card', 'pd-card-loading')}>
                {Array.from({ length: 6 }).map((_, i) => <Skel key={i} h={20} r={8} />)}
              </div>
            ) : (
              <>
                {/* Patient Info */}
                <div className={styles['pd-card']}>
                  <div className={styles['pd-card-title']}><User size={14} />PATIENT INFO</div>
                  <div className={styles['pd-info-grid']}>
                    <div className={styles['pd-info-row']}><span>Phone</span><strong>{record?.phone}</strong></div>
                    <div className={styles['pd-info-row']}><span>DOB</span><strong>{record?.dob}</strong></div>
                    <div className={styles['pd-info-row']}><span>Blood</span><strong>{record?.bloodType}</strong></div>
                    <div className={styles['pd-info-row']}><span>District</span><strong>{record?.district}</strong></div>
                    <div className={styles['pd-info-row']}><span>Province</span><strong>{record?.province}</strong></div>
                  </div>
                </div>

                {/* Allergies */}
                <div className={styles['pd-card']}>
                  <div className={cx('pd-card-title', 'pd-allergy-title')}><AlertTriangle size={14} />ALLERGIES</div>
                  <div className={styles['pd-allergy-wrap']}>
                    {record?.allergies.map((a, i) => (
                      <span key={i} className={styles['pd-allergy-tag']}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Medical History */}
                <div className={styles['pd-card']}>
                  <div className={styles['pd-card-title']}><ShieldAlert size={14} />MEDICAL HISTORY</div>
                  <div className={styles['pd-conditions-wrap']}>
                    {record?.conditions.map((c, i) => <span key={i} className={styles['pd-cond-tag']}>{c}</span>)}
                  </div>
                  <div className={styles['pd-label-spaced']}>
                    <div className={styles['pd-label']}>Current Symptoms</div>
                    <p className={styles['pd-symp-text']}>{record?.currentSymptoms}</p>
                  </div>
                  <div className={styles['pd-diag-box']}>
                    <div className={styles['pd-diag-label']}>INITIAL DIAGNOSIS</div>
                    <div className={styles['pd-diag-value']}>{record?.initialDiagnosis}</div>
                  </div>
                </div>

                {/* Consult Team */}
                <div className={styles['pd-card']}>
                  <div className={styles['pd-card-title']}><Stethoscope size={14} />CONSULT TEAM</div>
                  {record?.team.length === 0 ? (
                    <div className={styles['pd-empty-state-sm']}>No team assigned</div>
                  ) : (
                    <div className={styles['pd-team-list']}>
                      {record?.team.map((m, i) => (
                        <div key={i} className={styles['pd-team-member']}>
                          <div className={styles['pd-t-av-wrap']}>
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=${m.color}&color=fff&size=40`}
                              alt=""
                            />
                            <span className={cx('pd-online-dot', m.online ? 'online' : 'offline')} />
                          </div>
                          <div className={styles['pd-t-info']}>
                            <strong>{m.name}</strong>
                            <small>{m.role}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>

          {/* ─ COL 2: CENTER — CLINICAL DATA ─────────────────────────────── */}
          <main className={styles['pd-col-c']}>
            <div className={styles['pd-tabs-bar']}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={cx('pd-tab', activeTab === t.id && 'active')}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon}{t.label}
                  {t.badge && t.badge !== '0' && (
                    <span className={cx('pd-tab-badge', t.id === 'labs' ? 'pd-badge-labs' : 'pd-badge-default')}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className={styles['pd-tab-content']}>
              {isLoading ? (
                <div className={styles['pd-status-block']}>
                  <Skel h={180} r={14} />
                  <Skel h={120} r={14} />
                </div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className={styles['pd-fade-in']}>
                      <div className={styles['pd-section-title']}>CLINICAL STATUS</div>
                      <div className={styles['pd-status-grid']}>
                        <div className={styles['pd-s-card']}>
                          <div className={styles['pd-s-label']}>Neurological (GCS)</div>
                          <div className={styles['pd-s-value']}>{record?.vitals.gcs}</div>
                        </div>
                        <div className={styles['pd-s-card']}>
                          <div className={styles['pd-s-label']}>Respiratory</div>
                          <div className={styles['pd-s-value']}>{record?.vitals.rr} /min · SpO₂ {record?.vitals.spo2}%</div>
                        </div>
                        <div className={styles['pd-s-card']}>
                          <div className={styles['pd-s-label']}>Cardiac</div>
                          <div className={styles['pd-s-value']}>{record?.vitals.hr} bpm · {record?.vitals.bp} mmHg</div>
                        </div>
                        <div className={styles['pd-s-card']}>
                          <div className={styles['pd-s-label']}>Temperature</div>
                          <div className={cx('pd-s-value', record && record.vitals.temp > 37.5 && 'text-orange')}>{record?.vitals.temp}°C</div>
                        </div>
                      </div>

                      {record?.clinicalNotes && (
                        <>
                          <div className={cx('pd-section-title', 'pd-summary-title-spaced')}>CLINICAL SUMMARY</div>
                          <div className={styles['pd-clinical-note-box']}>{record.clinicalNotes}</div>
                        </>
                      )}

                      {record && record.labs.length > 0 && (
                        <>
                          <div className={cx('pd-section-title', 'pd-alert-title-spaced')}>CRITICAL ALERTS</div>
                          <div className={styles['pd-alerts-list']}>
                            {record.labs.filter(l => l.status === 'critical' || l.status === 'high' || l.status === 'low').map(l => (
                              <div key={l.name} className={styles['pd-alert-row']} style={{ borderLeftColor: getStatusColor(l.status) }}>
                                <div className={styles['pd-a-name']}>{l.name}</div>
                                <div className={styles['pd-a-result']} style={{ color: getStatusColor(l.status) }}>{l.result} {l.unit}</div>
                                <div className={styles['pd-a-status']} style={{ color: getStatusColor(l.status), background: `${getStatusColor(l.status)}12` }}>{getStatusLabel(l.status)}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* LAB RESULTS TAB */}
                  {activeTab === 'labs' && (
                    <div className={styles['pd-fade-in']}>
                      {record && record.labs.length === 0 ? (
                        <div className={styles['pd-empty-state']}>
                          <FlaskConical size={36} strokeWidth={1} />
                          <p>No lab results on file.</p>
                          <small>Results will appear here once processed.</small>
                        </div>
                      ) : (
                        <table className={styles['pd-lab-table']}>
                          <thead>
                            <tr>
                              <th>Component</th>
                              <th>Result</th>
                              <th>Reference</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record?.labs.map(l => (
                              <tr key={l.name} className={l.status !== 'normal' ? styles['pd-lab-row-alert'] : undefined}>
                                <td><strong>{l.name}</strong></td>
                                <td style={{ color: getStatusColor(l.status), fontWeight: 700 }}>
                                  {l.result} <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.7em' }}>{l.unit}</span>
                                </td>
                                <td className={styles['pd-lab-ref']}>{l.ref}</td>
                                <td>
                                  <span className={styles['pd-lab-status']} style={{ color: getStatusColor(l.status), background: `${getStatusColor(l.status)}15` }}>
                                    {getTrendIcon(l.status)} {getStatusLabel(l.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* MEDICATIONS TAB */}
                  {activeTab === 'medications' && (
                    <div className={styles['pd-fade-in']}>
                      {record && record.medications.length === 0 ? (
                        <div className={styles['pd-empty-state']}>
                          <Pill size={36} strokeWidth={1} />
                          <p>No medications recorded.</p>
                        </div>
                      ) : (
                        <div className={styles['pd-med-list']}>
                          {record?.medications.map((m, i) => (
                            <div key={i} className={styles['pd-med-card']}>
                              <div className={styles['pd-med-icon']}><Syringe size={18} /></div>
                              <div className={styles['pd-med-info']}>
                                <div className={styles['pd-med-name']}>{m.name} <span className={styles['pd-med-dose']}>{m.dose}</span></div>
                                <div className={styles['pd-med-meta']}>{m.freq} · via {m.route}</div>
                                <div className={styles['pd-med-category']}>{m.category}</div>
                              </div>
                              <div className={styles['pd-med-start']}><Clock size={12} />{m.start}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* IMAGING TAB */}
                  {activeTab === 'imaging' && (
                    <div className={styles['pd-fade-in']}>
                      <div className={styles['pd-file-toolbar']}>
                        <div>
                          <div className={cx('pd-section-title', 'pd-section-title-compact')}>FILE LIBRARY</div>
                          <div className={styles['pd-file-toolbar-subtitle']}>
                            {record?.files.length || 0} files stored in `case_files`
                          </div>
                        </div>
                        <div className={styles['pd-file-toolbar-actions']}>
                          <button className={styles['pd-file-upload-btn']} onClick={openFilePicker} disabled={isUploading}>
                            <UploadCloud size={14} />
                            {isUploading ? 'Uploading...' : 'Upload File'}
                          </button>
                        </div>
                      </div>

                      <div className={styles['pd-file-filterbar']}>
                        {fileCategoryOptions.map(option => {
                          const count = option.id === 'all'
                            ? record?.files.length || 0
                            : record?.files.filter(file => file.category === option.id).length || 0;
                          return (
                            <button
                              key={option.id}
                              className={cx('pd-file-filter', selectedFileCategory === option.id && 'active')}
                              onClick={() => setSelectedFileCategory(option.id)}
                            >
                              {option.label}
                              <span>{count}</span>
                            </button>
                          );
                        })}
                      </div>

                      {record && record.files.length === 0 ? (
                        <div className={styles['pd-empty-state']}>
                          <ImageIcon size={36} strokeWidth={1} />
                          <p>No imaging or attachment files on file.</p>
                          <small>Uploaded studies and reports will appear here.</small>
                        </div>
                      ) : filteredFiles.length === 0 ? (
                        <div className={styles['pd-empty-state']}>
                          <ImageIcon size={36} strokeWidth={1} />
                          <p>No files in this category.</p>
                          <small>Try another filter or upload a new file.</small>
                        </div>
                      ) : (
                        <div className={styles['pd-imaging-grid']}>
                          {filteredFiles.map((file, i) => {
                            const isImaging = file.category === 'imaging' || file.fileType === 'image' || file.fileType === 'dicom';
                            const previewLabel = file.description || file.fileName;
                            return (
                              <div
                                key={file.id}
                                className={cx('pd-img-card', file.fileUrl && 'clickable')}
                                onClick={() => openFilePreview(file)}
                                role={file.fileUrl ? 'button' : undefined}
                                tabIndex={file.fileUrl ? 0 : -1}
                                onKeyDown={e => {
                                  if (!file.fileUrl) return;
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    openFilePreview(file);
                                  }
                                }}
                              >
                                <div className={cx('pd-img-preview', `scan-style-${(i % 3) + 1}`)}>
                                  <span className={styles['pd-img-label']}>{previewLabel}</span>
                                  <span className={styles['pd-img-badge']}>{file.category}{isImaging ? ' · Imaging' : ''}</span>
                                </div>
                                <div className={styles['pd-img-meta']}>
                                  <span>{file.fileName}</span>
                                  <span>
                                    <Clock size={11} /> {file.sizeKb ? `${file.sizeKb} KB` : '—'}
                                  </span>
                                </div>
                                <div className={styles['pd-img-foot']}>
                                  <span>{file.fileType}</span>
                                  <div className={styles['pd-img-actions']}>
                                    {file.isPreviewable && file.fileUrl && (
                                      <button
                                        type="button"
                                        className={styles['pd-img-action-btn']}
                                        onClick={e => {
                                          e.stopPropagation();
                                          openFilePreview(file);
                                        }}
                                      >
                                        <Eye size={12} /> Preview
                                      </button>
                                    )}
                                    {file.fileUrl && (
                                      <button
                                        type="button"
                                        className={styles['pd-img-action-btn']}
                                        onClick={e => {
                                          e.stopPropagation();
                                          downloadFile(file);
                                        }}
                                      >
                                        <Download size={12} /> Download
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <button className={styles['pd-img-upload']} type="button" onClick={openFilePicker} disabled={isUploading}>
                            <UploadCloud size={22} />
                            <span>{isUploading ? 'Uploading...' : 'Upload New Study'}</span>
                            <small>DICOM, JPG, PNG, PDF, CSV</small>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* ─ COL 3: RIGHT — COMMUNICATION HUB ─────────────────────────── */}
          <div className={styles['pd-col-r']}>
            {/* Panel Switcher */}
            <div className={styles['pd-panel-switcher']}>
              <button className={cx('pd-ps-btn', activePanel === 'notes' && 'active')} onClick={() => setActivePanel('notes')}>
                <FileText size={14} /> Consult Notes <span className={styles['pd-ps-count']}>{notes.length}</span>
              </button>
              <button className={cx('pd-ps-btn', activePanel === 'chat' && 'active')} onClick={() => setActivePanel('chat')}>
                <MessageCircle size={14} /> Case Chat <span className={styles['pd-ps-count']}>{messages.length}</span>
              </button>
            </div>

            {/* ─ NOTES PANEL ─ */}
            {activePanel === 'notes' && (
              <div className={styles['pd-panel']}>
                <div className={styles['pd-panel-scroll']}>
                  {notes.map(n => (
                    <div key={n.id} className={styles['pd-note-card']}>
                      <div className={styles['pd-note-header']}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(n.author)}&background=${n.color}&color=fff&size=36`} alt="" />
                        <div>
                          <strong>{n.author}</strong>
                          <small>{n.role}</small>
                        </div>
                        <span className={styles['pd-note-time']}>{n.time}</span>
                      </div>
                      <p className={styles['pd-note-body']}>{n.body}</p>
                    </div>
                  ))}
                </div>
                <div className={styles['pd-notes-compose']}>
                  <textarea
                    placeholder="Write a formal clinical note..."
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    rows={3}
                  />
                  <button
                    className={styles['pd-btn-post']}
                    onClick={handlePostNote}
                    disabled={!noteInput.trim()}
                  >
                    <CornerDownRight size={14} /> Post Note
                  </button>
                </div>
              </div>
            )}

            {/* ─ CHAT PANEL ─ */}
            {activePanel === 'chat' && (
              <div className={styles['pd-panel']}>
                <div className={styles['pd-panel-scroll']} id="pd-chat-scroll">
                  {messages.map(m => (
                    <div key={m.id} className={cx('pd-chat-msg', m.isSystem ? 'system' : m.isSelf ? 'self' : 'other')}>
                      {!m.isSelf && !m.isSystem && <div className={styles['pd-chat-sender']}>{m.sender}</div>}
                      <div className={styles['pd-chat-bubble']}>
                        {m.text}
                        <span className={styles['pd-chat-time']}>{m.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className={styles['pd-chat-compose']}>
                  <div className={styles['pd-chat-input-row']}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChat())}
                    />
                    <button className={styles['pd-chat-send-btn']} onClick={handleSendChat} disabled={!chatInput.trim()}>
                      <Send size={16} />
                    </button>
                  </div>
                  <div className={styles['pd-chat-attachments']}>
                    <button><Paperclip size={14} /> Attach</button>
                    <button><ImageIcon size={14} /> Image</button>
                    <div className={styles['pd-online-info']}><span className={styles['pd-track-dot']} /> 3 Online</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {previewFile && (
        <div className={styles['pd-overlay']} onClick={() => setPreviewFile(null)}>
          <div className={styles['pd-preview-modal']} onClick={e => e.stopPropagation()}>
            <div className={styles['pd-preview-modal-hd']}>
              <div>
                <h2>{previewFile.fileName}</h2>
                <p>{previewFile.description || 'File preview'}</p>
              </div>
              <button className={styles['pd-preview-close']} onClick={() => setPreviewFile(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>

            <div className={styles['pd-preview-stage']}>
              {previewFile.fileType === 'image' && previewFile.fileUrl ? (
                <img src={previewFile.fileUrl} alt={previewFile.fileName} className={styles['pd-preview-image']} />
              ) : previewFile.fileType === 'dicom' ? (
                <div className={styles['pd-preview-placeholder']}>
                  <ImageIcon size={42} />
                  <strong>DICOM study</strong>
                  <p>Open this file in a DICOM viewer to inspect the scan.</p>
                </div>
              ) : previewFile.fileType === 'csv' ? (
                <div className={styles['pd-preview-placeholder']}>
                  <FileText size={42} />
                  <strong>CSV data file</strong>
                  <p>Download to inspect the dataset in a spreadsheet.</p>
                </div>
              ) : previewFile.fileUrl ? (
                <iframe
                  title={previewFile.fileName}
                  src={previewFile.fileUrl}
                  className={styles['pd-preview-frame']}
                />
              ) : (
                <div className={styles['pd-preview-placeholder']}>
                  <FileText size={42} />
                  <strong>No preview available</strong>
                  <p>This file does not have a browsable URL.</p>
                </div>
              )}
            </div>

            <div className={styles['pd-preview-footer']}>
              <div className={styles['pd-preview-meta']}>
                <span><strong>Category:</strong> {previewFile.category}</span>
                <span><strong>Type:</strong> {previewFile.fileType}</span>
                <span><strong>Size:</strong> {previewFile.sizeKb ? `${previewFile.sizeKb} KB` : '—'}</span>
              </div>
              <div className={styles['pd-preview-actions']}>
                {previewFile.fileUrl && (
                  <button className={cx('pd-preview-btn', 'pd-preview-action-primary')} onClick={() => downloadFile(previewFile)}>
                    <Download size={14} /> Download
                  </button>
                )}
                <button className={cx('pd-preview-btn', 'pd-preview-btn-secondary')} onClick={() => setPreviewFile(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLOSE CASE MODAL ────────────────────────────────────────────────── */}
      {showCloseModal && (
        <div className={styles['pd-overlay']} onClick={() => setShowCloseModal(false)}>
          <div className={styles['pd-modal']} onClick={e => e.stopPropagation()}>
            <div className={styles['pd-modal-hd']}>
              <CheckCircle size={22} color="#10b981" />
              <h2>Close Consultation Case</h2>
              <button onClick={() => setShowCloseModal(false)}><X size={18} /></button>
            </div>
            <p className={styles['pd-modal-sub']}>Select an outcome to finalize this case. This action cannot be undone.</p>
            <div className={styles['pd-outcome-grid']}>
              {(['Discharge', 'Referred', 'Dead'] as const).map(o => {
                const icons: Record<string, React.ReactNode> = {
                  'Discharge': <CheckCircle size={18} />,
                  'Referred': <CornerDownRight size={18} />,
                  'Dead': <X size={18} />
                };
                const colors: Record<string, string> = { 'Discharge': '#10b981', 'Referred': '#3b82f6', 'Dead': '#64748b' };
                return (
                  <button
                    key={o}
                    className={cx('pd-outcome-btn', closeOutcome === o && 'active')}
                    style={closeOutcome === o ? { borderColor: colors[o], background: `${colors[o]}10`, color: colors[o] } : {}}
                    onClick={() => setCloseOutcome(o)}
                  >
                    <span className={styles['pd-outcome-icon']} style={{ color: colors[o] }}>{icons[o]}</span>
                    {o}
                  </button>
                );
              })}
            </div>
            <div className={styles['pd-modal-ft']}>
              <button className={styles['pd-btn-cancel']} onClick={() => setShowCloseModal(false)}>Cancel</button>
              <button className={styles['pd-btn-confirm']} onClick={handleClose}>Confirm &amp; Close</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
