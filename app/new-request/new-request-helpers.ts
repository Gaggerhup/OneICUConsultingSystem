export interface RequestForm {
  patientName: string;
  hn: string;
  an: string;
  cid: string;
  age: string;
  gender: string;
  bloodType: string;
  phone: string;
  dob: string;
  district: string;
  province: string;
  conditions: string;
  allergies: string;
  hospital: string;
  currentSymptoms: string;
  initialDiagnosis: string;
  clinicalNotes: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    rr: string;
    spo2: string;
    gcs: string;
  };
  urgency: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
}

export type Workflow = 'id-entry' | 'loading' | 'review';

interface MockPatient {
  patientName: string;
  hn: string;
  an?: string;
  age: string;
  gender: string;
  bloodType?: string;
  phone?: string;
  dob?: string;
  district?: string;
  province?: string;
  allergies?: string;
  conditions?: string;
}

export const DRAFT_STORAGE_KEY = 'consultation_draft';

export const initialForm: RequestForm = {
  patientName: '',
  hn: '',
  an: '',
  cid: '',
  age: '',
  gender: '',
  bloodType: '',
  phone: '',
  dob: '',
  district: '',
  province: '',
  conditions: '',
  allergies: '',
  hospital: '',
  currentSymptoms: '',
  initialDiagnosis: '',
  clinicalNotes: '',
  vitals: { bp: '', hr: '', temp: '', rr: '', spo2: '', gcs: '' },
  urgency: 'URGENT',
};

export const MOCK_PATIENTS: Record<string, MockPatient> = {
  '1234567890123': { patientName: 'สมชาย ใจดี', hn: 'HN-100001', an: 'AN-24001', age: '52', gender: 'male', bloodType: 'O+', district: 'เมืองพิษณุโลก', province: 'พิษณุโลก', allergies: 'NKDA', conditions: 'Hypertension' },
  '9876543210987': { patientName: 'สมหญิง มีสุข', hn: 'HN-100045', an: 'AN-24045', age: '34', gender: 'female', bloodType: 'A+', district: 'บางกระทุ่ม', province: 'พิษณุโลก', allergies: 'NSAIDs', conditions: 'Asthma' },
  '1109900123456': { patientName: 'วิชัย แสนดี', hn: 'HN-200312', an: 'AN-24312', age: '68', gender: 'male', bloodType: 'B+', district: 'พรหมพิราม', province: 'พิษณุโลก', allergies: 'NKDA', conditions: 'CKD, DM' },
  '3456789012345': { patientName: 'อรอุมา รักดี', hn: 'HN-300087', an: 'AN-24087', age: '29', gender: 'female', bloodType: 'AB+', district: 'วังทอง', province: 'พิษณุโลก', allergies: 'Shrimp: rash', conditions: 'None' },
  A12345678: { patientName: 'สมชาย ศรีสุข (Passport)', hn: 'HN-400001', age: '45', gender: 'male', bloodType: 'O+', district: 'เมืองพิษณุโลก', province: 'พิษณุโลก' },
  B98765432: { patientName: 'มาลี จันทร์เพ็ญ (Passport)', hn: 'HN-400002', age: '38', gender: 'female', bloodType: 'A+', district: 'บางระกำ', province: 'พิษณุโลก' },
};

export function getDraftFromStorage() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DRAFT_STORAGE_KEY);
}

export function saveDraftToStorage(formData: RequestForm) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
}

export function clearDraftFromStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function parseDraft(rawDraft: string): RequestForm | null {
  try {
    return JSON.parse(rawDraft) as RequestForm;
  } catch {
    return null;
  }
}

export function validateIdentifier(
  identifier: string,
  language: string,
) {
  if (!identifier) {
    return language === 'th'
      ? 'กรุณากรอกเลข CID หรือ Passport Number ก่อนค้นหา'
      : 'Please enter a CID or passport number before searching';
  }

  const isValidCID = /^\d{13}$/.test(identifier);
  const isValidPassport = /^[A-Z][0-9]{8}$/.test(identifier);

  if (!isValidCID && !isValidPassport) {
    return language === 'th'
      ? 'รูปแบบไม่ถูกต้อง — CID ต้องเป็นตัวเลข 13 หลัก หรือ Passport (เช่น A12345678)'
      : 'Invalid format - CID must be 13 digits or a passport number such as A12345678';
  }

  return '';
}

