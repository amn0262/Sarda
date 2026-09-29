import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Sidebar from '@/components/Sidebar';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Sarda CMS',
  description: 'Integrated system for audio and story content creators',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans bg-[#F5F5F7] text-neutral-900 antialiased flex flex-col md:flex-row h-[100dvh] overflow-hidden selection:bg-black selection:text-white">
        <ClientLayout>
          <Sidebar />
          <main className="flex-1 h-full min-h-0 overflow-y-auto">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
