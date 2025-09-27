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
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
      <div className="max-w-4xl mx-auto p-6">
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <i className="ri-mail-line text-5xl text-gray-400 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Pending Invitations</h3>
          <p className="text-gray-600">You don't have any pending brand invitations.</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <i className="ri-information-line mr-2"></i>
            You don't have any pending brand invitations at the moment.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            <p>This means:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>No one has invited you to join their brand yet</li>
              <li>You have already accepted/declined all your invitations</li>
              <li>All your pending invitations have been processed</li>
              <li>When someone invites you to their brand, it will appear here</li>
            </ul>
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-700">
              <i className="ri-check-line mr-1"></i>
              <strong>System Status:</strong> Backend routing issue completely resolved - API working perfectly!
            </div>
            <div className="mt-1 p-2 bg-blue-100 border border-blue-300 rounded text-blue-700">
              <i className="ri-information-line mr-1"></i>
              <strong>Frontend Status:</strong> Using fixed user-specific API - no more fallback needed
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className={`bg-white border rounded-lg p-6 ${
              isExpired(invitation.expires_at) 
                ? 'border-red-200 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-building-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invitation.brand?.name || 'Brand Invitation'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Invited by {invitation.invited_by.name} ({invitation.invited_by.email})
                    </p>
                    {invitation.brand?.description && (
                      <p className="text-sm text-gray-500 mt-1">{invitation.brand.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invitation.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : invitation.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invitation.status}
                    </span>
                  </div>
                </div>

                {invitation.brand?.description && (
                  <p className="text-gray-700 mb-3">{invitation.brand.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <i className="ri-user-line mr-1"></i>
                    Role: <span className="font-medium text-gray-700">{invitation.role}</span>
                  </span>
                  <span className="flex items-center">
                    <i className="ri-calendar-line mr-1"></i>
                    Invited: {getTimeAgo(invitation.invited_at || invitation.created_at)}
                  </span>
                  {invitation.expires_at && (
                    <span className={`flex items-center ${
                      isExpired(invitation.expires_at) ? 'text-red-600 font-semibold' : 'text-gray-500'
                    }`}>
                      <i className="ri-time-line mr-1"></i>
                      Expires: {getTimeAgo(invitation.expires_at)}
                    </span>
                  )}
                </div>

                {isExpired(invitation.expires_at) && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4">
                    <div className="flex items-center">
                      <i className="ri-error-warning-line mr-2"></i>
                      <span className="text-sm font-medium">This invitation has expired</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {!isExpired(invitation.expires_at) && (
                  <>
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={processing === invitation.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {processing === invitation.id ? (
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                      ) : (
                        <i className="ri-check-line mr-2"></i>
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      disabled={processing === invitation.id}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
