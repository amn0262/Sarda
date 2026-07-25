const fs = require('fs');
let content = fs.readFileSync('app/settings/page.tsx', 'utf8');

if (!content.includes("import { t } from '@/lib/i18n';")) {
  content = content.replace(/import \{ useStore \} from '@\/lib\/store';/, "import { useStore } from '@/lib/store';\nimport { t } from '@/lib/i18n';");
}

const replacements = [
  ['سلة المهملات فارغة', 'trashEmpty'],
  ['لم يتم حذف أي ملفات أو مجلدات بعد.', 'trashEmptySub'],
  ['المجلدات المحذوفة', 'deletedFolders'],
  ['القصص المحذوفة', 'deletedStories'],
  ['استعادة', 'restore'],
  ['حذف نهائي', 'permanentDelete'],
  ['قصة بدون عنوان', 'untitledStory'],
  ['إفراغ سلة المهملات؟', 'emptyTrashTitle'],
  ['سيتم حذف جميع الملفات والمجلدات الموجودة في سلة المهملات بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.', 'emptyTrashSub'],
  ['تأكيد الحذف النهائي', 'confirmPermanentDeleteTitle'],
  ['سيتم حذف هذا العنصر بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.', 'confirmPermanentDeleteSub'],
  ['إفراغ السلة', 'emptyTrash'],
  ['إلغاء', 'cancel'],
  ['حذف نهائي', 'permanentDeleteAction'],
];

for (const [ar, key] of replacements) {
  content = content.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  content = content.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  content = content.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
}

content = content.replace(/title=t\(([^)]+)\)/g, "title={t($1)}");

fs.writeFileSync('app/settings/page.tsx', content);
