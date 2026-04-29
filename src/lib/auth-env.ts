const firstDefined = (...values: Array<string | undefined>) => {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return '';
};

export const authEnv = {
  healthClientId: () =>
    firstDefined(process.env.NEXT_PUBLIC_HEALTH_CLIENT_ID, process.env.HEALTH_CLIENT_ID),
  healthClientSecret: () =>
    firstDefined(process.env.NEXT_PUBLIC_HEALTH_CLIENT_SECRET, process.env.HEALTH_CLIENT_SECRET),
  healthBaseUrl: () =>
    firstDefined(process.env.NEXT_PUBLIC_HEALTH_BASE_URL, process.env.HEALTH_BASE_URL),
  healthRedirectUri: () =>
    firstDefined(process.env.NEXT_PUBLIC_HEALTH_REDIRECT_URI, process.env.HEALTH_REDIRECT_URI),
  providerBaseUrl: () =>
    firstDefined(process.env.NEXT_PUBLIC_PROVIDER_BASE_URL, process.env.PROVIDER_BASE_URL),
  providerClientId: () =>
    firstDefined(process.env.NEXT_PUBLIC_PROVIDER_CLIENT_ID, process.env.PROVIDER_CLIENT_ID),
  providerClientSecret: () =>
    firstDefined(process.env.NEXT_PUBLIC_PROVIDER_CLIENT_SECRET, process.env.PROVIDER_CLIENT_SECRET),
} as const;
