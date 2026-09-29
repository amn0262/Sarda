'use client';

import { useState, useEffect, useRef } from 'react';
import { t } from "@/lib/i18n";
import { useStore, StoryStatus, Story } from '@/lib/store';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import {
  Save, ArrowRight, Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, FileDown, FileText, Star, Eye, EyeOff, Maximize, Minimize,
  Trash2, Columns2, ExternalLink, Copy, Check, ArrowLeftRight, X, Search, Plus, BookOpen, Layers
} from 'lucide-react';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Link from 'next/link';

const MenuBar = ({ editor }: { editor: any }) => {
  const { language } = useStore();
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-100/80 backdrop-blur-md rounded-2xl border border-black/5 m-3 shadow-2xs">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('bold')
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('boldText', language)}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('italic')
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('italicText', language)}
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-neutral-300/80 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('heading1', language)}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('heading2', language)}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('heading3', language)}
      >
        <Heading3 className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-neutral-300/80 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('bulletList')
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('bulletList', language)}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
          editor.isActive('orderedList')
            ? 'bg-black text-white border-black font-bold shadow-xs scale-105'
            : 'hover:bg-white text-neutral-800 border-transparent hover:shadow-2xs active:scale-95'
        }`}
        title={t('numberedList', language)}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-neutral-300/80 mx-1" />
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
        className="p-1.5 rounded-xl hover:bg-white text-neutral-800 bg-neutral-200/60 border border-black/5 transition-all flex items-center gap-1 cursor-pointer hover:shadow-2xs active:scale-95"
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
  const {
    stories,
    addStory,
    updateStory,
    toggleFavorite,
    moveToTrash,
    folders,
    language,
    isFocusMode,
    setIsFocusMode,
    floatingStory,
    setFloatingStory
  } = useStore();
  
  const id = params.id as string;
  const isNew = id === 'new';
  const folderIdParam = searchParams.get('folderId');

  const existingStory = !isNew ? stories.find(s => s.id === id) : null;

  // Helper for current date formatted as YYYY-MM-DD
  const getTodayFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayFormattedDate();
  const [title, setTitle] = useState(existingStory?.title || '');
  const [status, setStatus] = useState<StoryStatus>(existingStory?.status || 'draft');
  const [targetDate, setTargetDate] = useState(existingStory?.targetDate || todayStr);
  const [publishTime, setPublishTime] = useState(
    existingStory?.publishTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [isCustomDateSet, setIsCustomDateSet] = useState(false);
  const [folderId, setFolderId] = useState(existingStory?.folderId || folderIdParam || '');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Scroll and workspace refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sideScrollRef = useRef<HTMLDivElement>(null);

  // Side-by-side reference workspace state
  const [isSideBySideOpen, setIsSideBySideOpen] = useState(false);
  const [sideStoryId, setSideStoryId] = useState<string>('');
  const [sideCustomNotes, setSideCustomNotes] = useState<string>('');
  const [sideTab, setSideTab] = useState<'story' | 'notes'>('story');
  const [sideSearch, setSideSearch] = useState<string>('');
  const [sideFontSize, setSideFontSize] = useState<number>(15);
  const [sideCopied, setSideCopied] = useState<boolean>(false);
  const [isSideSwapped, setIsSideSwapped] = useState<boolean>(false);
  const [sideWidth, setSideWidth] = useState<'equal' | 'compact'>('equal');

  // Floating story action modal state
  const [showFloatModal, setShowFloatModal] = useState<boolean>(false);

  // Compute active reference story directly without side-effects
  const defaultCandidate = stories.find(s => !s.isDeleted && s.id !== id) || stories.find(s => !s.isDeleted);
  const activeSideStoryId = sideStoryId || defaultCandidate?.id || '';

  // Initial states for dirty check
  const [initialState, setInitialState] = useState({
    title: existingStory?.title || '',
    status: existingStory?.status || 'draft',
    targetDate: existingStory?.targetDate || todayStr,
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
    const now = new Date();
    const currentMomentDate = getTodayFormattedDate();
    const currentMomentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Ensure default story date is the current date and time at the exact moment of writing and saving
    const saveTargetDate = isCustomDateSet ? (targetDate || currentMomentDate) : currentMomentDate;
    const savePublishTime = isCustomDateSet ? (publishTime || currentMomentTime) : currentMomentTime;

    const storyData = {
      title,
      content: currentContent,
      status,
      targetDate: saveTargetDate,
      publishTime: savePublishTime,
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
      targetDate: saveTargetDate,
      publishTime: savePublishTime,
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

  const selectedSideStory = stories.find(s => s.id === activeSideStoryId);

  const handleFloatCurrentStory = () => {
    const currentContent = editor?.getHTML() || '';
    const currentTargetDate = targetDate || getTodayFormattedDate();
    const currentPublishTime = publishTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let currentStoryObj: Story;

    if (!isNew && existingStory) {
      const updatedStory: Story = {
        ...existingStory,
        title: title || existingStory.title || t('untitledStory', language),
        content: currentContent,
        status,
        targetDate: currentTargetDate,
        publishTime: currentPublishTime,
        folderId: folderId || existingStory.folderId,
        updatedAt: Date.now(),
      };
      updateStory(existingStory.id, updatedStory);
      currentStoryObj = updatedStory;
    } else {
      const targetFolderId = folderId || (folders[0]?.id || '');
      const newStoryId = addStory({
        title: title || t('untitledStory', language),
        content: currentContent,
        status,
        targetDate: currentTargetDate,
        publishTime: currentPublishTime,
        folderId: targetFolderId,
        style: 'classic',
      });
      currentStoryObj = {
        id: newStoryId,
        title: title || t('untitledStory', language),
        content: currentContent,
        status,
        targetDate: currentTargetDate,
        publishTime: currentPublishTime,
        folderId: targetFolderId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        style: 'classic',
      };
    }

    setFloatingStory(currentStoryObj);
    setShowFloatModal(true);
  };

  const handleInsertSideContent = () => {
    if (!editor) return;
    const contentToInsert = sideTab === 'story'
      ? selectedSideStory?.content || ''
      : sideCustomNotes.trim()
      ? `<p dir="rtl">${sideCustomNotes.replace(/\n/g, '</p><p dir="rtl">')}</p>`
      : '';

    if (contentToInsert) {
      editor.commands.focus();
      editor.commands.insertContent(contentToInsert);
      setSideCopied(true);
      setTimeout(() => setSideCopied(false), 2000);
    }
  };

  const handleCopySideText = () => {
    const raw = sideTab === 'story'
      ? (selectedSideStory?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      : sideCustomNotes;
    if (raw) {
      navigator.clipboard.writeText(raw);
      setSideCopied(true);
      setTimeout(() => setSideCopied(false), 2000);
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
    <div className="flex flex-col h-full bg-[#F5F5F7] relative">
      {/* Unsaved Changes Modal - Apple Sheet Style */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-black/8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{t('unsavedChangesTitle', language)}</h3>
              <p className="text-xs text-neutral-600 mb-6 leading-relaxed">{t('unsavedChangesSub', language)}</p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl font-bold transition-all text-xs shadow-xs active:scale-95 cursor-pointer"
                >{t('saveChanges', language)}</button>
                <button
                  onClick={() => router.push(getDestination())}
                  className="flex-1 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-900 px-4 py-2.5 rounded-xl font-medium transition-all text-xs active:scale-95 cursor-pointer"
                >{t('discard', language)}</button>
                <button
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl font-medium transition-all text-xs border border-black/5 active:scale-95 cursor-pointer"
                >{t('cancel', language)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Story Confirmation Modal - Apple Sheet Style */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center space-y-4 border border-black/8 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-black/5 mx-auto flex items-center justify-center shadow-2xs">
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
                className="flex-1 bg-black hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                {language === 'ar' ? 'حذف القصة' : 'Delete Story'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 rounded-xl text-xs font-semibold transition-all border border-black/5 active:scale-95 cursor-pointer"
              >
                {t('cancel', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Story Multitasking Modal */}
      {showFloatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-black/8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-neutral-900">
                      {t('floatStoryWindow', language)}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {t('floatingStoryActive', language)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFloatModal(false)}
                  className="p-1 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                {t('openAnotherStoryDesc', language)}
              </p>

              {/* Action: Create a brand new story */}
              <button
                type="button"
                onClick={() => {
                  setShowFloatModal(false);
                  router.push('/editor/new');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors mb-3 shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('createNewStoryInEditor', language)}
                </span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>

              {/* Action: Open another existing story from library */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-neutral-600 block mb-2">
                  {t('chooseStoryToOpen', language)}:
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-neutral-200 rounded-xl p-2 bg-neutral-50">
                  {stories.filter(s => !s.isDeleted && s.id !== (existingStory?.id || floatingStory?.id)).length > 0 ? (
                    stories
                      .filter(s => !s.isDeleted && s.id !== (existingStory?.id || floatingStory?.id))
                      .map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setShowFloatModal(false);
                            router.push(`/editor/${st.id}`);
                          }}
                          className="w-full text-start p-2.5 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-neutral-900 block truncate">
                              {st.title || t('untitledStory', language)}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {folders.find(f => f.id === st.folderId)?.name || t('uncategorized', language)}
                            </span>
                          </div>
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full shrink-0 font-medium">
                            {st.status === 'published' ? t('published', language) : st.status === 'ready' ? t('readyToPublish', language) : t('draft', language)}
                          </span>
                        </button>
                      ))
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-4">
                      {t('sideBySideNoStories', language)}
                    </p>
                  )}
                </div>
              </div>

              {/* Secondary buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowFloatModal(false);
                    router.push('/content');
                  }}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('contentManager', language)}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFloatModal(false)}
                  className="flex-1 bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('stayHere', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Apple macOS Titlebar Style */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/8 px-4 py-2.5 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 w-full xl:w-auto">
          {/* macOS Traffic Lights decoration */}
          <div className="hidden sm:flex items-center gap-1.5 me-1">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block shadow-2xs"></span>
          </div>

          <button
            onClick={handleBackClick}
            className="p-1.5 hover:bg-neutral-200/70 rounded-xl border border-black/5 text-neutral-800 transition-all active:scale-95 shrink-0 cursor-pointer shadow-2xs"
            title="رجوع"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          {!isNew && existingStory && (
            <button
              onClick={() => toggleFavorite(existingStory.id)}
              className={`p-1.5 rounded-xl border transition-all active:scale-95 shrink-0 cursor-pointer shadow-2xs ${
                existingStory.isFavorite
                  ? 'bg-black text-white border-black'
                  : 'bg-neutral-100 text-neutral-400 hover:text-black hover:border-black/20 border-black/5'
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
            className="text-sm md:text-base font-bold text-neutral-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-neutral-400 w-full disabled:opacity-70 font-sans tracking-tight"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-start xl:justify-end w-full xl:w-auto">
          {/* Status */}
          <div className={`flex items-center gap-1.5 bg-neutral-100/90 border border-black/5 rounded-xl px-2.5 py-1 shadow-2xs ${isReadOnly ? 'opacity-70' : ''}`}>
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
          <div className={`flex items-center gap-1.5 bg-neutral-100/90 border border-black/5 rounded-xl px-2.5 py-1 shadow-2xs ${isReadOnly ? 'opacity-70' : ''}`}>
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

          {/* Target Date & Auto-date indicator */}
          <div className={`flex items-center gap-1.5 bg-neutral-100/90 border border-black/5 rounded-xl px-2.5 py-1 shadow-2xs ${isReadOnly ? 'opacity-70' : ''}`}>
            <span className="text-[10px] text-neutral-500 font-semibold whitespace-nowrap">{t('dateLabel', language)}:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                setIsCustomDateSet(true);
              }}
              disabled={isReadOnly}
              className="bg-transparent border-none text-xs font-bold text-neutral-900 focus:ring-0 outline-none cursor-pointer p-0 w-[110px] disabled:cursor-not-allowed font-sans"
            />
            {/* Quick Set to Now / Current Moment button */}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setTargetDate(getTodayFormattedDate());
                setPublishTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                setIsCustomDateSet(false);
              }}
              title={t('setNowDate', language)}
              className={`text-[10px] px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                !isCustomDateSet
                  ? 'bg-blue-500 text-white font-bold shadow-2xs'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-black/5'
              }`}
            >
              <span>{t('setNowDate', language)}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mr-auto xl:mr-0">
            {/* Side-by-side workspace toggle */}
            <button
              type="button"
              onClick={() => setIsSideBySideOpen(!isSideBySideOpen)}
              className={`border px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer active:scale-95 shadow-2xs ${
                isSideBySideOpen
                  ? 'bg-black text-white border-black shadow-xs font-bold'
                  : 'bg-white hover:bg-neutral-100 text-neutral-800 border-black/5'
              }`}
              title={t('sideBySideWorkspace', language)}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('sideBySideWorkspace', language)}</span>
            </button>

            {/* Float Story Window button */}
            <button
              type="button"
              onClick={handleFloatCurrentStory}
              className={`border px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer active:scale-95 shadow-2xs ${
                floatingStory?.id === id
                  ? 'bg-neutral-900 text-white border-black font-bold'
                  : 'bg-white hover:bg-neutral-100 text-neutral-800 border-black/5'
              }`}
              title={t('floatStoryTooltip', language)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('floatStoryWindow', language)}</span>
            </button>

            <button
              onClick={() => setIsReadOnly(!isReadOnly)}
              className={`border px-2 py-1 rounded-xl font-medium flex items-center gap-1 transition-all text-xs active:scale-95 shadow-2xs cursor-pointer ${
                isReadOnly ? 'bg-black text-white border-black' : 'bg-white text-neutral-800 border-black/5 hover:bg-neutral-100'
              }`}
              title={isReadOnly ? t('exitReadOnlyMode', language) : t('readOnlyMode', language)}
            >
              {isReadOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`border px-2 py-1 rounded-xl font-medium flex items-center gap-1 transition-all text-xs active:scale-95 shadow-2xs cursor-pointer ${
                isFocusMode ? 'bg-black text-white border-black' : 'bg-white text-neutral-800 border-black/5 hover:bg-neutral-100'
              }`}
              title={isFocusMode ? t('exitFocusMode', language) : t('focusMode', language)}
            >
              {isFocusMode ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleExportWord}
              className="bg-white hover:bg-neutral-100 text-neutral-800 border border-black/5 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs active:scale-95 shadow-2xs cursor-pointer"
              title={t('downloadWord', language)}
            >
              <FileText className="w-3.5 h-3.5 text-neutral-800" />
              <span className="hidden sm:inline">Word</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-white hover:bg-neutral-100 text-neutral-800 border border-black/5 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-all text-xs active:scale-95 shadow-2xs cursor-pointer"
              title={t('downloadPdf', language)}
            >
              <FileDown className="w-3.5 h-3.5 text-neutral-800" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            {!isNew && existingStory && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="bg-white hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-black/5 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 transition-all text-xs active:scale-95 shadow-2xs cursor-pointer"
                title={language === 'ar' ? 'حذف القصة' : 'Delete Story'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{language === 'ar' ? 'حذف' : 'Delete'}</span>
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={handleSave}
                className="bg-black hover:bg-neutral-800 text-white px-3.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />{t('save', language)}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Apple Document Canvas with Side-by-side Support */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-[#F5F5F7] transition-colors relative"
      >
        <div
          className={`mx-auto p-3 md:p-6 transition-all duration-200 ${
            isSideBySideOpen ? 'max-w-[1600px]' : isFocusMode ? 'max-w-5xl' : 'max-w-4xl'
          }`}
        >
          {isSideBySideOpen ? (
            /* DUAL PANE WORKSPACE */
            <div
              className={`flex flex-col lg:flex-row gap-4 items-stretch ${
                isSideSwapped ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* PRIMARY ACTIVE EDITOR PANE */}
              <div
                className={`flex-1 transition-all rounded-3xl border border-black/8 bg-white shadow-sm overflow-hidden flex flex-col ${
                  sideWidth === 'compact' ? 'lg:flex-[3]' : 'lg:flex-1'
                }`}
              >
                <div className="bg-neutral-100/60 border-b border-black/5 px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <span className="truncate">{title || t('untitledStory', language)}</span>
                    <span className="text-[10px] text-neutral-400">({t('writtenStories', language)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsSideSwapped(!isSideSwapped)}
                      className="p-1 hover:bg-neutral-200/60 text-neutral-600 rounded-lg transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
                      title={t('sideBySideSwap', language)}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{t('sideBySideSwap', language)}</span>
                    </button>
                  </div>
                </div>

                {!isReadOnly && <MenuBar editor={editor} />}
                <div className="text-neutral-900 bg-white min-h-[550px] p-4 md:p-8 flex-1">
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* SECONDARY SIDE REFERENCE PANE */}
              <div
                className={`transition-all rounded-3xl border border-black/8 bg-white shadow-sm overflow-hidden flex flex-col ${
                  sideWidth === 'compact' ? 'lg:flex-[2]' : 'lg:flex-1'
                }`}
              >
                {/* Side Header Bar */}
                <div className="bg-neutral-100/60 border-b border-black/5 px-3.5 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-neutral-200/60 p-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSideTab('story')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        sideTab === 'story' ? 'bg-white text-black shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {t('sideBySideSelectStory', language)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSideTab('notes')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        sideTab === 'notes' ? 'bg-white text-black shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {t('sideBySideCustomNotes', language)}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Font size adjustments */}
                    <button
                      type="button"
                      onClick={() => setSideFontSize(Math.max(12, sideFontSize - 1))}
                      className="px-2 py-0.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-200/80 border border-black/5 rounded-lg cursor-pointer"
                      title="تصغير الخط"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setSideFontSize(Math.min(22, sideFontSize + 1))}
                      className="px-2 py-0.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-200/80 border border-black/5 rounded-lg cursor-pointer"
                      title="تكبير الخط"
                    >
                      A+
                    </button>

                    {/* Width toggle */}
                    <button
                      type="button"
                      onClick={() => setSideWidth(sideWidth === 'equal' ? 'compact' : 'equal')}
                      className="p-1.5 text-neutral-600 hover:bg-neutral-200/80 rounded-lg cursor-pointer"
                      title={t('sideBySideWidthToggle', language)}
                    >
                      <Columns2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Close side-by-side */}
                    <button
                      type="button"
                      onClick={() => setIsSideBySideOpen(false)}
                      className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/80 rounded-lg cursor-pointer"
                      title={t('sideBySideClose', language)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-bar with Story Selector & Insert Actions */}
                {sideTab === 'story' ? (
                  <div className="p-2.5 border-b border-black/5 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex-1 min-w-[180px]">
                      <select
                        value={activeSideStoryId}
                        onChange={(e) => setSideStoryId(e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-neutral-200 px-3 py-1.5 text-neutral-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer shadow-2xs"
                      >
                        <option value="" disabled>{t('choosePlaceholder', language)}</option>
                        {stories
                          .filter(s => !s.isDeleted && s.id !== id)
                          .map(s => (
                            <option key={s.id} value={s.id}>
                              {s.title || t('untitledStory', language)} ({folders.find(f => f.id === s.folderId)?.name || t('uncategorized', language)})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleInsertSideContent}
                        className="bg-black hover:bg-neutral-800 text-white px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
                        title={t('sideBySideCopyContent', language)}
                      >
                        {sideCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{t('sideBySideCopyContent', language)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySideText}
                        className="bg-white hover:bg-neutral-100 text-neutral-800 border border-black/5 px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                        title={t('sideBySideCopied', language)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 border-b border-black/5 bg-neutral-50/70 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {t('sideBySideSubtitle', language)}
                    </span>
                    <button
                      type="button"
                      onClick={handleInsertSideContent}
                      className="bg-black hover:bg-neutral-800 text-white px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      {sideCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{t('sideBySideCopyContent', language)}</span>
                    </button>
                  </div>
                )}

                {/* Side Pane Content Body */}
                <div
                  ref={sideScrollRef}
                  className="p-5 overflow-y-auto flex-1 max-h-[700px] min-h-[450px] bg-white"
                  style={{ fontSize: `${sideFontSize}px` }}
                >
                  {sideTab === 'story' ? (
                    selectedSideStory ? (
                      <div>
                        <div className="border-b border-neutral-100 pb-3 mb-4">
                          <h3 className="font-bold text-neutral-900 text-base">
                            {selectedSideStory.title || t('untitledStory', language)}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                            <span>
                              {folders.find(f => f.id === selectedSideStory.folderId)?.name || t('uncategorized', language)}
                            </span>
                            <span>•</span>
                            <span>
                              {selectedSideStory.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length} {t('words', language)}
                            </span>
                          </div>
                        </div>
                        <div
                          className="prose prose-neutral max-w-none text-right font-sans leading-relaxed text-neutral-800"
                          dir="rtl"
                          dangerouslySetInnerHTML={{
                            __html: selectedSideStory.content || `<p class="text-neutral-400">${t('noContentYet', language)}</p>`
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-16 text-neutral-400">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">{t('sideBySideNoStories', language)}</p>
                      </div>
                    )
                  ) : (
                    <textarea
                      value={sideCustomNotes}
                      onChange={(e) => setSideCustomNotes(e.target.value)}
                      placeholder={t('sideBySideNotesPlaceholder', language)}
                      className="w-full h-full min-h-[450px] border-none focus:outline-none resize-none font-sans text-right leading-relaxed text-neutral-800"
                      dir="rtl"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD SINGLE WORKSPACE */
            <div className="rounded-3xl border border-black/8 bg-white shadow-sm overflow-hidden">
              {!isReadOnly && <MenuBar editor={editor} />}
              <div className="text-neutral-900 bg-white min-h-[550px] p-4 md:p-8">
                <EditorContent editor={editor} />
              </div>
            </div>
          )}
        </div>

        {/* Floating Scroll To Top Button */}
        <ScrollToTopButton containerRef={scrollContainerRef} />
      </div>
    </div>
  );
}
