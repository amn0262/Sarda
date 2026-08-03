'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Trash2, RotateCcw, AlertTriangle, FileText, Folder as FolderIcon, Download, Upload, Globe } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const { folders, stories, restoreFromTrash, permanentDelete, emptyTrash, importData, language, setLanguage } = useStore();
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

  // Full Backup Export handler
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

  // Full Backup Import handler
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t('settingsTitle', language)}
        </h1>
        <p className="text-slate-500">
          {t('settingsSub', language)}
        </p>
      </div>

      <div className="space-y-6">
        {/* Language & Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('appPreferences', language)}
              </h2>
              <p className="text-sm text-slate-500">
                {t('appPreferencesSub', language)}
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="font-medium text-slate-900">
                {t('appLanguage', language)}
              </span>
              <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-lg">
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${language === 'ar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >{t('arabic', language)}</button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Portability (Backup & Restore) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('dataSync', language)}
              </h2>
              <p className="text-sm text-slate-500">
                {t('dataSyncSub', language)}
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportBackup}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 border border-slate-200/60 rounded-xl transition-all space-y-3 group text-slate-700"
            >
              <Download className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <div className="text-center">
                <span className="text-sm font-bold block mb-1">
                  {t('exportBackup', language)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {t('exportBackupSub', language)}
                </span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 border border-slate-200/60 rounded-xl transition-all space-y-3 group text-slate-700"
            >
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <div className="text-center">
                <span className="text-sm font-bold block mb-1">
                  {t('importBackup', language)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('trash', language)}
              </h2>
              <p className="text-sm text-slate-500">
                {t('trashSub', language)}
              </p>
            </div>
          </div>
          {hasDeletedItems && (
            <button
              onClick={() => setShowConfirmEmpty(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'ar' ? t('emptyTrash', language) : 'Empty Trash'}
            </button>
          )}
        </div>

        <div className="p-6">
          {!hasDeletedItems ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">{t('trashEmpty', language)}</h3>
              <p className="text-sm text-slate-500">{t('trashEmptySub', language)}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Deleted Folders */}
              {deletedFolders.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-slate-400" />{t('deletedFolders', language)}</h3>
                  <div className="grid gap-3">
                    {deletedFolders.map(folder => (
                      <div key={folder.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FolderIcon className="w-5 h-5 text-indigo-400" />
                          <span className="font-medium text-slate-900">{folder.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => restoreFromTrash(folder.id, 'folder')}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('restore', language)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToPermanentDelete({ id: folder.id, type: 'folder' })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('permanentDelete', language)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deleted Stories */}
              {deletedStories.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 mt-6">
                    <FileText className="w-4 h-4 text-slate-400" />{t('deletedStories', language)}</h3>
                  <div className="grid gap-3">
                    {deletedStories.map(story => (
                      <div key={story.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{story.title || t('untitledStory', language)}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(story.updatedAt).toLocaleDateString('ar', { numberingSystem: 'latn' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => restoreFromTrash(story.id, 'story')}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('restore', language)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToPermanentDelete({ id: story.id, type: 'story' })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('permanentDelete', language)}
                          >
                            <Trash2 className="w-4 h-4" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('emptyTrashTitle', language)}</h3>
                <p className="text-sm text-slate-500 mb-6">{t('emptyTrashSub', language)}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleEmptyTrash}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >{t('emptyTrash', language)}</button>
                  <button
                    onClick={() => setShowConfirmEmpty(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >{t('cancel', language)}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToPermanentDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('confirmPermanentDeleteTitle', language)}</h3>
                <p className="text-sm text-slate-500 mb-6">{t('confirmPermanentDeleteSub', language)}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      permanentDelete(itemToPermanentDelete.id, itemToPermanentDelete.type);
                      setItemToPermanentDelete(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >{t('permanentDelete', language)}</button>
                  <button
                    onClick={() => setItemToPermanentDelete(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >{t('cancel', language)}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
