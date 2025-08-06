
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import AddProjectModal from '../../components/AddProjectModal';
import EditProjectModal from '../../components/EditProjectModal';
import { projectsData } from '../../lib/data';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdDate: string;
  dueDate: string;
}

export default function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>(projectsData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleAddProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: (projects.length + 1).toString()
    };
    setProjects([...projects, newProject]);
    setIsAddModalOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleSaveProject = (updatedProject: Project) => {
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingProject(null);
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
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <Link href={`/project-tracker/${project.id}`} className="flex-1 cursor-pointer">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center">
                                <i className="ri-calendar-line w-4 h-4 mr-2"></i>
                                <span>Created: {new Date(project.createdDate).toLocaleDateString()}</span>
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
                          <Link href={`/project-tracker/${project.id}`}>
                            <i className="ri-arrow-right-line w-5 h-5 text-gray-400"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
