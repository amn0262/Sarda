'use client';

import { useState, useRef } from 'react';
import { useStore, Story, Folder as FolderType } from '@/lib/store';
import { t } from '@/lib/i18n';

import { 
  Folder as FolderIcon, 
  FileText, 
  CheckCircle, 
  Clock, 
  Plus, 
  Download, 
  Upload, 
  FileDown, 
  Edit, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  FileSpreadsheet,
  BookOpen,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function Dashboard() {
  const { folders, stories, addFolder, deleteStory, moveToTrash, importData, language } = useStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFolders = folders.filter(f => !f.isDeleted);
  const activeStories = stories.filter(s => !s.isDeleted);

  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'folder'} | null>(null);

  // Stats Calculations
  const totalFolders = activeFolders.length;
  const totalStories = activeStories.length;
  const readyStories = activeStories.filter(s => s.status === 'ready').length;
  const draftStories = activeStories.filter(s => s.status === 'draft').length;
  const publishedStories = activeStories.filter(s => s.status === 'published').length;

  // Helper: Strip HTML tags and count words
  const countWords = (html: string) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  };

  const totalWords = activeStories.reduce((acc, story) => acc + countWords(story.content), 0);

  // Get next scheduled publications
  const scheduledStories = activeStories
    .filter(s => s.targetDate && s.status !== 'published')
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3);

  // Get most recent stories
  const recentStories = [...activeStories]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 4);

  // Direct Folder Creation handler
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  // Instant PDF Exporter from Homepage
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
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
            
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Tajawal', sans-serif;
              color: #1e293b;
              line-height: 1.8;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-badge {
              display: inline-block;
              padding: 4px 12px;
              font-size: 12px;
              font-weight: bold;
              border-radius: 9999px;
              margin-bottom: 20px;
              background-color: #f1f5f9;
              color: #475569;
              border: 1px solid #e2e8f0;
            }
            
            .status-published { background-color: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
            .status-ready { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
            .status-draft { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
            
            .doc-header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              font-size: 14px;
              font-weight: bold;
              color: #4f46e5;
              margin-bottom: 10px;
            }
            
            .doc-title {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              margin: 10px 0;
              line-height: 1.3;
            }
            
            .metadata-grid {
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 15px;
              margin-top: 15px;
              font-size: 13px;
              color: #64748b;
              background-color: #f8fafc;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid #f1f5f9;
            }
            
            .metadata-item strong {
              color: #334155;
            }
            
            .doc-content {
              font-size: 16px;
              color: #334155;
              text-align: justify;
            }
            
            h1 { font-size: 24px; margin-top: 25px; margin-bottom: 15px; color: #0f172a; font-weight: 700; }
            h2 { font-size: 20px; margin-top: 20px; margin-bottom: 12px; color: #1e293b; font-weight: 700; }
            h3 { font-size: 18px; margin-top: 15px; margin-bottom: 10px; color: #334155; font-weight: 700; }
            p { margin-bottom: 15px; }
            ul, ol { padding-right: 25px; margin-bottom: 15px; }
            li { margin-bottom: 5px; }
            
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            
            blockquote {
              border-right: 4px solid #e2e8f0;
              padding-right: 15px;
              margin: 15px 0;
              color: #64748b;
              font-style: italic;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 10px;
            }
          </style>
        </head>
        <body class="text-right">
          <div class="doc-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="logo">Sarda CMS</div>
              <div class="header-badge status-${story.status}">${statusText}</div>
            </div>
            <h1 class="doc-title">${story.title || t('untitledStory', language)}</h1>
            <div class="metadata-grid">
              <div class="metadata-item"><strong>${t('folderLabel', language)}:</strong> ${folderName}</div>
              <div class="metadata-item"><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</div>
              <div class="metadata-item"><strong>${t('publishTimeLabel', language)}:</strong> ${story.publishTime || t('notSpecified', language)}</div>
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
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();
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
    <div className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 bg-slate-50 min-h-screen">
      
      {/* Welcome Hero Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-lg border border-slate-800 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="hidden md:inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('systemBadge', language)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight">{t('welcomeSarda', language)}</h1>
            <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed hidden md:block">
              {t('systemDesc', language)}
            </p>
          </div>
          
          {/* Quick Primary CTA Button */}
          <Link
            href={activeFolders.length > 0 ? `/editor/new?folderId=${activeFolders[0].id}` : '#'}
            onClick={() => {
              if (activeFolders.length === 0) {
                alert(t('createFolderFirst', language));
                setIsCreatingFolder(true);
              }
            }}
            className="shrink-0 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/20 text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>{t('newStory', language)}</span>
          </Link>
        </div>
      </motion.div>

      {/* Advanced Comprehensive Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {/* Total Folders Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px] md:min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">{t('totalFolders', language)}</span>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
              <FolderIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{totalFolders}</span>
            <span className="text-xs text-slate-400 mt-1 hidden md:block">{t('indexedFolders', language)}</span>
          </div>
        </motion.div>

        {/* Total Stories Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px] md:min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">{t('writtenStories', language)}</span>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{totalStories}</span>
            <div className="gap-2 text-[10px] text-slate-400 mt-1 hidden md:flex">
              <span className="text-emerald-600">{publishedStories} {t('published', language)}</span>
              <span>•</span>
              <span className="text-amber-600">{draftStories} {t('draft', language)}</span>
            </div>
          </div>
        </motion.div>

        {/* Total Word Count Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px] md:min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">{t('writtenWords', language)}</span>
            <div className="bg-violet-50 text-violet-600 p-2.5 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{totalWords.toLocaleString('en-US')}</span>
            <span className="text-xs text-slate-400 mt-1 hidden md:block">{t('totalTextSize', language)}</span>
          </div>
        </motion.div>

        {/* Next Publishing Goal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px] md:min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">{t('readyToPublish', language)}</span>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{readyStories}</span>
            <span className="text-xs text-slate-400 mt-1 hidden md:block">{t('readyToShare', language)}</span>
          </div>
        </motion.div>
      </div>

      {/* Control Panel: Quick Actions & Backup Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{t('quickControl', language)}</h2>
            <p className="text-xs text-slate-500 hidden md:block">{t('quickControlSub', language)}</p>
          </div>

          <div className="space-y-3">
            {/* Inline Folder Creator Toggle */}
            {isCreatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="{t('newFolderNamePlaceholder', language)}"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-indigo-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >{t('add', language)}</button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-xs hover:bg-slate-200"
                >{t('cancel', language)}</button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700 rounded-xl transition-all border border-indigo-100 font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <FolderIcon className="w-4 h-4" />
                  {t('createNewFolder', language)}
                </span>
                <Plus className="w-4 h-4" />
              </button>
            )}

            {/* Quick Link to Content Manager */}
            <Link
              href="/content"
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200/60 text-sm"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                {t('browseAllFiles', language)}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Upcoming Scheduled Story Spotlight */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{t('upcomingPublishPlan', language)}</h2>
            <p className="text-xs text-slate-500">{t('upcomingPublishPlanSub', language)}</p>
          </div>

          <div className="space-y-2">
            {scheduledStories.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                {t('noUpcomingPosts', language)}
              </div>
            ) : (
              scheduledStories.map(story => (
                <Link
                  key={story.id}
                  href={`/editor/${story.id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200/40 transition-all"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{story.title || t('untitledStory', language)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                    <span>{new Date(story.targetDate).toLocaleDateString(language === 'ar' ? 'ar' : 'en', { numberingSystem: 'latn', day: 'numeric', month: 'short' })}</span>
                    {story.publishTime && <span>({story.publishTime})</span>}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Folders Navigator Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{t('foldersAndQuickAccess', language)}</h2>
        {activeFolders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 border-dashed text-center">
            <FolderIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">{t('noFoldersYet', language)}</h3>
            <p className="text-xs text-slate-500 mb-4">{t('createFirstFolderSub', language)}</p>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="inline-flex items-center gap-1 text-sm text-indigo-600 font-bold hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" />{t('addFolderNow', language)}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeFolders.map(folder => {
              const folderStoriesCount = activeStories.filter(s => s.folderId === folder.id).length;
              return (
                <div
                  key={folder.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200/80 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <Link href={`/content`} className="flex-1 min-w-0 pr-1 flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl shrink-0">
                      <FolderIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{folder.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{folderStoriesCount} {t('savedStory', language)}</p>
                    </div>
                  </Link>

                  {/* Add story directly into this folder shortcut */}
                  <Link
                    href={`/editor/new?folderId=${folder.id}`}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                    title={t('writeNewStoryInFolder', language)}
                  >
                    <Plus className="w-5 h-5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Bottom Section: Recent Stories List & Instant PDF Portal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">{t('recentStories', language)}</h2>
          <Link href="/content" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">{t('viewAll', language)}</Link>
        </div>

        {recentStories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 border-dashed text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">{t('noStoriesYet', language)}</h3>
            <p className="text-xs text-slate-500">{t('noStoriesSub', language)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentStories.map((story) => {
              const wordCount = countWords(story.content);
              const folderName = folders.find(f => f.id === story.folderId)?.name || t('uncategorized', language);
              return (
                <motion.div
                  key={story.id}
                  layout
                  className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-2 md:space-y-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {folderName}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full ${getStatusColor(story.status)}`}>
                        {getStatusText(story.status)}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-1">{story.title || t('untitled', language)}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{wordCount} {t('words', language)}</span>
                      <span>•</span>
                      <span>{t('updated', language)} {new Date(story.updatedAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en', { numberingSystem: 'latn', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-1.5">
                      {/* Edit */}
                      <Link
                        href={`/editor/${story.id}`}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-100 transition-colors"
                        title={t('editStory', language)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      {/* Instant PDF Export Button */}
                      <button
                        onClick={() => handleExportPDF(story)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-100 transition-colors"
                        title={t('downloadPdf', language)}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setItemToDelete({ id: story.id, type: 'story' })}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition-colors"
                        title={t('moveToTrash', language)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
