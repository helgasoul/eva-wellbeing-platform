import React, { useState } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  Stethoscope,
  FlaskConical
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'lab_result' | 'medical_report' | 'prescription' | 'other';
  date: string;
  size: string;
  doctor?: string;
}

const Documents = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Общий анализ крови',
      type: 'lab_result',
      date: '2024-01-15',
      size: '245 KB',
      doctor: 'Д-р Петрова А.В.'
    },
    {
      id: '2',
      name: 'УЗИ органов малого таза',
      type: 'medical_report',
      date: '2024-01-10',
      size: '1.2 MB',
      doctor: 'Д-р Сидорова М.И.'
    },
    {
      id: '3',
      name: 'Рецепт на витамины',
      type: 'prescription',
      date: '2024-01-08',
      size: '156 KB',
      doctor: 'Д-р Иванова О.С.'
    }
  ]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'lab_result':
        return <FlaskConical className="w-5 h-5" />;
      case 'medical_report':
        return <Stethoscope className="w-5 h-5" />;
      case 'prescription':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'lab_result':
        return 'Анализ';
      case 'medical_report':
        return 'Заключение';
      case 'prescription':
        return 'Рецепт';
      default:
        return 'Документ';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'lab_result':
        return 'bg-blue-100 text-blue-800';
      case 'medical_report':
        return 'bg-green-100 text-green-800';
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Документ загружен",
        description: `${files[0].name} успешно добавлен в ваши документы.`,
      });
    }
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Скачивание начато",
      description: `${doc.name} загружается...`,
    });
  };

  const handleView = (doc: Document) => {
    toast({
      title: "Просмотр документа",
      description: `Открывается ${doc.name}...`,
    });
  };

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Документ удален",
      description: "Документ успешно удален из вашей библиотеки.",
    });
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Мои документы</h1>
            <p className="text-muted-foreground">
              Управляйте своими медицинскими документами
            </p>
          </div>
          
          <div className="relative">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Загрузить документ
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Анализы</p>
                  <p className="text-lg font-semibold">
                    {documents.filter(d => d.type === 'lab_result').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Заключения</p>
                  <p className="text-lg font-semibold">
                    {documents.filter(d => d.type === 'medical_report').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Рецепты</p>
                  <p className="text-lg font-semibold">
                    {documents.filter(d => d.type === 'prescription').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Всего</p>
                  <p className="text-lg font-semibold">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Документы</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  У вас пока нет загруженных документов
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getDocumentIcon(doc.type)}
                      </div>
                      
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(doc.date).toLocaleDateString('ru-RU')}</span>
                          {doc.doctor && (
                            <>
                              <span>•</span>
                              <User className="w-4 h-4" />
                              <span>{doc.doctor}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={getDocumentTypeColor(doc.type)}
                      >
                        {getDocumentTypeName(doc.type)}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default Documents;