export interface CalculatorInput {
  id: string;
  label: string;
  type: 'number' | 'select' | 'radio' | 'checkbox';
  unit?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

export interface CalculatorResult {
  value: number | string;
  interpretation: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  recommendations: string[];
  references?: string[];
}

export interface Calculator {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  inputs: CalculatorInput[];
  calculate: (values: Record<string, any>) => CalculatorResult;
  isPopular: boolean;
  menopauseRelevance: number; // 1-5
  tags: string[];
}