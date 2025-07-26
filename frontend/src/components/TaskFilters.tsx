import { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { TaskStatus, TaskPriority, TaskFilters as TaskFiltersType } from '../types/task';
import { getPriorityIcon, getPriorityLabel } from '../utils/taskUtils';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  onClearFilters: () => void;
}

const TaskFilters = ({ filters, onFiltersChange, onClearFilters }: TaskFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== false && value !== ''
    );
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== false && value !== ''
    ).length;
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {hasActiveFilters() && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X size={14} />
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-background text-foreground"
            >
              <option value="">All Statuses</option>
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-background text-foreground"
            >
              <option value="">All Priorities</option>
              {[TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW].map(priority => (
                <option key={priority} value={priority}>
                  {getPriorityIcon(priority)} {getPriorityLabel(priority)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Calendar size={14} />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Calendar size={14} />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-background text-foreground"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('todayOnly', !filters.todayOnly)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.todayOnly
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Today Only
              </button>
              <button
                onClick={() => handleFilterChange('highPriorityOnly', !filters.highPriorityOnly)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.highPriorityOnly
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                🔴 High Priority Only
              </button>
              <button
                onClick={() => handleFilterChange('includeDeleted', !filters.includeDeleted)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.includeDeleted
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Include Deleted
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="pt-3 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    Status: {filters.status}
                  </span>
                )}
                {filters.priority && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                    Priority: {getPriorityIcon(filters.priority)} {getPriorityLabel(filters.priority)}
                  </span>
                )}
                {filters.startDate && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    From: {filters.startDate}
                  </span>
                )}
                {filters.endDate && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    To: {filters.endDate}
                  </span>
                )}
                {filters.todayOnly && (
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                    Today Only
                  </span>
                )}
                {filters.highPriorityOnly && (
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                    High Priority Only
                  </span>
                )}
                {filters.includeDeleted && (
                  <span className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                    Include Deleted
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters; 