import { Calculator, CalculatorInput, CalculatorResult } from '../types/calculator';

export function getEmbeddedCalculators(): Calculator[] {
  return [
    // ========== GAIL MODEL - РИСК РАКА ГРУДИ ==========
    {
      id: 'gail-model',
      title: 'Gail Model - Риск рака молочной железы',
      description: 'Оценка 5-летнего и пожизненного риска развития рака молочной железы',
      category: 'oncology',
      icon: '🎗️',
      isPopular: true,
      menopauseRelevance: 5,
      tags: ['рак груди', 'онкориск', 'скрининг', 'профилактика'],
      inputs: [
        {
          id: 'age',
          label: 'Возраст',
          type: 'number',
          unit: 'лет',
          min: 35,
          max: 85,
          required: true
        },
        {
          id: 'ageFirstMenstruation',
          label: 'Возраст первой менструации',
          type: 'select',
          options: [
            { value: 7, label: '≤11 лет' },
            { value: 10, label: '12 лет' },
            { value: 5, label: '13 лет' },
            { value: 2, label: '14 лет' },
            { value: 0, label: '≥15 лет' }
          ],
          required: true
        },
        {
          id: 'ageFirstBirth',
          label: 'Возраст первых родов',
          type: 'select',
          options: [
            { value: 0, label: 'Нет родов' },
            { value: 4, label: '<20 лет' },
            { value: 10, label: '20-24 года' },
            { value: 13, label: '25-29 лет' },
            { value: 17, label: '≥30 лет' }
          ],
          required: true
        },
        {
          id: 'relativesWithBreastCancer',
          label: 'Родственницы с раком груди',
          type: 'select',
          options: [
            { value: 0, label: 'Нет' },
            { value: 15, label: '1 родственница' },
            { value: 25, label: '≥2 родственниц' }
          ],
          required: true
        },
        {
          id: 'biopsies',
          label: 'Биопсии молочной железы',
          type: 'select',
          options: [
            { value: 0, label: 'Нет' },
            { value: 15, label: '1 биопсия' },
            { value: 25, label: '≥2 биопсий' }
          ],
          required: true
        },
        {
          id: 'atypicalHyperplasia',
          label: 'Атипичная гиперплазия',
          type: 'radio',
          options: [
            { value: 0, label: 'Нет' },
            { value: 40, label: 'Да' }
          ],
          required: true
        }
      ],
      calculate: (values) => {
        const baselineRisk = getBaselineBreastCancerRisk(values.age);
        const riskFactors = [
          values.ageFirstMenstruation || 0,
          values.ageFirstBirth || 0,
          values.relativesWithBreastCancer || 0,
          values.biopsies || 0,
          values.atypicalHyperplasia || 0
        ];
        
        const totalRiskScore = riskFactors.reduce((sum, factor) => sum + factor, 0);
        const fiveYearRisk = (baselineRisk * (1 + totalRiskScore / 100)) * 5;
        const lifetimeRisk = fiveYearRisk * 4.5; // Приблизительно
        
        let riskLevel: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
        if (fiveYearRisk >= 3.0) riskLevel = 'very-high';
        else if (fiveYearRisk >= 2.0) riskLevel = 'high';
        else if (fiveYearRisk >= 1.5) riskLevel = 'moderate';
        
        return {
          value: fiveYearRisk.toFixed(2),
          interpretation: `5-летний риск: ${fiveYearRisk.toFixed(2)}%, пожизненный риск: ${lifetimeRisk.toFixed(1)}%`,
          riskLevel,
          recommendations: getGailRecommendations(riskLevel, fiveYearRisk),
          references: ['Gail MH et al. J Natl Cancer Inst. 1989;81(24):1879-86']
        };
      }
    },

    // ========== FRAX - РИСК ПЕРЕЛОМОВ ==========
    {
      id: 'frax-calculator',
      title: 'FRAX - Риск остеопоротических переломов',
      description: '10-летний риск переломов бедра и основных остеопоротических переломов',
      category: 'bone-health',
      icon: '🦴',
      isPopular: true,
      menopauseRelevance: 5,
      tags: ['остеопороз', 'переломы', 'кости', 'менопауза'],
      inputs: [
        {
          id: 'age',
          label: 'Возраст',
          type: 'number',
          unit: 'лет',
          min: 40,
          max: 90,
          required: true
        },
        {
          id: 'sex',
          label: 'Пол',
          type: 'radio',
          options: [
            { value: 'female', label: 'Женский' },
            { value: 'male', label: 'Мужской' }
          ],
          required: true
        },
        {
          id: 'weight',
          label: 'Вес',
          type: 'number',
          unit: 'кг',
          min: 30,
          max: 200,
          required: true
        },
        {
          id: 'height',
          label: 'Рост',
          type: 'number',
          unit: 'см',
          min: 100,
          max: 220,
          required: true
        },
        {
          id: 'previousFracture',
          label: 'Переломы в анамнезе после 50 лет',
          type: 'radio',
          options: [
            { value: 0, label: 'Нет' },
            { value: 1, label: 'Да' }
          ],
          required: true
        },
        {
          id: 'parentFracture',
          label: 'Перелом бедра у родителей',
          type: 'radio',
          options: [
            { value: 0, label: 'Нет' },
            { value: 1, label: 'Да' }
          ],
          required: true
        },
        {
          id: 'smoking',
          label: 'Курение',
          type: 'radio',
          options: [
            { value: 0, label: 'Нет' },
            { value: 1, label: 'Да' }
          ],
          required: true
        },
        {
          id: 'alcohol',
          label: 'Алкоголь ≥3 единиц в день',
          type: 'radio',
          options: [
            { value: 0, label: 'Нет' },
            { value: 1, label: 'Да' }
          ],
          required: true
        }
      ],
      calculate: (values) => {
        const bmi = values.weight / ((values.height / 100) ** 2);
        
        // Упрощенная формула FRAX для демонстрации
        let baseRisk = values.sex === 'female' ? 
          Math.max(0, (values.age - 50) * 0.4) : 
          Math.max(0, (values.age - 50) * 0.2);
        
        // Корректировки
        if (bmi < 20) baseRisk *= 1.5;
        if (bmi > 30) baseRisk *= 0.8;
        if (values.previousFracture) baseRisk *= 1.8;
        if (values.parentFracture) baseRisk *= 1.4;
        if (values.smoking) baseRisk *= 1.3;
        if (values.alcohol) baseRisk *= 1.2;
        
        const majorFractureRisk = Math.min(baseRisk, 50);
        const hipFractureRisk = majorFractureRisk * 0.3;
        
        let riskLevel: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
        if (majorFractureRisk >= 20) riskLevel = 'very-high';
        else if (majorFractureRisk >= 10) riskLevel = 'high';
        else if (majorFractureRisk >= 5) riskLevel = 'moderate';
        
        return {
          value: majorFractureRisk.toFixed(1),
          interpretation: `10-летний риск основных переломов: ${majorFractureRisk.toFixed(1)}%, переломов бедра: ${hipFractureRisk.toFixed(1)}%`,
          riskLevel,
          recommendations: getFraxRecommendations(riskLevel, majorFractureRisk),
          references: ['WHO FRAX Calculator', 'Kanis JA et al. Osteoporos Int. 2008']
        };
      }
    },

    // ========== HOMA-IR ==========
    {
      id: 'homa-ir',
      title: 'HOMA-IR - Индекс инсулинорезистентности',
      description: 'Оценка инсулинорезистентности и риска диабета',
      category: 'endocrinology',
      icon: '📊',
      isPopular: true,
      menopauseRelevance: 4,
      tags: ['инсулинорезистентность', 'диабет', 'метаболизм', 'HOMA-IR'],
      inputs: [
        {
          id: 'glucose',
          label: 'Глюкоза натощак',
          type: 'number',
          unit: 'ммоль/л',
          min: 2.0,
          max: 20.0,
          step: 0.1,
          required: true
        },
        {
          id: 'insulin',
          label: 'Инсулин натощак',
          type: 'number',
          unit: 'мкЕд/мл',
          min: 1.0,
          max: 100.0,
          step: 0.1,
          required: true
        }
      ],
      calculate: (values) => {
        const { glucose, insulin } = values;
        
        // HOMA-IR = (Глюкоза * Инсулин) / 22.5
        const homaIR = (glucose * insulin) / 22.5;
        
        let insulinResistanceStatus = 'normal';
        let riskLevel: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
        
        if (homaIR >= 5.0) {
          insulinResistanceStatus = 'severe';
          riskLevel = 'very-high';
        } else if (homaIR >= 2.7) {
          insulinResistanceStatus = 'moderate';
          riskLevel = 'high';
        } else if (homaIR >= 2.0) {
          insulinResistanceStatus = 'mild';
          riskLevel = 'moderate';
        }
        
        return {
          value: homaIR.toFixed(2),
          interpretation: `HOMA-IR: ${homaIR.toFixed(2)} (норма <2.0). Статус: ${insulinResistanceStatus}`,
          riskLevel,
          recommendations: getHomaIRRecommendations(insulinResistanceStatus, homaIR),
          references: ['Matthews DR et al. Diabetologia. 1985', 'Wallace TM et al. Diabetes Care. 2004']
        };
      }
    }
  ];
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function getBaselineBreastCancerRisk(age: number): number {
  if (age < 40) return 0.1;
  if (age < 50) return 0.5;
  if (age < 60) return 1.2;
  if (age < 70) return 2.0;
  return 3.0;
}

function getGailRecommendations(riskLevel: string, fiveYearRisk: number): string[] {
  const recommendations = [];
  
  if (riskLevel === 'very-high') {
    recommendations.push('Консультация онколога-маммолога');
    recommendations.push('Рассмотрение химиопрофилактики (тамоксифен)');
    recommendations.push('МРТ молочных желез ежегодно');
    recommendations.push('Маммография каждые 6 месяцев');
  } else if (riskLevel === 'high') {
    recommendations.push('Консультация онколога');
    recommendations.push('Маммография каждые 12 месяцев');
    recommendations.push('УЗИ молочных желез каждые 6 месяцев');
  } else if (riskLevel === 'moderate') {
    recommendations.push('Маммография ежегодно');
    recommendations.push('Самообследование ежемесячно');
  } else {
    recommendations.push('Маммография согласно скрининговой программе');
    recommendations.push('Здоровый образ жизни');
  }
  
  return recommendations;
}

function getFraxRecommendations(riskLevel: string, majorFractureRisk: number): string[] {
  const recommendations = [];
  
  if (riskLevel === 'very-high') {
    recommendations.push('Немедленное начало антиостеопоротической терапии');
    recommendations.push('DEXA-сканирование для уточнения статуса');
    recommendations.push('Консультация эндокринолога');
    recommendations.push('Коррекция дефицита витамина D и кальция');
  } else if (riskLevel === 'high') {
    recommendations.push('Рассмотрение медикаментозной терапии');
    recommendations.push('DEXA-сканирование обязательно');
    recommendations.push('Оценка риска падений');
  } else if (riskLevel === 'moderate') {
    recommendations.push('DEXA-сканирование для принятия решения');
    recommendations.push('Коррекция факторов риска');
    recommendations.push('Адекватное потребление кальция и витамина D');
  } else {
    recommendations.push('Профилактические меры');
    recommendations.push('Физическая активность');
    recommendations.push('Здоровое питание');
  }
  
  return recommendations;
}

function getHomaIRRecommendations(status: string, homaIR: number): string[] {
  const recommendations = [];
  
  if (status === 'severe') {
    recommendations.push('Консультация эндокринолога');
    recommendations.push('Скрининг сахарного диабета');
    recommendations.push('Метформин по показаниям');
    recommendations.push('Строгая диета с ограничением углеводов');
  } else if (status === 'moderate') {
    recommendations.push('Консультация эндокринолога');
    recommendations.push('Низкоуглеводная диета');
    recommendations.push('Увеличение физической активности');
    recommendations.push('Контроль массы тела');
  } else if (status === 'mild') {
    recommendations.push('Модификация образа жизни');
    recommendations.push('Контроль веса');
    recommendations.push('Регулярные физические нагрузки');
  } else {
    recommendations.push('Инсулиновая чувствительность в норме');
    recommendations.push('Поддержание здорового образа жизни');
  }
  
  return recommendations;
}