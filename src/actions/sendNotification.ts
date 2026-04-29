'use server';

/**
 * Server Action: sendNotification
 *
 * Thin wrapper around the notify service so that client-side code
 * (e.g. app-actions.ts) can trigger notifications via a server action call.
 */

import { dispatchNotification, type DispatchParams } from '@/services/notify';

export async function sendNotification(params: DispatchParams): Promise<void> {
  await dispatchNotification(params);
}
