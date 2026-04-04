'use server';

import { db, eq, desc } from '@/database';
import { vitals, VitalSign, NewVitalSign } from '@/database/schemas/vitals';
import { labs, LabRow, NewLabRow, medications, MedRow, NewMedRow } from '@/database/schemas/clinical_data';
import { revalidatePath } from 'next/cache';

// --- Vital Signs ---
export async function getVitals(caseId: string) {
  try {
    return await db.select().from(vitals).where(eq(vitals.caseId, caseId)).orderBy(desc(vitals.createdAt));
  } catch (error) {
    console.error('[Actions] getVitals failed:', error);
    return [];
  }
}

export async function addVitalSign(data: NewVitalSign) {
  try {
    await db.insert(vitals).values(data);
    const [inserted] = await db.select().from(vitals).where(eq(vitals.id, data.id!)).limit(1);
    revalidatePath(`/active-cases/${data.caseId}`);
    return inserted;
  } catch (error) {
    console.error('[Actions] addVitalSign failed:', error);
    throw error;
  }
}

// --- Lab Results ---
export async function getLabs(caseId: string) {
  try {
    return await db.select().from(labs).where(eq(labs.caseId, caseId)).orderBy(desc(labs.createdAt));
  } catch (error) {
    console.error('[Actions] getLabs failed:', error);
    return [];
  }
}

// --- Medications ---
export async function getMedications(caseId: string) {
  try {
    return await db.select().from(medications).where(eq(medications.caseId, caseId)).orderBy(desc(medications.createdAt));
  } catch (error) {
    console.error('[Actions] getMedications failed:', error);
    return [];
  }
}
