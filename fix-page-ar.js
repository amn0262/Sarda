const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/<span>نظام إدارة المحتوى الصوتي والقصصي المتكامل<\/span>/, '<span>{t(\'systemBadge\', language)}</span>');
c = c.replace(/مرحباً بك في سـردة 👋/, '{t(\'welcomeSarda\', language)}');
c = c.replace(/مركز التحكم الكامل لكتابة قصصك، وتنسيق مدوناتك، وتنظيم حلقات البودكاست وتصديرها كملفات PDF منسقة جاهزة للنشر والتوزيع\./, '{t(\'systemDesc\', language)}');

fs.writeFileSync('app/page.tsx', c);
