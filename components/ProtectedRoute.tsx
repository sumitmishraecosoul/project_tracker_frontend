
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute: Checking authentication...');
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    console.log('ProtectedRoute: User exists:', !!user);
    console.log('ProtectedRoute: Token exists:', !!token);
    
    if (user && token) {
      console.log('ProtectedRoute: User authenticated, setting state...');
      setIsAuthenticated(true);
    } else {
      console.log('ProtectedRoute: No user or token, redirecting to login...');
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
