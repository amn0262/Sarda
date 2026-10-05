'use client';

import React, { useState } from 'react';
import { useStore, Story } from '@/lib/store';
import { t } from '@/lib/i18n';
import { 
  FileDown, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Sparkles, 
  BookOpen, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

interface ReaderPdfShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  currentPage: number;
  totalPages: number;
  currentPageContent: string;
  folderName?: string;
}

export default function ReaderPdfShareModal({
  isOpen,
  onClose,
  story,
  currentPage,
  totalPages,
  currentPageContent,
  folderName
}: ReaderPdfShareModalProps) {
  const { language } = useStore();

  // Export options state
  const [scope, setScope] = useState<'full' | 'current'>('full');
  const [paperTheme, setPaperTheme] = useState<'cream' | 'white' | 'formal'>('cream');
  const [pageSize, setPageSize] = useState<'a4' | 'a5'>('a4');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra'>('normal');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  // Feedback states
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !story) return null;

  const contentToExport = scope === 'current' ? currentPageContent : story.content;
  const wordCount = story.content ? story.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length : 0;
  const storyTitle = story.title || (language === 'ar' ? 'قصة بدون عنوان' : 'Untitled Story');

  // Generate styled HTML string for PDF printing/saving
  const generateDocumentHtml = () => {
    const isCream = paperTheme === 'cream';
    const isFormal = paperTheme === 'formal';

    const bgColor = isCream ? '#FBF0D9' : '#FFFFFF';
    const textColor = isCream ? '#2A2018' : isFormal ? '#0F172A' : '#111827';
    const borderColor = isCream ? '#E5D6B6' : isFormal ? '#0F172A' : '#E5E7EB';
    const fontPt = fontSize === 'normal' ? '13pt' : fontSize === 'large' ? '15pt' : '17pt';
    const lineHeight = fontSize === 'normal' ? '1.9' : '2.1';
    const pageDimensions = pageSize === 'a5' ? 'A5' : 'A4';

    const formattedDate = story.targetDate 
      ? new Date(story.targetDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : new Date(story.createdAt || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

    return `
      <!DOCTYPE html>
      <html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>${storyTitle} - سـردة PDF</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&family=Tajawal:wght@400;700&display=swap');

            @page {
              size: ${pageDimensions};
              margin: ${pageSize === 'a5' ? '15mm' : '20mm'};
              @bottom-right {
                content: ${includePageNumbers ? 'counter(page)' : '""'};
                font-family: 'IBM Plex Sans Arabic', sans-serif;
                font-size: 9pt;
                color: #888888;
              }
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'IBM Plex Sans Arabic', 'Tajawal', -apple-system, sans-serif;
              background-color: ${bgColor};
              color: ${textColor};
              font-size: ${fontPt};
              line-height: ${lineHeight};
              margin: 0;
              padding: ${pageSize === 'a5' ? '12px' : '24px'};
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .doc-container {
              max-width: 100%;
              margin: 0 auto;
            }

            ${includeHeader ? `
              .doc-header {
                border-bottom: 2px ${isFormal ? 'solid' : 'dashed'} ${borderColor};
                padding-bottom: 16px;
                margin-bottom: 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .platform-brand {
                font-weight: 800;
                font-size: 13pt;
                color: #2563EB;
                letter-spacing: -0.5px;
              }
              .meta-tags {
                font-size: 9.5pt;
                color: #6B7280;
                display: flex;
                gap: 8px;
                align-items: center;
              }
            ` : ''}

            .story-title {
              font-size: ${pageSize === 'a5' ? '18pt' : '22pt'};
              font-weight: 800;
              color: ${textColor};
              margin: 0 0 16px 0;
              line-height: 1.35;
              letter-spacing: -0.5px;
            }

            .story-body {
              color: ${textColor};
              text-align: justify;
              word-break: break-word;
            }

            .story-body p {
              margin: 0 0 1.25em 0;
              text-indent: 1.5em;
            }

            .story-body h1, .story-body h2, .story-body h3 {
              color: ${isFormal ? '#0F172A' : '#1E293B'};
              margin-top: 1.4em;
              margin-bottom: 0.6em;
              font-weight: 700;
            }

            .story-body blockquote {
              border-inline-start: 3px solid #2563EB;
              margin: 1.2em 0;
              padding-inline-start: 14px;
              font-style: italic;
              color: #4B5563;
            }

            ${includeSignature ? `
              .doc-footer {
                margin-top: 40px;
                padding-top: 14px;
                border-top: 1px solid ${borderColor};
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 8.5pt;
                color: #9CA3AF;
              }
            ` : ''}

            @media print {
              body {
                background-color: ${bgColor} !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="doc-container">
            ${includeHeader ? `
              <div class="doc-header">
                <div>
                  <div class="platform-brand">سـردة · Sarda</div>
                  <div class="meta-tags">
                    ${folderName ? `<span>${folderName}</span> <span>·</span>` : ''}
                    <span>${formattedDate}</span>
                    <span>·</span>
                    <span>${wordCount} ${t('wordsCount', language)}</span>
                    ${scope === 'current' ? `<span>·</span> <span>(صفحة ${currentPage} من ${totalPages})</span>` : ''}
                  </div>
                </div>
              </div>
            ` : ''}

            <h1 class="story-title">${storyTitle}</h1>

            <div class="story-body">
              ${contentToExport || '<p>لا يوجد محتوى للنص.</p>'}
            </div>

            ${includeSignature ? `
              <div class="doc-footer">
                <div>سـردة: أداة الحكواتي الرقمي لتدوين ونشر المحتوى القصصي</div>
                <div>${formattedDate}</div>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  };

  // 1. Action: Print / Save as PDF via Browser System Dialog
  const handlePrintPdf = () => {
    setIsGenerating(true);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc || !iframe.contentWindow) {
      setIsGenerating(false);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(generateDocumentHtml());
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print trigger failed', err);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsGenerating(false);
        }, 1000);
      }
    }, 400);
  };

  // 2. Action: Share via Web Share API
  const handleShareDevice = async () => {
    const textSnippet = story.content?.replace(/<[^>]*>/g, ' ').trim().slice(0, 300) || '';
    const shareData = {
      title: storyTitle,
      text: `${storyTitle}\n\n${textSnippet}...\n\n(تمت القراءة والمشاركة عبر سـردة CMS)`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback or user canceled
      }
    } else {
      // Fallback: copy clean text
      handleCopyText();
    }
  };

  // 3. Action: Download Standalone Printable Web Document (HTML with embedded styles)
  const handleDownloadDocument = () => {
    const htmlContent = generateDocumentHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = storyTitle.replace(/[\\/*?:"<>|]/g, '_').slice(0, 40);
    link.download = `${sanitizedTitle}_سردة.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. Action: Copy Clean Formatted Text
  const handleCopyText = () => {
    const textToCopy = `${storyTitle}\n\n` + (story.content?.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n\n') || '');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-neutral-900 dark:text-neutral-100"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                {t('sharePdfTitle', language)}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t('sharePdfSub', language)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body: Customization Options */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Option 1: Export Scope */}
          <div>
            <label className="font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              {t('exportScope', language)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('full')}
                className={clsx(
                  'p-2.5 rounded-xl border font-semibold flex items-center justify-between transition-colors cursor-pointer',
                  scope === 'full'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                    : 'bg-neutral-50 dark:bg-[#252528] border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/20'
                )}
              >
                <span>{t('scopeFullStory', language)}</span>
                {scope === 'full' && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setScope('current')}
                className={clsx(
                  'p-2.5 rounded-xl border font-semibold flex items-center justify-between transition-colors cursor-pointer',
                  scope === 'current'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                    : 'bg-neutral-50 dark:bg-[#252528] border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-black/20'
                )}
              >
                <span>{t('scopeCurrentPage', language)} ({currentPage})</span>
                {scope === 'current' && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Option 2: Paper Theme */}
          <div>
            <label className="font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 block">
              {t('pdfPaperTheme', language)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cream', label: t('pdfThemeCream', language), style: 'bg-[#FBF0D9] text-[#2C241E] border-[#E0D2B4]' },
                { id: 'white', label: t('pdfThemeWhite', language), style: 'bg-white text-neutral-900 border-neutral-300' },
                { id: 'formal', label: t('pdfThemeFormal', language), style: 'bg-slate-50 text-slate-900 border-slate-300' }
              ].map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setPaperTheme(theme.id as any)}
                  className={clsx(
                    'p-2.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center',
                    theme.style,
                    paperTheme === theme.id ? 'ring-2 ring-blue-500 font-bold shadow-xs' : 'opacity-80 hover:opacity-100'
                  )}
                >
                  <span className="truncate w-full">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Option 3: Page Size & Font Size */}
          <div className="grid grid-cols-2 gap-3">
            {/* Page Size */}
            <div>
              <label className="font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                {t('pdfPageSize', language)}
              </label>
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#252528] p-1 rounded-xl">
                {[
                  { id: 'a4', label: t('pdfSizeA4', language) },
                  { id: 'a5', label: t('pdfSizeA5', language) }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPageSize(s.id as any)}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-center font-semibold cursor-pointer transition-colors text-[11px]',
                      pageSize === s.id
                        ? 'bg-white dark:bg-[#3A3A3C] shadow-2xs font-bold text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                {t('pdfFontSize', language)}
              </label>
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#252528] p-1 rounded-xl">
                {[
                  { id: 'normal', label: t('pdfFontNormal', language) },
                  { id: 'large', label: t('pdfFontLarge', language) },
                  { id: 'extra', label: t('pdfFontExtra', language) }
                ].map(fs => (
                  <button
                    key={fs.id}
                    type="button"
                    onClick={() => setFontSize(fs.id as any)}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-center font-semibold cursor-pointer transition-colors text-[11px]',
                      fontSize === fs.id
                        ? 'bg-white dark:bg-[#3A3A3C] shadow-2xs font-bold text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    )}
                  >
                    {fs.id === 'normal' ? '13pt' : fs.id === 'large' ? '15pt' : '17pt'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Option 4: Document Metadata Toggles */}
          <div className="p-3 bg-neutral-50 dark:bg-[#252528] rounded-2xl border border-black/5 dark:border-white/10 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                {t('includeMetaHeader', language)}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => setIncludePageNumbers(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                {t('includePageNumbers', language)}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                {t('includePlatformBranding', language)}
              </span>
            </label>
          </div>
        </div>

        {/* Modal Actions Footer: Primary Print/Save PDF, Share, and Document download */}
        <div className="p-4 sm:p-5 border-t border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-[#18181A]/50 space-y-2.5 shrink-0">
          {/* Main Primary Button: Save or Print as PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isGenerating ? (language === 'ar' ? 'جاري تجهيز المستند...' : 'Preparing Document...') : t('actionPrintPdf', language)}</span>
          </button>

          {/* Secondary Action Row: Share, Download HTML Doc, Copy */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleShareDevice}
              className="py-2 px-2.5 bg-white dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-black/8 dark:border-white/10 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-neutral-800 dark:text-neutral-200"
              title={t('actionShareDevice', language)}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate">{language === 'ar' ? 'مشاركة' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocument}
              className="py-2 px-2.5 bg-white dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-black/8 dark:border-white/10 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-neutral-800 dark:text-neutral-200"
              title={t('actionDownloadHtml', language)}
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-500" />
              <span className="truncate">{language === 'ar' ? 'تنزيل ملف' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="py-2 px-2.5 bg-white dark:bg-[#252528] hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] border border-black/8 dark:border-white/10 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-neutral-800 dark:text-neutral-200"
              title={t('actionCopyText', language)}
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-purple-500" />}
              <span className="truncate">{isCopied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ النص' : 'Copy')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
