const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const arAdds = `
    trashEmpty: 'سلة المهملات فارغة',
    trashEmptySub: 'لم يتم حذف أي ملفات أو مجلدات بعد.',
    deletedFolders: 'المجلدات المحذوفة',
    deletedStories: 'القصص المحذوفة',
    restore: 'استعادة',
    permanentDelete: 'حذف نهائي',
    emptyTrashTitle: 'إفراغ سلة المهملات؟',
    emptyTrashSub: 'سيتم حذف جميع الملفات والمجلدات الموجودة في سلة المهملات بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.',
    confirmPermanentDeleteTitle: 'تأكيد الحذف النهائي',
    confirmPermanentDeleteSub: 'سيتم حذف هذا العنصر بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.',
    emptyTrash: 'إفراغ السلة',
    permanentDeleteAction: 'حذف نهائي',
`;

const enAdds = `
    trashEmpty: 'Trash is empty',
    trashEmptySub: 'No files or folders have been deleted yet.',
    deletedFolders: 'Deleted Folders',
    deletedStories: 'Deleted Stories',
    restore: 'Restore',
    permanentDelete: 'Permanent Delete',
    emptyTrashTitle: 'Empty Trash?',
    emptyTrashSub: 'All files and folders in the trash will be permanently deleted and this action cannot be undone.',
    confirmPermanentDeleteTitle: 'Confirm Permanent Delete',
    confirmPermanentDeleteSub: 'This item will be permanently deleted and this action cannot be undone.',
    emptyTrash: 'Empty Trash',
    permanentDeleteAction: 'Delete Permanently',
`;

content = content.replace(/(all: 'الكل',)/, `$1${arAdds}`);
content = content.replace(/(all: 'All',)/, `$1${enAdds}`);

fs.writeFileSync('lib/i18n.ts', content);
