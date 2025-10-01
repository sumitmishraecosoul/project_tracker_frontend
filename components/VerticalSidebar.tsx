'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useBrand } from './BrandContext';
import { Brand } from '../lib/types';
import BrandManagement from './BrandManagement';
import ProjectManagement from './ProjectManagement';

// Helper function to get brand color
const getBrandColor = (brandName: string): string => {
  const colors = ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5A2B', '#6366F1', '#EC4899'];
  const hash = brandName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

interface VerticalSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function VerticalSidebar({ 
  isCollapsed, 
  onToggle
}: VerticalSidebarProps) {
  const { brands, currentBrand, switchToBrand, isLoading } = useBrand();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showBrandManagement, setShowBrandManagement] = useState(false);
  const [showProjectManagement, setShowProjectManagement] = useState(false);
  
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Auto-select first brand when brands are loaded and no current brand is selected
  useEffect(() => {
    if (brands.length > 0 && !currentBrand && !isLoading) {
      console.log('Auto-selecting first brand:', brands[0].name);
      handleBrandClick(brands[0]);
    }
  }, [brands, currentBrand, isLoading]);

  // Dynamic brands from API - no more static brands
  const displayBrands = brands.length > 0 ? brands : [];

  const handleBrandClick = async (brand: Brand) => {
    try {
      // Switch to the selected brand
      await switchToBrand(brand.id);
    } catch (error) {
      console.error('Failed to switch brand:', error);
    }
  };

  return (
    <>
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0`} style={{ minWidth: isCollapsed ? '64px' : '256px', zIndex: 10 }}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Brands</h2>
                <p className="text-sm text-gray-600 mt-1">Select a brand to view</p>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
              title={isCollapsed ? 'Expand Brands' : 'Collapse Brands'}
            >
              <i className={`ri-${isCollapsed ? 'menu-line' : 'close-line'} text-gray-600 text-lg`}></i>
            </button>
          </div>
        </div>

        {/* Brands List */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex items-center space-x-2">
                <i className="ri-loader-4-line animate-spin text-blue-600"></i>
                <span className="text-gray-600">Loading brands...</span>
              </div>
            </div>
          ) : displayBrands.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-building-line text-3xl text-gray-400 mb-3"></i>
              <p className="text-gray-600 text-sm">No brands found</p>
              <p className="text-gray-500 text-xs mt-1">Create your first brand</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayBrands.map((brand) => {
                const brandInitial = brand.name ? brand.name.charAt(0).toUpperCase() : '?';
                const brandColor = getBrandColor(brand.name);
                return (
                <div
                  key={brand.id}
                  className={`group cursor-pointer rounded-lg transition-colors hover:bg-gray-50`}
                  title={isCollapsed ? brand.name : undefined}
                  onClick={() => handleBrandClick(brand)}
                >
                  <div className={`flex items-center p-3 pr-8 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div 
                      className={`flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm"
                        style={{ 
                          backgroundColor: brandColor,
                          minWidth: '40px !important',
                          minHeight: '40px !important',
                          width: '40px !important',
                          height: '40px !important'
                        }}
                      >
                        {brandInitial}
                      </div>
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {brand.name}
                          </h3>
                          {/* TODO: Pricing/Subscription Feature - Will be implemented later */}
                          {/* <p className="text-xs text-gray-500">
                            {brand.subscription?.plan?.toUpperCase() || 'FREE'} Plan
                          </p> */}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Brand Button */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 space-y-3">
            <button 
              className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              onClick={() => setShowBrandManagement(true)}
            >
              <i className="ri-add-line mr-2"></i>
              <span className="font-medium">Add New Brand</span>
            </button>
            
            {currentBrand && (
              <button 
                className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowProjectManagement(true)}
              >
                <i className="ri-folder-line mr-2"></i>
                <span className="font-medium">Manage Projects</span>
              </button>
            )}
          </div>
        )}

        {/* User Info */}
        {currentUser && !isCollapsed && (
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.department}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Management Modal */}
      {showBrandManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <BrandManagement onClose={() => setShowBrandManagement(false)} />
          </div>
        </div>
      )}

      {/* Project Management Modal */}
      {showProjectManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <ProjectManagement onClose={() => setShowProjectManagement(false)} />
          </div>
        </div>
      )}
    </>
  );
}