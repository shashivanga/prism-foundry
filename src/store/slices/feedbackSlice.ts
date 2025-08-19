import { StateCreator } from 'zustand';

export interface Feedback {
  id: string;
  projectId: string;
  buildId: string;
  shareLinkId?: string;
  authorEmail?: string;
  message: string;
  rating?: number;
  category: 'bug' | 'feature' | 'improvement' | 'general';
  status: 'open' | 'reviewed' | 'resolved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackSlice {
  feedback: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFeedback: (id: string, updates: Partial<Feedback>) => void;
  removeFeedback: (id: string) => void;
  getFeedbackById: (id: string) => Feedback | undefined;
  getFeedbackByProject: (projectId: string) => Feedback[];
  getFeedbackByBuild: (buildId: string) => Feedback[];
  getFeedbackByCategory: (category: Feedback['category']) => Feedback[];
}

export const feedbackSlice: StateCreator<FeedbackSlice> = (set, get) => ({
  feedback: [],
  addFeedback: (feedbackData) =>
    set((state) => ({
      feedback: [
        ...state.feedback,
        {
          ...feedbackData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  updateFeedback: (id, updates) =>
    set((state) => ({
      feedback: state.feedback.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
    })),
  removeFeedback: (id) =>
    set((state) => ({
      feedback: state.feedback.filter((item) => item.id !== id),
    })),
  getFeedbackById: (id) => get().feedback.find((item) => item.id === id),
  getFeedbackByProject: (projectId) =>
    get().feedback.filter((item) => item.projectId === projectId),
  getFeedbackByBuild: (buildId) =>
    get().feedback.filter((item) => item.buildId === buildId),
  getFeedbackByCategory: (category) =>
    get().feedback.filter((item) => item.category === category),
});