import axios from 'axios';
import { Task, TaskCreate, TaskUpdate, TaskStatus } from '../types/task';
import { config } from '../config/env';

const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class TaskAPI {
  static async getAllTasks(
    status?: TaskStatus,
    startDate?: string,
    endDate?: string,
    includeDeleted: boolean = false
  ): Promise<Task[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (includeDeleted) params.append('include_deleted', 'true');

    const response = await api.get(`/api/tasks?${params.toString()}`);
    return response.data;
  }

  static async getTask(taskId: string): Promise<Task> {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  }

  static async createTask(task: TaskCreate): Promise<Task> {
    const response = await api.post('/api/tasks/', task);
    return response.data;
  }

  static async updateTask(taskId: string, task: TaskUpdate): Promise<Task> {
    const response = await api.put(`/api/tasks/${taskId}`, task);
    return response.data;
  }

  static async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch(`/api/tasks/${taskId}/status`, status, {
      headers: { 'Content-Type': 'application/json' },
      params: { status }
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

  static async healthCheck(): Promise<{status: string, database: string}> {
    const response = await api.get('/health');
    return response.data;
  }
}

export default api; 