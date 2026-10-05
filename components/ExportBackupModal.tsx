'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  X, 
  FolderDown, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  HardDrive,
  FolderOpen,
  Smartphone,
  Laptop
} from 'lucide-react';

interface ExportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: any[];
  stories: any[];
  onSuccess?: (msg: string) => void;
}

export default function ExportBackupModal({
  isOpen,
  onClose,
  folders,
  stories,
  onSuccess
}: ExportBackupModalProps) {
  const { language } = useStore();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `sarda_backup_${dateStr}.json`;
  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    folders: (folders || []).filter(f => f && !f.isDeleted),
    stories: (stories || []).filter(s => s && !s.isDeleted),
  };
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blobSizeKb = (new Blob([jsonStr]).size / 1024).toFixed(1);

  // 1. Choose Location / Save to Files (Mobile Share Sheet or Desktop Save File Picker)
  const handleSaveToLocation = async () => {
    setSaving(true);
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const file = new File([blob], filename, { type: 'application/json' });

      // A. Desktop File System Access API (Opens native Save As file picker)
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: language === 'ar' ? 'ملف نسخة احتياطية سـردة (JSON)' : 'Sarda Backup File (JSON)',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setSaving(false);
          onSuccess?.(language === 'ar' ? 'تم حفظ النسخة الاحتياطية في المجلد المختار بنجاح' : 'Backup saved to selected folder successfully');
          onClose();
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setSaving(false);
            return; // User canceled the picker
          }
          console.warn('showSaveFilePicker failed or unpermitted', err);
        }
      }

      // B. Mobile Web Share API with File (Native OS Action Sheet -> "Save to Files" / Drive / File Manager)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: language === 'ar' ? 'نسخة سـردة الاحتياطية' : 'Sarda Backup',
            text: language === 'ar' ? `نسخة احتياطية لبيانات سـردة (${dateStr})` : `Sarda CMS Backup (${dateStr})`,
          });
          setSaving(false);
          onSuccess?.(language === 'ar' ? 'تم توجيه الملف للحفظ بنجاح' : 'File dispatched for saving successfully');
          onClose();
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setSaving(false);
            return;
          }
          console.warn('File share failed', err);
        }
      }

      // Fallback: Direct Download
      handleDirectDownload();
    } catch (err) {
      console.warn('Save to location error', err);
      handleDirectDownload();
    } finally {
      setSaving(false);
    }
  };

  // 2. Share with Apps (WhatsApp, Telegram, Cloud Drive, etc.)
  const handleShareApps = async () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: language === 'ar' ? 'نسخة سـردة الاحتياطية' : 'Sarda Backup',
            text: language === 'ar' ? `ملف النسخة الاحتياطية - سـردة CMS (${dateStr})` : `Sarda CMS backup file (${dateStr})`,
          });
        } else {
          await navigator.share({
            title: language === 'ar' ? 'نسخة سـردة الاحتياطية' : 'Sarda Backup',
            text: jsonStr,
          });
        }
        onSuccess?.(language === 'ar' ? 'تمت مشاركة النسخة الاحتياطية بنجاح' : 'Backup shared successfully');
        onClose();
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    } else {
      // Fallback to copy if share is not available
      handleCopy();
    }
  };

  // 3. Direct Browser Download
  const handleDirectDownload = () => {
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onSuccess?.(language === 'ar' ? 'تم تنزيل النسخة الاحتياطية إلى جهازك' : 'Backup downloaded to device');
      onClose();
    } catch (err) {
      console.warn('Direct download error', err);
      handleCopy();
    }
  };

  // 4. Copy JSON to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onSuccess?.(language === 'ar' ? 'تم نسخ بيانات النسخة الاحتياطية إلى الحافظة' : 'Backup copied to clipboard');
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div
        className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5 text-neutral-900 dark:text-neutral-100 overflow-hidden relative"
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                <FolderDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg text-neutral-900 dark:text-white tracking-tight">
                  {language === 'ar' ? 'تصدير النسخة الاحتياطية' : 'Export Backup'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {language === 'ar' ? 'حدد مكان الحفظ أو طريقة النقل المناسبة لك' : 'Select save destination or transfer method'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Backup File Info Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#252528] border border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileJson className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-neutral-900 dark:text-white block truncate">{filename}</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {language === 'ar' 
                    ? `${backupData.stories.length} قصة · ${backupData.folders.length} مجلد · ${blobSizeKb} ك.ب`
                    : `${backupData.stories.length} stories · ${backupData.folders.length} folders · ${blobSizeKb} KB`}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md shrink-0">
              JSON
            </span>
          </div>

          {/* Destination Options List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-neutral-600 dark:text-neutral-300 px-1">
              {language === 'ar' ? 'خيارات تحديد مكان الحفظ:' : 'Choose destination:'}
            </div>

            {/* Option 1: Choose Folder / Save to Files (Recommended for Phone & Desktop Picker) */}
            <button
              type="button"
              onClick={handleSaveToLocation}
              disabled={saving}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 text-right cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white">
                      {language === 'ar' ? 'حفظ في الملفات / اختيار المجلد' : 'Save to Files / Choose Folder'}
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                      {language === 'ar' ? 'موصى به للهواتف' : 'Recommended'}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5 leading-relaxed">
                    {language === 'ar' 
                      ? 'يفتح نافذة تحديد مكان الحفظ على هاتفك (iCloud Drive / الهاتف) أو حفظ باسم في الكمبيوتر'
                      : 'Opens native picker to select exact folder (iCloud, Drive, device storage, or Save As)'}
                  </span>
                </div>
              </div>
            </button>

            {/* Option 2: Share via Apps */}
            <button
              type="button"
              onClick={handleShareApps}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 transition-all flex items-center justify-between gap-3 text-right cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white block">
                    {language === 'ar' ? 'مشاركة عبر التطبيقات (Share)' : 'Share via Apps'}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    {language === 'ar' 
                      ? 'إرسال النسخة عبر الواتساب، التلغرام، البريد، أو التخزين السحابي'
                      : 'Send backup file via WhatsApp, Telegram, Email, or Cloud Storage'}
                  </span>
                </div>
              </div>
            </button>

            {/* Option 3: Direct Download to Downloads */}
            <button
              type="button"
              onClick={handleDirectDownload}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 transition-all flex items-center justify-between gap-3 text-right cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white block">
                    {language === 'ar' ? 'تنزيل مباشر إلى مجلد التنزيلات' : 'Direct Download to Downloads'}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    {language === 'ar' ? 'حفظ الملف فوراً في مجلد التنزيلات الافتراضي' : 'Save file directly into your browser default downloads folder'}
                  </span>
                </div>
              </div>
            </button>

            {/* Option 4: Copy JSON Text */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 transition-all flex items-center justify-between gap-3 text-right cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${copied ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-white/10 text-neutral-800 dark:text-neutral-200'}`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white block">
                    {copied 
                      ? (language === 'ar' ? 'تم النسخ إلى الحافظة!' : 'Copied to Clipboard!') 
                      : (language === 'ar' ? 'نسخ محتوى النسخة كـ JSON' : 'Copy Backup as JSON')}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    {language === 'ar' ? 'نسخ النص البرمجي الكامل للنسخة ولصقه في الملاحظات' : 'Copy entire raw backup string to paste in notes or text files'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
  );
}
