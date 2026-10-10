export type Priority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'active' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: any; // ISO string or Firestore Timestamp
  updatedAt: any;
  category?: string;
  priority?: Priority;
}
