'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import styles from './style.module.css';
import type { RequestForm, Workflow } from './new-request-helpers';
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
  onCancel,
}: NewRequestViewProps) {
  const patientFound = workflow === 'review' && patientLookupMatched;
  const patientNotFound = workflow === 'review' && !patientLookupMatched;
  const currentStep = workflow === 'id-entry' ? 1 : workflow === 'loading' ? 2 : 3;
  const urgencyLevels = [
    { id: 'IMMEDIATE', label: language === 'th' ? '1. อันตรายถึงชีวิตทันที' : '1. Immediate', desc: language === 'th' ? 'อันตรายถึงชีวิต' : 'Life-threatening', time: 'Stat' },
    { id: 'EMERGENCY', label: language === 'th' ? '2. ฉุกเฉิน' : '2. Emergency', desc: language === 'th' ? 'ความเสี่ยงสูง' : 'High risk', time: '< 15m' },
    { id: 'URGENT', label: language === 'th' ? '3. เร่งด่วน' : '3. Urgency', desc: language === 'th' ? 'รุนแรง' : 'Serious', time: '< 60m' },
    { id: 'SEMI-URGENT', label: language === 'th' ? '4. กึ่งเร่งด่วน' : '4. Semi-urgent', desc: language === 'th' ? 'คงที่' : 'Stable', time: '< 2h' },
    { id: 'NON-URGENT', label: language === 'th' ? '5. ไม่เร่งด่วน' : '5. Non-urgent', desc: language === 'th' ? 'ตามปกติ' : 'Routine', time: '2-4h' },
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
            language={language}
            t={t}
            onSubmit={onSubmit}
            onInputChange={onInputChange}
            onSaveDraft={onSaveDraft}
            onCancel={onCancel}
          />
        </>
      )}
    </div>
  );
}
