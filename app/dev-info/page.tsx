'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  Code2, 
  Youtube, 
  Instagram, 
  Facebook, 
  ShieldCheck, 
  FolderGit2, 
  FileText, 
  Calendar, 
  Globe2, 
  Download, 
  Upload, 
  ExternalLink,
  PlayCircle,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Layers,
  FileCheck,
  X,
  AlertCircle,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

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

  // Custom Toast State (No window.alert)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Custom Import Confirmation Modal State (No window.confirm)
  const [pendingImportData, setPendingImportData] = useState<any | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  const handleExport = () => {
    const data = { folders, stories, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarda-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToast({
      type: 'success',
      message: language === 'ar' ? 'تم تنزيل النسخة الاحتياطية بنجاح' : 'Backup downloaded successfully'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.folders && data.stories) {
          setPendingImportData(data);
        } else {
          setToast({
            type: 'error',
            message: language === 'ar' ? 'ملف النسخة الاحتياطية غير متوافق' : 'Invalid backup format'
          });
        }
      } catch {
        setToast({
          type: 'error',
          message: language === 'ar' ? 'تعذر قراءة ملف النسخة الاحتياطية' : 'Error parsing backup file'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImportData) {
      importData(pendingImportData);
      setPendingImportData(null);
      setToast({
        type: 'success',
        message: language === 'ar' ? 'تم استيراد كافة البيانات بنجاح' : 'All data restored successfully'
      });
    }
  };

  const capabilities = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
      title: t('cap1Title', language),
      desc: t('cap1Desc', language),
    },
    {
      icon: FolderGit2,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
      title: t('cap2Title', language),
      desc: t('cap2Desc', language),
    },
    {
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
      title: t('cap3Title', language),
      desc: t('cap3Desc', language),
    },
    {
      icon: Calendar,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
      title: t('cap4Title', language),
      desc: t('cap4Desc', language),
    },
    {
      icon: FileCheck,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40',
      title: t('cap5Title', language),
      desc: t('cap5Desc', language),
    },
    {
      icon: Globe2,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
      title: t('cap6Title', language),
      desc: t('cap6Desc', language),
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 bg-[#F5F5F7] dark:bg-[#121214] min-h-screen text-neutral-900 dark:text-neutral-100 pb-36 md:pb-16 select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 backdrop-blur-xl border ${
              toast.type === 'success'
                ? 'bg-neutral-900/90 dark:bg-black/90 text-white border-white/10'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 ms-1 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Hero Banner - World-Class Apple macOS Style */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* macOS Traffic Lights Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block shadow-2xs"></span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SARDA CMS 1.0 · {language === 'ar' ? 'نسخة الإنتاج المستقرة' : 'Stable Release'}</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <span className="text-blue-400">سـردة للمحتوى القصصي</span>
              <span className="opacity-40">·</span>
              <span>Story & Audio CMS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
              {t('aboutDev', language)}
            </h1>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {language === 'ar'
                ? 'بيئة عمل مصممة بأعلى معايير الإتقان والتنسيق لكُتّاب القصص، صُنّاع المحتوى السردي، ومعدّي البودكاست. تركيز كامل دون تشتيت مع سيادة تامة على بياناتك.'
                : 'Tailored editorial environment for narrative writers, audio storytellers, and podcast creators with local-first privacy.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={startTour}
              className="px-4 py-2.5 bg-white text-neutral-950 font-bold rounded-xl text-xs hover:bg-neutral-100 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <PlayCircle className="w-4 h-4 text-neutral-950" />
              <span>{t('restartTour', language)}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSupportGateOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all border border-white/10 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{t('openSupportGate', language)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Profile & Featured Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Developer Profile Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-2xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-black/5 dark:border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Code2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                  {t('aymen', language)}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white shrink-0" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs mt-0.5">
                {t('systemDev', language)} · Content Creator & Tech Architect
              </p>
            </div>
          </div>
          
          <div className="space-y-3 text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs sm:text-sm">
            <p>
              صُمم هذا النظام ليجمع بين فلسفة التصميم الهادئ المستوحى من نظام macOS وسرعة أداء الويب الحديثة، ليكون الملاذ الإبداعي لصنّاع المحتوى القصصي الذين يبحثون عن الأناقة والإنتاجية معاً.
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              تعتمد المنصة بنية التخزين المحلي الآمنة (Local-First Engine)، مما يعني أن أفكارك ونصوصك محفوظة على جهازك بسرية مطلقة وسرعة فائقة دون الاعتماد على خوادم وسيطة.
            </p>
          </div>

          {/* Official Social Links */}
          <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
            <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {language === 'ar' ? 'قنوات التواصل والمتابعة الرسمية:' : 'Official Channels:'}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Link 
                href="https://youtube.com/@amnbkr0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-neutral-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/40 text-neutral-800 dark:text-neutral-200 hover:text-red-600 dark:hover:text-red-400 rounded-2xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
              >
                <Youtube className="w-4 h-4 text-red-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>YouTube</span>
              </Link>

              <Link 
                href="https://tiktok.com/@amnbkr0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 rounded-2xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
              >
                <TikTokIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                <span>TikTok</span>
              </Link>

              <Link 
                href="https://instagram.com/amnbkr0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-neutral-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900/40 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
              >
                <Instagram className="w-4 h-4 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Instagram</span>
              </Link>

              <Link 
                href="https://facebook.com/AymenExplorer" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-neutral-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900/40 text-neutral-800 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl border border-black/5 dark:border-white/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
              >
                <Facebook className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Facebook</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Featured YouTube Channel Spotlight */}
        <div className="bg-neutral-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-white/10 space-y-5 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-red-500 border border-white/10">
                <Youtube className="w-6 h-6 fill-red-500 text-red-500" />
              </div>
              <span className="text-[11px] font-mono text-neutral-400">@amnbkr0</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{t('youtubeChannel', language)}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400 text-white" />
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                انضم لمجتمعنا على يوتيوب لمتابعة تقنيات السرد القصصي الصوتي، إدارة مشاريع البودكاست، والشروحات الدورية لمنصة سـردة CMS.
              </p>
            </div>

            <div className="pt-2 text-[11px] text-neutral-400 space-y-1 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>فيديوهات أسبوعية متخصصة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>تحديثات مستمرة وميزات قادمة</span>
              </div>
            </div>
          </div>

          <Link
            href="https://youtube.com/@amnbkr0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-neutral-950 font-bold rounded-2xl text-xs hover:bg-neutral-100 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>{t('youtubeSubscribeBtn', language)}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Core Platform Architecture & Capabilities */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-2xs space-y-4">
        <div className="border-b border-black/5 dark:border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              {t('appCapabilities', language)}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {language === 'ar' ? 'ركائز البنية البرمجية والتصميمية لمنظومة سـردة' : 'Core architectural and design pillars'}
            </p>
          </div>
          <Cpu className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 space-y-2 hover:border-black/15 dark:hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl ${cap.color} flex items-center justify-center shrink-0`}>
                  <cap.icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{cap.title}</h4>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sovereignty & Backup Center */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-2xs space-y-4">
        <div className="border-b border-black/5 dark:border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              {t('dataManagement', language)}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {language === 'ar' ? 'تصدير واستيراد بيانات المنصة بالكامل للحفاظ على أرشيفك' : 'Export and import full system archive securely'}
            </p>
          </div>
          <Layers className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <button
            type="button"
            onClick={handleExport}
            className="p-4 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100/80 dark:hover:bg-white/10 rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 text-right transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">{t('exportBackup', language)}</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{t('exportBackupSub', language)}</span>
              </div>
            </div>
            <ChevronIcon className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100/80 dark:hover:bg-white/10 rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 text-right transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">{t('importBackup', language)}</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{t('importBackupSub', language)}</span>
              </div>
            </div>
            <ChevronIcon className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />
      </div>

      {/* Confirmation Modal for Import (Zero window.confirm) */}
      {pendingImportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {language === 'ar' ? 'تأكيد استيراد البيانات' : 'Confirm Data Restore'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {language === 'ar' 
                  ? 'سيتم استبدال القصص والمجلدات الحالية بالبيانات الموجودة في هذا الملف. هل ترغب في المتابعة؟'
                  : 'Current stories and folders will be replaced with data from this backup file. Continue?'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={confirmImport}
                className="flex-1 py-2.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {language === 'ar' ? 'نعم، استيراد الآن' : 'Restore Now'}
              </button>
              <button
                type="button"
                onClick={() => setPendingImportData(null)}
                className="flex-1 py-2.5 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-all border border-black/5 dark:border-white/10 cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Dock Safety Spacer */}
      <div className="h-12 md:hidden w-full pointer-events-none" aria-hidden="true" />

    </div>
  );
}
