// Shared types for the application
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EntityStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface TimeStamped {
  createdAt: Date;
  updatedAt: Date;
}