const fs = require('fs');
let c = fs.readFileSync('app/settings/page.tsx', 'utf8');

c = c.replace(/سردة_نسخة_احتياطية_/g, "sarda_backup_");
c = c.replace(/'تم استيراد البيانات والنسخة الاحتياطية بنجاح!'/g, "t('backupImportSuccess', language)");
c = c.replace(/'ملف النسخة الاحتياطية غير صالح\. يجب أن يحتوي على المجلدات والقصص\.'/g, "t('backupImportInvalid', language)");
c = c.replace(/'حدث خطأ أثناء قراءة ملف النسخة الاحتياطية\.'/g, "t('backupImportError', language)");

c = c.replace(/\{language === 'ar' \? 'الإعدادات' : 'Settings'\}/g, "{t('settingsTitle', language)}");
c = c.replace(/\{language === 'ar' \? 'إدارة تفضيلات التطبيق وسلة المهملات' : 'Manage app preferences and trash'\}/g, "{t('settingsSub', language)}");
c = c.replace(/\{language === 'ar' \? 'تفضيلات التطبيق' : 'App Preferences'\}/g, "{t('appPreferences', language)}");
c = c.replace(/\{language === 'ar' \? 'تخصيص لغة الواجهة \(العربية أو الإنجليزية\)' : 'Customize interface language \(Arabic or English\)'\}/g, "{t('appPreferencesSub', language)}");
c = c.replace(/\{language === 'ar' \? 'لغة التطبيق' : 'App Language'\}/g, "{t('appLanguage', language)}");
c = c.replace(/>\s*العربية\s*</g, ">{t('arabic', language)}<");
c = c.replace(/\{language === 'ar' \? 'إدارة البيانات والمزامنة' : 'Data \& Sync Management'\}/g, "{t('dataSync', language)}");
c = c.replace(/\{language === 'ar' \? 'تصدير بياناتك احتياطياً أو استعادتها' : 'Backup and restore your data'\}/g, "{t('dataSyncSub', language)}");
c = c.replace(/\{language === 'ar' \? 'تصدير النسخة الاحتياطية' : 'Export Backup'\}/g, "{t('exportBackup', language)}");
c = c.replace(/\{language === 'ar' \? 'حفظ جميع قصصك ومجلداتك كملف محلي' : 'Save all stories and folders locally'\}/g, "{t('exportBackupSub', language)}");
c = c.replace(/\{language === 'ar' \? 'استيراد النسخة الاحتياطية' : 'Import Backup'\}/g, "{t('importBackup', language)}");
c = c.replace(/\{language === 'ar' \? 'استعادة البيانات من ملف سابق' : 'Restore data from a backup file'\}/g, "{t('importBackupSub', language)}");
c = c.replace(/\{language === 'ar' \? 'سلة المهملات' : 'Trash'\}/g, "{t('trash', language)}");
c = c.replace(/\{language === 'ar' \? 'الملفات والمجلدات المحذوفة مؤقتاً' : 'Temporarily deleted files and folders'\}/g, "{t('trashSub', language)}");

fs.writeFileSync('app/settings/page.tsx', c);
