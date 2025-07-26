import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import { Task, TaskStatus, TaskPriority, TaskCreate, TaskUpdate, TaskFilters as TaskFiltersType } from './types/task';
import { TaskAPI } from './services/api';
import { format } from 'date-fns';
import { Filter } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeletedTasks, setShowDeletedTasks] = useState(true);
  const [dateFilterEnabled, setDateFilterEnabled] = useState(true); // Default to showing today's tasks
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({});

  // Initialize dark mode from localStorage and system preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check system preference if no saved preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    loadTasks();
  }, [showDeletedTasks, selectedDate, dateFilterEnabled, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let tasksData: Task[];
      
      // Check if any filters are applied (excluding includeDeleted)
      const hasActiveFilters = Object.keys(filters).some(key => key !== 'includeDeleted' && filters[key as keyof TaskFiltersType]);
      
      if (hasActiveFilters) {
        // If filters are applied, show all tasks that match the filters
        const apiFilters: TaskFiltersType = {
          ...filters,
          includeDeleted: showDeletedTasks
        };
        tasksData = await TaskAPI.getAllTasks(apiFilters);
      } else if (dateFilterEnabled) {
        // If no filters and date filter is enabled, show tasks for selected date
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        tasksData = await TaskAPI.getTasksByDate(dateString, showDeletedTasks);
      } else {
        // If no filters and date filter is disabled, show all tasks
        const apiFilters: TaskFiltersType = {
          includeDeleted: showDeletedTasks
        };
        tasksData = await TaskAPI.getAllTasks(apiFilters);
      }
      
      console.log('Loaded tasks:', tasksData);
      console.log('Date filter enabled:', dateFilterEnabled);
      console.log('Selected date:', selectedDate);
      console.log('Has active filters:', hasActiveFilters);
      setTasks(tasksData);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    console.log('handleEditTask called with task:', task);
    console.log('handleEditTask - task type:', typeof task);
    console.log('handleEditTask - task.id:', task?.id);
    
    if (!task) {
      console.error('handleEditTask received undefined task');
      return;
    }
    
    if (!task.id) {
      console.error('handleEditTask received task without id:', task);
      return;
    }
    
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSoftDeleteTask = async (taskId: string) => {
    try {
      await TaskAPI.softDeleteTask(taskId);
      await loadTasks(); // Reload to get updated task list
    } catch (error) {
      console.error('Failed to soft delete task:', error);
    }
  };

  const handlePermanentDeleteTask = async (taskId: string) => {
    try {
      await TaskAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to permanently delete task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await TaskAPI.updateTaskStatus(taskId, status);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handlePriorityChange = async (taskId: string, priority: TaskPriority) => {
    try {
      const updatedTask = await TaskAPI.updateTaskPriority(taskId, priority);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task priority:', error);
    }
  };

  const handleReorderTasks = (taskIds: string[]) => {
    // Reorder tasks based on the new order
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const reorderedTasks = taskIds.map(id => taskMap.get(id)).filter(Boolean) as Task[];
    
    // Add any tasks that weren't in the reorder list (shouldn't happen, but just in case)
    const remainingTasks = tasks.filter(task => !taskIds.includes(task.id));
    setTasks([...reorderedTasks, ...remainingTasks]);
  };

  const handleTaskSubmit = async (taskData: TaskCreate | TaskUpdate) => {
    try {
      if (editingTask) {
        const updatedTask = await TaskAPI.updateTask(editingTask.id, taskData as TaskUpdate);
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      } else {
        const newTask = await TaskAPI.createTask(taskData as TaskCreate);
        setTasks([...tasks, newTask]);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error: any) {
      console.error('Failed to save task:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Enable date filtering when a specific date is selected
    setDateFilterEnabled(true);
  };

  const handleViewAllTasks = () => {
    // Disable date filtering to show all tasks (for calendar view)
    setDateFilterEnabled(false);
  };

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
    
    // Check if any filters are applied (excluding includeDeleted)
    const hasActiveFilters = Object.keys(newFilters).some(key => key !== 'includeDeleted' && newFilters[key as keyof TaskFiltersType]);
    
    // If filters are applied, disable date filtering to show all matching tasks
    // If filters are cleared, re-enable date filtering to show today's tasks
    if (hasActiveFilters) {
      setDateFilterEnabled(false);
    } else {
      setDateFilterEnabled(true);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    // Re-enable date filtering when filters are cleared
    setDateFilterEnabled(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-base lg:text-lg text-foreground flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
        <Sidebar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onCreateTask={handleCreateTask}
          showDeletedTasks={showDeletedTasks}
          onToggleDeletedTasks={setShowDeletedTasks}
          dateFilterEnabled={dateFilterEnabled}
          onViewAllTasks={handleViewAllTasks}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          hasActiveFilters={Object.keys(filters).some(key => key !== 'includeDeleted' && filters[key as keyof TaskFiltersType])}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            <Route 
              path="/tasks" 
              element={
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Filters Section */}
                  <div className="flex-shrink-0 p-2 lg:p-3 pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-lg lg:text-xl font-bold text-foreground">Task Management</h1>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                      </button>
                    </div>
                    {showFilters && (
                      <TaskFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                      />
                    )}
                  </div>
                  
                  {/* Task List */}
                  <div className="flex-1 overflow-hidden">
                                          <TaskList
                        tasks={tasks}
                        onEditTask={handleEditTask}
                        onSoftDeleteTask={handleSoftDeleteTask}
                        onPermanentDeleteTask={handlePermanentDeleteTask}
                        onStatusChange={handleStatusChange}
                        onPriorityChange={handlePriorityChange}
                        onReorderTasks={handleReorderTasks}
                        selectedDate={selectedDate}
                        dateFilterEnabled={dateFilterEnabled}
                      />
                  </div>
                </div>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <CalendarView
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onSoftDeleteTask={handleSoftDeleteTask}
                  onPermanentDeleteTask={handlePermanentDeleteTask}
                  onSelectDate={handleDateSelect}
                  onViewAllTasks={handleViewAllTasks}
                />
              } 
            />
          </Routes>
        </main>

        {showTaskForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
              <TaskForm
                task={editingTask}
                onSubmit={handleTaskSubmit}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                defaultDate={format(selectedDate, 'yyyy-MM-dd')}
              />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App; 