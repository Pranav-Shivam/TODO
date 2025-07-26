export enum TaskStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export enum TaskPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

export interface Task {
  id: string;
  serial_number: number;
  description: string;
  comment?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  created_date: string;
  modified_date: string;
  is_deleted: boolean;
}

export interface TaskCreate {
  description: string;
  comment?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  is_deleted?: boolean;
}

export interface TaskUpdate {
  description?: string;
  comment?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  is_deleted?: boolean;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  highPriorityOnly?: boolean;
  todayOnly?: boolean;
  includeDeleted?: boolean;
} 