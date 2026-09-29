'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { searchAllStories, SearchMatchItem } from '@/lib/searchUtils';
import {
  Search,
  X,
  Folder as FolderIcon,
  ChevronRight,
  ChevronLeft,
  Calendar,
  FileText,
  Sparkles,
  Command,
  ArrowRight,
  Moon,
  Sun
} from 'lucide-react';
import { clsx } from 'clsx';

export default function GlobalSearchHeader() {
  const router = useRouter();
  const { stories, folders, language, isFocusMode, theme, toggleTheme } = useStore();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute live search results instantly
  const searchData = useMemo(() => {
    return searchAllStories(query, stories, folders);
  }, [query, stories, folders]);

  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking outside to close results dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: SearchMatchItem) => {
    setIsOpen(false);
    const encodedHighlight = encodeURIComponent(query.trim());
    router.push(`/editor/${item.story.id}?highlight=${encodedHighlight}`);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchData.results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchData.results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchData.results.length) % searchData.results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchData.results[selectedIndex]) {
        handleSelectResult(searchData.results[selectedIndex]);
      }
    }
  };

  // If focus mode is active, do not render header to preserve writing immersion
  if (isFocusMode) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#121214]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 select-none">
      
      {/* Global Search Bar (Apple macOS Spotlight Style) */}
      <div ref={containerRef} className="relative flex-1 max-w-2xl mx-auto w-full">
        <div
          className={clsx(
            'flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all duration-200',
            isOpen
              ? 'bg-white dark:bg-[#1C1C1E] border-black/20 dark:border-white/20 shadow-md ring-2 ring-black/5 dark:ring-white/10'
              : 'bg-neutral-100/90 dark:bg-[#1C1C1E] hover:bg-white dark:hover:bg-[#252528] border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20 shadow-2xs'
          )}
        >
          <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder={t('globalSearchPlaceholder', language)}
            className="w-full bg-transparent text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />

          {/* Results count live badge when typing */}
          {query.trim().length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={clsx(
                  'text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full transition-all',
                  searchData.totalResults > 0
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
              >
                {searchData.totalResults} {t('resultsFound', language)}
              </span>

              {/* Clear button */}
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Keyboard shortcut hint (⌘K) */}
          {query.trim().length === 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 bg-white/80 dark:bg-white/10 border border-black/8 dark:border-white/10 px-1.5 py-0.5 rounded-lg font-mono">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Live Search Results Dropdown Window (Apple Spotlight Style) */}
        {isOpen && query.trim().length > 0 && (
          <div
            className="absolute top-full mt-2 inset-x-0 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] flex flex-col"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Results Header: Shows Live Count */}
            <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/10 bg-neutral-50/80 dark:bg-[#252528]/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {language === 'ar'
                    ? `نتائج البحث عن «${query}»:`
                    : `Search results for "${query}":`}
                </span>
                <span className="bg-blue-600 dark:bg-blue-500 text-white text-[11px] font-bold px-2 py-0.2 rounded-full ms-1">
                  {searchData.totalResults}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {t('clickToOpenAndHighlight', language)}
              </span>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-1.5 flex-1 divide-y divide-black/5 dark:divide-white/10">
              {searchData.results.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2 text-neutral-500 dark:text-neutral-400">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E] flex items-center justify-center mx-auto text-neutral-400 dark:text-neutral-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {t('noSearchResults', language)}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {language === 'ar'
                      ? 'تأكد من كتابة الكلمة بشكل صحيح، أو ابحث بكلمة مفتاحية أخرى.'
                      : 'Make sure the keyword is spelled correctly or try another term.'}
                  </p>
                </div>
              ) : (
                searchData.results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const statusClass =
                    item.story.status === 'published'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : item.story.status === 'ready'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20';

                  return (
                    <div
                      key={item.story.id}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={clsx(
                        'p-3 rounded-xl transition-all cursor-pointer group text-right flex flex-col gap-1.5',
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-700/50 shadow-2xs'
                          : 'hover:bg-neutral-50 dark:hover:bg-[#2C2C2E]/60 border border-transparent'
                      )}
                    >
                      {/* Folder Breadcrumb Path */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg max-w-[85%] truncate">
                          <FolderIcon className="w-3.5 h-3.5 shrink-0 fill-blue-500/20" />
                          {item.folderPath.length > 0 ? (
                            <span className="truncate">
                              {item.folderPath.map((f, i) => (
                                <span key={f.id}>
                                  {i > 0 && <span className="text-neutral-300 dark:text-neutral-600 mx-1">/</span>}
                                  {f.name}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                              {t('uncategorized', language)}
                            </span>
                          )}
                        </div>

                        {/* Total matches in this story */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                          {item.totalMatches} {t('matchedWordsCount', language)}
                        </span>
                      </div>

                      {/* Story Title */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {item.story.title || t('untitledStory', language)}
                        </h4>
                        <span className={clsx('text-[10px] px-2 py-0.2 rounded-full font-medium shrink-0', statusClass)}>
                          {item.story.status === 'published'
                            ? t('published', language)
                            : item.story.status === 'ready'
                            ? t('readyToPublish', language)
                            : t('draft', language)}
                        </span>
                      </div>

                      {/* Snippet with Highlighted Query */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed bg-white/70 dark:bg-[#121214]/60 p-2 rounded-lg border border-black/5 dark:border-white/10">
                        <span className="text-neutral-400 dark:text-neutral-500">{item.snippetBefore}</span>
                        <mark className="bg-amber-300 dark:bg-amber-400 text-neutral-950 font-bold px-1 py-0.5 rounded shadow-2xs">
                          {item.snippetMatch || query}
                        </mark>
                        <span className="text-neutral-400 dark:text-neutral-500">{item.snippetAfter}</span>
                      </p>

                      {/* Footer Info & Prompt */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.story.targetDate || '---'}</span>
                          </span>
                        </div>

                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] flex items-center gap-1 group-hover:underline">
                          <span>{language === 'ar' ? 'فتح وتحديد الكلمات' : 'Open & Highlight'}</span>
                          <ChevronIcon className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer Tip */}
            {searchData.results.length > 0 && (
              <div className="px-3.5 py-2 border-t border-black/5 dark:border-white/10 bg-neutral-50/80 dark:bg-[#252528]/80 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                <span>
                  {language === 'ar'
                    ? 'استخدم الأسهم ↑ ↓ للتنقل و Enter للفتح المباشر'
                    : 'Use ↑ ↓ arrows to navigate and Enter to open'}
                </span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {searchData.totalResults} {t('resultsFound', language)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Theme Toggle Button (Apple macOS Style) */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-xl bg-neutral-100/90 hover:bg-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 border border-black/5 dark:border-white/10 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center"
        title={t('toggleTheme', language)}
        aria-label={t('toggleTheme', language)}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-neutral-700" />
        )}
      </button>
    </header>
  );
}
