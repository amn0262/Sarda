const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    allYears: 'كل السنوات',
    allMonths: 'كل الأشهر',
    allStatuses: 'كل الحالات',
    subFolders: 'المجلدات الفرعية',
    folderColor: 'لون المجلد',
    parentFolder: 'المجلد الأب (اختياري)',
    none: 'لا يوجد',
    save: 'حفظ',
    noStoriesHere: 'لا توجد قصص هنا',
    startWritingInFolder: 'ابدأ بكتابة قصتك الأولى في هذا المجلد.',
    selectFolderToView: 'اختر مجلداً لاستعراض المحتوى',
    downloadWord: 'تنزيل وورد',
`;

const enAdds = `
    allYears: 'All Years',
    allMonths: 'All Months',
    allStatuses: 'All Statuses',
    subFolders: 'Subfolders',
    folderColor: 'Folder Color',
    parentFolder: 'Parent Folder (Optional)',
    none: 'None',
    save: 'Save',
    noStoriesHere: 'No stories here',
    startWritingInFolder: 'Start writing your first story in this folder.',
    selectFolderToView: 'Select a folder to view content',
    downloadWord: 'Download Word',
`;

// Only add if not already there
if (!content.includes('allStatuses:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
