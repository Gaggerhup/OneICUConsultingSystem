'use server';

import { db, eq, or, desc } from '@/database';
import { users, User } from '@/database/schemas/users';
import { revalidatePath } from 'next/cache';

function parseNotifPrefs(value: string | null) {
  const fallback = {
    newRequest: true,
    requestApproved: true,
    newMessage: true,
    caseUpdate: false,
    weeklyReport: true,
    systemAlert: true,
  };
  if (!value) return fallback;
  try {
    return { ...fallback, ...JSON.parse(value) };
  } catch {
    return fallback;
  }
}

function toAppUser(user: User | null) {
  if (!user) return null;
  return {
    ...user,
    id: String(user.id),
    notifPrefs: parseNotifPrefs(user.notifPrefs),
  };
}

export async function getUserProfile(userIdOrEmail: string) {
  try {
    const numericId = Number(userIdOrEmail);
    const [result] = await db
      .select()
      .from(users)
      .where(Number.isFinite(numericId)
        ? or(eq(users.id, numericId), eq(users.email, userIdOrEmail), eq(users.providerCode, userIdOrEmail))
        : or(eq(users.email, userIdOrEmail), eq(users.providerCode, userIdOrEmail)))
      .limit(1);
    return toAppUser(result || null);
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
      .orderBy(desc(users.id));
    return result.map((user) => toAppUser(user)).filter(Boolean);
  } catch (error) {
    console.error('[Actions] getSpecialists failed:', error);
    return [];
  }
}

export async function updateUserProfile(id: string, data: Partial<User>) {
  try {
    const { id: _id, notifPrefs, ...rest } = data as Partial<User> & { notifPrefs?: unknown };
    await db
      .update(users)
      .set({
        ...rest,
        notifPrefs: notifPrefs ? JSON.stringify(notifPrefs) : undefined,
      })
      .where(eq(users.id, Number(id)));
    const [updated] = await db.select().from(users).where(eq(users.id, Number(id))).limit(1);
    revalidatePath('/settings');
    return toAppUser(updated || null);
  } catch (error) {
    console.error('[Actions] updateUserProfile failed:', error);
    throw error;
  }
}
