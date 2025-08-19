import { StateCreator } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface ProjectsSlice {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByOwner: (ownerId: string) => Project[];
}

export const projectsSlice: StateCreator<ProjectsSlice> = (set, get) => ({
  projects: [],
  addProject: (projectData) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
      ),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    })),
  getProjectById: (id) => get().projects.find((project) => project.id === id),
  getProjectsByOwner: (ownerId) =>
    get().projects.filter((project) => project.ownerId === ownerId),
});