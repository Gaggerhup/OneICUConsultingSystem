'use server';

import { db, eq, desc } from '@/database';
import { notifications } from '@/database/schemas/notifications';
import { revalidatePath } from 'next/cache';

export async function getNotifications(userId: string) {
  try {
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return allNotifications;
  } catch (error) {
    console.error('[Actions] getNotifications failed:', error);
    return [];
  }
}

export async function markAsRead(id: string) {
  try {
    await db
      .update(notifications)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(notifications.id, id));
    const [updated] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    revalidatePath('/');
    return updated;
  } catch (error) {
    console.error('[Actions] markAsRead failed:', error);
    throw error;
  }
}

export async function clearAllNotifications(userId: string) {
  try {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, userId));
    revalidatePath('/');
    return [];
  } catch (error) {
    console.error('[Actions] clearAllNotifications failed:', error);
    throw error;
  }
}
