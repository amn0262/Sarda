'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import SupportGateModal from '@/components/SupportGateModal';
import AppOnboardingTour from '@/components/AppOnboardingTour';
import FloatingStoryWindow from '@/components/FloatingStoryWindow';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { language, theme } = useStore();

  useEffect(() => {
    try {
      const safeLang = language === 'en' ? 'en' : 'ar';
      document.documentElement.lang = safeLang;
      document.documentElement.dir = safeLang === 'ar' ? 'rtl' : 'ltr';
    } catch (e) {
      console.warn('Error setting document direction/lang', e);
    }
  }, [language]);

  useEffect(() => {
    try {
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
        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          applyTheme(mediaQuery.matches);

          const handler = (e: MediaQueryListEvent | MediaQueryList) => applyTheme(e.matches);
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler as EventListener);
            return () => mediaQuery.removeEventListener('change', handler as EventListener);
          } else if ((mediaQuery as any).addListener) {
            (mediaQuery as any).addListener(handler);
            return () => (mediaQuery as any).removeListener(handler);
          }
        } else {
          applyTheme(false);
        }
      }
    } catch (e) {
      console.warn('Error applying theme', e);
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

