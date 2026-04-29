'use client';

import React, { useEffect } from 'react';
import { ArrowLeft, CheckCircle, ChevronRight, Edit3, FlaskConical, ImageIcon, Pill, Stethoscope, UploadCloud } from 'lucide-react';
import styles from './style.module.css';
import type {
  FileCategoryFilter,
  FileRecord,
  PatientRecord,
  Tab,
} from './page';
import type { Case } from '@/context/AppContext';
import {
  PatientActivityPanel,
  PatientCloseCaseModal,
  PatientHeroSection,
  PatientPreviewOverlay,
  PatientSidebar,
  PatientTabContent,
} from './patient-detail-sections';
import { cx } from '@/lib/cx';

const urgencyPalette: Record<string, { bg: string; text: string; label: string }> = {
  IMMEDIATE: { bg: '#fef2f2', text: '#ef4444', label: '1. Immediate Life-Threatening' },
  EMERGENCY: { bg: '#fff7ed', text: '#f97316', label: '2. Emergency' },
  URGENT: { bg: '#fefce8', text: '#ca8a04', label: '3. Urgent' },
  'SEMI-URGENT': { bg: '#f0fdf4', text: '#16a34a', label: '4. Semi-Urgent' },
  'NON-URGENT': { bg: '#eff6ff', text: '#2563eb', label: '5. Non-Urgent' },
};

type PatientDetailViewProps = {
  selectedCase: Case | null;
  record: PatientRecord | null;
  isLoading: boolean;
  isUploading: boolean;
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  activePanel: 'notes' | 'chat';
  setActivePanel: React.Dispatch<React.SetStateAction<'notes' | 'chat'>>;
  selectedFileCategory: FileCategoryFilter;
  setSelectedFileCategory: React.Dispatch<React.SetStateAction<FileCategoryFilter>>;
  notes: Array<{ id: number; author: string; role: string; body: string; time: string; color: string }>;
  messages: Array<{ id: number; sender: string; text: string; time: string; isSelf: boolean; isSystem: boolean }>;
  noteInput: string;
  setNoteInput: React.Dispatch<React.SetStateAction<string>>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  showCloseModal: boolean;
  setShowCloseModal: React.Dispatch<React.SetStateAction<boolean>>;
  closeOutcome: 'Discharge' | 'Referred' | 'Dead';
  setCloseOutcome: React.Dispatch<React.SetStateAction<'Discharge' | 'Referred' | 'Dead'>>;
  previewFile: FileRecord | null;
  setPreviewFile: React.Dispatch<React.SetStateAction<FileRecord | null>>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onBack: () => void;
  openFilePicker: () => void;
  openFilePreview: (file: FileRecord) => void;
  downloadFile: (file: FileRecord) => void;
  handleFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePostNote: () => Promise<void>;
  handleSendChat: () => void;
  handleClose: () => void;
};

export default function PatientDetailView({
  selectedCase,
  record,
  isLoading,
  isUploading,
  activeTab,
  setActiveTab,
  activePanel,
  setActivePanel,
  selectedFileCategory,
  setSelectedFileCategory,
  notes,
  messages,
  noteInput,
  setNoteInput,
  chatInput,
  setChatInput,
  showCloseModal,
  setShowCloseModal,
  closeOutcome,
  setCloseOutcome,
  previewFile,
  setPreviewFile,
  chatEndRef,
  fileInputRef,
  onBack,
  openFilePicker,
  openFilePreview,
  downloadFile,
  handleFileSelected,
  handlePostNote,
  handleSendChat,
  handleClose,
}: PatientDetailViewProps) {
  const urgency = urgencyPalette[selectedCase?.priority || 'URGENT'] || urgencyPalette.URGENT;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <Stethoscope size={15} /> },
    { id: 'labs', label: 'Labs', icon: <FlaskConical size={15} />, badge: record?.labs.filter((lab) => lab.status !== 'normal').length.toString() },
    { id: 'medications', label: 'Medications', icon: <Pill size={15} /> },
    { id: 'imaging', label: 'Imaging', icon: <ImageIcon size={15} /> },
  ];

  const filteredFiles = record?.files.filter((file) => selectedFileCategory === 'all' || file.category === selectedFileCategory) || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatEndRef, messages, activePanel]);

  return (
    <div className={styles['pd-root']}>
      <div className={styles['pd-topstrip']}>
        <div className={styles['pd-topstrip-left']}>
          <button className={styles['pd-btn-back']} onClick={onBack}>
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
          <button className={cx(styles, 'pd-icon-btn', 'pd-icon-btn--danger')} onClick={() => setShowCloseModal(true)} title="Close Case">
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

      <PatientHeroSection isLoading={isLoading} record={record} urgency={urgency} />

      <div className={styles['pd-cols']}>
        <PatientSidebar isLoading={isLoading} record={record} />
        <PatientTabContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          isLoading={isLoading}
          record={record}
          selectedFileCategory={selectedFileCategory}
          setSelectedFileCategory={setSelectedFileCategory}
          filteredFiles={filteredFiles}
          isUploading={isUploading}
          openFilePicker={openFilePicker}
          openFilePreview={openFilePreview}
          downloadFile={downloadFile}
        />
        <PatientActivityPanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          notes={notes}
          messages={messages}
          noteInput={noteInput}
          setNoteInput={setNoteInput}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatEndRef={chatEndRef}
          handlePostNote={handlePostNote}
          handleSendChat={handleSendChat}
        />
      </div>

      <PatientPreviewOverlay
        previewFile={previewFile}
        setPreviewFile={setPreviewFile}
        downloadFile={downloadFile}
      />

      <PatientCloseCaseModal
        showCloseModal={showCloseModal}
        setShowCloseModal={setShowCloseModal}
        closeOutcome={closeOutcome}
        setCloseOutcome={setCloseOutcome}
        handleClose={handleClose}
      />
    </div>
  );
}
