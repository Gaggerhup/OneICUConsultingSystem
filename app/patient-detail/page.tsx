'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import type { Case } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import Layout from '@/components/Layout';
import { getCaseById, updateCaseDetail } from '@/actions/cases';
import { addLab, addMedication, addVital, deleteLab, deleteMedication, deleteVital, getVitals, getLabs, getMedications, updateLab, updateMedication, updateVital } from '@/actions/clinical';
import { deleteCaseNote, getCaseNotes, addCaseNote as dbAddCaseNote, getCaseMessages, getCaseTeam, updateCaseNote } from '@/actions/collaboration';
import { deleteCaseFile, getPatientByCaseId, getCaseFiles, updateCaseFile, updatePatientByCaseId, uploadCaseFile } from '@/actions/patients';
import { canAccessHospital } from '@/lib/provider-profile';
import PatientDetailView from './patient-detail-view';
import styles from './style.module.css';

export interface LabRow {
  id: string;
  name: string;
  result: string;
  unit: string;
  ref: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface MedRow {
  id: string;
  name: string;
  dose: string;
  freq: string;
  route: string;
  start: string;
  category: string;
}

export interface TeamMember {
  name: string;
  role: string;
  color: string;
  online: boolean;
}

export interface FileRecord {
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

export interface VitalHistoryPoint {
  bp: string;
  hr: number;
  temp: number;
  rr: number;
  spo2: number;
  gcs: string;
  recordedAt: string;
}

export type VitalMetricKey = 'hr' | 'bp' | 'temp' | 'rr' | 'spo2' | 'gcs';
export type CrudEntity = 'overview' | 'vital' | 'lab' | 'medication' | 'note' | 'orderSummary' | 'file';

export interface NoteRow {
  id: string;
  author: string;
  role: string;
  body: string;
  soap?: { s: string; o: string; a: string; p: string };
  orders?: { oneDay: string; continuation: string };
  time: string;
  color: string;
}

export interface OrderSummaryRow {
  id: string;
  author: string;
  role: string;
  oneDay: string;
  continuation: string;
  time: string;
  color: string;
  sourceType: 'summary' | 'note';
  soap?: { s: string; o: string; a: string; p: string };
}

export interface PatientRecord {
  name: string;
  hn: string;
  an: string;
  cid: string;
  age: number;
  gender: string;
  bloodType: string;
  phone: string;
  dob: string;
  district: string;
  province: string;
  conditions: string[];
  allergies: string[];
  chiefComplaint: string;
  presentIllness: string;
  initialDiagnosis: string;
  vitals: { bp: string; hr: number; temp: number; rr: number; spo2: number; gcs: string };
  labs: LabRow[];
  medications: MedRow[];
  clinicalNotes: string;
  team: TeamMember[];
  files: FileRecord[];
}

export type Tab = 'overview' | 'labs' | 'medications' | 'imaging';
export type FileCategoryFilter = 'all' | 'imaging' | 'lab' | 'report' | 'medication' | 'note' | 'other';

type OverviewFormState = {
  name: string;
  hn: string;
  an: string;
  cid: string;
  age: string;
  gender: string;
  bloodType: string;
  phone: string;
  dob: string;
  district: string;
  province: string;
  conditions: string;
  allergies: string;
  chiefComplaint: string;
  presentIllness: string;
  initialDiagnosis: string;
  clinicalNotes: string;
};

type VitalFormState = {
  id?: string;
  bp: string;
  hr: string;
  temp: string;
  rr: string;
  spo2: string;
  gcs: string;
  recordedAt: string;
};

type LabFormState = {
  id?: string;
  name: string;
  result: string;
  unit: string;
  ref: string;
  status: LabRow['status'];
};

type MedicationFormState = {
  id?: string;
  name: string;
  dose: string;
  freq: string;
  route: string;
  start: string;
  category: string;
};

type NoteFormState = {
  id?: string;
  body: string;
};

type OrderSummaryFormState = {
  id?: string;
  oneDay: string;
  continuation: string;
  sourceType?: 'summary' | 'note';
  soap?: { s: string; o: string; a: string; p: string };
};

type FileFormState = {
  id?: string;
  fileName: string;
  category: string;
  description: string;
};

type EditorState =
  | { entity: 'overview'; mode: 'edit'; data: OverviewFormState }
  | { entity: 'vital'; mode: 'add' | 'edit'; data: VitalFormState }
  | { entity: 'lab'; mode: 'add' | 'edit'; data: LabFormState }
  | { entity: 'medication'; mode: 'add' | 'edit'; data: MedicationFormState }
  | { entity: 'note'; mode: 'edit'; data: NoteFormState }
  | { entity: 'orderSummary'; mode: 'add' | 'edit'; data: OrderSummaryFormState }
  | { entity: 'file'; mode: 'edit'; data: FileFormState };

function toOverviewForm(record: PatientRecord): OverviewFormState {
  return {
    name: record.name,
    hn: record.hn,
    an: record.an,
    cid: record.cid,
    age: String(record.age || ''),
    gender: record.gender,
    bloodType: record.bloodType,
    phone: record.phone,
    dob: record.dob === '—' ? '' : record.dob,
    district: record.district,
    province: record.province,
    conditions: record.conditions.join(', '),
    allergies: record.allergies.join(', '),
    chiefComplaint: record.chiefComplaint,
    presentIllness: record.presentIllness,
    initialDiagnosis: record.initialDiagnosis,
    clinicalNotes: record.clinicalNotes,
  };
}

function toVitalForm(vital?: Partial<VitalHistoryPoint> & { id?: string }): VitalFormState {
  const now = new Date().toISOString().slice(0, 16);
  return {
    id: vital?.id,
    bp: vital?.bp || '',
    hr: vital?.hr?.toString() || '',
    temp: vital?.temp?.toString() || '',
    rr: vital?.rr?.toString() || '',
    spo2: vital?.spo2?.toString() || '',
    gcs: vital?.gcs || '',
    recordedAt: vital?.recordedAt ? new Date(vital.recordedAt).toISOString().slice(0, 16) : now,
  };
}

function emptyLabForm(): LabFormState {
  return { name: '', result: '', unit: '', ref: '', status: 'normal' };
}

function emptyMedicationForm(): MedicationFormState {
  return { name: '', dose: '', freq: '', route: '', start: '', category: '' };
}

function emptyOrderSummaryForm(): OrderSummaryFormState {
  return { oneDay: '', continuation: '', sourceType: 'summary' };
}

function toDateInputValue(value?: string | null) {
  if (!value || value === '—') return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function emptyVitalsSnapshot(): PatientRecord['vitals'] {
  return { bp: '—', hr: 0, temp: 0, rr: 0, spo2: 0, gcs: '—' };
}

function getDeleteConfirmationMessage(entity: CrudEntity, t: (key: string) => string) {
  switch (entity) {
    case 'vital':
      return t('patientDetail.deleteVitalConfirm');
    case 'lab':
      return t('patientDetail.deleteLabConfirm');
    case 'medication':
      return t('patientDetail.deleteMedicationConfirm');
    case 'note':
      return t('patientDetail.deleteNoteConfirm');
    case 'orderSummary':
      return t('patientDetail.deleteOrderConfirm');
    case 'file':
      return t('patientDetail.deleteFileConfirm');
    default:
      return t('patientDetail.deleteItemConfirm');
  }
}

function getDeleteSuccessMessage(entity: CrudEntity, t: (key: string) => string) {
  switch (entity) {
    case 'vital':
      return t('patientDetail.vitalDeleted');
    case 'lab':
      return t('patientDetail.labDeleted');
    case 'medication':
      return t('patientDetail.medicationDeleted');
    case 'note':
      return t('patientDetail.noteDeleted');
    case 'orderSummary':
      return t('patientDetail.orderDeleted');
    case 'file':
      return t('patientDetail.fileDeleted');
    default:
      return t('patientDetail.itemDeleted');
  }
}

function getDeleteErrorMessage(entity: CrudEntity, t: (key: string) => string) {
  switch (entity) {
    case 'vital':
      return t('patientDetail.deleteVitalFailed');
    case 'lab':
      return t('patientDetail.deleteLabFailed');
    case 'medication':
      return t('patientDetail.deleteMedicationFailed');
    case 'note':
      return t('patientDetail.deleteNoteFailed');
    case 'orderSummary':
      return t('patientDetail.deleteOrderFailed');
    case 'file':
      return t('patientDetail.deleteFileFailed');
    default:
      return t('patientDetail.deleteFailed');
  }
}

function createSyntheticVitalsHistory(vitals: PatientRecord['vitals']): VitalHistoryPoint[] {
  const now = Date.now();
  const baseHr = vitals.hr || 96;
  const baseTemp = vitals.temp || 36.8;
  const baseRr = vitals.rr || 20;
  const baseSpo2 = vitals.spo2 || 97;
  const baseGcs = vitals.gcs || '15/15';
  const [baseSys, baseDia] = (vitals.bp || '120/78').split('/').map((value) => Number.parseInt(value, 10) || 0);

  return [
    { bp: `${baseSys - 6}/${baseDia - 3}`, hr: Math.max(baseHr - 18, 40), temp: Number((baseTemp - 0.2).toFixed(1)), rr: Math.max(baseRr - 3, 8), spo2: Math.min(baseSpo2 + 2, 100), gcs: baseGcs, recordedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString() },
    { bp: `${baseSys - 2}/${baseDia - 1}`, hr: Math.max(baseHr - 10, 40), temp: Number((baseTemp - 0.1).toFixed(1)), rr: Math.max(baseRr - 2, 8), spo2: Math.min(baseSpo2 + 1, 100), gcs: baseGcs, recordedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString() },
    { bp: `${baseSys + 2}/${baseDia + 1}`, hr: Math.max(baseHr - 4, 40), temp: baseTemp, rr: Math.max(baseRr - 1, 8), spo2: baseSpo2, gcs: baseGcs, recordedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
    { bp: vitals.bp || '120/78', hr: baseHr, temp: baseTemp, rr: baseRr, spo2: baseSpo2, gcs: baseGcs, recordedAt: new Date(now).toISOString() },
  ];
}

function normalizeVitalsHistory(rows: any[] | null | undefined, fallbackVitals?: PatientRecord['vitals']): VitalHistoryPoint[] {
  const normalized = Array.isArray(rows)
    ? rows.map((row, index) => ({
        bp: row?.bp || fallbackVitals?.bp || '—',
        hr: Number(row?.hr ?? fallbackVitals?.hr ?? 0),
        temp: Number(row?.temp ?? fallbackVitals?.temp ?? 0),
        rr: Number(row?.rr ?? fallbackVitals?.rr ?? 0),
        spo2: Number(row?.spo2 ?? fallbackVitals?.spo2 ?? 0),
        gcs: row?.gcs || fallbackVitals?.gcs || '—',
        recordedAt: row?.recordedAt
          || row?.createdAt
          || new Date(Date.now() - (rows.length - index - 1) * 2 * 60 * 60 * 1000).toISOString(),
      }))
    : [];

  const withValues = normalized.filter((row) =>
    row.bp !== '—'
    || row.hr > 0
    || row.temp > 0
    || row.rr > 0
    || row.spo2 > 0
    || row.gcs !== '—'
  );

  if (withValues.length > 0) {
    return withValues.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }

  return fallbackVitals ? createSyntheticVitalsHistory(fallbackVitals) : [];
}

function buildFallback(selectedCase: any, t: (key: string, vars?: Record<string, string>) => string): PatientRecord {
  return {
    name: selectedCase?.patientName || 'Unknown Patient',
    hn: selectedCase?.hn || 'HN-N/A',
    an: selectedCase?.an || 'AN-N/A',
    cid: selectedCase?.cid || 'N/A',
    age: selectedCase?.age || 0,
    gender: selectedCase?.gender || '—',
    bloodType: selectedCase?.bloodType || '—',
    phone: selectedCase?.phone || '—',
    dob: selectedCase?.dob || '—',
    district: selectedCase?.district || '—',
    province: selectedCase?.province || '—',
    conditions: selectedCase?.conditions?.length ? selectedCase.conditions : [t('common.noData')],
    allergies: selectedCase?.allergies?.length ? selectedCase.allergies : ['NKDA (No Known Drug Allergies)'],
    chiefComplaint: selectedCase?.reason || t('common.noData'),
    presentIllness: selectedCase?.currentSymptoms || t('common.noData'),
    initialDiagnosis: selectedCase?.initialDiagnosis || t('common.noData'),
    vitals: { bp: '—', hr: 0, temp: 0.0, rr: 0, spo2: 0, gcs: '—' },
    labs: [],
    medications: [],
    clinicalNotes: selectedCase?.clinicalNotes || '',
    team: [],
    files: [],
  };
}

export default function PatientDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedCase: contextSelectedCase,
    requests,
    activeCases,
    archiveCases,
    closeCase,
    approveRequest,
    declineRequest,
    showToast,
    fetchData,
    userProfile,
  } = useApp();
  const { t, language } = useLocale();
  const routeCaseId = searchParams.get('caseId');
  const selectedCase = useMemo(() => {
    if (contextSelectedCase) return contextSelectedCase;
    if (!routeCaseId) return null;

    const matchedCase = [...requests, ...activeCases, ...archiveCases].find((item) => item.id === routeCaseId);
    if (matchedCase) return matchedCase;

    return {
      id: routeCaseId,
      patientName: '',
      hospital: '',
      status: 'Active',
      priority: 'URGENT',
    } as Case;
  }, [activeCases, archiveCases, contextSelectedCase, requests, routeCaseId]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activePanel, setActivePanel] = useState<'notes' | 'chat'>('notes');
  const [selectedFileCategory, setSelectedFileCategory] = useState<FileCategoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalHistoryPoint[]>([]);
  const [vitalRows, setVitalRows] = useState<Array<VitalHistoryPoint & { id: string }>>([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<'Discharge' | 'Referred' | 'Dead' | 'Step Down'>('Discharge');
  const [progressNoteInput, setProgressNoteInput] = useState({ s: '', o: '', a: '', p: '', oneDay: '', continuation: '' });
  const [showProgressNoteModal, setShowProgressNoteModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [orderSummaries, setOrderSummaries] = useState<OrderSummaryRow[]>([]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Mitchell', text: 'Has the patient been prepped for surgery?', time: '14:15', isSelf: false, isSystem: false },
    { id: 2, sender: '', text: '🔔 Lab WBC result updated — 16.2 x10³/µL (CRITICAL)', time: '14:30', isSelf: false, isSystem: true },
    { id: 3, sender: 'You', text: 'Yes, prepped and NPO since 10 AM. OR scheduled for 16:00 today.', time: '14:35', isSelf: true, isSystem: false },
  ]);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [isPostingNote, setIsPostingNote] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!selectedCase) {
        const fallbackRecord = buildFallback(null, t);
        setRecord(fallbackRecord);
        setVitalsHistory(createSyntheticVitalsHistory(fallbackRecord.vitals));
        setVitalRows([]);
        setNotes([]);
        setOrderSummaries([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const caseId = selectedCase.id;
        const dbCase = await getCaseById(caseId);
        const dbVitals = await getVitals(caseId);

        const [dbLabs, dbMeds, dbNotes, dbTeam, dbMsgs, dbPatient, dbFiles] = await Promise.all([
          getLabs(caseId),
          getMedications(caseId),
          getCaseNotes(caseId),
          getCaseTeam(caseId),
          getCaseMessages(caseId),
          getPatientByCaseId(caseId),
          getCaseFiles(caseId),
        ]);

        if (!isMounted) return;

        if (dbCase) {
          if (!canAccessHospital(userProfile.hospital, dbCase.hospital)) {
            showToast(language === 'th' ? 'บัญชีนี้ไม่มีสิทธิ์ดูข้อมูลของโรงพยาบาลนี้' : 'This account cannot view data from this hospital', 'error');
            router.replace('/active-cases');
            return;
          }

          const fallbackVitals = {
            bp: dbVitals[0]?.bp || '—',
            hr: Number(dbVitals[0]?.hr || 0),
            temp: Number(dbVitals[0]?.temp || 0),
            rr: Number(dbVitals[0]?.rr || 0),
            spo2: Number(dbVitals[0]?.spo2 || 0),
            gcs: dbVitals[0]?.gcs || '—',
          };
          const normalizedVitals = normalizeVitalsHistory(dbVitals, fallbackVitals);
          const normalizedVitalRows = dbVitals.map((row: any, index: number) => ({
            id: row.id || `vital_${index}`,
            bp: row?.bp || fallbackVitals.bp,
            hr: Number(row?.hr ?? fallbackVitals.hr),
            temp: Number(row?.temp ?? fallbackVitals.temp),
            rr: Number(row?.rr ?? fallbackVitals.rr),
            spo2: Number(row?.spo2 ?? fallbackVitals.spo2),
            gcs: row?.gcs || fallbackVitals.gcs,
            recordedAt: row?.recordedAt || row?.createdAt || new Date().toISOString(),
          }));
          const latestV = normalizedVitals[normalizedVitals.length - 1] || fallbackVitals;
          setRecord({
            name: dbCase.patientName,
            hn: dbPatient?.hn || dbCase.hn || selectedCase?.hn || 'HN-N/A',
            an: dbCase.an || selectedCase?.an || 'AN-N/A',
            cid: dbPatient?.cid || dbCase.cid || selectedCase?.cid || 'N/A',
            age: dbPatient?.age || dbCase.age || selectedCase?.age || 0,
            gender: dbPatient?.gender || dbCase.gender || selectedCase?.gender || '—',
            bloodType: dbPatient?.bloodType || dbCase.bloodType || selectedCase?.bloodType || '—',
            phone: dbPatient?.phoneNumber || selectedCase?.phone || '—',
            dob: toDateInputValue(dbPatient?.birthDate) || selectedCase?.dob || '',
            district: dbPatient?.district || selectedCase?.district || '—',
            province: dbPatient?.province || selectedCase?.province || '—',
            conditions: dbPatient?.conditions?.length ? dbPatient.conditions : (dbCase.conditions?.length ? dbCase.conditions : (selectedCase?.conditions || [])),
            allergies: dbPatient?.allergies?.length ? dbPatient.allergies : (dbCase.allergies?.length ? dbCase.allergies : (selectedCase?.allergies || [])),
            chiefComplaint: dbCase.reason || selectedCase?.reason || '',
            presentIllness: dbCase.currentSymptoms || selectedCase?.currentSymptoms || '',
            initialDiagnosis: dbCase.initialDiagnosis || selectedCase?.initialDiagnosis || '',
            clinicalNotes: dbCase.clinicalNotes || selectedCase?.clinicalNotes || '',
            vitals: {
              bp: latestV?.bp || '—',
              hr: latestV?.hr || 0,
              temp: latestV?.temp || 0.0,
              rr: latestV?.rr || 0,
              spo2: latestV?.spo2 || 0,
              gcs: latestV?.gcs || '—',
            },
            labs: dbLabs.map((l) => ({ id: l.id, name: l.name, result: l.result, unit: l.unit, ref: l.refRange || '', status: l.status as any })),
            medications: dbMeds.map((m) => ({ id: m.id, name: m.name, dose: m.dose, freq: m.freq, route: m.route, start: m.start || '', category: m.category || '' })),
            team: dbTeam.map((t) => ({ name: 'Team Member', role: t.role, color: '64748b', online: false })),
            files: dbFiles.map((f) => ({
              id: f.id,
              fileName: f.fileName,
              fileType: f.fileType,
              category: f.category,
              mimeType: f.mimeType,
              fileUrl: f.fileUrl,
              sizeKb: f.sizeKb,
              description: f.description,
              isPreviewable: f.isPreviewable,
              createdAt: f.createdAt,
            })),
          });
          setVitalsHistory(normalizedVitals);
          setVitalRows(normalizedVitalRows.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
          const nextNotes: NoteRow[] = [];
          const nextOrderSummaries: OrderSummaryRow[] = [];
          dbNotes.forEach((n) => {
            let body = n.body || '';
            let soap = undefined;
            let orders = undefined;
            if (body.startsWith('{')) {
              try {
                const parsed = JSON.parse(body);
                if (parsed?.entryType === 'orderSummary' && parsed?.summaryOrders) {
                  nextOrderSummaries.push({
                    id: String(n.id),
                    author: n.authorName || 'Unknown',
                    role: n.authorRole || 'Medical Staff',
                    oneDay: parsed.summaryOrders.oneDay || '',
                    continuation: parsed.summaryOrders.continuation || '',
                    time: n.time || 'recently',
                    color: n.authorColor || '64748b',
                    sourceType: 'summary',
                  });
                  return;
                }
                soap = parsed.soap;
                orders = parsed.orders;
                if (parsed.soap || parsed.orders) {
                  body = '';
                }
              } catch (e) {
                // fallback to plain text if parsing fails
              }
            }
            nextNotes.push({
              id: String(n.id),
              author: n.authorName || 'Unknown',
              role: n.authorRole || 'Medical Staff',
              body,
              soap,
              orders,
              time: n.time || 'recently',
              color: n.authorColor || '64748b',
            });
            if (orders && (orders.oneDay || orders.continuation)) {
              nextOrderSummaries.push({
                id: String(n.id),
                author: n.authorName || 'Unknown',
                role: n.authorRole || 'Medical Staff',
                oneDay: orders.oneDay || '',
                continuation: orders.continuation || '',
                time: n.time || 'recently',
                color: n.authorColor || '64748b',
                sourceType: 'note',
                soap,
              });
            }
          });
          setNotes(nextNotes);
          setOrderSummaries(nextOrderSummaries);

          setMessages(dbMsgs.map((m) => ({
            id: Number(m.id) || Date.now(),
            sender: m.senderName || '',
            text: m.text,
            time: m.time || '',
            isSelf: m.isSelf || false,
            isSystem: m.isSystem || false,
          })));
        } else {
          const fallbackRecord = buildFallback(selectedCase, t);
          setRecord(fallbackRecord);
          setVitalsHistory(createSyntheticVitalsHistory(fallbackRecord.vitals));
          setVitalRows([]);
          setNotes([]);
          setOrderSummaries([]);
        }
      } catch (err) {
        console.error('[PatientDetail] Load failed:', err);
        if (isMounted) {
          const fallbackRecord = buildFallback(selectedCase, t);
          setRecord(fallbackRecord);
          setVitalsHistory(createSyntheticVitalsHistory(fallbackRecord.vitals));
          setVitalRows([]);
          setNotes([]);
          setOrderSummaries([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [language, router, selectedCase, showToast, t, userProfile.hospital]);

  const openOverviewEditor = () => {
    if (!record) return;
    setEditorState({ entity: 'overview', mode: 'edit', data: toOverviewForm(record) });
  };

  const openVitalEditor = (vital?: VitalHistoryPoint & { id?: string }) => {
    setEditorState({ entity: 'vital', mode: vital?.id ? 'edit' : 'add', data: toVitalForm(vital) });
  };

  const openLabEditor = (lab?: LabRow) => {
    setEditorState({
      entity: 'lab',
      mode: lab?.id ? 'edit' : 'add',
      data: lab ? { id: lab.id, name: lab.name, result: lab.result, unit: lab.unit, ref: lab.ref, status: lab.status } : emptyLabForm(),
    });
  };

  const openMedicationEditor = (medication?: MedRow) => {
    setEditorState({
      entity: 'medication',
      mode: medication?.id ? 'edit' : 'add',
      data: medication
        ? {
            id: medication.id,
            name: medication.name,
            dose: medication.dose,
            freq: medication.freq,
            route: medication.route,
            start: medication.start,
            category: medication.category,
          }
        : emptyMedicationForm(),
    });
  };

  const openNoteEditor = (note: NoteRow) => {
    setEditorState({ entity: 'note', mode: 'edit', data: { id: note.id, body: note.body } });
  };

  const openOrderSummaryEditor = (summary?: OrderSummaryRow) => {
    setEditorState({
      entity: 'orderSummary',
      mode: summary?.id ? 'edit' : 'add',
      data: summary
        ? { id: summary.id, oneDay: summary.oneDay, continuation: summary.continuation, sourceType: summary.sourceType, soap: summary.soap }
        : emptyOrderSummaryForm(),
    });
  };

  const openFileEditor = (file: FileRecord) => {
    setEditorState({
      entity: 'file',
      mode: 'edit',
      data: { id: file.id, fileName: file.fileName, category: file.category, description: file.description || '' },
    });
  };

  const parseCommaValues = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

  const handleSaveEditor = async () => {
    if (!selectedCase || !editorState || !record) return;
    setIsSaving(true);
    try {
      if (editorState.entity === 'overview') {
        const data = editorState.data;
        await Promise.all([
          updateCaseDetail(selectedCase.id, {
            patientName: data.name,
            hn: data.hn,
            an: data.an,
            cid: data.cid,
            age: Number(data.age || 0),
            gender: data.gender,
            bloodType: data.bloodType,
            reason: data.chiefComplaint,
            currentSymptoms: data.presentIllness,
            initialDiagnosis: data.initialDiagnosis,
            clinicalNotes: data.clinicalNotes,
            conditions: parseCommaValues(data.conditions),
            allergies: parseCommaValues(data.allergies),
          }),
          updatePatientByCaseId(selectedCase.id, {
            name: data.name,
            hn: data.hn,
            cid: data.cid,
            age: Number(data.age || 0),
            gender: data.gender,
            bloodType: data.bloodType,
            phoneNumber: data.phone,
            birthDate: data.dob || null,
            district: data.district,
            province: data.province,
            conditions: parseCommaValues(data.conditions),
            allergies: parseCommaValues(data.allergies),
          }),
        ]);

        setRecord({
          ...record,
          name: data.name,
          hn: data.hn,
          an: data.an,
          cid: data.cid,
          age: Number(data.age || 0),
          gender: data.gender,
          bloodType: data.bloodType,
          phone: data.phone,
          dob: data.dob,
          district: data.district,
          province: data.province,
          conditions: parseCommaValues(data.conditions),
          allergies: parseCommaValues(data.allergies),
          chiefComplaint: data.chiefComplaint,
          presentIllness: data.presentIllness,
          initialDiagnosis: data.initialDiagnosis,
          clinicalNotes: data.clinicalNotes,
        });
        await fetchData();
      }

      if (editorState.entity === 'vital') {
        const payload = {
          bp: editorState.data.bp,
          hr: Number(editorState.data.hr || 0),
          temp: Number(editorState.data.temp || 0),
          rr: Number(editorState.data.rr || 0),
          spo2: Number(editorState.data.spo2 || 0),
          gcs: editorState.data.gcs,
          recordedAt: new Date(editorState.data.recordedAt).toISOString(),
        };
        let nextRow: any;
        if (editorState.mode === 'edit' && editorState.data.id) {
          nextRow = await updateVital(selectedCase.id, editorState.data.id, payload);
          setVitalRows((prev) => prev.map((item) => (item.id === editorState.data.id ? nextRow : item)).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
        } else {
          nextRow = await addVital(selectedCase.id, payload);
          setVitalRows((prev) => [nextRow, ...prev].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
        }
        const nextHistory = normalizeVitalsHistory(
          (editorState.mode === 'edit' && editorState.data.id)
            ? vitalRows.map((item) => (item.id === editorState.data.id ? nextRow : item))
            : [nextRow, ...vitalRows],
          record.vitals,
        );
        setVitalsHistory(nextHistory);
        const latest = nextHistory[nextHistory.length - 1];
        if (latest) setRecord({ ...record, vitals: { bp: latest.bp, hr: latest.hr, temp: latest.temp, rr: latest.rr, spo2: latest.spo2, gcs: latest.gcs } });
      }

      if (editorState.entity === 'lab') {
        const payload = { name: editorState.data.name, result: editorState.data.result, unit: editorState.data.unit, refRange: editorState.data.ref, status: editorState.data.status };
        if (editorState.mode === 'edit' && editorState.data.id) {
          const updated = await updateLab(selectedCase.id, editorState.data.id, payload);
          setRecord({ ...record, labs: record.labs.map((item) => (item.id === editorState.data.id ? { id: updated.id, name: updated.name, result: updated.result, unit: updated.unit, ref: updated.refRange, status: updated.status } : item)) });
        } else {
          const created = await addLab(selectedCase.id, payload);
          setRecord({ ...record, labs: [{ id: created.id, name: created.name, result: created.result, unit: created.unit, ref: created.refRange, status: created.status }, ...record.labs] });
        }
      }

      if (editorState.entity === 'medication') {
        const payload = { name: editorState.data.name, dose: editorState.data.dose, freq: editorState.data.freq, route: editorState.data.route, start: editorState.data.start, category: editorState.data.category };
        if (editorState.mode === 'edit' && editorState.data.id) {
          const updated = await updateMedication(selectedCase.id, editorState.data.id, payload);
          setRecord({ ...record, medications: record.medications.map((item) => (item.id === editorState.data.id ? updated : item)) });
        } else {
          const created = await addMedication(selectedCase.id, payload);
          setRecord({ ...record, medications: [created, ...record.medications] });
        }
      }

      if (editorState.entity === 'note' && editorState.data.id) {
        await updateCaseNote(selectedCase.id, editorState.data.id, { body: editorState.data.body });
        setNotes((prev) => prev.map((item) => (item.id === editorState.data.id ? { ...item, body: editorState.data.body, time: 'Just now' } : item)));
      }

      if (editorState.entity === 'orderSummary') {
        const isNoteBackedSummary = editorState.data.sourceType === 'note';
        const body = JSON.stringify(
          isNoteBackedSummary
            ? {
                soap: editorState.data.soap,
                orders: {
                  oneDay: editorState.data.oneDay,
                  continuation: editorState.data.continuation,
                },
              }
            : {
                entryType: 'orderSummary',
                summaryOrders: {
                  oneDay: editorState.data.oneDay,
                  continuation: editorState.data.continuation,
                },
              },
        );

        if (editorState.mode === 'edit' && editorState.data.id) {
          await updateCaseNote(selectedCase.id, editorState.data.id, { body });
          setOrderSummaries((prev) => prev.map((item) => (
            item.id === editorState.data.id
              ? { ...item, oneDay: editorState.data.oneDay, continuation: editorState.data.continuation, time: 'Just now' }
              : item
          )));
          if (isNoteBackedSummary) {
            setNotes((prev) => prev.map((item) => (
              item.id === editorState.data.id
                ? {
                    ...item,
                    orders: {
                      oneDay: editorState.data.oneDay,
                      continuation: editorState.data.continuation,
                    },
                    time: 'Just now',
                  }
                : item
            )));
          }
        } else {
          const saved = await dbAddCaseNote({
            caseId: selectedCase.id,
            authorId: 's1',
            authorName: 'Dr. มนตรีวิฒน์',
            authorRole: 'Attending Physician',
            authorColor: '4318FF',
            body,
          });
          setOrderSummaries((prev) => [{
            id: String(saved.id),
            author: saved.authorName,
            role: saved.authorRole,
            oneDay: editorState.data.oneDay,
            continuation: editorState.data.continuation,
            time: saved.time || 'Just now',
            color: saved.authorColor,
            sourceType: 'summary',
          }, ...prev]);
        }
      }

      if (editorState.entity === 'file' && editorState.data.id) {
        const updated = await updateCaseFile(selectedCase.id, editorState.data.id, {
          fileName: editorState.data.fileName,
          category: editorState.data.category,
          description: editorState.data.description,
        });
        setRecord({
          ...record,
          files: record.files.map((item) => (item.id === editorState.data.id
            ? { ...item, fileName: updated.fileName, category: updated.category, description: updated.description }
            : item)),
        });
      }

      setEditorState(null);
      showToast(t('patientDetail.patientDetailUpdated'), 'success');
    } catch (error) {
      console.error('[PatientDetail] Save failed:', error);
      showToast(t('patientDetail.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntity = async (entity: CrudEntity, id: string) => {
    if (!selectedCase || !record) return;
    if (typeof window !== 'undefined' && !window.confirm(getDeleteConfirmationMessage(entity, t))) {
      return;
    }
    setDeletingKey(`${entity}:${id}`);
    try {
      if (entity === 'vital') {
        await deleteVital(selectedCase.id, id);
        const nextRows = vitalRows.filter((item) => item.id !== id);
        setVitalRows(nextRows);
        const nextHistory = normalizeVitalsHistory(nextRows, record.vitals);
        setVitalsHistory(nextHistory);
        const latest = nextHistory[nextHistory.length - 1];
        if (latest) {
          setRecord({ ...record, vitals: { bp: latest.bp, hr: latest.hr, temp: latest.temp, rr: latest.rr, spo2: latest.spo2, gcs: latest.gcs } });
        } else {
          setRecord({ ...record, vitals: emptyVitalsSnapshot() });
        }
      }
      if (entity === 'lab') {
        await deleteLab(selectedCase.id, id);
        setRecord({ ...record, labs: record.labs.filter((item) => item.id !== id) });
      }
      if (entity === 'medication') {
        await deleteMedication(selectedCase.id, id);
        setRecord({ ...record, medications: record.medications.filter((item) => item.id !== id) });
      }
      if (entity === 'note') {
        await deleteCaseNote(selectedCase.id, id);
        setNotes((prev) => prev.filter((item) => item.id !== id));
      }
      if (entity === 'orderSummary') {
        const target = orderSummaries.find((item) => item.id === id);
        if (target?.sourceType === 'note') {
          const linkedNote = notes.find((item) => item.id === id);
          await updateCaseNote(selectedCase.id, id, {
            body: JSON.stringify({
              soap: linkedNote?.soap,
              orders: { oneDay: '', continuation: '' },
            }),
          });
          setNotes((prev) => prev.map((item) => (
            item.id === id ? { ...item, orders: { oneDay: '', continuation: '' }, time: 'Just now' } : item
          )));
        } else {
          await deleteCaseNote(selectedCase.id, id);
        }
        setOrderSummaries((prev) => prev.filter((item) => item.id !== id));
      }
      if (entity === 'file') {
        await deleteCaseFile(selectedCase.id, id);
        if (previewFile?.id === id) {
          setPreviewFile(null);
        }
        setRecord({ ...record, files: record.files.filter((item) => item.id !== id) });
      }
      showToast(getDeleteSuccessMessage(entity, t), 'success');
    } catch (error) {
      console.error('[PatientDetail] Delete failed:', error);
      showToast(getDeleteErrorMessage(entity, t), 'error');
    } finally {
      setDeletingKey(null);
    }
  };

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
        showToast(t('patientDetail.uploadFailed'), 'error');
        return;
      }

      setRecord((prev) => (prev ? ({ ...prev, files: [uploaded as FileRecord, ...prev.files] }) : prev));
      const uploadedCategory = uploaded.category as FileCategoryFilter;
      setSelectedFileCategory((prev) => (prev === 'all' || prev === uploadedCategory ? prev : 'all'));
      setActiveTab('imaging');
      showToast(t('patientDetail.uploadedToCaseFile'), 'success');
    } catch (err) {
      console.error('[PatientDetail] Upload failed:', err);
      showToast(t('patientDetail.uploadFailed'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostNote = async () => {
    const hasData = progressNoteInput.s.trim() || progressNoteInput.o.trim() || progressNoteInput.a.trim() || progressNoteInput.p.trim() || progressNoteInput.oneDay.trim() || progressNoteInput.continuation.trim();
    if (!hasData || !selectedCase) return;
    try {
      setIsPostingNote(true);
      const newNote = {
        caseId: selectedCase.id,
        authorId: 's1',
        authorName: 'Dr. มนตรีวิฒน์',
        authorRole: 'Attending Physician',
        authorColor: '4318FF',
        body: JSON.stringify({ 
          soap: { s: progressNoteInput.s, o: progressNoteInput.o, a: progressNoteInput.a, p: progressNoteInput.p },
          orders: { oneDay: progressNoteInput.oneDay, continuation: progressNoteInput.continuation }
        }),
      };
      const saved = await dbAddCaseNote(newNote);
      setNotes((prev) => [{
        id: String(saved.id),
        author: saved.authorName,
        role: saved.authorRole,
        body: '',
        soap: { s: progressNoteInput.s, o: progressNoteInput.o, a: progressNoteInput.a, p: progressNoteInput.p },
        orders: { oneDay: progressNoteInput.oneDay, continuation: progressNoteInput.continuation },
        time: saved.time || 'Just now',
        color: saved.authorColor,
      }, ...prev]);
      if (progressNoteInput.oneDay.trim() || progressNoteInput.continuation.trim()) {
        setOrderSummaries((prev) => [{
          id: String(saved.id),
          author: saved.authorName,
          role: saved.authorRole,
          oneDay: progressNoteInput.oneDay,
          continuation: progressNoteInput.continuation,
          time: saved.time || 'Just now',
          color: saved.authorColor,
          sourceType: 'note',
          soap: { s: progressNoteInput.s, o: progressNoteInput.o, a: progressNoteInput.a, p: progressNoteInput.p },
        }, ...prev]);
      }
      setProgressNoteInput({ s: '', o: '', a: '', p: '', oneDay: '', continuation: '' });
      setShowProgressNoteModal(false);
      showToast(t('patientDetail.consultNotePosted'), 'success');
    } catch {
      showToast(t('patientDetail.failedToPostNote'), 'error');
    } finally {
      setIsPostingNote(false);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const next = {
      id: Date.now(),
      sender: language === 'th' ? 'คุณ' : 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      isSystem: false,
    };
    setMessages((prev) => [...prev, next]);
    setChatInput('');
  };

  const handleClose = () => {
    if (!selectedCase) return;
    closeCase(selectedCase.id, closeOutcome);
    setShowCloseModal(false);
    showToast(t('patientDetail.caseClosed', { outcome: closeOutcome }), 'success');
    router.push('/active-cases');
  };

  const handleApproveCase = async () => {
    if (!selectedCase) return;
    const approved = await approveRequest(selectedCase.id);
    if (!approved) {
      showToast(language === 'th' ? 'ไม่สามารถอนุมัติเคสได้' : 'Unable to approve case', 'error');
      return;
    }
    showToast(t('patientDetail.approvedCase', { name: selectedCase.patientName || 'case' }), 'success');
    await fetchData();
    router.push('/active-cases');
  };

  const handleDeclineCase = async () => {
    if (!selectedCase) return;
    const declined = await declineRequest(selectedCase.id);
    if (!declined) {
      showToast(language === 'th' ? 'ไม่สามารถปฏิเสธเคสได้' : 'Unable to decline case', 'error');
      return;
    }
    showToast(t('patientDetail.declinedCase', { name: selectedCase.patientName || 'case' }), 'info');
    await fetchData();
    router.push('/requests');
  };

  if (!selectedCase && !isLoading) {
    return (
      <Layout>
        <div className={styles['pd-empty-case']}>
          <div className={styles['pd-empty-card']}>
            <h1>{t('patientDetail.noCaseSelectedTitle')}</h1>
            <p>{t('patientDetail.noCaseSelectedHint')}</p>
            <div className={styles['pd-empty-actions']}>
              <button type="button" onClick={() => router.push('/active-cases')}>
                {t('nav.activeCases')}
              </button>
              <button type="button" onClick={() => router.push('/requests')}>
                {t('nav.requests')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PatientDetailView
        selectedCase={selectedCase}
        record={record}
        isLoading={isLoading}
        isUploading={isUploading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        selectedFileCategory={selectedFileCategory}
        setSelectedFileCategory={setSelectedFileCategory}
        vitalsHistory={vitalsHistory}
        vitalRows={vitalRows}
        notes={notes}
        orderSummaries={orderSummaries}
        messages={messages}
        progressNoteInput={progressNoteInput}
        setProgressNoteInput={setProgressNoteInput}
        showProgressNoteModal={showProgressNoteModal}
        setShowProgressNoteModal={setShowProgressNoteModal}
        chatInput={chatInput}
        setChatInput={setChatInput}
        showCloseModal={showCloseModal}
        setShowCloseModal={setShowCloseModal}
        closeOutcome={closeOutcome}
        setCloseOutcome={setCloseOutcome}
        previewFile={previewFile}
        setPreviewFile={setPreviewFile}
        chatEndRef={chatEndRef}
        fileInputRef={fileInputRef}
        onBack={() => router.back()}
        openFilePicker={openFilePicker}
        openFilePreview={openFilePreview}
        downloadFile={downloadFile}
        editorState={editorState}
        setEditorState={setEditorState}
        isSaving={isSaving}
        deletingKey={deletingKey}
        isPostingNote={isPostingNote}
        openOverviewEditor={openOverviewEditor}
        openVitalEditor={openVitalEditor}
        openLabEditor={openLabEditor}
        openMedicationEditor={openMedicationEditor}
        openNoteEditor={openNoteEditor}
        openOrderSummaryEditor={openOrderSummaryEditor}
        openFileEditor={openFileEditor}
        handleSaveEditor={handleSaveEditor}
        handleDeleteEntity={handleDeleteEntity}
        handleFileSelected={handleFileSelected}
        handlePostNote={handlePostNote}
        handleSendChat={handleSendChat}
        handleClose={handleClose}
        onApproveCase={handleApproveCase}
        onDeclineCase={handleDeclineCase}
      />
    </Layout>
  );
}
