import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Sidebar from '@/components/Sidebar';
import ClientLayout from '@/components/ClientLayout';
import GlobalSearchHeader from '@/components/GlobalSearchHeader';

export const metadata: Metadata = {
  title: 'سـردة (Sarda) - استوديو الحكواتي وصناعة المحتوى القصصي والصوتي',
  description: 'نظام متكامل (CMS) مخصص لصناع المحتوى الصوتي والقصصي لرقمنة فن الحكواتي وصناعة القصص الملهمة',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('sarda-theme');
                  if (!theme) {
                    var raw = localStorage.getItem('sarda-storage');
                    if (raw) {
                      var parsed = JSON.parse(raw);
                      theme = (parsed.state && parsed.state.theme) || parsed.theme;
                    }
                  }
                  var isDark = theme === 'dark' || ((theme === 'system' || !theme) && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans bg-[#F5F5F7] dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 antialiased flex flex-col md:flex-row h-[100dvh] overflow-hidden selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <ClientLayout>
          <Sidebar />
          <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden bg-[#F5F5F7] dark:bg-[#121214]">
            <GlobalSearchHeader />
            <main className="flex-1 h-full min-h-0 overflow-y-auto pb-28 md:pb-0">
              {children}
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
