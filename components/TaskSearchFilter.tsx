'use client';

import React, { useState } from 'react';
import { useTasks } from './TaskContext';
import { useBrand } from './BrandContext';
import { TaskFilters } from '../lib/types';

interface TaskSearchFilterProps {
  projectId?: string;
  onTasksChange?: (tasks: any[]) => void;
}

const TaskSearchFilter: React.FC<TaskSearchFilterProps> = ({ projectId, onTasksChange }) => {
  const { searchTasks, filterTasks, tasks } = useTasks();
  const { currentBrand } = useBrand();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    status: '',
    priority: '',
    assignedTo: '',
    projectId: projectId
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!currentBrand || !searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchTasks(currentBrand.id, searchQuery.trim());
      if (onTasksChange) {
        onTasksChange(result.tasks);
      }
    } catch (error) {
      console.error('Error searching tasks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilter = async () => {
    if (!currentBrand) return;
    
    setIsSearching(true);
    try {
      const result = await filterTasks(currentBrand.id, filters);
      if (onTasksChange) {
        onTasksChange(result.tasks);
      }
    } catch (error) {
      console.error('Error filtering tasks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      priority: '',
      assignedTo: '',
      projectId: projectId
    });
    if (onTasksChange) {
      onTasksChange([]);
    }
  };

  if (!currentBrand) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {isSearching ? (
                <i className="ri-loader-4-line animate-spin text-sm"></i>
              ) : (
                <i className="ri-search-line text-sm"></i>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Yet to Start">Yet to Start</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={handleFilter}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <i className="ri-filter-line text-sm"></i>
            <span>Filter</span>
          </button>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <i className="ri-close-line text-sm"></i>
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filters.status || filters.priority || filters.assignedTo) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Status: {filters.status}
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Priority: {filters.priority}
              <button
                onClick={() => setFilters(prev => ({ ...prev, priority: '' }))}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSearchFilter;
