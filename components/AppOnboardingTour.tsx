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

export default function AppOnboardingTour() {
  const { 
    isTourOpen, 
    tourStep, 
    nextTourStep, 
    prevTourStep, 
    closeTour, 
    language 
  } = useStore();

  const router = useRouter();

  if (!isTourOpen) return null;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, scale: 0.95, x: language === 'ar' ? -15 : 15 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: language === 'ar' ? 15 : -15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 my-auto"
        >
          {/* Close / Skip button top right */}
          <button
            onClick={closeTour}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            title={t('skipTour', language)}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Step Counter */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {t('step', language)} {tourStep + 1} {t('of', language)} {tourSteps.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">{current.badge}</span>
          </div>

          {/* Step Icon & Content */}
          <div className="space-y-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <current.icon className="w-7 h-7 text-indigo-300" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {current.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {current.desc}
              </p>
            </div>

            {/* Step Route Explorer button */}
            {current.href && (
              <button
                onClick={() => handleNavigate(current.href)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span>{current.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180 dir-ltr:rotate-0" />
              </button>
            )}
          </div>

          {/* Progress Indicators (Dots) */}
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === tourStep 
                    ? 'w-8 bg-slate-900' 
                    : idx < tourStep 
                    ? 'w-2 bg-slate-400' 
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={prevTourStep}
              disabled={isFirstStep}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors ${
                isFirstStep 
                  ? 'opacity-40 text-slate-300 cursor-not-allowed' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-4 h-4 dir-ltr:rotate-180" />
              <span>{t('prevStep', language)}</span>
            </button>

            {isLastStep ? (
              <button
                onClick={closeTour}
                className="flex-1 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('finishTour', language)}</span>
              </button>
            ) : (
              <button
                onClick={nextTourStep}
                className="flex-1 py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('nextStep', language)}</span>
                <ChevronLeft className="w-4 h-4 dir-ltr:rotate-180" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
