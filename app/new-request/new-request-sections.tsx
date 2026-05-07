'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Hospital,
  IdCard,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './style.module.css';
import type { RequestForm, Workflow } from './new-request-helpers';

type TFunction = (key: string, vars?: Record<string, string | number>) => string;

type UrgencyLevel = {
  id: string;
  label: string;
  desc: string;
  time: string;
};

type BannerActionProps = {
  setWorkflow: Dispatch<SetStateAction<Workflow>>;
  setCidInput: Dispatch<SetStateAction<string>>;
  setPatientLookupMatched: Dispatch<SetStateAction<boolean>>;
};

export function DraftBanner({
  t,
  onRestoreDraft,
  onDiscardDraft,
}: {
  t: TFunction;
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
}) {
  return (
    <div className={styles['draft-banner']}>
      <div className={styles['icon-bg']}><RotateCcw size={18} color="#2563eb" /></div>
      <div className={styles['draft-info']}>{t('newRequest.restoreDraftQuestion')}</div>
      <div className={styles['draft-actions']}>
        <button className={styles['btn-restore-sm']} onClick={onRestoreDraft}>{t('newRequest.restoreDraft')}</button>
        <button className={styles['btn-discard-sm']} onClick={onDiscardDraft}>{t('newRequest.discard')}</button>
      </div>
    </div>
  );
}

export function RequestHeader({ t }: { t: TFunction }) {
  return (
    <div className={styles['nr-header']}>
      <h1>{t('newRequest.title')}</h1>
      <p>{t('newRequest.subtitle')}</p>
    </div>
  );
}

export function RequestSteps({
  currentStep,
  t,
}: {
  currentStep: number;
  t: TFunction;
}) {
  return (
    <div className={styles['cid-steps']}>
      {[t('newRequest.stepId'), t('newRequest.stepFetch'), t('newRequest.stepReview'), t('newRequest.stepSubmit')].map((label, index) => {
        const stepNum = index + 1;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;

        return (
          <div key={label} className={cx(styles, 'step-item', active && 'active', done && 'done')}>
            <div className={styles['step-circle']}>
              {done ? <CheckCircle2 size={14} /> : stepNum}
            </div>
            <span className={styles['step-label']}>{label}</span>
            {index < 3 && <ChevronRight size={14} className={styles['step-arrow']} />}
          </div>
        );
      })}
    </div>
  );
}

export function LookupStep({
  cidInput,
  lookupError,
  language,
  t,
  setCidInput,
  setLookupError,
  setPatientLookupMatched,
  onLookup,
}: {
  cidInput: string;
  lookupError: string;
  language: string;
  t: TFunction;
  setCidInput: Dispatch<SetStateAction<string>>;
  setLookupError: Dispatch<SetStateAction<string>>;
  setPatientLookupMatched: Dispatch<SetStateAction<boolean>>;
  onLookup: () => void;
}) {
  return (
    <div className={styles['cid-lookup-step']}>
      <div className={styles['cid-lookup-card']}>
        <div className={styles['cid-lookup-icon']}><IdCard size={36} /></div>
        <h2>{t('newRequest.lookupTitle')}</h2>
        <p>{t('newRequest.lookupSubtitle')}</p>

        <div className={cx(styles, 'cid-input-wrap', lookupError && 'has-error')}>
          <Search size={20} className={styles['cid-search-icon']} />
          <input
            type="text"
            className={styles['cid-input-large']}
            placeholder={t('newRequest.cidOrPassport')}
            value={cidInput}
            maxLength={20}
            onChange={(event) => {
              setCidInput(event.target.value.toUpperCase());
              setLookupError('');
              setPatientLookupMatched(false);
            }}
            onKeyDown={(event) => event.key === 'Enter' && onLookup()}
          />
        </div>

        {lookupError && (
          <div className={styles['cid-error']}>
            <AlertCircle size={16} />
            {lookupError}
          </div>
        )}

        <button className={styles['btn-cid-lookup']} onClick={onLookup}>
          <Search size={18} /> {t('newRequest.lookupButton')}
        </button>

        <p className={styles['cid-hint']}>
          {t('newRequest.lookupHint', {
            examples: '1234567890123, 9876543210987, A12345678',
          })}
        </p>
      </div>
    </div>
  );
}

export function LookupLoading({
  cidInput,
  t,
}: {
  cidInput: string;
  t: TFunction;
}) {
  return (
    <div className={styles['cid-lookup-step']}>
      <div className={styles['lookup-loading-card']}>
        <Loader2 size={48} className={styles['spin-icon']} />
        <h2>{t('newRequest.loadingTitle')}</h2>
        <p>{t('newRequest.loadingSubtitle')} <code>{cidInput}</code></p>
        <div className={styles['lookup-progress-bar']}>
          <div className={styles['lookup-progress-fill']} />
        </div>
      </div>
    </div>
  );
}

