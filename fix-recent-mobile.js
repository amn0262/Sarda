const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/className="text-xs text-slate-500 line-clamp-2 mt-1"/g, 'className="text-xs text-slate-500 line-clamp-2 mt-1 hidden md:block"');
c = c.replace(/className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"/g, 'className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-2 md:space-y-4 hover:shadow-md transition-shadow"');

// make the header of the recent stories smaller on mobile
c = c.replace(/<h2 className="text-xl font-bold text-slate-900">\{t\('recentStories', language\)\}<\/h2>/, '<h2 className="text-lg md:text-xl font-bold text-slate-900">{t(\'recentStories\', language)}</h2>');
c = c.replace(/<h2 className="text-lg font-bold text-slate-900 mb-1">\{t\('foldersAndQuickAccess', language\)\}<\/h2>/, '<h2 className="text-base md:text-lg font-bold text-slate-900 mb-1">{t(\'foldersAndQuickAccess\', language)}</h2>');

fs.writeFileSync('app/page.tsx', c);
