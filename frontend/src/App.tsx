import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import TaskForm from './components/TaskForm';
import { Task, TaskStatus } from './types/task';
import { TaskAPI } from './services/api';
import { format } from 'date-fns';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeletedTasks, setShowDeletedTasks] = useState(true);
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [showDeletedTasks, selectedDate, dateFilterEnabled]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let tasksData: Task[];
      
      if (dateFilterEnabled) {
        // Use backend date filtering for selected date
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        tasksData = await TaskAPI.getTasksByDate(dateString, showDeletedTasks);
      } else {
        // Load all tasks (for calendar view)
        tasksData = await TaskAPI.getAllTasks(undefined, undefined, undefined, showDeletedTasks);
      }
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
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

  const handleTaskSubmit = async (taskData: any) => {
    try {
      if (editingTask) {
        const updatedTask = await TaskAPI.updateTask(editingTask.id, taskData);
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      } else {
        const newTask = await TaskAPI.createTask(taskData);
        setTasks([...tasks, newTask]);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-base lg:text-lg text-gray-600 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <Sidebar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onCreateTask={handleCreateTask}
          showDeletedTasks={showDeletedTasks}
          onToggleDeletedTasks={setShowDeletedTasks}
          dateFilterEnabled={dateFilterEnabled}
          onViewAllTasks={handleViewAllTasks}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            <Route 
              path="/tasks" 
              element={
                <TaskList
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onSoftDeleteTask={handleSoftDeleteTask}
                  onPermanentDeleteTask={handlePermanentDeleteTask}
                  onStatusChange={handleStatusChange}
                  selectedDate={selectedDate}
                  dateFilterEnabled={dateFilterEnabled}
                />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
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