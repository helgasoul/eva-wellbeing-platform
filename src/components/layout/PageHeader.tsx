import React from 'react';
import { BackButton } from './BackButton';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  breadcrumbs, 
  actions,
  showBackButton = true 
}) => {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        {/* Back Button and Breadcrumbs */}
        <div className="flex items-center gap-4 mb-4">
          {showBackButton && <BackButton />}
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        </div>
        
        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};