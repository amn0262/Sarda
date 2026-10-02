import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#121214] flex items-center justify-center p-4 text-neutral-900 dark:text-neutral-100 select-none">
      <div className="max-w-md w-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 mx-auto flex items-center justify-center shadow-2xs">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          الصفحة غير موجودة
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-2.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
