'use server';

import { insertStoredNote, listStoredNotes, patchStoredNote, removeStoredNote } from '@/actions/patient-detail-store';

const sampleMessages = [
  {
    id: 'msg_1',
    senderName: 'Dr. มนตรีวิฒน์',
    text: 'Please update vitals every 2 hours.',
    time: '14:35',
    isSelf: false,
    isSystem: false,
  },
];

const sampleTeam = [
  { role: 'Attending Physician' },
  { role: 'Nurse Coordinator' },
];

export async function getCaseNotes(_caseId: string) {
  return listStoredNotes(_caseId);
}

export async function addCaseNote(input: any) {
  return insertStoredNote(input.caseId, input);
}

export async function updateCaseNote(caseId: string, noteId: string, patch: any) {
  return patchStoredNote(caseId, noteId, patch);
}

export async function deleteCaseNote(caseId: string, noteId: string) {
  return removeStoredNote(caseId, noteId);
}

export async function getCaseMessages(_caseId: string) {
  return sampleMessages;
}

export async function getCaseTeam(_caseId: string) {
  return sampleTeam;
}
