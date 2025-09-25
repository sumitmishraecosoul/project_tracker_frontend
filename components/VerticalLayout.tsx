'use client';

import { useState } from 'react';
import VerticalSidebar from './VerticalSidebar';
import VerticalNavigation from './VerticalNavigation';

interface VerticalLayoutProps {
  children: React.ReactNode;
}

export default function VerticalLayout({ children }: VerticalLayoutProps) {
  const [isBrandsCollapsed, setIsBrandsCollapsed] = useState(false);
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);

  const toggleBrands = () => {
    setIsBrandsCollapsed(!isBrandsCollapsed);
  };

  const toggleNavigation = () => {
    setIsNavigationCollapsed(!isNavigationCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50" style={{ position: 'relative' }}>
      {/* Brands Sidebar */}
      <VerticalSidebar 
        isCollapsed={isBrandsCollapsed} 
        onToggle={toggleBrands}
      />
        
      {/* Navigation Sidebar */}
      <VerticalNavigation 
        isCollapsed={isNavigationCollapsed} 
        onToggle={toggleNavigation}
      />
        
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
