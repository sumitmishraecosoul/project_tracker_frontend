'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';
import { 
  Project, 
  ProjectSection, 
  ProjectView, 
  ProjectProgress,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateProjectSectionRequest,
  CreateProjectViewRequest
} from '../lib/types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  projectSections: ProjectSection[];
  projectViews: ProjectView[];
  projectProgress: ProjectProgress | null;
  isLoading: boolean;
  error: string | null;
  
  // Project Management
  getBrandProjects: (brandId: string) => Promise<void>;
  createProject: (brandId: string, projectData: CreateProjectRequest) => Promise<any>;
  getProjectDetails: (brandId: string, projectId: string) => Promise<any>;
  updateProject: (brandId: string, projectId: string, projectData: UpdateProjectRequest) => Promise<any>;
  updateProjectStatus: (brandId: string, projectId: string, status: string) => Promise<any>;
  completeProject: (brandId: string, projectId: string) => Promise<any>;
  archiveProject: (brandId: string, projectId: string) => Promise<any>;
  deleteProject: (brandId: string, projectId: string) => Promise<any>;
  
  // Project Tasks
  getProjectTasks: (brandId: string, projectId: string) => Promise<any>;
  
  // Project Sections
  getProjectSections: (brandId: string, projectId: string) => Promise<void>;
  createProjectSection: (brandId: string, projectId: string, sectionData: CreateProjectSectionRequest) => Promise<any>;
  
  // Project Views
  getProjectViews: (brandId: string, projectId: string) => Promise<void>;
  createProjectView: (brandId: string, projectId: string, viewData: CreateProjectViewRequest) => Promise<any>;
  
  // Project Analytics & Progress
  getProjectProgress: (brandId: string, projectId: string) => Promise<any>;
  getProjectAnalytics: (brandId: string, projectId: string) => Promise<any>;
  
  // State Management
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: (brandId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectSections, setProjectSections] = useState<ProjectSection[]>([]);
  const [projectViews, setProjectViews] = useState<ProjectView[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBrandProjects = async (brandId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getBrandProjects(brandId);
      console.log('ProjectContext - API Response:', response);
      if (response.success) {
        console.log('ProjectContext - Setting projects:', response.data);
        // Ensure we always set an array
        const projectsData = Array.isArray(response.data) ? response.data : (response.data?.projects || []);
        setProjects(projectsData);
      } else {
        setError(response.message || 'Failed to load projects');
        setProjects([]); // Ensure we always have an array
      }
    } catch (error: any) {
      console.error('Error fetching brand projects:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load projects';
      setError(errorMessage);
      setProjects([]); // Ensure we always have an array even on error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (brandId: string, projectData: CreateProjectRequest) => {
    try {
      setError(null);
      const response = await apiService.createProject(brandId, projectData);
      if (response.success) {
        // Refresh projects list
        await getBrandProjects(brandId);
        return response;
      } else {
        setError(response.message || 'Failed to create project');
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to create project';
      setError(errorMessage);
      throw error;
    }
  };

  const getProjectDetails = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.getProjectDetails(brandId, projectId);
      if (response.success) {
        setCurrentProject(response.data);
        return response;
      } else {
        setError(response.message || 'Failed to load project details');
        throw new Error(response.message || 'Failed to load project details');
      }
    } catch (error: any) {
      console.error('Error fetching project details:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load project details';
      setError(errorMessage);
      throw error;
    }
  };

  const updateProject = async (brandId: string, projectId: string, projectData: UpdateProjectRequest) => {
    try {
      setError(null);
      const response = await apiService.updateProject(brandId, projectId, projectData);
      if (response.success) {
        // Refresh projects list and update current project if it's the same
        await getBrandProjects(brandId);
        if (currentProject?.id === projectId) {
          setCurrentProject(response.data);
        }
        return response;
      } else {
        setError(response.message || 'Failed to update project');
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to update project';
      setError(errorMessage);
      throw error;
    }
  };

  const updateProjectStatus = async (brandId: string, projectId: string, status: string) => {
    try {
      setError(null);
      const response = await apiService.updateProjectStatus(brandId, projectId, status);
      if (response.success) {
        // Refresh projects list
        await getBrandProjects(brandId);
        return response;
      } else {
        setError(response.message || 'Failed to update project status');
        throw new Error(response.message || 'Failed to update project status');
      }
    } catch (error: any) {
      console.error('Error updating project status:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to update project status';
      setError(errorMessage);
      throw error;
    }
  };

  const completeProject = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.completeProject(brandId, projectId);
      if (response.success) {
        // Refresh projects list
        await getBrandProjects(brandId);
        return response;
      } else {
        setError(response.message || 'Failed to complete project');
        throw new Error(response.message || 'Failed to complete project');
      }
    } catch (error: any) {
      console.error('Error completing project:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to complete project';
      setError(errorMessage);
      throw error;
    }
  };

  const archiveProject = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.archiveProject(brandId, projectId);
      if (response.success) {
        // Refresh projects list
        await getBrandProjects(brandId);
        return response;
      } else {
        // Handle known backend issue with archive API
        if (response.error?.code === 'PROJECT_ARCHIVE_ERROR') {
          const errorMessage = 'Archive feature is currently unavailable. Please use "On Hold" or "Cancelled" status instead.';
          setError(errorMessage);
          throw new Error(errorMessage);
        } else {
          setError(response.message || 'Failed to archive project');
          throw new Error(response.message || 'Failed to archive project');
        }
      }
    } catch (error: any) {
      console.error('Error archiving project:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to archive project';
      setError(errorMessage);
      throw error;
    }
  };

  const deleteProject = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.deleteProject(brandId, projectId);
      if (response.success) {
        // Refresh projects list and clear current project if it's the same
        await getBrandProjects(brandId);
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
        }
        return response;
      } else {
        setError(response.message || 'Failed to delete project');
        throw new Error(response.message || 'Failed to delete project');
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to delete project';
      setError(errorMessage);
      throw error;
    }
  };

  const getProjectTasks = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.getProjectTasks(brandId, projectId);
      return response;
    } catch (error: any) {
      console.error('Error fetching project tasks:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load project tasks';
      setError(errorMessage);
      throw error;
    }
  };

  const getProjectSections = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.getProjectSections(brandId, projectId);
      if (response.success) {
        setProjectSections(response.data || []);
      } else {
        setError(response.message || 'Failed to load project sections');
      }
    } catch (error: any) {
      console.error('Error fetching project sections:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load project sections';
      setError(errorMessage);
      throw error;
    }
  };

  const createProjectSection = async (brandId: string, projectId: string, sectionData: CreateProjectSectionRequest) => {
    try {
      setError(null);
      const response = await apiService.createProjectSection(brandId, projectId, sectionData);
      if (response.success) {
        // Refresh sections list
        await getProjectSections(brandId, projectId);
        return response;
      } else {
        setError(response.message || 'Failed to create project section');
        throw new Error(response.message || 'Failed to create project section');
      }
    } catch (error: any) {
      console.error('Error creating project section:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to create project section';
      setError(errorMessage);
      throw error;
    }
  };

  const getProjectViews = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.getProjectViews(brandId, projectId);
      if (response.success) {
        setProjectViews(response.data || []);
      } else {
        setError(response.message || 'Failed to load project views');
      }
    } catch (error: any) {
      console.error('Error fetching project views:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load project views';
      setError(errorMessage);
      throw error;
    }
  };

  const createProjectView = async (brandId: string, projectId: string, viewData: CreateProjectViewRequest) => {
    try {
      setError(null);
      const response = await apiService.createProjectView(brandId, projectId, viewData);
      if (response.success) {
        // Refresh views list
        await getProjectViews(brandId, projectId);
        return response;
      } else {
        setError(response.message || 'Failed to create project view');
        throw new Error(response.message || 'Failed to create project view');
      }
    } catch (error: any) {
      console.error('Error creating project view:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to create project view';
      setError(errorMessage);
      throw error;
    }
  };

  const getProjectProgress = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.getProjectProgress(brandId, projectId);
      if (response.success) {
        setProjectProgress(response.data);
        return response;
      } else {
        setError(response.message || 'Failed to load project progress');
        throw new Error(response.message || 'Failed to load project progress');
      }
    } catch (error: any) {
      console.error('Error fetching project progress:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load project progress';
      setError(errorMessage);
      throw error;
    }
  };

  const getProjectAnalytics = async (brandId: string, projectId: string) => {
    try {
      setError(null);
      const response = await apiService.getProjectAnalytics(brandId, projectId);
      if (response.success) {
        return response;
      } else {
        // Handle known backend issue with analytics API
        if (response.error?.code === 'PROJECT_ANALYTICS_FETCH_ERROR') {
          const errorMessage = 'Analytics feature is currently unavailable. Please use the Progress tab for project metrics.';
          setError(errorMessage);
          throw new Error(errorMessage);
        } else {
          setError(response.message || 'Failed to load project analytics');
          throw new Error(response.message || 'Failed to load project analytics');
        }
      }
    } catch (error: any) {
      console.error('Error fetching project analytics:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load project analytics';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshProjects = async (brandId: string) => {
    await getBrandProjects(brandId);
  };

  const value: ProjectContextType = {
    projects,
    currentProject,
    projectSections,
    projectViews,
    projectProgress,
    isLoading,
    error,
    
    // Project Management
    getBrandProjects,
    createProject,
    getProjectDetails,
    updateProject,
    updateProjectStatus,
    completeProject,
    archiveProject,
    deleteProject,
    
    // Project Tasks
    getProjectTasks,
    
    // Project Sections
    getProjectSections,
    createProjectSection,
    
    // Project Views
    getProjectViews,
    createProjectView,
    
    // Project Analytics & Progress
    getProjectProgress,
    getProjectAnalytics,
    
    // State Management
    setCurrentProject,
    refreshProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
