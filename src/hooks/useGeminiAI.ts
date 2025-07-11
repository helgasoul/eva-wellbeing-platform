import { useState } from 'react';
import { GeminiService } from '@/services/geminiService';

// Hook to replace useEvaAI with secure Gemini service
export const useGeminiAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (content: string, type: string = 'unknown') => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await GeminiService.analyzeDocument(content, type);
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка анализа документа');
      }
      
      // Convert Gemini response format to expected legacy format
      const analysis = {
        summary: result.analysis?.patientSummary || 'Анализ завершен',
        insights: result.analysis?.keyFindings || [],
        recommendations: result.analysis?.recommendedActions || [],
        riskLevel: result.analysis?.riskAssessment?.level || 'medium',
        abnormalValues: result.analysis?.abnormalValues || [],
        menopauseRelevance: result.analysis?.menopauseRelevance || [],
        disclaimer: 'Данный анализ предоставлен ИИ помощником Gemini и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
      };
      
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при анализе';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCSV = async (csvContent: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await GeminiService.analyzeDocument(csvContent, 'csv');
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка анализа CSV');
      }
      
      // Convert Gemini response format and add CSV-specific stats
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0] ? lines[0].split(',').length : 0;
      const rows = lines.length - 1;
      
      const analysis = {
        summary: result.analysis?.patientSummary || 'Анализ CSV завершен',
        insights: result.analysis?.keyFindings || [],
        recommendations: result.analysis?.recommendedActions || [],
        riskLevel: result.analysis?.riskAssessment?.level || 'medium',
        abnormalValues: result.analysis?.abnormalValues || [],
        menopauseRelevance: result.analysis?.menopauseRelevance || [],
        dataStats: {
          totalRows: rows,
          columns: headers,
          dataSize: csvContent.length
        },
        disclaimer: 'Данный анализ предоставлен ИИ помощником Gemini и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
      };
      
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при анализе CSV';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkStatus = async () => {
    try {
      // Simple test to check if Gemini service is working
      const result = await GeminiService.analyzeDocument('Test connection', 'test');
      return result.success;
    } catch (err) {
      return false;
    }
  };

  const analyzeMeal = async (mealData: any, userProfile: any) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await GeminiService.analyzeMeal(mealData, userProfile);
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка анализа питания');
      }
      
      return result.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при анализе питания';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateHealthInsights = async (healthData: any, symptomData: any, userProfile: any) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await GeminiService.generateHealthInsights(healthData, symptomData, userProfile);
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка генерации инсайтов');
      }
      
      return result.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при генерации инсайтов';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeDocument,
    analyzeCSV,
    analyzeMeal,
    generateHealthInsights,
    checkStatus,
    isAnalyzing,
    error
  };
};