'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LocaleProvider } from '../src/context/LocaleContext';

const AppProvider = dynamic(
  () => import('../src/context/AppContext').then((mod) => mod.AppProvider),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Auth callback routes must bootstrap without AppProvider state so they can
  // write fresh Provider ID session data before the main app mounts.
  const shouldBypassAppProvider =
    pathname === '/login' ||
    pathname.startsWith('/api/auth/');

  const content = shouldBypassAppProvider
    ? children
    : (
      <AppProvider>
        {children}
      </AppProvider>
    );

  return (
    <LocaleProvider>
      {content}
    </LocaleProvider>
  );
}
