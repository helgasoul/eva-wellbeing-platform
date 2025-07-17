import React from 'react';
import { Link } from 'react-router-dom';
import { extractAllRoutes } from '@/config/routes';
import { generateRouteMap } from '@/utils/breadcrumbGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const Sitemap: React.FC = () => {
  const allRoutes = extractAllRoutes();
  const routeMap = generateRouteMap();

  // Group routes by role/section
  const groupedRoutes = allRoutes.reduce((acc, route) => {
    const segments = route.split('/').filter(Boolean);
    const section = segments[0] || 'root';
    
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(route);
    return acc;
  }, {} as Record<string, string[]>);

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'patient':
        return 'Patient Portal';
      case 'doctor':
        return 'Doctor Portal';
      case 'admin':
        return 'Admin Portal';
      case 'root':
        return 'General Pages';
      default:
        return section.charAt(0).toUpperCase() + section.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Application Sitemap</h2>
        <p className="text-muted-foreground">
          Complete overview of all available routes in the application
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedRoutes).map(([section, routes]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-lg">
                {getSectionTitle(section)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routes.map((route, index) => (
                  <div key={route}>
                    <div className="flex items-center justify-between">
                      <Link
                        to={route}
                        className="text-primary hover:underline font-medium"
                      >
                        {routeMap[route]?.label || route}
                      </Link>
                      <span className="text-sm text-muted-foreground font-mono">
                        {route}
                      </span>
                    </div>
                    {index < routes.length - 1 && <Separator className="mt-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Total Routes</div>
            <div className="text-2xl font-bold text-primary">{allRoutes.length}</div>
          </div>
          {Object.entries(groupedRoutes).map(([section, routes]) => (
            <div key={section}>
              <div className="font-medium">{getSectionTitle(section)}</div>
              <div className="text-2xl font-bold text-primary">{routes.length}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};