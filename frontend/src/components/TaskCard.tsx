import { useState, useEffect } from 'react';
import { Edit2, Trash2, CheckCircle, Clock, Circle, AlertTriangle, Calendar, GripVertical } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { format, parseISO } from 'date-fns';
import { 
  getPriorityIcon, 
  getPriorityLabel, 
  getPriorityColor, 
  getStatusBackgroundColor,
  getStatusBadgeColor,
  formatTimeRange,
  getTaskBorderColor
} from '../utils/taskUtils';
import { Draggable } from 'react-beautiful-dnd';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  isDragging?: boolean;
}

const TaskCard = ({
  task,
  index,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,

}: TaskCardProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Listen for changes to dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Validate task object
  console.log('TaskCard rendering - task:', task);
  console.log('TaskCard rendering - task type:', typeof task);
  console.log('TaskCard rendering - task.id:', task?.id);
  console.log('TaskCard rendering - onEdit function:', onEdit);
  console.log('TaskCard rendering - onEdit type:', typeof onEdit);
  
  if (!task || typeof task !== 'object') {
    console.error('TaskCard received invalid task:', task);
    return null;
  }
  
  if (!task.id) {
    console.error('TaskCard received task without id:', task);
    return null;
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const statusOrder = [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(task.id, nextStatus);
  };

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const priorityOrder = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
    const currentIndex = priorityOrder.indexOf(task.priority);
    const nextPriority = priorityOrder[(currentIndex + 1) % priorityOrder.length];
    onPriorityChange(task.id, nextPriority);
  };

  const handleCardClick = () => {
    console.log('=== Card Click Event ===');
    console.log('Card clicked - task object:', task);
    console.log('Card clicked - task type:', typeof task);
    console.log('Card clicked - task.id:', task?.id);
    console.log('Card clicked - task.is_deleted:', task?.is_deleted);
    console.log('Card clicked - onEdit function:', onEdit);
    console.log('Card clicked - onEdit type:', typeof onEdit);
    
    if (!task.is_deleted) {
      console.log('Card clicked for task:', task);
      if (typeof onEdit === 'function') {
        console.log('Calling onEdit with task:', task);
        onEdit(task);
      } else {
        console.error('onEdit is not a function:', onEdit);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log('=== Edit Button Click Event ===');
    console.log('Edit button clicked - task object:', task);
    console.log('Edit button clicked - task type:', typeof task);
    console.log('Edit button clicked - task.id:', task?.id);
    console.log('Edit button clicked for task:', task);
    console.log('Edit button clicked - onEdit function:', onEdit);
    console.log('Edit button clicked - onEdit type:', typeof onEdit);
    
    if (typeof onEdit === 'function') {
      console.log('Calling onEdit with task:', task);
      onEdit(task);
    } else {
      console.error('onEdit is not a function:', onEdit);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onDelete(task);
  };

  const getProgressPercentage = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return 100;
      case TaskStatus.IN_PROGRESS:
        return 50;
      default:
        return 0;
    }
  };

  const getProgressColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-card dark:bg-gray-800 rounded-lg border p-2.5 transition-all duration-200 cursor-pointer group ${
            task.is_deleted ? 'opacity-60 bg-muted' : 'hover:shadow-md hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-600'
          } ${getStatusBackgroundColor(task.status)} ${
            snapshot.isDragging ? 'shadow-xl scale-105 z-50' : ''
          } ${getTaskBorderColor(task)}`}
          style={{
            ...provided.draggableProps.style
          }}
          onClick={handleCardClick}
        >
          {/* Main Content Row */}
          <div className="flex items-start gap-2">
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-2.5 h-2.5" />
            </div>

            {/* Status Icon */}
            <button
              onClick={handleStatusClick}
              className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={task.is_deleted}
              title={`Click to change status: ${task.status}`}
            >
              {getStatusIcon(task.status)}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              {/* Header Row with Priority */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className={`font-medium text-foreground break-words text-sm leading-tight ${
                  task.is_deleted ? 'line-through text-muted-foreground' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                  #{task.serial_number} - {task.description}
                </h3>

                {/* Priority Badge */}
                <button
                  onClick={handlePriorityClick}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                    getPriorityColor(task.priority)
                  } text-white hover:scale-105 shadow-sm`}
                  disabled={task.is_deleted}
                  title={`Click to change priority: ${getPriorityLabel(task.priority)}`}
                >
                  <span className="mr-0.5">{getPriorityIcon(task.priority)}</span>
                  {getPriorityLabel(task.priority)}
                </button>
              </div>

              {/* Progress Bar and Status */}
              <div className="mb-1.5">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span className="font-medium text-foreground dark:text-gray-300">{task.status}</span>
                  <span className="font-medium text-foreground dark:text-gray-300">{getProgressPercentage()}%</span>
                </div>
              </div>

              {/* Comment - only show if exists */}
              {task.comment && (
                <div className={`text-xs text-muted-foreground dark:text-gray-600 mb-1.5 break-words italic ${
                  task.is_deleted ? 'line-through' : ''
                }`}>
                  "{task.comment}"
                </div>
              )}

              {/* Bottom Row: Metadata, Status Badge, and Actions */}
              <div className="flex items-center justify-between gap-2">
                {/* Left side: Metadata */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground dark:text-gray-600">
                  {task.due_date && (
                    <span className="whitespace-nowrap flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">
                      <Calendar className="w-2.5 h-2.5" />
                      {format(parseISO(task.due_date), 'MMM d')}
                    </span>
                  )}
                  
                  {(task.start_time || task.end_time) && (
                    <span className="whitespace-nowrap flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeRange(task.start_time, task.end_time)}
                    </span>
                  )}
                  
                  <span className="whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                    {format(parseISO(task.created_date), 'MMM d')}
                  </span>
                </div>

                {/* Right side: Status Badge and Actions */}
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                    getStatusBadgeColor(task.status, isDarkMode)
                  }`}>
                    {task.status}
                  </span>
                  
                  {task.is_deleted && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 whitespace-nowrap">
                      <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                      Deleted
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 transition-all duration-200 opacity-100">
                    <button
                      onClick={handleEditClick}
                      className="p-1 text-muted-foreground dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-all duration-200 hover:scale-110"
                      title="Edit task"
                      disabled={task.is_deleted}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="p-1 text-muted-foreground dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-all duration-200 hover:scale-110"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard; 