import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usersSlice, UsersSlice } from './slices/usersSlice';
import { sessionSlice, SessionSlice } from './slices/sessionSlice';
import { projectsSlice, ProjectsSlice } from './slices/projectsSlice';
import { prdVersionsSlice, PrdVersionsSlice } from './slices/prdVersionsSlice';
import { mvpSpecsSlice, MvpSpecsSlice } from './slices/mvpSpecsSlice';
import { buildsSlice, BuildsSlice } from './slices/buildsSlice';
import { shareLinksSlice, ShareLinksSlice } from './slices/shareLinksSlice';
import { feedbackSlice, FeedbackSlice } from './slices/feedbackSlice';
import { changeLogsSlice, ChangeLogsSlice } from './slices/changeLogsSlice';

export type AppState = UsersSlice & 
  SessionSlice & 
  ProjectsSlice & 
  PrdVersionsSlice & 
  MvpSpecsSlice & 
  BuildsSlice & 
  ShareLinksSlice & 
  FeedbackSlice &
  ChangeLogsSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...args) => ({
      ...usersSlice(...args),
      ...sessionSlice(...args),
      ...projectsSlice(...args),
      ...prdVersionsSlice(...args),
      ...mvpSpecsSlice(...args),
      ...buildsSlice(...args),
      ...shareLinksSlice(...args),
      ...feedbackSlice(...args),
      ...changeLogsSlice(...args),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist all slices except session for security
        users: state.users,
        projects: state.projects,
        prdVersions: state.prdVersions,
        mvpSpecs: state.mvpSpecs,
        builds: state.builds,
        shareLinks: state.shareLinks,
        feedback: state.feedback,
        changeLogs: state.changeLogs,
      }),
    }
  )
);