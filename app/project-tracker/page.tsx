
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import GanttChart from '../../components/GanttChart';
import AddProjectModal from '../../components/AddProjectModal';
import EditProjectModal from '../../components/EditProjectModal';
import TeamMemberManagement from '../../components/TeamMemberManagement';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../lib/api-service';
import { DEPARTMENTS } from '../../lib/constants';

interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
  department?: string;
  activeMembersCount?: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  assignedTo?: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  }>;
  teamMembers?: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      department: string;
    };
    role: string;
  }>;
}

interface PaginatedResponse {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  totalProjects: number;
}

interface PaginatedResponse {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  totalProjects: number;
}

type StatusFilter = 'All' | 'Active' | 'Completed' | 'On Hold';

export default function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProjectsList, setAllProjectsList] = useState<Array<{ id: string; title: string }>>([]);
  const [projectDropdown, setProjectDropdown] = useState<string>('All Projects');
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('list');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [allTasks, setAllTasks] = useState<Array<{
    _id: string;
    projectId: string;
    task: string;
    startDate?: string;
    eta: string;
    status: string;
  }>>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // Get current user for department filtering
    const userStr = localStorage.getItem('currentUser');
    console.log('ProjectTracker - Raw user string from localStorage:', userStr);
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('ProjectTracker - Parsed user data:', userData);
        setCurrentUser(userData);
        
        // Set default department based on user role
        if (userData.role === 'admin') {
          if (userData.department) {
            setDepartmentFilter(userData.department);
          } else {
            setDepartmentFilter('All Departments');
          }
        }
      } catch (parseError) {
        console.error('ProjectTracker - Error parsing user data:', parseError);
        setError('Invalid user data. Please log in again.');
      }
    } else {
      console.log('ProjectTracker - No user data found in localStorage');
    }
  }, []);

  // Fetch available departments for admin users
  const fetchDepartments = async () => {
    try {
      if (currentUser?.role === 'admin') {
        const departments = await apiService.getDepartments();
        setAvailableDepartments(departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    // Only fetch projects if currentUser is loaded
    if (currentUser) {
      fetchDepartments();
      fetchProjects();
      // Reset project dropdown filter when department changes
      setProjectDropdown('All Projects');
    }
  }, [statusFilter, departmentFilter, currentUser, currentPage, pageSize]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Prepare parameters for ALL projects (no pagination)
        const params: any = {
          limit: 1000, // Large limit to get all projects
          page: 1
        };
        
        // Add status filter if not "All"
        if (statusFilter !== 'All') {
          params.status = statusFilter;
        }
        
        // Add department filter for admin users only
        if (currentUser?.role === 'admin') {
          // Always send department parameter - backend will handle "All Departments" case
          params.department = departmentFilter;
        }
        
        console.log('Loading all projects for dropdown with params:', params);
        const data = await apiService.getProjects(params);
        const arr = Array.isArray(data) ? data : (data && Array.isArray(data.projects) ? data.projects : []);
        const list = (arr || []).map((p: any) => ({ id: p._id || p.id, title: p.title }));
        // Sort alphabetically by title
        const sortedList = list.sort((a: { id: string; title: string }, b: { id: string; title: string }) => a.title.localeCompare(b.title));
        console.log('All projects for dropdown (sorted):', sortedList);
        setAllProjectsList(sortedList);
      } catch (error) {
        console.error('Failed to load all projects for dropdown:', error);
        setAllProjectsList([]);
      }
    };
    if (currentUser) {
      loadAll();
    }
  }, [currentUser, departmentFilter, statusFilter]);

  // Load all tasks once for Gantt view
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await apiService.getTasks();
        setAllTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load tasks for gantt:', e);
        setAllTasks([]);
      }
    };
    loadTasks();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      console.log('Fetching projects...');
      console.log('Current user:', currentUser);
      console.log('Status filter:', statusFilter);
      console.log('Department filter:', departmentFilter);
      console.log('Current page:', currentPage);
      console.log('Page size:', pageSize);
      
      // Check if current user has required fields
      if (!currentUser || !currentUser._id || !currentUser.role || !currentUser.department) {
        console.error('Current user missing required fields:', currentUser);
        setError('User information is incomplete. Please log in again.');
        setProjects([]);
        return;
      }
      
      const params: any = {
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      };
      
      // Add department filter for admin users only
      if (currentUser?.role === 'admin') {
        // Always send department parameter - backend will handle "All Departments" case
        params.department = departmentFilter;
      }
      
      console.log('API params:', params);
      const response = await apiService.getProjects(params);
      console.log('Projects API response:', response);
      
      // Handle the paginated response format
      if (response && response.projects && Array.isArray(response.projects)) {
        setProjects(response.projects);
        setCurrentPage(response.currentPage || 1);
        setTotalPages(response.totalPages || 1);
        setTotalProjects(response.totalProjects || 0);
        console.log('Projects set from paginated response:', response.projects);
        console.log('Pagination info:', {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalProjects: response.totalProjects
        });
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array (backward compatibility)
        setProjects(response);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalProjects(response.length);
        console.log('Projects set from array response:', response);
      } else {
        console.error('Unexpected projects response format:', response);
        setProjects([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalProjects(0);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to load projects';
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage = 'Server error: Please check if you have proper permissions to view projects';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication error: Please log in again';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied: You do not have permission to view these projects';
        } else {
          errorMessage = `Failed to load projects: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setProjects([]); // Set empty array on error
      setCurrentPage(1);
      setTotalPages(1);
      setTotalProjects(0);
    }
    setLoading(false);
  };

  const visibleProjects = useMemo(() => {
    // Ensure projects is an array and filter out null/undefined items
    const projectsArray = Array.isArray(projects) ? projects.filter(p => p !== null && p !== undefined) : [];
    console.log('visibleProjects - projects array:', projectsArray);
    
    // Apply project dropdown filter first
    let filteredList = projectsArray;
    if (projectDropdown && projectDropdown !== 'All Projects') {
      filteredList = filteredList.filter(p => p && (p._id || p.id) === projectDropdown);
    }
    // Then search
    if (!searchQuery) {
      // Sort alphabetically by title when no search query
      return filteredList.sort((a: Project, b: Project) => a.title.localeCompare(b.title));
    }
    const q = searchQuery.toLowerCase();
    const filtered = filteredList.filter((p) =>
      p && [p.title, p.description].some((field) => field?.toLowerCase().includes(q))
    );
    console.log('visibleProjects - filtered:', filtered);
    // Sort alphabetically by title
    return filtered.sort((a: Project, b: Project) => a.title.localeCompare(b.title));
  }, [projects, searchQuery, projectDropdown]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b ${
            i === currentPage
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );
    
    return buttons;
  };

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthIndex = (dateStr?: string) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const m = d.getMonth();
    return isNaN(m) ? 0 : m;
  };
  const projectBarColor = (status: string) => (
    status === 'Active' ? 'bg-green-500' : status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-500'
  );
  const taskBarColor = (status: string) => (
    status === 'Completed' ? 'bg-green-500' : status === 'In Progress' ? 'bg-yellow-500' : status === 'Blocked' ? 'bg-red-600' : status === 'On Hold' ? 'bg-orange-500' : status === 'Cancelled' ? 'bg-gray-500' : 'bg-gray-400'
  );

  const renderGantt = () => {
    // Map tasks by project id
    const tasksByProject: Record<string, any[]> = {};
    (allTasks || []).forEach((t: any) => {
      const pid = t.projectId;
      if (!pid) return;
      if (!tasksByProject[pid]) tasksByProject[pid] = [];
      tasksByProject[pid].push(t);
    });

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Gantt Chart</h2>
            <div className="text-xs text-gray-500">Months</div>
          </div>
          <div className="px-6 py-4">
            {/* Header months */}
            <div
              className="grid text-xs font-medium text-gray-600 mb-3"
              style={{ gridTemplateColumns: '250px repeat(12, minmax(0, 1fr))' }}
            >
              <div className="pr-2">Project / Task</div>
              {monthLabels.map((m) => (
                <div key={m} className="text-center">{m}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {visibleProjects.map((p) => {
                // Handle optional project dates
                const projectStartDate = p.startDate || new Date().toISOString().split('T')[0];
                const projectDueDate = p.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to 30 days from now
                
                const pStart = monthIndex(projectStartDate as any);
                const pEnd = Math.max(pStart, monthIndex(projectDueDate as any));
                const subTasks = tasksByProject[p._id] || tasksByProject[p.id as any] || [];
                return (
                  <div key={p._id || p.id} className="border-t border-gray-200 pt-3">
                    {/* Project row */}
                    <div
                      className="grid items-center"
                      style={{ gridTemplateColumns: '250px repeat(12, minmax(0, 1fr))' }}
                    >
                      <div className="pr-2 text-sm font-medium text-gray-900">{p.title}</div>
                      {/* Project bar */}
                      <div
                        className={`h-3 rounded ${projectBarColor(p.status)}`}
                        style={{ gridColumn: `${pStart + 2} / ${pEnd + 3}` }}
                        title={`${p.title}: ${p.startDate ? new Date(p.startDate).toLocaleDateString() : 'No start date'} - ${p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No due date'}`}
                      />
                    </div>
                    {/* Task rows */}
                    <div className="mt-2 space-y-2">
                      {subTasks.map((t: any) => {
                        const tStart = t.startDate ? monthIndex(t.startDate) : pStart;
                        const tEnd = Math.max(tStart, monthIndex(t.eta));
                        return (
                          <div
                            key={t._id}
                            className="grid items-center"
                            style={{ gridTemplateColumns: '250px repeat(12, minmax(0, 1fr))' }}
                          >
                            <div className="pr-2 text-xs text-gray-700">{t.task}</div>
                            <div
                              className={`h-3 rounded ${taskBarColor(t.status)}`}
                              style={{ gridColumn: `${tStart + 2} / ${tEnd + 3}` }}
                              title={`${t.task}: ${t.startDate ? new Date(t.startDate).toLocaleDateString() : ''} - ${new Date(t.eta).toLocaleDateString()} (${t.status})`}
                            />
                          </div>
                        );
                      })}
                      {subTasks.length === 0 && (
                        <div className="text-xs text-gray-400 ml-1">No tasks</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddProject = async (newProjectData: {
    title: string;
    description: string;
    status: 'Active' | 'Completed' | 'On Hold';
    priority: 'Low' | 'Medium' | 'High';
    startDate: string;
    dueDate: string;
    assignedTo: string[];
    teamMembers?: Array<{
      user: string;
      role: string;
    }>;
  }) => {
    try {
      console.log('Creating project with data:', newProjectData);
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      console.log('Auth token:', localStorage.getItem('token'));
      
      const result = await apiService.createProject(newProjectData);
      console.log('Project created successfully:', result);
      
      await fetchProjects();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add project:', error);
      setError(`Failed to add project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async (projectId: string, updatedProject: {
    title: string;
    description: string;
    status: 'Active' | 'Completed' | 'On Hold';
    priority: 'Low' | 'Medium' | 'High';
    startDate: string;
    dueDate: string;
    assignedTo: string[];
    teamMembers?: Array<{
      user: string;
      role: string;
    }>;
  }) => {
    try {
      await apiService.updateProject(projectId, updatedProject);
      await fetchProjects();
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
      setError('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) return;
    
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await apiService.deleteProject(projectId);
        await fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        setError('Failed to delete project');
      }
    }
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsTeamModalOpen(false);
    setEditingProject(null);
    setSelectedProjectForTeam(null);
  };

  const handleTeamManagement = (project: Project) => {
    setSelectedProjectForTeam(project);
    setIsTeamModalOpen(true);
  };

  const handleTeamUpdate = async () => {
    try {
      // Add a longer delay to ensure API operations have completed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh the projects list
      await fetchProjects();
      
      // Refresh the team management modal data
      await refreshTeamManagementData();
    } catch (error) {
      console.error('Failed to update team data:', error);
    }
  };

  // Function to refresh team management modal data
  const refreshTeamManagementData = async () => {
    if (selectedProjectForTeam) {
      try {
        const freshProjectData = await apiService.getProjectById(selectedProjectForTeam._id);
        if (freshProjectData) {
          setSelectedProjectForTeam(freshProjectData);
        }
      } catch (error) {
        console.error('Failed to refresh team management data:', error);
      }
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper functions for role-based permissions
  const canEditProject = (project: Project): boolean => {
    if (!currentUser) return false;
    
    // Admin can edit any project
    if (currentUser.role === 'admin') return true;
    
    // Manager can edit projects from their department
    if (currentUser.role === 'manager') {
      return project.department === currentUser.department;
    }
    
    // Employees cannot edit any projects
    return false;
  };

  const canDeleteProject = (project: Project): boolean => {
    if (!currentUser) return false;
    
    // Admin can delete any project
    if (currentUser.role === 'admin') return true;
    
    // Manager can delete projects from their department
    if (currentUser.role === 'manager') {
      return project.department === currentUser.department;
    }
    
    // Employees cannot delete any projects
    return false;
  };

  const canCreateProject = (): boolean => {
    if (!currentUser) return false;
    
    // Admin and managers can create projects
    return currentUser.role === 'admin' || currentUser.role === 'manager';
  };

  // Check if user is properly loaded
  if (!currentUser || !currentUser._id || !currentUser.role || !currentUser.department) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user information...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we verify your permissions</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Tracker</h1>
                <p className="text-gray-600">Manage and track all your projects</p>
                {currentUser && (
                  <p className="text-sm text-gray-500 mt-1">
                    Role: {currentUser.role} • Department: {currentUser.department}
                  </p>
                )}
              </div>
              {canCreateProject() && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer whitespace-nowrap flex items-center space-x-2"
                >
                  <i className="ri-add-line w-5 h-5"></i>
                  <span>Add New Project</span>
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => {
                      setError('');
                      fetchProjects();
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {(['All','Active','Completed','On Hold'] as StatusFilter[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {currentUser?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="All Departments">All Departments</option>
                      {(availableDepartments.length > 0 ? availableDepartments : DEPARTMENTS).map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={projectDropdown}
                    onChange={(e) => setProjectDropdown(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="All Projects">All Projects</option>
                    {allProjectsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2 bg-gray-100 rounded-full p-1">
                {(['gantt','list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode===v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {v === 'gantt' ? 'Gantt View' : 'List View'}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === 'gantt' ? (
              <GanttChart
                projects={visibleProjects as any}
                tasks={allTasks as any}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Show:</label>
                        <select
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600">per page</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loading || !currentUser ? (
                    <p>{!currentUser ? 'Loading user information...' : 'Loading projects...'}</p>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(visibleProjects) && visibleProjects.map((project) => (
                        <div key={project?._id || project?.id || Math.random()} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <Link href={`/project-tracker/${project?._id}`} className="flex-1 cursor-pointer">
                              <div>
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{project?.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project?.priority)}`}>
                                    {project?.priority}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-4">{project?.description}</p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <i className="ri-calendar-line w-4 h-4 mr-2"></i>
                                    <span>Start: {new Date(project?.startDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <i className="ri-flag-line w-4 h-4 mr-2"></i>
                                    <span>Due: {project?.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <i className="ri-building-line w-4 h-4 mr-2"></i>
                                    <span>{project?.department || 'No Department'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <i className="ri-team-line w-4 h-4 mr-2"></i>
                                    <span>{project?.activeMembersCount || 0} active members</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center space-x-4 ml-6">
                              <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                project?.status === 'Active' 
                                  ? 'bg-green-100 text-green-800'
                                  : project?.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {project?.status}
                              </span>
                              {canEditProject(project) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleEditProject(project);
                                  }}
                                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                                  title="Edit Project"
                                >
                                  <i className="ri-edit-line w-5 h-5"></i>
                                </button>
                              )}
                              {canEditProject(project) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleTeamManagement(project);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                  title="Manage Team"
                                >
                                  <i className="ri-team-line w-5 h-5"></i>
                                </button>
                              )}
                              {canDeleteProject(project) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (project._id) {
                                      handleDeleteProject(project._id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 cursor-pointer"
                                  title="Delete Project"
                                >
                                  <i className="ri-delete-bin-line w-5 h-5"></i>
                                </button>
                              )}
                              <Link href={`/project-tracker/${project?._id}`}>
                                <i className="ri-arrow-right-line w-5 h-5 text-gray-400"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!Array.isArray(visibleProjects) || visibleProjects.length === 0) && !loading && (
                        <div className="text-center py-8 text-gray-500">
                          {!Array.isArray(visibleProjects) ? 'Error loading projects' : 'No projects found with current filters.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProjects)} of {totalProjects} projects
                      </div>
                      <div className="flex items-center space-x-1">
                        {generatePaginationButtons()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isAddModalOpen && (
          <AddProjectModal
            onSave={handleAddProject}
            onClose={handleCloseModals}
          />
        )}

        {isEditModalOpen && editingProject && (
          <EditProjectModal
            project={editingProject}
            onSave={handleSaveProject}
            onClose={handleCloseModals}
          />
        )}

        {isTeamModalOpen && selectedProjectForTeam && (
          <TeamMemberManagement
            key={`team-management-${selectedProjectForTeam._id}-${JSON.stringify(selectedProjectForTeam.teamMembers)}`}
            projectId={selectedProjectForTeam._id}
            currentTeamMembers={selectedProjectForTeam.teamMembers || []}
            onTeamUpdate={handleTeamUpdate}
            onClose={() => {
              setIsTeamModalOpen(false);
              setSelectedProjectForTeam(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
