import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  Eye, 
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  Scan
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface MedicalDocument {
  id: string;
  type: 'pdf' | 'image' | 'dicom';
  category: 'lab_result' | 'prescription' | 'imaging' | 'report' | 'other';
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  fileUrl?: string;
  extractedData?: any;
  tags: string[];
  uploadProgress?: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

interface DocumentUploadProps {
  onUpload: (documents: MedicalDocument[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.dcm'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = true
}) => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadErrors([]);
    setIsProcessing(true);

    const newDocuments: MedicalDocument[] = [];

    for (const file of acceptedFiles) {
      // Validate file size
      if (file.size > maxFileSize) {
        setUploadErrors(prev => [...prev, `Файл ${file.name} слишком большой (максимум ${maxFileSize / 1024 / 1024}MB)`]);
        continue;
      }

      // Create document object
      const document: MedicalDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: getFileType(file),
        category: 'other',
        title: file.name.split('.')[0],
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        tags: [],
        uploadProgress: 0,
        status: 'uploading'
      };

      newDocuments.push(document);
      
      // Simulate upload progress
      await simulateUpload(document);
      
      // Process document (OCR, analysis)
      await processDocument(document, file);
    }

    setDocuments(prev => [...prev, ...newDocuments]);
    setIsProcessing(false);
    onUpload(newDocuments);
  }, [maxFileSize, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/dicom': ['.dcm']
    },
    multiple,
    maxSize: maxFileSize
  });

  const getFileType = (file: File): 'pdf' | 'image' | 'dicom' => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/')) return 'image';
    if (file.name.endsWith('.dcm')) return 'dicom';
    return 'image';
  };

  const simulateUpload = async (document: MedicalDocument): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          document.uploadProgress = progress;
          document.status = 'processing';
          clearInterval(interval);
          resolve();
        } else {
          document.uploadProgress = progress;
          setDocuments(prev => [...prev.filter(d => d.id !== document.id), document]);
        }
      }, 200);
    });
  };

  const processDocument = async (document: MedicalDocument, file: File): Promise<void> => {
    try {
      // Simulate OCR and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data based on file type
      let extractedData: any = {};
      
      if (document.type === 'pdf') {
        extractedData = {
          text: "Анализ крови от 15.03.2024\nГемоглобин: 125 г/л\nЭритроциты: 4.2 млн/мкл\nЛейкоциты: 6.8 тыс/мкл",
          keywords: ["анализ крови", "гемоглобин", "эритроциты"],
          suggestedCategory: "lab_result",
          suggestedTags: ["анализ крови", "гематология"]
        };
      } else if (document.type === 'image') {
        extractedData = {
          text: "Рецепт №12345\nДата: 20.03.2024\nПрепарат: Витамин D3 1000 МЕ",
          keywords: ["рецепт", "витамин", "препарат"],
          suggestedCategory: "prescription", 
          suggestedTags: ["рецепт", "витамины"]
        };
      }

      document.extractedData = extractedData;
      document.status = 'completed';
      
      // Auto-fill category and tags from AI analysis
      if (extractedData?.suggestedCategory) {
        document.category = extractedData.suggestedCategory;
      }
      if (extractedData?.suggestedTags) {
        document.tags = extractedData.suggestedTags;
      }
      
      setDocuments(prev => prev.map(d => d.id === document.id ? document : d));
      
    } catch (error) {
      console.error('Document processing error:', error);
      document.status = 'error';
      setDocuments(prev => prev.map(d => d.id === document.id ? document : d));
    }
  };

  const updateDocument = (id: string, updates: Partial<MedicalDocument>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getStatusIcon = (status: MedicalDocument['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Scan className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'dicom':
        return <Camera className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      lab_result: 'Анализы',
      prescription: 'Рецепты',
      imaging: 'Снимки',
      report: 'Заключения',
      other: 'Другое'
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Загрузка медицинских документов
          </CardTitle>
          <CardDescription>
            Поддерживаются PDF, изображения (JPG, PNG) и DICOM файлы. Максимальный размер: {maxFileSize / 1024 / 1024}MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-muted/50",
              isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25",
              isProcessing && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Отпустите файлы для загрузки</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, JPG, PNG, DICOM • До {maxFileSize / 1024 / 1024}MB на файл
                </p>
              </div>
            )}
          </div>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadErrors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Загруженные документы ({documents.length})</CardTitle>
            <CardDescription>
              Управление и категоризация ваших медицинских документов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{doc.title}</h4>
                          {getStatusIcon(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {doc.fileName} • {(doc.fileSize / 1024 / 1024).toFixed(2)}MB
                        </p>
                        
                        {/* Upload Progress */}
                        {doc.status === 'uploading' && (
                          <Progress value={doc.uploadProgress} className="mt-2 h-2" />
                        )}
                        
                        {/* Processing Status */}
                        {doc.status === 'processing' && (
                          <div className="mt-2 text-sm text-yellow-600">
                            Обработка документа (OCR, анализ)...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeDocument(doc.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Document Metadata Form */}
                  {doc.status === 'completed' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${doc.id}`}>Название</Label>
                        <Input
                          id={`title-${doc.id}`}
                          value={doc.title}
                          onChange={(e) => updateDocument(doc.id, { title: e.target.value })}
                          placeholder="Название документа"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`category-${doc.id}`}>Категория</Label>
                        <Select
                          value={doc.category}
                          onValueChange={(value) => updateDocument(doc.id, { category: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lab_result">Анализы</SelectItem>
                            <SelectItem value="prescription">Рецепты</SelectItem>
                            <SelectItem value="imaging">Снимки</SelectItem>
                            <SelectItem value="report">Заключения</SelectItem>
                            <SelectItem value="other">Другое</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`description-${doc.id}`}>Описание</Label>
                        <Textarea
                          id={`description-${doc.id}`}
                          value={doc.description || ''}
                          onChange={(e) => updateDocument(doc.id, { description: e.target.value })}
                          placeholder="Дополнительная информация о документе"
                          rows={2}
                        />
                      </div>
                      
                      {/* Tags */}
                      <div className="md:col-span-2">
                        <Label>Теги</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                              <button
                                onClick={() => updateDocument(doc.id, { 
                                  tags: doc.tags.filter((_, i) => i !== index) 
                                })}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Extracted Data Preview */}
                      {doc.extractedData?.text && (
                        <div className="md:col-span-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Извлеченный текст:</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {doc.extractedData.text.substring(0, 200)}
                            {doc.extractedData.text.length > 200 && '...'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;