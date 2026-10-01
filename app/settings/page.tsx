'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  Trash2, 
  RotateCcw, 
  FileText, 
  Folder as FolderIcon, 
  Download, 
  Upload, 
  Globe, 
  Sparkles, 
  Heart, 
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Palette
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const { 
    folders, 
    stories, 
    restoreFromTrash, 
    permanentDelete, 
    emptyTrash, 
    importData, 
    language, 
    setLanguage,
    theme,
    setTheme,
    startTour,
    setIsSupportGateOpen
  } = useStore();
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [itemToPermanentDelete, setItemToPermanentDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const deletedFolders = folders.filter(f => f.isDeleted);
  const deletedStories = stories.filter(s => s.isDeleted);
  const hasDeletedItems = deletedFolders.length > 0 || deletedStories.length > 0;

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  const handleEmptyTrash = () => {
    emptyTrash();
    setShowConfirmEmpty(false);
  };

  const handleExportBackup = () => {
    const backupData = { folders, stories };
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `sarda_backup_${dateStr}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();

    setToast({
      type: 'success',
      message: language === 'ar' ? 'تم تنزيل النسخة الاحتياطية بنجاح' : 'Backup exported successfully'
    });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.folders && json.stories) {
          importData(json);
          setToast({
            type: 'success',
            message: t('backupImportSuccess', language)
          });
        } else {
          setToast({
            type: 'error',
            message: t('backupImportInvalid', language)
          });
        }
      } catch {
        setToast({
          type: 'error',
          message: t('backupImportError', language)
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full bg-[#F5F5F7] dark:bg-[#121214] min-h-screen text-neutral-900 dark:text-neutral-100 space-y-6 pb-36 md:pb-16 select-none relative">
      
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
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 ms-1 cursor-pointer">
              <span className="text-xs">✕</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Page Header */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('settingsTitle', language)}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
            {t('settingsSub', language)}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        
        {/* Section 1: Appearance & Display Theme */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">
                  {t('appearance', language)}
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t('appearanceSub', language)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-neutral-50 dark:bg-[#252528] rounded-xl border border-black/5 dark:border-white/10">
              <div>
                <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white block">
                  {language === 'ar' ? 'نمط الواجهة المعتمد' : 'System Theme'}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {language === 'ar'
                    ? 'اختر بين المظهر الداكن أو الفاتح أو التكيف التلقائي مع النظام'
                    : 'Choose between Dark, Light, or automatic system matching'}
                </span>
              </div>

              {/* Apple-style Segmented Theme Pill Control */}
              <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-black/40 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('themeLight', language)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('themeDark', language)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                    theme === 'system'
                      ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>{t('themeSystem', language)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Language & Preferences */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">
                  {t('appPreferences', language)}
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t('appPreferencesSub', language)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between gap-3 p-3 bg-neutral-50 dark:bg-[#252528] rounded-xl border border-black/5 dark:border-white/10">
              <div>
                <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white block">
                  {t('appLanguage', language)}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {language === 'ar' ? 'اختر لغة واجهة النظام المعتمدة' : 'Select system display language'}
                </span>
              </div>

              {/* Segmented Control Pill */}
              <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-black/40 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-semibold cursor-pointer ${
                    language === 'ar'
                      ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {t('arabic', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-semibold cursor-pointer ${
                    language === 'en'
                      ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Onboarding & Developer Support */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">
                {language === 'ar' ? 'المساعدة والدعم' : 'Help & Support'}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {language === 'ar' ? 'جولة الاستكشاف والتعرف على مميزات المنصة' : 'Onboarding walkthrough and developer support'}
              </p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => startTour()}
              className="p-3.5 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-900 dark:text-white block group-hover:text-neutral-900 dark:group-hover:text-white">
                    {t('restartTour', language)}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {t('tourSub', language)}
                  </span>
                </div>
              </div>
              <ChevronIcon className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => setIsSupportGateOpen(true)}
              className="p-3.5 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                    {t('openSupportGate', language)}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {t('supportGateTitle', language)}
                  </span>
                </div>
              </div>
              <ChevronIcon className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Section 4: Data & Offline Backup */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">
                {t('dataSync', language)}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t('dataSyncSub', language)}
              </p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="p-3.5 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                  {t('exportBackup', language)}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {t('exportBackupSub', language)}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100/70 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                  {t('importBackup', language)}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {t('importBackupSub', language)}
                </span>
              </div>
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Section 5: Trash Bin */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">
                  {t('trash', language)}
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t('trashSub', language)}
                </p>
              </div>
            </div>

            {hasDeletedItems && (
              <button
                type="button"
                onClick={() => setShowConfirmEmpty(true)}
                className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? t('emptyTrash', language) : 'Empty Trash'}</span>
              </button>
            )}
          </div>

          <div className="p-4">
            {!hasDeletedItems ? (
              <div className="text-center py-10 text-neutral-500 dark:text-neutral-400 text-xs space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#252528] flex items-center justify-center mx-auto text-neutral-400 dark:text-neutral-500">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">{t('trashEmpty', language)}</h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{t('trashEmptySub', language)}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Deleted Folders */}
                {deletedFolders.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('deletedFolders', language)} ({deletedFolders.length})</span>
                    </h3>
                    <div className="grid gap-2">
                      {deletedFolders.map(folder => (
                        <div key={folder.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/70 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl text-xs transition-colors">
                          <div className="flex items-center gap-2.5">
                            <FolderIcon className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-neutral-900 dark:text-white">{folder.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => restoreFromTrash(folder.id, 'folder')}
                              className="p-1.5 hover:bg-white dark:hover:bg-[#3A3A3C] text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title={t('restore', language)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToPermanentDelete({ id: folder.id, type: 'folder' })}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title={t('permanentDelete', language)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deleted Stories */}
                {deletedStories.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                      <span>{t('deletedStories', language)} ({deletedStories.length})</span>
                    </h3>
                    <div className="grid gap-2">
                      {deletedStories.map(story => (
                        <div key={story.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/70 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl text-xs transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                            <span className="font-bold text-neutral-900 dark:text-white truncate">{story.title || t('untitledStory', language)}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => restoreFromTrash(story.id, 'story')}
                              className="p-1.5 hover:bg-white dark:hover:bg-[#3A3A3C] text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title={t('restore', language)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToPermanentDelete({ id: story.id, type: 'story' })}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title={t('permanentDelete', language)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Empty Trash Confirmation Modal - macOS Alert Dialog */}
      <AnimatePresence>
        {showConfirmEmpty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-[#1C1C1E] backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{t('emptyTrashTitle', language)}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{t('emptyTrashSub', language)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  {t('emptyTrash', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmEmpty(false)}
                  className="flex-1 bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 py-2 rounded-xl font-semibold text-xs border border-black/5 dark:border-white/10 transition-colors cursor-pointer active:scale-95"
                >
                  {t('cancel', language)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permanent Delete Confirmation Modal - macOS Alert Dialog */}
      <AnimatePresence>
        {itemToPermanentDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-[#1C1C1E] backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{t('confirmPermanentDeleteTitle', language)}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{t('confirmPermanentDeleteSub', language)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    permanentDelete(itemToPermanentDelete.id, itemToPermanentDelete.type);
                    setItemToPermanentDelete(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  {t('permanentDelete', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setItemToPermanentDelete(null)}
                  className="flex-1 bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 py-2 rounded-xl font-semibold text-xs border border-black/5 dark:border-white/10 transition-colors cursor-pointer active:scale-95"
                >
                  {t('cancel', language)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
