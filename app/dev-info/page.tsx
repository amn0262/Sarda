'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  Code, 
  Youtube, 
  Instagram, 
  Facebook, 
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
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

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
          if (confirm(language === 'ar' ? 'سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟' : 'All current data will be replaced. Are you sure?')) {
            importData(data);
            alert(language === 'ar' ? 'تم استيراد البيانات بنجاح!' : 'Data imported successfully!');
          }
        } else {
          alert(language === 'ar' ? 'ملف النسخة الاحتياطية غير صالح.' : 'Invalid backup file.');
        }
      } catch {
        alert(language === 'ar' ? 'حدث خطأ أثناء قراءة الملف.' : 'Error reading file.');
      }
    };
    reader.readAsText(file);
  };

  const capabilities = [
    {
      icon: ShieldCheck,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      title: t('cap1Title', language),
      desc: t('cap1Desc', language),
    },
    {
      icon: FolderGit2,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      title: t('cap2Title', language),
      desc: t('cap2Desc', language),
    },
    {
      icon: FileText,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      title: t('cap3Title', language),
      desc: t('cap3Desc', language),
    },
    {
      icon: Calendar,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      title: t('cap4Title', language),
      desc: t('cap4Desc', language),
    },
    {
      icon: ClipboardCheck,
      color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
      title: t('cap5Title', language),
      desc: t('cap5Desc', language),
    },
    {
      icon: Globe2,
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      title: t('cap6Title', language),
      desc: t('cap6Desc', language),
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 bg-[#F5F5F7] dark:bg-[#121214] min-h-screen text-neutral-900 dark:text-neutral-100 pb-36 md:pb-16 select-none">
      
      {/* Top Banner Hero - Refined Apple Dark Canvas */}
      <div className="bg-neutral-900 dark:bg-black/90 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block opacity-90"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block opacity-90"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block opacity-90"></span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              {t('version', language)}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('aboutDev', language)}
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              {language === 'ar'
                ? 'منصة متكاملة ومصممة خصيصاً لتنظيم وكتابة وجدولة محتوى القصص والصوتيات والبودكاست بأعلى معايير الإتقان والتنسيق.'
                : 'Integrated platform tailored for organizing, writing, and scheduling story and audio content.'}
            </p>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={startTour}
              className="px-4 py-2 bg-white text-neutral-900 font-bold rounded-xl text-xs hover:bg-neutral-100 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <PlayCircle className="w-4 h-4 text-neutral-900" />
              <span>{t('restartTour', language)}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSupportGateOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{t('openSupportGate', language)}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Developer Profile Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-black/5 dark:border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">{t('aymen', language)}</h2>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs">{t('systemDev', language)} & Content Creator</p>
            </div>
          </div>
          
          <div className="space-y-2.5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs sm:text-sm">
            <p>
              تم تطوير هذا النظام ليكون البيئة المثالية الخالية من التشتت لكُتّاب القصص، صناع الروايات الصوتية، ومعدي البودكاست.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              تتيح لك المنصة ترتيب أفكارك في هيكلية مجلدات مرنة وسلسلة، مع إمكانية الجدولة الزمانية، واستخراج مستنداتك المنسقة بضغطة زر مع الحفاظ التام على خصوصية بياناتك في التخزين المحلي الآمن.
            </p>

            {/* Social Accounts Grid */}
            <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                {language === 'ar' ? 'قنوات التواصل والمتابعة الرسمية:' : 'Official Channels & Links:'}
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Link 
                  href="https://youtube.com/@amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-900 dark:text-white rounded-xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Youtube className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                  <span>YouTube</span>
                </Link>

                <Link 
                  href="https://tiktok.com/@amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-900 dark:text-white rounded-xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <TikTokIcon className="w-4 h-4 text-black dark:text-white group-hover:scale-110 transition-transform" />
                  <span>TikTok</span>
                </Link>

                <Link 
                  href="https://instagram.com/amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-900 dark:text-white rounded-xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                  <span>Instagram</span>
                </Link>

                <Link 
                  href="https://facebook.com/AymenExplorer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-900 dark:text-white rounded-xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Facebook className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Facebook</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Spotlight Card */}
        <div className="bg-neutral-900 dark:bg-black/90 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-white/10 space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-red-500">
              <Youtube className="w-5 h-5 fill-red-500 text-red-500" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base font-bold tracking-tight">{t('youtubeChannel', language)}</h3>
              <p className="text-[11px] font-mono text-neutral-400 dir-ltr text-right sm:text-left">@amnbkr0</p>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              اشترك بقناة اليوتيوب لمتابعة شروحات النظام، تقنيات صناعة المحتوى القصصي والصوتي، وتحديثات المنصة أولاً بأول.
            </p>
          </div>

          <Link
            href="https://youtube.com/@amnbkr0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-bold rounded-xl text-xs hover:bg-neutral-100 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>{t('youtubeSubscribeBtn', language)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* System Core Capabilities Grid */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs space-y-4">
        <div className="border-b border-black/5 dark:border-white/10 pb-2.5">
          <h3 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">{t('appCapabilities', language)}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="p-3.5 bg-neutral-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${cap.color} flex items-center justify-center shrink-0`}>
                  <cap.icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{cap.title}</h4>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Database & Backup Center */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs space-y-4">
        <div className="border-b border-black/5 dark:border-white/10 pb-2.5">
          <h3 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">{t('dataManagement', language)}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="p-3.5 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100/80 dark:hover:bg-white/10 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">{t('exportBackup', language)}</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{t('exportBackupSub', language)}</span>
              </div>
            </div>
            <ChevronIcon className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100/80 dark:hover:bg-white/10 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">{t('importBackup', language)}</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{t('importBackupSub', language)}</span>
              </div>
            </div>
            <ChevronIcon className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImport} 
          accept=".json" 
          className="hidden" 
        />
      </div>

    </div>
  );
}
