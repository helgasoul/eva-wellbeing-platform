
import React from 'react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

// Simplified OnboardingGuard for m4p version - always allows access
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  // Always show the content since onboarding is considered complete
  return <>{children}</>;
};
