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
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-3 bg-neutral-100 min-h-screen w-full overflow-x-hidden text-neutral-900">
      
      {/* Page Header - Sharp & Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 border border-neutral-300 rounded-none shadow-2xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="bg-neutral-100 p-1.5 rounded-none text-black border border-neutral-300 shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight truncate font-serif">
              {t('scheduleTitle', language)}
            </h1>
          </div>
          <p className="text-neutral-500 text-xs">
            {t('scheduleTrackerDesc', language)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportScheduleWord}
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-none font-bold text-xs transition-colors flex items-center gap-1"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span>Word</span>
          </button>

          <Link
            href="/editor/new"
            className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-none font-bold text-xs transition-colors flex items-center gap-1 border border-black"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{t('newStory', language)}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid - Sharp & Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-none border border-neutral-300 flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none shrink-0">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-base font-bold text-neutral-900 leading-tight font-mono">{stats.total}</div>
            <div className="text-[10px] text-neutral-500 font-bold truncate">{t('totalScheduled', language)}</div>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-none border border-neutral-300 flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-base font-bold text-neutral-900 leading-tight font-mono">{stats.dueToday}</div>
            <div className="text-[10px] text-neutral-700 font-bold truncate">{t('dueToday', language)}</div>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-none border border-neutral-300 flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-base font-bold text-neutral-900 leading-tight font-mono">{stats.overdue}</div>
            <div className="text-[10px] text-neutral-700 font-bold truncate">{t('overdue', language)}</div>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-none border border-neutral-300 flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-neutral-100 text-black border border-neutral-300 rounded-none shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-base font-bold text-neutral-900 leading-tight font-mono">{stats.upcoming}</div>
            <div className="text-[10px] text-neutral-700 font-bold truncate">{t('upcoming', language)}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes, Search, Sort & Filters */}
      <div className="bg-white p-2.5 rounded-none border border-neutral-300 space-y-2 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-3">
        
        {/* View Mode Switcher - Sharp Segmented Tabs */}
        <div className="grid grid-cols-2 sm:flex p-0.5 bg-neutral-200 rounded-none border border-neutral-300 text-xs font-bold gap-0.5 w-full lg:w-auto">
          <button
            onClick={() => setViewMode('detailed')}
            className={`py-1 px-2.5 rounded-none transition-colors flex items-center justify-center gap-1 ${
              viewMode === 'detailed' ? 'bg-black text-white font-bold' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewDetailed', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('compact')}
            className={`py-1 px-2.5 rounded-none transition-colors flex items-center justify-center gap-1 ${
              viewMode === 'compact' ? 'bg-black text-white font-bold' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewCompact', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`py-1 px-2.5 rounded-none transition-colors flex items-center justify-center gap-1 ${
              viewMode === 'calendar' ? 'bg-black text-white font-bold' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewCalendar', language)}</span>
          </button>

          <button
            onClick={() => setViewMode('folder')}
            className={`py-1 px-2.5 rounded-none transition-colors flex items-center justify-center gap-1 ${
              viewMode === 'folder' ? 'bg-black text-white font-bold' : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t('viewByFolder', language)}</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 text-xs w-full lg:w-auto">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[140px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchSchedulePlaceholder', language)}
              className="w-full bg-white border border-neutral-300 rounded-none pr-7 pl-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-full sm:w-auto">
            {/* Folder Filter */}
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="bg-white border border-neutral-300 font-bold text-neutral-900 rounded-none px-2 py-1 focus:outline-none focus:border-black cursor-pointer text-xs"
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
              className="bg-white border border-neutral-300 font-bold text-neutral-900 rounded-none px-2 py-1 focus:outline-none focus:border-black cursor-pointer text-xs"
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
              className="bg-white border border-neutral-300 font-bold text-neutral-900 rounded-none px-2 py-1 focus:outline-none focus:border-black cursor-pointer text-xs"
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
        <div className="text-center py-10 bg-white rounded-none border border-neutral-300 border-dashed p-4 space-y-2">
          <CalendarIcon className="w-8 h-8 text-neutral-300 mx-auto" />
          <h3 className="text-xs font-bold text-neutral-900">{t('noScheduledTexts', language)}</h3>
          <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">{t('setTargetDateSub', language)}</p>
          <Link
            href="/content"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-none text-xs font-bold transition-colors"
          >
            {t('goToContentManager', language)}
          </Link>
        </div>
      ) : (
        <>
          {/* MODE 1: DETAILED TIMELINE CARDS - Sharp & Compact */}
          {viewMode === 'detailed' && (
            <div className="space-y-2">
              {processedStories.map((story) => {
                const folder = story.folderId ? folderMap.get(story.folderId) : null;
                const d = parseISO(story.targetDate);
                const isOverdue = isBefore(d, new Date()) && !isToday(d) && story.status !== 'published';
                const isDueToday = isToday(d);

                return (
                  <div
                    key={story.id}
                    className={`bg-white rounded-none p-3 border transition-colors ${
                      isDueToday ? 'border-black shadow-xs' : isOverdue ? 'border-neutral-500' : 'border-neutral-300'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-none font-bold border font-mono ${
                            isOverdue 
                              ? 'bg-black text-white border-black' 
                              : isDueToday 
                              ? 'bg-neutral-900 text-white border-black' 
                              : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                          }`}>
                            {isDueToday ? t('dueToday', language) : isOverdue ? t('overdue', language) : t('upcoming', language)}
                          </span>

                          <span className="text-xs font-bold text-neutral-900 flex items-center gap-1 font-mono">
                            <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{format(d, 'EEEE d MMMM yyyy', { locale })}</span>
                          </span>
                        </div>

                        {/* Quick Status Setter */}
                        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-none border border-neutral-300 text-xs">
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'draft')}
                            className={`px-2 py-0.5 rounded-none text-[10px] font-bold transition-colors ${
                              story.status === 'draft' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                            }`}
                          >
                            {t('draft', language)}
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'ready')}
                            className={`px-2 py-0.5 rounded-none text-[10px] font-bold transition-colors ${
                              story.status === 'ready' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                            }`}
                          >
                            {t('readyToPublish', language)}
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(story.id, 'published')}
                            className={`px-2 py-0.5 rounded-none text-[10px] font-bold transition-colors ${
                              story.status === 'published' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                            }`}
                          >
                            {t('published', language)}
                          </button>
                        </div>
                      </div>

                      <div className="bg-neutral-50 rounded-none p-2.5 border border-neutral-200 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/editor/${story.id}`} className="font-bold text-neutral-900 hover:underline text-xs sm:text-sm font-serif truncate">
                            {story.title || t('untitledStory', language)}
                          </Link>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setReadingStory(story)}
                              className="p-1 text-neutral-600 hover:text-black border border-neutral-300 bg-white rounded-none"
                              title={language === 'ar' ? 'معاينة' : 'Preview'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openRescheduleModal(story)}
                              className="p-1 text-neutral-600 hover:text-black border border-neutral-300 bg-white rounded-none"
                              title={t('quickReschedule', language)}
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/editor/${story.id}`}
                              className="p-1 text-neutral-600 hover:text-black border border-neutral-300 bg-white rounded-none"
                              title={t('editStory', language)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 font-mono pt-1 border-t border-neutral-200">
                          {folder && (
                            <div className="flex items-center gap-1 font-bold text-neutral-800">
                              <FolderIcon className="w-3 h-3 text-black" />
                              <span>{folder.name}</span>
                            </div>
                          )}

                          {story.publishTime && (
                            <div className="flex items-center gap-1">
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

          {/* MODE 2: COMPACT LIST - Dense Table */}
          {viewMode === 'compact' && (
            <div className="bg-white rounded-none border border-neutral-300 shadow-2xs overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-300 font-bold">
                  <tr>
                    <th className="p-2.5">{t('dateLabel', language)}</th>
                    <th className="p-2.5">{t('storyTitlePlaceholder', language)}</th>
                    <th className="p-2.5">{t('folderLabel', language)}</th>
                    <th className="p-2.5">{t('statusLabel', language)}</th>
                    <th className="p-2.5 text-left">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {processedStories.map(story => {
                    const folder = story.folderId ? folderMap.get(story.folderId) : null;
                    return (
                      <tr key={story.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-2 font-mono text-neutral-900 whitespace-nowrap">
                          {story.targetDate} {story.publishTime && <span className="text-neutral-400">({story.publishTime})</span>}
                        </td>
                        <td className="p-2 font-bold text-neutral-900 font-serif max-w-[220px] truncate">
                          <Link href={`/editor/${story.id}`} className="hover:underline">
                            {story.title || t('untitledStory', language)}
                          </Link>
                        </td>
                        <td className="p-2 text-neutral-600">
                          {folder ? (
                            <span className="border border-neutral-300 px-1.5 py-0.2 text-[11px] bg-neutral-50">
                              📁 {folder.name}
                            </span>
                          ) : '---'}
                        </td>
                        <td className="p-2">
                          <span className="border border-neutral-400 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                            {story.status === 'published' ? t('published', language) : story.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                          </span>
                        </td>
                        <td className="p-2 text-left whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setReadingStory(story)}
                              className="p-1 border border-neutral-300 text-neutral-600 hover:text-black rounded-none"
                              title="معاينة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openRescheduleModal(story)}
                              className="p-1 border border-neutral-300 text-neutral-600 hover:text-black rounded-none"
                              title={t('quickReschedule', language)}
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/editor/${story.id}`}
                              className="p-1 border border-neutral-300 text-neutral-600 hover:text-black rounded-none"
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

          {/* MODE 3: MONTHLY CALENDAR GRID - Sharp */}
          {viewMode === 'calendar' && (
            <div className="bg-white rounded-none border border-neutral-300 p-3 space-y-2.5 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                <h2 className="text-sm font-bold text-neutral-900 font-serif">
                  {format(currentMonth, 'MMMM yyyy', { locale })}
                </h2>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-none text-neutral-800"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-2 py-1 bg-white hover:bg-neutral-100 text-neutral-800 rounded-none font-bold text-xs border border-neutral-300"
                  >
                    {t('today', language)}
                  </button>
                  <button
                    onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-none text-neutral-800"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="w-full overflow-x-auto">
                <div className="w-full min-w-[320px] grid grid-cols-7 gap-1 text-center text-xs">
                  {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, idx) => (
                    <div key={idx} className="p-1 font-bold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-none text-[11px]">
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
                        className={`min-h-[55px] sm:min-h-[75px] p-1 border transition-colors text-right flex flex-col justify-between rounded-none ${
                          isCurrentToday 
                            ? 'bg-neutral-100 border-black font-bold' 
                            : 'bg-white border-neutral-200 hover:border-black'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={isCurrentToday ? 'text-black font-bold' : 'text-neutral-600'}>
                            {format(day, 'd')}
                          </span>
                          {postsOnDay.length > 0 && (
                            <span className="text-[9px] bg-black text-white px-1 py-0.2 rounded-none font-mono">
                              {postsOnDay.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5 mt-1 overflow-hidden">
                          {postsOnDay.map(post => (
                            <Link
                              key={post.id}
                              href={`/editor/${post.id}`}
                              className="block text-[9px] px-1 py-0.5 rounded-none bg-neutral-900 text-white truncate hover:bg-black font-serif leading-tight"
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
            <div className="space-y-2.5">
              {activeFolders.map(f => {
                const folderPosts = processedStories.filter(s => s.folderId === f.id);
                if (folderPosts.length === 0) return null;

                return (
                  <div key={f.id} className="bg-white rounded-none p-3 border border-neutral-300 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                      <div className="flex items-center gap-2">
                        <FolderIcon className="w-3.5 h-3.5 text-black shrink-0" />
                        <h3 className="font-bold text-neutral-900 text-xs sm:text-sm font-serif">{f.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono border border-neutral-300 px-1.5 py-0.2 bg-neutral-50">
                        {folderPosts.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {folderPosts.map(story => (
                        <div key={story.id} className="bg-neutral-50 p-2.5 rounded-none border border-neutral-200 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <Link href={`/editor/${story.id}`} className="font-bold text-xs text-neutral-900 hover:underline block truncate font-serif">
                              {story.title || t('untitledStory', language)}
                            </Link>
                            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                              <span>{story.targetDate}</span>
                              {story.publishTime && <span> · {story.publishTime}</span>}
                            </div>
                          </div>

                          <span className="text-[10px] px-1.5 py-0.2 font-mono font-bold border border-neutral-400 shrink-0">
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

      {/* Quick Reschedule Modal - Sharp Box */}
      {editingScheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-none border-2 border-black shadow-2xl p-4 w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="font-bold text-neutral-900 text-xs font-serif uppercase tracking-wider">{t('quickReschedule', language)}</h3>
              <button
                onClick={() => setEditingScheduleId(null)}
                className="p-1 text-neutral-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">{t('dateLabel', language)}</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-none px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">{t('publishTimeLabel', language)}</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-none px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <button
                onClick={handleSaveReschedule}
                className="flex-1 bg-black hover:bg-neutral-800 text-white py-1.5 rounded-none text-xs font-bold transition-colors border border-black"
              >
                {t('save', language)}
              </button>
              <button
                onClick={() => setEditingScheduleId(null)}
                className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-1.5 rounded-none text-xs font-bold transition-colors border border-neutral-300"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Story Reader Modal - Sharp Box */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-xl rounded-none border-2 border-black shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-3 border-b border-black flex items-center justify-between bg-neutral-100">
              <h3 className="font-bold text-neutral-900 text-xs sm:text-sm truncate font-serif">{readingStory.title || t('untitledStory', language)}</h3>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/editor/${readingStory.id}`}
                  className="px-2 py-1 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-none flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t('editStory', language)}</span>
                </Link>
                <button
                  onClick={() => setReadingStory(null)}
                  className="p-1 border border-neutral-300 hover:bg-black hover:text-white rounded-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 leading-relaxed text-neutral-900 text-xs sm:text-sm font-sans" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: readingStory.content || `<p class="opacity-40">${t('noContentYet', language)}</p>` }} />
            </div>

            <div className="p-2.5 bg-neutral-100 border-t border-neutral-300 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1 text-neutral-500">
                <CalendarIcon className="w-3 h-3" />
                <span>{readingStory.targetDate || '---'}</span>
              </div>
              <button
                onClick={() => setReadingStory(null)}
                className="px-3 py-1 bg-white text-neutral-900 rounded-none font-bold hover:bg-neutral-200 border border-neutral-400 text-xs"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
