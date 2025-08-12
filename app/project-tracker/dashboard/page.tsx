'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiService } from '../../../lib/api-service';

interface DashboardStats {
  activeProjectsCount: number;
  totalTasksCount: number;
  inProgressTasksCount: number;
  completedTasksCount: number;
  totalTeamMembersCount: number;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  id: string;
  task: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Completed' | 'Blocked' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  reporter: {
    _id: string;
    name: string;
    email: string;
  };
  projectId: string;
  eta: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjectsCount: 0,
    totalTasksCount: 0,
    inProgressTasksCount: 0,
    completedTasksCount: 0,
    totalTeamMembersCount: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [projects, tasks, users] = await Promise.all([
        apiService.getProjects(),
        apiService.getTasks(),
        apiService.getUsers()
      ]);

      // Calculate stats
      const activeProjects = Array.isArray(projects) 
        ? projects.filter((p: any) => p.status === 'Active')
        : projects.projects?.filter((p: any) => p.status === 'Active') || [];

      const inProgressTasks = Array.isArray(tasks) 
        ? tasks.filter((t: any) => t.status === 'In Progress')
        : tasks.filter((t: any) => t.status === 'In Progress') || [];

      const completedTasks = Array.isArray(tasks) 
        ? tasks.filter((t: any) => t.status === 'Completed')
        : tasks.filter((t: any) => t.status === 'Completed') || [];

      const allProjects = Array.isArray(projects) ? projects : projects.projects || [];
      const allTasks = Array.isArray(tasks) ? tasks : tasks || [];
      const allUsers = Array.isArray(users) ? users : users || [];

      setStats({
        activeProjectsCount: activeProjects.length,
        totalTasksCount: allTasks.length,
        inProgressTasksCount: inProgressTasks.length,
        completedTasksCount: completedTasks.length,
        totalTeamMembersCount: allUsers.length
      });

      // Get recent projects (last 3)
      const sortedProjects = allProjects
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);
      
      setRecentProjects(sortedProjects);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Overview of your projects and tasks</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-folder-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeProjectsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-checkbox-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTasksCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-time-line text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgressTasksCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-team-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTeamMembersCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Projects */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                </div>
                <div className="p-6">
                  {recentProjects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No projects found</p>
                  ) : (
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4">
                    <Link 
                      href="/project-tracker" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View all projects →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Task Progress */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Task Progress</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Completed Tasks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completed Tasks</span>
                        <span className="text-sm text-gray-500">{stats.completedTasksCount}/{stats.totalTasksCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: stats.totalTasksCount > 0 
                              ? `${(stats.completedTasksCount / stats.totalTasksCount) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* In Progress Tasks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">In Progress Tasks</span>
                        <span className="text-sm text-gray-500">{stats.inProgressTasksCount}/{stats.totalTasksCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: stats.totalTasksCount > 0 
                              ? `${(stats.inProgressTasksCount / stats.totalTasksCount) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href="/task-tracker" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View all tasks →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
