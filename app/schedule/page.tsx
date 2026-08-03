'use client';

import { useState, useMemo } from 'react';
import { useStore, StoryStatus, Story } from '@/lib/store';
import { t } from "@/lib/i18n";
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, 
  Search, Filter, ArrowUpDown, LayoutList, CalendarDays, FolderOpen, 
  Edit2, Eye, FileDown, Sparkles, ChevronLeft, ChevronRight, Plus, X
} from 'lucide-react';
import { format, isBefore, isToday, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { motion } from 'motion/react';

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

    // Filter by Folder
    if (folderFilter !== 'all') {
      list = list.filter(s => s.folderId === folderFilter);
    }

    // Filter by Status
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        const now = new Date();
        list = list.filter(s => isBefore(parseISO(s.targetDate), now) && !isToday(parseISO(s.targetDate)) && s.status !== 'published');
      } else {
        list = list.filter(s => s.status === statusFilter);
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => {
        const folderName = s.folderId ? folderMap.get(s.folderId)?.name || '' : '';
        return (
          (s.title && s.title.toLowerCase().includes(q)) ||
          folderName.toLowerCase().includes(q) ||
          s.targetDate.includes(q)
        );
      });
    }

    // Sort
    return list.sort((a, b) => {
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
  }, [scheduledStories, folderFilter, statusFilter, searchQuery, sortBy, folderMap]);

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
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
      \x3Chtml lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>${t('scheduleTitle', language)}</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: ${language === 'ar' ? 'right' : 'left'}; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; padding: 20px;">
          <h1 style="text-align: center; color: #1e293b;">${t('scheduleTitle', language)}</h1>
          <p style="text-align: center; color: #64748b; margin-bottom: 25px;">${t('scheduleTrackerDesc', language)}</p>
          <table border="1" style="width: 100%; border-collapse: collapse; text-align: right;" cellpadding="8">
            <thead>
              <tr style="background-color: #f1f5f9; color: #0f172a;">
                <th>${t('dateLabel', language)}</th>
                <th>${t('storyTitlePlaceholder', language)}</th>
                <th>${t('folderLabel', language)}</th>
                <th>${t('statusLabel', language)}</th>
              </tr>
            </thead>
            <tbody>
    `;

    processedStories.forEach(s => {
      const folderName = s.folderId ? folderMap.get(s.folderId)?.name || '---' : '---';
      const statusText = s.status === 'published' ? t('published', language) : s.status === 'ready' ? t('readyToPublish', language) : t('draft', language);
      content += `
        <tr>
          <td>${s.targetDate} ${s.publishTime ? `(${s.publishTime})` : ''}</td>
          <td><strong>${s.title || 'بدون عنوان'}</strong></td>
          <td>${folderName}</td>
          <td>${statusText}</td>
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
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 shrink-0">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{t('scheduleTitle', language)}</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {t('scheduleTrackerDesc', language)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleExportScheduleWord}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 touch-manipulation min-h-[42px] sm:min-h-0"
          >
            <FileDown className="w-4 h-4 text-indigo-600" />
            <span>{t('exportSchedule', language)}</span>
          </button>

          <Link
            href="/editor/new"
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs touch-manipulation min-h-[42px] sm:min-h-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createNewStoryBtn', language)}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-slate-900">{stats.total}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate">{t('totalScheduled', language)}</div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-slate-900">{stats.dueToday}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold truncate">{t('dueToday', language)}</div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-slate-900">{stats.overdue}</div>
            <div className="text-[10px] sm:text-[11px] text-amber-700 font-semibold truncate">{t('overdue', language)}</div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-slate-900">{stats.upcoming}</div>
            <div className="text-[10px] sm:text-[11px] text-blue-700 font-semibold truncate">{t('upcoming', language)}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes, Search, Sort & Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
        
        {/* View Mode Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto scrollbar-none w-full lg:w-auto">
          <button
            onClick={() => setViewMode('detailed')}
            className={`py-2 px-3 sm:py-1.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial touch-manipulation min-h-[38px] sm:min-h-0 ${
              viewMode === 'detailed' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{t('viewDetailed', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('compact')}
            className={`py-2 px-3 sm:py-1.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial touch-manipulation min-h-[38px] sm:min-h-0 ${
              viewMode === 'compact' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{t('viewCompact', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`py-2 px-3 sm:py-1.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial touch-manipulation min-h-[38px] sm:min-h-0 ${
              viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{t('viewCalendar', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('folder')}
            className={`py-2 px-3 sm:py-1.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial touch-manipulation min-h-[38px] sm:min-h-0 ${
              viewMode === 'folder' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{t('viewByFolder', language)}</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 sm:top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchSchedulePlaceholder', language)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-2 sm:py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs min-h-[38px] sm:min-h-0"
            />
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
            {/* Folder Filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 min-h-[38px] sm:min-h-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none px-1 py-1 cursor-pointer w-full text-xs truncate"
              >
                <option value="all">{t('allFolders', language)}</option>
                {activeFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 font-semibold text-slate-700 rounded-xl px-2 py-2 sm:py-1.5 focus:outline-none cursor-pointer w-full text-xs min-h-[38px] sm:min-h-0"
            >
              <option value="all">{t('allStatuses', language)}</option>
              <option value="draft">{t('draft', language)}</option>
              <option value="ready">{t('readyToPublish', language)}</option>
              <option value="published">{t('published', language)}</option>
              <option value="overdue">{t('overdue', language)}</option>
            </select>

            {/* Sort By */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 min-h-[38px] sm:min-h-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none px-1 py-1 cursor-pointer w-full text-xs truncate"
              >
                <option value="dateAsc">{t('sortDateAsc', language)}</option>
                <option value="dateDesc">{t('sortDateDesc', language)}</option>
                <option value="title">{t('sortTitle', language)}</option>
                <option value="status">{t('sortStatus', language)}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW RENDERING */}
      {processedStories.length === 0 && viewMode !== 'calendar' ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 border-dashed p-6 space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">{t('noScheduledTexts', language)}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{t('setTargetDateSub', language)}</p>
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-xs mt-2 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>{t('goToContentManager', language)}</span>
          </Link>
        </div>
      ) : (
        <>
          {/* MODE 1: DETAILED TIMELINE */}
          {viewMode === 'detailed' && (
            <div className="relative border-r-2 border-indigo-100 pr-4 sm:pr-6 md:pr-8 space-y-4 sm:space-y-6">
              {processedStories.map((story, index) => {
                const date = parseISO(story.targetDate);
                const isPast = isBefore(date, new Date()) && !isToday(date);
                const today = isToday(date);
                const folder = story.folderId ? folderMap.get(story.folderId) : null;

                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -right-[23px] sm:-right-[31px] md:-right-[39px] w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 sm:border-4 border-white shadow-xs ${
                      today ? 'bg-indigo-600 ring-2 sm:ring-4 ring-indigo-100' : isPast ? 'bg-slate-300' : 'bg-emerald-500'
                    }`} />

                    <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border transition-all hover:shadow-md ${
                      today ? 'border-indigo-300 ring-1 ring-indigo-50 bg-indigo-50/10' : 'border-slate-200/80'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${today ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                              {format(date, 'EEEE، d MMMM yyyy', { locale })}
                            </h3>
                            {today && <span className="text-indigo-600 text-[11px] sm:text-xs font-bold">{t('today', language)}</span>}
                          </div>
                        </div>

                        {/* Status & Quick Status Switcher */}
                        <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0 w-full sm:w-auto">
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'draft')}
                            className={`flex-1 sm:flex-initial text-center px-2.5 py-1 sm:py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all touch-manipulation min-h-[32px] sm:min-h-0 ${
                              story.status === 'draft' ? 'bg-amber-100 text-amber-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {t('draft', language)}
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'ready')}
                            className={`flex-1 sm:flex-initial text-center px-2.5 py-1 sm:py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all touch-manipulation min-h-[32px] sm:min-h-0 ${
                              story.status === 'ready' ? 'bg-emerald-100 text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {t('readyToPublish', language)}
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'published')}
                            className={`flex-1 sm:flex-initial text-center px-2.5 py-1 sm:py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all touch-manipulation min-h-[32px] sm:min-h-0 ${
                              story.status === 'published' ? 'bg-blue-100 text-blue-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {t('published', language)}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-100 hover:border-indigo-200 transition-colors space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/editor/${story.id}`} className="font-bold text-slate-900 hover:text-indigo-600 text-sm sm:text-base md:text-lg transition-colors leading-snug">
                            {story.title || t('untitledStory', language)}
                          </Link>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => setReadingStory(story)}
                              className="p-2 text-slate-400 hover:text-indigo-600 active:bg-slate-200 rounded-lg touch-manipulation"
                              title={language === 'ar' ? 'معاينة' : 'Preview'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRescheduleModal(story)}
                              className="p-2 text-slate-400 hover:text-indigo-600 active:bg-slate-200 rounded-lg touch-manipulation"
                              title={t('quickReschedule', language)}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/editor/${story.id}`}
                              className="p-2 text-slate-400 hover:text-indigo-600 active:bg-slate-200 rounded-lg touch-manipulation"
                              title={t('editStory', language)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-1 border-t border-slate-100/80">
                          {folder && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: folder.color || '#6366f1' }} />
                              <span className="truncate max-w-[120px]">{folder.name}</span>
                            </div>
                          )}

                          {story.publishTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{story.publishTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* MODE 2: COMPACT LIST */}
          {viewMode === 'compact' && (
            <div>
              {/* Mobile Card List (< sm) */}
              <div className="space-y-3 sm:hidden">
                {processedStories.map(story => {
                  const folder = story.folderId ? folderMap.get(story.folderId) : null;
                  return (
                    <div key={story.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{story.targetDate}</span>
                          {story.publishTime && <span className="text-slate-400 font-normal">({story.publishTime})</span>}
                        </div>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          story.status === 'published' ? 'bg-blue-50 text-blue-800 border-blue-200' : story.status === 'ready' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                        </span>
                      </div>

                      <Link href={`/editor/${story.id}`} className="block font-bold text-slate-900 text-sm hover:text-indigo-600">
                        {story.title || t('untitledStory', language)}
                      </Link>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div>
                          {folder ? (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: folder.color || '#6366f1' }} />
                              {folder.name}
                            </span>
                          ) : '---'}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setReadingStory(story)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg touch-manipulation"
                            title={language === 'ar' ? 'معاينة' : 'Preview'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRescheduleModal(story)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg touch-manipulation"
                            title={t('quickReschedule', language)}
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/editor/${story.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg touch-manipulation"
                            title={t('editStory', language)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (>= sm) */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold">
                        <th className="p-3.5">{t('dateLabel', language)}</th>
                        <th className="p-3.5">{t('storyTitlePlaceholder', language)}</th>
                        <th className="p-3.5">{t('folderLabel', language)}</th>
                        <th className="p-3.5">{t('statusLabel', language)}</th>
                        <th className="p-3.5 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {processedStories.map(story => {
                        const folder = story.folderId ? folderMap.get(story.folderId) : null;
                        return (
                          <tr key={story.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                              {story.targetDate} {story.publishTime && <span className="text-slate-400 text-[11px] font-normal">({story.publishTime})</span>}
                            </td>
                            <td className="p-3.5">
                              <Link href={`/editor/${story.id}`} className="font-bold text-slate-800 hover:text-indigo-600">
                                {story.title || t('untitledStory', language)}
                              </Link>
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {folder ? (
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color || '#6366f1' }} />
                                  {folder.name}
                                </span>
                              ) : '---'}
                            </td>
                            <td className="p-3.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                story.status === 'published' ? 'bg-blue-50 text-blue-800 border-blue-200' : story.status === 'ready' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setReadingStory(story)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                                  title={language === 'ar' ? 'معاينة' : 'Preview'}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openRescheduleModal(story)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                                  title={t('quickReschedule', language)}
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/editor/${story.id}`}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                                  title={t('editStory', language)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: MONTHLY CALENDAR GRID */}
          {viewMode === 'calendar' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-hidden">
              {/* Month Navigator Header */}
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {format(currentMonth, 'MMMM yyyy', { locale })}
                </h2>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 active:bg-slate-300 touch-manipulation"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs active:bg-slate-300 touch-manipulation"
                  >
                    {t('today', language)}
                  </button>
                  <button
                    onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 active:bg-slate-300 touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Responsive Grid with Horizontal Touch Scroll on small screens */}
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <div className="min-w-[550px] sm:min-w-0 grid grid-cols-7 gap-1 md:gap-2 text-center text-xs">
                  {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, idx) => (
                    <div key={idx} className="p-1.5 sm:p-2 font-bold text-slate-400 bg-slate-50 rounded-lg sm:rounded-xl text-[11px] sm:text-xs">
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
                        className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all text-right flex flex-col justify-between ${
                          isCurrentToday 
                            ? 'bg-indigo-50/50 border-indigo-300 font-bold' 
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] sm:text-xs ${isCurrentToday ? 'text-indigo-600 font-extrabold' : 'text-slate-500'}`}>
                            {format(day, 'd')}
                          </span>
                          {postsOnDay.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold">
                              {postsOnDay.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1">
                          {postsOnDay.map(post => (
                            <Link
                              key={post.id}
                              href={`/editor/${post.id}`}
                              className="block text-[9px] sm:text-[10px] p-1 rounded-md sm:rounded-lg bg-indigo-600 text-white truncate font-medium hover:bg-indigo-700 active:bg-indigo-800"
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
            <div className="space-y-4 sm:space-y-6">
              {activeFolders.map(f => {
                const folderPosts = processedStories.filter(s => s.folderId === f.id);
                if (folderPosts.length === 0) return null;

                return (
                  <div key={f.id} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: f.color || '#6366f1' }} />
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{f.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                        {folderPosts.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                      {folderPosts.map(story => (
                        <div key={story.id} className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <Link href={`/editor/${story.id}`} className="font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 block truncate">
                              {story.title || t('untitledStory', language)}
                            </Link>
                            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                              <span>{story.targetDate}</span>
                              {story.publishTime && <span>• {story.publishTime}</span>}
                            </div>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                            story.status === 'published' ? 'bg-blue-50 text-blue-800 border-blue-200' : story.status === 'ready' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Quick Reschedule Modal */}
      {editingScheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{t('quickReschedule', language)}</h3>
              <button
                onClick={() => setEditingScheduleId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('dateLabel', language)}</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs min-h-[42px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('publishTimeLabel', language)}</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs min-h-[42px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleSaveReschedule}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs touch-manipulation"
              >
                {t('save', language)}
              </button>
              <button
                onClick={() => setEditingScheduleId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all touch-manipulation"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Story Reader Modal */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{readingStory.title || t('untitledStory', language)}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/editor/${readingStory.id}`}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 touch-manipulation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('editStory', language)}</span>
                </Link>
                <button
                  onClick={() => setReadingStory(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full touch-manipulation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 leading-relaxed text-slate-800 text-xs sm:text-sm md:text-base prose max-w-none" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: readingStory.content || `<p class="text-slate-400">${t('noContentYet', language)}</p>` }} />
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{readingStory.targetDate || '---'}</span>
              </div>
              <button
                onClick={() => setReadingStory(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 touch-manipulation"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
