'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      background: '#f4f7fe',
      color: '#1b2559',
      fontFamily: 'sans-serif',
      fontWeight: 800,
    }}>
      {t('common.loading')}
    </main>
  );
}
