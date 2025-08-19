import { StateCreator } from 'zustand';

export interface MvpSpec {
  id: string;
  projectId: string;
  prdVersionId: string;
  title: string;
  features: string[];
  timeline: string;
  resources: string[];
  status: 'planning' | 'in-progress' | 'testing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MvpSpecsSlice {
  mvpSpecs: MvpSpec[];
  addMvpSpec: (spec: Omit<MvpSpec, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMvpSpec: (id: string, updates: Partial<MvpSpec>) => void;
  removeMvpSpec: (id: string) => void;
  getMvpSpecById: (id: string) => MvpSpec | undefined;
  getMvpSpecsByProject: (projectId: string) => MvpSpec[];
  getMvpSpecsByPrdVersion: (prdVersionId: string) => MvpSpec[];
}

export const mvpSpecsSlice: StateCreator<MvpSpecsSlice> = (set, get) => ({
  mvpSpecs: [],
  addMvpSpec: (specData) =>
    set((state) => ({
      mvpSpecs: [
        ...state.mvpSpecs,
        {
          ...specData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateMvpSpec: (id, updates) =>
    set((state) => ({
      mvpSpecs: state.mvpSpecs.map((spec) =>
        spec.id === id ? { ...spec, ...updates, updatedAt: new Date() } : spec
      ),
    })),
  removeMvpSpec: (id) =>
    set((state) => ({
      mvpSpecs: state.mvpSpecs.filter((spec) => spec.id !== id),
    })),
  getMvpSpecById: (id) => get().mvpSpecs.find((spec) => spec.id === id),
  getMvpSpecsByProject: (projectId) =>
    get().mvpSpecs.filter((spec) => spec.projectId === projectId),
  getMvpSpecsByPrdVersion: (prdVersionId) =>
    get().mvpSpecs.filter((spec) => spec.prdVersionId === prdVersionId),
});