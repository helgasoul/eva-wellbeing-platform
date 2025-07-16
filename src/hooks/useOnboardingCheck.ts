import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { onboardingService } from '@/services/onboardingService';
import { shouldRedirectToOnboarding, shouldRedirectToDashboard } from '@/utils/onboardingUtils';

/**
 * Enhanced hook for onboarding status checking with comprehensive validation
 * 
 * Features:
 * - Validates actual data completeness, not just flags
 * - Provides detailed progress information
 * - Auto-repairs common issues
 * - Handles edge cases and data corruption
 */
export const useOnboardingCheck = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [onboardingState, setOnboardingState] = useState<{
    needsOnboarding: boolean;
    hasCompletedOnboarding: boolean;
    progress?: any;
    isValidating: boolean;
  }>({
    needsOnboarding: false,
    hasCompletedOnboarding: false,
    isValidating: false
  });

  useEffect(() => {
    if (isLoading || !user) return;

    // Skip checks for non-patients
    if (user.role !== UserRole.PATIENT) return;

    // Skip redirects for certain pages AND manual navigation to onboarding
    const skipRedirectPaths = ['/reset-password', '/patient/onboarding'];
    if (skipRedirectPaths.includes(location.pathname)) {
      console.log('🚫 Skipping redirect for protected path:', location.pathname);
      return;
    }

    // Enhanced onboarding check with validation
    const validateAndRedirect = async () => {
      setOnboardingState(prev => ({ ...prev, isValidating: true }));

      try {
        // Get comprehensive onboarding status
        const completionCheck = await onboardingService.isOnboardingComplete(user.id);
        
        console.log('🔍 Enhanced onboarding check:', {
          userId: user.id,
          currentPath: location.pathname,
          flagStatus: user.onboardingCompleted,
          validationResult: completionCheck.completed,
          progress: completionCheck.progress
        });

        const shouldGoToDashboard = shouldRedirectToDashboard({
          ...user,
          onboardingCompleted: completionCheck.completed
        });

        const shouldGoToOnboarding = shouldRedirectToOnboarding({
          ...user,
          onboardingCompleted: completionCheck.completed
        });

        setOnboardingState({
          needsOnboarding: shouldGoToOnboarding,
          hasCompletedOnboarding: shouldGoToDashboard,
          progress: completionCheck.progress,
          isValidating: false
        });

        // Only perform redirects if user is on a page that requires redirect
        // This prevents conflicts with manual navigation
        if (shouldGoToDashboard && location.pathname === '/') {
          console.log('✅ User has sufficient onboarding data - redirecting to dashboard');
          navigate('/patient/dashboard', { replace: true });
        } else if (shouldGoToOnboarding && location.pathname === '/') {
          console.log('🔄 User needs to complete onboarding - redirecting to onboarding');
          navigate('/patient/onboarding', { replace: true });
        } else {
          console.log('🔄 Validation complete, staying on current page:', location.pathname);
        }

      } catch (error) {
        console.error('❌ Enhanced onboarding check failed:', error);
        setOnboardingState(prev => ({ ...prev, isValidating: false }));
        
        // Fallback to simple flag-based check only for root path
        if (location.pathname === '/') {
          if (user.onboardingCompleted) {
            navigate('/patient/dashboard', { replace: true });
          } else {
            navigate('/patient/onboarding', { replace: true });
          }
        }
      }
    };

    validateAndRedirect();
  }, [user, isLoading, navigate, location.pathname]);

  return {
    user,
    isLoading: isLoading || onboardingState.isValidating,
    needsOnboarding: onboardingState.needsOnboarding,
    hasCompletedOnboarding: onboardingState.hasCompletedOnboarding,
    progress: onboardingState.progress
  };
};

/**
 * Утилитарная функция для проверки статуса онбординга без редиректа
 */
export const checkOnboardingStatus = (user: any) => {
  if (!user) return { isAuthenticated: false, needsOnboarding: false, canAccess: false };

  const isPatient = user.role === UserRole.PATIENT;
  const hasCompletedOnboarding = Boolean(user.onboardingCompleted);

  return {
    isAuthenticated: true,
    isPatient,
    needsOnboarding: isPatient && !hasCompletedOnboarding,
    canAccess: !isPatient || hasCompletedOnboarding,
    hasCompletedOnboarding
  };
};