import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { onboardingService } from '@/services/onboardingService';

export const useOnboardingMigration = () => {
  const { user } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState<{
    isCompleted: boolean;
    isRunning: boolean;
    error: string | null;
    migratedSteps: number;
  }>({
    isCompleted: false,
    isRunning: false,
    error: null,
    migratedSteps: 0
  });

  useEffect(() => {
    const runMigration = async () => {
      if (!user?.id) return;

      const migrationKey = `migration_completed_${user.id}`;
      const migrationCompleted = localStorage.getItem(migrationKey);

      if (migrationCompleted) {
        setMigrationStatus(prev => ({ ...prev, isCompleted: true }));
        return;
      }

      setMigrationStatus(prev => ({ ...prev, isRunning: true }));

      try {
        // Check if user has data in localStorage
        const localData = localStorage.getItem('bloom-onboarding-data');
        
        if (!localData) {
          // No data to migrate
          localStorage.setItem(migrationKey, 'true');
          setMigrationStatus({
            isCompleted: true,
            isRunning: false,
            error: null,
            migratedSteps: 0
          });
          return;
        }

        // Run migration
        const { migrated, error } = await onboardingService.migrateFromLocalStorage(user.id);

        if (error) {
          setMigrationStatus({
            isCompleted: false,
            isRunning: false,
            error,
            migratedSteps: 0
          });
          return;
        }

        // Mark migration as completed
        localStorage.setItem(migrationKey, 'true');
        
        setMigrationStatus({
          isCompleted: true,
          isRunning: false,
          error: null,
          migratedSteps: migrated
        });

        if (migrated > 0) {
          console.log(`✅ Successfully migrated ${migrated} onboarding steps from localStorage`);
        }

      } catch (error: any) {
        setMigrationStatus({
          isCompleted: false,
          isRunning: false,
          error: error.message || 'Migration failed',
          migratedSteps: 0
        });
      }
    };

    runMigration();
  }, [user?.id]);

  const retryMigration = async () => {
    if (!user?.id) return;

    const migrationKey = `migration_completed_${user.id}`;
    localStorage.removeItem(migrationKey);
    
    setMigrationStatus({
      isCompleted: false,
      isRunning: false,
      error: null,
      migratedSteps: 0
    });
  };

  return {
    migrationStatus,
    retryMigration
  };
};