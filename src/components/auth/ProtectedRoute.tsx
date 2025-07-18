
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: any[];
  requiredRole?: any;
  requireGuest?: boolean;
  redirectTo?: string;
}

// Simplified ProtectedRoute for m4p version - always allows access
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireGuest = false
}) => {
  const { user } = useAuth();

  // For requireGuest routes (like login/register), don't show them since user is always logged in
  if (requireGuest) {
    return null;
  }

  // Always show the content for authenticated routes
  return <>{children}</>;
};

// Simplified hook for m4p version
export const useRegistrationGuard = () => {
  return {
    isRegistrationComplete: true,
    isOnboardingComplete: true,
    needsRegistration: false,
    needsOnboarding: false
  };
};
