const fs = require('fs');
let content = fs.readFileSync('app/schedule/page.tsx', 'utf8');

if (!content.includes("import { t } from '@/lib/i18n';")) {
  content = content.replace(/import \{ useStore, Story \} from '@\/lib\/store';/, "import { useStore, Story } from '@/lib/store';\nimport { t } from '@/lib/i18n';");
}

if (!content.includes("language } = useStore();")) {
  content = content.replace(/updateStory \} = useStore\(\);/, "updateStory, language } = useStore();");
}

const replacements = [
  ['جدول النشر', 'scheduleTitle'],
  ['تخطيط وجدولة نصوصك للنشر', 'scheduleSub'],
  ['الأقدم أولاً', 'oldestFirst'],
  ['الأحدث أولاً', 'newestFirst'],
  ['جميع القصص', 'allStories'],
  ['تم النشر', 'published'],
  ['جاهز للنشر', 'readyToPublish'],
  ['مسودة', 'draft'],
  ['لا توجد قصص قادمة.', 'noUpcomingStories'],
  ['ابدأ بكتابة قصص جديدة وجدولتها للنشر.', 'noUpcomingStoriesSub'],
  ['تحديث:', 'updated'],
  ['بدون عنوان', 'untitled'],
  ['تعديل وجدولة', 'editAndSchedule'],
  ['اكتب قصة جديدة', 'writeNewStory'],
  ['لا يوجد محتوى بعد...', 'noContentYet'],
  ['نشر القصة الآن', 'publishNow'],
  ['هل أنت متأكد من تغيير حالة القصة إلى "منشور"؟', 'confirmPublish'],
];

for (const [ar, key] of replacements) {
  content = content.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  content = content.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  content = content.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
}

content = content.replace(/title=t\(([^)]+)\)/g, "title={t($1)}");

fs.writeFileSync('app/schedule/page.tsx', content);
