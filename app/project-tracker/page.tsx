
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import AddProjectModal from '../../components/AddProjectModal';
import EditProjectModal from '../../components/EditProjectModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../lib/api-service';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
  assignedTo?: string[];
}

type StatusFilter = 'All' | 'Active' | 'Completed' | 'On Hold';

export default function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProjects({
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      console.log('Fetched projects data:', data);
      
      // Ensure data is an array - handle different response formats
      let projectsData = [];
      if (Array.isArray(data)) {
        projectsData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.projects)) {
        projectsData = data.projects;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        projectsData = data.data;
      }
      console.log('Processed projects data:', projectsData);
      
      setProjects(projectsData);
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
    
    if (!searchQuery) return projectsArray;
    const q = searchQuery.toLowerCase();
    const filtered = projectsArray.filter((p) =>
      [p.title, p.description].some((field) => field?.toLowerCase().includes(q))
    );
    console.log('visibleProjects - filtered:', filtered);
    return filtered;
  }, [projects, searchQuery]);

  const handleAddProject = async (newProjectData: Omit<Project, 'id'>) => {
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

  const handleSaveProject = async (updatedProject: Project) => {
    try {
      await apiService.updateProject(updatedProject.id, updatedProject);
      await fetchProjects();
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
      setError('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
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
    setEditingProject(null);
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            
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
                      <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <Link href={`/project-tracker/${project.id}`} className="flex-1 cursor-pointer">
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
                                handleDeleteProject(project.id);
                              }}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                              title="Delete Project"
                            >
                              <i className="ri-delete-bin-line w-5 h-5"></i>
                            </button>
                            <Link href={`/project-tracker/${project.id}`}>
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
      </div>
    </ProtectedRoute>
  );
}
