import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type CalculatorCategory } from '@/services/mdcalcService';

interface CategoryTabsProps {
  categories: CalculatorCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const tabCategories = [
    { id: 'menopause-relevant', name: '🌸 Для менопаузы', count: categories.find(c => c.id === 'menopause-relevant')?.count || 15 },
    { id: 'cardiovascular', name: '❤️ Кардиология', count: categories.find(c => c.id === 'cardiovascular')?.count || 85 },
    { id: 'endocrinology', name: '🦋 Эндокринология', count: categories.find(c => c.id === 'endocrinology')?.count || 45 },
    { id: 'oncology', name: '🎗️ Онкология', count: categories.find(c => c.id === 'oncology')?.count || 38 },
    { id: 'bone-health', name: '🦴 Костное здоровье', count: categories.find(c => c.id === 'bone-health')?.count || 12 },
    { id: 'all', name: '📋 Все категории', count: 550 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex flex-wrap gap-2">
        {tabCategories.map(category => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all duration-200",
              selectedCategory === category.id
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "hover:bg-muted"
            )}
          >
            {category.name}
            <span className="ml-2 text-xs opacity-75">({category.count})</span>
          </Button>
        ))}
      </div>
    </div>
  );
};