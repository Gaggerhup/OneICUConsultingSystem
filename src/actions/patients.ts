'use server';

import { db, eq, desc, or } from '@/database';
import { cases } from '@/database/schemas/cases';
import { patientAllergies, patientConditions, patients } from '@/database/schemas/patients';
import { caseFiles } from '@/database/schemas/case_files';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { CaseFile } from '@/database/schemas/case_files';

export type Patient = typeof patients.$inferSelect & {
  cid: string;
  patientName: string;
  age: number | null;
  allergies: string[];
  conditions: string[];
};

function normalizeNumericId(id: string | number) {
  const value = Number(id);
  if (!Number.isFinite(value)) throw new Error(`Invalid numeric id: ${id}`);
  return value;
}

function buildPatientName(patient: typeof patients.$inferSelect) {
  return `${patient.preName || ''}${patient.firstName} ${patient.lastName}`.trim();
}

function calculateAge(birthDate: string | null) {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDelta = today.getMonth() - born.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
}

async function hydratePatient(patient: typeof patients.$inferSelect | null): Promise<Patient | null> {
  if (!patient) return null;
  const [allergies, conditions] = await Promise.all([
    db.select({ name: patientAllergies.allergyName }).from(patientAllergies).where(eq(patientAllergies.patientId, patient.id)).orderBy(patientAllergies.itemOrder),
    db.select({ name: patientConditions.conditionName }).from(patientConditions).where(eq(patientConditions.patientId, patient.id)).orderBy(patientConditions.itemOrder),
  ]);
  return {
    ...patient,
    cid: patient.pid,
    patientName: buildPatientName(patient),
    age: calculateAge(patient.birthDate),
    allergies: allergies.map((item) => item.name),
    conditions: conditions.map((item) => item.name),
  };
}

function toAppCaseFile(file: typeof caseFiles.$inferSelect) {
  return {
    ...file,
    id: String(file.id),
    caseId: file.caseId == null ? null : String(file.caseId),
    createdAt: [file.fileDate, file.fileTime].filter(Boolean).join(' ') || undefined,
  };
}

export async function getPatientById(id: string) {
  try {
    const [result] = await db.select().from(patients).where(eq(patients.id, normalizeNumericId(id))).limit(1);
    return await hydratePatient(result || null);
  } catch (error) {
    console.error('[Actions] getPatientById failed:', error);
    return null;
  }
}

export async function getPatientByCid(cid: string) {
  try {
    const [result] = await db.select().from(patients).where(eq(patients.pid, cid)).limit(1);
    return await hydratePatient(result || null);
  } catch (error) {
    console.error('[Actions] getPatientByCid failed:', error);
    return null;
  }
}

export async function getPatientByIdentifier(identifier: string) {
  try {
    const [result] = await db
      .select()
      .from(patients)
      .where(or(eq(patients.pid, identifier), eq(patients.hn, identifier), eq(patients.an, identifier)))
      .limit(1);
    return await hydratePatient(result || null);
  } catch (error) {
    console.error('[Actions] getPatientByIdentifier failed:', error);
    return null;
  }
}

export async function getPatientByCaseId(caseId: string) {
  try {
    const [foundCase] = await db
      .select({ patientId: cases.patientId })
      .from(cases)
      .where(eq(cases.id, normalizeNumericId(caseId)))
      .limit(1);

    if (!foundCase) return null;

    return await getPatientById(String(foundCase.patientId));
  } catch (error) {
    console.error('[Actions] getPatientByCaseId failed:', error);
    return null;
  }
}

export async function getCaseFiles(caseId: string) {
  try {
    const rows = await db.select().from(caseFiles).where(eq(caseFiles.caseId, normalizeNumericId(caseId))).orderBy(desc(caseFiles.fileDate), desc(caseFiles.fileTime), desc(caseFiles.id));
    return rows.map(toAppCaseFile);
  } catch (error) {
    console.error('[Actions] getCaseFiles failed:', error);
    return [];
  }
}

type FileCategory = 'imaging' | 'lab' | 'report' | 'medication' | 'note' | 'other';

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^\w.\-ก-๙]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'upload';
}

function inferFileType(fileName: string, mimeType: string): 'image' | 'document' | 'dicom' | 'csv' | 'other' {
  const lowered = fileName.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.includes('dicom') || lowered.endsWith('.dcm')) return 'dicom';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'text/csv' || lowered.endsWith('.csv')) return 'csv';
  if (
    mime.includes('pdf') ||
    mime.includes('msword') ||
    mime.includes('officedocument') ||
    mime.startsWith('text/') ||
    lowered.endsWith('.pdf') ||
    lowered.endsWith('.doc') ||
    lowered.endsWith('.docx') ||
    lowered.endsWith('.txt') ||
    lowered.endsWith('.rtf')
  ) {
    return 'document';
  }

  return 'other';
}

function inferPreviewable(fileType: string, mimeType: string) {
  return fileType === 'image' || mimeType.startsWith('image/') || mimeType.includes('pdf');
}

export async function uploadCaseFile(params: {
  caseId: string;
  file: File;
  uploadedById?: string | null;
  category?: FileCategory;
  description?: string;
}) {
  try {
    const { caseId, file, uploadedById = null, category = 'other', description } = params;
    const safeName = sanitizeFileName(file.name);
    const fileType = inferFileType(file.name, file.type || '');
    const previewable = inferPreviewable(fileType, file.type || '');
    const storedName = `${randomUUID()}_${safeName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'case-files', caseId);
    const storedPath = path.join(uploadDir, storedName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(storedPath, Buffer.from(await file.arrayBuffer()));

    await db.insert(caseFiles).values({
      caseId: normalizeNumericId(caseId),
      fileDate: new Date().toISOString().slice(0, 10),
      fileTime: new Date().toTimeString().slice(0, 8),
      uploadedById,
      fileName: file.name,
      fileType,
      category,
      mimeType: file.type || null,
      fileUrl: `/uploads/case-files/${caseId}/${storedName}`,
      sizeKb: Math.max(1, Math.ceil(file.size / 1024)),
      description: description?.trim() || null,
      isPreviewable: previewable,
    });

    const [inserted] = await db
      .select()
      .from(caseFiles)
      .where(eq(caseFiles.fileUrl, `/uploads/case-files/${caseId}/${storedName}`))
      .limit(1);

    return inserted ? toAppCaseFile(inserted) : null;
  } catch (error) {
    console.error('[Actions] uploadCaseFile failed:', error);
    return null;
  }
}

export type { Patient, CaseFile };
