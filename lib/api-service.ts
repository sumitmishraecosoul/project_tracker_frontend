const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || 'API request failed');
    }
    return response.json();
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
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
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
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
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
    title: string;
    description: string;
    status: string;
    priority: string;
    assignedTo: string;
    dueDate: string;
    estimatedHours?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
  }

  async updateTask(id: string, taskData: any) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(taskData)
    });
    return this.handleResponse(response);
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
