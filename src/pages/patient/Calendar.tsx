import React, { useState } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, TrendingUp, Heart, ThermometerSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Симуляция данных менструального цикла
  const getCurrentCycleInfo = () => ({
    phase: 'Фолликулярная фаза',
    dayOfCycle: 12,
    totalCycleDays: 28,
    nextPeriod: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // через 16 дней
    lastPeriod: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 дней назад
  });

  const cycleInfo = getCurrentCycleInfo();

  // Симуляция календарной сетки
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // Пустые дни в начале месяца
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPeriodDay = day <= 5; // первые 5 дней - менструация
      const isOvulationDay = day === 14; // 14-й день - овуляция
      
      days.push({
        date,
        day,
        isToday,
        isPeriodDay,
        isOvulationDay,
        hasSymptoms: Math.random() > 0.7, // случайные симптомы
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <PatientLayout title="Календарь здоровья">
      <div className="space-y-6">
        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Календарь здоровья</h1>
          <p className="text-muted-foreground">
            Отслеживайте свой менструальный цикл и симптомы
          </p>
        </div>

        {/* Текущая информация о цикле */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-eva-dusty-rose" />
                Текущая фаза
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-eva-dusty-rose">{cycleInfo.phase}</p>
              <p className="text-sm text-muted-foreground">
                День {cycleInfo.dayOfCycle} из {cycleInfo.totalCycleDays}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-eva-mauve" />
                Следующая менструация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-eva-mauve">
                {Math.ceil((cycleInfo.nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} дней
              </p>
              <p className="text-sm text-muted-foreground">
                {cycleInfo.nextPeriod.toLocaleDateString('ru-RU')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-eva-sage" />
                Длина цикла
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-eva-sage">{cycleInfo.totalCycleDays} дней</p>
              <p className="text-sm text-muted-foreground">В среднем</p>
            </CardContent>
          </Card>
        </div>

        {/* Календарь */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{monthNames[new Date().getMonth()]} {new Date().getFullYear()}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Предыдущий</Button>
                <Button variant="outline" size="sm">Следующий</Button>
              </div>
            </CardTitle>
            <CardDescription>
              Кликните на день для добавления симптомов или заметок
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => (
                <div key={index} className="aspect-square">
                  {dayData ? (
                    <button
                      onClick={() => setSelectedDate(dayData.date)}
                      className={`w-full h-full p-1 rounded-lg text-sm border transition-all duration-200 ${
                        dayData.isToday
                          ? 'bg-eva-dusty-rose text-primary-foreground border-eva-dusty-rose'
                          : selectedDate?.toDateString() === dayData.date.toDateString()
                          ? 'bg-eva-soft-pink border-eva-dusty-rose'
                          : 'border-transparent hover:bg-muted'
                      }`}
                    >
                      <div className="text-center">
                        <span className="block">{dayData.day}</span>
                        <div className="flex justify-center gap-1 mt-1">
                          {dayData.isPeriodDay && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          {dayData.isOvulationDay && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          {dayData.hasSymptoms && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Легенда */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Менструация</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Овуляция</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Симптомы</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <ThermometerSun className="h-4 w-4" />
              Добавить симптомы
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Отметить менструацию
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Посмотреть аналитику
            </Button>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default Calendar;