import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { SUBSCRIPTION_PLANS, ADDITIONAL_SERVICES } from '@/data/subscriptionPlans';
import { Layout } from '@/components/layout/Layout';

const HowWeHelp: React.FC = () => {
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
              Как мы помогаем на каждом этапе
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80 max-w-3xl mx-auto">
              Персонализированный подход к женскому здоровью в период менопаузы
            </p>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-lg font-medium">
                То, что стоит ₽50,000 в частных клиниках, доступно от ₽2,990 в год
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Plan Descriptions */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Выберите свой путь к здоровью
              </h2>
              <p className="text-xl text-muted-foreground">
                Инвестиция в ваше здоровье окупается здоровыми годами жизни
              </p>
            </div>

            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <div key={plan.id} className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
                    <div className="text-center lg:text-left">
                      <div className="text-6xl mb-4">{plan.icon}</div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        {plan.name} - {plan.description}
                      </h2>
                      <div className="text-2xl font-bold text-primary mb-6">
                        ₽{plan.price.toLocaleString()} в год
                        <span className="text-lg text-muted-foreground block">
                          ₽{plan.monthlyPrice}/месяц при оплате за год
                        </span>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <h3 className="text-xl font-semibold text-foreground">
                          Для кого этот план:
                        </h3>
                        <ul className="space-y-2">
                          {plan.target_audience.map((audience, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-success mr-2 mt-1">✓</span>
                              <span className="text-muted-foreground">{audience}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isLoading}
                        className={`bg-gradient-to-r ${plan.color} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-elegant ${
                          plan.popular ? 'ring-2 ring-accent ring-offset-2' : ''
                        }`}
                      >
                        {isLoading ? 'Загрузка...' : `Выбрать ${plan.name}`}
                      </button>
                      
                      {plan.popular && (
                        <div className="mt-4">
                          <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold">
                            САМЫЙ ПОПУЛЯРНЫЙ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={index % 2 === 0 ? 'order-2' : 'order-1'}>
                    <div
                      id={plan.id}
                      className={`rounded-2xl p-8 shadow-elegant transition-all duration-300 hover:shadow-soft ${
                        plan.popular 
                          ? 'bg-gradient-to-br from-warning via-warning/90 to-warning/80 text-warning-foreground transform scale-105' 
                          : 'bg-card border-2 border-border hover:border-primary'
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-6 text-center">
                        Что включено:
                      </h3>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <span className={`mr-2 mt-1 ${plan.popular ? 'text-warning-foreground' : 'text-primary'}`}>•</span>
                            <span className={`text-sm ${plan.popular ? 'text-warning-foreground/90' : 'text-muted-foreground'}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Готовы начать свой путь к здоровью?
            </h2>
            <p className="text-xl mb-8 text-accent-foreground/80">
              Выберите план выше и начните заботиться о себе уже сегодня
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-accent-foreground text-accent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent-foreground/90 transition-colors shadow-elegant"
            >
              Выбрать план
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HowWeHelp;