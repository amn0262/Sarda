const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen"/, 'className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 bg-slate-50 min-h-screen"');

c = c.replace(/rounded-3xl p-6 md:p-10 shadow-lg border border-slate-800 overflow-hidden"/, 'rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-lg border border-slate-800 overflow-hidden"');

c = c.replace(/<div className="inline-flex items-center gap-2 bg-indigo-500\/20 text-indigo-300 border border-indigo-500\/30 px-3 py-1\.5 rounded-full text-xs font-semibold">/, '<div className="hidden md:inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-semibold">');

c = c.replace(/<p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">/, '<p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed hidden md:block">');

c = c.replace(/<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">/, '<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">');

c = c.replace(/min-h-\[140px\]"/g, 'min-h-[100px] md:min-h-[140px]"');
c = c.replace(/<span className="text-xs text-slate-400 block mt-1">\{t\('indexedFolders', language\)\}<\/span>/, '<span className="text-xs text-slate-400 mt-1 hidden md:block">{t(\'indexedFolders\', language)}</span>');
c = c.replace(/<div className="flex gap-2 text-\[10px\] text-slate-400 mt-1">/, '<div className="gap-2 text-[10px] text-slate-400 mt-1 hidden md:flex">');
c = c.replace(/<span className="text-xs text-slate-400 block mt-1">\{t\('totalTextSize', language\)\}<\/span>/, '<span className="text-xs text-slate-400 mt-1 hidden md:block">{t(\'totalTextSize\', language)}</span>');
c = c.replace(/<span className="text-xs text-slate-400 block mt-1">\{t\('readyToShare', language\)\}<\/span>/, '<span className="text-xs text-slate-400 mt-1 hidden md:block">{t(\'readyToShare\', language)}</span>');

c = c.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/, '<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">');
c = c.replace(/<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">/g, '<div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">');

c = c.replace(/<p className="text-xs text-slate-500">إجراءات تنظيمية سريعة لإنشاء وإدارة البنية الأساسية\.<\/p>/, '<p className="text-xs text-slate-500 hidden md:block">إجراءات تنظيمية سريعة لإنشاء وإدارة البنية الأساسية.</p>');
c = c.replace(/<p className="text-xs text-slate-500">\{t\('scheduledPublishing', language\)\}<\/p>/, '<p className="text-xs text-slate-500 hidden md:block">{t(\'scheduledPublishing\', language)}</p>');
c = c.replace(/<p className="text-xs text-slate-500">\{t\('noFoldersSub', language\)\}<\/p>/, '<p className="text-xs text-slate-500 hidden md:block">{t(\'noFoldersSub\', language)}</p>');

c = c.replace(/<div className="bg-white rounded-2xl p-5 border border-slate-100/g, '<div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100');

fs.writeFileSync('app/page.tsx', c);
