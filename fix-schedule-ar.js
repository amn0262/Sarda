const fs = require('fs');
let c = fs.readFileSync('app/schedule/page.tsx', 'utf8');

c = c.replace(/'مجلد محذوف'/g, "t('deletedFolder', language)");
c = c.replace(/تتبع خطة النشر الخاصة بك\. يتم عرض النصوص مرتبة زمنياً من الأقدم للأحدث\./g, "{t('scheduleTrackerDesc', language)}");
c = c.replace(/لا توجد نصوص مجدولة/g, "{t('noScheduledTexts', language)}");
c = c.replace(/قم بتحديد \&quot;تاريخ النشر المستهدف\&quot; لقصصك لتظهر هنا\./g, "{t('setTargetDateSub', language)}");
c = c.replace(/>\s*الذهاب لإدارة المحتوى\s*</g, ">{t('goToContentManager', language)}<");

fs.writeFileSync('app/schedule/page.tsx', c);
