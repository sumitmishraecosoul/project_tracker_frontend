import React, { useState } from 'react';
import { Task } from '../lib/types';

interface SendTasksModalProps {
  isOpen: boolean;
  tasks: Task[];
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; message: string; tasks: Task[]; regards?: string }) => void;
}

export default function SendTasksModal({ isOpen, tasks, onClose, onSend }: SendTasksModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Task Report');
  const [message, setMessage] = useState('Please find the attached task report.');
  const [regards, setRegards] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!email.trim()) {
      alert('Please enter a recipient email address.');
      return;
    }
    onSend({ to: email, subject, message, tasks, regards });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Send All Tasks</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line w-6 h-6"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter recipient email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regards (Optional)</label>
                <input
                  type="text"
                  value={regards}
                  onChange={(e) => setRegards(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name or closing remark"
                />
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            You are about to send {tasks.length} task(s). Please review the tasks below:
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task, index) => (
                  <tr key={task._id || `task-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{task.task}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.projectId
                        ? (typeof task.projectId === 'string'
                            ? task.projectId
                            : task.projectId.title)
                        : 'No Project'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{task.description}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 whitespace-nowrap">
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
                          : task.status === 'Recurring'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.reporter?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.eta ? new Date(task.eta).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.actualHours || 0}/{task.estimatedHours || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
            >
              Send Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
