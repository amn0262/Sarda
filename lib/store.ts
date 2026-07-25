import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type StoryStatus = 'draft' | 'ready' | 'published';

export interface Folder {
  id: string;
  name: string;
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
  addFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
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

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      folders: [],
      stories: [],
      language: 'ar',
      setLanguage: (lang) => set({ language: lang }),
      addFolder: (name) => set((state) => ({
        folders: [...state.folders, { id: uuidv4(), name, createdAt: Date.now() }]
      })),
      updateFolder: (id, name) => set((state) => ({
        folders: state.folders.map(f => f.id === id ? { ...f, name } : f)
      })),
      deleteFolder: (id) => set((state) => ({
        folders: state.folders.map(f => f.id === id ? { ...f, isDeleted: true } : f),
        stories: state.stories.map(s => s.folderId === id ? { ...s, isDeleted: true } : s)
      })),
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
          return {
            folders: state.folders.map(f => f.id === id ? { ...f, isDeleted: true } : f),
            stories: state.stories.map(s => s.folderId === id ? { ...s, isDeleted: true } : s)
          };
        } else {
          return {
            stories: state.stories.map(s => s.id === id ? { ...s, isDeleted: true, folderId: '' } : s)
          };
        }
      }),
      restoreFromTrash: (id, type) => set((state) => {
        if (type === 'folder') {
          return {
            folders: state.folders.map(f => f.id === id ? { ...f, isDeleted: false } : f),
            stories: state.stories.map(s => s.folderId === id ? { ...s, isDeleted: false } : s)
          };
        } else {
          return {
            stories: state.stories.map(s => s.id === id ? { ...s, isDeleted: false } : s)
          };
        }
      }),
      permanentDelete: (id, type) => set((state) => {
        if (type === 'folder') {
          return {
            folders: state.folders.filter(f => f.id !== id),
            stories: state.stories.filter(s => s.folderId !== id)
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
