import { StateCreator } from 'zustand';
import { DiffChange } from '../../services/diffUtility';

export interface ChangeLog {
  id: string;
  projectId: string;
  entityType: 'prd' | 'mvpSpec';
  entityId: string;
  changes: DiffChange[];
  createdAt: Date;
  createdBy: string;
}

export interface ChangeLogsSlice {
  changeLogs: ChangeLog[];
  addChangeLog: (log: Omit<ChangeLog, 'id' | 'createdAt'>) => void;
  getChangeLogsByProject: (projectId: string) => ChangeLog[];
  getChangeLogsByEntity: (entityType: string, entityId: string) => ChangeLog[];
  removeChangeLog: (id: string) => void;
}

export const changeLogsSlice: StateCreator<ChangeLogsSlice> = (set, get) => ({
  changeLogs: [],
  addChangeLog: (logData) =>
    set((state) => ({
      changeLogs: [
        ...state.changeLogs,
        {
          ...logData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        },
      ],
    })),
  getChangeLogsByProject: (projectId) =>
    get().changeLogs.filter((log) => log.projectId === projectId),
  getChangeLogsByEntity: (entityType, entityId) =>
    get().changeLogs.filter((log) => log.entityType === entityType && log.entityId === entityId),
  removeChangeLog: (id) =>
    set((state) => ({
      changeLogs: state.changeLogs.filter((log) => log.id !== id),
    })),
});