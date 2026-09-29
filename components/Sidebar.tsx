'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CalendarDays, Info, PenTool, Settings, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/lib/store';
import { useState } from 'react';

const navItems = [
  { name: { ar: 'الرئيسية', en: 'Dashboard' }, href: '/', icon: LayoutDashboard },
  { name: { ar: 'إدارة المحتوى', en: 'Content' }, href: '/content', icon: FolderOpen },
  { name: { ar: 'جدول النشر', en: 'Schedule' }, href: '/schedule', icon: CalendarDays },
  { name: { ar: 'الإعدادات', en: 'Settings' }, href: '/settings', icon: Settings },
  { name: { ar: 'حول المطور', en: 'About' }, href: '/dev-info', icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { language, isFocusMode } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isFocusMode) return null;

  return (
    <>
      {/* Mobile Bottom Dock (Apple iOS / iPadOS Floating Dock Style) */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
        <nav className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-1.5 shadow-2xl flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all text-xs flex-1',
                  isActive
                    ? 'bg-white/20 text-white font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] whitespace-nowrap mt-1 font-medium">{item.name[language]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar (Apple macOS Window Sidebar Style) */}
      <aside
        className={clsx(
          "hidden md:flex flex-col bg-neutral-950/95 backdrop-blur-2xl text-white border-e border-white/10 shrink-0 z-40 shadow-2xl transition-all duration-300 relative order-first",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* Apple macOS Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute rtl:-left-3.5 ltr:-right-3.5 top-6 bg-neutral-800/90 hover:bg-neutral-700 border border-white/15 text-neutral-300 hover:text-white p-1 rounded-full z-50 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={isCollapsed ? 'توسيع' : 'طي'}
        >
          {isCollapsed ? (language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) 
                       : (language === 'ar' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />)}
        </button>

        {/* Apple macOS Titlebar Header & Traffic Lights */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {/* macOS Window Traffic Lights */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block shadow-2xs"></span>
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold tracking-tight mx-2 text-neutral-200">سـردة CMS</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/80">
              <PenTool className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Navigation Items (Apple Side Menu Item Pills) */}
        <nav className="flex-1 flex flex-col gap-1.5 p-3 overflow-y-auto">
          {/* Quick Global Search Button in Sidebar */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-medium cursor-pointer mb-1 border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white',
              isCollapsed ? 'justify-center px-0' : 'justify-between'
            )}
            title={language === 'ar' ? 'بحث شامل (⌘K)' : 'Global Search (⌘K)'}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-blue-400 shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap tracking-tight">{language === 'ar' ? 'بحث في كل القصص' : 'Search All Stories'}</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-neutral-400">⌘K</span>
            )}
          </button>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-medium cursor-pointer',
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'hover:bg-white/10 text-neutral-400 hover:text-white',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.name[language] : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap tracking-tight">{item.name[language]}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Minimal Apple Style Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-white/10 text-[10px] text-neutral-500 font-mono text-center flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SARDA · CMS</span>
          </div>
        )}
      </aside>
    </>
  );
}
