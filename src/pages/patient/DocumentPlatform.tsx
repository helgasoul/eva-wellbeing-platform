import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, AlertTriangle, Bot, CheckCircle, Clock, Calendar, Eye, Download, Trash2, MessageCircle, Settings, User, Bell, Search, Filter, BookOpen, Heart, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvaAI, DocumentUtils } from '@/services/evaAIService';

const DocumentPlatform = () => {
  const { toast } = useToast();
  const { analyzeDocument, analyzeCSV, isAnalyzing: aiAnalyzing, error: aiError } = useEvaAI();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [userTier, setUserTier] = useState('plus');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [analyzingDoc, setAnalyzingDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef(null);

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
          summary: 'Обнаружены 30 записей пациентов с вопросами по маммологии. Большинство обращений связано с диагностическими противоречиями и необходимостью разъяснений.',
          insights: [
            'Выявлено высокое беспокойство пациентов по поводу противоречивых мнений разных специалистов',
            'Часто встречаются вопросы о периодичности и безопасности обследований',
            'Пациенты испытывают трудности в понимании медицинской терминологии',
            'Обнаружены случаи с высоким риском онкологических заболеваний'
          ],
          recommendations: [
            'Рекомендуется консультация маммолога для комплексного обследования',
            'При противоречивых диагнозах необходимо получение второго мнения',
            'Следует обратиться к онкологу при выявлении факторов риска',
            'Рекомендуется ведение дневника симптомов для отслеживания изменений'
          ],
          riskLevel: 'high',
          medicalTerms: ['мастопатия', 'маммография', 'УЗИ молочных желез', 'онкомаркеры'],
          urgencyMarkers: ['срочно к онкологу', 'риск рака 85%', 'подозрение на злокачественное образование'],
          disclaimer: 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
        }
      },
      {
        id: 2,
        name: 'blood_test_results.pdf',
        type: 'pdf',
        size: '2.1 MB',
        uploadedAt: '2025-07-10T09:15:00Z',
        status: 'analyzed',
        category: 'Результаты анализов',
        aiAnalysis: {
          summary: 'Результаты общего анализа крови показывают отклонения некоторых показателей от нормы.',
          insights: [
            'Повышен уровень лейкоцитов, что может указывать на воспалительный процесс',
            'Снижен уровень гемоглобина, возможны признаки анемии',
            'СОЭ превышает норму'
          ],
          recommendations: [
            'Обратитесь к терапевту для интерпретации результатов',
            'Возможно потребуется дополнительное обследование',
            'Рекомендуется повторный анализ через 2 недели'
          ],
          riskLevel: 'medium',
          disclaimer: 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
        }
      },
      {
        id: 3,
        name: 'medical_history.docx',
        type: 'docx',
        size: '856 KB',
        uploadedAt: '2025-07-10T08:45:00Z',
        status: 'analyzed',
        category: 'Медицинская история',
        aiAnalysis: {
          summary: 'Подробная медицинская история пациента с хроническими заболеваниями.',
          insights: [
            'Наличие хронических заболеваний требует постоянного мониторинга',
            'Есть наследственная предрасположенность к сердечно-сосудистым заболеваниям'
          ],
          recommendations: [
            'Регулярные профилактические осмотры',
            'Контроль артериального давления',
            'Здоровый образ жизни и диета'
          ],
          riskLevel: 'medium',
          disclaimer: 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
        }
      }
    ];
    setDocuments(mockDocuments);
  }, []);

  // Анализ документа с помощью ИИ
  const analyzeDocumentById = async (docId, fileContent = null, file = null) => {
    setAnalyzingDoc(docId);
    
    toast({
      title: "Анализ начат",
      description: "ИИ помощник Eva начал анализ вашего документа",
    });

    try {
      const doc = documents.find(d => d.id === docId);
      if (!doc) {
        throw new Error('Документ не найден');
      }

      let content = fileContent;
      let documentType = 'unknown';

      if (file) {
        documentType = DocumentUtils.getDocumentType(file);
        if (!content) {
          try {
            content = await DocumentUtils.readFileAsText(file);
          } catch (error) {
            console.warn('Не удалось прочитать содержимое файла, анализируем мета-данные');
            content = `Медицинский документ: ${doc.name}
              Тип: ${doc.type}
              Категория: ${doc.category}
              Размер: ${doc.size}
              Дата: ${doc.uploadedAt}`;
          }
        }
      } else {
        // Для демонстрации используем mock контент для существующих документов
        content = `Медицинский документ: ${doc.name}
          Тип: ${doc.type}
          Категория: ${doc.category}
          Размер: ${doc.size}
          Дата: ${doc.uploadedAt}`;
        documentType = doc.type;
      }

      let analysis;
      if (documentType === 'csv') {
        analysis = await analyzeCSV(content);
      } else {
        analysis = await analyzeDocument(content, documentType);
      }

      setDocuments(prev => prev.map(document => 
        document.id === docId 
          ? { ...document, status: 'analyzed', aiAnalysis: analysis }
          : document
      ));

      toast({
        title: "Анализ завершен",
        description: "ИИ помощник Eva успешно проанализировал ваш документ",
      });
    } catch (error) {
      console.error('Ошибка анализа:', error);
      setDocuments(prev => prev.map(document => 
        document.id === docId 
          ? { ...document, status: 'uploaded' }
          : document
      ));
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

    // Проверка тарифа для автоматического анализа
    if (userTier === 'basic') {
      setShowUpgradeModal(true);
      return;
    }

    // Валидация файла
    if (!DocumentUtils.validateFileSize(file, 10)) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла: 10MB",
        variant: "destructive",
      });
      return;
    }

    if (!DocumentUtils.validateFileType(file)) {
      toast({
        title: "Неподдерживаемый тип файла",
        description: "Поддерживаются файлы: PDF, DOC, DOCX, TXT, CSV",
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type.split('/')[1] || DocumentUtils.getDocumentType(file),
        size: DocumentUtils.formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        status: 'analyzing',
        category: getCategoryFromFileName(file.name)
      };

      setDocuments(prev => [newDoc, ...prev]);

      toast({
        title: "Документ загружен",
        description: `${file.name} успешно загружен в ваши документы`,
      });

      // Автоматический анализ для Plus пользователей
      setTimeout(() => analyzeDocumentById(newDoc.id, null, file), 1000);

    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке файла. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getCategoryFromFileName = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('анализ') || name.includes('test') || name.includes('result')) {
      return 'Результаты анализов';
    }
    if (name.includes('история') || name.includes('history')) {
      return 'Медицинская история';
    }
    if (name.includes('csv') || name.includes('data')) {
      return 'Медицинские данные';
    }
    return 'Медицинский документ';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', ...new Set(documents.map(doc => doc.category))];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'analyzing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const deleteDocument = (docId) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Документ удален",
      description: `${doc?.name || 'Документ'} успешно удален из вашей библиотеки`,
    });
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

  const handleBookAppointment = () => {
    toast({
      title: "Запись к врачу",
      description: "Переход к записи на консультацию со специалистом",
    });
  };

  const handleUpgrade = () => {
    setUserTier('plus');
    setShowUpgradeModal(false);
    toast({
      title: "Тариф обновлен",
      description: "Добро пожаловать в Plus! Теперь доступен автоматический анализ ИИ",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">MedDoc AI</h1>
              </div>
              <span className="text-sm text-gray-500">Платформа анализа медицинских документов</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">ИИ помощник Eva</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                userTier === 'plus' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {userTier === 'plus' ? 'Plus' : 'Basic'}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <input
              ref={fileInputRef}
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
              <div className="relative">
                <Upload className={`w-16 h-16 ${uploading ? 'text-gray-400' : 'text-purple-500'}`} />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">
                  {uploading ? 'Загрузка документа...' : 'Загрузить медицинский документ'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Поддерживаются файлы: PDF, DOC, DOCX, CSV, TXT (до 10 МБ)
                </p>
                {userTier === 'plus' ? (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 flex items-center justify-center">
                      <Bot className="w-4 h-4 mr-2" />
                      Автоматический анализ с ИИ помощником Eva включен
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Обновитесь до Plus для автоматического анализа ИИ
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск документов..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Все категории</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 pt-1">
                      {getStatusIcon(doc.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {doc.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {doc.size}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(doc.uploadedAt)}
                        </span>
                      </div>
                      
                      {/* AI Analysis Results */}
                      {doc.aiAnalysis && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-6 h-6 text-purple-600" />
                              <h4 className="text-lg font-semibold text-purple-900">Анализ ИИ помощника Eva</h4>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(doc.aiAnalysis.riskLevel)}`}>
                              {doc.aiAnalysis.riskLevel === 'high' ? 'Высокий приоритет' : 
                               doc.aiAnalysis.riskLevel === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                            </span>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Резюме анализа:</h5>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {doc.aiAnalysis.summary}
                            </p>
                          </div>
                          
                          <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Ключевые моменты:
                              </h5>
                              <ul className="space-y-2">
                                {doc.aiAnalysis.insights.map((insight, idx) => (
                                  <li key={idx} className="flex items-start text-sm">
                                    <span className="text-purple-500 mr-2 mt-1">•</span>
                                    <span className="text-gray-700">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <Shield className="w-4 h-4 mr-2" />
                                Рекомендации:
                              </h5>
                              <ul className="space-y-2">
                                {doc.aiAnalysis.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start text-sm">
                                    <span className="text-blue-500 mr-2 mt-1">•</span>
                                    <span className="text-gray-700">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {doc.aiAnalysis.urgencyMarkers && doc.aiAnalysis.urgencyMarkers.length > 0 && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                              <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Требует внимания:
                              </h5>
                              <ul className="space-y-1">
                                {doc.aiAnalysis.urgencyMarkers.map((marker, idx) => (
                                  <li key={idx} className="text-sm text-red-700">
                                    • {marker}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-amber-800">
                                  Важное предупреждение
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                  {doc.aiAnalysis.disclaimer}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex justify-center">
                            <button 
                              onClick={handleBookAppointment}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Записаться к врачу</span>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Loading State for Analysis */}
                      {analyzingDoc === doc.id && (
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                          <div className="flex items-center justify-center space-x-3">
                            <Bot className="w-6 h-6 text-blue-600 animate-pulse" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-blue-700">
                                ИИ помощник Eva анализирует документ...
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Это может занять несколько минут
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleView(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Просмотреть"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Скачать"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {userTier === 'plus' && doc.status === 'uploaded' && (
                      <button 
                        onClick={() => analyzeDocumentById(doc.id)}
                        className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                        disabled={analyzingDoc === doc.id}
                        title="Анализировать с ИИ"
                      >
                        <Bot className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredDocuments.length === 0 && !uploading && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">
              {searchTerm || filterCategory !== 'all' ? 'Документы не найдены' : 'У вас пока нет загруженных документов'}
            </p>
            <p className="text-gray-400">
              {searchTerm || filterCategory !== 'all' ? 'Попробуйте изменить параметры поиска' : 'Загрузите свой первый документ для анализа'}
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Обновление до Plus</h3>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center mb-6">
              <Bot className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">
                Для автоматического анализа документов с ИИ помощником Eva необходим тариф Plus
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleUpgrade}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Обновить до Plus
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Пока нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPlatform;