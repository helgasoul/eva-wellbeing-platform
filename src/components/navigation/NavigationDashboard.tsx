import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LinkValidator } from './LinkValidator';
import { Sitemap } from './Sitemap';
import { runNavigationTests, generateAccessibilityReport } from '@/utils/navigationTesting';
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const NavigationDashboard: React.FC = () => {
  const [navigationTests, setNavigationTests] = React.useState(runNavigationTests());
  const [accessibilityIssues] = React.useState(generateAccessibilityReport());

  const refreshTests = () => {
    setNavigationTests(runNavigationTests());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'fail':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigation Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and improve your application's navigation system
          </p>
        </div>
        <Button onClick={refreshTests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Tests
        </Button>
      </div>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Route Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <LinkValidator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {navigationTests.map((test, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{test.name}</h4>
                          <Badge variant={getStatusColor(test.status) as any}>
                            {test.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {test.message}
                        </p>
                        {test.details && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1">
                              {test.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessibilityIssues.map((issue, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{issue.element}</h4>
                      <Badge variant={getSeverityColor(issue.severity) as any}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {issue.issue}
                    </p>
                    <p className="text-sm bg-muted p-2 rounded">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Sitemap />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NavigationDashboard;