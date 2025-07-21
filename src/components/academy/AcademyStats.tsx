
import React from 'react';
import { BookOpen, Award, Clock, Star } from 'lucide-react';
import { LearningStats } from '@/types/academy';

interface AcademyStatsProps {
  stats: LearningStats;
}

export const AcademyStats: React.FC<AcademyStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: BookOpen,
      label: 'Курсы',
      value: stats.total_courses_enrolled,
      suffix: 'записано',
      color: 'text-primary'
    },
    {
      icon: Award,
      label: 'Завершено',
      value: stats.total_courses_completed,
      suffix: 'курсов',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Время',
      value: stats.total_hours_watched,
      suffix: 'часов',
      color: 'text-blue-600'
    },
    {
      icon: Star,
      label: 'Сертификаты',
      value: stats.certificates_earned,
      suffix: 'получено',
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => (
        <div key={item.label} className="bg-card rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
          <p className="text-2xl font-bold">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.suffix}</p>
        </div>
      ))}
    </div>
  );
};
