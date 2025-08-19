const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function for development-only logging
const devLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

// Helper function for development-only error logging
const devError = (...args: any[]) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

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
        errorMessage = errorData.message || errorData.error || errorData.msg || 'API request failed';
      } catch (parseError) {
        devLog('Failed to parse error response:', parseError);
        const errorText = await response.text();
        devLog('Raw error response:', errorText);
        errorMessage = errorText || 'API request failed';
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
    role: string;
    department: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
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

  // Project APIs
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
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
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createProject(projectData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    assignedTo?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  async updateProject(id: string, projectData: any) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  async deleteProject(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getProjectTasks(projectId: string) {
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
      
      const result = await this.updateProject(projectId, updateData);
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
      
      const result = await this.updateProject(projectId, updateData);
      devLog('API Service - Project update result:', result);
      return result;
    } catch (error) {
      devError('API Service - removeTeamMemberViaProjectUpdate error:', error);
      throw error;
    }
  }

  // Task APIs
  async getTasks(params?: { status?: string; taskType?: string; view?: string; projectId?: string; assignedTo?: string }): Promise<Task[]> {
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
  async getDashboardSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
        headers: this.getAuthHeader()
      });
      return await this.handleResponse(response);
    } catch (error) {
      devError('Failed to fetch dashboard summary:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
