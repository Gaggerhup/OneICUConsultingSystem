'use server';

import {
  insertStoredLab,
  insertStoredMedication,
  insertStoredVital,
  listStoredLabs,
  listStoredMedications,
  listStoredVitals,
  patchStoredLab,
  patchStoredMedication,
  patchStoredVital,
  removeStoredLab,
  removeStoredMedication,
  removeStoredVital,
} from '@/actions/patient-detail-store';

export async function getVitals(caseId: string) {
  return listStoredVitals(caseId);
}

export async function addVital(caseId: string, input: Record<string, unknown>) {
  return insertStoredVital(caseId, input as any);
}

export async function updateVital(caseId: string, vitalId: string, patch: Record<string, unknown>) {
  return patchStoredVital(caseId, vitalId, patch as any);
}

export async function deleteVital(caseId: string, vitalId: string) {
  return removeStoredVital(caseId, vitalId);
}

export async function getLabs(caseId: string) {
  return listStoredLabs(caseId);
}

export async function addLab(caseId: string, input: Record<string, unknown>) {
  return insertStoredLab(caseId, input as any);
}

export async function updateLab(caseId: string, labId: string, patch: Record<string, unknown>) {
  return patchStoredLab(caseId, labId, patch as any);
}

export async function deleteLab(caseId: string, labId: string) {
  return removeStoredLab(caseId, labId);
}

export async function getMedications(caseId: string) {
  return listStoredMedications(caseId);
}

export async function addMedication(caseId: string, input: Record<string, unknown>) {
  return insertStoredMedication(caseId, input as any);
}

export async function updateMedication(caseId: string, medicationId: string, patch: Record<string, unknown>) {
  return patchStoredMedication(caseId, medicationId, patch as any);
}

export async function deleteMedication(caseId: string, medicationId: string) {
  return removeStoredMedication(caseId, medicationId);
}
