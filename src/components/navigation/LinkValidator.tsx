import React from 'react';
import { extractAllRoutes } from '@/config/routes';
import { validateRouteConsistency } from '@/utils/routeValidator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface LinkValidatorProps {
  onValidate?: (result: { validRoutes: string[]; invalidRoutes: string[] }) => void;
}

export const LinkValidator: React.FC<LinkValidatorProps> = ({ onValidate }) => {
  const [validationResult, setValidationResult] = React.useState<{
    validRoutes: string[];
    invalidRoutes: string[];
    isValid: boolean;
  } | null>(null);

  const validateLinks = React.useCallback(() => {
    const allRoutes = extractAllRoutes();
    const routeConsistency = validateRouteConsistency();
    
    const result = {
      validRoutes: allRoutes.filter(route => !routeConsistency.orphanRoutes.includes(route)),
      invalidRoutes: [...routeConsistency.missingRoutes, ...routeConsistency.orphanRoutes],
      isValid: routeConsistency.isValid
    };

    setValidationResult(result);
    onValidate?.(result);
  }, [onValidate]);

  React.useEffect(() => {
    validateLinks();
  }, [validateLinks]);

  if (!validationResult) {
    return <div>Validating routes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Route Validation</h3>
        <Button onClick={validateLinks} variant="outline" size="sm">
          Refresh Validation
        </Button>
      </div>

      {validationResult.isValid ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All routes are valid! Found {validationResult.validRoutes.length} valid routes.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {validationResult.invalidRoutes.length} invalid routes that need attention.
          </AlertDescription>
        </Alert>
      )}

      {validationResult.invalidRoutes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-destructive">Invalid Routes:</h4>
          <ul className="text-sm space-y-1">
            {validationResult.invalidRoutes.map((route, index) => (
              <li key={index} className="text-muted-foreground">
                • {route}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};