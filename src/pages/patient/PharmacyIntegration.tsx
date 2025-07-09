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
  Pill, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Clock, 
  ShoppingCart,
  Truck,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  chain?: string;
  type: 'chain' | 'independent' | 'hospital';
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  website?: string;
  workingHours: string;
  services: string[];
  deliveryAvailable: boolean;
  onlineOrdering: boolean;
  isConnected: boolean;
  connectionStatus: 'connected' | 'pending' | 'failed' | 'not_connected';
  lastSync?: string;
  distance?: string;
}

interface ConnectedPharmacy extends Pharmacy {
  accessLevel: 'read' | 'write' | 'full';
  dataSharing: {
    prescriptions: boolean;
    purchaseHistory: boolean;
    deliveryTracking: boolean;
    inventory: boolean;
  };
  paymentMethods: string[];
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  refills: number;
  doctorName: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'filled' | 'expired';
  pharmacyId?: string;
}

const mockPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Аптека "Ригла"',
    chain: 'Сеть аптек "Ригла"',
    type: 'chain',
    rating: 4.5,
    reviewCount: 178,
    address: 'ул. Ленина, 145, Москва',
    phone: '+7 (495) 123-45-67',
    website: 'https://rigla.ru',
    workingHours: '8:00-22:00',
    services: ['Рецептурные препараты', 'Безрецептурные препараты', 'Медицинские изделия'],
    deliveryAvailable: true,
    onlineOrdering: true,
    isConnected: true,
    connectionStatus: 'connected',
    lastSync: '2024-01-15T10:30:00Z',
    distance: '1.2 км'
  },
  {
    id: '2',
    name: 'Аптека "Здоровье"',
    type: 'independent',
    rating: 4.7,
    reviewCount: 89,
    address: 'пр. Мира, 67, Москва',
    phone: '+7 (495) 987-65-43',
    workingHours: '9:00-21:00',
    services: ['Лекарственные препараты', 'Косметика', 'Товары для детей'],
    deliveryAvailable: false,
    onlineOrdering: false,
    isConnected: false,
    connectionStatus: 'pending',
    distance: '2.1 км'
  },
  {
    id: '3',
    name: 'Аптека "Самсон-Фарма"',
    chain: 'Сеть аптек "Самсон-Фарма"',
    type: 'chain',
    rating: 4.3,
    reviewCount: 234,
    address: 'ул. Тверская, 89, Москва',
    phone: '+7 (495) 555-77-88',
    website: 'https://samson-pharma.ru',
    workingHours: '24/7',
    services: ['Круглосуточная аптека', 'Доставка лекарств', 'Онлайн-консультации'],
    deliveryAvailable: true,
    onlineOrdering: true,
    isConnected: false,
    connectionStatus: 'not_connected',
    distance: '3.5 км'
  }
];

const mockConnectedPharmacies: ConnectedPharmacy[] = [
  {
    ...mockPharmacies[0],
    accessLevel: 'full',
    dataSharing: {
      prescriptions: true,
      purchaseHistory: true,
      deliveryTracking: true,
      inventory: true
    },
    paymentMethods: ['Банковские карты', 'Наличные', 'Электронные платежи']
  } as ConnectedPharmacy
];

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    medicationName: 'Метформин 850 мг',
    dosage: '1 таблетка 2 раза в день',
    quantity: 60,
    refills: 2,
    doctorName: 'Иванова А.С.',
    issueDate: '2024-01-10',
    expiryDate: '2024-04-10',
    status: 'active',
    pharmacyId: '1'
  },
  {
    id: '2',
    medicationName: 'Магний B6',
    dosage: '2 таблетки утром',
    quantity: 30,
    refills: 0,
    doctorName: 'Петрова М.В.',
    issueDate: '2024-01-05',
    expiryDate: '2024-03-05',
    status: 'active'
  }
];

