'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface TaskDetailsPanelProps {
  showTaskDetails: boolean;
  selectedTask: any;
  users: any[];
  onClose: () => void;
  onUpdateTask: () => void;
  onTaskChange: (field: string, value: any) => void;
  currentBrand?: any;
  projectId?: string;
}

export default function TaskDetailsPanel({
  showTaskDetails,
  selectedTask,
  users,
  onClose,
  onUpdateTask,
  onTaskChange,
  currentBrand,
  projectId
}: TaskDetailsPanelProps) {
  // Task editing states
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState('');
  const [editingTaskStatus, setEditingTaskStatus] = useState('');
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  
  // Date management
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingMode, setSelectingMode] = useState<'start' | 'due'>('due');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Assignee management
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<any>(null);
  const [brandUsers, setBrandUsers] = useState<any[]>([]);
  const [loadingBrandUsers, setLoadingBrandUsers] = useState(false);
  
  // Subtask management
  const [showSubtaskInput, setShowSubtaskInput] = useState<{ [key: string]: boolean }>({});
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [subtaskPriority, setSubtaskPriority] = useState('Low');
  const [subtaskStatus, setSubtaskStatus] = useState('Yet to Start');
  const [subtaskAssignee, setSubtaskAssignee] = useState('');
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [taskSubtasks, setTaskSubtasks] = useState<{ [key: string]: any[] }>({});
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [editingSubtaskPriority, setEditingSubtaskPriority] = useState('');
  const [editingSubtaskStatus, setEditingSubtaskStatus] = useState('');
  
  // Dependencies management
  const [showDependenciesDropdown, setShowDependenciesDropdown] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [availableDependencies, setAvailableDependencies] = useState<any[]>([]);
  
  // Comments management
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  
  // Field management
  const [activeField, setActiveField] = useState<string | null>(null);

  // Initialize editing states when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setEditingTaskName(selectedTask.task || '');
      setEditingTaskDescription(selectedTask.description || '');
      setEditingTaskPriority(selectedTask.priority || '');
      setEditingTaskStatus(selectedTask.status || '');
      
      // Set dates
      if (selectedTask.startDate) {
        setStartDate(new Date(selectedTask.startDate));
      } else {
        setStartDate(new Date());
      }
      
      if (selectedTask.eta || selectedTask.dueDate) {
        setDueDate(new Date(selectedTask.eta || selectedTask.dueDate));
      } else {
        setDueDate(null);
      }
      
      // Set dependencies
      setSelectedDependencies(selectedTask.dependencies || []);
      
      // Load subtasks
      if (selectedTask._id) {
        loadTaskSubtasks(selectedTask._id);
      }
      
      // Load brand users
      if (currentBrand?.id && brandUsers.length === 0) {
        loadBrandUsers();
      }
    }
  }, [selectedTask, currentBrand]);

  // Load brand users
  const loadBrandUsers = async () => {
    if (!currentBrand?.id) return;
    
    try {
      setLoadingBrandUsers(true);
      const response = await apiService.getBrandUsers(currentBrand.id);
      
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response.users)) {
        users = response.users;
      }
      
      setBrandUsers(users);
    } catch (error) {
      console.error('Error loading brand users:', error);
      setBrandUsers([]);
    } finally {
      setLoadingBrandUsers(false);
    }
  };

  // Load task subtasks
  const loadTaskSubtasks = async (taskId: string) => {
    try {
      const response = await apiService.getTaskSubtasks(currentBrand?.id, taskId);
      const subtasks = response.data || response || [];
      setTaskSubtasks(prev => ({
        ...prev,
        [taskId]: subtasks
      }));
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle assignee selection
  const handleAssigneeSelect = async (assignee: any, isEmail = false) => {
    if (!selectedTask || !currentBrand) return;
    
    try {
      setIsUpdatingTask(true);
      
      if (isEmail && isValidEmail(assignee)) {
        await apiService.assignBrandTask(currentBrand.id, selectedTask._id, assignee);
        setSelectedAssignee({ email: assignee, name: assignee, isEmail: true });
        setAssigneeSearch(assignee);
      } else if (assignee._id || assignee.id) {
        const assigneeId = assignee._id || assignee.id;
        await apiService.assignBrandTask(currentBrand.id, selectedTask._id, assigneeId);
        setSelectedAssignee(assignee);
        setAssigneeSearch(`${assignee.name} (${assignee.email})`);
      }
      
      setShowAssigneeDropdown(false);
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleUpdateTask = async (field: string, value: any) => {
    if (!selectedTask || !currentBrand) return;
    
    try {
      setIsUpdatingTask(true);
      
      let updateData: any = {};
      switch (field) {
        case 'task':
          updateData = { task: value };
          setEditingTaskName(value);
          break;
        case 'description':
          updateData = { description: value };
          setEditingTaskDescription(value);
          break;
        case 'priority':
          updateData = { priority: value };
          setEditingTaskPriority(value);
          break;
        case 'status':
          updateData = { status: value };
          setEditingTaskStatus(value);
          break;
        case 'eta':
          updateData = { eta: value };
          break;
        default:
          updateData = { [field]: value };
      }
      
      if (Object.keys(updateData).length > 0) {
        await apiService.updateBrandTask(currentBrand.id, selectedTask._id, updateData);
        onTaskChange(field, value);
        await onUpdateTask();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  // Date handling functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (selectingMode === 'start') {
      setStartDate(newDate);
      handleUpdateTask('startDate', newDate.toISOString());
    } else {
      setDueDate(newDate);
      handleUpdateTask('eta', newDate.toISOString());
    }
    
    setShowDatePicker(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const handleSaveDates = () => {
    if (startDate) {
      handleUpdateTask('startDate', startDate.toISOString());
    }
    if (dueDate) {
      handleUpdateTask('eta', dueDate.toISOString());
    }
    setShowDatePicker(false);
  };

  const handleClearDates = () => {
    setStartDate(null);
    setDueDate(null);
  };

  // Subtask handling
  const handleCreateSubtask = async () => {
    if (!newSubtaskName.trim() || !selectedTask || !currentBrand) return;
    
    try {
      setIsCreatingSubtask(true);
      
      const subtaskData = {
        task_id: selectedTask._id,
        title: newSubtaskName.trim(),
        description: '',
        assignedTo: subtaskAssignee || selectedTask.assignedTo?._id,
        reporter: selectedTask.reporter?._id || currentBrand.id,
        status: subtaskStatus,
        priority: subtaskPriority,
        startDate: new Date().toISOString(),
        dueDate: selectedTask.eta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        order: (taskSubtasks[selectedTask._id]?.length || 0) + 1
      };
      
      await apiService.createBrandSubtask(currentBrand.id, subtaskData);
      await loadTaskSubtasks(selectedTask._id);
      
      // Reset form
      setNewSubtaskName('');
      setSubtaskAssignee('');
      setSubtaskStatus('Yet to Start');
      setSubtaskPriority('Low');
      setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: false }));
    } catch (error) {
      console.error('Error creating subtask:', error);
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  const handleSubtaskComplete = async (subtaskId: string, isComplete: boolean) => {
    try {
      if (isComplete) {
        await apiService.completeSubtask(subtaskId);
      } else {
        await apiService.uncompleteSubtask(subtaskId);
      }
      if (selectedTask?._id) {
        await loadTaskSubtasks(selectedTask._id);
      }
    } catch (error) {
      console.error('Error updating subtask completion:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    
    try {
      setIsUpdatingSubtask(true);
      await apiService.deleteSubtask(subtaskId);
      if (selectedTask?._id) {
        await loadTaskSubtasks(selectedTask._id);
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    } finally {
      setIsUpdatingSubtask(false);
    }
  };

  // Comment handling
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask || !currentBrand) return;
    
    try {
      setIsAddingComment(true);
      
      const commentData = {
        task_id: selectedTask._id,
        content: newComment.trim(),
        author: currentBrand.id
      };
      
      await apiService.addTaskComment(currentBrand.id, selectedTask._id, commentData);
      setNewComment('');
      
      // Refresh comments
      const response = await apiService.getTaskComments(currentBrand.id, selectedTask._id);
      setTaskComments(response.data || response || []);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await apiService.deleteTaskComment(commentId);
      if (selectedTask?._id && currentBrand?.id) {
        const response = await apiService.getTaskComments(currentBrand.id, selectedTask._id);
        setTaskComments(response.data || response || []);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Progress calculation
  const getSubtaskProgress = (taskId: string) => {
    const subtasks = taskSubtasks[taskId] || [];
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.status === 'Completed').length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!showTaskDetails || !selectedTask) {
    return null;
  }

  return (
    <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col">
      {/* Task Details Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line w-5 h-5"></i>
          </button>
        </div>
      </div>

      {/* Task Details Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
          <input
            type="text"
            value={editingTaskName}
            onChange={(e) => setEditingTaskName(e.target.value)}
            onBlur={() => {
              if (editingTaskName !== selectedTask.task && editingTaskName.trim()) {
                handleUpdateTask('task', editingTaskName.trim());
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && editingTaskName.trim()) {
                handleUpdateTask('task', editingTaskName.trim());
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a task name"
            disabled={isUpdatingTask}
          />
        </div>

        {/* Projects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="text-sm text-gray-900">Project Name</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">To do</span>
            </div>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
          <input
            type="text"
            placeholder="Name or email"
            value={selectedTask.assignedTo?.name ? `${selectedTask.assignedTo.name} (${selectedTask.assignedTo.email})` : 'Unassigned'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isUpdatingTask}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <div className="relative">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-calendar-line text-blue-600 text-sm"></i>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="text-sm text-gray-600">
                    Start: {selectedTask.startDate ? new Date(selectedTask.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Due: {selectedTask.eta ? new Date(selectedTask.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
          <div className="space-y-3">
            {/* Priority Field */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="ri-check-line text-gray-400"></i>
                <span className="text-sm text-gray-700">Priority</span>
              </div>
              <div className="relative">
                <select
                  value={editingTaskPriority}
                  onChange={(e) => {
                    setEditingTaskPriority(e.target.value);
                    handleUpdateTask('priority', e.target.value);
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${getPriorityColor(editingTaskPriority)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isUpdatingTask}
                >
                  <option value="">—</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Status Field */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="ri-check-line text-gray-400"></i>
                <span className="text-sm text-gray-700">Status</span>
              </div>
              <div className="relative">
                <select
                  value={editingTaskStatus}
                  onChange={(e) => {
                    setEditingTaskStatus(e.target.value);
                    handleUpdateTask('status', e.target.value);
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(editingTaskStatus)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1`}
                  disabled={isUpdatingTask}
                >
                  <option value="Yet to Start">Yet to Start</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <div className="border border-gray-300 rounded-md">
            <textarea
              value={editingTaskDescription}
              onChange={(e) => setEditingTaskDescription(e.target.value)}
              onBlur={() => {
                if (editingTaskDescription !== selectedTask?.description && editingTaskDescription.trim()) {
                  handleUpdateTask('description', editingTaskDescription.trim());
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && editingTaskDescription.trim()) {
                  handleUpdateTask('description', editingTaskDescription.trim());
                }
              }}
              className="w-full px-3 py-2 focus:outline-none resize-none h-24"
              placeholder="Add a description for this task..."
              disabled={isUpdatingTask}
            />
            
            {/* Save Indicator */}
            {isUpdatingTask && (
              <div className="px-3 py-1 text-xs text-blue-600 bg-blue-50 border-t border-gray-200">
                <i className="ri-loader-4-line animate-spin mr-1"></i>
                Saving description...
              </div>
            )}
            
            {/* Rich Text Editor Toolbar */}
            <div className="flex items-center space-x-1 px-3 py-2 border-t border-gray-200 bg-gray-50">
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Bold">
                <i className="ri-bold text-sm"></i>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Italic">
                <i className="ri-italic text-sm"></i>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Underline">
                <i className="ri-underline text-sm"></i>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Strikethrough">
                <i className="ri-strikethrough text-sm"></i>
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Bullet List">
                <i className="ri-list-unordered text-sm"></i>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Numbered List">
                <i className="ri-list-ordered text-sm"></i>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Link">
                <i className="ri-links-line text-sm"></i>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="Code">
                <i className="ri-code-line text-sm"></i>
              </button>
              <div className="flex-1"></div>
              <button className="p-1 text-gray-400 hover:text-gray-600" title="More formatting">
                <i className="ri-magic-line text-sm"></i>
              </button>
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Add description
              </button>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Dependencies</label>
            <button className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
              <i className="ri-add-line mr-1"></i>
              Add dependency
            </button>
          </div>
          <div className="text-center py-4 text-gray-500 text-sm">
            <i className="ri-links-line text-lg mb-1"></i>
            <div>No dependencies set</div>
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Subtasks (0)</label>
            <button className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
              <i className="ri-add-line mr-1"></i>
              Add subtask
            </button>
          </div>
          <div className="text-center py-4 text-gray-500 text-sm">
            No subtasks yet
          </div>
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <span className="text-sm text-gray-500">0 comments</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                SM
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Write a comment..."
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">Press Ctrl+Enter to save</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collaborators */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Collaborators</label>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              S
            </div>
            <button className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:border-gray-400">
              <i className="ri-add-line"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Task Details Footer */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Leave task
        </button>
      </div>
    </div>
  );
}
