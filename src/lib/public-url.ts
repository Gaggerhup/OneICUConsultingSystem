const PRODUCTION_PUBLIC_APP_URL = 'https://icucons.plkhealth.go.th';
const LOCAL_PUBLIC_APP_URL = 'http://localhost:3000';

export function resolvePublicAppUrl() {
  const configured =
    process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.NEXT_PUBLIC_WEB_APP_URL ||
    process.env.WEB_APP_URL ||
    '';

  const fallback =
    process.env.NODE_ENV === 'production'
      ? PRODUCTION_PUBLIC_APP_URL
      : LOCAL_PUBLIC_APP_URL;

  return (configured || fallback).replace(/\/+$/, '');
}

export const PUBLIC_APP_URLS = {
  production: PRODUCTION_PUBLIC_APP_URL,
  local: LOCAL_PUBLIC_APP_URL,
} as const;
