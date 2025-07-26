import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, TaskCreate, TaskStatus } from '../types/task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: TaskCreate) => void;
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
    due_date: defaultDate || ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        description: task.description,
        comment: task.comment || '',
        status: task.status,
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: TaskCreate = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined
    };

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
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
            placeholder="Enter task description..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-white"
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base resize-none"
            placeholder="Optional comment..."
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full lg:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base font-medium"
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