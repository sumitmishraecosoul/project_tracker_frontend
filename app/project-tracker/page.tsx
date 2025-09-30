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
        <div className="flex items-center justify-between mb-6">
              <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-1">
              Manage projects for <span className="font-medium text-blue-600">{currentBrand.name}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (currentBrand?.id) {
                  console.log('Manual refresh - Loading projects for brand:', currentBrand.id);
                  getBrandProjects(currentBrand.id);
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
            <button
              onClick={() => setShowProjectManagement(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="ri-settings-3-line mr-2"></i>
              Manage Projects
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="ri-folder-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
                </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="ri-check-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'Active').length}
                </p>
                </div>
                  </div>
                </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="ri-trophy-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'Completed').length}
                </p>
                </div>
              </div>
            </div>
            
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <i className="ri-pause-line text-2xl text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'On Hold').length}
                </p>
              </div>
            </div>
          </div>
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
              {projects.slice(0, 5).map((project) => (
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
              
              {projects.length > 5 && (
                <div className="p-6 text-center border-t border-gray-200">
                                <button
                    onClick={() => setShowProjectManagement(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All {projects.length} Projects →
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