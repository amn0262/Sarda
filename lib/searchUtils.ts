import { Folder, Story } from './store';

/**
 * Normalizes Arabic text for flexible search (ignores tashkeel, standardizes alef, taa marbuta, etc.)
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic diacritics/tashkeel
    .replace(/[أإآٱ]/g, 'ا') // normalize alef variants
    .replace(/ة/g, 'ه') // normalize taa marbuta
    .replace(/ى/g, 'ي') // normalize alif maksura
    .trim()
    .toLowerCase();
}

/**
 * Strips HTML tags and decodes common entities to obtain clean text
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Retrieves the full breadcrumb folder hierarchy leading to a folder
 */
export function getFolderPath(folderId: string | null | undefined, folders: Folder[]): Folder[] {
  if (!folderId) return [];
  const map = new Map(folders.map((f) => [f.id, f]));
  const path: Folder[] = [];
  let currId: string | null | undefined = folderId;
  const visited = new Set<string>();

  while (currId && !visited.has(currId)) {
    visited.add(currId);
    const folder = map.get(currId);
    if (folder) {
      path.unshift(folder);
      currId = folder.parentId;
    } else {
      break;
    }
  }
  return path;
}

/**
 * Formats a folder breadcrumb path as a clean string: e.g. "سلسلة الأدب / قصص تاريخية"
 */
export function getFolderPathString(
  folderId: string | null | undefined,
  folders: Folder[],
  separator: string = ' / '
): string {
  const path = getFolderPath(folderId, folders);
  if (path.length === 0) return '';
  return path.map((f) => f.name).join(separator);
}

export interface SearchMatchItem {
  story: Story;
  folderPath: Folder[];
  folderPathString: string;
  matchedInTitle: boolean;
  matchedInContent: boolean;
  totalMatches: number;
  snippetBefore: string;
  snippetMatch: string;
  snippetAfter: string;
}

/**
 * Extracts a snippet centered around the first match of query in text
 */
export function extractSnippet(
  plainText: string,
  query: string,
  contextRadius: number = 60
): { before: string; match: string; after: string } {
  if (!plainText || !query) {
    return {
      before: '',
      match: '',
      after: plainText.substring(0, contextRadius * 2) + (plainText.length > contextRadius * 2 ? '...' : '')
    };
  }

  const normText = normalizeArabicText(plainText);
  const normQuery = normalizeArabicText(query);
  const index = normText.indexOf(normQuery);

  if (index === -1) {
    return {
      before: '',
      match: '',
      after: plainText.substring(0, contextRadius * 2) + (plainText.length > contextRadius * 2 ? '...' : '')
    };
  }

  const start = Math.max(0, index - contextRadius);
  const end = Math.min(plainText.length, index + query.length + contextRadius);

  const before = (start > 0 ? '...' : '') + plainText.substring(start, index);
  const match = plainText.substring(index, index + query.length);
  const after = plainText.substring(index + query.length, end) + (end < plainText.length ? '...' : '');

  return { before, match, after };
}

/**
 * Counts occurrences of query in normalized text
 */
export function countOccurrences(text: string, query: string): number {
  if (!text || !query) return 0;
  const normText = normalizeArabicText(text);
  const normQuery = normalizeArabicText(query);
  if (!normQuery) return 0;

  let count = 0;
  let pos = 0;
  while ((pos = normText.indexOf(normQuery, pos)) !== -1) {
    count++;
    pos += normQuery.length;
  }
  return count;
}

/**
 * Global search across all active stories in the system
 */
export function searchAllStories(
  query: string,
  stories: Story[],
  folders: Folder[]
): { results: SearchMatchItem[]; totalResults: number; query: string } {
  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [], totalResults: 0, query: '' };
  }

  const normQuery = normalizeArabicText(trimmed);
  const activeStories = stories.filter((s) => !s.isDeleted);
  const results: SearchMatchItem[] = [];

  for (const story of activeStories) {
    const normTitle = normalizeArabicText(story.title || '');
    const plainContent = stripHtml(story.content || '');
    const normContent = normalizeArabicText(plainContent);

    const titleMatches = normTitle.includes(normQuery);
    const contentMatches = normContent.includes(normQuery);

    if (titleMatches || contentMatches) {
      const titleCount = countOccurrences(story.title || '', trimmed);
      const contentCount = countOccurrences(plainContent, trimmed);
      const totalMatches = titleCount + contentCount;

      const snippet = extractSnippet(plainContent, trimmed);
      const folderPath = getFolderPath(story.folderId, folders);
      const folderPathString = getFolderPathString(story.folderId, folders);

      results.push({
        story,
        folderPath,
        folderPathString,
        matchedInTitle: titleMatches,
        matchedInContent: contentMatches,
        totalMatches,
        snippetBefore: snippet.before,
        snippetMatch: snippet.match,
        snippetAfter: snippet.after
      });
    }
  }

  // Sort: title matches first, then higher total match count, then recent updatedAt
  results.sort((a, b) => {
    if (a.matchedInTitle && !b.matchedInTitle) return -1;
    if (!a.matchedInTitle && b.matchedInTitle) return 1;
    if (b.totalMatches !== a.totalMatches) return b.totalMatches - a.totalMatches;
    return b.story.updatedAt - a.story.updatedAt;
  });

  return {
    results,
    totalResults: results.length,
    query: trimmed
  };
}
