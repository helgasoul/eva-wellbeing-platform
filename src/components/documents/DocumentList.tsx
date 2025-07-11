import React from 'react';
import { Eye, Download, Trash2, FileText, Image, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  aiAnalysis?: any;
}

interface DocumentListProps {
  documents: Document[];
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (docId: string | number) => void;
  selectedDocId?: string | number;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onPreview,
  onDownload,
  onDelete,
  selectedDocId
}) => {
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (lowerType.includes('doc') || lowerType.includes('docx')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }
    if (lowerType.includes('jpg') || lowerType.includes('png') || lowerType.includes('image')) {
      return <Image className="w-6 h-6 text-green-500" />;
    }
    if (lowerType.includes('txt') || lowerType.includes('csv')) {
      return <FileText className="w-6 h-6 text-gray-500" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (documents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">У вас пока нет загруженных документов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 pr-4">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className={`bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
            selectedDocId === doc.id ? 'ring-2 ring-primary/20 shadow-md' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-1">
                {getFileIcon(doc.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900 truncate text-sm">
                    {doc.name}
                  </h3>
                  <Badge className={`text-xs ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{doc.size}</span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(doc.uploadedAt)}
                  </span>
                  {doc.status === 'analyzed' && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Анализ завершен
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(doc)}
                className="p-2 h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/10"
                title="Предварительный просмотр"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(doc)}
                className="p-2 h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                title="Скачать"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(doc.id)}
                className="p-2 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};