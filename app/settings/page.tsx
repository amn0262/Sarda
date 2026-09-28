'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Trash2, RotateCcw, AlertTriangle, FileText, Folder as FolderIcon, Download, Upload, Globe, Sparkles, Heart, PlayCircle } from 'lucide-react';
import { useState, useRef } from 'react';
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
    startTour,
    setIsSupportGateOpen
  } = useStore();
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [itemToPermanentDelete, setItemToPermanentDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);
  const fileInputRef = useRef<any>(null);

  const deletedFolders = folders.filter(f => f.isDeleted);
  const deletedStories = stories.filter(s => s.isDeleted);
  const hasDeletedItems = deletedFolders.length > 0 || deletedStories.length > 0;

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
  };

  const handleImportBackup = (e: React.ChangeEvent<any>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.folders && json.stories) {
          importData(json);
          alert(t('backupImportSuccess', language));
        } else {
          alert(t('backupImportInvalid', language));
        }
      } catch (error) {
        alert(t('backupImportError', language));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-3 md:p-5 max-w-5xl mx-auto w-full bg-neutral-100 min-h-screen text-neutral-900 space-y-3">
      {/* Header */}
      <div className="border-b border-neutral-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900 font-serif">
          {t('settingsTitle', language)}
        </h1>
        <p className="text-neutral-500 text-xs">
          {t('settingsSub', language)}
        </p>
      </div>

      <div className="space-y-3">
        {/* Language & Preferences */}
        <div className="bg-white rounded-none border border-neutral-300 shadow-2xs">
          <div className="p-3 border-b border-neutral-200 flex items-center gap-2">
            <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">
                {t('appPreferences', language)}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {t('appPreferencesSub', language)}
              </p>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-none text-xs">
              <span className="font-bold text-neutral-900">
                {t('appLanguage', language)}
              </span>
              <div className="flex items-center gap-1 bg-neutral-200 p-0.5 rounded-none border border-neutral-300">
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-1 text-xs font-bold rounded-none transition-colors ${language === 'ar' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'}`}
                >
                  {t('arabic', language)}
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-none transition-colors ${language === 'en' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black'}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Tour & Support Modal Controls */}
        <div className="bg-white rounded-none border border-neutral-300 shadow-2xs">
          <div className="p-3 border-b border-neutral-200 flex items-center gap-2">
            <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">
                {language === 'ar' ? 'المساعدة والدعم وجولة التعريف' : 'Help, Support & Tour'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {language === 'ar' ? 'إعادة تشغيل الجولة التعريفية أو فتح نافذة الاشتراك ودعم المطور' : 'Replay the onboarding tour or open support dialog'}
              </p>
            </div>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => startTour()}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-none flex items-center gap-2.5 transition-colors text-right"
            >
              <div className="p-2 bg-neutral-100 border border-neutral-300 text-black rounded-none">
                <PlayCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 block font-serif">
                  {t('restartTour', language)}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {t('tourSub', language)}
                </span>
              </div>
            </button>

            <button
              onClick={() => setIsSupportGateOpen(true)}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-none flex items-center gap-2.5 transition-colors text-right"
            >
              <div className="p-2 bg-neutral-100 border border-neutral-300 text-black rounded-none">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 block font-serif">
                  {t('openSupportGate', language)}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {t('supportGateTitle', language)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Data & Backup */}
        <div className="bg-white rounded-none border border-neutral-300 shadow-2xs">
          <div className="p-3 border-b border-neutral-200 flex items-center gap-2">
            <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">
                {t('dataSync', language)}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {t('dataSyncSub', language)}
              </p>
            </div>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleExportBackup}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-none flex items-center gap-2.5 transition-colors text-right"
            >
              <div className="p-2 bg-neutral-100 border border-neutral-300 text-black rounded-none">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 block font-serif">
                  {t('exportBackup', language)}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {t('exportBackupSub', language)}
                </span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-none flex items-center gap-2.5 transition-colors text-right"
            >
              <div className="p-2 bg-neutral-100 border border-neutral-300 text-black rounded-none">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 block font-serif">
                  {t('importBackup', language)}
                </span>
                <span className="text-[10px] text-neutral-500">
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

        {/* Trash */}
        <div className="bg-white rounded-none border border-neutral-300 shadow-2xs">
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">
                  {t('trash', language)}
                </h2>
                <p className="text-[11px] text-neutral-500">
                  {t('trashSub', language)}
                </p>
              </div>
            </div>
            {hasDeletedItems && (
              <button
                onClick={() => setShowConfirmEmpty(true)}
                className="px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-400 rounded-none text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? t('emptyTrash', language) : 'Empty Trash'}</span>
              </button>
            )}
          </div>

          <div className="p-3">
            {!hasDeletedItems ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                <Trash2 className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
                <h3 className="font-bold text-neutral-800">{t('trashEmpty', language)}</h3>
                <p className="text-[11px] text-neutral-400">{t('trashEmptySub', language)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Deleted Folders */}
                {deletedFolders.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <FolderIcon className="w-3.5 h-3.5 text-neutral-700" />
                      <span>{t('deletedFolders', language)}</span>
                    </h3>
                    <div className="grid gap-1.5">
                      {deletedFolders.map(folder => (
                        <div key={folder.id} className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded-none text-xs">
                          <div className="flex items-center gap-2">
                            <FolderIcon className="w-4 h-4 text-black" />
                            <span className="font-bold text-neutral-900">{folder.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => restoreFromTrash(folder.id, 'folder')}
                              className="p-1 border border-neutral-300 text-neutral-700 hover:text-black rounded-none"
                              title={t('restore', language)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToPermanentDelete({ id: folder.id, type: 'folder' })}
                              className="p-1 border border-neutral-300 text-neutral-700 hover:text-black rounded-none"
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
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-neutral-700" />
                      <span>{t('deletedStories', language)}</span>
                    </h3>
                    <div className="grid gap-1.5">
                      {deletedStories.map(story => (
                        <div key={story.id} className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded-none text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-neutral-700 shrink-0" />
                            <span className="font-bold text-neutral-900 font-serif truncate">{story.title || t('untitledStory', language)}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => restoreFromTrash(story.id, 'story')}
                              className="p-1 border border-neutral-300 text-neutral-700 hover:text-black rounded-none"
                              title={t('restore', language)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToPermanentDelete({ id: story.id, type: 'story' })}
                              className="p-1 border border-neutral-300 text-neutral-700 hover:text-black rounded-none"
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

      {/* Empty Trash Confirmation Modal */}
      <AnimatePresence>
        {showConfirmEmpty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-none border-2 border-black shadow-2xl p-4 w-full max-w-sm space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 font-serif">{t('emptyTrashTitle', language)}</h3>
              <p className="text-xs text-neutral-600">{t('emptyTrashSub', language)}</p>
              <div className="flex gap-2 pt-2 border-t border-neutral-200">
                <button
                  onClick={handleEmptyTrash}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white py-1.5 rounded-none font-bold text-xs border border-black transition-colors"
                >
                  {t('emptyTrash', language)}
                </button>
                <button
                  onClick={() => setShowConfirmEmpty(false)}
                  className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-1.5 rounded-none font-semibold text-xs border border-neutral-300 transition-colors"
                >
                  {t('cancel', language)}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Permanent Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToPermanentDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-none border-2 border-black shadow-2xl p-4 w-full max-w-sm space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 font-serif">{t('confirmPermanentDeleteTitle', language)}</h3>
              <p className="text-xs text-neutral-600">{t('confirmPermanentDeleteSub', language)}</p>
              <div className="flex gap-2 pt-2 border-t border-neutral-200">
                <button
                  onClick={() => {
                    permanentDelete(itemToPermanentDelete.id, itemToPermanentDelete.type);
                    setItemToPermanentDelete(null);
                  }}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white py-1.5 rounded-none font-bold text-xs border border-black transition-colors"
                >
                  {t('permanentDelete', language)}
                </button>
                <button
                  onClick={() => setItemToPermanentDelete(null)}
                  className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-1.5 rounded-none font-semibold text-xs border border-neutral-300 transition-colors"
                >
                  {t('cancel', language)}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