export function ReviewBanner({
  patientFound,
  cidInput,
  language,
  t,
  setWorkflow,
  setCidInput,
  setPatientLookupMatched,
}: {
  patientFound: boolean;
  cidInput: string;
  language: string;
  t: TFunction;
} & BannerActionProps) {
  const resetLookup = () => {
    setWorkflow('id-entry');
    setCidInput('');
    setPatientLookupMatched(false);
  };

  if (patientFound) {
    return (
      <div className={cx(styles, 'review-banner', 'success')}>
        <CheckCircle2 size={20} />
        <div>
        <strong>{t('newRequest.patientVerified')}</strong>
          <span>{t('newRequest.patientAutofillHint')}</span>
        </div>
        <button className={styles['btn-change-cid']} onClick={resetLookup}>
          {t('newRequest.changeCid')}
        </button>
      </div>
    );
  }

  return (
    <div className={cx(styles, 'review-banner', 'warning')}>
      <AlertCircle size={20} />
      <div>
        <strong>{t('newRequest.patientNotFound')}</strong>
        <span>{t('newRequest.patientManualEntryHint', { cid: cidInput })}</span>
      </div>
      <button className={styles['btn-change-cid']} onClick={resetLookup}>
        {t('newRequest.changeCid')}
      </button>
    </div>
  );
}

