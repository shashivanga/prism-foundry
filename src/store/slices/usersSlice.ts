import { StateCreator } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersSlice {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

export const usersSlice: StateCreator<UsersSlice> = (set, get) => ({
  users: [],
  addUser: (userData) =>
    set((state) => ({
      users: [
        ...state.users,
        {
          ...userData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates, updatedAt: new Date() } : user
      ),
    })),
  removeUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
  getUserById: (id) => get().users.find((user) => user.id === id),
});