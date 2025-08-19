import { StateCreator } from 'zustand';

export interface ShareLink {
  id: string;
  projectId: string;
  buildId: string;
  token: string;
  expiresAt?: Date;
  isPublic: boolean;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareLinksSlice {
  shareLinks: ShareLink[];
  addShareLink: (link: Omit<ShareLink, 'id' | 'token' | 'accessCount' | 'createdAt' | 'updatedAt'>) => void;
  updateShareLink: (id: string, updates: Partial<ShareLink>) => void;
  removeShareLink: (id: string) => void;
  getShareLinkById: (id: string) => ShareLink | undefined;
  getShareLinksByProject: (projectId: string) => ShareLink[];
  getShareLinkByToken: (token: string) => ShareLink | undefined;
  incrementAccessCount: (id: string) => void;
}

export const shareLinksSlice: StateCreator<ShareLinksSlice> = (set, get) => ({
  shareLinks: [],
  addShareLink: (linkData) =>
    set((state) => ({
      shareLinks: [
        ...state.shareLinks,
        {
          ...linkData,
          id: crypto.randomUUID(),
          token: crypto.randomUUID(),
          accessCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateShareLink: (id, updates) =>
    set((state) => ({
      shareLinks: state.shareLinks.map((link) =>
        link.id === id ? { ...link, ...updates, updatedAt: new Date() } : link
      ),
    })),
  removeShareLink: (id) =>
    set((state) => ({
      shareLinks: state.shareLinks.filter((link) => link.id !== id),
    })),
  getShareLinkById: (id) => get().shareLinks.find((link) => link.id === id),
  getShareLinksByProject: (projectId) =>
    get().shareLinks.filter((link) => link.projectId === projectId),
  getShareLinkByToken: (token) =>
    get().shareLinks.find((link) => link.token === token),
  incrementAccessCount: (id) =>
    set((state) => ({
      shareLinks: state.shareLinks.map((link) =>
        link.id === id
          ? { ...link, accessCount: link.accessCount + 1, updatedAt: new Date() }
          : link
      ),
    })),
});