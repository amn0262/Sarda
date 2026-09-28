'use client';

import { StoryStyleId, getStoryStyle } from '@/lib/storyStyles';

interface StoryStyleSelectorProps {
  currentStyleId?: StoryStyleId | string;
  onSelectStyle?: (styleId: StoryStyleId) => void;
  variant?: 'compact' | 'modal' | 'inline';
  isOpen?: boolean;
  onClose?: () => void;
}

// In classic black and white mode, style selector and badges are removed per user request
export function StoryStyleBadge({ styleId, language, className = '' }: { styleId?: string | null; language: 'ar' | 'en'; className?: string }) {
  return null;
}

export default function StoryStyleSelector(props: StoryStyleSelectorProps) {
  return null;
}
