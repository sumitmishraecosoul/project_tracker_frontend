export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  employeeNumber?: string;
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
  dueDate?: string;
  priority: string;
  startDate: string;
  department?: string;
  activeMembersCount?: number;
}

// Phase 5 Task Management Types
export interface Task {
  _id: string;
  id: string;
  task: string;
  description?: string;
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  reporter?: {
    _id: string;
    name: string;
    email: string;
  };
  projectId?: {
    _id: string;
    title: string;
  };
  brand_id: string;
  createdBy: string;
  eta?: string;
  createdAt: string;
  updatedAt: string;
  dependencies?: string[];
  dependentTasks?: string[];
  // Legacy fields for backward compatibility
  taskType?: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  labels?: string[];
  attachments?: string[];
  relatedTasks?: string[];
  parentTask?: string;
  sprint?: string;
  completed?: boolean;
  dueDate?: string;
  subtasks?: Array<{ _id: string; task: string; completed: boolean }>;
  estimatedHours?: number;
  actualHours?: number;
  remark?: string;
  roadBlock?: string;
  supportNeeded?: string;
  startDate?: string;
}

export interface NewTask {
  projectId: string;
  task: string;
  description?: string;
  taskType: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  assignedTo: string;
  reporter: string;
  startDate?: string;
  eta: string; // Required for non-recurring tasks, not allowed for recurring tasks
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

// Brand Management Types
export interface BrandPermissions {
  can_create_projects: boolean;
  can_edit_projects: boolean;
  can_delete_projects: boolean;
  can_view_all_projects: boolean;
  can_create_tasks: boolean;
  can_edit_tasks: boolean;
  can_delete_tasks: boolean;
  can_assign_tasks: boolean;
  can_manage_users: boolean;
  can_invite_users: boolean;
  can_remove_users: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;
  can_generate_reports: boolean;
  can_manage_brand_settings: boolean;
  can_manage_billing: boolean;
}

export interface BrandSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  timezone: string;
}

export interface BrandSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
}

