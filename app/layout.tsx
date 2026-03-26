import { Metadata } from 'next';
import Script from 'next/script';
import '../src/index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Phitsanulok Med Consultation',
  description: 'Inter-hospital patient consultation system',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
