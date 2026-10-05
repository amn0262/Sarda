'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Youtube, Instagram, Facebook, Heart, CheckCircle2, ExternalLink, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

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
    language,
    _hasHydrated
  } = useStore();

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [clickedAccounts, setClickedAccounts] = useState<string[]>([]);

  const isOpen = isClient && _hasHydrated && (isSupportGateOpen || !hasCompletedSupportGate);

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

    if (!hasCompletedTour) {
      setTimeout(() => {
        startTour();
      }, 250);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto select-none">
      <div
        className="relative w-full max-w-md bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 my-auto"
      >
          {/* Header Banner - macOS Dialog Top */}
          <div className="bg-neutral-900 dark:bg-black/90 p-5 text-white text-center relative border-b border-black/10 dark:border-white/10">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-1.5 absolute top-3.5 start-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block opacity-90"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block opacity-90"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block opacity-90"></span>
            </div>

            <div className="text-[11px] font-semibold text-neutral-400 mb-1 uppercase tracking-wider">
              {language === 'ar' ? 'ترحيب ودعم المطور' : 'Welcome & Support'}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1">
              {t('supportGateTitle', language)}
            </h2>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
              {t('supportGateSub', language)}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4">
            
            {/* Primary Youtube Channel Card */}
            <div className="bg-neutral-50 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Youtube className="w-5 h-5 fill-red-600 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-xs">
                      {t('youtubeChannel', language)}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                      @amnbkr0
                    </p>
                  </div>
                </div>

                {clickedAccounts.includes('youtube') && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/50">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('visitedTag', language)}</span>
                  </span>
                )}
              </div>

              <Link
                href="https://youtube.com/@amnbkr0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAccountClick('youtube')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>{t('youtubeSubscribeBtn', language)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Social Accounts Grid */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('socialAccounts', language)}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="https://tiktok.com/@amnbkr0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('tiktok')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white font-bold text-xs transition-all cursor-pointer group"
                >
                  <TikTokIcon className="w-4 h-4 mb-1 text-black dark:text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[10px]">TikTok</span>
                </Link>

                <Link
                  href="https://instagram.com/amnbkr0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('instagram')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white font-bold text-xs transition-all cursor-pointer group"
                >
                  <Instagram className="w-4 h-4 mb-1 text-rose-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px]">Instagram</span>
                </Link>

                <Link
                  href="https://facebook.com/AymenExplorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('facebook')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white font-bold text-xs transition-all cursor-pointer group"
                >
                  <Facebook className="w-4 h-4 mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px]">Facebook</span>
                </Link>
              </div>
            </div>

            {/* Message */}
            <div className="flex items-center gap-2.5 p-2.5 bg-neutral-50 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 rounded-xl border border-black/5 dark:border-white/10 text-xs">
              <Heart className="w-4 h-4 shrink-0 text-rose-500 fill-rose-500/20" />
              <span className="text-[11px] leading-snug">{t('supportMessage', language)}</span>
            </div>

            {/* Enter App CTA */}
            <div className="pt-1">
              {hasUnlocked ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full py-2.5 px-4 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-white dark:text-black" />
                  <span>{t('subscribedEnterApp', language)}</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-2.5 bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 rounded-xl border border-black/5 dark:border-white/10 text-xs font-semibold text-center">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{t('clickAccountToUnlock', language)}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
  );
}
