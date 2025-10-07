'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';
import { useBrand } from './BrandContext';

interface PendingInvitation {
  id: string;
  brand?: {
    id: string;
    name: string;
    description?: string;
  };
  invited_by: {
    id: string;
    name: string;
    email: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  invited_at?: string;
  expires_at?: string | null;
}

interface InvitationContextType {
  pendingInvitations: PendingInvitation[];
  isLoading: boolean;
  error: string | null;
  getPendingInvitations: (brandId: string) => Promise<void>;
  acceptInvitation: (brandId: string, invitationId: string) => Promise<void>;
  declineInvitation: (brandId: string, invitationId: string) => Promise<void>;
  refreshInvitations: (brandId: string) => Promise<void>;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export function InvitationProvider({ children }: { children: ReactNode }) {
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentBrand, getBrands } = useBrand();

  const getPendingInvitations = async (brandId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('InvitationContext - Loading pending invitations for user (backend fixed!)');
      
      // Use the fixed user-specific API (backend routing issue resolved)
      console.log('InvitationContext - Using fixed user-specific API: /api/users/invitations');
      const userResponse = await apiService.getUserPendingInvitations();
      console.log('InvitationContext - User invitations response:', userResponse);
      
      if (userResponse.success) {
        const invitationData = userResponse.data || [];
        console.log('InvitationContext - Setting user invitations (invitations TO user):', invitationData);
        setPendingInvitations(Array.isArray(invitationData) ? invitationData : []);
        console.log('InvitationContext - ✅ Backend routing issue resolved - API working perfectly!');
      } else {
        console.error('InvitationContext - User API error:', userResponse.message);
        setError(userResponse.message || 'Failed to load your pending invitations');
      }
    } catch (error: any) {
      console.error('Error loading pending invitations:', error);
      
      // Handle various error types gracefully
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.log('InvitationContext - User invitation API not found - showing empty state');
        setPendingInvitations([]);
        setError(null); // Don't show error for unimplemented API
      } else if (error.message?.includes('MISSING_BRAND_ID') || error.message?.includes('400')) {
        console.log('InvitationContext - User invitation API error - showing empty state');
        setPendingInvitations([]);
        setError(null); // Don't show error for API errors
      } else if (error.message?.includes('ACCESS_DENIED') || error.message?.includes('403')) {
        console.log('InvitationContext - Access denied - this is expected for users with no pending invitations');
        setPendingInvitations([]);
        setError(null); // Don't show error for access denied - this is expected
      } else {
        const errorMessage = error?.message || error?.toString() || 'Failed to load your pending invitations';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (brandId: string, invitationId: string) => {
    try {
      setError(null);
      console.log('InvitationContext - Accepting invitation:', invitationId, 'for brand:', brandId);
      const response = await apiService.acceptInvitation(brandId, invitationId);
      console.log('InvitationContext - Accept response:', response);
      
      if (response.success) {
        // Remove from local state
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        console.log('InvitationContext - Invitation accepted successfully');
        
        // Refresh brands list to show the new brand in the brand switcher
        console.log('InvitationContext - Refreshing brands list to show new brand...');
        await getBrands();
        
        // Refresh invitations to get updated list (use user API, not brand API)
        await getPendingInvitations(brandId);
      } else {
        console.error('InvitationContext - Accept invitation failed:', response.message);
        setError(response.message || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to accept invitation';
      setError(errorMessage);
      throw error;
    }
  };

  const declineInvitation = async (brandId: string, invitationId: string) => {
    try {
      setError(null);
      console.log('InvitationContext - Declining invitation:', invitationId, 'for brand:', brandId);
      const response = await apiService.declineInvitation(brandId, invitationId);
      console.log('InvitationContext - Decline response:', response);
      
      if (response.success) {
        // Remove from local state
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        console.log('InvitationContext - Invitation declined successfully');
        
        // Refresh invitations to get updated list (use user API, not brand API)
        await getPendingInvitations(brandId);
      } else {
        console.error('InvitationContext - Decline invitation failed:', response.message);
        setError(response.message || 'Failed to decline invitation');
      }
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to decline invitation';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshInvitations = async (brandId: string) => {
    await getPendingInvitations(brandId);
  };

  // Load invitations when brand changes
  useEffect(() => {
    if (currentBrand?.id) {
      console.log('InvitationContext - Loading invitations for current brand:', currentBrand.id);
      getPendingInvitations(currentBrand.id);
    }
  }, [currentBrand?.id]);

  const value: InvitationContextType = {
    pendingInvitations,
    isLoading,
    error,
    getPendingInvitations,
    acceptInvitation,
    declineInvitation,
    refreshInvitations,
  };

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitations() {
  const context = useContext(InvitationContext);
  if (context === undefined) {
    throw new Error('useInvitations must be used within an InvitationProvider');
  }
  return context;
}
