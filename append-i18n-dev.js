const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    aboutDev: 'حول المطور',
    devSub: 'مطور تطبيقات واجهات أمامية، شغوف ببناء تجارب مستخدم مميزة.',
    contactMe: 'تواصل معي',
    github: 'حساب GitHub',
    linkedin: 'حساب LinkedIn',
    dataManagement: 'إدارة البيانات',
    importMockData: 'استيراد بيانات تجريبية',
    confirmImportMockData: 'سيؤدي هذا إلى الكتابة فوق بياناتك الحالية. هل أنت متأكد؟',
`;

const enAdds = `
    aboutDev: 'About Developer',
    devSub: 'Frontend Developer, passionate about building exceptional user experiences.',
    contactMe: 'Contact Me',
    github: 'GitHub Profile',
    linkedin: 'LinkedIn Profile',
    dataManagement: 'Data Management',
    importMockData: 'Import Mock Data',
    confirmImportMockData: 'This will overwrite your current data. Are you sure?',
`;

content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
content = content.replace(/(all: 'All',)/, `$1${enAdds}`);

fs.writeFileSync('lib/i18n.ts', content);
