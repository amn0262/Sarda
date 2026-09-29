'use client';

import { useState, useMemo } from 'react';
import { useStore, StoryStatus, Story } from '@/lib/store';
import { t } from "@/lib/i18n";
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, 
  Search, Filter, ArrowUpDown, LayoutList, CalendarDays, FolderOpen, 
  Edit2, Eye, FileDown, Sparkles, ChevronLeft, ChevronRight, Plus, X, Folder as FolderIcon
} from 'lucide-react';
import { format, isBefore, isToday, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { motion } from 'motion/react';
import ScrollToTopButton from '@/components/ScrollToTopButton';

type ViewMode = 'detailed' | 'compact' | 'calendar' | 'folder';
type SortOption = 'dateAsc' | 'dateDesc' | 'title' | 'status';

export default function SchedulePlanner() {
  const { stories, folders, updateStory, language } = useStore();

  const activeStories = useMemo(() => stories.filter(s => !s.isDeleted), [stories]);
  const activeFolders = useMemo(() => folders.filter(f => !f.isDeleted), [folders]);

  const folderMap = useMemo(() => {
    const map = new Map<string, any>();
    activeFolders.forEach(f => map.set(f.id, f));
    return map;
  }, [activeFolders]);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dateAsc');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Quick edit modal
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Story Reader Modal
  const [readingStory, setReadingStory] = useState<Story | null>(null);

  // Scheduled stories with dates
  const scheduledStories = useMemo(() => {
    return activeStories.filter(s => s.targetDate);
  }, [activeStories]);

  // Statistics KPI
  const stats = useMemo(() => {
    const now = new Date();
    let total = scheduledStories.length;
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;

    scheduledStories.forEach(s => {
      const d = parseISO(s.targetDate);
      if (isToday(d)) {
        dueToday++;
      } else if (isBefore(d, now) && s.status !== 'published') {
        overdue++;
      } else {
        upcoming++;
      }
    });

    return { total, dueToday, overdue, upcoming };
  }, [scheduledStories]);

  // Filtered & Sorted stories
  const processedStories = useMemo(() => {
    let list = [...scheduledStories];

    if (folderFilter !== 'all') {
      list = list.filter(s => s.folderId === folderFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        const now = new Date();
        list = list.filter(s => isBefore(parseISO(s.targetDate), now) && !isToday(parseISO(s.targetDate)) && s.status !== 'published');
      } else {
        list = list.filter(s => s.status === statusFilter);
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

    list.sort((a, b) => {
      if (sortBy === 'dateAsc') {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      if (sortBy === 'dateDesc') {
        return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    return list;
  }, [scheduledStories, folderFilter, statusFilter, searchQuery, sortBy, folderMap]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  const handleQuickStatusChange = (storyId: string, newStatus: StoryStatus) => {
    updateStory(storyId, { status: newStatus });
  };

  const openRescheduleModal = (story: Story) => {
    setEditingScheduleId(story.id);
    setRescheduleDate(story.targetDate || '');
    setRescheduleTime(story.publishTime || '');
  };

  const handleSaveReschedule = () => {
    if (editingScheduleId && rescheduleDate) {
      updateStory(editingScheduleId, {
        targetDate: rescheduleDate,
        publishTime: rescheduleTime,
      });
      setEditingScheduleId(null);
    }
  };

  const handleExportScheduleWord = () => {
    if (processedStories.length === 0) return;

    let content = `
      <html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>${t('scheduleTitle', language)}</title>
        </head>
        <body style="font-family: Arial, sans-serif; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; text-align: ${language === 'ar' ? 'right' : 'left'}; color: #000000; padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 25px; color: #000000; border-bottom: 2px solid #000; padding-bottom: 10px;">${t('scheduleTitle', language)}</h1>
          <p style="text-align: center; color: #444; font-size: 13px;">${t('totalScheduled', language)}: ${processedStories.length} ${t('storiesText', language)}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;" border="1">
            <thead>
              <tr style="background-color: #000; color: #fff;">
                <th style="padding: 10px;">${t('dateLabel', language)}</th>
                <th style="padding: 10px;">${t('storyTitlePlaceholder', language)}</th>
                <th style="padding: 10px;">${t('folderLabel', language)}</th>
                <th style="padding: 10px;">${t('statusLabel', language)}</th>
              </tr>
            </thead>
            <tbody>
    `;

    processedStories.forEach((story) => {
      const folder = story.folderId ? folderMap.get(story.folderId) : null;
      const statusText = story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language);

      content += `
        <tr>
          <td style="padding: 8px; font-weight: bold;">${story.targetDate} ${story.publishTime ? `(${story.publishTime})` : ''}</td>
          <td style="padding: 8px;">${story.title || t('untitledStory', language)}</td>
          <td style="padding: 8px;">${folder ? folder.name : '---'}</td>
          <td style="padding: 8px;">${statusText}</td>
        </tr>
      `;
    });

    content += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schedule_Plan_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const locale = language === 'ar' ? ar : enUS;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 bg-[#F5F5F7] min-h-screen w-full overflow-x-hidden text-neutral-900">
      
      {/* Page Header - Apple macOS Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-xl p-5 border border-black/5 rounded-2xl shadow-2xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600 border border-blue-100 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight truncate">
              {t('scheduleTitle', language)}
            </h1>
          </div>
          <p className="text-neutral-500 text-xs">
            {t('scheduleTrackerDesc', language)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleExportScheduleWord}
            className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-black/5 rounded-xl font-semibold text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span>Word</span>
          </button>

          <Link
            href="/editor/new"
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{t('newStory', language)}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid - Apple Widget Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-xl font-extrabold text-neutral-900 leading-tight tracking-tight">{stats.total}</div>
            <div className="text-[11px] text-neutral-500 font-medium truncate">{t('totalScheduled', language)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-xl font-extrabold text-neutral-900 leading-tight tracking-tight">{stats.dueToday}</div>
            <div className="text-[11px] text-emerald-700 font-semibold truncate">{t('dueToday', language)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-xl font-extrabold text-neutral-900 leading-tight tracking-tight">{stats.overdue}</div>
            <div className="text-[11px] text-red-700 font-semibold truncate">{t('overdue', language)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-xl font-extrabold text-neutral-900 leading-tight tracking-tight">{stats.upcoming}</div>
            <div className="text-[11px] text-purple-700 font-semibold truncate">{t('upcoming', language)}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes, Search, Sort & Filters */}
      <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-3">
        
        {/* View Mode Switcher - Apple Segmented Tabs */}
        <div className="grid grid-cols-2 sm:flex p-1 bg-neutral-200/60 rounded-xl text-xs font-semibold gap-1 w-full lg:w-auto">
          <button
            onClick={() => setViewMode('detailed')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'detailed' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewDetailed', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('compact')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'compact' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewCompact', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewCalendar', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('folder')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'folder' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewByFolder', language)}</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs w-full lg:w-auto">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[150px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchSchedulePlaceholder', language)}
              className="w-full bg-neutral-100/80 border border-black/5 rounded-xl pr-8 pl-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Folder Filter */}
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="bg-neutral-100/80 hover:bg-neutral-100 border border-black/5 font-semibold text-neutral-900 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-xs shadow-2xs"
            >
              <option value="all">{t('allFolders', language)}</option>
              {activeFolders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-100/80 hover:bg-neutral-100 border border-black/5 font-semibold text-neutral-900 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-xs shadow-2xs"
            >
              <option value="all">{t('allStatuses', language)}</option>
              <option value="draft">{t('draft', language)}</option>
              <option value="ready">{t('readyToPublish', language)}</option>
              <option value="published">{t('published', language)}</option>
              <option value="overdue">{t('overdue', language)}</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-neutral-100/80 hover:bg-neutral-100 border border-black/5 font-semibold text-neutral-900 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-xs shadow-2xs"
            >
              <option value="dateAsc">{t('sortDateAsc', language)}</option>
              <option value="dateDesc">{t('sortDateDesc', language)}</option>
              <option value="title">{t('sortTitle', language)}</option>
              <option value="status">{t('sortStatus', language)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW RENDERING */}
      {processedStories.length === 0 && viewMode !== 'calendar' ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-black/5 border-dashed p-6 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">{t('noScheduledTexts', language)}</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">{t('setTargetDateSub', language)}</p>
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all mt-2 cursor-pointer"
          >
            {t('goToContentManager', language)}
          </Link>
        </div>
      ) : (
        <>
          {/* MODE 1: DETAILED TIMELINE CARDS - Apple Card Style */}
          {viewMode === 'detailed' && (
            <div className="space-y-3">
              {processedStories.map((story) => {
                const folder = story.folderId ? folderMap.get(story.folderId) : null;
                const d = parseISO(story.targetDate);
                const isOverdue = isBefore(d, new Date()) && !isToday(d) && story.status !== 'published';
                const isDueToday = isToday(d);

                const badgeClass = isDueToday
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : isOverdue
                  ? 'bg-red-50 text-red-700 border-red-200/60'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200/60';

                return (
                  <div
                    key={story.id}
                    className={`bg-white rounded-2xl p-4 md:p-5 border transition-all shadow-2xs hover:shadow-xs ${
                      isDueToday ? 'border-emerald-300 ring-2 ring-emerald-500/10' : isOverdue ? 'border-red-200' : 'border-black/5'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${badgeClass}`}>
                            {isDueToday ? t('dueToday', language) : isOverdue ? t('overdue', language) : t('upcoming', language)}
                          </span>

                          <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{format(d, 'EEEE d MMMM yyyy', { locale })}</span>
                          </span>
                        </div>

                        {/* Quick Status Setter - Apple Pill Buttons */}
                        <div className="flex items-center gap-0.5 bg-neutral-100 p-0.5 rounded-xl border border-black/5 text-xs">
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'draft')}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                              story.status === 'draft' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-black'
                            }`}
                          >
                            {t('draft', language)}
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'ready')}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                              story.status === 'ready' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-neutral-500 hover:text-black'
                            }`}
                          >
                            {t('readyToPublish', language)}
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'published')}
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                              story.status === 'published' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-neutral-500 hover:text-black'
                            }`}
                          >
                            {t('published', language)}
                          </button>
                        </div>
                      </div>

                      <div className="bg-neutral-50 rounded-xl p-3.5 border border-black/5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/editor/${story.id}`} className="font-bold text-neutral-900 hover:text-blue-600 transition-colors text-sm truncate">
                            {story.title || t('untitledStory', language)}
                          </Link>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setReadingStory(story)}
                              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
                              title={language === 'ar' ? 'معاينة' : 'Preview'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openRescheduleModal(story)}
                              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
                              title={t('quickReschedule', language)}
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/editor/${story.id}`}
                              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
                              title={t('editStory', language)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 pt-1.5 border-t border-black/5 font-medium">
                          {folder && (
                            <div className="flex items-center gap-1 text-neutral-700 bg-neutral-200/60 px-2 py-0.5 rounded-full">
                              <FolderIcon className="w-3 h-3 text-blue-500" />
                              <span>{folder.name}</span>
                            </div>
                          )}

                          {story.publishTime && (
                            <div className="flex items-center gap-1 bg-neutral-200/60 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{story.publishTime}</span>
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

          {/* MODE 2: COMPACT LIST - Apple Table */}
          {viewMode === 'compact' && (
            <div className="bg-white rounded-2xl border border-black/5 shadow-2xs overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-50/80 text-neutral-500 border-b border-black/5 font-semibold">
                  <tr>
                    <th className="p-3">{t('dateLabel', language)}</th>
                    <th className="p-3">{t('storyTitlePlaceholder', language)}</th>
                    <th className="p-3">{t('folderLabel', language)}</th>
                    <th className="p-3">{t('statusLabel', language)}</th>
                    <th className="p-3 text-left">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {processedStories.map(story => {
                    const folder = story.folderId ? folderMap.get(story.folderId) : null;
                    const statusBadgeClass = story.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : story.status === 'ready'
                      ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200/60';

                    return (
                      <tr key={story.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-3 font-medium text-neutral-900 whitespace-nowrap">
                          {story.targetDate} {story.publishTime && <span className="text-neutral-400">({story.publishTime})</span>}
                        </td>
                        <td className="p-3 font-bold text-neutral-900 max-w-[220px] truncate">
                          <Link href={`/editor/${story.id}`} className="hover:text-blue-600 transition-colors">
                            {story.title || t('untitledStory', language)}
                          </Link>
                        </td>
                        <td className="p-3 text-neutral-600">
                          {folder ? (
                            <span className="bg-neutral-100 px-2 py-0.5 rounded-full text-[11px] font-medium text-neutral-700">
                              📁 {folder.name}
                            </span>
                          ) : '---'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass}`}>
                            {story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                          </span>
                        </td>
                        <td className="p-3 text-left whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setReadingStory(story)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-xl transition-colors cursor-pointer"
                              title="معاينة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openRescheduleModal(story)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-xl transition-colors cursor-pointer"
                              title={t('quickReschedule', language)}
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/editor/${story.id}`}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-xl transition-colors cursor-pointer"
                              title={t('editStory', language)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* MODE 3: MONTHLY CALENDAR GRID - Apple Style */}
          {viewMode === 'calendar' && (
            <div className="bg-white rounded-3xl border border-black/5 p-4 md:p-5 space-y-3 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-3">
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  {format(currentMonth, 'MMMM yyyy', { locale })}
                </h2>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="p-1.5 hover:bg-neutral-100 border border-black/5 rounded-xl text-neutral-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold text-xs border border-black/5 transition-colors cursor-pointer"
                  >
                    {t('today', language)}
                  </button>
                  <button
                    onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="p-1.5 hover:bg-neutral-100 border border-black/5 rounded-xl text-neutral-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="w-full overflow-x-auto">
                <div className="w-full min-w-[320px] grid grid-cols-7 gap-1.5 text-center text-xs">
                  {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, idx) => (
                    <div key={idx} className="p-1.5 font-semibold text-neutral-500 bg-neutral-50 rounded-xl text-[11px]">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, idx) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const postsOnDay = processedStories.filter(s => s.targetDate === dayStr);
                    const isCurrentToday = isToday(day);

                    return (
                      <div
                        key={idx}
                        className={`min-h-[60px] sm:min-h-[85px] p-2 border transition-all text-right flex flex-col justify-between rounded-xl ${
                          isCurrentToday 
                            ? 'bg-blue-50/60 border-blue-200 shadow-2xs font-bold' 
                            : 'bg-white border-black/5 hover:border-black/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold ${isCurrentToday ? 'bg-blue-600 text-white' : 'text-neutral-700'}`}>
                            {format(day, 'd')}
                          </span>
                          {postsOnDay.length > 0 && (
                            <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.2 rounded-full font-semibold">
                              {postsOnDay.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1.5 overflow-hidden">
                          {postsOnDay.map(post => (
                            <Link
                              key={post.id}
                              href={`/editor/${post.id}`}
                              className="block text-[10px] px-1.5 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 truncate font-medium leading-tight transition-colors"
                              title={post.title}
                            >
                              {post.title || t('untitledStory', language)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: GROUPED BY FOLDER */}
          {viewMode === 'folder' && (
            <div className="space-y-3">
              {activeFolders.map(f => {
                const folderPosts = processedStories.filter(s => s.folderId === f.id);
                if (folderPosts.length === 0) return null;

                return (
                  <div key={f.id} className="bg-white rounded-2xl p-4 md:p-5 border border-black/5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FolderIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-bold text-neutral-900 text-sm">{f.name}</h3>
                      </div>
                      <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        {folderPosts.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {folderPosts.map(story => {
                        const statusBadgeClass = story.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : story.status === 'ready'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200/60';

                        return (
                          <div key={story.id} className="bg-neutral-50 p-3 rounded-xl border border-black/5 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <Link href={`/editor/${story.id}`} className="font-bold text-xs text-neutral-900 hover:text-blue-600 block truncate transition-colors">
                                {story.title || t('untitledStory', language)}
                              </Link>
                              <div className="text-[11px] text-neutral-500 mt-1 font-medium">
                                <span>{story.targetDate}</span>
                                {story.publishTime && <span> · {story.publishTime}</span>}
                              </div>
                            </div>

                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${statusBadgeClass}`}>
                              {story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Quick Reschedule Modal - Apple macOS Window Style */}
      {editingScheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-4 border border-black/8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm">{t('quickReschedule', language)}</h3>
              </div>
              <button
                onClick={() => setEditingScheduleId(null)}
                className="p-1 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1.5">{t('dateLabel', language)}</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-neutral-50 border border-black/10 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1.5">{t('publishTimeLabel', language)}</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-neutral-50 border border-black/10 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveReschedule}
                className="flex-1 bg-neutral-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {t('save', language)}
              </button>
              <button
                onClick={() => setEditingScheduleId(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 rounded-xl text-xs font-semibold transition-all border border-black/5 cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Story Reader Modal - Apple macOS Reading Window */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-black/8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-black/5 flex items-center justify-between bg-neutral-50/70">
              <h3 className="font-bold text-neutral-900 text-sm truncate">{readingStory.title || t('untitledStory', language)}</h3>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/editor/${readingStory.id}`}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('editStory', language)}</span>
                </Link>
                <button
                  onClick={() => setReadingStory(null)}
                  className="p-1.5 hover:bg-neutral-200/70 text-neutral-400 hover:text-black rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 leading-relaxed text-neutral-900 text-xs sm:text-sm font-sans" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: readingStory.content || `<p class="opacity-40">${t('noContentYet', language)}</p>` }} />
            </div>

            <div className="px-5 py-3 bg-neutral-50/70 border-t border-black/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{readingStory.targetDate || '---'}</span>
              </div>
              <button
                onClick={() => setReadingStory(null)}
                className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl font-semibold border border-black/5 text-xs transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Scroll to Top button */}
      <ScrollToTopButton />

    </div>
  );
}
