'use client';

import { useState, useEffect } from 'react';
import { t } from "@/lib/i18n";
import { useStore, StoryStatus } from '@/lib/store';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Save, ArrowRight, Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, FileDown, FileText, Star, Eye, EyeOff, Maximize, Minimize, Trash2 } from 'lucide-react';
import Link from 'next/link';

const MenuBar = ({ editor }: { editor: any }) => {
  const { language } = useStore();
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-300 bg-neutral-50 rounded-none">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('bold') ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('boldText', language)}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('italic') ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('italicText', language)}
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-neutral-300 mx-0.5" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('heading1', language)}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('heading2', language)}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('heading', { level: 3 }) ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('heading3', language)}
      >
        <Heading3 className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-neutral-300 mx-0.5" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('bulletList') ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('bulletList', language)}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-none transition-colors border ${editor.isActive('orderedList') ? 'bg-black text-white border-black font-bold' : 'hover:bg-neutral-200 text-neutral-800 border-transparent'}`}
        title={t('numberedList', language)}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-neutral-300 mx-0.5" />
      <button
        onClick={() => {
          if (editor.isActive({ textAlign: 'right' })) {
            editor.chain().focus().setTextAlign('center').run();
          } else if (editor.isActive({ textAlign: 'center' })) {
            editor.chain().focus().setTextAlign('left').run();
          } else {
            editor.chain().focus().setTextAlign('right').run();
          }
        }}
        className="p-1.5 rounded-none hover:bg-neutral-200 text-neutral-800 bg-neutral-100 border border-neutral-300 transition-colors flex items-center gap-1"
        title={t('alignment', language)}
      >
        {editor.isActive({ textAlign: 'left' }) ? (
          <AlignLeft className="w-4 h-4 text-black" />
        ) : editor.isActive({ textAlign: 'center' }) ? (
          <AlignCenter className="w-4 h-4 text-black" />
        ) : (
          <AlignRight className="w-4 h-4 text-black" />
        )}
      </button>
    </div>
  );
};

