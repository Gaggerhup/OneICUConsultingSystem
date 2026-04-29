'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
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
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './style.module.css';
import type { RequestForm, Workflow } from './new-request-helpers';

type TFunction = (key: string) => string;

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
          {language === 'th'
            ? <>ระบบจะค้นจากฐานข้อมูลจริงก่อน และ fallback เป็นตัวอย่างทดสอบเช่น <code>1234567890123</code>, <code>9876543210987</code>, <code>A12345678</code></>
            : <>The system checks the real database first and then falls back to examples such as <code>1234567890123</code>, <code>9876543210987</code>, <code>A12345678</code></>}
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
          <span>{language === 'th' ? 'ข้อมูลผู้ป่วยถูก Auto-fill มาจากฐานข้อมูล — กรุณาตรวจสอบความถูกต้องก่อน Submit' : 'Patient data was auto-filled from the database - please verify it before submitting.'}</span>
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
        <span>CID: <code>{cidInput}</code> — {language === 'th' ? 'กรุณากรอกข้อมูลผู้ป่วยด้วยตนเอง' : 'Please fill in the patient details manually.'}</span>
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
  language,
  t,
  onSubmit,
  onInputChange,
  onSaveDraft,
  onCancel,
}: {
  formData: RequestForm;
  urgencyLevels: readonly UrgencyLevel[];
  isSubmitting: boolean;
  isSaving: boolean;
  language: string;
  t: TFunction;
  onSubmit: (event: FormEvent) => Promise<void>;
  onInputChange: (field: string, value: string) => void;
  onSaveDraft: () => void;
  onCancel: () => void;
}) {
  return (
    <form className={styles['nr-grid']} onSubmit={onSubmit}>
      <div className={styles['nr-form-sections']}>
        <section className={styles['nr-card']}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><User size={18} /></div>
            <h2>{t('newRequest.patientInformation')}</h2>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.cidOrPassport')}</label>
              <input type="text" value={formData.cid} readOnly className={styles['input-readonly']} />
            </div>
            <div className={styles['nr-group']}>
              <label>Hospital Number (HN)</label>
              <input type="text" placeholder="HN-000000" value={formData.hn} onChange={(event) => onInputChange('hn', event.target.value)} />
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>Patient Full Name</label>
              <input type="text" placeholder="ชื่อ-นามสกุล ผู้ป่วย" value={formData.patientName} onChange={(event) => onInputChange('patientName', event.target.value)} />
            </div>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>Age</label>
              <input type="number" placeholder="ปี" value={formData.age} onChange={(event) => onInputChange('age', event.target.value)} />
            </div>
            <div className={styles['nr-group']}>
              <label>Gender</label>
              <select value={formData.gender} onChange={(event) => onInputChange('gender', event.target.value)}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        <section className={styles['nr-card']}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><Activity size={18} /></div>
            <h2>{t('newRequest.clinicalPresentation')}</h2>
          </div>
          <div className={cx(styles, 'nr-group', 'spaced-group')}>
            <label>{t('newRequest.primaryComplaint')}</label>
            <textarea rows={4} placeholder={language === 'th' ? 'รายละเอียดอาการเบื้องต้นและประวัติการเจ็บป่วย...' : 'Brief symptoms and illness history...'} value={formData.complaint} onChange={(event) => onInputChange('complaint', event.target.value)} />
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>BP (mmHg)</label>
              <input type="text" placeholder="120/80" value={formData.vitals.bp} onChange={(event) => onInputChange('vitals.bp', event.target.value)} />
            </div>
            <div className={styles['nr-group']}>
              <label>HR (bpm)</label>
              <input type="text" placeholder="72" value={formData.vitals.hr} onChange={(event) => onInputChange('vitals.hr', event.target.value)} />
            </div>
            <div className={styles['nr-group']}>
              <label>Temp (°C)</label>
              <input type="text" placeholder="36.5" value={formData.vitals.temp} onChange={(event) => onInputChange('vitals.temp', event.target.value)} />
            </div>
          </div>
        </section>

        <section className={styles['nr-card']}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><Hospital size={18} /></div>
            <h2>{t('newRequest.consultationSpecifics')}</h2>
          </div>
          <div className={styles['nr-row']}>
            <div className={styles['nr-group']}>
              <label>{t('newRequest.sourceHospital')}</label>
              <select value={formData.hospital} onChange={(event) => onInputChange('hospital', event.target.value)}>
                <option value="">{language === 'th' ? 'เลือกโรงพยาบาล' : 'Select Hospital'}</option>
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
            </div>
          </div>
        </section>

        <section className={styles['nr-card']}>
          <div className={styles['nr-card-title']}>
            <div className={styles['icon-bg']}><FileText size={18} /></div>
            <h2>{t('newRequest.attachments')}</h2>
          </div>
          <div className={styles['nr-upload-zone']}>
            <div className={styles['nr-upload-icon']}><UploadCloud size={24} /></div>
            <h3>{language === 'th' ? 'คลิกหรือลากไฟล์มาวางที่นี่' : 'Click or drag files here'}</h3>
            <p>{language === 'th' ? 'รองรับไฟล์ Imaging (DICOM), PDF และรายงานทางการแพทย์ (สูงสุด 50MB)' : 'Supports Imaging (DICOM), PDF, and medical reports (max 50MB)'}</p>
          </div>
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
            <button type="submit" className={styles['btn-submit-large']} disabled={isSubmitting}>
              {isSubmitting
                ? <><Loader2 size={18} className={styles['spin-icon']} /> {language === 'th' ? 'กำลังส่ง...' : 'Submitting...'}</>
                : <><Send size={18} /> {t('newRequest.submitRequest')}</>}
            </button>
            <button type="button" className={styles['btn-draft-outline']} onClick={onSaveDraft} disabled={isSaving || isSubmitting}>
              {isSaving ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : <><Save size={16} /> {t('newRequest.saveAsDraft')}</>}
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
