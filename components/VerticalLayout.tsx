'use client';

import React from 'react';
import VerticalSidebar from './VerticalSidebar';
import VerticalNavigation from './VerticalNavigation';
import { useSidebar } from './SidebarContext';

interface VerticalLayoutProps {
  children: React.ReactNode;
}

export default function VerticalLayout({ children }: VerticalLayoutProps) {
  const { 
    isBrandsCollapsed, 
    isNavigationCollapsed, 
    toggleBrands, 
    toggleNavigation 
  } = useSidebar();

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
