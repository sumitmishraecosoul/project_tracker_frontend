
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '../components/ProtectedRoute';

export default function ApplicationLauncher() {
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    
    if (!token || !user) {
      router.push('/login');
    }
  }, [router]);

  const handleProjectTracker = () => {
    console.log('Project Tracker clicked - navigating to dashboard...');
    
    // Test if the function is being called
    console.log('Function executed successfully');
    
    // Use the correct dashboard URL
    const dashboardUrl = '/project-tracker/dashboard';
    console.log('Navigating to:', dashboardUrl);
    
    try {
      // Use window.location.href for reliable navigation
      window.location.href = dashboardUrl;
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to router.push
      router.push(dashboardUrl);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const applications = [
    {
      id: 'project-tracker',
      title: 'Project Tracker',
      description: 'Project Management & Task Tracking',
      icon: '📊',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: handleProjectTracker
    },
    {
      id: 'hr-portal',
      title: 'HR Portal',
      description: 'Human Resources Management System',
      icon: '👥',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      action: () => alert('HR Portal is coming soon!')
    },
    {
      id: 'asset-management',
      title: 'Asset Management',
      description: 'IT Asset & Inventory Management',
      icon: '💻',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      action: () => alert('Asset Management is coming soon!')
    },
    {
      id: 'query-tracker',
      title: 'Query Tracker',
      description: 'Customer Support & Query Management',
      icon: '❓',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      action: () => alert('Query Tracker is coming soon!')
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/login_bg.svg)',
            filter: 'brightness(0.6) contrast(1.1)'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-800/75 to-gray-900/85" />
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6">
            {/* Logo Section */}
            <div className="flex items-center">
              {/* VECTOR Logo */}
              <Image
                src="/vector_icon.svg"
                alt="VECTOR TECHNOLOGIES Logo"
                width={150}
                height={60}
                className="object-contain mr-4"
              />
              
              {/* Separator Line */}
              <div className="h-8 w-px bg-white/30 mx-4"></div>
              
              {/* Tagline */}
              <p className="text-white text-sm">Manage Your Business Seamlessly</p>
            </div>
            
            {/* User Icon */}
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/kinetica_logo(K).svg"
                alt="User Icon"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
            <div className="max-w-8xl mx-auto w-full">
              {/* Portal Cards Grid - 2x2 Layout */}
              <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">
                {applications.map((app) => (
                  <button
                    key={app.id}
                    onClick={app.action}
                    className={`${
                      app.id === 'project-tracker' 
                        ? 'bg-[#c5dce2] backdrop-blur-lg' 
                        : 'bg-gray-800/50 backdrop-blur-lg'
                    } rounded-xl p-8 border border-gray-600/30 shadow-2xl text-white text-left hover:bg-opacity-80 hover:scale-105 transform transition-all duration-300 relative min-h-[240px] w-full`}
                    style={app.id === 'project-tracker' ? { backgroundImage: 'url(/project_tracker_portal_bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {/* Active Status for Project Tracker */}
                    {app.id === 'project-tracker' && (
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <span className="text-green-600 text-lg font-medium">Active</span>
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <h3 className={`text-4xl font-bold mb-4 ${app.id === 'project-tracker' ? 'text-gray-800' : 'text-white'}`}>
                          {app.title}
                        </h3>
                        <p className={`text-xl ${app.id === 'project-tracker' ? 'text-gray-700' : 'text-white/90'}`}>
                          {app.description}
                        </p>
                      </div>
                      
                      {/* Project Tracker Image */}
                      {app.id === 'project-tracker' && (
                        <div className="ml-8 flex-shrink-0">
                          <Image
                            src="/project_tracker_img.png"
                            alt="Project Tracker"
                            width={180}
                            height={120}
                            className="object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
