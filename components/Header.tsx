
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ROLE_LABELS } from '../lib/constants';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
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
    </header>
  );
}