export default function PharmacyIntegration() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');

  const filteredPharmacies = mockPharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = (pharmacyId: string) => {
    const pharmacy = mockPharmacies.find(p => p.id === pharmacyId);
    if (pharmacy) {
      toast({
        title: "Запрос на подключение отправлен",
        description: `Запрос на подключение к ${pharmacy.name} будет обработан в течение 24 часов`,
      });
    }
  };

  const handleDisconnect = (pharmacyId: string) => {
    const pharmacy = mockConnectedPharmacies.find(p => p.id === pharmacyId);
    if (pharmacy) {
      toast({
        title: "Подключение отключено",
        description: `Подключение к ${pharmacy.name} успешно отключено`,
      });
    }
  };

  const handleOrderPrescription = (prescriptionId: string) => {
    const prescription = mockPrescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      toast({
        title: "Заказ оформлен",
        description: `Рецепт на ${prescription.medicationName} добавлен в корзину`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активный</Badge>;
      case 'filled':
        return <Badge className="bg-blue-100 text-blue-800">Выполнен</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Истёк</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Интеграция с аптеками', href: '/patient/pharmacy-integration' }
  ];

  return (
    <PatientLayout title="Интеграция с аптеками | Eva" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center mb-2">
            <Pill className="mr-3 text-eva-dusty-rose" size={32} />
            Интеграция с аптеками
          </h1>
          <p className="soft-text">
            Подключите аптеки для автоматического заказа лекарств и отслеживания рецептов
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="prescriptions">Рецепты</TabsTrigger>
            <TabsTrigger value="pharmacies">Аптеки</TabsTrigger>
            <TabsTrigger value="connected">Подключенные ({mockConnectedPharmacies.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card className="bloom-card">
              <CardHeader>
                <CardTitle className="text-lg gentle-text">Активные рецепты</CardTitle>
                <CardDescription>
                  Управляйте своими рецептами и заказывайте лекарства онлайн
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {mockPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="bloom-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg gentle-text flex items-center gap-2">
                          {prescription.medicationName}
                          {getStatusBadge(prescription.status)}
                        </CardTitle>
                        <CardDescription>
                          Врач: {prescription.doctorName} • Выдан: {new Date(prescription.issueDate).toLocaleDateString('ru-RU')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleOrderPrescription(prescription.id)}
                          disabled={prescription.status !== 'active'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Заказать
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Дозировка:</Label>
                        <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Количество:</Label>
                        <p className="text-sm text-muted-foreground">{prescription.quantity} шт.</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Повторов:</Label>
                        <p className="text-sm text-muted-foreground">{prescription.refills}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Действителен до:</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prescription.expiryDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pharmacies" className="space-y-4">
            {/* Search */}
            <Card className="bloom-card">
              <CardHeader>
                <CardTitle className="text-lg gentle-text">Поиск аптек</CardTitle>
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

            {/* Pharmacies List */}
            <div className="grid gap-4">
              {filteredPharmacies.map((pharmacy) => (
                <Card key={pharmacy.id} className="bloom-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg gentle-text flex items-center gap-2">
                          {pharmacy.name}
                          {getConnectionStatusBadge(pharmacy.connectionStatus)}
                        </CardTitle>
                        {pharmacy.chain && (
                          <CardDescription className="text-sm text-eva-dusty-rose">
                            {pharmacy.chain}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{pharmacy.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({pharmacy.reviewCount})
                            </span>
                          </div>
                          {pharmacy.distance && (
                            <Badge variant="outline" className="text-xs">
                              {pharmacy.distance}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {pharmacy.connectionStatus === 'connected' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(pharmacy.id)}
                          >
                            Отключить
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(pharmacy.id)}
                            disabled={pharmacy.connectionStatus === 'pending'}
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
                          {pharmacy.address}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                          {pharmacy.phone}
                        </div>
                        {pharmacy.website && (
                          <div className="flex items-center text-sm">
                            <Globe className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                            <a href={pharmacy.website} target="_blank" rel="noopener noreferrer" 
                               className="text-eva-dusty-rose hover:underline">
                              {pharmacy.website}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-eva-dusty-rose" />
                          {pharmacy.workingHours}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium">Услуги:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {pharmacy.services.map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {pharmacy.deliveryAvailable && (
                            <Badge variant="outline" className="text-xs">
                              <Truck className="h-3 w-3 mr-1" />
                              Доставка
                            </Badge>
                          )}
                          {pharmacy.onlineOrdering && (
                            <Badge variant="outline" className="text-xs">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Онлайн-заказ
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-4">
            {mockConnectedPharmacies.length === 0 ? (
              <Card className="bloom-card">
                <CardContent className="p-8 text-center">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет подключенных аптек</h3>
                  <p className="text-muted-foreground">
                    Подключите аптеки для автоматического заказа лекарств и отслеживания рецептов
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {mockConnectedPharmacies.map((pharmacy) => (
                  <Card key={pharmacy.id} className="bloom-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg gentle-text flex items-center gap-2">
                            {pharmacy.name}
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle size={12} className="mr-1" />
                              Подключено
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Последняя синхронизация: {new Date(pharmacy.lastSync!).toLocaleString('ru-RU')}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(pharmacy.id)}
                        >
                          Отключить
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Синхронизация данных:</Label>
                          <div className="mt-1 space-y-1">
                            {Object.entries(pharmacy.dataSharing).map(([key, enabled]) => (
                              <div key={key} className="flex items-center text-sm">
                                <CheckCircle className={`h-3 w-3 mr-2 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                                {key === 'prescriptions' && 'Рецепты'}
                                {key === 'purchaseHistory' && 'История покупок'}
                                {key === 'deliveryTracking' && 'Отслеживание доставки'}
                                {key === 'inventory' && 'Наличие препаратов'}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Способы оплаты:</Label>
                          <div className="mt-1 space-y-1">
                            {pharmacy.paymentMethods.map((method, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <CreditCard className="h-3 w-3 mr-2 text-eva-dusty-rose" />
                                {method}
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