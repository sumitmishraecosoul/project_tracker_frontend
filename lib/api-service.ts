const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    console.log('API Response Status:', response.status);
    console.log('API Response OK:', response.ok);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        console.log('API Error Data:', errorData);
        errorMessage = errorData.message || errorData.error || errorData.msg || 'API request failed';
      } catch (parseError) {
        console.log('Failed to parse error response:', parseError);
        const errorText = await response.text();
        console.log('Raw error response:', errorText);
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
      console.log('API Success Response:', data);
      return data;
    } catch (parseError) {
      console.log('Failed to parse success response:', parseError);
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
      console.log('API Service - getUsers response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('API Service - getUsers error:', error);
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

  // Task APIs
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: this.getAuthHeader()
      });
      const data = await this.handleResponse(response);
      console.log('API Service - getTasks response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('API Service - getTasks error:', error);
      throw error;
    }
  }

  async getTasksByProject(projectId: string) {
    const response = await fetch(`${API_BASE_URL}/api/tasks?projectId=${projectId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
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
    console.log('API Service - createTask called with:', taskData);
    console.log('API Service - URL:', `${API_BASE_URL}/api/tasks`);
    console.log('API Service - Headers:', this.getAuthHeader());
    console.log('API Service - Request Body:', JSON.stringify(taskData, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(taskData)
      });
      
      console.log('API Service - Response status:', response.status);
      console.log('API Service - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service - Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return this.handleResponse(response);
    } catch (fetchError) {
      console.error('API Service - Fetch error:', fetchError);
      throw fetchError;
    }
  }

  async updateTask(id: string, taskData: any) {
    console.log('API Service - updateTask called with ID:', id);
    console.log('API Service - updateTask data:', taskData);
    console.log('API Service - updateTask URL:', `${API_BASE_URL}/api/tasks/${id}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(taskData)
      });
      
      console.log('API Service - updateTask response status:', response.status);
      console.log('API Service - updateTask response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service - updateTask error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Service - updateTask error:', error);
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
}

export const apiService = new ApiService();
