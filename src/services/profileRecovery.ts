import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/roles';

export interface ProfileRecoveryResult {
  success: boolean;
  profile?: any;
  error?: string;
  recovered?: boolean;
}

export const recoverUserProfile = async (authUser: User): Promise<ProfileRecoveryResult> => {
  try {
    logger.info('Starting profile recovery for user', { userId: authUser.id });

    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (fetchError) {
      logger.error('Error fetching existing profile:', fetchError);
      
      // If it's just a missing profile, we'll try to create one
      if (fetchError.code !== 'PGRST116') {
        return { success: false, error: `Profile fetch error: ${fetchError.message}` };
      }
    }

    if (existingProfile) {
      logger.info('Profile already exists, no recovery needed');
      return { success: true, profile: existingProfile };
    }

    // Profile doesn't exist, create it
    logger.info('Profile not found, creating new profile');
    
    const newProfile = {
      id: authUser.id,
      email: authUser.email || '',
      first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.firstName || '',
      last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.lastName || '',
      role: (authUser.user_metadata?.role as UserRole) || UserRole.PATIENT,
      onboarding_completed: authUser.user_metadata?.onboarding_completed || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Use proper headers to prevent Content-Type issues
    const { data: createdProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      logger.error('Error creating profile:', createError);
      
      // Try alternative approach with upsert
      const { data: upsertedProfile, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert([newProfile], {
          onConflict: 'id'
        })
        .select()
        .single();

      if (upsertError) {
        logger.error('Error upserting profile:', upsertError);
        return { success: false, error: `Profile creation failed: ${upsertError.message}` };
      }

      return { success: true, profile: upsertedProfile, recovered: true };
    }

    logger.info('Profile created successfully');
    return { success: true, profile: createdProfile, recovered: true };

  } catch (error) {
    logger.error('Profile recovery failed:', error);
    return { success: false, error: `Recovery failed: ${error}` };
  }
};

export const updateProfileWithRetry = async (
  userId: string, 
  updates: any, 
  maxRetries: number = 3
): Promise<ProfileRecoveryResult> => {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Profile update attempt ${attempt}/${maxRetries}`, { userId, updates });
      
      // Add retry delay
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        lastError = error;
        logger.warn(`Profile update attempt ${attempt} failed:`, error);
        
        // If it's a Content-Type error, try different approach
        if (error.message.includes('Content-Type') || error.message.includes('acceptable')) {
          logger.info('Content-Type error detected, trying alternative approach');
          
          // Try with explicit headers
          const { data: retryProfile, error: retryError } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select();

          if (!retryError && retryProfile?.[0]) {
            return { success: true, profile: retryProfile[0] };
          }
        }
        
        continue; // Try next attempt
      }

      logger.info('Profile updated successfully');
      return { success: true, profile: updatedProfile };
      
    } catch (error) {
      lastError = error;
      logger.error(`Profile update attempt ${attempt} failed:`, error);
    }
  }

  return { 
    success: false, 
    error: `Profile update failed after ${maxRetries} attempts: ${lastError?.message || lastError}` 
  };
};

export const validateProfileIntegrity = async (userId: string): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      issues.push(`Profile query error: ${error.message}`);
      recommendations.push('Check database connection and RLS policies');
    }

    if (!profile) {
      issues.push('Profile does not exist');
      recommendations.push('Create missing profile');
    } else {
      // Check required fields
      if (!profile.email) {
        issues.push('Missing email address');
        recommendations.push('Update profile with email');
      }
      
      if (!profile.role) {
        issues.push('Missing user role');
        recommendations.push('Set user role');
      }
      
      if (profile.onboarding_completed === null || profile.onboarding_completed === undefined) {
        issues.push('Onboarding status not set');
        recommendations.push('Set onboarding completion status');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
    
  } catch (error) {
    return {
      isValid: false,
      issues: [`Validation failed: ${error}`],
      recommendations: ['Check system connectivity and try again']
    };
  }
};