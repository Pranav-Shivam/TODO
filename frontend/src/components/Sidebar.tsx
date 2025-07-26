// React import not needed with new JSX transform
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, List, Plus, Eye, EyeOff, CalendarDays, X, Menu } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateTask: () => void;
  showDeletedTasks: boolean;
  onToggleDeletedTasks: (show: boolean) => void;
  dateFilterEnabled: boolean;
  onViewAllTasks: () => void;
}

const Sidebar = ({ 
  selectedDate, 
  onDateSelect, 
  onCreateTask, 
  showDeletedTasks, 
  onToggleDeletedTasks,
  dateFilterEnabled,
  onViewAllTasks
}: SidebarProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (isMobileMenuOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleTodayClick = () => {
    onDateSelect(new Date());
  };

  const isTodaySelected = isToday(selectedDate);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            📅 To-Do Calendar
          </h1>
        </div>

        {/* Create Task Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onCreateTask();
              setIsMobileMenuOpen(false);
            }}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>

        {/* Date Filter Status */}
        {dateFilterEnabled && (
          <div className="px-4 pb-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Filtered by Date
                  </span>
                </div>
                <button
                  onClick={() => {
                    onViewAllTasks();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="View all tasks"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Showing tasks for {format(selectedDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}

        {/* View Options */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              onToggleDeletedTasks(!showDeletedTasks);
              setIsMobileMenuOpen(false);
            }}
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
              {dateFilterEnabled && (
                <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Filtered
                </span>
              )}
            </Link>
            <Link
              to="/calendar"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/calendar')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                onViewAllTasks();
                setIsMobileMenuOpen(false);
              }}
            >
              <Calendar size={16} />
              Calendar View
              {!dateFilterEnabled && (
                <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  All
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Date Picker */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Selected Date
            </label>
            <button
              onClick={handleTodayClick}
              disabled={isTodaySelected}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isTodaySelected
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
              }`}
              title={isTodaySelected ? "Already viewing today" : "Go to today"}
            >
              <CalendarDays size={12} />
              Today
            </button>
          </div>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              onDateSelect(new Date(e.target.value));
              setIsMobileMenuOpen(false);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-2 text-xs text-gray-500">
            {format(selectedDate, 'EEEE, MMMM do, yyyy')}
            {isTodaySelected && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Today
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 