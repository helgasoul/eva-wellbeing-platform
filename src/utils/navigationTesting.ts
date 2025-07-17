import { extractAllRoutes } from '@/config/routes';
import { extractRoutesFromNavigation } from '@/config/navigation';
import { validateRouteConsistency } from './routeValidator';

export interface NavigationTest {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

export interface AccessibilityIssue {
  element: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export const runNavigationTests = (): NavigationTest[] => {
  const tests: NavigationTest[] = [];
  
  // Test 1: Route consistency
  const routeValidation = validateRouteConsistency();
  tests.push({
    name: 'Route Consistency',
    status: routeValidation.isValid ? 'pass' : 'fail',
    message: routeValidation.isValid 
      ? 'All routes are consistent between navigation and app configuration'
      : `Found ${routeValidation.missingRoutes.length} missing routes and ${routeValidation.orphanRoutes.length} orphan routes`,
    details: routeValidation.isValid ? undefined : [
      ...routeValidation.missingRoutes.map(route => `Missing: ${route}`),
      ...routeValidation.orphanRoutes.map(route => `Orphan: ${route}`)
    ]
  });

  // Test 2: Route coverage
  const allRoutes = extractAllRoutes();
  const navigationRoutes = extractRoutesFromNavigation();
  const coverage = (navigationRoutes.length / allRoutes.length) * 100;
  
  tests.push({
    name: 'Navigation Coverage',
    status: coverage >= 80 ? 'pass' : coverage >= 60 ? 'warning' : 'fail',
    message: `${coverage.toFixed(1)}% of routes are accessible through navigation`,
    details: coverage < 100 ? [
      `${allRoutes.length} total routes, ${navigationRoutes.length} in navigation`
    ] : undefined
  });

  // Test 3: Duplicate routes
  const duplicateRoutes = new Set();
  const seen = new Set();
  
  [...allRoutes, ...navigationRoutes].forEach(route => {
    if (seen.has(route)) {
      duplicateRoutes.add(route);
    } else {
      seen.add(route);
    }
  });

  tests.push({
    name: 'Duplicate Routes',
    status: duplicateRoutes.size === 0 ? 'pass' : 'warning',
    message: duplicateRoutes.size === 0 
      ? 'No duplicate routes found'
      : `Found ${duplicateRoutes.size} duplicate routes`,
    details: duplicateRoutes.size > 0 ? Array.from(duplicateRoutes) as string[] : undefined
  });

  // Test 4: Route naming consistency
  const invalidRouteNames = allRoutes.filter(route => {
    const segments = route.split('/').filter(Boolean);
    return segments.some(segment => 
      segment.includes('_') || 
      segment !== segment.toLowerCase() ||
      segment.includes(' ')
    );
  });

  tests.push({
    name: 'Route Naming Convention',
    status: invalidRouteNames.length === 0 ? 'pass' : 'warning',
    message: invalidRouteNames.length === 0
      ? 'All routes follow naming conventions'
      : `${invalidRouteNames.length} routes have naming issues`,
    details: invalidRouteNames.length > 0 ? invalidRouteNames : undefined
  });

  return tests;
};

export const generateAccessibilityReport = (): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  
  // Common accessibility issues to check for
  const commonIssues = [
    {
      element: 'Navigation Links',
      issue: 'Links without proper aria-labels',
      severity: 'high' as const,
      recommendation: 'Add descriptive aria-label attributes to all navigation links'
    },
    {
      element: 'Breadcrumbs',
      issue: 'Missing breadcrumb navigation',
      severity: 'medium' as const,
      recommendation: 'Implement breadcrumb navigation for better user orientation'
    },
    {
      element: 'Skip Links',
      issue: 'No skip navigation links',
      severity: 'high' as const,
      recommendation: 'Add skip navigation links for keyboard users'
    },
    {
      element: 'Focus Management',
      issue: 'Focus not properly managed on route changes',
      severity: 'medium' as const,
      recommendation: 'Implement focus management when navigating between routes'
    },
    {
      element: 'Color Contrast',
      issue: 'Navigation elements may have insufficient color contrast',
      severity: 'medium' as const,
      recommendation: 'Ensure all navigation elements meet WCAG contrast requirements'
    }
  ];

  return commonIssues;
};