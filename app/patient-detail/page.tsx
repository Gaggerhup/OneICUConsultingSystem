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
  Syringe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import './style.css';

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

interface PatientRecord {
  name: string; hn: string; an: string; cid: string;
  age: number; gender: string; bloodType: string; phone: string; dob: string;
  conditions: string[];
  allergies: string[];
  currentSymptoms: string;
  initialDiagnosis: string;
  vitals: { bp: string; hr: number; temp: number; rr: number; spo2: number; gcs: string };
  labs: LabRow[];
  medications: MedRow[];
  clinicalNotes: string;
  team: TeamMember[];
}

// ─── Mock Database ─────────────────────────────────────────────────────────
const MOCK_DB: Record<string, PatientRecord> = {
  '1234567890123': {
    name: 'สมชาย ใจดี', hn: 'HN-100001', an: 'AN-2024-991', cid: '1234567890123',
    age: 52, gender: 'Male', bloodType: 'O+', phone: '+66 81-234-5678', dob: '12 Jan 1972',
    conditions: ['Type 2 Diabetes', 'Hypertension Stage 1'],
    allergies: ['Penicillin', 'Sulfonamides'],
    currentSymptoms: 'ปวดท้องรุนแรงบริเวณขวาล่าง มีไข้ต่ำ คลื่นไส้ ปวดมา 24 ชั่วโมง',
    initialDiagnosis: 'Acute Appendicitis (Suspected)',
    vitals: { bp: '138/88', hr: 92, temp: 38.1, rr: 20, spo2: 97, gcs: '15/15' },
    labs: [
      { name: 'WBC', result: '16.2', unit: 'x10³/µL', ref: '4.5–11.0', status: 'critical' },
      { name: 'Hemoglobin', result: '12.9', unit: 'g/dL', ref: '13.5–17.5', status: 'low' },
      { name: 'Glucose (F)', result: '148', unit: 'mg/dL', ref: '70–99', status: 'high' },
      { name: 'Creatinine', result: '1.1', unit: 'mg/dL', ref: '0.7–1.3', status: 'normal' },
      { name: 'Sodium', result: '136', unit: 'mEq/L', ref: '135–145', status: 'normal' },
      { name: 'CRP', result: '82.4', unit: 'mg/L', ref: '< 10.0', status: 'critical' },
    ],
    medications: [
      { name: 'Metformin', dose: '500 mg', freq: 'Twice daily', route: 'Oral', start: 'Nov 2023', category: 'Antidiabetic' },
      { name: 'Amlodipine', dose: '5 mg', freq: 'Once daily', route: 'Oral', start: 'Aug 2023', category: 'Antihypertensive' },
      { name: 'Ceftriaxone IV', dose: '2 g', freq: 'Every 24h', route: 'IV Push', start: 'Today', category: 'Antibiotic' },
    ],
    clinicalNotes: 'Pt presents with classic RLQ tenderness, rebound positive. Rovsing sign positive. CT confirms appendiceal inflammation with fat stranding. Surgery team consulted.',
    team: [
      { name: 'Dr. Sarah Mitchell', role: 'General Surgeon', color: '14b8a6', online: true },
      { name: 'Dr. James Wilson', role: 'Radiologist', color: '0ea5e9', online: false },
    ]
  },
  '9876543210987': {
    name: 'สมหญิง มีสุข', hn: 'HN-100045', an: 'AN-2024-045', cid: '9876543210987',
    age: 34, gender: 'Female', bloodType: 'B-', phone: '+66 89-765-4321', dob: '22 Mar 1990',
    conditions: ['Asthma (Mild Persistent)'],
    allergies: ['NSAIDs', 'Latex'],
    currentSymptoms: 'หายใจลำบาก แน่นหน้าอก หอบเหนื่อย SpO₂ ลดลง',
    initialDiagnosis: 'Acute Exacerbation of Asthma',
    vitals: { bp: '112/72', hr: 112, temp: 37.4, rr: 28, spo2: 92, gcs: '15/15' },
    labs: [
      { name: 'Peak Flow', result: '52', unit: '% predicted', ref: '> 80%', status: 'critical' },
      { name: 'pCO2', result: '48', unit: 'mmHg', ref: '35–45', status: 'high' },
      { name: 'pO2', result: '68', unit: 'mmHg', ref: '80–100', status: 'low' },
      { name: 'WBC', result: '9.8', unit: 'x10³/µL', ref: '4.5–11.0', status: 'normal' },
      { name: 'Eosinophils', result: '8.2', unit: '%', ref: '1–4', status: 'high' },
    ],
    medications: [
      { name: 'Salbutamol', dose: '2.5mg/3mL', freq: 'PRN Q20min', route: 'Nebulisation', start: 'Today', category: 'Bronchodilator' },
      { name: 'Prednisolone', dose: '1mg/kg', freq: 'Once daily', route: 'IV', start: 'Today', category: 'Corticosteroid' },
      { name: 'Ipratropium', dose: '0.5mg/2mL', freq: 'Q8h', route: 'Nebulisation', start: 'Today', category: 'Bronchodilator' },
    ],
    clinicalNotes: 'Severe exacerbation with silent chest on exam. PEFR 52%. Hypoxic on RA. Resp failure imminent if unresponsive to nebulised treatment. ICU transfer on standby.',
    team: [
      { name: 'Dr. Elena Rodriguez', role: 'Pulmonologist', color: '8b5cf6', online: true },
    ]
  }
};

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
    conditions: ['No data available'],
    allergies: ['NKDA (No Known Drug Allergies)'],
    currentSymptoms: selectedCase?.reason || 'Reason not recorded',
    initialDiagnosis: 'Pending evaluation',
    vitals: { bp: '—', hr: 0, temp: 0.0, rr: 0, spo2: 0, gcs: '—' },
    labs: [],
    medications: [],
    clinicalNotes: '',
    team: []
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Skel({ h = 16, r = 8 }: { h?: number; r?: number }) {
  return <div className="pd-skel" style={{ height: h, borderRadius: r }} />;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function PatientDetail() {
  const router = useRouter();
  const { selectedCase, closeCase, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<'Discharge' | 'Referred' | 'Dead'>('Discharge');
  const [noteInput, setNoteInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activePanel, setActivePanel] = useState<'notes' | 'chat'>('notes');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState([
    { id: 1, author: 'Dr. Sarah Mitchell', role: 'General Surgeon', body: 'Recommended immediate laparoscopic appendectomy. Patient currently NPO.', time: '2h ago', color: '14b8a6' },
    { id: 2, author: 'Dr. James Wilson', role: 'Radiologist', body: 'CT abdomen confirms inflamed appendix, Ø 9mm. Mild periappendiceal fat stranding. No perforation.', time: '4h ago', color: '0ea5e9' }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Mitchell', text: 'Has the patient been prepped for surgery?', time: '14:15', isSelf: false, isSystem: false },
    { id: 2, sender: '', text: '🔔 Lab WBC result updated — 16.2 x10³/µL (CRITICAL)', time: '14:30', isSelf: false, isSystem: true },
    { id: 3, sender: 'You', text: 'Yes, prepped and NPO since 10 AM. OR scheduled for 16:00 today.', time: '14:35', isSelf: true, isSystem: false },
  ]);

  // CID-based data fetch with loading state
  useEffect(() => {
    setIsLoading(true);
    setRecord(null);
    const timer = setTimeout(() => {
      const cid = selectedCase?.cid;
      setRecord(cid && MOCK_DB[cid] ? MOCK_DB[cid] : buildFallback(selectedCase));
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedCase?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePanel]);

  const handlePostNote = () => {
    if (!noteInput.trim()) return;
    const n = { id: Date.now(), author: 'Dr. มนตรีวิฒน์', role: 'Attending Physician', body: noteInput, time: 'Just now', color: '4318FF' };
    setNotes([n, ...notes]);
    setNoteInput('');
    showToast('Consult note posted', 'success');
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
      <div className="pd-root">

        {/* ── TOP STRIP ─────────────────────────────────────────────────── */}
        <div className="pd-topstrip">
          <div className="pd-topstrip-left">
            <button className="pd-btn-back" onClick={() => router.back()}>
              <ArrowLeft size={15} /> Back
            </button>
            <span className="pd-bc-sep"><ChevronRight size={14} /></span>
            <span className="pd-bc-page">Active Cases</span>
            <span className="pd-bc-sep"><ChevronRight size={14} /></span>
            <span className="pd-bc-current">Case #{selectedCase?.id || '—'}</span>
          </div>
          <div className="pd-topstrip-right">
            <div className="pd-track-badge">
              <span className="pd-track-dot" />
              Active Consultation
            </div>
            <button className="pd-icon-btn" title="Update Diagnosis"><Edit3 size={16} /></button>
            <button className="pd-icon-btn" title="Upload Files"><UploadCloud size={16} /></button>
            <button className="pd-icon-btn pd-icon-btn--danger" onClick={() => setShowCloseModal(true)} title="Close Case">
              <CheckCircle size={16} /> Close Case
            </button>
          </div>
        </div>

        {/* ── HERO CARD ──────────────────────────────────────────────────── */}
        <div className="pd-hero" style={{ borderTopColor: accentColor }}>
          {isLoading ? (
            <div className="pd-hero-body" style={{ gap: '0.75rem' }}>
              <Skel h={50} r={14} />
              <Skel h={24} r={8} />
              <Skel h={20} r={6} />
            </div>
          ) : (
            <>
              <div className="pd-hero-body">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record?.name || '??')}&background=4318FF&color=fff&size=72&bold=true`}
                  className="pd-hero-avatar"
                  alt=""
                />
                <div className="pd-hero-info">
                  <div className="pd-hero-name-row">
                    <h1>{record?.name || '—'}</h1>
                    <span className="pd-urg-badge" style={{ background: urg.bg, color: urg.text }}>{urg.label}</span>
                  </div>
                  <div className="pd-hero-subrow">
                    <span>{record?.age}y · {record?.gender} · {record?.bloodType}</span>
                    <span className="pd-hero-dot">·</span>
                    <span className="pd-hero-chip"><User size={12} />CID: {record?.cid}</span>
                    <span className="pd-hero-chip"><BriefcaseMedical size={12} />HN: {record?.hn}</span>
                    <span className="pd-hero-chip"><FileText size={12} />AN: {record?.an}</span>
                  </div>
                </div>
              </div>
              <div className="pd-vitals-row">
                <div className="pd-vital-pill pd-v-red"><Heart size={14} /><span>{record?.vitals.hr || '—'}</span><small>HR bpm</small></div>
                <div className="pd-vital-pill pd-v-blue"><Activity size={14} /><span>{record?.vitals.bp || '—'}</span><small>BP mmHg</small></div>
                <div className="pd-vital-pill pd-v-orange"><Thermometer size={14} /><span>{record?.vitals.temp ? `${record.vitals.temp}°C` : '—'}</span><small>Temp</small></div>
                <div className="pd-vital-pill pd-v-teal"><Wind size={14} /><span>{record?.vitals.rr || '—'}</span><small>RR /min</small></div>
                <div className="pd-vital-pill pd-v-green"><Droplets size={14} /><span>{record?.vitals.spo2 ? `${record.vitals.spo2}%` : '—'}</span><small>SpO₂</small></div>
                <div className="pd-vital-pill pd-v-purple"><BriefcaseMedical size={14} /><span>{record?.vitals.gcs || '—'}</span><small>GCS</small></div>
              </div>
            </>
          )}
        </div>

        {/* ── 3-COLUMN BODY ──────────────────────────────────────────────── */}
        <div className="pd-cols">

          {/* ─ COL 1: LEFT SIDEBAR ──────────────────────────────────────── */}
          <aside className="pd-col-l">
            {isLoading ? (
              <div className="pd-card" style={{ gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                {Array.from({ length: 6 }).map((_, i) => <Skel key={i} h={20} r={8} />)}
              </div>
            ) : (
              <>
                {/* Patient Info */}
                <div className="pd-card">
                  <div className="pd-card-title"><User size={14} />PATIENT INFO</div>
                  <div className="pd-info-grid">
                    <div className="pd-info-row"><span>Phone</span><strong>{record?.phone}</strong></div>
                    <div className="pd-info-row"><span>DOB</span><strong>{record?.dob}</strong></div>
                    <div className="pd-info-row"><span>Blood</span><strong>{record?.bloodType}</strong></div>
                  </div>
                </div>

                {/* Allergies */}
                <div className="pd-card">
                  <div className="pd-card-title" style={{ color: '#ef4444' }}><AlertTriangle size={14} />ALLERGIES</div>
                  <div className="pd-allergy-wrap">
                    {record?.allergies.map((a, i) => (
                      <span key={i} className="pd-allergy-tag">{a}</span>
                    ))}
                  </div>
                </div>

                {/* Medical History */}
                <div className="pd-card">
                  <div className="pd-card-title"><ShieldAlert size={14} />MEDICAL HISTORY</div>
                  <div className="pd-conditions-wrap">
                    {record?.conditions.map((c, i) => <span key={i} className="pd-cond-tag">{c}</span>)}
                  </div>
                  <div style={{ marginTop: '0.875rem' }}>
                    <div className="pd-label">Current Symptoms</div>
                    <p className="pd-symp-text">{record?.currentSymptoms}</p>
                  </div>
                  <div className="pd-diag-box">
                    <div className="pd-diag-label">INITIAL DIAGNOSIS</div>
                    <div className="pd-diag-value">{record?.initialDiagnosis}</div>
                  </div>
                </div>

                {/* Consult Team */}
                <div className="pd-card">
                  <div className="pd-card-title"><Stethoscope size={14} />CONSULT TEAM</div>
                  {record?.team.length === 0 ? (
                    <div className="pd-empty-state-sm">No team assigned</div>
                  ) : (
                    <div className="pd-team-list">
                      {record?.team.map((m, i) => (
                        <div key={i} className="pd-team-member">
                          <div className="pd-t-av-wrap">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=${m.color}&color=fff&size=40`}
                              alt=""
                            />
                            <span className={`pd-online-dot ${m.online ? 'online' : 'offline'}`} />
                          </div>
                          <div className="pd-t-info">
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
          <main className="pd-col-c">
            <div className="pd-tabs-bar">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`pd-tab ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon}{t.label}
                  {t.badge && t.badge !== '0' && (
                    <span className="pd-tab-badge" style={{ background: t.id === 'labs' ? '#ef444420' : '#ede9fe', color: t.id === 'labs' ? '#ef4444' : '#7c3aed' }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pd-tab-content">
              {isLoading ? (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Skel h={180} r={14} />
                  <Skel h={120} r={14} />
                </div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="pd-fade-in">
                      <div className="pd-section-title">CLINICAL STATUS</div>
                      <div className="pd-status-grid">
                        <div className="pd-s-card">
                          <div className="pd-s-label">Neurological (GCS)</div>
                          <div className="pd-s-value">{record?.vitals.gcs}</div>
                        </div>
                        <div className="pd-s-card">
                          <div className="pd-s-label">Respiratory</div>
                          <div className="pd-s-value">{record?.vitals.rr} /min · SpO₂ {record?.vitals.spo2}%</div>
                        </div>
                        <div className="pd-s-card">
                          <div className="pd-s-label">Cardiac</div>
                          <div className="pd-s-value">{record?.vitals.hr} bpm · {record?.vitals.bp} mmHg</div>
                        </div>
                        <div className="pd-s-card">
                          <div className="pd-s-label">Temperature</div>
                          <div className={`pd-s-value ${record && record.vitals.temp > 37.5 ? 'text-orange' : ''}`}>{record?.vitals.temp}°C</div>
                        </div>
                      </div>

                      {record?.clinicalNotes && (
                        <>
                          <div className="pd-section-title" style={{ marginTop: '1.25rem' }}>CLINICAL SUMMARY</div>
                          <div className="pd-clinical-note-box">{record.clinicalNotes}</div>
                        </>
                      )}

                      {record && record.labs.length > 0 && (
                        <>
                          <div className="pd-section-title" style={{ marginTop: '1.25rem' }}>CRITICAL ALERTS</div>
                          <div className="pd-alerts-list">
                            {record.labs.filter(l => l.status === 'critical' || l.status === 'high' || l.status === 'low').map(l => (
                              <div key={l.name} className="pd-alert-row" style={{ borderLeftColor: getStatusColor(l.status) }}>
                                <div className="pd-a-name">{l.name}</div>
                                <div className="pd-a-result" style={{ color: getStatusColor(l.status) }}>{l.result} {l.unit}</div>
                                <div className="pd-a-status" style={{ color: getStatusColor(l.status), background: `${getStatusColor(l.status)}12` }}>{getStatusLabel(l.status)}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* LAB RESULTS TAB */}
                  {activeTab === 'labs' && (
                    <div className="pd-fade-in">
                      {record && record.labs.length === 0 ? (
                        <div className="pd-empty-state">
                          <FlaskConical size={36} strokeWidth={1} />
                          <p>No lab results on file.</p>
                          <small>Results will appear here once processed.</small>
                        </div>
                      ) : (
                        <table className="pd-lab-table">
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
                              <tr key={l.name} className={l.status !== 'normal' ? 'pd-lab-row-alert' : ''}>
                                <td><strong>{l.name}</strong></td>
                                <td style={{ color: getStatusColor(l.status), fontWeight: 700 }}>
                                  {l.result} <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.7em' }}>{l.unit}</span>
                                </td>
                                <td className="pd-lab-ref">{l.ref}</td>
                                <td>
                                  <span className="pd-lab-status" style={{ color: getStatusColor(l.status), background: `${getStatusColor(l.status)}15` }}>
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
                    <div className="pd-fade-in">
                      {record && record.medications.length === 0 ? (
                        <div className="pd-empty-state">
                          <Pill size={36} strokeWidth={1} />
                          <p>No medications recorded.</p>
                        </div>
                      ) : (
                        <div className="pd-med-list">
                          {record?.medications.map((m, i) => (
                            <div key={i} className="pd-med-card">
                              <div className="pd-med-icon"><Syringe size={18} /></div>
                              <div className="pd-med-info">
                                <div className="pd-med-name">{m.name} <span className="pd-med-dose">{m.dose}</span></div>
                                <div className="pd-med-meta">{m.freq} · via {m.route}</div>
                                <div className="pd-med-category">{m.category}</div>
                              </div>
                              <div className="pd-med-start"><Clock size={12} />{m.start}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* IMAGING TAB */}
                  {activeTab === 'imaging' && (
                    <div className="pd-fade-in">
                      <div className="pd-imaging-grid">
                        {['CT Abdomen — Axial', 'CT Abdomen — Coronal', 'Chest X-Ray — PA'].map((label, i) => (
                          <div key={i} className="pd-img-card">
                            <div className={`pd-img-preview scan-style-${(i % 3) + 1}`}>
                              <span className="pd-img-label">{label}</span>
                            </div>
                            <div className="pd-img-meta">
                              <span>Study_0{i + 1}.dcm</span>
                              <span><Clock size={11} /> 08:30 AM</span>
                            </div>
                          </div>
                        ))}
                        <div className="pd-img-upload">
                          <UploadCloud size={22} />
                          <span>Upload New Study</span>
                          <small>DICOM, JPG, PNG</small>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* ─ COL 3: RIGHT — COMMUNICATION HUB ─────────────────────────── */}
          <div className="pd-col-r">
            {/* Panel Switcher */}
            <div className="pd-panel-switcher">
              <button className={`pd-ps-btn ${activePanel === 'notes' ? 'active' : ''}`} onClick={() => setActivePanel('notes')}>
                <FileText size={14} /> Consult Notes <span className="pd-ps-count">{notes.length}</span>
              </button>
              <button className={`pd-ps-btn ${activePanel === 'chat' ? 'active' : ''}`} onClick={() => setActivePanel('chat')}>
                <MessageCircle size={14} /> Case Chat <span className="pd-ps-count">{messages.length}</span>
              </button>
            </div>

            {/* ─ NOTES PANEL ─ */}
            {activePanel === 'notes' && (
              <div className="pd-panel">
                <div className="pd-panel-scroll">
                  {notes.map(n => (
                    <div key={n.id} className="pd-note-card">
                      <div className="pd-note-header">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(n.author)}&background=${n.color}&color=fff&size=36`} alt="" />
                        <div>
                          <strong>{n.author}</strong>
                          <small>{n.role}</small>
                        </div>
                        <span className="pd-note-time">{n.time}</span>
                      </div>
                      <p className="pd-note-body">{n.body}</p>
                    </div>
                  ))}
                </div>
                <div className="pd-notes-compose">
                  <textarea
                    placeholder="Write a formal clinical note..."
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    rows={3}
                  />
                  <button
                    className="pd-btn-post"
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
              <div className="pd-panel">
                <div className="pd-panel-scroll" id="pd-chat-scroll">
                  {messages.map(m => (
                    <div key={m.id} className={`pd-chat-msg ${m.isSystem ? 'system' : m.isSelf ? 'self' : 'other'}`}>
                      {!m.isSelf && !m.isSystem && <div className="pd-chat-sender">{m.sender}</div>}
                      <div className="pd-chat-bubble">
                        {m.text}
                        <span className="pd-chat-time">{m.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="pd-chat-compose">
                  <div className="pd-chat-input-row">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChat())}
                    />
                    <button className="pd-chat-send-btn" onClick={handleSendChat} disabled={!chatInput.trim()}>
                      <Send size={16} />
                    </button>
                  </div>
                  <div className="pd-chat-attachments">
                    <button><Paperclip size={14} /> Attach</button>
                    <button><ImageIcon size={14} /> Image</button>
                    <div className="pd-online-info"><span className="pd-track-dot" /> 3 Online</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── CLOSE CASE MODAL ────────────────────────────────────────────────── */}
      {showCloseModal && (
        <div className="pd-overlay" onClick={() => setShowCloseModal(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-hd">
              <CheckCircle size={22} color="#10b981" />
              <h2>Close Consultation Case</h2>
              <button onClick={() => setShowCloseModal(false)}><X size={18} /></button>
            </div>
            <p className="pd-modal-sub">Select an outcome to finalize this case. This action cannot be undone.</p>
            <div className="pd-outcome-grid">
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
                    className={`pd-outcome-btn ${closeOutcome === o ? 'active' : ''}`}
                    style={closeOutcome === o ? { borderColor: colors[o], background: `${colors[o]}10`, color: colors[o] } : {}}
                    onClick={() => setCloseOutcome(o)}
                  >
                    <span style={{ color: colors[o] }}>{icons[o]}</span>
                    {o}
                  </button>
                );
              })}
            </div>
            <div className="pd-modal-ft">
              <button className="pd-btn-cancel" onClick={() => setShowCloseModal(false)}>Cancel</button>
              <button className="pd-btn-confirm" onClick={handleClose}>Confirm &amp; Close</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
