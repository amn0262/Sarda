'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Calendar as CalendarIcon, Clock, FileText, CheckCircle, AlertCircle, Search, LayoutList, AlignJustify, Filter, CalendarPlus } from 'lucide-react';
import { format, isBefore, isToday, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function SchedulePlanner() {
  const { stories, folders, updateStory } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [activeTab, setActiveTab] = useState<'scheduled' | 'unscheduled'>('scheduled');

  // Filter scheduled stories
  const scheduledStories = stories
    .filter(s => s.targetDate && s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  // Filter unscheduled stories to resolve issues where users can't find files under schedule view
  const unscheduledStories = stories
    .filter(s => !s.targetDate && s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-amber-200/50 dark:border-amber-900/30"><AlertCircle className="w-3 h-3" /> مسودة</span>;
      case 'ready':
        return <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-900/30"><CheckCircle className="w-3 h-3" /> جاهز</span>;
      case 'published':
        return <span className="bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-blue-200/50 dark:border-blue-900/30"><CheckCircle className="w-3 h-3" /> منشور</span>;
      default:
        return null;
    }
  };

  const getFolderName = (folderId: string) => {
    return folders.find(f => f.id === folderId)?.name || 'مجلد غير محدد';
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen transition-colors">
      
      {/* Header and Filter Row */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">جدول النشر</h1>
        </div>
        
        {/* Action controls tightly knit side-by-side to optimize space utilization */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Unifying search & filter next to each other */}
          <div className="relative flex-1 sm:flex-none sm:w-48 md:w-56">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث هنا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/45 text-xs sm:text-sm"
            />
          </div>
          
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/45 text-slate-700 dark:text-slate-300"
            >
              <option value="all">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="ready">جاهز للنشر</option>
              <option value="published">منشور</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('detailed')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'detailed' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-450'}`}
              title="عرض مفصل"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'compact' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-450'}`}
              title="عرض مدمج"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 mb-6 font-medium text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`pb-2.5 px-3 sm:px-5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'scheduled'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          القصص المجدولة ({scheduledStories.length})
        </button>
        <button
          onClick={() => setActiveTab('unscheduled')}
          className={`pb-2.5 px-3 sm:px-5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'unscheduled'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          قصص بحاجة لجدولة ({unscheduledStories.length})
        </button>
      </div>

      {activeTab === 'scheduled' ? (
        scheduledStories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">لا توجد نصوص مجدولة</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-xs sm:text-sm">قم بتحديد &quot;تاريخ النشر&quot; لقصصك أو انتقل لتبويب الحاجة إلى الجدولة.</p>
            <Link
              href="/content"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-xs sm:text-sm"
            >
              الذهاب لإدارة المحتوى
            </Link>
          </div>
        ) : (
          <div className="relative border-r border-slate-200 dark:border-slate-800 pr-5 sm:pr-8 space-y-5 sm:space-y-6">
            <AnimatePresence mode="popLayout">
              {scheduledStories.map((story, index) => {
                const date = parseISO(story.targetDate);
                const isPast = isBefore(date, new Date()) && !isToday(date);
                const today = isToday(date);

                return (
                  <motion.div
                    key={story.id}
                    layoutId={`schedule-${story.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -right-[26px] sm:-right-[41px] w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border-2 sm:border-4 border-white dark:border-slate-950 shadow-sm ${
                      today ? 'bg-indigo-500' : isPast ? 'bg-slate-400' : 'bg-emerald-500'
                    }`} />

                    {viewMode === 'detailed' ? (
                      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border transition-all hover:shadow-md ${
                        today ? 'border-indigo-300 dark:border-indigo-900 ring-1 ring-indigo-50 dark:ring-indigo-950/20' : 'border-slate-100 dark:border-slate-800'
                      }`}>
                        
                        {/* Title date / Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 sm:p-2 rounded-xl ${today ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800/65 text-slate-500'}`}>
                              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50">
                                {format(date, 'EEEE، d MMMM yyyy', { locale: ar })}
                              </h3>
                              {today && <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">اليوم</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {getStatusBadge(story.status)}
                          </div>
                        </div>

                        {/* Outer Card block */}
                        <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 sm:p-4 border border-slate-100/80 dark:border-slate-900">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <Link href={`/editor/${story.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
                                {story.title || 'بدون عنوان'}
                              </h4>
                            </Link>

                            {/* Easy quick inline scheduling reset */}
                            <button
                              onClick={() => updateStory(story.id, { targetDate: '' })}
                              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400/80 hover:underline shrink-0"
                            >
                              إلغاء الجدولة
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{getFolderName(story.folderId)}</span>
                            </div>
                            {story.publishTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{story.publishTime}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border transition-all hover:border-indigo-200 dark:hover:border-indigo-950 ${
                        today ? 'border-indigo-200 dark:border-indigo-900 ring-1 ring-indigo-50 dark:ring-indigo-950/20' : 'border-slate-150 dark:border-slate-800'
                      } flex items-center justify-between gap-3`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold w-20 shrink-0">
                            {format(date, 'd MMM yyyy', { locale: ar })}
                          </span>
                          <Link href={`/editor/${story.id}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-sm">
                            {story.title || 'بدون عنوان'}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(story.status)}
                          <button
                            onClick={() => updateStory(story.id, { targetDate: '' })}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-red-500"
                            title="إلغاء الجدولة"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )
      ) : (
        unscheduledStories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <CheckCircle className="w-12 h-12 text-emerald-500/70 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">جميع القصص مجدولة!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-xs sm:text-sm">لا توجد قصص مهملة أو بانتظار تحديد تاريخ نشر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {unscheduledStories.map((story) => (
                <motion.div
                  key={story.id}
                  layoutId={`schedule-${story.id}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <Link href={`/editor/${story.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-1">
                          {story.title || 'بدون عنوان'}
                        </h4>
                      </Link>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">
                        {getFolderName(story.folderId)}
                      </span>
                    </div>
                    {getStatusBadge(story.status)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <CalendarPlus className="w-3.5 h-3.5" />
                      جدولة تاريخ النشر:
                    </span>
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) {
                          updateStory(story.id, { targetDate: e.target.value });
                        }
                      }}
                      className="text-xs bg-indigo-50/75 dark:bg-indigo-950/25 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150/50 dark:border-indigo-900/40 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer w-full sm:w-auto transition-colors"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}
    </div>
  );
}
