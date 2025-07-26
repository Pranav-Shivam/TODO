import { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '../types/task';
import { validateTimeRange, getPriorityIcon, getPriorityLabel } from '../utils/taskUtils';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: TaskCreate | TaskUpdate) => void;
  onCancel: () => void;
  defaultDate?: string;
}

const TaskForm = ({
  task,
  onSubmit,
  onCancel,
  defaultDate
}: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskCreate>({
    description: '',
    comment: '',
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.MEDIUM,
    due_date: defaultDate || '',
    start_time: '',
    end_time: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (task) {
      console.log('TaskForm: Loading task data for editing:', task);
      setFormData({
        description: task.description,
        comment: task.comment || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        start_time: task.start_time || '',
        end_time: task.end_time || ''
      });
    }
  }, [task]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.start_time && formData.end_time) {
      if (!validateTimeRange(formData.start_time, formData.end_time)) {
        newErrors.timeRange = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: TaskCreate | TaskUpdate = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      comment: formData.comment || undefined,
      start_time: formData.start_time || undefined,
      end_time: formData.end_time || undefined
    };

    console.log('Form data before submission:', formData);
    console.log('Submit data:', submitData);
    console.log('Is editing task:', !!task);

    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  return (
    <div className="p-4 lg:p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h2 className="text-lg lg:text-xl font-semibold text-foreground">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Task Description *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-background text-foreground ${
              errors.description ? 'border-red-500' : 'border-border'
            }`}
            placeholder="Enter task description..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.description}
            </p>
          )}
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW].map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handlePriorityChange(priority)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.priority === priority
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-border hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{getPriorityIcon(priority)}</div>
                    <div className="text-xs font-medium text-foreground">
                      {getPriorityLabel(priority)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-background text-foreground"
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-foreground mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-background text-foreground"
            />
          </div>

          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Clock size={14} />
              Start Time
            </label>
            <input
              type="time"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-background text-foreground"
            />
          </div>

          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Clock size={14} />
              End Time
            </label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-background text-foreground"
            />
          </div>
        </div>

        {errors.timeRange && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.timeRange}
          </div>
        )}

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base resize-none bg-background text-foreground"
            placeholder="Optional comment..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse lg:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full lg:w-auto px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors text-sm lg:text-base font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.description.trim()}
            className="w-full lg:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 