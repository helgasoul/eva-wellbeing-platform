import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageCircle, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Сообщение отправлено",
      description: "Мы свяжемся с вами в ближайшее время!",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-muted/20">
        <div className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full shadow-elegant animate-gentle-float">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
              Свяжитесь с <span className="text-primary bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">командой</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              У вас есть вопросы, предложения или нужна помощь? Мы всегда готовы выслушать и помочь.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Напишите нам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Ваше имя"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Тема</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="О чем вы хотите рассказать?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Сообщение</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Расскажите подробнее..."
                      rows={5}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Напишите нам на электронную почту, и мы ответим в течение 24 часов.
                  </p>
                  <p className="font-semibold mt-2">support@bloom-health.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Горячая линия
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Звонки принимаются с 9:00 до 18:00 по московскому времени.
                  </p>
                  <p className="font-semibold mt-2">+7 (800) 555-0123</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Офис
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Приходите к нам в гости или отправляйте документы по почте.
                  </p>
                  <p className="font-semibold mt-2">
                    г. Москва, ул. Примерная, д. 123, офис 456
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-muted/10 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">Часто задаваемые вопросы</h3>
                  <p className="text-muted-foreground mb-4">
                    Возможно, ответ на ваш вопрос уже есть в нашей базе знаний.
                  </p>
                  <Button variant="outline" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:from-primary/20 hover:to-accent/20">
                    Перейти к FAQ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;