const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    backupImportSuccess: 'تم استيراد البيانات والنسخة الاحتياطية بنجاح!',
    backupImportInvalid: 'ملف النسخة الاحتياطية غير صالح. يجب أن يحتوي على المجلدات والقصص.',
    backupImportError: 'حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.',
    settingsTitle: 'الإعدادات',
    settingsSub: 'إدارة تفضيلات التطبيق وسلة المهملات',
    appPreferences: 'تفضيلات التطبيق',
    appPreferencesSub: 'تخصيص لغة الواجهة (العربية أو الإنجليزية)',
    appLanguage: 'لغة التطبيق',
    arabic: 'العربية',
    dataSync: 'إدارة البيانات والمزامنة',
    dataSyncSub: 'تصدير بياناتك احتياطياً أو استعادتها',
    exportBackup: 'تصدير النسخة الاحتياطية',
    exportBackupSub: 'حفظ جميع قصصك ومجلداتك كملف محلي',
    importBackup: 'استيراد النسخة الاحتياطية',
    importBackupSub: 'استعادة البيانات من ملف سابق',
    trash: 'سلة المهملات',
    trashSub: 'الملفات والمجلدات المحذوفة مؤقتاً',
`;

const enAdds = `
    backupImportSuccess: 'Backup data imported successfully!',
    backupImportInvalid: 'Invalid backup file. It must contain folders and stories.',
    backupImportError: 'Error reading backup file.',
    settingsTitle: 'Settings',
    settingsSub: 'Manage app preferences and trash',
    appPreferences: 'App Preferences',
    appPreferencesSub: 'Customize interface language (Arabic or English)',
    appLanguage: 'App Language',
    arabic: 'Arabic',
    dataSync: 'Data & Sync Management',
    dataSyncSub: 'Backup and restore your data',
    exportBackup: 'Export Backup',
    exportBackupSub: 'Save all stories and folders locally',
    importBackup: 'Import Backup',
    importBackupSub: 'Restore data from a backup file',
    trash: 'Trash',
    trashSub: 'Temporarily deleted files and folders',
`;

if (!content.includes('backupImportSuccess:')) {
  content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
  content = content.replace(/(all: 'All',)/, `$1${enAdds}`);
  fs.writeFileSync('lib/i18n.ts', content);
}