export function ReviewForm({
  formData,
  urgencyLevels,
  isSubmitting,
  isSaving,
  validationErrors,
  isFormValid,
  selectedFiles,
  language,
  t,
  onSubmit,
  onInputChange,
  onSaveDraft,
  onSelectFiles,
  onRemoveFile,
  onCancel,
}: {
  formData: RequestForm;
  urgencyLevels: readonly UrgencyLevel[];
  isSubmitting: boolean;
  isSaving: boolean;
  validationErrors: Record<string, string>;
  isFormValid: boolean;
  selectedFiles: File[];
  language: string;
  t: TFunction;
  onSubmit: (event: FormEvent) => Promise<void>;
  onInputChange: (field: string, value: string) => void;
  onSaveDraft: () => void;
  onSelectFiles: (files: File[]) => void;
  onRemoveFile: (fileKey: string) => void;
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const renderError = (key: string) => (
    validationErrors[key] ? <small className={styles['nr-field-error']}>{validationErrors[key]}</small> : null
  );

  const fieldClassName = (key: string) => validationErrors[key] ? styles['nr-input-invalid'] : undefined;

  return (
    <form className={styles['nr-grid']} onSubmit={onSubmit}>
      <div className={styles['nr-form-sections']}>
        {!isFormValid && (
          <div className={styles['nr-form-banner']}>
            <AlertCircle size={16} />
            <span>{t('newRequest.reviewHighlightedFields')}</span>
          </div>
        )}
        <section className={cx(styles, 'nr-card', 'nr-card-patient')}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><User size={18} /></div>
            <h2>{t('newRequest.patientInformation')}</h2>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.cidOrPassport')}</label>
              <input type="text" value={formData.cid} readOnly className={cx(styles, 'input-readonly', fieldClassName('cid'))} />
              {renderError('cid')}
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.hospitalNumber')}</label>
              <input type="text" placeholder="HN-000000" value={formData.hn} className={fieldClassName('hn')} onChange={(event) => onInputChange('hn', event.target.value)} />
              {renderError('hn')}
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.admissionNumber')}</label>
              <input type="text" placeholder="AN-000000" value={formData.an} onChange={(event) => onInputChange('an', event.target.value)} />
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.patientFullName')}</label>
              <input type="text" placeholder={t('newRequest.patientFullName')} value={formData.patientName} className={fieldClassName('patientName')} onChange={(event) => onInputChange('patientName', event.target.value)} />
              {renderError('patientName')}
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.age')}</label>
              <input type="number" placeholder={language === 'th' ? 'ปี' : 'Years'} value={formData.age} className={fieldClassName('age')} onChange={(event) => onInputChange('age', event.target.value)} />
              {renderError('age')}
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.gender')}</label>
              <select value={formData.gender} className={fieldClassName('gender')} onChange={(event) => onInputChange('gender', event.target.value)}>
                <option value="">{t('newRequest.selectGender')}</option>
                <option value="male">{t('newRequest.male')}</option>
                <option value="female">{t('newRequest.female')}</option>
                <option value="other">{t('newRequest.other')}</option>
              </select>
              {renderError('gender')}
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.bloodType')}</label>
              <input type="text" placeholder="O+, A+, B+, AB+" value={formData.bloodType} onChange={(event) => onInputChange('bloodType', event.target.value)} />
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.phoneLabel')}</label>
              <input type="text" placeholder="08x-xxx-xxxx" value={formData.phone} onChange={(event) => onInputChange('phone', event.target.value)} />
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.dob')}</label>
              <input type="date" value={formData.dob} className={fieldClassName('dob')} onChange={(event) => onInputChange('dob', event.target.value)} />
              {renderError('dob')}
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.district')}</label>
              <input type="text" placeholder={t('newRequest.district')} value={formData.district} onChange={(event) => onInputChange('district', event.target.value)} />
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.province')}</label>
              <input type="text" placeholder={t('newRequest.province')} value={formData.province} onChange={(event) => onInputChange('province', event.target.value)} />
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.conditions')}</label>
              <textarea rows={2} placeholder={t('newRequest.conditionsPlaceholder')} value={formData.conditions} onChange={(event) => onInputChange('conditions', event.target.value)} />
            </div>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.allergies')}</label>
              <textarea rows={2} placeholder={t('newRequest.allergiesPlaceholder')} value={formData.allergies} onChange={(event) => onInputChange('allergies', event.target.value)} />
            </div>
          </div>
        </section>

        <section className={cx(styles, 'nr-card', 'nr-card-clinical')}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><Activity size={18} /></div>
            <h2>{t('newRequest.clinicalPresentation')}</h2>
          </div>
          <div className={cx(styles, 'nr-group', 'spaced-group')}>
            <label>{t('newRequest.chiefComplaintLabel')}</label>
            <textarea rows={2} placeholder={t('newRequest.chiefComplaintPlaceholder')} value={formData.chiefComplaint} className={fieldClassName('chiefComplaint')} onChange={(event) => onInputChange('chiefComplaint', event.target.value)} />
            {renderError('chiefComplaint')}
          </div>
          <div className={cx(styles, 'nr-group', 'spaced-group')}>
            <label>{t('newRequest.presentIllnessLabel')}</label>
            <textarea rows={4} placeholder={t('newRequest.presentIllnessPlaceholder')} value={formData.presentIllness} className={fieldClassName('presentIllness')} onChange={(event) => onInputChange('presentIllness', event.target.value)} />
            {renderError('presentIllness')}
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.initialDiagnosis')}</label>
              <input type="text" placeholder={t('newRequest.initialDiagnosis')} value={formData.initialDiagnosis} className={fieldClassName('initialDiagnosis')} onChange={(event) => onInputChange('initialDiagnosis', event.target.value)} />
              {renderError('initialDiagnosis')}
            </div>
          </div>
          <div className={cx(styles, 'nr-group', 'spaced-group')}>
            <label>{t('newRequest.clinicalNotes')}</label>
            <textarea rows={3} placeholder={t('newRequest.clinicalNotesPlaceholder')} value={formData.clinicalNotes} onChange={(event) => onInputChange('clinicalNotes', event.target.value)} />
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>BP (mmHg)</label>
              <input type="text" placeholder="120/80" value={formData.vitals.bp} className={fieldClassName('vitals.bp')} onChange={(event) => onInputChange('vitals.bp', event.target.value)} />
              {renderError('vitals.bp')}
            </div>
            <div className={styles['nr-group']}>
              <label>HR (bpm)</label>
              <input type="text" placeholder="72" value={formData.vitals.hr} className={fieldClassName('vitals.hr')} onChange={(event) => onInputChange('vitals.hr', event.target.value)} />
              {renderError('vitals.hr')}
            </div>
            <div className={styles['nr-group']}>
              <label>Temp (°C)</label>
              <input type="text" placeholder="36.5" value={formData.vitals.temp} className={fieldClassName('vitals.temp')} onChange={(event) => onInputChange('vitals.temp', event.target.value)} />
              {renderError('vitals.temp')}
            </div>
            <div className={styles['nr-group']}>
              <label>RR (/min)</label>
              <input type="text" placeholder="18" value={formData.vitals.rr} className={fieldClassName('vitals.rr')} onChange={(event) => onInputChange('vitals.rr', event.target.value)} />
              {renderError('vitals.rr')}
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>SpO₂ (%)</label>
              <input type="text" placeholder="98" value={formData.vitals.spo2} className={fieldClassName('vitals.spo2')} onChange={(event) => onInputChange('vitals.spo2', event.target.value)} />
              {renderError('vitals.spo2')}
            </div>
            <div className={styles['nr-group']}>
              <label>GCS</label>
              <input type="text" placeholder="15/15" value={formData.vitals.gcs} className={fieldClassName('vitals.gcs')} onChange={(event) => onInputChange('vitals.gcs', event.target.value)} />
              {renderError('vitals.gcs')}
            </div>
          </div>
        </section>

        <section className={cx(styles, 'nr-card', 'nr-card-consult')}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><Hospital size={18} /></div>
            <h2>{t('newRequest.consultationSpecifics')}</h2>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.sourceHospital')}</label>
              <select value={formData.hospital} className={fieldClassName('hospital')} onChange={(event) => onInputChange('hospital', event.target.value)}>
                <option value="">{t('newRequest.selectHospital')}</option>
                <option>โรงพยาบาลพุทธชินราช พิษณุโลก</option>
                <option>โรงพยาบาลวังทอง</option>
                <option>โรงพยาบาลวัดโบสถ์</option>
                <option>โรงพยาบาลพรหมพิราม</option>
                <option>โรงพยาบาลบางระกำ</option>
                <option>โรงพยาบาลบางกระทุ่ม</option>
                <option>โรงพยาบาลเนินมะปราง</option>
                <option>โรงพยาบาลสมเด็จพระยุพราชนครไทย</option>
                <option>โรงพยาบาลชาติตระการ</option>
              </select>
              {renderError('hospital')}
            </div>
          </div>
        </section>

        <section className={cx(styles, 'nr-card', 'nr-card-files')}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><FileText size={18} /></div>
            <h2>{t('newRequest.attachments')}</h2>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              if (files.length > 0) onSelectFiles(files);
              event.target.value = '';
            }}
            accept=".dcm,.dicom,.png,.jpg,.jpeg,.pdf,.csv,.txt,.doc,.docx,.rtf,.md,image/*,application/pdf,application/dicom,text/csv"
          />
          <button
            type="button"
            className={cx(styles, 'nr-upload-zone', isDragActive && 'drag-active')}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!isDragActive) setIsDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const nextTarget = event.relatedTarget as Node | null;
              if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                setIsDragActive(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragActive(false);
              const files = Array.from(event.dataTransfer.files || []);
              if (files.length > 0) onSelectFiles(files);
            }}
          >
            <div className={styles['nr-upload-icon']}><UploadCloud size={24} /></div>
            <h3>{t('newRequest.uploadZoneTitle')}</h3>
            <p>{t('newRequest.uploadZoneHint')}</p>
          </button>
          {selectedFiles.length > 0 && (
            <div className={styles['nr-selected-files']}>
              {selectedFiles.map((file) => {
                const fileKey = `${file.name}-${file.size}`;
                return (
                  <div key={fileKey} className={styles['nr-selected-file']}>
                    <div>
                      <strong>{file.name}</strong>
                      <small>{Math.max(1, Math.round(file.size / 1024))} KB</small>
                    </div>
                    <button type="button" className={styles['nr-file-remove']} onClick={() => onRemoveFile(fileKey)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <aside className={styles['nr-sidebar']}>
        <div className={styles['nr-summary-card']}>
          <div className={styles['nr-summary-title']}>
            <ShieldCheck size={20} />
            {t('newRequest.secureSubmission')}
          </div>
          <p className={styles['nr-summary-desc']}>{t('newRequest.submissionSecure')}</p>

          <div className={styles['nr-urgency-list']}>
            {urgencyLevels.map((level) => (
              <div
                key={level.id}
                className={cx(styles, 'nr-urgency-item', `level-${level.id.toLowerCase()}`, formData.urgency === level.id && 'selected')}
                onClick={() => onInputChange('urgency', level.id)}
              >
                <div className={styles['nr-urgency-dot']} />
                <div className={styles['nr-urgency-content']}>
                  <span className={styles['nr-urgency-label']}>{level.label}</span>
                  <p className={styles['nr-urgency-desc']}>{level.desc}</p>
                </div>
                <span className={styles['nr-urgency-time']}>{level.time}</span>
              </div>
            ))}
          </div>

          <div className={styles['nr-actions']}>
            <button type="submit" className={styles['btn-submit-large']} disabled={isSubmitting || !isFormValid}>
              {isSubmitting
                ? <><Loader2 size={18} className={styles['spin-icon']} /> {t('newRequest.submitting')}</>
                : <><Send size={18} /> {t('newRequest.submitRequest')}</>}
            </button>
            <button type="button" className={styles['btn-draft-outline']} onClick={onSaveDraft} disabled={isSaving || isSubmitting}>
              {isSaving ? t('newRequest.saving') : <><Save size={16} /> {t('newRequest.saveAsDraft')}</>}
            </button>
            <button type="button" className={styles['btn-cancel-flat']} onClick={onCancel}>
              <X size={16} /> {t('newRequest.cancelRequest')}
            </button>
          </div>
        </div>

        <div className={`${styles['nr-card']} ${styles['system-status-card']}`}>
          <div className={styles['nr-group']}>
            <label className={styles['status-label']}>{t('newRequest.systemStatus')}</label>
            <div className={styles['status-row']}>
              <div className={styles['status-dot']} />
              <span className={styles['status-text']}>{t('newRequest.encryptionActive')}</span>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
