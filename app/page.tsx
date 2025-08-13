
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';

export default function ApplicationLauncher() {
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleProjectTracker = () => {
    router.push('/project-tracker/dashboard');
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const applications = [
    {
      id: 'hr-portal',
      title: 'HR Portal',
      description: 'Human Resources Management System',
      icon: '👥',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => handleExternalLink('https://hr-portal.example.com')
    },
    {
      id: 'query-tracker',
      title: 'Query Tracker',
      description: 'Customer Support & Query Management',
      icon: '❓',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => handleExternalLink('https://query-tracker.example.com')
    },
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
      id: 'asset-management',
      title: 'Asset Management',
      description: 'IT Asset & Inventory Management',
      icon: '💻',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      action: () => handleExternalLink('https://asset-management.example.com')
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Your Worklytics
              </h1>
              <p className="text-xl text-gray-600">
                Choose an project to get started
              </p>
            </div>

            {/* Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={app.action}
                  className={`${app.color} ${app.hoverColor} transform transition-all duration-200 hover:scale-105 cursor-pointer rounded-xl shadow-lg p-6 text-white`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{app.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{app.title}</h3>
                    <p className="text-sm opacity-90">{app.description}</p>
                  </div>
                </div>
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
