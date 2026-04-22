/** Priority levels for tasks */
export type Priority = 'alta' | 'media' | 'baja';

/** Task model */
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

/** Category model */
export interface Category {
  id: string;
  name: string;
  color: string;
}
