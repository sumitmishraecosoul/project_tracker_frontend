'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import EditTaskModal from '../../../components/EditTaskModal';
import { apiService } from '../../../lib/api-service';

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

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  dueDate: string;
  estimatedHours?: number;
  actualHours?: number;
}

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectData, tasksData] = await Promise.all([
        apiService.getProjectById(projectId),
        apiService.getProjectTasks(projectId)
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setError('Failed to load project data');
    }
    setLoading(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    try {
      await apiService.updateTask(updatedTask.id, updatedTask);
      await fetchProjectData();
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-600">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/project-tracker" className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Priority</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    project.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : project.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {project.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Start Date</p>
                  <p className="mt-1 text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="mt-1 text-gray-900">{new Date(project.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'Completed' 
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : task.status === 'Blocked'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.actualHours || 0}/{task.estimatedHours || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-edit-line w-4 h-4"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No tasks found for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}