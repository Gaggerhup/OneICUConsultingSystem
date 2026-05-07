'use client';

import React, { useEffect } from 'react';
import { Activity, AlertTriangle, ArrowLeft, Check, ChevronRight, Clipboard, ClipboardList, FlaskConical, ImageIcon, Pill, Sparkles, Stethoscope, X } from 'lucide-react';
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
  closeOutcome: 'Discharge' | 'Referred' | 'Dead' | 'Step Down';
  setCloseOutcome: React.Dispatch<React.SetStateAction<'Discharge' | 'Referred' | 'Dead' | 'Step Down'>>;
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
  copyText: string;
  situation: string;
  background: string;
  currentStatus: Array<{ label: string; value: string; tone: 'red' | 'blue' | 'orange' | 'teal' | 'green' | 'purple' }>;
  keyRisks: string[];
  investigations: string[];
  treatmentOrders: Array<{ label: string; value: string }>;
  latestNote: string;
  nextFocus: string;
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

  const chiefComplaint = record.chiefComplaint || 'not recorded';
  const presentIllness = record.presentIllness || record.clinicalNotes || 'not recorded';
  const riskSignals = [
    record.allergies.length > 0 ? `Allergy: ${formatList(record.allergies, 'none recorded')}` : '',
    abnormalLabs.length > 0 ? `Abnormal lab: ${abnormalLabs.join('; ')}` : '',
    record.vitals.spo2 > 0 && record.vitals.spo2 < 94 ? `Low SpO2 ${record.vitals.spo2}%` : '',
    record.vitals.temp >= 38 ? `Fever ${record.vitals.temp} C` : '',
    record.vitals.hr >= 120 ? `Tachycardia HR ${record.vitals.hr}` : '',
  ].filter(Boolean);
  const latestNote = latestSoap
    ? `S: ${latestSoap.s || '—'} | O: ${latestSoap.o || '—'} | A: ${latestSoap.a || '—'} | P: ${latestSoap.p || '—'}`
    : latestPlainNote || record.clinicalNotes || 'No clinical note recorded.';
  const nextFocus = 'Verify current vital stability, review abnormal labs/allergy risk before orders, and update disposition plan with the responsible team.';
  const summary: AiSummaryState = {
    generatedAt: '',
    copyText: '',
    situation: `${record.age || '—'}y ${record.gender || '—'}, HN ${record.hn || '—'}, AN ${record.an || '—'}, chief complaint: ${chiefComplaint}. Present illness: ${presentIllness}. Initial diagnosis: ${record.initialDiagnosis || 'pending assessment'}.`,
    background: `Conditions: ${formatList(record.conditions, 'none recorded')}. Allergies: ${formatList(record.allergies, 'none recorded')}. Location: ${record.district || '—'}, ${record.province || '—'}.`,
    currentStatus: [
      { label: 'BP', value: latestVital.bp || '—', tone: 'blue' },
      { label: 'HR', value: latestVital.hr ? `${latestVital.hr} bpm` : '—', tone: 'red' },
      { label: 'Temp', value: latestVital.temp ? `${latestVital.temp} C` : '—', tone: 'orange' },
      { label: 'RR', value: latestVital.rr ? `${latestVital.rr} /min` : '—', tone: 'teal' },
      { label: 'SpO2', value: latestVital.spo2 ? `${latestVital.spo2}%` : '—', tone: 'green' },
      { label: 'GCS', value: latestVital.gcs || '—', tone: 'purple' },
    ],
    keyRisks: riskSignals.length > 0 ? riskSignals : ['No high-risk signal detected from available structured data.'],
    investigations: abnormalLabs.length > 0 ? abnormalLabs : ['No abnormal lab result available.'],
    treatmentOrders: [
      { label: 'Medications', value: medications.length > 0 ? medications.join('; ') : 'None recorded' },
      { label: 'One-day orders', value: oneDayOrders || 'None recorded' },
      { label: 'Continuation orders', value: continuationOrders || 'None recorded' },
    ],
    latestNote,
    nextFocus,
  };

  summary.copyText = [
    `AI Case Summary - ${record.name || 'Unknown patient'}`,
    '',
    `Situation: ${summary.situation}`,
    `Background: ${summary.background}`,
    `Current status: ${summary.currentStatus.map((item) => `${item.label} ${item.value}`).join(', ')}.`,
    `Key risks: ${summary.keyRisks.join(' | ')}`,
    `Investigations: ${summary.investigations.join('; ')}`,
    `Treatment / orders: ${summary.treatmentOrders.map((item) => `${item.label}: ${item.value}`).join(' | ')}`,
    `Latest note: ${summary.latestNote}`,
    `Recommended next focus: ${summary.nextFocus}`,
  ].join('\n');

  return summary;
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
      const generatedAt = new Date().toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      setAiSummary({
        ...buildAiCaseSummary({ record, vitalsHistory, notes, orderSummaries }),
        generatedAt,
      });
      setIsGeneratingAiSummary(false);
    }, 450);
  }, [notes, orderSummaries, record, vitalsHistory]);

  const handleCopyAiSummary = React.useCallback(async () => {
    if (!aiSummary?.copyText || typeof navigator === 'undefined') return;
    await navigator.clipboard?.writeText(aiSummary.copyText);
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
            {selectedCase?.status === 'Pending' ? t('patientDetail.requestsPage') : selectedCase?.status === 'Declined' || selectedCase?.status === 'Archived' || selectedCase?.status === 'Discharge' || selectedCase?.status === 'Referred' || selectedCase?.status === 'Dead' || selectedCase?.status === 'Step Down' ? t('patientDetail.archiveCasesPage') : t('patientDetail.activeCasesPage')}
          </span>
          <span className={styles['pd-bc-sep']}><ChevronRight size={14} /></span>
          <span className={styles['pd-bc-current']}>Case #{selectedCase?.id || '—'}</span>
        </div>
        <div className={styles['pd-topstrip-right']}>
        <div className={styles['pd-track-badge']}>
          <span className={styles['pd-track-dot']} />
          {selectedCase?.status === 'Pending' ? t('patientDetail.pendingRequest') : selectedCase?.status === 'Declined' ? t('patientDetail.declinedStatus') : selectedCase?.status === 'Discharge' || selectedCase?.status === 'Referred' || selectedCase?.status === 'Dead' || selectedCase?.status === 'Step Down' ? t('patientDetail.closedStatus', { outcome: selectedCase.status }) : t('patientDetail.activeConsultation')}
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
              <div className={styles['pd-ai-summary-head-actions']}>
                <button type="button" className={styles['pd-ai-summary-copy']} onClick={() => void handleCopyAiSummary()}>
                  {copiedSummary ? <Check size={15} /> : <Clipboard size={15} />}
                  {copiedSummary ? t('patientDetail.copied') : t('patientDetail.copySummary')}
                </button>
                <button type="button" className={styles['pd-icon-mini']} onClick={() => setAiSummary(null)} aria-label={t('patientDetail.closeAiSummary')}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className={styles['pd-ai-summary-content']}>
              <section className={styles['pd-ai-summary-spotlight']}>
                <div className={styles['pd-ai-summary-spotlight-icon']}><ClipboardList size={18} /></div>
                <div>
                  <span>{language === 'th' ? 'ภาพรวมเคส' : 'Case overview'}</span>
                  <p>{aiSummary.situation}</p>
                </div>
              </section>

              <div className={styles['pd-ai-summary-grid']}>
                <section className={styles['pd-ai-summary-card']}>
                  <div className={styles['pd-ai-summary-card-head']}>
                    <Activity size={16} />
                    <span>{language === 'th' ? 'สถานะปัจจุบัน' : 'Current status'}</span>
                  </div>
                  <div className={styles['pd-ai-vital-grid']}>
                    {aiSummary.currentStatus.map((item) => (
                      <div key={item.label} className={cx(styles, 'pd-ai-vital-card', `pd-ai-vital-${item.tone}`)}>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles['pd-ai-summary-card']}>
                  <div className={styles['pd-ai-summary-card-head']}>
                    <AlertTriangle size={16} />
                    <span>{language === 'th' ? 'ความเสี่ยงสำคัญ' : 'Key risks'}</span>
                  </div>
                  <div className={styles['pd-ai-chip-list']}>
                    {aiSummary.keyRisks.map((risk) => (
                      <span key={risk} className={styles['pd-ai-risk-chip']}>{risk}</span>
                    ))}
                  </div>
                </section>
              </div>

              <div className={styles['pd-ai-summary-grid']}>
                <section className={styles['pd-ai-summary-card']}>
                  <div className={styles['pd-ai-summary-card-head']}>
                    <FlaskConical size={16} />
                    <span>{language === 'th' ? 'ผลตรวจที่ควรดู' : 'Investigations'}</span>
                  </div>
                  <ul className={styles['pd-ai-summary-list']}>
                    {aiSummary.investigations.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>

                <section className={styles['pd-ai-summary-card']}>
                  <div className={styles['pd-ai-summary-card-head']}>
                    <Pill size={16} />
                    <span>{language === 'th' ? 'ยาและคำสั่งรักษา' : 'Treatment and orders'}</span>
                  </div>
                  <div className={styles['pd-ai-order-list']}>
                    {aiSummary.treatmentOrders.map((item) => (
                      <div key={item.label} className={styles['pd-ai-order-row']}>
                        <span>{item.label}</span>
                        <p>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className={styles['pd-ai-summary-card']}>
                <div className={styles['pd-ai-summary-card-head']}>
                  <Stethoscope size={16} />
                  <span>{language === 'th' ? 'บริบทและ note ล่าสุด' : 'Background and latest note'}</span>
                </div>
                <div className={styles['pd-ai-note-grid']}>
                  <div>
                    <small>{language === 'th' ? 'ประวัติ/บริบท' : 'Background'}</small>
                    <p>{aiSummary.background}</p>
                  </div>
                  <div>
                    <small>{language === 'th' ? 'Note ล่าสุด' : 'Latest note'}</small>
                    <p>{aiSummary.latestNote}</p>
                  </div>
                </div>
              </section>

              <section className={styles['pd-ai-next-focus']}>
                <Sparkles size={16} />
                <div>
                  <span>{language === 'th' ? 'Next focus ที่ AI แนะนำ' : 'Recommended next focus'}</span>
                  <p>{aiSummary.nextFocus}</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
