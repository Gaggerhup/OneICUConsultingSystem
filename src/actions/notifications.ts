'use server';

import { db, eq, desc } from '@/database';
import { notifications } from '@/database/schemas/notifications';
import { revalidatePath } from 'next/cache';

export async function getNotifications(userId: string) {
  try {
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, Number(userId)))
      .orderBy(desc(notifications.notifyDate), desc(notifications.notifyTime), desc(notifications.id));
    return allNotifications.map((item) => ({
      ...item,
      time: [item.notifyDate, item.notifyTime].filter(Boolean).join(' ') || '',
    }));
  } catch (error) {
    console.error('[Actions] getNotifications failed:', error);
    return [];
  }
}

export async function markAsRead(id: string) {
  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, Number(id)));
    const [updated] = await db.select().from(notifications).where(eq(notifications.id, Number(id))).limit(1);
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
      .where(eq(notifications.userId, Number(userId)));
    revalidatePath('/');
    return [];
  } catch (error) {
    console.error('[Actions] clearAllNotifications failed:', error);
    throw error;
  }
}
