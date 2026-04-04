'use server';

import { db, eq, or, desc } from '@/database';
import { users, User } from '@/database/schemas/users';
import { revalidatePath } from 'next/cache';

export async function getUserProfile(userIdOrEmail: string) {
  try {
    const [result] = await db
      .select()
      .from(users)
      .where(or(eq(users.id, userIdOrEmail), eq(users.email, userIdOrEmail)))
      .limit(1);
    return result || null;
  } catch (error) {
    console.error('[Actions] getUserProfile failed:', error);
    return null;
  }
}

export async function getSpecialists() {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.isAcceptingCases, true))
      .orderBy(desc(users.createdAt));
    return result;
  } catch (error) {
    console.error('[Actions] getSpecialists failed:', error);
    return [];
  }
}

export async function updateUserProfile(id: string, data: Partial<User>) {
  try {
    await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id));
    const [updated] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    revalidatePath('/settings');
    return updated;
  } catch (error) {
    console.error('[Actions] updateUserProfile failed:', error);
    throw error;
  }
}
