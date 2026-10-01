'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface ScrollToTopButtonProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  threshold?: number;
  className?: string;
  showLabel?: boolean;
}

export default function ScrollToTopButton({
  containerRef,
  threshold = 160,
  className = '',
  showLabel = true,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useStore();

  useEffect(() => {
    const target = containerRef ? containerRef.current : window;
    if (!target) return;

    const handleScroll = () => {
      const scrollTop = containerRef?.current
        ? containerRef.current.scrollTop
        : window.scrollY || document.documentElement.scrollTop;

      setIsVisible(scrollTop > threshold);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, threshold]);

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('scrollToTop', language)}
      title={t('scrollToTop', language)}
      className={`fixed bottom-24 md:bottom-6 start-6 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border border-neutral-300/80 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#2C2C2E] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-xs font-semibold select-none group cursor-pointer ${className}`}
      style={{
        fontFamily: 'var(--font-apple, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif)',
      }}
    >
      <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform group-hover:scale-110">
        <ArrowUp className="w-3.5 h-3.5" />
      </div>
      {showLabel && (
        <span className="hidden sm:inline-block tracking-tight text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
          {t('scrollToTop', language)}
        </span>
      )}
    </button>
  );
}
