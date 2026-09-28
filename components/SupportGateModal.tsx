'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, Instagram, Facebook, Heart, CheckCircle2, Sparkles, ExternalLink, Lock } from 'lucide-react';
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-md bg-white rounded-none shadow-2xl overflow-hidden border-2 border-black my-auto"
        >
          {/* Header Banner */}
          <div className="bg-black p-4 text-white text-center relative border-b border-black">
            <div className="text-[11px] font-mono text-neutral-400 mb-1 uppercase tracking-wider">
              {language === 'ar' ? 'ترحيب ودعم المطور' : 'Welcome & Support'}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1 font-serif">
              {t('supportGateTitle', language)}
            </h2>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
              {t('supportGateSub', language)}
            </p>
          </div>

          {/* Body Content - Compact & Sharp */}
          <div className="p-4 space-y-3">
            
            {/* Primary Youtube Channel Card */}
            <div className="bg-neutral-50 rounded-none p-3 border border-neutral-300 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-xs font-serif">
                      {t('youtubeChannel', language)}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      @amnbkr0
                    </p>
                  </div>
                </div>

                {clickedAccounts.includes('youtube') && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-black border border-black px-1.5 py-0.2">
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
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded-none text-xs border border-black transition-colors"
              >
                <span>{t('youtubeSubscribeBtn', language)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Social Accounts Grid */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                {t('socialAccounts', language)}
              </h4>
              <div className="grid grid-cols-3 gap-1.5">
                <Link
                  href="https://tiktok.com/@amnbkr0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('tiktok')}
                  className="flex flex-col items-center justify-center p-2 rounded-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-900 font-bold text-xs"
                >
                  <TikTokIcon className="w-4 h-4 mb-0.5 text-black" />
                  <span className="text-[10px]">TikTok</span>
                </Link>

                <Link
                  href="https://instagram.com/amnbkr0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('instagram')}
                  className="flex flex-col items-center justify-center p-2 rounded-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-900 font-bold text-xs"
                >
                  <Instagram className="w-4 h-4 mb-0.5 text-black" />
                  <span className="text-[10px]">Instagram</span>
                </Link>

                <Link
                  href="https://facebook.com/AymenExplorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAccountClick('facebook')}
                  className="flex flex-col items-center justify-center p-2 rounded-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-neutral-900 font-bold text-xs"
                >
                  <Facebook className="w-4 h-4 mb-0.5 text-black" />
                  <span className="text-[10px]">Facebook</span>
                </Link>
              </div>
            </div>

            {/* Message */}
            <div className="flex items-center gap-2 p-2 bg-neutral-50 text-neutral-900 rounded-none border border-neutral-200 text-xs">
              <Heart className="w-3.5 h-3.5 shrink-0 text-black" />
              <span className="text-[11px] leading-snug">{t('supportMessage', language)}</span>
            </div>

            {/* Enter App CTA */}
            <div className="pt-1">
              {hasUnlocked ? (
                <button
                  onClick={handleConfirm}
                  className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-none border border-black flex items-center justify-center gap-1.5 text-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{t('subscribedEnterApp', language)}</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 p-2 bg-neutral-100 text-neutral-700 rounded-none border border-neutral-300 text-xs font-bold text-center">
                  <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>{t('clickAccountToUnlock', language)}</span>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
