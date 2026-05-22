'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CalendarDays, Info, PenTool, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'الرئيسية', href: '/', icon: LayoutDashboard },
  { name: 'إدارة المحتوى', href: '/content', icon: FolderOpen },
  { name: 'جدول النشر', href: '/schedule', icon: CalendarDays },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
  { name: 'حول المطور', href: '/dev-info', icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 text-slate-100 h-screen flex-col border-l border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">سـردة</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-800">
          Sarda CMS v1.0
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around items-center h-16 px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <item.icon className={clsx("w-5 h-5", isActive && "fill-indigo-50 dark:fill-indigo-950/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
