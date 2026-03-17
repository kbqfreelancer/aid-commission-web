import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Outfit } from 'next/font/google'


const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: { default: 'NHIDRS (National HIV & Human Rights Data Reporting System)', template: '%s | NHIDRS (National HIV & Human Rights Data Reporting System)' },
  description: 'National HIV & Human Rights Data Reporting System: Tracking human rights indicators across state agencies and health facilities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className={outfit.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
