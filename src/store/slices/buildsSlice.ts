import { StateCreator } from 'zustand';

export interface Build {
  id: string;
  projectId: string;
  mvpSpecId: string;
  version: string;
  status: 'pending' | 'building' | 'testing' | 'deployed' | 'failed';
  deployUrl?: string;
  buildLogs?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildsSlice {
  builds: Build[];
  addBuild: (build: Omit<Build, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBuild: (id: string, updates: Partial<Build>) => void;
  removeBuild: (id: string) => void;
  getBuildById: (id: string) => Build | undefined;
  getBuildsByProject: (projectId: string) => Build[];
  getBuildsByMvpSpec: (mvpSpecId: string) => Build[];
  getLatestBuild: (projectId: string) => Build | undefined;
}

export const buildsSlice: StateCreator<BuildsSlice> = (set, get) => ({
  builds: [],
  addBuild: (buildData) =>
    set((state) => ({
      builds: [
        ...state.builds,
        {
          ...buildData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateBuild: (id, updates) =>
    set((state) => ({
      builds: state.builds.map((build) =>
        build.id === id ? { ...build, ...updates, updatedAt: new Date() } : build
      ),
    })),
  removeBuild: (id) =>
    set((state) => ({
      builds: state.builds.filter((build) => build.id !== id),
    })),
  getBuildById: (id) => get().builds.find((build) => build.id === id),
  getBuildsByProject: (projectId) =>
    get().builds.filter((build) => build.projectId === projectId),
  getBuildsByMvpSpec: (mvpSpecId) =>
    get().builds.filter((build) => build.mvpSpecId === mvpSpecId),
  getLatestBuild: (projectId) => {
    const builds = get().builds
      .filter((build) => build.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return builds[0];
  },
});