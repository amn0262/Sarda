'use client';
import { t } from "@/lib/i18n";
import { useState, useMemo } from 'react';
import { useStore, Story, Folder as FolderType } from '@/lib/store';
import { FolderPlus, Folder as FolderIcon, Trash2, Edit2, FileText, Plus, Calendar, Clock, FileDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function ContentManager() {
  const { folders, stories, addFolder, updateFolder, deleteStory, moveToTrash, language } = useStore();
  
  const activeFolders = useMemo(() => folders.filter(f => !f.isDeleted), [folders]);
  const activeStories = useMemo(() => stories.filter(s => !s.isDeleted), [stories]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  // Folder Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderForm, setFolderForm] = useState({ name: '', color: COLORS[0], parentId: '' });

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);

  const openAddFolder = (parentId?: string) => {
    setEditingFolderId(null);
    setFolderForm({ name: '', color: COLORS[0], parentId: parentId || (selectedFolderId || '') });
    setIsFolderModalOpen(true);
  };

  const openEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setFolderForm({ name: folder.name, color: folder.color || COLORS[0], parentId: folder.parentId || '' });
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderForm.name.trim()) {
      if (editingFolderId) {
        updateFolder(editingFolderId, { 
          name: folderForm.name.trim(), 
          color: folderForm.color,
          parentId: folderForm.parentId || null
        });
      } else {
        addFolder(folderForm.name.trim(), folderForm.color, folderForm.parentId || null);
      }
      setIsFolderModalOpen(false);
    }
  };

  const selectedFolder = activeFolders.find(f => f.id === selectedFolderId);

  // Subfolders of the selected folder
  const currentSubFolders = activeFolders.filter(f => f.parentId === (selectedFolderId || null));
  // Root folders for the sidebar
  const rootFolders = activeFolders.filter(f => !f.parentId);

  // Get breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: FolderType[] = [];
    let currentId = selectedFolderId;
    while (currentId) {
      const f = activeFolders.find(x => x.id === currentId);
      if (f) {
        crumbs.unshift(f);
        currentId = f.parentId || null;
      } else {
        break;
      }
    }
    return crumbs;
  }, [selectedFolderId, activeFolders]);

  const folderStories = useMemo(() => {
    if (!selectedFolderId) return [];
    
    let filtered = activeStories.filter(s => s.folderId === selectedFolderId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) || 
        (s.content && s.content.toLowerCase().includes(q))
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(s => new Date(s.createdAt).getFullYear().toString() === selectedYear);
    }
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      filtered = filtered.filter(s => new Date(s.createdAt).getMonth().toString() === selectedMonth);
    }
    
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [activeStories, selectedFolderId, searchQuery, selectedYear, selectedMonth, selectedStatus]);

  const availableYears = useMemo(() => {
    if (!selectedFolderId) return [];
    const storiesInFolder = activeStories.filter(s => s.folderId === selectedFolderId);
    const years = new Set(storiesInFolder.map(s => new Date(s.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [activeStories, selectedFolderId]);

  const availableMonths = useMemo(() => {
    if (!selectedFolderId || selectedYear === 'all') return [];
    const storiesInFolder = activeStories.filter(s => s.folderId === selectedFolderId);
    const months = new Set(
      storiesInFolder
        .filter(s => new Date(s.createdAt).getFullYear().toString() === selectedYear)
        .map(s => new Date(s.createdAt).getMonth())
    );
    return Array.from(months).sort((a, b) => b - a);
  }, [activeStories, selectedFolderId, selectedYear]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ready': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'published': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
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

  const handleExportFolderWord = () => {
    if (!selectedFolder || folderStories.length === 0) return;
    
    let content = `
      <html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>${selectedFolder.name}</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
          <h1 style="text-align: center; margin-bottom: 30px;">${selectedFolder.name}</h1>
    `;

    folderStories.forEach((story, idx) => {
      const formattedDate = story.targetDate ? new Date(story.targetDate).toLocaleDateString(language, {
        numberingSystem: 'latn',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : (language === 'ar' ? 'غير محدد' : 'Not specified');

      const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

      content += `
        <div style="page-break-before: ${idx > 0 ? 'always' : 'auto'}; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px;">
          <h2>${story.title || t('untitledStory', language)}</h2>
          <div style="color: #666; font-size: 12px; margin-bottom: 20px;">
            <p><strong>${t('publishStatusLabel', language)}:</strong> ${statusText}</p>
            <p><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</p>
          </div>
          <div style="line-height: 1.6;">
            ${story.content || ''}
          </div>
        </div>
      `;
    });

    content += `
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFolder.name}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-73px)]">
      {/* Sidebar - Folders */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-slate-200 bg-slate-50/50 flex flex-col h-1/3 md:h-full shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900">{t('contentManager', language)}</h2>
            <button
              onClick={() => openAddFolder()}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title={t('createFolder', language)}
            >
              <FolderPlus className="w-4 h-4" />
              <span>{t('createFolder', language)}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500">{t('addFolderStart', language)}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {rootFolders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FolderIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">{t('noFolders', language)}</p>
            </div>
          ) : (
            rootFolders.map((folder) => {
              const count = activeStories.filter(s => s.folderId === folder.id).length;
              const hasSub = activeFolders.some(f => f.parentId === folder.id);
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedFolderId === folder.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FolderIcon className="w-5 h-5 shrink-0" style={{ color: selectedFolderId === folder.id ? '#fff' : (folder.color || COLORS[0]) }} />
                    <span className="font-medium text-sm truncate text-right">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedFolderId === folder.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count} {t('storiesText', language)}
                    </span>
                    {hasSub && <ChevronIcon className="w-4 h-4 opacity-70" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        {selectedFolderId && selectedFolder ? (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            
            {/* Header & Breadcrumbs */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-4 overflow-x-auto pb-2">
                <button onClick={() => setSelectedFolderId(null)} className="hover:text-indigo-600 whitespace-nowrap">
                  {t('foldersAndQuickAccess', language)}
                </button>
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.id} className="flex items-center gap-2 whitespace-nowrap">
                    <ChevronIcon className="w-4 h-4" />
                    <button 
                      onClick={() => setSelectedFolderId(crumb.id)}
                      className={`hover:text-indigo-600 flex items-center gap-1.5 ${idx === breadcrumbs.length - 1 ? 'font-bold text-slate-900' : ''}`}
                    >
                      <FolderIcon className="w-4 h-4" style={{ color: crumb.color || COLORS[0] }} />
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl shrink-0" style={{ backgroundColor: `${selectedFolder.color || COLORS[0]}15`, color: selectedFolder.color || COLORS[0] }}>
                    <FolderIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">{selectedFolder.name}</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">
                      {folderStories.length} {t('storiesText', language)} • {currentSubFolders.length} {t('subFolders', language)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Create Subfolder Action */}
                  <button
                    onClick={() => openAddFolder(selectedFolder.id)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-medium text-xs md:text-sm transition-colors flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>{t('createSubFolder', language)}</span>
                  </button>

                  <button
                    onClick={() => openEditFolder(selectedFolder)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                    title={t('editFolder', language)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setItemToDelete({ id: selectedFolder.id, type: 'folder' })}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                    title={t('moveToTrash', language)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subfolders Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">{t('subFolders', language)}</h3>
                <button
                  onClick={() => openAddFolder(selectedFolder.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('createSubFolder', language)}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Add Subfolder Card */}
                <button
                  onClick={() => openAddFolder(selectedFolder.id)}
                  className="p-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 transition-all flex flex-col items-center justify-center gap-2 text-indigo-600 min-h-[90px]"
                >
                  <FolderPlus className="w-5 h-5" />
                  <span className="text-xs font-bold">{t('createSubFolder', language)}</span>
                </button>

                {currentSubFolders.map(sub => {
                  const count = activeStories.filter(s => s.folderId === sub.id).length;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedFolderId(sub.id)}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-right flex flex-col items-start gap-3 min-h-[90px]"
                    >
                      <div className="w-full flex items-center justify-between">
                        <FolderIcon className="w-5 h-5" style={{ color: sub.color || COLORS[0] }} />
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{count}</span>
                      </div>
                      <span className="font-bold text-sm text-slate-800 line-clamp-1">{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Toolbar for Stories */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
              
              {/* Left Side: Search + Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchStoriesPlaceholder', language)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Filters Dropdown Group */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <Filter className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
                    
                    {/* Status Filter */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 py-1 cursor-pointer"
                    >
                      <option value="all">{t('allStatuses', language)}</option>
                      <option value="draft">{t('draft', language)}</option>
                      <option value="ready">{t('readyToPublish', language)}</option>
                      <option value="published">{t('published', language)}</option>
                    </select>

                    <div className="h-4 w-[1px] bg-slate-200" />

                    {/* Year Filter */}
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setSelectedMonth('all');
                      }}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 py-1 cursor-pointer"
                    >
                      <option value="all">{t('allYears', language)}</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>

                    {/* Month Filter */}
                    {selectedYear !== 'all' && (
                      <>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 py-1 cursor-pointer"
                        >
                          <option value="all">{t('allMonths', language)}</option>
                          {availableMonths.map(month => (
                            <option key={month} value={month}>{new Date(2000, month, 1).toLocaleDateString(language, { month: 'long' })}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportFolderWord}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors text-xs"
                  title={t('downloadWord', language)}
                >
                  <FileDown className="w-4 h-4 text-indigo-600" />
                  <span>{t('downloadWord', language)}</span>
                </button>
                <Link
                  href={`/editor/new?folderId=${selectedFolder.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('createStory', language)}</span>
                </Link>
              </div>
            </div>

            {/* Stories Grid */}
            {folderStories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noStoriesHere', language)}</h3>
                <p className="text-slate-500 mb-6 text-sm">{t('startWritingInFolder', language)}</p>
                <Link
                  href={`/editor/new?folderId=${selectedFolder.id}`}
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 text-sm"
                >
                  <Plus className="w-4 h-4" />{t('createStory', language)}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {folderStories.map((story) => (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${getStatusColor(story.status)}`}>
                            {getStatusText(story.status)}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
                        
                        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2">
                          {story.title || t('untitledStory', language)}
                        </h3>
                        
                        <div className="text-slate-500 text-xs line-clamp-2 mb-4" dangerouslySetInnerHTML={{ __html: story.content || t('noContentYet', language) }} />
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{story.targetDate ? new Date(story.targetDate).toLocaleDateString(language, { numberingSystem: 'latn', day: 'numeric', month: 'short', year: 'numeric' }) : '---'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
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
          <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-4 p-8">
            <FolderIcon className="w-16 h-16 text-slate-200" />
            <p className="text-base md:text-lg text-center">{t('selectFolderToView', language)}</p>
          </div>
        )}
      </div>

      {/* Trash Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
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

      {/* Folder Creation/Edit Modal */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <form onSubmit={handleSaveFolder} className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {editingFolderId ? t('editFolder', language) : t('createFolder', language)}
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('folderName', language)}</label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={folderForm.name}
                      onChange={e => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('folderColor', language)}</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFolderForm(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${folderForm.color === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('parentFolder', language)}</label>
                    <select
                      value={folderForm.parentId}
                      onChange={e => setFolderForm(prev => ({ ...prev, parentId: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                    >
                      <option value="">{t('none', language)}</option>
                      {activeFolders
                        .filter(f => f.id !== editingFolderId)
                        .map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    {t('save', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFolderModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    {t('cancel', language)}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
