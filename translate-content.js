const fs = require('fs');
let content = fs.readFileSync('app/content/page.tsx', 'utf8');

// Ensure import t
if (!content.includes("import { t } from '@/lib/i18n';")) {
  content = content.replace(/import \{ useStore \} from '@\/lib\/store';/, "import { useStore } from '@/lib/store';\nimport { t } from '@/lib/i18n';");
}

// Add language to useStore
if (!content.includes("language } = useStore();")) {
  content = content.replace(/deleteStory, moveToTrash \} = useStore\(\);/, "deleteStory, moveToTrash, language } = useStore();");
}

const replacements = [
  ['إدارة المحتوى', 'contentManager'],
  ['أضف مجلداً للبدء.', 'addFolderStart'],
  ['لا توجد مجلدات.', 'noFolders'],
  ['قصص', 'storiesText'],
  ['إنشاء مجلد', 'createFolder'],
  ['تعديل', 'edit'],
  ['موافق', 'ok'],
  ['هل أنت متأكد من نقل هذا المجلد وجميع القصص بداخله إلى سلة المهملات؟', 'confirmTrashFolder'],
  ['جميع القصص', 'allStories'],
  ['جميع السنوات', 'allYears'],
  ['سنة', 'yearText'],
  ['جميع الأشهر', 'allMonths'],
  ['شهر', 'monthText'],
  ['الكل', 'all'],
  ['تصدير كمستند Word', 'exportWord'],
  ['إنشاء قصة', 'createStory'],
  ['تعديل القصة', 'editStory'],
  ['نقل إلى سلة المهملات', 'moveToTrash'],
  ['مسودة', 'draft'],
  ['جاهز للنشر', 'readyToPublish'],
  ['منشور', 'published'],
  ['تأكيد النقل لسلة المهملات', 'confirmTrashTitle'],
  ['هل أنت متأكد من رغبتك بنقل هذا العنصر إلى سلة المهملات؟ يمكنك استعادته لاحقاً من الإعدادات.', 'confirmTrashSub'],
  ['إلغاء', 'cancel'],
  ['نقل للسلة', 'moveToTrash'],
  ['قصة بدون عنوان', 'untitledStory'],
  ['لا توجد قصص في هذا المجلد.', 'noStoriesInFolder'],
  ['مجلد', 'folderText'],
  ['تعديل المجلد', 'editFolder'],
  ['اسم المجلد', 'folderName'],
];

for (const [ar, key] of replacements) {
  content = content.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  content = content.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  content = content.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
}

// special fixes
content = content.replace(/title=t\(([^)]+)\)/g, "title={t($1)}");
content = content.replace(/placeholder=t\(([^)]+)\)/g, "placeholder={t($1)}");

fs.writeFileSync('app/content/page.tsx', content);
