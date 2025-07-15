export enum TaskStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export interface Task {
  id: string;
  serial_number: number;
  description: string;
  comment?: string;
  status: TaskStatus;
  due_date?: string;
  created_date: string;
  modified_date: string;
  is_deleted: boolean;
}

export interface TaskCreate {
  description: string;
  comment?: string;
  status?: TaskStatus;
  due_date?: string;
  is_deleted?: boolean;
}

export interface TaskUpdate {
  description?: string;
  comment?: string;
  status?: TaskStatus;
  due_date?: string;
  is_deleted?: boolean;
} 