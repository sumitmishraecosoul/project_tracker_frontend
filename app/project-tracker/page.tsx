'use client';

import { useState, useEffect } from 'react';
import VerticalLayout from '../../components/VerticalLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProjectManagement from '../../components/ProjectManagement';
import { useBrand } from '../../components/BrandContext';
import { useProjects } from '../../components/ProjectContext';

export default function ProjectTrackerPage() {
  const { currentBrand } = useBrand();
  const { projects, isLoading, error, getBrandProjects } = useProjects();
  const [showProjectManagement, setShowProjectManagement] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'onhold'>('all');

  useEffect(() => {
    console.log('ProjectTrackerPage - currentBrand:', currentBrand);
    if (currentBrand?.id) {
      console.log('ProjectTrackerPage - Loading projects for brand:', currentBrand.id);
      getBrandProjects(currentBrand.id);
    } else {
      console.log('ProjectTrackerPage - No current brand selected');
    }
  }, [currentBrand?.id]);

  useEffect(() => {
    console.log('ProjectTrackerPage - projects updated:', projects);
    console.log('ProjectTrackerPage - isLoading:', isLoading);
    console.log('ProjectTrackerPage - error:', error);
  }, [projects, isLoading, error]);

  // Filter projects based on active tab
  const getFilteredProjects = () => {
    if (!projects) return [];
    
    switch (activeTab) {
      case 'active':
        return projects.filter(project => project.status === 'Active');
      case 'completed':
        return projects.filter(project => project.status === 'Completed');
      case 'onhold':
        return projects.filter(project => project.status === 'On Hold');
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();

  // Get project counts for each tab
  const getProjectCounts = () => {
    if (!projects) return { total: 0, active: 0, completed: 0, onhold: 0 };
    
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'Active').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      onhold: projects.filter(p => p.status === 'On Hold').length
    };
  };

  const projectCounts = getProjectCounts();

  if (!currentBrand) {
    return (
      <VerticalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="ri-building-line text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Brand Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a brand to view and manage projects.
            </p>
            <button
              onClick={() => setShowProjectManagement(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Brand Management
            </button>
          </div>
        </div>
        
        {showProjectManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <ProjectManagement onClose={() => setShowProjectManagement(false)} />
            </div>
          </div>
        )}
        </VerticalLayout>
    );
  }

  return (
      <VerticalLayout>
      <div className="p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg mb-1">Overview of your projects and tasks</p>
          <p className="text-gray-600 text-lg">Role user • Department: Thrive</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`bg-white p-6 rounded-lg border transition-all duration-200 ${
              activeTab === 'all'
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="ri-folder-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projectCounts.total}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`bg-white p-6 rounded-lg border transition-all duration-200 ${
              activeTab === 'active'
                ? 'border-green-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="ri-check-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projectCounts.active}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`bg-white p-6 rounded-lg border transition-all duration-200 ${
              activeTab === 'completed'
                ? 'border-purple-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="ri-trophy-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{projectCounts.completed}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('onhold')}
            className={`bg-white p-6 rounded-lg border transition-all duration-200 ${
              activeTab === 'onhold'
                ? 'border-yellow-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <i className="ri-pause-line text-2xl text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-gray-900">{projectCounts.onhold}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <p className="text-gray-600 mt-1">Your latest projects and their status</p>
            </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <i className="ri-loader-4-line animate-spin text-3xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <i className="ri-folder-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first project for {currentBrand.name}.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Error: {error}</p>
                </div>
              )}
              <button
                onClick={() => setShowProjectManagement(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === 'Active' ? 'bg-green-100 text-green-800' :
                          project.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          project.priority === 'High' ? 'bg-red-100 text-red-800' :
                          project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.priority} Priority
                        </span>
                        <span className="text-sm text-gray-500">
                          {project.department}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowProjectManagement(true)}
                        className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProjects.length > 5 && (
                <div className="p-6 text-center border-t border-gray-200">
                                <button
                    onClick={() => setShowProjectManagement(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All {filteredProjects.length} Projects →
                                </button>
                        </div>
                      )}
                    </div>
                  )}
        </div>
                </div>
                
      {/* Project Management Modal */}
      {showProjectManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <ProjectManagement onClose={() => setShowProjectManagement(false)} />
          </div>
        </div>
        )}
      </VerticalLayout>
  );
}