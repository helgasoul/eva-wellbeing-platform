import React, { useState, useEffect } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { useAuth } from '@/context/AuthContext';
import { getEmbeddedCalculators } from '@/data/embeddedCalculators';
import { Calculator, CalculatorResult } from '@/types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Calculator as CalculatorIcon, Search, Star, Clock } from 'lucide-react';

export default function EmbeddedCalculators() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('menopause-relevant');
  const [activeCalculator, setActiveCalculator] = useState<Calculator | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [calculatorHistory, setCalculatorHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const calculators = getEmbeddedCalculators();
  const breadcrumbs = [
    { label: 'Панель врача', href: '/doctor/dashboard' },
    { label: 'Встроенные калькуляторы' }
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem(`calc_history_${user?.id}`);
    if (savedHistory) {
      setCalculatorHistory(JSON.parse(savedHistory));
    }
  }, [user?.id]);

  const filteredCalculators = calculators.filter(calc => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'menopause-relevant' && calc.menopauseRelevance >= 4) ||
      calc.category === selectedCategory;
    
    const matchesSearch = searchQuery === '' || 
      calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleCalculate = () => {
    if (!activeCalculator) return;
    
    try {
      const calculationResult = activeCalculator.calculate(inputValues);
      setResult(calculationResult);
      
      // Сохраняем в историю
      const historyEntry = {
        calculatorId: activeCalculator.id,
        calculatorTitle: activeCalculator.title,
        inputs: { ...inputValues },
        result: calculationResult,
        timestamp: new Date().toISOString(),
        userId: user?.id
      };
      
      const updatedHistory = [historyEntry, ...calculatorHistory].slice(0, 50);
      setCalculatorHistory(updatedHistory);
      localStorage.setItem(`calc_history_${user?.id}`, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Ошибка расчета:', error);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very-high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Низкий риск';
      case 'moderate': return 'Умеренный риск';
      case 'high': return 'Высокий риск';
      case 'very-high': return 'Очень высокий риск';
      default: return level;
    }
  };

  if (!activeCalculator) {
    return (
      <DoctorLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-2xl text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <CalculatorIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-playfair font-bold">Встроенные медицинские калькуляторы</h1>
                <p className="text-white/90 mt-1">
                  Специализированные калькуляторы для женского здоровья с полной интеграцией
                </p>
                <div className="mt-2">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    {calculators.length} калькуляторов
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Фильтры и поиск */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Поиск */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск калькуляторов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Категории */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menopause-relevant">Актуальные для менопаузы</SelectItem>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="oncology">Онкология</SelectItem>
                <SelectItem value="bone-health">Здоровье костей</SelectItem>
                <SelectItem value="cardiovascular">Кардиология</SelectItem>
                <SelectItem value="endocrinology">Эндокринология</SelectItem>
                <SelectItem value="neurology">Неврология</SelectItem>
                <SelectItem value="laboratory">Лабораторные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Сетка калькуляторов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculators.map((calculator) => (
              <Card 
                key={calculator.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white border-gray-200"
                onClick={() => setActiveCalculator(calculator)}
              >
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{calculator.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900">{calculator.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{calculator.description}</p>
                    </div>
                    {calculator.isPopular && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {calculator.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Актуальность: {calculator.menopauseRelevance}/5
                    </span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Открыть
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* История расчетов */}
          {calculatorHistory.length > 0 && (
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Последние расчеты</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {calculatorHistory.slice(0, 5).map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        const calc = calculators.find(c => c.id === entry.calculatorId);
                        if (calc) {
                          setActiveCalculator(calc);
                          setInputValues(entry.inputs);
                          setResult(entry.result);
                        }
                      }}
                    >
                      <div>
                        <div className="font-medium text-sm">{entry.calculatorTitle}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                      <Badge className={getRiskLevelColor(entry.result.riskLevel)}>
                        {entry.result.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Заголовок калькулятора */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              setActiveCalculator(null);
              setInputValues({});
              setResult(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{activeCalculator.title}</h1>
            <p className="text-gray-600">{activeCalculator.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма ввода */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Параметры для расчета</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeCalculator.inputs.map((input) => (
                <div key={input.id} className="space-y-2">
                  <Label htmlFor={input.id} className="text-sm font-medium">
                    {input.label}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                    {input.unit && <span className="text-gray-500 ml-1">({input.unit})</span>}
                  </Label>

                  {input.type === 'number' && (
                    <Input
                      id={input.id}
                      type="number"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={inputValues[input.id] || ''}
                      onChange={(e) => setInputValues({
                        ...inputValues,
                        [input.id]: parseFloat(e.target.value) || 0
                      })}
                      placeholder={`Введите ${input.label.toLowerCase()}`}
                    />
                  )}

                  {input.type === 'select' && (
                    <Select
                      value={inputValues[input.id]?.toString() || ''}
                      onValueChange={(value) => setInputValues({
                        ...inputValues,
                        [input.id]: isNaN(Number(value)) ? value : Number(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Выберите ${input.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {input.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {input.type === 'radio' && (
                    <RadioGroup
                      value={inputValues[input.id]?.toString() || ''}
                      onValueChange={(value) => setInputValues({
                        ...inputValues,
                        [input.id]: isNaN(Number(value)) ? value : Number(value)
                      })}
                    >
                      {input.options?.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                          <Label htmlFor={option.value.toString()}>{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}

              <Button 
                onClick={handleCalculate} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!activeCalculator.inputs.filter(i => i.required).every(i => inputValues[i.id] !== undefined)}
              >
                Рассчитать
              </Button>
            </CardContent>
          </Card>

          {/* Результаты */}
          {result && (
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Результаты расчета</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Основной результат */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {result.value}
                  </div>
                  <Badge className={`${getRiskLevelColor(result.riskLevel)} text-sm px-3 py-1`}>
                    {getRiskLevelLabel(result.riskLevel)}
                  </Badge>
                </div>

                {/* Интерпретация */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Интерпретация</h4>
                  <p className="text-gray-700">{result.interpretation}</p>
                </div>

                {/* Рекомендации */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Рекомендации</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Источники */}
                {result.references && result.references.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Источники</h4>
                    <ul className="space-y-1">
                      {result.references.map((ref, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {index + 1}. {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}