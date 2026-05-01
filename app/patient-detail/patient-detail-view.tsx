'use client';

import React, { useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight, Clipboard, FlaskConical, ImageIcon, Pill, Sparkles, Stethoscope, X } from 'lucide-react';
import styles from './style.module.css';
import type {
  CrudEntity,
  NoteRow,
  OrderSummaryRow,
  FileCategoryFilter,
  FileRecord,
  PatientRecord,
  Tab,
  VitalHistoryPoint,
  VitalMetricKey,
  LabRow,
  MedRow,
} from './page';
import type { Case } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import {
  PatientCrudEditorModal,
  PatientActivityPanel,
  PatientCloseCaseModal,
  PatientHeroSection,
  PatientPreviewOverlay,
  PatientSidebar,
  PatientTabContent,
  PatientVitalTrendOverlay,
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
  vitalsHistory: VitalHistoryPoint[];
  vitalRows: Array<VitalHistoryPoint & { id: string }>;
  notes: NoteRow[];
  orderSummaries: OrderSummaryRow[];
  messages: Array<{ id: number; sender: string; text: string; time: string; isSelf: boolean; isSystem: boolean }>;
  progressNoteInput: { s: string; o: string; a: string; p: string; oneDay: string; continuation: string };
  setProgressNoteInput: React.Dispatch<React.SetStateAction<{ s: string; o: string; a: string; p: string; oneDay: string; continuation: string }>>;
  showProgressNoteModal: boolean;
  setShowProgressNoteModal: React.Dispatch<React.SetStateAction<boolean>>;
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
  editorState: any;
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  deletingKey: string | null;
  isPostingNote: boolean;
  openOverviewEditor: () => void;
  openVitalEditor: (vital?: VitalHistoryPoint & { id?: string }) => void;
  openLabEditor: (lab?: LabRow) => void;
  openMedicationEditor: (medication?: MedRow) => void;
  openNoteEditor: (note: NoteRow) => void;
  openOrderSummaryEditor: (summary?: OrderSummaryRow) => void;
  openFileEditor: (file: FileRecord) => void;
  handleSaveEditor: () => Promise<void>;
  handleDeleteEntity: (entity: CrudEntity, id: string) => Promise<void>;
  handleFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePostNote: () => Promise<void>;
  handleSendChat: () => void;
  handleClose: () => void;
  onApproveCase?: () => void;
  onDeclineCase?: () => void;
};

type AiSummaryState = {
  generatedAt: string;
  text: string;
};

function formatList(items: string[], fallback: string) {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(', ') : fallback;
}

