'use server';

import { db, eq, desc, or } from '@/database';
import { cases } from '@/database/schemas/cases';
import { patients } from '@/database/schemas/patients';
import { caseFiles } from '@/database/schemas/case_files';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Patient } from '@/database/schemas/patients';
import type { CaseFile } from '@/database/schemas/case_files';

export async function getPatientById(id: string) {
  try {
    const [result] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    return result || null;
  } catch (error) {
    console.error('[Actions] getPatientById failed:', error);
    return null;
  }
}

export async function getPatientByCid(cid: string) {
  try {
    const [result] = await db.select().from(patients).where(eq(patients.cid, cid)).limit(1);
    return result || null;
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
      .where(or(eq(patients.cid, identifier), eq(patients.passportNo, identifier)))
      .limit(1);
    return result || null;
  } catch (error) {
    console.error('[Actions] getPatientByIdentifier failed:', error);
    return null;
  }
}

export async function getPatientByCaseId(caseId: string) {
  try {
    const [foundCase] = await db
      .select({ cid: cases.cid })
      .from(cases)
      .where(eq(cases.id, caseId))
      .limit(1);

    if (!foundCase) return null;

    if (foundCase.cid) {
      return await getPatientByCid(foundCase.cid);
    }

    return null;
  } catch (error) {
    console.error('[Actions] getPatientByCaseId failed:', error);
    return null;
  }
}

export async function getCaseFiles(caseId: string) {
  try {
    return await db.select().from(caseFiles).where(eq(caseFiles.caseId, caseId)).orderBy(desc(caseFiles.createdAt));
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
      id: `file_${randomUUID()}`,
      caseId,
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

    return inserted || null;
  } catch (error) {
    console.error('[Actions] uploadCaseFile failed:', error);
    return null;
  }
}

export type { Patient, CaseFile };
