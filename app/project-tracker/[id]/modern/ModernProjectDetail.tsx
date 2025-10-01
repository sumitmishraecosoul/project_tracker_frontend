'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VerticalLayout from '../../../../components/VerticalLayout';
import { apiService } from '../../../../lib/api-service';
import { Project, Task, CreateTaskData } from '../../../../lib/types';
import DynamicCommentsSection from '../../../../components/DynamicCommentsSection';
import { User } from '../../../../lib/comment-types';
import { useTasks } from '../../../../components/TaskContext';
import { useProjects } from '../../../../components/ProjectContext';
import { useBrand } from '../../../../components/BrandContext';
import { useSubtasks } from '../../../../components/SubtaskContext';
import { useSidebar } from '../../../../components/SidebarContext';

interface ModernProjectDetailProps {
  projectId: string;
  selectedBrand?: { id: string; name: string } | null;
}

export default function ModernProjectDetail({ projectId, selectedBrand = null }: ModernProjectDetailProps) {
  // Context hooks
  const { tasks, loading: tasksLoading, error: tasksError, getProjectTasks, createTask, updateTask, updateTaskStatus, updateTaskPriority, assignTask } = useTasks();
  const { projects, getProjectDetails, currentProject } = useProjects();
  const { currentBrand } = useBrand();
  const { subtasks, getTaskSubtasks, createSubtask, updateSubtaskStatus: updateSubtaskStatusContext } = useSubtasks();
  const { closeBothSidebars } = useSidebar();
  
  // Local state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Combined loading state
  const isLoading = loading || tasksLoading;
  const [activeView, setActiveView] = useState('List');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    'To do': true,
    'Doing': false,
    'Done': false
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showAddTaskDropdown, setShowAddTaskDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({});
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingMode, setSelectingMode] = useState<'start' | 'due'>('due');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [taskPriority, setTaskPriority] = useState<string>('Low');
  const [taskStatus, setTaskStatus] = useState<string>('On track');
  const [taskSubtasks, setTaskSubtasks] = useState<{ [taskId: string]: any[] }>({});
  const [showSubtaskInput, setShowSubtaskInput] = useState<{ [taskId: string]: boolean }>({});
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [currentTaskForSubtask, setCurrentTaskForSubtask] = useState<string | null>(null);
  
  // Task editing state
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [editingTaskAssignee, setEditingTaskAssignee] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState('');
  const [editingTaskStatus, setEditingTaskStatus] = useState('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState('');
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  // Enhanced task and subtask management state
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDependenciesDropdown, setShowDependenciesDropdown] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [availableDependencies, setAvailableDependencies] = useState<any[]>([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<any>(null);
  
  // Subtask editing state
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [editingSubtaskPriority, setEditingSubtaskPriority] = useState('');
  const [editingSubtaskStatus, setEditingSubtaskStatus] = useState('');
  const [editingSubtaskAssignee, setEditingSubtaskAssignee] = useState('');
  const [subtaskPriority, setSubtaskPriority] = useState('Low');
  const [subtaskStatus, setSubtaskStatus] = useState('Yet to Start');
  const [subtaskAssignee, setSubtaskAssignee] = useState('');
  
  // Brand users state
  const [brandUsers, setBrandUsers] = useState<any[]>([]);
  const [loadingBrandUsers, setLoadingBrandUsers] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<any>(null);

  // Mock data for demonstration - replace with actual API calls
  const mockTasks = [
    {
      _id: '1',
      id: 'TASK-1',
      projectId: projectId,
      task: 'Task 1',
      description: 'First task description',
      status: 'To do' as any,
      priority: 'Low' as const,
      taskType: 'Daily' as const,
      assignedTo: { _id: '1', name: 'SM Sumit Mishra', email: 'sm@example.com', role: 'employee', department: 'IT' },
      reporter: { _id: '1', name: 'SM Sumit Mishra', email: 'sm@example.com', role: 'employee', department: 'IT' },
      eta: '2024-12-31',
      labels: [],
      attachments: [],
      relatedTasks: [],
      subtasks: [
        { _id: '1-1', task: 'su', completed: true },
        { _id: '1-2', task: 'bn task 2', completed: true },
        { _id: '1-3', task: 'dfdfd', completed: true }
      ]
    },
    {
      _id: '2',
      id: 'TASK-2',
      projectId: projectId,
      task: 'Task 2',
      description: 'Second task description',
      status: 'To do' as any,
      priority: 'Medium' as const,
      taskType: 'Weekly' as const,
      assignedTo: { _id: '2', name: 'ss sumitmishra....', email: 'ss@example.com', role: 'employee', department: 'IT' },
      reporter: { _id: '1', name: 'SM Sumit Mishra', email: 'sm@example.com', role: 'employee', department: 'IT' },
      eta: '2024-12-31',
      labels: [],
      attachments: [],
      relatedTasks: [],
      subtasks: []
    },
    {
      _id: '3',
      id: 'TASK-3',
      projectId: projectId,
      task: 'Task 3',
      description: 'Third task description',
      status: 'To do' as any,
      priority: 'High' as const,
      taskType: 'Monthly' as const,
      assignedTo: { _id: '3', name: 'Unassigned', email: 'unassigned@example.com', role: 'employee', department: 'IT' },
      reporter: { _id: '1', name: 'SM Sumit Mishra', email: 'sm@example.com', role: 'employee', department: 'IT' },
      eta: '2024-12-31',
      labels: [],
      attachments: [],
      relatedTasks: [],
      subtasks: []
    }
  ];

  const mockProject = {
    _id: projectId,
    id: projectId,
    title: "Sumit's first project",
    description: "This is a sample project for demonstration",
    status: "Active" as const,
    priority: "Medium" as const,
    department: "India E-commerce",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    dueDate: "2024-12-31",
    tags: ["demo", "sample"],
    settings: {
      allowComments: true,
      allowAttachments: true,
      notifications: true
    },
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    createdDate: "2024-01-01"
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }
    
    // Load real project and task data
    const loadData = async () => {
      if (!currentBrand) {
        console.log('No current brand selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load project details into context
        if (projectId) {
          try {
            console.log('Loading project with:', { brandId: currentBrand.id, projectId });
            const projectData = await getProjectDetails(currentBrand.id, projectId);
            console.log('Project data received:', projectData);
            if (projectData.success && projectData.data) {
              console.log('Setting project data:', projectData.data);
              setProject(projectData.data);
            } else {
              console.error('Failed to load project:', projectData.message);
              setProject(mockProject); // Fallback to mock data
            }
          } catch (projectError) {
            console.error('Error loading project:', projectError);
            setProject(mockProject); // Fallback to mock data
          }
        }

        // Load project tasks
        if (projectId) {
          try {
            await getProjectTasks(currentBrand.id, projectId);
            console.log('Loaded project tasks');
          } catch (taskError) {
            console.error('Error loading project tasks:', taskError);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load project data');
        // Fallback to mock data
    setProject(mockProject);
      } finally {
    setLoading(false);
      }
    };

    loadData();
  }, [projectId, currentBrand]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAddTaskDropdown || showFilterDropdown || showUserDropdown || showAssigneeDropdown || showDatePicker || activeField) {
        if (showDatePicker && !target.closest('.date-picker')) {
          setShowDatePicker(false);
        }
        if (showAddTaskDropdown && !target.closest('.add-task-dropdown')) {
          setShowAddTaskDropdown(false);
        }
        if (showFilterDropdown && !target.closest('.filter-dropdown')) {
          setShowFilterDropdown(false);
        }
        if (showUserDropdown && !target.closest('.user-dropdown')) {
          setShowUserDropdown(false);
        }
        if (showAssigneeDropdown && !target.closest('.assignee-dropdown')) {
          setShowAssigneeDropdown(false);
        }
        if (activeField && !target.closest('.field-dropdown')) {
          setActiveField(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddTaskDropdown, showFilterDropdown, showUserDropdown, showAssigneeDropdown, showDatePicker, activeField]);

  // Update assignee display when brandUsers are loaded and we have a selected task
  useEffect(() => {
    if (selectedTask && brandUsers.length > 0 && !selectedAssignee) {
      const assigneeId = selectedTask.assignedTo?.id || selectedTask.assignedTo;
      console.log('useEffect: Setting up assignee with ID:', assigneeId);
      console.log('useEffect: Available brand users:', brandUsers);
      
      if (assigneeId) {
        const assignee = brandUsers.find(u => (u._id === assigneeId) || (u.id === assigneeId));
        console.log('useEffect: Found assignee:', assignee);
        if (assignee) {
          setSelectedAssignee(assignee);
          setAssigneeSearch(`${assignee.name} (${assignee.email})`);
        }
      }
    }
  }, [brandUsers, selectedTask, selectedAssignee]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yet to Start': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      case 'Recurring': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusFromTask = (task: Task) => {
    // Return the actual task status
    return task.status || 'Yet to Start';
  };


  const priorityOptions = [
    { value: '', label: '—', color: 'text-gray-500' },
    { value: 'Low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'Medium', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
    { value: 'High', label: 'High', color: 'bg-purple-100 text-purple-800' }
  ];

  const statusOptions = [
    { value: 'Yet to Start', label: 'Yet to Start', color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
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
      setTaskStatus(value);
    }
    setActiveField(null);
  };

  const toggleSection = (sectionName: 'To do' | 'Doing' | 'Done') => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Load brand users
  const loadBrandUsers = async () => {
    if (!currentBrand?.id) return;
    
    try {
      setLoadingBrandUsers(true);
      const response = await apiService.getBrandUsers(currentBrand.id);
      console.log('Brand users API response:', response);
      console.log('Brand users API response type:', typeof response);
      console.log('Brand users API response keys:', Object.keys(response || {}));
      console.log('Brand users API response.data:', response?.data);
      console.log('Brand users API response.users:', response?.users);
      
      // Handle different response formats
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response.users)) {
        users = response.users;
      }
      
      console.log('Processed users array:', users);
      console.log('First user object:', users[0]);
      console.log('First user keys:', users[0] ? Object.keys(users[0]) : 'No users');
      
      setBrandUsers(users);
      console.log('Brand users loaded:', users.length);
    } catch (error) {
      console.error('Error loading brand users:', error);
      setBrandUsers([]);
    } finally {
      setLoadingBrandUsers(false);
    }
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle assignee selection
  const handleAssigneeSelect = async (assignee: any, isEmail = false) => {
    console.log('=== ASSIGNEE SELECT DEBUG ===');
    console.log('editingTask:', editingTask);
    console.log('currentBrand:', currentBrand);
    console.log('assignee:', assignee);
    console.log('isEmail:', isEmail);
    
    if (!editingTask || !currentBrand) {
      console.log('Missing editingTask or currentBrand, returning early');
      return;
    }
    
    try {
      setIsUpdatingTask(true);
      
      if (isEmail && isValidEmail(assignee)) {
        // Handle email assignment
        console.log('Assigning by email:', assignee);
        await apiService.assignBrandTask(currentBrand.id, editingTask._id, assignee);
        setSelectedAssignee({ email: assignee, name: assignee, isEmail: true });
        setAssigneeSearch(assignee);
      } else if (assignee._id || assignee.id) {
        // Handle user assignment
        const assigneeId = assignee._id || assignee.id;
        console.log('Assigning by user ID:', assigneeId);
        console.log('API call parameters:', {
          brandId: currentBrand.id,
          taskId: editingTask._id,
          assignedTo: assigneeId
        });
        await apiService.assignBrandTask(currentBrand.id, editingTask._id, assigneeId);
        setSelectedAssignee(assignee);
        setAssigneeSearch(`${assignee.name} (${assignee.email})`);
      } else {
        console.log('Invalid assignee object - no _id or id field');
      }
      
      // Refresh tasks
      console.log('Refreshing tasks after assignment...');
      await getProjectTasks(currentBrand.id, projectId);
      setShowAssigneeDropdown(false);
      
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setIsUpdatingTask(false);
    }
    
    console.log('=== END ASSIGNEE SELECT DEBUG ===');
  };

  const handleTaskSelect = async (task: any) => {
    console.log('handleTaskSelect called with task:', task);
    console.log('Current brand:', currentBrand);
    
    setSelectedTask(task);
    setEditingTask(task);
    setEditingTaskName(task.task || '');
    setEditingTaskDescription(task.description || '');
    setEditingTaskAssignee(task.assignedTo?.id || task.assignedTo || '');
    setEditingTaskPriority(task.priority || 'Low');
    setEditingTaskStatus(task.status || 'Yet to Start');
    
    // Set dependencies
    console.log('=== LOADING TASK DEPENDENCIES DEBUG ===');
    console.log('Task object:', JSON.stringify(task, null, 2));
    console.log('Task.dependencies:', task.dependencies);
    console.log('Task.dependencies type:', typeof task.dependencies);
    console.log('Task keys:', Object.keys(task));
    console.log('All task fields:', Object.entries(task));
    setSelectedDependencies(task.dependencies || []);
    console.log('Set selectedDependencies to:', task.dependencies || []);
    console.log('=== END LOADING DEPENDENCIES DEBUG ===');
    
    // Set dates properly
    if (task.startDate) {
      setStartDate(new Date(task.startDate));
    } else {
      setStartDate(new Date()); // Default to today
    }
    
    if (task.eta || task.dueDate) {
      setDueDate(new Date(task.eta || task.dueDate));
    } else {
      setDueDate(null);
    }
    
    setEditingTaskDueDate(task.eta || task.dueDate || '');
    setShowTaskDetails(true);
    
    // Close both sidebars when opening task details
    closeBothSidebars();
    
    console.log('Task details panel should be visible now');
    
    // Load brand users if not loaded and get fresh users for assignee lookup
    let freshBrandUsers = brandUsers;
    if (brandUsers.length === 0) {
      await loadBrandUsers();
      // Get fresh users directly from API for immediate use
      try {
        if (!currentBrand?.id) return;
        const response = await apiService.getBrandUsers(currentBrand.id);
        let users = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (response && Array.isArray(response.data)) {
          users = response.data;
        } else if (response && Array.isArray(response.users)) {
          users = response.users;
        }
        freshBrandUsers = users;
      } catch (error) {
        console.error('Error loading fresh brand users:', error);
        freshBrandUsers = [];
      }
    } else {
      // Use existing brand users
      freshBrandUsers = brandUsers;
    }
    
    // Set selected assignee AFTER brand users are loaded
    const assigneeId = task.assignedTo?.id || task.assignedTo;
    console.log('Setting up assignee with ID:', assigneeId);
    console.log('Available brand users:', freshBrandUsers);
    
    if (assigneeId) {
      const assignee = freshBrandUsers.find(u => (u._id === assigneeId) || (u.id === assigneeId));
      console.log('Found assignee:', assignee);
      setSelectedAssignee(assignee);
      setAssigneeSearch(assignee ? `${assignee.name} (${assignee.email})` : '');
    } else {
      setSelectedAssignee(null);
      setAssigneeSearch('');
    }
    
    // Load subtasks for the selected task
    try {
      console.log('Loading subtasks for task:', task._id);
      await loadTaskSubtasks(task._id);
      console.log('Subtasks loaded successfully');
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
    
    // Load available dependencies (other tasks in the project)
    try {
      const allTasks = tasks.filter(t => t._id !== task._id);
      setAvailableDependencies(allTasks);
      console.log('Available dependencies loaded:', allTasks.length);
    } catch (error) {
      console.error('Error loading dependencies:', error);
    }
  };

  const handleAddTask = () => {
    setShowNewTaskInput(true);
  };

  // Task update functions
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
          console.log('Updating task priority:', { brandId: currentBrand.id, taskId: editingTask._id, priority: value });
          await updateTaskPriority(currentBrand.id, editingTask._id, value);
          setEditingTaskPriority(value);
          break;
        case 'status':
          console.log('Updating task status:', { brandId: currentBrand.id, taskId: editingTask._id, status: value });
          await updateTaskStatus(currentBrand.id, editingTask._id, value);
          setEditingTaskStatus(value);
          break;
        case 'assignedTo':
          console.log('Updating task assignee:', { brandId: currentBrand.id, taskId: editingTask._id, assignedTo: value });
          await assignTask(currentBrand.id, editingTask._id, value);
          setEditingTaskAssignee(value);
          break;
        case 'eta':
          updateData = { eta: value };
          setEditingTaskDueDate(value);
          break;
        default:
          updateData = { [field]: value };
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('Updating task with data:', { brandId: currentBrand.id, taskId: editingTask._id, updateData });
        await updateTask(currentBrand.id, editingTask._id, updateData);
      }
      
      // Refresh tasks to show updated data
      await getProjectTasks(currentBrand.id, projectId);
      
      // Update the selected task
      const updatedTask = { ...editingTask, ...updateData };
      setSelectedTask(updatedTask);
      setEditingTask(updatedTask);
      
      console.log('Task updated successfully:', field, value);
      
    } catch (error) {
      console.error('Error updating task:', error);
      alert(`Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleCreateTask = async () => {
    console.log('handleCreateTask called', { newTaskName, currentBrand, isCreatingTask });
    
    if (newTaskName.trim() && currentBrand && !isCreatingTask) {
      setIsCreatingTask(true);
      try {
        // Get current user ID from localStorage
        const currentUser = localStorage.getItem('currentUser');
        const userData = currentUser ? JSON.parse(currentUser) : null;
        const userId = userData?.id || currentBrand?.id || '';
        
        const taskData: CreateTaskData = {
          task: newTaskName.trim(),
          description: '',
          projectId: projectId,
          assignedTo: userId, // Use current user ID as default assignee
          reporter: userId, // Use current user ID as default reporter
          eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
          status: 'Yet to Start',
          priority: 'Medium'
        };
        
        console.log('Creating new task with data:', {
          taskData,
          brandId: currentBrand.id,
          projectId: projectId,
          currentBrand: currentBrand
        });
        
        const result = await createTask(currentBrand.id, taskData);
        console.log('Task created successfully:', result);
        
      // Reset the input
      setNewTaskName('');
      setShowNewTaskInput(false);
        
        // Refresh tasks to show the new task
        if (currentBrand) {
          await getProjectTasks(currentBrand.id, projectId);
        }
      } catch (error) {
        console.error('Error creating task:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
        setError(`Failed to create task: ${errorMessage}`);
        alert(`Error creating task: ${errorMessage}`);
      } finally {
        setIsCreatingTask(false);
      }
    } else {
      console.log('Task creation conditions not met:', {
        hasTaskName: !!newTaskName.trim(),
        hasCurrentBrand: !!currentBrand,
        notCreating: !isCreatingTask
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    if (!currentBrand) return;
    
    try {
      console.log('Updating task status:', { taskId, newStatus });
      await updateTaskStatus(currentBrand.id, taskId, newStatus);
      
      // Refresh tasks to show updated status
      await getProjectTasks(currentBrand.id, projectId);
      
      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
        setEditingTaskStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
    }
  };

  const handleTaskCheckboxClick = async (task: Task) => {
    if (!currentBrand) return;
    
    const newStatus = task.status === 'Completed' ? 'Yet to Start' : 'Completed';
    await handleTaskStatusChange(task._id, newStatus);
  };

  const handleCancelAddTask = () => {
    setNewTaskName('');
    setShowNewTaskInput(false);
  };

  const toggleTaskExpansion = async (taskId: string) => {
    const isExpanding = !expandedTasks[taskId];
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
    
    // Load subtasks when expanding
    if (isExpanding) {
      await loadTaskSubtasks(taskId);
    }
  };

  // Subtask handling functions
  const loadTaskSubtasks = async (taskId: string) => {
    try {
      console.log('loadTaskSubtasks called for taskId:', taskId);
      const subtasks = await getTaskSubtasks(taskId);
      console.log('loadTaskSubtasks - received subtasks:', subtasks);
      
      // Debug: Check the assignedTo field in each subtask
      subtasks.forEach((subtask: any, index) => {
        console.log(`=== Subtask ${index + 1} DETAILS ===`);
        console.log('Full subtask object:', subtask);
        console.log('assignedTo field:', subtask.assignedTo);
        console.log('assignedTo type:', typeof subtask.assignedTo);
        if (subtask.assignedTo && typeof subtask.assignedTo === 'object') {
          console.log('assignedTo object keys:', Object.keys(subtask.assignedTo));
          console.log('assignedTo._id:', subtask.assignedTo._id);
          console.log('assignedTo.name:', subtask.assignedTo.name);
        }
        console.log('=== END Subtask DETAILS ===');
      });
      
      setTaskSubtasks(prev => {
        const updated = {
          ...prev,
          [taskId]: subtasks
        };
        console.log('loadTaskSubtasks - updated taskSubtasks state:', updated);
        return updated;
      });
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  const handleCreateSubtask = async (taskId: string, subtaskName: string) => {
    const brandId = currentBrand?.id;
    if (!subtaskName.trim() || !brandId) {
      console.error('Missing brand ID or subtask name:', { brandId, subtaskName });
      return;
    }
    
    try {
      setIsCreatingSubtask(true);
      
      // Debug: Check what subtaskAssignee contains
      console.log('🔍 DEBUG - subtaskAssignee value:', subtaskAssignee);
      console.log('🔍 DEBUG - subtaskAssignee type:', typeof subtaskAssignee);
      console.log('🔍 DEBUG - brandUsers:', brandUsers);
      
      // Find the selected user to verify
      const selectedUser = brandUsers.find((u: any) => u._id === subtaskAssignee);
      console.log('🔍 DEBUG - Selected user object:', selectedUser);
      
      const subtaskData = {
        task_id: taskId,
        title: subtaskName.trim(),
        description: '',
        assignedTo: subtaskAssignee || editingTask?.assignedTo?._id,
        reporter: editingTask?.reporter?._id || brandId,
        status: subtaskStatus,
        priority: subtaskPriority,
        startDate: new Date().toISOString(),
        dueDate: editingTask?.eta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        order: (taskSubtasks[taskId]?.length || 0) + 1
      };
      
      console.log('📤 SENDING TO API - Full payload:', { brandId, subtaskData });
      console.log('📤 SENDING TO API - assignedTo value:', subtaskData.assignedTo);
      console.log('📤 SENDING TO API - assignedTo type:', typeof subtaskData.assignedTo);
      
      await apiService.createBrandSubtask(brandId, subtaskData);
      await loadTaskSubtasks(taskId);
      
      // Reset form
      setNewSubtaskName('');
      setSubtaskAssignee('');
      setSubtaskStatus('Yet to Start');
      setSubtaskPriority('Low');
      setShowSubtaskInput(prev => ({ ...prev, [taskId]: false }));
      
    } catch (error) {
      console.error('Error creating subtask:', error);
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: string) => {
    try {
      await updateSubtaskStatusContext(subtaskId, newStatus);
      // Refresh subtasks for the parent task
      const parentTask = Object.keys(taskSubtasks).find(taskId => 
        taskSubtasks[taskId].some(subtask => subtask._id === subtaskId)
      );
      if (parentTask) {
        await loadTaskSubtasks(parentTask);
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  const toggleSubtaskInput = (taskId: string) => {
    setShowSubtaskInput(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
    setCurrentTaskForSubtask(taskId);
  };

  // Enhanced subtask management functions
  const handleSubtaskPriorityChange = async (subtaskId: string, newPriority: string) => {
    try {
      await apiService.updateSubtaskPriority(subtaskId, newPriority);
      const parentTask = Object.keys(taskSubtasks).find(taskId => 
        taskSubtasks[taskId].some(subtask => subtask._id === subtaskId)
      );
      if (parentTask) {
        await loadTaskSubtasks(parentTask);
      }
    } catch (error) {
      console.error('Error updating subtask priority:', error);
    }
  };

  const handleSubtaskAssigneeChange = async (subtaskId: string, newAssignee: string) => {
    try {
      if (newAssignee) {
        await apiService.assignSubtask(subtaskId, newAssignee);
      } else {
        await apiService.unassignSubtask(subtaskId);
      }
      const parentTask = Object.keys(taskSubtasks).find(taskId => 
        taskSubtasks[taskId].some(subtask => subtask._id === subtaskId)
      );
      if (parentTask) {
        await loadTaskSubtasks(parentTask);
      }
    } catch (error) {
      console.error('Error updating subtask assignee:', error);
    }
  };

  const handleSubtaskComplete = async (subtaskId: string, isComplete: boolean) => {
    try {
      if (isComplete) {
        await apiService.completeSubtask(subtaskId);
      } else {
        await apiService.uncompleteSubtask(subtaskId);
      }
      const parentTask = Object.keys(taskSubtasks).find(taskId => 
        taskSubtasks[taskId].some(subtask => subtask._id === subtaskId)
      );
      if (parentTask) {
        await loadTaskSubtasks(parentTask);
      }
    } catch (error) {
      console.error('Error updating subtask completion:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    
    try {
      setIsUpdatingSubtask(true);
      const brandId = currentBrand?.id;
      if (!brandId) {
        console.error('Missing brand ID for deleting subtask');
        return;
      }
      await apiService.deleteBrandSubtask(brandId, subtaskId);
      const parentTask = Object.keys(taskSubtasks).find(taskId => 
        taskSubtasks[taskId].some(subtask => subtask._id === subtaskId)
      );
      if (parentTask) {
        await loadTaskSubtasks(parentTask);
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    } finally {
      setIsUpdatingSubtask(false);
    }
  };

  // New handlers for subtask editing
  const handleEditSubtask = (subtask: any) => {
    console.log('=== handleEditSubtask START ===');
    console.log('handleEditSubtask called with subtask:', subtask);
    console.log('brandUsers array:', brandUsers);
    console.log('brandUsers length:', Array.isArray(brandUsers) ? brandUsers.length : 'Not an array');
    
    setEditingSubtaskId(subtask._id);
    setEditingSubtaskTitle(subtask.title || subtask.task || '');
    setEditingSubtaskPriority(subtask.priority || 'Low');
    setEditingSubtaskStatus(subtask.status || 'Yet to Start');
    
    // Handle assignedTo as both object and string
    const assigneeId = subtask.assignedTo ? 
      (typeof subtask.assignedTo === 'object' ? subtask.assignedTo._id : subtask.assignedTo) : '';
    setEditingSubtaskAssignee(assigneeId);
    
    console.log('Edit form initialized with:', {
      title: subtask.title || subtask.task || '',
      priority: subtask.priority || 'Low',
      status: subtask.status || 'Yet to Start',
      assigneeId,
      originalAssignedTo: subtask.assignedTo
    });
    
      // Debug: Check if assigneeId matches any user in brandUsers
      if (assigneeId) {
        const matchingUser = Array.isArray(brandUsers) ? brandUsers.find(u => u._id === assigneeId || u.id === assigneeId) : null;
        console.log('Matching user for assigneeId:', matchingUser);
      }
    console.log('=== handleEditSubtask END ===');
  };

  const handleSaveSubtaskEdit = async (subtaskId: string) => {
    console.log('=== handleSaveSubtaskEdit START ===');
    console.log('subtaskId:', subtaskId);
    console.log('editingSubtaskTitle:', editingSubtaskTitle);
    console.log('editingSubtaskAssignee:', editingSubtaskAssignee);
    console.log('editingSubtaskPriority:', editingSubtaskPriority);
    console.log('editingSubtaskStatus:', editingSubtaskStatus);
    
    try {
      setIsUpdatingSubtask(true);
      const brandId = currentBrand?.id;
      if (!brandId) {
        console.error('Missing brand ID');
        return;
      }

      // Validate assignedTo - must be a valid ObjectId or empty
      let validAssignedTo = undefined;
      if (editingSubtaskAssignee && editingSubtaskAssignee.trim() !== '') {
        // Check if it's a valid ObjectId (24 character hex string)
        if (/^[0-9a-fA-F]{24}$/.test(editingSubtaskAssignee.trim())) {
          validAssignedTo = editingSubtaskAssignee.trim();
        } else {
          console.error('Invalid assignedTo value - not a valid ObjectId:', editingSubtaskAssignee);
          console.log('brandUsers array:', brandUsers);
          console.log('brandUsers length:', Array.isArray(brandUsers) ? brandUsers.length : 'Not an array');
          
          // Try to find the user by name and get their ID
          const userByName = Array.isArray(brandUsers) ? brandUsers.find(u => u.name === editingSubtaskAssignee) : null;
          console.log('userByName search result:', userByName);
          console.log('userByName keys:', userByName ? Object.keys(userByName) : 'No user found');
          
          if (userByName) {
            // Try different possible ID field names
            const userId = userByName._id || userByName.id || userByName.userId;
            validAssignedTo = userId;
            console.log('Found user by name, using ObjectId:', validAssignedTo);
            console.log('Available ID fields:', {
              _id: userByName._id,
              id: userByName.id,
              userId: userByName.userId
            });
          } else {
            console.error('Could not find user by name:', editingSubtaskAssignee);
            console.log('Available users:', Array.isArray(brandUsers) ? brandUsers.map((u: any) => ({ 
              name: u.name, 
              _id: u._id,
              id: u.id,
              userId: u.userId,
              keys: Object.keys(u)
            })) : 'Not an array');
            // Skip the assignedTo update if invalid
          }
        }
      }

      const updateData = {
        title: editingSubtaskTitle.trim(),
        priority: editingSubtaskPriority,
        status: editingSubtaskStatus,
        assignedTo: validAssignedTo
      };

      console.log('Update data before sending:', updateData);
      console.log('editingSubtaskAssignee value:', editingSubtaskAssignee);
      console.log('validAssignedTo value:', validAssignedTo);

      console.log('Updating subtask with data:', { subtaskId, brandId, updateData });
      const response = await apiService.updateBrandSubtask(brandId, subtaskId, updateData);
      console.log('Update response:', response);
      
      // Reload subtasks
      const parentTask = Object.keys(taskSubtasks).find(taskId => 
        taskSubtasks[taskId].some(subtask => subtask._id === subtaskId)
      );
      if (parentTask) {
        console.log('Reloading subtasks for parent task:', parentTask);
        await loadTaskSubtasks(parentTask);
        console.log('Subtasks reloaded successfully');
      }

      // Reset editing state
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
      setEditingSubtaskPriority('');
      setEditingSubtaskStatus('');
      setEditingSubtaskAssignee('');

      console.log('=== handleSaveSubtaskEdit SUCCESS ===');
      console.log('Subtask updated successfully');
    } catch (error) {
      console.error('=== handleSaveSubtaskEdit ERROR ===');
      console.error('Error updating subtask:', error);
    } finally {
      setIsUpdatingSubtask(false);
      console.log('=== handleSaveSubtaskEdit END ===');
    }
  };

  const handleCancelSubtaskEdit = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
    setEditingSubtaskPriority('');
    setEditingSubtaskStatus('');
    setEditingSubtaskAssignee('');
  };


  const getSubtaskProgress = (taskId: string) => {
    const subtasks = taskSubtasks[taskId] || [];
    if (subtasks.length === 0) return 0;
    
    const completedSubtasks = subtasks.filter(subtask => subtask.status === 'Completed').length;
    return Math.round((completedSubtasks / subtasks.length) * 100);
  };

  const getTaskStatusFromSubtasks = (taskId: string) => {
    const subtasks = taskSubtasks[taskId] || [];
    if (subtasks.length === 0) return 'Yet to Start';
    
    const completedCount = subtasks.filter(subtask => subtask.status === 'Completed').length;
    const inProgressCount = subtasks.filter(subtask => subtask.status === 'In Progress').length;
    
    if (completedCount === subtasks.length) return 'Completed';
    if (inProgressCount > 0 || completedCount > 0) return 'In Progress';
    return 'Yet to Start';
  };

  // Date picker helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const formatDateRange = () => {
    if (!startDate && !dueDate) return 'No due date';
    if (startDate && dueDate) {
      return `${formatDate(startDate)} – ${formatDate(dueDate)}`;
    }
    if (dueDate) return formatDate(dueDate);
    if (startDate) return formatDate(startDate);
    return 'No due date';
  };

  const formatDateInput = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit',
      year: '2-digit' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    console.log('Date selected:', newDate, 'Mode:', selectingMode);
    
    if (selectingMode === 'start') {
      setStartDate(newDate);
      console.log('Start date set:', newDate);
    } else if (selectingMode === 'due') {
      setDueDate(newDate);
      console.log('Due date set:', newDate);
    }
  };

  const handleSaveDates = async () => {
      if (editingTask && currentBrand) {
      try {
        setIsUpdatingTask(true);
        
        // Save both dates
        if (startDate) {
          await handleUpdateTask('startDate', startDate.toISOString());
        }
        if (dueDate) {
          await handleUpdateTask('eta', dueDate.toISOString());
        }
        
    setShowDatePicker(false);
      } catch (error) {
        console.error('Error saving dates:', error);
      } finally {
        setIsUpdatingTask(false);
      }
    }
  };

  const handleClearDates = () => {
    setStartDate(null);
    setDueDate(null);
    setSelectingMode('due');
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

  const getAssigneeAvatar = (task: any) => {
    if (task.assignedTo.name === 'SM Sumit Mishra') {
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">SM</span>
        </div>
      );
    } else if (task.assignedTo.name === 'ss sumitmishra....') {
      return (
        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">SS</span>
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
          <i className="ri-user-line text-gray-600 text-xs"></i>
        </div>
      );
    }
  };

  const viewTabs = [
    'List', 'Board', 'Timeline', 'Dashboard', 
    'Calendar', 'Workflow', 'Messages', 'Files', 'Gantt'
  ];

  if (isLoading) {
    return (
      <VerticalLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </VerticalLayout>
    );
  }

  if (!project) {
    return (
      <VerticalLayout>
        <div className="h-screen flex items-center justify-center">
          <p className="text-gray-600">Project not found</p>
        </div>
      </VerticalLayout>
    );
  }

  return (
    <VerticalLayout>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <i className="ri-menu-line text-lg"></i>
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 flex items-center space-x-1">
              <i className="ri-add-line text-sm"></i>
              <span>Create</span>
            </button>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Q Search"
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <i className="ri-search-line absolute left-2.5 top-2.5 text-gray-400 text-sm"></i>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <i className="ri-question-line text-lg"></i>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <i className="ri-flashlight-line text-lg"></i>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">SM</span>
                </div>
                <i className="ri-arrow-down-s-line text-sm"></i>
              </button>
            </div>
          </div>
        </div>


        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <i className="ri-list-check text-2xl text-gray-600"></i>
                <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <i className="ri-star-line text-xl"></i>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <i className="ri-arrow-down-s-line text-xl"></i>
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Set status
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white font-bold text-xs">SM</span>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white">
                  <i className="ri-user-line text-gray-600 text-xs"></i>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white">
                  <i className="ri-user-line text-gray-600 text-xs"></i>
                </div>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <i className="ri-more-2-line text-lg"></i>
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1">
                <i className="ri-share-line text-sm"></i>
                <span>Share</span>
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1">
                <i className="ri-grid-line text-sm"></i>
                <span>Customize</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {viewTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeView === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
            <button className="p-3 text-gray-400 hover:text-gray-600">
              <i className="ri-add-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Main Task List */}
            <div className={`${showTaskDetails ? 'w-2/3' : 'w-full'} flex flex-col`}>
              {/* Task Controls */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleAddTask}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-1.5"
                    >
                      <i className="ri-add-line text-sm"></i>
                      <span>Add task</span>
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                      <i className="ri-filter-line text-sm"></i>
                      <span>Filter</span>
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                      <i className="ri-sort-asc text-sm"></i>
                      <span>Sort</span>
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                      <i className="ri-group-line text-sm"></i>
                      <span>Group</span>
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                      <i className="ri-settings-3-line text-sm"></i>
                      <span>Options</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                      <i className="ri-search-line text-lg"></i>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                      <i className="ri-question-line text-lg"></i>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                      <i className="ri-user-3-line text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Task Table */}
              <div className="flex-1 overflow-auto">
                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-1"></div>
                      <div className="col-span-4">Name</div>
                      <div className="col-span-2">Assignee</div>
                      <div className="col-span-2">Due date</div>
                      <div className="col-span-1">Priority</div>
                      <div className="col-span-2 text-center">Status</div>
                    </div>
                  </div>

                  {/* Task Sections */}
                  <div className="divide-y divide-gray-200">
                    {/* To do Section */}
                    <div className="bg-white">
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleSection('To do')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <i className={`ri-arrow-${expandedSections['To do'] ? 'down' : 'right'}-s-line text-sm`}></i>
                          </button>
                          <h3 className="text-sm font-medium text-gray-900">To do</h3>
                        </div>
                        <span className="text-xs text-gray-500">{(tasks || []).filter(task => task.status === 'Yet to Start' && (!currentBrand || task.brand_id === currentBrand.id)).length}</span>
                      </div>
                      {expandedSections['To do'] && (
                        <div className="divide-y divide-gray-100">
                          {/* Task Input Field */}
                          {showNewTaskInput && (
                          <div className="px-6 py-3 bg-blue-50">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-1">
                                <button className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400">
                                  <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                </button>
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  placeholder={isCreatingTask ? "Creating task..." : "Write a task name"}
                                  value={newTaskName}
                                  onChange={(e) => setNewTaskName(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isCreatingTask) {
                                      handleCreateTask();
                                    }
                                  }}
                                  className="w-full px-2 py-1 border-0 focus:outline-none text-sm placeholder-gray-400 bg-transparent"
                                  autoFocus
                                  disabled={isCreatingTask}
                                />
                              </div>
                              <div className="col-span-2">
                                <button 
                                  onClick={handleCreateTask}
                                  disabled={!newTaskName.trim() || isCreatingTask}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                  {isCreatingTask ? (
                                    <>
                                      <i className="ri-loader-4-line animate-spin text-xs"></i>
                                      <span>Creating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <i className="ri-check-line text-xs"></i>
                                      <span>Save</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="col-span-2">
                                <button className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400">
                                  <i className="ri-user-line text-xs text-gray-400"></i>
                                </button>
                              </div>
                              <div className="col-span-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <i className="ri-calendar-line text-sm"></i>
                                </button>
                              </div>
                              <div className="col-span-1">
                                <button
                                  onClick={() => {
                                    if (!isCreatingTask) {
                                      setShowNewTaskInput(false);
                                      setNewTaskName('');
                                    }
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                  disabled={isCreatingTask}
                                >
                                  {isCreatingTask ? (
                                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                                  ) : (
                                    <i className="ri-close-line text-sm"></i>
                                  )}
                                </button>
                              </div>
                              <div className="col-span-1"></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Static Task Input Field */}
                        {!showNewTaskInput && (
                          <div className="px-6 py-3 bg-white">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-1">
                                <button className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400">
                                  <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                </button>
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  placeholder="Write a task name"
                                  className="w-full px-2 py-1 border-0 focus:outline-none text-sm placeholder-gray-400"
                                  readOnly
                                />
                              </div>
                              <div className="col-span-2"></div>
                              <div className="col-span-2"></div>
                              <div className="col-span-1">
                                <button
                                  onClick={() => {
                                    if (!isCreatingTask) {
                                      setShowNewTaskInput(false);
                                      setNewTaskName('');
                                    }
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                  disabled={isCreatingTask}
                                >
                                  {isCreatingTask ? (
                                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                                  ) : (
                                    <i className="ri-close-line text-sm"></i>
                                  )}
                                </button>
                              </div>
                              <div className="col-span-2"></div>
                            </div>
                          </div>
                        )}

                        {(tasks || []).filter(task => task.status === 'Yet to Start' && (!currentBrand || task.brand_id === currentBrand.id)).map((task) => (
                          <div key={task._id}>
                            {/* Main Task */}
                            <div 
                              className={`px-6 py-3 hover:bg-gray-50 cursor-pointer ${selectedTask?._id === task._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                              onClick={() => handleTaskSelect(task)}
                            >
                              <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskCheckboxClick(task);
                                    }}
                                    className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                  >
                                    {task.status === 'Completed' ? (
                                      <i className="ri-check-line text-xs text-green-600"></i>
                                    ) : (
                                      <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                    )}
                                  </button>
                                </div>
                                <div className="col-span-4 flex items-center space-x-3">
                                  {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTaskExpansion(task._id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                      <i className={`ri-arrow-${expandedTasks[task._id] ? 'down' : 'right'}-s-line text-sm`}></i>
                                    </button>
                                  )}
                                  <span className="text-sm text-gray-900">{task.task}</span>
                                  {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                                    <span className="text-xs text-gray-500">({taskSubtasks[task._id].length})</span>
                                  )}
                                </div>
                                <div className="col-span-2">
                                  <div className="flex items-center space-x-2">
                                    {getAssigneeAvatar(task)}
                                    <span className="text-sm text-gray-900">{task.assignedTo?.name || 'Unassigned'}</span>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-sm text-gray-900">{task.dueDate}</span>
                                </div>
                                <div className="col-span-1">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <div className="col-span-2 flex items-center justify-between">
                                  <select 
                                    value={task.status}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleTaskStatusChange(task._id, e.target.value as Task['status']);
                                    }}
                                    className={`px-2 py-1 rounded text-xs font-medium border-0 bg-transparent ${task.status === 'Yet to Start' ? 'bg-gray-100 text-gray-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                  >
                                    <option value="Yet to Start">Yet to Start</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                  <button 
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskSelect(task);
                                    }}
                                  >
                                    <i className="ri-arrow-right-s-line text-sm"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Subtasks */}
                            {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && expandedTasks[task._id] && (
                              <div className="bg-gray-50">
                                {taskSubtasks[task._id].map((subtask) => (
                                  <div key={subtask._id} className="px-6 py-3 pl-14 border-b border-gray-100">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                      <div className="col-span-1">
                                        <button 
                                          onClick={() => handleSubtaskStatusChange(subtask._id, subtask.status === 'Completed' ? 'Yet to Start' : 'Completed')}
                                          className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                        >
                                          {subtask.status === 'Completed' ? (
                                            <i className="ri-check-line text-xs text-green-600"></i>
                                          ) : (
                                            <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                          )}
                                        </button>
                                      </div>
                                      <div className="col-span-4">
                                        <span className="text-sm text-gray-700">{subtask.title || subtask.task}</span>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                          <i className="ri-user-line text-xs text-gray-400"></i>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                          <i className="ri-calendar-line text-xs text-gray-400"></i>
                                        </div>
                                      </div>
                                      <div className="col-span-2"></div>
                                      <div className="col-span-1"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                          <div 
                            onClick={handleAddTask}
                            className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            Add task...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Doing Section */}
                    <div className="bg-white">
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleSection('Doing')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <i className={`ri-arrow-${expandedSections['Doing'] ? 'down' : 'right'}-s-line text-sm`}></i>
                          </button>
                          <h3 className="text-sm font-medium text-gray-900">Doing</h3>
                        </div>
                        <span className="text-xs text-gray-500">{(tasks || []).filter(task => task.status === 'In Progress' && (!currentBrand || task.brand_id === currentBrand.id)).length}</span>
                      </div>
                      {expandedSections['Doing'] && (
                        <>
                          {(tasks || []).filter(task => task.status === 'In Progress' && (!currentBrand || task.brand_id === currentBrand.id)).length === 0 ? (
                            <div 
                              onClick={handleAddTask}
                              className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                          Add task...
                        </div>
                          ) : (
                            (tasks || []).filter(task => task.status === 'In Progress' && (!currentBrand || task.brand_id === currentBrand.id)).map((task) => (
                              <div key={task._id} className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskCheckboxClick(task);
                                      }}
                                      className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                    >
                                      {task.status === 'Completed' ? (
                                        <i className="ri-check-line text-xs text-green-600"></i>
                                      ) : (
                                        <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                      )}
                                    </button>
                                  </div>
                                  <div className="col-span-4">
                                    <div className="flex items-center space-x-2">
                                      {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTaskExpansion(task._id);
                                          }}
                                          className="p-1 text-gray-400 hover:text-gray-600"
                                        >
                                          <i className={`ri-arrow-${expandedTasks[task._id] ? 'down' : 'right'}-s-line text-sm`}></i>
                                        </button>
                                      )}
                                    <span className="text-sm text-gray-900">{task.task}</span>
                                      {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                                        <span className="text-xs text-gray-500">({taskSubtasks[task._id].length})</span>
                                      )}
                                  </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="flex items-center space-x-2">
                                      {getAssigneeAvatar(task)}
                                      <span className="text-sm text-gray-900">{task.assignedTo?.name || 'Unassigned'}</span>
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-sm text-gray-900">{task.dueDate}</span>
                                  </div>
                                  <div className="col-span-1">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                  <div className="col-span-2 flex items-center justify-between">
                                    <select 
                                      value={task.status}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleTaskStatusChange(task._id, e.target.value as Task['status']);
                                      }}
                                      className={`px-2 py-1 rounded text-xs font-medium border-0 bg-transparent ${task.status === 'Yet to Start' ? 'bg-gray-100 text-gray-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                    >
                                      <option value="Yet to Start">Yet to Start</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Blocked">Blocked</option>
                                      <option value="On Hold">On Hold</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button 
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskSelect(task);
                                      }}
                                    >
                                      <i className="ri-arrow-right-s-line text-sm"></i>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Subtasks */}
                                {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && expandedTasks[task._id] && (
                                  <div className="bg-gray-50">
                                    {taskSubtasks[task._id].map((subtask) => (
                                      <div key={subtask._id} className="px-6 py-3 pl-14 border-b border-gray-100">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                          <div className="col-span-1">
                                            <button 
                                              onClick={() => handleSubtaskStatusChange(subtask._id, subtask.status === 'Completed' ? 'Yet to Start' : 'Completed')}
                                              className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                            >
                                              {subtask.status === 'Completed' ? (
                                                <i className="ri-check-line text-xs text-green-600"></i>
                                              ) : (
                                                <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                              )}
                                            </button>
                                          </div>
                                          <div className="col-span-4">
                                            <span className="text-sm text-gray-700">{subtask.title || subtask.task}</span>
                                          </div>
                                          <div className="col-span-2">
                                            <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                              <i className="ri-user-line text-xs text-gray-400"></i>
                                            </div>
                                          </div>
                                          <div className="col-span-2">
                                            <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                              <i className="ri-calendar-line text-xs text-gray-400"></i>
                                            </div>
                                          </div>
                                          <div className="col-span-2"></div>
                                          <div className="col-span-1"></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </div>

                    {/* Done Section */}
                    <div className="bg-white">
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleSection('Done')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <i className={`ri-arrow-${expandedSections['Done'] ? 'down' : 'right'}-s-line text-sm`}></i>
                          </button>
                          <h3 className="text-sm font-medium text-gray-900">Done</h3>
                        </div>
                        <span className="text-xs text-gray-500">{(tasks || []).filter(task => task.status === 'Completed' && (!currentBrand || task.brand_id === currentBrand.id)).length}</span>
                      </div>
                      {expandedSections['Done'] && (
                        <>
                          {(tasks || []).filter(task => task.status === 'Completed' && (!currentBrand || task.brand_id === currentBrand.id)).length === 0 ? (
                            <div 
                              onClick={handleAddTask}
                              className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                          Add task...
                        </div>
                          ) : (
                            (tasks || []).filter(task => task.status === 'Completed' && (!currentBrand || task.brand_id === currentBrand.id)).map((task) => (
                              <div key={task._id} className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskCheckboxClick(task);
                                      }}
                                      className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                    >
                                      <i className="ri-check-line text-xs text-green-600"></i>
                                    </button>
                                  </div>
                                  <div className="col-span-4">
                                    <div className="flex items-center space-x-2">
                                      {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTaskExpansion(task._id);
                                          }}
                                          className="p-1 text-gray-400 hover:text-gray-600"
                                        >
                                          <i className={`ri-arrow-${expandedTasks[task._id] ? 'down' : 'right'}-s-line text-sm`}></i>
                                        </button>
                                      )}
                                    <span className="text-sm text-gray-900 line-through">{task.task}</span>
                                      {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                                        <span className="text-xs text-gray-500">({taskSubtasks[task._id].length})</span>
                                      )}
                                  </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="flex items-center space-x-2">
                                      {getAssigneeAvatar(task)}
                                      <span className="text-sm text-gray-900">{task.assignedTo?.name || 'Unassigned'}</span>
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-sm text-gray-900">{task.dueDate}</span>
                                  </div>
                                  <div className="col-span-1">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                  <div className="col-span-2 flex items-center justify-between">
                                    <select 
                                      value={task.status}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleTaskStatusChange(task._id, e.target.value as Task['status']);
                                      }}
                                      className={`px-2 py-1 rounded text-xs font-medium border-0 bg-transparent ${task.status === 'Yet to Start' ? 'bg-gray-100 text-gray-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                    >
                                      <option value="Yet to Start">Yet to Start</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Blocked">Blocked</option>
                                      <option value="On Hold">On Hold</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button 
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskSelect(task);
                                      }}
                                    >
                                      <i className="ri-arrow-right-s-line text-sm"></i>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Subtasks */}
                                {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && expandedTasks[task._id] && (
                                  <div className="bg-gray-50">
                                    {taskSubtasks[task._id].map((subtask) => (
                                      <div key={subtask._id} className="px-6 py-3 pl-14 border-b border-gray-100">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                          <div className="col-span-1">
                                            <button 
                                              onClick={() => handleSubtaskStatusChange(subtask._id, subtask.status === 'Completed' ? 'Yet to Start' : 'Completed')}
                                              className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                            >
                                              {subtask.status === 'Completed' ? (
                                                <i className="ri-check-line text-xs text-green-600"></i>
                                              ) : (
                                                <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                              )}
                                            </button>
                                          </div>
                                          <div className="col-span-4">
                                            <span className="text-sm text-gray-700">{subtask.title || subtask.task}</span>
                                          </div>
                                          <div className="col-span-2">
                                            <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                              <i className="ri-user-line text-xs text-gray-400"></i>
                                            </div>
                                          </div>
                                          <div className="col-span-2">
                                            <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                              <i className="ri-calendar-line text-xs text-gray-400"></i>
                                            </div>
                                          </div>
                                          <div className="col-span-2"></div>
                                          <div className="col-span-1"></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Section Button */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                  <i className="ri-add-line text-sm"></i>
                  <span>Add section</span>
                </button>
              </div>
            </div>

            {/* Task Details Panel */}
            {showTaskDetails && selectedTask && (
              <div className="w-1/3 bg-gray-50 border-l border-gray-200 flex flex-col">
                {/* Task Details Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                      {isUpdatingTask && (
                        <i className="ri-loader-4-line animate-spin text-blue-600"></i>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowTaskDetails(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      disabled={isUpdatingTask}
                    >
                      <i className="ri-close-line text-lg"></i>
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
                            console.log('=== PROJECT DEBUG ===');
                            console.log('Current project from context:', currentProject);
                            console.log('Current project title:', currentProject?.title);
                            console.log('Current project keys:', currentProject ? Object.keys(currentProject) : 'null');
                            console.log('Local project state:', project);
                            console.log('Local project title:', project?.title);
                            console.log('Local project keys:', project ? Object.keys(project) : 'null');
                            console.log('Loading state:', loading);
                            console.log('Current brand:', currentBrand);
                            console.log('Project ID:', projectId);
                            console.log('=== END PROJECT DEBUG ===');
                            // Try multiple sources for project name
                            const projectFromContext = currentProject?.title;
                            const projectFromLocal = project?.title;
                            const projectFromList = projects.find(p => p._id === projectId || p.id === projectId)?.title;
                            
                            console.log('Project name sources:', {
                              context: projectFromContext,
                              local: projectFromLocal,
                              list: projectFromList,
                              projectId
                            });
                            
                            return projectFromContext || projectFromLocal || projectFromList || (loading ? "Loading..." : "Project not found");
                          })()}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">To do</span>
                      </div>
                    </div>
                  </div>


                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
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
                          // Delay hiding to allow clicks
                          setTimeout(() => setShowAssigneeDropdown(false), 200);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isUpdatingTask}
                      />
                      
                      
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
                            className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(editingTaskStatus)} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1`}
                            disabled={isUpdatingTask}
                          >
                            <span>{editingTaskStatus}</span>
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

                  {/* Dependencies Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Dependencies</label>
                      <button 
                        onClick={() => setShowDependenciesDropdown(!showDependenciesDropdown)}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                        disabled={isUpdatingTask}
                      >
                        <i className="ri-add-line mr-1"></i>
                        Add dependency
                      </button>
                    </div>
                    
                    {showDependenciesDropdown && (
                      <div className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 mb-2">Select tasks that must be completed before this one:</div>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {availableDependencies.map((task) => (
                              <label key={task._id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer">
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
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">{task.task}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status}
                                </span>
                              </label>
                            ))}
                          </div>
                          {availableDependencies.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No other tasks available for dependencies
                            </div>
                          )}
                          <div className="flex items-center space-x-2 pt-2">
                            <button
                              onClick={async () => {
                                if (!editingTask || !currentBrand) return;
                                
                                try {
                                  setIsUpdatingTask(true);
                                  console.log('=== SAVING DEPENDENCIES DEBUG ===');
                                  console.log('currentBrand.id:', currentBrand.id);
                                  console.log('editingTask._id:', editingTask._id);
                                  console.log('selectedDependencies:', selectedDependencies);
                                  console.log('selectedDependencies type:', typeof selectedDependencies);
                                  console.log('selectedDependencies length:', selectedDependencies.length);
                                  
                                  // Try specific dependencies endpoint first
                                  let response;
                                  try {
                                    console.log('Trying specific dependencies endpoint...');
                                    response = await apiService.updateTaskDependencies(currentBrand.id, editingTask._id, selectedDependencies);
                                    console.log('Dependencies endpoint response:', response);
                                  } catch (depsError) {
                                    console.log('Dependencies endpoint failed, trying general update:', depsError);
                                    // Fallback to general update endpoint
                                    const updateData = {
                                      dependencies: selectedDependencies
                                    };
                                    console.log('API call data:', updateData);
                                    response = await apiService.updateBrandTask(currentBrand.id, editingTask._id, updateData);
                                    console.log('General update response:', response);
                                  }
                                  
                                  // Update the editing task with new dependencies
                                  setEditingTask({
                                    ...editingTask,
                                    dependencies: selectedDependencies
                                  });
                                  
                                  // Also update the selectedTask to reflect the new dependencies
                                  setSelectedTask({
                                    ...selectedTask,
                                    dependencies: selectedDependencies
                                  });
                                  
                                setShowDependenciesDropdown(false);
                                  console.log('Dependencies saved successfully');
                                  
                                  console.log('=== END DEPENDENCIES DEBUG ===');
                                } catch (error) {
                                  console.error('=== DEPENDENCIES ERROR ===');
                                  console.error('Error saving dependencies:', error);
                                  console.error('Error details:', error);
                                  console.error('=== END DEPENDENCIES ERROR ===');
                                } finally {
                                  setIsUpdatingTask(false);
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              disabled={isUpdatingTask}
                            >
                              {isUpdatingTask ? 'Saving...' : 'Save Dependencies'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDependencies([]);
                                setShowDependenciesDropdown(false);
                              }}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                            >
                              Cancel
                      </button>
                    </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Display Current Dependencies */}
                    {selectedDependencies.length > 0 && (
                      <div className="space-y-2">
                        {selectedDependencies.map((taskId) => {
                          const task = availableDependencies.find(t => t._id === taskId);
                          if (!task) return null;
                          return (
                            <div key={taskId} className="flex items-center space-x-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                              <i className="ri-arrow-right-line text-blue-600 text-sm"></i>
                              <span className="text-sm text-gray-900 flex-1">{task.task}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status}
                              </span>
                              <button
                                onClick={() => setSelectedDependencies(selectedDependencies.filter(id => id !== taskId))}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <i className="ri-close-line text-sm"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {selectedDependencies.length === 0 && !showDependenciesDropdown && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        <i className="ri-links-line text-lg mb-1"></i>
                        <div>No dependencies set</div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Subtasks Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: !prev[selectedTask._id] }))}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                          disabled={isCreatingSubtask}
                        >
                          {isCreatingSubtask ? (
                            <i className="ri-loader-4-line animate-spin mr-1"></i>
                          ) : (
                            <i className="ri-add-line mr-1"></i>
                          )}
                          Add subtask
                        </button>
                      </div>
                      
                      {/* Subtask Progress */}
                      {taskSubtasks[selectedTask._id] && taskSubtasks[selectedTask._id].length > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-500">
                            {getSubtaskProgress(selectedTask._id)}% complete
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${getSubtaskProgress(selectedTask._id)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced Add Subtask Form */}
                    {showSubtaskInput[selectedTask._id] && (
                      <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="space-y-3">
                          <div>
                            <input
                              type="text"
                              value={newSubtaskName}
                              onChange={(e) => setNewSubtaskName(e.target.value)}
                              placeholder="Enter subtask name..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && newSubtaskName.trim()) {
                                  handleCreateSubtask(selectedTask._id, newSubtaskName.trim());
                                }
                              }}
                              disabled={isCreatingSubtask}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            {/* Priority */}
                            <div className="relative">
                              <select
                                value={subtaskPriority}
                                onChange={(e) => setSubtaskPriority(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={isCreatingSubtask}
                              >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                                <option value="Urgent">Urgent</option>
                              </select>
                            </div>
                            
                            {/* Status */}
                            <div className="relative">
                              <select
                                value={subtaskStatus}
                                onChange={(e) => setSubtaskStatus(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={isCreatingSubtask}
                              >
                                <option value="Yet to Start">Yet to Start</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Blocked">Blocked</option>
                                <option value="On Hold">On Hold</option>
                              </select>
                            </div>
                            
                            {/* Assignee */}
                            <div className="relative">
                              <select
                                value={subtaskAssignee}
                                onChange={(e) => setSubtaskAssignee(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={isCreatingSubtask}
                              >
                                <option value="">Unassigned</option>
                                {Array.isArray(brandUsers) && brandUsers.map((user, index) => (
                                  <option key={user._id || user.id || `user-${index}`} value={user._id || user.id}>
                                    {user.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (newSubtaskName.trim()) {
                                  handleCreateSubtask(selectedTask._id, newSubtaskName.trim());
                                }
                              }}
                              disabled={isCreatingSubtask || !newSubtaskName.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreatingSubtask ? 'Creating...' : 'Create Subtask'}
                            </button>
                            <button
                              onClick={() => {
                                setNewSubtaskName('');
                                setSubtaskPriority('Low');
                                setSubtaskStatus('Yet to Start');
                                setSubtaskAssignee('');
                                setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: false }));
                              }}
                              disabled={isCreatingSubtask}
                              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Subtasks List */}
                    {taskSubtasks[selectedTask._id] && taskSubtasks[selectedTask._id].length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-700">
                            Subtasks ({(taskSubtasks[selectedTask._id] || []).length})
                          </div>
                          <div className="text-xs text-gray-500">
                            {(taskSubtasks[selectedTask._id] || []).filter(s => s.status === 'Completed').length} of {(taskSubtasks[selectedTask._id] || []).length} completed
                          </div>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {(() => {
                            console.log('Rendering subtasks for selectedTask._id:', selectedTask._id);
                            console.log('taskSubtasks state:', taskSubtasks);
                            console.log('taskSubtasks[selectedTask._id]:', taskSubtasks[selectedTask._id]);
                            const subtasks = taskSubtasks[selectedTask._id] || [];
                            if (subtasks.length > 0) {
                              console.log('First subtask structure:', subtasks[0]);
                              console.log('Subtask fields:', Object.keys(subtasks[0]));
                            }
                            return subtasks;
                          })().map((subtask, index) => (
                            <div key={subtask._id} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
                              {/* Completion Checkbox */}
                              <button 
                                onClick={() => handleSubtaskComplete(subtask._id, subtask.status !== 'Completed')}
                                className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors"
                                disabled={isUpdatingSubtask}
                              >
                                {subtask.status === 'Completed' ? (
                                  <i className="ri-check-line text-sm text-green-600"></i>
                                ) : (
                                  <i className="ri-checkbox-blank-line text-sm text-gray-400"></i>
                                )}
                              </button>
                              
                              {/* Subtask Content */}
                              <div className="flex-1 min-w-0">
                                {editingSubtaskId === subtask._id ? (
                                  // Editing mode
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editingSubtaskTitle}
                                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Subtask title..."
                                      autoFocus
                                    />
                                    <div className="flex space-x-2">
                                      <select
                                        value={editingSubtaskPriority}
                                        onChange={(e) => setEditingSubtaskPriority(e.target.value)}
                                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                      </select>
                                      <select
                                        value={editingSubtaskStatus}
                                        onChange={(e) => setEditingSubtaskStatus(e.target.value)}
                                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="Yet to Start">Yet to Start</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Blocked">Blocked</option>
                                        <option value="On Hold">On Hold</option>
                                      </select>
                                      <select
                                        value={editingSubtaskAssignee}
                                        onChange={(e) => setEditingSubtaskAssignee(e.target.value)}
                                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="">Unassigned</option>
                                        {Array.isArray(brandUsers) && brandUsers.map((user, index) => (
                                          <option key={user._id || `user-${index}`} value={user._id}>
                                            {user.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleSaveSubtaskEdit(subtask._id)}
                                        disabled={isUpdatingSubtask || !editingSubtaskTitle.trim()}
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        {isUpdatingSubtask ? 'Saving...' : 'Save'}
                                      </button>
                                      <button
                                        onClick={handleCancelSubtaskEdit}
                                        disabled={isUpdatingSubtask}
                                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Viewing mode
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${subtask.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                      {subtask.title || subtask.task}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      subtask.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                                      subtask.priority === 'High' ? 'bg-purple-100 text-purple-800' : 
                                      subtask.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {subtask.priority}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      subtask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                      subtask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                      subtask.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                                      subtask.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {subtask.status}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Subtask Actions - Only show in viewing mode */}
                                {editingSubtaskId !== subtask._id && (
                                  <div className="flex items-center space-x-2 mt-1">
                                    {subtask.assignedTo && (
                                      <div className="flex items-center space-x-1">
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">
                                            {(() => {
                                              // Handle both object and string assignedTo
                                              const assigneeId = typeof subtask.assignedTo === 'object' ? subtask.assignedTo._id : subtask.assignedTo;
                                              const user = Array.isArray(brandUsers) ? brandUsers.find(a => a._id === assigneeId || a.id === assigneeId) : null;
                                              return user?.name?.charAt(0)?.toUpperCase() || 'U';
                                            })()}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {(() => {
                                            // Handle both object and string assignedTo
                                            const assigneeId = typeof subtask.assignedTo === 'object' ? subtask.assignedTo._id : subtask.assignedTo;
                                            const user = Array.isArray(brandUsers) ? brandUsers.find(a => a._id === assigneeId || a.id === assigneeId) : null;
                                            
                                            // Debug logging
                                            console.log('=== ASSIGNEE DISPLAY DEBUG ===');
                                            console.log('subtask.assignedTo:', subtask.assignedTo);
                                            console.log('assigneeId:', assigneeId);
                                            console.log('brandUsers:', brandUsers);
                                            console.log('brandUsers[0]:', brandUsers[0]);
                                            console.log('brandUsers[0]._id:', brandUsers[0]?._id);
                                            console.log('brandUsers[0].id:', brandUsers[0]?.id);
                                            console.log('brandUsers[0].userId:', brandUsers[0]?.userId);
                                            console.log('ID comparison:', assigneeId === brandUsers[0]?._id);
                                            console.log('ID comparison (id field):', assigneeId === brandUsers[0]?.id);
                                            console.log('ID comparison (userId field):', assigneeId === brandUsers[0]?.userId);
                                            console.log('found user:', user);
                                            console.log('=== END ASSIGNEE DISPLAY DEBUG ===');
                                            
                                            return user?.name || 'Unknown';
                                          })()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {(subtask.eta || subtask.dueDate) && (
                                      <div className="flex items-center space-x-1">
                                        <i className="ri-calendar-line text-xs text-gray-400"></i>
                                        <span className="text-xs text-gray-500">
                                          {new Date(subtask.eta || subtask.dueDate).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Subtask Actions */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditSubtask(subtask)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  disabled={isUpdatingSubtask}
                                  title="Edit subtask"
                                >
                                  <i className="ri-edit-line text-sm"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteSubtask(subtask._id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  disabled={isUpdatingSubtask}
                                  title="Delete subtask"
                                >
                                  <i className="ri-delete-bin-line text-sm"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Empty State */}
                    {(!taskSubtasks[selectedTask._id] || taskSubtasks[selectedTask._id].length === 0) && (
                      <div className="text-center py-6 text-gray-500">
                        <i className="ri-task-line text-2xl mb-2"></i>
                        <div className="text-sm">No subtasks yet</div>
                        <div className="text-xs">Add subtasks to break down this task into smaller parts</div>
                      </div>
                    )}
                  </div>

                  {/* Comments/Activity */}
                  <div>
                    <DynamicCommentsSection
                      taskId={selectedTask._id}
                      brandId={currentBrand?.id || '68d38eed5a9174ab9e766851'}
                      currentUser={{
                        id: currentUser?.id || 'user1',
                        name: currentUser?.name || 'Sumit Mishra',
                        email: currentUser?.email || 'sumit@example.com',
                        avatar: currentUser?.avatar || 'SM',
                        initials: currentUser?.initials || 'SM'
                      }}
                    />
                  </div>

                  {/* Collaborators */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Collaborators</label>
                    <div className="flex items-center space-x-2">
                      {brandUsers.length > 0 ? (
                        brandUsers.map((user, index) => {
                          const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                          const colorClasses = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
                          const avatarColor = colorClasses[index % colorClasses.length];
                          
                          return (
                            <div key={user._id || user.id || index} className="w-8 h-8 rounded-full flex items-center justify-center">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${avatarColor}`}>
                                  <span className="text-white font-bold text-sm">{initials}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SM</span>
                          </div>
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="ri-user-line text-gray-600 text-sm"></i>
                          </div>
                        </>
                      )}
                      <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                        <i className="ri-add-line text-gray-600 text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task Details Footer */}
                <div className="p-4 border-t border-gray-200">
                  <button className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Leave task
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </VerticalLayout>
  );
}