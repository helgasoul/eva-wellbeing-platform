import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MigrationRecord {
  id: string;
  email: string;
  legacy_user_id: string;
  migration_status: string;
  migration_timestamp: string;
  error_details?: string;
  metadata: any;
}

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
}

export const MigrationMonitor = () => {
  const [migrations, setMigrations] = useState<MigrationRecord[]>([]);
  const [stats, setStats] = useState<MigrationStats>({ total: 0, successful: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMigrations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем последние миграции
      const { data: migrationsData, error: migrationsError } = await supabase
        .from('migration_audit_log')
        .select('*')
        .order('migration_timestamp', { ascending: false })
        .limit(50);

      if (migrationsError) {
        throw new Error(`Ошибка загрузки миграций: ${migrationsError.message}`);
      }

      setMigrations(migrationsData || []);

      // Вычисляем статистику
      const total = migrationsData?.length || 0;
      const successful = migrationsData?.filter(m => m.migration_status === 'success').length || 0;
      const failed = migrationsData?.filter(m => m.migration_status === 'failed').length || 0;
      const pending = migrationsData?.filter(m => m.migration_status === 'pending').length || 0;

      setStats({ total, successful, failed, pending });

    } catch (err: any) {
      console.error('Migration fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMigrations();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Успешно</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ошибка</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />В процессе</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Загружаем данные миграций...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-playfair font-semibold">Мониторинг JIT Миграций</h2>
        <Button onClick={fetchMigrations} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-destructive bg-destructive/5">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Всего</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Успешно</p>
              <p className="text-2xl font-semibold text-green-600">{stats.successful}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Ошибки</p>
              <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">В процессе</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Список миграций */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Последние миграции</h3>
        
        {migrations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Миграции не найдены
          </p>
        ) : (
          <div className="space-y-4">
            {migrations.map((migration) => (
              <div key={migration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <p className="font-medium">{migration.email}</p>
                    {getStatusBadge(migration.migration_status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Legacy ID: {migration.legacy_user_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(migration.migration_timestamp).toLocaleString('ru-RU')}
                  </p>
                  {migration.error_details && (
                    <p className="text-xs text-red-600 mt-1">
                      Ошибка: {migration.error_details}
                    </p>
                  )}
                  {migration.metadata?.onboarding_migrated && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Данные онбординга мигрированы
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};