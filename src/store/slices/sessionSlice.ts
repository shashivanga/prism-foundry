import { StateCreator } from 'zustand';

export interface Session {
  userId?: string;
  token?: string;
  expiresAt?: Date;
  isAuthenticated: boolean;
}

export interface SessionSlice {
  session: Session;
  login: (userId: string, token: string, expiresAt: Date) => void;
  logout: () => void;
  refreshSession: (token: string, expiresAt: Date) => void;
  isSessionValid: () => boolean;
}

export const sessionSlice: StateCreator<SessionSlice> = (set, get) => ({
  session: {
    isAuthenticated: false,
  },
  login: (userId, token, expiresAt) =>
    set({
      session: {
        userId,
        token,
        expiresAt,
        isAuthenticated: true,
      },
    }),
  logout: () =>
    set({
      session: {
        isAuthenticated: false,
      },
    }),
  refreshSession: (token, expiresAt) =>
    set((state) => ({
      session: {
        ...state.session,
        token,
        expiresAt,
      },
    })),
  isSessionValid: () => {
    const { session } = get();
    return (
      session.isAuthenticated &&
      session.expiresAt &&
      new Date() < session.expiresAt
    );
  },
});