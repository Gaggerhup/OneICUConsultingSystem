'use server';

import { db, eq, and, or, inArray, desc } from '@/database';
import { cases, Case, NewCase } from '@/database/schemas/cases';
import { revalidatePath } from 'next/cache';

export async function getCases() {
  try {
    const allCases = await db.select().from(cases).orderBy(desc(cases.createdAt));
    return allCases;
  } catch (error) {
    console.error('[Actions] getCases failed:', error);
    return [];
  }
}

export async function addCase(data: NewCase) {
  try {
    await db.insert(cases).values(data);
    const [inserted] = await db.select().from(cases).where(eq(cases.id, data.id)).limit(1);
    revalidatePath('/');
    return inserted;
  } catch (error) {
    console.error('[Actions] addCase failed:', error);
    throw error;
  }
}

export async function updateCaseStatus(id: string, status: Case['status'], extraData?: Partial<Case>) {
  try {
    await db
      .update(cases)
      .set({ status, ...extraData, updatedAt: new Date() })
      .where(eq(cases.id, id));
    const [updated] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    revalidatePath('/');
    return updated;
  } catch (error) {
    console.error('[Actions] updateCaseStatus failed:', error);
    throw error;
  }
}
export async function getCaseById(id: string) {
  try {
    const [found] = await db.select().from(cases).where(eq(cases.id, id));
    return found || null;
  } catch (error) {
    console.error('[Actions] getCaseById failed:', error);
    return null;
  }
}

export async function getCaseByCid(cid: string) {
  try {
    const [found] = await db.select().from(cases).where(eq(cases.cid, cid));
    return found || null;
  } catch (error) {
    console.error('[Actions] getCaseByCid failed:', error);
    return null;
  }
}