function buildAiCaseSummary({
  record,
  vitalsHistory,
  notes,
  orderSummaries,
}: {
  record: PatientRecord;
  vitalsHistory: VitalHistoryPoint[];
  notes: NoteRow[];
  orderSummaries: OrderSummaryRow[];
}) {
  const abnormalLabs = record.labs
    .filter((lab) => lab.status !== 'normal')
    .slice(0, 5)
    .map((lab) => `${lab.name} ${lab.result}${lab.unit ? ` ${lab.unit}` : ''} (${lab.status})`);
  const medications = record.medications.slice(0, 6).map((med) => `${med.name} ${med.dose} ${med.freq}`.trim());
  const latestVital = vitalsHistory[vitalsHistory.length - 1] || record.vitals;
  const latestSoap = notes.find((note) => note.soap)?.soap;
  const latestPlainNote = notes.find((note) => note.body.trim())?.body.trim();
  const oneDayOrders = orderSummaries.find((summary) => summary.oneDay.trim())?.oneDay.trim();
  const continuationOrders = orderSummaries.find((summary) => summary.continuation.trim())?.continuation.trim();

  const riskSignals = [
    record.allergies.length > 0 ? `Allergy: ${formatList(record.allergies, 'none recorded')}` : '',
    abnormalLabs.length > 0 ? `Abnormal lab: ${abnormalLabs.join('; ')}` : '',
    record.vitals.spo2 > 0 && record.vitals.spo2 < 94 ? `Low SpO2 ${record.vitals.spo2}%` : '',
    record.vitals.temp >= 38 ? `Fever ${record.vitals.temp} C` : '',
    record.vitals.hr >= 120 ? `Tachycardia HR ${record.vitals.hr}` : '',
  ].filter(Boolean);

  return [
    `AI Case Summary - ${record.name || 'Unknown patient'}`,
    '',
    `Situation: ${record.age || '—'}y ${record.gender || '—'}, HN ${record.hn || '—'}, AN ${record.an || '—'}, with ${record.currentSymptoms || 'no symptom summary recorded'}. Initial diagnosis: ${record.initialDiagnosis || 'pending assessment'}.`,
    `Background: Conditions: ${formatList(record.conditions, 'none recorded')}. Allergies: ${formatList(record.allergies, 'none recorded')}. Location: ${record.district || '—'}, ${record.province || '—'}.`,
    `Current status: BP ${latestVital.bp || '—'}, HR ${latestVital.hr || '—'}, Temp ${latestVital.temp || '—'} C, RR ${latestVital.rr || '—'}, SpO2 ${latestVital.spo2 || '—'}%, GCS ${latestVital.gcs || '—'}.`,
    `Key risks: ${riskSignals.length > 0 ? riskSignals.join(' | ') : 'No high-risk signal detected from available structured data.'}`,
    `Investigations: ${abnormalLabs.length > 0 ? abnormalLabs.join('; ') : 'No abnormal lab result available.'}`,
    `Treatment / orders: Medications: ${medications.length > 0 ? medications.join('; ') : 'none recorded'}. One-day orders: ${oneDayOrders || 'none recorded'}. Continuation orders: ${continuationOrders || 'none recorded'}.`,
    latestSoap
      ? `Latest SOAP: S: ${latestSoap.s || '—'} | O: ${latestSoap.o || '—'} | A: ${latestSoap.a || '—'} | P: ${latestSoap.p || '—'}`
      : `Latest note: ${latestPlainNote || record.clinicalNotes || 'No clinical note recorded.'}`,
    'Recommended next focus: verify current vital stability, review abnormal labs/allergy risk before orders, and update disposition plan with the responsible team.',
  ].join('\n');
}

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
  vitalsHistory,
  vitalRows,
  notes,
  orderSummaries,
  messages,
  progressNoteInput,
  setProgressNoteInput,
  showProgressNoteModal,
  setShowProgressNoteModal,
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
  editorState,
  setEditorState,
  isSaving,
  deletingKey,
  isPostingNote,
  openOverviewEditor,
  openVitalEditor,
  openLabEditor,
  openMedicationEditor,
  openNoteEditor,
  openOrderSummaryEditor,
  openFileEditor,
  handleSaveEditor,
  handleDeleteEntity,
  handleFileSelected,
  handlePostNote,
  handleSendChat,
  handleClose,
  onApproveCase,
  onDeclineCase,
}: PatientDetailViewProps) {
  const { t, language } = useLocale();
  const urgency = urgencyPalette[selectedCase?.priority || 'URGENT'] || urgencyPalette.URGENT;
  const [selectedVitalMetrics, setSelectedVitalMetrics] = React.useState<VitalMetricKey[]>([]);
  const [showTrendOverlay, setShowTrendOverlay] = React.useState(false);
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = React.useState(false);
  const [aiSummary, setAiSummary] = React.useState<AiSummaryState | null>(null);
  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const [pulseMetric, setPulseMetric] = React.useState<VitalMetricKey | null>(null);
  const [openAccordion, setOpenAccordion] = React.useState<'workspace' | 'activity' | null>('workspace');
  const pulseTimerRef = React.useRef<number | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: t('patientDetail.overview'), icon: <Stethoscope size={15} /> },
    { id: 'labs', label: t('patientDetail.labs'), icon: <FlaskConical size={15} />, badge: record?.labs.filter((lab) => lab.status !== 'normal').length.toString() },
    { id: 'medications', label: t('patientDetail.medications'), icon: <Pill size={15} /> },
    { id: 'imaging', label: t('patientDetail.imaging'), icon: <ImageIcon size={15} /> },
  ];

  const filteredFiles = record?.files.filter((file) => selectedFileCategory === 'all' || file.category === selectedFileCategory) || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatEndRef, messages, activePanel]);

  useEffect(() => (
    () => {
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
    }
  ), []);

  const toggleVitalMetric = React.useCallback((metric: VitalMetricKey) => {
    setSelectedVitalMetrics((prev) => {
      const exists = prev.includes(metric);
      if (exists) {
        const next = prev.filter((item) => item !== metric);
        if (next.length === 0) {
          setShowTrendOverlay(false);
        }
        return next;
      }
      setShowTrendOverlay(true);
      setPulseMetric(metric);
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
      pulseTimerRef.current = window.setTimeout(() => {
        setPulseMetric((current) => (current === metric ? null : current));
      }, 900);
      return [...prev, metric];
    });
  }, []);

  useEffect(() => {
    if (selectedVitalMetrics.length === 0 && showTrendOverlay) {
      setShowTrendOverlay(false);
    }
  }, [selectedVitalMetrics, showTrendOverlay]);

  const handleGenerateAiSummary = React.useCallback(() => {
    if (!record) return;
    setIsGeneratingAiSummary(true);
    setCopiedSummary(false);
    window.setTimeout(() => {
      setAiSummary({
        generatedAt: new Date().toLocaleString('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        text: buildAiCaseSummary({ record, vitalsHistory, notes, orderSummaries }),
      });
      setIsGeneratingAiSummary(false);
    }, 450);
  }, [notes, orderSummaries, record, vitalsHistory]);

  const handleCopyAiSummary = React.useCallback(async () => {
    if (!aiSummary?.text || typeof navigator === 'undefined') return;
    await navigator.clipboard?.writeText(aiSummary.text);
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1600);
  }, [aiSummary]);

  return (
    <div className={styles['pd-root']}>
      <div className={styles['pd-topstrip']}>
        <div className={styles['pd-topstrip-left']}>
          <button className={styles['pd-btn-back']} onClick={onBack}>
            <ArrowLeft size={15} /> {t('patientDetail.backLabel')}
          </button>
          <span className={styles['pd-bc-sep']}><ChevronRight size={14} /></span>
          <span className={styles['pd-bc-page']}>
            {selectedCase?.status === 'Pending' ? t('patientDetail.requestsPage') : selectedCase?.status === 'Declined' || selectedCase?.status === 'Archived' || selectedCase?.status === 'Discharge' || selectedCase?.status === 'Referred' || selectedCase?.status === 'Dead' ? t('patientDetail.archiveCasesPage') : t('patientDetail.activeCasesPage')}
          </span>
          <span className={styles['pd-bc-sep']}><ChevronRight size={14} /></span>
          <span className={styles['pd-bc-current']}>Case #{selectedCase?.id || '—'}</span>
        </div>
        <div className={styles['pd-topstrip-right']}>
        <div className={styles['pd-track-badge']}>
          <span className={styles['pd-track-dot']} />
          {selectedCase?.status === 'Pending' ? t('patientDetail.pendingRequest') : selectedCase?.status === 'Declined' ? t('patientDetail.declinedStatus') : selectedCase?.status === 'Discharge' || selectedCase?.status === 'Referred' || selectedCase?.status === 'Dead' ? t('patientDetail.closedStatus', { outcome: selectedCase.status }) : t('patientDetail.activeConsultation')}
        </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className={styles['pd-file-input']}
        onChange={handleFileSelected}
        accept=".dcm,.dicom,.png,.jpg,.jpeg,.pdf,.csv,.txt,.doc,.docx,.rtf,.md,image/*,application/pdf,application/dicom,text/csv"
      />

      <PatientHeroSection
        isLoading={isLoading}
        record={record}
        urgency={urgency}
        vitalsHistory={vitalsHistory}
        selectedMetrics={selectedVitalMetrics}
        pulseMetric={pulseMetric}
        caseStatus={selectedCase?.status}
        onEditOverview={openOverviewEditor}
        onGenerateAiSummary={handleGenerateAiSummary}
        isGeneratingAiSummary={isGeneratingAiSummary}
        onOpenCloseCase={() => setShowCloseModal(true)}
        onApproveCase={onApproveCase}
        onDeclineCase={onDeclineCase}
        onVitalSelect={toggleVitalMetric}
        onClearSelectedVitals={() => {
          setSelectedVitalMetrics([]);
          setShowTrendOverlay(false);
        }}
      />

      <div className={styles['pd-shell']}>
        <div className={styles['pd-workspace-head']}>
          <div>
            <strong>{t('patientDetail.clinicalWorkspace')}</strong>
            <small>{t('patientDetail.clinicalWorkspaceHint')}</small>
          </div>
          <div className={styles['pd-workspace-badges']}>
            <span>{t('patientDetail.notesLabel')} {notes.length}</span>
            <span>{t('patientDetail.filesLabel')} {record?.files.length || 0}</span>
            <span>{t('patientDetail.labsLabel')} {record?.labs.length || 0}</span>
          </div>
        </div>

        <div
          className={[
            styles['pd-cols'],
            openAccordion === 'workspace' ? styles['pd-cols-workspace-focus'] : '',
            openAccordion === 'activity' ? styles['pd-cols-activity-focus'] : '',
          ].filter(Boolean).join(' ')}
        >
          <PatientSidebar isLoading={isLoading} record={record} />
          <PatientTabContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
            isOpen={openAccordion === 'workspace'}
            onToggleOpen={() => setOpenAccordion((current) => (current === 'workspace' ? null : 'workspace'))}
            isLoading={isLoading}
            record={record}
            selectedFileCategory={selectedFileCategory}
            setSelectedFileCategory={setSelectedFileCategory}
            filteredFiles={filteredFiles}
            isUploading={isUploading}
            vitalRows={vitalRows}
            openFilePicker={openFilePicker}
            openFilePreview={openFilePreview}
            downloadFile={downloadFile}
            openVitalEditor={openVitalEditor}
            openLabEditor={openLabEditor}
            openMedicationEditor={openMedicationEditor}
            openFileEditor={openFileEditor}
            handleDeleteEntity={handleDeleteEntity}
            deletingKey={deletingKey}
          />
          <PatientActivityPanel
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            isOpen={openAccordion === 'activity'}
            onToggleOpen={() => setOpenAccordion((current) => (current === 'activity' ? null : 'activity'))}
            notes={notes}
            orderSummaries={orderSummaries}
            messages={messages}
            progressNoteInput={progressNoteInput}
            setProgressNoteInput={setProgressNoteInput}
            showProgressNoteModal={showProgressNoteModal}
            setShowProgressNoteModal={setShowProgressNoteModal}
            chatInput={chatInput}
            setChatInput={setChatInput}
            chatEndRef={chatEndRef}
            openNoteEditor={openNoteEditor}
            openOrderSummaryEditor={openOrderSummaryEditor}
            handleDeleteEntity={handleDeleteEntity}
            deletingKey={deletingKey}
            isPostingNote={isPostingNote}
            handlePostNote={handlePostNote}
            handleSendChat={handleSendChat}
          />
        </div>
      </div>

      <PatientPreviewOverlay
        previewFile={previewFile}
        setPreviewFile={setPreviewFile}
        downloadFile={downloadFile}
      />

      {showTrendOverlay && (
        <PatientVitalTrendOverlay
          selectedMetrics={selectedVitalMetrics}
          vitalsHistory={vitalsHistory}
          onToggleMetric={toggleVitalMetric}
          onClose={() => setShowTrendOverlay(false)}
        />
      )}

      <PatientCrudEditorModal
        editorState={editorState}
        setEditorState={setEditorState}
        isSaving={isSaving}
        handleSaveEditor={handleSaveEditor}
      />

      <PatientCloseCaseModal
        showCloseModal={showCloseModal}
        setShowCloseModal={setShowCloseModal}
        closeOutcome={closeOutcome}
        setCloseOutcome={setCloseOutcome}
        handleClose={handleClose}
      />

      {aiSummary && (
        <div className={styles['pd-overlay']}>
          <div className={styles['pd-ai-summary-modal']} role="dialog" aria-modal="true" aria-labelledby="pd-ai-summary-title">
            <div className={styles['pd-ai-summary-head']}>
              <div>
                <span><Sparkles size={15} /> {t('patientDetail.aiSummaryCase')}</span>
                <h2 id="pd-ai-summary-title">{t('patientDetail.patientCaseSummary', { name: record?.name || (language === 'th' ? 'ผู้ป่วย' : 'Patient') })}</h2>
                <small>{t('patientDetail.generatedFromCurrentPage', { time: aiSummary.generatedAt })}</small>
              </div>
              <button type="button" className={styles['pd-icon-mini']} onClick={() => setAiSummary(null)} aria-label={t('patientDetail.closeAiSummary')}>
                <X size={15} />
              </button>
            </div>
            <pre className={styles['pd-ai-summary-body']}>{aiSummary.text}</pre>
            <div className={styles['pd-ai-summary-actions']}>
              <button type="button" className={styles['pd-ai-summary-copy']} onClick={() => void handleCopyAiSummary()}>
                {copiedSummary ? <Check size={15} /> : <Clipboard size={15} />}
                {copiedSummary ? t('patientDetail.copied') : t('patientDetail.copySummary')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
