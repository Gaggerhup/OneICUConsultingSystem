'use server';

import { db, eq, asc, desc } from '@/database';
import { notes, CaseNote, messages, CaseMessage, NewCaseMessage, team, CaseTeamMember } from '@/database/schemas/collaboration';
import { revalidatePath } from 'next/cache';

function normalizeCaseId(caseId: string | number | null | undefined) {
  const value = Number(caseId);
  if (!Number.isFinite(value)) throw new Error(`Invalid case id: ${caseId}`);
  return value;
}

// --- Consult Notes ---
export async function getCaseNotes(caseId: string) {
  try {
    const rows = await db.select().from(notes).where(eq(notes.caseId, normalizeCaseId(caseId))).orderBy(desc(notes.recordDate), desc(notes.recordTime), desc(notes.id));
    return rows.map((row) => ({
      ...row,
      authorName: 'Medical Staff',
      authorRole: 'Consultant',
      time: [row.recordDate, row.recordTime].filter(Boolean).join(' ') || 'recently',
    }));
  } catch (error) {
    console.error('[Actions] getCaseNotes failed:', error);
    return [];
  }
}

export async function addCaseNote(data: {
  caseId: string | number;
  authorId?: string | number | null;
  authorColor?: string | null;
  body: string;
}) {
  try {
    const now = new Date();
    const insertData = {
      caseId: normalizeCaseId(data.caseId),
      recordDate: now.toISOString().slice(0, 10),
      recordTime: now.toTimeString().slice(0, 8),
      authorId: Number(data.authorId) || 1,
      authorColor: data.authorColor,
      body: data.body,
    };
    await db.insert(notes).values(insertData);
    const [inserted] = await db.select().from(notes).where(eq(notes.caseId, insertData.caseId)).orderBy(desc(notes.id)).limit(1);
    revalidatePath(`/active-cases/${data.caseId}`);
    return inserted ? {
      ...inserted,
      authorName: 'Medical Staff',
      authorRole: 'Consultant',
      time: [inserted.recordDate, inserted.recordTime].filter(Boolean).join(' ') || 'recently',
    } : null;
  } catch (error) {
    console.error('[Actions] addCaseNote failed:', error);
    throw error;
  }
}

// --- Case Chat Messages ---
export async function getCaseMessages(caseId: string) {
  try {
    const rows = await db.select().from(messages).where(eq(messages.caseId, normalizeCaseId(caseId))).orderBy(asc(messages.recordDate), asc(messages.recordTime), asc(messages.id));
    return rows.map((row) => ({
      ...row,
      time: [row.recordDate, row.recordTime].filter(Boolean).join(' ') || '',
    }));
  } catch (error) {
    console.error('[Actions] getCaseMessages failed:', error);
    return [];
  }
}

export async function sendCaseMessage(data: NewCaseMessage) {
  try {
    const now = new Date();
    const insertData = {
      caseId: normalizeCaseId(data.caseId),
      recordDate: now.toISOString().slice(0, 10),
      recordTime: now.toTimeString().slice(0, 8),
      senderId: data.senderId,
      senderName: data.senderName,
      text: data.text,
      isSelf: data.isSelf,
      isSystem: data.isSystem,
    };
    await db.insert(messages).values(insertData);
    const [inserted] = await db.select().from(messages).where(eq(messages.caseId, insertData.caseId)).orderBy(desc(messages.id)).limit(1);
    revalidatePath(`/active-cases/${data.caseId}`);
    return inserted ? {
      ...inserted,
      time: [inserted.recordDate, inserted.recordTime].filter(Boolean).join(' ') || '',
    } : null;
  } catch (error) {
    console.error('[Actions] sendCaseMessage failed:', error);
    throw error;
  }
}

// --- Team Management ---
export async function getCaseTeam(caseId: string) {
  try {
    return await db.select().from(team).where(eq(team.caseId, normalizeCaseId(caseId))).orderBy(asc(team.assignDate), asc(team.assignTime), asc(team.id));
  } catch (error) {
    console.error('[Actions] getCaseTeam failed:', error);
    return [];
  }
}
