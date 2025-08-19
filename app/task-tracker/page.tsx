
'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import AddUserTaskModal from '../../components/AddUserTaskModal';
import EditTaskModal from '../../components/EditTaskModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../lib/api-service';

interface Task {
  _id: string;
  id: string;
  projectId: string;
  task: string;
  description?: string;
  taskType?: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: string;
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled';
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
  startDate?: string;
  eta: string;
  estimatedHours?: number;
  actualHours?: number;
  remark?: string;
  roadBlock?: string;
  supportNeeded?: string;
  labels?: string[];
  attachments?: string[];
  relatedTasks?: string[];
  parentTask?: string;
  sprint?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default function TaskTracker() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('');
  const [activeTaskTab, setActiveTaskTab] = useState<'All Tasks' | 'Daily Tasks' | 'Weekly Tasks' | 'Monthly Tasks' | 'Adhoc Tasks'>('All Tasks');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled'>('All');
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [projectsList, setProjectsList] = useState<Array<{ id: string; title: string }>>([]);
  const [projectFilter, setProjectFilter] = useState<string>('All Projects');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      fetchTasks();
    }
  }, [activeUserId, activeTaskTab, statusFilter, projectFilter]);

  useEffect(() => {
    const fetchProjectsMap = async () => {
      try {
        const data = await apiService.getProjects();
        const arr = Array.isArray(data) ? data : (data && Array.isArray(data.projects) ? data.projects : []);
        const map: Record<string, string> = {};
        (arr || []).forEach((p: any) => {
          if (p && (p._id || p.id)) {
            map[p._id || p.id] = p.title;
          }
        });
        setProjectMap(map);
        const list = (arr || []).map((p: any) => ({ id: p._id || p.id, title: p.title }));
        setProjectsList(list);
      } catch {}
    };
    fetchProjectsMap();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      console.log('Raw users data from API:', data);
      const usersData = Array.isArray(data) ? data : [];
      console.log('Processed users data:', usersData);
      console.log('Sample user structure:', usersData[0]);
      console.log('All users with IDs:', usersData.map(u => ({ id: u.id, _id: u._id, name: u.name, email: u.email })));
      setUsers(usersData as User[]);
      if (usersData.length > 0 && !activeUserId) {
        console.log('Setting first user as active:', usersData[0]);
        console.log('First user ID:', usersData[0].id);
        console.log('First user _id:', usersData[0]._id);
        if (usersData[0]._id) {
          setActiveUserId(usersData[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    }
  };

  const fetchTasks = async () => {
    console.log('=== fetchTasks called ===');
    if (!activeUserId) {
      console.log('No activeUserId, returning early');
      return;
    }
    console.log('Fetching tasks for user ID:', activeUserId);
    setLoading(true);
    try {
      console.log('Calling apiService.getTasks()...');
      const typeParam =
        activeTaskTab === 'All Tasks' ? 'All' :
        activeTaskTab === 'Daily Tasks' ? 'Daily' :
        activeTaskTab === 'Weekly Tasks' ? 'Weekly' :
        activeTaskTab === 'Monthly Tasks' ? 'Monthly' :
        'Adhoc';
      const projectIdParam = projectFilter && projectFilter !== 'All Projects' ? projectFilter : undefined;
      const data = await apiService.getTasks({
        assignedTo: activeUserId,
        taskType: typeParam,
        status: statusFilter === 'All' ? '' : statusFilter,
        projectId: projectIdParam
      });
      console.log('All tasks fetched from API:', data);
      console.log('Tasks data type:', typeof data);
      console.log('Tasks is array:', Array.isArray(data));
      
      // Check if data is an array and has the expected structure
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        setTasks([]);
        setLoading(false);
        return;
      }
      
      console.log('Number of tasks fetched:', data.length);
      
      // Log the first few tasks to see their structure
      if (data.length > 0) {
        console.log('Sample task structure:', data[0]);
        console.log('Sample task assignedTo field:', data[0].assignedTo);
        console.log('Sample task _id field:', data[0]._id);
        console.log('Sample task id field:', data[0].id);
      } else {
        console.log('No tasks found in API response');
      }
      
      // Filter tasks assigned to the active user
      let userTasks = data.filter((task: any) => {
        console.log(`Checking task ${task.task || task.title}: assignedTo=`, task.assignedTo);
        console.log(`Active user:`, activeUser);
        
        // Check if task is assigned to the active user
        if (task.assignedTo) {
          // New format: assignedTo is a populated user object
          if (task.assignedTo._id && task.assignedTo._id === activeUserId) {
            console.log(`Task ${task.task} matches by user ID: ${task.assignedTo._id}`);
            return true;
          }
          
          // Check by user name
          if (task.assignedTo.name && activeUser && task.assignedTo.name === activeUser.name) {
            console.log(`Task ${task.task} matches by user name: ${task.assignedTo.name}`);
            return true;
          }
          
          // Check by user email
          if (task.assignedTo.email && activeUser && task.assignedTo.email === activeUser.email) {
            console.log(`Task ${task.task} matches by user email: ${task.assignedTo.email}`);
            return true;
          }
        }
        
        console.log(`Task ${task.task} does not match`);
        return false;
      });
      // Apply project filter on the client if selected
      if (projectFilter && projectFilter !== 'All Projects') {
        userTasks = userTasks.filter((task: any) => task.projectId === projectFilter);
      }
      
      console.log('Tasks filtered for user:', userTasks);
      console.log('Active user:', activeUser);
      setTasks(userTasks as Task[]);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks');
    }
    setLoading(false);
  };

  const activeUser = users.find(user => user._id === activeUserId);
  const filteredTasks = Array.isArray(tasks) ? tasks : [];
  
  console.log('=== Task Display Debug ===');
  console.log('Active user:', activeUser);
  console.log('All tasks for user:', tasks);
  console.log('Active task tab:', activeTaskTab);
  console.log('Filtered tasks:', filteredTasks);
  console.log('Tasks array length:', tasks.length);
  console.log('Filtered tasks length:', filteredTasks.length);

  const handleAddTask = async (newTask: any) => {
    try {
      console.log('Task created successfully:', newTask);
      // Refresh the user tasks list
      await fetchTasks();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      setError('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task clicked:', task);
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (updatedTask: any) => {
    const saveTask = async () => {
      try {
        console.log('Saving updated task:', updatedTask);
        
        // Prepare the data for the API - only send the fields that the backend expects
        const taskDataForAPI = {
          task: updatedTask.task,
          description: updatedTask.description,
          taskType: updatedTask.taskType,
          status: updatedTask.status,
          priority: updatedTask.priority,
          assignedTo: updatedTask.assignedTo._id, // Send user ID, not the full object
          reporter: updatedTask.reporter._id, // Send user ID, not the full object
          startDate: updatedTask.startDate,
          eta: updatedTask.eta,
          estimatedHours: updatedTask.estimatedHours,
          actualHours: updatedTask.actualHours,
          remark: updatedTask.remark,
          roadBlock: updatedTask.roadBlock,
          supportNeeded: updatedTask.supportNeeded,
          labels: updatedTask.labels,
          attachments: updatedTask.attachments,
          relatedTasks: updatedTask.relatedTasks,
          parentTask: updatedTask.parentTask,
          sprint: updatedTask.sprint
        };
        
        console.log('Task data for API:', taskDataForAPI);
        await apiService.updateTask(updatedTask._id, taskDataForAPI);
        console.log('Task updated successfully');
        setIsEditModalOpen(false);
        setEditingTask(null);
        // Refresh the tasks data
        await fetchTasks();
      } catch (error) {
        console.error('Failed to update task:', error);
        setError('Failed to update task');
      }
    };
    
    saveTask();
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
                      key={user._id || `user-${index}`}
                      onClick={() => user._id && setActiveUserId(user._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                        activeUserId === user._id
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-1 bg-gray-100 rounded-full p-1 w-fit">
                    {(['All Tasks','Daily Tasks','Weekly Tasks','Monthly Tasks','Adhoc Tasks'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTaskTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                          activeTaskTab === tab
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 text-right">Project</label>
                      <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[200px]"
                      >
                        <option value="All Projects">All Projects</option>
                        {projectsList.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 text-right">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option>All</option>
                        <option>Yet to Start</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Blocked</option>
                        <option>On Hold</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                            Loading tasks...
                          </td>
                        </tr>
                      ) : Array.isArray(filteredTasks) && filteredTasks.length > 0 ? (
                        filteredTasks.map((task, index) => (
                          <tr key={task._id || `task-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.task}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{projectMap[task.projectId] || task.projectId}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.description}</td>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'Completed' 
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : task.status === 'Blocked'
                            ? 'bg-red-100 text-red-800'
                            : task.status === 'On Hold'
                            ? 'bg-orange-100 text-orange-800'
                            : task.status === 'Cancelled'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                                {task.status}
                              </span>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.reporter?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(task.eta).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.actualHours || 0}/{task.estimatedHours || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                  title="Edit Task"
                                >
                                  <i className="ri-edit-line w-3 h-3 mr-1"></i>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm"
                                  title="Delete Task"
                                >
                                  <i className="ri-delete-bin-line w-3 h-3 mr-1"></i>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                            {Array.isArray(filteredTasks) ? `No ${activeTaskTab} found for this user.` : 'No tasks available.'}
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
          <EditTaskModal
            task={editingTask}
            onSave={handleSaveTask}
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
