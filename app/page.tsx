'use client';

import { useStore } from '@/lib/store';
import { Folder, FileText, CheckCircle, Clock, PenTool } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { folders, stories } = useStore();

  const totalFolders = folders.length;
  const totalStories = stories.length;
  const readyStories = stories.filter(s => s.status === 'ready').length;
  const draftStories = stories.filter(s => s.status === 'draft').length;

  const stats = [
    { name: 'إجمالي المجلدات', value: totalFolders, icon: Folder, color: 'bg-blue-500' },
    { name: 'القصص المكتوبة', value: totalStories, icon: FileText, color: 'bg-indigo-500' },
    { name: 'جاهز للنشر', value: readyStories, icon: CheckCircle, color: 'bg-emerald-500' },
    { name: 'قيد الكتابة (مسودة)', value: draftStories, icon: Clock, color: 'bg-amber-500' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800"
      >
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-3 rounded-xl text-white shadow-md shadow-indigo-500/10 dark:shadow-indigo-550/5 shrink-0 self-start md:self-auto">
          <PenTool className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-1">مرحباً بك في سـردة 👋</h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            مركز القيادة الخاص بك لإدارة المحتوى الصوتي والقصصي. ابدأ بكتابة قصتك التالية!
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-150 dark:border-slate-800 flex items-center gap-4"
          >
            <div className={`${stat.color} p-4 rounded-xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.name}</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 sm:mt-12 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-150 dark:border-slate-800"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">نظرة سريعة</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
          سـردة هو نظام متكامل مصمم خصيصاً لصناع المحتوى. يمكنك البدء بإنشاء مجلد جديد من قسم <strong>إدارة المحتوى</strong>، ثم إضافة نصوصك وقصصك داخله. استخدم <strong>المحرر الذكي</strong> لتنسيق نصوصك، وحدد حالة كل نص وتاريخ نشره لمتابعته لاحقاً في <strong>جدول النشر</strong>.
        </p>
      </motion.div>
    </div>
  );
}
