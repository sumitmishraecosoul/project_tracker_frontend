'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../lib/api-service';
import DynamicCommentsSection from './DynamicCommentsSection';
import TaskLinksSection from './TaskLinksSection';
import { useProjects } from './ProjectContext';

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
  const { currentProject } = useProjects();
  
  // Task editing states
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [editingTaskAssignee, setEditingTaskAssignee] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState('');
  const [editingTaskStatus, setEditingTaskStatus] = useState('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState('');
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  
  // Date management
  const [startDate, setStartDate] = useState<Date | null>(new Date());
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
  
  
  // Field management
  const [activeField, setActiveField] = useState<string | null>(null);
  const [taskPriority, setTaskPriority] = useState<string>('Low');
  const [taskStatus, setTaskStatus] = useState<string>('On track');
  
  // Subtask management
  const [showSubtaskInput, setShowSubtaskInput] = useState<{ [taskId: string]: boolean }>({});
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [currentTaskForSubtask, setCurrentTaskForSubtask] = useState<string | null>(null);
  const [taskSubtasks, setTaskSubtasks] = useState<{ [taskId: string]: any[] }>({});
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<any>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [editingSubtaskPriority, setEditingSubtaskPriority] = useState('');
  const [editingSubtaskStatus, setEditingSubtaskStatus] = useState('');
  const [editingSubtaskAssignee, setEditingSubtaskAssignee] = useState('');
  const [subtaskPriority, setSubtaskPriority] = useState('Low');
  const [subtaskStatus, setSubtaskStatus] = useState('Yet to Start');
  const [subtaskAssignee, setSubtaskAssignee] = useState('');
  
  // Dependencies management
  const [showDependenciesDropdown, setShowDependenciesDropdown] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [availableDependencies, setAvailableDependencies] = useState<any[]>([]);
  
  // Comments management
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  
  // Track if we're updating status locally to prevent overwriting from parent
  const isLocalStatusUpdate = useRef(false);
  const pendingStatusUpdate = useRef<string | null>(null);
  
  // Project information
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [projectInfoLoading, setProjectInfoLoading] = useState(false);
  
  // Update projectInfo when currentProject changes
  useEffect(() => {
    console.log('🟣 currentProject useEffect triggered:', { 
      currentProject: !!currentProject, 
      projectInfo: !!projectInfo,
      currentProjectTitle: currentProject?.title,
      currentProjectStatus: currentProject?.status
    });
    
    if (currentProject && !projectInfo) {
      console.log('🟣 Setting projectInfo from currentProject:', currentProject);
      setProjectInfo(currentProject);
    }
  }, [currentProject, projectInfo]);

  // Initialize editing states when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      console.log('🔵 MAIN EFFECT RUNNING');
      console.log('🔵 isLocalStatusUpdate.current:', isLocalStatusUpdate.current);
      console.log('🔵 selectedTask.status:', selectedTask.status);
      console.log('🔵 Current editingTaskStatus:', editingTaskStatus);
      
      setEditingTask(selectedTask);
      setEditingTaskName(selectedTask.task || '');
      setEditingTaskDescription(selectedTask.description || '');
      setEditingTaskPriority(selectedTask.priority || '');
      
      // Only update status if not doing a local update AND if it's actually different
      if (!isLocalStatusUpdate.current && !pendingStatusUpdate.current) {
        console.log('🔵 RESETTING STATUS to:', selectedTask.status);
        setEditingTaskStatus(selectedTask.status || '');
      } else {
        console.log('🔵 SKIPPING status reset (flag or pending status set)');
      }
      
      setEditingTaskAssignee(selectedTask.assignedTo?.id || selectedTask.assignedTo || '');
      
      // Set assignee display
      console.log('Initializing assignee for task:', { 
        assignedTo: selectedTask.assignedTo, 
        type: typeof selectedTask.assignedTo,
        hasName: selectedTask.assignedTo?.name,
        hasEmail: selectedTask.assignedTo?.email
      });
      
      if (selectedTask.assignedTo) {
        if (typeof selectedTask.assignedTo === 'string') {
          // If assignedTo is just an email string
          setSelectedAssignee({ email: selectedTask.assignedTo, name: selectedTask.assignedTo, isEmail: true });
          setAssigneeSearch(selectedTask.assignedTo);
        } else if (selectedTask.assignedTo.name && selectedTask.assignedTo.email) {
          // If assignedTo is a user object
          setSelectedAssignee(selectedTask.assignedTo);
          setAssigneeSearch(`${selectedTask.assignedTo.name} (${selectedTask.assignedTo.email})`);
        } else {
          // Fallback
          setSelectedAssignee(null);
          setAssigneeSearch('');
        }
      } else {
        setSelectedAssignee(null);
        setAssigneeSearch('');
      }
      
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
      
      // Load available dependencies (other tasks in the project)
      if (currentBrand?.id && projectId) {
        loadAvailableDependencies();
      }
      
      // Load project information
      const taskProjectId = selectedTask.projectId || projectId;
      console.log('🟣 Project ID resolution:', {
        selectedTaskProjectId: selectedTask.projectId,
        propProjectId: projectId,
        resolvedProjectId: taskProjectId,
        currentBrandId: currentBrand?.id,
        currentProject: !!currentProject
      });
      
      if (taskProjectId) {
        console.log('🟣 Loading project info for task:', taskProjectId);
        loadProjectInfo(taskProjectId);
      } else {
        console.log('🟣 No project ID available for task');
        // Use currentProject as fallback
        if (currentProject) {
          console.log('🟣 Using currentProject as fallback:', currentProject);
          setProjectInfo(currentProject);
        } else {
          console.log('🟣 No currentProject available either');
        }
      }
      
      // Set assignee search
      if (selectedTask.assignedTo?.name) {
        setAssigneeSearch(`${selectedTask.assignedTo.name} (${selectedTask.assignedTo.email})`);
      } else {
        setAssigneeSearch('');
      }
    }
  }, [selectedTask, selectedTask?._lastUpdated, currentBrand]);

  // Watch for status changes from parent - only update if not from local update
  useEffect(() => {
    if (selectedTask && selectedTask.status) {
      // If this is a local update in progress, don't override
      if (isLocalStatusUpdate.current) {
        return; // Don't reset the flag here - let the timeout handle it
      }
      
      // If pendingStatusUpdate matches selectedTask.status, we can clear it now
      if (pendingStatusUpdate.current && pendingStatusUpdate.current === selectedTask.status) {
        console.log('🟢 Clearing pendingStatusUpdate - selectedTask now has correct status');
        pendingStatusUpdate.current = null;
      }
      
      // Update from parent if status is different
      if (selectedTask.status !== editingTaskStatus) {
        setEditingTaskStatus(selectedTask.status);
      }
    }
  }, [selectedTask?._lastUpdated, selectedTask?.status]);

  // Listen for taskUpdated events to refresh the task details
  useEffect(() => {
    const handleTaskUpdated = (event: any) => {
      console.log('TaskDetailsPanel: Received taskUpdated event', event.detail);
      if (event.detail && event.detail.taskId === selectedTask?._id) {
        console.log('TaskDetailsPanel: Updating task details for current task');
        // Force a re-render by updating the editing states
        if (selectedTask) {
          setEditingTask(selectedTask);
          setEditingTaskName(selectedTask.task || '');
          setEditingTaskDescription(selectedTask.description || '');
          setEditingTaskPriority(selectedTask.priority || '');
          setEditingTaskStatus(selectedTask.status || '');
          setEditingTaskAssignee(selectedTask.assignedTo?.id || selectedTask.assignedTo || '');
        }
      }
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    return () => window.removeEventListener('taskUpdated', handleTaskUpdated);
  }, [selectedTask]);

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
    
    console.log('handleAssigneeSelect called:', { assignee, isEmail, taskId: selectedTask._id, brandId: currentBrand.id });
    
    try {
      setIsUpdatingTask(true);
      
      if (assignee === null) {
        // Clear assignee
        await apiService.assignBrandTask(currentBrand.id, selectedTask._id, '');
        setSelectedAssignee(null);
        setAssigneeSearch('');
        
        // Update the task in the parent component
        onTaskChange('assignedTo', null);
      } else if (isEmail && isValidEmail(assignee)) {
        await apiService.assignBrandTask(currentBrand.id, selectedTask._id, assignee);
        setSelectedAssignee({ email: assignee, name: assignee, isEmail: true });
        setAssigneeSearch(assignee);
        
        // Update the task in the parent component
        onTaskChange('assignedTo', { email: assignee, name: assignee, isEmail: true });
      } else if (assignee._id || assignee.id) {
        const assigneeId = assignee._id || assignee.id;
        await apiService.assignBrandTask(currentBrand.id, selectedTask._id, assigneeId);
        setSelectedAssignee(assignee);
        setAssigneeSearch(`${assignee.name} (${assignee.email})`);
        
        // Update the task in the parent component
        onTaskChange('assignedTo', assignee);
      }
      
      setShowAssigneeDropdown(false);
      
      // Trigger parent component refresh
      onUpdateTask();
      
      // Dispatch custom event for global refresh
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setIsUpdatingTask(false);
    }
  };


  const handleUpdateTask = async (field: string, value: any) => {
    if (!editingTask || !currentBrand || isUpdatingTask) return;
    
    console.log('handleUpdateTask called:', { field, value, taskId: editingTask._id, brandId: currentBrand.id });
    
    setIsUpdatingTask(true);
    try {
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
          // Use the specific status update API instead of the general task update
          console.log('Status update:', { field, value, taskId: editingTask._id, brandId: currentBrand.id });
          try {
            // Mark that we're doing a local status update
            isLocalStatusUpdate.current = true;
            
            const response = await apiService.updateBrandTaskStatus(currentBrand.id, editingTask._id, value as any);
            console.log('Status update API response:', response);
            
            // Update both the editing status and the main editing task immediately
            setEditingTaskStatus(value);
            setEditingTask((prev: any) => ({ ...prev, status: value }));
            
            // Update the selectedTask in parent component immediately
            onTaskChange(field, value);
            
            // Reset the flag after delay, but keep pending status until selectedTask updates
            setTimeout(() => {
              isLocalStatusUpdate.current = false;
              // Don't clear pendingStatusUpdate yet - let it stay until selectedTask.status matches
            }, 500);
            
            console.log('Status updated successfully via updateBrandTaskStatus');
          } catch (error) {
            console.error('Status update failed:', error);
            isLocalStatusUpdate.current = false; // Reset flag on error
            pendingStatusUpdate.current = null; // Clear pending value on error
            throw error;
          }
          break;
        case 'assignedTo':
          updateData = { assignedTo: value };
          setEditingTaskAssignee(value);
          break;
        case 'eta':
          updateData = { eta: value };
          setEditingTaskDueDate(value);
          break;
        case 'startDate':
          updateData = { startDate: value };
          break;
        case 'dependencies':
          // Try dedicated endpoint first, fallback to generic if it fails
          console.log('Dependencies update:', { taskId: editingTask._id, brandId: currentBrand.id, dependencies: value });
          try {
            // First try the dedicated dependencies endpoint
            const response = await apiService.updateTaskDependencies(currentBrand.id, editingTask._id, value);
            console.log('Dependencies update API response:', response);
            
            // Update local state
            setSelectedDependencies(value);
            setEditingTask((prev: any) => ({ ...prev, dependencies: value }));
            
            // Update parent
            onTaskChange(field, value);
            
            console.log('Dependencies updated successfully via updateTaskDependencies');
          } catch (error) {
            console.log('Dedicated dependencies endpoint failed, trying generic task update:', error);
            try {
              // Fallback to generic task update
              const response = await apiService.updateBrandTask(currentBrand.id, editingTask._id, { dependencies: value });
              console.log('Generic task update with dependencies response:', response);
              
              // Update local state
              setSelectedDependencies(value);
              setEditingTask((prev: any) => ({ ...prev, dependencies: value }));
              
              // Update parent
              onTaskChange(field, value);
              
              console.log('Dependencies updated successfully via generic task update');
            } catch (fallbackError) {
              console.error('Both dependencies endpoints failed:', fallbackError);
              throw fallbackError;
            }
          }
          return; // Return early to skip the generic update logic
        default:
          updateData = { [field]: value };
      }
      
      // Handle status updates separately
      if (field === 'status') {
        // Status update is handled above, just trigger the refresh
        console.log('Status update completed, triggering refresh');
        onTaskChange(field, value);
        
        setTimeout(async () => {
          console.log('TaskDetailsPanel: Calling onUpdateTask after status update');
          await onUpdateTask();
          
          // Trigger a window event to force refresh
          window.dispatchEvent(new CustomEvent('taskUpdated', { 
            detail: { taskId: editingTask._id, field, value } 
          }));
          
          console.log('TaskDetailsPanel: Status update completed');
        }, 200);
      } else {
        // Handle other field updates normally
        console.log('Updating task with data:', { 
          brandId: currentBrand.id, 
          taskId: editingTask._id, 
          updateData,
          field,
          value
        });
        
        const response = await apiService.updateBrandTask(currentBrand.id, editingTask._id, updateData);
        
        console.log('API Response:', response);
        console.log('API Response success:', response?.success);
        console.log('API Response data:', response?.data);
        
        if (response.success || response) {
          // Use the response data if available, otherwise use the updateData
          const responseData = response.data || response;
          const updatedTask = { ...editingTask, ...updateData, ...responseData };
          setEditingTask(updatedTask);
          
          console.log('TaskDetailsPanel: Local state updated with response data:', updatedTask);
          
          // Call parent update to refresh the main task list
          onTaskChange(field, value);
          
          // Wait a bit before calling onUpdateTask to ensure the backend has processed
          setTimeout(async () => {
            console.log('TaskDetailsPanel: Calling onUpdateTask after delay');
            await onUpdateTask();
            
            // Trigger a window event to force refresh
            window.dispatchEvent(new CustomEvent('taskUpdated', { 
              detail: { taskId: editingTask._id, field, value, updatedTask } 
            }));
            
            console.log('TaskDetailsPanel: All updates completed');
          }, 200);
          
          console.log('Task updated successfully:', field, value);
        } else {
          console.error('API update failed:', response);
          throw new Error(response.message || 'Failed to update task');
        }
      }
      
    } catch (error) {
      console.error('Error updating task:', error);
      alert(`Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    if (!newSubtaskName.trim() || !currentTaskForSubtask || !currentBrand) return;
    
    try {
      setIsCreatingSubtask(true);
      
      const subtaskData = {
        task_id: currentTaskForSubtask,
        title: newSubtaskName.trim(),
        description: '',
        assignedTo: subtaskAssignee || selectedTask.assignedTo?._id,
        reporter: selectedTask.reporter?._id || currentBrand.id,
        status: subtaskStatus,
        priority: subtaskPriority,
        startDate: new Date().toISOString(),
        dueDate: selectedTask.eta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        order: (taskSubtasks[currentTaskForSubtask]?.length || 0) + 1
      };
      
      await apiService.createBrandSubtask(currentBrand.id, subtaskData);
      await loadTaskSubtasks(currentTaskForSubtask);
      
      // Reset form
      setNewSubtaskName('');
      setSubtaskAssignee('');
      setSubtaskStatus('Yet to Start');
      setSubtaskPriority('Low');
      setShowSubtaskInput(prev => ({ ...prev, [currentTaskForSubtask]: false }));
    } catch (error) {
      console.error('Error creating subtask:', error);
      alert(`Error creating subtask: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      await apiService.deleteBrandSubtask(currentBrand.id, subtaskId);
      if (selectedTask?._id) {
        await loadTaskSubtasks(selectedTask._id);
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    } finally {
      setIsUpdatingSubtask(false);
    }
  };

  const handleSaveSubtaskEdit = async () => {
    if (!editingSubtaskId || !editingSubtaskTitle.trim() || !currentBrand) return;
    
    try {
      setIsUpdatingSubtask(true);
      
      const updateData = {
        title: editingSubtaskTitle.trim(),
        priority: editingSubtaskPriority,
        status: editingSubtaskStatus,
        assignedTo: editingSubtaskAssignee || undefined
      };
      
      await apiService.updateBrandSubtask(currentBrand.id, editingSubtaskId, updateData);
      
      // Reset editing state
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
      setEditingSubtaskPriority('Low');
      setEditingSubtaskStatus('Yet to Start');
      setEditingSubtaskAssignee('');
      
      // Refresh subtasks
      if (selectedTask?._id) {
        await loadTaskSubtasks(selectedTask._id);
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      alert(`Error updating subtask: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        content: newComment.trim(),
        entity_type: 'task',
        entity_id: selectedTask._id
      };
      
      await apiService.createBrandComment(currentBrand.id, commentData);
      setNewComment('');
      
      // Refresh comments
      const response = await apiService.getBrandComments(currentBrand.id);
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
      await apiService.deleteBrandComment(currentBrand.id, commentId);
      if (selectedTask?._id && currentBrand?.id) {
        const response = await apiService.getBrandComments(currentBrand.id);
        setTaskComments(response.data || response || []);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Load project information
  const loadProjectInfo = async (projId: string) => {
    if (!projId || !currentBrand?.id) {
      console.log('🟣 Missing projectId or brandId:', { projId, brandId: currentBrand?.id });
      return;
    }
    
    try {
      setProjectInfoLoading(true);
      console.log('🟣 Loading project info for ID:', projId, 'Brand ID:', currentBrand.id);
      const response = await apiService.getProjectDetails(currentBrand.id, projId);
      console.log('🟣 Project info response:', response);
      console.log('🟣 Response success:', response?.success);
      console.log('🟣 Response data:', response?.data);
      console.log('🟣 Response message:', response?.message);
      
      // Extract the project from the response
      const project = response?.data?.project || response?.data || response;
      console.log('🟣 Extracted project:', project);
      console.log('🟣 Project title:', project?.title);
      console.log('🟣 Project status:', project?.status);
      
      if (project && (project.title || project.name)) {
        setProjectInfo(project);
        console.log('🟣 Project info set successfully');
      } else {
        console.log('🟣 Invalid project data, using currentProject fallback');
        if (currentProject) {
          setProjectInfo(currentProject);
        }
      }
    } catch (error) {
      console.error('🟣 Error loading project info:', error);
      console.log('🟣 Using currentProject as fallback due to error');
      if (currentProject) {
        setProjectInfo(currentProject);
      } else {
        setProjectInfo(null);
      }
    } finally {
      setProjectInfoLoading(false);
    }
  };

  // Load available dependencies (other tasks in the project)
  const loadAvailableDependencies = async () => {
    if (!currentBrand?.id || !projectId) return;
    
    try {
      const response = await apiService.getProjectTasks(currentBrand.id, projectId);
      if (response.success && response.data) {
        const tasks = response.data.tasks || [];
        // Filter out the current task
        const otherTasks = tasks.filter((task: any) => task._id !== selectedTask?._id);
        setAvailableDependencies(otherTasks);
      }
    } catch (error) {
      console.error('Error loading dependencies:', error);
      setAvailableDependencies([]);
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
      case 'Under Review': return 'bg-amber-100 text-amber-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Yet to Start': return '⏳';
      case 'In Progress': return '🔄';
      case 'Under Review': return '👀';
      case 'Completed': return '✅';
      case 'Blocked': return '🚫';
      case 'On Hold': return '⏸️';
      case 'Cancelled': return '❌';
      case 'Recurring': return '🔄';
      default: return '❓';
    }
  };

  // Priority and Status options
  const priorityOptions = [
    { value: '', label: '—', color: 'text-gray-500' },
    { value: 'Low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'Medium', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
    { value: 'High', label: 'High', color: 'bg-purple-100 text-purple-800' }
  ];

  const statusOptions = [
    { value: 'Yet to Start', label: 'Yet to Start', color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'Under Review', label: 'Under Review', color: 'bg-amber-100 text-amber-800' },
    { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'Blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' },
    { value: 'On Hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
    { value: 'Recurring', label: 'Recurring', color: 'bg-purple-100 text-purple-800' }
  ];

  const handleFieldSelect = (field: string, value: string) => {
    if (field === 'priority') {
      setTaskPriority(value);
    } else if (field === 'status') {
      isLocalStatusUpdate.current = true; // Set flag BEFORE state update to prevent reset
      pendingStatusUpdate.current = value; // Set immediately for instant UI update
      setEditingTaskStatus(value);
    }
    setActiveField(null);
  };

  if (!showTaskDetails || !selectedTask) {
    return null;
  }

  // Use pending status if available, otherwise use editingTaskStatus
  const displayStatus = pendingStatusUpdate.current || editingTaskStatus;
  
  console.log('🔴 RENDER:', {
    'pendingStatusUpdate.current': pendingStatusUpdate.current,
    'editingTaskStatus': editingTaskStatus,
    'displayStatus': displayStatus,
    'selectedTask.status': selectedTask?.status,
    'isLocalStatusUpdate.current': isLocalStatusUpdate.current
  });

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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
              <span className="text-sm text-gray-900">
                {(() => {
                  const title = projectInfoLoading ? 'Loading...' : (projectInfo?.title || projectInfo?.name || currentProject?.title || 'Project not found');
                  console.log('🟣 Display title resolution:', {
                    projectInfoLoading,
                    projectInfoTitle: projectInfo?.title,
                    projectInfoName: projectInfo?.name,
                    currentProjectTitle: currentProject?.title,
                    finalTitle: title
                  });
                  return title;
                })()}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {(() => {
                  const status = projectInfoLoading ? 'Loading...' : (projectInfo?.status || currentProject?.status || 'Unknown');
                  console.log('🟣 Display status resolution:', {
                    projectInfoLoading,
                    projectInfoStatus: projectInfo?.status,
                    currentProjectStatus: currentProject?.status,
                    finalStatus: status
                  });
                  return status;
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Created by (Reporter) - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Created by</label>
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
            {selectedTask.reporter?.name ? (
              <>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedTask.reporter.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{selectedTask.reporter.name}</div>
                  <div className="text-xs text-gray-500">{selectedTask.reporter.email}</div>
                </div>
                <div className="text-xs text-gray-400">Creator</div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-gray-500 text-sm"></i>
                </div>
                <div className="text-sm text-gray-500">No creator information</div>
              </div>
            )}
          </div>
        </div>

        {/* Assign to */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
          <div className="relative assignee-dropdown">
            <input
              type="text"
              placeholder="Name or email"
              value={assigneeSearch}
              onChange={(e) => {
                setAssigneeSearch(e.target.value);
                setShowAssigneeDropdown(true);
              }}
              onFocus={() => setShowAssigneeDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowAssigneeDropdown(false), 200);
              }}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isUpdatingTask}
            />
            {assigneeSearch && (
              <button
                type="button"
                onClick={() => {
                  setAssigneeSearch('');
                  setSelectedAssignee(null);
                  setShowAssigneeDropdown(true);
                  // Clear assignee from task
                  if (selectedTask && currentBrand) {
                    handleAssigneeSelect(null, false);
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isUpdatingTask}
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            )}
            
            {showAssigneeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  {/* Brand Users */}
                  {Array.isArray(brandUsers) && brandUsers
                    .filter(user => 
                      user.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                      user.email.toLowerCase().includes(assigneeSearch.toLowerCase())
                    )
                    .map((user) => (
                      <div 
                        key={user._id || user.id}
                        onClick={() => handleAssigneeSelect(user)}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-xs text-gray-400">Brand User</div>
                      </div>
                    ))}
                  
                  {/* Email Option */}
                  {assigneeSearch && isValidEmail(assigneeSearch) && (
                    <div 
                      onClick={() => handleAssigneeSelect(assigneeSearch, true)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer border-t border-gray-200"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-mail-line text-white text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{assigneeSearch}</div>
                        <div className="text-xs text-gray-500">Invite via email</div>
                      </div>
                      <div className="text-xs text-green-600">New User</div>
                    </div>
                  )}
                  
                  {Array.isArray(brandUsers) && brandUsers.length === 0 && !loadingBrandUsers && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No brand users found
                    </div>
                  )}
                  
                  {loadingBrandUsers && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Loading users...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <div className="relative">
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setSelectingMode('due');
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isUpdatingTask}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-calendar-line text-blue-600 text-sm"></i>
                </div>
                <div className="flex flex-col space-y-1">
                  {startDate && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Start:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatDate(startDate)}</span>
                    </div>
                  )}
                  {dueDate && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Due:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatDate(dueDate)}</span>
                    </div>
                  )}
                  {!startDate && !dueDate && (
                    <span className="text-sm text-gray-500">No dates set</span>
                  )}
                </div>
              </div>
              {dueDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setDueDate(null);
                    handleUpdateTask('eta', '');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                  title="Clear due date"
                >
                  <i className="ri-close-line text-sm"></i>
                </span>
              )}
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 date-picker">
                {/* Date Input Fields - Top Section */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <div className="relative">
                        <button
                          onClick={() => setSelectingMode('start')}
                          className={`w-full px-2 py-1 text-sm border rounded text-left ${
                            selectingMode === 'start' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {formatDateInput(startDate) || 'Start date'}
                        </button>
                        {startDate && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStartDate(null);
                            }}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="Clear start date"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <button
                          onClick={() => setSelectingMode('due')}
                          className={`w-full px-2 py-1 text-sm border rounded text-left ${
                            selectingMode === 'due' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {formatDateInput(dueDate) || 'Due date'}
                        </button>
                        {dueDate && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setDueDate(null);
                            }}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="Clear due date"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <i className="ri-arrow-left-s-line text-gray-600"></i>
                  </button>
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-blue-600 mt-1">
                      {selectingMode === 'start' ? 'Select start date' : 'Select due date'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <i className="ri-arrow-right-s-line text-gray-600"></i>
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="p-3">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-xs text-gray-500 text-center py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                      const days = [];
                      
                      // Empty cells for days before month starts
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(<div key={`empty-${i}`} className="h-8"></div>);
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        
                        const isStartDate = startDate && 
                          startDate.getDate() === day && 
                          startDate.getMonth() === currentMonth.getMonth() && 
                          startDate.getFullYear() === currentMonth.getFullYear();
                        
                        const isDueDate = dueDate && 
                          dueDate.getDate() === day && 
                          dueDate.getMonth() === currentMonth.getMonth() && 
                          dueDate.getFullYear() === currentMonth.getFullYear();
                        
                        const isInRange = startDate && dueDate && 
                          currentDate >= startDate && currentDate <= dueDate;
                        
                        const isToday = new Date().toDateString() === currentDate.toDateString();
                        
                        let className = 'h-8 w-8 text-sm rounded hover:bg-gray-100 ';
                        
                        if (isStartDate || isDueDate) {
                          className += 'bg-blue-500 text-white hover:bg-blue-600 font-medium';
                        } else if (isInRange) {
                          className += 'bg-blue-100 text-blue-800 hover:bg-blue-200';
                        } else if (isToday) {
                          className += 'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100';
                        } else {
                          className += 'text-gray-700 hover:bg-gray-100';
                        }
                        
                        days.push(
                          <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            className={className}
                          >
                            {day}
                          </button>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>
                </div>
                
                {/* Footer buttons */}
                <div className="border-t border-gray-200 p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <i className="ri-time-line text-sm"></i>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <i className="ri-chat-3-line text-sm"></i>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleClearDates}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveDates}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                <button
                  onClick={() => setActiveField(activeField === 'priority' ? null : 'priority')}
                  className={`px-3 py-1 rounded text-sm font-medium ${getPriorityColor(editingTaskPriority)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isUpdatingTask}
                >
                  {editingTaskPriority || '—'}
                </button>
                
                {activeField === 'priority' && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 field-dropdown min-w-48">
                    <div className="py-1">
                      {priorityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleFieldSelect('priority', option.value);
                            handleUpdateTask('priority', option.value);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                            editingTaskPriority === option.value ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {option.value && <span className={`px-2 py-1 rounded text-xs font-medium ${option.color}`}>{option.label}</span>}
                            {!option.value && <span className="text-gray-500">{option.label}</span>}
                          </div>
                          {editingTaskPriority === option.value && (
                            <i className="ri-check-line text-green-600"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Field */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="ri-check-line text-gray-400"></i>
                <span className="text-sm text-gray-700">Status</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveField(activeField === 'status' ? null : 'status')}
                  className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(displayStatus)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1`}
                  disabled={isUpdatingTask}
                >
                  <span>{getStatusIcon(displayStatus)} {displayStatus}</span>
                  <i className="ri-arrow-down-s-line text-xs"></i>
                </button>
                
                {activeField === 'status' && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 field-dropdown min-w-48">
                    <div className="py-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleFieldSelect('status', option.value);
                            handleUpdateTask('status', option.value);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                            editingTaskStatus === option.value ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${option.color}`}>{option.label}</span>
                          </div>
                          {editingTaskStatus === option.value && (
                            <i className="ri-check-line text-green-600"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  console.log('Saving description:', editingTaskDescription.trim());
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
            <button 
              onClick={() => setShowDependenciesDropdown(!showDependenciesDropdown)}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              <i className="ri-add-line mr-1"></i>
              Add dependency
            </button>
          </div>
          
          {showDependenciesDropdown && (
            <div className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">Select tasks that this task depends on:</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableDependencies.map((task) => (
                  <label key={task._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedDependencies.includes(task._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDependencies([...selectedDependencies, task._id]);
                        } else {
                          setSelectedDependencies(selectedDependencies.filter(id => id !== task._id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{task.task}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => setShowDependenciesDropdown(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateTask('dependencies', selectedDependencies);
                    setShowDependenciesDropdown(false);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Dependencies
                </button>
              </div>
            </div>
          )}
          
          {selectedDependencies.length > 0 ? (
            <div className="space-y-2">
              {selectedDependencies.map((depId) => {
                const depTask = availableDependencies.find(t => t._id === depId);
                return depTask ? (
                  <div key={depId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{depTask.task}</span>
                    <button
                      onClick={() => {
                        const newDeps = selectedDependencies.filter(id => id !== depId);
                        setSelectedDependencies(newDeps);
                        handleUpdateTask('dependencies', newDeps);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              <i className="ri-links-line text-lg mb-1"></i>
              <div>No dependencies set</div>
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div>
          {/* Header Section */}
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Subtasks ({taskSubtasks[selectedTask._id]?.length || 0})
            </label>
            {taskSubtasks[selectedTask._id] && taskSubtasks[selectedTask._id].length > 0 && (
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getSubtaskProgress(selectedTask._id)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {getSubtaskProgress(selectedTask._id)}% complete
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {taskSubtasks[selectedTask._id].filter(s => s.status === 'Completed').length} of {taskSubtasks[selectedTask._id].length} completed
                </span>
              </div>
            )}
          </div>
          
          {/* Add Subtask Button */}
          <div className="mb-4">
            <button 
              onClick={() => {
                setCurrentTaskForSubtask(selectedTask._id);
                setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: true }));
              }}
              className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 bg-white"
            >
              <i className="ri-add-line mr-1"></i>
              Add subtask
            </button>
          </div>
          
          {/* Add Subtask Form */}
          {showSubtaskInput[selectedTask._id] && (
            <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subtask name"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={subtaskPriority}
                    onChange={(e) => setSubtaskPriority(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                  <select
                    value={subtaskStatus}
                    onChange={(e) => setSubtaskStatus(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Yet to Start">Yet to Start</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <select
                    value={subtaskAssignee}
                    onChange={(e) => setSubtaskAssignee(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Unassigned</option>
                    {brandUsers.map(user => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: false }));
                      setNewSubtaskName('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSubtask}
                    disabled={!newSubtaskName.trim() || isCreatingSubtask}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isCreatingSubtask ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-xs"></i>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line text-xs"></i>
                        <span>Add Subtask</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Subtasks List */}
          {taskSubtasks[selectedTask._id] && taskSubtasks[selectedTask._id].length > 0 ? (
            <div className="space-y-1">
              {taskSubtasks[selectedTask._id].map((subtask) => (
                <div key={subtask._id}>
                  {/* Edit Subtask Form */}
                  {editingSubtaskId === subtask._id ? (
                    <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingSubtaskTitle}
                          onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Subtask name"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={editingSubtaskPriority}
                            onChange={(e) => setEditingSubtaskPriority(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                          </select>
                          <select
                            value={editingSubtaskStatus}
                            onChange={(e) => setEditingSubtaskStatus(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Yet to Start">Yet to Start</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <select
                            value={editingSubtaskAssignee}
                            onChange={(e) => setEditingSubtaskAssignee(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Unassigned</option>
                            {brandUsers.map(user => (
                              <option key={user._id || user.id} value={user._id || user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              setEditingSubtaskId(null);
                              setEditingSubtaskTitle('');
                              setEditingSubtaskPriority('Low');
                              setEditingSubtaskStatus('Yet to Start');
                              setEditingSubtaskAssignee('');
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveSubtaskEdit}
                            disabled={!editingSubtaskTitle.trim() || isUpdatingSubtask}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            {isUpdatingSubtask ? (
                              <>
                                <i className="ri-loader-4-line animate-spin text-xs"></i>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <i className="ri-check-line text-xs"></i>
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Normal Subtask Display */
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 mb-1">
                      {/* First Line: Checkbox, Name, Priority, Status, Actions */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleSubtaskComplete(subtask._id, subtask.status !== 'Completed')}
                            className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                          >
                            {subtask.status === 'Completed' ? (
                              <i className="ri-check-line text-xs text-green-600"></i>
                            ) : (
                              <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                            )}
                          </button>
                          
                          {/* Subtask Name */}
                          <span className={`text-sm font-medium ${subtask.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {subtask.title || subtask.task}
                          </span>
                          
                          {/* Priority Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                            {subtask.priority}
                          </span>
                          
                          {/* Status Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subtask.status)}`}>
                            {subtask.status}
                          </span>
                        </div>
                        
                        {/* Action Icons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingSubtask(subtask);
                              setEditingSubtaskId(subtask._id);
                              setEditingSubtaskTitle(subtask.title || subtask.task);
                              setEditingSubtaskPriority(subtask.priority);
                              setEditingSubtaskStatus(subtask.status);
                              setEditingSubtaskAssignee(subtask.assignedTo || '');
                            }}
                            className="p-1 text-blue-500 hover:text-blue-700"
                            title="Edit subtask"
                          >
                            <i className="ri-edit-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteSubtask(subtask._id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Delete subtask"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                      
                      {/* Second Line: Assignee and Due Date */}
                      <div className="flex items-center space-x-3">
                        {/* Assignee */}
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {subtask.assignedTo?.name ? subtask.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {subtask.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                        
                        {/* Due Date */}
                        {subtask.dueDate && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <i className="ri-calendar-line text-xs"></i>
                            <span>{new Date(subtask.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              <i className="ri-list-check text-lg mb-1"></i>
              <div>No subtasks yet</div>
            </div>
          )}
        </div>

        {/* Task Links Section */}
        <div>
          <TaskLinksSection 
            taskId={selectedTask._id}
            brandId={currentBrand?.id}
          />
        </div>

        {/* Comments Section */}
        <div>
          <DynamicCommentsSection 
            taskId={selectedTask._id}
            currentUser={currentBrand}
          />
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
