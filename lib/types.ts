export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  assignable?: boolean;
}

export interface Project {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdDate: string;
  dueDate: string;
  priority: string;
  startDate: string;
  department?: string;
  activeMembersCount?: number;
}

export interface Task {
  _id: string;
  id: string;
  projectId: string;
  task: string;
  description?: string;
  taskType: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled';
  assignedTo: User;
  reporter: User;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface NewTask {
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
