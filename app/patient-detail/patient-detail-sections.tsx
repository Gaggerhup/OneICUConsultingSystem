'use client';

import React from 'react';
import Image from 'next/image';
import {
  Activity,
  AlertTriangle,
  BriefcaseMedical,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  CornerDownRight,
  Download,
  Droplets,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  ImageIcon,
  MessageCircle,
  Minus,
  Paperclip,
  Pencil,
  Pill,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  Trash2,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  User,
  Wind,
  X,
} from 'lucide-react';
import styles from './style.module.css';
import type {
  CrudEntity,
  FileCategoryFilter,
  FileRecord,
  LabRow,
  MedRow,
  NoteRow,
  OrderSummaryRow,
  PatientRecord,
  Tab,
  VitalHistoryPoint,
  VitalMetricKey,
} from './page';
import { cx } from '@/lib/cx';
import { useLocale } from '@/context/LocaleContext';

type NoteItem = {
  id: string;
  author: string;
  role: string;
  body: string;
  soap?: { s: string; o: string; a: string; p: string };
  orders?: { oneDay: string; continuation: string };
  time: string;
  color: string;
};

type OrderSummaryItem = {
  id: string;
  author: string;
  role: string;
  oneDay: string;
  continuation: string;
  time: string;
  color: string;
  sourceType: 'summary' | 'note';
  soap?: { s: string; o: string; a: string; p: string };
};

type MessageItem = {
  id: number;
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
  isSystem: boolean;
};

type TabItem = {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
};

type UrgencyTone = {
  bg: string;
  text: string;
  label: string;
};

const vitalMeta: Record<VitalMetricKey, {
  label: string;
  shortLabel: string;
  accentClass: string;
  description: string;
  lineColor: string;
}> = {
  hr: { label: 'Heart Rate', shortLabel: 'HR bpm', accentClass: 'pd-v-red', description: 'Trend of heart rate across recorded observations.', lineColor: '#e11d48' },
  bp: { label: 'Blood Pressure', shortLabel: 'BP mmHg', accentClass: 'pd-v-blue', description: 'Trend of systolic and diastolic blood pressure values.', lineColor: '#1d4ed8' },
  temp: { label: 'Temperature', shortLabel: 'Temp', accentClass: 'pd-v-orange', description: 'Trend of body temperature in degrees Celsius.', lineColor: '#c2410c' },
  rr: { label: 'Respiratory Rate', shortLabel: 'RR /min', accentClass: 'pd-v-teal', description: 'Trend of breaths per minute over time.', lineColor: '#0f766e' },
  spo2: { label: 'Oxygen Saturation', shortLabel: 'SpO₂', accentClass: 'pd-v-green', description: 'Trend of oxygen saturation percentage.', lineColor: '#15803d' },
  gcs: { label: 'Glasgow Coma Scale', shortLabel: 'GCS', accentClass: 'pd-v-purple', description: 'Trend of neurological response score.', lineColor: '#7e22ce' },
};

const fileCategoryOptions: Array<{ id: FileCategoryFilter; label: string }> = [
  { id: 'all', label: 'All Files' },
  { id: 'imaging', label: 'Imaging' },
  { id: 'lab', label: 'Lab' },
  { id: 'report', label: 'Report' },
  { id: 'medication', label: 'Medication' },
  { id: 'note', label: 'Note' },
  { id: 'other', label: 'Other' },
];

function getStatusColor(status: string) {
  if (status === 'critical') return '#ef4444';
  if (status === 'high') return '#f97316';
  if (status === 'low') return '#3b82f6';
  return '#10b981';
}

function getStatusLabel(status: string) {
  if (status === 'critical') return '▲ CRITICAL';
  if (status === 'high') return '▲ HIGH';
  if (status === 'low') return '▼ LOW';
  return '✓ Normal';
}

function getTrendIcon(status: string) {
  if (status === 'high' || status === 'critical') return <TrendingUp size={13} />;
  if (status === 'low') return <TrendingDown size={13} />;
  return <Minus size={13} />;
}

type LabGroupKey = 'hematology' | 'biochemistry' | 'immunology' | 'urinalysis' | 'microbiology' | 'other';

type GroupedLab = LabRow & {
  groupKey: LabGroupKey;
  groupName: string;
  subGroupName: string;
};

const labGroupDefinitions: Record<LabGroupKey, { name: string; description: string; tone: string; keywords: RegExp[] }> = {
  hematology: {
    name: 'HEMATOLOGY',
    description: 'CBC, differential count, coagulation',
    tone: '#be123c',
    keywords: [/cbc/i, /\bwbc\b/i, /\brbc\b/i, /\bhb\b/i, /hemoglobin/i, /\bhct\b/i, /hematocrit/i, /\bplt\b/i, /platelet/i, /neutro/i, /lymph/i, /mono/i, /eos/i, /baso/i, /pt\b/i, /inr/i, /aptt/i],
  },
  biochemistry: {
    name: 'BIOCHEMISTRY',
    description: 'Renal, electrolyte, liver, lipid, glucose',
    tone: '#0f766e',
    keywords: [/glucose/i, /\bbs\b/i, /\bbun\b/i, /creatinine/i, /\begfr\b/i, /sodium/i, /\bna\b/i, /potassium/i, /\bk\b/i, /chloride/i, /\bcl\b/i, /bicarb/i, /co2/i, /calcium/i, /magnesium/i, /phosph/i, /\bast\b/i, /\balt\b/i, /\balp\b/i, /albumin/i, /bilirubin/i, /cholesterol/i, /triglyceride/i, /\bhdl\b/i, /\bldl\b/i],
  },
  immunology: {
    name: 'IMMUNOLOGY / SEROLOGY',
    description: 'Viral marker, inflammatory marker, cardiac marker',
    tone: '#6d28d9',
    keywords: [/hiv/i, /hbsag/i, /anti[-\s]?hbs/i, /anti[-\s]?hcv/i, /vdrl/i, /rpr/i, /\bcrp\b/i, /procalcitonin/i, /troponin/i, /ck[-\s]?mb/i, /dengue/i, /influenza/i, /covid/i],
  },
  urinalysis: {
    name: 'URINALYSIS',
    description: 'UA and urine chemistry',
    tone: '#b45309',
    keywords: [/urine/i, /urinalysis/i, /\bua\b/i, /specific gravity/i, /protein/i, /ketone/i, /nitrite/i, /leukocyte/i, /urobilinogen/i],
  },
  microbiology: {
    name: 'MICROBIOLOGY',
    description: 'Culture, gram stain, organism result',
    tone: '#1d4ed8',
    keywords: [/culture/i, /gram/i, /sputum/i, /hemoculture/i, /blood c\/s/i, /sensitivity/i, /organism/i, /afb/i],
  },
  other: {
    name: 'OTHER LABS',
    description: 'Unmapped lab items',
    tone: '#475569',
    keywords: [],
  },
};

function getLabSubGroupName(name: string, groupKey: LabGroupKey) {
  const normalized = name.toLowerCase();
  if (groupKey === 'hematology') {
    if (/pt\b|inr|aptt|coag/i.test(name)) return 'Coagulation';
    if (/neutro|lymph|mono|eos|baso/i.test(name)) return 'Differential Count';
    return 'CBC / Blood Count';
  }
  if (groupKey === 'biochemistry') {
    if (/sodium|\bna\b|potassium|\bk\b|chloride|\bcl\b|bicarb|co2|calcium|magnesium|phosph/i.test(name)) return 'Electrolytes';
    if (/bun|creatinine|egfr/i.test(name)) return 'Renal Function';
    if (/ast|alt|alp|albumin|bilirubin|protein/i.test(name)) return 'Liver Function';
    if (/cholesterol|triglyceride|hdl|ldl|lipid/i.test(name)) return 'Lipid Profile';
    if (/glucose|\bbs\b|hba1c/i.test(name)) return 'Glucose / Diabetes';
    return 'Chemistry';
  }
  if (groupKey === 'immunology') {
    if (/hiv|hbsag|anti[-\s]?hbs|anti[-\s]?hcv|vdrl|rpr/i.test(name)) return 'Serology / Viral Marker';
    if (/troponin|ck[-\s]?mb/i.test(name)) return 'Cardiac Marker';
    return 'Inflammatory / Immunology';
  }
  if (groupKey === 'urinalysis') return 'Urinalysis (UA)';
  if (groupKey === 'microbiology') return 'Culture / Sensitivity';
  return normalized.includes('xray') ? 'Linked Investigation' : 'Unclassified';
}

function getLabClassification(name: string) {
  const trimmedName = name.trim();
  const matchedEntry = (Object.entries(labGroupDefinitions) as Array<[LabGroupKey, typeof labGroupDefinitions[LabGroupKey]]>)
    .find(([key, definition]) => key !== 'other' && definition.keywords.some((keyword) => keyword.test(trimmedName)));
  const groupKey = matchedEntry?.[0] || 'other';
  const definition = labGroupDefinitions[groupKey];

  return {
    groupKey,
    groupName: definition.name,
    subGroupName: trimmedName ? getLabSubGroupName(trimmedName, groupKey) : 'Waiting for lab item name',
    description: definition.description,
    tone: definition.tone,
  };
}

function classifyLab(lab: LabRow): GroupedLab {
  const classification = getLabClassification(lab.name);

  return {
    ...lab,
    groupKey: classification.groupKey,
    groupName: classification.groupName,
    subGroupName: classification.subGroupName,
  };
}

function Skel({ h = 16, r = 8 }: { h?: number; r?: number }) {
  return <div className={styles['pd-skel']} style={{ height: h, borderRadius: r }} />;
}

