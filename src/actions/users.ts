'use server';

import { defaultSpecialists } from '@/lib/app-defaults';

export async function getSpecialists() {
  return defaultSpecialists;
}
