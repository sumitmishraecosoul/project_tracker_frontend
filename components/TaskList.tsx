'use client';

import React from 'react';
import { Task } from '../lib/types';

interface TaskListProps {
  tasks: Task[];
  selectedTask: Task | null;
  expandedTasks: { [taskId: string]: boolean };
  taskSubtasks: { [taskId: string]: any[] };
  newSubtaskName: string;
  setNewSubtaskName: (name: string) => void;
  onTaskSelect: (task: Task) => void;
  onTaskCheckboxClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onToggleTaskExpansion: (taskId: string) => void;
  onSubtaskCheckboxClick: (taskId: string, subtaskId: string) => void;
  onCreateSubtask: (taskId: string) => void;
  getAssigneeAvatar: (task: Task) => React.ReactNode;
}

export default function TaskList({
  tasks,
  selectedTask,
  expandedTasks,
  taskSubtasks,
  newSubtaskName,
  setNewSubtaskName,
  onTaskSelect,
  onTaskCheckboxClick,
  onTaskStatusChange,
  onToggleTaskExpansion,
  onSubtaskCheckboxClick,
  onCreateSubtask,
  getAssigneeAvatar
}: TaskListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <div key={task._id}>
          {/* Main Task */}
          <div 
            className={`px-6 py-3 hover:bg-gray-50 cursor-pointer ${selectedTask?._id === task._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            onClick={() => onTaskSelect(task)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskCheckboxClick(task);
                  }}
                  className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                >
                  {task.status === 'Completed' ? (
                    <i className="ri-check-line text-xs text-green-600"></i>
                  ) : (
                    <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                  )}
                </button>
              </div>
              <div className="col-span-4 flex items-center space-x-3">
                {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTaskExpansion(task._id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`ri-arrow-${expandedTasks[task._id] ? 'down' : 'right'}-s-line text-sm`}></i>
                  </button>
                )}
                <span className="text-sm text-gray-900">{task.task}</span>
                {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                  <span className="text-xs text-gray-500">({taskSubtasks[task._id].length})</span>
                )}
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  {getAssigneeAvatar(task)}
                  <span className="text-sm text-gray-900">{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500">
                  {task.eta ? new Date(task.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                  {task.priority}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <select 
                  value={task.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    onTaskStatusChange(task._id, e.target.value as Task['status']);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium border-0 bg-transparent ${task.status === 'Yet to Start' ? 'bg-gray-100 text-gray-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  <option value="Yet to Start">Yet to Start</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskSelect(task);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-more-2-line text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          {expandedTasks[task._id] && taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
            <div className="bg-gray-50 pl-8">
              {taskSubtasks[task._id].map((subtask) => (
                <div key={subtask._id} className="px-6 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubtaskCheckboxClick(task._id, subtask._id);
                      }}
                      className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                    >
                      {subtask.completed ? (
                        <i className="ri-check-line text-xs text-green-600"></i>
                      ) : (
                        <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                      )}
                    </button>
                    <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {subtask.task}
                    </span>
                  </div>
                </div>
              ))}
              <div className="px-6 py-2">
                <div className="flex items-center space-x-3">
                  <button className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400">
                    <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                  </button>
                  <input
                    type="text"
                    placeholder="Add a subtask"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSubtaskName.trim()) {
                        onCreateSubtask(task._id);
                      }
                    }}
                    className="flex-1 px-2 py-1 border-0 focus:outline-none text-sm placeholder-gray-400 bg-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
