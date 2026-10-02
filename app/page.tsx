'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useStore, Story } from '@/lib/store';
import { t } from '@/lib/i18n';

import { 
  Folder as FolderIcon, 
  FileText, 
  CheckCircle, 
  Plus, 
  FileDown, 
  Edit, 
  Calendar, 
  FileSpreadsheet, 
  BookOpen, 
  Trash2, 
  FolderPlus, 
  ExternalLink, 
  MoreHorizontal, 
  Clock, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import StoryReaderModal from '@/components/StoryReaderModal';
import { AnimatePresence } from 'motion/react';
import Link from 'next/link';

const emptySubscribe = () => () => {};

export default function Dashboard() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { folders, stories, addFolder, moveToTrash, language, setFloatingStory } = useStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [readingStory, setReadingStory] = useState<Story | null>(null);
  const [menuOpenStoryId, setMenuOpenStoryId] = useState<string | null>(null);

  const activeFolders = isClient ? folders.filter(f => !f.isDeleted) : [];
  const activeStories = isClient ? stories.filter(s => !s.isDeleted) : [];

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'story' | 'folder' } | null>(null);

  // Close card menus on outside click
  useEffect(() => {
    const handleWindowClick = () => setMenuOpenStoryId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Stats Calculations
  const totalFolders = activeFolders.length;
  const totalStories = activeStories.length;
  const readyStories = activeStories.filter(s => s.status === 'ready').length;
  const draftStories = activeStories.filter(s => s.status === 'draft').length;
  const publishedStories = activeStories.filter(s => s.status === 'published').length;

  const countWords = (html: string) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  };

  const totalWords = activeStories.reduce((acc, story) => acc + countWords(story.content), 0);

  const scheduledStories = activeStories
    .filter(s => s && s.targetDate && s.status !== 'published')
    .sort((a, b) => (new Date(a.targetDate).getTime() || 0) - (new Date(b.targetDate).getTime() || 0))
    .slice(0, 3);

  const recentStories = [...activeStories]
    .filter(Boolean)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 4);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleExportPDF = (story: Story) => {
    const folderName = folders.find(f => f.id === story.folderId)?.name || t('uncategorized', language);
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) return;
    
    const formattedDate = story.targetDate ? new Date(story.targetDate).toLocaleDateString(language === 'ar' ? 'ar' : 'en', {
      numberingSystem: 'latn',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : t('notSpecified', language);

    const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);
    
    iframeDoc.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>${story.title || t('untitledStory', language)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
            @page { size: A4; margin: 15mm; }
            body {
              font-family: 'Tajawal', sans-serif;
              color: #000000;
              line-height: 1.8;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .header-badge {
              display: inline-block;
              padding: 2px 8px;
              font-size: 11px;
              font-weight: bold;
              border: 1px solid #000000;
              background-color: #000000;
              color: #ffffff;
            }
            .doc-header {
              border-bottom: 2px solid #000000;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }
            .doc-title {
              font-size: 22px;
              font-weight: 900;
              color: #000000;
              margin: 8px 0;
            }
            .metadata-grid {
              font-size: 11px;
              color: #333333;
              margin-top: 8px;
            }
            .doc-content {
              font-size: 14px;
              color: #111111;
              min-height: 400px;
            }
            .footer {
              font-size: 10px;
              color: #555555;
              border-top: 1px solid #000000;
              padding-top: 8px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body class="text-right">
          <div class="doc-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 900; font-size: 14px;">SARDA CMS</div>
              <div class="header-badge">${statusText}</div>
            </div>
            <h1 class="doc-title">${story.title || t('untitledStory', language)}</h1>
            <div class="metadata-grid">
              <span><strong>${t('folderLabel', language)}:</strong> ${folderName}</span> · 
              <span><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</span>
            </div>
          </div>
          <div class="doc-content">
            ${story.content}
          </div>
          <div class="footer">
            ${t('exportedBySarda', language)} © ${new Date().getFullYear()}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 100);
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return t('draft', language);
      case 'ready': return t('readyToPublish', language);
      case 'published': return t('published', language);
      default: return status;
    }
  };

  // Time-aware greeting
  const currentHour = isClient ? new Date().getHours() : null;
  const timeGreeting = language === 'ar'
    ? (currentHour === null ? 'أهلاً بك' : currentHour < 12 ? 'صباح الخير' : currentHour < 17 ? 'أهلاً بك' : 'مساء الخير')
    : (currentHour === null ? 'Welcome' : currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening');

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-40 md:pb-16 max-w-7xl mx-auto space-y-6 bg-[#F5F5F7] dark:bg-[#121214] min-h-screen text-neutral-900 dark:text-neutral-100">
      
      {/* 1. Welcome Hero Panel - Apple macOS Frosted Glass */}
      <div className="bg-neutral-900 dark:bg-[#18181B] text-white rounded-3xl p-6 md:p-8 border border-white/10 shadow-sm relative overflow-hidden">
        {/* Subtle macOS Traffic Lights decoration */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block opacity-80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block opacity-80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block opacity-80"></span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SARDA CMS · {t('systemBadge', language)}</span>
            </div>
            <h1 suppressHydrationWarning className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {timeGreeting}، {t('welcomeSarda', language)}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              {language === 'ar' 
                ? `لديك ${totalStories} قصة محفوظة في ${totalFolders} مجلدات، منها ${readyStories} قصة جاهزة للنشر.` 
                : `You have ${totalStories} stories organized in ${totalFolders} folders, with ${readyStories} ready for publication.`}
            </p>
          </div>
          
          {/* Focused Primary Actions - NO DUPLICATE BUTTONS */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href={activeFolders.length > 0 ? `/editor/new?folderId=${activeFolders[0].id}` : '#'}
              onClick={(e) => {
                if (activeFolders.length === 0) {
                  e.preventDefault();
                  alert(t('createFolderFirst', language));
                  setIsCreatingFolder(true);
                }
              }}
              className="bg-white hover:bg-neutral-100 text-neutral-900 px-4 py-2.5 font-bold flex items-center justify-center gap-2 transition-all text-xs rounded-xl shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newStory', language)}</span>
            </Link>

            <Link
              href="/schedule"
              className="bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 font-semibold flex items-center justify-center gap-2 transition-all text-xs rounded-xl border border-white/15 active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-purple-300" />
              <span>{language === 'ar' ? 'مخطط النشر' : 'Schedule'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Statistics - Apple Widget Clean Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Stories */}
        <Link 
          href="/content"
          className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:border-black/15 dark:hover:border-white/20 hover:shadow-xs transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('writtenStories', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{totalStories}</span>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-medium">
              <span>{publishedStories} {t('published', language)}</span>
              <span>·</span>
              <span>{draftStories} {t('draft', language)}</span>
            </div>
          </div>
        </Link>

        {/* Ready to Publish */}
        <Link 
          href="/schedule"
          className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:border-black/15 dark:hover:border-white/20 hover:shadow-xs transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('readyToPublish', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{readyStories}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {readyStories > 0 ? (language === 'ar' ? 'جاهزة للمشاركة' : 'Ready') : '---'}
            </span>
          </div>
        </Link>

        {/* Total Folders */}
        <Link 
          href="/content"
          className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:border-black/15 dark:hover:border-white/20 hover:shadow-xs transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('totalFolders', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{totalFolders}</span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">{t('indexedFolders', language)}</span>
          </div>
        </Link>

        {/* Written Words */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('writtenWords', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{totalWords.toLocaleString('en-US')}</span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">{t('words', language)}</span>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Workspace: Upcoming Schedule & Folders Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Upcoming Scheduled Stories */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="border-b border-black/5 dark:border-white/10 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white tracking-tight uppercase">
                {t('upcomingPublishPlan', language)}
              </h2>
            </div>
            <Link 
              href="/schedule" 
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>{t('viewSchedule', language)}</span>
              <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-[-90deg]" />
            </Link>
          </div>

          <div className="space-y-2">
            {scheduledStories.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-neutral-50/50 dark:bg-[#252528]/50">
                {t('noUpcomingPosts', language)}
              </div>
            ) : (
              scheduledStories.map(story => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setReadingStory(story)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 transition-all text-xs cursor-pointer text-right group"
                  title={language === 'ar' ? 'عرض القصة' : 'View Story'}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                    <span className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {story.title || t('untitledStory', language)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0 font-medium">
                    <span>{story.targetDate}</span>
                    {story.publishTime && <span>({story.publishTime})</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Folders Explorer with Clean Inline Creation */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="border-b border-black/5 dark:border-white/10 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white tracking-tight uppercase">
                {t('foldersAndQuickAccess', language)}
              </h2>
            </div>
            
            {!isCreatingFolder ? (
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'مجلد جديد' : 'New Folder'}</span>
              </button>
            ) : null}
          </div>

          {/* Inline Folder Creation Form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className="flex items-center gap-2 bg-neutral-50 dark:bg-[#252528] p-2 rounded-xl border border-black/5 dark:border-white/10">
              <input
                type="text"
                autoFocus
                placeholder={t('newFolderNamePlaceholder', language)}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-black/10 dark:border-white/10 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-white placeholder-neutral-400"
              />
              <button
                type="submit"
                className="bg-neutral-900 dark:bg-white dark:text-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {t('add', language)}
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="text-neutral-500 hover:text-black dark:hover:text-white px-2 py-1.5 text-xs font-medium cursor-pointer"
              >
                {t('cancel', language)}
              </button>
            </form>
          )}

          {/* Folders List Grid */}
          {activeFolders.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-neutral-50/50 dark:bg-[#252528]/50">
              {t('noFoldersYet', language)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeFolders.slice(0, 4).map(folder => {
                const count = activeStories.filter(s => s.folderId === folder.id).length;
                return (
                  <Link
                    key={folder.id}
                    href={`/content?folderId=${encodeURIComponent(folder.id)}`}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 transition-all text-xs group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FolderIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {folder.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {count} {t('savedStory', language)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 4. Recent Stories Section - Spacious Cards with Zero Button Duplication */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight uppercase">
              {t('recentStories', language)}
            </h2>
          </div>
          <Link 
            href="/content" 
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll', language)}</span>
            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-[-90deg]" />
          </Link>
        </div>

        {recentStories.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-8 border border-black/5 dark:border-white/10 border-dashed text-center text-xs text-neutral-500 dark:text-neutral-400">
            {t('noStoriesYet', language)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentStories.map((story) => {
              const wordCount = countWords(story.content);
              const folderName = folders.find(f => f.id === story.folderId)?.name || t('uncategorized', language);
              
              const statusText = getStatusText(story.status);
              const statusClass = story.status === 'published'
                ? 'text-emerald-700 dark:text-emerald-400'
                : story.status === 'ready'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-neutral-500 dark:text-neutral-400';

              const isMenuOpen = menuOpenStoryId === story.id;

              return (
                <div
                  key={story.id}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 relative"
                >
                  <div className="space-y-2">
                    {/* Quiet Metadata Bar (No Pill Enclosures) */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                        <span className="truncate">📁 {folderName}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${statusClass}`}>{statusText}</span>
                      </div>
                      
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium shrink-0">
                        {wordCount} {t('words', language)}
                      </span>
                    </div>

                    {/* Story Title - Click to Read */}
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1">
                      <button
                        type="button"
                        onClick={() => setReadingStory(story)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-right cursor-pointer truncate w-full"
                        title={language === 'ar' ? 'عرض القصة' : 'View Story'}
                      >
                        {story.title || t('untitled', language)}
                      </button>
                    </h3>

                    {/* Clean Content Excerpt */}
                    <div 
                      onClick={() => setReadingStory(story)}
                      className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                      dangerouslySetInnerHTML={{ __html: story.content || `<span class="italic opacity-40">${t('noContentYet', language)}</span>` }}
                    />
                  </div>

                  {/* Card Actions Footer - Clean Dedicated Edit Button + Options Menu */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-xs">
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                      {new Date(story.updatedAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en', { numberingSystem: 'latn', day: 'numeric', month: 'short' })}
                    </span>

                    <div className="flex items-center gap-1.5 relative">
                      {/* 1. DEDICATED EDIT BUTTON */}
                      <Link
                        href={`/editor/${story.id}?mode=edit`}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-900 dark:text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 text-xs"
                        title={t('editStory', language)}
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{t('editStory', language)}</span>
                      </Link>

                      {/* 2. MORE UTILITY OPTIONS MENU (NO OVERLAPPING BUTTONS) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenStoryId(prev => prev === story.id ? null : story.id);
                          }}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-xl transition-all cursor-pointer"
                          title={language === 'ar' ? 'المزيد من الخيارات' : 'More options'}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Options Dropdown */}
                        {isMenuOpen && (
                          <div 
                            className="absolute end-0 bottom-full mb-1.5 w-48 bg-white dark:bg-[#252528] rounded-2xl shadow-xl border border-black/8 dark:border-white/10 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setFloatingStory(story);
                                setMenuOpenStoryId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors text-right cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                              <span>{t('quickFloatStory', language)}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleExportPDF(story);
                                setMenuOpenStoryId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors text-right cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5 text-amber-500" />
                              <span>{t('downloadPdf', language)}</span>
                            </button>

                            <div className="my-1 border-t border-black/5 dark:border-white/10" />

                            <button
                              type="button"
                              onClick={() => {
                                setItemToDelete({ id: story.id, type: 'story' });
                                setMenuOpenStoryId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-right cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t('moveToTrash', language)}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Bottom Dock Safety Spacer - Guarantees zero element overlap */}
      <div className="h-12 md:hidden w-full pointer-events-none" aria-hidden="true" />

      {/* Story Presentation View Modal - With Single Close Button */}
      <StoryReaderModal
        story={readingStory}
        onClose={() => setReadingStory(null)}
        folderName={readingStory?.folderId ? folders.find(f => f.id === readingStory.folderId)?.name : undefined}
      />

      {/* Delete Confirmation Modal - Apple macOS Window Style */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white/95 dark:bg-[#1C1C1E] backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-4 border border-black/8 dark:border-white/10 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#252528] text-black dark:text-white border border-black/5 dark:border-white/10 mx-auto flex items-center justify-center shadow-2xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('confirmTrashTitle', language)}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{t('confirmTrashSub', language)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    moveToTrash(itemToDelete.id, itemToDelete.type);
                    setItemToDelete(null);
                  }}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  {t('moveToTrash', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3A3A3C] text-neutral-800 dark:text-neutral-200 py-2.5 rounded-xl font-semibold text-xs border border-black/5 dark:border-white/10 transition-all cursor-pointer"
                >
                  {t('cancel', language)}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Scroll to Top button */}
      <ScrollToTopButton />
    </div>
  );
}
