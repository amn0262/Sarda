const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    welcomeSarda: 'مرحباً بك في سـردة 👋',
    systemBadge: 'نظام إدارة المحتوى الصوتي والقصصي المتكامل',
    systemDesc: 'مركز التحكم الكامل لكتابة قصصك، وتنسيق مدوناتك، وتنظيم حلقات البودكاست وتصديرها كملفات PDF منسقة جاهزة للنشر والتوزيع.',
`;

const enAdds = `
    welcomeSarda: 'Welcome to Sarda 👋',
    systemBadge: 'Integrated Audio & Story Content Management System',
    systemDesc: 'Your complete control center for writing stories, formatting blogs, organizing podcast episodes, and exporting them as formatted PDFs ready for publishing and distribution.',
`;

if (!content.includes('welcomeSarda:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
