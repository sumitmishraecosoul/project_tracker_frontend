'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from './TaskContext';
import { useBrand } from './BrandContext';
import { TaskAnalytics as TaskAnalyticsType } from '../lib/types';

interface TaskAnalyticsProps {
  projectId?: string;
}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ projectId }) => {
  const { getTaskAnalytics, tasks, loading } = useTasks();
  const { currentBrand } = useBrand();
  const [analytics, setAnalytics] = useState<TaskAnalyticsType | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadAnalytics = async () => {
    if (!currentBrand) return;
    
    setAnalyticsLoading(true);
    try {
      const data = await getTaskAnalytics(currentBrand.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading task analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [currentBrand]);

  if (!currentBrand) {
    return (
      <div className="p-6 text-center text-gray-500">
        Please select a brand to view task analytics
      </div>
    );
  }

  if (analyticsLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center text-gray-500">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Task Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="ri-task-line text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{analytics.completedTasks}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="ri-check-line text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.inProgressTasks}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="ri-play-circle-line text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.completionRate}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <i className="ri-percent-line text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.statusDistribution).map(([status, count]) => {
            const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'Completed' ? 'bg-green-500' :
                    status === 'In Progress' ? 'bg-blue-500' :
                    status === 'Yet to Start' ? 'bg-gray-500' :
                    status === 'Blocked' ? 'bg-red-500' :
                    status === 'On Hold' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'Completed' ? 'bg-green-500' :
                        status === 'In Progress' ? 'bg-blue-500' :
                        status === 'Yet to Start' ? 'bg-gray-500' :
                        status === 'Blocked' ? 'bg-red-500' :
                        status === 'On Hold' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analytics.priorityDistribution).map(([priority, count]) => (
            <div key={priority} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                priority === 'High' ? 'bg-red-100' :
                priority === 'Medium' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                <span className={`text-xl font-bold ${
                  priority === 'High' ? 'text-red-600' :
                  priority === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {count}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">{priority} Priority</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      {analytics.teamPerformance && analytics.teamPerformance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.teamPerformance.map((member, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{member.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.assignedTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.completedTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${member.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{member.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAnalytics;