export interface BrandCompliance {
  gdpr: boolean;
  ccpa: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  status: 'active' | 'inactive';
  role: 'owner' | 'admin' | 'member';
  permissions?: BrandPermissions;
  joined_at?: string;
  subscription: BrandSubscription;
  settings?: BrandSettings;
  compliance?: BrandCompliance;
  created_by?: {
    _id: string;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
  user_role?: string;
  user_permissions?: BrandPermissions;
}

export interface CreateBrandData {
  name: string;
  description?: string;
  logo?: string;
  settings?: BrandSettings;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  logo?: string;
  settings?: BrandSettings;
}

export interface SwitchBrandResponse {
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  role: string;
  permissions: BrandPermissions;
  subscription: BrandSubscription;
  token: string;
}

// Brand User Management Types
export interface BrandUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'client' | 'guest';
  permissions: UserPermissions;
  status: 'active' | 'pending' | 'suspended';
  joined_at: string;
  invited_by?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserPermissions {
  can_create_projects: boolean;
  can_edit_projects: boolean;
  can_delete_projects: boolean;
  can_view_all_projects: boolean;
  can_create_tasks: boolean;
  can_edit_tasks: boolean;
  can_delete_tasks: boolean;
  can_assign_tasks: boolean;
  can_manage_users: boolean;
  can_invite_users: boolean;
  can_remove_users: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;
  can_generate_reports: boolean;
  can_manage_brand_settings: boolean;
  can_manage_billing: boolean;
}

export interface InviteUserRequest {
  email: string;
  role: string;
  message?: string;
}

export interface AddUserRequest {
  email: string;
  role: string;
  permissions?: Partial<UserPermissions>;
}

export interface UpdateUserRequest {
  role?: string;
  permissions?: Partial<UserPermissions>;
}

// Project Management Types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  department: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string; // Legacy support
  tags: string[];
  settings: ProjectSettings;
  created_by?: {
    _id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ProjectSettings {
  allowComments: boolean;
  allowAttachments: boolean;
  notifications: boolean;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
  department: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  settings?: Partial<ProjectSettings>;
}

export interface ProjectSection {
  id: string;
  name: string;
  description: string;
  order: number;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectSectionRequest {
  name: string;
  description: string;
  order: number;
}

export interface ProjectView {
  id: string;
  name: string;
  type: 'list' | 'board' | 'calendar' | 'timeline';
  settings: ProjectViewSettings;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectViewSettings {
  groupBy?: string;
  sortBy?: string;
  filters?: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    [key: string]: any;
  };
  columns?: string[];
  layout?: string;
}

export interface CreateProjectViewRequest {
  name: string;
  type: string;
  settings: ProjectViewSettings;
}

export interface ProjectProgress {
  project_id: string;
  progress_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  status_breakdown: {
    Active: number;
    Completed: number;
    'On Hold': number;
    Cancelled: number;
  };
  priority_breakdown: {
    High: number;
    Medium: number;
    Low: number;
  };
  last_updated: string;
}

// ========================================
// PHASE 5: TASK MANAGEMENT TYPES
// ========================================

export interface CreateTaskData {
  task: string;
  description?: string;
  projectId: string;
  assignedTo: string;
  reporter: string;
  status?: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  priority?: 'High' | 'Medium' | 'Low';
  eta: string;
}

export interface UpdateTaskData {
  task?: string;
  description?: string;
  status?: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  priority?: 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  reporter?: string;
  eta?: string;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  teamPerformance: Array<{
    user: { _id: string; name: string };
    assignedTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}

export interface TaskSearchResult {
  tasks: Task[];
  total: number;
  query?: string;
  filters?: TaskFilters;
}

// ========================================
// PHASE 6: SUBTASK MANAGEMENT TYPES
// ========================================

export interface Subtask {
  _id: string;
  id: string;
  task: string;
  description?: string;
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  reporter?: {
    _id: string;
    name: string;
    email: string;
  };
  parentTaskId?: {
    _id: string;
    task: string;
  };
  brand_id: string;
  createdBy: string;
  eta?: string;
  createdAt: string;
  updatedAt: string;
  dependencies?: string[];
  dependentSubtasks?: string[];
  order?: number;
  completed?: boolean;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  remark?: string;
  roadBlock?: string;
  supportNeeded?: string;
  startDate?: string;
  labels?: string[];
  attachments?: string[];
  relatedSubtasks?: string[];
  sprint?: string;
}

export interface CreateSubtaskData {
  task: string;
  description?: string;
  parentTaskId?: string;
  assignedTo?: string;
  reporter?: string;
  status?: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  priority?: 'High' | 'Medium' | 'Low';
  eta?: string;
  order?: number;
  dueDate?: string;
  estimatedHours?: number;
  labels?: string[];
  attachments?: string[];
  relatedSubtasks?: string[];
  sprint?: string;
}

export interface UpdateSubtaskData {
  task?: string;
  description?: string;
  status?: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
  priority?: 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  reporter?: string;
  eta?: string;
  order?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  remark?: string;
  roadBlock?: string;
  supportNeeded?: string;
  labels?: string[];
  attachments?: string[];
  relatedSubtasks?: string[];
  sprint?: string;
}

export interface SubtaskTemplate {
  _id: string;
  id: string;
  name: string;
  description?: string;
  subtasks: Array<{
    task: string;
    description?: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedHours?: number;
    order: number;
  }>;
  brand_id: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtaskTemplateData {
  name: string;
  description?: string;
  subtasks: Array<{
    task: string;
    description?: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedHours?: number;
    order: number;
  }>;
}

export interface UpdateSubtaskTemplateData {
  name?: string;
  description?: string;
  subtasks?: Array<{
    task: string;
    description?: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedHours?: number;
    order: number;
  }>;
}

export interface SubtaskAnalytics {
  totalSubtasks: number;
  completedSubtasks: number;
  inProgressSubtasks: number;
  blockedSubtasks: number;
  overdueSubtasks: number;
  completionRate: number;
  averageCompletionTime: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  teamPerformance: Array<{
    user: { _id: string; name: string };
    assignedSubtasks: number;
    completedSubtasks: number;
    completionRate: number;
  }>;
}

export interface SubtaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  parentTaskId?: string;
  page?: number;
  limit?: number;
}

export interface SubtaskSearchResult {
  subtasks: Subtask[];
  total: number;
  query?: string;
  filters?: SubtaskFilters;
}

export interface ReorderSubtasksRequest {
  subtaskIds: string[];
}

export interface ApplyTemplateRequest {
  templateId: string;
  parentTaskId: string;
}
