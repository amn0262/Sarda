'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore, Story } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  ExternalLink,
  Minimize2,
  Maximize2,
  X,
  Copy,
  Check,
  Edit3,
  BookOpen,
  Plus,
  FolderOpen,
  ChevronDown
} from 'lucide-react';

export default function FloatingStoryWindow() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    floatingStory,
    isFloatingStoryMinimized,
    setFloatingStory,
    setIsFloatingStoryMinimized,
    updateFloatingStoryContent,
    stories,
    folders,
    language
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStoryPicker, setShowStoryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!floatingStory) return null;

  // Filter available other stories
  const otherStories = stories.filter(
    (s) => !s.isDeleted && s.id !== floatingStory.id
  );

  const filteredOtherStories = otherStories.filter((s) =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute word count
  const rawText = floatingStory.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = rawText ? rawText.split(' ').filter(Boolean).length : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInFullEditor = () => {
    router.push(`/editor/${floatingStory.id}`);
  };

  const handleOpenAnotherStory = (targetId: string) => {
    setShowStoryPicker(false);
    router.push(`/editor/${targetId}`);
  };

  const handleCreateNewStory = () => {
    setShowStoryPicker(false);
    router.push('/editor/new');
  };

  // If minimized, display Apple-style compact floating pill
  if (isFloatingStoryMinimized) {
    return (
      <aside
        aria-label={t('floatingStoryActive', language)}
        className="fixed bottom-4 end-4 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-xl border border-neutral-300 shadow-2xl rounded-2xl p-2 px-3.5 transition-all duration-200 select-none group"
        style={{
          fontFamily: 'var(--font-apple, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFloatingStory(null)}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
            title={t('closeFloating', language)}
            aria-label={t('closeFloating', language)}
          />
          <button
            type="button"
            onClick={() => setIsFloatingStoryMinimized(false)}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"
            title={t('expandFloating', language)}
            aria-label={t('expandFloating', language)}
          />
          <button
            type="button"
            onClick={handleOpenInFullEditor}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"
            title={t('returnToFullEditor', language)}
            aria-label={t('returnToFullEditor', language)}
          />
        </div>

        <div
          onClick={() => setIsFloatingStoryMinimized(false)}
          className="flex items-center gap-2 cursor-pointer max-w-[200px] truncate"
        >
          <BookOpen className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
          <span className="text-xs font-semibold text-neutral-900 truncate">
            {floatingStory.title || t('untitled', language)}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded-full shrink-0">
            {wordCount} {t('floatingWindowWordCount', language)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsFloatingStoryMinimized(false)}
          className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
          title={t('expandFloating', language)}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label={t('floatingStoryActive', language)}
      className="fixed bottom-4 end-4 z-50 w-[92vw] sm:w-[460px] md:w-[500px] max-h-[82vh] flex flex-col bg-white/95 backdrop-blur-xl border border-neutral-300/90 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        fontFamily: 'var(--font-apple, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif)',
      }}
    >
      {/* Apple Window Titlebar */}
      <div className="bg-neutral-100/90 border-b border-neutral-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 select-none">
        {/* Apple Traffic Lights */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFloatingStory(null)}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center group"
            title={t('closeFloating', language)}
            aria-label={t('closeFloating', language)}
          >
            <X className="w-2 h-2 text-red-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={() => setIsFloatingStoryMinimized(true)}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer flex items-center justify-center group"
            title={t('minimizeFloating', language)}
            aria-label={t('minimizeFloating', language)}
          >
            <Minimize2 className="w-2 h-2 text-yellow-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={handleOpenInFullEditor}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center group"
            title={t('returnToFullEditor', language)}
            aria-label={t('returnToFullEditor', language)}
          >
            <Maximize2 className="w-2 h-2 text-green-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Center Title & Badge */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center px-1">
          <span className="text-xs font-bold text-neutral-900 truncate">
            {floatingStory.title || t('untitled', language)}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
              floatingStory.status === 'published'
                ? 'bg-neutral-900 text-white'
                : floatingStory.status === 'ready'
                ? 'bg-neutral-200 text-neutral-800'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {floatingStory.status === 'published'
              ? t('published', language)
              : floatingStory.status === 'ready'
              ? t('readyToPublish', language)
              : t('draft', language)}
          </span>
        </div>

        {/* Quick window controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-neutral-500 hover:text-black hover:bg-neutral-200/70 transition-colors"
            title={t('sideBySideCopyContent', language)}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1 rounded-md transition-colors ${
              isEditing ? 'bg-black text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-200/70'
            }`}
            title={isEditing ? t('viewAndEditStory', language) : t('edit', language)}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleOpenInFullEditor}
            className="p-1 rounded-md text-neutral-500 hover:text-black hover:bg-neutral-200/70 transition-colors"
            title={t('returnToFullEditor', language)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multitasking Bar: Allows opening another story right away */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-neutral-500 font-medium">
          {wordCount} {t('floatingWindowWordCount', language)}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStoryPicker(!showStoryPicker)}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>{t('openAnotherStory', language)}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Story Selector Dropdown Modal */}
          {showStoryPicker && (
            <div className="absolute end-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-neutral-200 p-2 z-50">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900">
                  {t('chooseStoryToOpen', language)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowStoryPicker(false)}
                  className="text-neutral-400 hover:text-black p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Create new story option */}
              <button
                type="button"
                onClick={handleCreateNewStory}
                className="w-full text-start flex items-center gap-2 p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold mb-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>{t('createNewStoryInEditor', language)}</span>
              </button>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('sideBySideSearch', language)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black mb-2"
              />

              {/* List of other stories */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredOtherStories.length > 0 ? (
                  filteredOtherStories.map((story) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => handleOpenAnotherStory(story.id)}
                      className="w-full text-start p-2 rounded-lg hover:bg-neutral-100 transition-colors flex flex-col gap-0.5"
                    >
                      <span className="text-xs font-medium text-neutral-900 truncate">
                        {story.title || t('untitled', language)}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {story.status === 'published'
                          ? t('published', language)
                          : story.status === 'ready'
                          ? t('readyToPublish', language)
                          : t('draft', language)}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-3">
                    {t('sideBySideNoStories', language)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Story Content Body */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] min-h-[160px] bg-white text-neutral-900 text-sm leading-relaxed">
        {isEditing ? (
          <textarea
            value={rawText}
            onChange={(e) => {
              const html = `<p dir="rtl">${e.target.value.replace(/\n/g, '</p><p dir="rtl">')}</p>`;
              updateFloatingStoryContent(html);
            }}
            placeholder={t('noContentYet', language)}
            className="w-full h-full min-h-[200px] border-none focus:outline-none resize-none font-sans text-right text-sm leading-relaxed"
            dir="rtl"
          />
        ) : (
          <div
            className="prose prose-neutral prose-sm max-w-none text-right font-sans"
            dir="rtl"
            dangerouslySetInnerHTML={{
              __html: floatingStory.content || `<p class="text-neutral-400">${t('noContentYet', language)}</p>`,
            }}
          />
        )}
      </div>

      {/* Floating Window Footer */}
      <div className="bg-neutral-50/90 border-t border-neutral-200/80 px-3.5 py-2 flex items-center justify-between text-[11px] text-neutral-500">
        <span>{t('floatingStoryActive', language)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenInFullEditor}
            className="font-bold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('returnToFullEditor', language)}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
