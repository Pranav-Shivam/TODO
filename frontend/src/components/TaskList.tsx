import { useMemo, useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { format } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { sortTasksByPriority } from '../utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onSoftDeleteTask: (taskId: string) => void;
  onPermanentDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onReorderTasks?: (taskIds: string[]) => void;
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
  <Dialog.Root open={true} onOpenChange={onCancel}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-lg shadow-xl p-4 lg:p-6 focus:outline-none">
        <Dialog.Title className="text-lg font-semibold text-foreground mb-4">
          Delete Task
        </Dialog.Title>
        
        <div className="mb-6">
          <p className="text-muted-foreground mb-2">
            What would you like to do with this task?
          </p>
          <div className="bg-muted p-3 rounded-lg break-words">
            <p className="font-medium text-foreground">#{task.serial_number} - {task.description}</p>
            {task.comment && (
              <p className="text-sm text-muted-foreground mt-1">{task.comment}</p>
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
            className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors text-sm lg:text-base"
          >
            Cancel
          </button>
        </div>

        <Dialog.Close asChild>
          <button
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const TaskList = ({
  tasks,
  onEditTask,
  onSoftDeleteTask,
  onPermanentDeleteTask,
  onStatusChange,
  onPriorityChange,
  onReorderTasks,
  selectedDate,
  dateFilterEnabled
}: TaskListProps) => {
  const [deleteConfirmationTask, setDeleteConfirmationTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    console.log('TaskList filtering - tasks:', tasks);
    console.log('TaskList filtering - dateFilterEnabled:', dateFilterEnabled);
    console.log('TaskList filtering - selectedDate:', selectedDate);
    
    // Tasks are already filtered by the backend based on the logic in App.tsx
    // We just need to sort them by priority
    const sortedTasks = sortTasksByPriority(tasks);
    console.log('TaskList filtering - sorted tasks:', sortedTasks);
    return sortedTasks;
  }, [tasks, selectedDate, dateFilterEnabled]);

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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderTasks) {
      return;
    }

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const taskIds = items.map(task => task.id);
    onReorderTasks(taskIds);
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2 text-foreground">
            {dateFilterEnabled ? 'No tasks for today' : 'No tasks found'}
          </h3>
          <p>
            {dateFilterEnabled 
              ? 'Create a new task to get started with today\'s work'
              : 'No tasks match your current filters'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="flex-shrink-0 p-2 lg:p-3 pb-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1">
            <div>
              <h2 className="text-base lg:text-lg font-bold text-foreground break-words">
                {dateFilterEnabled 
                  ? `Tasks for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'All Tasks'
                }
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
                {dateFilterEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    <Calendar className="w-3 h-3 mr-1" />
                    Today's Tasks
                  </span>
                )}
                {!dateFilterEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    <Filter className="w-3 h-3 mr-1" />
                    Filtered
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks List Section */}
        <div className="flex-1 overflow-y-hidden px-2 lg:px-3">
          <div className="max-w-4xl mx-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-1.5"
                  >
                    {filteredTasks.map((task, index) => {
                      console.log(`Rendering task ${index}:`, task);
                      console.log(`Rendering task ${index} - onEditTask function:`, onEditTask);
                      console.log(`Rendering task ${index} - onEditTask type:`, typeof onEditTask);
                      
                      if (!task) {
                        console.error(`Task at index ${index} is undefined or null`);
                        return null;
                      }
                      
                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onEdit={onEditTask}
                          onDelete={handleDeleteClick}
                          onStatusChange={onStatusChange}
                          onPriorityChange={onPriorityChange}
                        />
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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