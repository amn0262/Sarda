'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CalendarDays, Info, PenTool, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@/lib/store';

const navItems = [
  { name: { ar: 'الرئيسية', en: 'Dashboard' }, href: '/', icon: LayoutDashboard },
  { name: { ar: 'إدارة المحتوى', en: 'Content' }, href: '/content', icon: FolderOpen },
  { name: { ar: 'جدول النشر', en: 'Schedule' }, href: '/schedule', icon: CalendarDays },
  { name: { ar: 'الإعدادات', en: 'Settings' }, href: '/settings', icon: Settings },
  { name: { ar: 'حول المطور', en: 'About' }, href: '/dev-info', icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { language } = useStore();

  return (
    <div className="w-full h-16 bg-slate-900 text-slate-100 border-t border-slate-800 shrink-0 z-40 flex items-center justify-between px-2 sm:px-4 md:px-8 shadow-xl">
      {/* Brand logo */}
      <div className="hidden lg:flex items-center gap-2 mr-2">
        <div className="bg-indigo-500 p-1.5 rounded-lg">
          <PenTool className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight">سـردة</span>
      </div>

      {/* Navigation Icons Row */}
      <nav className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 md:gap-4 flex-1 lg:flex-initial">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 text-xs font-medium',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] sm:text-[11px] md:text-sm whitespace-nowrap">{item.name[language]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version display */}
      <div className="hidden lg:block text-[11px] text-slate-500 font-mono ml-2">
        v1.0
      </div>
    </div>
  );
}
