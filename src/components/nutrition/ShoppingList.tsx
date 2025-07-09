import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Check, 
  Plus, 
  Minus,
  MapPin,
  Calculator,
  Download,
  Share2,
  Store,
  Clock
} from 'lucide-react';
import type { BasicMealPlan } from '@/data/baseMealPlans';

interface ShoppingListProps {
  mealPlans: BasicMealPlan[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  userSubscription: 'essential' | 'plus' | 'optimum';
  className?: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'protein' | 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'spices';
  isChecked: boolean;
  estimatedPrice?: number;
  stores: string[];
  mealPlans: string[];
}

const categoryIcons = {
  protein: '🥩',
  vegetables: '🥬',
  fruits: '🍎',
  dairy: '🥛',
  grains: '🌾',
  spices: '🌿'
};

const categoryColors = {
  protein: 'bg-red-100 text-red-800 border-red-200',
  vegetables: 'bg-green-100 text-green-800 border-green-200',
  fruits: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dairy: 'bg-blue-100 text-blue-800 border-blue-200',
  grains: 'bg-amber-100 text-amber-800 border-amber-200',
  spices: 'bg-purple-100 text-purple-800 border-purple-200'
};

export const ShoppingList: React.FC<ShoppingListProps> = ({
  mealPlans,
  timeframe,
  userSubscription,
  className = ""
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<'category' | 'store'>('category');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  // Генерация списка покупок из планов питания
  const shoppingItems = useMemo(() => {
    const itemMap = new Map<string, ShoppingItem>();
    
    mealPlans.forEach(plan => {
      plan.ingredients.forEach(ingredient => {
        const parsed = parseIngredient(ingredient);
        const key = parsed.name.toLowerCase();
        
        if (itemMap.has(key)) {
          const existing = itemMap.get(key)!;
          existing.amount += parsed.amount;
          existing.mealPlans.push(plan.name);
        } else {
          itemMap.set(key, {
            id: key,
            name: parsed.name,
            amount: parsed.amount,
            unit: parsed.unit,
            category: categorizeIngredient(parsed.name),
            isChecked: false,
            estimatedPrice: estimatePrice(parsed.name, parsed.amount),
            stores: getAvailableStores(parsed.name),
            mealPlans: [plan.name]
          });
        }
      });
    });

    return Array.from(itemMap.values());
  }, [mealPlans]);

  const parseIngredient = (ingredient: string) => {
    const match = ingredient.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(\w+)$/);
    if (match) {
      return {
        name: match[1],
        amount: parseFloat(match[2]),
        unit: match[3]
      };
    }
    return {
      name: ingredient,
      amount: 1,
      unit: 'шт'
    };
  };

  const categorizeIngredient = (name: string): ShoppingItem['category'] => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('мясо') || lowerName.includes('курица') || lowerName.includes('рыба')) return 'protein';
    if (lowerName.includes('овощ') || lowerName.includes('зелень') || lowerName.includes('капуста')) return 'vegetables';
    if (lowerName.includes('фрукт') || lowerName.includes('ягод') || lowerName.includes('яблок')) return 'fruits';
    if (lowerName.includes('молоко') || lowerName.includes('творог') || lowerName.includes('сыр')) return 'dairy';
    if (lowerName.includes('крупа') || lowerName.includes('рис') || lowerName.includes('овсян')) return 'grains';
    return 'spices';
  };

  const estimatePrice = (name: string, amount: number): number => {
    const basePrices: Record<string, number> = {
      'куриная грудка': 350,
      'говядина': 500,
      'рыба': 400,
      'молоко': 80,
      'творог': 120,
      'овощи': 100,
      'фрукты': 150
    };
    
    const category = categorizeIngredient(name);
    const basePrice = basePrices[name.toLowerCase()] || 100;
    return Math.round(basePrice * amount / 100);
  };

  const getAvailableStores = (name: string): string[] => {
    return ['Пятёрочка', 'Магнит', 'Лента', 'Перекрёсток', 'ВкусВилл'];
  };

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const groupedItems = useMemo(() => {
    if (groupBy === 'category') {
      return shoppingItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, ShoppingItem[]>);
    } else {
      return shoppingItems.reduce((acc, item) => {
        item.stores.forEach(store => {
          if (!acc[store]) acc[store] = [];
          acc[store].push(item);
        });
        return acc;
      }, {} as Record<string, ShoppingItem[]>);
    }
  }, [shoppingItems, groupBy]);

  const totalItems = shoppingItems.length;
  const checkedCount = checkedItems.size;
  const totalPrice = shoppingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  const checkedPrice = shoppingItems
    .filter(item => checkedItems.has(item.id))
    .reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  const canUseAdvanced = userSubscription === 'plus' || userSubscription === 'optimum';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и статистика */}
      <Card className="bg-gradient-to-br from-background via-primary/5 to-accent/10 border-primary/10 shadow-elegant rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-playfair text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Список покупок
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {timeframe === 'daily' && '📅 На день'}
                {timeframe === 'weekly' && '📅 На неделю'}
                {timeframe === 'monthly' && '📅 На месяц'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {checkedCount}/{totalItems} готово
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Товаров</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{checkedCount}</div>
              <div className="text-sm text-muted-foreground">Куплено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalPrice}₽</div>
              <div className="text-sm text-muted-foreground">Итого</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalPrice - checkedPrice}₽</div>
              <div className="text-sm text-muted-foreground">Осталось</div>
            </div>
          </div>

          {/* Управление */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={groupBy === 'category' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('category')}
              >
                По категориям
              </Button>
              {canUseAdvanced && (
                <Button
                  variant={groupBy === 'store' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('store')}
                >
                  По магазинам
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Экспорт
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Поделиться
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список покупок */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <Card key={groupName} className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                {groupBy === 'category' ? (
                  <>
                    <span className="text-xl">{categoryIcons[groupName as keyof typeof categoryIcons]}</span>
                    {groupName === 'protein' && 'Белки'}
                    {groupName === 'vegetables' && 'Овощи'}
                    {groupName === 'fruits' && 'Фрукты'}
                    {groupName === 'dairy' && 'Молочные'}
                    {groupName === 'grains' && 'Крупы'}
                    {groupName === 'spices' && 'Специи'}
                  </>
                ) : (
                  <>
                    <Store className="h-5 w-5 text-primary" />
                    {groupName}
                  </>
                )}
                <Badge variant="outline" className="text-xs">
                  {items.length} товаров
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      checkedItems.has(item.id)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-background/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      
                      <div className="flex-1">
                        <div className={`font-medium ${
                          checkedItems.has(item.id) ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.amount} {item.unit}
                          {item.mealPlans.length > 0 && (
                            <span className="ml-2">
                              • {item.mealPlans.slice(0, 2).join(', ')}
                              {item.mealPlans.length > 2 && ` +${item.mealPlans.length - 2}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.estimatedPrice && (
                        <div className="text-sm font-medium text-foreground">
                          {item.estimatedPrice}₽
                        </div>
                      )}
                      {canUseAdvanced && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.stores[0]}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Доставка (только для Plus/Optimum) */}
      {canUseAdvanced && (
        <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20 shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              Доставка продуктов
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                <div className="text-2xl">🛒</div>
                <div>
                  <div className="font-medium text-foreground text-sm">Самокат</div>
                  <div className="text-xs text-muted-foreground">Доставка за 15 минут</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                <div className="text-2xl">🚚</div>
                <div>
                  <div className="font-medium text-foreground text-sm">Яндекс.Лавка</div>
                  <div className="text-xs text-muted-foreground">Быстрая доставка</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                <div className="text-2xl">🏪</div>
                <div>
                  <div className="font-medium text-foreground text-sm">ВкусВилл</div>
                  <div className="text-xs text-muted-foreground">Натуральные продукты</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};