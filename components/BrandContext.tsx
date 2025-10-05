'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';
import { Brand, CreateBrandData, UpdateBrandData, SwitchBrandResponse } from '../lib/types';

interface BrandContextType {
  brands: Brand[];
  currentBrand: Brand | null;
  selectedBrand: Brand | null; // For UI selection (legacy compatibility)
  isLoading: boolean;
  error: string | null;
  getBrands: () => Promise<void>;
  createBrand: (brandData: CreateBrandData) => Promise<any>;
  updateBrand: (brandId: string, brandData: UpdateBrandData) => Promise<any>;
  switchToBrand: (brandId: string) => Promise<any>;
  deleteBrand: (brandId: string) => Promise<any>;
  setSelectedBrand: (brand: Brand | null) => void; // Legacy compatibility
  refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize brand context
  useEffect(() => {
    initializeBrands();
  }, []);

  const initializeBrands = async () => {
    try {
      console.log('BrandContext: Starting brand initialization');
      setIsLoading(true);
      setError(null);
      
      // Load brands from API
      await getBrands();
      
      // Load current brand from localStorage
      const savedCurrentBrand = localStorage.getItem('currentBrand');
      console.log('BrandContext: Saved current brand from localStorage:', savedCurrentBrand);
      if (savedCurrentBrand) {
        try {
          const brand = JSON.parse(savedCurrentBrand);
          console.log('BrandContext: Parsed brand:', brand);
          setCurrentBrand(brand);
          setSelectedBrand(brand); // Set as selected for UI compatibility
          console.log('BrandContext: Set current brand to:', brand);
        } catch (parseError) {
          console.error('Error parsing saved current brand:', parseError);
          localStorage.removeItem('currentBrand');
        }
      } else {
        console.log('BrandContext: No saved current brand found');
      }
    } catch (error) {
      console.error('Error initializing brands:', error);
      setError('Failed to load brands');
    } finally {
      console.log('BrandContext: Brand initialization complete, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const getBrands = async () => {
    try {
      const response = await apiService.getBrands();
      if (response.success) {
        setBrands(response.data || []);
        setError(null);
      } else {
        setError(response.message || 'Failed to load brands');
      }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      setError(error.message || 'Failed to load brands');
      throw error;
    }
  };

  const createBrand = async (brandData: CreateBrandData) => {
    try {
      setError(null);
      const response = await apiService.createBrand(brandData);
      if (response.success) {
        // Refresh brands list
        await getBrands();
        return response;
      } else {
        setError(response.message || 'Failed to create brand');
        throw new Error(response.message || 'Failed to create brand');
      }
    } catch (error: any) {
      console.error('Error creating brand:', error);
      setError(error.message || 'Failed to create brand');
      throw error;
    }
  };

  const updateBrand = async (brandId: string, brandData: UpdateBrandData) => {
    try {
      setError(null);
      const response = await apiService.updateBrand(brandId, brandData);
      if (response.success) {
        // Refresh brands list
        await getBrands();
        
        // Update current brand if it's the one being updated
        if (currentBrand?.id === brandId) {
          setCurrentBrand(response.data);
          localStorage.setItem('currentBrand', JSON.stringify(response.data));
        }
        
        return response;
      } else {
        setError(response.message || 'Failed to update brand');
        throw new Error(response.message || 'Failed to update brand');
      }
    } catch (error: any) {
      console.error('Error updating brand:', error);
      setError(error.message || 'Failed to update brand');
      throw error;
    }
  };

  const switchToBrand = async (brandId: string) => {
    try {
      setError(null);
      const response = await apiService.switchToBrand(brandId);
      if (response.success) {
        const switchData: SwitchBrandResponse = response.data;
        
        // Update token in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Update current brand
        const brandData: Brand = {
          id: switchData.brand_id,
          name: switchData.brand_name,
          slug: switchData.brand_slug,
          description: '',
          logo: '',
          status: 'active',
          role: switchData.role as 'owner' | 'admin' | 'member',
          permissions: switchData.permissions,
          subscription: switchData.subscription
        };
        
        setCurrentBrand(brandData);
        setSelectedBrand(brandData);
        localStorage.setItem('currentBrand', JSON.stringify(brandData));
        
        return response;
      } else {
        setError(response.message || 'Failed to switch brand');
        throw new Error(response.message || 'Failed to switch brand');
      }
    } catch (error: any) {
      console.error('Error switching brand:', error);
      setError(error.message || 'Failed to switch brand');
      throw error;
    }
  };

  const deleteBrand = async (brandId: string) => {
    try {
      setError(null);
      const response = await apiService.deleteBrand(brandId);
      if (response.success) {
        // Refresh brands list
        await getBrands();
        
        // Clear current brand if it's the one being deleted
        if (currentBrand?.id === brandId) {
          setCurrentBrand(null);
          setSelectedBrand(null);
          localStorage.removeItem('currentBrand');
        }
        
        return response;
      } else {
        // Handle specific error cases
        if (response.error?.code === 'INSUFFICIENT_ROLE') {
          setError('Only brand owners can delete brands');
        } else {
          setError(response.message || 'Failed to delete brand');
        }
        throw new Error(response.message || 'Failed to delete brand');
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      setError(error.message || 'Failed to delete brand');
      throw error;
    }
  };

  const refreshBrands = async () => {
    await getBrands();
  };

  // Legacy compatibility function
  const setSelectedBrandLegacy = (brand: Brand | null) => {
    setSelectedBrand(brand);
  };

  const value: BrandContextType = {
    brands,
    currentBrand,
    selectedBrand,
    isLoading,
    error,
    getBrands,
    createBrand,
    updateBrand,
    switchToBrand,
    deleteBrand,
    setSelectedBrand: setSelectedBrandLegacy,
    refreshBrands
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
