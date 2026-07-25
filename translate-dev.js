const fs = require('fs');
let content = fs.readFileSync('app/dev-info/page.tsx', 'utf8');

if (!content.includes("import { t } from '@/lib/i18n';")) {
  content = content.replace(/import \{ useStore \} from '@\/lib\/store';/, "import { useStore } from '@/lib/store';\nimport { t } from '@/lib/i18n';");
}

if (!content.includes("language } = useStore();")) {
  content = content.replace(/importData \} = useStore\(\);/, "importData, language } = useStore();");
}

const replacements = [
  ['حول المطور', 'aboutDev'],
  ['مطور تطبيقات واجهات أمامية، شغوف ببناء تجارب مستخدم مميزة.', 'devSub'],
  ['تواصل معي', 'contactMe'],
  ['حساب GitHub', 'github'],
  ['حساب LinkedIn', 'linkedin'],
  ['إدارة البيانات', 'dataManagement'],
  ['استيراد بيانات تجريبية', 'importMockData'],
  ['سيؤدي هذا إلى الكتابة فوق بياناتك الحالية. هل أنت متأكد؟', 'confirmImportMockData'],
];

for (const [ar, key] of replacements) {
  content = content.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  content = content.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  content = content.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
}

content = content.replace(/title=t\(([^)]+)\)/g, "title={t($1)}");

fs.writeFileSync('app/dev-info/page.tsx', content);
