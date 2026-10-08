export type NodeCategory = 'foundation' | 'retrieval' | 'agent' | 'vision' | 'robotics' | 'eval' | 'custom';
export type NodeStatus = 'active' | 'completed' | 'locked' | 'synthesizing' | 'generative';
export type SimulatorType = 'rag_agent' | 'marine_cv' | 'drone_flight' | 'token_optimizer';
export type MentalMode = 'split' | 'spatial' | 'simulator' | 'intent';

export interface CognitiveLoadMetrics {
  intrinsic: number;   // 0-100: Core task complexity & problem-solving
  germane: number;     // 0-100: Deep mental schema formation & structural connections
  extraneous: number;  // 0-100: Interface noise (strictly 0% in zero-slop EdTech)
}

export interface SpatialNode {
  id: string;
  title: string;
  category: NodeCategory;
  status: NodeStatus;
  position: { x: number; y: number };
  xpReward: number;
  estimatedMinutes: number;
  simulatorType: SimulatorType;
  summary: string;
  instruction: string;
  cognitiveLoad: CognitiveLoadMetrics;
  inputs: string[];
  outputs: string[];
  completedAt?: string;
}

export interface SpatialEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  isActive?: boolean;
}

export interface LearningTrajectory {
  id: string;
  intentText: string;
  title: string;
  summary: string;
  domain: string;
  byteAdvice: string;
  cognitiveLoad: CognitiveLoadMetrics;
  nodes: SpatialNode[];
  edges: SpatialEdge[];
  updatedAt: string;
}

export const INITIAL_INTENTS = [
  {
    intent: 'Хочу собрать RAG-агента для поиска по архивам СЮТ Сочи',
    domain: 'Генеративный ИИ & Векторный поиск',
    type: 'rag_agent' as SimulatorType,
  },
  {
    intent: 'Хочу обучить беспилотный катамаран обходить рифы в акватории Сочи',
    domain: 'Компьютерное зрение & Робототехника',
    type: 'marine_cv' as SimulatorType,
  },
  {
    intent: 'Хочу запустить тактический рой дронов для спасательной операции на горе Ахун',
    domain: 'БПЛА & Мультиагентные системы',
    type: 'drone_flight' as SimulatorType,
  },
  {
    intent: 'Хочу сжать токены и оптимизировать контекст для контроллера робота',
    domain: 'Промпт-инжиниринг & Энергоэффективность',
    type: 'token_optimizer' as SimulatorType,
  },
];

