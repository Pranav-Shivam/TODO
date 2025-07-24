import { useMemo, useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Task, TaskStatus } from '../types/task';
import { parseISO } from 'date-fns';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onSoftDeleteTask: (taskId: string) => void;
  onPermanentDeleteTask: (taskId: string) => void;
  onSelectDate: (date: Date) => void;
  onViewAllTasks: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
  className: string;
}

interface DeleteConfirmationProps {
  task: Task;
  onSoftDelete: () => void;
  onPermanentDelete: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = ({ task, onSoftDelete, onPermanentDelete, onCancel }: DeleteConfirmationProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
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
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-900">#{task.serial_number} - {task.description}</p>
          {task.comment && (
            <p className="text-sm text-gray-600 mt-1">{task.comment}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onSoftDelete}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Soft Delete (Can be recovered)
        </button>
        
        <button
          onClick={onPermanentDelete}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Permanently Delete (Cannot be undone)
        </button>
        
        <button
          onClick={onCancel}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const CalendarView = ({
  tasks,
  onEditTask,
  onSoftDeleteTask,
  onPermanentDeleteTask,
  onSelectDate,
  onViewAllTasks
}: CalendarViewProps) => {
  const [deleteConfirmationTask, setDeleteConfirmationTask] = useState<Task | null>(null);

  // Ensure we load all tasks when calendar view is accessed
  useEffect(() => {
    onViewAllTasks();
  }, [onViewAllTasks]);

  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter(task => task.due_date)
      .map(task => {
        const date = parseISO(task.due_date!);
        return {
          id: task.id,
          title: `#${task.serial_number}: ${task.description}`,
          start: date,
          end: date,
          resource: task,
          className: `status-${task.status.toLowerCase().replace(' ', '-')}`
        };
      });
  }, [tasks]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#6b7280'; // gray for not started
    
    switch (task.status) {
      case TaskStatus.COMPLETED:
        backgroundColor = '#10b981'; // green
        break;
      case TaskStatus.IN_PROGRESS:
        backgroundColor = '#f59e0b'; // yellow
        break;
      default:
        backgroundColor = '#6b7280'; // gray
    }

    // Add opacity for deleted tasks
    const opacity = task.is_deleted ? 0.4 : 0.8;

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onEditTask(event.resource);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    onSelectDate(start);
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

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource;
    return (
      <div className="p-1 relative group">
        <div className="font-medium text-xs">#{task.serial_number}</div>
        <div className={`text-xs truncate ${task.is_deleted ? 'line-through' : ''}`}>
          {task.description}
        </div>
        <div className="text-xs opacity-75">{task.status}</div>
        
        {/* Delete button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(task);
          }}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
          title="Delete task"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        
        {task.is_deleted && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 rounded">
            DEL
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Calendar View</h2>
          <p className="text-gray-600 mt-1">Click on tasks to edit, hover to delete, or click dates to select</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded opacity-40"></div>
              <span>Deleted</span>
            </div>
          </div>

          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={Views.MONTH}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent
            }}
            popup
            showMultiDayTimes
            step={60}
            timeslots={1}
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>📅 {tasks.length} total tasks</p>
          <p>✅ {tasks.filter(t => t.status === TaskStatus.COMPLETED).length} completed</p>
          <p>⏳ {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length} in progress</p>
          <p>⭕ {tasks.filter(t => t.status === TaskStatus.NOT_STARTED).length} not started</p>
          <p>🗑️ {tasks.filter(t => t.is_deleted).length} deleted</p>
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

export default CalendarView; 