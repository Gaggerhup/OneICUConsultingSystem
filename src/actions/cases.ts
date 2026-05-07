'use server';

import { createRequestAgainFromStoredCase, listCasesWithOverrides, getCaseWithOverrides, patchCase, upsertStoredCase } from '@/actions/patient-detail-store';

export async function getCases() {
  return listCasesWithOverrides();
}

export async function getCaseById(caseId: string) {
  return getCaseWithOverrides(caseId);
}

export async function updateCaseDetail(caseId: string, patch: Record<string, unknown>) {
  return patchCase(caseId, patch);
}

export async function createRequestAgainFromCase(caseId: string) {
  return createRequestAgainFromStoredCase(caseId);
}

export async function createCase(input: {
  patientName: string;
  hospital?: string | null;
  priority: string;
  specialty?: string | null;
  reason?: string | null;
  senderId?: string | null;
  hn?: string | null;
  an?: string | null;
  cid?: string | null;
  age?: number | null;
  phone?: string | null;
  dob?: string | null;
  district?: string | null;
  province?: string | null;
  bloodType?: string | null;
  gender?: string | null;
  allergies?: string[] | null;
  conditions?: string[] | null;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  currentSymptoms?: string | null;
  initialDiagnosis?: string | null;
  clinicalNotes?: string | null;
}) {
  return upsertStoredCase(input);
}
