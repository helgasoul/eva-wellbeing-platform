import React, { useState } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  avatar: string;
  lastContact: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextAppointment?: string;
  unreadMessages: number;
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    avatar: '/avatars/01.png',
    lastContact: '2024-01-15',
    riskLevel: 'low',
    nextAppointment: '2024-01-20',
    unreadMessages: 2
  },
  {
    id: '2', 
    name: 'Мария Иванова',
    avatar: '/avatars/02.png',
    lastContact: '2024-01-14',
    riskLevel: 'medium',
    unreadMessages: 0
  },
  {
    id: '3',
    name: 'Елена Сидорова',
    avatar: '/avatars/03.png', 
    lastContact: '2024-01-13',
    riskLevel: 'high',
    nextAppointment: '2024-01-16',
    unreadMessages: 5
  }
];

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients] = useState<Patient[]>(mockPatients);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">Высокий риск</Badge>;
      case 'medium':
        return <Badge variant="secondary">Средний риск</Badge>;
      case 'low':
        return <Badge variant="outline">Низкий риск</Badge>;
      default:
        return null;
    }
  };

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мои пациентки</h1>
            <p className="text-muted-foreground">Управление вашими пациентками</p>
          </div>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Добавить пациентку
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск пациенток..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Последний контакт: {new Date(patient.lastContact).toLocaleDateString('ru-RU')}
                      </p>
                      {patient.nextAppointment && (
                        <p className="text-sm text-primary">
                          Следующий прием: {new Date(patient.nextAppointment).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getRiskBadge(patient.riskLevel)}
                    
                    {patient.unreadMessages > 0 && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{patient.unreadMessages}</span>
                      </Badge>
                    )}

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Сообщения
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        Записать
                      </Button>
                      <Button size="sm">
                        Открыть профиль
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Пациентки не найдены</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Попробуйте изменить критерии поиска' : 'У вас пока нет пациенток'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
}