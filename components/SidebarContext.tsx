'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isBrandsCollapsed: boolean;
  isNavigationCollapsed: boolean;
  setIsBrandsCollapsed: (collapsed: boolean) => void;
  setIsNavigationCollapsed: (collapsed: boolean) => void;
  closeBothSidebars: () => void;
  toggleBrands: () => void;
  toggleNavigation: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isBrandsCollapsed, setIsBrandsCollapsed] = useState(false);
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);

  const toggleBrands = () => {
    setIsBrandsCollapsed(!isBrandsCollapsed);
  };

  const toggleNavigation = () => {
    setIsNavigationCollapsed(!isNavigationCollapsed);
  };

  const closeBothSidebars = () => {
    setIsBrandsCollapsed(true);
    setIsNavigationCollapsed(true);
  };

  return (
    <SidebarContext.Provider value={{
      isBrandsCollapsed,
      isNavigationCollapsed,
      setIsBrandsCollapsed,
      setIsNavigationCollapsed,
      closeBothSidebars,
      toggleBrands,
      toggleNavigation
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
