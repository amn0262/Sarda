'use client';

import { useState } from 'react';
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
  ArrowLeft,
  Trash2,
  FolderPlus,
  ExternalLink,
  Search
} from 'lucide-react';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function Dashboard() {
  const { folders, stories, addFolder, moveToTrash, language, setFloatingStory } = useStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const activeFolders = folders.filter(f => !f.isDeleted);
  const activeStories = stories.filter(s => !s.isDeleted);

  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);

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
    .filter(s => s.targetDate && s.status !== 'published')
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3);

  const recentStories = [...activeStories]
    .sort((a, b) => b.updatedAt - a.updatedAt)
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

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-36 md:pb-16 max-w-7xl mx-auto space-y-5 bg-[#F5F5F7] dark:bg-[#121214] min-h-screen text-neutral-900 dark:text-neutral-100">
      
      {/* Welcome Hero Panel - Apple macOS Frosted Banner */}
      <div className="bg-neutral-900 dark:bg-[#18181B] text-white rounded-3xl p-6 md:p-8 border border-white/10 shadow-sm relative overflow-hidden">
        {/* Subtle macOS Traffic Lights on Hero */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block opacity-80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block opacity-80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block opacity-80"></span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              {t('systemBadge', language)}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {t('welcomeSarda', language)}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              {t('systemDesc', language)}
            </p>
          </div>
          
          {/* Quick Primary CTA Button - Apple Squircle Pill */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href={activeFolders.length > 0 ? `/editor/new?folderId=${activeFolders[0].id}` : '#'}
              onClick={() => {
                if (activeFolders.length === 0) {
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
              href="/content"
              className="bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 font-semibold flex items-center justify-center gap-2 transition-all text-xs rounded-xl border border-white/15 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('contentManager', language)}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 font-semibold flex items-center justify-center gap-2 transition-all text-xs rounded-xl border border-white/15 active:scale-95 cursor-pointer"
              title={language === 'ar' ? 'البحث الفوري في جميع القصص' : 'Instant Search All Stories'}
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>{language === 'ar' ? 'بحث في القصص (⌘K)' : 'Search Stories (⌘K)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Grid - Apple Widget Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Folders */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('totalFolders', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{totalFolders}</span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">{t('indexedFolders', language)}</span>
          </div>
        </div>

        {/* Total Stories */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('writtenStories', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
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
        </div>

        {/* Written Words */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
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

        {/* Ready to Publish */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
            <span>{t('readyToPublish', language)}</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{readyStories}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">{t('readyToShare', language)}</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Quick Actions & Upcoming Spotlight - Apple Card Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        
        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="border-b border-black/5 dark:border-white/10 pb-2.5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white tracking-tight uppercase">{t('quickControl', language)}</h2>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{language === 'ar' ? 'فوري' : 'Live'}</span>
          </div>

          <div className="space-y-2">
            {isCreatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex flex-col gap-2 bg-neutral-50 dark:bg-[#252528] p-3 rounded-xl border border-black/5 dark:border-white/10">
                <input
                  type="text"
                  autoFocus
                  placeholder={t('newFolderNamePlaceholder', language)}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/10 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="submit"
                    className="bg-neutral-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {t('add', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="bg-white dark:bg-[#2C2C2E] text-neutral-700 dark:text-neutral-300 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-[#3A3A3C] transition-all border border-black/10 dark:border-white/10 cursor-pointer"
                  >
                    {t('cancel', language)}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] text-neutral-900 dark:text-white rounded-xl transition-all border border-black/5 dark:border-white/10 text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('createNewFolder', language)}
                </span>
                <Plus className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </button>
            )}

            <Link
              href="/content"
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] text-neutral-900 dark:text-white rounded-xl transition-all border border-black/5 dark:border-white/10 text-xs font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                {t('browseAllFiles', language)}
              </span>
              <ArrowLeft className="w-4 h-4 text-neutral-400 dark:text-neutral-500 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Upcoming Scheduled Story Spotlight */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="border-b border-black/5 dark:border-white/10 pb-2.5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white tracking-tight uppercase">{t('upcomingPublishPlan', language)}</h2>
            <Link href="/schedule" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">{t('viewSchedule', language)}</Link>
          </div>

          <div className="space-y-2">
            {scheduledStories.length === 0 ? (
              <div className="py-5 text-center text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-neutral-50/50 dark:bg-[#252528]/50">
                {t('noUpcomingPosts', language)}
              </div>
            ) : (
              scheduledStories.map(story => (
                <Link
                  key={story.id}
                  href={`/editor/${story.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#252528] hover:bg-neutral-100/80 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/10 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Calendar className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">{story.title || t('untitledStory', language)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0 font-medium bg-white dark:bg-[#1C1C1E] px-2 py-0.5 rounded-full border border-black/5 dark:border-white/10">
                    <span>{story.targetDate}</span>
                    {story.publishTime && <span>({story.publishTime})</span>}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Folders Navigator Grid - Apple Finder Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight uppercase">{t('foldersAndQuickAccess', language)}</h2>
          <Link href="/content" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t('viewAll', language)}</Link>
        </div>

        {activeFolders.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-8 border border-dashed border-black/10 dark:border-white/10 text-center space-y-2">
            <FolderIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{t('noFoldersYet', language)}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('createFirstFolderSub', language)}</p>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />{t('addFolderNow', language)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeFolders.slice(0, 8).map(folder => {
              const folderStoriesCount = activeStories.filter(s => s.folderId === folder.id).length;
              return (
                <div
                  key={folder.id}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-3.5 border border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
                >
                  <Link href={`/content?folderId=${encodeURIComponent(folder.id)}`} className="flex-1 min-w-0 pr-1 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FolderIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-900 dark:text-white text-xs truncate">{folder.name}</h3>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">{folderStoriesCount} {t('savedStory', language)}</p>
                    </div>
                  </Link>

                  <Link
                    href={`/editor/new?folderId=${folder.id}`}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    title={t('writeNewStoryInFolder', language)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Bottom Section: Recent Stories List - Apple Notes Card Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight uppercase">{t('recentStories', language)}</h2>
          <Link href="/content" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t('viewAll', language)}</Link>
        </div>

        {recentStories.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-8 border border-black/5 dark:border-white/10 border-dashed text-center text-xs text-neutral-500 dark:text-neutral-400">
            {t('noStoriesYet', language)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentStories.map((story) => {
              const wordCount = countWords(story.content);
              const folderName = folders.find(f => f.id === story.folderId)?.name || t('uncategorized', language);
              
              const statusBadgeClass = story.status === 'published'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                : story.status === 'ready'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200/60 dark:border-neutral-700/40';

              return (
                <div
                  key={story.id}
                  className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 gap-1.5 text-xs">
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-[#252528] px-2 py-0.5 rounded-full font-medium">
                        📁 {folderName}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeClass}`}>
                        {getStatusText(story.status)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                      <Link href={`/editor/${story.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {story.title || t('untitled', language)}
                      </Link>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/10 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="font-medium">{wordCount} {t('words', language)} · {new Date(story.updatedAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en', { numberingSystem: 'latn', day: 'numeric', month: 'short' })}</span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setFloatingStory(story)}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                        title={t('quickFloatStory', language)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/editor/${story.id}`}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                        title={t('editStory', language)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleExportPDF(story)}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                        title={t('downloadPdf', language)}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setItemToDelete({ id: story.id, type: 'story' })}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/60 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all cursor-pointer"
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
        )}
      </div>

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
                  onClick={() => {
                    moveToTrash(itemToDelete.id, itemToDelete.type);
                    setItemToDelete(null);
                  }}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  {t('moveToTrash', language)}
                </button>
                <button
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

      {/* Scroll to Top floating button */}
      <ScrollToTopButton />
    </div>
  );
}
