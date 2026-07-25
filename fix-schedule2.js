const fs = require('fs');
let c = fs.readFileSync('app/schedule/page.tsx', 'utf8');

c = c.replace('import { useStore } from \'@/lib/store\';', 'import { useStore } from \'@/lib/store\';\nimport { t } from "@/lib/i18n";');
c = c.replace(" منشور<", " {t('published', language)}<");
c = c.replace(/اليوم/g, "{t('today', language)}");

fs.writeFileSync('app/schedule/page.tsx', c);
