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
  Heart
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
    <div className="p-3 sm:p-5 max-w-5xl mx-auto space-y-3 bg-neutral-100 min-h-screen text-neutral-900">
      
      {/* Top Banner Hero - Sharp & Compact */}
      <div className="bg-black text-white rounded-none p-4 sm:p-6 border border-black shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              سـردة - Sarda Classic B&W Edition
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif">
              {t('aboutDev', language)} والتطبيق
            </h1>
            <p className="text-neutral-400 text-xs max-w-xl leading-relaxed">
              منصة متكاملة ومصممة خصيصاً لتنظيم ونشر محتوى القصص والصوتيات والبودكاست بأسلوب كلاسيكي راقٍ.
            </p>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              onClick={startTour}
              className="px-3 py-1.5 bg-white text-black font-bold rounded-none text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1 border border-white"
            >
              <PlayCircle className="w-3.5 h-3.5 text-black" />
              <span>{t('restartTour', language)}</span>
            </button>
            <button
              onClick={() => setIsSupportGateOpen(true)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-none text-xs transition-colors border border-neutral-700 flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 text-white" />
              <span>{t('openSupportGate', language)}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Developer Profile Card - Sharp Box */}
        <div className="lg:col-span-2 bg-white rounded-none p-4 border border-neutral-300 shadow-2xs space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
            <div className="bg-black p-2.5 rounded-none text-white border border-black">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-serif">{t('aymen', language)}</h2>
              <p className="text-neutral-500 font-bold text-xs">{t('systemDev', language)} & Content Creator</p>
            </div>
          </div>
          
          <div className="space-y-2 text-neutral-700 leading-relaxed text-xs">
            <p>
              تم تطوير نظام <strong>سـردة (Sarda)</strong> ليكون الملاذ الخالي من التشتت لكُتّاب القصص، صناع الروايات الصوتية، ومعدي البودكاست.
            </p>
            <p>
              تتيح لك المنصة ترتيب أفكارك في هيكلية مجلدات مرنة، وإمكانية الجدولة الزمانية، واستخراج مستنداتك المنسقة بضغطة زر مع الحفاظ على سرية بياناتك 100% في التخزين المحلي.
            </p>

            {/* Social Accounts Grid */}
            <div className="pt-2 border-t border-neutral-200 space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                {language === 'ar' ? 'حساباتي وقنوات التواصل الرسمية:' : 'Official Accounts & Links:'}
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <Link 
                  href="https://youtube.com/@amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-none border border-neutral-300 transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Youtube className="w-3.5 h-3.5 text-black" />
                  <span>YouTube</span>
                </Link>

                <Link 
                  href="https://tiktok.com/@amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-none border border-neutral-300 transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-black" />
                  <span>TikTok</span>
                </Link>

                <Link 
                  href="https://instagram.com/amnbkr0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-none border border-neutral-300 transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5 text-black" />
                  <span>Instagram</span>
                </Link>

                <Link 
                  href="https://facebook.com/AymenExplorer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-none border border-neutral-300 transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Facebook className="w-3.5 h-3.5 text-black" />
                  <span>Facebook</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Highlight Card - Sharp */}
        <div className="bg-black text-white rounded-none p-4 shadow-sm flex flex-col justify-between border border-black space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-none bg-neutral-900 flex items-center justify-center text-white border border-neutral-700">
              <Youtube className="w-4 h-4 text-white" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold font-serif">{t('youtubeChannel', language)}</h3>
              <p className="text-[10px] font-mono text-neutral-400 dir-ltr text-right sm:text-left">@amnbkr0</p>
            </div>

            <p className="text-[11px] text-neutral-300 leading-relaxed">
              اشترك بقناة اليوتيوب لمتابعة شروحات النظام، تقنيات صناعة المحتوى القصصي والصوتي، وتحديثات التطبيق أولاً بأول.
            </p>
          </div>

          <Link
            href="https://youtube.com/@amnbkr0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black font-bold rounded-none text-xs hover:bg-neutral-200 transition-colors"
          >
            <span>{t('youtubeSubscribeBtn', language)}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* System Core Capabilities Grid */}
      <div className="bg-white rounded-none p-4 border border-neutral-300 shadow-2xs space-y-3">
        <div className="border-b border-neutral-200 pb-1.5">
          <h3 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">{t('appCapabilities', language)}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="p-2.5 bg-neutral-50 rounded-none border border-neutral-200 space-y-1">
              <div className="flex items-center gap-2">
                <cap.icon className="w-4 h-4 text-black shrink-0" />
                <h4 className="font-bold text-xs text-neutral-900 font-serif">{cap.title}</h4>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Database & Backup Center */}
      <div className="bg-white rounded-none p-4 border border-neutral-300 shadow-2xs space-y-3">
        <div className="border-b border-neutral-200 pb-1.5">
          <h3 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">{t('dataManagement', language)}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-none border border-neutral-300 flex items-center gap-2.5 text-right transition-colors"
          >
            <div className="p-1.5 bg-neutral-100 border border-neutral-300 text-black rounded-none">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-neutral-900 block font-serif">{t('exportBackup', language)}</span>
              <span className="text-[10px] text-neutral-500">{t('exportBackupSub', language)}</span>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-none border border-neutral-300 flex items-center gap-2.5 text-right transition-colors"
          >
            <div className="p-1.5 bg-neutral-100 border border-neutral-300 text-black rounded-none">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-neutral-900 block font-serif">{t('importBackup', language)}</span>
              <span className="text-[10px] text-neutral-500">{t('importBackupSub', language)}</span>
            </div>
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
