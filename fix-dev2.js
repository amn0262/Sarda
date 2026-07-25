const fs = require('fs');
let c = fs.readFileSync('app/dev-info/page.tsx', 'utf8');

c = c.replace(/\{\/\* Database Tools \*\/\}[\s\S]*?<\/motion\.div>/, '');
c = c.replace(/md:grid-cols-2/, 'md:grid-cols-1 max-w-2xl mx-auto');

fs.writeFileSync('app/dev-info/page.tsx', c);
