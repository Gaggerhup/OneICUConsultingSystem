export interface RequestForm {
  patientName: string;
  hn: string;
  cid: string;
  age: string;
  gender: string;
  hospital: string;
  complaint: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    rr: string;
  };
  urgency: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
}

export type Workflow = 'id-entry' | 'loading' | 'review';

interface MockPatient {
  patientName: string;
  hn: string;
  age: string;
  gender: string;
}

export const DRAFT_STORAGE_KEY = 'consultation_draft';

export const initialForm: RequestForm = {
  patientName: '',
  hn: '',
  cid: '',
  age: '',
  gender: '',
  hospital: '',
  complaint: '',
  vitals: { bp: '', hr: '', temp: '', rr: '' },
  urgency: 'URGENT',
};

export const MOCK_PATIENTS: Record<string, MockPatient> = {
  '1234567890123': { patientName: 'สมชาย ใจดี', hn: 'HN-100001', age: '52', gender: 'male' },
  '9876543210987': { patientName: 'สมหญิง มีสุข', hn: 'HN-100045', age: '34', gender: 'female' },
  '1109900123456': { patientName: 'วิชัย แสนดี', hn: 'HN-200312', age: '68', gender: 'male' },
  '3456789012345': { patientName: 'อรอุมา รักดี', hn: 'HN-300087', age: '29', gender: 'female' },
  A12345678: { patientName: 'สมชาย ศรีสุข (Passport)', hn: 'HN-400001', age: '45', gender: 'male' },
  B98765432: { patientName: 'มาลี จันทร์เพ็ญ (Passport)', hn: 'HN-400002', age: '38', gender: 'female' },
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
    age?: number | string | null;
    gender?: string | null;
    cid?: string | null;
  },
  fallbackIdentifier: string,
) {
  return {
    ...initialForm,
    patientName: patient.patientName,
    hn: patient.hn,
    cid: patient.cid || fallbackIdentifier,
    age: patient.age?.toString() || '',
    gender: patient.gender || '',
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
