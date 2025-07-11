import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Eye, Lock, UserCheck } from 'lucide-react';
import { PrivacyPolicyContent, MedicalDataPolicyContent } from '@/legal/PrivacyPolicy';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bloom-gradient">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-foreground">
              {PrivacyPolicyContent.title}
            </h1>
          </div>
          <Badge variant="secondary" className="mb-4">
            Последнее обновление: {PrivacyPolicyContent.lastUpdated}
          </Badge>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ваша конфиденциальность — наш приоритет. Мы обрабатываем ваши медицинские данные 
            с максимальной ответственностью и в соответствии с международными стандартами.
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Максимальная защита</h3>
              <p className="text-sm text-muted-foreground">
                Шифрование AES-256 и современные меры безопасности
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <UserCheck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ваш контроль</h3>
              <p className="text-sm text-muted-foreground">
                Полный контроль над вашими данными и согласиями
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Eye className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Прозрачность</h3>
              <p className="text-sm text-muted-foreground">
                Честная информация о том, как используются ваши данные
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Privacy Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Основная политика конфиденциальности
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {PrivacyPolicyContent.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
                {index < PrivacyPolicyContent.sections.length - 1 && (
                  <hr className="border-muted" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Medical Data Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              {MedicalDataPolicyContent.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {MedicalDataPolicyContent.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
                {index < MedicalDataPolicyContent.sections.length - 1 && (
                  <hr className="border-muted" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">Есть вопросы о конфиденциальности?</h3>
              <p className="text-muted-foreground mb-4">
                Мы готовы ответить на любые вопросы о том, как мы обрабатываем ваши данные.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@eva-platform.ru</p>
                <p><strong>Телефон:</strong> +7 (495) 123-45-67</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};