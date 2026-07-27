'use client';

import { useState, useEffect } from 'react';
import { t } from "@/lib/i18n";
import { useStore, StoryStatus } from '@/lib/store';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Save, ArrowRight, Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, FileDown, FileText } from 'lucide-react';
import Link from 'next/link';

const MenuBar = ({ editor }: { editor: any }) => {
  const { language } = useStore();
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('boldText', language)}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('italicText', language)}
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-slate-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('heading1', language)}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('heading2', language)}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('heading3', language)}
      >
        <Heading3 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-slate-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('bulletList', language)}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={t('numberedList', language)}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-slate-300 mx-1" />
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
        className="p-2 rounded hover:bg-slate-200 text-indigo-600 bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
        title={t('alignment', language)}
      >
        {editor.isActive({ textAlign: 'left' }) ? (
          <AlignLeft className="w-4 h-4 text-slate-700" />
        ) : editor.isActive({ textAlign: 'center' }) ? (
          <AlignCenter className="w-4 h-4 text-slate-700" />
        ) : (
          <AlignRight className="w-4 h-4 text-slate-700" />
        )}
      </button>
    </div>
  );
};

export default function EditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { stories, addStory, updateStory, folders, language } = useStore();
  
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
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] p-6 text-right',
        dir: 'rtl',
      },
    },
    immediatelyRender: false,
  });

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

  const handleBackClick = () => {
    if (checkIsDirty()) {
      setShowUnsavedModal(true);
    } else {
      router.push('/content');
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
    };

    if (isNew) {
      addStory(storyData);
    } else {
      updateStory(id, storyData);
    }
    
    // Update initial state so it is no longer dirty if user stays
    setInitialState({
      title,
      status,
      targetDate,
      publishTime,
      folderId,
      content: currentContent
    });

    router.push('/content');
  };

  const handleExportPDF = () => {
    if (!editor) return;

    const contentHtml = editor.getHTML();
    const folderName = folders.find(f => f.id === folderId)?.name || t('uncategorized', language);
    
    // Create an iframe to print the content
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
    
    const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString('ar', {
      numberingSystem: 'latn',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : t('notSpecified', language);

    const statusText = status === 'published' ? t('published', language) : status === 'ready' ? t('readyToPublish', language) : t('draft', language);
    
    iframeDoc.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>${title || t('untitledStory', language)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
            
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Tajawal', sans-serif;
              color: #1e293b;
              line-height: 1.8;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-badge {
              display: inline-block;
              padding: 4px 12px;
              font-size: 12px;
              font-weight: bold;
              border-radius: 9999px;
              margin-bottom: 20px;
              background-color: #f1f5f9;
              color: #475569;
              border: 1px solid #e2e8f0;
            }
            
            .status-published { background-color: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
            .status-ready { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
            .status-draft { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
            
            .doc-header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              font-size: 14px;
              font-weight: bold;
              color: #4f46e5;
              margin-bottom: 10px;
            }
            
            .doc-title {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              margin: 10px 0;
              line-height: 1.3;
            }
            
            .metadata-grid {
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 15px;
              margin-top: 15px;
              font-size: 13px;
              color: #64748b;
              background-color: #f8fafc;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid #f1f5f9;
            }
            
            .metadata-item strong {
              color: #334155;
            }
            
            .doc-content {
              font-size: 16px;
              color: #334155;
              text-align: justify;
            }
            
            /* TipTap Prosemirror alignment and typography styles for Arabic */
            h1 { font-size: 24px; margin-top: 25px; margin-bottom: 15px; color: #0f172a; font-weight: 700; }
            h2 { font-size: 20px; margin-top: 20px; margin-bottom: 12px; color: #1e293b; font-weight: 700; }
            h3 { font-size: 18px; margin-top: 15px; margin-bottom: 10px; color: #334155; font-weight: 700; }
            p { margin-bottom: 15px; }
            ul, ol { padding-right: 25px; margin-bottom: 15px; }
            li { margin-bottom: 5px; }
            
            /* Alignment classes */
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            
            blockquote {
              border-right: 4px solid #e2e8f0;
              padding-right: 15px;
              margin: 15px 0;
              color: #64748b;
              font-style: italic;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 10px;
            }
          </style>
        </head>
        <body class="text-right">
          <div class="doc-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="logo">Sarda CMS</div>
              <div class="header-badge status-${status}">${statusText}</div>
            </div>
            <h1 class="doc-title">${title || t('untitledStory', language)}</h1>
            <div class="metadata-grid">
              <div class="metadata-item"><strong>${t('folderLabel', language)}:</strong> ${folderName}</div>
              <div class="metadata-item"><strong>${t('publishDateLabel', language)}:</strong> ${formattedDate}</div>
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
    
    const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString('ar', {
      numberingSystem: 'latn',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : t('notSpecified', language);

    const statusText = status === 'published' ? t('published', language) : status === 'ready' ? t('readyToPublish', language) : t('draft', language);

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' lang='ar' dir='rtl'><head><meta charset='utf-8'><title>" + (title || t('story', language)) + "</title></head><body style='font-family: Arial, sans-serif; text-align: right; direction: rtl;'>";
    const footer = "</body></html>";
    
    const content = `
      <div style="border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="font-size: 24px; color: #333;">${title || t('untitledStory', language)}</h1>
        <p style="color: #666; font-size: 12px;">${t('folderLabel', language)}: ${folderName} | ${t('publishStatusLabel', language)}: ${statusText} | ${t('publishDateLabel', language)}: ${formattedDate}</p>
      </div>
      <div>
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
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('unsavedChangesTitle', language)}</h3>
              <p className="text-sm text-slate-500 mb-6">{t('unsavedChangesSub', language)}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >{t('saveChanges', language)}</button>
                <button
                  onClick={() => router.push('/content')}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >{t('discard', language)}</button>
                <button
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >{t('cancel', language)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 w-full xl:w-auto">
          <button onClick={handleBackClick} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors shrink-0">
            <ArrowRight className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="{t('storyTitlePlaceholder', language)}"
            className="text-base md:text-xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-start xl:justify-end w-full xl:w-auto">
          {/* Status (نوع المستند) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-[10px] text-slate-400 px-1 font-semibold whitespace-nowrap">{t('statusLabel', language)}:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StoryStatus)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="draft">{t('draft', language)}</option>
              <option value="ready">{t('readyToPublish', language)}</option>
              <option value="published">{t('published', language)}</option>
            </select>
          </div>

          {/* Folder (المجلد) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-[10px] text-slate-400 px-1 font-semibold whitespace-nowrap">{t('folderLabel', language)}:</span>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none max-w-[100px] truncate"
            >
              <option value="" disabled>{t('choosePlaceholder', language)}</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Target Date (تاريخ النشر) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-[10px] text-slate-400 px-1 font-semibold whitespace-nowrap">{t('dateLabel', language)}:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 outline-none cursor-pointer p-0 w-[110px]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 mr-auto xl:mr-0">
            <button
              onClick={handleExportWord}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-sm text-xs"
              title={t('downloadWord', language)}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Word</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-sm text-xs"
              title={t('downloadPdf', language)}
            >
              <FileDown className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-sm text-xs"
            >
              <Save className="w-4 h-4" />{t('save', language)}</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Editor Area */}
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
