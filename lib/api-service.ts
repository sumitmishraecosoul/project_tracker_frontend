import { config } from './config';

const API_BASE_URL = config.getApiUrl();

// Helper function for development-only logging
const devLog = (...args: any[]) => {
  if (config.features.enableDebugLogging) {
    console.log(...args);
  }
};

  // Helper function for development-only error logging
const devError = (...args: any[]) => {
  if (config.features.enableDebugLogging) {
    console.error(...args);
  }
};

interface Category {
  _id: string;
  name: string;
  color: string;
  description?: string;
  is_default: boolean;
  order: number;
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface Task {
  _id: string;
  id: string;
  projectId: string;
  task: string;
  description?: string;
  taskType?: string;
  priority: string;
  status: string;
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

class ApiService {
  private getAuthHeader() {
    console.log('getAuthHeader');
    const stored = localStorage.getItem('token') || '';
    const authValue = stored
      ? stored.startsWith('Bearer ') ? stored : `Bearer ${stored}`
      : '';
    return {
      'Content-Type': 'application/json',
      ...(authValue && { 'Authorization': authValue })
    };
  }

  private async handleResponse(response: Response) {
    devLog('API Response Status:', response.status);
    devLog('API Response OK:', response.ok);
    devLog('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        devLog('API Error Data:', errorData);
        
        // Handle different error message formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object' && errorData !== null) {
          errorMessage = errorData.message || errorData.error || errorData.msg || errorData.details || JSON.stringify(errorData);
        } else {
          errorMessage = String(errorData) || 'API request failed';
        }
      } catch (parseError) {
        devLog('Failed to parse error response:', parseError);
        try {
          const errorText = await response.clone().text();
          devLog('Raw error response:', errorText);
          errorMessage = errorText || 'API request failed';
        } catch (textError) {
          devLog('Failed to read response text:', textError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      
      // Ensure errorMessage is always a string
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage);
      }
      
      // If token invalid/expired, clear storage to force re-login
      if (
        response.status === 401 ||
        /token/i.test(errorMessage || '')
      ) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        } catch {}
      }
      throw new Error(errorMessage);
    }
    
