import type {Metadata, Viewport} from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css'; // Global styles
import Sidebar from '@/components/Sidebar';
import ThemeInitializer from '@/components/ThemeInitializer';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'سـردة - Sarda CMS',
  description: 'نظام متكامل لصناع المحتوى الصوتي والقصصي',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${tajawal.variable} font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased flex flex-col md:flex-row h-[100dvh] overflow-hidden`}>
        <ThemeInitializer />
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
