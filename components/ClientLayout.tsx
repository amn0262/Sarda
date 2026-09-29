'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import SupportGateModal from '@/components/SupportGateModal';
import AppOnboardingTour from '@/components/AppOnboardingTour';
import FloatingStoryWindow from '@/components/FloatingStoryWindow';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { language, theme } = useStore();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else {
      // system auto mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <>
      <SupportGateModal />
      <AppOnboardingTour />
      <FloatingStoryWindow />
      {children}
    </>
  );
}

