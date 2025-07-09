import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_PLANS } from '@/data/subscriptionPlans';
import { Layout } from '@/components/layout/Layout';

const HowWeHelp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-muted/20">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Как мы помогаем на каждом этапе
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              Персонализированный подход к женскому здоровью в период менопаузы
            </p>
          </div>
        </section>

        {/* Detailed Plan Descriptions */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
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
                        onClick={() => navigate(`/pricing#${plan.id}`)}
                        className={`bg-gradient-to-r ${plan.color} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-elegant`}
                      >
                        Выбрать {plan.name}
                      </button>
                    </div>
                  </div>
                  
                  <div className={index % 2 === 0 ? 'order-2' : 'order-1'}>
                    <div className="bg-card rounded-2xl p-8 shadow-elegant">
                      <h3 className="text-xl font-semibold mb-6 text-foreground">
                        Что включено:
                      </h3>
                      <ul className="space-y-3">
                        {plan.features.slice(0, 8).map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-primary mr-2 mt-1">•</span>
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 8 && (
                          <li className="text-primary font-medium">
                            + еще {plan.features.length - 8} функций
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Готовы начать свой путь к здоровью?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Выберите план, который подходит именно вам
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-primary-foreground text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-foreground/90 transition-colors shadow-elegant"
            >
              Сравнить все планы
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HowWeHelp;