'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ROLE_LABELS } from '../lib/constants';
import BrandProjectModal from './BrandProjectModal';
import { useBrand } from './BrandContext';
import { useProjects } from './ProjectContext';
import { useNotifications } from './NotificationContext';
import { useInvitations } from './InvitationContext';

interface VerticalNavigationProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function VerticalNavigation({ isCollapsed, onToggle }: VerticalNavigationProps) {
  const { currentBrand } = useBrand();
  const { projects, getBrandProjects, isLoading } = useProjects();
  const { unreadCount } = useNotifications();
  const { pendingInvitations } = useInvitations();
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Load projects when brand changes
  useEffect(() => {
    if (currentBrand?.id) {
      console.log('Loading projects for brand:', currentBrand.name);
      getBrandProjects(currentBrand.id);
    }
  }, [currentBrand?.id]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    router.push('/login');
  };
  
  const primaryNavItems = [
    { 
      name: 'Home', 
      path: '/project-tracker',
      icon: 'ri-home-line'
    },
    // { 
    //   name: 'My tasks', 
    //   path: '/task-tracker',
    //   icon: 'ri-checkbox-line'
    // },
    // { 
    //   name: 'Inbox', 
    //   path: '/inbox',
    //   icon: 'ri-notification-line'
    // },
    { 
      name: 'Invitations', 
      path: '/invitations',
      icon: 'ri-mail-line'
    }
  ];

  // Dynamic projects based on selected brand
  const projectsItems = projects.map((project) => ({
    name: project.title || 'Untitled Project',
    path: `/project-tracker/${project.id}/modern`,
    icon: 'ri-folder-line',
    iconColor: getProjectStatusColor(project.status),
    isActive: pathname === `/project-tracker/${project.id}/modern`
  }));

  // Helper function to get project status color
  function getProjectStatusColor(status: string): string {
    switch (status) {
      case 'Active': return 'text-green-500';
      case 'In Progress': return 'text-blue-500';
      case 'Completed': return 'text-purple-500';
      case 'On Hold': return 'text-yellow-500';
      case 'Cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  const isItemActive = (path: string) => {
    if (path === '/project-tracker') {
      return pathname === '/project-tracker' || (pathname.startsWith('/project-tracker/') && !pathname.startsWith('/project-tracker/dashboard'));
    }
    if (path === '/project-tracker/dashboard') {
      return pathname === '/project-tracker/dashboard' || pathname.startsWith('/project-tracker/dashboard/');
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} shadow-lg h-screen overflow-y-auto transition-all duration-300 flex-shrink-0 flex flex-col`} style={{ backgroundColor: '#0B2639', minWidth: isCollapsed ? '64px' : '256px' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#1a365d' }}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-white">
                Project Tracker
              </h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            <i className={`ri-${isCollapsed ? 'menu-line' : 'close-line'} text-gray-400`}></i>
          </button>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="p-4">
        <div className="space-y-1">
          {primaryNavItems.map((item) => {
            const isActive = isItemActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={{
                  backgroundColor: isActive ? '#1a365d' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#1a365d';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={isCollapsed ? item.name : undefined}
              >
                <i className={`${item.icon} text-lg ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}></i>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {item.name === 'Inbox' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {item.name === 'Invitations' && pendingInvitations.length > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pendingInvitations.length > 99 ? '99+' : pendingInvitations.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Projects Section */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Projects</h3>
            <button className="text-gray-400 hover:text-white">
              <i className="ri-add-line"></i>
            </button>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center p-2 text-gray-400">
                <i className="ri-loader-4-line animate-spin text-sm mr-3"></i>
                <span className="text-sm">Loading projects...</span>
              </div>
            ) : projectsItems.length === 0 ? (
              <div className="flex items-center p-2 text-gray-400">
                <i className="ri-folder-line text-sm mr-3"></i>
                <span className="text-sm">No projects yet</span>
              </div>
            ) : (
              projectsItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    item.isActive
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: item.isActive ? '#1a365d' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.isActive) {
                      e.currentTarget.style.backgroundColor = '#1a365d';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <i className={`${item.icon} text-sm mr-3 ${item.iconColor || 'text-gray-400'}`}></i>
                  <span className="text-sm truncate" title={item.name}>{item.name}</span>
                </Link>
              ))
            )}
          </div>
          
          {/* Add New Project Button */}
          <div className="mt-4">
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              <i className="ri-add-line mr-2"></i>
              <span className="font-medium">Add New Project</span>
            </button>
          </div>
        </div>
      )}

      {/* User Section - Moved to bottom */}
      {currentUser && (
        <div className="p-4 border-t mt-auto" style={{ borderColor: '#1a365d' }}>
          {!isCollapsed ? (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-white font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400">
                  {ROLE_LABELS[currentUser.role as keyof typeof ROLE_LABELS] || currentUser.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a365d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Logout"
              >
                <i className="ri-logout-box-line"></i>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a365d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Logout"
              >
                <i className="ri-logout-box-line"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Brand Project Modal */}
      <BrandProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={(project) => {
          console.log('Project created:', project);
          setIsProjectModalOpen(false);
        }}
        selectedBrand={currentBrand || undefined}
      />
    </div>
  );
}
