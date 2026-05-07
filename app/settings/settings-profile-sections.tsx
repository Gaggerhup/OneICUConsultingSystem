'use client';

import Image from 'next/image';
import { Camera, ChevronDown, Save, ShieldCheck, X } from 'lucide-react';
import { SPECIALTY_OPTIONS } from '@/constants/specialties';
import styles from './style.module.css';

type TFunction = (key: string) => string;

type ProfileFormState = {
  title: string;
  firstName: string;
  lastName: string;
  license: string;
  specialty: string;
  hospital: string;
  email: string;
  phoneNumber: string;
  summary: string;
};

export function ProfilePhotoCard({
  avatarUrl,
  userInitials,
  fileInputRef,
  handlePhotoUpload,
  setAvatarUrl,
  t,
}: {
  avatarUrl: string | null;
  userInitials: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string | null>>;
  t: TFunction;
}) {
  return (
    <div className={styles['settings-card']}>
      <div className={styles['photo-section']}>
        <div className={styles['photo-avatar-wrap']}>
          <div
            className={avatarUrl ? `${styles['photo-avatar']} ${styles['photo-avatar-has-image']}` : styles['photo-avatar']}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {!avatarUrl && userInitials}
          </div>
          <button className={styles['photo-camera-btn']} onClick={() => fileInputRef.current?.click()}>
            <Camera size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className={styles['hidden-input']}
            accept="image/*"
          />
        </div>
        <div className={styles['photo-info']}>
          <div className={styles['photo-title-row']}>
            <span className={styles['photo-label']}>{t('settings.profilePhoto')}</span>
            <span className={styles['verified-badge']}>
              <ShieldCheck size={13} /> {t('settings.verifiedStaff')}
            </span>
          </div>
          <div className={styles['photo-actions']}>
            <button className={styles['btn-primary-sm']} onClick={() => fileInputRef.current?.click()}>{t('settings.uploadPhoto')}</button>
            <button className={styles['btn-outline-sm']} onClick={() => setAvatarUrl(null)}>{t('settings.removePhoto')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileIdentityFields({
  form,
  t,
}: {
  form: ProfileFormState;
  t: TFunction;
}) {
  return (
    <>
      <div className={styles['form-row-2']}>
        <div className={styles['form-group']}>
          <label>{t('settings.titleLabel')}</label>
          <div className={`${styles['select-wrap']} ${styles['small']} ${styles['locked-select-wrap']}`}>
            <select value={form.title} disabled>
              <option value="Dr.">Dr.</option>
              <option value="RN">RN</option>
            </select>
            <ChevronDown size={14} className={styles['select-chevron']} />
            <span className={styles['locked-badge']}>{t('settings.lockedFromProvider')}</span>
          </div>
        </div>
        <div className={styles['form-group']}>
          <label>{t('settings.license')}</label>
          <input type="text" value={form.license} disabled />
        </div>
      </div>

      <div className={styles['form-row-2']}>
        <div className={styles['form-group']}>
          <label>{t('settings.firstNameLabel')}</label>
          <input type="text" value={form.firstName} disabled />
        </div>
        <div className={styles['form-group']}>
          <label>{t('settings.lastNameLabel')}</label>
          <input type="text" value={form.lastName} disabled />
        </div>
      </div>

      <div className={styles['form-group']}>
        <label>{t('settings.hospital')}</label>
        <input type="text" value={form.hospital} disabled />
        <span className={styles['locked-badge']}>{t('settings.lockedFromProvider')}</span>
      </div>
    </>
  );
}

export function ProfileEditableFields({
  form,
  setForm,
  t,
}: {
  form: ProfileFormState;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  t: TFunction;
}) {
  return (
    <>
      <div className={styles['form-group']}>
        <label>{t('settings.specialty')}</label>
        <div className={styles['combobox-wrap']}>
          <input
            type="text"
            list="specialty-options"
            value={form.specialty}
            onChange={(event) => setForm((current) => ({ ...current, specialty: event.target.value }))}
            placeholder={t('settings.specialtyPlaceholder')}
            autoComplete="off"
          />
          <ChevronDown size={14} className={styles['select-chevron']} />
        </div>
        <datalist id="specialty-options">
          {SPECIALTY_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <p className={styles['form-hint']}>{t('settings.specialtyHint')}</p>
      </div>

      <div className={styles['form-group']}>
        <label>{t('settings.email')}</label>
        <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
      </div>

      <div className={styles['form-group']}>
        <label>{t('settings.phone')}</label>
        <div className={styles['phone-input-wrap']}>
          <span className={styles['phone-prefix']}>+66</span>
          <input
            type="tel"
            value={form.phoneNumber ? form.phoneNumber.replace('+66', '') : ''}
            onChange={(event) => {
              const val = event.target.value.replace(/[^0-9]/g, '');
              setForm((current) => ({ ...current, phoneNumber: `+66${val}` }));
            }}
            placeholder="812345678"
            maxLength={10}
          />
        </div>
      </div>

      <div className={styles['form-group']}>
        <label>{t('settings.summary')}</label>
        <textarea rows={4} value={form.summary} maxLength={500} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
        <p className={styles['form-hint']}>{t('settings.summaryHint')}</p>
      </div>
    </>
  );
}

export function ProfileActions({
  onCancel,
  onSave,
  t,
}: {
  onCancel: () => void;
  onSave: () => void;
  t: TFunction;
}) {
  return (
    <div className={styles['settings-footer']}>
      <button className={styles['btn-ghost']} onClick={onCancel}><X size={15} /> {t('settings.cancel')}</button>
      <button className={styles['btn-primary-lg']} onClick={onSave}><Save size={15} /> {t('settings.saveProfile')}</button>
    </div>
  );
}

export function SettingsSidebarAvatar({
  avatarUrl,
  userInitials,
}: {
  avatarUrl?: string | null;
  userInitials: string;
}) {
  return (
    <div className={styles['settings-user-avatar']}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          fill
          unoptimized
          sizes="40px"
          className={styles['sidebar-avatar-img']}
        />
      ) : userInitials}
    </div>
  );
}
