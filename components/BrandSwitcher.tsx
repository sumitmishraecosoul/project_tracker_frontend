'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBrand } from './BrandContext';
import { Brand } from '../lib/types';

interface BrandSwitcherProps {
  className?: string;
}

export default function BrandSwitcher({ className = '' }: BrandSwitcherProps) {
  const { brands, currentBrand, switchToBrand, isLoading } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchBrand = async (brandId: string) => {
    if (currentBrand?.id === brandId || isSwitching) return;

    try {
      setIsSwitching(true);
      await switchToBrand(brandId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch brand:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-blue-600 bg-blue-100';
      case 'member': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading || brands.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Brand Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center space-x-3 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
      >
        {isSwitching ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin text-gray-600"></i>
            </div>
            <span className="text-sm font-medium text-gray-600">Switching...</span>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              {currentBrand?.logo ? (
                <img 
                  src={currentBrand.logo} 
                  alt={currentBrand.name} 
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {currentBrand?.name.charAt(0).toUpperCase() || 'B'}
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {currentBrand?.name || 'Select Brand'}
              </div>
              <div className="text-xs text-gray-500">
                {currentBrand?.role?.toUpperCase() || 'NO BRAND'}
              </div>
            </div>
            <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Switch Brand</h3>
            <p className="text-xs text-gray-500 mt-1">Choose a different brand to work with</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleSwitchBrand(brand.id)}
                disabled={currentBrand?.id === brand.id || isSwitching}
                className={`w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors ${
                  currentBrand?.id === brand.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-bold">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {brand.name}
                    </span>
                    {currentBrand?.id === brand.id && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(brand.role)}`}>
                      {brand.role.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {brand.subscription?.plan?.toUpperCase() || 'FREE'}
                    </span>
                  </div>
                </div>
                
                {currentBrand?.id !== brand.id && !isSwitching && (
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                )}
                
                {isSwitching && currentBrand?.id !== brand.id && (
                  <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                )}
              </button>
            ))}
          </div>
          
          {brands.length === 0 && (
            <div className="p-6 text-center">
              <i className="ri-building-line text-3xl text-gray-400 mb-2"></i>
              <p className="text-sm text-gray-600">No brands available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
