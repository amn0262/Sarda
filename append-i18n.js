const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    scheduleTitle: 'جدول النشر',
    scheduleSub: 'تخطيط وجدولة نصوصك للنشر',
    oldestFirst: 'الأقدم أولاً',
    newestFirst: 'الأحدث أولاً',
    noUpcomingStories: 'لا توجد قصص قادمة.',
    noUpcomingStoriesSub: 'ابدأ بكتابة قصص جديدة وجدولتها للنشر.',
    editAndSchedule: 'تعديل وجدولة',
    writeNewStory: 'اكتب قصة جديدة',
    publishNow: 'نشر القصة الآن',
    confirmPublish: 'هل أنت متأكد من تغيير حالة القصة إلى "منشور"؟',
`;

const enAdds = `
    scheduleTitle: 'Publishing Schedule',
    scheduleSub: 'Plan and schedule your texts for publishing',
    oldestFirst: 'Oldest First',
    newestFirst: 'Newest First',
    noUpcomingStories: 'No upcoming stories.',
    noUpcomingStoriesSub: 'Start writing new stories and scheduling them for publishing.',
    editAndSchedule: 'Edit and Schedule',
    writeNewStory: 'Write New Story',
    publishNow: 'Publish Now',
    confirmPublish: 'Are you sure you want to change the story status to "Published"?',
`;

content = content.replace(/scheduleTitle: 'جدول النشر',[\s\S]*?confirmPublish: 'هل أنت متأكد من تغيير حالة القصة إلى "منشور"؟',/, '');
content = content.replace(/scheduleTitle: 'Publishing Schedule',[\s\S]*?confirmPublish: 'Are you sure you want to change the story status to "Published"\?',/, '');

content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
content = content.replace(/(all: 'All',)/, `$1${enAdds}`);

fs.writeFileSync('lib/i18n.ts', content);
