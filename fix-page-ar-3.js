const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/': '\{t\('notSpecified', language\)\}';/, "': t('notSpecified', language);");
c = c.replace(/\{t\('untitledStory', language\)\}/g, "${t('untitledStory', language)}");
c = c.replace(/\{t\('folderLabel', language\)\}/g, "${t('folderLabel', language)}");
c = c.replace(/\{t\('publishDateLabel', language\)\}/g, "${t('publishDateLabel', language)}");
c = c.replace(/\{t\('publishTimeLabel', language\)\}/g, "${t('publishTimeLabel', language)}");
c = c.replace(/\{t\('notSpecified', language\)\}/g, "${t('notSpecified', language)}");
c = c.replace(/\{t\('exportedBySarda', language\)\}/g, "${t('exportedBySarda', language)}");

// Wait, looking at the code snippet from the build error:
// `}) : '{t('notSpecified', language)}';` => we replaced the first one properly.
// The others are inside `...` so `${t('...', language)}` is correct.

// Let's also check for `<title>${story.title || '${t('untitledStory', language)}'}</title>`
c = c.replace(/'\$\{t\('untitledStory', language\)\}'/g, "t('untitledStory', language)");

fs.writeFileSync('app/page.tsx', c);
