import { extractRoutesFromNavigation } from '@/config/navigation';

// Временно используем существующие роуты для валидации
const EXISTING_ROUTES = [
  '/patient/dashboard',
  '/patient/symptoms', 
  '/patient/nutrition',
  '/patient/recipes',
  '/patient/nutrition-plan',
  '/patient/nutrition-analysis',
  '/patient/academy',
  '/patient/cycle',
  '/patient/calendar',
  '/patient/sleep-dashboard',
  '/patient/data-sources',
  '/patient/diagnostics',
  '/patient/health-data-integrations',
  '/patient/doctor-booking',
  '/patient/lab-tests',
  '/patient/ai-chat',
  '/patient/documents',
  '/patient/advanced-recommendations',
  '/patient/community',
  '/patient/settings',
  '/doctor/dashboard',
  '/doctor/embedded-calculators',
  '/admin/dashboard'
];

export interface ValidationResult {
  missingRoutes: string[];
  orphanRoutes: string[];
  isValid: boolean;
}

export const validateRouteConsistency = (): ValidationResult => {
  const navigationRoutes = extractRoutesFromNavigation();
  const appRoutes = EXISTING_ROUTES;
  
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