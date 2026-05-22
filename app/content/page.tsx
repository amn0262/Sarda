'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { FolderPlus, Folder as FolderIcon, MoreVertical, Trash2, Edit2, FileText, Plus, Calendar, Clock, Search, LayoutGrid, AlignJustify, Filter, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ContentManager() {
  const { folders, stories, addFolder, deleteFolder, updateFolder, deleteStory } = useStore();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [showPreviewText, setShowPreviewText] = useState(true);

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
  const folderStories = stories
    .filter(s => s.folderId === selectedFolderId)
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(s => statusFilter === 'all' || s.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40';
      case 'ready': return 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40';
      case 'published': return 'bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-705';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'ready': return 'جاهز للنشر';
      case 'published': return 'منشور';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full transition-colors">
      {/* Folders Sidebar */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 ${selectedFolder ? 'hidden md:flex' : 'flex h-full'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">المجلدات</h2>
          <button
            onClick={() => setIsAddingFolder(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAddingFolder(false);
                    setNewFolderName('');
                  }
                }}
                placeholder="اسم المجلد... (اضغط Enter للحفظ)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </form>
          )}

          {folders.length === 0 && !isAddingFolder && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
              لا توجد مجلدات. أضف مجلداً للبدء.
            </div>
          )}

          {folders.map(folder => {
            const storyCount = stories.filter(s => s.folderId === folder.id).length;
            return (
            <div
              key={folder.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                selectedFolderId === folder.id ? 'bg-indigo-50/75 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
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
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingFolderId(null);
                      }
                    }}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-905 border border-indigo-300 dark:border-indigo-900 rounded focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                </form>
              ) : (
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <FolderIcon className={`w-5 h-5 shrink-0 ${selectedFolderId === folder.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className={`truncate text-sm font-semibold ${selectedFolderId === folder.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {folder.name}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full mr-auto font-medium ${selectedFolderId === folder.id ? 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {storyCount}
                  </span>
                </div>
              )}

              <div className="flex items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditFolderName(folder.name);
                    setEditingFolderId(folder.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-650 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="تعديل اسم المجلد"
                >
                  <Edit2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('هل أنت متأكد من حذف هذا المجلد وجميع القصص بداخله؟')) {
                      deleteFolder(folder.id);
                      if (selectedFolderId === folder.id) setSelectedFolderId(null);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="حذف المجلد"
                >
                  <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Stories Area */}
      <div className={`flex-1 bg-slate-50 dark:bg-slate-950/40 h-full overflow-y-auto ${!selectedFolder ? 'hidden md:block' : 'block'}`}>
        {selectedFolder ? (
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button 
                    onClick={() => setSelectedFolderId(null)}
                    className="md:hidden p-1 -mr-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-50">{selectedFolder.name}</h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{folderStories.length} قصة</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  
                  {/* Search box */}
                  <div className="relative flex-1 sm:flex-none sm:w-44 md:w-56">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث في القصص..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  
                  {/* Status selection */}
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-3 pr-9 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="draft">مسودة</option>
                      <option value="ready">جاهز للنشر</option>
                      <option value="published">منشور</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* View Modes & Text option toggles */}
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-1 shrink-0">
                    
                    {/* OPTION: Toggle Preview Story Text directly, satisfying User request */}
                    <button
                      onClick={() => setShowPreviewText(!showPreviewText)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showPreviewText ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
                      title={showPreviewText ? "إخفاء معاينة نصوص القصص" : "عرض معاينة نصوص القصص"}
                    >
                      {showPreviewText ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'detailed' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-405'}`}
                      title="عرض مفصل"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'compact' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-405'}`}
                      title="عرض مدمج"
                    >
                      <AlignJustify className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Link
                  href={`/editor/new?folderId=${selectedFolder.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm w-full sm:w-auto shrink-0 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  قصة جديدة
                </Link>
              </div>
            </div>

            {folderStories.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-750 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-150 mb-2">لا توجد قصص هنا</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">ابدأ بكتابة قصتك الأولى في هذا المجلد.</p>
                <Link
                  href={`/editor/new?folderId=${selectedFolder.id}`}
                  className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء قصة
                </Link>
              </div>
            ) : viewMode === 'detailed' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {folderStories.map((story) => (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group relative flex flex-col min-h-[220px] max-h-[300px] overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3 shrink-0">
                        <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusColor(story.status)}`}>
                          {getStatusText(story.status)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/editor/${story.id}`}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            title="تعديل القصة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm('هل أنت متأكد من حذف هذه القصة؟')) {
                                deleteStory(story.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            title="حذف القصة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <Link href={`/editor/${story.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {story.title || 'بدون عنوان'}
                        </h3>
                      </Link>
                      
                      {/* CONDITIONAL RENDERING: preview text toggles based on showPreviewText selection */}
                      {showPreviewText ? (
                        <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-3 mb-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: story.content || 'لا يوجد محتوى...' }} />
                      ) : (
                        <div className="mb-auto text-xs text-slate-400 dark:text-slate-500">تم إخفاء معاينة النص</div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{story.targetDate ? format(new Date(story.targetDate), 'dd MMM yyyy', { locale: ar }) : 'غير محدد'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {folderStories.map((story) => (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-colors group flex items-center justify-between"
                    >
                      <Link href={`/editor/${story.id}`} className="flex-1 font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate text-sm">
                        {story.title || 'بدون عنوان'}
                      </Link>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity mr-4 shrink-0">
                        <Link
                          href={`/editor/${story.id}`}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          title="تعديل القصة"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm('هل أنت متأكد من حذف هذه القصة؟')) {
                              deleteStory(story.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          title="حذف القصة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 flex-col gap-4">
            <FolderIcon className="w-16 h-16 text-slate-250 dark:text-slate-805" />
            <p className="text-sm md:text-base">اختر مجلداً لاستعراض القصص والملفات</p>
          </div>
        )}
      </div>
    </div>
  );
}
