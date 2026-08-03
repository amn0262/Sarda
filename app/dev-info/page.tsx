'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Download, Upload, Info, Code, Database, AlertTriangle, Youtube, Instagram, Facebook } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import Link from 'next/link';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
  </svg>
);

export default function DevInfo() {
  const { folders, stories, importData, language } = useStore();
  const fileInputRef = useRef<any>(null);

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

  const handleImport = (e: React.ChangeEvent<any>) => {
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('aboutDev', language)}</h1>
        <p className="text-slate-600">{t('devInfoDesc', language)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-1 max-w-2xl mx-auto gap-8">
        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
              <Code className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('aymen', language)}</h2>
              <p className="text-slate-500 font-medium">{t('systemDev', language)}</p>
            </div>
          </div>
          
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>{t('devPara1_1', language)}<strong>سـردة (Sarda)</strong>{t('devPara1_2', language)}</p>
            <p>{t('devPara2', language)}</p>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-700">{language === 'ar' ? 'حساباتي:' : 'My Accounts:'}</span>
              <div className="flex items-center gap-3">
                <Link href="https://youtube.com/@amnbkr0" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </Link>
                <Link href="https://tiktok.com/@amnbkr0" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-500 hover:text-black hover:bg-slate-200 rounded-full transition-colors" title="TikTok">
                  <TikTokIcon className="w-5 h-5" />
                </Link>
                <Link href="https://instagram.com/amnbkr0" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="https://facebook.com/AymenExplorer" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
              <Info className="w-4 h-4" />
              <span>{t('version', language)}</span>
            </div>
          </div>
        </motion.div>

        
      </div>
    </div>
  );
}
