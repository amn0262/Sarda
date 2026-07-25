const fs = require('fs');
let content = fs.readFileSync('app/editor/[id]/page.tsx', 'utf8');

if (!content.includes("import { t } from '@/lib/i18n';")) {
  content = content.replace(/import \{ useStore \} from '@\/lib\/store';/, "import { useStore } from '@/lib/store';\nimport { t } from '@/lib/i18n';");
}

if (!content.includes("language } = useStore();")) {
  content = content.replace(/updateStory \} = useStore\(\);/, "updateStory, language } = useStore();");
  content = content.replace(/addFolder \} = useStore\(\);/, "addFolder, language } = useStore();");
  content = content.replace(/const \{ folders, stories, addStory, updateStory \} = useStore\(\);/, "const { folders, stories, addStory, updateStory, language } = useStore();");
}

const replacements = [
  ['إعدادات القصة', 'storySettings'],
  ['عنوان القصة', 'storyTitleLabel'],
  ['أدخل عنواناً مميزاً لقصتك...', 'storyTitlePlaceholder'],
  ['المجلد', 'folderLabel'],
  ['تحديد تاريخ النشر', 'publishDateLabel'],
  ['اليوم', 'today'],
  ['غداً', 'tomorrow'],
  ['بعد أسبوع', 'nextWeek'],
  ['مخصص', 'customDate'],
  ['وقت النشر', 'publishTimeLabel'],
  ['صباحاً', 'morning'],
  ['عصراً', 'afternoon'],
  ['مساءً', 'evening'],
  ['أدوات التنسيق', 'formattingTools'],
  ['عنوان', 'headingText'],
  ['غامق', 'boldText'],
  ['مائل', 'italicText'],
  ['قائمة', 'listText'],
  ['اقتباس', 'quoteText'],
  ['إضافة ملاحظة محرر', 'addEditorNote'],
  ['إحصائيات', 'statistics'],
  ['كلمة', 'wordText'],
  ['حرف', 'charText'],
  ['دقيقة قراءة', 'readTimeText'],
  ['حالة النشر', 'publishStatusLabel'],
  ['مسودة', 'draft'],
  ['جاهز للنشر', 'readyToPublish'],
  ['منشور', 'published'],
  ['تم حفظ التغييرات', 'changesSaved'],
  ['احفظ تقدمك بانتظام', 'saveRegularly'],
  ['حفظ التغييرات', 'saveChanges'],
  ['رجوع', 'goBack'],
  ['الرجاء إنشاء مجلد أولاً لتنظيم نصوصك بداخله.', 'createFolderFirst'],
  ['ابدأ بكتابة قصتك هنا...', 'startWritingHere'],
  ['اكتب ما يجول في خاطرك...', 'writeWhatsOnYourMind'],
  ['أدوات متقدمة', 'advancedTools'],
  ['بدون عنوان', 'untitled'],
  ['رجوع للوحة التحكم', 'backToDashboard'],
  ['تم الحفظ تلقائياً', 'autoSaved'],
];

for (const [ar, key] of replacements) {
  content = content.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  content = content.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  content = content.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
}

content = content.replace(/title=t\(([^)]+)\)/g, "title={t($1)}");
content = content.replace(/placeholder=t\(([^)]+)\)/g, "placeholder={t($1)}");

fs.writeFileSync('app/editor/[id]/page.tsx', content);
