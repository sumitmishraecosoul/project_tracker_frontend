
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Project Manager</h1>
            <nav className="flex space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
