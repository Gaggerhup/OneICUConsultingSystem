'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { getPatientByIdentifier } from '@/actions/patients';
import NewRequestView from './new-request-view';
import {
  MOCK_PATIENTS,
  buildFormFromPatientLookup,
  clearDraftFromStorage,
  getDraftFromStorage,
  hasMeaningfulDraft,
  initialForm,
  parseDraft,
  saveDraftToStorage,
  updateRequestForm,
  validateIdentifier,
  type RequestForm,
  type Workflow,
} from './new-request-helpers';

function NewRequest() {
  const router = useRouter();
  const { addRequest } = useApp();
  const { t, language } = useLocale();
  const [workflow, setWorkflow] = useState<Workflow>('id-entry');
  const [cidInput, setCidInput] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [formData, setFormData] = useState<RequestForm>(initialForm);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientLookupMatched, setPatientLookupMatched] = useState(false);

  useEffect(() => {
    if (getDraftFromStorage()) {
      setShowDraftBanner(true);
    }
  }, []);

  useEffect(() => {
    if (workflow !== 'review') return;

    const timer = setTimeout(() => {
      if (hasMeaningfulDraft(formData)) {
        saveDraftToStorage(formData);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, workflow]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => updateRequestForm(prev, field, value));
  };

  const handleRestoreDraft = () => {
    const savedDraft = getDraftFromStorage();
    if (!savedDraft) return;

    const draft = parseDraft(savedDraft);
    if (!draft) {
      clearDraftFromStorage();
      setShowDraftBanner(false);
      return;
    }

    setFormData(draft);
    setCidInput(draft.cid || '');
    setPatientLookupMatched(Boolean(draft.patientName));
    setShowDraftBanner(false);
    setWorkflow('review');
  };

  const handleDiscardDraft = () => {
    clearDraftFromStorage();
    setShowDraftBanner(false);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    saveDraftToStorage(formData);
    setTimeout(() => setIsSaving(false), 600);
  };

  const handleLookup = async () => {
    const trimmed = cidInput.trim();
    const validationError = validateIdentifier(trimmed, language);

    if (validationError) {
      setLookupError(validationError);
      return;
    }

    setLookupError('');
    setWorkflow('loading');

    try {
      const dbPatient = await getPatientByIdentifier(trimmed);

      if (dbPatient) {
        setPatientLookupMatched(true);
        setFormData(buildFormFromPatientLookup(dbPatient, trimmed));
      } else {
        const mockPatient = MOCK_PATIENTS[trimmed];
        if (mockPatient) {
          setPatientLookupMatched(true);
          setFormData({ ...initialForm, ...mockPatient, cid: trimmed });
        } else {
          setPatientLookupMatched(false);
          setFormData({ ...initialForm, cid: trimmed });
        }
      }

      setWorkflow('review');
    } catch (error) {
      console.error('[NewRequest] lookup failed', error);
      setPatientLookupMatched(false);
      setLookupError(language === 'th' ? 'ไม่สามารถค้นหาข้อมูลผู้ป่วยได้ในขณะนี้' : 'Unable to look up patient data right now');
      setWorkflow('id-entry');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const newId = await addRequest({
        patientName: formData.patientName,
        hospital: formData.hospital || 'Source Hospital',
        priority: formData.urgency,
        age: parseInt(formData.age, 10) || 0,
        gender: formData.gender,
        reason: formData.complaint,
      });
      clearDraftFromStorage();
      router.push(`/request-submitted?caseId=${newId}`);
    } catch (error) {
      console.error('[NewRequest] submit failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <NewRequestView
        workflow={workflow}
        cidInput={cidInput}
        lookupError={lookupError}
        formData={formData}
        showDraftBanner={showDraftBanner}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        patientLookupMatched={patientLookupMatched}
        language={language}
        t={t}
        setCidInput={setCidInput}
        setLookupError={setLookupError}
        setPatientLookupMatched={setPatientLookupMatched}
        setWorkflow={setWorkflow}
        onLookup={handleLookup}
        onRestoreDraft={handleRestoreDraft}
        onDiscardDraft={handleDiscardDraft}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onSaveDraft={handleSaveDraft}
        onCancel={() => router.push('/dashboard')}
      />
    </Layout>
  );
}

export default NewRequest;
