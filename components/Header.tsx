
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Project Manager</h1>
          </div>
          <nav className="flex justify-center space-x-6">
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
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-1"></i>
              Back to Portal
            </Link>
            {currentUser && (
              <>
                <div className="text-sm text-gray-600 hidden sm:block">
                  <span className="font-medium">{currentUser.name}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span>{currentUser.department}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-logout-box-line mr-1"></i>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
