'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VerticalLayout from '../../../../components/VerticalLayout';
import { apiService } from '../../../../lib/api-service';
import { Project, Task, CreateTaskData } from '../../../../lib/types';
import CommentsSection from '../../../../components/CommentsSection';
import { User } from '../../../../lib/comment-types';
import { useTasks } from '../../../../components/TaskContext';
import { useProjects } from '../../../../components/ProjectContext';
import { useBrand } from '../../../../components/BrandContext';
import { useSubtasks } from '../../../../components/SubtaskContext';

interface ModernProjectDetailProps {
  projectId: string;
  selectedBrand?: { id: string; name: string } | null;
}

export default function ModernProjectDetail({ projectId, selectedBrand = null }: ModernProjectDetailProps) {
  // Context hooks
  const { tasks, loading: tasksLoading, error: tasksError, getProjectTasks, createTask, updateTask, updateTaskStatus, updateTaskPriority, assignTask } = useTasks();
  const { projects, getProjectDetails } = useProjects();
  const { currentBrand } = useBrand();
  const { subtasks, getTaskSubtasks, createSubtask, updateSubtaskStatus: updateSubtaskStatusContext } = useSubtasks();
  
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
  const [startDate, setStartDate] = useState<Date | null>(null);
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

  // Mock assignee data
  const mockAssignees = [
    {
      id: '1',
      name: 'SM Sumit Mishra',
      email: 'sumitmishraecosoul@gmail.com',
      avatar: 'SM',
      color: 'blue'
    },
    {
      id: '2', 
      name: 'SS sumitmishra.sm004',
      email: 'sumitmishra.sm004@gmail.com',
      avatar: 'SS',
      color: 'yellow'
    },
    {
      id: '3',
      name: 'SS sumitmishra.sm04',
      email: 'sumitmishra.sm04@gmail.com', 
      avatar: 'SS',
      color: 'green'
    }
  ];

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
        
        // Load project details
        if (projectId) {
          try {
            const projectData = await getProjectDetails(currentBrand.id, projectId);
            if (projectData.success && projectData.data) {
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

  const handleTaskSelect = async (task: any) => {
    setSelectedTask(task);
    setEditingTask(task);
    setEditingTaskName(task.task || '');
    setEditingTaskDescription(task.description || '');
    setEditingTaskAssignee(task.assignedTo?.id || task.assignedTo || '');
    setEditingTaskPriority(task.priority || 'Low');
    setEditingTaskStatus(task.status || 'Yet to Start');
    setEditingTaskDueDate(task.eta || task.dueDate || '');
    setShowTaskDetails(true);
    
    // Load subtasks for the selected task
    try {
      await loadTaskSubtasks(task._id);
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  const handleAddTask = () => {
    setShowNewTaskInput(true);
  };

  // Task update functions
  const handleUpdateTask = async (field: string, value: any) => {
    if (!editingTask || !currentBrand || isUpdatingTask) return;
    
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
          await updateTaskPriority(currentBrand.id, editingTask._id, value);
          setEditingTaskPriority(value);
          break;
        case 'status':
          await updateTaskStatus(currentBrand.id, editingTask._id, value);
          setEditingTaskStatus(value);
          break;
        case 'assignedTo':
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
        await updateTask(currentBrand.id, editingTask._id, updateData);
      }
      
      // Refresh tasks to show updated data
      await getProjectTasks(currentBrand.id, projectId);
      
      // Update the selected task
      const updatedTask = { ...editingTask, ...updateData };
      setSelectedTask(updatedTask);
      setEditingTask(updatedTask);
      
    } catch (error) {
      console.error('Error updating task:', error);
      alert(`Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleCreateTask = async () => {
    console.log('handleCreateTask called', { newTaskName, currentBrand, isCreatingTask });
    
    // Test backend connection first
    try {
      const testResponse = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Backend connection test:', testResponse.status);
    } catch (error) {
      console.error('Backend connection failed:', error);
      alert('Backend server is not running on port 5000. Please start the backend server.');
      return;
    }
    
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
      const subtasks = await getTaskSubtasks(taskId);
      setTaskSubtasks(prev => ({
        ...prev,
        [taskId]: subtasks
      }));
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  const handleCreateSubtask = async (taskId: string, subtaskName: string) => {
    try {
      await createSubtask({
        task: subtaskName,
        parentTaskId: taskId,
        status: 'Yet to Start',
        priority: 'Low'
      });
      await loadTaskSubtasks(taskId);
      setNewSubtaskName('');
      setShowSubtaskInput(prev => ({ ...prev, [taskId]: false }));
    } catch (error) {
      console.error('Error creating subtask:', error);
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
      // After setting start date, switch to due date mode if due date is not set
      if (!dueDate) {
        setSelectingMode('due');
      }
    } else {
      setDueDate(newDate);
      console.log('Due date set:', newDate);
    }
  };

  const handleSaveDates = () => {
    setShowDatePicker(false);
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
                      <div className="col-span-2 flex items-center justify-between">
                        <span>Status</span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <i className="ri-add-line text-sm"></i>
                        </button>
                      </div>
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
                                        <span className="text-sm text-gray-700">{subtask.task}</span>
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
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
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
                                    <span className="text-sm text-gray-900">{task.task}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">{task.assignedTo?.name || 'Unassigned'}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {task.priority}
                                    </span>
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
                                  </div>
                                </div>
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
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskCheckboxClick(task);
                                      }}
                                      className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                    >
                                      <i className="ri-check-line text-xs text-green-600"></i>
                                    </button>
                                    <span className="text-sm text-gray-900 line-through">{task.task}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">{task.assignedTo?.name || 'Unassigned'}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {task.priority}
                                    </span>
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
                                  </div>
                                </div>
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
                  
                  {/* Task Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Like">
                      <i className="ri-thumb-up-line text-lg"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Attachments">
                      <i className="ri-paperclip-line text-lg"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Comments">
                      <i className="ri-chat-3-line text-lg"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Link">
                      <i className="ri-links-line text-lg"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Fullscreen">
                      <i className="ri-fullscreen-line text-lg"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="More options">
                      <i className="ri-more-2-line text-lg"></i>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Next task">
                      <i className="ri-arrow-right-s-line text-lg"></i>
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
                        if (editingTaskName !== selectedTask.task) {
                          handleUpdateTask('task', editingTaskName);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateTask('task', editingTaskName);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write a task name"
                      disabled={isUpdatingTask}
                    />
                  </div>

                  {/* Task Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingTaskDescription}
                      onChange={(e) => setEditingTaskDescription(e.target.value)}
                      onBlur={() => {
                        if (editingTaskDescription !== selectedTask.description) {
                          handleUpdateTask('description', editingTaskDescription);
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a description..."
                      disabled={isUpdatingTask}
                    />
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                    <div className="relative assignee-dropdown">
                      <input
                        type="text"
                        placeholder="Name or email"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        onFocus={() => setShowAssigneeDropdown(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isUpdatingTask}
                      />
                      
                      {showAssigneeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          <div className="p-2">
                            {mockAssignees
                              .filter(assignee => 
                                assignee.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                                assignee.email.toLowerCase().includes(assigneeSearch.toLowerCase())
                              )
                              .map((assignee) => (
                                <div 
                                  key={assignee.id}
                                  onClick={() => {
                                    setEditingTaskAssignee(assignee.id);
                                    setAssigneeSearch(assignee.name);
                                    setShowAssigneeDropdown(false);
                                    handleUpdateTask('assignedTo', assignee.id);
                                  }}
                                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                  <div className={`w-8 h-8 bg-${assignee.color}-500 rounded-full flex items-center justify-center`}>
                                    <span className="text-white font-medium text-sm">{assignee.avatar}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{assignee.name}</div>
                                    <div className="text-xs text-gray-500">{assignee.email}</div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div className="border-t border-gray-200 p-2">
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                              Invite teammates via email
                            </button>
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                              Assign to multiple people
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due date</label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowDatePicker(!showDatePicker);
                          setSelectingMode('due'); // Default to due date mode
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <div className="flex items-center space-x-2">
                          <i className="ri-calendar-line text-gray-400"></i>
                          <span className="text-sm text-gray-700">{formatDateRange()}</span>
                        </div>
                        {(startDate || dueDate) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearDates();
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="Clear dates"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
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
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDueDate(null);
                                      }}
                                      className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                      title="Clear due date"
                                    >
                                      <i className="ri-close-line text-xs"></i>
                                    </button>
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

                  {/* Projects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">Sumit's first project</span>
                      <span className="text-xs text-gray-500">To do</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">Add to projects</button>
                  </div>

                  {/* Dependencies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dependencies</label>
                    <button className="text-sm text-blue-600 hover:text-blue-800">Add dependencies</button>
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
                        className="w-full px-3 py-2 focus:outline-none resize-none h-24"
                        placeholder="Type / for menu"
                      />
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
                          Create task
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtasks */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <button 
                        onClick={() => setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: !prev[selectedTask._id] }))}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        + Add subtask
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                        Draft subtasks
                      </button>
                    </div>
                    
                    {/* Add Subtask Input */}
                    {showSubtaskInput[selectedTask._id] && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newSubtaskName}
                            onChange={(e) => setNewSubtaskName(e.target.value)}
                            placeholder="Enter subtask name..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newSubtaskName.trim()) {
                                handleCreateSubtask(selectedTask._id, newSubtaskName.trim());
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newSubtaskName.trim()) {
                                handleCreateSubtask(selectedTask._id, newSubtaskName.trim());
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setNewSubtaskName('');
                              setShowSubtaskInput(prev => ({ ...prev, [selectedTask._id]: false }));
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Display Existing Subtasks */}
                    {taskSubtasks[selectedTask._id] && taskSubtasks[selectedTask._id].length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Subtasks ({taskSubtasks[selectedTask._id].length})</div>
                        <div className="space-y-2">
                          {taskSubtasks[selectedTask._id].map((subtask) => (
                            <div key={subtask._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
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
                              <span className={`text-sm ${subtask.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {subtask.task}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                subtask.priority === 'High' ? 'bg-purple-100 text-purple-800' : 
                                subtask.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {subtask.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments/Activity */}
                  <div>
                    <CommentsSection
                      taskId={selectedTask._id}
                      brandId={selectedTask.brandId || '1'}
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
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SM</span>
                      </div>
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-gray-600 text-sm"></i>
                      </div>
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-gray-600 text-sm"></i>
                      </div>
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