    try {
      const data = await response.json();
      devLog('API Success Response:', data);
      return data;
    } catch (parseError) {
      devLog('Failed to parse success response:', parseError);
      throw new Error('Failed to parse API response');
    }
  }

  // Authentication APIs
  async register(userData: {
    name: string;
    email: string;
    password: string;
    employeeNumber: string;
    role: string;
    department: string;
    manager?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }


  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async updateProfile(data: { name?: string; department?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return this.handleResponse(response);
  }

  async resetPassword(data: { token: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  // User APIs
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: this.getAuthHeader()
      });
      const data = await this.handleResponse(response);
      devLog('API Service - getUsers response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      devError('API Service - getUsers error:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // New RBAC helper endpoints
  async getAssignableUsers() {
    const response = await fetch(`${API_BASE_URL}/api/users/helpers/assignable-users`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getMyTeam() {
    const response = await fetch(`${API_BASE_URL}/api/users/helpers/my-team`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Project APIs
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
    department?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value.toString());
      });
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/projects?${query.toString()}`,
      { headers: this.getAuthHeader() }
    );
    return this.handleResponse(response);
  }

  async getProjectById(id: string) {
    try {
      const url = `${API_BASE_URL}/api/projects/${id}`;
      const headers = this.getAuthHeader();
      
      console.log('getProjectById - URL:', url);
      console.log('getProjectById - Headers:', headers);
      console.log('getProjectById - Authorization header:', headers.Authorization);
      
      const response = await fetch(url, {
        headers: headers
      });
      
      console.log('getProjectById - Response status:', response.status);
      console.log('getProjectById - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('getProjectById - Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse(response);
      console.log('getProjectById - Success result:', result);
      return result;
    } catch (error) {
      console.error('getProjectById - Error:', error);
      throw error;
    }
  }

  async createLegacyProject(projectData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    assignedTo?: string[];
    teamMembers?: Array<{
      user: string;
      role: string;
    }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  async updateLegacyProject(id: string, projectData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    assignedTo?: string[];
    teamMembers?: Array<{
      user: string;
      role: string;
    }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  async deleteLegacyProject(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getLegacyProjectTasks(projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Team Member Management APIs
  async addTeamMember(projectId: string, userId: string, role: string = 'member') {
    devLog('API Service - addTeamMember called with:', { projectId, userId, role });
    devLog('API Service - URL:', `${API_BASE_URL}/api/projects/${projectId}/team-members`);
    devLog('API Service - Headers:', this.getAuthHeader());
    devLog('API Service - Request Body:', JSON.stringify({ userId, role }, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/team-members`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ userId, role })
      });
      
      devLog('API Service - addTeamMember response status:', response.status);
      devLog('API Service - addTeamMember response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        devError('API Service - addTeamMember error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse(response);
      devLog('API Service - addTeamMember success result:', result);
      return result;
    } catch (error) {
      devError('API Service - addTeamMember error:', error);
      throw error;
    }
  }

  async removeTeamMember(projectId: string, userId: string) {
    devLog('API Service - removeTeamMember called with:', { projectId, userId });
    devLog('API Service - URL:', `${API_BASE_URL}/api/projects/${projectId}/team-members/${userId}`);
    devLog('API Service - Headers:', this.getAuthHeader());
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/team-members/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader()
      });
      
      devLog('API Service - removeTeamMember response status:', response.status);
      devLog('API Service - removeTeamMember response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        devError('API Service - removeTeamMember error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse(response);
      devLog('API Service - removeTeamMember success result:', result);
      return result;
    } catch (error) {
      devError('API Service - removeTeamMember error:', error);
      throw error;
    }
  }

  async updateTeamMemberRole(projectId: string, userId: string, role: string) {
    devLog('API Service - updateTeamMemberRole called with:', { projectId, userId, role });
    devLog('API Service - URL:', `${API_BASE_URL}/api/projects/${projectId}/team-members/${userId}`);
    devLog('API Service - Headers:', this.getAuthHeader());
    devLog('API Service - Request Body:', JSON.stringify({ role }, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/team-members/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ role })
      });
      
      devLog('API Service - updateTeamMemberRole response status:', response.status);
      devLog('API Service - updateTeamMemberRole response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        devError('API Service - updateTeamMemberRole error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse(response);
      devLog('API Service - updateTeamMemberRole success result:', result);
      return result;
    } catch (error) {
      devError('API Service - updateTeamMemberRole error:', error);
      throw error;
    }
  }

  async bulkAddTeamMembers(projectId: string, teamMembers: Array<{ userId: string; role?: string }>) {
    devLog('API Service - bulkAddTeamMembers called with:', { projectId, teamMembers });
    devLog('API Service - URL:', `${API_BASE_URL}/api/projects/${projectId}/team-members/bulk`);
    devLog('API Service - Headers:', this.getAuthHeader());
    devLog('API Service - Request Body:', JSON.stringify({ teamMembers }, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/team-members/bulk`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ teamMembers })
      });
      
      devLog('API Service - bulkAddTeamMembers response status:', response.status);
      devLog('API Service - bulkAddTeamMembers response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        devError('API Service - bulkAddTeamMembers error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse(response);
      devLog('API Service - bulkAddTeamMembers success result:', result);
      return result;
    } catch (error) {
      devError('API Service - bulkAddTeamMembers error:', error);
      throw error;
    }
  }

  // Fallback method using project update API
  async addTeamMembersViaProjectUpdate(projectId: string, userIds: string[]) {
    devLog('API Service - addTeamMembersViaProjectUpdate called with:', { projectId, userIds });
    
    try {
      // First get the current project data
      const currentProject = await this.getProjectById(projectId);
      devLog('API Service - Current project data:', currentProject);
      
      // Get current teamMembers array (not assignedTo)
      const currentTeamMembers = currentProject.teamMembers || [];
      devLog('API Service - Current teamMembers:', currentTeamMembers);
      
      // Extract existing user IDs from teamMembers (handle both direct user objects and nested user objects)
      const existingUserIds = currentTeamMembers.map((item: any) => {
        if (item && typeof item === 'object') {
          if (item.user && item.user._id) {
            return item.user._id; // Nested user object
          } else if (item._id) {
            return item._id; // Direct user object
          }
        }
        return null;
      }).filter((id: string | null) => id !== null);
      
      devLog('API Service - Existing team member user IDs:', existingUserIds);
      
      // Add new user IDs to the array (avoiding duplicates)
      const updatedUserIds = [...new Set([...existingUserIds, ...userIds])];
      devLog('API Service - Updated user IDs:', updatedUserIds);
      
      // Create teamMembers array with proper structure for backend
      const updatedTeamMembers = updatedUserIds.map(userId => ({
        user: userId,
        role: 'member' // default role
      }));
      
      // Update the project with new teamMembers array
      const updateData = {
        ...currentProject,
        teamMembers: updatedTeamMembers
      };
      
      devLog('API Service - Update data:', updateData);
      
      const result = await this.updateLegacyProject(projectId, updateData);
      devLog('API Service - Project update result:', result);
      return result;
    } catch (error) {
      devError('API Service - addTeamMembersViaProjectUpdate error:', error);
      throw error;
    }
  }

  async removeTeamMemberViaProjectUpdate(projectId: string, userId: string) {
    devLog('API Service - removeTeamMemberViaProjectUpdate called with:', { projectId, userId });
    
    try {
      // First get the current project data
      const currentProject = await this.getProjectById(projectId);
      devLog('API Service - Current project data:', currentProject);
      
      // Get current teamMembers array (not assignedTo)
      const currentTeamMembers = currentProject.teamMembers || [];
      devLog('API Service - Current teamMembers before removal:', currentTeamMembers);
      devLog('API Service - Current teamMembers count before removal:', currentTeamMembers.length);
      
      // Log each team member for debugging
      currentTeamMembers.forEach((member: any, index: number) => {
        const memberUserId = typeof member.user === 'string' ? member.user : member.user._id;
        devLog(`API Service - Team member ${index}:`, {
          member,
          memberUserId,
          shouldRemove: memberUserId === userId
        });
      });
      
      // Remove ONLY the specific user ID from the teamMembers array
      const updatedTeamMembers = currentTeamMembers.filter((item: any) => {
        if (item && typeof item === 'object' && item.user) {
          const itemUserId = typeof item.user === 'string' ? item.user : item.user._id;
          const shouldKeep = itemUserId !== userId;
          devLog(`API Service - Filtering team member: ${itemUserId} !== ${userId} = ${shouldKeep}`);
          return shouldKeep;
        }
        devLog('API Service - Keeping item (no user property):', item);
        return true;
      });
      
      devLog('API Service - Updated teamMembers after removal:', updatedTeamMembers);
      devLog('API Service - Updated teamMembers count after removal:', updatedTeamMembers.length);
      devLog('API Service - Removed count:', currentTeamMembers.length - updatedTeamMembers.length);
      
      // Verify we only removed one member
      if (currentTeamMembers.length - updatedTeamMembers.length !== 1) {
        devError('API Service - WARNING: Removed more than one team member!');
        throw new Error('Team member removal failed - removed more than one member');
      }
      
      // Update the project with new teamMembers array
      const updateData = {
        ...currentProject,
        teamMembers: updatedTeamMembers
      };
      
      devLog('API Service - Update data:', updateData);
      
      const result = await this.updateLegacyProject(projectId, updateData);
      devLog('API Service - Project update result:', result);
      return result;
    } catch (error) {
      devError('API Service - removeTeamMemberViaProjectUpdate error:', error);
      throw error;
    }
  }

  // Task APIs
  async getTasks(params?: { status?: string; taskType?: string; view?: string; projectId?: string; assignedTo?: string; department?: string }): Promise<Task[]> {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') query.append(key, value);
        });
      }
      const url = `${API_BASE_URL}/api/tasks${query.toString() ? `?${query.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: this.getAuthHeader()
      });
      const data = await this.handleResponse(response);
      devLog('API Service - getTasks response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      devError('API Service - getTasks error:', error);
      throw error;
    }
  }

  async getTasksByProject(projectId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
        headers: this.getAuthHeader()
      });
      return await this.handleResponse(response);
    } catch (error) {
      devError('Failed to fetch project tasks:', error);
      throw error;
    }
  }

  async getTaskById(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createTask(taskData: {
    projectId: string;
    task: string;
    description?: string;
    taskType?: string;
    status: string;
    priority: string;
    assignedTo: string;
    reporter: string;
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
  }) {
    devLog('API Service - createTask called with:', taskData);
    devLog('API Service - URL:', `${API_BASE_URL}/api/tasks`);
    devLog('API Service - Headers:', this.getAuthHeader());
    devLog('API Service - Request Body:', JSON.stringify(taskData, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(taskData)
      });
      
      devLog('API Service - Response status:', response.status);
      devLog('API Service - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        devError('API Service - Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return this.handleResponse(response);
    } catch (fetchError) {
      devError('API Service - Fetch error:', fetchError);
      throw fetchError;
    }
  }

  async updateTask(id: string, taskData: any) {
    devLog('API Service - updateTask called with ID:', id);
    devLog('API Service - updateTask data:', taskData);
    devLog('API Service - updateTask URL:', `${API_BASE_URL}/api/tasks/${id}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(taskData)
      });
      
      devLog('API Service - updateTask response status:', response.status);
      devLog('API Service - updateTask response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        devError('API Service - updateTask error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return this.handleResponse(response);
    } catch (error) {
      devError('API Service - updateTask error:', error);
      throw error;
    }
  }

  async deleteTask(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async updateTaskStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  async assignTask(id: string, assignedTo: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/assign`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ assignedTo })
    });
    return this.handleResponse(response);
  }

  // User Task APIs
  async getUserTasks(params?: {
    userId?: string;
    date?: string;
    typeOfWork?: string;
    status?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, value);
      });
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/user-tasks?${query.toString()}`,
      { headers: this.getAuthHeader() }
    );
    return this.handleResponse(response);
  }

  async createUserTask(taskData: {
    date: string;
    typeOfWork: string;
    workDescription: string;
    project: string;
    task: string;
    frequency: string;
    status: string;
    hoursSpent?: number;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/user-tasks`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
  }

  async updateUserTask(id: string, taskData: any) {
    const response = await fetch(`${API_BASE_URL}/api/user-tasks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
  }

  async deleteUserTask(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/user-tasks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Dashboard APIs
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getProjectsSummary() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/projects-summary`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getTasksSummary() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/tasks-summary`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // New Dashboard Summary API - Single call for all dashboard data
  async getDashboardSummary(params?: { department?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.department) {
        query.append('department', params.department);
      }
      
      const url = `${API_BASE_URL}/api/dashboard/summary${query.toString() ? `?${query.toString()}` : ''}`;
        
      const response = await fetch(url, {
        headers: this.getAuthHeader()
      });
      return await this.handleResponse(response);
    } catch (error) {
      devError('Failed to fetch dashboard summary:', error);
      throw error;
    }
  }

  // Get available departments for admin users
  async getDepartments(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/departments`, {
        headers: this.getAuthHeader()
      });
      const data = await this.handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      devError('Failed to fetch departments:', error);
      return [];
    }
  }

  // Brand Management APIs
  async getBrands() {
    const response = await fetch(`${API_BASE_URL}/api/brands`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createBrand(brandData: {
    name: string;
    description?: string;
    logo?: string;
    settings?: {
      theme?: string;
      notifications?: boolean;
      timezone?: string;
    };
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(brandData)
    });
    return this.handleResponse(response);
  }

  async getBrandDetails(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async updateBrand(brandId: string, brandData: {
    name?: string;
    description?: string;
    logo?: string;
    settings?: {
      theme?: string;
      notifications?: boolean;
      timezone?: string;
    };
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(brandData)
    });
    return this.handleResponse(response);
  }

  async switchToBrand(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/switch`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async deleteBrand(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Brand User Management APIs
  async getBrandUsers(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/users`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Notification Management APIs - Updated to match verified backend structure
  async getBrandNotifications(brandId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());

    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications?${queryParams}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getUserNotifications(brandId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.is_read !== undefined) queryParams.append('is_read', params.is_read.toString());

    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications/user/me?${queryParams}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(brandId: string, notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications/read-all`, {
      method: 'PUT',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async deleteNotification(brandId: string, notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createNotification(brandId: string, notificationData: {
    recipient: string;
    type: string;
    title: string;
    message: string;
    entity_type?: string;
    entity_id?: string;
    metadata?: any;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });
    return this.handleResponse(response);
  }

  async getNotificationDetails(brandId: string, notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications/${notificationId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async updateNotification(brandId: string, notificationId: string, updateData: any) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    return this.handleResponse(response);
  }

  // Brand Invitation APIs - Updated to match your backend structure with brand context
  async getPendingInvitations(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/invitations/pending`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return this.handleResponse(response);
  }

  // Get user's pending invitations (for invited users)
  async getUserPendingInvitations() {
    const response = await fetch(`${API_BASE_URL}/api/users/invitations`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return this.handleResponse(response);
  }

  async acceptInvitation(brandId: string, invitationId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/invitations/${invitationId}/accept`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return this.handleResponse(response);
  }

  async declineInvitation(brandId: string, invitationId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/invitations/${invitationId}/decline`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return this.handleResponse(response);
  }

  async getInvitationDetails(brandId: string, invitationId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/invitations/${invitationId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async addUserToBrand(brandId: string, userData: {
    email: string;
    role: string;
    permissions?: Partial<any>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/users`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async updateUserRole(brandId: string, userId: string, updateData: {
    role?: string;
    permissions?: Partial<any>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(updateData)
    });
    return this.handleResponse(response);
  }

  async inviteUserToBrand(brandId: string, inviteData: {
    email: string;
    role: string;
    message?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/users/invite`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(inviteData)
    });
    return this.handleResponse(response);
  }

  async removeUserFromBrand(brandId: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Project Management APIs
  async getBrandProjects(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createProject(brandId: string, projectData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    department: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
    settings?: any;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  async getProjectDetails(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async updateProject(brandId: string, projectId: string, projectData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
    settings?: any;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  async getProjectTasks(brandId: string, projectId: string) {
    console.log('API Service - getProjectTasks called with:', {
      brandId,
      projectId,
      url: `${API_BASE_URL}/api/brands/${brandId}/tasks?projectId=${projectId}`,
      headers: this.getAuthHeader()
    });
    
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks?projectId=${projectId}`, {
      headers: this.getAuthHeader()
    });
    
    console.log('API Service - getProjectTasks response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return this.handleResponse(response);
  }

  async updateProjectStatus(brandId: string, projectId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  async completeProject(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/complete`, {
      method: 'PUT',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async archiveProject(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/archive`, {
      method: 'PUT',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getProjectSections(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/sections`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createProjectSection(brandId: string, projectId: string, sectionData: {
    name: string;
    description: string;
    order: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/sections`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(sectionData)
    });
    return this.handleResponse(response);
  }

  async getProjectViews(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/views`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createProjectView(brandId: string, projectId: string, viewData: {
    name: string;
    type: string;
    settings: any;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/views`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(viewData)
    });
    return this.handleResponse(response);
  }

  async getProjectAnalytics(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/analytics`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getProjectProgress(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/progress`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async deleteProject(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // ========================================
  // PHASE 5: TASK MANAGEMENT APIs
  // ========================================

  // 1. Get Brand Tasks
  async getBrandTasks(brandId: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const url = `${API_BASE_URL}/api/brands/${brandId}/tasks${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }


  // 3. Get Brand Task by ID
  async getBrandTaskById(brandId: string, taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 4. Update Brand Task
  async updateBrandTask(brandId: string, taskId: string, taskData: {
    task?: string;
    description?: string;
    status?: 'Yet to Start' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    assignedTo?: string;
    reporter?: string;
    eta?: string;
    dependencies?: string[];
  }) {
    console.log('API Service - updateBrandTask called:', {
      brandId,
      taskId,
      taskData,
      url: `${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}`,
      headers: this.getAuthHeader()
    });
    
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    
    console.log('API Service - updateBrandTask response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const result = this.handleResponse(response);
    console.log('API Service - updateBrandTask result:', result);
    return result;
  }

  // 5. Delete Brand Task
  async deleteBrandTask(brandId: string, taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 6. Assign Task
  async assignBrandTask(brandId: string, taskId: string, assignedTo: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}/assign`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ assignedTo })
    });
    return this.handleResponse(response);
  }

  // 7. Update Task Status
  async updateBrandTaskStatus(brandId: string, taskId: string, status: 'Yet to Start' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring') {
    console.log('API Service - updateBrandTaskStatus called:', {
      brandId,
      taskId,
      status,
      url: `${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}/status`,
      headers: this.getAuthHeader()
    });
    
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ status })
    });
    
    console.log('API Service - updateBrandTaskStatus response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const result = this.handleResponse(response);
    console.log('API Service - updateBrandTaskStatus result:', result);
    return result;
  }

  // 8. Update Task Priority
  async updateBrandTaskPriority(brandId: string, taskId: string, priority: 'Critical' | 'High' | 'Medium' | 'Low') {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}/priority`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ priority })
    });
    return this.handleResponse(response);
  }

  // 9. Get Task Analytics
  async getBrandTaskAnalytics(brandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/analytics`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 10. Search Tasks
  async searchBrandTasks(brandId: string, query: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/search?${searchParams.toString()}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 11. Filter Tasks
  async filterBrandTasks(brandId: string, filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    projectId?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/filter?${params.toString()}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // ========================================
  // PHASE 6: SUBTASK MANAGEMENT APIs
  // ========================================

  // 1. Get Brand Subtasks
  async getBrandSubtasks() {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 2. Create Brand Subtask
  async createBrandSubtask(brandId: string, subtaskData: {
    task_id: string;
    title: string;
    description?: string;
    assignedTo?: string;
    reporter?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    order?: number;
    estimatedHours?: number;
    labels?: string[];
    attachments?: string[];
    relatedSubtasks?: string[];
    sprint?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/subtasks`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(subtaskData)
    });
    return this.handleResponse(response);
  }

  // 3. Get Brand Subtask by ID
  async getBrandSubtaskById(subtaskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 4. Update Brand Subtask
  async updateBrandSubtask(brandId: string, subtaskId: string, subtaskData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
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
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(subtaskData)
    });
    return this.handleResponse(response);
  }

  // 5. Delete Brand Subtask
  async deleteBrandSubtask(brandId: string, subtaskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 6. Get Task Subtasks
  async getTaskSubtasks(brandId: string, taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}/subtasks`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 7. Assign Subtask
  async assignSubtask(subtaskId: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/assign`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ userId })
    });
    return this.handleResponse(response);
  }

  // 8. Unassign Subtask
  async unassignSubtask(subtaskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/unassign`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 9. Update Task Dependencies
  async updateTaskDependencies(brandId: string, taskId: string, dependencies: string[]) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks/${taskId}/dependencies`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ dependencies })
    });
    return this.handleResponse(response);
  }

  // 9. Update Subtask Status
  async updateSubtaskStatus(subtaskId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  }

  // 10. Update Subtask Priority
  async updateSubtaskPriority(subtaskId: string, priority: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/priority`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ priority })
    });
    return this.handleResponse(response);
  }

  // 11. Reorder Subtasks
  async reorderSubtasks(request: { subtaskIds: string[] }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(request)
    });
    return this.handleResponse(response);
  }

  // 12. Reorder Task Subtasks
  async reorderTaskSubtasks(taskId: string, request: { subtaskIds: string[] }) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/subtasks/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(request)
    });
    return this.handleResponse(response);
  }

  // 13. Complete Subtask
  async completeSubtask(subtaskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/complete`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 14. Uncomplete Subtask
  async uncompleteSubtask(subtaskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/uncomplete`, {
      method: 'POST',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 15. Get Subtask Templates
  async getSubtaskTemplates() {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtask-templates`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 16. Get Subtask Template by ID
  async getSubtaskTemplateById(templateId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtask-templates/${templateId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 17. Create Subtask Template
  async createSubtaskTemplate(templateData: {
    name: string;
    description?: string;
    subtasks: Array<{
      task: string;
      description?: string;
      priority: string;
      estimatedHours?: number;
      order: number;
    }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtask-templates`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(templateData)
    });
    return this.handleResponse(response);
  }

  // 18. Update Subtask Template
  async updateSubtaskTemplate(templateId: string, templateData: {
    name?: string;
    description?: string;
    subtasks?: Array<{
      task: string;
      description?: string;
      priority: string;
      estimatedHours?: number;
      order: number;
    }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtask-templates/${templateId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(templateData)
    });
    return this.handleResponse(response);
  }

  // 19. Delete Subtask Template
  async deleteSubtaskTemplate(templateId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtask-templates/${templateId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 20. Apply Template to Task
  async applyTemplateToTask(request: { templateId: string; parentTaskId: string }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtask-templates/apply`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(request)
    });
    return this.handleResponse(response);
  }

  // 21. Get Subtask Analytics
  async getSubtaskAnalytics() {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/analytics`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 22. Get Subtask Analytics by ID
  async getSubtaskAnalyticsById(subtaskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/${subtaskId}/analytics`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 23. Get Task Subtask Analytics
  async getTaskSubtaskAnalytics(taskId: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/subtasks/analytics`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 24. Search Subtasks
  async searchSubtasks(query: string, filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    parentTaskId?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/search?${params.toString()}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 25. Filter Subtasks
  async filterSubtasks(filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    parentTaskId?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/api/brands/subtasks/filter?${params.toString()}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // ========================================
  // CATEGORY MANAGEMENT APIs
  // ========================================

  // 1. Get Project Categories
  async getProjectCategories(brandId: string, projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories`, {
      method: 'GET',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 2. Get Single Category
  async getCategoryById(brandId: string, projectId: string, categoryId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories/${categoryId}`, {
      method: 'GET',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 3. Create Category
  async createCategory(brandId: string, projectId: string, categoryData: {
    name: string;
    description?: string;
    color?: string;
    order?: number;
    is_default?: boolean;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });
    return this.handleResponse(response);
  }

  // 4. Update Category
  async updateCategory(brandId: string, projectId: string, categoryId: string, categoryData: {
    name?: string;
    description?: string;
    color?: string;
    order?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });
    return this.handleResponse(response);
  }

  // 5. Delete Category
  async deleteCategory(brandId: string, projectId: string, categoryId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // 6. Reorder Categories
  async reorderCategories(brandId: string, projectId: string, categoryOrders: Array<{category_id: string, order: number}>) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories/reorder`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category_orders: categoryOrders })
    });
    return this.handleResponse(response);
  }

  // 7. Get Tasks in Category
  async getCategoryTasks(brandId: string, projectId: string, categoryId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/projects/${projectId}/categories/${categoryId}/tasks`, {
      method: 'GET',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Create Default Categories
  async createDefaultCategories(brandId: string, projectId: string) {
    const defaultCategories = [
      { name: 'Operations', color: '#3B82F6', description: 'Operations tasks', is_default: true, order: 1 },
      { name: 'Ads', color: '#10B981', description: 'Advertising tasks', is_default: true, order: 2 },
      { name: 'Supply Chain', color: '#F59E0B', description: 'Supply chain tasks', is_default: true, order: 3 },
      { name: 'Design', color: '#8B5CF6', description: 'Design tasks', is_default: true, order: 4 },
      { name: 'Misc', color: '#6B7280', description: 'Miscellaneous tasks', is_default: true, order: 5 }
    ];
    
    const results = [];
    for (const category of defaultCategories) {
      try {
        const response = await this.createCategory(brandId, projectId, category);
        results.push(response);
      } catch (error) {
        console.error('Error creating default category:', error);
      }
    }
    return results;
  }


  // ========================================
  // UPDATED AUTHENTICATION APIs
  // ========================================

  // Updated register method with new role system
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'brand_admin' | 'user';
    employeeNumber?: string;
    department?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  // Updated login method
  async login(credentials: { 
    email: string; 
    password: string;
    currentBrandId?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  // ========================================
  // UPDATED TASK MANAGEMENT APIs
  // ========================================

  // Updated createBrandTask to require category_id
  async createBrandTask(brandId: string, taskData: {
    task: string;
    description?: string;
    projectId: string;
    category_id: string; // NEW: Required field
    assignedTo: string;
    reporter: string;
    status?: 'Yet to Start' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring';
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    eta: string;
  }) {
    console.log('API Service - createBrandTask called with:', {
      brandId,
      taskData,
      url: `${API_BASE_URL}/api/brands/${brandId}/tasks`,
      headers: this.getAuthHeader()
    });
    
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/tasks`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    
    console.log('API Service - createBrandTask response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return this.handleResponse(response);
  }

  // Phase 6: Comments & Activities APIs
  async getBrandComments(brandId: string, params?: {
    page?: number;
    limit?: number;
    entity_type?: string;
    entity_id?: string;
    status?: string;
  }) {
    let url = `${API_BASE_URL}/api/brands/${brandId}/comments`;
    
    if (params?.entity_type && params?.entity_id) {
      url = `${API_BASE_URL}/api/brands/${brandId}/${params.entity_type}/${params.entity_id}/comments`;
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`${url}?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeader()
    });

    return this.handleResponse(response);
  }

  async createBrandComment(brandId: string, commentData: {
    content: string;
    entity_type: string;
    entity_id: string;
    parent_id?: string;
    mentions?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/${commentData.entity_type}/${commentData.entity_id}/comments`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: commentData.content,
        mentions: commentData.mentions || [],
        attachments: [],
        parent_comment: commentData.parent_id
      })
    });

    return this.handleResponse(response);
  }

  async updateBrandComment(brandId: string, commentId: string, commentData: {
    content: string;
    mentions?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });

    return this.handleResponse(response);
  }

  async deleteBrandComment(brandId: string, commentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });

    return this.handleResponse(response);
  }

  async addCommentReaction(brandId: string, commentId: string, reaction: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/comments/${commentId}/reactions`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reaction })
    });

    return this.handleResponse(response);
  }

  async removeCommentReaction(brandId: string, commentId: string, reaction: string) {
    const response = await fetch(`${API_BASE_URL}/api/brands/${brandId}/comments/${commentId}/reactions`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reaction })
    });

    return this.handleResponse(response);
  }

}

export const apiService = new ApiService();
