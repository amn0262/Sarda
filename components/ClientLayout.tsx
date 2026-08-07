'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import SupportGateModal from '@/components/SupportGateModal';
import AppOnboardingTour from '@/components/AppOnboardingTour';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { language } = useStore();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <>
      <SupportGateModal />
      <AppOnboardingTour />
      {children}
    </>
  );
}

