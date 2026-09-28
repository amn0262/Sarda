export type StoryStyleId = 
  | 'classic'
  | 'andalusian'
  | 'midnight'
  | 'emerald'
  | 'vintage'
  | 'sunset'
  | 'royal'
  | 'minimal';

export interface StoryStyle {
  id: StoryStyleId;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  ornament: string;
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardBadgeBg: string;
  cardBadgeText: string;
  cardAccentBg: string;
  // Editor aesthetics
  editorCanvasBg: string;
  editorPaperBg: string;
  editorBorder: string;
  editorTextColor: string;
  editorHeadingColor: string;
  editorMutedColor: string;
  // Reader view aesthetics
  readerOverlayBg: string;
  readerContainerBg: string;
  readerBorder: string;
  readerTextColor: string;
  readerHeadingColor: string;
  readerOrnamentColor: string;
  readerQuoteBorder: string;
  // PDF / Word Export
  exportPrimaryColor: string;
  exportBgColor: string;
}

// Single classic black & white specification applied everywhere
const CLASSIC_BLACK_WHITE_STYLE: StoryStyle = {
  id: 'classic',
  nameAr: 'كلاسيكي بالأبيض والأسود',
  nameEn: 'Classic Black & White',
  taglineAr: 'تصميم كلاسيكي نقي وعريق يركز على الكلمة وقوة السرد',
  taglineEn: 'Pure timeless monochrome design focused entirely on the written word',
  ornament: '✦',
  primaryColor: '#000000',
  secondaryColor: '#f5f5f5',
  gradient: 'from-neutral-900 to-black',
  cardBorder: 'border-neutral-200',
  cardHoverBorder: 'hover:border-black',
  cardBadgeBg: 'bg-neutral-100 border-neutral-300 text-neutral-900',
  cardBadgeText: 'text-neutral-900',
  cardAccentBg: 'bg-neutral-50',
  editorCanvasBg: 'bg-neutral-100',
  editorPaperBg: 'bg-white border-neutral-300 shadow-sm text-neutral-900',
  editorBorder: 'border-neutral-300',
  editorTextColor: 'text-neutral-900',
  editorHeadingColor: 'text-black',
  editorMutedColor: 'text-neutral-500',
  readerOverlayBg: 'bg-black/60',
  readerContainerBg: 'bg-white border-neutral-200 text-neutral-900',
  readerBorder: 'border-neutral-300',
  readerTextColor: 'text-neutral-900',
  readerHeadingColor: 'text-black',
  readerOrnamentColor: 'text-black',
  readerQuoteBorder: 'border-black',
  exportPrimaryColor: '#000000',
  exportBgColor: '#ffffff'
};

export const STORY_STYLES: Record<StoryStyleId, StoryStyle> = {
  classic: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'classic' },
  andalusian: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'andalusian' },
  midnight: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'midnight' },
  emerald: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'emerald' },
  vintage: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'vintage' },
  sunset: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'sunset' },
  royal: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'royal' },
  minimal: { ...CLASSIC_BLACK_WHITE_STYLE, id: 'minimal' },
};

export const STORY_STYLE_LIST: StoryStyle[] = [STORY_STYLES.classic];

export const DEFAULT_STORY_STYLE: StoryStyleId = 'classic';

export function getStoryStyle(id?: string | null): StoryStyle {
  return STORY_STYLES.classic;
}
