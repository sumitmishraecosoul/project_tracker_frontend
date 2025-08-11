
'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import AddUserTaskModal from '../../components/AddUserTaskModal';
import EditUserTaskModal from '../../components/EditUserTaskModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../lib/api-service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface UserTask {
  id: string;
  userId: string;
  date: string;
  typeOfWork: string;
  workDescription: string;
  project: string;
  task: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  status: 'Pending' | 'In Progress' | 'Completed';
  hoursSpent?: number;
  notes?: string;
}

export default function TaskTracker() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState('');
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<UserTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'daily' | 'weekly' | 'monthly' | 'adhoc'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      fetchUserTasks();
    }
  }, [activeUserId]);

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData as User[]);
      if (usersData.length > 0 && !activeUserId) {
        setActiveUserId(usersData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    }
  };

  const fetchUserTasks = async () => {
    if (!activeUserId) return;
    setLoading(true);
    try {
      const data = await apiService.getUserTasks({ 
        userId: activeUserId,
      });
      const tasksData = Array.isArray(data) ? data : [];
      setUserTasks(tasksData as UserTask[]);
    } catch (error) {
      console.error('Failed to fetch user tasks:', error);
      setError('Failed to load tasks');
    }
    setLoading(false);
  };

  const activeUser = users.find(user => user.id === activeUserId);
  const filteredTasks = Array.isArray(userTasks) ? userTasks.filter(task => 
    task.frequency.toLowerCase() === activeFilter
  ) : [];

  const handleAddTask = async (newTask: Omit<UserTask, 'id'>) => {
    try {
      await apiService.createUserTask(newTask);
      await fetchUserTasks();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      setError('Failed to add task');
    }
  };

  const handleEditTask = (task: UserTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask: UserTask) => {
    try {
      await apiService.updateUserTask(updatedTask.id, updatedTask);
      await fetchUserTasks();
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiService.deleteUserTask(taskId);
      await fetchUserTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Tracker</h1>
              <p className="text-gray-600">Manage individual tasks and track progress</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(users) && users.map((user, index) => (
                    <button
                      key={user.id || `user-${index}`}
                      onClick={() => setActiveUserId(user.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                        activeUserId === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>

              {activeUser && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{activeUser.name}</h3>
                      <p className="text-gray-600">{activeUser.role}</p>
                      <p className="text-sm text-gray-500">{activeUser.email}</p>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center"
                    >
                      <i className="ri-add-line w-4 h-4 mr-2"></i>
                      Add New Task
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-full p-1 w-fit">
                  {['daily', 'weekly', 'monthly', 'adhoc'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter as any)}
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                        activeFilter === filter
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type of Work</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                            Loading tasks...
                          </td>
                        </tr>
                      ) : Array.isArray(filteredTasks) && filteredTasks.length > 0 ? (
                        filteredTasks.map((task, index) => (
                          <tr key={task.id || `task-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(task.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.typeOfWork}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.workDescription}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.project}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {task.frequency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                task.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : task.status === 'In Progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.hoursSpent || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="text-blue-600 hover:text-blue-900 cursor-pointer whitespace-nowrap"
                                  title="Edit Task"
                                >
                                  <i className="ri-edit-line w-4 h-4"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600 hover:text-red-900 cursor-pointer whitespace-nowrap"
                                  title="Delete Task"
                                >
                                  <i className="ri-delete-bin-line w-4 h-4"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                            {Array.isArray(filteredTasks) ? `No ${activeFilter} tasks found for this user.` : 'No tasks available.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAddModalOpen && (
          <AddUserTaskModal
            userId={activeUserId}
            onAdd={handleAddTask}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}

        {isEditModalOpen && editingTask && (
          <EditUserTaskModal
            task={editingTask}
            onSave={handleUpdateTask}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
