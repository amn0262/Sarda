const fs = require('fs');
let c = fs.readFileSync('app/content/page.tsx', 'utf8');
c = c.replace('import { t } from "@/lib/i18n";\n\'use client\';', '\'use client\';\nimport { t } from "@/lib/i18n";');
fs.writeFileSync('app/content/page.tsx', c);
