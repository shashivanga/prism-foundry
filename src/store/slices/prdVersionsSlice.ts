import { StateCreator } from 'zustand';

export interface PrdVersion {
  id: string;
  projectId: string;
  version: string;
  title: string;
  content: string;
  authorId: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface PrdVersionsSlice {
  prdVersions: PrdVersion[];
  addPrdVersion: (prd: Omit<PrdVersion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrdVersion: (id: string, updates: Partial<PrdVersion>) => void;
  removePrdVersion: (id: string) => void;
  getPrdVersionById: (id: string) => PrdVersion | undefined;
  getPrdVersionsByProject: (projectId: string) => PrdVersion[];
  getLatestPrdVersion: (projectId: string) => PrdVersion | undefined;
}

export const prdVersionsSlice: StateCreator<PrdVersionsSlice> = (set, get) => ({
  prdVersions: [],
  addPrdVersion: (prdData) =>
    set((state) => ({
      prdVersions: [
        ...state.prdVersions,
        {
          ...prdData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updatePrdVersion: (id, updates) =>
    set((state) => ({
      prdVersions: state.prdVersions.map((prd) =>
        prd.id === id ? { ...prd, ...updates, updatedAt: new Date() } : prd
      ),
    })),
  removePrdVersion: (id) =>
    set((state) => ({
      prdVersions: state.prdVersions.filter((prd) => prd.id !== id),
    })),
  getPrdVersionById: (id) => get().prdVersions.find((prd) => prd.id === id),
  getPrdVersionsByProject: (projectId) =>
    get().prdVersions.filter((prd) => prd.projectId === projectId),
  getLatestPrdVersion: (projectId) => {
    const versions = get().prdVersions
      .filter((prd) => prd.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return versions[0];
  },
});