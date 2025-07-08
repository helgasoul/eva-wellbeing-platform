import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatorCard } from './CalculatorCard';
import { type CalculatorCategory, type MDCalcTool } from '@/services/mdcalcService';

interface CategorySectionProps {
  category: CalculatorCategory;
  searchQuery: string;
  favorites: string[];
  recentlyUsed: string[];
  onCalculatorUse: (calculator: MDCalcTool) => void;
  onToggleFavorite: (calculatorId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  searchQuery,
  favorites,
  recentlyUsed,
  onCalculatorUse,
  onToggleFavorite
}) => {
  const filteredTools = category.relevantTools.filter(tool =>
    searchQuery === '' || 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filteredTools.length === 0) return null;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <CardTitle className="text-xl text-foreground">{category.name}</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredTools.length} калькуляторов
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <CalculatorCard
              key={tool.id}
              calculator={tool}
              isFavorite={favorites.includes(tool.id)}
              isRecentlyUsed={recentlyUsed.includes(tool.id)}
              onUse={() => onCalculatorUse(tool)}
              onToggleFavorite={() => onToggleFavorite(tool.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};