const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

content = content.replace(/title=t\(([^)]+)\)/g, "title={t($1)}");
content = content.replace(/placeholder=t\(([^)]+)\)/g, "placeholder={t($1)}");
content = content.replace(/import \{ t \} from '@\/lib\/i18n';/g, ""); // remove it to add it safely
content = content.replace(/import \{ useStore, Story, Folder as FolderType \} from '@\/lib\/store';/, "import { useStore, Story, Folder as FolderType } from '@/lib/store';\nimport { t } from '@/lib/i18n';");

fs.writeFileSync('app/page.tsx', content);
