const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    devInfoDesc: 'معلومات عن مطور النظام وأدوات متقدمة لإدارة قاعدة البيانات.',
    aymen: 'أيمن بكور',
    systemDev: 'مطور النظام',
    devPara1_1: 'تم تطوير نظام',
    devPara1_2: 'ليكون الأداة المثالية لصناع المحتوى الصوتي والقصصي.',
    devPara2: 'يهدف النظام إلى توفير بيئة عمل خالية من التشتت، مع أدوات متكاملة لإدارة المحتوى من الفكرة وحتى النشر.',
    version: 'الإصدار 1.0.0',
`;

const enAdds = `
    devInfoDesc: 'Information about the system developer and advanced tools for database management.',
    aymen: 'Aymen Bakkour',
    systemDev: 'System Developer',
    devPara1_1: 'The system',
    devPara1_2: 'was developed to be the ultimate tool for audio content and story creators.',
    devPara2: 'The system aims to provide a distraction-free work environment, with integrated tools to manage content from idea to publishing.',
    version: 'Version 1.0.0',
`;

content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
content = content.replace(/(all: 'All',)/, `$1${enAdds}`);

fs.writeFileSync('lib/i18n.ts', content);