export function buildFormFromPatientLookup(
  patient: {
    patientName: string;
    hn: string;
    an?: string | null;
    age?: number | string | null;
    gender?: string | null;
    cid?: string | null;
    bloodType?: string | null;
    phone?: string | null;
    dob?: string | null;
    district?: string | null;
    province?: string | null;
    allergies?: string[] | string | null;
    conditions?: string[] | string | null;
  },
  fallbackIdentifier: string,
) {
  return {
    ...initialForm,
    patientName: patient.patientName,
    hn: patient.hn,
    an: patient.an || '',
    cid: patient.cid || fallbackIdentifier,
    age: patient.age?.toString() || '',
    gender: patient.gender || '',
    bloodType: patient.bloodType || '',
    phone: patient.phone || '',
    dob: patient.dob || '',
    district: patient.district || '',
    province: patient.province || '',
    allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies || '',
    conditions: Array.isArray(patient.conditions) ? patient.conditions.join(', ') : patient.conditions || '',
  };
}

export function updateRequestForm(
  previous: RequestForm,
  field: string,
  value: string,
): RequestForm {
  if (!field.includes('.')) {
    return { ...previous, [field]: value };
  }

  const [parent, child] = field.split('.');
  return {
    ...previous,
    [parent]: {
      ...(previous[parent as keyof RequestForm] as Record<string, string>),
      [child]: value,
    },
  };
}

export function hasMeaningfulDraft(formData: RequestForm) {
  return JSON.stringify(formData) !== JSON.stringify(initialForm);
}

export function validateRequestForm(formData: RequestForm) {
  const errors: Record<string, string> = {};

  if (!formData.cid.trim()) errors.cid = 'CID or passport is required';
  if (!formData.hn.trim()) errors.hn = 'HN is required';
  if (!formData.patientName.trim()) errors.patientName = 'Patient name is required';

  if (!formData.age.trim()) {
    errors.age = 'Age is required';
  } else {
    const age = Number(formData.age);
    if (!Number.isFinite(age) || age < 0 || age > 130) errors.age = 'Age must be between 0 and 130';
  }

  if (!formData.gender.trim()) errors.gender = 'Gender is required';
  if (!formData.hospital.trim()) errors.hospital = 'Source hospital is required';
  if (!formData.currentSymptoms.trim()) errors.currentSymptoms = 'Current symptoms are required';
  if (!formData.initialDiagnosis.trim()) errors.initialDiagnosis = 'Initial diagnosis is required';

  if (formData.vitals.bp.trim() && !/^\d{2,3}\/\d{2,3}$/.test(formData.vitals.bp.trim())) {
    errors['vitals.bp'] = 'Use format 120/80';
  }

  const numericRanges = [
    ['vitals.hr', formData.vitals.hr, 1, 300, 'HR must be between 1 and 300'],
    ['vitals.temp', formData.vitals.temp, 25, 45, 'Temp must be between 25 and 45'],
    ['vitals.rr', formData.vitals.rr, 1, 80, 'RR must be between 1 and 80'],
    ['vitals.spo2', formData.vitals.spo2, 0, 100, 'SpO₂ must be between 0 and 100'],
  ] as const;

  for (const [key, raw, min, max, message] of numericRanges) {
    if (!raw.trim()) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max) errors[key] = message;
  }

  if (formData.vitals.gcs.trim() && !/^\d{1,2}(\/\d{1,2})?$/.test(formData.vitals.gcs.trim())) {
    errors['vitals.gcs'] = 'Use format 15 or 15/15';
  }

  if (formData.dob.trim() && Number.isNaN(new Date(formData.dob).getTime())) {
    errors.dob = 'DOB is invalid';
  }

  return errors;
}
