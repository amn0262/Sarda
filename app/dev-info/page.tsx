'use client';

import { Info, Code, Sparkles, AudioLines, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function DevInfo() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
          <Code className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2">نبذة عن النظام والمطور</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          معلومات حول نشوء وتطوير منصة سـردة الرقمية
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
      >
        {/* Developer Title */}
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-2xl text-indigo-650 dark:text-indigo-400">
            <span className="text-xl sm:text-2xl font-black">أب</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">أيمن بكور</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">مؤسس ومطور نظام سـردة</p>
          </div>
        </div>
        
        {/* Biography & Mission */}
        <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base text-justify">
          <p>
            تَمَّ تطوير نظام <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">سـردة (Sarda)</strong> ليكون رفيقاً رقمياً متكاملاً وأداةً حديثةً تمكّن صنّاع المحتوى الصوتي والقصصي والكتّاب من إرساء بنية واضحة لأفكارهم، وإدارة ملفاتهم الإبداعية ونصوصهم بيسر وسهولة مطلقة في بيئة محصنة وسريعة.
          </p>
          <p>
            يركز النظام بالدرجة الأولى على بساطة التصميم واستغلال الفضاء وتوفير الأدوات المتطورة كالتفليج والتنسيق الذكي، والتصنيف التلقائي، والجدولة الزمنية المنظّمة لمتابعة النشر وإحصاء منجزات العمل بأعلى كفاءة ومعايير بصرية فائقة من دون أي تشتيت.
          </p>
        </div>

        {/* Core Values / Features badges */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
          <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 p-2.5 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-550 mx-auto mb-1" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 block">تصميم متميز</span>
          </div>
          <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 p-2.5 rounded-xl">
            <AudioLines className="w-5 h-5 text-indigo-550 mx-auto mb-1" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 block">تنظيم صوتي</span>
          </div>
          <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 p-2.5 rounded-xl">
            <Heart className="w-5 h-5 text-indigo-550 mx-auto mb-1" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 block">بيانات آمنة</span>
          </div>
        </div>

        {/* Footer info label */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            الإصدار 1.2.0 • سـردة الرقمية
          </span>
          <span>صُنِع بكل شغف بمحبة وإتقان</span>
        </div>
      </motion.div>
    </div>
  );
}
