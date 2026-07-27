const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/قصة بدون عنوان/g, "{t('untitledStory', language)}");
c = c.replace(/غير محدد/g, "{t('notSpecified', language)}");
c = c.replace(/سـردة - Sarda CMS/g, "Sarda CMS");
c = c.replace(/<strong>المجلد:<\/strong>/g, "<strong>{t('folderLabel', language)}:</strong>");
c = c.replace(/<strong>تاريخ النشر:<\/strong>/g, "<strong>{t('publishDateLabel', language)}:</strong>");
c = c.replace(/<strong>وقت النشر:<\/strong>/g, "<strong>{t('publishTimeLabel', language)}:</strong>");
c = c.replace(/غير حدد/g, "{t('notSpecified', language)}");
c = c.replace(/تم التصدير بواسطة سـردة لمحتوى القصص والصوتيات/g, "{t('exportedBySarda', language)}");

c = c.replace(/\{publishedStories\} منشور/g, "{publishedStories} {t('published', language)}");
c = c.replace(/\{draftStories\} مسودة/g, "{draftStories} {t('draft', language)}");

c = c.replace(/التحكم السريع/g, "{t('quickControl', language)}");
c = c.replace(/إجراءات تنظيمية سريعة لإنشاء وإدارة البنية الأساسية\./g, "{t('quickControlSub', language)}");
c = c.replace(/اسم المجلد الجديد\.\.\./g, "{t('newFolderNamePlaceholder', language)}");
c = c.replace(/>\s*إضافة\s*</g, ">{t('add', language)}<");
c = c.replace(/إنشاء مجلد تنظيم جديد/g, "{t('createNewFolder', language)}");
c = c.replace(/استعراض كامل الملفات/g, "{t('browseAllFiles', language)}");

c = c.replace(/خطة النشر القريبة/g, "{t('upcomingPublishPlan', language)}");
c = c.replace(/النصوص المجدول نشرها قريباً بحسب المخطط الزمني\./g, "{t('upcomingPublishPlanSub', language)}");
c = c.replace(/لا توجد منشورات مجدولة قريباً\./g, "{t('noUpcomingPosts', language)}");

c = c.replace(/أنشئ مجلدك الأول للبدء في كتابة وتخزين قصصك بطريقة مرتبة\./g, "{t('createFirstFolderSub', language)}");
c = c.replace(/\{folderStoriesCount\} قصة مسجلة/g, "{folderStoriesCount} {t('savedStory', language)}");
c = c.replace(/\{wordCount\} كلمة/g, "{wordCount} {t('words', language)}");
c = c.replace(/تحديث:/g, "{t('updated', language)}");

c = c.replace(/'ar'/g, "language === 'ar' ? 'ar' : 'en'");

fs.writeFileSync('app/page.tsx', c);
