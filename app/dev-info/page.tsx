'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  Info, 
  Code, 
  Youtube, 
  Instagram, 
  Facebook, 
  Sparkles, 
  ShieldCheck, 
  FolderGit2, 
  FileText, 
  Calendar, 
  ClipboardCheck, 
  Globe2, 
  Download, 
  Upload, 
  ExternalLink,
  PlayCircle,
  Heart,
  History,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import Link from 'next/link';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
  </svg>
);

export default function DevInfo() {
  const { 
    folders, 
    stories, 
    importData, 
    language, 
    startTour, 
    setIsSupportGateOpen 
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const data = { folders, stories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarda-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.folders && data.stories) {
          if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
            importData(data);
            alert('تم استيراد البيانات بنجاح!');
          }
        } else {
          alert('ملف النسخة الاحتياطية غير صالح.');
        }
      } catch (error) {
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const capabilities = [
    {
      icon: ShieldCheck,
      title: t('cap1Title', language),
      desc: t('cap1Desc', language),
    },
    {
      icon: FolderGit2,
      title: t('cap2Title', language),
      desc: t('cap2Desc', language),
    },
    {
      icon: FileText,
      title: t('cap3Title', language),
      desc: t('cap3Desc', language),
    },
    {
      icon: Calendar,
      title: t('cap4Title', language),
      desc: t('cap4Desc', language),
    },
    {
      icon: ClipboardCheck,
      title: t('cap5Title', language),
      desc: t('cap5Desc', language),
    },
    {
      icon: Globe2,
      title: t('cap6Title', language),
      desc: t('cap6Desc', language),
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-800"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 text-indigo-200 border border-white/15 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>سـردة - Sarda v1.2.0 Pro</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t('aboutDev', language)} والتطبيق
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              منصة متكاملة ومصممة خصيصاً لتنظيم ونشر محتوى القصص والصوتيات والبودكاست بأسلوب احترافي وبدون إعلانات.
            </p>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={startTour}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-indigo-200" />
              <span>{t('restartTour', language)}</span>
            </button>
            <button
              onClick={() => setIsSupportGateOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-indigo-400" />
              <span>{t('openSupportGate', language)}</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Developer Profile Card (2 Cols on lg) */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="bg-slate-900 p-3.5 rounded-2xl text-white shadow-sm">
              <Code className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{t('aymen', language)}</h2>
              <p className="text-slate-500 font-bold text-sm">{t('systemDev', language)} & Content Creator</p>
            </div>
          </div>
          
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
            <p>
              تم تطوير نظام <strong>سـردة (Sarda)</strong> ليكون الملاذ الخالي من التشتت لكُتّاب القصص، صناع الروايات الصوتية، ومعدي البودكاست. 
            </p>
            <p>
              تتيح لك المنصة ترتيب أفكارك في هيكلية مجلدات مرنة، وإمكانية الجدولة الزمانية، واستخراج مستنداتك المنسقة بضغطة زر مع الحفاظ على سرية بياناتك 100% في التخزين المحلي.
            </p>

            {/* Social Accounts Grid Pills */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'حساباتي وقنوات التواصل الرسمية:' : 'Official Accounts & Links:'}
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Link 
                  href="https://youtube.com/@amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 transition-all font-bold text-xs flex items-center justify-center gap-2 group"
                >
                  <Youtube className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span>YouTube</span>
                </Link>

                <Link 
                  href="https://tiktok.com/@amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 transition-all font-bold text-xs flex items-center justify-center gap-2 group"
                >
                  <TikTokIcon className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span>TikTok</span>
                </Link>

                <Link 
                  href="https://instagram.com/amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 transition-all font-bold text-xs flex items-center justify-center gap-2 group"
                >
                  <Instagram className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span>Instagram</span>
                </Link>

                <Link 
                  href="https://facebook.com/AymenExplorer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 transition-all font-bold text-xs flex items-center justify-center gap-2 group"
                >
                  <Facebook className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  <span>Facebook</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* YouTube Highlight Card (1 Col on lg) */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-between border border-slate-800 relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/15">
              <Youtube className="w-6 h-6 text-indigo-300" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold">{t('youtubeChannel', language)}</h3>
              <p className="text-xs font-mono text-slate-400 dir-ltr text-right sm:text-left">@amnbkr0</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              اشترك في القناة ليصلك كل جديد من الشروحات والتحديثات التقنية لدعم استمرار وتطوير أدوات سـردة.
            </p>
          </div>

          <div className="pt-6">
            <Link
              href="https://youtube.com/@amnbkr0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-indigo-600/30 text-center text-sm flex items-center justify-center gap-2 group"
            >
              <span>{t('youtubeSubscribeBtn', language)}</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </motion.div>

      </div>

      {/* System Core Capabilities Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>{t('appCapabilities', language)}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <cap.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{cap.title}</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Backup and Data Sync Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <Download className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('dataSync', language)}</h3>
            <p className="text-xs sm:text-sm text-slate-500">{t('dataSyncSub', language)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">{t('exportBackup', language)}</h4>
            <p className="text-xs text-slate-500">{t('exportBackupSub', language)}</p>
            <button
              onClick={handleExport}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportBackup', language)}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">{t('importBackup', language)}</h4>
            <p className="text-xs text-slate-500">{t('importBackupSub', language)}</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{t('importBackup', language)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Changelog & Updates Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <History className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">سجل التحديثات والتطورات</h3>
            <p className="text-xs sm:text-sm text-slate-500">تاريخ الإصدارات والميزات الجديدة في نظام سـردة</p>
          </div>
        </div>

        <div className="space-y-4 border-r-2 border-slate-200 pr-4 sm:pr-6 mr-2">
          {/* v1.2.0 */}
          <div className="relative">
            <div className="absolute -right-[23px] sm:-right-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-xs" />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-900 text-sm sm:text-base">الإصدار 1.2.0 Pro</span>
              <span className="text-[10px] bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-full border border-slate-200">الأحدث</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              إضافة شاشة دعم المطور والاشتراك بالقنوات، والجولة التعريفية التفاعلية بجميع أقسام التطبيق مع تحسين التقويم وعرض المخطط الزمني الشجري للجوال.
            </p>
          </div>

          {/* v1.1.0 */}
          <div className="relative">
            <div className="absolute -right-[23px] sm:-right-[31px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-xs" />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-700 text-sm sm:text-base">الإصدار 1.1.0</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              تحديث جدول النشر الشامل لدعم التقويم الشهري والعرض التفصيلي والتجميع حسب المجلدات، وتضمين التصدير المباشر لمستندات Microsoft Word.
            </p>
          </div>

          {/* v1.0.0 */}
          <div className="relative">
            <div className="absolute -right-[23px] sm:-right-[31px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-xs" />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-700 text-sm sm:text-base">الإصدار 1.0.0</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              الإطلاق الأساسي لنظام سـردة: محرر النصوص ذكي الحفظ، تنظيم المجلدات، سلة المهملات، التصدير لـ PDF، والنسخ الاحتياطي المحلي.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
