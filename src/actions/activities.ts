'use server';

import { defaultActivities } from '@/lib/app-defaults';

export async function getActivities() {
  return defaultActivities;
}
