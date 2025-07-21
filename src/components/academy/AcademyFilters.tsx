
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AcademyFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

const categoryOptions = [
  { value: 'all', label: 'Все категории' },
  { value: 'menopause_basics', label: 'Основы менопаузы' },
  { value: 'hormones', label: 'Гормоны' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'mental_health', label: 'Психическое здоровье' },
  { value: 'sexuality', label: 'Сексуальность' },
  { value: 'lifestyle', label: 'Образ жизни' }
];

const difficultyOptions = [
  { value: 'all', label: 'Все уровни' },
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' }
];

export const AcademyFilters: React.FC<AcademyFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск курсов..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Поиск курсов"
          />
        </div>
      </div>
      
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-48" aria-label="Выбрать категорию">
          <SelectValue placeholder="Категория" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-full md:w-48" aria-label="Выбрать уровень сложности">
          <SelectValue placeholder="Уровень" />
        </SelectTrigger>
        <SelectContent>
          {difficultyOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
