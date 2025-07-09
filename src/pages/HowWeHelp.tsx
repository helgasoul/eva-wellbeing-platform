import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { SUBSCRIPTION_PLANS, ADDITIONAL_SERVICES } from '@/data/subscriptionPlans';
import { Layout } from '@/components/layout/Layout';
import caringSupport from '@/assets/caring-support-hero.jpg';

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
        <section className="bg-gradient-to-br from-primary/5 via-purple-50 to-accent/10 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                  Мы рядом на каждом этапе вашего пути
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
                <button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-elegant hover:shadow-soft transform hover:-translate-y-1">
                  Начать путь с Bloom
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Начните заботу о себе с Bloom
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
                        {plan.id === 'essential' ? '🌱' : plan.id === 'plus' ? '🌺' : '✨'}
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        {plan.id === 'essential' ? '🌱 Essential — первый шаг к гармонии' : 
                         plan.id === 'plus' ? '🌺 Plus — Персональный путь к вашему балансу' :
                         '✨ Optimum — Ваше долголетие и забота на высшем уровне'}
                      </h2>
                      
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
                          ) : null}
                        </ul>
                        
                        {(plan.id === 'plus' || plan.id === 'optimum') && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                            <p className="text-sm text-muted-foreground italic text-center">
                              {plan.id === 'plus' ? 
                                'Каждая женщина заслуживает поддержки на своём уникальном пути. Мы рядом, когда это важно.' :
                                'С заботой о вашем здоровье — команда Bloom'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isLoading}
                        className={`bg-gradient-to-r ${plan.color} text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-soft hover:-translate-y-1 ${
                          plan.popular ? 'ring-2 ring-accent ring-offset-2' : ''
                        }`}
                      >
                        {isLoading ? 'Загрузка...' : (
                          plan.id === 'essential' ? 'Попробовать бесплатно' :
                          plan.id === 'plus' ? 'Выбрать Plus' :
                           plan.id === 'optimum' ? 'Получить максимальную поддержку' :
                           'Выбрать план'
                        )}
                      </button>
                      
                      {plan.popular && (
                        <div className="mt-4">
                          <span className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-1">
                            🌸 Самый популярный выбор среди женщин Bloom
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
                    Записаться
                  </button>
                </div>
              ))}
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