export const DEFAULT_RAG_TRAJECTORY: LearningTrajectory = {
  id: 'traj-rag-sochi',
  intentText: 'Хочу собрать RAG-агента для поиска по архивам СЮТ Сочи',
  title: 'Автономный RAG-Агент архивов СЮТ Сочи',
  summary: 'Интерактивный конвейер семантического поиска, чанкинга и аугментации генерации для инженерных баз знаний',
  domain: 'Генеративный ИИ & RAG',
  byteAdvice: 'Байт сконфигурировал пространственный граф! В RAG критически важен баланс между размером чанка (Chunk Size) и релевантностью Top-K. Начни с настройки чанкинга!',
  cognitiveLoad: {
    intrinsic: 42,
    germane: 58,
    extraneous: 0,
  },
  nodes: [
    {
      id: 'rag-1',
      title: '1. Чанкинг документов СЮТ',
      category: 'foundation',
      status: 'completed',
      position: { x: 80, y: 160 },
      xpReward: 60,
      estimatedMinutes: 6,
      simulatorType: 'rag_agent',
      summary: 'Разбиение инженерных отчетов на семантические фрагменты',
      instruction: 'Проанализируй разбиение документов СЮТ Сочи на фрагменты по 64 и 128 токенов с перекрытием (overlap).',
      cognitiveLoad: { intrinsic: 30, germane: 70, extraneous: 0 },
      inputs: [],
      outputs: ['rag-2', 'rag-3'],
    },
    {
      id: 'rag-2',
      title: '2. Векторизация и Cosine Similarity',
      category: 'retrieval',
      status: 'active',
      position: { x: 360, y: 100 },
      xpReward: 90,
      estimatedMinutes: 10,
      simulatorType: 'rag_agent',
      summary: 'Расчет семантической близости векторов в многомерном пространстве',
      instruction: 'В симуляторе выбери поисковый запрос и проверь косинусное сходство фрагментов архива СЮТ.',
      cognitiveLoad: { intrinsic: 55, germane: 45, extraneous: 0 },
      inputs: ['rag-1'],
      outputs: ['rag-4'],
    },
    {
      id: 'rag-3',
      title: '3. Фильтрация шума и Top-K',
      category: 'agent',
      status: 'active',
      position: { x: 360, y: 280 },
      xpReward: 80,
      estimatedMinutes: 8,
      simulatorType: 'rag_agent',
      summary: 'Отсечение нерелевантного контекста для предотвращения галлюцинаций',
      instruction: 'Отрегулируй порог Top-K: найди оптимальный баланс между полнотой ответа и расходом токенов.',
      cognitiveLoad: { intrinsic: 40, germane: 60, extraneous: 0 },
      inputs: ['rag-1'],
      outputs: ['rag-4'],
    },
    {
      id: 'rag-4',
      title: '4. Аугментированная генерация ответа',
      category: 'eval',
      status: 'locked',
      position: { x: 680, y: 190 },
      xpReward: 130,
      estimatedMinutes: 12,
      simulatorType: 'rag_agent',
      summary: 'Финальная сборка промпта с контекстом и запрос к модели',
      instruction: 'Запусти боевой запрос: модель должна ответить строго на основе извлеченного контекста СЮТ без выдумок.',
      cognitiveLoad: { intrinsic: 65, germane: 35, extraneous: 0 },
      inputs: ['rag-2', 'rag-3'],
      outputs: [],
    },
  ],
  edges: [
    { id: 'e1-2', from: 'rag-1', to: 'rag-2', label: 'Векторы', isActive: true },
    { id: 'e1-3', from: 'rag-1', to: 'rag-3', label: 'Фрагменты', isActive: true },
    { id: 'e2-4', from: 'rag-2', to: 'rag-4', label: 'Similarity' },
    { id: 'e3-4', from: 'rag-3', to: 'rag-4', label: 'Top-K Context' },
  ],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_MARINE_TRAJECTORY: LearningTrajectory = {
  id: 'traj-marine-sochi',
  intentText: 'Хочу обучить беспилотный катамаран обходить рифы в акватории Сочи',
  title: 'Морской Дозор: Компьютерное зрение в Черном море',
  summary: 'Детекция морских буев, рифов и кораблей на базе машинного зрения с автономным управлением рулями',
  domain: 'Компьютерное зрение & Робототехника',
  byteAdvice: 'Акватория порта Сочи полна динамических препятствий. Сбалансируй Confidence Threshold и IoU алгоритма детекции в реальном времени!',
  cognitiveLoad: {
    intrinsic: 48,
    germane: 52,
    extraneous: 0,
  },
  nodes: [
    {
      id: 'marine-1',
      title: '1. Обработка видеопотока с камеры',
      category: 'foundation',
      status: 'completed',
      position: { x: 80, y: 160 },
      xpReward: 50,
      estimatedMinutes: 5,
      simulatorType: 'marine_cv',
      summary: 'Калибровка сонаров, шумоподавление волн и бликов солнца',
      instruction: 'Изучи сырой видеопоток с носовой камеры катамарана СЮТ и активируй фильтр морских бликов.',
      cognitiveLoad: { intrinsic: 30, germane: 70, extraneous: 0 },
      inputs: [],
      outputs: ['marine-2'],
    },
    {
      id: 'marine-2',
      title: '2. Распознавание объектов (YOLO Boxes)',
      category: 'vision',
      status: 'active',
      position: { x: 360, y: 140 },
      xpReward: 95,
      estimatedMinutes: 10,
      simulatorType: 'marine_cv',
      summary: 'Детекция навигационных буев, катеров и скальных рифов',
      instruction: 'В симуляторе настрой Confidence Threshold (0.1–0.99) и добейся 100% распознавания без ложных тревог.',
      cognitiveLoad: { intrinsic: 55, germane: 45, extraneous: 0 },
      inputs: ['marine-1'],
      outputs: ['marine-3'],
    },
    {
      id: 'marine-3',
      title: '3. Расчет угла уклонения и рулевой привод',
      category: 'robotics',
      status: 'locked',
      position: { x: 680, y: 190 },
      xpReward: 120,
      estimatedMinutes: 12,
      simulatorType: 'marine_cv',
      summary: 'Нейросетевой контроллер руля и тяги водометов',
      instruction: 'Запусти катамаран на тестовый полигон и обойди 3 буя подряд в штормовых условиях.',
      cognitiveLoad: { intrinsic: 60, germane: 40, extraneous: 0 },
      inputs: ['marine-2'],
      outputs: [],
    },
  ],
  edges: [
    { id: 'em-1-2', from: 'marine-1', to: 'marine-2', label: 'Кадры', isActive: true },
    { id: 'em-2-3', from: 'marine-2', to: 'marine-3', label: 'Координаты' },
  ],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_DRONE_TRAJECTORY: LearningTrajectory = {
  id: 'traj-drone-akhun',
  intentText: 'Хочу запустить тактический рой дронов для спасательной операции на горе Ахун',
  title: 'Тактический Рой БПЛА: Автономные агенты горы Ахун',
  summary: 'Кооперативная маршрутизация и LLM-координация группы беспилотников в условиях сложного рельефа Кавказа',
  domain: 'БПЛА & Мультиагентные системы',
  byteAdvice: 'На высоте 660 метров над уровнем моря горный ветер создает сильные возмущения. Используй Function Calling для координации секторов поиска!',
  cognitiveLoad: {
    intrinsic: 45,
    germane: 55,
    extraneous: 0,
  },
  nodes: [
    {
      id: 'drone-1',
      title: '1. Декомпозиция секторов поиска',
      category: 'foundation',
      status: 'completed',
      position: { x: 80, y: 160 },
      xpReward: 60,
      estimatedMinutes: 6,
      simulatorType: 'drone_flight',
      summary: 'Разбиение ущелья Ахун на эшелоны высот и зоны покрытия',
      instruction: 'Назначь дрону №1 северный склон, дрону №2 ущелье, а дрону №3 метеорологический надзор.',
      cognitiveLoad: { intrinsic: 35, germane: 65, extraneous: 0 },
      inputs: [],
      outputs: ['drone-2'],
    },
    {
      id: 'drone-2',
      title: '2. LLM-Маршрутизация (Function Calling)',
      category: 'agent',
      status: 'active',
      position: { x: 360, y: 150 },
      xpReward: 100,
      estimatedMinutes: 10,
      simulatorType: 'drone_flight',
      summary: 'Преобразование естественных команд в телеметрические точки полета',
      instruction: 'Отдай естественную команду в симуляторе («Дрон 2, снизься до 40м и включи тепловизор») и проверь исполнение.',
      cognitiveLoad: { intrinsic: 50, germane: 50, extraneous: 0 },
      inputs: ['drone-1'],
      outputs: ['drone-3'],
    },
    {
      id: 'drone-3',
      title: '3. Спасение и компенсация ветра',
      category: 'eval',
      status: 'locked',
      position: { x: 680, y: 200 },
      xpReward: 130,
      estimatedMinutes: 12,
      simulatorType: 'drone_flight',
      summary: 'Финальная координация роя и обнаружение маяка альпинистов',
      instruction: 'Успешно сориентируй рой дронов на вершине башни Ахун при порывах ветра 15 м/с.',
      cognitiveLoad: { intrinsic: 65, germane: 35, extraneous: 0 },
      inputs: ['drone-2'],
      outputs: [],
    },
  ],
  edges: [
    { id: 'ed-1-2', from: 'drone-1', to: 'drone-2', label: 'Телеметрия', isActive: true },
    { id: 'ed-2-3', from: 'drone-2', to: 'drone-3', label: 'План полета' },
  ],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_TOKEN_TRAJECTORY: LearningTrajectory = {
  id: 'traj-token-opt',
  intentText: 'Хочу сжать токены и оптимизировать контекст для контроллера робота',
  title: 'Оптимизация Контекста: Высокоплотные микро-промпты',
  summary: 'Сжатие системных инструкций и удаление избыточных токенов для микроконтроллеров и быстрого отклика',
  domain: 'Промпт-инжиниринг & Энергоэффективность',
  byteAdvice: 'Каждый сэкономленный токен снижает задержку бортового компьютера робота на 12 мс. Примени структурированные матрицы!',
  cognitiveLoad: {
    intrinsic: 38,
    germane: 62,
    extraneous: 0,
  },
  nodes: [
    {
      id: 'tok-1',
      title: '1. Аудит избыточности (Token Entropy)',
      category: 'foundation',
      status: 'completed',
      position: { x: 80, y: 160 },
      xpReward: 50,
      estimatedMinutes: 5,
      simulatorType: 'token_optimizer',
      summary: 'Поиск вежливых слов, повторов и пассивных конструкций',
      instruction: 'Загрузи в симулятор раздутый промпт и проанализируй распределение информационных токенов.',
      cognitiveLoad: { intrinsic: 25, germane: 75, extraneous: 0 },
      inputs: [],
      outputs: ['tok-2'],
    },
    {
      id: 'tok-2',
      title: '2. Сжатие в Few-Shot матрицы',
      category: 'agent',
      status: 'active',
      position: { x: 360, y: 140 },
      xpReward: 85,
      estimatedMinutes: 8,
      simulatorType: 'token_optimizer',
      summary: 'Преобразование длинных описаний в компактные табличные примеры',
      instruction: 'Сожми промпт минимум на 30% без потери точности выполнения задания.',
      cognitiveLoad: { intrinsic: 50, germane: 50, extraneous: 0 },
      inputs: ['tok-1'],
      outputs: ['tok-3'],
    },
    {
      id: 'tok-3',
      title: '3. Стресс-тест на контроллере СЮТ',
      category: 'eval',
      status: 'locked',
      position: { x: 680, y: 190 },
      xpReward: 110,
      estimatedMinutes: 10,
      simulatorType: 'token_optimizer',
      summary: 'Верификация латентности и точности ответа сжатого промпта',
      instruction: 'Подтверди экономию не менее 25 токенов на тестовом запросе и получи сертификат оптимизатора.',
      cognitiveLoad: { intrinsic: 55, germane: 45, extraneous: 0 },
      inputs: ['tok-2'],
      outputs: [],
    },
  ],
  edges: [
    { id: 'et-1-2', from: 'tok-1', to: 'tok-2', label: 'Лексика', isActive: true },
    { id: 'et-2-3', from: 'tok-2', to: 'tok-3', label: 'Плотность' },
  ],
  updatedAt: new Date().toISOString(),
};

export const ALL_DEFAULT_TRAJECTORIES: Record<string, LearningTrajectory> = {
  rag_agent: DEFAULT_RAG_TRAJECTORY,
  marine_cv: DEFAULT_MARINE_TRAJECTORY,
  drone_flight: DEFAULT_DRONE_TRAJECTORY,
  token_optimizer: DEFAULT_TOKEN_TRAJECTORY,
};

const STORAGE_KEY_TRAJECTORY_PREFIX = 'sut_spatial_trajectory_';

export function getSavedTrajectory(studentId: string): LearningTrajectory {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_TRAJECTORY_PREFIX}${studentId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.nodes && parsed.nodes.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_RAG_TRAJECTORY;
}

export function saveTrajectory(studentId: string, trajectory: LearningTrajectory) {
  try {
    localStorage.setItem(`${STORAGE_KEY_TRAJECTORY_PREFIX}${studentId}`, JSON.stringify(trajectory));
  } catch (e) {
    // ignore
  }
}

export async function orchestrateIntentWithAI(
  intentText: string,
  studentName: string,
  department: string,
  currentLevel: number
): Promise<LearningTrajectory> {
  try {
    const resp = await fetch('/api/ai/orchestrate-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentText, studentName, department, currentLevel }),
    });

    if (resp.ok) {
      const data = await resp.json();
      return {
        id: `traj-${Date.now()}`,
        intentText,
        title: data.trajectoryTitle || 'Оркестрованная траектория СЮТ',
        summary: data.trajectorySummary || `Путь реализации: ${intentText}`,
        domain: data.domain || 'Инженерный ИИ',
        byteAdvice: data.byteAdvice || 'Байт сгенерировал динамический путь!',
        cognitiveLoad: data.cognitiveLoad || { intrinsic: 45, germane: 55, extraneous: 0 },
        nodes: data.nodes || DEFAULT_RAG_TRAJECTORY.nodes,
        edges: data.edges || DEFAULT_RAG_TRAJECTORY.edges,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn('Orchestrator API call failed, using smart local synthesizer');
  }

  // Local fallback matched by intent keywords
  const lower = intentText.toLowerCase();
  if (lower.includes('катер') || lower.includes('мор') || lower.includes('зрение') || lower.includes('cv') || lower.includes('yolo')) {
    return { ...DEFAULT_MARINE_TRAJECTORY, intentText, id: `traj-${Date.now()}` };
  }
  if (lower.includes('дрон') || lower.includes('ахун') || lower.includes('бпла') || lower.includes('агент')) {
    return { ...DEFAULT_DRONE_TRAJECTORY, intentText, id: `traj-${Date.now()}` };
  }
  if (lower.includes('токен') || lower.includes('сжат') || lower.includes('эконом')) {
    return { ...DEFAULT_TOKEN_TRAJECTORY, intentText, id: `traj-${Date.now()}` };
  }

  return { ...DEFAULT_RAG_TRAJECTORY, intentText, id: `traj-${Date.now()}` };
}
