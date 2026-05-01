'use server';

import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { MOCK_PATIENTS } from '../../app/new-request/new-request-helpers';
import {
  getStoredPatient,
  insertStoredFile,
  listStoredFiles,
  patchStoredFile,
  patchStoredPatient,
  removeStoredFile,
} from '@/actions/patient-detail-store';

type UploadedFile = {
  caseId: string;
  file: File;
  uploadedById: string | null;
  category: string;
  description: string;
};

const LOCAL_UPLOAD_PREFIX = '/uploads/case-files/';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
}

function deriveFileType(file: File) {
  const mime = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('image/')) return 'image';
  if (mime.includes('dicom') || extension === 'dcm' || extension === 'dicom') return 'dicom';
  if (mime.includes('csv') || extension === 'csv') return 'csv';
  if (mime.includes('pdf') || extension === 'pdf') return 'pdf';
  if (mime.includes('word') || extension === 'doc' || extension === 'docx') return 'document';
  if (mime.startsWith('text/') || ['txt', 'md', 'rtf'].includes(extension)) return 'text';

  return extension || 'file';
}

function isPreviewableFile(file: File) {
  const mime = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  return (
    mime.startsWith('image/')
    || mime.includes('pdf')
    || mime.includes('csv')
    || mime.startsWith('text/')
    || ['pdf', 'csv', 'txt', 'md'].includes(extension)
  );
}

export async function getPatientByIdentifier(identifier: string) {
  const patient = MOCK_PATIENTS[identifier as keyof typeof MOCK_PATIENTS];
  if (!patient) return null;

  return {
    ...patient,
    cid: identifier,
  };
}

export async function getPatientByCaseId(_caseId: string) {
  return getStoredPatient(_caseId);
}

export async function getCaseFiles(_caseId: string) {
  return listStoredFiles(_caseId);
}

export async function uploadCaseFile(input: UploadedFile) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'case-files');
  await mkdir(uploadDir, { recursive: true });

  const extension = input.file.name.includes('.') ? `.${input.file.name.split('.').pop()}` : '';
  const safeBaseName = sanitizeFileName(input.file.name.replace(/\.[^.]+$/, '')) || 'file';
  const storedFileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
  const filePath = path.join(uploadDir, storedFileName);

  const bytes = Buffer.from(await input.file.arrayBuffer());
  await writeFile(filePath, bytes);

  return insertStoredFile(input.caseId, {
    fileName: input.file.name,
    fileType: deriveFileType(input.file),
    category: input.category || 'other',
    mimeType: input.file.type || null,
    fileUrl: `${LOCAL_UPLOAD_PREFIX}${storedFileName}`,
    sizeKb: Math.max(1, Math.round(input.file.size / 1024)),
    description: input.description,
    isPreviewable: isPreviewableFile(input.file),
  });
}

export async function updatePatientByCaseId(caseId: string, patch: Record<string, unknown>) {
  return patchStoredPatient(caseId, patch as any);
}

export async function updateCaseFile(caseId: string, fileId: string, patch: Record<string, unknown>) {
  return patchStoredFile(caseId, fileId, patch as any);
}

export async function deleteCaseFile(caseId: string, fileId: string) {
  const files = await listStoredFiles(caseId);
  const targetFile = files.find((item) => item.id === fileId);

  if (targetFile?.fileUrl?.startsWith(LOCAL_UPLOAD_PREFIX)) {
    const localPath = path.join(process.cwd(), 'public', targetFile.fileUrl.replace(/^\//, ''));
    await unlink(localPath).catch(() => undefined);
  }

  return removeStoredFile(caseId, fileId);
}
