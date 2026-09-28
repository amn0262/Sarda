'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CalendarDays, Info, PenTool, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
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
      {/* Mobile Bottom Bar (visible on sm and below) - Sharp edges & compact */}
      <div className="md:hidden w-full h-14 bg-black text-white border-t border-neutral-800 shrink-0 z-40 flex items-center px-2 shadow-md order-last relative">
        <nav className="flex items-center justify-between gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center py-1 rounded-none transition-colors text-xs flex-1',
                  isActive
                    ? 'text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                )}
              >
                <div className={clsx("p-1 rounded-none transition-colors", isActive ? "bg-white text-black font-bold" : "text-neutral-400")}>
                  <item.icon className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-[10px] whitespace-nowrap mt-0.5">{item.name[language]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar (visible on md and above) - Sharp edges, crisp borders & compact */}
      <div className={clsx(
        "hidden md:flex flex-col bg-black text-white border-e border-neutral-800 shrink-0 z-40 shadow-xl transition-all duration-200 relative order-first",
        isCollapsed ? "w-16" : "w-56"
      )}>
        {/* Toggle Button - Sharp box */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute rtl:-left-3 ltr:-right-3 top-6 bg-neutral-900 border border-neutral-600 text-neutral-300 hover:text-white hover:bg-neutral-800 p-1 rounded-none z-50 shadow-md flex items-center justify-center transition-colors"
          title={isCollapsed ? 'توسيع' : 'طي'}
        >
          {isCollapsed ? (language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) 
                       : (language === 'ar' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />)}
        </button>

        {/* Brand logo - Sharp header */}
        <div className="flex items-center h-14 px-4 border-b border-neutral-800 shrink-0">
          <div className="bg-white text-black p-1.5 rounded-none shrink-0 border border-white">
            <PenTool className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-wider mx-2.5 font-serif">سـردة</span>
          )}
        </div>

        {/* Navigation Items - Sharp & Compact */}
        <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-none transition-colors text-xs font-semibold border',
                  isActive
                    ? 'bg-white text-black font-bold border-white'
                    : 'hover:bg-neutral-900 text-neutral-400 hover:text-white border-transparent',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.name[language] : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.name[language]}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Minimal Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono text-center">
            SARDA · CLASSIC MONO
          </div>
        )}
      </div>
    </>
  );
}
