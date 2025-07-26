// React import not needed with new JSX transform
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, List, Plus, Eye, EyeOff, CalendarDays, X, Menu, Moon, Sun, Filter } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateTask: () => void;
  showDeletedTasks: boolean;
  onToggleDeletedTasks: (show: boolean) => void;
  dateFilterEnabled: boolean;
  onViewAllTasks: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  hasActiveFilters: boolean;
}

const Sidebar = ({ 
  selectedDate, 
  onDateSelect, 
  onCreateTask, 
  showDeletedTasks, 
  onToggleDeletedTasks,
  dateFilterEnabled,
  onViewAllTasks,
  darkMode,
  onToggleDarkMode,
  hasActiveFilters
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
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-background border border-border shadow-md hover:bg-accent transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-background border-r border-border 
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">
              📅 To-Do Calendar
            </h1>
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
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
        {dateFilterEnabled && !hasActiveFilters && (
          <div className="px-4 pb-2">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Today's Tasks
                  </span>
                </div>
                <button
                  onClick={() => {
                    onViewAllTasks();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  title="View all tasks"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Showing tasks for {format(selectedDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
        
        {/* Active Filters Status */}
        {hasActiveFilters && (
          <div className="px-4 pb-2">
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Filters Applied
                  </span>
                </div>
                <button
                  onClick={() => {
                    // This will be handled by the clear filters button in the main view
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Showing filtered results
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
                ? 'bg-muted text-muted-foreground hover:bg-accent' 
                : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900'
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
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <List size={16} />
              Task List
              {dateFilterEnabled && !hasActiveFilters && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
              {hasActiveFilters && (
                <span className="ml-auto bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-0.5 rounded-full">
                  Filtered
                </span>
              )}
            </Link>
            <Link
              to="/calendar"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/calendar')
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-foreground hover:bg-accent'
              }`}
              onClick={() => {
                onViewAllTasks();
                setIsMobileMenuOpen(false);
              }}
            >
              <Calendar size={16} />
              Calendar View
              {!dateFilterEnabled && (
                <span className="ml-auto bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full">
                  All
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Date Picker */}
        <div className="p-4 border-t border-border">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Selected Date
            </label>
            <button
              onClick={handleTodayClick}
              disabled={isTodaySelected}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isTodaySelected
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900'
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground transition-colors hover:border-blue-300 dark:hover:border-blue-600"
          />
          <div className="mt-2 text-xs text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM do, yyyy')}
            {isTodaySelected && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
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