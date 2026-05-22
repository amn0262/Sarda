'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function ThemeInitializer() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}
