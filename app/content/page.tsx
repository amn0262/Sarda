'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useStore, Story, Folder as FolderType } from '@/lib/store';
import { t } from "@/lib/i18n";
import { 
  FolderPlus, Folder as FolderIcon, Trash2, Edit2, FileText, Plus, 
  Calendar, Clock, FileDown, ChevronLeft, ChevronRight, Search, 
  Filter, LayoutGrid, Layers, Star, X, Eye, 
  ArrowRight, FolderOpen, ChevronDown, Clipboard, List, Grid3X3, ExternalLink,
  PanelLeftClose, PanelLeftOpen, BookOpen
} from 'lucide-react';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import StoryReaderModal from '@/components/StoryReaderModal';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ContentManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderParam = searchParams.get('folderId');

  const { 
    folders, stories, addFolder, updateFolder, addStory, updateStory, 
    toggleFavorite, moveToTrash, language, setFloatingStory,
    isContentFolderSidebarCollapsed, toggleContentFolderSidebar,
    gridPageSize, setGridPageSize, gridColumns, setGridColumns
  } = useStore();
  
  const activeFolders = useMemo(() => folders.filter(f => !f.isDeleted), [folders]);
  const activeStories = useMemo(() => stories.filter(s => !s.isDeleted), [stories]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderParam || null);
  const [viewMode, setViewMode] = useState<'folders' | 'all' | 'favorites'>('folders');
  const [displayLayout, setDisplayLayout] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync selectedFolderId if URL parameter changes
  const [prevFolderParam, setPrevFolderParam] = useState(folderParam);
  if (folderParam !== prevFolderParam) {
    setPrevFolderParam(folderParam);
    if (folderParam) {
      setSelectedFolderId(folderParam);
      setViewMode('folders');
    }
  }

  const handleSelectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
    setViewMode('folders');
    if (typeof window !== 'undefined') {
      if (folderId) {
        window.history.replaceState(null, '', `/content?folderId=${encodeURIComponent(folderId)}`);
      } else {
        window.history.replaceState(null, '', '/content');
      }
    }
  }, []);
  
  // Mobile drawer state
  const [isMobileFolderDrawerOpen, setIsMobileFolderDrawerOpen] = useState(false);

  // Folder Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderForm, setFolderForm] = useState({ name: '', parentId: '' });

  // Manual Paste Modal Fallback
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [manualPasteText, setManualPasteText] = useState('');

  // Story Reading Preview Modal
  const [readingStory, setReadingStory] = useState<Story | null>(null);

  // Toast Notification state
  const [toastNotification, setToastNotification] = useState<{
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Tree expand state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);

  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  const folderMap = useMemo(() => {
    const map = new Map<string, FolderType>();
    activeFolders.forEach(f => map.set(f.id, f));
    return map;
  }, [activeFolders]);

  const favoriteStories = useMemo(() => {
    return activeStories.filter(s => s.isFavorite);
  }, [activeStories]);

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const openAddFolder = (parentId?: string) => {
    setEditingFolderId(null);
    setFolderForm({ name: '', parentId: parentId || (selectedFolderId || '') });
    setIsFolderModalOpen(true);
  };

  const openEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setFolderForm({ name: folder.name, parentId: folder.parentId || '' });
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderForm.name.trim()) {
      if (editingFolderId) {
        updateFolder(editingFolderId, { 
          name: folderForm.name.trim(), 
          parentId: folderForm.parentId || null 
        });
        setToastNotification({
          id: Date.now(),
          type: 'success',
          message: language === 'ar' ? `تم تعديل المجلد «${folderForm.name.trim()}»` : `Folder "${folderForm.name.trim()}" updated`
        });
      } else {
        addFolder(folderForm.name.trim(), undefined, folderForm.parentId || null);
        setToastNotification({
          id: Date.now(),
          type: 'success',
          message: language === 'ar' ? `تم إنشاء المجلد «${folderForm.name.trim()}»` : `Folder "${folderForm.name.trim()}" created`
        });
      }
      setIsFolderModalOpen(false);
      setFolderForm({ name: '', parentId: '' });
      setEditingFolderId(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'folder') {
        const folderToDelete = folders.find(f => f.id === itemToDelete.id);
        const parentId = folderToDelete?.parentId || null;
        moveToTrash(itemToDelete.id, itemToDelete.type);
        if (selectedFolderId === itemToDelete.id) {
          handleSelectFolder(parentId);
        }
        setToastNotification({
          id: Date.now(),
          type: 'info',
          message: language === 'ar' ? 'تم نقل المجلد للمهملات' : 'Folder moved to trash'
        });
      } else {
        moveToTrash(itemToDelete.id, itemToDelete.type);
        setToastNotification({
          id: Date.now(),
          type: 'info',
          message: language === 'ar' ? 'تم نقل القصة للمهملات' : 'Story moved to trash'
        });
      }
      setItemToDelete(null);
    }
  };

  const handlePasteStory = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          createStoryFromText(text.trim());
          return;
        }
      }
    } catch {
      // Permission blocked or insecure origin, fallback to modal
    }
    setManualPasteText('');
    setIsPasteModalOpen(true);
  };

  const createStoryFromText = (rawText: string) => {
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const title = lines.length > 0 ? lines[0].substring(0, 100).trim() : (language === 'ar' ? 'قصة من الحافظة' : 'Clipboard Story');
    const content = lines.map(line => `<p dir="rtl">${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('');

    const targetFolder = selectedFolderId || (activeFolders.length > 0 ? activeFolders[0].id : '');

    const newId = addStory({
      title,
      content,
      folderId: targetFolder,
      status: 'draft',
      targetDate: new Date().toISOString().split('T')[0],
      publishTime: '08:00',
      isFavorite: false,
    });

    setToastNotification({
      id: Date.now(),
      type: 'success',
      message: language === 'ar' ? 'تم إنشاء القصة من الحافظة بنجاح' : 'Story created from clipboard'
    });

    if (newId) {
      router.push(`/editor/${newId}`);
    }
  };

  const selectedFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folderMap.get(selectedFolderId) || null;
  }, [selectedFolderId, folderMap]);

  const rootFolders = useMemo(() => {
    return activeFolders.filter(f => !f.parentId);
  }, [activeFolders]);

  const currentSubFolders = useMemo(() => {
    if (!selectedFolderId) return [];
    return activeFolders.filter(f => f.parentId === selectedFolderId);
  }, [activeFolders, selectedFolderId]);

  const breadcrumbs = useMemo(() => {
    if (!selectedFolderId) return [];
    const crumbs: FolderType[] = [];
    let currentId: string | null = selectedFolderId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const folder = folderMap.get(currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId || null;
      } else {
        break;
      }
    }
    return crumbs;
  }, [selectedFolderId, folderMap]);

  const filteredStories = useMemo(() => {
    let list: Story[] = [];

    if (viewMode === 'folders') {
      if (selectedFolderId) {
        list = activeStories.filter(s => s.folderId === selectedFolderId);
      } else {
        list = [];
      }
    } else if (viewMode === 'favorites') {
      list = favoriteStories;
    } else {
      list = activeStories;
      if (selectedFolderFilter !== 'all') {
        list = list.filter(s => s.folderId === selectedFolderFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => {
        const folderName = s.folderId ? folderMap.get(s.folderId)?.name || '' : '';
        return (
          (s.title && s.title.toLowerCase().includes(q)) ||
          folderName.toLowerCase().includes(q) ||
          (s.content && s.content.toLowerCase().includes(q))
        );
      });
    }

    if (selectedStatus !== 'all') {
      list = list.filter(s => s.status === selectedStatus);
    }

    if (selectedYear !== 'all') {
      list = list.filter(s => {
        const date = new Date(s.createdAt);
        return date.getFullYear().toString() === selectedYear;
      });
    }

    if (selectedMonth !== 'all') {
      list = list.filter(s => {
        const date = new Date(s.createdAt);
        return date.getMonth().toString() === selectedMonth;
      });
    }

    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [
    activeStories, 
    favoriteStories, 
    viewMode, 
    selectedFolderId, 
    selectedFolderFilter, 
    searchQuery, 
    selectedStatus, 
    selectedYear, 
    selectedMonth, 
    folderMap
  ]);

  // Reset pagination on filter or view changes
  const filterKey = `${selectedFolderId}_${viewMode}_${searchQuery}_${selectedYear}_${selectedMonth}_${selectedStatus}_${selectedFolderFilter}_${gridPageSize}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Compute pagination values
  const pageSize = (gridPageSize === -1) ? (filteredStories.length || 1) : (gridPageSize || 12);
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / (pageSize || 1)));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedStories = (gridPageSize === -1)
    ? filteredStories
    : filteredStories.slice((safePage - 1) * pageSize, safePage * pageSize);

  const renderPagination = () => {
    if (filteredStories.length <= pageSize || gridPageSize === -1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/10 text-xs">
        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
          {language === 'ar'
            ? `عرض ${(safePage - 1) * pageSize + 1} - ${Math.min(safePage * pageSize, filteredStories.length)} من أصل ${filteredStories.length} قصة`
            : `Showing ${(safePage - 1) * pageSize + 1} - ${Math.min(safePage * pageSize, filteredStories.length)} of ${filteredStories.length} stories`}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] hover:bg-neutral-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none font-semibold cursor-pointer active:scale-95 transition-colors"
          >
            {language === 'ar' ? 'السابق' : 'Prev'}
          </button>
          <span className="px-2.5 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-white/10 rounded-lg">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] hover:bg-neutral-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none font-semibold cursor-pointer active:scale-95 transition-colors"
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

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

  const handleExportFolderWord = () => {
    const titleName = viewMode === 'favorites' 
      ? t('favoritesList', language)
      : (selectedFolder ? selectedFolder.name : t('allStories', language));

    if (filteredStories.length === 0) return;
    
    let content = `
      <html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>${titleName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; text-align: ${language === 'ar' ? 'right' : 'left'}; color: #000000; padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 25px; color: #000000; border-bottom: 2px solid #000; padding-bottom: 10px;">${titleName}</h1>
    `;

    filteredStories.forEach((story, idx) => {
      const formattedDate = story.targetDate || '---';
      const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

      content += `
        <div style="page-break-before: ${idx > 0 ? 'always' : 'auto'}; border-bottom: 1px solid #000000; padding-bottom: 15px; margin-bottom: 15px;">
          <h2 style="color: #000000; margin-bottom: 6px;">${story.title || t('untitledStory', language)}</h2>
          <div style="color: #333333; font-size: 11px; margin-bottom: 15px; background-color: #f5f5f5; padding: 6px 10px; border: 1px solid #000;">
            <span><strong>${t('publishStatusLabel', language)}:</strong> ${statusText}</span> · 
            <span><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</span>
          </div>
          <div style="line-height: 1.8; font-size: 14px; color: #000000;">
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

  // Sidebar tree folder renderer with Apple macOS Finder style
  const renderSidebarFolderItem = (folder: FolderType, depth = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const subChildren = activeFolders.filter(f => f.parentId === folder.id);
    const hasChildren = subChildren.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const count = activeStories.filter(s => s.folderId === folder.id).length;

    return (
      <div key={folder.id} className="space-y-0.5">
        <div 
          onClick={() => handleSelectFolder(folder.id)}
          className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
            isSelected
              ? 'bg-neutral-900 text-white font-bold shadow-xs'
              : 'text-neutral-700 hover:bg-black/5 hover:text-black'
          }`}
          style={{ marginRight: depth > 0 && language === 'ar' ? `${depth * 10}px` : undefined, marginLeft: depth > 0 && language === 'en' ? `${depth * 10}px` : undefined }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button 
                type="button"
                onClick={(e) => toggleFolderExpand(folder.id, e)}
                className={`p-0.5 rounded-lg transition-colors ${isSelected ? 'text-white' : 'text-neutral-400 hover:text-black'}`}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronIcon className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block shrink-0" />
            )}
            
            <FolderIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
            <span className="truncate font-medium">{folder.name}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
              {count}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 border-r border-black/5 pr-1.5 mr-2.5">
            {subChildren.map((child) => renderSidebarFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#F5F5F7] dark:bg-[#121214] text-neutral-900 dark:text-neutral-100">
      
      {/* Toast Notification - Apple Pill */}
      {toastNotification && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 dark:bg-[#1C1C1E]/95 backdrop-blur-xl text-white border border-white/10 px-4 py-2 text-xs font-semibold shadow-xl rounded-full flex items-center gap-2"
        >
          <span>{toastNotification.message}</span>
          <button onClick={() => setToastNotification(null)} className="text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Desktop Left/Right Hierarchy Panel - Apple macOS Finder Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-e border-black/5 dark:border-white/10 shrink-0 select-none transition-[width,opacity] duration-150 ${
        isContentFolderSidebarCollapsed ? 'w-0 overflow-hidden border-none opacity-0 pointer-events-none' : 'w-64 lg:w-72 opacity-100'
      }`}>
        
        {/* Panel Header */}
        <div className="p-3 border-b border-black/5 dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
              {/* Traffic lights decoration */}
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block"></span>
              <span className="ms-1">{language === 'ar' ? 'فهرس المجلدات' : 'Folder Index'}</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openAddFolder()}
                className="p-1.5 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors border border-black/5 dark:border-white/10 active:scale-95 cursor-pointer"
                title={t('createFolder', language)}
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleContentFolderSidebar}
                className="p-1.5 hover:bg-neutral-200/60 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                title={language === 'ar' ? 'طي فهرس المجلدات' : 'Collapse Folders'}
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Apple Segmented Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-neutral-200/60 dark:bg-black/40 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('folders')}
              className={`py-1 px-1.5 rounded-lg text-center truncate transition-all cursor-pointer ${
                viewMode === 'folders' ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t('viewFoldersMode', language)}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`py-1 px-1.5 rounded-lg text-center truncate transition-all cursor-pointer ${
                viewMode === 'all' ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t('allStories', language)}
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`py-1 px-1.5 rounded-lg text-center truncate transition-all cursor-pointer ${
                viewMode === 'favorites' ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              ⭐ ({favoriteStories.length})
            </button>
          </div>

          {/* Quick Search - Apple Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute right-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث سريع...' : 'Search...'}
              className="w-full bg-neutral-100/80 dark:bg-[#252528] border border-black/5 dark:border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Folder Tree List */}
        <div className="flex-1 overflow-y-auto p-2.5 pb-28 md:pb-8 space-y-1">
          {viewMode === 'folders' && (
            <>
              <button
                onClick={() => handleSelectFolder(null)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all text-xs cursor-pointer ${
                  selectedFolderId === null
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-4 h-4 shrink-0 text-blue-500" />
                  <span className="truncate">{t('allFoldersOverview', language)}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedFolderId === null ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'}`}>
                  {activeFolders.length}
                </span>
              </button>

              <div className="pt-1.5 space-y-0.5">
                {rootFolders.map((folder) => renderSidebarFolderItem(folder, 0))}
              </div>
            </>
          )}

          {viewMode === 'favorites' && (
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#252528] border border-black/5 dark:border-white/10 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-white">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{t('favoritesList', language)}</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {t('favoritesDesc', language)}
              </p>
            </div>
          )}

          {viewMode === 'all' && (
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolderFilter('all')}
                className={`w-full text-right px-2.5 py-1.5 text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                  selectedFolderFilter === 'all' ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold shadow-xs' : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span>{t('allFolders', language)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedFolderFilter === 'all' ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'}`}>
                  {activeStories.length}
                </span>
              </button>
              {activeFolders.map(f => {
                const count = activeStories.filter(s => s.folderId === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderFilter(f.id)}
                    className={`w-full text-right px-2.5 py-1.5 text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      selectedFolderFilter === f.id ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold shadow-xs' : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{f.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedFolderFilter === f.id ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Workspace - Apple macOS Finder Style */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Control Bar: Apple macOS Finder Toolbar */}
        <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          
          {/* Breadcrumbs / View Title */}
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto min-w-0">
            {/* Desktop Folder Sidebar Toggle Button */}
            <button
              onClick={toggleContentFolderSidebar}
              className="hidden md:flex items-center justify-center p-1.5 border border-black/5 dark:border-white/10 bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-xl cursor-pointer transition-colors"
              title={isContentFolderSidebarCollapsed ? (language === 'ar' ? 'إظهار شجرة المجلدات' : 'Show Folders') : (language === 'ar' ? 'طي شجرة المجلدات' : 'Hide Folders')}
            >
              {isContentFolderSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-blue-500" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsMobileFolderDrawerOpen(true)}
              className="md:hidden p-1.5 border border-black/5 dark:border-white/10 bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 rounded-xl cursor-pointer"
              title="القائمة"
            >
              <FolderIcon className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={() => handleSelectFolder(null)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-blue-500" />
              <span>{language === 'ar' ? 'المحتوى' : 'Content'}</span>
            </button>

            {viewMode === 'folders' && selectedFolder && (
              <>
                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.id} className="flex items-center gap-1.5">
                    {idx > 0 && <span className="text-neutral-300 dark:text-neutral-600">/</span>}
                    <button
                      onClick={() => handleSelectFolder(crumb.id)}
                      className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[140px] cursor-pointer ${
                        idx === breadcrumbs.length - 1 ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 font-medium'
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </>
            )}

            {viewMode === 'all' && (
              <>
                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                <span className="font-bold text-neutral-900 dark:text-white">{t('allStories', language)}</span>
              </>
            )}

            {viewMode === 'favorites' && (
              <>
                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                <span className="font-bold text-neutral-900 dark:text-white">{t('favoritesList', language)}</span>
              </>
            )}

            <span className="text-neutral-300 dark:text-neutral-600">|</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
              {filteredStories.length} {language === 'ar' ? 'نص' : 'texts'}
            </span>
          </div>

          {/* Action Buttons Toolbar: Apple Squircle Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* New Story Button */}
            <Link
              href={selectedFolderId ? `/editor/new?folderId=${encodeURIComponent(selectedFolderId)}` : '/editor/new'}
              className="px-3.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newStory', language)}</span>
            </Link>

            {/* New Folder Button */}
            <button
              onClick={() => openAddFolder(selectedFolderId || undefined)}
              className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] hover:bg-neutral-100 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 font-semibold text-xs rounded-xl border border-black/5 dark:border-white/10 shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('createFolder', language)}</span>
            </button>

            {/* Smart Clipboard Paste Button */}
            <button
              onClick={handlePasteStory}
              className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] hover:bg-neutral-100 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 font-semibold text-xs rounded-xl border border-black/5 dark:border-white/10 shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title={language === 'ar' ? 'إنشاء قصة مباشرة من نص الحافظة' : 'Create from clipboard'}
            >
              <Clipboard className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'لصق قصة' : 'Paste'}</span>
            </button>

            {/* Export Word Button */}
            <button
              onClick={handleExportFolderWord}
              disabled={filteredStories.length === 0}
              className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] hover:bg-neutral-100 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 disabled:opacity-40 font-semibold text-xs rounded-xl border border-black/5 dark:border-white/10 shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title={t('downloadWord', language)}
            >
              <FileDown className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span className="hidden sm:inline">Word</span>
            </button>
          </div>
        </div>

        {/* Filter Strip: Apple macOS Filter Controls */}
        <div className="bg-neutral-100/70 dark:bg-[#252528] border-b border-black/5 dark:border-white/10 px-4 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              <span>{language === 'ar' ? 'تصفية:' : 'Filter:'}</span>
            </span>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="all">{t('allStatuses', language)}</option>
              <option value="draft">{t('draft', language)}</option>
              <option value="ready">{t('readyToPublish', language)}</option>
              <option value="published">{t('published', language)}</option>
            </select>

            {/* Year Filter */}
            {availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth('all');
                }}
                className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
              >
                <option value="all">{t('allYears', language)}</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}

            {/* Month Filter */}
            {selectedYear !== 'all' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
              >
                <option value="all">{t('allMonths', language)}</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{new Date(2000, month, 1).toLocaleDateString(language, { month: 'short' })}</option>
                ))}
              </select>
            )}
          </div>

          {/* Layout & Grid Controls: Density, Items Count & Mode */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Items Per Page Selector */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="text-[11px] font-medium">{language === 'ar' ? 'العناصر:' : 'Show:'}</span>
              <select
                value={gridPageSize || 12}
                onChange={(e) => setGridPageSize(Number(e.target.value))}
                className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-xl px-2 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none shadow-2xs cursor-pointer"
                title={language === 'ar' ? 'عدد العناصر لكل صفحة' : 'Items per page'}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={-1}>{language === 'ar' ? 'الكل' : 'All'}</option>
              </select>
            </div>

            {/* Grid Columns Density Selector (Visible in Grid Mode) */}
            {displayLayout === 'grid' && (
              <div className="flex items-center gap-0.5 bg-neutral-200/60 dark:bg-black/40 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setGridColumns(2)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    (gridColumns || 3) === 2 ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                  title={language === 'ar' ? 'عمودان (عرض عريض ومفصل)' : '2 Columns'}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setGridColumns(3)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    (gridColumns || 3) === 3 ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                  title={language === 'ar' ? '3 أعمدة (متوسط قياسي)' : '3 Columns'}
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => setGridColumns(4)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    (gridColumns || 3) === 4 ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                  title={language === 'ar' ? '4 أعمدة (مدمج سريع)' : '4 Columns'}
                >
                  4
                </button>
              </div>
            )}

            {/* Layout Toggle: Grid vs Table */}
            <div className="flex items-center gap-0.5 bg-neutral-200/60 dark:bg-black/40 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setDisplayLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  displayLayout === 'grid' ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
                title="عرض شبكة"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDisplayLayout('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  displayLayout === 'table' ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
                title="عرض جدول / قائمة"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Body: Apple macOS Space with Bottom Dock Clearance */}
        <div className="p-3 md:p-6 pb-36 md:pb-16 space-y-4 flex-1">
          
          {/* VIEW MODE: FOLDERS OVERVIEW (when no specific folder is selected) */}
          {viewMode === 'folders' && !selectedFolderId && (
            <div className="space-y-4">
              {/* Overview Subheader - Clean Typography without duplicate New Folder button */}
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                <div>
                  <h1 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                    {t('allFoldersOverview', language)}
                  </h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                    {t('foldersGridSub', language)}
                  </p>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  <span>{activeFolders.length} {language === 'ar' ? 'مجلد' : 'folders'}</span>
                  <span className="mx-1.5 opacity-40">·</span>
                  <span>{activeStories.length} {language === 'ar' ? 'قصة' : 'stories'}</span>
                </div>
              </div>

              {/* Folders Display in BOTH Styles: Grid and Table/List */}
              {activeFolders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/10 border-dashed p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto">
                    <FolderIcon className="w-6 h-6 fill-blue-500/20" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{t('noFoldersYet', language)}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">{t('noFoldersSub', language)}</p>
                  <button
                    onClick={() => openAddFolder()}
                    className="mt-2 px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {t('addFolderNow', language)}
                  </button>
                </div>
              ) : displayLayout === 'grid' ? (
                /* STYLE 1: APPLE MACOS FINDER GRID / ICONS STYLE */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {activeFolders.map((folder) => {
                    const storyCount = activeStories.filter(s => s.folderId === folder.id).length;
                    const subCount = activeFolders.filter(f => f.parentId === folder.id).length;

                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleSelectFolder(folder.id)}
                        className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                                <FolderIcon className="w-5 h-5 fill-blue-500/20" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {folder.name}
                                </h3>
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                                  {subCount > 0 ? `${subCount} ${language === 'ar' ? 'مجلد فرعي' : 'subfolders'}` : (language === 'ar' ? 'مجلد رئيسي' : 'Root folder')}
                                </span>
                              </div>
                            </div>

                            {/* Actions on folder */}
                            <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEditFolder(folder)}
                                className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title={t('editFolder', language)}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setItemToDelete({ id: folder.id, type: 'folder' })}
                                className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                title={t('deleteFolder', language)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Statistics Badges - Clean Unboxed */}
                          <div className="flex items-center gap-2 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            <span>{storyCount} {language === 'ar' ? 'قصة' : 'stories'}</span>
                            {subCount > 0 && (
                              <>
                                <span className="opacity-40">·</span>
                                <span>{subCount} {language === 'ar' ? 'فرعي' : 'sub'}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Card Action Footer: Clean without duplicate Open button */}
                        <div className="pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                            <span>{language === 'ar' ? 'انقر للفتح' : 'Click to open'}</span>
                            <ChevronIcon className="w-3 h-3" />
                          </span>
                          <Link
                            href={`/editor/new?folderId=${encodeURIComponent(folder.id)}`}
                            className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                            title={t('writeNewStoryInFolder', language)}
                          >
                            <Plus className="w-3 h-3 text-blue-500" />
                            <span>{language === 'ar' ? 'قصة جديدة' : 'New Story'}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* STYLE 2: APPLE MACOS FINDER TABLE / LIST STYLE */
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-neutral-50/80 dark:bg-[#252528] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10 font-semibold">
                        <tr>
                          <th className="p-3.5">{language === 'ar' ? 'اسم المجلد' : 'Folder Name'}</th>
                          <th className="p-3.5 text-center">{language === 'ar' ? 'عدد النصوص والقصص' : 'Stories'}</th>
                          <th className="p-3.5 text-center">{language === 'ar' ? 'المجلدات الفرعية' : 'Subfolders'}</th>
                          <th className="p-3.5 text-center">{language === 'ar' ? 'النوع / المستوى' : 'Type'}</th>
                          <th className="p-3.5 text-left">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/10">
                        {activeFolders.map((folder) => {
                          const storyCount = activeStories.filter(s => s.folderId === folder.id).length;
                          const subCount = activeFolders.filter(f => f.parentId === folder.id).length;
                          const isSub = !!folder.parentId;
                          const parentFolder = folder.parentId ? folderMap.get(folder.parentId) : null;

                          return (
                            <tr
                              key={folder.id}
                              className="hover:bg-neutral-50/80 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                              onClick={() => handleSelectFolder(folder.id)}
                            >
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <FolderIcon className="w-4 h-4 fill-blue-500/20" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block truncate">
                                      {folder.name}
                                    </span>
                                    {parentFolder && (
                                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                        {language === 'ar' ? `داخل: ${parentFolder.name}` : `Inside: ${parentFolder.name}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                                  {storyCount} {language === 'ar' ? 'قصة' : 'stories'}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${subCount > 0 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                  {subCount} {language === 'ar' ? 'فرعي' : 'sub'}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                  {isSub ? (language === 'ar' ? 'مجلد فرعي' : 'Subfolder') : (language === 'ar' ? 'رئيسي' : 'Root')}
                                </span>
                              </td>
                              <td className="p-3.5 text-left" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSelectFolder(folder.id)}
                                    className="px-2.5 py-1 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-900 dark:text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{language === 'ar' ? 'فتح' : 'Open'}</span>
                                    <ChevronIcon className="w-3 h-3" />
                                  </button>
                                  <Link
                                    href={`/editor/new?folderId=${encodeURIComponent(folder.id)}`}
                                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title={t('writeNewStoryInFolder', language)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => openEditFolder(folder)}
                                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title={t('editFolder', language)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setItemToDelete({ id: folder.id, type: 'folder' })}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                    title={t('deleteFolder', language)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE: SPECIFIC FOLDER SELECTED */}
          {viewMode === 'folders' && selectedFolder && (
            <div className="space-y-4">
              {/* Folder Banner: Apple macOS Card */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <FolderOpen className="w-5 h-5 fill-blue-500/20" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">{selectedFolder.name}</h2>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{filteredStories.length} {language === 'ar' ? 'نص مكتوب' : 'written texts'}</span>
                      {currentSubFolders.length > 0 && <span> · {currentSubFolders.length} {language === 'ar' ? 'مجلد فرعي' : 'subfolders'}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => openAddFolder(selectedFolder.id)}
                    className="px-3 py-1.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>{t('createSubFolder', language)}</span>
                  </button>
                  <button
                    onClick={() => openEditFolder(selectedFolder)}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('renameFolder', language)}</span>
                  </button>
                  <button
                    onClick={() => setItemToDelete({ id: selectedFolder.id, type: 'folder' })}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('deleteFolder', language)}</span>
                  </button>
                </div>
              </div>

              {/* Subfolders section if any - adapts to displayLayout */}
              {currentSubFolders.length > 0 && (
                <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 p-3.5 space-y-2.5 shadow-2xs">
                  <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('subFolders', language)} ({currentSubFolders.length})</span>
                    </div>
                    <button
                      onClick={() => openAddFolder(selectedFolder.id)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('createSubFolder', language)}</span>
                    </button>
                  </div>

                  {displayLayout === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {currentSubFolders.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectFolder(sub.id)}
                          className="p-2.5 bg-neutral-50 dark:bg-[#252528] hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-800 border border-black/5 dark:border-white/10 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer group text-right"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FolderIcon className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 font-semibold text-neutral-900 dark:text-white">{sub.name}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-neutral-200/70 dark:bg-white/10 group-hover:bg-blue-200/70 text-neutral-700 dark:text-neutral-300 group-hover:text-blue-800 px-1.5 py-0.2 rounded-full shrink-0">
                            {activeStories.filter(s => s.folderId === sub.id).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-black/5 dark:divide-white/10 bg-neutral-50 dark:bg-[#252528] rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
                      {currentSubFolders.map(sub => (
                        <div
                          key={sub.id}
                          onClick={() => handleSelectFolder(sub.id)}
                          className="p-2.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <FolderIcon className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-neutral-900 dark:text-white">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {activeStories.filter(s => s.folderId === sub.id).length} {language === 'ar' ? 'قصة' : 'stories'}
                            </span>
                            <ChevronIcon className="w-3.5 h-3.5 text-neutral-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stories Render */}
              <StoryContentSection
                stories={paginatedStories}
                folderMap={folderMap}
                displayLayout={displayLayout}
                gridColumns={gridColumns || 3}
                language={language}
                emptyMessage={t('noStoriesInFolder', language)}
                emptySubText={t('startWritingInFolder', language)}
                newStoryUrl={`/editor/new?folderId=${encodeURIComponent(selectedFolder.id)}`}
                onToggleFavorite={toggleFavorite}
                onRead={setReadingStory}
                onDelete={(id) => setItemToDelete({ id, type: 'story' })}
                onFloatStory={setFloatingStory}
              />

              {/* Pagination Controls */}
              {renderPagination()}
            </div>
          )}

          {/* VIEW MODE: ALL FILES (ARCHIVE) OR FAVORITES */}
          {(viewMode === 'all' || viewMode === 'favorites') && (
            <div className="space-y-3">
              <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-neutral-100 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-center text-neutral-900 dark:text-white">
                    {viewMode === 'favorites' ? <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> : <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-neutral-900 dark:text-white">
                      {viewMode === 'favorites' ? t('favoritesList', language) : t('browseAllFiles', language)}
                    </h2>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {viewMode === 'favorites' ? t('favoritesDesc', language) : (language === 'ar' ? 'أرشيف جميع النصوص والقصص المكتوبة' : 'Complete archive of all written texts')}
                    </p>
                  </div>
                </div>

                <Link
                  href="/editor/new"
                  className="px-3.5 py-1.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('newStory', language)}</span>
                </Link>
              </div>

              {/* Stories Render */}
              <StoryContentSection
                stories={paginatedStories}
                folderMap={folderMap}
                displayLayout={displayLayout}
                gridColumns={gridColumns || 3}
                language={language}
                emptyMessage={viewMode === 'favorites' ? t('noFavoritesYet', language) : t('noStoriesYet', language)}
                emptySubText={viewMode === 'favorites' ? t('noFavoritesSub', language) : t('noStoriesSub', language)}
                newStoryUrl="/editor/new"
                onToggleFavorite={toggleFavorite}
                onRead={setReadingStory}
                onDelete={(id) => setItemToDelete({ id, type: 'story' })}
                onFloatStory={setFloatingStory}
              />

              {/* Pagination Controls */}
              {renderPagination()}
            </div>
          )}

        </div>
      </main>

      {/* Manual Paste Modal (Smart Clipboard Fallback) - Apple Modal Style */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-5 w-full max-w-lg space-y-3.5 text-neutral-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Clipboard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {language === 'ar' ? 'إنشاء قصة من نص الحافظة' : 'Create Story from Clipboard'}
                </h3>
              </div>
              <button onClick={() => setIsPasteModalOpen(false)} className="text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {language === 'ar' ? 'الصق النص المنسوخ أدناه لإنشاء قصة جديدة فوراً (السطر الأول سيكون العنوان):' : 'Paste your text below to create a new story immediately:'}
            </p>

            <textarea
              rows={6}
              value={manualPasteText}
              onChange={(e) => setManualPasteText(e.target.value)}
              placeholder={language === 'ar' ? 'الصق النص هنا...' : 'Paste text here...'}
              className="w-full bg-neutral-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-2xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#2C2C2E] focus:ring-2 focus:ring-blue-500/20 font-sans leading-relaxed"
              autoFocus
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  if (manualPasteText.trim()) {
                    createStoryFromText(manualPasteText.trim());
                    setIsPasteModalOpen(false);
                  }
                }}
                disabled={!manualPasteText.trim()}
                className="flex-1 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-black py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {language === 'ar' ? 'إنشاء القصة الآن' : 'Create Story Now'}
              </button>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="flex-1 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 py-2.5 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Reader Modal - Apple macOS Reading Window */}
      <StoryReaderModal
        story={readingStory}
        onClose={() => setReadingStory(null)}
        folderName={readingStory?.folderId ? folderMap.get(readingStory.folderId)?.name : undefined}
      />

      {/* Add / Edit Folder Modal - Apple macOS Window Style */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <form onSubmit={handleSaveFolder} className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-md space-y-4 border border-black/8 dark:border-white/10 text-neutral-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FolderIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                  {editingFolderId ? (language === 'ar' ? 'تعديل تسمية المجلد' : 'Edit Folder Name') : t('createFolder', language)}
                </h3>
              </div>
              <button type="button" onClick={() => setIsFolderModalOpen(false)} className="text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{t('folderName', language)}</label>
                <input
                  type="text"
                  required
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#2C2C2E] focus:ring-2 focus:ring-blue-500/20"
                  placeholder={t('folderNamePlaceholder', language)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{t('parentFolder', language)}</label>
                <select
                  value={folderForm.parentId}
                  onChange={(e) => setFolderForm({ ...folderForm, parentId: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#2C2C2E] focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">{t('none', language)}</option>
                  {activeFolders.filter(f => f.id !== editingFolderId).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {t('save', language)}
              </button>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="flex-1 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 py-2.5 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal - Apple macOS Window Style */}
      {itemToDelete && (() => {
        const isFolder = itemToDelete.type === 'folder';
        const targetFolder = isFolder ? folders.find(f => f.id === itemToDelete.id) : null;
        const targetStory = !isFolder ? stories.find(s => s.id === itemToDelete.id) : null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-4 border border-black/8 dark:border-white/10 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white border border-black/5 dark:border-white/10 mx-auto flex items-center justify-center shadow-2xs">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  {isFolder ? t('deleteFolder', language) : t('moveToTrash', language)}
                </h3>
                {isFolder && targetFolder && (
                  <p className="font-semibold text-neutral-900 dark:text-white bg-neutral-100/80 dark:bg-white/10 rounded-xl p-2 mt-2 text-xs">
                    📁 {targetFolder.name}
                  </p>
                )}
                {!isFolder && targetStory && (
                  <p className="font-semibold text-neutral-900 dark:text-white bg-neutral-100/80 dark:bg-white/10 rounded-xl p-2 mt-2 text-xs">
                    📄 {targetStory.title || t('untitledStory', language)}
                  </p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {language === 'ar' ? 'سيتم نقل هذا العنصر إلى سلة المهملات، ويمكنك استعادته لاحقاً من الإعدادات.' : 'This item will be moved to the trash bin.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 py-2.5 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mobile Folder Drawer Modal - Apple Bottom Sheet */}
      {isMobileFolderDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm md:hidden">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border-t border-black/10 dark:border-white/10">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <FolderIcon className="w-4 h-4 text-blue-500" />
                <span>{language === 'ar' ? 'اختيار مجلد' : 'Select Folder'}</span>
              </h3>
              <button onClick={() => setIsMobileFolderDrawerOpen(false)} className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 pb-16 overflow-y-auto space-y-1.5 flex-1 text-xs">
              <button
                onClick={() => {
                  handleSelectFolder(null);
                  setIsMobileFolderDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  selectedFolderId === null ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold shadow-xs' : 'bg-neutral-50 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-500" />
                  <span>{t('allFoldersOverview', language)}</span>
                </div>
                <span className="font-semibold text-[10px]">({activeFolders.length})</span>
              </button>

              {activeFolders.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    handleSelectFolder(f.id);
                    setIsMobileFolderDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    selectedFolderId === f.id ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold shadow-xs' : 'bg-neutral-50 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderIcon className="w-4 h-4 text-blue-500" />
                    <span className="truncate font-medium">{f.name}</span>
                  </div>
                  <span className="font-semibold text-[10px]">
                    ({activeStories.filter(s => s.folderId === f.id).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-black/5 dark:border-white/10 bg-neutral-50 dark:bg-[#252528]">
              <button
                onClick={() => {
                  setIsMobileFolderDrawerOpen(false);
                  openAddFolder();
                }}
                className="w-full py-2.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('createNewFolder', language)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top floating button */}
      <ScrollToTopButton />
    </div>
  );
}

// Subcomponent: Stories Content Section (Supports Grid & Table Views with Sharp Edges & Compact Spacing)
interface StorySectionProps {
  stories: Story[];
  folderMap: Map<string, FolderType>;
  displayLayout: 'grid' | 'table';
  gridColumns?: number;
  language: 'ar' | 'en';
  emptyMessage: string;
  emptySubText: string;
  newStoryUrl: string;
  onToggleFavorite: (id: string) => void;
  onRead: (story: Story) => void;
  onDelete: (id: string) => void;
  onFloatStory?: (story: Story) => void;
}

function StoryContentSection({
  stories,
  folderMap,
  displayLayout,
  gridColumns = 3,
  language,
  emptyMessage,
  emptySubText,
  newStoryUrl,
  onToggleFavorite,
  onRead,
  onDelete,
  onFloatStory
}: StorySectionProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 border-dashed rounded-3xl p-6 space-y-2.5">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 mx-auto flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{emptyMessage}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">{emptySubText}</p>
        <Link
          href={newStoryUrl}
          className="inline-flex items-center gap-1.5 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all mt-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('newStory', language)}</span>
        </Link>
      </div>
    );
  }

  // 1. Table / List View - Apple macOS List Style
  if (displayLayout === 'table') {
    return (
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-neutral-50/80 dark:bg-[#252528] text-neutral-500 dark:text-neutral-400 border-b border-black/5 dark:border-white/10 font-semibold">
            <tr>
              <th className="p-3 w-10 text-center">⭐</th>
              <th className="p-3">{language === 'ar' ? 'العنوان' : 'Title'}</th>
              <th className="p-3">{language === 'ar' ? 'المجلد' : 'Folder'}</th>
              <th className="p-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="p-3">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
              <th className="p-3">{language === 'ar' ? 'الكلمات' : 'Words'}</th>
              <th className="p-3 text-left">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {stories.map((story) => {
              const folder = story.folderId ? folderMap.get(story.folderId) : null;
              const wordCount = story.content ? story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0;
              const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

              const statusColor = story.status === 'published'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : story.status === 'ready'
                ? 'text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400';

              return (
                <tr key={story.id} className="hover:bg-neutral-50/80 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onToggleFavorite(story.id)}
                      className="text-neutral-300 dark:text-neutral-600 hover:text-amber-500 transition-colors cursor-pointer"
                      title={story.isFavorite ? t('removeFromFavorites', language) : t('addToFavorites', language)}
                    >
                      <Star className={`w-3.5 h-3.5 ${story.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </td>
                  <td className="p-3 font-bold text-neutral-900 dark:text-white">
                    <button
                      type="button"
                      onClick={() => onRead(story)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-right cursor-pointer"
                      title={language === 'ar' ? 'عرض القصة في وضع القراءة' : 'Read Story'}
                    >
                      {story.title || t('untitledStory', language)}
                    </button>
                  </td>
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">
                    {folder ? (
                      <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                        <FolderIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{folder.name}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">---</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-[11px] ${statusColor}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-500 dark:text-neutral-400 font-medium text-[11px] whitespace-nowrap">
                    {story.targetDate || '---'}
                  </td>
                  <td className="p-3 text-neutral-500 dark:text-neutral-400 font-medium text-[11px] whitespace-nowrap">
                    <span>{wordCount}</span>
                    <span className="block text-[10px] text-neutral-400 dark:text-neutral-500">
                      ⏱️ {Math.max(1, Math.ceil(wordCount / 180))} {language === 'ar' ? 'د' : 'min'}
                    </span>
                  </td>
                  <td className="p-3 text-left whitespace-nowrap">
                    {/* Dedicated action buttons - NO DUPLICATE EYE BUTTON */}
                    <div className="flex items-center justify-end gap-1">
                      {onFloatStory && (
                        <button
                          onClick={() => onFloatStory(story)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                          title={t('quickFloatStory', language)}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Link
                        href={`/editor/${story.id}?mode=edit`}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                        title={t('editStory', language)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => onDelete(story.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                        title={t('moveToTrash', language)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // 2. Grid View - Dynamic Columns & High Contrast
  const gridColsClass = gridColumns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : gridColumns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridColsClass} gap-3.5`}>
      {stories.map((story) => {
        const folder = story.folderId ? folderMap.get(story.folderId) : null;
        const wordCount = story.content ? story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0;
        const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);
        const readingTimeMin = Math.max(1, Math.ceil(wordCount / 180));

        const statusColor = story.status === 'published'
          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
          : story.status === 'ready'
          ? 'text-amber-700 dark:text-amber-400 font-semibold'
          : 'text-neutral-500 dark:text-neutral-400';

        return (
          <div
            key={story.id}
            className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-colors shadow-2xs hover:shadow-xs group"
          >
            <div className="space-y-2.5">
              {/* Card Meta Row - Clean unboxed text */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`text-[11px] ${statusColor}`}>
                    {statusText}
                  </span>
                  {folder && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[120px] font-medium">
                        📁 {folder.name}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(story.id)}
                    className="p-1 text-neutral-300 dark:text-neutral-600 hover:text-amber-500 transition-colors cursor-pointer"
                    title={story.isFavorite ? t('removeFromFavorites', language) : t('addToFavorites', language)}
                  >
                    <Star className={`w-3.5 h-3.5 ${story.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title - Click opens reading mode */}
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <button
                  type="button"
                  onClick={() => onRead(story)}
                  className="text-right w-full cursor-pointer hover:underline truncate"
                  title={language === 'ar' ? 'عرض القصة في وضع القراءة' : 'Read Story'}
                >
                  {story.title || t('untitledStory', language)}
                </button>
              </h3>

              {/* Preview - Click opens reading mode */}
              <div
                onClick={() => onRead(story)}
                className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                dangerouslySetInnerHTML={{ __html: story.content || `<span class="italic opacity-40">${t('noContentYet', language)}</span>` }}
              />
            </div>

            {/* Card Footer: Metadata with Reading Time on right + Dedicated Actions on left */}
            <div className="pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <span>{wordCount} {t('words', language)}</span>
                <span className="opacity-30">·</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  ⏱️ {readingTimeMin} {language === 'ar' ? 'د' : 'min'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Link
                  href={`/reader?storyId=${story.id}`}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                  title={t('openInReader', language)}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </Link>
                {onFloatStory && (
                  <button
                    onClick={() => onFloatStory(story)}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                    title={t('quickFloatStory', language)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <Link
                  href={`/editor/${story.id}?mode=edit`}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                  title={t('editStory', language)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => onDelete(story.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                  title={t('moveToTrash', language)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-65px)] bg-[#F5F5F7] text-neutral-600 text-xs">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-neutral-300 border-t-neutral-900"></div>
        </div>
      }
    >
      <ContentManager />
    </Suspense>
  );
}
