import { extractAllRoutes } from '@/config/routes';
import { BreadcrumbItem } from '@/components/layout/Breadcrumbs';

export interface RouteMap {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

// Generate a route map with human-readable labels
export const generateRouteMap = (): RouteMap => {
  const allRoutes = extractAllRoutes();
  const routeMap: RouteMap = {};

  allRoutes.forEach(route => {
    const segments = route.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Convert kebab-case to Title Case
    const label = lastSegment
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Home';

    // Determine parent route
    const parent = segments.length > 1 
      ? `/${segments.slice(0, -1).join('/')}`
      : undefined;

    routeMap[route] = {
      label,
      parent
    };
  });

  return routeMap;
};

export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const routeMap = generateRouteMap();
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Always start with home
  breadcrumbs.push({
    label: 'Home',
    href: '/'
  });

  if (pathname === '/') {
    return breadcrumbs;
  }

  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  segments.forEach(segment => {
    currentPath += `/${segment}`;
    const routeInfo = routeMap[currentPath];
    
    if (routeInfo) {
      breadcrumbs.push({
        label: routeInfo.label,
        href: currentPath
      });
    }
  });

  return breadcrumbs;
};