const fs = require('fs');
let c = fs.readFileSync('app/dev-info/page.tsx', 'utf8');

const reps = [
  ['معلومات عن مطور النظام وأدوات متقدمة لإدارة قاعدة البيانات.', 'devInfoDesc'],
  ['أيمن بكور', 'aymen'],
  ['مطور النظام', 'systemDev'],
  ['تم تطوير نظام', 'devPara1_1'],
  ['ليكون الأداة المثالية لصناع المحتوى الصوتي والقصصي.', 'devPara1_2'],
  ['يهدف النظام إلى توفير بيئة عمل خالية من التشتت، مع أدوات متكاملة لإدارة المحتوى من الفكرة وحتى النشر.', 'devPara2'],
  ['الإصدار 1.0.0', 'version'],
];

for (const [ar, key] of reps) {
  c = c.replace(new RegExp(`>\\s*${ar}\\s*<`, 'g'), `>{t('${key}', language)}<`);
  c = c.replace(new RegExp(`'${ar}'`, 'g'), `t('${key}', language)`);
  c = c.replace(new RegExp(`"${ar}"`, 'g'), `t('${key}', language)`);
  c = c.replace(ar, `{t('${key}', language)}`);
}

fs.writeFileSync('app/dev-info/page.tsx', c);
