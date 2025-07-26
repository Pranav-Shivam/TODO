import axios from 'axios';
import { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority, TaskFilters } from '../types/task';
import { config } from '../config/env';

const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class TaskAPI {
  static async getAllTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority.toString());
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.highPriorityOnly) params.append('high_priority_only', 'true');
      if (filters.todayOnly) params.append('today_only', 'true');
      if (filters.includeDeleted) params.append('include_deleted', 'true');
    }

    console.log('Getting all tasks with filters:', filters);
    const response = await api.get(`/api/tasks?${params.toString()}`);
    console.log('Tasks response:', response.data);
    return response.data;
  }

  static async getTask(taskId: string): Promise<Task> {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  }

  static async createTask(task: TaskCreate): Promise<Task> {
    console.log('Creating task with data:', JSON.stringify(task, null, 2));
    const response = await api.post('/api/tasks/', task);
    return response.data;
  }

  static async updateTask(taskId: string, task: TaskUpdate): Promise<Task> {
    console.log('Updating task with ID:', taskId);
    console.log('Update data:', JSON.stringify(task, null, 2));
    const response = await api.put(`/api/tasks/${taskId}`, task);
    console.log('Update response:', response.data);
    return response.data;
  }

  static async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch(`/api/tasks/${taskId}/status`, status, {
      headers: { 'Content-Type': 'application/json' },
      params: { status }
    });
    return response.data;
  }

  static async updateTaskPriority(taskId: string, priority: TaskPriority): Promise<Task> {
    const response = await api.patch(`/api/tasks/${taskId}/priority`, priority, {
      headers: { 'Content-Type': 'application/json' },
      params: { priority }
    });
    return response.data;
  }

  static async softDeleteTask(taskId: string): Promise<void> {
    await api.patch(`/api/tasks/${taskId}/soft-delete`);
  }

  static async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
  }

  static async getTasksByDate(date: string, includeDeleted: boolean = false): Promise<Task[]> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('include_deleted', 'true');
    
    const response = await api.get(`/api/tasks/by-date/${date}?${params.toString()}`);
    return response.data;
  }

  static async getTasksByStatus(status: TaskStatus, includeDeleted: boolean = false): Promise<Task[]> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('include_deleted', 'true');
    
    const response = await api.get(`/api/tasks/status/${status}?${params.toString()}`);
    return response.data;
  }

  static async getTasksByPriority(priority: TaskPriority, includeDeleted: boolean = false): Promise<Task[]> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('include_deleted', 'true');
    
    const response = await api.get(`/api/tasks/priority/${priority}?${params.toString()}`);
    return response.data;
  }

  static async getTodayHighPriorityTasks(): Promise<Task[]> {
    const response = await api.get('/api/tasks?today_only=true&high_priority_only=true');
    return response.data;
  }

  static async healthCheck(): Promise<{status: string, database: string}> {
    const response = await api.get('/health');
    return response.data;
  }
}

export default api; 