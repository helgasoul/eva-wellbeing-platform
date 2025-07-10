import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertTriangle, Bot, CheckCircle, Clock, Calendar, Eye, Download, Trash2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientLayout } from '@/components/layout/PatientLayout';

const Documents = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [userTier, setUserTier] = useState('plus'); // 'basic' или 'plus'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingDoc, setAnalyzingDoc] = useState(null);

  // Симуляция загруженных документов
  useEffect(() => {
    const mockDocuments = [
      {
        id: 1,
        name: 'patient_comments.csv',
        type: 'csv',
        size: '12.4 KB',
        uploadedAt: '2025-07-10T10:30:00Z',
        status: 'analyzed',
        category: 'Медицинские данные',
        aiAnalysis: {
          summary: 'Обнаружены 30 записей пациентов с вопросами по маммологии',
          insights: [
            'Большинство пациентов выражают беспокойство по поводу противоречивых мнений врачей',
            'Часто встречаются вопросы о периодичности обследований',
            'Пациенты нуждаются в разъяснении терминологии'
          ],
          recommendations: [
            'Рекомендуется консультация с профильным специалистом',
            'Необходимо получение второго мнения при противоречивых диагнозах',
            'Важно обратиться к маммологу для комплексного обследования'
          ],
          riskLevel: 'medium'
        }
      },
      {
        id: 2,
        name: 'analysis_results.pdf',
        type: 'pdf',
        size: '2.1 MB',
        uploadedAt: '2025-07-10T09:15:00Z',
        status: 'pending',
        category: 'Результаты анализов'
      },
      {
        id: 3,
        name: 'medical_history.docx',
        type: 'docx',
        size: '856 KB',
        uploadedAt: '2025-07-10T08:45:00Z',
        status: 'analyzed',
        category: 'Медицинская история'
      }
    ];
    setDocuments(mockDocuments);
  }, []);

  // Симуляция анализа документа ИИ
  const analyzeDocument = async (docId) => {
    setAnalyzingDoc(docId);
    
    toast({
      title: "Анализ начат",
      description: "ИИ помощник Eva начал анализ вашего документа",
    });

    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis = {
        summary: 'Документ содержит важную медицинскую информацию, которая требует внимания специалиста',
        insights: [
          'Обнаружены показатели, требующие дополнительного изучения',
          'Рекомендуется повторное обследование',
          'Необходимо обратить внимание на динамику изменений'
        ],
        recommendations: [
          'Обратитесь к лечащему врачу для интерпретации результатов',
          'Рассмотрите возможность дополнительных обследований',
          'Ведите дневник симптомов для отслеживания изменений'
        ],
        riskLevel: 'medium',
        disclaimer: 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
      };

      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'analyzed', aiAnalysis: mockAnalysis }
          : doc
      ));

      toast({
        title: "Анализ завершен",
        description: "ИИ помощник Eva успешно проанализировал ваш документ",
      });
    } catch (error) {
      console.error('Ошибка анализа:', error);
      toast({
        title: "Ошибка анализа",
        description: "Произошла ошибка при анализе документа. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingDoc(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка размера файла
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла: 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    toast({
      title: "Загрузка начата",
      description: `Загружается файл ${file.name}...`,
    });
    
    try {
      // Симуляция загрузки файла
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type || 'unknown',
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toISOString(),
        status: userTier === 'plus' ? 'analyzing' : 'uploaded',
        category: 'Загруженный документ'
      };

      setDocuments(prev => [newDoc, ...prev]);

      toast({
        title: "Документ загружен",
        description: `${file.name} успешно загружен в ваши документы`,
      });

      // Автоматический анализ для Plus пользователей
      if (userTier === 'plus') {
        setTimeout(() => analyzeDocument(newDoc.id), 1000);
      }

    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке файла. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleView = (doc) => {
    toast({
      title: "Просмотр документа",
      description: `Открывается ${doc.name}...`,
    });
  };

  const handleDownload = (doc) => {
    toast({
      title: "Скачивание начато",
      description: `${doc.name} загружается...`,
    });
  };

  const handleDelete = (docId) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    
    toast({
      title: "Документ удален",
      description: `${doc?.name || 'Документ'} успешно удален из вашей библиотеки`,
    });
  };

  const handleBookAppointment = () => {
    toast({
      title: "Запись к врачу",
      description: "Переход к записи на консультацию со специалистом",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'analyzing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои документы</h1>
            <p className="text-gray-600 mt-2">
              Загружайте и анализируйте медицинские документы с помощью ИИ помощника Eva
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              userTier === 'plus' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {userTier === 'plus' ? 'Plus' : 'Basic'}
            </span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.csv,.txt"
            disabled={uploading}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <Upload className={`w-12 h-12 ${uploading ? 'text-gray-400' : 'text-blue-500'}`} />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Загрузка...' : 'Загрузить документ'}
              </p>
              <p className="text-sm text-gray-600">
                Поддерживаются файлы: PDF, DOC, DOCX, CSV, TXT (макс. 10MB)
              </p>
              {userTier === 'plus' && (
                <p className="text-sm text-purple-600 mt-2 flex items-center justify-center">
                  <Bot className="w-4 h-4 mr-1" />
                  Автоматический анализ с ИИ помощником Eva
                </p>
              )}
            </div>
          </label>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(doc.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {doc.name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {doc.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{doc.size}</span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </div>
                    
                    {/* AI Analysis Results */}
                    {doc.aiAnalysis && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <Bot className="w-5 h-5 text-purple-600" />
                          <h4 className="font-medium text-purple-900">Анализ ИИ помощника Eva</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(doc.aiAnalysis.riskLevel)}`}>
                            {doc.aiAnalysis.riskLevel === 'high' ? 'Высокий приоритет' : 
                             doc.aiAnalysis.riskLevel === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          {doc.aiAnalysis.summary}
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Ключевые моменты:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {doc.aiAnalysis.insights.map((insight, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-purple-500 mr-2">•</span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Рекомендации:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {doc.aiAnalysis.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">
                                Важное предупреждение
                              </p>
                              <p className="text-xs text-amber-700 mt-1">
                                {doc.aiAnalysis.disclaimer}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                          <button 
                            onClick={handleBookAppointment}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Записаться к врачу</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Loading State for Analysis */}
                    {analyzingDoc === doc.id && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
                          <span className="text-sm text-blue-700">
                            ИИ помощник Eva анализирует документ...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleView(doc)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  {userTier === 'plus' && doc.status === 'uploaded' && (
                    <button 
                      onClick={() => analyzeDocument(doc.id)}
                      className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                      disabled={analyzingDoc === doc.id}
                    >
                      <Bot className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {documents.length === 0 && !uploading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">У вас пока нет загруженных документов</p>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default Documents;