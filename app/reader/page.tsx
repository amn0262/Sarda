'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore, Story, Folder as FolderType, Bookmark } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Type,
  Search,
  Folder as FolderIcon,
  FileText,
  ArrowRight,
  X,
  Clock,
  Check,
  SlidersHorizontal,
  FolderOpen,
  Star,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

// Split HTML story content into balanced, readable pages (~280-320 words or by paragraph blocks)
function splitContentIntoPages(htmlContent: string): string[] {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return ['<p class="text-neutral-400">لا يوجد محتوى في هذه القصة حتى الآن.</p>'];
  }

  // Parse HTML into blocks
  if (typeof window === 'undefined') {
    return [htmlContent];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const childNodes = Array.from(doc.body.children);

  if (childNodes.length === 0) {
    const text = doc.body.textContent || '';
    if (!text.trim()) return ['<p class="text-neutral-400">لا يوجد محتوى في هذه القصة حتى الآن.</p>'];
    return [htmlContent];
  }

  const pages: string[] = [];
  let currentPageHTML = '';
  let currentWordCount = 0;
  const TARGET_WORDS_PER_PAGE = 260; // Optimal reading chunk

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    const nodeText = node.textContent || '';
    const wordsInNode = nodeText.trim().split(/\s+/).filter(Boolean).length;

    // If node is a heading (h1, h2) and we already have content, start a new page
    const isMajorHeading = ['H1', 'H2'].includes(node.tagName);

    if ((currentWordCount > 0 && isMajorHeading) || (currentWordCount + wordsInNode > TARGET_WORDS_PER_PAGE && currentWordCount >= 140)) {
      pages.push(currentPageHTML);
      currentPageHTML = node.outerHTML;
      currentWordCount = wordsInNode;
    } else {
      currentPageHTML += node.outerHTML;
      currentWordCount += wordsInNode;
    }
  }

  if (currentPageHTML.trim()) {
    pages.push(currentPageHTML);
  }

  return pages.length > 0 ? pages : [htmlContent];
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyParam = searchParams.get('storyId');
  const pageParam = searchParams.get('page');

  const {
    stories,
    folders,
    language,
    bookmarks,
    addBookmark,
    removeBookmark,
    lastRead,
    setLastRead,
    readerSettings,
    setReaderSettings,
    fontFamilyPreference
  } = useStore();

  const activeStories = useMemo(() => stories.filter(s => !s.isDeleted), [stories]);
  const activeFolders = useMemo(() => folders.filter(f => !f.isDeleted), [folders]);

  const folderMap = useMemo(() => {
    const map = new Map<string, FolderType>();
    activeFolders.forEach(f => map.set(f.id, f));
    return map;
  }, [activeFolders]);

  // Determine current active story
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(() => {
    if (storyParam && activeStories.some(s => s.id === storyParam)) {
      return storyParam;
    }
    if (lastRead?.storyId && activeStories.some(s => s.id === lastRead.storyId)) {
      return lastRead.storyId;
    }
    return activeStories[0]?.id || null;
  });

  // Sync if URL param changes
  const [prevStoryParam, setPrevStoryParam] = useState(storyParam);
  if (storyParam !== prevStoryParam) {
    setPrevStoryParam(storyParam);
    if (storyParam && activeStories.some(s => s.id === storyParam)) {
      setSelectedStoryId(storyParam);
    }
  }

  const currentStory = useMemo(() => {
    return activeStories.find(s => s.id === selectedStoryId) || null;
  }, [activeStories, selectedStoryId]);

  // Pages of current story
  const pages = useMemo(() => {
    if (!currentStory) return [];
    return splitContentIntoPages(currentStory.content);
  }, [currentStory]);

  const totalPages = Math.max(1, pages.length);

  // Current page state
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= 1) return p;
    }
    if (currentStory && lastRead && lastRead.storyId === currentStory.id) {
      return Math.min(Math.max(1, lastRead.page), totalPages);
    }
    return 1;
  });

  // Keep currentPage within bounds during render
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  if (currentPage !== safeCurrentPage) {
    setCurrentPage(safeCurrentPage);
  }

  // Record reading progress in store whenever story or page changes
  useEffect(() => {
    if (currentStory) {
      setLastRead(currentStory.id, currentPage);
    }
  }, [currentStory, currentPage, setLastRead]);

  // Reading container ref for scroll to top on page change
  const readingAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readingAreaRef.current) {
      readingAreaRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentPage, selectedStoryId]);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Story selector drawer / modal
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');

  // Bookmarks modal / drawer
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState(false);

  // Settings dropdown / popover
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Bookmark check for current story & page
  const currentBookmark = useMemo(() => {
    if (!currentStory) return null;
    return bookmarks.find(b => b.storyId === currentStory.id && b.page === currentPage);
  }, [bookmarks, currentStory, currentPage]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentStory) return;

    if (currentBookmark) {
      removeBookmark(currentBookmark.id);
      setToastMessage(language === 'ar' ? 'تمت إزالة العلامة المرجعية' : 'Bookmark removed');
    } else {
      // Extract short snippet from current page
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pages[currentPage - 1] || '';
      const text = tempDiv.textContent || tempDiv.innerText || '';
      const excerpt = text.trim().slice(0, 100) + (text.length > 100 ? '...' : '');

      addBookmark({
        storyId: currentStory.id,
        page: currentPage,
        title: currentStory.title || (language === 'ar' ? 'قصة بدون عنوان' : 'Untitled Story'),
        excerpt
      });
      setToastMessage(t('bookmarkAdded', language));
    }
  }, [currentStory, currentBookmark, removeBookmark, addBookmark, pages, currentPage, language]);

  // Keyboard navigation: Left/Right arrows for flipping pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        // In RTL, left arrow moves to next page; in LTR, moves to prev
        if (language === 'ar') {
          if (currentPage < totalPages) setCurrentPage(p => p + 1);
        } else {
          if (currentPage > 1) setCurrentPage(p => p - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (language === 'ar') {
          if (currentPage > 1) setCurrentPage(p => p - 1);
        } else {
          if (currentPage < totalPages) setCurrentPage(p => p + 1);
        }
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey) {
        handleToggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, language, toggleFullscreen, handleToggleBookmark]);

  // Story selector filtered list
  const filteredLibraryStories = useMemo(() => {
    return activeStories.filter(s => {
      const matchesSearch = !librarySearch.trim() ||
        s.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
        s.content.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesFolder = selectedFolderFilter === 'all' || s.folderId === selectedFolderFilter;
      return matchesSearch && matchesFolder;
    });
  }, [activeStories, librarySearch, selectedFolderFilter]);

  // Reader Themes config
  const themeStyles = {
    white: {
      bg: 'bg-white text-neutral-900',
      headerBg: 'bg-white/95 border-b border-neutral-200/80',
      footerBg: 'bg-white/95 border-t border-neutral-200/80',
      proseColor: 'text-[#18181B]',
      cardBg: 'bg-neutral-100',
      buttonBg: 'hover:bg-neutral-100 text-neutral-700',
      accentColor: 'text-blue-600'
    },
    offwhite: {
      // The warm classic reading cream
      bg: 'bg-[#FDFBF7] text-[#2C241E]',
      headerBg: 'bg-[#FDFBF7]/95 border-b border-[#EBE4D5]',
      footerBg: 'bg-[#FDFBF7]/95 border-t border-[#EBE4D5]',
      proseColor: 'text-[#2D241E]',
      cardBg: 'bg-[#F4EFE6]',
      buttonBg: 'hover:bg-[#F2ECE0] text-[#4A3E35]',
      accentColor: 'text-amber-800'
    },
    sepia: {
      // Warm vintage parchment
      bg: 'bg-[#F4ECD8] text-[#332517]',
      headerBg: 'bg-[#F4ECD8]/95 border-b border-[#DFCFA8]',
      footerBg: 'bg-[#F4ECD8]/95 border-t border-[#DFCFA8]',
      proseColor: 'text-[#2B1F13]',
      cardBg: 'bg-[#E8DDBF]',
      buttonBg: 'hover:bg-[#E5D7B5] text-[#3D2C1B]',
      accentColor: 'text-amber-900'
    },
    dark: {
      // OLED night
      bg: 'bg-[#121214] text-[#E4E4E7]',
      headerBg: 'bg-[#121214]/95 border-b border-white/10',
      footerBg: 'bg-[#121214]/95 border-t border-white/10',
      proseColor: 'text-[#E4E4E7]',
      cardBg: 'bg-[#1C1C1E]',
      buttonBg: 'hover:bg-white/10 text-neutral-300',
      accentColor: 'text-blue-400'
    }
  };

  const currentTheme = readerSettings?.theme || 'offwhite';
  const themeConfig = themeStyles[currentTheme] || themeStyles.offwhite;
  const currentFontSize = readerSettings?.fontSize || 19;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'min-h-screen flex flex-col transition-colors duration-100 select-none relative',
        themeConfig.bg,
        isFullscreen && 'fixed inset-0 z-50 overflow-hidden'
      )}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 dark:bg-black/95 text-white border border-white/15 px-4 py-2 text-xs font-semibold shadow-2xl rounded-full flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Top Bar (Apple macOS / iPadOS Reading Navigation) */}
      <header className={clsx(
        'h-14 px-4 flex items-center justify-between shrink-0 sticky top-0 z-30 backdrop-blur-md',
        themeConfig.headerBg
      )}>
        {/* Left Section: Back / Exit & Library Selector */}
        <div className="flex items-center gap-2">
          {!isFullscreen ? (
            <Link
              href="/"
              className={clsx('p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer', themeConfig.buttonBg)}
              title={language === 'ar' ? 'الرجوع للرئيسية' : 'Back to Dashboard'}
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={toggleFullscreen}
              className={clsx('p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer', themeConfig.buttonBg)}
              title={t('exitFullscreen', language)}
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('exitFullscreen', language)}</span>
            </button>
          )}

          {/* Library Stories Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsLibraryDrawerOpen(true)}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-black/5 dark:border-white/10 shadow-2xs',
              themeConfig.cardBg
            )}
            title={t('selectStoryToRead', language)}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span className="max-w-[140px] sm:max-w-[220px] truncate">
              {currentStory ? currentStory.title : (language === 'ar' ? 'اختر قصة للقراءة' : 'Select Story')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Center: Story Title and Reading Progress Badge */}
        {currentStory && (
          <div className="hidden md:flex flex-col items-center justify-center text-center px-4">
            <span className="text-xs font-bold truncate max-w-sm">
              {currentStory.title}
            </span>
            <span className="text-[10px] opacity-60 font-mono">
              {t('pageOf', language)} {currentPage} / {totalPages}
            </span>
          </div>
        )}

        {/* Right Section: Bookmark, Reader Display Settings & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Bookmark Button */}
          {currentStory && (
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={clsx(
                'p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5',
                currentBookmark
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                  : themeConfig.buttonBg
              )}
              title={currentBookmark ? (language === 'ar' ? 'إزالة العلامة المرجعية' : 'Remove Bookmark') : t('addBookmark', language)}
            >
              {currentBookmark ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
              <span className="hidden lg:inline text-xs">
                {currentBookmark ? (language === 'ar' ? 'محفوظة' : 'Saved') : t('bookmark', language)}
              </span>
            </button>
          )}

          {/* Saved Bookmarks Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsBookmarksDrawerOpen(true)}
            className={clsx('p-2 rounded-xl text-xs transition-colors cursor-pointer relative', themeConfig.buttonBg)}
            title={t('bookmarksList', language)}
          >
            <Layers className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -start-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>

          {/* Reader Display Ergonomics Settings Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={clsx('p-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1', themeConfig.buttonBg)}
              title={language === 'ar' ? 'خيارات الخط والخلفية' : 'Reading Display Settings'}
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Display Settings Menu */}
            {isSettingsOpen && (
              <div
                className="absolute top-full mt-2 end-0 w-72 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4 space-y-4 z-50 text-neutral-900 dark:text-neutral-100"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2.5">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                    <span>{language === 'ar' ? 'تخصيص القراءة' : 'Reading Settings'}</span>
                  </span>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Background Theme Selection */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-2 block">
                    {t('readingTheme', language)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'offwhite', label: t('readerThemeOffWhite', language), colorClass: 'bg-[#FDFBF7] text-[#2C241E] border-[#EBE4D5]' },
                      { id: 'white', label: t('readerThemeWhite', language), colorClass: 'bg-white text-neutral-900 border-neutral-300' },
                      { id: 'sepia', label: t('readerThemeSepia', language), colorClass: 'bg-[#F4ECD8] text-[#332517] border-[#DFCFA8]' },
                      { id: 'dark', label: t('readerThemeDark', language), colorClass: 'bg-[#121214] text-white border-white/20' }
                    ].map(th => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setReaderSettings({ theme: th.id as any })}
                        className={clsx(
                          'p-2 rounded-xl text-xs font-semibold border flex items-center justify-between cursor-pointer transition-colors',
                          th.colorClass,
                          currentTheme === th.id && 'ring-2 ring-blue-500 font-bold'
                        )}
                      >
                        <span className="truncate">{th.label}</span>
                        {currentTheme === th.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Font Size Control */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-2">
                    <span>{t('readingFontSize', language)}</span>
                    <span className="font-mono text-neutral-900 dark:text-neutral-100">{currentFontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-black/40 p-1.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setReaderSettings({ fontSize: Math.max(14, currentFontSize - 1) })}
                      className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      title="تصغير الخط"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min={14}
                      max={30}
                      value={currentFontSize}
                      onChange={(e) => setReaderSettings({ fontSize: Number(e.target.value) })}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setReaderSettings({ fontSize: Math.min(30, currentFontSize + 1) })}
                      className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      title="تكبير الخط"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* 3. Line Spacing */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 block">
                    {language === 'ar' ? 'تباعد الأسطر' : 'Line Spacing'}
                  </label>
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-black/40 p-1 rounded-xl text-xs font-semibold">
                    {[
                      { id: 'normal', label: language === 'ar' ? 'عادي' : 'Normal' },
                      { id: 'relaxed', label: language === 'ar' ? 'مريح' : 'Relaxed' },
                      { id: 'loose', label: language === 'ar' ? 'واسع' : 'Loose' }
                    ].map(lh => (
                      <button
                        key={lh.id}
                        type="button"
                        onClick={() => setReaderSettings({ lineHeight: lh.id as any })}
                        className={clsx(
                          'flex-1 py-1 rounded-lg text-center cursor-pointer transition-colors',
                          (readerSettings?.lineHeight || 'relaxed') === lh.id
                            ? 'bg-white dark:bg-[#2C2C2E] shadow-2xs font-bold'
                            : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        )}
                      >
                        {lh.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={clsx('p-2 rounded-xl text-xs transition-colors cursor-pointer', themeConfig.buttonBg)}
            title={isFullscreen ? t('exitFullscreen', language) : t('fullscreen', language)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reading Viewport */}
      <main
        ref={readingAreaRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 md:py-16 flex flex-col items-center justify-start min-h-0"
      >
        {currentStory ? (
          <div className="w-full max-w-2xl sm:max-w-3xl space-y-6">
            {/* Story Meta Header (Page 1 only) */}
            {currentPage === 1 && (
              <div className="border-b border-black/10 dark:border-white/10 pb-6 text-center space-y-3">
                {currentStory.folderId && folderMap.get(currentStory.folderId) && (
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60 inline-flex items-center gap-1.5">
                    <FolderIcon className="w-3.5 h-3.5" />
                    <span>{folderMap.get(currentStory.folderId)?.name}</span>
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {currentStory.title}
                </h1>
                <div className="flex items-center justify-center gap-3 text-xs opacity-60 font-medium">
                  {currentStory.targetDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentStory.targetDate}</span>
                    </span>
                  )}
                  <span>·</span>
                  <span>{currentStory.content?.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length || 0} {t('wordsCount', language)}</span>
                  <span>·</span>
                  <span>{totalPages} {language === 'ar' ? 'صفحات' : 'pages'}</span>
                </div>
              </div>
            )}

            {/* Page Header Indicator (Pages > 1) */}
            {currentPage > 1 && (
              <div className="flex items-center justify-between text-xs opacity-50 border-b border-black/5 dark:border-white/10 pb-2 font-mono">
                <span className="truncate max-w-[250px]">{currentStory.title}</span>
                <span>{currentPage} / {totalPages}</span>
              </div>
            )}

            {/* Page Content Body with User-Controlled Font Size and Line Height */}
            <article
              style={{
                fontSize: `${currentFontSize}px`,
                lineHeight: readerSettings?.lineHeight === 'loose' ? '2.1' : readerSettings?.lineHeight === 'normal' ? '1.65' : '1.85'
              }}
              className={clsx(
                'prose max-w-none font-medium transition-all select-text',
                themeConfig.proseColor,
                readerSettings?.lineHeight === 'loose' ? 'leading-loose' : readerSettings?.lineHeight === 'normal' ? 'leading-normal' : 'leading-relaxed'
              )}
              dangerouslySetInnerHTML={{ __html: pages[currentPage - 1] || '' }}
            />
          </div>
        ) : (
          /* Empty State: No stories in app or none selected */
          <div className="text-center py-20 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{language === 'ar' ? 'مرحباً بك في قسم القراءة' : 'Welcome to Reader Studio'}</h2>
              <p className="text-xs opacity-70 mt-1.5 leading-relaxed">
                {language === 'ar'
                  ? 'اختر أي قصة من مكتبتك للبدء في قراءتها بأعلى درجات الراحة والتركيز، مع حفظ تلقائي لآخر صفحة وعلاماتك المرجعية.'
                  : 'Select any story from your library to read with zero distractions, automatic last-page memory, and custom bookmarks.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLibraryDrawerOpen(true)}
              className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            >
              {language === 'ar' ? 'تصفح قصص المكتبة' : 'Browse Stories Library'}
            </button>
          </div>
        )}
      </main>

      {/* Reader Bottom Bar: Page Turn Navigation & Jump Slider */}
      {currentStory && (
        <footer className={clsx(
          'h-16 px-4 shrink-0 sticky bottom-0 z-30 flex items-center justify-between backdrop-blur-md',
          themeConfig.footerBg
        )}>
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={clsx(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              currentPage <= 1
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
            )}
            title={t('prevPage', language)}
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            <span className="hidden sm:inline">{t('prevPage', language)}</span>
          </button>

          {/* Center: Interactive Page Slider & Direct Jump */}
          <div className="flex items-center gap-3 max-w-xs sm:max-w-md w-full justify-center">
            <span className="text-xs font-bold font-mono opacity-80 min-w-[28px] text-center">
              {currentPage}
            </span>

            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-32 sm:w-56 accent-blue-600 cursor-pointer"
              title={language === 'ar' ? 'التنقل السريع بين الصفحات' : 'Jump across pages'}
            />

            <span className="text-xs font-bold font-mono opacity-80 min-w-[28px] text-center">
              {totalPages}
            </span>
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className={clsx(
              'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              currentPage >= totalPages
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
            )}
            title={t('nextPage', language)}
          >
            <span className="hidden sm:inline">{t('nextPage', language)}</span>
            <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </footer>
      )}

      {/* ---------------------------------------------------- */}
      {/* Drawer 1: Library File & Story Selector Drawer        */}
      {/* ---------------------------------------------------- */}
      {isLibraryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-neutral-100 w-full max-w-md h-full shadow-2xl flex flex-col border-e border-black/10 dark:border-white/10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{language === 'ar' ? 'فهرس القصص والمجلدات' : 'Stories Index'}</h3>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {activeStories.length} {language === 'ar' ? 'قصة متاحة للقراءة' : 'stories ready to read'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryDrawerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-black/5 dark:border-white/10 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث في العناوين والمحتوى...' : 'Search stories...'}
                  className="w-full bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl ps-9 pe-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Folder Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedFolderFilter('all')}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors',
                    selectedFolderFilter === 'all'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold'
                      : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  )}
                >
                  {language === 'ar' ? 'جميع المجلدات' : 'All Folders'}
                </button>
                {activeFolders.map(folder => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderFilter(folder.id)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors',
                      selectedFolderFilter === folder.id
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-bold'
                        : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    )}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stories List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredLibraryStories.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  {language === 'ar' ? 'لا توجد قصص مطابقة للبحث' : 'No matching stories found'}
                </div>
              ) : (
                filteredLibraryStories.map(story => {
                  const isCurrent = story.id === selectedStoryId;
                  const folder = story.folderId ? folderMap.get(story.folderId) : null;
                  const wordCount = story.content?.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length || 0;

                  return (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => {
                        setSelectedStoryId(story.id);
                        // If this story has a recorded last-read page, start there, otherwise page 1
                        if (lastRead && lastRead.storyId === story.id) {
                          setCurrentPage(lastRead.page || 1);
                        } else {
                          setCurrentPage(1);
                        }
                        setIsLibraryDrawerOpen(false);
                      }}
                      className={clsx(
                        'w-full text-start p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group',
                        isCurrent
                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400'
                          : 'bg-neutral-50 dark:bg-[#252528] border-black/5 dark:border-white/10 hover:border-black/20 text-neutral-800 dark:text-neutral-200'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {folder && (
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium truncate">
                              {folder.name} ·
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {wordCount} {t('wordsCount', language)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold truncate group-hover:text-blue-500 transition-colors">
                          {story.title}
                        </h4>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white shrink-0">
                          {language === 'ar' ? 'يُقرأ الآن' : 'Reading'}
                        </span>
                      ) : (
                        <ChevronLeft className="w-4 h-4 opacity-40 group-hover:opacity-100 rtl:rotate-0 ltr:rotate-180 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setIsLibraryDrawerOpen(false)} />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Drawer 2: Saved Bookmarks Drawer                     */}
      {/* ---------------------------------------------------- */}
      {isBookmarksDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-neutral-100 w-full max-w-md h-full shadow-2xl flex flex-col border-e border-black/10 dark:border-white/10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <BookmarkIcon className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t('bookmarksList', language)}</h3>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {bookmarks.length} {language === 'ar' ? 'علامة محفوظة للرجوع السريع' : 'saved bookmarks'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookmarksDrawerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-neutral-400 text-xs">
                  <BookmarkIcon className="w-8 h-8 mx-auto opacity-30" />
                  <p>{t('noBookmarksYet', language)}</p>
                  <p className="text-[11px] opacity-70">
                    {language === 'ar'
                      ? 'أثناء قراءة أي قصة، انقر فوق أيقونة العلامة المرجعية في الشريط العلوي لتثبيت الصفحة.'
                      : 'While reading any story, click the bookmark icon in the top bar to save your position.'}
                  </p>
                </div>
              ) : (
                bookmarks.map(b => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-neutral-50 dark:bg-[#252528] rounded-2xl border border-black/5 dark:border-white/10 space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStoryId(b.storyId);
                          setCurrentPage(b.page);
                          setIsBookmarksDrawerOpen(false);
                        }}
                        className="font-bold text-xs hover:text-blue-500 text-start truncate flex-1 cursor-pointer"
                      >
                        {b.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBookmark(b.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                        title={t('removeBookmark', language)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {b.excerpt && (
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed italic">
                        &ldquo;{b.excerpt}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-neutral-400">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {t('pageOf', language)} {b.page}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStoryId(b.storyId);
                          setCurrentPage(b.page);
                          setIsBookmarksDrawerOpen(false);
                        }}
                        className="text-blue-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'الانتقال للصفحة' : 'Jump to page'}</span>
                        <ChevronLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setIsBookmarksDrawerOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#2C241E] text-xs font-semibold">
        جاري تحميل قسم القراءة...
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
