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

  const content = pathname === '/login'
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
