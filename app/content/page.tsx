'use client';

import { useState, useMemo } from 'react';
import { useStore, Story, Folder as FolderType } from '@/lib/store';
import { t } from "@/lib/i18n";
import { 
  FolderPlus, Folder as FolderIcon, Trash2, Edit2, FileText, Plus, 
  Calendar, Clock, FileDown, ChevronLeft, ChevronRight, Search, 
  Filter, Palette, LayoutGrid, Layers, Star, X, Check, Eye, ClipboardPaste
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function ContentManager() {
  const router = useRouter();
  const { folders, stories, addFolder, updateFolder, toggleFavorite, moveToTrash, language } = useStore();
  
  const activeFolders = useMemo(() => folders.filter(f => !f.isDeleted), [folders]);
  const activeStories = useMemo(() => stories.filter(s => !s.isDeleted), [stories]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'all' | 'favorites'>('folders');
  
  // Mobile drawer state for folders
  const [isMobileFolderDrawerOpen, setIsMobileFolderDrawerOpen] = useState(false);

  // Folder Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderForm, setFolderForm] = useState({ name: '', color: COLORS[0], parentId: '' });
  
  // Paste Modal State
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');

  // Story Reading Preview Modal
  const [readingStory, setReadingStory] = useState<Story | null>(null);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);

  const folderMap = useMemo(() => {
    const map = new Map<string, FolderType>();
    activeFolders.forEach(f => map.set(f.id, f));
    return map;
  }, [activeFolders]);

  const favoriteStories = useMemo(() => {
    return activeStories.filter(s => s.isFavorite);
  }, [activeStories]);

  const handleCreateFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert(language === 'ar' ? 'الحافظة فارغة!' : 'Clipboard is empty!');
        return;
      }
      
      localStorage.setItem('tempClipboardContent', text);
      const url = selectedFolderId ? `/editor/new?fromClipboard=true&folderId=${selectedFolderId}` : '/editor/new?fromClipboard=true';
      router.push(url);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      // Fallback: Show manual paste modal
      setIsPasteModalOpen(true);
    }
  };

  const handlePasteModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) {
      alert(language === 'ar' ? 'المحتوى فارغ!' : 'Content is empty!');
      return;
    }
    localStorage.setItem('tempClipboardContent', pasteContent);
    const url = selectedFolderId ? `/editor/new?fromClipboard=true&folderId=${selectedFolderId}` : '/editor/new?fromClipboard=true';
    setIsPasteModalOpen(false);
    setPasteContent('');
    router.push(url);
  };

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

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      moveToTrash(itemToDelete.id, itemToDelete.type);
      if (itemToDelete.type === 'folder' && selectedFolderId === itemToDelete.id) {
        setSelectedFolderId(null);
      }
      setItemToDelete(null);
    }
  };

  const selectedFolder = useMemo(() => {
    return selectedFolderId ? activeFolders.find(f => f.id === selectedFolderId) : null;
  }, [selectedFolderId, activeFolders]);

  // Subfolders of the selected folder
  const currentSubFolders = useMemo(() => {
    let subs = activeFolders.filter(f => f.parentId === (selectedFolderId || null));
    if (selectedColor !== 'all') {
      subs = subs.filter(f => f.color === selectedColor);
    }
    return subs;
  }, [activeFolders, selectedFolderId, selectedColor]);

  // Root folders for the sidebar / mobile selector
  const rootFolders = useMemo(() => {
    let list = activeFolders.filter(f => !f.parentId);
    if (selectedColor !== 'all') {
      list = list.filter(f => f.color === selectedColor);
    }
    if (searchQuery.trim() && viewMode === 'folders') {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeFolders, selectedColor, searchQuery, viewMode]);

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

  // Filtered stories depending on viewMode
  const filteredStories = useMemo(() => {
    let list: Story[] = [];

    if (viewMode === 'folders') {
      if (!selectedFolderId) return [];
      list = activeStories.filter(s => s.folderId === selectedFolderId);
    } else if (viewMode === 'favorites') {
      list = activeStories.filter(s => s.isFavorite);
    } else {
      // viewMode === 'all'
      list = [...activeStories];
      if (selectedFolderFilter !== 'all') {
        list = list.filter(s => s.folderId === selectedFolderFilter);
      }
    }

    // Filter by color
    if (selectedColor !== 'all') {
      list = list.filter(s => {
        const f = s.folderId ? folderMap.get(s.folderId) : null;
        return (f?.color || COLORS[0]) === selectedColor;
      });
    }

    // Instant Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => {
        const folderName = s.folderId ? folderMap.get(s.folderId)?.name || '' : '';
        return (
          (s.title && s.title.toLowerCase().includes(q)) || 
          (s.content && s.content.toLowerCase().includes(q)) ||
          folderName.toLowerCase().includes(q)
        );
      });
    }
    
    // Status Filter
    if (selectedStatus !== 'all') {
      list = list.filter(s => s.status === selectedStatus);
    }
    
    // Date Filters
    if (selectedYear !== 'all') {
      list = list.filter(s => new Date(s.createdAt).getFullYear().toString() === selectedYear);
    }
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      list = list.filter(s => new Date(s.createdAt).getMonth().toString() === selectedMonth);
    }
    
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [viewMode, selectedFolderId, activeStories, selectedFolderFilter, selectedColor, searchQuery, selectedStatus, selectedYear, selectedMonth, folderMap]);

  const availableYears = useMemo(() => {
    let storiesToScan = activeStories;
    if (viewMode === 'folders' && selectedFolderId) {
      storiesToScan = activeStories.filter(s => s.folderId === selectedFolderId);
    } else if (viewMode === 'favorites') {
      storiesToScan = favoriteStories;
    }
    const years = new Set(storiesToScan.map(s => new Date(s.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [activeStories, favoriteStories, viewMode, selectedFolderId]);

  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return [];
    let storiesToScan = activeStories;
    if (viewMode === 'folders' && selectedFolderId) {
      storiesToScan = activeStories.filter(s => s.folderId === selectedFolderId);
    } else if (viewMode === 'favorites') {
      storiesToScan = favoriteStories;
    }
    const months = new Set(
      storiesToScan
        .filter(s => new Date(s.createdAt).getFullYear().toString() === selectedYear)
        .map(s => new Date(s.createdAt).getMonth())
    );
    return Array.from(months).sort((a, b) => b - a);
  }, [activeStories, favoriteStories, viewMode, selectedFolderId, selectedYear]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-amber-800 bg-amber-50 border-amber-200/80';
      case 'ready': return 'text-emerald-800 bg-emerald-50 border-emerald-200/80';
      case 'published': return 'text-blue-800 bg-blue-50 border-blue-200/80';
      default: return 'text-slate-800 bg-slate-50 border-slate-200';
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
    const titleName = viewMode === 'favorites' 
      ? t('favoritesList', language)
      : (selectedFolder ? selectedFolder.name : t('allStories', language));

    if (filteredStories.length === 0) return;
    
    let content = `
      \x3Chtml lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>${titleName}</title>
        </head>
        <body style="font-family: 'Tajawal', Arial, sans-serif; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; text-align: ${language === 'ar' ? 'right' : 'left'};">
          <h1 style="text-align: center; margin-bottom: 30px; color: #1e293b;">${titleName}</h1>
    `;

    filteredStories.forEach((story, idx) => {
      const formattedDate = story.targetDate ? new Date(story.targetDate).toLocaleDateString(language, {
        numberingSystem: 'latn',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : (language === 'ar' ? 'غير محدد' : 'Not specified');

      const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

      content += `
        <div style="page-break-before: ${idx > 0 ? 'always' : 'auto'}; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #0f172a;">${story.title || t('untitledStory', language)}</h2>
          <div style="color: #64748b; font-size: 12px; margin-bottom: 20px; background-color: #f8fafc; padding: 10px; border-radius: 8px;">
            <p style="margin: 3px 0;"><strong>${t('publishStatusLabel', language)}:</strong> ${statusText}</p>
            <p style="margin: 3px 0;"><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</p>
          </div>
          <div style="line-height: 1.8; font-size: 15px; color: #334155;">
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
    a.download = `${titleName}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-65px)] bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar - Desktop & Tablet Folder Hierarchy */}
      <aside className="hidden md:flex md:w-80 border-l border-slate-200/80 bg-white/80 backdrop-blur-md flex-col h-full shrink-0 z-10 shadow-xs">
        
        {/* Sidebar Header & Main Controls */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-indigo-600" />
              <span>{t('contentManager', language)}</span>
            </h2>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreateFromClipboard}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1 text-xs font-bold shadow-xs active:scale-95"
                title={language === 'ar' ? 'إنشاء قصة من الحافظة' : 'Create from clipboard'}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
              </button>
              
              <Link
                href={selectedFolderId ? `/editor/new?folderId=${selectedFolderId}` : '/editor/new'}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-1 text-xs font-bold shadow-xs active:scale-95"
                title={t('createNewStoryBtn', language)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('createNewStoryBtn', language)}</span>
              </Link>

              <button
                onClick={() => openAddFolder()}
                className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold"
                title={t('createFolder', language)}
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => { setViewMode('folders'); }}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === 'folders'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('viewFoldersMode', language)}</span>
            </button>

            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === 'all'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('viewAllFilesMode', language)}</span>
            </button>

            <button
              onClick={() => setViewMode('favorites')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === 'favorites'
                  ? 'bg-white text-amber-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 shrink-0 fill-amber-400 text-amber-500" />
              <span className="truncate">{t('favorites', language)}</span>
              {favoriteStories.length > 0 && (
                <span className="text-[10px] px-1.5 bg-amber-100 text-amber-700 rounded-full font-bold">
                  {favoriteStories.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Folder */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث سريـع...' : 'Quick search...'}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pr-8 pl-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Sidebar Folder List */}
        {viewMode === 'folders' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {rootFolders.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">{t('noFolders', language)}</p>
              </div>
            ) : (
              rootFolders.map((folder) => {
                const count = activeStories.filter(s => s.folderId === folder.id).length;
                const isSelected = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-white text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-600 border border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderIcon 
                        className="w-4 h-4 shrink-0" 
                        style={{ color: isSelected ? '#ffffff' : (folder.color || COLORS[0]) }} 
                      />
                      <span className="text-xs truncate text-right font-medium">{folder.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        ) : viewMode === 'favorites' ? (
          /* Favorites Sidebar Summary */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{t('favoritesList', language)} ({favoriteStories.length})</span>
              </div>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                {t('favoritesDesc', language)}
              </p>
            </div>
          </div>
        ) : (
          /* All Files Sidebar Summary */
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            <button
              onClick={() => setSelectedFolderFilter('all')}
              className={`w-full text-right p-2.5 rounded-xl border transition-colors flex items-center justify-between font-medium ${
                selectedFolderFilter === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{t('allFolders', language)}</span>
              <span className="text-[10px] opacity-80">({activeStories.length})</span>
            </button>
            {activeFolders.map(f => {
              const count = activeStories.filter(s => s.folderId === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderFilter(f.id)}
                  className={`w-full text-right p-2.5 rounded-xl border transition-colors flex items-center justify-between font-medium ${
                    selectedFolderFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color || COLORS[0] }} />
                    <span className="truncate text-xs">{f.name}</span>
                  </div>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto min-w-0">
        
        {/* Mobile Header Tabs (Smooth Touch Layout for Mobile UX) */}
        <div className="md:hidden bg-white border-b border-slate-200 p-3 space-y-2.5 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold flex-1 ml-2">
              <button
                onClick={() => setViewMode('folders')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'folders' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                <FolderIcon className="w-3.5 h-3.5" />
                <span>{t('viewFoldersMode', language)}</span>
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'all' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('viewAllFilesMode', language)}</span>
              </button>
              <button
                onClick={() => setViewMode('favorites')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'favorites' ? 'bg-white text-amber-600 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{t('favorites', language)}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCreateFromClipboard}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl shadow-xs"
                title={language === 'ar' ? 'إنشاء قصة من الحافظة' : 'Create from clipboard'}
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>
              
              <Link
                href={selectedFolderId ? `/editor/new?folderId=${selectedFolderId}` : '/editor/new'}
                className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs"
                title={t('createNewStoryBtn', language)}
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Folder Selector Button */}
          {viewMode === 'folders' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileFolderDrawerOpen(true)}
                className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl border border-indigo-100 flex items-center justify-between text-xs font-bold"
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    {selectedFolder ? selectedFolder.name : (language === 'ar' ? 'اختر مجلداً...' : 'Select folder...')}
                  </span>
                </div>
                <ChevronIcon className="w-4 h-4 text-indigo-500" />
              </button>

              <button
                onClick={() => openAddFolder()}
                className="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
                title={t('createFolder', language)}
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* VIEW MODE 1: FOLDERS MODE */}
          {viewMode === 'folders' ? (
            selectedFolderId && selectedFolder ? (
              <div className="space-y-6">
                
                {/* Folder Header Banner */}
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
                    <button 
                      onClick={() => setSelectedFolderId(null)}
                      className="hover:text-indigo-600 font-medium whitespace-nowrap"
                    >
                      {t('foldersAndQuickAccess', language)}
                    </button>
                    {breadcrumbs.map((crumb, idx) => (
                      <div key={crumb.id} className="flex items-center gap-2 whitespace-nowrap">
                        <ChevronIcon className="w-3.5 h-3.5 text-slate-300" />
                        <button 
                          onClick={() => setSelectedFolderId(crumb.id)}
                          className={`hover:text-indigo-600 flex items-center gap-1.5 ${
                            idx === breadcrumbs.length - 1 ? 'font-bold text-slate-900' : 'font-medium'
                          }`}
                        >
                          <FolderIcon className="w-3.5 h-3.5" style={{ color: crumb.color || COLORS[0] }} />
                          {crumb.name}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Main Title & Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: `${selectedFolder.color || COLORS[0]}15`, color: selectedFolder.color || COLORS[0] }}
                      >
                        <FolderIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h1 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">{selectedFolder.name}</h1>
                        <p className="text-slate-500 text-xs mt-0.5 font-medium">
                          {filteredStories.length} {t('storiesText', language)} • {currentSubFolders.length} {t('subFolders', language)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openAddFolder(selectedFolder.id)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 border border-indigo-100"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>{t('createSubFolder', language)}</span>
                      </button>

                      <button
                        onClick={() => openEditFolder(selectedFolder)}
                        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-slate-200"
                        title={t('editFolder', language)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setItemToDelete({ id: selectedFolder.id, type: 'folder' })}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                        title={t('moveToTrash', language)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subfolders Grid */}
                {currentSubFolders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('subFolders', language)}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {currentSubFolders.map(sub => {
                        const count = activeStories.filter(s => s.folderId === sub.id).length;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedFolderId(sub.id)}
                            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all text-right flex flex-col justify-between gap-3 min-h-[85px] group"
                          >
                            <div className="w-full flex items-center justify-between">
                              <FolderIcon className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color: sub.color || COLORS[0] }} />
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{count}</span>
                            </div>
                            <span className="font-bold text-xs text-slate-800 line-clamp-1">{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filter & Actions Bar */}
                <StoryFilterBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  availableYears={availableYears}
                  availableMonths={availableMonths}
                  handleExportFolderWord={handleExportFolderWord}
                  newStoryUrl={`/editor/new?folderId=${selectedFolder.id}`}
                  language={language}
                />

                {/* Stories Grid */}
                <StoryGrid 
                  handleCreateFromClipboard={handleCreateFromClipboard}
                  stories={filteredStories}
                  folderMap={folderMap}
                  toggleFavorite={toggleFavorite}
                  setItemToDelete={setItemToDelete}
                  setReadingStory={setReadingStory}
                  language={language}
                  emptyMessage={t('noStoriesHere', language)}
                  emptySubText={t('startWritingInFolder', language)}
                  newStoryUrl={`/editor/new?folderId=${selectedFolder.id}`}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              </div>
            ) : (
              /* HIDDEN LOWER SECTION STATE - CLEAN PROMPT WHEN NO FOLDER IS SELECTED */
              <div className="flex items-center justify-center py-12 md:py-20 px-4">
                <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200/80 shadow-xs text-center max-w-lg space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <FolderIcon className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {t('selectFolderToViewContent', language)}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      {language === 'ar'
                        ? 'اختر مجلداً لاستعراض المستندات والقصص الفرعية الخاصة به، أو اضغط على استعراض جميع الملفات لمعاينة كل نصوصك بشكل شامل.'
                        : 'Select a folder to view its content, or click All Files to preview all your texts.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
                    <button
                      onClick={() => openAddFolder()}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>{t('createFolder', language)}</span>
                    </button>

                    <button
                      onClick={() => setViewMode('all')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{t('viewAllFilesMode', language)}</span>
                    </button>

                    <button
                      onClick={() => setViewMode('favorites')}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>{t('favorites', language)}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : viewMode === 'favorites' ? (
            /* VIEW MODE 2: FAVORITES MODE */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 md:p-6 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 shrink-0 flex items-center justify-center shadow-inner">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-amber-950">{t('favoritesList', language)}</h1>
                    <p className="text-amber-800/80 text-xs mt-0.5 font-medium">
                      {filteredStories.length} {t('storiesText', language)} {language === 'ar' ? 'محفوظة في قائمة المفضلة' : 'saved'}
                    </p>
                  </div>
                </div>

                {filteredStories.length > 0 && (
                  <button
                    onClick={handleExportFolderWord}
                    className="px-3 py-2 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    <FileDown className="w-4 h-4 text-amber-600" />
                    <span>{t('downloadWord', language)}</span>
                  </button>
                )}
              </div>

              {/* Stories Grid */}
              <StoryGrid 
                  handleCreateFromClipboard={handleCreateFromClipboard}
                stories={filteredStories}
                folderMap={folderMap}
                toggleFavorite={toggleFavorite}
                setItemToDelete={setItemToDelete}
                setReadingStory={setReadingStory}
                language={language}
                emptyMessage={t('noFavoritesYet', language)}
                emptySubText={t('noFavoritesSub', language)}
                newStoryUrl="/editor/new"
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            </div>
          ) : (
            /* VIEW MODE 3: ALL FILES MODE */
            <div className="space-y-6">
              {/* All Files Banner */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0 flex items-center justify-center shadow-inner">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('viewAllFilesMode', language)}</h1>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">
                      {filteredStories.length} {t('storiesText', language)} {language === 'ar' ? 'في جميع المجلدات' : 'in total'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportFolderWord}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4 text-indigo-600" />
                    <span>{t('downloadWord', language)}</span>
                  </button>

                  <button
                    onClick={handleCreateFromClipboard}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    <span>{language === 'ar' ? 'من الحافظة' : 'From Clipboard'}</span>
                  </button>
                  <Link
                    href="/editor/new"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('createNewStoryBtn', language)}</span>
                  </Link>
                </div>
              </div>

              {/* Filter & Actions Bar */}
              <StoryFilterBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedFolderFilter={selectedFolderFilter}
                setSelectedFolderFilter={setSelectedFolderFilter}
                activeFolders={activeFolders}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                availableYears={availableYears}
                availableMonths={availableMonths}
                handleExportFolderWord={handleExportFolderWord}
                newStoryUrl="/editor/new"
                language={language}
              />

              {/* Stories Grid */}
              <StoryGrid 
                  handleCreateFromClipboard={handleCreateFromClipboard}
                stories={filteredStories}
                folderMap={folderMap}
                toggleFavorite={toggleFavorite}
                setItemToDelete={setItemToDelete}
                setReadingStory={setReadingStory}
                language={language}
                emptyMessage={t('noStoriesHere', language)}
                emptySubText={language === 'ar' ? 'لم يتم العثور على قصص مطابقة للفلترة.' : 'No stories found matching filters.'}
                newStoryUrl="/editor/new"
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            </div>
          )}

        </div>
      </main>

      {/* Mobile Folder Selector Drawer / Modal */}
      {isMobileFolderDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[80vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">{t('foldersAndQuickAccess', language)}</h3>
              <button 
                onClick={() => setIsMobileFolderDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {rootFolders.map((folder) => {
                const count = activeStories.filter(s => s.folderId === folder.id).length;
                const isSelected = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setSelectedFolderId(folder.id);
                      setIsMobileFolderDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderIcon className="w-4 h-4 shrink-0" style={{ color: isSelected ? '#fff' : (folder.color || COLORS[0]) }} />
                      <span className="text-xs truncate">{folder.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Story Quick Reader Modal */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${getStatusColor(readingStory.status)}`}>
                  {getStatusText(readingStory.status)}
                </span>
                <h3 className="font-bold text-slate-900 text-base truncate">{readingStory.title || t('untitledStory', language)}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleFavorite(readingStory.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    readingStory.isFavorite ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-slate-100 text-slate-400'
                  }`}
                  title={t('favorites', language)}
                >
                  <Star className={`w-4 h-4 ${readingStory.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
                <Link
                  href={`/editor/${readingStory.id}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('editStory', language)}</span>
                </Link>
                <button
                  onClick={() => setReadingStory(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 leading-relaxed text-slate-800 text-sm md:text-base prose max-w-none" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: readingStory.content || `<p class="text-slate-400">${t('noContentYet', language)}</p>` }} />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{readingStory.targetDate || '---'}</span>
              </div>
              <button
                onClick={() => setReadingStory(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t('moveToTrash', language)}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar' ? 'هل أنت تأكد من نقل هذا العنصر إلى سلة المهملات؟' : 'Are you sure you want to move this item to trash?'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                {t('moveToTrash', language)}
              </button>
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form onSubmit={handlePasteModalSubmit} className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'ar' ? 'لصق المحتوى يدوياً' : 'Paste Content Manually'}
              </h3>
              <button type="button" onClick={() => setIsPasteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500">
              {language === 'ar' 
                ? 'لم نتمكن من قراءة الحافظة تلقائياً. يرجى لصق المحتوى الخاص بك أدناه.'
                : 'We could not read the clipboard automatically. Please paste your content below.'}
            </p>

            <div className="flex-1 min-h-[200px]">
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={language === 'ar' ? 'الصق محتوى القصة هنا...' : 'Paste story content here...'}
                className="w-full h-full min-h-[200px] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3 pt-3 shrink-0">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                {language === 'ar' ? 'إنشاء قصة' : 'Create Story'}
              </button>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Folder Add/Edit Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveFolder} className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingFolderId ? t('editFolder', language) : t('createFolder', language)}
              </h3>
              <button type="button" onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('folderName', language)}</label>
                <input
                  type="text"
                  required
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder={language === 'ar' ? 'اسم المجلد...' : 'Folder name...'}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">{t('folderColor', language)}</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFolderForm({ ...folderForm, color: c })}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    >
                      {folderForm.color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('parentFolder', language)}</label>
                <select
                  value={folderForm.parentId}
                  onChange={(e) => setFolderForm({ ...folderForm, parentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">{t('none', language)}</option>
                  {activeFolders.filter(f => f.id !== editingFolderId).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                {t('save', language)}
              </button>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Story Filter Toolbar
function StoryFilterBar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedColor,
  setSelectedColor,
  selectedFolderFilter,
  setSelectedFolderFilter,
  activeFolders,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  availableYears,
  availableMonths,
  language
}: any) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchStoriesPlaceholder', language)}
          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pr-8 pl-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {/* Filters Dropdown Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0 text-xs">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
          <Filter className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
          
          {/* Optional Folder Filter */}
          {activeFolders && (
            <>
              <select
                value={selectedFolderFilter}
                onChange={(e) => setSelectedFolderFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-1.5 py-1 cursor-pointer max-w-[110px] truncate"
              >
                <option value="all">{t('allFolders', language)}</option>
                {activeFolders.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <div className="h-3.5 w-[1px] bg-slate-200" />
            </>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-1.5 py-1 cursor-pointer"
          >
            <option value="all">{t('allStatuses', language)}</option>
            <option value="draft">{t('draft', language)}</option>
            <option value="ready">{t('readyToPublish', language)}</option>
            <option value="published">{t('published', language)}</option>
          </select>

          <div className="h-3.5 w-[1px] bg-slate-200" />

          {/* Color Filter */}
          <div className="flex items-center gap-1 px-1">
            <Palette className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-1 py-1 cursor-pointer"
            >
              <option value="all">{t('allColors', language)}</option>
              {COLORS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-200" />

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth('all');
            }}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-1.5 py-1 cursor-pointer"
          >
            <option value="all">{t('allYears', language)}</option>
            {availableYears.map((year: any) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Month Filter */}
          {selectedYear !== 'all' && (
            <>
              <div className="h-3.5 w-[1px] bg-slate-200" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-1.5 py-1 cursor-pointer"
              >
                <option value="all">{t('allMonths', language)}</option>
                {availableMonths.map((month: any) => (
                  <option key={month} value={month}>{new Date(2000, month, 1).toLocaleDateString(language, { month: 'short' })}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Story Grid & Card Renderer
function StoryGrid({
  stories,
  folderMap,
  toggleFavorite,
  setItemToDelete,
  setReadingStory,
  language,
  emptyMessage,
  emptySubText,
  newStoryUrl,
  getStatusColor,
  getStatusText,
  handleCreateFromClipboard
}: any) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 border-dashed p-6 space-y-3">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">{emptyMessage}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{emptySubText}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            onClick={handleCreateFromClipboard}
            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 shadow-xs"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>{language === 'ar' ? 'من الحافظة' : 'From Clipboard'}</span>
          </button>
          <Link
            href={newStoryUrl}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createNewStoryBtn', language)}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {stories.map((story: Story) => {
          const folder = story.folderId ? folderMap.get(story.folderId) : null;
          return (
            <motion.div
              key={story.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl p-4.5 shadow-2xs border border-slate-200/80 hover:border-indigo-300/80 hover:shadow-md transition-all group relative flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Card Header: Badges & Quick Star */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusColor(story.status)}`}>
                      {getStatusText(story.status)}
                    </span>
                    {folder && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold text-slate-700 bg-slate-100 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color || COLORS[0] }} />
                        <span className="truncate max-w-[90px]">{folder.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(story.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        story.isFavorite ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={story.isFavorite ? t('removeFromFavorites', language) : t('addToFavorites', language)}
                    >
                      <Star className={`w-4 h-4 ${story.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => setReadingStory(story)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={language === 'ar' ? 'قراءة سريعة' : 'Quick read'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/editor/${story.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={t('editStory', language)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setItemToDelete({ id: story.id, type: 'story' })}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('moveToTrash', language)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Preview */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    <Link href={`/editor/${story.id}`}>
                      {story.title || t('untitledStory', language)}
                    </Link>
                  </h3>

                  <div 
                    className="text-slate-500 text-xs line-clamp-2 leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: story.content || `<span class="italic text-slate-300">${t('noContentYet', language)}</span>` }} 
                  />
                </div>
              </div>

              {/* Card Footer: Dates & Schedule Info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {story.targetDate 
                      ? new Date(story.targetDate).toLocaleDateString(language, { numberingSystem: 'latn', day: 'numeric', month: 'short', year: 'numeric' })
                      : '---'}
                  </span>
                </div>
                {story.publishTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{story.publishTime}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
