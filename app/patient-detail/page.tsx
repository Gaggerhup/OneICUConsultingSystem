'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { getCaseById } from '@/actions/cases';
import { getVitals, getLabs, getMedications } from '@/actions/clinical';
import { getCaseNotes, addCaseNote as dbAddCaseNote, getCaseMessages, getCaseTeam } from '@/actions/collaboration';
import { getPatientByCaseId, getCaseFiles, uploadCaseFile } from '@/actions/patients';
import PatientDetailView from './patient-detail-view';

export interface LabRow {
  name: string;
  result: string;
  unit: string;
  ref: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface MedRow {
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
  currentSymptoms: string;
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

function buildFallback(selectedCase: any): PatientRecord {
  return {
    name: selectedCase?.patientName || 'Unknown Patient',
    hn: 'HN-N/A',
    an: 'AN-N/A',
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
    files: [],
  };
}

export default function PatientDetail() {
  const router = useRouter();
  const { selectedCase, closeCase, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activePanel, setActivePanel] = useState<'notes' | 'chat'>('notes');
  const [selectedFileCategory, setSelectedFileCategory] = useState<FileCategoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<'Discharge' | 'Referred' | 'Dead'>('Discharge');
  const [noteInput, setNoteInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [notes, setNotes] = useState([
    { id: 1, author: 'Dr. Sarah Mitchell', role: 'General Surgeon', body: 'Recommended immediate laparoscopic appendectomy. Patient currently NPO.', time: '2h ago', color: '14b8a6' },
    { id: 2, author: 'Dr. James Wilson', role: 'Radiologist', body: 'CT abdomen confirms inflamed appendix, Ø 9mm. Mild periappendiceal fat stranding. No perforation.', time: '4h ago', color: '0ea5e9' },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Mitchell', text: 'Has the patient been prepped for surgery?', time: '14:15', isSelf: false, isSystem: false },
    { id: 2, sender: '', text: '🔔 Lab WBC result updated — 16.2 x10³/µL (CRITICAL)', time: '14:30', isSelf: false, isSystem: true },
    { id: 3, sender: 'You', text: 'Yes, prepped and NPO since 10 AM. OR scheduled for 16:00 today.', time: '14:35', isSelf: true, isSystem: false },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const dbCase = await getCaseById(caseId);
        const dbVitals = await getVitals(caseId);
        const latestV = dbVitals[0];

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
              gcs: latestV?.gcs || '—',
            },
            labs: dbLabs.map((l) => ({ name: l.name, result: l.result, unit: l.unit, ref: l.refRange || '', status: l.status as any })),
            medications: dbMeds.map((m) => ({ name: m.name, dose: m.dose, freq: m.freq, route: m.route, start: m.start || '', category: m.category || '' })),
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

          setNotes(dbNotes.map((n) => ({
            id: Number(n.id) || Date.now(),
            author: n.authorName || 'Unknown',
            role: n.authorRole || 'Medical Staff',
            body: n.body,
            time: n.time || 'recently',
            color: n.authorColor || '64748b',
          })));

          setMessages(dbMsgs.map((m) => ({
            id: Number(m.id) || Date.now(),
            sender: m.senderName || '',
            text: m.text,
            time: m.time || '',
            isSelf: m.isSelf || false,
            isSystem: m.isSystem || false,
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
    return () => {
      isMounted = false;
    };
  }, [selectedCase]);

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

      setRecord((prev) => (prev ? ({ ...prev, files: [uploaded as FileRecord, ...prev.files] }) : prev));
      const uploadedCategory = uploaded.category as FileCategoryFilter;
      setSelectedFileCategory((prev) => (prev === 'all' || prev === uploadedCategory ? prev : 'all'));
      setActiveTab('imaging');
      showToast('File uploaded to case_file', 'success');
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
        authorId: 's1',
        authorName: 'Dr. มนตรีวิฒน์',
        authorRole: 'Attending Physician',
        authorColor: '4318FF',
        body: noteInput,
        time: 'Just now',
      };
      await dbAddCaseNote(newNote);
      setNotes((prev) => [{
        id: Date.now(),
        author: newNote.authorName,
        role: newNote.authorRole,
        body: newNote.body,
        time: 'Just now',
        color: newNote.authorColor,
      }, ...prev]);
      setNoteInput('');
      showToast('Consult note posted to database', 'success');
    } catch {
      showToast('Failed to post note', 'error');
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const next = {
      id: Date.now(),
      sender: 'You',
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
    showToast(`Case closed — ${closeOutcome}`, 'success');
    router.push('/active-cases');
  };

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
        notes={notes}
        messages={messages}
        noteInput={noteInput}
        setNoteInput={setNoteInput}
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
        handleFileSelected={handleFileSelected}
        handlePostNote={handlePostNote}
        handleSendChat={handleSendChat}
        handleClose={handleClose}
      />
    </Layout>
  );
}
