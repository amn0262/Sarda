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
  FolderPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function Dashboard() {
  const { folders, stories, addFolder, moveToTrash, language } = useStore();
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
    <div className="p-3 md:p-5 max-w-7xl mx-auto space-y-3 md:space-y-4 bg-neutral-100 min-h-screen text-neutral-900">
      
      {/* Welcome Hero Panel - Sharp Box & Compact */}
      <div className="bg-black text-white rounded-none p-4 md:p-6 border border-black shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              {t('systemBadge', language)}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-serif">
              {t('welcomeSarda', language)}
            </h1>
            <p className="text-neutral-400 text-xs max-w-xl leading-relaxed hidden sm:block">
              {t('systemDesc', language)}
            </p>
          </div>
          
          {/* Quick Primary CTA Button - Sharp Edges */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={activeFolders.length > 0 ? `/editor/new?folderId=${activeFolders[0].id}` : '#'}
              onClick={() => {
                if (activeFolders.length === 0) {
                  alert(t('createFolderFirst', language));
                  setIsCreatingFolder(true);
                }
              }}
              className="bg-white hover:bg-neutral-200 text-black px-4 py-2 font-bold flex items-center justify-center gap-1.5 transition-colors text-xs rounded-none border border-white"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newStory', language)}</span>
            </Link>

            <Link
              href="/content"
              className="bg-transparent hover:bg-neutral-900 text-white px-3.5 py-2 font-bold flex items-center justify-center gap-1.5 transition-colors text-xs rounded-none border border-neutral-600"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('contentManager', language)}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Grid - Sharp Rectangular Cards & Compact Spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {/* Total Folders */}
        <div className="bg-white rounded-none p-3.5 border border-neutral-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>{t('totalFolders', language)}</span>
            <FolderIcon className="w-4 h-4 text-black" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono">{totalFolders}</span>
            <span className="text-[10px] text-neutral-400 font-mono">{t('indexedFolders', language)}</span>
          </div>
        </div>

        {/* Total Stories */}
        <div className="bg-white rounded-none p-3.5 border border-neutral-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>{t('writtenStories', language)}</span>
            <FileText className="w-4 h-4 text-black" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono">{totalStories}</span>
            <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
              <span>{publishedStories} {t('published', language)}</span>
              <span>·</span>
              <span>{draftStories} {t('draft', language)}</span>
            </div>
          </div>
        </div>

        {/* Written Words */}
        <div className="bg-white rounded-none p-3.5 border border-neutral-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>{t('writtenWords', language)}</span>
            <BookOpen className="w-4 h-4 text-black" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono">{totalWords.toLocaleString('en-US')}</span>
            <span className="text-[10px] text-neutral-400 font-mono">{t('words', language)}</span>
          </div>
        </div>

        {/* Ready to Publish */}
        <div className="bg-white rounded-none p-3.5 border border-neutral-300 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span>{t('readyToPublish', language)}</span>
            <CheckCircle className="w-4 h-4 text-black" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900 font-mono">{readyStories}</span>
            <span className="text-[10px] text-neutral-400 font-mono">{t('readyToShare', language)}</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Quick Actions & Upcoming Spotlight - Sharp & Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-none p-3.5 border border-neutral-300 flex flex-col justify-between space-y-2.5">
          <div className="border-b border-neutral-200 pb-1.5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">{t('quickControl', language)}</h2>
            <span className="text-[10px] text-neutral-400 font-mono">PANEL</span>
          </div>

          <div className="space-y-2">
            {isCreatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex flex-col gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder={t('newFolderNamePlaceholder', language)}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 text-xs rounded-none focus:outline-none focus:border-black bg-white text-neutral-900"
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="submit"
                    className="bg-black text-white px-3 py-1 rounded-none text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    {t('add', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="bg-white text-neutral-700 px-3 py-1 rounded-none text-xs font-semibold hover:bg-neutral-100 transition-colors border border-neutral-300"
                  >
                    {t('cancel', language)}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-none transition-colors border border-neutral-300 text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-black" />
                  {t('createNewFolder', language)}
                </span>
                <Plus className="w-3.5 h-3.5 text-black" />
              </button>
            )}

            <Link
              href="/content"
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-900 rounded-none transition-colors border border-neutral-300 text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-700" />
                {t('browseAllFiles', language)}
              </span>
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-700" />
            </Link>
          </div>
        </div>

        {/* Upcoming Scheduled Story Spotlight */}
        <div className="bg-white rounded-none p-3.5 border border-neutral-300 flex flex-col justify-between space-y-2.5">
          <div className="border-b border-neutral-200 pb-1.5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-900 font-serif uppercase tracking-wider">{t('upcomingPublishPlan', language)}</h2>
            <Link href="/schedule" className="text-[10px] text-black font-bold hover:underline font-mono">{t('viewSchedule', language)}</Link>
          </div>

          <div className="space-y-1.5">
            {scheduledStories.length === 0 ? (
              <div className="py-4 text-center text-xs text-neutral-400 border border-dashed border-neutral-300 rounded-none">
                {t('noUpcomingPosts', language)}
              </div>
            ) : (
              scheduledStories.map(story => (
                <Link
                  key={story.id}
                  href={`/editor/${story.id}`}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="font-semibold text-neutral-900 truncate font-serif">{story.title || t('untitledStory', language)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono shrink-0">
                    <span>{story.targetDate}</span>
                    {story.publishTime && <span>({story.publishTime})</span>}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Folders Navigator Grid - Sharp & Compact */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-neutral-300 pb-1.5">
          <h2 className="text-sm font-bold text-neutral-900 font-serif uppercase tracking-wider">{t('foldersAndQuickAccess', language)}</h2>
          <Link href="/content" className="text-xs font-bold text-black hover:underline">{t('viewAll', language)}</Link>
        </div>

        {activeFolders.length === 0 ? (
          <div className="bg-white rounded-none p-6 border border-neutral-300 border-dashed text-center space-y-1.5">
            <FolderIcon className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-xs font-bold text-neutral-900">{t('noFoldersYet', language)}</h3>
            <p className="text-[11px] text-neutral-500">{t('createFirstFolderSub', language)}</p>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="inline-flex items-center gap-1 text-xs text-black font-bold hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />{t('addFolderNow', language)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {activeFolders.slice(0, 8).map(folder => {
              const folderStoriesCount = activeStories.filter(s => s.folderId === folder.id).length;
              return (
                <div
                  key={folder.id}
                  className="bg-white rounded-none p-2.5 border border-neutral-300 hover:border-black transition-colors flex items-center justify-between"
                >
                  <Link href={`/content?folderId=${encodeURIComponent(folder.id)}`} className="flex-1 min-w-0 pr-1 flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-black shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-900 text-xs truncate font-serif">{folder.name}</h3>
                      <p className="text-[10px] text-neutral-400 font-mono">{folderStoriesCount} {t('savedStory', language)}</p>
                    </div>
                  </Link>

                  <Link
                    href={`/editor/new?folderId=${folder.id}`}
                    className="p-1 hover:bg-neutral-100 rounded-none text-neutral-600 hover:text-black transition-colors"
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

      {/* Main Bottom Section: Recent Stories List - Sharp & Dense */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-neutral-300 pb-1.5">
          <h2 className="text-sm font-bold text-neutral-900 font-serif uppercase tracking-wider">{t('recentStories', language)}</h2>
          <Link href="/content" className="text-xs font-bold text-black hover:underline">{t('viewAll', language)}</Link>
        </div>

        {recentStories.length === 0 ? (
          <div className="bg-white rounded-none p-6 border border-neutral-300 border-dashed text-center text-xs text-neutral-500">
            {t('noStoriesYet', language)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recentStories.map((story) => {
              const wordCount = countWords(story.content);
              const folderName = folders.find(f => f.id === story.folderId)?.name || t('uncategorized', language);
              return (
                <div
                  key={story.id}
                  className="bg-white rounded-none p-3 border border-neutral-300 hover:border-black transition-colors flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1 gap-1 text-[10px]">
                      <span className="font-mono text-neutral-600 border border-neutral-300 px-1 py-0.2 bg-neutral-50">
                        {folderName}
                      </span>
                      <span className="font-mono font-bold border border-neutral-400 px-1 py-0.2">
                        {getStatusText(story.status)}
                      </span>
                    </div>

                    <h3 className="text-xs md:text-sm font-bold text-neutral-900 line-clamp-1 font-serif">
                      <Link href={`/editor/${story.id}`} className="hover:underline">
                        {story.title || t('untitled', language)}
                      </Link>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-[10px] text-neutral-500 font-mono">
                    <span>{wordCount} {t('words', language)} · {new Date(story.updatedAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en', { numberingSystem: 'latn', day: 'numeric', month: 'short' })}</span>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/editor/${story.id}`}
                        className="p-1 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black rounded-none transition-colors"
                        title={t('editStory', language)}
                      >
                        <Edit className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleExportPDF(story)}
                        className="p-1 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black rounded-none transition-colors"
                        title={t('downloadPdf', language)}
                      >
                        <FileDown className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => setItemToDelete({ id: story.id, type: 'story' })}
                        className="p-1 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black rounded-none transition-colors"
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
        )}
      </div>

      {/* Delete Confirmation Modal - Sharp */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white border-2 border-black rounded-none shadow-2xl p-4 w-full max-w-sm space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 font-serif">{t('confirmTrashTitle', language)}</h3>
              <p className="text-xs text-neutral-600">{t('confirmTrashSub', language)}</p>
              <div className="flex gap-2 pt-2 border-t border-neutral-200">
                <button
                  onClick={() => {
                    moveToTrash(itemToDelete.id, itemToDelete.type);
                    setItemToDelete(null);
                  }}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white py-1.5 rounded-none font-bold text-xs border border-black transition-colors"
                >
                  {t('moveToTrash', language)}
                </button>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-1.5 rounded-none font-semibold text-xs border border-neutral-300 transition-colors"
                >
                  {t('cancel', language)}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