function buildMiniSparklinePath(values: number[], width = 72, height = 18) {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const insetX = 1;
  const insetY = 2;
  const usableWidth = width - insetX * 2;
  const usableHeight = height - insetY * 2;

  return values.map((value, index) => {
    const x = insetX + (values.length === 1 ? usableWidth / 2 : (usableWidth * index) / (values.length - 1));
    const y = max === min
      ? insetY + usableHeight / 2
      : insetY + ((max - value) / range) * usableHeight;
    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');
}

function MiniVitalSparkline({
  metric,
  vitalsHistory,
}: {
  metric: VitalMetricKey;
  vitalsHistory: VitalHistoryPoint[];
}) {
  const { t } = useLocale();
  if (vitalsHistory.length < 2) return null;

  const series = createSeries(metric, vitalsHistory);

  return (
    <div className={styles['pd-vital-pill-trend']} aria-hidden="true">
      <svg viewBox="0 0 72 18" className={styles['pd-vital-sparkline']}>
        <path d="M1 9 H71" className={styles['pd-vital-sparkline-track']} />
        {series.map((line) => (
          <path
            key={line.key}
            d={buildMiniSparklinePath(line.values)}
            fill="none"
            stroke={line.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <span>{t('patientDetail.trend')}</span>
    </div>
  );
}

function parseAllergyEntries(allergies: string[] | undefined) {
  const entries = (allergies || [])
    .map((item) => item.trim())
    .filter(Boolean);

  const hasNoKnownAllergy = entries.some((item) => /nkda|no known drug allergies|no known allergies/i.test(item));
  if (entries.length === 0 || hasNoKnownAllergy) {
    return {
      hasRisk: false,
      tags: [] as string[],
      details: [] as string[],
    };
  }

  const tags: string[] = [];
  const details: string[] = [];

  for (const entry of entries) {
    const colonIndex = entry.indexOf(':');
    const parenMatch = entry.match(/^(.+?)\s*\((.+)\)$/);

    if (parenMatch) {
      tags.push(parenMatch[1].trim());
      details.push(parenMatch[2].trim());
      continue;
    }

    if (colonIndex > 0) {
      tags.push(entry.slice(0, colonIndex).trim());
      details.push(entry.slice(colonIndex + 1).trim());
      continue;
    }

    tags.push(entry);
  }

  return {
    hasRisk: tags.length > 0,
    tags,
    details,
  };
}

export function PatientHeroSection({
  isLoading,
  record,
  urgency,
  vitalsHistory,
  selectedMetrics,
  pulseMetric,
  caseStatus,
  onEditOverview,
  onGenerateAiSummary,
  isGeneratingAiSummary,
  onOpenCloseCase,
  onApproveCase,
  onDeclineCase,
  onVitalSelect,
  onClearSelectedVitals,
}: {
  isLoading: boolean;
  record: PatientRecord | null;
  urgency: UrgencyTone;
  vitalsHistory: VitalHistoryPoint[];
  selectedMetrics: VitalMetricKey[];
  pulseMetric: VitalMetricKey | null;
  caseStatus?: string;
  onEditOverview: () => void;
  onGenerateAiSummary: () => void;
  isGeneratingAiSummary: boolean;
  onOpenCloseCase: () => void;
  onApproveCase?: () => void;
  onDeclineCase?: () => void;
  onVitalSelect: (metric: VitalMetricKey) => void;
  onClearSelectedVitals: () => void;
}) {
  const { t } = useLocale();
  const hasSelectedMetrics = selectedMetrics.length > 0;
  const allergySummary = parseAllergyEntries(record?.allergies);

  return (
    <div className={styles['pd-hero']} style={{ borderTopColor: urgency.text }}>
      {isLoading ? (
        <div className={cx(styles, 'pd-hero-body', 'pd-stack-gap-sm')}>
          <Skel h={50} r={14} />
          <Skel h={24} r={8} />
          <Skel h={20} r={6} />
        </div>
      ) : (
        <>
          <div className={styles['pd-hero-shell']}>
            <div className={styles['pd-hero-body']}>
              <div className={styles['pd-hero-primary']}>
                <div className={styles['pd-hero-topline']}>
                  <div className={styles['pd-hero-eyebrow']}>{t('patientDetail.patientCommandCenter')}</div>
                  <button
                    type="button"
                    className={styles['pd-ai-summary-btn']}
                    onClick={onGenerateAiSummary}
                    disabled={isGeneratingAiSummary || !record}
                    title={t('patientDetail.generateAiCaseSummary')}
                  >
                    <Sparkles size={14} />
                    {isGeneratingAiSummary ? t('patientDetail.summarizing') : t('patientDetail.aiSummary')}
                  </button>
                </div>
                <div className={styles['pd-hero-identity']}>
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record?.name || '??')}&background=4318FF&color=fff&size=72&bold=true`}
                    className={styles['pd-hero-avatar']}
                    alt=""
                    width={72}
                    height={72}
                    unoptimized
                  />
                  <div className={styles['pd-hero-info']}>
                    <div className={styles['pd-hero-name-row']}>
                      <div className={styles['pd-hero-name-group']}>
                        <h1>{record?.name || '—'}</h1>
                        <span className={styles['pd-urg-badge']} style={{ background: urgency.bg, color: urgency.text }}>
                          {urgency.label}
                        </span>
                      </div>
                    </div>
                    <div className={styles['pd-hero-subrow']}>
                      <span>{record?.age}y · {record?.gender} · {record?.bloodType}</span>
                      <span className={styles['pd-hero-dot']}>·</span>
                      <span className={styles['pd-hero-chip']}><User size={12} />CID: {record?.cid}</span>
                      <span className={styles['pd-hero-chip']}><BriefcaseMedical size={12} />HN: {record?.hn}</span>
                      <span className={styles['pd-hero-chip']}><FileText size={12} />AN: {record?.an}</span>
                    </div>
                    <div className={styles['pd-hero-actions-panel']}>
                      <div className={styles['pd-hero-actions-copy']}>
                        <span className={styles['pd-hero-actions-label']}>{t('patientDetail.patientActions')}</span>
                        <small>{caseStatus === 'Pending' ? t('patientDetail.reviewRequestHint') : t('patientDetail.editOrFinishHint')}</small>
                      </div>
                      <div className={styles['pd-hero-actions']}>
                        <button type="button" className={styles['pd-hero-edit-btn']} onClick={onEditOverview}>
                          <Pencil size={14} />
                          {t('patientDetail.editOverview')}
                        </button>
                        {caseStatus === 'Pending' ? (
                          <>
                            <button type="button" className={cx(styles, 'pd-hero-edit-btn', 'pd-hero-decline-btn')} onClick={onDeclineCase}>
                              <X size={14} />
                              {t('common.decline')}
                            </button>
                            <button type="button" className={cx(styles, 'pd-hero-edit-btn', 'pd-hero-approve-btn')} onClick={onApproveCase}>
                              <CheckCircle size={14} />
                              {t('common.approve')}
                            </button>
                          </>
                        ) : (
                          <button type="button" className={cx(styles, 'pd-hero-edit-btn', 'pd-hero-danger-btn')} onClick={onOpenCloseCase}>
                            <CheckCircle size={14} />
                            {t('common.closeCase')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles['pd-hero-brief']}>
                  <div className={styles['pd-hero-brief-card']}>
                    <span>{t('newRequest.chiefComplaintLabel')}</span>
                    <strong>{record?.chiefComplaint || t('patientDetail.noChiefComplaintYet')}</strong>
                  </div>
                  <div className={styles['pd-hero-brief-card']}>
                    <span>{t('newRequest.presentIllnessLabel')}</span>
                    <strong>{record?.presentIllness || t('patientDetail.noPresentIllnessYet')}</strong>
                  </div>
                  <div className={styles['pd-hero-brief-card']}>
                    <span>{t('newRequest.initialDiagnosis')}</span>
                    <strong>{record?.initialDiagnosis || t('patientDetail.pendingAssessment')}</strong>
                  </div>
                </div>
              </div>
              <div className={styles['pd-hero-secondary']}>
                <div className={styles['pd-hero-secondary-head']}>
                  <strong>{t('patientDetail.quickFacts')}</strong>
                  <span>{t('patientDetail.triageSnapshot')}</span>
                </div>
                <div className={styles['pd-hero-mini-card']}>
                  <span>{t('patientDetail.bloodGroup')}</span>
                  <strong>{record?.bloodType || '—'}</strong>
                </div>
                <div className={styles['pd-hero-mini-card']}>
                  <span>{t('patientDetail.location')}</span>
                  <strong>{record?.district || '—'}, {record?.province || '—'}</strong>
                </div>
                <div className={cx(styles, 'pd-hero-mini-card', allergySummary.hasRisk && 'pd-hero-mini-card-alert')}>
                  <span>{t('patientDetail.drugFoodAllergies')}</span>
                  {allergySummary.hasRisk ? (
                    <>
                      <div className={styles['pd-hero-allergy-tags']}>
                        {allergySummary.tags.map((tag) => (
                          <span key={tag} className={styles['pd-hero-allergy-tag']}>{tag}</span>
                        ))}
                      </div>
                      <div className={styles['pd-hero-allergy-detail']}>
                        {allergySummary.details.length > 0 ? allergySummary.details.join(' · ') : t('patientDetail.allergyHistoryOnFile')}
                      </div>
                    </>
                  ) : (
                    <strong>{t('patientDetail.noneReported')}</strong>
                  )}
                </div>
              </div>
            </div>
            <div className={styles['pd-vitals-toolbar']}>
              <div className={styles['pd-vitals-hint']}>
                <Activity size={14} />
                {t('patientDetail.compareTrends')}
              </div>
              <div className={styles['pd-vitals-toolbar-actions']}>
                {hasSelectedMetrics && (
                  <>
                    <div className={styles['pd-vitals-selection']}>
                      {t('patientDetail.selectedCount', { count: selectedMetrics.length })}
                    </div>
                    <button type="button" className={styles['pd-vitals-toolbar-link']} onClick={onClearSelectedVitals}>
                      {t('common.clearAll')}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className={styles['pd-vitals-row']}>
              <button type="button" className={cx(styles, 'pd-vital-pill', 'pd-v-red', selectedMetrics.includes('hr') && 'pd-vital-pill-active', pulseMetric === 'hr' && 'pd-vital-pill-pulse')} onClick={() => onVitalSelect('hr')}>
                <div className={styles['pd-vital-pill-main']}>
                  <Heart size={14} />
                  <span>{record?.vitals.hr || '—'}</span>
                  <div className={styles['pd-vital-pill-meta']}>
                    <small>HR bpm</small>
                  </div>
                </div>
                <MiniVitalSparkline metric="hr" vitalsHistory={vitalsHistory} />
              </button>
              <button type="button" className={cx(styles, 'pd-vital-pill', 'pd-v-blue', selectedMetrics.includes('bp') && 'pd-vital-pill-active', pulseMetric === 'bp' && 'pd-vital-pill-pulse')} onClick={() => onVitalSelect('bp')}>
                <div className={styles['pd-vital-pill-main']}>
                  <Activity size={14} />
                  <span>{record?.vitals.bp || '—'}</span>
                  <div className={styles['pd-vital-pill-meta']}>
                    <small>BP mmHg</small>
                  </div>
                </div>
                <MiniVitalSparkline metric="bp" vitalsHistory={vitalsHistory} />
              </button>
              <button type="button" className={cx(styles, 'pd-vital-pill', 'pd-v-orange', selectedMetrics.includes('temp') && 'pd-vital-pill-active', pulseMetric === 'temp' && 'pd-vital-pill-pulse')} onClick={() => onVitalSelect('temp')}>
                <div className={styles['pd-vital-pill-main']}>
                  <Thermometer size={14} />
                  <span>{record?.vitals.temp ? `${record.vitals.temp}°C` : '—'}</span>
                  <div className={styles['pd-vital-pill-meta']}>
                    <small>Temp</small>
                  </div>
                </div>
                <MiniVitalSparkline metric="temp" vitalsHistory={vitalsHistory} />
              </button>
              <button type="button" className={cx(styles, 'pd-vital-pill', 'pd-v-teal', selectedMetrics.includes('rr') && 'pd-vital-pill-active', pulseMetric === 'rr' && 'pd-vital-pill-pulse')} onClick={() => onVitalSelect('rr')}>
                <div className={styles['pd-vital-pill-main']}>
                  <Wind size={14} />
                  <span>{record?.vitals.rr || '—'}</span>
                  <div className={styles['pd-vital-pill-meta']}>
                    <small>RR /min</small>
                  </div>
                </div>
                <MiniVitalSparkline metric="rr" vitalsHistory={vitalsHistory} />
              </button>
              <button type="button" className={cx(styles, 'pd-vital-pill', 'pd-v-green', selectedMetrics.includes('spo2') && 'pd-vital-pill-active', pulseMetric === 'spo2' && 'pd-vital-pill-pulse')} onClick={() => onVitalSelect('spo2')}>
                <div className={styles['pd-vital-pill-main']}>
                  <Droplets size={14} />
                  <span>{record?.vitals.spo2 ? `${record.vitals.spo2}%` : '—'}</span>
                  <div className={styles['pd-vital-pill-meta']}>
                    <small>SpO₂</small>
                  </div>
                </div>
                <MiniVitalSparkline metric="spo2" vitalsHistory={vitalsHistory} />
              </button>
              <button type="button" className={cx(styles, 'pd-vital-pill', 'pd-v-purple', selectedMetrics.includes('gcs') && 'pd-vital-pill-active', pulseMetric === 'gcs' && 'pd-vital-pill-pulse')} onClick={() => onVitalSelect('gcs')}>
                <div className={styles['pd-vital-pill-main']}>
                  <BriefcaseMedical size={14} />
                  <span>{record?.vitals.gcs || '—'}</span>
                  <div className={styles['pd-vital-pill-meta']}>
                    <small>GCS</small>
                  </div>
                </div>
                <MiniVitalSparkline metric="gcs" vitalsHistory={vitalsHistory} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PatientSidebar({
  isLoading,
  record,
}: {
  isLoading: boolean;
  record: PatientRecord | null;
}) {
  const { t } = useLocale();
  return (
    <aside className={styles['pd-col-l']}>
      {isLoading ? (
        <div className={cx(styles, 'pd-card', 'pd-card-loading')}>
          {Array.from({ length: 6 }).map((_, i) => <Skel key={i} h={20} r={8} />)}
        </div>
      ) : (
        <>
          <div className={styles['pd-card']}>
            <div className={styles['pd-card-title']}><User size={14} />{t('patientDetail.patientInfo')}</div>
            <div className={styles['pd-info-grid']}>
              <div className={styles['pd-info-row']}><span>{t('newRequest.phoneLabel')}</span><strong>{record?.phone}</strong></div>
              <div className={styles['pd-info-row']}><span>{t('newRequest.dob')}</span><strong>{record?.dob}</strong></div>
              <div className={styles['pd-info-row']}><span>{t('patientDetail.blood')}</span><strong>{record?.bloodType}</strong></div>
              <div className={styles['pd-info-row']}><span>{t('newRequest.district')}</span><strong>{record?.district}</strong></div>
              <div className={styles['pd-info-row']}><span>{t('newRequest.province')}</span><strong>{record?.province}</strong></div>
            </div>
          </div>

          <div className={styles['pd-card']}>
            <div className={cx(styles, 'pd-card-title', 'pd-allergy-title')}><AlertTriangle size={14} />{t('newRequest.allergies')}</div>
            <div className={styles['pd-allergy-wrap']}>
              {record?.allergies.map((allergy, i) => (
                <span key={i} className={styles['pd-allergy-tag']}>{allergy}</span>
              ))}
            </div>
          </div>

          <div className={styles['pd-card']}>
            <div className={styles['pd-card-title']}><ShieldAlert size={14} />{t('patientDetail.medicalHistory')}</div>
            <div className={styles['pd-conditions-wrap']}>
              {record?.conditions.map((condition, i) => (
                <span key={i} className={styles['pd-cond-tag']}>{condition}</span>
              ))}
            </div>
            <div className={styles['pd-label-spaced']}>
              <div className={styles['pd-label']}>{t('newRequest.chiefComplaintLabel')}</div>
              <p className={styles['pd-symp-text']}>{record?.chiefComplaint}</p>
            </div>
            <div className={styles['pd-label-spaced']}>
              <div className={styles['pd-label']}>{t('newRequest.presentIllnessLabel')}</div>
              <p className={styles['pd-symp-text']}>{record?.presentIllness}</p>
            </div>
            <div className={styles['pd-diag-box']}>
              <div className={styles['pd-diag-label']}>{t('newRequest.initialDiagnosis')}</div>
              <div className={styles['pd-diag-value']}>{record?.initialDiagnosis}</div>
            </div>
          </div>

        </>
      )}
    </aside>
  );
}

export function PatientTabContent({
  activeTab,
  setActiveTab,
  tabs,
  isOpen,
  onToggleOpen,
  isLoading,
  record,
  selectedFileCategory,
  setSelectedFileCategory,
  filteredFiles,
  isUploading,
  vitalRows,
  openFilePicker,
  openFilePreview,
  downloadFile,
  openVitalEditor,
  openLabEditor,
  openMedicationEditor,
  openFileEditor,
  handleDeleteEntity,
  deletingKey,
}: {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  tabs: TabItem[];
  isOpen: boolean;
  onToggleOpen: () => void;
  isLoading: boolean;
  record: PatientRecord | null;
  selectedFileCategory: FileCategoryFilter;
  setSelectedFileCategory: React.Dispatch<React.SetStateAction<FileCategoryFilter>>;
  filteredFiles: FileRecord[];
  isUploading: boolean;
  vitalRows: Array<VitalHistoryPoint & { id: string }>;
  openFilePicker: () => void;
  openFilePreview: (file: FileRecord) => void;
  downloadFile: (file: FileRecord) => void;
  openVitalEditor: (vital?: VitalHistoryPoint & { id?: string }) => void;
  openLabEditor: (lab?: LabRow) => void;
  openMedicationEditor: (medication?: MedRow) => void;
  openFileEditor: (file: FileRecord) => void;
  handleDeleteEntity: (entity: CrudEntity, id: string) => Promise<void>;
  deletingKey: string | null;
}) {
  const { t } = useLocale();
  const isDeleting = (entity: CrudEntity, id: string) => deletingKey === `${entity}:${id}`;
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab);
  const [selectedLabGroup, setSelectedLabGroup] = React.useState<LabGroupKey | 'all'>('all');
  const groupedLabResult = React.useMemo(() => {
    const labs = (record?.labs || []).map(classifyLab);
    const groups = (Object.keys(labGroupDefinitions) as LabGroupKey[])
      .map((groupKey) => {
        const definition = labGroupDefinitions[groupKey];
        const groupLabs = labs.filter((lab) => lab.groupKey === groupKey);
        const subGroups = Array.from(new Set(groupLabs.map((lab) => lab.subGroupName)))
          .map((subGroupName) => ({
            name: subGroupName,
            labs: groupLabs.filter((lab) => lab.subGroupName === subGroupName),
          }));

        return {
          key: groupKey,
          ...definition,
          labs: groupLabs,
          subGroups,
          abnormalCount: groupLabs.filter((lab) => lab.status !== 'normal').length,
          criticalCount: groupLabs.filter((lab) => lab.status === 'critical').length,
        };
      })
      .filter((group) => group.labs.length > 0);

    return {
      labs,
      groups,
      totalCount: labs.length,
      abnormalCount: labs.filter((lab) => lab.status !== 'normal').length,
      criticalCount: labs.filter((lab) => lab.status === 'critical').length,
      visibleGroups: selectedLabGroup === 'all' ? groups : groups.filter((group) => group.key === selectedLabGroup),
    };
  }, [record?.labs, selectedLabGroup]);

  React.useEffect(() => {
    if (selectedLabGroup !== 'all' && !groupedLabResult.groups.some((group) => group.key === selectedLabGroup)) {
      setSelectedLabGroup('all');
    }
  }, [groupedLabResult.groups, selectedLabGroup]);

  return (
    <main className={styles['pd-col-c']}>
      <button
        type="button"
        className={cx(styles, 'pd-accordion-head', isOpen && 'active')}
        onClick={onToggleOpen}
      >
        <div className={styles['pd-accordion-copy']}>
          <div className={styles['pd-accordion-title-row']}>
            <Stethoscope size={16} />
            <strong>{t('patientDetail.clinicalWorkspace')}</strong>
          </div>
          <small>{activeTabMeta?.label || t('patientDetail.overview')}</small>
        </div>
        <span className={cx(styles, 'pd-accordion-chevron', isOpen && 'active')}>
          <ChevronRight size={18} />
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles['pd-tabs-bar']}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cx(styles, 'pd-tab', activeTab === tab.id && 'active')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}{tab.label}
                {tab.badge && tab.badge !== '0' && (
                  <span className={cx(styles, 'pd-tab-badge', tab.id === 'labs' ? 'pd-badge-labs' : 'pd-badge-default')}>
                    {tab.badge}
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
            {activeTab === 'overview' && (
              <div className={cx(styles, 'pd-fade-in', 'pd-overview-pane')}>
                <div className={styles['pd-section-header']}>
                  <div className={styles['pd-section-title']}>{t('patientDetail.clinicalStatus')}</div>
                  <div className={styles['pd-inline-actions']}>
                    <button className={styles['pd-mini-action']} onClick={() => openVitalEditor()}><Plus size={13} /> {t('patientDetail.addVital')}</button>
                  </div>
                </div>
                <div className={styles['pd-status-grid']}>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>{t('patientDetail.neurological')} (GCS)</div>
                    <div className={styles['pd-s-value']}>{record?.vitals.gcs}</div>
                  </div>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>{t('patientDetail.respiratory')}</div>
                    <div className={styles['pd-s-value']}>{record?.vitals.rr} /min · SpO₂ {record?.vitals.spo2}%</div>
                  </div>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>{t('patientDetail.cardiac')}</div>
                    <div className={styles['pd-s-value']}>{record?.vitals.hr} bpm · {record?.vitals.bp} mmHg</div>
                  </div>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>{t('patientDetail.temperature')}</div>
                    <div className={cx(styles, 'pd-s-value', record && record.vitals.temp > 37.5 && 'text-orange')}>
                      {record?.vitals.temp}°C
                    </div>
                  </div>
                </div>

                {record?.clinicalNotes && (
                  <>
                    <div className={cx(styles, 'pd-section-title', 'pd-summary-title-spaced')}>{t('patientDetail.clinicalSummary')}</div>
                    <div className={styles['pd-clinical-note-box']}>{record.clinicalNotes}</div>
                  </>
                )}

                {vitalRows.length > 0 && (
                  <>
                    <div className={cx(styles, 'pd-section-title', 'pd-summary-title-spaced')}>{t('patientDetail.vitalHistory')}</div>
                    <div className={styles['pd-simple-list']}>
                      {vitalRows.map((vital) => (
                        <div key={vital.id} className={styles['pd-simple-item']}>
                          <div>
                            <strong>{new Date(vital.recordedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</strong>
                            <small>BP {vital.bp} · HR {vital.hr} · Temp {vital.temp}°C · RR {vital.rr} · SpO₂ {vital.spo2}% · GCS {vital.gcs}</small>
                          </div>
                          <div className={styles['pd-item-actions']}>
                            <button className={styles['pd-icon-mini']} onClick={() => openVitalEditor(vital)}><Pencil size={13} /></button>
                            <button className={styles['pd-icon-mini']} onClick={() => void handleDeleteEntity('vital', vital.id)} disabled={isDeleting('vital', vital.id)}>{isDeleting('vital', vital.id) ? '...' : <Trash2 size={13} />}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {record && record.labs.length > 0 && (
                  <>
                    <div className={cx(styles, 'pd-section-title', 'pd-alert-title-spaced')}>{t('patientDetail.criticalAlerts')}</div>
                    <div className={styles['pd-alerts-list']}>
                      {record.labs
                        .filter((lab) => lab.status === 'critical' || lab.status === 'high' || lab.status === 'low')
                        .map((lab) => (
                          <div key={lab.name} className={styles['pd-alert-row']} style={{ borderLeftColor: getStatusColor(lab.status) }}>
                            <div className={styles['pd-a-name']}>{lab.name}</div>
                            <div className={styles['pd-a-result']} style={{ color: getStatusColor(lab.status) }}>
                              {lab.result} {lab.unit}
                            </div>
                            <div
                              className={styles['pd-a-status']}
                              style={{ color: getStatusColor(lab.status), background: `${getStatusColor(lab.status)}12` }}
                            >
                              {getStatusLabel(lab.status)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'labs' && (
              <div className={styles['pd-fade-in']}>
                <div className={styles['pd-lab-workflow-head']}>
                  <div>
                    <div className={styles['pd-section-title']}>{t('patientDetail.labResults')}</div>
                    <p>{t('patientDetail.labStructureHint')}</p>
                  </div>
                  <button className={styles['pd-mini-action']} onClick={() => openLabEditor()}><Plus size={13} /> {t('patientDetail.addLab')}</button>
                </div>
                {record && record.labs.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <FlaskConical size={36} strokeWidth={1} />
                    <p>{t('patientDetail.noLabResults')}</p>
                    <small>{t('patientDetail.labResultsAppear')}</small>
                  </div>
                ) : (
                  <div className={styles['pd-lab-workflow']}>
                    <div className={styles['pd-lab-summary-grid']}>
                      <button
                        type="button"
                        className={cx(styles, 'pd-lab-summary-card', selectedLabGroup === 'all' && 'active')}
                        onClick={() => setSelectedLabGroup('all')}
                      >
                        <span>{t('patientDetail.allResults')}</span>
                        <strong>{groupedLabResult.totalCount}</strong>
                        <small>{groupedLabResult.abnormalCount} {t('patientDetail.abnormal')} · {groupedLabResult.criticalCount} {t('patientDetail.critical')}</small>
                      </button>
                      {groupedLabResult.groups.map((group) => (
                        <button
                          key={group.key}
                          type="button"
                          className={cx(styles, 'pd-lab-summary-card', selectedLabGroup === group.key && 'active')}
                          style={{ '--lab-tone': group.tone } as React.CSSProperties}
                          onClick={() => setSelectedLabGroup(group.key)}
                        >
                          <span>{group.name}</span>
                          <strong>{group.labs.length}</strong>
                          <small>{group.abnormalCount} {t('patientDetail.abnormal')} · {group.description}</small>
                        </button>
                      ))}
                    </div>

                    <div className={styles['pd-lab-filterbar']}>
                      <button
                        type="button"
                        className={cx(styles, 'pd-lab-filter', selectedLabGroup === 'all' && 'active')}
                        onClick={() => setSelectedLabGroup('all')}
                      >
                        {t('patientDetail.allGroups')} <span>{groupedLabResult.totalCount}</span>
                      </button>
                      {groupedLabResult.groups.map((group) => (
                        <button
                          key={group.key}
                          type="button"
                          className={cx(styles, 'pd-lab-filter', selectedLabGroup === group.key && 'active')}
                          onClick={() => setSelectedLabGroup(group.key)}
                        >
                          {group.name} <span>{group.labs.length}</span>
                        </button>
                      ))}
                    </div>

                    <div className={styles['pd-lab-group-stack']}>
                      {groupedLabResult.visibleGroups.map((group) => (
                        <section key={group.key} className={styles['pd-lab-group']} style={{ '--lab-tone': group.tone } as React.CSSProperties}>
                          <div className={styles['pd-lab-group-head']}>
                            <div>
                              <div className={styles['pd-lab-group-kicker']}>lab_items_group</div>
                              <h3>{group.name}</h3>
                              <p>{group.description}</p>
                            </div>
                            <div className={styles['pd-lab-group-counts']}>
                              <span>{group.labs.length} {t('patientDetail.items')}</span>
                              {group.abnormalCount > 0 && <strong>{group.abnormalCount} {t('patientDetail.abnormal')}</strong>}
                            </div>
                          </div>

                          {group.subGroups.map((subGroup) => (
                            <div key={subGroup.name} className={styles['pd-lab-subgroup']}>
                              <div className={styles['pd-lab-subgroup-head']}>
                                <div>
                                  <span>lab_items_sub_group</span>
                                  <strong>{subGroup.name}</strong>
                                </div>
                                <small>{subGroup.labs.length} {t('patientDetail.labItems')}</small>
                              </div>
                              <div className={styles['pd-lab-table-wrap']}>
                                <table className={styles['pd-lab-table']}>
                                  <thead>
                                    <tr>
                                      <th>{t('patientDetail.labItem')}</th>
                                      <th>{t('patientDetail.result')}</th>
                                      <th>{t('patientDetail.reference')}</th>
                                      <th>Status</th>
                                      <th>{t('patientDetail.actions')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subGroup.labs.map((lab) => (
                                      <tr key={lab.id} className={lab.status !== 'normal' ? styles['pd-lab-row-alert'] : undefined}>
                                        <td>
                                          <strong>{lab.name}</strong>
                                          <small>{lab.groupName} · {lab.subGroupName}</small>
                                        </td>
                                        <td style={{ color: getStatusColor(lab.status), fontWeight: 700 }}>
                                          {lab.result} <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.7em' }}>{lab.unit}</span>
                                        </td>
                                        <td className={styles['pd-lab-ref']}>{lab.ref || '—'}</td>
                                        <td>
                                          <span
                                            className={styles['pd-lab-status']}
                                            style={{ color: getStatusColor(lab.status), background: `${getStatusColor(lab.status)}15` }}
                                          >
                                            {getTrendIcon(lab.status)} {getStatusLabel(lab.status)}
                                          </span>
                                        </td>
                                        <td className={styles['pd-table-actions']}>
                                          <button className={styles['pd-icon-mini']} onClick={() => openLabEditor(lab)}><Pencil size={13} /></button>
                                          <button className={styles['pd-icon-mini']} onClick={() => void handleDeleteEntity('lab', lab.id)} disabled={isDeleting('lab', lab.id)}>{isDeleting('lab', lab.id) ? '...' : <Trash2 size={13} />}</button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </section>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className={styles['pd-fade-in']}>
                <div className={styles['pd-section-header']}>
                  <div className={styles['pd-section-title']}>{t('patientDetail.medications')}</div>
                  <button className={styles['pd-mini-action']} onClick={() => openMedicationEditor()}><Plus size={13} /> {t('patientDetail.addMedication')}</button>
                </div>
                {record && record.medications.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <Pill size={36} strokeWidth={1} />
                    <p>{t('patientDetail.noMedicationsRecorded')}</p>
                  </div>
                ) : (
                  <div className={styles['pd-med-list']}>
                    {record?.medications.map((medication) => (
                      <div key={medication.id} className={styles['pd-med-card']}>
                        <div className={styles['pd-med-icon']}><Syringe size={18} /></div>
                        <div className={styles['pd-med-info']}>
                          <div className={styles['pd-med-name']}>
                            {medication.name} <span className={styles['pd-med-dose']}>{medication.dose}</span>
                          </div>
                          <div className={styles['pd-med-meta']}>{medication.freq} · {t('patientDetail.via')} {medication.route}</div>
                          <div className={styles['pd-med-category']}>{medication.category}</div>
                        </div>
                        <div className={styles['pd-med-start']}><Clock size={12} />{medication.start}</div>
                        <div className={styles['pd-item-actions']}>
                          <button className={styles['pd-icon-mini']} onClick={() => openMedicationEditor(medication)}><Pencil size={13} /></button>
                          <button className={styles['pd-icon-mini']} onClick={() => void handleDeleteEntity('medication', medication.id)} disabled={isDeleting('medication', medication.id)}>{isDeleting('medication', medication.id) ? '...' : <Trash2 size={13} />}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'imaging' && (
              <div className={styles['pd-fade-in']}>
                <div className={styles['pd-file-toolbar']}>
                  <div>
                    <div className={cx(styles, 'pd-section-title', 'pd-section-title-compact')}>{t('patientDetail.fileLibrary')}</div>
                    <div className={styles['pd-file-toolbar-subtitle']}>
                      {record?.files.length || 0} files stored in `case_file`
                    </div>
                  </div>
                  <div className={styles['pd-file-toolbar-actions']}>
                    <button className={styles['pd-file-upload-btn']} onClick={openFilePicker} disabled={isUploading}>
                      <UploadCloud size={14} />
                      {isUploading ? t('patientDetail.uploading') : t('patientDetail.uploadFile')}
                    </button>
                  </div>
                </div>

                <div className={styles['pd-file-filterbar']}>
                  {fileCategoryOptions.map((option) => {
                    const count = option.id === 'all'
                      ? record?.files.length || 0
                      : record?.files.filter((file) => file.category === option.id).length || 0;

                    return (
                      <button
                        key={option.id}
                        className={cx(styles, 'pd-file-filter', selectedFileCategory === option.id && 'active')}
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
                    <p>{t('patientDetail.noImagingFiles')}</p>
                    <small>{t('patientDetail.uploadedStudiesAppear')}</small>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <ImageIcon size={36} strokeWidth={1} />
                    <p>{t('patientDetail.noFilesCategory')}</p>
                    <small>{t('patientDetail.tryAnotherFilterUpload')}</small>
                  </div>
                ) : (
                  <div className={styles['pd-imaging-grid']}>
                    {filteredFiles.map((file, i) => {
                      const isImaging = file.category === 'imaging' || file.fileType === 'image' || file.fileType === 'dicom';
                      const previewLabel = file.description || file.fileName;

                      return (
                        <div
                          key={file.id}
                          className={cx(styles, 'pd-img-card', file.fileUrl && 'clickable')}
                          onClick={() => openFilePreview(file)}
                          role={file.fileUrl ? 'button' : undefined}
                          tabIndex={file.fileUrl ? 0 : -1}
                          onKeyDown={(event) => {
                            if (!file.fileUrl) return;
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openFilePreview(file);
                            }
                          }}
                        >
                          <div className={cx(styles, 'pd-img-preview', `scan-style-${(i % 3) + 1}`)}>
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
                                  onClick={(event) => {
                                    event.stopPropagation();
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
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    downloadFile(file);
                                  }}
                                >
                                  <Download size={12} /> Download
                                </button>
                              )}
                              <button
                                type="button"
                                className={styles['pd-img-action-btn']}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openFileEditor(file);
                                }}
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                className={styles['pd-img-action-btn']}
                                disabled={isDeleting('file', file.id)}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleDeleteEntity('file', file.id);
                                }}
                              >
                                <Trash2 size={12} /> {isDeleting('file', file.id) ? 'Deleting...' : 'Delete'}
                              </button>
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
        </>
      )}
    </main>
  );
}

export function PatientActivityPanel({
  activePanel,
  setActivePanel,
  isOpen,
  onToggleOpen,
  notes,
  orderSummaries,
  messages,
  progressNoteInput,
  setProgressNoteInput,
  showProgressNoteModal,
  setShowProgressNoteModal,
  chatInput,
  setChatInput,
  chatEndRef,
  openNoteEditor,
  openOrderSummaryEditor,
  handleDeleteEntity,
  deletingKey,
  isPostingNote,
  handlePostNote,
  handleSendChat,
}: {
  activePanel: 'notes' | 'chat';
  setActivePanel: React.Dispatch<React.SetStateAction<'notes' | 'chat'>>;
  isOpen: boolean;
  onToggleOpen: () => void;
  notes: NoteItem[];
  orderSummaries: OrderSummaryItem[];
  messages: MessageItem[];
  progressNoteInput: { s: string; o: string; a: string; p: string; oneDay: string; continuation: string };
  setProgressNoteInput: React.Dispatch<React.SetStateAction<{ s: string; o: string; a: string; p: string; oneDay: string; continuation: string }>>;
  showProgressNoteModal: boolean;
  setShowProgressNoteModal: React.Dispatch<React.SetStateAction<boolean>>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  openNoteEditor: (note: NoteRow) => void;
  openOrderSummaryEditor: (summary?: OrderSummaryRow) => void;
  handleDeleteEntity: (entity: CrudEntity, id: string) => Promise<void>;
  deletingKey: string | null;
  isPostingNote: boolean;
  handlePostNote: () => Promise<void>;
  handleSendChat: () => void;
}) {
  const isDeleting = (entity: CrudEntity, id: string) => deletingKey === `${entity}:${id}`;
  const [noteFilter, setNoteFilter] = React.useState<'all' | 'progress' | 'orders'>('all');

  const filteredNotes = React.useMemo(() => {
    if (noteFilter === 'progress') {
      return notes.filter((note) => note.soap);
    }
    if (noteFilter === 'orders') {
      return notes.filter((note) => note.orders && (note.orders.oneDay || note.orders.continuation));
    }
    return notes;
  }, [noteFilter, notes]);

  const currentPlanNote = React.useMemo(
    () => notes.find((note) => note.soap?.p || note.orders?.oneDay || note.orders?.continuation) || null,
    [notes],
  );

  const applyProgressTemplate = (template: 'followup' | 'acute' | 'clear') => {
    if (template === 'clear') {
      setProgressNoteInput({ s: '', o: '', a: '', p: '', oneDay: '', continuation: '' });
      return;
    }

    if (template === 'followup') {
      setProgressNoteInput({
        s: 'Patient reports symptom change since last review.',
        o: 'Latest vitals reviewed. Focused physical exam performed.',
        a: 'Clinical status reassessed against prior impression.',
        p: 'Continue monitoring response to treatment and adjust plan as needed.',
        oneDay: '',
        continuation: 'Continue current treatment and scheduled monitoring.',
      });
      return;
    }

    setProgressNoteInput({
      s: 'Acute concern reviewed after clinical change.',
      o: 'Urgent bedside assessment performed with current vital signs and available results.',
      a: 'Acute problem evaluated and immediate risks reviewed.',
      p: 'Escalate monitoring, review investigations, and communicate plan with care team.',
      oneDay: 'Repeat focused assessment and urgent investigations today.',
      continuation: '',
    });
  };

  const noteFilterCounts = {
    all: notes.length,
    progress: notes.filter((note) => note.soap).length,
    orders: notes.filter((note) => note.orders && (note.orders.oneDay || note.orders.continuation)).length,
  };
  const combinedOrderSummary = React.useMemo(() => ({
    oneDay: orderSummaries
      .filter((summary) => summary.oneDay.trim())
      .map((summary) => ({ id: summary.id, label: `${summary.time} · ${summary.author}`, text: summary.oneDay.trim() })),
    continuation: orderSummaries
      .filter((summary) => summary.continuation.trim())
      .map((summary) => ({ id: summary.id, label: `${summary.time} · ${summary.author}`, text: summary.continuation.trim() })),
  }), [orderSummaries]);

  return (
    <div className={styles['pd-col-r']}>
      <button
        type="button"
        className={cx(styles, 'pd-accordion-head', isOpen && 'active')}
        onClick={onToggleOpen}
      >
        <div className={styles['pd-accordion-copy']}>
          <div className={styles['pd-accordion-title-row']}>
            <FileText size={16} />
            <strong>Activity</strong>
          </div>
          <small>{activePanel === 'notes' ? 'Progress Note & Order' : 'Case Chat'}</small>
        </div>
        <span className={cx(styles, 'pd-accordion-chevron', isOpen && 'active')}>
          <ChevronRight size={18} />
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles['pd-panel-switcher']}>
            <button className={cx(styles, 'pd-ps-btn', activePanel === 'notes' && 'active')} onClick={() => setActivePanel('notes')}>
              <FileText size={14} /> Progress Note & Order <span className={styles['pd-ps-count']}>{notes.length}</span>
            </button>
            <button className={cx(styles, 'pd-ps-btn', activePanel === 'chat' && 'active')} onClick={() => setActivePanel('chat')}>
              <MessageCircle size={14} /> Case Chat <span className={styles['pd-ps-count']}>{messages.length}</span>
            </button>
          </div>

          {activePanel === 'notes' && (
        <div className={cx(styles, 'pd-panel', 'pd-notes-panel')}>
          <div className={styles['pd-notes-toolbar']}>
            <div className={styles['pd-notes-toolbar-head']}>
              <strong>Progress Note & Order</strong>
              <small>{notes.length} documented note{notes.length === 1 ? '' : 's'}</small>
            </div>
            <div className={styles['pd-notes-filterbar']}>
              {[
                ['all', 'All'],
                ['progress', 'Progress'],
                ['orders', 'Orders'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={cx(styles, 'pd-notes-filter', noteFilter === key && 'active')}
                  onClick={() => setNoteFilter(key as 'all' | 'progress' | 'orders')}
                >
                  {label}
                  <span>{noteFilterCounts[key as 'all' | 'progress' | 'orders']}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles['pd-order-summary-panel']}>
            <div className={styles['pd-order-summary-head']}>
              <div>
                <strong>Order Summary</strong>
                <small>{orderSummaries.length} saved summary{orderSummaries.length === 1 ? '' : 'ies'}</small>
              </div>
              <button type="button" className={styles['pd-mini-action']} onClick={() => openOrderSummaryEditor()}>
                <Plus size={13} /> Add Summary
              </button>
            </div>
            {orderSummaries.length === 0 ? (
              <div className={styles['pd-order-summary-empty']}>
                <ClipboardList size={20} />
                <span>No saved order summary yet</span>
              </div>
            ) : (
              <div className={styles['pd-order-summary-list']}>
                <div className={styles['pd-order-summary-combined-grid']}>
                  <div className={cx(styles, 'pd-order-summary-card', 'pd-order-summary-card-combined')}>
                    <div className={styles['pd-order-summary-meta']}>
                      <div>
                        <strong>Combined One Day</strong>
                        <div className={styles['pd-order-summary-meta-row']}>
                          <small>All one-day orders in one view</small>
                          <span className={styles['pd-order-summary-badge']}>Combined</span>
                        </div>
                      </div>
                    </div>
                    <div className={cx(styles, 'pd-order-summary-block', 'pd-order-summary-block-oneday')}>
                      <span>Order for One Day</span>
                      {combinedOrderSummary.oneDay.length === 0 ? (
                        <p>—</p>
                      ) : (
                        <div className={styles['pd-order-summary-lines']}>
                          {combinedOrderSummary.oneDay.map((item) => (
                            <div key={item.id} className={styles['pd-order-summary-line']}>
                              <small>{item.label}</small>
                              <p>{item.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={cx(styles, 'pd-order-summary-card', 'pd-order-summary-card-combined')}>
                    <div className={styles['pd-order-summary-meta']}>
                      <div>
                        <strong>Combined Continuation</strong>
                        <div className={styles['pd-order-summary-meta-row']}>
                          <small>All continuation orders in one view</small>
                          <span className={styles['pd-order-summary-badge']}>Combined</span>
                        </div>
                      </div>
                    </div>
                    <div className={cx(styles, 'pd-order-summary-block', 'pd-order-summary-block-continuation')}>
                      <span>Order for Continuation</span>
                      {combinedOrderSummary.continuation.length === 0 ? (
                        <p>—</p>
                      ) : (
                        <div className={styles['pd-order-summary-lines']}>
                          {combinedOrderSummary.continuation.map((item) => (
                            <div key={item.id} className={styles['pd-order-summary-line']}>
                              <small>{item.label}</small>
                              <p>{item.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {orderSummaries.map((summary, index) => (
                  <div key={summary.id} className={styles['pd-order-summary-card']}>
                    <div className={styles['pd-order-summary-meta']}>
                      <div>
                        <strong>{summary.author}</strong>
                        <div className={styles['pd-order-summary-meta-row']}>
                          <small>{summary.role} · {summary.time}</small>
                          {index === 0 && (
                            <span className={styles['pd-order-summary-badge']}>Latest</span>
                          )}
                        </div>
                      </div>
                      <div className={styles['pd-item-actions']}>
                        <button className={styles['pd-icon-mini']} onClick={() => openOrderSummaryEditor(summary)}><Pencil size={13} /></button>
                        <button className={styles['pd-icon-mini']} onClick={() => void handleDeleteEntity('orderSummary', summary.id)} disabled={isDeleting('orderSummary', summary.id)}>{isDeleting('orderSummary', summary.id) ? '...' : <Trash2 size={13} />}</button>
                      </div>
                    </div>
                    <div className={styles['pd-order-summary-grid']}>
                      <div className={cx(styles, 'pd-order-summary-block', 'pd-order-summary-block-oneday')}>
                        <span>Order for One Day</span>
                        <p>{summary.oneDay || '—'}</p>
                      </div>
                      <div className={cx(styles, 'pd-order-summary-block', 'pd-order-summary-block-continuation')}>
                        <span>Order for Continuation</span>
                        <p>{summary.continuation || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {currentPlanNote && (
            <div className={styles['pd-current-plan']}>
              <div className={styles['pd-current-plan-head']}>
                <div>
                  <strong>Current Clinical Plan</strong>
                  <small>{currentPlanNote.author} · {currentPlanNote.time}</small>
                </div>
                <span className={styles['pd-current-plan-badge']}>Latest actionable note</span>
              </div>
              <div className={styles['pd-current-plan-body']}>
                {currentPlanNote.soap?.a && (
                  <div className={styles['pd-current-plan-block']}>
                    <span>Assessment</span>
                    <p>{currentPlanNote.soap.a}</p>
                  </div>
                )}
                {currentPlanNote.soap?.p && (
                  <div className={styles['pd-current-plan-block']}>
                    <span>Plan</span>
                    <p>{currentPlanNote.soap.p}</p>
                  </div>
                )}
                {currentPlanNote.orders?.oneDay && (
                  <div className={styles['pd-current-plan-block']}>
                    <span>Order for One Day</span>
                    <p>{currentPlanNote.orders.oneDay}</p>
                  </div>
                )}
                {currentPlanNote.orders?.continuation && (
                  <div className={styles['pd-current-plan-block']}>
                    <span>Order for Continuation</span>
                    <p>{currentPlanNote.orders.continuation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={styles['pd-panel-scroll']}>
            {filteredNotes.length === 0 ? (
              <div className={styles['pd-notes-empty']}>
                <FileText size={30} />
                <strong>No notes in this view</strong>
                <small>Try another filter or add a new progress note.</small>
              </div>
            ) : filteredNotes.map((note) => (
              <div key={note.id} className={styles['pd-note-timeline-item']}>
                <div className={styles['pd-note-timeline-rail']}>
                  <span className={styles['pd-note-timeline-dot']} style={{ backgroundColor: `#${note.color}` }} />
                </div>
                <div className={styles['pd-note-card']}>
                <div className={styles['pd-note-header']}>
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(note.author)}&background=${note.color}&color=fff&size=36`}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized
                  />
                  <div>
                    <strong>{note.author}</strong>
                    <small>{note.role}</small>
                  </div>
                  <span className={styles['pd-note-kind']}>
                    {note.soap ? 'Progress Note' : 'Consult Note'}
                  </span>
                  <span className={styles['pd-note-time']}>{note.time}</span>
                  <div className={styles['pd-item-actions']}>
                    <button className={styles['pd-icon-mini']} onClick={() => openNoteEditor(note)}><Pencil size={13} /></button>
                    <button className={styles['pd-icon-mini']} onClick={() => void handleDeleteEntity('note', note.id)} disabled={isDeleting('note', note.id)}>{isDeleting('note', note.id) ? '...' : <Trash2 size={13} />}</button>
                  </div>
                </div>
                {note.soap ? (
                  <div className={styles['pd-soap-blocks']}>
                    {note.soap.s && (
                      <div className={styles['pd-soap-block']}>
                        <div className={cx(styles, 'pd-soap-letter', 'pd-s-s')}>S</div>
                        <div className={styles['pd-soap-text']}>{note.soap.s}</div>
                      </div>
                    )}
                    {note.soap.o && (
                      <div className={styles['pd-soap-block']}>
                        <div className={cx(styles, 'pd-soap-letter', 'pd-s-o')}>O</div>
                        <div className={styles['pd-soap-text']}>{note.soap.o}</div>
                      </div>
                    )}
                    {note.soap.a && (
                      <div className={styles['pd-soap-block']}>
                        <div className={cx(styles, 'pd-soap-letter', 'pd-s-a')}>A</div>
                        <div className={styles['pd-soap-text']}>{note.soap.a}</div>
                      </div>
                    )}
                    {note.soap.p && (
                      <div className={styles['pd-soap-block']}>
                        <div className={cx(styles, 'pd-soap-letter', 'pd-s-p')}>P</div>
                        <div className={styles['pd-soap-text']}>{note.soap.p}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={styles['pd-note-body']}>{note.body}</p>
                )}
                {note.orders && (note.orders.oneDay || note.orders.continuation) && (
                  <div className={styles['pd-order-blocks']}>
                    {note.orders.oneDay && (
                      <div className={styles['pd-order-block']}>
                        <div className={styles['pd-order-title']}>⚡ Order for One Day</div>
                        <div className={styles['pd-order-text']}>{note.orders.oneDay}</div>
                      </div>
                    )}
                    {note.orders.continuation && (
                      <div className={styles['pd-order-block']}>
                        <div className={styles['pd-order-title']}>🔄 Order for Continuation</div>
                        <div className={styles['pd-order-text']}>{note.orders.continuation}</div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        <div className={styles['pd-notes-compose']}>
          <button className={styles['pd-btn-open-modal']} onClick={() => setShowProgressNoteModal(true)}>
            <Plus size={14} /> Write Progress Note & Orders
          </button>
        </div>
        </div>
          )}

          {showProgressNoteModal && (
        <div className={styles['pd-overlay']} onClick={(e) => { if (e.target === e.currentTarget) setShowProgressNoteModal(false); }}>
          <div className={cx(styles, 'pd-modal', 'pd-progress-note-modal')}>
            <div className={styles['pd-modal-hd']}>
              <h2>Write Progress Note & Orders</h2>
              <button onClick={() => setShowProgressNoteModal(false)}><X size={20} /></button>
            </div>
            
            <div className={styles['pd-progress-note-grid']}>
              <div className={styles['pd-pn-col']}>
                <div className={styles['pd-pn-templatebar']}>
                  <button
                    type="button"
                    className={styles['pd-pn-template-btn']}
                    data-tooltip="For routine reassessment and scheduled progress updates."
                    title="For routine reassessment and scheduled progress updates."
                    onClick={() => applyProgressTemplate('followup')}
                  >
                    <strong>Follow-up Review</strong>
                  </button>
                  <button
                    type="button"
                    className={styles['pd-pn-template-btn']}
                    data-tooltip="For urgent review after deterioration or a new concern."
                    title="For urgent review after deterioration or a new concern."
                    onClick={() => applyProgressTemplate('acute')}
                  >
                    <strong>Acute Change</strong>
                  </button>
                  <button
                    type="button"
                    className={styles['pd-pn-template-btn']}
                    data-tooltip="Start with an empty note and order form."
                    title="Start with an empty note and order form."
                    onClick={() => applyProgressTemplate('clear')}
                  >
                    <strong>Clear</strong>
                  </button>
                </div>
                <div className={styles['pd-pn-col-title']}>Progress Note (SOAP)</div>
                <div className={styles['pd-soap-form']}>
                  <div className={styles['pd-soap-field']}>
                    <label>S <span>Subjective</span></label>
                    <textarea
                      placeholder="Symptoms, history, patient complaints..."
                      value={progressNoteInput.s}
                      onChange={(e) => setProgressNoteInput((prev) => ({ ...prev, s: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className={styles['pd-soap-field']}>
                    <label>O <span>Objective</span></label>
                    <textarea
                      placeholder="Vitals, physical exam, lab results..."
                      value={progressNoteInput.o}
                      onChange={(e) => setProgressNoteInput((prev) => ({ ...prev, o: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className={styles['pd-soap-field']}>
                    <label>A <span>Assessment</span></label>
                    <textarea
                      placeholder="Diagnosis, clinical reasoning..."
                      value={progressNoteInput.a}
                      onChange={(e) => setProgressNoteInput((prev) => ({ ...prev, a: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className={styles['pd-soap-field']}>
                    <label>P <span>Plan</span></label>
                    <textarea
                      placeholder="Treatments, medications, further tests..."
                      value={progressNoteInput.p}
                      onChange={(e) => setProgressNoteInput((prev) => ({ ...prev, p: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <div className={styles['pd-pn-col']}>
                <div className={styles['pd-pn-col-title']}>Doctor's Orders</div>
                <div className={styles['pd-soap-form']}>
                  <div className={styles['pd-soap-field']}>
                    <label>⚡ Order for One Day</label>
                    <textarea
                      placeholder="STAT meds, one-time labs, specific instructions for today..."
                      value={progressNoteInput.oneDay}
                      onChange={(e) => setProgressNoteInput((prev) => ({ ...prev, oneDay: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className={styles['pd-soap-field']}>
                    <label>🔄 Order for Continuation</label>
                    <textarea
                      placeholder="Continue current IV, NPO, routine meds..."
                      value={progressNoteInput.continuation}
                      onChange={(e) => setProgressNoteInput((prev) => ({ ...prev, continuation: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles['pd-modal-ft']}>
              <button className={styles['pd-btn-cancel']} onClick={() => setShowProgressNoteModal(false)}>Cancel</button>
              <button
                className={styles['pd-btn-confirm']}
                onClick={handlePostNote}
                disabled={
                  !(progressNoteInput.s.trim() || progressNoteInput.o.trim() || progressNoteInput.a.trim() || progressNoteInput.p.trim() || progressNoteInput.oneDay.trim() || progressNoteInput.continuation.trim()) || isPostingNote
                }
              >
                {isPostingNote ? 'Posting...' : 'Post Progress Note'}
              </button>
            </div>
          </div>
        </div>
          )}

          {activePanel === 'chat' && (
        <div className={styles['pd-panel']}>
          <div className={styles['pd-panel-scroll']} id="pd-chat-scroll">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cx(styles, 'pd-chat-msg', message.isSystem ? 'system' : message.isSelf ? 'self' : 'other')}
              >
                {!message.isSelf && !message.isSystem && <div className={styles['pd-chat-sender']}>{message.sender}</div>}
                <div className={styles['pd-chat-bubble']}>
                  {message.text}
                  <span className={styles['pd-chat-time']}>{message.time}</span>
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
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSendChat();
                  }
                }}
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
        </>
      )}
    </div>
  );
}

export function PatientCrudEditorModal({
  editorState,
  setEditorState,
  isSaving,
  handleSaveEditor,
}: {
  editorState: any;
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  handleSaveEditor: () => Promise<void>;
}) {
  const { t } = useLocale();
  if (!editorState) return null;

  const setField = (field: string, value: string) => {
    setEditorState((prev: any) => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  const validateEditorState = () => {
    const errors: Record<string, string> = {};
    const data = editorState.data ?? {};

    if (editorState.entity === 'overview') {
      if (!String(data.name || '').trim()) errors.name = t('patientDetail.patientNameRequired');
      if (!String(data.hn || '').trim()) errors.hn = t('patientDetail.hnRequired');
      if (String(data.age || '').trim()) {
        const age = Number(data.age);
        if (!Number.isFinite(age) || age < 0 || age > 130) errors.age = t('patientDetail.ageRangeError');
      }
      if (String(data.dob || '').trim() && Number.isNaN(new Date(data.dob).getTime())) errors.dob = t('patientDetail.dobInvalid');
    }

    if (editorState.entity === 'vital') {
      if (!/^\d{2,3}\/\d{2,3}$/.test(String(data.bp || '').trim())) errors.bp = t('patientDetail.bpFormat');
      if (!String(data.gcs || '').trim()) errors.gcs = t('patientDetail.gcsRequired');
      if (!String(data.recordedAt || '').trim()) errors.recordedAt = t('patientDetail.recordedTimeRequired');
      const ranges = [
        ['hr', 1, 300, t('patientDetail.hrRange')],
        ['temp', 25, 45, t('patientDetail.tempRange')],
        ['rr', 1, 80, t('patientDetail.rrRange')],
        ['spo2', 0, 100, t('patientDetail.spo2Range')],
      ] as const;
      for (const [key, min, max, message] of ranges) {
        const raw = String(data[key] || '').trim();
        const value = Number(raw);
        if (!raw || !Number.isFinite(value) || value < min || value > max) errors[key] = message;
      }
    }

    if (editorState.entity === 'lab') {
      if (!String(data.name || '').trim()) errors.name = t('patientDetail.labNameRequired');
      if (!String(data.result || '').trim()) errors.result = t('patientDetail.resultRequired');
      if (!String(data.status || '').trim()) errors.status = t('patientDetail.statusRequired');
    }

    if (editorState.entity === 'medication') {
      if (!String(data.name || '').trim()) errors.name = t('patientDetail.medicationNameRequired');
      if (!String(data.dose || '').trim()) errors.dose = t('patientDetail.doseRequired');
      if (!String(data.freq || '').trim()) errors.freq = t('patientDetail.frequencyRequired');
      if (!String(data.route || '').trim()) errors.route = t('patientDetail.routeRequired');
    }

    if (editorState.entity === 'note' && !String(data.body || '').trim()) {
      errors.body = t('patientDetail.noteEmpty');
    }

    if (editorState.entity === 'orderSummary' && !String(data.oneDay || '').trim() && !String(data.continuation || '').trim()) {
      errors.oneDay = t('patientDetail.addOrderRequired');
      errors.continuation = t('patientDetail.addOrderRequired');
    }

    if (editorState.entity === 'file') {
      if (!String(data.fileName || '').trim()) errors.fileName = t('patientDetail.fileNameRequired');
      if (!String(data.category || '').trim()) errors.category = t('patientDetail.categoryRequired');
    }

    return errors;
  };

  const errors = validateEditorState();
  const hasErrors = Object.keys(errors).length > 0;

  const renderFields = () => {
    const renderError = (field: string) => (
      errors[field] ? <small className={styles['pd-form-error']}>{errors[field]}</small> : null
    );

    if (editorState.entity === 'overview') {
      return (
        <div className={styles['pd-form-grid']}>
          {[
            ['name', 'Patient Name'],
            ['hn', 'HN'],
            ['an', 'AN'],
            ['cid', 'CID'],
            ['age', 'Age'],
            ['gender', 'Gender'],
            ['bloodType', 'Blood Type'],
            ['phone', 'Phone'],
            ['dob', 'DOB'],
            ['district', 'District'],
            ['province', 'Province'],
          ].map(([key, label]) => (
            <label key={key} className={styles['pd-form-field']}>
              <span>{label}</span>
              <input
                type={key === 'dob' ? 'date' : key === 'age' ? 'number' : 'text'}
                value={editorState.data[key]}
                aria-invalid={Boolean(errors[key])}
                className={errors[key] ? styles['pd-form-field-invalid'] : undefined}
                onChange={(event) => setField(key, event.target.value)}
              />
              {renderError(key)}
            </label>
          ))}
          {[
            ['conditions', 'Conditions'],
            ['allergies', 'Allergies'],
            ['chiefComplaint', 'Chief Complaint'],
            ['presentIllness', 'Present Illness'],
            ['initialDiagnosis', 'Initial Diagnosis'],
            ['clinicalNotes', 'Clinical Notes'],
          ].map(([key, label]) => (
            <label key={key} className={cx(styles, 'pd-form-field', 'pd-form-field-full')}>
              <span>{label}</span>
              <textarea rows={key === 'clinicalNotes' ? 4 : 2} value={editorState.data[key]} onChange={(event) => setField(key, event.target.value)} />
              {renderError(key)}
            </label>
          ))}
        </div>
      );
    }

    if (editorState.entity === 'vital') {
      return (
        <div className={styles['pd-form-grid']}>
          {['bp', 'hr', 'temp', 'rr', 'spo2', 'gcs'].map((key) => (
            <label key={key} className={styles['pd-form-field']}>
              <span>{key.toUpperCase()}</span>
              <input value={editorState.data[key]} aria-invalid={Boolean(errors[key])} className={errors[key] ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField(key, event.target.value)} />
              {renderError(key)}
            </label>
          ))}
          <label className={cx(styles, 'pd-form-field', 'pd-form-field-full')}>
            <span>Recorded At</span>
            <input type="datetime-local" value={editorState.data.recordedAt} aria-invalid={Boolean(errors.recordedAt)} className={errors.recordedAt ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('recordedAt', event.target.value)} />
            {renderError('recordedAt')}
          </label>
        </div>
      );
    }

    if (editorState.entity === 'lab') {
      const classification = getLabClassification(editorState.data.name || '');

      return (
        <div className={styles['pd-form-grid']}>
          <div className={cx(styles, 'pd-lab-auto-classification', 'pd-form-field-full')} style={{ '--lab-tone': classification.tone } as React.CSSProperties}>
            <div>
              <span>Auto classification</span>
              <strong>{classification.groupName}</strong>
              <small>{classification.description}</small>
            </div>
            <div>
              <span>lab_items_sub_group</span>
              <strong>{classification.subGroupName}</strong>
              <small>{editorState.data.name ? 'Calculated from lab item name' : 'Type lab name to classify automatically'}</small>
            </div>
          </div>
          {['name', 'result', 'unit', 'ref'].map((key) => (
            <label key={key} className={styles['pd-form-field']}><span>{key === 'ref' ? 'Reference' : key[0].toUpperCase() + key.slice(1)}</span><input value={editorState.data[key]} aria-invalid={Boolean(errors[key])} className={errors[key] ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField(key, event.target.value)} />{renderError(key)}</label>
          ))}
          <label className={styles['pd-form-field']}><span>Status</span><select value={editorState.data.status} aria-invalid={Boolean(errors.status)} className={errors.status ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('status', event.target.value)}><option value="normal">normal</option><option value="high">high</option><option value="low">low</option><option value="critical">critical</option></select>{renderError('status')}</label>
        </div>
      );
    }

    if (editorState.entity === 'medication') {
      return (
        <div className={styles['pd-form-grid']}>
          {['name', 'dose', 'freq', 'route', 'start', 'category'].map((key) => (
            <label key={key} className={styles['pd-form-field']}><span>{key[0].toUpperCase() + key.slice(1)}</span><input type={key === 'start' ? 'date' : 'text'} value={editorState.data[key]} aria-invalid={Boolean(errors[key])} className={errors[key] ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField(key, event.target.value)} />{renderError(key)}</label>
          ))}
        </div>
      );
    }

    if (editorState.entity === 'note') {
      return (
        <label className={cx(styles, 'pd-form-field', 'pd-form-field-full')}>
          <span>Note</span>
          <textarea rows={5} value={editorState.data.body} aria-invalid={Boolean(errors.body)} className={errors.body ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('body', event.target.value)} />
          {renderError('body')}
        </label>
      );
    }

    if (editorState.entity === 'orderSummary') {
      return (
        <div className={styles['pd-form-grid']}>
          <label className={cx(styles, 'pd-form-field', 'pd-form-field-full')}>
            <span>Order for One Day</span>
            <textarea rows={4} value={editorState.data.oneDay} aria-invalid={Boolean(errors.oneDay)} className={errors.oneDay ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('oneDay', event.target.value)} />
            {renderError('oneDay')}
          </label>
          <label className={cx(styles, 'pd-form-field', 'pd-form-field-full')}>
            <span>Order for Continuation</span>
            <textarea rows={4} value={editorState.data.continuation} aria-invalid={Boolean(errors.continuation)} className={errors.continuation ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('continuation', event.target.value)} />
            {renderError('continuation')}
          </label>
        </div>
      );
    }

    return (
      <div className={styles['pd-form-grid']}>
        <label className={styles['pd-form-field']}><span>File Name</span><input value={editorState.data.fileName} aria-invalid={Boolean(errors.fileName)} className={errors.fileName ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('fileName', event.target.value)} />{renderError('fileName')}</label>
        <label className={styles['pd-form-field']}><span>Category</span><input value={editorState.data.category} aria-invalid={Boolean(errors.category)} className={errors.category ? styles['pd-form-field-invalid'] : undefined} onChange={(event) => setField('category', event.target.value)} />{renderError('category')}</label>
        <label className={cx(styles, 'pd-form-field', 'pd-form-field-full')}><span>Description</span><textarea rows={4} value={editorState.data.description} onChange={(event) => setField('description', event.target.value)} /></label>
      </div>
    );
  };

  return (
    <div className={styles['pd-overlay']} onClick={() => setEditorState(null)}>
      <div className={cx(styles, 'pd-modal', 'pd-editor-modal')} onClick={(event) => event.stopPropagation()}>
        <div className={styles['pd-modal-hd']}>
          <h2>{editorState.mode === 'add' ? t('patientDetail.editorAdd') : t('patientDetail.editorEdit')} {editorState.entity}</h2>
          <button onClick={() => setEditorState(null)} aria-label={t('patientDetail.closeEditor')}><X size={18} /></button>
        </div>
        {hasErrors && <div className={styles['pd-form-banner']}>{t('patientDetail.fixHighlightedFields')}</div>}
        {renderFields()}
        <div className={styles['pd-modal-ft']}>
          <button className={styles['pd-btn-cancel']} onClick={() => setEditorState(null)} disabled={isSaving}>{t('patientDetail.cancelLabel')}</button>
          <button className={styles['pd-btn-confirm']} onClick={() => void handleSaveEditor()} disabled={isSaving || hasErrors}>{isSaving ? t('patientDetail.savingLabel') : t('patientDetail.saveLabel')}</button>
        </div>
      </div>
    </div>
  );
}

export function PatientPreviewOverlay({
  previewFile,
  setPreviewFile,
  downloadFile,
}: {
  previewFile: FileRecord | null;
  setPreviewFile: React.Dispatch<React.SetStateAction<FileRecord | null>>;
  downloadFile: (file: FileRecord) => void;
}) {
  const { t } = useLocale();
  if (!previewFile) return null;

  return (
    <div className={styles['pd-overlay']} onClick={() => setPreviewFile(null)}>
      <div className={styles['pd-preview-modal']} onClick={(event) => event.stopPropagation()}>
        <div className={styles['pd-preview-modal-hd']}>
          <div>
            <h2>{previewFile.fileName}</h2>
            <p>{previewFile.description || t('patientDetail.previewFallback')}</p>
          </div>
          <button className={styles['pd-preview-close']} onClick={() => setPreviewFile(null)} aria-label={t('patientDetail.closePreview')}>
            <X size={18} />
          </button>
        </div>

        <div className={styles['pd-preview-stage']}>
          {previewFile.fileType === 'image' && previewFile.fileUrl ? (
            <Image
              src={previewFile.fileUrl}
              alt={previewFile.fileName}
              className={styles['pd-preview-image']}
              width={1200}
              height={800}
              unoptimized
            />
          ) : previewFile.fileType === 'dicom' ? (
            <div className={styles['pd-preview-placeholder']}>
              <ImageIcon size={42} />
              <strong>{t('patientDetail.dicomStudy')}</strong>
              <p>{t('patientDetail.dicomPreviewHint')}</p>
            </div>
          ) : previewFile.fileType === 'csv' ? (
            <div className={styles['pd-preview-placeholder']}>
              <FileText size={42} />
              <strong>{t('patientDetail.csvDataFile')}</strong>
              <p>{t('patientDetail.csvPreviewHint')}</p>
            </div>
          ) : previewFile.fileUrl ? (
            <iframe title={previewFile.fileName} src={previewFile.fileUrl} className={styles['pd-preview-frame']} />
          ) : (
            <div className={styles['pd-preview-placeholder']}>
              <FileText size={42} />
              <strong>{t('patientDetail.noPreviewAvailable')}</strong>
              <p>{t('patientDetail.noPreviewHint')}</p>
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
              <button className={cx(styles, 'pd-preview-btn', 'pd-preview-action-primary')} onClick={() => downloadFile(previewFile)}>
                <Download size={14} /> {t('patientDetail.downloadLabel')}
              </button>
            )}
            <button className={cx(styles, 'pd-preview-btn', 'pd-preview-btn-secondary')} onClick={() => setPreviewFile(null)}>
              {t('patientDetail.closeLabel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseBloodPressure(bp: string) {
  const [systolic = '0', diastolic = '0'] = bp.split('/');
  return {
    systolic: Number.parseInt(systolic, 10) || 0,
    diastolic: Number.parseInt(diastolic, 10) || 0,
  };
}

function parseGcsScore(gcs: string) {
  const match = gcs.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function formatVitalTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function buildPolyline(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

type TrendSeries = {
  key: string;
  label: string;
  color: string;
  values: number[];
  latestLabel: string;
};

type TrendSeriesWithPoints = TrendSeries & {
  points: Array<{ x: number; y: number }>;
  min: number;
  max: number;
  scaleMin?: number;
  scaleMax?: number;
  referenceRange?: {
    min: number;
    max: number;
    label: string;
  };
  band?: {
    top: number;
    bottom: number;
    center: number;
    plotTop: number;
    plotBottom: number;
  };
};

type GraphMode = 'normalized' | 'multi-axis';

function createSeries(metric: VitalMetricKey, vitalsHistory: VitalHistoryPoint[]): TrendSeries[] {
  if (metric === 'bp') {
    const latestBp = parseBloodPressure(vitalsHistory[vitalsHistory.length - 1]?.bp || '0/0');
    return [
      {
        key: 'bp-systolic',
        label: 'BP Systolic',
        color: vitalMeta.bp.lineColor,
        values: vitalsHistory.map((item) => parseBloodPressure(item.bp).systolic),
        latestLabel: latestBp.systolic ? `${latestBp.systolic}` : '—',
      },
      {
        key: 'bp-diastolic',
        label: 'BP Diastolic',
        color: '#60a5fa',
        values: vitalsHistory.map((item) => parseBloodPressure(item.bp).diastolic),
        latestLabel: latestBp.diastolic ? `${latestBp.diastolic}` : '—',
      },
    ];
  }

  return [
    {
      key: metric,
      label: vitalMeta[metric].label,
      color: vitalMeta[metric].lineColor,
      values: vitalsHistory.map((item) => {
        if (metric === 'gcs') return parseGcsScore(item.gcs);
        return Number(item[metric] || 0);
      }),
      latestLabel: metric === 'temp'
        ? `${vitalsHistory[vitalsHistory.length - 1]?.temp ?? '—'}°C`
        : metric === 'spo2'
          ? `${vitalsHistory[vitalsHistory.length - 1]?.spo2 ?? '—'}%`
          : metric === 'gcs'
            ? vitalsHistory[vitalsHistory.length - 1]?.gcs || '—'
            : `${vitalsHistory[vitalsHistory.length - 1]?.[metric] ?? '—'}`,
    },
  ];
}

function formatHoveredValue(series: TrendSeries, index: number) {
  if (series.key === 'bp-systolic' || series.key === 'bp-diastolic') {
    return `${series.values[index]}`;
  }

  const value = series.values[index];
  if (series.key === 'temp') return `${value}°C`;
  if (series.key === 'spo2') return `${value}%`;
  if (series.key === 'gcs') return `${value}`;
  return `${value}`;
}

function formatAxisValue(value: number, seriesKey?: string) {
  if (seriesKey === 'temp') return `${value.toFixed(1)}°C`;
  if (seriesKey === 'spo2') return `${Math.round(value)}%`;
  if (seriesKey === 'bp-systolic' || seriesKey === 'bp-diastolic') return `${Math.round(value)}`;
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function getSeriesLaneKey(seriesKey: string) {
  if (seriesKey === 'bp-systolic' || seriesKey === 'bp-diastolic') return 'bp';
  return seriesKey;
}

function getSeriesLaneLabel(seriesKey: string, label: string) {
  if (seriesKey === 'bp-systolic' || seriesKey === 'bp-diastolic') return 'Blood Pressure';
  return label;
}

function getSeriesReferenceRange(seriesKey: string) {
  switch (seriesKey) {
    case 'hr':
      return { min: 60, max: 100, label: 'Target 60-100 bpm' };
    case 'bp-systolic':
      return { min: 90, max: 120, label: 'Target 90-120 mmHg' };
    case 'bp-diastolic':
      return { min: 60, max: 80, label: 'Target 60-80 mmHg' };
    case 'temp':
      return { min: 36.5, max: 37.5, label: 'Target 36.5-37.5°C' };
    case 'rr':
      return { min: 12, max: 20, label: 'Target 12-20 /min' };
    case 'spo2':
      return { min: 95, max: 100, label: 'Target 95-100%' };
    case 'gcs':
      return { min: 13, max: 15, label: 'Target 13-15' };
    default:
      return null;
  }
}

function getReferenceStatus(value: number, referenceRange?: { min: number; max: number; label: string }) {
  if (!referenceRange) return null;
  if (value < referenceRange.min) return { tone: 'low', label: 'Low' };
  if (value > referenceRange.max) return { tone: 'high', label: 'High' };
  return { tone: 'ok', label: 'Within target' };
}

function buildTrendChartData(selectedMetrics: VitalMetricKey[], vitalsHistory: VitalHistoryPoint[], mode: GraphMode) {
  if (vitalsHistory.length === 0 || selectedMetrics.length === 0) {
    return null;
  }

  const width = 640;
  const height = 240;
  const paddingX = 28;
  const paddingTop = 24;
  const paddingBottom = 34;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;

  const series = selectedMetrics.flatMap((metric) => createSeries(metric, vitalsHistory));

  const xForIndex = (index: number) => (
    paddingX + (vitalsHistory.length === 1 ? usableWidth / 2 : (usableWidth * index) / (vitalsHistory.length - 1))
  );

  const normalizedSeries: TrendSeriesWithPoints[] = series.map((line) => {
    const localMin = Math.min(...line.values);
    const localMax = Math.max(...line.values);
    const localRange = localMax - localMin || 1;
    return {
      ...line,
      min: localMin,
      max: localMax,
      points: line.values.map((value, index) => ({
        x: xForIndex(index),
        y: localMax === localMin
          ? paddingTop + usableHeight / 2
          : paddingTop + ((localMax - value) / localRange) * usableHeight,
      })),
    };
  });

  const laneDefinitions = Array.from(new Map(
    series.map((line) => [getSeriesLaneKey(line.key), { key: getSeriesLaneKey(line.key), label: getSeriesLaneLabel(line.key, line.label) }]),
  ).values());
  const laneGap = laneDefinitions.length > 1 ? Math.min(14, usableHeight * 0.06) : 0;
  const laneHeight = (usableHeight - laneGap * Math.max(laneDefinitions.length - 1, 0)) / Math.max(laneDefinitions.length, 1);
  const laneIndexMap = new Map(laneDefinitions.map((lane, index) => [lane.key, index]));

  const multiAxisSeries: TrendSeriesWithPoints[] = series.map((line) => {
    const localMin = Math.min(...line.values);
    const localMax = Math.max(...line.values);
    const referenceRange = getSeriesReferenceRange(line.key);
    const scaleMin = referenceRange ? Math.min(localMin, referenceRange.min) : localMin;
    const scaleMax = referenceRange ? Math.max(localMax, referenceRange.max) : localMax;
    const localRange = scaleMax - scaleMin || 1;
    const laneKey = getSeriesLaneKey(line.key);
    const lineIndex = laneIndexMap.get(laneKey) ?? 0;
    const top = paddingTop + lineIndex * (laneHeight + laneGap);
    const bottom = top + laneHeight;
    const inset = Math.min(10, laneHeight * 0.18);
    const plotTop = top + inset;
    const plotBottom = bottom - inset;
    const plotHeight = Math.max(plotBottom - plotTop, 1);

    return {
      ...line,
      min: localMin,
      max: localMax,
      scaleMin,
      scaleMax,
      referenceRange: referenceRange || undefined,
      band: {
        top,
        bottom,
        center: top + laneHeight / 2,
        plotTop,
        plotBottom,
      },
      points: line.values.map((value, index) => ({
        x: xForIndex(index),
        y: scaleMax === scaleMin
          ? plotTop + plotHeight / 2
          : plotTop + ((scaleMax - value) / localRange) * plotHeight,
      })),
    };
  });

  const axisLabels = mode === 'normalized'
    ? ['100%', '67%', '33%', '0%']
    : [];

  return {
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    usableWidth,
    usableHeight,
    series,
    normalizedSeries,
    multiAxisSeries,
    laneDefinitions,
    xForIndex,
    axisLabels,
  };
}

function InteractiveTrendChart({
  selectedMetrics,
  vitalsHistory,
  mode,
}: {
  selectedMetrics: VitalMetricKey[];
  vitalsHistory: VitalHistoryPoint[];
  mode: GraphMode;
}) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = React.useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null);
  const chartWrapRef = React.useRef<HTMLDivElement | null>(null);

  const chartData = buildTrendChartData(selectedMetrics, vitalsHistory, mode);

  if (!chartData) {
    return (
      <div className={styles['pd-trend-empty']}>
        <Activity size={28} />
        <p>{selectedMetrics.length === 0 ? 'Select at least one vital card to display the graph.' : 'No trend data available.'}</p>
      </div>
    );
  }

  const {
    width,
    height,
    paddingX,
    paddingTop,
    usableHeight,
    series,
    normalizedSeries,
    multiAxisSeries,
    laneDefinitions,
    xForIndex,
    axisLabels,
  } = chartData;

  const displaySeries = mode === 'multi-axis' ? multiAxisSeries : normalizedSeries;
  const seriesReferenceMap = new Map(multiAxisSeries.map((line) => [line.key, line.referenceRange]));

  const activeIndex = pinnedIndex ?? hoveredIndex;
  const hoveredX = activeIndex !== null ? xForIndex(activeIndex) : null;
  const tooltipSeries = activeIndex !== null
    ? series.map((line) => ({
        key: line.key,
        label: line.label,
        color: line.color,
        value: formatHoveredValue(line, activeIndex),
        status: getReferenceStatus(line.values[activeIndex], seriesReferenceMap.get(line.key)),
      }))
    : [];
  const estimatedTooltipWidth = 240;
  const estimatedTooltipHeight = 44 + tooltipSeries.length * 30;

  const computeTooltipPosition = (clientX: number, clientY: number) => {
    const bounds = chartWrapRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    const nextX = clientX - bounds.left + 18;
    const nextY = clientY - bounds.top - 12;
    const clampedLeft = Math.min(
      Math.max(nextX, 10),
      Math.max(bounds.width - estimatedTooltipWidth - 10, 10),
    );
    const clampedTop = nextY - estimatedTooltipHeight < 10
      ? Math.min(nextY + 20, Math.max(bounds.height - estimatedTooltipHeight - 10, 10))
      : nextY;

    return {
      x: clampedLeft,
      y: clampedTop,
    };
  };

  const handleHoverAtIndex = (index: number, event: React.MouseEvent<SVGElement | SVGRectElement>) => {
    if (pinnedIndex !== null) return;
    setHoveredIndex(index);
    const nextPosition = computeTooltipPosition(event.clientX, event.clientY);
    if (nextPosition) setTooltipPosition(nextPosition);
  };

  const handlePointerMoveAtIndex = (index: number, event: React.PointerEvent<SVGElement | SVGRectElement>) => {
    if (event.pointerType !== 'mouse' || pinnedIndex !== null) return;
    setHoveredIndex(index);
    const nextPosition = computeTooltipPosition(event.clientX, event.clientY);
    if (nextPosition) setTooltipPosition(nextPosition);
  };

  const handlePointerDownAtIndex = (index: number, event: React.PointerEvent<SVGElement | SVGRectElement>) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    event.preventDefault();
    const nextPinned = pinnedIndex === index ? null : index;
    setPinnedIndex(nextPinned);
    setHoveredIndex(nextPinned === null ? null : index);
    if (nextPinned === null) {
      setTooltipPosition(null);
      return;
    }
    const nextPosition = computeTooltipPosition(event.clientX, event.clientY);
    if (nextPosition) setTooltipPosition(nextPosition);
  };

  const clearHover = () => {
    if (pinnedIndex !== null) return;
    setHoveredIndex(null);
    setTooltipPosition(null);
  };

  return (
    <div className={styles['pd-trend-chart-wrap']} ref={chartWrapRef}>
      {mode === 'multi-axis' && (
        <div className={styles['pd-trend-axis-cards']}>
          {laneDefinitions.map((lane) => {
            const laneSeries = multiAxisSeries.filter((line) => getSeriesLaneKey(line.key) === lane.key);
            const laneColor = laneSeries[0]?.color ?? '#475569';
            const rangeText = lane.key === 'bp'
              ? laneSeries.map((line) => `${line.label.replace('BP ', '')} ${formatAxisValue(line.min, line.key)} to ${formatAxisValue(line.max, line.key)}`).join(' · ')
              : `${formatAxisValue(laneSeries[0]?.min ?? 0, laneSeries[0]?.key)} to ${formatAxisValue(laneSeries[0]?.max ?? 0, laneSeries[0]?.key)}`;
            const targetText = lane.key === 'bp'
              ? laneSeries
                  .filter((line) => line.referenceRange)
                  .map((line) => `${line.label.replace('BP ', '')} ${line.referenceRange?.label.replace('Target ', '')}`)
                  .join(' · ')
              : laneSeries[0]?.referenceRange?.label ?? '';

            return (
              <div key={lane.key} className={styles['pd-trend-axis-card']}>
                <span style={{ color: laneColor }}>{lane.label}</span>
                <strong>{rangeText}</strong>
                {targetText && <small>{targetText}</small>}
              </div>
            );
          })}
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className={styles['pd-trend-chart']} role="img" aria-label="Selected vital trend">
        {mode === 'normalized' && Array.from({ length: 4 }).map((_, index) => {
          const y = paddingTop + (usableHeight * index) / 3;
          return (
            <g key={index}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} className={styles['pd-trend-grid']} />
              <text x={6} y={y + 4} className={styles['pd-trend-axis-label']}>{axisLabels[index]}</text>
            </g>
          );
        })}

        {mode === 'multi-axis' && laneDefinitions.map((lane) => {
          const laneSeries = multiAxisSeries.filter((line) => getSeriesLaneKey(line.key) === lane.key);
          const laneBand = laneSeries[0]?.band;
          const laneColor = laneSeries[0]?.color ?? '#475569';
          if (!laneBand) return null;
          const laneMin = Math.min(...laneSeries.map((line) => line.min));
          const laneMax = Math.max(...laneSeries.map((line) => line.max));

          return (
            <g key={`${lane.key}-band`}>
              <rect
                x={paddingX}
                y={laneBand.top}
                width={width - paddingX * 2}
                height={laneBand.bottom - laneBand.top}
                className={styles['pd-trend-band-fill']}
              />
              <line x1={paddingX} y1={laneBand.top} x2={width - paddingX} y2={laneBand.top} className={styles['pd-trend-band-edge']} />
              <line x1={paddingX} y1={laneBand.bottom} x2={width - paddingX} y2={laneBand.bottom} className={styles['pd-trend-band-edge']} />
              <line x1={paddingX} y1={laneBand.center} x2={width - paddingX} y2={laneBand.center} className={styles['pd-trend-grid']} />
              {laneSeries.map((line) => {
                if (!line.referenceRange || line.scaleMin === undefined || line.scaleMax === undefined) return null;
                const scaleRange = line.scaleMax - line.scaleMin || 1;
                const toY = (value: number) => (
                  scaleRange === 0
                    ? laneBand.center
                    : laneBand.plotTop + ((line.scaleMax! - value) / scaleRange) * Math.max(laneBand.plotBottom - laneBand.plotTop, 1)
                );

                return (
                  <g key={`${line.key}-reference`}>
                    <line
                      x1={paddingX}
                      y1={toY(line.referenceRange.min)}
                      x2={width - paddingX}
                      y2={toY(line.referenceRange.min)}
                      className={styles['pd-trend-reference-line']}
                    />
                    <line
                      x1={paddingX}
                      y1={toY(line.referenceRange.max)}
                      x2={width - paddingX}
                      y2={toY(line.referenceRange.max)}
                      className={styles['pd-trend-reference-line']}
                    />
                  </g>
                );
              })}
              <text x={6} y={laneBand.top + 11} className={styles['pd-trend-band-label']} fill={laneColor}>{lane.label}</text>
              <text x={6} y={laneBand.top + 25} className={styles['pd-trend-axis-label']}>{formatAxisValue(laneMax, laneSeries[0]?.key)} max</text>
              <text x={6} y={laneBand.bottom - 4} className={styles['pd-trend-axis-label']}>{formatAxisValue(laneMin, laneSeries[0]?.key)} min</text>
            </g>
          );
        })}

        {displaySeries.map((line) => {
          return (
            <g key={line.key}>
              <polyline fill="none" stroke={line.color} strokeWidth="3" points={buildPolyline(line.points)} strokeLinecap="round" strokeLinejoin="round" />
              {line.points.map((point, index) => (
                <circle
                  key={`${line.key}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === index ? '6' : '4'}
                  fill={line.color}
                  className={styles['pd-trend-point']}
                  onMouseEnter={(event) => handleHoverAtIndex(index, event)}
                  onMouseMove={(event) => handleHoverAtIndex(index, event)}
                  onPointerMove={(event) => handlePointerMoveAtIndex(index, event)}
                  onPointerDown={(event) => handlePointerDownAtIndex(index, event)}
                  onMouseLeave={clearHover}
                />
              ))}
            </g>
          );
        })}

        {hoveredX !== null && (
          <line
            x1={hoveredX}
            y1={paddingTop}
            x2={hoveredX}
            y2={paddingTop + usableHeight}
            className={styles['pd-trend-crosshair']}
          />
        )}

        {vitalsHistory.map((item, index) => (
          <g key={item.recordedAt}>
            <text x={xForIndex(index)} y={height - 10} textAnchor="middle" className={styles['pd-trend-axis-label']}>
              {formatVitalTimestamp(item.recordedAt)}
            </text>
            <rect
              x={xForIndex(index) - 16}
              y={paddingTop}
              width="32"
              height={usableHeight}
              fill="transparent"
              onMouseEnter={(event) => handleHoverAtIndex(index, event)}
              onMouseMove={(event) => handleHoverAtIndex(index, event)}
              onPointerMove={(event) => handlePointerMoveAtIndex(index, event)}
              onPointerDown={(event) => handlePointerDownAtIndex(index, event)}
              onMouseLeave={clearHover}
            />
          </g>
        ))}
      </svg>

      {activeIndex !== null && tooltipPosition && (
        <div
          className={styles['pd-trend-tooltip-floating']}
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          <div className={styles['pd-trend-tooltip-toprow']}>
            <div className={styles['pd-trend-tooltip-head']}>{formatVitalTimestamp(vitalsHistory[activeIndex].recordedAt)}</div>
            {pinnedIndex !== null && (
              <button
                type="button"
                className={styles['pd-trend-tooltip-close']}
                onClick={() => {
                  setPinnedIndex(null);
                  setHoveredIndex(null);
                  setTooltipPosition(null);
                }}
                aria-label="Close tooltip"
              >
                Close
              </button>
            )}
          </div>
          {tooltipSeries.map((line) => (
            <div key={line.key} className={styles['pd-trend-tooltip-row']}>
              <span className={styles['pd-trend-tooltip-dot']} style={{ background: line.color }} />
              <span className={styles['pd-trend-tooltip-labelstack']}>
                <span>{line.label}</span>
                {line.status && (
                  <small className={cx(styles, 'pd-trend-tooltip-state', `pd-trend-tooltip-state--${line.status.tone}`)}>
                    {line.status.label}
                  </small>
                )}
              </span>
              <strong>{line.value}</strong>
            </div>
          ))}
        </div>
      )}

      <div className={styles['pd-trend-legend']}>
        {series.map((line) => (
          <span key={line.key}>
            <i style={{ background: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PatientVitalTrendOverlay({
  selectedMetrics,
  vitalsHistory,
  onToggleMetric,
  onClose,
}: {
  selectedMetrics: VitalMetricKey[];
  vitalsHistory: VitalHistoryPoint[];
  onToggleMetric: (metric: VitalMetricKey) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [graphMode, setGraphMode] = React.useState<GraphMode>('normalized');
  if (selectedMetrics.length === 0) return null;

  const latest = vitalsHistory[vitalsHistory.length - 1];
  const combinedSeries = selectedMetrics.flatMap((metric) => createSeries(metric, vitalsHistory));

  return (
    <div className={styles['pd-overlay']} onClick={onClose}>
      <div className={cx(styles, 'pd-modal', 'pd-trend-modal')} onClick={(event) => event.stopPropagation()}>
        <div className={styles['pd-modal-hd']}>
          <div>
            <h2>{t('patientDetail.interactiveVitalTrend')}</h2>
            <p className={styles['pd-trend-sub']}>{t('patientDetail.trendOverlayHint')}</p>
          </div>
          <button onClick={onClose} aria-label={t('patientDetail.closeTrendChart')}>
            <X size={18} />
          </button>
        </div>

        <div className={styles['pd-trend-summary']}>
          <div className={styles['pd-trend-summary-card']}>
            <span>{t('patientDetail.selectedCards')}</span>
            <strong>{selectedMetrics.length}</strong>
          </div>
          <div className={styles['pd-trend-summary-card']}>
            <span>{t('patientDetail.seriesShown')}</span>
            <strong>{combinedSeries.length}</strong>
          </div>
          <div className={styles['pd-trend-summary-card']}>
            <span>{t('patientDetail.lastUpdate')}</span>
            <strong>{latest ? formatVitalTimestamp(latest.recordedAt) : '—'}</strong>
          </div>
        </div>

        <div className={styles['pd-trend-togglebar']}>
          {(Object.keys(vitalMeta) as VitalMetricKey[]).map((metric) => (
            <button
              key={metric}
              type="button"
              className={cx(styles, 'pd-trend-toggle', selectedMetrics.includes(metric) && 'active')}
              onClick={() => onToggleMetric(metric)}
            >
              <i style={{ background: vitalMeta[metric].lineColor }} />
              {vitalMeta[metric].shortLabel}
            </button>
          ))}
        </div>

        <div className={styles['pd-trend-modebar']}>
          <button
            type="button"
            className={cx(styles, 'pd-trend-mode-btn', graphMode === 'normalized' && 'active')}
            onClick={() => setGraphMode('normalized')}
          >
            {t('patientDetail.normalized')}
          </button>
          <button
            type="button"
            className={cx(styles, 'pd-trend-mode-btn', graphMode === 'multi-axis' && 'active')}
            onClick={() => setGraphMode('multi-axis')}
          >
            {t('patientDetail.multiAxis')}
          </button>
        </div>
        <div className={styles['pd-trend-mode-note']}>
          {graphMode === 'normalized'
            ? t('patientDetail.normalizedHint')
            : t('patientDetail.multiAxisHint')}
        </div>

        <InteractiveTrendChart selectedMetrics={selectedMetrics} vitalsHistory={vitalsHistory} mode={graphMode} />

        <div className={styles['pd-trend-latest-grid']}>
          {combinedSeries.map((series) => (
            <div key={series.key} className={styles['pd-trend-latest-card']}>
              <span style={{ color: series.color }}>{series.label}</span>
              <strong>{series.latestLabel}</strong>
            </div>
          ))}
        </div>

        <div className={styles['pd-modal-ft']}>
          <button className={styles['pd-btn-cancel']} onClick={onClose}>{t('patientDetail.closeLabel')}</button>
        </div>
      </div>
    </div>
  );
}

export function PatientCloseCaseModal({
  showCloseModal,
  setShowCloseModal,
  closeOutcome,
  setCloseOutcome,
  handleClose,
}: {
  showCloseModal: boolean;
  setShowCloseModal: React.Dispatch<React.SetStateAction<boolean>>;
  closeOutcome: 'Discharge' | 'Referred' | 'Dead' | 'Step Down';
  setCloseOutcome: React.Dispatch<React.SetStateAction<'Discharge' | 'Referred' | 'Dead' | 'Step Down'>>;
  handleClose: () => void;
}) {
  const { t } = useLocale();
  if (!showCloseModal) return null;

  return (
    <div className={styles['pd-overlay']} onClick={() => setShowCloseModal(false)}>
      <div className={styles['pd-modal']} onClick={(event) => event.stopPropagation()}>
        <div className={styles['pd-modal-hd']}>
          <CheckCircle size={22} color="#10b981" />
          <h2>{t('patientDetail.closeConsultationCase')}</h2>
          <button onClick={() => setShowCloseModal(false)}><X size={18} /></button>
        </div>
        <p className={styles['pd-modal-sub']}>{t('patientDetail.closeCaseHint')}</p>
        <div className={styles['pd-outcome-grid']}>
          {(['Discharge', 'Step Down', 'Referred', 'Dead'] as const).map((outcome) => {
            const icons: Record<string, React.ReactNode> = {
              Discharge: <CheckCircle size={18} />,
              'Step Down': <CornerDownRight size={18} />,
              Referred: <CornerDownRight size={18} />,
              Dead: <X size={18} />,
            };
            const colors: Record<string, string> = {
              Discharge: '#10b981',
              'Step Down': '#f59e0b',
              Referred: '#3b82f6',
              Dead: '#64748b',
            };

            return (
              <button
                key={outcome}
                className={cx(styles, 'pd-outcome-btn', closeOutcome === outcome && 'active')}
                style={closeOutcome === outcome ? { borderColor: colors[outcome], background: `${colors[outcome]}10`, color: colors[outcome] } : {}}
                onClick={() => setCloseOutcome(outcome)}
              >
                <span className={styles['pd-outcome-icon']} style={{ color: colors[outcome] }}>{icons[outcome]}</span>
                {outcome}
              </button>
            );
          })}
        </div>
        <div className={styles['pd-modal-ft']}>
          <button className={styles['pd-btn-cancel']} onClick={() => setShowCloseModal(false)}>{t('patientDetail.cancelLabel')}</button>
          <button className={styles['pd-btn-confirm']} onClick={handleClose}>{t('patientDetail.confirmAndClose')}</button>
        </div>
      </div>
    </div>
  );
}
