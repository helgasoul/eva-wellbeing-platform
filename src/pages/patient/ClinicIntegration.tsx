import React, { useState } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Clock, 
  Users,
  Shield,
  Search,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  network?: string;
  type: 'private' | 'public' | 'network';
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  website?: string;
  workingHours: string;
  services: string[];
  specializations: string[];
  isConnected: boolean;
  connectionStatus: 'connected' | 'pending' | 'failed' | 'not_connected';
  lastSync?: string;
}

interface ConnectedClinic extends Clinic {
  accessLevel: 'read' | 'write' | 'full';
  dataSharing: {
    appointments: boolean;
    prescriptions: boolean;
    labResults: boolean;
    visitHistory: boolean;
  };
}

const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Медицинский центр "Здоровье"',
    network: 'Сеть клиник "Здоровье"',
    type: 'network',
    rating: 4.8,
    reviewCount: 234,
    address: 'ул. Ленина, 123, Москва',
    phone: '+7 (495) 123-45-67',
    website: 'https://zdravie.ru',
    workingHours: '8:00-20:00',
    services: ['Терапия', 'Кардиология', 'Гинекология', 'УЗИ'],
    specializations: ['Женское здоровье', 'Кардиология', 'Эндокринология'],
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Городская поликлиника №15',
    type: 'public',
    rating: 4.2,
    reviewCount: 156,
    address: 'пр. Мира, 45, Москва',
    phone: '+7 (495) 987-65-43',
    workingHours: '8:00-18:00',
    services: ['Терапия', 'Педиатрия', 'Хирургия', 'Лабораторные анализы'],
    specializations: ['Общая практика', 'Профилактика'],
    isConnected: false,
    connectionStatus: 'pending'
  },
  {
    id: '3',
    name: 'Частная клиника "Медика"',
    type: 'private',
    rating: 4.9,
    reviewCount: 89,
    address: 'ул. Тверская, 12, Москва',
    phone: '+7 (495) 555-77-88',
    website: 'https://medika-clinic.ru',
    workingHours: '9:00-21:00',
    services: ['Гинекология', 'Эндокринология', 'Косметология'],
    specializations: ['Женское здоровье', 'Гормональная терапия'],
    isConnected: false,
    connectionStatus: 'not_connected'
  }
];

const mockConnectedClinics: ConnectedClinic[] = [
  {
    ...mockClinics[0],
    accessLevel: 'full',
    dataSharing: {
      appointments: true,
      prescriptions: true,
      labResults: true,
      visitHistory: true
    }
  } as ConnectedClinic
];

export default function ClinicIntegration() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string>('');

  const filteredClinics = mockClinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = (clinicId: string) => {
    const clinic = mockClinics.find(c => c.id === clinicId);
    if (clinic) {
      toast({
        title: "Запрос на подключение отправлен",
        description: `Запрос на подключение к ${clinic.name} будет обработан в течение 24 часов`,
      });
    }
  };

  const handleDisconnect = (clinicId: string) => {
    const clinic = mockConnectedClinics.find(c => c.id === clinicId);
    if (clinic) {
      toast({
        title: "Подключение отключено",
        description: `Подключение к ${clinic.name} успешно отключено`,
      });
    }
  };

  const getConnectionStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle size={12} className="mr-1" />
          Подключено
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock size={12} className="mr-1" />
          Ожидает
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertCircle size={12} className="mr-1" />
          Ошибка
        </Badge>;
      default:
        return <Badge variant="outline">Не подключено</Badge>;
    }
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Интеграция с клиниками', href: '/patient/clinic-integration' }
  ];

  return (
    <PatientLayout title="Интеграция с клиниками | Eva" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center mb-2">
            <Building2 className="mr-3 text-eva-dusty-rose" size={32} />
            Интеграция с клиниками
          </h1>
          <p className="soft-text">
            Подключите свои медицинские учреждения для автоматической синхронизации данных
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="available">Доступные клиники</TabsTrigger>
            <TabsTrigger value="connected">Подключенные ({mockConnectedClinics.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {/* Search */}
            <Card className="bloom-card">
              <CardHeader>
                <CardTitle className="text-lg gentle-text">Поиск клиник</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или адресу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Clinics List */}
            <div className="grid gap-4">
              {filteredClinics.map((clinic) => (
                <Card key={clinic.id} className="bloom-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg gentle-text flex items-center gap-2">
                          {clinic.name}
                          {getConnectionStatusBadge(clinic.connectionStatus)}
                        </CardTitle>
                        {clinic.network && (
                          <CardDescription className="text-sm text-eva-dusty-rose">
                            {clinic.network}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{clinic.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({clinic.reviewCount})
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {clinic.type === 'private' ? 'Частная' : 
                             clinic.type === 'public' ? 'Государственная' : 'Сеть'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {clinic.connectionStatus === 'connected' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(clinic.id)}
                          >
                            Отключить
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(clinic.id)}
                            disabled={clinic.connectionStatus === 'pending'}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Подключить
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                          {clinic.address}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                          {clinic.phone}
                        </div>
                        {clinic.website && (
                          <div className="flex items-center text-sm">
                            <Globe className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                            <a href={clinic.website} target="_blank" rel="noopener noreferrer" 
                               className="text-eva-dusty-rose hover:underline">
                              {clinic.website}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                          {clinic.workingHours}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium">Услуги:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {clinic.services.map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Специализации:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {clinic.specializations.map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-4">
            {mockConnectedClinics.length === 0 ? (
              <Card className="bloom-card">
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет подключенных клиник</h3>
                  <p className="text-muted-foreground">
                    Подключите медицинские учреждения для автоматической синхронизации данных
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {mockConnectedClinics.map((clinic) => (
                  <Card key={clinic.id} className="bloom-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg gentle-text flex items-center gap-2">
                            {clinic.name}
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle size={12} className="mr-1" />
                              Подключено
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Последняя синхронизация: {new Date(clinic.lastSync!).toLocaleString('ru-RU')}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(clinic.id)}
                        >
                          Отключить
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Уровень доступа:</Label>
                          <Badge className="mt-1 bg-eva-dusty-rose/10 text-eva-dusty-rose">
                            <Shield className="h-3 w-3 mr-1" />
                            {clinic.accessLevel === 'full' ? 'Полный доступ' : 
                             clinic.accessLevel === 'write' ? 'Чтение и запись' : 'Только чтение'}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Синхронизация данных:</Label>
                          <div className="mt-1 space-y-1">
                            {Object.entries(clinic.dataSharing).map(([key, enabled]) => (
                              <div key={key} className="flex items-center text-sm">
                                <CheckCircle className={`h-3 w-3 mr-2 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                                {key === 'appointments' && 'Записи к врачу'}
                                {key === 'prescriptions' && 'Рецепты'}
                                {key === 'labResults' && 'Результаты анализов'}
                                {key === 'visitHistory' && 'История посещений'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}