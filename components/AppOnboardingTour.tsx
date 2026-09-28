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

  const tourSteps = [
    {
      icon: Sparkles,
      badge: 'مقدمة النظام',
      title: t('tourStep1Title', language),
      desc: t('tourStep1Desc', language),
      href: '/',
      linkText: 'الانتقال للرئيسية',
    },
    {
      icon: LayoutDashboard,
      badge: 'اللوحة الرئيسية',
      title: t('tourStep2Title', language),
      desc: t('tourStep2Desc', language),
      href: '/',
      linkText: 'عرض الإحصائيات',
    },
    {
      icon: FolderOpen,
      badge: 'تنظيم المحتوى',
      title: t('tourStep3Title', language),
      desc: t('tourStep3Desc', language),
      href: '/content',
      linkText: 'فتح إدارة المحتوى',
    },
    {
      icon: Edit3,
      badge: 'محرر النصوص',
      title: t('tourStep4Title', language),
      desc: t('tourStep4Desc', language),
      href: '/content',
      linkText: 'تجربة محرر القصص',
    },
    {
      icon: CalendarDays,
      badge: 'تخطيط النشر',
      title: t('tourStep5Title', language),
      desc: t('tourStep5Desc', language),
      href: '/schedule',
      linkText: 'فتح جدول النشر',
    },
    {
      icon: Star,
      badge: 'المفضلة والسلة',
      title: t('tourStep6Title', language),
      desc: t('tourStep6Desc', language),
      href: '/content',
      linkText: 'استعراض المفضلة',
    },
    {
      icon: Settings,
      badge: 'الإعدادات والأمان',
      title: t('tourStep7Title', language),
      desc: t('tourStep7Desc', language),
      href: '/settings',
      linkText: 'الانتقال للإعدادات',
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-none shadow-2xl p-4 sm:p-5 border-2 border-black my-auto text-neutral-900"
        >
          {/* Close / Skip button */}
          <button
            onClick={closeTour}
            className="absolute top-3 left-3 p-1 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-none border border-neutral-300 transition-colors"
            title={t('skipTour', language)}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header Step Counter */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-100 text-neutral-900 rounded-none border border-neutral-400">
              {t('step', language)} {tourStep + 1} {t('of', language)} {tourSteps.length}
            </span>
            <span className="text-[11px] text-neutral-500 font-bold">{current.badge}</span>
          </div>

          {/* Step Icon & Content - Compact */}
          <div className="space-y-2.5 mb-4">
            <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center border border-black">
              <current.icon className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1 font-serif">
                {current.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {current.desc}
              </p>
            </div>

            {current.href && (
              <button
                onClick={() => handleNavigate(current.href)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-black hover:underline bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 px-2 py-1 rounded-none transition-colors"
              >
                <span>{current.linkText}</span>
                <ArrowRight className="w-3 h-3 rotate-180 dir-ltr:rotate-0" />
              </button>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 transition-all ${
                  idx === tourStep 
                    ? 'w-6 bg-black' 
                    : idx < tourStep 
                    ? 'w-2 bg-neutral-600' 
                    : 'w-2 bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-200">
            <button
              onClick={prevTourStep}
              disabled={isFirstStep}
              className={`px-3 py-1.5 rounded-none font-bold text-xs flex items-center gap-1 transition-colors ${
                isFirstStep 
                  ? 'opacity-30 text-neutral-400 cursor-not-allowed border border-transparent' 
                  : 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5 dir-ltr:rotate-180" />
              <span>{t('prevStep', language)}</span>
            </button>

            {isLastStep ? (
              <button
                onClick={closeTour}
                className="flex-1 py-1.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-none text-xs border border-black flex items-center justify-center gap-1"
              >
                <span>{t('finishTour', language)}</span>
              </button>
            ) : (
              <button
                onClick={nextTourStep}
                className="flex-1 py-1.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-none text-xs border border-black flex items-center justify-center gap-1"
              >
                <span>{t('nextStep', language)}</span>
                <ChevronLeft className="w-3.5 h-3.5 dir-ltr:rotate-180" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
