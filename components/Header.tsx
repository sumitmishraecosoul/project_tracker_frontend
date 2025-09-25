
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ROLE_LABELS } from '../lib/constants';
import BrandSwitcher from './BrandSwitcher';
import BrandManagement from './BrandManagement';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBrandManagement, setShowBrandManagement] = useState(false);
  
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('currentBrand');
    router.push('/login');
  };
  
  const menuItems = [
    { name: 'Dashboard', path: '/project-tracker/dashboard' },
    { name: 'Project Tracker', path: '/project-tracker' },
    { name: 'Task Tracker', path: '/task-tracker' }
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border-b border-blue-500">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title Section */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Project Tracker
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-2">
            {menuItems.map((item) => {
              const isItemActive = (path: string) => {
                if (path === '/project-tracker/dashboard') {
                  return pathname === '/project-tracker/dashboard' || pathname.startsWith('/project-tracker/dashboard/');
                }
                if (path === '/project-tracker') {
                  return pathname === '/project-tracker' || (pathname.startsWith('/project-tracker/') && !pathname.startsWith('/project-tracker/dashboard'));
                }
                return pathname === path || pathname.startsWith(path + '/');
              };
              const isActive = isItemActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-md transform scale-105'
                      : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-md'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Brand Switcher */}
            <BrandSwitcher className="hidden md:block" />
            
            {/* Brand Management Button */}
            <button
              onClick={() => setShowBrandManagement(true)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-white/20 transition-all duration-200 whitespace-nowrap"
              title="Manage Brands"
            >
              <i className="ri-settings-3-line"></i>
            </button>
            
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-white/20 transition-all duration-200 whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Portal
            </Link>
            
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-blue-100 hidden sm:block">
                  <span className="font-semibold">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Brand Management Modal */}
      {showBrandManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <BrandManagement onClose={() => setShowBrandManagement(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
