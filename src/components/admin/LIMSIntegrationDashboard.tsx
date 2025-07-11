import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, RefreshCw, Settings, Activity, Database } from 'lucide-react';
import { limsIntegrationService } from '@/services/limsIntegrationService';
import { toast } from 'sonner';

export function LIMSIntegrationDashboard() {
  const [partners, setPartners] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnersData, auditLogsData] = await Promise.all([
        limsIntegrationService.getMedicalPartners(),
        limsIntegrationService.getIntegrationAuditLogs(undefined, 50)
      ]);
      
      setPartners(partnersData);
      setAuditLogs(auditLogsData);
    } catch (error) {
      console.error('Failed to load LIMS data:', error);
      toast.error('Failed to load integration data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (partnerId: string) => {
    try {
      setSyncing(partnerId);
      const result = await limsIntegrationService.syncWithPartner(partnerId);
      
      if (result.success) {
        toast.success(result.message);
        loadData(); // Refresh data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Sync failed: ' + (error as Error).message);
    } finally {
      setSyncing(null);
    }
  };

  const testConnection = async (partnerId: string) => {
    try {
      const result = await limsIntegrationService.testPartnerConnection(partnerId);
      
      if (result.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LIMS/MIS Integration</h1>
          <p className="text-muted-foreground">
            Manage laboratory and medical information system integrations
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Active Partners</p>
              <p className="text-2xl font-bold">{partners.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Successful Syncs</p>
              <p className="text-2xl font-bold">
                {auditLogs.filter(log => log.compliance_check_passed).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">Failed Operations</p>
              <p className="text-2xl font-bold">
                {auditLogs.filter(log => !log.compliance_check_passed).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Records Processed</p>
              <p className="text-2xl font-bold">
                {auditLogs.reduce((sum, log) => sum + (log.records_processed || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="mappings">Data Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Partners</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{partner.partner_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={partner.status === 'active' ? 'default' : 'destructive'}
                        >
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {partner.last_sync_at ? 
                          new Date(partner.last_sync_at).toLocaleDateString() : 
                          'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSync(partner.id)}
                            disabled={syncing === partner.id}
                          >
                            {syncing === partner.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection(partner.id)}
                          >
                            Test
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Audit Logs</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.medical_partners?.name || 'Unknown'}</TableCell>
                      <TableCell>{log.operation_type}</TableCell>
                      <TableCell>{log.records_processed || 0}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={log.compliance_check_passed ? 'default' : 'destructive'}
                        >
                          {log.compliance_check_passed ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.processing_time_ms ? `${log.processing_time_ms}ms` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Data Mappings</h3>
              <p className="text-muted-foreground">
                Configure data field mappings between external systems and internal schema.
              </p>
              <Button className="mt-4">
                Configure Mappings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}