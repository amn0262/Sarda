'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Sarda CMS Global Error:', error);
  }, [error]);

  const handleResetAndReload = () => {
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
    <html lang="ar" dir="rtl">
      <body className="font-sans bg-[#F5F5F7] dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 min-h-screen flex items-center justify-center p-4 select-none">
        <div className="max-w-md w-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-2xs border border-amber-200 dark:border-amber-900/40">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              حدث خطأ غير متوقع في النظام
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              واجه التطبيق صعوبة أثناء التحميل. يمكنك إعادة المحاولة الآن أو تحديث الصفحة لمواصلة عملك بأمان دون فقدان بياناتك.
            </p>
            {error?.digest && (
              <span className="inline-block text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md mt-1">
                رمز الخطأ: {error.digest}
              </span>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-2.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة المحاولة الآن</span>
            </button>

            <button
              type="button"
              onClick={handleResetAndReload}
              className="w-full py-2.5 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 font-semibold text-xs rounded-xl transition-all border border-black/5 dark:border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل التطبيق</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
