import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { blogApi } from '@/services/blogApi';
import { ExpertProfile } from '@/types/blog';
import { UserRole } from '@/types/roles';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Award, Clock, FileText, Star, UserCheck } from 'lucide-react';

interface PromoteModalProps {
  doctor: ExpertProfile;
  onConfirm: (doctorId: string, data: any) => void;
  onClose: () => void;
}

const PromoteToExpertModal: React.FC<PromoteModalProps> = ({ doctor, onConfirm, onClose }) => {
  const [specialization, setSpecialization] = useState(doctor.specialization || '');
  const [bio, setBio] = useState(doctor.bio || '');
  const [credentials, setCredentials] = useState(doctor.credentials || '');

  const handleSubmit = () => {
    if (!specialization || !bio || !credentials) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    onConfirm(doctor.user_id, {
      expert_specialization: specialization,
      expert_bio: bio,
      expert_credentials: credentials
    });
    onClose();
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Назначить экспертом: {doctor.full_name}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="specialization">Специализация</Label>
          <Input
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Гинекология-эндокринология"
          />
        </div>
        
        <div>
          <Label htmlFor="credentials">Регалии и сертификации</Label>
          <Input
            id="credentials"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            placeholder="Кандидат медицинских наук, сертифицированный специалист"
          />
        </div>
        
        <div>
          <Label htmlFor="bio">Биография эксперта</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Краткая биография и области экспертизы..."
            rows={4}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            Назначить экспертом
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, icon, color = "text-primary" }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={color}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DoctorCard: React.FC<{
  doctor: ExpertProfile;
  onPromoteToExpert: (doctorId: string, data: any) => void;
}> = ({ doctor, onPromoteToExpert }) => {
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={doctor.avatar_url || '/api/placeholder/60/60'}
            alt={doctor.full_name}
            className="w-16 h-16 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{doctor.full_name}</h3>
            <p className="text-muted-foreground">{doctor.specialization}</p>
            <p className="text-sm text-muted-foreground mt-1">{doctor.credentials}</p>
            
            <div className="mt-4 flex items-center space-x-4">
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Пациентов: 0
              </Badge>
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Рейтинг: Н/Д
              </Badge>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {doctor.is_expert ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Award className="h-3 w-3 mr-1" />
                Эксперт
              </Badge>
            ) : (
              <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
                <DialogTrigger asChild>
                  <Button>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Назначить экспертом
                  </Button>
                </DialogTrigger>
                <PromoteToExpertModal
                  doctor={doctor}
                  onConfirm={onPromoteToExpert}
                  onClose={() => setShowPromoteModal(false)}
                />
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ExpertCard: React.FC<{
  expert: ExpertProfile;
  onRevokeExpert: (expertId: string) => void;
}> = ({ expert, onRevokeExpert }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <img
          src={expert.avatar_url || '/api/placeholder/60/60'}
          alt={expert.full_name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{expert.full_name}</h3>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Award className="h-3 w-3 mr-1" />
              Эксперт
            </Badge>
          </div>
          <p className="text-muted-foreground">{expert.expert_specialization}</p>
          <p className="text-sm text-muted-foreground mt-1">{expert.expert_credentials}</p>
          
          <div className="mt-4 flex items-center space-x-4">
            <Badge variant="secondary">
              <FileText className="h-3 w-3 mr-1" />
              Статей: {expert.blog_posts_count}
            </Badge>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              Подписчиков: {expert.blog_followers_count}
            </Badge>
          </div>
          
          {expert.expert_bio && (
            <p className="text-sm mt-2 line-clamp-2">{expert.expert_bio}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onRevokeExpert(expert.user_id)}
          >
            Отозвать статус
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ExpertManagement: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<ExpertProfile[]>([]);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка прав доступа
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Эта страница доступна только администраторам</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [doctorsData, expertsData] = await Promise.all([
        blogApi.getDoctors(),
        blogApi.getExperts()
      ]);
      setDoctors(doctorsData);
      setExperts(expertsData);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const promoteToExpert = async (doctorId: string, data: any) => {
    try {
      await blogApi.promoteToExpert(doctorId, data);
      toast({
        title: 'Успешно',
        description: 'Эксперт назначен успешно'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка назначения эксперта',
        variant: 'destructive'
      });
    }
  };

  const revokeExpert = async (expertId: string) => {
    try {
      await blogApi.revokeExpert(expertId);
      toast({
        title: 'Успешно',
        description: 'Статус эксперта отозван'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка отзыва статуса',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Управление экспертами</h1>
          <p className="text-muted-foreground mt-2">
            Назначайте врачей экспертами и управляйте их статусом
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard 
            title="Всего врачей" 
            value={doctors.length} 
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard 
            title="Активных экспертов" 
            value={experts.length} 
            icon={<Award className="h-4 w-4" />}
            color="text-green-600"
          />
          <StatsCard 
            title="Ожидают назначения" 
            value={doctors.filter(d => !d.is_expert).length} 
            icon={<Clock className="h-4 w-4" />}
            color="text-yellow-600"
          />
          <StatsCard 
            title="Статей опубликовано" 
            value={experts.reduce((sum, expert) => sum + expert.blog_posts_count, 0)} 
            icon={<FileText className="h-4 w-4" />}
            color="text-blue-600"
          />
        </div>

        {/* Табы */}
        <Card>
          <Tabs defaultValue="doctors" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="doctors">Назначить экспертов</TabsTrigger>
                <TabsTrigger value="experts">Активные эксперты</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="doctors">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Врачи</h3>
                    <p className="text-sm text-muted-foreground">
                      {doctors.filter(d => !d.is_expert).length} врачей можно назначить экспертами
                    </p>
                  </div>
                  
                  {doctors.filter(d => !d.is_expert).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Все врачи уже являются экспертами</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctors.filter(d => !d.is_expert).map((doctor) => (
                        <DoctorCard
                          key={doctor.id}
                          doctor={doctor}
                          onPromoteToExpert={promoteToExpert}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="experts">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Активные эксперты</h3>
                    <p className="text-sm text-muted-foreground">
                      {experts.length} экспертов
                    </p>
                  </div>
                  
                  {experts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Пока нет назначенных экспертов</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {experts.map((expert) => (
                        <ExpertCard
                          key={expert.id}
                          expert={expert}
                          onRevokeExpert={revokeExpert}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ExpertManagement;