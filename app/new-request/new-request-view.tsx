'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import styles from './style.module.css';
import { validateRequestForm, type RequestForm, type Workflow } from './new-request-helpers';
import {
  DraftBanner,
  LookupLoading,
  LookupStep,
  RequestHeader,
  RequestSteps,
  ReviewBanner,
  ReviewForm,
} from './new-request-sections';

type TFunction = (key: string) => string;

type NewRequestViewProps = {
  workflow: Workflow;
  cidInput: string;
  lookupError: string;
  formData: RequestForm;
  showDraftBanner: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  patientLookupMatched: boolean;
  selectedFiles: File[];
  language: string;
  t: TFunction;
  setCidInput: Dispatch<SetStateAction<string>>;
  setLookupError: Dispatch<SetStateAction<string>>;
  setPatientLookupMatched: Dispatch<SetStateAction<boolean>>;
  setWorkflow: Dispatch<SetStateAction<Workflow>>;
  onLookup: () => void;
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onInputChange: (field: string, value: string) => void;
  onSaveDraft: () => void;
  onSelectFiles: (files: File[]) => void;
  onRemoveFile: (fileKey: string) => void;
  onCancel: () => void;
};

export default function NewRequestView({
  workflow,
  cidInput,
  lookupError,
  formData,
  showDraftBanner,
  isSaving,
  isSubmitting,
  patientLookupMatched,
  selectedFiles,
  language,
  t,
  setCidInput,
  setLookupError,
  setPatientLookupMatched,
  setWorkflow,
  onLookup,
  onRestoreDraft,
  onDiscardDraft,
  onSubmit,
  onInputChange,
  onSaveDraft,
  onSelectFiles,
  onRemoveFile,
  onCancel,
}: NewRequestViewProps) {
  const patientFound = workflow === 'review' && patientLookupMatched;
  const patientNotFound = workflow === 'review' && !patientLookupMatched;
  const currentStep = workflow === 'id-entry' ? 1 : workflow === 'loading' ? 2 : 3;
  const validationErrors = validateRequestForm(formData);
  const isFormValid = Object.keys(validationErrors).length === 0;
  const urgencyLevels = [
    { id: 'IMMEDIATE', label: t('newRequest.immediate'), desc: t('newRequest.lifeThreatening'), time: 'Stat' },
    { id: 'EMERGENCY', label: '2. ' + t('activeCases.emergency'), desc: t('newRequest.highRisk'), time: '< 15m' },
    { id: 'URGENT', label: '3. ' + t('activeCases.urgent'), desc: t('newRequest.serious'), time: '< 60m' },
    { id: 'SEMI-URGENT', label: '4. ' + t('activeCases.semiUrgent'), desc: t('newRequest.stable'), time: '< 2h' },
    { id: 'NON-URGENT', label: '5. ' + t('activeCases.nonUrgent'), desc: t('newRequest.routine'), time: '2-4h' },
  ] as const;

  return (
    <div className={styles['new-request-container']}>
      {showDraftBanner && (
        <DraftBanner
          t={t}
          onRestoreDraft={onRestoreDraft}
          onDiscardDraft={onDiscardDraft}
        />
      )}

      <RequestHeader t={t} />
      <RequestSteps currentStep={currentStep} t={t} />

      {workflow === 'id-entry' && (
        <LookupStep
          cidInput={cidInput}
          lookupError={lookupError}
          language={language}
          t={t}
          setCidInput={setCidInput}
          setLookupError={setLookupError}
          setPatientLookupMatched={setPatientLookupMatched}
          onLookup={onLookup}
        />
      )}

      {workflow === 'loading' && (
        <LookupLoading cidInput={cidInput} t={t} />
      )}

      {workflow === 'review' && (
        <>
          <ReviewBanner
            patientFound={patientFound}
            cidInput={cidInput}
            language={language}
            t={t}
            setWorkflow={setWorkflow}
            setCidInput={setCidInput}
            setPatientLookupMatched={setPatientLookupMatched}
          />

          <ReviewForm
            formData={formData}
            urgencyLevels={urgencyLevels}
            isSubmitting={isSubmitting}
            isSaving={isSaving}
            validationErrors={validationErrors}
            isFormValid={isFormValid}
            selectedFiles={selectedFiles}
            language={language}
            t={t}
            onSubmit={onSubmit}
            onInputChange={onInputChange}
            onSaveDraft={onSaveDraft}
            onSelectFiles={onSelectFiles}
            onRemoveFile={onRemoveFile}
            onCancel={onCancel}
          />
        </>
      )}
    </div>
  );
}
