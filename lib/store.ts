import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { StoryStyleId } from './storyStyles';

export type StoryStatus = 'draft' | 'ready' | 'published';

export interface Folder {
  id: string;
  name: string;
  color?: string;
  parentId?: string | null;
  createdAt: number;
  isDeleted?: boolean;
}

export interface Story {
  id: string;
  folderId: string;
  title: string;
  content: string;
  status: StoryStatus;
  targetDate: string;
  publishTime: string;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
  isFavorite?: boolean;
  style?: StoryStyleId;
}

interface AppState {
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;

  isFocusMode: boolean;
  setIsFocusMode: (val: boolean) => void;

  folders: Folder[];
  stories: Story[];
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  
  // First Launch Gate & Onboarding Tour State
  hasCompletedSupportGate: boolean;
  isSupportGateOpen: boolean;
  hasCompletedTour: boolean;
  isTourOpen: boolean;
  tourStep: number;
  
  setHasCompletedSupportGate: (val: boolean) => void;
  setIsSupportGateOpen: (open: boolean) => void;
  setHasCompletedTour: (val: boolean) => void;
  setIsTourOpen: (open: boolean) => void;
  startTour: () => void;
  setTourStep: (step: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  closeTour: () => void;

  addFolder: (name: string, color?: string, parentId?: string | null) => void;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => void;
  deleteFolder: (id: string) => void;
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string;
  updateStory: (id: string, story: Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  toggleFavorite: (id: string) => void;
  deleteStory: (id: string) => void;
  moveToTrash: (id: string, type: 'story' | 'folder') => void;
  restoreFromTrash: (id: string, type: 'story' | 'folder') => void;
  permanentDelete: (id: string, type: 'story' | 'folder') => void;
  emptyTrash: () => void;
  importData: (data: { folders: Folder[], stories: Story[] }) => void;
}

// Helper to get all descendant folders
const getDescendantFolders = (folders: Folder[], parentId: string): string[] => {
  let descendants: string[] = [];
  const children = folders.filter(f => f.parentId === parentId).map(f => f.id);
  descendants = [...children];
  children.forEach(childId => {
    descendants = [...descendants, ...getDescendantFolders(folders, childId)];
  });
  return descendants;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      isFocusMode: false,
      setIsFocusMode: (val) => set({ isFocusMode: val }),

      folders: [],
      stories: [],
      language: 'ar',
      setLanguage: (lang) => set({ language: lang }),

      hasCompletedSupportGate: false,
      isSupportGateOpen: false,
      hasCompletedTour: false,
      isTourOpen: false,
      tourStep: 0,

      setHasCompletedSupportGate: (val) => set({ hasCompletedSupportGate: val }),
      setIsSupportGateOpen: (open) => set({ isSupportGateOpen: open }),
      setHasCompletedTour: (val) => set({ hasCompletedTour: val }),
      setIsTourOpen: (open) => set({ isTourOpen: open }),
      startTour: () => set({ isTourOpen: true, tourStep: 0 }),
      setTourStep: (step) => set({ tourStep: step }),
      nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
      prevTourStep: () => set((state) => ({ tourStep: Math.max(0, state.tourStep - 1) })),
      closeTour: () => set({ isTourOpen: false, hasCompletedTour: true }),

      addFolder: (name, color, parentId) => set((state) => ({
        folders: [...state.folders, { id: uuidv4(), name, color, parentId, createdAt: Date.now() }]
      })),
      updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      deleteFolder: (id) => set((state) => {
        const descendantIds = getDescendantFolders(state.folders, id);
        const idsToUpdate = [id, ...descendantIds];
        return {
          folders: state.folders.map(f => idsToUpdate.includes(f.id) ? { ...f, isDeleted: true } : f),
          stories: state.stories.map(s => idsToUpdate.includes(s.folderId) ? { ...s, isDeleted: true } : s)
        };
      }),
      addStory: (story) => {
        const newId = story.id || uuidv4();
        set((state) => ({
          stories: [...state.stories, { ...story, id: newId, style: story.style || 'classic', createdAt: Date.now(), updatedAt: Date.now() }]
        }));
        return newId;
      },
      updateStory: (id, story) => set((state) => ({
        stories: state.stories.map(s => s.id === id ? { ...s, ...story, updatedAt: Date.now() } : s)
      })),
      toggleFavorite: (id) => set((state) => ({
        stories: state.stories.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)
      })),
      deleteStory: (id) => set((state) => ({
        stories: state.stories.map(s => s.id === id ? { ...s, isDeleted: true } : s)
      })),
      moveToTrash: (id, type) => set((state) => {
        if (type === 'folder') {
          const descendantIds = getDescendantFolders(state.folders, id);
          const idsToUpdate = [id, ...descendantIds];
          return {
            folders: state.folders.map(f => idsToUpdate.includes(f.id) ? { ...f, isDeleted: true } : f),
            stories: state.stories.map(s => idsToUpdate.includes(s.folderId) ? { ...s, isDeleted: true } : s)
          };
        } else {
          return {
            stories: state.stories.map(s => s.id === id ? { ...s, isDeleted: true, folderId: '' } : s)
          };
        }
      }),
      restoreFromTrash: (id, type) => set((state) => {
        if (type === 'folder') {
          const descendantIds = getDescendantFolders(state.folders, id);
          const idsToUpdate = [id, ...descendantIds];
          return {
            folders: state.folders.map(f => idsToUpdate.includes(f.id) ? { ...f, isDeleted: false } : f),
            stories: state.stories.map(s => idsToUpdate.includes(s.folderId) ? { ...s, isDeleted: false } : s)
          };
        } else {
          return {
            stories: state.stories.map(s => s.id === id ? { ...s, isDeleted: false } : s)
          };
        }
      }),
      permanentDelete: (id, type) => set((state) => {
        if (type === 'folder') {
          const descendantIds = getDescendantFolders(state.folders, id);
          const idsToDelete = [id, ...descendantIds];
          return {
            folders: state.folders.filter(f => !idsToDelete.includes(f.id)),
            stories: state.stories.filter(s => !idsToDelete.includes(s.folderId))
          };
        } else {
          return {
            stories: state.stories.filter(s => s.id !== id)
          };
        }
      }),
      emptyTrash: () => set((state) => ({
        folders: state.folders.filter(f => !f.isDeleted),
        stories: state.stories.filter(s => !s.isDeleted)
      })),
      importData: (data) => set(() => ({
        folders: data.folders || [],
        stories: data.stories || []
      }))
    }),
    {
      name: 'sarda-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        folders: state.folders,
        stories: state.stories,
        language: state.language,
        hasCompletedSupportGate: state.hasCompletedSupportGate,
        hasCompletedTour: state.hasCompletedTour,
      }),
    }
  )
);
