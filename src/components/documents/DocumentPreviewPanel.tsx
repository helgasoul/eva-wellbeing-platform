import React, { useState } from 'react';
import { X, Download, Share2, ExternalLink, Calendar, FileText, Bot, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Document {
  id: string | number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: string;
  category: string;
  content?: string;
  thumbnail?: string;
  aiAnalysis?: {
    summary: string;
    insights: string[];
    recommendations: string[];
    riskLevel: string;
  };
}

interface DocumentPreviewPanelProps {
  document: Document;
  onClose: () => void;
  onDownload: (doc: Document) => void;
  onOpenFull: (doc: Document) => void;
}

export const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({
  document,
  onClose,
  onDownload,
  onOpenFull
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreviewContent = () => {
    const lowerType = document.type.toLowerCase();
    
    if (lowerType.includes('pdf')) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="mb-2">PDF предварительный просмотр недоступен</p>
          <p className="text-sm">Используйте "Открыть полностью" для просмотра</p>
        </div>
      );
    }
    
    if (lowerType.includes('doc') || lowerType.includes('docx')) {
      return (
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 leading-relaxed">
            {document.content || 'Содержимое Word документа недоступно для предварительного просмотра.'}
          </div>
        </div>
      );
    }
    
    if (lowerType.includes('txt') || lowerType.includes('csv')) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <pre className="whitespace-pre-wrap text-gray-700">
            {document.content || 'Текстовое содержимое недоступно для предварительного просмотра.'}
          </pre>
        </div>
      );
    }
    
    if (lowerType.includes('jpg') || lowerType.includes('png') || lowerType.includes('image')) {
      if (document.thumbnail && !imageError) {
        return (
          <div className="text-center">
            <img 
              src={document.thumbnail} 
              alt={document.name}
              className="max-w-full h-auto rounded-lg shadow-sm"
              onError={() => setImageError(true)}
            />
          </div>
        );
      } else {
        return (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <p>Изображение недоступно для предварительного просмотра</p>
          </div>
        );
      }
    }
    
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>Предварительный просмотр недоступен для данного типа файла</p>
      </div>
    );
  };

  const handleShare = () => {
    toast({
      title: "Поделиться",
      description: "Функция совместного доступа будет доступна в следующей версии",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Медицинские данные': 'bg-pink-100 text-pink-800',
      'Результаты анализов': 'bg-purple-100 text-purple-800',
      'Медицинская история': 'bg-blue-100 text-blue-800',
      'Загруженный документ': 'bg-green-100 text-green-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getRiskLevelColor = (level: string) => {
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

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-gray-900 truncate max-w-48">
                {document.name}
              </h2>
              <p className="text-sm text-gray-500">{document.size}</p>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Document metadata */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(document.category)}>
                    {document.category}
                  </Badge>
                  {document.status === 'analyzed' && (
                    <Badge className="bg-green-100 text-green-800">
                      Анализ завершен
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(document.uploadedAt)}
                </div>
              </div>

              <Separator />

              {/* Preview content */}
              <div className="min-h-64">
                {getPreviewContent()}
              </div>

              {/* AI Analysis for mobile */}
              {document.aiAnalysis && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-purple-600" />
                      <h3 className="font-medium text-purple-900">Анализ ИИ Eva</h3>
                      <Badge className={getRiskLevelColor(document.aiAnalysis.riskLevel)}>
                        {document.aiAnalysis.riskLevel === 'high' ? 'Высокий приоритет' : 
                         document.aiAnalysis.riskLevel === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700">{document.aiAnalysis.summary}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Ключевые моменты:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {document.aiAnalysis.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Рекомендации:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {document.aiAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Actions */}
        <div className="p-4 border-t bg-white flex space-x-2">
          <Button
            onClick={() => onOpenFull(document)}
            className="flex-1"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Открыть полностью
          </Button>
          <Button
            onClick={() => onDownload(document)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Скачать
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/5 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Desktop Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-gray-900 truncate mr-4">
          Предварительный просмотр
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Document metadata */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 text-lg leading-tight">
                {document.name}
              </h3>
              
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColor(document.category)}>
                  {document.category}
                </Badge>
                {document.status === 'analyzed' && (
                  <Badge className="bg-green-100 text-green-800">
                    Анализ завершен
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-gray-500">
                <div>Размер: {document.size}</div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(document.uploadedAt)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Preview content */}
            <div className="min-h-64">
              {getPreviewContent()}
            </div>

            {/* AI Analysis */}
            {document.aiAnalysis && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-purple-900">Анализ ИИ Eva</h3>
                    <Badge className={getRiskLevelColor(document.aiAnalysis.riskLevel)}>
                      {document.aiAnalysis.riskLevel === 'high' ? 'Высокий приоритет' : 
                       document.aiAnalysis.riskLevel === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700">{document.aiAnalysis.summary}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Ключевые моменты:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {document.aiAnalysis.insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Рекомендации:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {document.aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          onClick={() => onOpenFull(document)}
          className="w-full"
          variant="outline"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Открыть полностью
        </Button>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => onDownload(document)}
            className="flex-1"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Скачать
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </div>
    </div>
  );
};