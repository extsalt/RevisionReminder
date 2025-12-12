export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskList {
  id: string;
  userId: string;
  name: string;
  createdAt: number; // Timestamp
  updatedAt: number;
  tasks: Task[];
}

export type ViewState = 'DASHBOARD' | 'VIEW_LIST' | 'CREATE_LIST';

// Helper type for the form
export interface CreateListForm {
  name: string;
  csvContent: string;
}