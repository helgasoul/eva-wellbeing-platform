import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { SUBSCRIPTION_PLANS, ADDITIONAL_SERVICES } from '@/data/subscriptionPlans';
import { Layout } from '@/components/layout/Layout';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { subscription, upgradeSubscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  // Скролл к нужному плану при переходе с главной страницы
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/register');
      return;
    }

    try {
      await upgradeSubscription(planId);
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Ошибка при выборе плана:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-muted/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Выберите свой путь к здоровью
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80 max-w-3xl mx-auto">
              Инвестиция в ваше здоровье окупается здоровыми годами жизни
            </p>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-lg font-medium">
                То, что стоит ₽50,000 в частных клиниках, доступно от ₽2,990 в год
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  id={plan.id}
                  className={`relative rounded-2xl p-8 shadow-elegant transition-all duration-300 hover:shadow-soft ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-warning via-warning/90 to-warning/80 text-warning-foreground transform scale-105' 
                      : 'bg-card border-2 border-border hover:border-primary'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold">
                        САМЫЙ ПОПУЛЯРНЫЙ
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-4">{plan.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className={`text-lg mb-4 ${plan.popular ? 'text-warning-foreground/80' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>
                    
                    <div className="text-4xl font-bold mb-2">
                      ₽{plan.price.toLocaleString()}
                    </div>
                    <div className={`text-sm mb-6 ${plan.popular ? 'text-warning-foreground/80' : 'text-muted-foreground'}`}>
                      ₽{plan.monthlyPrice}/месяц при оплате за год
                    </div>
                    
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isLoading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                        plan.popular
                          ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                          : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70'
                      }`}
                    >
                      {isLoading ? 'Загрузка...' : 'Выбрать план'}
                    </button>
                    
                    <div className="text-left">
                      <h4 className={`font-semibold mb-3 ${plan.popular ? 'text-warning-foreground' : 'text-foreground'}`}>
                        Для кого:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {plan.target_audience.map((audience, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-success mr-2 mt-1">✓</span>
                            <span>{audience}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Сравнение тарифов
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-lg shadow-clean">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Функция</th>
                    <th className="text-center p-4 font-semibold text-foreground">Essential</th>
                    <th className="text-center p-4 font-semibold text-foreground">Plus</th>
                    <th className="text-center p-4 font-semibold text-foreground">Optimum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">Цена в год</td>
                    <td className="text-center p-4 text-foreground">₽2,990</td>
                    <td className="text-center p-4 text-foreground">₽9,990</td>
                    <td className="text-center p-4 text-foreground">₽15,990</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Трекер симптомов</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Биомаркеры</td>
                    <td className="text-center p-4 text-muted-foreground">—</td>
                    <td className="text-center p-4 text-success">40+</td>
                    <td className="text-center p-4 text-success">100+</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Консультации врачей</td>
                    <td className="text-center p-4 text-muted-foreground">—</td>
                    <td className="text-center p-4 text-success">2/год</td>
                    <td className="text-center p-4 text-success">4/год</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Генетическое тестирование</td>
                    <td className="text-center p-4 text-muted-foreground">—</td>
                    <td className="text-center p-4 text-muted-foreground">—</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Личный координатор</td>
                    <td className="text-center p-4 text-muted-foreground">—</td>
                    <td className="text-center p-4 text-muted-foreground">—</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Additional Services */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Дополнительные услуги
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADDITIONAL_SERVICES.map((service) => (
                <div key={service.id} className="bg-card rounded-lg p-6 shadow-clean hover:shadow-soft transition-all">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <div className="text-2xl font-bold text-primary mb-4">
                    ₽{service.price.toLocaleString()}
                  </div>
                  <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Заказать
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">Гарантии качества</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Для всех тарифов</h3>
                <ul className="space-y-2 text-primary-foreground/80">
                  <li>✓ Возврат средств в течение 30 дней</li>
                  <li>✓ Соответствие GDPR и 152-ФЗ</li>
                  <li>✓ Страхование данных на ₽1 млн</li>
                  <li>✓ Сертификация ISO 27001</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Медицинские гарантии</h3>
                <ul className="space-y-2 text-primary-foreground/80">
                  <li>✓ Лицензированные врачи с опытом 10+ лет</li>
                  <li>✓ Аккредитованные лаборатории</li>
                  <li>✓ Контроль качества каждого анализа</li>
                  <li>✓ Повторное тестирование при необходимости</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Pricing;