'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';
import { BrandUser, InviteUserRequest, AddUserRequest, UpdateUserRequest } from '../lib/types';

interface BrandUserContextType {
  brandUsers: BrandUser[];
  isLoading: boolean;
  error: string | null;
  getBrandUsers: (brandId: string) => Promise<void>;
  addUserToBrand: (brandId: string, userData: AddUserRequest) => Promise<any>;
  inviteUserToBrand: (brandId: string, inviteData: InviteUserRequest) => Promise<any>;
  updateUserRole: (brandId: string, userId: string, updateData: UpdateUserRequest) => Promise<any>;
  removeUserFromBrand: (brandId: string, userId: string) => Promise<any>;
  refreshBrandUsers: (brandId: string) => Promise<void>;
}

const BrandUserContext = createContext<BrandUserContextType | undefined>(undefined);

export function BrandUserProvider({ children }: { children: ReactNode }) {
  const [brandUsers, setBrandUsers] = useState<BrandUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBrandUsers = async (brandId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('BrandUserContext - Fetching users for brand:', brandId);
      const response = await apiService.getBrandUsers(brandId);
      console.log('BrandUserContext - API response:', response);
      console.log('BrandUserContext - API response.success:', response.success);
      console.log('BrandUserContext - API response.data:', response.data);
      console.log('BrandUserContext - API response.data type:', typeof response.data);
      console.log('BrandUserContext - API response.data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      if (response.success) {
        const users = response.data || [];
        console.log('BrandUserContext - Setting brand users:', users);
        console.log('BrandUserContext - Users count:', users.length);
        console.log('BrandUserContext - Users details:', users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        setBrandUsers(users);
      } else {
        console.error('BrandUserContext - API error:', response.message);
        setError(response.message || 'Failed to load brand users');
      }
    } catch (error: any) {
      console.error('Error fetching brand users:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load brand users';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addUserToBrand = async (brandId: string, userData: AddUserRequest) => {
    try {
      setError(null);
      const response = await apiService.addUserToBrand(brandId, userData);
      if (response.success) {
        // Refresh users list
        await getBrandUsers(brandId);
        return response;
      } else {
        setError(response.message || 'Failed to add user to brand');
        throw new Error(response.message || 'Failed to add user to brand');
      }
    } catch (error: any) {
      console.error('Error adding user to brand:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to add user to brand';
      setError(errorMessage);
      throw error;
    }
  };

  const inviteUserToBrand = async (brandId: string, inviteData: InviteUserRequest) => {
    try {
      setError(null);
      console.log('BrandUserContext - Inviting user to brand:', { brandId, inviteData });
      const response = await apiService.inviteUserToBrand(brandId, inviteData);
      console.log('BrandUserContext - Invite response:', response);
      
      // Handle specific error cases
      if (!response.success) {
        if (response.error?.code === 'USER_NOT_FOUND') {
          const errorMessage = 'User not found in database. Please enter a correct email address of an existing user.';
          setError(errorMessage);
          throw new Error(errorMessage);
        } else if (response.error?.code === 'USER_ALREADY_IN_BRAND') {
          const errorMessage = response.error.message || 'User is already in this brand';
          setError(errorMessage);
          throw new Error(errorMessage);
        } else {
          const errorMessage = response.error?.message || 'Failed to invite user';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
      }
      
      // Refresh users list
      console.log('BrandUserContext - Invite successful, refreshing user list...');
      await getBrandUsers(brandId);
      console.log('BrandUserContext - User list refreshed after invite');
      return response;
    } catch (error: any) {
      console.error('Error inviting user to brand:', error);
      // Don't set error again if it's already set above
      const errorMessage = error?.message || error?.toString() || 'Failed to invite user to brand';
      if (!errorMessage.includes('User not found') && !errorMessage.includes('already in this brand')) {
        setError(errorMessage);
      }
      throw error;
    }
  };

  const updateUserRole = async (brandId: string, userId: string, updateData: UpdateUserRequest) => {
    try {
      setError(null);
      const response = await apiService.updateUserRole(brandId, userId, updateData);
      if (response.success) {
        // Refresh users list
        await getBrandUsers(brandId);
        return response;
      } else {
        setError(response.message || 'Failed to update user role');
        throw new Error(response.message || 'Failed to update user role');
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to update user role';
      setError(errorMessage);
      throw error;
    }
  };

  const removeUserFromBrand = async (brandId: string, userId: string) => {
    try {
      setError(null);
      const response = await apiService.removeUserFromBrand(brandId, userId);
      if (response.success) {
        // Refresh users list
        await getBrandUsers(brandId);
        return response;
      } else {
        setError(response.message || 'Failed to remove user from brand');
        throw new Error(response.message || 'Failed to remove user from brand');
      }
    } catch (error: any) {
      console.error('Error removing user from brand:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to remove user from brand';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshBrandUsers = async (brandId: string) => {
    await getBrandUsers(brandId);
  };

  const value: BrandUserContextType = {
    brandUsers,
    isLoading,
    error,
    getBrandUsers,
    addUserToBrand,
    inviteUserToBrand,
    updateUserRole,
    removeUserFromBrand,
    refreshBrandUsers
  };

  return (
    <BrandUserContext.Provider value={value}>
      {children}
    </BrandUserContext.Provider>
  );
}

export function useBrandUser() {
  const context = useContext(BrandUserContext);
  if (context === undefined) {
    throw new Error('useBrandUser must be used within a BrandUserProvider');
  }
  return context;
}
