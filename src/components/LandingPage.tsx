import React, { useState } from 'react';
import { StudentProfile, AuthMode } from '../types';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Cpu,
  Terminal,
  Award,
  Lock,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Zap,
  Bot,
  Compass,
  Code2,
  Anchor,
  Wind,
  Layers,
  GraduationCap,
  Play,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToApp: () => void;
  onNavigateToAdmin?: () => void;
  activeStudent?: StudentProfile | null;
  authMode?: AuthMode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToApp,
  onNavigateToAdmin,
  activeStudent,
  authMode,
}) => {
  // Interactive mini-tester state on hero
  const [demoPrompt, setDemoPrompt] = useState('Объясни роботу, как обойти препятствие в штормовом море у берегов Сочи');
  const [demoTokens, setDemoTokens] = useState(14);
  const [demoResponse, setDemoResponse] = useState<string | null>(null);
  const [isDemoSimulating, setIsDemoSimulating] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleTestDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoPrompt.trim()) return;

    setIsDemoSimulating(true);
    setDemoTokens(Math.round(demoPrompt.length / 3.2) + 24);

    setTimeout(() => {
      setDemoResponse(
        `[Робот Байт]: Принято! Для автономного катера СЮТ активируем сонар и гироскоп. При высоте волны более 1.5м корректируем курс на траверз мыса Видный. Затрачено ${Math.round(demoPrompt.length / 3.2) + 24} токенов. Отличная формулировка!`
      );
      setIsDemoSimulating(false);
    }, 700);
  };

  const tracks = [
    {
      id: 'robotics',
      title: 'Робототехника & Микроэлектроника',
      tag: 'Hardware & IoT',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      description: 'Проектирование автономных роботов, контроллеры ESP32, пайка, сенсоры препятствий и сервоприводы.',
      topics: ['Архитектура микроконтроллеров', 'UART, I2C, SPI интерфейсы', 'Питание и силовая электроника', 'Телеметрия по Wi-Fi'],
    },
    {
      id: 'ai',
      title: 'Искусственный Интеллект & Промптинг',
      tag: 'Neural Networks & LLM',
      icon: <Bot className="w-6 h-6 text-emerald-400" />,
      description: 'Понимание работы трансформеров, тонкая настройка промптов, Few-Shot логика и токенизация.',
      topics: ['Анатомия токена и весов', 'Chain-of-Thought рассуждения', 'ИИ-ассистент в исследовании', 'Этика и безопасность ИИ'],
    },
    {
      id: 'coding',
      title: 'Алгоритмы & Программирование',
      tag: 'Python & JavaScript',
      icon: <Code2 className="w-6 h-6 text-amber-400" />,
      description: 'Чистый код, структуры данных, алгоритмическое мышление и разработка интерактивных симуляций.',
      topics: ['Базовые структуры данных', 'Асинхронные интерфейсы', 'Парсинг данных и API', 'Олимпиадные задачи'],
    },
    {
      id: 'aero',
      title: 'Аэроклуб & БПЛА',
      tag: 'Drones & Avionics',
      icon: <Wind className="w-6 h-6 text-sky-400" />,
      description: 'Сборка квадрокоптеров, пилотирование, аэродинамика и автоматический мониторинг горных склонов Сочи.',
      topics: ['Аэродинамика винтов', 'Полетные контроллеры Betaflight', 'FPV пилотирование', 'GPS картографирование'],
    },
    {
      id: 'marine',
      title: 'Судомоделирование & Подводные дроны',
      tag: 'Black Sea Marine Lab',
      icon: <Anchor className="w-6 h-6 text-teal-400" />,
      description: 'Черноморские подводные дроны, автономные катамараны для анализа воды и гидродинамика судов.',
      topics: ['Гидродинамика корпуса', 'Подводные движители и балласт', 'Экологический мониторинг воды', 'Беспроводная гидроакустика'],
    },
  ];

  const faqs = [
    {
      q: 'Что такое ИИ-Академия СЮТ г. Сочи?',
      a: 'Это интерактивная система обучения учащихся Станции Юных Техников (СЮТ). Платформа сочетает теорию искусственного интеллекта, живые лабораторные работы с интерактивным маскотом роботом Байтом, песочницу кода и прикладные спецквесты по экологии и технологиям Сочи.',
    },
    {
      q: 'Как войти в свой кабинет или зарегистрироваться?',
      a: 'Если вы уже записаны в СЮТ, нажмите «Войти в систему» и введите ваш позывной (например, RoboChief_Sochi) и 4-значный PIN-код (по умолчанию 1234). Если вы новый ученик — перейдите в «Регистрацию ученика», заполните анкету и получите персональный билет юного инженера.',
    },
    {
      q: 'Почему кабинеты учеников строго изолированы?',
      a: 'Каждый учащийся должен развивать свои инженерные навыки самостоятельно. Ваш прогресс, баланс нейро-токенов, код в песочнице и сданные квесты защищены персональным PIN-кодом. Доступ для проверки есть только у вас и у преподавателя-наставника через защищенную панель администрирования.',
    },
    {
      q: 'Что такое баланс нейро-токенов и зачем он нужен?',
      a: 'В реальной разработке каждый запрос к языковым моделям и вычислительным кластерам расходует вычислительные ресурсы (токены). Мы учим школьников формулировать емкие, точные инженерные промпты, экономя ресурсы. Каждый ученик получает стартовый грант в 5 000 токенов, а за успешные квесты и уроки зарабатывает новые.',
    },
    {
      q: 'Выдается ли официальный сертификат после прохождения?',
      a: 'Да! При достижении квалификационных требований в личном кабинете ученика автоматически формируется именной номерной сертификат Станции Юных Техников г. Сочи с печатью и квалификацией.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo & Institution branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>СЮТ Сочи</span>
                <span className="text-slate-600 font-light">/</span>
                <span className="text-cyan-400">ИИ-Академия</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 -mt-0.5">
                МОУДОД Станция Юных Техников г. Сочи · Сезон 2026
              </div>
            </div>
          </div>

          {/* Clean Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-cyan-400 transition-colors">
              О платформе
            </a>
            <a href="#tracks" className="hover:text-cyan-400 transition-colors">
              Направления СЮТ
            </a>
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">
              Интерактивная среда
            </a>
            <a href="#isolation" className="hover:text-cyan-400 transition-colors">
              Изоляция контуров
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              Вопросы и ответы
            </a>
          </nav>

          {/* Action CTAs: Entrance to /app */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateToApp}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/15 flex items-center gap-2"
              title="Перейти на страницу входа в систему (/app)"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти в систему</span>
              <span className="text-[10px] font-mono bg-slate-950/20 px-1.5 py-0.5 rounded">
                /app
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800/80">
        {/* Subtle background ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Unboxed Kicker metadata without pill wrappers */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                <span>МОУДОД СЮТ Г. СОЧИ</span>
                <span aria-hidden="true">·</span>
                <span>ИНЖЕНЕРНАЯ АКАДЕМИЯ</span>
                <span aria-hidden="true">·</span>
                <span>2026</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                Первая интерактивная система обучения{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  искусственному интеллекту
                </span>{' '}
                для юных инженеров
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Практическая подготовка школьников 4–11 классов в Станции Юных Техников г. Сочи: от первых шагов в промпт-инжиниринге и логике нейросетей до контроллеров ESP32, морских робототехнических аппаратов и автономных дронов.
              </p>

              {/* Main Call to Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onNavigateToApp}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Войти в систему обучения</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onNavigateToApp}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {authMode === 'student' && activeStudent ? (
                    <>
                      <span>В кабинет @{activeStudent.callsign} (/app)</span>
                      <span className="text-[11px] font-mono text-emerald-400">АКТИВЕН</span>
                    </>
                  ) : authMode === 'admin' ? (
                    <>
                      <span>Панель наставника (/app)</span>
                      <span className="text-[11px] font-mono text-amber-400">АДМИН</span>
                    </>
                  ) : (
                    <>
                      <span>Войти в личный кабинет (/app)</span>
                      <span className="text-[11px] font-mono text-cyan-400">PIN 1234</span>
                    </>
                  )}
                </button>
              </div>

              {/* Unboxed feature bullets */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Стартовый грант: 5 000 токенов + 100 XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Изолированный контур ученика</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Официальный сертификат СЮТ</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Simulator Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 p-6 shadow-2xl space-y-4 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      live-prompt-tester.sut
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    ONLINE DEMO
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0">
                    🤖
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Робот Байт · Наставник СЮТ</div>
                    <div className="text-[11px] text-slate-400">
                      Интерактивный вычислительный модуль нейросети
                    </div>
                  </div>
                </div>

                {/* Mini interactive prompt tester */}
                <form onSubmit={handleTestDemo} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Тестовый запрос в систему:
                    </label>
                    <textarea
                      rows={2}
                      value={demoPrompt}
                      onChange={(e) => setDemoPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>
                      Оценка токенов:{' '}
                      <strong className="text-amber-400">{demoTokens} токенов</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={isDemoSimulating}
                      className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      <span>{isDemoSimulating ? 'Расчет...' : 'Тест промпта'}</span>
                    </button>
                  </div>
                </form>

                {demoResponse && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 font-mono leading-relaxed animate-fadeIn">
                    {demoResponse}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Для доступа ко всем урокам и песочнице кода:</span>
                  <button
                    onClick={onNavigateToApp}
                    className="text-cyan-400 hover:underline font-bold cursor-pointer"
                  >
                    Перейти в /app →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats Bar - Anti-slop and unboxed metadata */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">5</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Инженерных треков
              </div>
              <div className="text-[11px] text-slate-400">
                Роботы, ИИ, код, дроны и морские системы
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">5 000</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Токенов гранта
              </div>
              <div className="text-[11px] text-slate-400">
                Каждому ученику при открытии кабинета
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">100%</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Интерактивная практика
              </div>
              <div className="text-[11px] text-slate-400">
                Песочница, живой ИИ и спецквесты
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">СЮТ-2026</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Аттестация наставников
              </div>
              <div className="text-[11px] text-slate-400">
                Именной сертификат юного инженера
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section id="tracks" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              ОБРАЗОВАТЕЛЬНЫЕ НАПРАВЛЕНИЯ
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              5 направлений научно-технического творчества в СЮТ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Каждое направление интегрировано с интеллектуальными алгоритмами и практическими проектами для Черноморского региона и Большого Сочи.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all hover:bg-slate-900"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      {track.icon}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {track.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{track.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Программа модуля:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {track.topics.map((t, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-cyan-400 text-xs">▸</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onNavigateToApp}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Войти для обучения</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Simulator Showcase */}
      <section id="simulator" className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              ИНТЕЛЛЕКТУАЛЬНЫЙ КОМПЛЕКС
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Инструменты личного кабинета ученика в системе /app
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Внутри единого изолированного рабочего пространства учащемуся доступны профессиональные интерактивные модули.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center text-lg border border-cyan-500/40">
                📚
              </div>
              <h3 className="text-sm font-bold text-white">Уроки и концепты</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Пошаговые интерактивные задания с проверкой ключевых понятий: от токенов до весов нейросети и этики ИИ.
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/40">
                🧪
              </div>
              <h3 className="text-sm font-bold text-white">Лаборатория промптов</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Практический стенд формулирования запросов. Робот Байт оценивает качество и рассчитывает расход токенов.
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center text-lg border border-amber-500/40">
                💻
              </div>
              <h3 className="text-sm font-bold text-white">Песочница кода</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Встроенный редактор кода с запуском скриптов, подсветкой синтаксиса и подсказками ИИ-наставника.
              </p>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center text-lg border border-purple-500/40">
                🎯
              </div>
              <h3 className="text-sm font-bold text-white">Сочинские спецквесты</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Миссии по экологии Черного моря, навигации по башне Ахун и спасению данных заповедника с начислением XP.
              </p>
            </div>
          </div>

          {/* Direct CTA to entrance */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                ДОСТУП К ПРАКТИЧЕСКОМУ МОДУЛЮ
              </div>
              <h3 className="text-lg font-bold text-white">
                Все модули уже развернуты и ждут вашего решения
              </h3>
              <p className="text-xs text-slate-400">
                Авторизуйтесь в системе через /app или создайте свой кабинет за 30 секунд.
              </p>
            </div>

            <button
              onClick={onNavigateToApp}
              className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/15 flex items-center gap-2 shrink-0"
            >
              <span>Войти в систему (/app)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Circuit Isolation Architecture Section */}
      <section id="isolation" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              БЕЗОПАСНОСТЬ И АРХИТЕКТУРА
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Полная изоляция образовательного контура
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              В строгом соответствии с регламентом СЮТ, личный кабинет каждого учащегося защищен и изолирован.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Персональный PIN-код</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Доступ в кабинет возможен только по личному позывному и 4-значному PIN-коду. Ученики не имеют доступа к кабинетам одноклассников.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 w-fit">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Защита от утечек и подмены</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Из кабинета ученика полностью исключены кнопки администрирования или переключения профилей. Рейтинг работает в режиме только для чтения.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-500/30 w-fit">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Единый контроль наставника</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Только авторизованный преподаватель СЮТ имеет право просматривать журнал группы, проверять квесты и инспектировать проекты.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              ЧАСТЫЕ ВОПРОСЫ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Вопросы о системе и записи в СЮТ
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-Footer Action Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            <span>НАЧНИ ОБУЧЕНИЕ В СЮТ СОЧИ СЕЙЧАС</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Открой свой персональный кабинет юного инженера искусственного интеллекта
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Вход в систему осуществляется по тестовым учетным записям базы данных СЮТ или мастер-токену преподавателя.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onNavigateToApp}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти в систему СЮТ (/app)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black">
                ⚡
              </div>
              <div>
                <div className="font-bold text-white text-sm">
                  МОУДОД Станция Юных Техников г. Сочи
                </div>
                <div className="text-[11px] text-slate-500">
                  Центр детского и юношеского научно-технического творчества
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={onNavigateToApp}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Вход в систему (/app)</span>
              </button>
              <a
                href="https://sut-sochi.orgs.biz/"
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
              >
                <span>Официальный сайт СЮТ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              г. Сочи, Краснодарский край · Академия искусственного интеллекта СЮТ, 2026
            </div>
            <div>
              Все права защищены · Электронная обучающая среда
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
