const fs = require('fs');
let c = fs.readFileSync('app/layout.tsx', 'utf8');

c = c.replace(/سـردة - Sarda CMS/g, 'Sarda CMS');
c = c.replace(/نظام متكامل لصناع المحتوى الصوتي والقصصي/g, 'Integrated system for audio and story content creators');

fs.writeFileSync('app/layout.tsx', c);
