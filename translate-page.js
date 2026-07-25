const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

content = content.replace(/import \{ useStore, Story, Folder as FolderType \} from '@\/lib\/store';/, "import { useStore, Story, Folder as FolderType } from '@/lib/store';\nimport { t } from '@/lib/i18n';");

const replacements = [
  ['مرحباً بعودتك، كاتبنا المبدع!', 'welcome'],
  ['لوحة التحكم السريعة لإدارة نصوصك وقصصك الصوتية. ماذا سنكتب اليوم؟', 'subWelcome'],
  ['كتابة قصة جديدة', 'newStory'],
  ['الرجاء إنشاء مجلد أولاً لتنظيم نصوصك بداخله.', 'createFolderFirst'],
  ['إجمالي المجلدات', 'totalFolders'],
  ['وحدات تنظيمية مفهرسة', 'indexedFolders'],
  ['القصص المكتوبة', 'writtenStories'],
  ['منشور', 'published'],
  ['مسودة', 'draft'],
  ['الكلمات المكتوبة', 'writtenWords'],
  ['حجم النصوص الإجمالي', 'totalTextSize'],
  ['جاهز للنشر', 'readyToPublish'],
  ['جاهزة للمشاركة والبث', 'readyToShare'],
  ['إجراءات سريعة التنفيذ', 'quickActions'],
  ['أدوات مساعدة لتنظيم وتسريع سير عملك اليومي.', 'quickActionsSub'],
  ['إضافة مجلد جديد', 'addFolder'],
  ['إنشاء مجلد', 'addNewFolder'],
  ['اسم المجلد \\(مثال: قصص رعب، مقالات\\.\\.\\.\\)', 'folderNamePlaceholder'],
  ['المجلدات والوصول السريع', 'foldersAndQuickAccess'],
  ['لم تقم بإنشاء مجلدات بعد', 'noFoldersYet'],
  ['المجلدات تساعدك في ترتيب نصوصك حسب السلسلة أو النوع.', 'noFoldersSub'],
  ['إضافة مجلد الآن', 'addFolderNow'],
  ['قصة مسجلة', 'savedStory'],
  ['كتابة قصة جديدة في هذا المجلد', 'writeNewStoryInFolder'],
  ['القصص والنصوص الأخيرة', 'recentStories'],
  ['عرض الكل ←', 'viewAll'],
  ['لا توجد قصص حتى الآن', 'noStoriesYet'],
  ['ابدأ بملء مجلداتك بنصوص وصوتيات رائعة.', 'noStoriesSub'],
  ['غير مصنف', 'uncategorized'],
  ['بدون عنوان', 'untitled'],
  ['لا يوجد محتوى بعد...', 'noContentYet'],
  ['كلمة', 'words'],
  ['تحديث:', 'updated'],
  ['تعديل القصة', 'editStory'],
  ['تنزيل PDF مباشرة', 'downloadPdf'],
  ['نقل إلى سلة المهملات', 'moveToTrash'],
  ['تأكيد النقل لسلة المهملات', 'confirmTrashTitle'],
  ['هل أنت متأكد من رغبتك بنقل هذا العنصر إلى سلة المهملات؟ يمكنك استعادته لاحقاً من الإعدادات.', 'confirmTrashSub'],
  ['نقل للسلة', 'moveToTrash'],
  ['إلغاء', 'cancel'],
  ['أقرب القصص لجدول النشر', 'upcomingStories'],
  ['قصص تمت جدولتها للنشر قريباً.', 'scheduledPublishing'],
  ['عرض جدول النشر بالكامل', 'viewSchedule']
];

for (const [ar, key] of replacements) {
  // Replace JSX text like >text<
  content = content.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  // Replace string literals like 'text' or "text"
  content = content.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  content = content.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
}

// Special case for placeholder which isn't exact match due to regex escaping in array above
content = content.replace(/placeholder="اسم المجلد \(مثال: قصص رعب، مقالات\.\.\.\)"/, "placeholder={t('folderNamePlaceholder', language)}");

fs.writeFileSync('app/page.tsx', content);
