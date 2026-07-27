const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    deletedFolder: 'مجلد محذوف',
    scheduleTrackerDesc: 'تتبع خطة النشر الخاصة بك. يتم عرض النصوص مرتبة زمنياً من الأقدم للأحدث.',
    noScheduledTexts: 'لا توجد نصوص مجدولة',
    setTargetDateSub: 'قم بتحديد "تاريخ النشر المستهدف" لقصصك لتظهر هنا.',
    goToContentManager: 'الذهاب لإدارة المحتوى',
`;

const enAdds = `
    deletedFolder: 'Deleted Folder',
    scheduleTrackerDesc: 'Track your publishing plan. Texts are displayed in chronological order from oldest to newest.',
    noScheduledTexts: 'No scheduled texts',
    setTargetDateSub: 'Set a "Target Publishing Date" for your stories for them to appear here.',
    goToContentManager: 'Go to Content Manager',
`;

if (!content.includes('deletedFolder:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
