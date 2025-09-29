'use client';

import React from 'react';
import { useInvitations } from './InvitationContext';
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
  expires_at?: string | null;
}

interface PendingInvitationsProps {
  onInvitationAccepted?: (invitationId: string) => void;
  onInvitationDeclined?: (invitationId: string) => void;
}

export default function PendingInvitations({ 
  onInvitationAccepted, 
  onInvitationDeclined 
}: PendingInvitationsProps) {
  const { 
    pendingInvitations: invitations, 
    isLoading, 
    error, 
    acceptInvitation, 
    declineInvitation,
    refreshInvitations 
  } = useInvitations();
  const { currentBrand } = useBrand();
  const [processing, setProcessing] = React.useState<string | null>(null);

  const handleAcceptInvitation = async (invitationId: string) => {
    // Find the invitation to get the correct brand ID
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation?.brand?.id) {
      console.error('Cannot find invitation or brand ID for invitation:', invitationId);
      return;
    }
    
    try {
      setProcessing(invitationId);
      console.log('PendingInvitations - Accepting invitation for brand:', invitation.brand.id);
      await acceptInvitation(invitation.brand.id, invitationId);
      
      // Notify parent component
      if (onInvitationAccepted) {
        onInvitationAccepted(invitationId);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    // Find the invitation to get the correct brand ID
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation?.brand?.id) {
      console.error('Cannot find invitation or brand ID for invitation:', invitationId);
      return;
    }
    
    try {
      setProcessing(invitationId);
      console.log('PendingInvitations - Declining invitation for brand:', invitation.brand.id);
      await declineInvitation(invitation.brand.id, invitationId);
      
      // Notify parent component
      if (onInvitationDeclined) {
        onInvitationDeclined(invitationId);
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) {
      return 'Recently';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Recently';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // If the date is in the future (for expiration dates)
    if (diffInSeconds < 0) {
      const futureDiff = Math.abs(diffInSeconds);
      if (futureDiff < 60) return 'Expires soon';
      if (futureDiff < 3600) return `Expires in ${Math.floor(futureDiff / 60)}m`;
      if (futureDiff < 86400) return `Expires in ${Math.floor(futureDiff / 3600)}h`;
      if (futureDiff < 2592000) return `Expires in ${Math.floor(futureDiff / 86400)}d`;
      return `Expires ${date.toLocaleDateString()}`;
    }

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    // For dates older than 30 days, show the actual date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const date = new Date(expiresAt);
    return !isNaN(date.getTime()) && date < new Date();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading pending invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            <span>{error}</span>
          </div>
        </div>
        <button
          onClick={() => currentBrand?.id && refreshInvitations(currentBrand.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="ri-mail-line text-4xl text-blue-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">All Caught Up!</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            You don't have any pending brand invitations at the moment.
          </p>
          
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-lg mx-auto shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What this means:</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-start">
                <i className="ri-checkbox-circle-line text-green-500 mr-2 mt-0.5"></i>
                <span>No new brand invitations to review</span>
              </li>
              <li className="flex items-start">
                <i className="ri-checkbox-circle-line text-green-500 mr-2 mt-0.5"></i>
                <span>All previous invitations have been processed</span>
              </li>
              <li className="flex items-start">
                <i className="ri-checkbox-circle-line text-green-500 mr-2 mt-0.5"></i>
                <span>You're up to date with your team collaborations</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>New invitations will appear here when team members invite you to join their brands.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Invitations</h1>
        <p className="text-gray-600">You have {invitations.length} pending brand invitation{invitations.length !== 1 ? 's' : ''}.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className={`bg-white border-2 rounded-xl shadow-sm transition-all duration-200 ${
              isExpired(invitation.expires_at) 
                ? 'border-red-200 bg-red-50 shadow-red-100' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                    <i className="ri-building-line text-blue-600 text-2xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {invitation.brand?.name || 'Brand Invitation'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <i className="ri-user-3-line mr-1"></i>
                      <span>Invited by <span className="font-semibold text-gray-700">{invitation.invited_by.name}</span></span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <i className="ri-mail-line mr-1"></i>
                      <span>{invitation.invited_by.email}</span>
                    </div>
                    {invitation.brand?.description && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg border">
                        {invitation.brand.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    invitation.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : invitation.status === 'accepted'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <i className={`mr-1 ${
                      invitation.status === 'pending' 
                        ? 'ri-time-line' 
                        : invitation.status === 'accepted'
                        ? 'ri-check-line'
                        : 'ri-close-line'
                    }`}></i>
                    {invitation.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-shield-user-line text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Role</div>
                    <div className="font-semibold text-gray-900 capitalize">{invitation.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-calendar-line text-green-600"></i>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Invited</div>
                    <div className="font-semibold text-gray-900">
                      {invitation.invited_at || invitation.created_at ? 
                        getTimeAgo(invitation.invited_at || invitation.created_at || '') : 
                        'Recently'
                      }
                    </div>
                  </div>
                </div>
                
                {invitation.expires_at && (
                  <div className="flex items-center text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                      isExpired(invitation.expires_at) ? 'bg-red-100' : 'bg-orange-100'
                    }`}>
                      <i className={`${isExpired(invitation.expires_at) ? 'ri-error-warning-line text-red-600' : 'ri-time-line text-orange-600'}`}></i>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Expires</div>
                      <div className={`font-semibold ${
                        isExpired(invitation.expires_at) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {getTimeAgo(invitation.expires_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isExpired(invitation.expires_at) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <i className="ri-error-warning-line mr-2 text-lg"></i>
                    <span className="font-semibold">This invitation has expired and cannot be accepted</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                {!isExpired(invitation.expires_at) && (
                  <>
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={processing === invitation.id}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-sm hover:shadow-md"
                    >
                      {processing === invitation.id ? (
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                      ) : (
                        <i className="ri-check-line mr-2"></i>
                      )}
                      Accept Invitation
                    </button>
                    <button
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      disabled={processing === invitation.id}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-sm hover:shadow-md"
                    >
                      {processing === invitation.id ? (
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                      ) : (
                        <i className="ri-close-line mr-2"></i>
                      )}
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
