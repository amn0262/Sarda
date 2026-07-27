const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    heading1: 'عنوان 1',
    heading2: 'عنوان 2',
    heading3: 'عنوان 3',
    bulletList: 'قائمة منقطة',
    numberedList: 'قائمة مرقمة',
    alignment: 'تغيير المحاذاة (يمين / وسط / يسار)',
    chooseFolderFirst: 'الرجاء اختيار مجلد أولاً',
    story: 'قصة',
    unsavedChangesTitle: 'يوجد تغييرات غير محفوظة',
    unsavedChangesSub: 'هل تريد حفظ التغييرات قبل المغادرة؟',
    discard: 'تجاهل',
    statusLabel: 'الحالة',
    dateLabel: 'التاريخ',
    choosePlaceholder: 'اختر...',
`;

const enAdds = `
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    bulletList: 'Bullet List',
    numberedList: 'Numbered List',
    alignment: 'Change Alignment (Right / Center / Left)',
    chooseFolderFirst: 'Please select a folder first',
    story: 'Story',
    unsavedChangesTitle: 'Unsaved Changes',
    unsavedChangesSub: 'Do you want to save changes before leaving?',
    discard: 'Discard',
    statusLabel: 'Status',
    dateLabel: 'Date',
    choosePlaceholder: 'Choose...',
`;

if (!content.includes('heading1:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
