const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/ \: '\$\{t\('notSpecified', language\)\}'/g, " : t('notSpecified', language)");
c = c.replace(/\|\| '\$\{t\('notSpecified', language\)\}'/g, "|| t('notSpecified', language)");

fs.writeFileSync('app/page.tsx', c);
