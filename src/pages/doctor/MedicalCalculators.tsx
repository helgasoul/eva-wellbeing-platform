import React, { useState, useEffect } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { QuickAccessPanel } from '@/components/mdcalc/QuickAccessPanel';
import { CategoryTabs } from '@/components/mdcalc/CategoryTabs';
import { CategorySection } from '@/components/mdcalc/CategorySection';
import { LoadingState } from '@/components/mdcalc/LoadingState';
import { getMDCalcIntegration, type MDCalcTool, type CalculatorCategory } from '@/services/mdcalcService';
import { Search } from 'lucide-react';

export default function MedicalCalculators() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CalculatorCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('menopause-relevant');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbs = [
    { label: 'Панель врача', href: '/doctor/dashboard' },
    { label: 'Медицинские калькуляторы' }
  ];

  useEffect(() => {
    loadCalculatorCategories();
    loadUserPreferences();
  }, []);

  const loadCalculatorCategories = async () => {
    setIsLoading(true);
    try {
      const calculatorData = await getMDCalcIntegration();
      setCategories(calculatorData.categories);
    } catch (error) {
      console.error('Ошибка загрузки калькуляторов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPreferences = () => {
    const savedFavorites = JSON.parse(localStorage.getItem(`mdcalc_favorites_${user?.id}`) || '[]');
    const savedRecent = JSON.parse(localStorage.getItem(`mdcalc_recent_${user?.id}`) || '[]');
    setFavorites(savedFavorites);
    setRecentlyUsed(savedRecent);
  };

  const handleCalculatorUse = (calculator: MDCalcTool) => {
    // Добавляем в недавно использованные
    const updatedRecent = [calculator.id, ...recentlyUsed.filter(id => id !== calculator.id)].slice(0, 10);
    setRecentlyUsed(updatedRecent);
    localStorage.setItem(`mdcalc_recent_${user?.id}`, JSON.stringify(updatedRecent));

    // Открываем калькулятор в новой вкладке
    const mdcalcUrl = `https://www.mdcalc.com/calc/${calculator.mdcalcId}`;
    window.open(mdcalcUrl, '_blank', 'width=1200,height=800');
  };

  const toggleFavorite = (calculatorId: string) => {
    const updatedFavorites = favorites.includes(calculatorId)
      ? favorites.filter(id => id !== calculatorId)
      : [...favorites, calculatorId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem(`mdcalc_favorites_${user?.id}`, JSON.stringify(updatedFavorites));
  };

  const filteredCategories = categories.filter(category => 
    selectedCategory === 'all' || category.id === selectedCategory
  );

  return (
    <DoctorLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-2xl text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <span className="text-2xl">🧮</span>
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">Медицинские калькуляторы</h1>
              <p className="text-white/90 mt-1">
                Более 550 валидированных клинических калькуляторов для принятия обоснованных решений
              </p>
              <div className="mt-2">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                  MDCalc Integration
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия и поиск */}
        <QuickAccessPanel 
          favorites={favorites}
          recentlyUsed={recentlyUsed}
          onCalculatorSelect={handleCalculatorUse}
          categories={categories}
        />

        {/* Поиск */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск калькуляторов (например: FRAX, Gail, кардиориск)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Категории */}
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Основной контент */}
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            {filteredCategories.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                searchQuery={searchQuery}
                favorites={favorites}
                recentlyUsed={recentlyUsed}
                onCalculatorUse={handleCalculatorUse}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}