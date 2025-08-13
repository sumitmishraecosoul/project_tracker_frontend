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
  totalProjectsCount: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
}

interface DashboardData {
  activeProjectsCount: number;
  totalTasksCount: number;
  inProgressTasksCount: number;
  completedTasksCount: number;
  totalTeamMembersCount: number;
  totalProjectsCount: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
  recentProjects: Project[];
  taskProgress: {
    completed: number;
    inProgress: number;
    total: number;
  };
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
    totalTeamMembersCount: 0,
    totalProjectsCount: 0,
    pendingTasksCount: 0,
    overdueTasksCount: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [taskProgress, setTaskProgress] = useState({ completed: 0, inProgress: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the new optimized dashboard API
      const dashboardData: DashboardData = await apiService.getDashboardSummary();
      
      // Validate the response structure
      if (!dashboardData || typeof dashboardData !== 'object') {
        throw new Error('Invalid dashboard data received');
      }
      
      // Set stats directly from API response with fallbacks
      setStats({
        activeProjectsCount: dashboardData.activeProjectsCount || 0,
        totalTasksCount: dashboardData.totalTasksCount || 0,
        inProgressTasksCount: dashboardData.inProgressTasksCount || 0,
        completedTasksCount: dashboardData.completedTasksCount || 0,
        totalTeamMembersCount: dashboardData.totalTeamMembersCount || 0,
        totalProjectsCount: dashboardData.totalProjectsCount || 0,
        pendingTasksCount: dashboardData.pendingTasksCount || 0,
        overdueTasksCount: dashboardData.overdueTasksCount || 0
      });

      // Set recent projects and task progress with fallbacks
      setRecentProjects(dashboardData.recentProjects || []);
      setTaskProgress(dashboardData.taskProgress || { completed: 0, inProgress: 0, total: 0 });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      
      // Set default values on error
      setStats({
        activeProjectsCount: 0,
        totalTasksCount: 0,
        inProgressTasksCount: 0,
        completedTasksCount: 0,
        totalTeamMembersCount: 0,
        totalProjectsCount: 0,
        pendingTasksCount: 0,
        overdueTasksCount: 0
      });
      setRecentProjects([]);
      setTaskProgress({ completed: 0, inProgress: 0, total: 0 });
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                  <p className="text-gray-600">Overview of your projects and tasks</p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
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
                        <span className="text-sm text-gray-500">{taskProgress.completed}/{taskProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: taskProgress.total > 0 
                              ? `${(taskProgress.completed / taskProgress.total) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* In Progress Tasks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">In Progress Tasks</span>
                        <span className="text-sm text-gray-500">{taskProgress.inProgress}/{taskProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: taskProgress.total > 0 
                              ? `${(taskProgress.inProgress / taskProgress.total) * 100}%` 
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
