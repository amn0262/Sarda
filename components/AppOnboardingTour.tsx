'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FolderOpen, 
  Edit3, 
  CalendarDays, 
  Star, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  X,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function AppOnboardingTour() {
  const { 
    isTourOpen, 
    tourStep, 
    nextTourStep, 
    prevTourStep, 
    closeTour, 
    language,
    _hasHydrated
  } = useStore();

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const router = useRouter();

  if (!isClient || !_hasHydrated || !isTourOpen) return null;

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;
  const BackChevronIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  const tourSteps = [
    {
      icon: Sparkles,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      badge: language === 'ar' ? 'مقدمة النظام' : 'Overview',
      title: t('tourStep1Title', language),
      desc: t('tourStep1Desc', language),
      href: '/',
      linkText: language === 'ar' ? 'الانتقال للرئيسية' : 'Go to Home',
    },
    {
      icon: LayoutDashboard,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      badge: language === 'ar' ? 'اللوحة الرئيسية' : 'Dashboard',
      title: t('tourStep2Title', language),
      desc: t('tourStep2Desc', language),
      href: '/',
      linkText: language === 'ar' ? 'عرض الإحصائيات' : 'View Stats',
    },
    {
      icon: FolderOpen,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      badge: language === 'ar' ? 'تنظيم المحتوى' : 'Folders',
      title: t('tourStep3Title', language),
      desc: t('tourStep3Desc', language),
      href: '/content',
      linkText: language === 'ar' ? 'فتح إدارة المحتوى' : 'Open Content',
    },
    {
      icon: Edit3,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      badge: language === 'ar' ? 'محرر النصوص' : 'Editor',
      title: t('tourStep4Title', language),
      desc: t('tourStep4Desc', language),
      href: '/content',
      linkText: language === 'ar' ? 'تجربة محرر القصص' : 'Try Editor',
    },
    {
      icon: CalendarDays,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      badge: language === 'ar' ? 'تخطيط النشر' : 'Schedule',
      title: t('tourStep5Title', language),
      desc: t('tourStep5Desc', language),
      href: '/schedule',
      linkText: language === 'ar' ? 'فتح جدول النشر' : 'Open Schedule',
    },
    {
      icon: Star,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      badge: language === 'ar' ? 'المفضلة والسلة' : 'Favorites',
      title: t('tourStep6Title', language),
      desc: t('tourStep6Desc', language),
      href: '/content',
      linkText: language === 'ar' ? 'استعراض المفضلة' : 'View Favorites',
    },
    {
      icon: Settings,
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      badge: language === 'ar' ? 'الإعدادات والأمان' : 'Settings',
      title: t('tourStep7Title', language),
      desc: t('tourStep7Desc', language),
      href: '/settings',
      linkText: language === 'ar' ? 'الانتقال للإعدادات' : 'Go to Settings',
    },
  ];

  const current = tourSteps[tourStep] || tourSteps[0];
  const isLastStep = tourStep === tourSteps.length - 1;
  const isFirstStep = tourStep === 0;

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md select-none">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-black/10 dark:border-white/10 my-auto text-neutral-900 dark:text-white"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeTour}
            className="absolute top-4 start-4 p-1.5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title={t('skipTour', language)}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Step Counter */}
          <div className="flex items-center gap-2 mb-4 justify-end">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{current.badge}</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 rounded-full font-mono">
              {tourStep + 1} / {tourSteps.length}
            </span>
          </div>

          {/* Step Icon & Content */}
          <div className="space-y-3 mb-5">
            <div className={`w-12 h-12 rounded-2xl ${current.color} flex items-center justify-center shadow-2xs`}>
              <current.icon className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {current.desc}
              </p>
            </div>

            {current.href && (
              <button
                type="button"
                onClick={() => handleNavigate(current.href)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <span>{current.linkText}</span>
                <ChevronIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Progress Indicators (Apple dots) */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === tourStep 
                    ? 'w-6 bg-neutral-900 dark:bg-white' 
                    : idx < tourStep 
                    ? 'w-2 bg-neutral-400 dark:bg-neutral-600' 
                    : 'w-2 bg-neutral-200 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={prevTourStep}
              disabled={isFirstStep}
              className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isFirstStep 
                  ? 'opacity-30 text-neutral-400 cursor-not-allowed border border-transparent' 
                  : 'bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/10 active:scale-95'
              }`}
            >
              <BackChevronIcon className="w-3.5 h-3.5" />
              <span>{t('prevStep', language)}</span>
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={closeTour}
                className="flex-1 py-2 px-4 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>{t('finishTour', language)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextTourStep}
                className="flex-1 py-2 px-4 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>{t('nextStep', language)}</span>
                <ChevronIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