export default function EditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { stories, addStory, updateStory, toggleFavorite, moveToTrash, folders, language, isFocusMode, setIsFocusMode } = useStore();
  
  const id = params.id as string;
  const isNew = id === 'new';
  const folderIdParam = searchParams.get('folderId');

  const existingStory = !isNew ? stories.find(s => s.id === id) : null;

  const [title, setTitle] = useState(existingStory?.title || '');
  const [status, setStatus] = useState<StoryStatus>(existingStory?.status || 'draft');
  const [targetDate, setTargetDate] = useState(existingStory?.targetDate || '');
  const [publishTime, setPublishTime] = useState(existingStory?.publishTime || '');
  const [folderId, setFolderId] = useState(existingStory?.folderId || folderIdParam || '');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Initial states for dirty check
  const [initialState, setInitialState] = useState({
    title: existingStory?.title || '',
    status: existingStory?.status || 'draft',
    targetDate: existingStory?.targetDate || '',
    publishTime: existingStory?.publishTime || '',
    folderId: existingStory?.folderId || folderIdParam || '',
    content: existingStory?.content || '<p dir="rtl"></p>'
  });

  useEffect(() => {
    if (!isNew && !existingStory) {
      router.push('/content');
    }
  }, [existingStory, isNew, router]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
    ],
    content: initialState.content,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-neutral max-w-none focus:outline-none min-h-[500px] p-6 md:p-10 text-right text-neutral-900',
        dir: 'rtl',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [isReadOnly, editor]);

  useEffect(() => {
    // Cleanup focus mode on unmount
    return () => {
      setIsFocusMode(false);
    };
  }, [setIsFocusMode]);

  useEffect(() => {
    if (isNew && searchParams.get('fromClipboard') === 'true' && editor) {
      const text = localStorage.getItem('tempClipboardContent');
      if (text) {
        const lines = text.split('\n');
        const newTitle = lines[0].substring(0, 100).trim();
        const targetDateVal = new Date().toISOString().split('T')[0];
        const htmlContent = lines.map(line => `<p dir="rtl">${line}</p>`).join('');
        
        localStorage.removeItem('tempClipboardContent');
        setTimeout(() => {
          setTitle(newTitle);
          setTargetDate(targetDateVal);
          editor.commands.setContent(htmlContent);
        }, 0);
      }
    }
  }, [isNew, searchParams, editor]);

  const checkIsDirty = () => {
    if (!editor) return false;
    const currentContent = editor.getHTML();
    return (
      title !== initialState.title ||
      status !== initialState.status ||
      targetDate !== initialState.targetDate ||
      publishTime !== initialState.publishTime ||
      folderId !== initialState.folderId ||
      currentContent !== initialState.content
    );
  };

  const getDestination = () => {
    return folderId ? `/content?folderId=${encodeURIComponent(folderId)}` : '/content';
  };

  const handleBackClick = () => {
    if (checkIsDirty()) {
      setShowUnsavedModal(true);
    } else {
      router.push(getDestination());
    }
  };

  const handleSave = () => {
    if (!folderId) {
      alert(t('chooseFolderFirst', language));
      return;
    }

    const currentContent = editor?.getHTML() || '';
    const storyData = {
      title,
      content: currentContent,
      status,
      targetDate,
      publishTime,
      folderId,
      style: 'classic' as const,
    };

    if (isNew) {
      addStory(storyData);
    } else {
      updateStory(id, storyData);
    }
    
    // Update initial state so it is no longer dirty
    setInitialState({
      title,
      status,
      targetDate,
      publishTime,
      folderId,
      content: currentContent
    });

    router.push(getDestination());
  };

  const handleDeleteStoryConfirm = () => {
    if (!isNew && existingStory) {
      moveToTrash(existingStory.id, 'story');
      router.push(getDestination());
    }
  };

  const handleExportPDF = () => {
    if (!editor) return;

    const contentHtml = editor.getHTML();
    const folderName = folders.find(f => f.id === folderId)?.name || t('uncategorized', language);
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) return;
    
    const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString(language === 'ar' ? 'ar' : 'en', {
      numberingSystem: 'latn',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : t('notSpecified', language);

    const statusText = status === 'published' ? t('published', language) : status === 'ready' ? t('readyToPublish', language) : t('draft', language);
    
    iframeDoc.write(`
      \x3Chtml lang="ar" dir="rtl">
        <head>
          <title>${title || t('untitledStory', language)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
            
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Tajawal', sans-serif;
              color: #000000;
              line-height: 1.8;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .doc-header {
              border-bottom: 2px solid #000000;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            
            .logo {
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: #000000;
            }
            
            .header-badge {
              display: inline-block;
              padding: 3px 10px;
              font-size: 11px;
              font-weight: bold;
              border: 1px solid #000000;
              border-radius: 4px;
              background: #000000;
              color: #ffffff;
            }
            
            .doc-title {
              font-size: 26px;
              font-weight: 900;
              color: #000000;
              margin: 16px 0 12px 0;
            }
            
            .metadata-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              font-size: 11px;
              color: #333333;
              background: #f5f5f5;
              padding: 8px 12px;
              border: 1px solid #e5e5e5;
              border-radius: 4px;
            }
            
            .doc-content {
              font-size: 15px;
              color: #111111;
              line-height: 2;
              text-align: justify;
            }
            
            h1 { font-size: 22px; margin-top: 24px; margin-bottom: 12px; color: #000000; font-weight: 800; }
            h2 { font-size: 18px; margin-top: 18px; margin-bottom: 10px; color: #000000; font-weight: 700; }
            h3 { font-size: 16px; margin-top: 14px; margin-bottom: 8px; color: #000000; font-weight: 700; }
            p { margin-bottom: 14px; }
            ul, ol { padding-right: 24px; margin-bottom: 14px; }
            li { margin-bottom: 4px; }
            
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            
            blockquote {
              border-right: 3px solid #000000;
              padding-right: 14px;
              margin: 16px 0;
              color: #333333;
              font-style: italic;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 10px;
              color: #666666;
              border-top: 1px solid #000000;
              padding-top: 8px;
            }
          </style>
        </head>
        <body class="text-right">
          <div class="doc-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="logo">SARDA CMS</div>
              <div class="header-badge">${statusText}</div>
            </div>
            <h1 class="doc-title">${title || t('untitledStory', language)}</h1>
            <div class="metadata-grid">
              <div><strong>${t('folderLabel', language)}:</strong> ${folderName}</div>
              <div><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</div>
              <div><strong>${t('publishTimeLabel', language)}:</strong> ${publishTime || t('notSpecified', language)}</div>
            </div>
          </div>
          
          <div class="doc-content">
            ${contentHtml}
          </div>
          
          <div class="footer">
            ${t('exportedBySarda', language)} © ${new Date().getFullYear()}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 100);
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();
  };

  const handleExportWord = () => {
    if (!editor) return;
    const contentHtml = editor.getHTML();
    const folderName = folders.find(f => f.id === folderId)?.name || t('uncategorized', language);
    
    const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString(language === 'ar' ? 'ar' : 'en', {
      numberingSystem: 'latn',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : t('notSpecified', language);

    const statusText = status === 'published' ? t('published', language) : status === 'ready' ? t('readyToPublish', language) : t('draft', language);

    const header = "\x3Chtml xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' lang='ar' dir='rtl'><head><meta charset='utf-8'><title>" + (title || t('story', language)) + "</title></head><body style='font-family: Arial, sans-serif; text-align: right; direction: rtl; color: #000000;'>";
    const footer = "</body></html>";
    
    const content = `
      <div style="border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="font-size: 24px; color: #000000; margin: 0 0 10px 0;">${title || t('untitledStory', language)}</h1>
        <p style="color: #444444; font-size: 12px; margin: 0;">
          ${t('folderLabel', language)}: ${folderName} | 
          ${t('publishStatusLabel', language)}: ${statusText} | 
          ${t('publishDateLabel', language)}: ${formattedDate}
        </p>
      </div>
      <div style="font-size: 14px; line-height: 1.8; color: #111111;">
        ${contentHtml}
      </div>
    `;

    const sourceHTML = header + content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${title || t('story', language)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 relative">
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{t('unsavedChangesTitle', language)}</h3>
              <p className="text-sm text-neutral-600 mb-6">{t('unsavedChangesSub', language)}</p>
              
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm"
                >{t('saveChanges', language)}</button>
                <button
                  onClick={() => router.push(getDestination())}
                  className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >{t('discard', language)}</button>
                <button
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm border border-neutral-200"
                >{t('cancel', language)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Story Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-center space-y-4 border border-neutral-200">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-neutral-300 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">{t('moveToTrash', language)}</h3>
              <p className="text-xs text-neutral-600 mt-1">
                {language === 'ar' ? 'هل أنت متأكد من حذف هذه القصة ونقلها إلى سلة المهملات؟' : 'Are you sure you want to move this story to trash?'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleDeleteStoryConfirm}
                className="flex-1 bg-black hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                {language === 'ar' ? 'حذف القصة' : 'Delete Story'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-white hover:bg-neutral-100 text-neutral-800 py-2 rounded-none text-xs font-bold transition-all border border-neutral-300"
              >
                {t('cancel', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Sharp & Compact */}
      <header className="bg-white border-b border-neutral-300 px-3 md:px-4 py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <button onClick={handleBackClick} className="p-1.5 hover:bg-neutral-100 rounded-none border border-neutral-300 text-neutral-800 transition-colors shrink-0">
            <ArrowRight className="w-4 h-4" />
          </button>
          {!isNew && existingStory && (
            <button
              onClick={() => toggleFavorite(existingStory.id)}
              className={`p-1.5 rounded-none border transition-colors shrink-0 ${
                existingStory.isFavorite
                  ? 'bg-black text-white border-black'
                  : 'bg-neutral-50 text-neutral-400 hover:text-black hover:border-black border-neutral-300'
              }`}
              title={existingStory.isFavorite ? t('removeFromFavorites', language) : t('addToFavorites', language)}
            >
              <Star className={`w-4 h-4 ${existingStory.isFavorite ? 'fill-white text-white' : ''}`} />
            </button>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isReadOnly}
            placeholder={t('storyTitlePlaceholder', language)}
            className="text-sm md:text-base font-bold text-neutral-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-neutral-400 w-full disabled:opacity-70 font-serif"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-start xl:justify-end w-full xl:w-auto">
          {/* Status */}
          <div className={`flex items-center gap-1 bg-white border border-neutral-300 rounded-none px-2 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
            <span className="text-[10px] text-neutral-500 font-semibold whitespace-nowrap">{t('statusLabel', language)}:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StoryStatus)}
              disabled={isReadOnly}
              className="bg-transparent border-none text-xs font-bold text-neutral-900 focus:ring-0 cursor-pointer outline-none disabled:cursor-not-allowed"
            >
              <option value="draft">{t('draft', language)}</option>
              <option value="ready">{t('readyToPublish', language)}</option>
              <option value="published">{t('published', language)}</option>
            </select>
          </div>

          {/* Folder */}
          <div className={`flex items-center gap-1 bg-white border border-neutral-300 rounded-none px-2 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
            <span className="text-[10px] text-neutral-500 font-semibold whitespace-nowrap">{t('folderLabel', language)}:</span>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              disabled={isReadOnly}
              className="bg-transparent border-none text-xs font-bold text-neutral-900 focus:ring-0 cursor-pointer outline-none max-w-[110px] truncate disabled:cursor-not-allowed"
            >
              <option value="" disabled>{t('choosePlaceholder', language)}</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Target Date */}
          <div className={`flex items-center gap-1 bg-white border border-neutral-300 rounded-none px-2 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
            <span className="text-[10px] text-neutral-500 font-semibold whitespace-nowrap">{t('dateLabel', language)}:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={isReadOnly}
              className="bg-transparent border-none text-xs font-bold text-neutral-900 focus:ring-0 outline-none cursor-pointer p-0 w-[110px] disabled:cursor-not-allowed font-mono"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 mr-auto xl:mr-0">
            <button
              onClick={() => setIsReadOnly(!isReadOnly)}
              className={`border px-2 py-1 rounded-none font-medium flex items-center gap-1 transition-colors text-xs ${isReadOnly ? 'bg-black text-white border-black' : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'}`}
              title={isReadOnly ? t('exitReadOnlyMode', language) : t('readOnlyMode', language)}
            >
              {isReadOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`border px-2 py-1 rounded-none font-medium flex items-center gap-1 transition-colors text-xs ${isFocusMode ? 'bg-black text-white border-black' : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'}`}
              title={isFocusMode ? t('exitFocusMode', language) : t('focusMode', language)}
            >
              {isFocusMode ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleExportWord}
              className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-2 py-1 rounded-none font-medium flex items-center gap-1 transition-colors text-xs"
              title={t('downloadWord', language)}
            >
              <FileText className="w-3.5 h-3.5 text-neutral-800" />
              <span className="hidden sm:inline">Word</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-2 py-1 rounded-none font-medium flex items-center gap-1 transition-colors text-xs"
              title={t('downloadPdf', language)}
            >
              <FileDown className="w-3.5 h-3.5 text-neutral-800" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            {!isNew && existingStory && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-300 hover:border-black px-2 py-1 rounded-none font-medium flex items-center gap-1 transition-colors text-xs"
                title={language === 'ar' ? 'حذف القصة' : 'Delete Story'}
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-700" />
                <span className="hidden md:inline">{language === 'ar' ? 'حذف' : 'Delete'}</span>
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={handleSave}
                className="bg-black hover:bg-neutral-800 text-white px-3 py-1 rounded-none font-bold flex items-center gap-1 transition-colors text-xs border border-black"
              >
                <Save className="w-3.5 h-3.5" />{t('save', language)}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Compact Spacing & Sharp Edges */}
      <div className="flex-1 overflow-y-auto bg-neutral-100 transition-colors">
        <div className={`mx-auto p-2.5 md:p-4 transition-all duration-200 ${isFocusMode ? 'max-w-5xl' : 'max-w-4xl'}`}>
          <div className="rounded-none border border-neutral-400 bg-white shadow-sm">
            {!isReadOnly && <MenuBar editor={editor} />}
            <div className="text-neutral-900 bg-white min-h-[550px] p-3 md:p-6">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
