import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useSubscriptionInterest } from '@/hooks/useSubscriptionInterest';
import { SUBSCRIPTION_PLANS, ADDITIONAL_SERVICES } from '@/data/subscriptionPlans';
import { Layout } from '@/components/layout/Layout';
import { Heart } from 'lucide-react';
import caringSupport from '@/assets/caring-support-hero.jpg';

const HowWeHelp: React.FC = () => {
  const { user } = useAuth();
  const { subscription, upgradeSubscription, isLoading } = useSubscription();
  const { expressInterest, getInterestCount, isLoading: isInterestLoading } = useSubscriptionInterest();
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});
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

  // Загрузка количества заинтересованных пользователей
  useEffect(() => {
    const loadInterestCounts = async () => {
      const counts: Record<string, number> = {};
      for (const plan of SUBSCRIPTION_PLANS) {
        if (plan.isComingSoon) {
          counts[plan.id] = await getInterestCount(plan.id);
        }
      }
      setInterestCounts(counts);
    };
    
    loadInterestCounts();
  }, [getInterestCount]);

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

  const handleExpressInterest = async (planId: string) => {
    if (!user) {
      navigate('/register');
      return;
    }

    const success = await expressInterest(planId);
    if (success) {
      // Обновить счетчик интереса
      const newCount = await getInterestCount(planId);
      setInterestCounts(prev => ({
        ...prev,
        [planId]: newCount
      }));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-muted/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-accent/10 to-muted/20 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                  Мы рядом на каждом этапе вашего <span className="text-primary bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">пути</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-muted-foreground leading-relaxed">
                  Забота, поддержка и знания — для вашего спокойствия и уверенности в любой момент менопаузы.
                </p>
                <p className="text-lg mb-8 text-muted-foreground leading-relaxed">
                  Мы знаем, что у каждой женщины свой опыт. Здесь вы получите персональную поддержку, основанную на уважении к вашим чувствам, потребностям и истории.
                </p>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-primary/20 shadow-elegant">
                  <p className="text-lg font-medium text-foreground">
                    Всё, что обычно стоит десятки тысяч в частных клиниках, теперь становится ближе — от 2 990 ₽ в год
                  </p>
                </div>
                <button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-elegant hover:shadow-soft transform hover:-translate-y-1 group">
                  <Heart className="mr-3 h-5 w-5 group-hover:animate-pulse transition-all duration-300" />
                  Начать путь с без|паузы
                </button>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative">
                  <img 
                    src={caringSupport} 
                    alt="Поддержка на каждом этапе" 
                    className="w-full max-w-lg rounded-3xl shadow-elegant"
                  />
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl -z-10 blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Plan Descriptions */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-8 animate-fade-in">
                <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full shadow-elegant animate-gentle-float">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Начните заботу о себе с <span className="text-primary bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">без | паузы</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Маленькие шаги сегодня — уверенность и спокойствие завтра.<br />
                Доверяйте себе. Мы рядом на каждом этапе.
              </p>
            </div>

            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <div key={plan.id} className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-1">
                    <div className="text-center lg:text-left">
                      <div className="text-6xl mb-4">
                        {plan.id === 'essential' ? '🌱' : 
                         plan.id === 'plus' ? '🌺' : 
                         plan.id === 'optimum' ? '✨' : 
                         plan.id === 'digital_twin' ? '🤖' : '✨'}
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        {plan.id === 'essential' ? '🌱 Essential — первый шаг к гармонии' : 
                         plan.id === 'plus' ? '🌺 Plus — Персональный путь к вашему балансу' :
                         plan.id === 'optimum' ? '✨ Optimum — Ваше долголетие и забота на высшем уровне' :
                         plan.id === 'digital_twin' ? `🤖 ${plan.name} — ${plan.subtitle}` :
                         '✨ Optimum — Ваше долголетие и забота на высшем уровне'}
                      </h2>

                      {plan.isComingSoon && (
                        <div className="mb-6">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                            В разработке
                          </span>
                        </div>
                      )}

                      {plan.shortDescription && (
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                          {plan.shortDescription}
                        </p>
                      )}
                      
                      {plan.id === 'plus' && (
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                          Для тех, кто хочет не просто отслеживать изменения, но и понимать своё тело глубже, принимать заботу и поддержку экспертов, идти вперёд с уверенностью.
                        </p>
                      )}
                      
                      {plan.id === 'optimum' && (
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                          Инвестиция в здоровье — это вклад в новые счастливые годы жизни
                        </p>
                      )}
                      
                      <div className="text-2xl font-bold text-primary mb-6">
                        ₽{plan.price.toLocaleString()} в год
                        <span className="text-lg text-muted-foreground block">
                          или всего ₽{plan.monthlyPrice}/месяц при оплате за год
                        </span>
                      </div>
                      
                      {plan.id === 'essential' && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                          <p className="text-lg font-medium text-foreground italic">
                            "Менопауза — новый этап, а не приговор. Вы не одна. Всё, что нужно — уже здесь."
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-4 mb-8">
                        <h3 className="text-xl font-semibold text-foreground">
                          {plan.id === 'essential' ? 'Этот план для вас, если вы:' : 'Этот план для вас, если вы:'}
                        </h3>
                        <ul className="space-y-2">
                          {plan.id === 'essential' ? (
                            <>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">💜</span>
                                <span className="text-muted-foreground">Заметили первые перемены в самочувствии и хотите разобраться без тревоги</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">💜</span>
                                <span className="text-muted-foreground">Хотите отслеживать сигналы своего тела и понимать себя лучше</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">💜</span>
                                <span className="text-muted-foreground">Ищете поддержку и честную информацию, а не пугающие диагнозы</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">💜</span>
                                <span className="text-muted-foreground">Цените заботу, уважение и деликатность в отношении женского здоровья</span>
                              </li>
                            </>
                          ) : plan.id === 'plus' ? (
                            <>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">🌸</span>
                                <span className="text-muted-foreground">Чувствуете, что перемены стали более заметными и хотите пройти этот этап с поддержкой</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">🌸</span>
                                <span className="text-muted-foreground">Хотите получить точные ответы от специалистов и персональные рекомендации</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">🌸</span>
                                <span className="text-muted-foreground">Цените науку, честность и бережное отношение к себе</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-success mr-2 mt-1">🌸</span>
                                <span className="text-muted-foreground">Готовы вкладываться в здоровье, чтобы сохранить гармонию и радость жизни</span>
                              </li>
                            </>
                           ) : plan.id === 'optimum' ? (
                             <>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🤍</span>
                                 <span className="text-muted-foreground">Заботиться о себе и близких с максимальным вниманием</span>
                               </li>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🤍</span>
                                 <span className="text-muted-foreground">Получать экспертную поддержку и профилактику</span>
                               </li>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🤍</span>
                                 <span className="text-muted-foreground">Управлять семейными рисками и быть спокойной за будущее</span>
                               </li>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🤍</span>
                                 <span className="text-muted-foreground">Быть на связи с лучшими врачами и доступом к самым современным решениям</span>
                               </li>
                             </>
                           ) : plan.id === 'digital_twin' ? (
                             <>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🚀</span>
                                 <span className="text-muted-foreground">Визионер здоровья с высоким доходом (₽500k+ в месяц)</span>
                               </li>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🚀</span>
                                 <span className="text-muted-foreground">Tech-предприниматель или топ-менеджер</span>
                               </li>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🚀</span>
                                 <span className="text-muted-foreground">Биохакер и энтузиаст longevity</span>
                               </li>
                               <li className="flex items-start">
                                 <span className="text-success mr-2 mt-1">🚀</span>
                                 <span className="text-muted-foreground">Готовы инвестировать в технологии будущего</span>
                               </li>
                             </>
                           ) : null}
                        </ul>
                        
                        {(plan.id === 'plus' || plan.id === 'optimum' || plan.id === 'digital_twin') && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                            <p className="text-sm text-muted-foreground italic text-center">
                              {plan.id === 'plus' ? 
                                'Каждая женщина заслуживает поддержки на своём уникальном пути. Мы рядом, когда это важно.' :
                                plan.id === 'optimum' ? 'С заботой о вашем здоровье — команда без | паузы' :
                                plan.id === 'digital_twin' ? 'Революционные технологии для вашего персонального долголетия' :
                                'С заботой о вашем здоровье — команда без | паузы'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => plan.isComingSoon ? handleExpressInterest(plan.id) : handleSelectPlan(plan.id)}
                        disabled={isLoading || (plan.isComingSoon && isInterestLoading)}
                        className={`bg-gradient-to-r ${plan.color} px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-soft hover:-translate-y-1 ${
                          plan.popular ? 'ring-2 ring-accent ring-offset-2' : ''
                        }`}
                        style={{
                          color: plan.id === 'essential' ? 'hsl(var(--mint-foreground))' :
                                 plan.id === 'plus' ? 'hsl(var(--orange-foreground))' :
                                 plan.id === 'optimum' ? 'hsl(var(--purple-foreground))' :
                                 'hsl(var(--mint-foreground))'
                        }}
                      >
                        {isLoading || (plan.isComingSoon && isInterestLoading) ? 'Загрузка...' : (
                          plan.isComingSoon ? 'Жду!' :
                          plan.id === 'essential' ? 'Попробовать бесплатно' :
                          plan.id === 'plus' ? 'Выбрать Plus' :
                          plan.id === 'optimum' ? 'Получить максимальную поддержку' :
                          'Выбрать план'
                        )}
                      </button>

                      {plan.isComingSoon && interestCounts[plan.id] !== undefined && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground text-center">
                            {interestCounts[plan.id]} {interestCounts[plan.id] === 1 ? 'пользователь ждет' : 
                             interestCounts[plan.id] < 5 ? 'пользователя ждут' : 'пользователей ждут'} этот тариф
                          </p>
                        </div>
                      )}
                      
                      {plan.popular && (
                        <div className="mt-4">
                          <span className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-1">
                            🌸 Самый популярный выбор среди женщин без|паузы
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="order-2">
                    <div
                      id={plan.id}
                      className={`rounded-2xl p-8 shadow-elegant transition-all duration-300 hover:shadow-soft ${
                        plan.popular 
                          ? 'bg-gradient-to-br from-warning via-warning/90 to-warning/80 text-warning-foreground transform scale-105' 
                          : 'bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-2 border-accent/20 hover:border-primary/30'
                      }`}
                    >
                      {plan.id === 'essential' ? (
                        <>
                          <div className="text-center mb-6">
                            <div className="text-4xl mb-3">💜</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              Ваша поддержка и забота — в каждом элементе
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Всё, что нужно для спокойствия, баланса и уверенности каждый день.
                            </p>
                          </div>
                          <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🌿</span>
                              <div>
                                <div className="font-medium text-foreground">Трекер самочувствия и симптомов</div>
                                <div className="text-sm text-muted-foreground">Помогает замечать перемены и поддерживать себя, когда это важно</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🌙</span>
                              <div>
                                <div className="font-medium text-foreground">Трекер менструального цикла</div>
                                <div className="text-sm text-muted-foreground">Для лучшего понимания своего ритма и комфорта</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">💬</span>
                              <div>
                                <div className="font-medium text-foreground">24/7 ИИ-ассистент по менопаузе</div>
                                <div className="text-sm text-muted-foreground">Ответы и поддержка тогда, когда вы захотите</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🍽️</span>
                              <div>
                                <div className="font-medium text-foreground">Дневник питания с персональными рекомендациями</div>
                                <div className="text-sm text-muted-foreground">Забота о себе через питание, без строгих ограничений</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">📅</span>
                              <div>
                                <div className="font-medium text-foreground">Календарь здоровья с напоминаниями</div>
                                <div className="text-sm text-muted-foreground">Нежные напоминания о заботе о себе</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">📚</span>
                              <div>
                                <div className="font-medium text-foreground">Библиотека статей и ответов на вопросы</div>
                                <div className="text-sm text-muted-foreground">Только достоверная и понятная информация</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧘</span>
                              <div>
                                <div className="font-medium text-foreground">Простые упражнения и медитации</div>
                                <div className="text-sm text-muted-foreground">Для восстановления сил и внутренней гармонии</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">👥</span>
                              <div>
                                <div className="font-medium text-foreground">Сообщество поддержки</div>
                                <div className="text-sm text-muted-foreground">Место, где вас услышат и поймут</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">👩‍⚕️</span>
                              <div>
                                <div className="font-medium text-foreground">Блог врачей</div>
                                <div className="text-sm text-muted-foreground">Советы и забота от профессионалов, понятным языком</div>
                              </div>
                            </li>
                          </ul>
                          <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                            <p className="text-sm text-center text-muted-foreground italic">
                              Этот набор — ваш "набор поддержки", собранный с любовью и вниманием к деталям.
                            </p>
                          </div>
                        </>
                      ) : plan.id === 'plus' ? (
                        <>
                          <div className="text-center mb-6">
                            <div className="text-4xl mb-3">🌷</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              Что входит в план Plus
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Всё для комплексной поддержки вашего здоровья, понимания себя и заботы о каждом дне.
                            </p>
                          </div>
                          <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧩</span>
                              <div>
                                <div className="font-medium text-foreground">Всё из базового пакета — без ограничений</div>
                                <div className="text-sm text-muted-foreground">Полный доступ ко всем функциям Essential</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧬</span>
                              <div>
                                <div className="font-medium text-foreground">Расширенные лабораторные анализы</div>
                                <div className="text-sm text-muted-foreground">Понимаем ваши гормоны, метаболизм, витамины, здоровье костей и щитовидной железы</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">📒</span>
                              <div>
                                <div className="font-medium text-foreground">Трекеры и напоминания</div>
                                <div className="text-sm text-muted-foreground">Цикл, симптомы, питание и движение всегда под контролем</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🥗</span>
                              <div>
                                <div className="font-medium text-foreground">Индивидуальный план питания и рекомендации</div>
                                <div className="text-sm text-muted-foreground">С учётом ваших анализов и потребностей</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">👩‍⚕️</span>
                              <div>
                                <div className="font-medium text-foreground">Личные советы от врачей и нутрициологов</div>
                                <div className="text-sm text-muted-foreground">2 консультации в год с профильными специалистами</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">💬</span>
                              <div>
                                <div className="font-medium text-foreground">Доступ к поддержке 24/7 и приоритетные ответы</div>
                                <div className="text-sm text-muted-foreground">Приоритетная поддержка, когда она нужна</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🏃‍♀️</span>
                              <div>
                                <div className="font-medium text-foreground">Персональные рекомендации по физической активности</div>
                                <div className="text-sm text-muted-foreground">Поддержим тело и эмоции на каждом этапе</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">📲</span>
                              <div>
                                <div className="font-medium text-foreground">Интеграция с носимыми устройствами</div>
                                <div className="text-sm text-muted-foreground">Apple Health, Garmin, Oura и другие</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">📝</span>
                              <div>
                                <div className="font-medium text-foreground">Разбор анализов с врачом</div>
                                <div className="text-sm text-muted-foreground">Поддержка на каждом шаге</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧑‍🤝‍🧑</span>
                              <div>
                                <div className="font-medium text-foreground">Клуб поддержки, медитации и блог врачей</div>
                                <div className="text-sm text-muted-foreground">Сообщество и экспертные материалы</div>
                              </div>
                            </li>
                          </ul>
                          <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                            <p className="text-sm text-center text-muted-foreground italic">
                              Всё, чтобы вы чувствовали себя уверенно и спокойно — каждый день.
                            </p>
                          </div>
                        </>
                       ) : plan.id === 'optimum' ? (
                        <>
                          <div className="text-center mb-6">
                            <div className="text-4xl mb-3">⭐</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              Что входит в план Optimum
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Максимальная забота о вашем здоровье и долголетии с экспертной поддержкой.
                            </p>
                          </div>
                          <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧩</span>
                              <div>
                                <div className="font-medium text-foreground">Всё из базового и Plus пакетов</div>
                                <div className="text-sm text-muted-foreground">Полный доступ ко всем функциям Essential и Plus</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧬</span>
                              <div>
                                <div className="font-medium text-foreground">Комплексное тестирование 100+ биомаркеров</div>
                                <div className="text-sm text-muted-foreground">Глубокий анализ здоровья, включая токсичные металлы и омега-индекс</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧬</span>
                              <div>
                                <div className="font-medium text-foreground">Экзомное секвенирование</div>
                                <div className="text-sm text-muted-foreground">Генетические тесты BRCA1/2, APOE, MTHFR для персональной медицины</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">👩‍⚕️</span>
                              <div>
                                <div className="font-medium text-foreground">4 консультации в год с мультидисциплинарной командой</div>
                                <div className="text-sm text-muted-foreground">Гинеколог-эндокринолог, кардиолог, эндокринолог, нутрициолог</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🤝</span>
                              <div>
                                <div className="font-medium text-foreground">Личный координатор здоровья</div>
                                <div className="text-sm text-muted-foreground">Персональное сопровождение на всём пути к здоровью</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🔬</span>
                              <div>
                                <div className="font-medium text-foreground">Программа longevity и биохакинг</div>
                                <div className="text-sm text-muted-foreground">Мониторинг биологического возраста и оптимизация здоровья</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">💊</span>
                              <div>
                                <div className="font-medium text-foreground">Фармакогенетика</div>
                                <div className="text-sm text-muted-foreground">Индивидуальная реакция на ЗГТ и персональные дозировки</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🧪</span>
                              <div>
                                <div className="font-medium text-foreground">Микробиом кишечника и пищевые аллергены</div>
                                <div className="text-sm text-muted-foreground">Анализ разнообразия микробиома и пищевых непереносимостей</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">🔬</span>
                              <div>
                                <div className="font-medium text-foreground">Доступ к новейшим исследованиям</div>
                                <div className="text-sm text-muted-foreground">Участие в клинических испытаниях и передовых методах</div>
                              </div>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="text-xl mt-1">⚡</span>
                              <div>
                                <div className="font-medium text-foreground">Приоритетная запись к врачам</div>
                                <div className="text-sm text-muted-foreground">Быстрый доступ к лучшим специалистам</div>
                              </div>
                            </li>
                          </ul>
                          <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                            <p className="text-sm text-center text-muted-foreground italic">
                              Максимальная забота о здоровье и долголетии — для тех, кто выбирает лучшее.
                            </p>
                          </div>
                        </>
                       ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-gradient-to-br from-soft-pink/15 via-soft-purple/10 to-background relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-soft-pink/5 via-transparent to-soft-purple/5"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Сравнение тарифов
              </h2>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Ваша забота — ваш выбор
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Платформа без | паузы предлагает несколько тарифов — выберите подходящий для вашего этапа жизни.
                Вот, что входит в каждый тариф:
              </p>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-elegant border border-soft-pink/30 p-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-soft-pink/50">
                      <th className="text-left p-6 font-semibold text-foreground text-lg"></th>
                      <th className="text-center p-6">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🌸</div>
                          <div className="font-semibold text-lg text-foreground">Essential</div>
                          <div className="text-sm text-muted-foreground">Базовый уход</div>
                        </div>
                      </th>
                      <th className="text-center p-6">
                        <div className="text-center relative">
                          <div className="text-4xl mb-2">💜</div>
                          <div className="font-semibold text-lg text-foreground">Plus</div>
                          <div className="text-sm text-muted-foreground">Персональная забота</div>
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                            Популярный
                          </div>
                        </div>
                      </th>
                      <th className="text-center p-6">
                        <div className="text-center">
                          <div className="text-4xl mb-2">⭐</div>
                          <div className="font-semibold text-lg text-foreground">Optimum</div>
                          <div className="text-sm text-muted-foreground">Максимальная экспертиза</div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-soft-pink/30">
                      <td className="p-6 font-medium text-foreground text-lg">Стоимость за год</td>
                      <td className="text-center p-6">
                        <div className="text-2xl font-bold text-primary">₽2,990</div>
                      </td>
                      <td className="text-center p-6">
                        <div className="text-2xl font-bold text-primary">₽9,990</div>
                      </td>
                      <td className="text-center p-6">
                        <div className="text-2xl font-bold text-primary">₽15,990</div>
                      </td>
                    </tr>
                    <tr className="border-b border-pink-100/50">
                      <td className="p-6 text-foreground text-lg">Трекер симптомов</td>
                      <td className="text-center p-6">
                        <div className="text-3xl">🌷</div>
                      </td>
                      <td className="text-center p-6">
                        <div className="text-3xl">🌷</div>
                      </td>
                      <td className="text-center p-6">
                        <div className="text-3xl">🌷</div>
                      </td>
                    </tr>
                    <tr className="border-b border-pink-100/50">
                      <td className="p-6 text-foreground text-lg">Биомаркеры</td>
                      <td className="text-center p-6 text-muted-foreground text-lg">—</td>
                      <td className="text-center p-6">
                        <div className="text-lg font-semibold text-success">40+</div>
                      </td>
                      <td className="text-center p-6">
                        <div className="text-lg font-semibold text-success">100+</div>
                      </td>
                    </tr>
                    <tr className="border-b border-pink-100/50">
                      <td className="p-6 text-foreground text-lg">Консультации врача</td>
                      <td className="text-center p-6 text-muted-foreground text-lg">—</td>
                      <td className="text-center p-6">
                        <div className="text-lg font-semibold text-success">2/год</div>
                      </td>
                      <td className="text-center p-6">
                        <div className="text-lg font-semibold text-success">4/год</div>
                      </td>
                    </tr>
                    <tr className="border-b border-pink-100/50">
                      <td className="p-6 text-foreground text-lg">Генетическое тестирование</td>
                      <td className="text-center p-6 text-muted-foreground text-lg">—</td>
                      <td className="text-center p-6 text-muted-foreground text-lg">—</td>
                      <td className="text-center p-6">
                        <div className="text-3xl">🧬</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-6 text-foreground text-lg">Личный координатор</td>
                      <td className="text-center p-6 text-muted-foreground text-lg">—</td>
                      <td className="text-center p-6 text-muted-foreground text-lg">—</td>
                      <td className="text-center p-6">
                        <div className="text-3xl">👩‍⚕️</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-6">
              {SUBSCRIPTION_PLANS.map((plan, index) => (
                <div key={plan.id} className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-elegant border border-soft-pink/30 p-6 relative">
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-1 rounded-full text-sm font-bold">
                      Популярный
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">
                      {plan.id === 'essential' ? '🌸' : plan.id === 'plus' ? '💜' : '⭐'}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground">
                      {plan.id === 'essential' ? 'Базовый уход' : plan.id === 'plus' ? 'Персональная забота' : 'Максимальная экспертиза'}
                    </p>
                    <div className="text-3xl font-bold text-primary mt-4">
                      ₽{plan.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Трекер симптомов</span>
                      <div className="text-2xl">🌷</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Биомаркеры</span>
                      <span className="text-muted-foreground">
                        {plan.id === 'essential' ? '—' : plan.id === 'plus' ? '40+' : '100+'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Консультации врача</span>
                      <span className="text-muted-foreground">
                        {plan.id === 'essential' ? '—' : plan.id === 'plus' ? '2/год' : '4/год'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Генетическое тестирование</span>
                      {plan.id === 'optimum' ? <div className="text-2xl">🧬</div> : <span className="text-muted-foreground">—</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Личный координатор</span>
                      {plan.id === 'optimum' ? <div className="text-2xl">👩‍⚕️</div> : <span className="text-muted-foreground">—</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* How to Choose Section */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-8 text-foreground">Как выбрать?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-clean">
                  <div className="text-3xl mb-4">🌸</div>
                  <h4 className="font-semibold text-lg mb-2 text-foreground">Essential</h4>
                  <p className="text-muted-foreground">Забота о себе на старте, базовый мониторинг и поддержка</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-clean">
                  <div className="text-3xl mb-4">💜</div>
                  <h4 className="font-semibold text-lg mb-2 text-foreground">Plus</h4>
                  <p className="text-muted-foreground">Для тех, кто хочет персонализированные рекомендации и регулярный контроль</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-clean">
                  <div className="text-3xl mb-4">⭐</div>
                  <h4 className="font-semibold text-lg mb-2 text-foreground">Optimum</h4>
                  <p className="text-muted-foreground">Для женщин, которым важно всё: генетика, максимальная медицинская поддержка, личный координатор</p>
                </div>
              </div>
            </div>

            {/* Microcopy */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-soft-pink/20 to-soft-purple/20 rounded-2xl p-6 border border-soft-pink/30">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="text-xl mr-2">✨</span>
                  Каждый тариф включает бесплатную onboarding-консультацию и доступ к женскому сообществу поддержки.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Services */}
        <section className="py-20 bg-gradient-to-br from-soft-pink/10 via-soft-purple/8 to-background relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-soft-pink/3 via-transparent to-soft-purple/3"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Дополнительные услуги
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Персональная забота именно тогда, когда она вам нужна
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ADDITIONAL_SERVICES.map((service) => {
                const getServiceIcon = (id: string) => {
                  switch(id) {
                    case 'consultation': return '👩‍⚕️';
                    case 'biomarkers': return '🧪';
                    case 'genetic_test': return '🧬';
                    case 'dexa_scan': return '🦴';
                    case 'nutrition_plan': return '🍏';
                    case 'mammography': return '🔬';
                    case 'endoscopy': return '🏥';
                    case 'gynecologist_ultrasound': return '👩‍⚕️';
                    case 'online_consilium': return '💬';
                    case 'mri_breast': return '🩺';
                    case 'mri_pelvis': return '🩺';
                    case 'microbiome_atlas': return '🧬';
                    default: return '🏥';
                  }
                };

                const getServiceButtonText = (id: string) => {
                  // Services that should have "Заказать" button
                  const orderServices = ['genetic_test', 'biomarkers', 'microbiome_atlas'];
                  return orderServices.includes(id) ? 'Заказать' : 'Записаться';
                };

                const getServiceGradient = (id: string) => {
                  switch(id) {
                    case 'consultation': return 'from-purple to-soft-pink';
                    case 'biomarkers': return 'from-soft-blue to-purple';
                    case 'genetic_test': return 'from-purple-600 to-pink-600';
                    case 'dexa_scan': return 'from-mint to-soft-blue';
                    case 'nutrition_plan': return 'from-green-400 to-emerald-500';
                    case 'mammography': return 'from-pink-500 to-rose-500';
                    case 'endoscopy': return 'from-orange-400 to-red-400';
                    case 'gynecologist_ultrasound': return 'from-purple-500 to-indigo-500';
                    case 'online_consilium': return 'from-soft-blue to-purple';
                    case 'mri_breast': return 'from-soft-blue to-purple';
                    case 'mri_pelvis': return 'from-teal-500 to-cyan-500';
                    case 'microbiome_atlas': return 'from-emerald-500 to-teal-500';
                    default: return 'from-purple to-soft-pink';
                  }
                };

                const getServiceDescription = (id: string) => {
                  switch(id) {
                    case 'consultation': return 'Профессиональная консультация специалиста для решения ваших вопросов';
                    case 'biomarkers': return 'Расширенная панель биомаркеров для комплексного анализа здоровья';
                    case 'genetic_test': return 'Экзомное секвенирование для понимания генетических особенностей и рисков';
                    case 'dexa_scan': return 'Точная диагностика плотности костной ткани для женского здоровья';
                    case 'nutrition_plan': return 'Индивидуальный план питания от нутрициолога с учетом ваших потребностей';
                    case 'mammography': return 'Рентгеновское исследование молочных желез с комфортом и заботой';
                    case 'endoscopy': return 'Комплексное эндоскопическое обследование под наркозом для вашего комфорта';
                    case 'gynecologist_ultrasound': return 'Комплексный осмотр с ультразвуковой диагностикой от специалиста';
                    case 'online_consilium': return 'Мультидисциплинарная консультация ведущих специалистов онлайн';
                    case 'mri_breast': return 'Магнитно-резонансная томография с контрастом для точной диагностики';
                    case 'mri_pelvis': return 'Магнитно-резонансная томография органов малого таза';
                    case 'microbiome_atlas': return 'Комплексное исследование микробиома кишечника от ведущей компании';
                    default: return service.description;
                  }
                };

                const isPopular = service.id === 'genetic_test';

                return (
                  <div key={service.id} className="group bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-elegant border border-soft-pink/30 hover:shadow-soft hover:scale-105 transition-all duration-300 hover:-translate-y-2 relative">
                    {isPopular && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Популярное
                      </div>
                    )}
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {getServiceIcon(service.id)}
                    </div>
                    <h3 className="font-semibold text-xl mb-3 text-foreground">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      <span className="font-medium text-primary">
                        {service.id === 'genetic_test' ? 'Ваша уникальная карта здоровья' :
                         service.id === 'mri_breast' ? 'Современная диагностика для вашего спокойствия' :
                         service.id === 'online_consilium' ? 'Ваша персональная команда заботы' :
                         service.id === 'dexa_scan' ? 'Контроль плотности костей для женского здоровья' :
                         service.id === 'nutrition_plan' ? 'Индивидуально, с заботой о вас' :
                         service.id === 'mammography' ? 'Деликатная забота о женском здоровье' :
                         service.id === 'microbiome_atlas' ? 'Ваша микробиота под контролем' :
                         'Профессиональная медицинская помощь'}
                      </span><br />
                      {getServiceDescription(service.id)}
                    </p>
                    <div className="text-3xl font-bold text-primary mb-6 flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      ₽{service.price.toLocaleString()}
                    </div>
                    <button className={`w-full bg-gradient-to-r ${getServiceGradient(service.id)} hover:opacity-90 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-elegant hover:scale-105`}>
                      {getServiceButtonText(service.id)}
                    </button>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <span>🤝</span>
                        Остались вопросы? Мы поможем
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support Message */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 rounded-3xl p-8 border border-pink-100/50 max-w-4xl mx-auto">
                <div className="text-4xl mb-4">💖</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Мы рядом на каждом шаге</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Каждая услуга — это не просто процедура, а проявление заботы о вашем здоровье и спокойствии. 
                  Наши специалисты всегда готовы ответить на ваши вопросы и поддержать вас.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
                  <span className="text-xl">📞</span>
                  <span>Горячая линия: 8 (800) 123-45-67</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Гарантии вашей уверенности и безопасности
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Для всех планов */}
              <div className="bg-card rounded-2xl p-8 shadow-elegant border-2 border-accent/20 hover:border-primary/30 transition-all">
                <h3 className="text-xl font-semibold mb-6 text-foreground text-center">
                  Для всех планов
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">🛡️</span>
                    <div>
                      <div className="font-medium text-foreground">30 дней на обдумывание</div>
                      <div className="text-sm text-muted-foreground">Вернём средства, если передумали</div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">🗝️</span>
                    <div>
                      <div className="font-medium text-foreground">Ваши данные защищены по всем стандартам</div>
                      <div className="text-sm text-muted-foreground">GDPR, 152-ФЗ</div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">💎</span>
                    <div>
                      <div className="font-medium text-foreground">Данные под надёжной защитой</div>
                      <div className="text-sm text-muted-foreground">Застрахованы на ₽1 млн</div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">📄</span>
                    <div>
                      <div className="font-medium text-foreground">Международные сертификаты безопасности</div>
                      <div className="text-sm text-muted-foreground">ISO 27001</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Медицинская поддержка */}
              <div className="bg-card rounded-2xl p-8 shadow-elegant border-2 border-accent/20 hover:border-primary/30 transition-all">
                <h3 className="text-xl font-semibold mb-6 text-foreground text-center">
                  Медицинская поддержка
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">👩‍⚕️</span>
                    <div>
                      <div className="font-medium text-foreground">Только сертифицированные врачи</div>
                      <div className="text-sm text-muted-foreground">С опытом 10+ лет</div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">🧪</span>
                    <div>
                      <div className="font-medium text-foreground">Проверенные лаборатории</div>
                      <div className="text-sm text-muted-foreground">Только аккредитованные партнёры</div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">🔬</span>
                    <div>
                      <div className="font-medium text-foreground">Тройной контроль качества</div>
                      <div className="text-sm text-muted-foreground">Для каждого анализа</div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-xl mt-1">🔁</span>
                    <div>
                      <div className="font-medium text-foreground">Бесплатное повторное тестирование</div>
                      <div className="text-sm text-muted-foreground">Если нужно</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-6 border border-accent/20 max-w-3xl mx-auto">
                <p className="text-lg text-muted-foreground italic">
                  Мы заботимся о вашем спокойствии — и отвечаем за результат на каждом шаге.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-background via-pink-50/30 to-purple-50/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-transparent to-purple-100/20"></div>
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            {/* Decorative icon */}
            <div className="text-6xl mb-6 animate-pulse">
              🌸
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight">
              Сделайте первый шаг к заботе о себе
            </h2>
            
            <p className="text-xl mb-8 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Мы рядом, чтобы поддержать вас на каждом этапе.<br />
              Выберите свой тариф — и позвольте себе заботу и экспертную поддержку уже сегодня.
            </p>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-elegant hover:shadow-soft hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-2 group"
            >
              <span className="group-hover:scale-110 transition-transform">🌸</span>
              Начать заботиться о себе
            </button>
            
            {/* Microcopy */}
            <div className="mt-8 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <span>✨</span>
                <span>Ваш выбор можно изменить в любой момент</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span>💬</span>
                <span>Остались вопросы? Мы всегда на связи!</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HowWeHelp;