import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertTriangle, Bot, CheckCircle, Clock, Calendar, Eye, Download, Trash2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { useEvaAI, DocumentUtils } from '@/services/evaAIService';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentPreviewPanel } from '@/components/documents/DocumentPreviewPanel';
import { useIsMobile } from '@/hooks/use-mobile';

const Documents = () => {
  const { toast } = useToast();
  const { analyzeDocument, analyzeCSV, isAnalyzing: aiAnalyzing, error: aiError } = useEvaAI();
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [userTier, setUserTier] = useState('plus'); // 'basic' или 'plus'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingDoc, setAnalyzingDoc] = useState(null);
  
  // Состояние для preview панели
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  // Анализ документа с помощью ИИ
  const analyzeDocumentById = async (docId: number | string) => {
    setAnalyzingDoc(docId);
    
    toast({
      title: "Анализ начат",
      description: "ИИ помощник Eva начал анализ вашего документа",
    });

    try {
      // Найти документ
      const doc = documents.find(d => d.id === docId);
      if (!doc) {
        throw new Error('Документ не найден');
      }

      // Для демонстрации используем mock контент
      // В реальном приложении здесь будет извлечение текста из файла
      const mockContent = `Медицинский документ: ${doc.name}
        Тип: ${doc.type}
        Категория: ${doc.category}
        Размер: ${doc.size}
        Дата: ${doc.uploadedAt}`;

      const documentType = DocumentUtils.getDocumentType({ name: doc.name } as File);
      const analysis = await analyzeDocument(mockContent, documentType);

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

  // Анализ документа с реальным содержимым файла
  const analyzeDocumentWithContent = async (docId: number | string, content: string, file: File) => {
    setAnalyzingDoc(docId);
    
    try {
      const documentType = DocumentUtils.getDocumentType(file);
      let analysis;

      // Проверяем, является ли файл CSV
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
        description: "ИИ помощник Eva успешно проанализировал содержимое вашего документа",
      });
    } catch (error) {
      console.error('Ошибка анализа содержимого:', error);
      setDocuments(prev => prev.map(document => 
        document.id === docId 
          ? { ...document, status: 'uploaded' }
          : document
      ));
      toast({
        title: "Ошибка анализа",
        description: "Произошла ошибка при анализе содержимого документа. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingDoc(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type || 'unknown',
        size: DocumentUtils.formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        status: userTier === 'plus' ? 'analyzing' : 'uploaded',
        category: 'Загруженный документ',
        fileContent: null // Будет заполнено при анализе
      };

      setDocuments(prev => [newDoc, ...prev]);

      toast({
        title: "Документ загружен",
        description: `${file.name} успешно загружен в ваши документы`,
      });

      // Автоматический анализ для Plus пользователей
      if (userTier === 'plus') {
        try {
          // Попытка извлечь текст из файла
          const fileContent = await DocumentUtils.readFileAsText(file);
          
          // Обновляем документ с содержимым
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, fileContent }
              : doc
          ));
          
          // Анализируем содержимое
          setTimeout(() => analyzeDocumentWithContent(newDoc.id, fileContent, file), 500);
        } catch (error) {
          console.error('Ошибка чтения файла:', error);
          // Если не удалось прочитать файл, анализируем мета-данные
          setTimeout(() => analyzeDocumentById(newDoc.id), 500);
        }
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

  const handlePreview = (doc) => {
    console.log('Opening preview for:', doc.name, { isMobile, previewOpen: true });
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    console.log('Closing preview');
    setSelectedDocument(null);
    setPreviewOpen(false);
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

        {/* Two-panel layout */}
        <div className="flex gap-6 min-h-96">
          {/* Documents List Panel */}
          <div className={`${previewOpen && selectedDocument && !isMobile ? 'w-3/5' : 'w-full'} transition-all duration-300`}>
            <DocumentList
              documents={documents}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onDelete={handleDelete}
              selectedDocId={selectedDocument?.id}
            />
          </div>

          {/* Preview Panel - Desktop */}
          {previewOpen && selectedDocument && !isMobile && (
            <div className="w-2/5 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <DocumentPreviewPanel
                document={selectedDocument}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                onOpenFull={handleView}
              />
            </div>
          )}
        </div>

        {/* Preview Panel - Mobile Modal */}
        {previewOpen && selectedDocument && isMobile && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              <DocumentPreviewPanel
                document={selectedDocument}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                onOpenFull={handleView}
              />
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default Documents;