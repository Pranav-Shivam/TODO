// React import not needed with new JSX transform
import { Link, useLocation } from 'react-router-dom';
import { Calendar, List, Plus, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateTask: () => void;
  showDeletedTasks: boolean;
  onToggleDeletedTasks: (show: boolean) => void;
}

const Sidebar = ({ selectedDate, onDateSelect, onCreateTask, showDeletedTasks, onToggleDeletedTasks }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          📅 To-Do Calendar
        </h1>
      </div>

      {/* Create Task Button */}
      <div className="p-4">
        <button
          onClick={onCreateTask}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* View Options */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onToggleDeletedTasks(!showDeletedTasks)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showDeletedTasks 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {showDeletedTasks ? <EyeOff size={16} /> : <Eye size={16} />}
          {showDeletedTasks ? 'Hide Deleted' : 'Show Deleted'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          <Link
            to="/tasks"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/tasks')
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List size={16} />
            Task List
          </Link>
          <Link
            to="/calendar"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/calendar')
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar size={16} />
            Calendar View
          </Link>
        </div>
      </nav>

      {/* Date Picker */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-2">
          <label className="text-sm font-medium text-gray-700">
            Selected Date
          </label>
        </div>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => onDateSelect(new Date(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="mt-2 text-xs text-gray-500">
          {format(selectedDate, 'EEEE, MMMM do, yyyy')}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 