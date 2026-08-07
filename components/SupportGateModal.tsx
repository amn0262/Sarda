'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, Instagram, Facebook, Heart, CheckCircle2, Sparkles, ExternalLink, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
  </svg>
);

export default function SupportGateModal() {
  const { 
    hasCompletedSupportGate, 
    isSupportGateOpen, 
    setHasCompletedSupportGate, 
    setIsSupportGateOpen,
    hasCompletedTour,
    startTour,
    language 
  } = useStore();

  const [clickedAccounts, setClickedAccounts] = useState<string[]>([]);

  const isOpen = !hasCompletedSupportGate || isSupportGateOpen;

  if (!isOpen) return null;

  const handleAccountClick = (key: string) => {
    if (!clickedAccounts.includes(key)) {
      setClickedAccounts((prev) => [...prev, key]);
    }
  };

  const hasUnlocked = hasCompletedSupportGate || clickedAccounts.length > 0;

  const handleConfirm = () => {
    setHasCompletedSupportGate(true);
    setIsSupportGateOpen(false);

    // If first time, automatically launch onboarding tour!
    if (!hasCompletedTour) {
      setTimeout(() => {
        startTour();
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-3 border border-white/15 text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{language === 'ar' ? 'ترحيب ودعم المطور' : 'Welcome & Support'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              {t('supportGateTitle', language)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {t('supportGateSub', language)}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Primary Youtube Channel Card */}
            <div className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-5 border border-slate-200/80 space-y-4 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Youtube className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {t('youtubeChannel', language)}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono dir-ltr text-right sm:text-left">
                      @amnbkr0
                    </p>
                  </div>
                </div>

                {clickedAccounts.includes('youtube') && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('visitedTag', language)}</span>
                  </span>
                )}
              </div>

              <Link
                href="https://youtube.com/@amnbkr0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAccountClick('youtube')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm group"
              >
                <span>{t('youtubeSubscribeBtn', language)}</span>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Social Accounts Grid */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('socialAccounts', language)}
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <Link
                  href="https://tiktok.com/@amnbkr0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('tiktok')}
                  className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 border border-slate-200/80 transition-all text-slate-800 font-medium group"
                >
                  <TikTokIcon className="w-5 h-5 mb-1 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span className="text-[11px] text-slate-600 group-hover:text-indigo-700">TikTok</span>
                  {clickedAccounts.includes('tiktok') && (
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500" title="تمت المتابعة" />
                  )}
                </Link>

                <Link
                  href="https://instagram.com/amnbkr0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('instagram')}
                  className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 border border-slate-200/80 transition-all text-slate-800 font-medium group"
                >
                  <Instagram className="w-5 h-5 mb-1 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span className="text-[11px] text-slate-600 group-hover:text-indigo-700">Instagram</span>
                  {clickedAccounts.includes('instagram') && (
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500" title="تمت المتابعة" />
                  )}
                </Link>

                <Link
                  href="https://facebook.com/AymenExplorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('facebook')}
                  className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 border border-slate-200/80 transition-all text-slate-800 font-medium group"
                >
                  <Facebook className="w-5 h-5 mb-1 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span className="text-[11px] text-slate-600 group-hover:text-indigo-700">Facebook</span>
                  {clickedAccounts.includes('facebook') && (
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500" title="تمت المتابعة" />
                  )}
                </Link>
              </div>
            </div>

            {/* Message */}
            <div className="flex items-center gap-2.5 p-3.5 bg-indigo-50/70 text-indigo-950 rounded-xl border border-indigo-100 text-xs leading-relaxed">
              <Heart className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{t('supportMessage', language)}</span>
            </div>

            {/* Enter App CTA (only unlocked once account link is clicked) */}
            <div className="pt-1">
              <AnimatePresence mode="wait">
                {hasUnlocked ? (
                  <motion.div
                    key="unlocked-btn"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={handleConfirm}
                      className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      <span>{t('subscribedEnterApp', language)}</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked-msg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 p-3.5 bg-slate-100/90 text-slate-600 rounded-2xl border border-slate-200 text-xs font-bold text-center"
                  >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{t('clickAccountToUnlock', language)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
