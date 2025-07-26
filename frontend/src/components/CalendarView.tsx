import { useMemo, useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimatePresence } from 'framer-motion';
import { 
  getPriorityIcon, 
  getPriorityLabel, 
  formatTimeRange,
  getTaskColor,
  getShortTitle,
  sortTasksByPriority 
} from '../utils/taskUtils';
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

const CalendarView = ({
  tasks,
  onEditTask,
  onSoftDeleteTask,
  onPermanentDeleteTask,
  onSelectDate,
  onViewAllTasks
}: CalendarViewProps) => {
  const [deleteConfirmationTask, setDeleteConfirmationTask] = useState<Task | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Ensure we load all tasks when calendar view is accessed
  useEffect(() => {
    onViewAllTasks();
  }, [onViewAllTasks]);

  // Create events for calendar
  const events = useMemo(() => {
    const eventMap = new Map<string, any[]>();
    
    tasks.forEach(task => {
      if (task.is_deleted || !task.due_date) return;
      
      const dateKey = format(new Date(task.due_date), 'yyyy-MM-dd');
      if (!eventMap.has(dateKey)) {
        eventMap.set(dateKey, []);
      }
      eventMap.get(dateKey)!.push(task);
    });

    const calendarEvents: any[] = [];
    
    eventMap.forEach((dayTasks, dateKey) => {
      const date = new Date(dateKey);
      
      // Sort tasks by priority for better visual hierarchy
      const sortedTasks = sortTasksByPriority(dayTasks);
      
      // Always create a grouped event, even for single tasks
      // This ensures consistent behavior and proper overflow handling
      calendarEvents.push({
        id: `day-${dateKey}`,
        title: `${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}`,
        start: date,
        end: date,
        task: sortedTasks[0], // First task for color reference
        allDay: true,
        isGroup: true,
        allTasks: sortedTasks
      });
    });
    
    return calendarEvents;
  }, [tasks]);

  const eventStyleGetter = (event: any) => {
    const task = event.task;
    if (!task) return {};
    
    // For grouped events, we want minimal styling since CustomEvent handles the appearance
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '0',
        margin: '0',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: any) => {
    console.log('CalendarView handleSelectEvent - event:', event);
    console.log('CalendarView handleSelectEvent - event.task:', event.task);
    console.log('CalendarView handleSelectEvent - event.allTasks:', event.allTasks);
    
    // For grouped events, we should probably show a selection dialog
    // For now, let's edit the first task in the group
    if (event.task) {
      onEditTask(event.task);
    } else if (event.allTasks && event.allTasks.length > 0) {
      onEditTask(event.allTasks[0]);
    } else {
      console.error('No task found in calendar event:', event);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    onSelectDate(start);
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

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const CustomEvent = ({ event }: { event: any }) => {
    const task = event.task;
    if (!task) return null;

    if (event.isGroup && event.allTasks) {
      // Grouped tasks - show compact pills with priority indicators
      const maxVisibleTasks = 3; // Show max 3 tasks before "+X more"
      const visibleTasks = event.allTasks.slice(0, maxVisibleTasks);
      const hiddenCount = event.allTasks.length - maxVisibleTasks;

      return (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="w-full h-full p-1 space-y-1 overflow-hidden">
                {/* Visible tasks as compact pills with priority icons */}
                {visibleTasks.map((t: Task, index: number) => (
                  <div
                    key={t.id}
                    className={`${getTaskColor(t)} rounded px-2 py-1 text-white text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity`}
                    title={`${index + 1}. ${t.description} - ${t.status} - ${getPriorityLabel(t.priority)}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold bg-white bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs mr-1">{getPriorityIcon(t.priority)}</span>
                      <span className="truncate flex-1">{getShortTitle(t.description)}</span>
                      {(t.start_time || t.end_time) && (
                        <Clock className="w-3 h-3 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
                
                {/* "+X more" indicator */}
                {hiddenCount > 0 && (
                  <div className="bg-gray-600 rounded px-2 py-1 text-white text-xs font-medium cursor-pointer hover:bg-gray-500 transition-colors">
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm z-50 max-w-xs"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <div className="font-medium text-gray-300 border-b border-gray-700 pb-1">
                    {format(new Date(event.start), 'MMM dd, yyyy')}
                  </div>
                  {event.allTasks.map((t: Task, index: number) => (
                    <div key={t.id} className="border-b border-gray-700 pb-1 last:border-b-0">
                      <div className="font-medium">
                        <span className="text-gray-400 mr-2">{index + 1}.</span>
                        {t.description}
                      </div>
                      <div className="text-xs text-gray-300 ml-4 flex items-center gap-2">
                        <span>{t.status}</span>
                        <span>{getPriorityIcon(t.priority)} {getPriorityLabel(t.priority)}</span>
                        {(t.start_time || t.end_time) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRange(t.start_time, t.end_time)}
                          </span>
                        )}
                      </div>
                      {t.comment && (
                        <div className="text-xs text-gray-400 mt-1 ml-4">{t.comment}</div>
                      )}
                    </div>
                  ))}
                </div>
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }

    // Single task - compact pill format with priority icon
    return (
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className={`w-full h-full p-1 ${getTaskColor(task)} rounded text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold bg-white bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <span className="text-xs mr-1">{getPriorityIcon(task.priority)}</span>
                <span className="truncate flex-1">{getShortTitle(task.description)}</span>
                {(task.start_time || task.end_time) && (
                  <Clock className="w-3 h-3 flex-shrink-0" />
                )}
              </div>
            </div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm z-50 max-w-xs"
              sideOffset={5}
            >
              <div className="space-y-1">
                <div className="font-medium">
                  <span className="text-gray-400 mr-2">1.</span>
                  {task.description}
                </div>
                {task.comment && (
                  <div className="text-gray-300 text-xs ml-4">{task.comment}</div>
                )}
                <div className="text-xs text-gray-300 ml-4 flex items-center gap-2">
                  <span>Status: {task.status}</span>
                  <span>{getPriorityIcon(task.priority)} {getPriorityLabel(task.priority)}</span>
                </div>
                <div className="text-xs text-gray-300 ml-4">Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</div>
                {(task.start_time || task.end_time) && (
                  <div className="text-xs text-gray-300 ml-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeRange(task.start_time, task.end_time)}
                  </div>
                )}
              </div>
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="btn-secondary p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToCurrent}
            className="btn-secondary"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="btn-secondary p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-foreground ml-4">
            {toolbar.label}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChange(Views.MONTH)}
            className={`btn-secondary ${view === Views.MONTH ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : ''}`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange(Views.WEEK)}
            className={`btn-secondary ${view === Views.WEEK ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : ''}`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange(Views.DAY)}
            className={`btn-secondary ${view === Views.DAY ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : ''}`}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="flex-shrink-0 p-4 lg:p-6 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-foreground">Calendar View</h2>
          </div>
          <p className="text-muted-foreground">Click on tasks to edit, hover to delete, or click dates to select</p>
        </div>

        {/* Calendar Section */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 lg:px-6">
          <div className="card flex-1 flex flex-col overflow-hidden">
            <div className="card-body flex-1 flex flex-col overflow-hidden p-4">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-foreground font-medium">Not Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span className="text-foreground font-medium">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span className="text-foreground font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔴</span>
                  <span className="text-foreground font-medium">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟡</span>
                  <span className="text-foreground font-medium">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟢</span>
                  <span className="text-foreground font-medium">Low Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">Has Time Range</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  views={[Views.MONTH, Views.WEEK, Views.DAY]}
                  view={view}
                  onView={handleViewChange}
                  date={date}
                  onNavigate={setDate}
                  eventPropGetter={eventStyleGetter}
                  components={{
                    event: CustomEvent,
                    toolbar: CustomToolbar
                  }}
                  popup
                  showMultiDayTimes
                  step={60}
                  timeslots={1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex-shrink-0 p-4 lg:p-6 pt-2">
          <div className="hidden md:flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{tasks.length}</span>
              <span className="text-sm text-muted-foreground font-medium">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {tasks.filter(t => t.status === TaskStatus.NOT_STARTED).length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tasks.filter(t => t.priority === TaskPriority.HIGH).length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tasks.filter(t => t.is_deleted).length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">Deleted</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {deleteConfirmationTask && (
          <DeleteConfirmation
            task={deleteConfirmationTask}
            onSoftDelete={handleSoftDelete}
            onPermanentDelete={handlePermanentDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarView; 