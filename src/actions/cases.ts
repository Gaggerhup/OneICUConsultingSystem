'use server';

import { db, eq, desc, sql, type SQL } from '@/database';
import { cases, NewCase } from '@/database/schemas/cases';
import { patients, patientAllergies, patientConditions } from '@/database/schemas/patients';
import { revalidatePath } from 'next/cache';

export type Case = {
  id: string;
  patientName: string;
  hospital: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Active' | 'Critical' | 'Archived' | 'Discharge' | 'Referred' | 'Dead';
  priority: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
  age: number | null;
  gender: string | null;
  specialty: string | null;
  reason: string | null;
  hn: string | null;
  an: string | null;
  cid: string | null;
  bloodType: string | null;
  allergies: string[] | null;
  conditions: string[] | null;
  currentSymptoms: string | null;
  initialDiagnosis: string | null;
  clinicalNotes: string | null;
  senderId: string | null;
  date: string | null;
  closeDate: string | null;
  closedTimestamp: Date | null;
  lastAction: string | null;
  lastActiveTime: string | null;
};

function normalizeCaseId(id: string | number) {
  const value = Number(id);
  if (!Number.isFinite(value)) throw new Error(`Invalid case id: ${id}`);
  return value;
}

function formatDateTime(date?: string | null, time?: string | null) {
  return [date, time].filter(Boolean).join(' ') || null;
}

async function getPatientLists(patientId: number) {
  const [allergies, conditions] = await Promise.all([
    db.select({ name: patientAllergies.allergyName }).from(patientAllergies).where(eq(patientAllergies.patientId, patientId)).orderBy(patientAllergies.itemOrder),
    db.select({ name: patientConditions.conditionName }).from(patientConditions).where(eq(patientConditions.patientId, patientId)).orderBy(patientConditions.itemOrder),
  ]);
  return {
    allergies: allergies.map((item) => item.name),
    conditions: conditions.map((item) => item.name),
  };
}

async function toLegacyCase(row: {
  caseRow: typeof cases.$inferSelect;
  patientRow: typeof patients.$inferSelect | null;
  hospitalName: string | null;
  age: number | null;
}): Promise<Case> {
  const { caseRow, patientRow, hospitalName, age } = row;
  const lists = patientRow ? await getPatientLists(patientRow.id) : { allergies: [], conditions: [] };
  const patientName = patientRow
    ? `${patientRow.preName || ''}${patientRow.firstName} ${patientRow.lastName}`.trim()
    : 'Unknown Patient';

  return {
    id: String(caseRow.id),
    patientName,
    hospital: hospitalName || patientRow?.hoscode || 'Unknown Hospital',
    status: caseRow.status as Case['status'],
    priority: caseRow.priority as Case['priority'],
    age,
    gender: patientRow?.gender || null,
    specialty: caseRow.specialty,
    reason: caseRow.reason,
    hn: patientRow?.hn || null,
    an: patientRow?.an || null,
    cid: patientRow?.pid || null,
    bloodType: patientRow?.bloodType || null,
    allergies: lists.allergies,
    conditions: lists.conditions,
    currentSymptoms: caseRow.currentSymptoms,
    initialDiagnosis: caseRow.initialDiagnosis,
    clinicalNotes: caseRow.clinicalNotes,
    senderId: caseRow.senderId,
    date: formatDateTime(caseRow.recordDate, caseRow.recordTime),
    closeDate: null,
    closedTimestamp: null,
    lastAction: caseRow.lastAction,
    lastActiveTime: caseRow.lastActiveTime,
  };
}

async function selectCaseRows(where?: SQL) {
  const query = db
    .select({
      caseRow: cases,
      patientRow: patients,
      hospitalName: sql<string | null>`(select h.hosname from hospital h where h.hoscode = ${patients.hoscode} limit 1)`,
      age: sql<number | null>`timestampdiff(year, ${patients.birthDate}, curdate())`,
    })
    .from(cases)
    .leftJoin(patients, eq(cases.patientId, patients.id));

  const filtered = where ? query.where(where) : query;
  return await filtered.orderBy(desc(cases.recordDate), desc(cases.recordTime), desc(cases.id));
}

export async function getCases() {
  try {
    const rows = await selectCaseRows();
    return await Promise.all(rows.map(toLegacyCase));
  } catch (error) {
    console.error('[Actions] getCases failed:', error);
    return [];
  }
}

export async function addCase(data: NewCase) {
  try {
    await db.insert(cases).values(data);
    const [inserted] = await selectCaseRows(eq(cases.id, Number(data.id)));
    revalidatePath('/');
    return inserted ? await toLegacyCase(inserted) : null;
  } catch (error) {
    console.error('[Actions] addCase failed:', error);
    throw error;
  }
}

export async function updateCaseStatus(id: string, status: Case['status'], extraData?: Partial<Case>) {
  try {
    const updateData: Partial<typeof cases.$inferInsert> = {
      status,
      lastAction: extraData?.lastAction,
      lastActiveTime: extraData?.lastActiveTime,
    };
    await db
      .update(cases)
      .set(updateData)
      .where(eq(cases.id, normalizeCaseId(id)));
    const [updated] = await selectCaseRows(eq(cases.id, normalizeCaseId(id)));
    revalidatePath('/');
    return updated ? await toLegacyCase(updated) : null;
  } catch (error) {
    console.error('[Actions] updateCaseStatus failed:', error);
    throw error;
  }
}
export async function getCaseById(id: string) {
  try {
    const [found] = await selectCaseRows(eq(cases.id, normalizeCaseId(id)));
    return found ? await toLegacyCase(found) : null;
  } catch (error) {
    console.error('[Actions] getCaseById failed:', error);
    return null;
  }
}

export async function getCaseByCid(cid: string) {
  try {
    const rows = await db
      .select({
        caseRow: cases,
        patientRow: patients,
        hospitalName: sql<string | null>`(select h.hosname from hospital h where h.hoscode = ${patients.hoscode} limit 1)`,
        age: sql<number | null>`timestampdiff(year, ${patients.birthDate}, curdate())`,
      })
      .from(cases)
      .leftJoin(patients, eq(cases.patientId, patients.id))
      .where(eq(patients.pid, cid))
      .limit(1);
    return rows[0] ? await toLegacyCase(rows[0]) : null;
  } catch (error) {
    console.error('[Actions] getCaseByCid failed:', error);
    return null;
  }
}
