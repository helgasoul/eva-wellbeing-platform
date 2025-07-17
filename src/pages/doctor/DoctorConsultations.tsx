import React, { useState } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, MessageSquare, Phone, CheckCircle } from 'lucide-react';

interface Consultation {
  id: string;
  patientName: string;
  patientAvatar: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'message';
  status: 'scheduled' | 'completed' | 'cancelled' | 'ongoing';
  reason: string;
  duration?: number;
}

const mockConsultations: Consultation[] = [
  {
    id: '1',
    patientName: 'Анна Петрова',
    patientAvatar: '/avatars/01.png',
    date: '2024-01-16',
    time: '10:00',
    type: 'video',
    status: 'scheduled',
    reason: 'Контрольная консультация после лечения'
  },
  {
    id: '2',
    patientName: 'Мария Иванова',
    patientAvatar: '/avatars/02.png',
    date: '2024-01-16',
    time: '11:30',
    type: 'phone',
    status: 'ongoing',
    reason: 'Обсуждение результатов анализов'
  },
  {
    id: '3',
    patientName: 'Елена Сидорова',
    patientAvatar: '/avatars/03.png',
    date: '2024-01-15',
    time: '14:00',
    type: 'video',
    status: 'completed',
    reason: 'Первичная консультация по СПКЯ',
    duration: 45
  }
];

export default function DoctorConsultations() {
  const [consultations] = useState<Consultation[]>(mockConsultations);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredConsultations = selectedStatus === 'all' 
    ? consultations 
    : consultations.filter(c => c.status === selectedStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default">Запланирована</Badge>;
      case 'ongoing':
        return <Badge variant="destructive">В процессе</Badge>;
      case 'completed':
        return <Badge variant="secondary">Завершена</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Отменена</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActionButton = (consultation: Consultation) => {
    switch (consultation.status) {
      case 'scheduled':
        return (
          <Button size="sm">
            {getTypeIcon(consultation.type)}
            <span className="ml-2">Начать</span>
          </Button>
        );
      case 'ongoing':
        return (
          <Button variant="destructive" size="sm">
            Завершить
          </Button>
        );
      case 'completed':
        return (
          <Button variant="outline" size="sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Просмотр
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Консультации</h1>
            <p className="text-muted-foreground">Управление вашими консультациями</p>
          </div>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Создать слот
          </Button>
        </div>

        <div className="flex space-x-2 mb-6">
          <Button 
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('all')}
            size="sm"
          >
            Все
          </Button>
          <Button 
            variant={selectedStatus === 'scheduled' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('scheduled')}
            size="sm"
          >
            Запланированные
          </Button>
          <Button 
            variant={selectedStatus === 'ongoing' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('ongoing')}
            size="sm"
          >
            В процессе
          </Button>
          <Button 
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('completed')}
            size="sm"
          >
            Завершенные
          </Button>
        </div>

        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={consultation.patientAvatar} alt={consultation.patientName} />
                      <AvatarFallback>
                        {consultation.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{consultation.patientName}</h3>
                      <p className="text-sm text-muted-foreground">{consultation.reason}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(consultation.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{consultation.time}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          {getTypeIcon(consultation.type)}
                          <span className="capitalize">{consultation.type}</span>
                        </div>
                        {consultation.duration && (
                          <span className="text-sm text-muted-foreground">
                            {consultation.duration} мин
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(consultation.status)}
                    {getActionButton(consultation)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredConsultations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Консультации не найдены</h3>
              <p className="text-muted-foreground">
                {selectedStatus === 'all' 
                  ? 'У вас пока нет запланированных консультаций'
                  : `Нет консультаций со статусом "${selectedStatus}"`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
}