'use client';
import { t } from "@/lib/i18n";

import { useState, useMemo } from 'react';
import { useStore, Story } from '@/lib/store';
import { FolderPlus, Folder as FolderIcon, MoreVertical, Trash2, Edit2, FileText, Plus, Calendar, Clock, ArrowRight, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function ContentManager() {
  const { folders, stories, addFolder, deleteFolder, updateFolder, deleteStory, moveToTrash, language } = useStore();
  
  const activeFolders = folders.filter(f => !f.isDeleted);
  const activeStories = stories.filter(s => !s.isDeleted);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  
  // Filtering state
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleUpdateFolder = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editFolderName.trim()) {
      updateFolder(id, editFolderName.trim());
      setEditingFolderId(null);
    }
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const folderStoriesUnfiltered = activeStories.filter(s => s.folderId === selectedFolderId);

  // Get available years and months from the unfiltered folder stories
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    folderStoriesUnfiltered.forEach(s => {
      const date = s.targetDate ? new Date(s.targetDate) : new Date(s.updatedAt);
      years.add(date.getFullYear().toString());
    });
    return Array.from(years).sort().reverse();
  }, [folderStoriesUnfiltered]);

  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return [];
    const months = new Set<string>();
    folderStoriesUnfiltered.forEach(s => {
      const date = s.targetDate ? new Date(s.targetDate) : new Date(s.updatedAt);
      if (date.getFullYear().toString() === selectedYear) {
        months.add(date.getMonth().toString());
      }
    });
    return Array.from(months).sort((a, b) => parseInt(a) - parseInt(b));
  }, [folderStoriesUnfiltered, selectedYear]);

  const folderStories = useMemo(() => {
    return folderStoriesUnfiltered.filter(s => {
      if (selectedYear === 'all') return true;
      const date = s.targetDate ? new Date(s.targetDate) : new Date(s.updatedAt);
      if (date.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'all' && date.getMonth().toString() !== selectedMonth) return false;
      return true;
    });
  }, [folderStoriesUnfiltered, selectedYear, selectedMonth]);

  const handleExportFolderWord = () => {
    if (!selectedFolder) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' lang='ar' dir='rtl'><head><meta charset='utf-8'><title>" + selectedFolder.name + "</title></head><body style='font-family: Arial, sans-serif; text-align: right; direction: rtl;'>";
    const footer = "</body></html>";
    
    let content = `<h1 style="text-align: center; color: #333; margin-bottom: 40px; font-size: 32px;">مجلد: ${selectedFolder.name}</h1>`;
    
    folderStories.forEach((story, idx) => {
      const formattedDate = story.targetDate ? new Date(story.targetDate).toLocaleDateString('ar', {
        numberingSystem: 'latn',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'غير محدد';
      const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

      content += `
        <div style="page-break-before: ${idx > 0 ? 'always' : 'auto'}; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 24px; color: #333;">${story.title || t('untitledStory', language)}</h2>
          <p style="color: #666; font-size: 12px;">الحالة: ${statusText} | التاريخ: ${formattedDate}</p>
        </div>
        <div>
          ${story.content}
        </div>
      `;
    });

    const sourceHTML = header + content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `مجلد_${selectedFolder.name}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ready': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return t('draft', language);
      case 'ready': return t('readyToPublish', language);
      case 'published': return t('published', language);
      default: return status;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Folders Sidebar */}
      <div className={`w-full md:w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 ${
        selectedFolderId !== null ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800">المجلدات</h2>
          <button
            onClick={() => setIsAddingFolder(true)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="مجلد جديد"
          >
            <FolderPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isAddingFolder && (
            <form onSubmit={handleAddFolder} className="mb-4">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => setIsAddingFolder(false)}
                placeholder="اسم المجلد..."
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </form>
          )}

          {activeFolders.length === 0 && !isAddingFolder && (
            <div className="text-center text-slate-500 py-8 text-sm">
              لا توجد مجلدات. أضف مجلداً للبدء.
            </div>
          )}

          {activeFolders.map(folder => (
            <div
              key={folder.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                selectedFolderId === folder.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
              }`}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              {editingFolderId === folder.id ? (
                <form onSubmit={(e) => handleUpdateFolder(e, folder.id)} className="flex-1 mr-2">
                  <input
                    type="text"
                    autoFocus
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    onBlur={() => setEditingFolderId(null)}
                    className="w-full px-2 py-1 border border-indigo-300 rounded focus:outline-none text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </form>
              ) : (
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <FolderIcon className={`w-5 h-5 shrink-0 ${selectedFolderId === folder.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className={`truncate text-sm font-medium ${selectedFolderId === folder.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {folder.name}
                  </span>
                </div>
              )}

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditFolderName(folder.name);
                    setEditingFolderId(folder.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete({ id: folder.id, type: 'folder' });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stories Area */}
      <div className={`flex-1 bg-slate-50 h-full overflow-y-auto ${
        selectedFolderId === null ? 'hidden md:block' : 'block'
      }`}>
        {selectedFolder ? (
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className="md:hidden mb-3 flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm bg-indigo-50/60 px-3 py-1.5 rounded-lg transition-colors w-fit"
                >
                  <ArrowRight className="w-4 h-4" />
                  الرجوع للمجلدات
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{selectedFolder.name}</h1>
                <p className="text-slate-500 text-xs md:text-sm">{folderStories.length} قصة</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Filters */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth('all');
                    }}
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none pl-6 pr-2 py-1.5"
                  >
                    <option value="all">كل السنوات</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {selectedYear !== 'all' && (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none pl-6 pr-2 py-1.5 border-r border-slate-200"
                    >
                      <option value="all">كل الأشهر</option>
                      {availableMonths.map(month => (
                        <option key={month} value={month}>{new Date(2000, parseInt(month), 1).toLocaleDateString('ar', { month: 'long' })}</option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  onClick={handleExportFolderWord}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm text-sm"
                  title="تنزيل كامل المجلد كملف وورد"
                >
                  <FileDown className="w-4 h-4 text-blue-600" />
                  <span className="hidden md:inline">تنزيل وورد</span>
                </button>
                <Link
                  href={`/editor/new?folderId=${selectedFolder.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm text-sm self-start sm:self-auto"
                >
                  <Plus className="w-5 h-5" />
                  قصة جديدة
                </Link>
              </div>
            </div>

            {folderStories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد قصص هنا</h3>
                <p className="text-slate-500 mb-6">ابدأ بكتابة قصتك الأولى في هذا المجلد.</p>
                <Link
                  href={`/editor/new?folderId=${selectedFolder.id}`}
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
                >
                  <Plus className="w-5 h-5" />{t('createStory', language)}</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {folderStories.map((story) => (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative flex flex-col h-64"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(story.status)}`}>
                          {getStatusText(story.status)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setItemToDelete({ id: story.id, type: 'story' })}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title={t('moveToTrash', language)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/editor/${story.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                            title={t('editStory', language)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                        {story.title || 'بدون عنوان'}
                      </h3>
                      
                      <div className="text-slate-500 text-sm line-clamp-3 mb-auto" dangerouslySetInnerHTML={{ __html: story.content || 'لا يوجد محتوى...' }} />
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{story.targetDate ? new Date(story.targetDate).toLocaleDateString('ar', { numberingSystem: 'latn', day: 'numeric', month: 'short', year: 'numeric' }) : 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{story.publishTime || '--:--'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-4">
            <FolderIcon className="w-16 h-16 text-slate-200" />
            <p className="text-lg">اختر مجلداً لاستعراض القصص</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {itemToDelete && (
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('confirmTrashTitle', language)}</h3>
                <p className="text-sm text-slate-500 mb-6">{t('confirmTrashSub', language)}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      moveToTrash(itemToDelete.id, itemToDelete.type);
                      if (itemToDelete.type === 'folder' && selectedFolderId === itemToDelete.id) {
                        setSelectedFolderId(null);
                      }
                      setItemToDelete(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >{t('moveToTrash', language)}</button>
                  <button
                    onClick={() => setItemToDelete(null)}
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
