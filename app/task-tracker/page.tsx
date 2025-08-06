
'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import AddTaskModal from '../../components/AddTaskModal';
import EditUserTaskModal from '../../components/EditUserTaskModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { usersData, userTasksData, UserTask } from '../../lib/data';

export default function TaskTracker() {
  const [activeUserId, setActiveUserId] = useState('1');
  const [userTasks, setUserTasks] = useState(userTasksData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<UserTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'daily' | 'weekly' | 'monthly' | 'adhoc'>('daily');

  const activeUser = usersData.find(user => user.id === activeUserId);
  const filteredTasks = userTasks
    .filter(task => task.userId === activeUserId)
    .filter(task => task.frequency.toLowerCase() === activeFilter);

  const handleAddTask = (newTask: Omit<UserTask, 'id'>) => {
    const task: UserTask = {
      ...newTask,
      id: Date.now().toString()
    };
    setUserTasks([...userTasks, task]);
    setIsAddModalOpen(false);
  };

  const handleEditTask = (task: UserTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = (updatedTask: UserTask) => {
    setUserTasks(userTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setIsEditModalOpen(false);
    setEditingTask(null);
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
                <div className="flex flex-wrap gap-2">
                  {usersData.map((user) => (
                    <button
                      key={user.id}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project for Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(task.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.typeOfWork}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.workDescription}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.projectForTask}</td>
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
                      {filteredTasks.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No {activeFilter} tasks found for this user.
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
          <AddTaskModal
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
