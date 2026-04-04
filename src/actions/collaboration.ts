'use server';

import { db, eq, asc, desc } from '@/database';
import { notes, CaseNote, NewCaseNote, messages, CaseMessage, NewCaseMessage, team, CaseTeamMember } from '@/database/schemas/collaboration';
import { revalidatePath } from 'next/cache';

// --- Consult Notes ---
export async function getCaseNotes(caseId: string) {
  try {
    return await db.select().from(notes).where(eq(notes.caseId, caseId)).orderBy(desc(notes.createdAt));
  } catch (error) {
    console.error('[Actions] getCaseNotes failed:', error);
    return [];
  }
}

export async function addCaseNote(data: NewCaseNote) {
  try {
    await db.insert(notes).values(data);
    const [inserted] = await db.select().from(notes).where(eq(notes.id, data.id!)).limit(1);
    revalidatePath(`/active-cases/${data.caseId}`);
    return inserted;
  } catch (error) {
    console.error('[Actions] addCaseNote failed:', error);
    throw error;
  }
}

// --- Case Chat Messages ---
export async function getCaseMessages(caseId: string) {
  try {
    return await db.select().from(messages).where(eq(messages.caseId, caseId)).orderBy(asc(messages.createdAt));
  } catch (error) {
    console.error('[Actions] getCaseMessages failed:', error);
    return [];
  }
}

export async function sendCaseMessage(data: NewCaseMessage) {
  try {
    await db.insert(messages).values(data);
    const [inserted] = await db.select().from(messages).where(eq(messages.id, data.id!)).limit(1);
    revalidatePath(`/active-cases/${data.caseId}`);
    return inserted;
  } catch (error) {
    console.error('[Actions] sendCaseMessage failed:', error);
    throw error;
  }
}

// --- Team Management ---
export async function getCaseTeam(caseId: string) {
  try {
    return await db.select().from(team).where(eq(team.caseId, caseId)).orderBy(asc(team.createdAt));
  } catch (error) {
    console.error('[Actions] getCaseTeam failed:', error);
    return [];
  }
}
