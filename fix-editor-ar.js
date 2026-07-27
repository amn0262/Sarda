const fs = require('fs');
let c = fs.readFileSync('app/editor/[id]/page.tsx', 'utf8');

c = c.replace(/title="عريض"/g, "title={t('boldText', language)}");
c = c.replace(/title="عنوان 1"/g, "title={t('heading1', language)}");
c = c.replace(/title="عنوان 2"/g, "title={t('heading2', language)}");
c = c.replace(/title="عنوان 3"/g, "title={t('heading3', language)}");
c = c.replace(/title="قائمة منقطة"/g, "title={t('bulletList', language)}");
c = c.replace(/title="قائمة مرقمة"/g, "title={t('numberedList', language)}");
c = c.replace(/title="تغيير المحاذاة \(يمين \/ وسط \/ يسار\)"/g, "title={t('alignment', language)}");

c = c.replace(/alert\('الرجاء اختيار مجلد أولاً'\);/g, "alert(t('chooseFolderFirst', language));");
c = c.replace(/\|\| 'غير مصنف'/g, "|| t('uncategorized', language)");
c = c.replace(/ : 'غير محدد';/g, " : t('notSpecified', language);");
c = c.replace(/سـردة - Sarda CMS/g, "Sarda CMS");
c = c.replace(/\|\| 'قصة بدون عنوان'/g, "|| t('untitledStory', language)");
c = c.replace(/<strong>المجلد:<\/strong>/g, "<strong>${t('folderLabel', language)}:</strong>");
c = c.replace(/<strong>تاريخ النشر:<\/strong>/g, "<strong>${t('publishDateLabel', language)}:</strong>");
c = c.replace(/تم التصدير بواسطة سـردة لمحتوى القصص والصوتيات/g, "${t('exportedBySarda', language)}");
c = c.replace(/\|\| 'قصة'/g, "|| t('story', language)");
c = c.replace(/المجلد: \$\{folderName\} \| الحالة: \$\{statusText\} \| التاريخ: \$\{formattedDate\}/g, "${t('folderLabel', language)}: ${folderName} | ${t('publishStatusLabel', language)}: ${statusText} | ${t('publishDateLabel', language)}: ${formattedDate}");

c = c.replace(/يوجد تغييرات غير محفوظة/g, "{t('unsavedChangesTitle', language)}");
c = c.replace(/هل تريد حفظ التغييرات قبل المغادرة؟/g, "{t('unsavedChangesSub', language)}");
c = c.replace(/>\s*تجاهل\s*</g, ">{t('discard', language)}<");
c = c.replace(/>\s*إلغاء\s*</g, ">{t('cancel', language)}<");
c = c.replace(/عنوان القصة\.\.\./g, "{t('storyTitlePlaceholder', language)}");

c = c.replace(/>\s*الحالة:\s*</g, ">{t('statusLabel', language)}:<");
c = c.replace(/>\s*المجلد:\s*</g, ">{t('folderLabel', language)}:<");
c = c.replace(/>\s*التاريخ:\s*</g, ">{t('dateLabel', language)}:<");
c = c.replace(/>\s*اختر\.\.\.\s*</g, ">{t('choosePlaceholder', language)}<");

c = c.replace(/title="تحميل كملف Word"/g, "title={t('downloadWord', language)}");
c = c.replace(/title="تحميل كملف PDF"/g, "title={t('downloadPdf', language)}");
c = c.replace(/>\s*حفظ\s*</g, ">{t('save', language)}<");

fs.writeFileSync('app/editor/[id]/page.tsx', c);
