const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    notSpecified: 'غير محدد',
    exportedBySarda: 'تم التصدير بواسطة سـردة لمحتوى القصص والصوتيات',
    quickControl: 'التحكم السريع',
    quickControlSub: 'إجراءات تنظيمية سريعة لإنشاء وإدارة البنية الأساسية.',
    newFolderNamePlaceholder: 'اسم المجلد الجديد...',
    add: 'إضافة',
    createNewFolder: 'إنشاء مجلد تنظيم جديد',
    browseAllFiles: 'استعراض كامل الملفات',
    upcomingPublishPlan: 'خطة النشر القريبة',
    upcomingPublishPlanSub: 'النصوص المجدول نشرها قريباً بحسب المخطط الزمني.',
    noUpcomingPosts: 'لا توجد منشورات مجدولة قريباً.',
    createFirstFolderSub: 'أنشئ مجلدك الأول للبدء في كتابة وتخزين قصصك بطريقة مرتبة.',
`;

const enAdds = `
    notSpecified: 'Not specified',
    exportedBySarda: 'Exported by Sarda for Stories and Audio Content',
    quickControl: 'Quick Control',
    quickControlSub: 'Quick organizational actions to create and manage the infrastructure.',
    newFolderNamePlaceholder: 'New folder name...',
    add: 'Add',
    createNewFolder: 'Create new organization folder',
    browseAllFiles: 'Browse all files',
    upcomingPublishPlan: 'Upcoming Publishing Plan',
    upcomingPublishPlanSub: 'Texts scheduled to be published soon according to the timeline.',
    noUpcomingPosts: 'No upcoming posts scheduled.',
    createFirstFolderSub: 'Create your first folder to start writing and storing your stories neatly.',
`;

if (!content.includes('notSpecified:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
