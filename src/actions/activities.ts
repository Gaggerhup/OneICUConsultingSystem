'use server';

import { db, desc, eq } from '@/database';
import { activities, ActivityItem, NewActivity } from '@/database/schemas/activities';
import { revalidatePath } from 'next/cache';

export async function getActivities() {
  try {
    const allActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(30);
    return allActivities;
  } catch (error) {
    console.error('[Actions] getActivities failed:', error);
    return [];
  }
}

export async function addActivity(data: NewActivity) {
  try {
    await db.insert(activities).values(data);
    const [inserted] = await db.select().from(activities).where(eq(activities.id, data.id!)).limit(1);
    revalidatePath('/');
    return inserted;
  } catch (error) {
    console.error('[Actions] addActivity failed:', error);
    throw error;
  }
}
