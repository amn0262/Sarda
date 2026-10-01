'use client';

import { useEffect } from 'react';
import { Story, useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  X, 
  Clock, 
  Calendar, 
  Folder as FolderIcon
} from 'lucide-react';

interface StoryReaderModalProps {
  story: Story | null;
  onClose: () => void;
  folderName?: string;
}

export default function StoryReaderModal({ story, onClose, folderName }: StoryReaderModalProps) {
  const { language } = useStore();

  // Close on Escape key press
  useEffect(() => {
    if (!story) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [story, onClose]);

  if (!story) return null;

  // Words count & Estimated reading time
  const cleanText = story.content ? story.content.replace(/<[^>]*>/g, '').trim() : '';
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readingTimeText = language === 'ar' 
    ? (readingMinutes === 1 ? 'دقيقة واحدة' : readingMinutes === 2 ? 'دقيقتان' : `${readingMinutes} دقائق للقراءة`)
    : `${readingMinutes} min read`;

  // Status text
  const statusText = story.status === 'published'
    ? t('published', language)
    : story.status === 'ready'
    ? t('readyToPublish', language)
    : t('draft', language);

  const statusColor = story.status === 'published'
    ? 'text-emerald-700 dark:text-emerald-400'
    : story.status === 'ready'
    ? 'text-amber-700 dark:text-amber-400'
    : 'text-neutral-500 dark:text-neutral-400';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 dark:bg-black/75 backdrop-blur-md p-3 sm:p-6 md:p-10 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FCFCFD] dark:bg-[#18181B] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden text-neutral-900 dark:text-white border border-black/8 dark:border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Reader Header - macOS Style with ONLY ONE TOOL: CLOSE */}
        <header className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-4 bg-white/70 dark:bg-[#202024]/70 backdrop-blur-xl shrink-0 select-none">
          {/* Contextual Info (Status & Folder) */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 me-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 dark:border-white/10 inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 dark:border-white/10 inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 dark:border-white/10 inline-block shadow-2xs"></span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
              <span className={`font-semibold ${statusColor}`}>
                {statusText}
              </span>
              {folderName && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span className="flex items-center gap-1 truncate text-neutral-600 dark:text-neutral-300">
                    <FolderIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{folderName}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* THE ONLY TOOL: CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0"
            title={language === 'ar' ? 'إغلاق (Esc)' : 'Close (Esc)'}
            autoFocus
          >
            <X className="w-4 h-4" />
            <span>{language === 'ar' ? 'إغلاق' : 'Close'}</span>
          </button>
        </header>

        {/* Story Reading Content Body */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 md:p-14 space-y-8">
          {/* Article Header */}
          <div className="border-b border-black/5 dark:border-white/10 pb-6 space-y-4 text-right">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white leading-snug tracking-tight">
              {story.title || t('untitledStory', language)}
            </h1>

            {/* Clean Unboxed Metadata */}
            <div className="flex items-center justify-end gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{readingTimeText}</span>
              </span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>{wordCount} {t('words', language)}</span>
              {story.targetDate && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{story.targetDate}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Article Reading Typography */}
          <article 
            className="prose prose-neutral dark:prose-invert max-w-none text-right font-sans text-neutral-800 dark:text-neutral-100 text-base sm:text-lg leading-[2.2] tracking-normal selection:bg-blue-100 dark:selection:bg-blue-900/40"
            dir="rtl"
            dangerouslySetInnerHTML={{ 
              __html: story.content || `<p class="italic text-neutral-400 dark:text-neutral-500">${t('noContentYet', language)}</p>` 
            }}
          />
        </div>

        {/* Quiet Reader Status Bar (No repeated buttons) */}
        <footer className="px-6 py-3 bg-neutral-100/50 dark:bg-[#202024]/50 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium select-none">
          <span>
            SARDA CMS · {language === 'ar' ? 'وضع القراءة والعرض' : 'Reading & Display Mode'}
          </span>
          <span className="hidden sm:inline text-[11px] text-neutral-400 dark:text-neutral-500">
            {language === 'ar' ? 'يمكنك الضغط على زر Esc للإغلاق في أي وقت' : 'Press Esc to close'}
          </span>
        </footer>
      </div>
    </div>
  );
}
