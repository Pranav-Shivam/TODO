import { TaskPriority, TaskStatus } from '../types/task';

export const getPriorityIcon = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.HIGH:
      return '🔴';
    case TaskPriority.MEDIUM:
      return '🟡';
    case TaskPriority.LOW:
      return '🟢';
    default:
      return '⚪';
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.HIGH:
      return 'High';
    case TaskPriority.MEDIUM:
      return 'Medium';
    case TaskPriority.LOW:
      return 'Low';
    default:
      return 'Unknown';
  }
};

// Enhanced color system with better consistency
export const getPriorityColor = (priority: TaskPriority, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-600 hover:bg-red-700';
      case TaskPriority.MEDIUM:
        return 'bg-amber-600 hover:bg-amber-700';
      case TaskPriority.LOW:
        return 'bg-emerald-600 hover:bg-emerald-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  } else {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-500 hover:bg-red-600';
      case TaskPriority.MEDIUM:
        return 'bg-amber-500 hover:bg-amber-600';
      case TaskPriority.LOW:
        return 'bg-emerald-500 hover:bg-emerald-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  }
};

export const getPriorityBorderColor = (priority: TaskPriority, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'border-red-500';
      case TaskPriority.MEDIUM:
        return 'border-amber-500';
      case TaskPriority.LOW:
        return 'border-emerald-500';
      default:
        return 'border-gray-500';
    }
  } else {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'border-red-400';
      case TaskPriority.MEDIUM:
        return 'border-amber-400';
      case TaskPriority.LOW:
        return 'border-emerald-400';
      default:
        return 'border-gray-400';
    }
  }
};

export const getPriorityTextColor = (priority: TaskPriority, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'text-red-400';
      case TaskPriority.MEDIUM:
        return 'text-amber-400';
      case TaskPriority.LOW:
        return 'text-emerald-400';
      default:
        return 'text-gray-400';
    }
  } else {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'text-red-600';
      case TaskPriority.MEDIUM:
        return 'text-amber-600';
      case TaskPriority.LOW:
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  }
};

export const getStatusColor = (status: TaskStatus, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-600';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-600';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  } else {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-500';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
};

export const getStatusBackgroundColor = (status: TaskStatus, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-950 border-emerald-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-950 border-amber-800';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-950 border-gray-800';
      default:
        return 'bg-gray-950 border-gray-800';
    }
  } else {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-50 border-emerald-200';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-50 border-amber-200';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }
};

export const getStatusTextColor = (status: TaskStatus, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'text-emerald-400';
      case TaskStatus.IN_PROGRESS:
        return 'text-amber-400';
      case TaskStatus.NOT_STARTED:
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  } else {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'text-emerald-700';
      case TaskStatus.IN_PROGRESS:
        return 'text-amber-700';
      case TaskStatus.NOT_STARTED:
        return 'text-gray-700';
      default:
        return 'text-gray-700';
    }
  }
};

export const getStatusBadgeColor = (status: TaskStatus, isDarkMode: boolean = false): string => {
  if (isDarkMode) {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-900 text-emerald-200 border-emerald-700';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-900 text-amber-200 border-amber-700';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-900 text-gray-200 border-gray-700';
      default:
        return 'bg-gray-900 text-gray-200 border-gray-700';
    }
  } else {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }
};

export const getStatusText = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 'Completed';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.NOT_STARTED:
      return 'Not Started';
    default:
      return 'Unknown';
  }
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const time = new Date(`2000-01-01T${timeString}`);
  return time.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatTimeRange = (startTime?: string, endTime?: string): string => {
  if (!startTime && !endTime) return '';
  if (!startTime) return formatTime(endTime!);
  if (!endTime) return formatTime(startTime);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getTaskColor = (task: any, isDarkMode: boolean = false): string => {
  return getPriorityColor(task.priority, isDarkMode);
};

export const getTaskBorderColor = (task: any, isDarkMode: boolean = false): string => {
  return `border-l-4 ${getPriorityBorderColor(task.priority, isDarkMode)}`;
};

export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return true;
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  return start < end;
};

export const getShortTitle = (description: string): string => {
  // Remove any ID-like patterns at the beginning
  const cleanDescription = description.replace(/^#[a-f0-9-]+\s*/i, '');
  // Truncate to reasonable length
  return cleanDescription.length > 20 ? cleanDescription.substring(0, 20) + '...' : cleanDescription;
};

export const sortTasksByPriority = (tasks: any[]): any[] => {
  return [...tasks].sort((a, b) => {
    // First sort by priority (1 = highest)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Then by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    // Then by creation date
    return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
  });
};

export const filterTasks = (tasks: any[], filters: any): any[] => {
  return tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.highPriorityOnly && task.priority !== TaskPriority.HIGH) return false;
    if (filters.todayOnly) {
      const today = new Date().toISOString().split('T')[0];
      const taskDate = task.due_date ? task.due_date.split('T')[0] : null;
      if (taskDate !== today) return false;
    }
    if (!filters.includeDeleted && task.is_deleted) return false;
    return true;
  });
}; 