import { useMemo, useState } from 'react';
import { Edit2, Trash2, CheckCircle, Clock, Circle, AlertTriangle, Calendar, X } from 'lucide-react';
import { Task, TaskStatus } from '../types/task';
import { format, isSameDay, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onSoftDeleteTask: (taskId: string) => void;
  onPermanentDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  selectedDate: Date;
  dateFilterEnabled: boolean;
}

interface DeleteConfirmationProps {
  task: Task;
  onSoftDelete: () => void;
  onPermanentDelete: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = ({ task, onSoftDelete, onPermanentDelete, onCancel }: DeleteConfirmationProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-4 lg:p-6 max-w-md w-full mx-auto shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          What would you like to do with this task?
        </p>
        <div className="bg-gray-50 p-3 rounded-lg break-words">
          <p className="font-medium text-gray-900">#{task.serial_number} - {task.description}</p>
          {task.comment && (
            <p className="text-sm text-gray-600 mt-1">{task.comment}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onSoftDelete}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <Trash2 className="w-4 h-4" />
          Soft Delete (Can be recovered)
        </button>
        
        <button
          onClick={onPermanentDelete}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <AlertTriangle className="w-4 h-4" />
          Permanently Delete (Cannot be undone)
        </button>
        
        <button
          onClick={onCancel}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const TaskList = ({
  tasks,
  onEditTask,
  onSoftDeleteTask,
  onPermanentDeleteTask,
  onStatusChange,
  selectedDate,
  dateFilterEnabled
}: TaskListProps) => {
  const [deleteConfirmationTask, setDeleteConfirmationTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    // If date filtering is enabled, tasks are already filtered by backend
    // If not, we need to filter client-side (for calendar view showing all tasks)
    if (dateFilterEnabled) {
      return tasks; // Backend already filtered by date
    }
    
    // Client-side filtering for calendar view
    return tasks.filter(task => {
      if (!task.due_date) return true;
      try {
        const taskDate = parseISO(task.due_date);
        return isSameDay(taskDate, selectedDate);
      } catch {
        return true;
      }
    });
  }, [tasks, selectedDate, dateFilterEnabled]);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-50 border-green-200';
      case TaskStatus.IN_PROGRESS:
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleStatusClick = (task: Task) => {
    const statusOrder = [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(task.id, nextStatus);
  };

  const handleDeleteClick = (task: Task) => {
    setDeleteConfirmationTask(task);
  };

  const handleSoftDelete = () => {
    if (deleteConfirmationTask) {
      onSoftDeleteTask(deleteConfirmationTask.id);
      setDeleteConfirmationTask(null);
    }
  };

  const handlePermanentDelete = () => {
    if (deleteConfirmationTask) {
      onPermanentDeleteTask(deleteConfirmationTask.id);
      setDeleteConfirmationTask(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationTask(null);
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No tasks for this date</h3>
          <p>Create a new task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 lg:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  {dateFilterEnabled 
                    ? `Tasks for ${format(selectedDate, 'MMMM d, yyyy')}`
                    : `All Tasks (${format(selectedDate, 'MMMM d, yyyy')})`
                  }
                </h2>
                <p className="text-sm lg:text-base text-gray-600 mt-1">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
                  {dateFilterEnabled && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Calendar className="w-3 h-3 mr-1" />
                      Date Filtered
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg border p-3 lg:p-4 hover:shadow-md transition-shadow ${
                  task.is_deleted ? 'opacity-60 bg-gray-50' : ''
                } ${getStatusColor(task.status)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleStatusClick(task)}
                      className="mt-1 hover:scale-110 transition-transform"
                      disabled={task.is_deleted}
                    >
                      {getStatusIcon(task.status)}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`font-medium text-gray-900 break-words ${
                          task.is_deleted ? 'line-through text-gray-500' : ''
                        }`}>
                          #{task.serial_number} - {task.description}
                        </h3>
                        {task.is_deleted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Deleted
                          </span>
                        )}
                      </div>
                      
                      {task.comment && (
                        <p className={`text-sm text-gray-600 mb-2 break-words ${
                          task.is_deleted ? 'line-through' : ''
                        }`}>
                          {task.comment}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                          task.status === TaskStatus.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : task.status === TaskStatus.IN_PROGRESS
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                        
                        {task.due_date && (
                          <span className="whitespace-nowrap">Due: {format(parseISO(task.due_date), 'MMM d, yyyy')}</span>
                        )}
                        
                        <span className="whitespace-nowrap">Created: {format(parseISO(task.created_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:ml-4 justify-end lg:justify-start">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit task"
                      disabled={task.is_deleted}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(task)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {deleteConfirmationTask && (
        <DeleteConfirmation
          task={deleteConfirmationTask}
          onSoftDelete={handleSoftDelete}
          onPermanentDelete={handlePermanentDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default TaskList; 