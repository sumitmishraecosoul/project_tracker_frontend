
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
      id: 'hr-portal',
      title: 'HR Portal',
      description: 'Human Resources Management System (Coming Soon)',
      icon: '👥',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      action: () => alert('HR Portal is coming soon!')
    },
    {
      id: 'query-tracker',
      title: 'Query Tracker',
      description: 'Customer Support & Query Management (Coming Soon)',
      icon: '❓',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      action: () => alert('Query Tracker is coming soon!')
    },
    {
      id: 'project-tracker',
      title: 'Project Tracker',
      description: 'Project Management & Task Tracking (Active)',
      icon: '📊',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: handleProjectTracker
    },
    {
      id: 'asset-management',
      title: 'Asset Management',
      description: 'IT Asset & Inventory Management (Coming Soon)',
      icon: '💻',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      action: () => alert('Asset Management is coming soon!')
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <Image
                  src="/worklytics_logo.png"
                  alt="Worklytics Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose an portal to get started
              </h1>
             
            </div>

            {/* Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={app.action}
                  className={`${app.color} ${app.hoverColor} transform transition-all duration-200 hover:scale-105 cursor-pointer rounded-xl shadow-lg p-6 text-white relative w-full text-left`}
                >
                  {app.id === 'project-tracker' && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ACTIVE
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-4xl mb-4">{app.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{app.title}</h3>
                    <p className="text-sm opacity-90">{app.description}</p>
                  </div>
                </button>
              ))}
            </div>



            {/* Footer Info */}
            <div className="mt-12 text-center">
              {/* <p className="text-gray-500 text-sm">
                Click on any application to launch it. External applications will open in a new tab.
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
