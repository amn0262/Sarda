const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    createSubFolder: 'إنشاء مجلد فرعي',
    searchStoriesPlaceholder: 'بحث في القصص...',
    newSubfolder: 'مجلد فرعي جديد',
`;

const enAdds = `
    createSubFolder: 'Create Subfolder',
    searchStoriesPlaceholder: 'Search stories...',
    newSubfolder: 'New Subfolder',
`;

if (!content.includes('createSubFolder:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
