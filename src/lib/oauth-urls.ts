import { authEnv } from '@/lib/auth-env';
import { resolvePublicAppUrl } from '@/lib/public-url';

export const HEALTH_ID_CALLBACK_PATH = '/api/auth/healthid';

const trimUrl = (value: string) => value.replace(/\/+$/, '');

export const resolveClientHealthRedirectUri = () => {
  const configured = authEnv.healthRedirectUri();
  if (configured) {
    return trimUrl(configured);
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${HEALTH_ID_CALLBACK_PATH}`;
  }

  return `${resolvePublicAppUrl()}${HEALTH_ID_CALLBACK_PATH}`;
};
