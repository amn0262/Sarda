import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

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
}

interface AppState {
  folders: Folder[];
  stories: Story[];
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  addFolder: (name: string, color?: string, parentId?: string | null) => void;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => void;
  deleteFolder: (id: string) => void;
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStory: (id: string, story: Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>) => void;
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
      folders: [],
      stories: [],
      language: 'ar',
      setLanguage: (lang) => set({ language: lang }),
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
      addStory: (story) => set((state) => ({
        stories: [...state.stories, { ...story, id: uuidv4(), createdAt: Date.now(), updatedAt: Date.now() }]
      })),
      updateStory: (id, story) => set((state) => ({
        stories: state.stories.map(s => s.id === id ? { ...s, ...story, updatedAt: Date.now() } : s)
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
    }
  )
);
