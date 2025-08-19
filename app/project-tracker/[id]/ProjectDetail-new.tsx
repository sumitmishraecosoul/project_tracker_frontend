'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import EditTaskModal from '../../../components/EditTaskModal';
import AddTaskModal from '../../../components/AddTaskModal';
import { apiService } from '../../../lib/api-service';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdDate: string;
  dueDate: string;
  priority: string;
  startDate: string;
}

  interface Task {
  id: string;
  projectId: string;
  task: string;
  description?: string;
    taskType: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled';
  assignedTo: string;
  reporter: string;
  startDate?: string;
  eta: string;
  estimatedHours?: number;
  actualHours?: number;
  remark?: string;
  roadBlock?: string;
  supportNeeded?: string;
  labels: string[];
  attachments: string[];
  relatedTasks: string[];
  parentTask?: string;
  sprint?: string;
}

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    }
    setLoading(false);
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'projectId'>) => {
    try {
      const taskData = {
        ...newTaskData,
        projectId
      };
      console.log('Creating task with data:', taskData);
      await apiService.createTask(taskData);
      await fetchProjectData();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    try {
      await apiService.updateTask(updatedTask.id, updatedTask);
      await fetchProjectData();
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.deleteTask(taskId);
        await fetchProjectData();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await apiService.updateTaskStatus(taskId, status);
      await fetchProjectData();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
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
                  <p className="mt-1 text-gray-900">{project.priority}</p>
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

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Project Tasks</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap flex items-center space-x-2"
            >
              <i className="ri-add-line w-4 h-4"></i>
              <span>Add Task</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.task}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.taskType === 'Daily'
                            ? 'bg-blue-100 text-blue-800'
                            : task.taskType === 'Weekly'
                            ? 'bg-purple-100 text-purple-800'
                            : task.taskType === 'Monthly'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.taskType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(task.eta).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="Yet to Start">Yet to Start</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Blocked">Blocked</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.actualHours || 0}h / {task.estimatedHours || 0}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        >
                          <i className="ri-edit-line w-4 h-4"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line w-4 h-4"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddTaskModal
          projectId={projectId}
          onSave={handleAddTask}
          onClose={handleCloseModal}
        />
      )}

      {isEditModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
