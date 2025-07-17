import { extractRoutesFromNavigation } from '@/config/navigation';
import { extractAllRoutes } from '@/config/routes';

export interface ValidationResult {
  missingRoutes: string[];
  orphanRoutes: string[];
  isValid: boolean;
}

export const validateRouteConsistency = (): ValidationResult => {
  const navigationRoutes = extractRoutesFromNavigation();
  const appRoutes = extractAllRoutes();
  
  const missingRoutes = navigationRoutes.filter(route => !appRoutes.includes(route));
  const orphanRoutes = appRoutes.filter(route => !navigationRoutes.includes(route));
  
  const isValid = missingRoutes.length === 0 && orphanRoutes.length === 0;
  
  if (missingRoutes.length > 0) {
    console.error('🚨 Missing routes (routes in navigation but not in app):', missingRoutes);
  }
  
  if (orphanRoutes.length > 0) {
    console.warn('⚠️ Orphan routes (routes in app but not in navigation):', orphanRoutes);
  }
  
  if (isValid) {
    console.log('✅ Route consistency validation passed');
  } else {
    console.log('❌ Route consistency validation failed');
  }
  
  return { missingRoutes, orphanRoutes, isValid };
};

export const findDuplicateRoutes = (routes: string[]): string[] => {
  const duplicates: string[] = [];
  const seen = new Set<string>();
  
  routes.forEach(route => {
    if (seen.has(route)) {
      duplicates.push(route);
    } else {
      seen.add(route);
    }
  });
  
  return duplicates;
};