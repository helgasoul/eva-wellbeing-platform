import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

// Сервис для работы с ИИ помощником Eva через Supabase Edge Function
class EvaAIService {
  // Анализ медицинского документа
  async analyzeDocument(documentContent: string, documentType: string = 'unknown') {
    try {
      console.log('Analyzing document with Eva AI...');
      
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          documentContent,
          documentType
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Не удалось провести анализ документа');
      }

      if (!data || !data.analysis) {
        throw new Error('Получен некорректный ответ от сервиса анализа');
      }

      return data.analysis;
    } catch (error) {
      console.error('Ошибка анализа документа:', error);
      throw new Error('Не удалось провести анализ документа');
    }
  }

  // Анализ CSV файла с медицинскими данными
  async analyzeCSVData(csvData: string) {
    try {
      const analysis = await this.analyzeDocument(csvData, 'csv');
      
      // Дополнительная обработка для CSV
      analysis.dataStats = this.extractCSVStats(csvData);
      
      return analysis;
    } catch (error) {
      console.error('Ошибка анализа CSV:', error);
      throw error;
    }
  }

  // Извлечение статистики из CSV
  extractCSVStats(csvContent: string) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0] ? lines[0].split(',').length : 0;
    const rows = lines.length - 1; // Исключаем заголовок
    
    return {
      totalRows: rows,
      columns: headers,
      dataSize: csvContent.length
    };
  }

  // Проверка статуса сервиса
  async checkServiceStatus() {
    try {
      const testResponse = await this.analyzeDocument('Тест связи', 'test');
      return true;
    } catch (error) {
      console.error('Ошибка проверки сервиса:', error);
      return false;
    }
  }
}

// Хук для использования в React компонентах
export const useEvaAI = () => {
  const [evaService] = useState(() => new EvaAIService());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (content: string, type: string = 'unknown') => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await evaService.analyzeDocument(content, type);
      return result;
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
      const result = await evaService.analyzeCSVData(csvContent);
      return result;
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
      return await evaService.checkServiceStatus();
    } catch (err) {
      return false;
    }
  };

  return {
    analyzeDocument,
    analyzeCSV,
    checkStatus,
    isAnalyzing,
    error
  };
};

// Утилиты для работы с документами
export const DocumentUtils = {
  // Чтение файла как текст
  readFileAsText: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Не удалось прочитать файл как текст'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  // Определение типа документа
  getDocumentType: (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'csv': 'csv',
      'txt': 'text',
      'json': 'json'
    };
    return typeMap[extension] || 'unknown';
  },

  // Форматирование размера файла
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Валидация медицинского документа
  validateMedicalDocument: (content: string) => {
    const medicalKeywords = [
      'анализ', 'диагноз', 'симптом', 'лечение', 'врач', 'пациент',
      'болезнь', 'здоровье', 'медицина', 'клиника', 'больница',
      'обследование', 'результат', 'заключение', 'рекомендация'
    ];
    
    const contentLower = content.toLowerCase();
    const foundKeywords = medicalKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );
    
    return {
      isMedical: foundKeywords.length > 0,
      confidence: foundKeywords.length / medicalKeywords.length,
      keywords: foundKeywords
    };
  },

  // Извлечение текста из различных типов файлов
  extractTextContent: async (file: File): Promise<string> => {
    const type = DocumentUtils.getDocumentType(file);
    
    switch (type) {
      case 'text':
      case 'csv':
      case 'json':
        return await DocumentUtils.readFileAsText(file);
      
      case 'pdf':
        // Для PDF файлов можно добавить библиотеку pdf-parse или аналогичную
        throw new Error('Извлечение текста из PDF пока не поддерживается');
      
      case 'document':
        // Для DOC/DOCX файлов можно добавить библиотеку mammoth или аналогичную
        throw new Error('Извлечение текста из документов Word пока не поддерживается');
      
      default:
        return await DocumentUtils.readFileAsText(file);
    }
  },

  // Проверка размера файла
  validateFileSize: (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Проверка типа файла
  validateFileType: (file: File, allowedTypes: string[] = ['pdf', 'doc', 'docx', 'txt', 'csv']): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return allowedTypes.includes(extension);
  }
};

export default EvaAIService;