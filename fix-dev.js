const fs = require('fs');
let c = fs.readFileSync('app/dev-info/page.tsx', 'utf8');
c = c.replace('import { t } from "@/lib/i18n";\n\'use client\';', '\'use client\';\nimport { t } from "@/lib/i18n";');
fs.writeFileSync('app/dev-info/page.tsx', c);
