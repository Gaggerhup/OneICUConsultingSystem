import { resolvePublicAppUrl } from '@/lib/public-url';
import { serverAuthEnv } from '@/lib/server-auth-env';

export const HEALTH_ID_CALLBACK_PATH = '/api/auth/healthid';

const trimUrl = (value: string) => value.replace(/\/+$/, '');

export const resolveServerHealthRedirectUri = () => {
  const configured = serverAuthEnv.healthRedirectUri();
  if (configured) {
    return trimUrl(configured);
  }

  return `${resolvePublicAppUrl()}${HEALTH_ID_CALLBACK_PATH}`;
};
