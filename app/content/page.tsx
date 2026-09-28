'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useStore, Story, Folder as FolderType } from '@/lib/store';
import { t } from "@/lib/i18n";
import { 
  FolderPlus, Folder as FolderIcon, Trash2, Edit2, FileText, Plus, 
  Calendar, Clock, FileDown, ChevronLeft, ChevronRight, Search, 
  Filter, LayoutGrid, Layers, Star, X, Eye, 
  ArrowRight, FolderOpen, ChevronDown, Clipboard, List, Grid3X3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ContentManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderParam = searchParams.get('folderId');

  const { folders, stories, addFolder, updateFolder, addStory, updateStory, toggleFavorite, moveToTrash, language } = useStore();
  
  const activeFolders = useMemo(() => folders.filter(f => !f.isDeleted), [folders]);
  const activeStories = useMemo(() => stories.filter(s => !s.isDeleted), [stories]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderParam || null);
  const [viewMode, setViewMode] = useState<'folders' | 'all' | 'favorites'>('folders');
  const [displayLayout, setDisplayLayout] = useState<'grid' | 'table'>('grid');

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

  // Sidebar tree folder renderer with sharp edges & tight spacing
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
          className={`w-full group flex items-center justify-between px-2 py-1.5 rounded-none transition-colors cursor-pointer border ${
            isSelected
              ? 'bg-black text-white border-black font-bold'
              : 'bg-white text-neutral-800 hover:bg-neutral-100 hover:text-black border-neutral-200'
          }`}
          style={{ marginRight: depth > 0 && language === 'ar' ? `${depth * 8}px` : undefined, marginLeft: depth > 0 && language === 'en' ? `${depth * 8}px` : undefined }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button 
                type="button"
                onClick={(e) => toggleFolderExpand(folder.id, e)}
                className={`p-0.5 rounded-none transition-colors ${isSelected ? 'text-white' : 'text-neutral-500 hover:text-black'}`}
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronIcon className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-3 h-3 inline-block shrink-0" />
            )}
            
            <FolderIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-black'}`} />
            <span className="text-xs truncate">{folder.name}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[10px] px-1 py-0.2 rounded-none font-mono ${isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
              {count}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 border-r border-neutral-300 pr-1 mr-2">
            {subChildren.map((child) => renderSidebarFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-100 text-neutral-900">
      
      {/* Toast Notification - Sharp rectangular box */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white border border-neutral-700 px-4 py-2 text-xs font-bold shadow-lg rounded-none flex items-center gap-2"
          >
            <span>{toastNotification.message}</span>
            <button onClick={() => setToastNotification(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Left/Right Hierarchy Panel - Sharp & Compact */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-e border-neutral-300 shrink-0 select-none">
        
        {/* Panel Header */}
        <div className="p-2.5 border-b border-neutral-300 space-y-2 bg-neutral-50">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5 font-serif uppercase tracking-wider">
              <FolderIcon className="w-3.5 h-3.5 text-black" />
              <span>{language === 'ar' ? 'فهرس المجلدات' : 'Folder Index'}</span>
            </h2>
            <button
              onClick={() => openAddFolder()}
              className="p-1 bg-white hover:bg-black hover:text-white text-black border border-neutral-300 rounded-none transition-colors"
              title={t('createFolder', language)}
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sharp Segmented Tabs */}
          <div className="grid grid-cols-3 gap-0.5 bg-neutral-200 p-0.5 border border-neutral-300 text-[11px] font-bold">
            <button
              onClick={() => setViewMode('folders')}
              className={`py-1 px-1 rounded-none text-center truncate transition-colors ${
                viewMode === 'folders' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {t('viewFoldersMode', language)}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`py-1 px-1 rounded-none text-center truncate transition-colors ${
                viewMode === 'all' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {t('allStories', language)}
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`py-1 px-1 rounded-none text-center truncate transition-colors ${
                viewMode === 'favorites' ? 'bg-black text-white' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
              }`}
            >
              ⭐ ({favoriteStories.length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute right-2 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث سريع...' : 'Search...'}
              className="w-full bg-white border border-neutral-300 rounded-none pr-7 pl-2 py-1 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Folder Tree List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {viewMode === 'folders' && (
            <>
              <button
                onClick={() => handleSelectFolder(null)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-none transition-colors border text-xs ${
                  selectedFolderId === null
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-neutral-800 hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('allFoldersOverview', language)}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">({activeFolders.length})</span>
              </button>

              <div className="pt-1 space-y-1">
                {rootFolders.map((folder) => renderSidebarFolderItem(folder, 0))}
              </div>
            </>
          )}

          {viewMode === 'favorites' && (
            <div className="p-2 border border-neutral-300 bg-neutral-50 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-neutral-900">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>{t('favoritesList', language)}</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-normal">
                {t('favoritesDesc', language)}
              </p>
            </div>
          )}

          {viewMode === 'all' && (
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolderFilter('all')}
                className={`w-full text-right px-2 py-1.5 text-xs rounded-none border transition-colors flex items-center justify-between ${
                  selectedFolderFilter === 'all' ? 'bg-black text-white border-black font-bold' : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span>{t('allFolders', language)}</span>
                <span className="font-mono text-[10px]">({activeStories.length})</span>
              </button>
              {activeFolders.map(f => {
                const count = activeStories.filter(s => s.folderId === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderFilter(f.id)}
                    className={`w-full text-right px-2 py-1.5 text-xs rounded-none border transition-colors flex items-center justify-between ${
                      selectedFolderFilter === f.id ? 'bg-black text-white border-black font-bold' : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="font-mono text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Workspace - Compact, Sharp Edges, High Density */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Control Bar: Compact & Information Rich */}
        <div className="bg-white border-b border-neutral-300 px-3 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2">
          
          {/* Breadcrumbs / View Title */}
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto min-w-0">
            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsMobileFolderDrawerOpen(true)}
              className="md:hidden p-1 border border-neutral-300 bg-neutral-50 text-black rounded-none"
              title="القائمة"
            >
              <FolderIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleSelectFolder(null)}
              className="hover:underline flex items-center gap-1 text-neutral-700"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'المحتوى' : 'Content'}</span>
            </button>

            {viewMode === 'folders' && selectedFolder && (
              <>
                <span>/</span>
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.id} className="flex items-center gap-1">
                    {idx > 0 && <span>/</span>}
                    <button
                      onClick={() => handleSelectFolder(crumb.id)}
                      className={`hover:underline truncate max-w-[120px] ${
                        idx === breadcrumbs.length - 1 ? 'font-bold text-black' : 'text-neutral-600'
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
                <span>/</span>
                <span className="font-bold text-black">{t('allStories', language)}</span>
              </>
            )}

            {viewMode === 'favorites' && (
              <>
                <span>/</span>
                <span className="font-bold text-black">{t('favoritesList', language)}</span>
              </>
            )}

            <span className="text-neutral-400 font-normal">|</span>
            <span className="text-[11px] text-neutral-500 font-mono">
              {filteredStories.length} {language === 'ar' ? 'نص' : 'texts'}
            </span>
          </div>

          {/* Action Buttons Toolbar: Sharp Edges, Compact Spacing */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* New Story Button */}
            <Link
              href={selectedFolderId ? `/editor/new?folderId=${encodeURIComponent(selectedFolderId)}` : '/editor/new'}
              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-none border border-black flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newStory', language)}</span>
            </Link>

            {/* New Folder Button */}
            <button
              onClick={() => openAddFolder(selectedFolderId || undefined)}
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-black font-bold text-xs rounded-none border border-neutral-300 flex items-center gap-1 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{t('createFolder', language)}</span>
            </button>

            {/* Smart Clipboard Paste Button */}
            <button
              onClick={handlePasteStory}
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs rounded-none border border-neutral-300 flex items-center gap-1 transition-colors"
              title={language === 'ar' ? 'إنشاء قصة مباشرة من نص الحافظة' : 'Create from clipboard'}
            >
              <Clipboard className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">{language === 'ar' ? 'لصق قصة' : 'Paste'}</span>
            </button>

            {/* Export Word Button */}
            <button
              onClick={handleExportFolderWord}
              disabled={filteredStories.length === 0}
              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-40 font-bold text-xs rounded-none border border-neutral-300 flex items-center gap-1 transition-colors"
              title={t('downloadWord', language)}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Word</span>
            </button>
          </div>
        </div>

        {/* Filter Strip: Sharp, Slim, Compact */}
        <div className="bg-neutral-50 border-b border-neutral-300 px-3 py-1.5 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>{language === 'ar' ? 'تصفية:' : 'Filter:'}</span>
            </span>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-neutral-300 rounded-none px-2 py-1 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
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
                className="bg-white border border-neutral-300 rounded-none px-2 py-1 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
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
                className="bg-white border border-neutral-300 rounded-none px-2 py-1 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="all">{t('allMonths', language)}</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{new Date(2000, month, 1).toLocaleDateString(language, { month: 'short' })}</option>
                ))}
              </select>
            )}
          </div>

          {/* Layout Toggle: Sharp Grid vs List */}
          <div className="flex items-center gap-1 border border-neutral-300 bg-white p-0.5">
            <button
              onClick={() => setDisplayLayout('grid')}
              className={`p-1 rounded-none transition-colors ${
                displayLayout === 'grid' ? 'bg-black text-white font-bold' : 'text-neutral-500 hover:text-black'
              }`}
              title="عرض شبكة"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDisplayLayout('table')}
              className={`p-1 rounded-none transition-colors ${
                displayLayout === 'table' ? 'bg-black text-white font-bold' : 'text-neutral-500 hover:text-black'
              }`}
              title="عرض جدول / قائمة"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: Compact Padding & Sharp Lines */}
        <div className="p-3 md:p-4 space-y-3 flex-1">
          
          {/* VIEW MODE: FOLDERS OVERVIEW (when no specific folder is selected) */}
          {viewMode === 'folders' && !selectedFolderId && (
            <div className="space-y-3">
              {/* Overview Subheader */}
              <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                <div>
                  <h1 className="text-base font-bold text-neutral-900 font-serif">
                    {t('allFoldersOverview', language)}
                  </h1>
                  <p className="text-neutral-500 text-xs">
                    {t('foldersGridSub', language)}
                  </p>
                </div>
                <button
                  onClick={() => openAddFolder()}
                  className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded-none hover:bg-neutral-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addNewFolder', language)}</span>
                </button>
              </div>

              {/* Folders Grid - Sharp rectangular cards, compact spacing */}
              {activeFolders.length === 0 ? (
                <div className="text-center py-10 bg-white border border-neutral-300 border-dashed p-4 space-y-2">
                  <FolderIcon className="w-8 h-8 text-neutral-400 mx-auto" />
                  <h3 className="text-sm font-bold text-neutral-800">{t('noFoldersYet', language)}</h3>
                  <p className="text-xs text-neutral-500">{t('noFoldersSub', language)}</p>
                  <button
                    onClick={() => openAddFolder()}
                    className="mt-2 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-none hover:bg-neutral-800"
                  >
                    {t('addFolderNow', language)}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {activeFolders.map((folder) => {
                    const storyCount = activeStories.filter(s => s.folderId === folder.id).length;
                    const subCount = activeFolders.filter(f => f.parentId === folder.id).length;

                    return (
                      <div
                        key={folder.id}
                        className="bg-white border border-neutral-300 hover:border-black rounded-none transition-colors p-3 flex flex-col justify-between space-y-2.5 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-neutral-100 border border-neutral-300 rounded-none flex items-center justify-center text-black">
                                <FolderIcon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs text-neutral-900 truncate max-w-[140px] font-serif">
                                {folder.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                              <button
                                onClick={() => openEditFolder(folder)}
                                className="p-1 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-none"
                                title={t('editFolder', language)}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setItemToDelete({ id: folder.id, type: 'folder' })}
                                className="p-1 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-none"
                                title={t('deleteFolder', language)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Unboxed Metadata */}
                          <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                            <span>{storyCount} {language === 'ar' ? 'قصة' : 'stories'}</span>
                            <span>·</span>
                            <span>{subCount} {language === 'ar' ? 'فرعي' : 'sub'}</span>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleSelectFolder(folder.id)}
                            className="font-bold text-black hover:underline flex items-center gap-1"
                          >
                            <span>{language === 'ar' ? 'فتح المجلد' : 'Open'}</span>
                            <ChevronIcon className="w-3 h-3" />
                          </button>
                          <Link
                            href={`/editor/new?folderId=${encodeURIComponent(folder.id)}`}
                            className="text-neutral-500 hover:text-black flex items-center gap-1 text-[11px]"
                            title={t('writeNewStoryInFolder', language)}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{language === 'ar' ? 'قصة جديدة' : 'New Story'}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE: SPECIFIC FOLDER SELECTED */}
          {viewMode === 'folders' && selectedFolder && (
            <div className="space-y-3">
              {/* Folder Banner: Sharp Box, Compact */}
              <div className="bg-white border border-neutral-300 rounded-none p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-neutral-100 border border-neutral-300 rounded-none flex items-center justify-center text-black shrink-0">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 font-serif leading-tight">{selectedFolder.name}</h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      <span>{filteredStories.length} {language === 'ar' ? 'نص مكتوب' : 'written texts'}</span>
                      {currentSubFolders.length > 0 && <span> · {currentSubFolders.length} {language === 'ar' ? 'مجلد فرعي' : 'subfolders'}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => openAddFolder(selectedFolder.id)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-black border border-neutral-300 rounded-none text-xs font-bold flex items-center gap-1"
                  >
                    <FolderPlus className="w-3 h-3" />
                    <span>{t('createSubFolder', language)}</span>
                  </button>
                  <button
                    onClick={() => openEditFolder(selectedFolder)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-300 rounded-none text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{t('renameFolder', language)}</span>
                  </button>
                  <button
                    onClick={() => setItemToDelete({ id: selectedFolder.id, type: 'folder' })}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-300 rounded-none text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('deleteFolder', language)}</span>
                  </button>
                </div>
              </div>

              {/* Subfolders row if any */}
              {currentSubFolders.length > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 p-2.5 space-y-1.5">
                  <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1">
                    <FolderIcon className="w-3 h-3 text-black" />
                    <span>{t('subFolders', language)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentSubFolders.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectFolder(sub.id)}
                        className="px-2.5 py-1 bg-white hover:bg-black hover:text-white text-neutral-900 border border-neutral-300 rounded-none text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FolderIcon className="w-3 h-3" />
                        <span>{sub.name}</span>
                        <span className="text-[10px] opacity-70 font-mono">
                          ({activeStories.filter(s => s.folderId === sub.id).length})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stories Render */}
              <StoryContentSection
                stories={filteredStories}
                folderMap={folderMap}
                displayLayout={displayLayout}
                language={language}
                emptyMessage={t('noStoriesInFolder', language)}
                emptySubText={t('startWritingInFolder', language)}
                newStoryUrl={`/editor/new?folderId=${encodeURIComponent(selectedFolder.id)}`}
                onToggleFavorite={toggleFavorite}
                onRead={setReadingStory}
                onDelete={(id) => setItemToDelete({ id, type: 'story' })}
              />
            </div>
          )}

          {/* VIEW MODE: ALL FILES (ARCHIVE) OR FAVORITES */}
          {(viewMode === 'all' || viewMode === 'favorites') && (
            <div className="space-y-3">
              <div className="bg-white border border-neutral-300 rounded-none p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-100 border border-neutral-300 rounded-none flex items-center justify-center text-black">
                    {viewMode === 'favorites' ? <Star className="w-4 h-4 fill-black text-black" /> : <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-neutral-900 font-serif">
                      {viewMode === 'favorites' ? t('favoritesList', language) : t('browseAllFiles', language)}
                    </h2>
                    <p className="text-[11px] text-neutral-500">
                      {viewMode === 'favorites' ? t('favoritesDesc', language) : (language === 'ar' ? 'أرشيف جميع النصوص والقصص المكتوبة' : 'Complete archive of all written texts')}
                    </p>
                  </div>
                </div>

                <Link
                  href="/editor/new"
                  className="px-3 py-1 bg-black text-white rounded-none text-xs font-bold hover:bg-neutral-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('newStory', language)}</span>
                </Link>
              </div>

              {/* Stories Render */}
              <StoryContentSection
                stories={filteredStories}
                folderMap={folderMap}
                displayLayout={displayLayout}
                language={language}
                emptyMessage={viewMode === 'favorites' ? t('noFavoritesYet', language) : t('noStoriesYet', language)}
                emptySubText={viewMode === 'favorites' ? t('noFavoritesSub', language) : t('noStoriesSub', language)}
                newStoryUrl="/editor/new"
                onToggleFavorite={toggleFavorite}
                onRead={setReadingStory}
                onDelete={(id) => setItemToDelete({ id, type: 'story' })}
              />
            </div>
          )}

        </div>
      </main>

      {/* Manual Paste Modal (Smart Clipboard Fallback) - Sharp edges */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-black rounded-none shadow-2xl p-4 w-full max-w-lg space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5 font-serif">
                <Clipboard className="w-4 h-4 text-black" />
                <span>{language === 'ar' ? 'إنشاء قصة من نص الحافظة' : 'Create Story from Clipboard'}</span>
              </h3>
              <button onClick={() => setIsPasteModalOpen(false)} className="text-neutral-500 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              {language === 'ar' ? 'الصق النص المنسوخ أدناه لإنشاء قصة جديدة فوراً (السطر الأول سيكون العنوان):' : 'Paste your text below to create a new story immediately:'}
            </p>

            <textarea
              rows={6}
              value={manualPasteText}
              onChange={(e) => setManualPasteText(e.target.value)}
              placeholder={language === 'ar' ? 'الصق النص هنا...' : 'Paste text here...'}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-none p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-sans leading-relaxed"
              autoFocus
            />

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <button
                onClick={() => {
                  if (manualPasteText.trim()) {
                    createStoryFromText(manualPasteText.trim());
                    setIsPasteModalOpen(false);
                  }
                }}
                disabled={!manualPasteText.trim()}
                className="flex-1 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white py-2 text-xs font-bold rounded-none border border-black transition-colors"
              >
                {language === 'ar' ? 'إنشاء القصة الآن' : 'Create Story Now'}
              </button>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-2 text-xs font-bold rounded-none border border-neutral-300 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Reader Modal - Sharp Newspaper/Editorial Classic */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white border-2 border-black rounded-none shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-neutral-900">
            {/* Header */}
            <div className="p-3 border-b border-black flex items-center justify-between bg-neutral-100">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-mono mb-1">
                  <span className="font-bold border border-black px-1.5 py-0.2 bg-white text-black">
                    {readingStory.status === 'published' ? t('published', language) : readingStory.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                  </span>
                  {readingStory.folderId && (
                    <span>· {folderMap.get(readingStory.folderId)?.name}</span>
                  )}
                  {readingStory.targetDate && (
                    <span>· {readingStory.targetDate}</span>
                  )}
                </div>
                <h2 className="text-base font-bold text-neutral-900 font-serif truncate">
                  {readingStory.title || t('untitledStory', language)}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/editor/${readingStory.id}`}
                  className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded-none text-xs font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t('editStory', language)}</span>
                </Link>
                <button
                  onClick={() => setReadingStory(null)}
                  className="p-1 border border-neutral-300 hover:bg-black hover:text-white rounded-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reading Story Text Content */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 leading-relaxed text-sm max-w-none text-neutral-900 font-sans" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: readingStory.content || `<p class="opacity-40">${t('noContentYet', language)}</p>` }} />
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-neutral-100 border-t border-neutral-300 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-500 font-mono">
                {readingStory.content ? readingStory.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0} {t('words', language)}
              </span>
              <button
                onClick={() => setReadingStory(null)}
                className="px-3 py-1 bg-white hover:bg-neutral-200 text-neutral-900 border border-neutral-400 font-bold rounded-none text-xs"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Folder Modal - Sharp Form */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleSaveFolder} className="bg-white border-2 border-black rounded-none shadow-2xl p-4 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
              <h3 className="font-bold text-neutral-900 text-xs font-serif uppercase tracking-wider">
                {editingFolderId ? (language === 'ar' ? 'تعديل تسمية المجلد' : 'Edit Folder Name') : t('createFolder', language)}
              </h3>
              <button type="button" onClick={() => setIsFolderModalOpen(false)} className="text-neutral-500 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">{t('folderName', language)}</label>
                <input
                  type="text"
                  required
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-none px-2.5 py-1.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
                  placeholder={t('folderNamePlaceholder', language)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">{t('parentFolder', language)}</label>
                <select
                  value={folderForm.parentId}
                  onChange={(e) => setFolderForm({ ...folderForm, parentId: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-none px-2.5 py-1.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="">{t('none', language)}</option>
                  {activeFolders.filter(f => f.id !== editingFolderId).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <button
                type="submit"
                className="flex-1 bg-black hover:bg-neutral-800 text-white py-2 text-xs font-bold rounded-none border border-black transition-colors"
              >
                {t('save', language)}
              </button>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-2 text-xs font-bold rounded-none border border-neutral-300 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal - Sharp Form */}
      {itemToDelete && (() => {
        const isFolder = itemToDelete.type === 'folder';
        const targetFolder = isFolder ? folders.find(f => f.id === itemToDelete.id) : null;
        const targetStory = !isFolder ? stories.find(s => s.id === itemToDelete.id) : null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white border-2 border-black rounded-none shadow-2xl p-4 w-full max-w-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                <Trash2 className="w-4 h-4 text-black" />
                <h3 className="font-bold text-neutral-900 text-sm font-serif">
                  {isFolder ? t('deleteFolder', language) : t('moveToTrash', language)}
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-700">
                {isFolder && targetFolder && (
                  <p className="font-bold text-black border border-neutral-300 bg-neutral-50 p-2">
                    📁 {targetFolder.name}
                  </p>
                )}
                {!isFolder && targetStory && (
                  <p className="font-bold text-black border border-neutral-300 bg-neutral-50 p-2">
                    📄 {targetStory.title || t('untitledStory', language)}
                  </p>
                )}
                <p className="text-[11px] text-neutral-500">
                  {language === 'ar' ? 'سيتم نقل هذا العنصر إلى سلة المهملات، ويمكنك استعادته لاحقاً من الإعدادات.' : 'This item will be moved to the trash bin.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white py-2 text-xs font-bold rounded-none border border-black transition-colors"
                >
                  {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-2 text-xs font-bold rounded-none border border-neutral-300 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mobile Folder Drawer Modal */}
      {isMobileFolderDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 md:hidden">
          <div className="bg-white border-t-2 border-black rounded-none max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-neutral-300 flex items-center justify-between bg-neutral-50">
              <h3 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5 font-serif">
                <FolderIcon className="w-3.5 h-3.5 text-black" />
                <span>{language === 'ar' ? 'اختيار مجلد' : 'Select Folder'}</span>
              </h3>
              <button onClick={() => setIsMobileFolderDrawerOpen(false)} className="p-1 text-neutral-500 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 overflow-y-auto space-y-1 flex-1 text-xs">
              <button
                onClick={() => {
                  handleSelectFolder(null);
                  setIsMobileFolderDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-none border ${
                  selectedFolderId === null ? 'bg-black text-white border-black font-bold' : 'bg-neutral-50 text-neutral-800 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{t('allFoldersOverview', language)}</span>
                </div>
                <span className="font-mono text-[10px]">({activeFolders.length})</span>
              </button>

              {activeFolders.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    handleSelectFolder(f.id);
                    setIsMobileFolderDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-none border ${
                    selectedFolderId === f.id ? 'bg-black text-white border-black font-bold' : 'bg-white text-neutral-800 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FolderIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="font-mono text-[10px]">
                    ({activeStories.filter(s => s.folderId === f.id).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-neutral-300 bg-neutral-50">
              <button
                onClick={() => {
                  setIsMobileFolderDrawerOpen(false);
                  openAddFolder();
                }}
                className="w-full py-2 bg-black text-white text-xs font-bold rounded-none flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('createNewFolder', language)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Stories Content Section (Supports Grid & Table Views with Sharp Edges & Compact Spacing)
interface StorySectionProps {
  stories: Story[];
  folderMap: Map<string, FolderType>;
  displayLayout: 'grid' | 'table';
  language: 'ar' | 'en';
  emptyMessage: string;
  emptySubText: string;
  newStoryUrl: string;
  onToggleFavorite: (id: string) => void;
  onRead: (story: Story) => void;
  onDelete: (id: string) => void;
}

function StoryContentSection({
  stories,
  folderMap,
  displayLayout,
  language,
  emptyMessage,
  emptySubText,
  newStoryUrl,
  onToggleFavorite,
  onRead,
  onDelete
}: StorySectionProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-10 bg-white border border-neutral-300 border-dashed rounded-none p-4 space-y-2">
        <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
        <h3 className="text-sm font-bold text-neutral-800">{emptyMessage}</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">{emptySubText}</p>
        <Link
          href={newStoryUrl}
          className="inline-flex items-center gap-1 bg-black text-white px-3 py-1.5 text-xs font-bold rounded-none hover:bg-neutral-800 mt-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('newStory', language)}</span>
        </Link>
      </div>
    );
  }

  // 1. Table / List View - High Density & Sharp Lines
  if (displayLayout === 'table') {
    return (
      <div className="bg-white border border-neutral-300 rounded-none overflow-x-auto shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-300 font-bold">
            <tr>
              <th className="p-2.5 w-8 text-center">⭐</th>
              <th className="p-2.5">{language === 'ar' ? 'العنوان' : 'Title'}</th>
              <th className="p-2.5">{language === 'ar' ? 'المجلد' : 'Folder'}</th>
              <th className="p-2.5">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="p-2.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
              <th className="p-2.5">{language === 'ar' ? 'الكلمات' : 'Words'}</th>
              <th className="p-2.5 text-left">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {stories.map((story) => {
              const folder = story.folderId ? folderMap.get(story.folderId) : null;
              const wordCount = story.content ? story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0;
              const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

              return (
                <tr key={story.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onToggleFavorite(story.id)}
                      className="text-neutral-400 hover:text-black"
                      title={story.isFavorite ? t('removeFromFavorites', language) : t('addToFavorites', language)}
                    >
                      <Star className={`w-3.5 h-3.5 ${story.isFavorite ? 'fill-black text-black' : ''}`} />
                    </button>
                  </td>
                  <td className="p-2 font-bold text-neutral-900 font-serif">
                    <Link href={`/editor/${story.id}`} className="hover:underline">
                      {story.title || t('untitledStory', language)}
                    </Link>
                  </td>
                  <td className="p-2 text-neutral-600">
                    {folder ? (
                      <span className="border border-neutral-300 px-1.5 py-0.2 bg-neutral-50 text-[11px]">
                        📁 {folder.name}
                      </span>
                    ) : (
                      <span className="text-neutral-400">---</span>
                    )}
                  </td>
                  <td className="p-2">
                    <span className="border border-neutral-400 px-1.5 py-0.2 text-[10px] font-bold font-mono">
                      {statusText}
                    </span>
                  </td>
                  <td className="p-2 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                    {story.targetDate || '---'}
                  </td>
                  <td className="p-2 text-neutral-500 font-mono text-[11px]">
                    {wordCount}
                  </td>
                  <td className="p-2 text-left whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onRead(story)}
                        className="p-1 border border-neutral-300 hover:border-black hover:bg-neutral-100 rounded-none text-neutral-700"
                        title="قراءة سريعة"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/editor/${story.id}`}
                        className="p-1 border border-neutral-300 hover:border-black hover:bg-neutral-100 rounded-none text-neutral-700"
                        title={t('editStory', language)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => onDelete(story.id)}
                        className="p-1 border border-neutral-300 hover:border-black hover:bg-neutral-100 rounded-none text-neutral-700"
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

  // 2. Grid View - Sharp Rectangular Cards, Compact Padding
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      {stories.map((story) => {
        const folder = story.folderId ? folderMap.get(story.folderId) : null;
        const wordCount = story.content ? story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0;
        const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

        return (
          <div
            key={story.id}
            className="bg-white border border-neutral-300 hover:border-black rounded-none p-3 flex flex-col justify-between space-y-2 transition-colors group"
          >
            <div className="space-y-1.5">
              {/* Card Meta Row */}
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="border border-neutral-400 px-1 py-0.2 font-mono font-bold bg-neutral-50 text-black">
                    {statusText}
                  </span>
                  {folder && (
                    <span className="text-neutral-500 truncate max-w-[90px]">
                      📁 {folder.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleFavorite(story.id)}
                    className="p-1 text-neutral-400 hover:text-black"
                    title={story.isFavorite ? t('removeFromFavorites', language) : t('addToFavorites', language)}
                  >
                    <Star className={`w-3.5 h-3.5 ${story.isFavorite ? 'fill-black text-black' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-xs text-neutral-900 font-serif line-clamp-1 leading-snug group-hover:underline">
                <Link href={`/editor/${story.id}`}>
                  {story.title || t('untitledStory', language)}
                </Link>
              </h3>

              {/* Preview */}
              <div
                className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: story.content || `<span class="italic opacity-40">${t('noContentYet', language)}</span>` }}
              />
            </div>

            {/* Card Footer: Metadata + Actions */}
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
              <span>{wordCount} {t('words', language)}</span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onRead(story)}
                  className="p-1 border border-neutral-200 hover:border-black hover:bg-neutral-100 rounded-none text-neutral-700"
                  title="قراءة"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <Link
                  href={`/editor/${story.id}`}
                  className="p-1 border border-neutral-200 hover:border-black hover:bg-neutral-100 rounded-none text-neutral-700"
                  title={t('editStory', language)}
                >
                  <Edit2 className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => onDelete(story.id)}
                  className="p-1 border border-neutral-200 hover:border-black hover:bg-neutral-100 rounded-none text-neutral-700"
                  title={t('moveToTrash', language)}
                >
                  <Trash2 className="w-3 h-3" />
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
        <div className="flex items-center justify-center h-[calc(100vh-65px)] bg-neutral-100 text-neutral-600 font-mono text-xs">
          <div className="animate-spin rounded-none h-6 w-6 border-b-2 border-black"></div>
        </div>
      }
    >
      <ContentManager />
    </Suspense>
  );
}
