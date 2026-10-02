'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely
    console.error('Sarda CMS Application Error:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        window.location.href = '/';
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#121214] flex items-center justify-center p-4 text-neutral-900 dark:text-neutral-100 select-none">
      <div className="max-w-md w-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-2xs border border-amber-200 dark:border-amber-900/40">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            حدث خطأ غير متوقع
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            واجه المتصفح صعوبة في معالجة الصفحة الحالية. يمكنك إعادة المحاولة أو العودة للرئيسية دون فقدان بياناتك المحفوظة.
          </p>
          {error?.digest && (
            <span className="inline-block text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md mt-1">
              رمز الخطأ: {error.digest}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة الآن</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 font-semibold text-xs rounded-xl transition-all border border-black/5 dark:border-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>

          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="w-full py-2 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer pt-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>تحديث شامل واستعادة الاستقرار</span>
          </button>
        </div>
      </div>
    </div>
  );
}
