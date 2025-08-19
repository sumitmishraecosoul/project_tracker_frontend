
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

interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
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
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');
  const [allTasks, setAllTasks] = useState<Array<{
    _id: string;
    projectId: string;
    task: string;
    startDate?: string;
    eta: string;
    status: string;
  }>>([]);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await apiService.getProjects();
        const arr = Array.isArray(data) ? data : (data && Array.isArray(data.projects) ? data.projects : []);
        const list = (arr || []).map((p: any) => ({ id: p._id || p.id, title: p.title }));
        setAllProjectsList(list);
      } catch {}
    };
    loadAll();
  }, []);

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
      const response = await apiService.getProjects({
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      console.log('Projects API response:', response);
      
      // Handle the new paginated response format
      if (response && response.projects) {
        setProjects(response.projects);
        console.log('Projects set from paginated response:', response.projects);
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setProjects(response);
        console.log('Projects set from array response:', response);
      } else {
        console.error('Unexpected projects response format:', response);
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects');
      setProjects([]); // Set empty array on error
    }
    setLoading(false);
  };

  const visibleProjects = useMemo(() => {
    // Ensure projects is an array
    const projectsArray = Array.isArray(projects) ? projects : [];
    console.log('visibleProjects - projects array:', projectsArray);
    
    // Apply project dropdown filter first
    let filteredList = projectsArray;
    if (projectDropdown && projectDropdown !== 'All Projects') {
      filteredList = filteredList.filter(p => (p._id || p.id) === projectDropdown);
    }
    // Then search
    if (!searchQuery) return filteredList;
    const q = searchQuery.toLowerCase();
    const filtered = filteredList.filter((p) =>
      [p.title, p.description].some((field) => field?.toLowerCase().includes(q))
    );
    console.log('visibleProjects - filtered:', filtered);
    return filtered;
  }, [projects, searchQuery, projectDropdown]);

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
                const pStart = monthIndex(p.startDate as any);
                const pEnd = Math.max(pStart, monthIndex(p.dueDate as any));
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
                        title={`${p.title}: ${new Date(p.startDate).toLocaleDateString()} - ${new Date(p.dueDate).toLocaleDateString()}`}
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
  }) => {
    try {
      await apiService.createProject(newProjectData);
      await fetchProjects();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add project:', error);
      setError('Failed to add project');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async (updatedProject: {
    _id: string;
    title: string;
    description: string;
    status: 'Active' | 'Completed' | 'On Hold';
    priority: 'Low' | 'Medium' | 'High';
    startDate: string;
    dueDate: string;
    assignedTo: string[];
  }) => {
    try {
      await apiService.updateProject(updatedProject._id, updatedProject);
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
      // Refresh the projects list
      await fetchProjects();
      
      // If we have a selected project for team management, refresh its data
      if (selectedProjectForTeam) {
        console.log('Refreshing selected project data for team management:', selectedProjectForTeam._id);
        const updatedProject = await apiService.getProjectById(selectedProjectForTeam._id);
        console.log('Updated project data:', updatedProject);
        
        if (updatedProject) {
          setSelectedProjectForTeam(updatedProject);
        }
      }
    } catch (error) {
      console.error('Failed to update team data:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
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
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <i className="ri-add-line w-5 h-5"></i>
                <span>Add New Project</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-1">
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
                  <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
                </div>
                <div className="p-6">
                  {loading ? (
                    <p>Loading projects...</p>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(visibleProjects) && visibleProjects.map((project) => (
                        <div key={project._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <Link href={`/project-tracker/${project._id}`} className="flex-1 cursor-pointer">
                              <div>
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                    {project.priority}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-4">{project.description}</p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <i className="ri-calendar-line w-4 h-4 mr-2"></i>
                                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <i className="ri-flag-line w-4 h-4 mr-2"></i>
                                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center space-x-4 ml-6">
                              <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                project.status === 'Active' 
                                  ? 'bg-green-100 text-green-800'
                                  : project.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {project.status}
                              </span>
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
                              <Link href={`/project-tracker/${project._id}`}>
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
