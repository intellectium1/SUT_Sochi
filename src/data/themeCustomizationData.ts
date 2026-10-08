export interface ThemePreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  requiredAchievementId?: string; // If undefined, unlocked by default
  badge: string;
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  ambientBg: string;
  headerBorder: string;
  activeTabClass: string;
  accentTextClass: string;
  accentButtonClass: string;
  cardBorderClass: string;
}

export interface ByteSkin {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  requiredAchievementId?: string;
  emoji: string;
  avatarBadge: string;
  glowColor: string;
  greetingSuffix: string;
  hatTitle: string;
}

export interface CardGlowOption {
  id: string;
  name: string;
  requiredAchievementId?: string;
  className: string;
  description: string;
}

export interface SoundFxOption {
  id: string;
  name: string;
  requiredAchievementId?: string;
  description: string;
}

export interface StudentCustomizationConfig {
  themeId: string;
  byteSkinId: string;
  cardGlowId: string;
  soundFxId: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'theme-default',
    name: 'Стандарт СЮТ (Кибер-Индиго)',
    subtitle: 'Базовый академический стиль Станции Юных Техников',
    description: 'Классическая высокотехнологичная палитра с акцентами цвета сочинского циан-неона и сланцевой глубины.',
    badge: 'Базовый',
    previewColors: {
      primary: '#06b6d4',
      secondary: '#10b981',
      accent: '#38bdf8',
      background: '#090d16',
    },
    ambientBg: 'from-cyan-600/10 via-emerald-600/5 to-transparent',
    headerBorder: 'border-cyan-500/30',
    activeTabClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    accentTextClass: 'text-cyan-400',
    accentButtonClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold',
    cardBorderClass: 'border-slate-800 hover:border-cyan-500/40',
  },
  {
    id: 'theme-cyberpunk',
    name: 'Неоновый Киберпанк (Синтвейв)',
    subtitle: 'Открывается за достижение «Повелитель кода»',
    description: 'Яркие неоновые градиенты фуксии и ультрафиолета. Стиль кибернетической лаборатории будущего.',
    requiredAchievementId: 'code_pioneer',
    badge: 'Кодер 2077',
    previewColors: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#f43f5e',
      background: '#0e0719',
    },
    ambientBg: 'from-pink-600/15 via-purple-600/10 to-transparent',
    headerBorder: 'border-pink-500/40',
    activeTabClass: 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-pink-500/20 shadow-sm',
    accentTextClass: 'text-pink-400',
    accentButtonClass: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold',
    cardBorderClass: 'border-purple-900/60 hover:border-pink-500/60',
  },
  {
    id: 'theme-sochi-riviera',
    name: 'Черноморская Ривьера & Океан',
    subtitle: 'Открывается за достижение «Черноморский исследователь»',
    description: 'Освежающие лазурные и изумрудно-бирюзовые волны побережья города Сочи и батискафов СЮТ.',
    requiredAchievementId: 'sochi_explorer',
    badge: 'Сочинский бриз',
    previewColors: {
      primary: '#14b8a6',
      secondary: '#0284c7',
      accent: '#2dd4bf',
      background: '#03141b',
    },
    ambientBg: 'from-teal-600/15 via-sky-600/10 to-transparent',
    headerBorder: 'border-teal-500/40',
    activeTabClass: 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-teal-500/20 shadow-sm',
    accentTextClass: 'text-teal-400',
    accentButtonClass: 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold',
    cardBorderClass: 'border-teal-950/80 hover:border-teal-500/60',
  },
  {
    id: 'theme-deep-space',
    name: 'Глубокий Космос (Орбита Сириус)',
    subtitle: 'Открывается за достижение «Снайпер точности (90+)»',
    description: 'Глубокий индиго и звездное свечение космодрома, вдохновленное сочинским планетарием и ОЦ Сириус.',
    requiredAchievementId: 'prompt_sniper',
    badge: 'Астро-ИИ',
    previewColors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#c084fc',
      background: '#090919',
    },
    ambientBg: 'from-indigo-600/15 via-purple-600/10 to-transparent',
    headerBorder: 'border-indigo-500/40',
    activeTabClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-indigo-500/20 shadow-sm',
    accentTextClass: 'text-indigo-400',
    accentButtonClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold',
    cardBorderClass: 'border-indigo-950/80 hover:border-indigo-500/60',
  },
  {
    id: 'theme-matrix-hacker',
    name: 'Изумрудный Терминал (Матрица СЮТ)',
    subtitle: 'Открывается за достижение «Страж кибербезопасности»',
    description: 'Культовый монохромный зеленый фосфорный глоу, вдохновленный классическими терминалами Unix и киберзащитой.',
    requiredAchievementId: 'ai_ethics',
    badge: 'CyberSec',
    previewColors: {
      primary: '#22c55e',
      secondary: '#10b981',
      accent: '#4ade80',
      background: '#041208',
    },
    ambientBg: 'from-emerald-600/15 via-green-600/10 to-transparent',
    headerBorder: 'border-emerald-500/40',
    activeTabClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20 shadow-sm',
    accentTextClass: 'text-emerald-400',
    accentButtonClass: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold',
    cardBorderClass: 'border-emerald-950/80 hover:border-emerald-500/60',
  },
  {
    id: 'theme-turbo-aeroclub',
    name: 'Турбореактивный Форсаж (Аэроклуб)',
    subtitle: 'Открывается за достижение «Инженер формул»',
    description: 'Огненная энергия реактивных двигателей, дронов и авиамоделей СЮТ Сочи.',
    requiredAchievementId: 'prompt_novice',
    badge: 'Форсаж',
    previewColors: {
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fb923c',
      background: '#150904',
    },
    ambientBg: 'from-orange-600/15 via-rose-600/10 to-transparent',
    headerBorder: 'border-orange-500/40',
    activeTabClass: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-orange-500/20 shadow-sm',
    accentTextClass: 'text-orange-400',
    accentButtonClass: 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold',
    cardBorderClass: 'border-orange-950/80 hover:border-orange-500/60',
  },
  {
    id: 'theme-gold-master',
    name: 'Золотой Магистр ИИ (Премиум СЮТ)',
    subtitle: 'Открывается за высшее достижение «Магистр ИИ СЮТ Сочи»',
    description: 'Роскошный золотисто-янтарный королевский статус для абсолютных лидеров рейтинга изобретателей.',
    requiredAchievementId: 'grandmaster',
    badge: 'Магистр ИИ',
    previewColors: {
      primary: '#f59e0b',
      secondary: '#eab308',
      accent: '#fde047',
      background: '#140e02',
    },
    ambientBg: 'from-amber-500/20 via-yellow-600/10 to-transparent',
    headerBorder: 'border-amber-500/50',
    activeTabClass: 'bg-amber-500/25 text-amber-200 border-amber-500/60 shadow-amber-500/25 shadow-sm',
    accentTextClass: 'text-amber-400',
    accentButtonClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black',
    cardBorderClass: 'border-amber-900/60 hover:border-amber-400/80',
  },
];

export const BYTE_SKINS: ByteSkin[] = [
  {
    id: 'skin-classic',
    name: 'Классический Байт',
    subtitle: 'Стандартный андроид-наставник СЮТ',
    description: 'Сине-бирюзовый робот-компаньон со встроенным токен-счётчиком.',
    emoji: '🤖',
    avatarBadge: '⚡',
    glowColor: 'from-cyan-500 to-emerald-400',
    greetingSuffix: 'Готов исследовать нейросети!',
    hatTitle: 'Антенна 5G СЮТ',
  },
  {
    id: 'skin-hacker',
    name: 'Байт Кибер-Хакер',
    subtitle: 'Открывается за достижение «Страж кибербезопасности»',
    description: 'Оснащен визором ночного видения и протоколами защиты от промпт-инъекций.',
    requiredAchievementId: 'ai_ethics',
    emoji: '🕶️',
    avatarBadge: '🛡️',
    glowColor: 'from-emerald-500 to-green-400',
    greetingSuffix: 'Все протоколы безопасности активны. Никаких галлюцинаций!',
    hatTitle: 'Кибер-очки защиты',
  },
  {
    id: 'skin-aquanaut',
    name: 'Байт-Акванавт',
    subtitle: 'Открывается за достижение «Черноморский исследователь»',
    description: 'Герметичный костюм глубоководного батискафа СЮТ для экспедиций в Черное море.',
    requiredAchievementId: 'sochi_explorer',
    emoji: '🤿',
    avatarBadge: '🐬',
    glowColor: 'from-teal-500 to-cyan-400',
    greetingSuffix: 'Глубина 200 метров. Сенсоры гидролокатора в норме!',
    hatTitle: 'Акваланг исследователя',
  },
  {
    id: 'skin-aviator',
    name: 'Байт-Пилот Аэроклуба',
    subtitle: 'Открывается за достижение «Инженер формул»',
    description: 'Винтажные авиаторские очки и турбопропеллер для быстрых вычислений.',
    requiredAchievementId: 'prompt_novice',
    emoji: '✈️',
    avatarBadge: '🚀',
    glowColor: 'from-orange-500 to-amber-400',
    greetingSuffix: 'Полет нормальный! Формула RCIO набрала сверхзвуковую скорость!',
    hatTitle: 'Шлем летчика-испытателя',
  },
  {
    id: 'skin-gold',
    name: 'Золотой Байт-Магистр',
    subtitle: 'Открывается за высшее достижение «Магистр ИИ СЮТ Сочи»',
    description: 'Инкрустирован золотыми микросхемами и лавровым венком победителя олимпиады СЮТ.',
    requiredAchievementId: 'grandmaster',
    emoji: '👑',
    avatarBadge: '🏆',
    glowColor: 'from-amber-400 to-yellow-300',
    greetingSuffix: 'Приветствую, великий изобретатель! Твой гений вдохновляет всю станцию!',
    hatTitle: 'Корона Грандмастера',
  },
  {
    id: 'skin-neon',
    name: 'Байт Синтвейв Снайпер',
    subtitle: 'Открывается за достижение «Снайпер точности (90+)»',
    description: 'Голографический прицел и неоновое сияние для поражения 100-балльных промптов.',
    requiredAchievementId: 'prompt_sniper',
    emoji: '🎯',
    avatarBadge: '✨',
    glowColor: 'from-pink-500 to-purple-400',
    greetingSuffix: 'Точность попадания 100%. Мы не оставим багам ни единого шанса!',
    hatTitle: 'Голографический прицел',
  },
];

export const CARD_GLOW_OPTIONS: CardGlowOption[] = [
  {
    id: 'glow-none',
    name: 'Строгий минимализм',
    className: 'border-slate-800',
    description: 'Классические четкие рамки без эффекта свечения',
  },
  {
    id: 'glow-cyan',
    name: 'Импульсный неон',
    requiredAchievementId: 'first_step',
    className: 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    description: 'Мягкое неоновое свечение активных карточек интерфейса',
  },
  {
    id: 'glow-rainbow',
    name: 'Квантовый спектр',
    requiredAchievementId: 'code_pioneer',
    className: 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    description: 'Футуристическое переливающееся сияние кибер-кодера',
  },
  {
    id: 'glow-gold',
    name: 'Золотое свечение',
    requiredAchievementId: 'grandmaster',
    className: 'border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    description: 'Королевский ореол абсолютного чемпиона СЮТ',
  },
];

export const SOUND_FX_OPTIONS: SoundFxOption[] = [
  {
    id: 'sound-scifi',
    name: 'Sci-Fi Кибернетика (по умолчанию)',
    description: 'Современные футуристические интерфейсные сигналы',
  },
  {
    id: 'sound-8bit',
    name: 'Ретро 8-bit Чиптюн',
    requiredAchievementId: 'code_pioneer',
    description: 'Ностальгические аркадные звуки микроконтроллеров и Dendy',
  },
  {
    id: 'sound-silent',
    name: 'Тихий академический режим',
    description: 'Без звуковых эффектов при кликах и начислении XP',
  },
];

export const DEFAULT_CUSTOMIZATION: StudentCustomizationConfig = {
  themeId: 'theme-default',
  byteSkinId: 'skin-classic',
  cardGlowId: 'glow-none',
  soundFxId: 'sound-scifi',
};

export function getStudentCustomization(studentId: string): StudentCustomizationConfig {
  try {
    const raw = localStorage.getItem(`sut_customization_${studentId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        themeId: parsed.themeId || DEFAULT_CUSTOMIZATION.themeId,
        byteSkinId: parsed.byteSkinId || DEFAULT_CUSTOMIZATION.byteSkinId,
        cardGlowId: parsed.cardGlowId || DEFAULT_CUSTOMIZATION.cardGlowId,
        soundFxId: parsed.soundFxId || DEFAULT_CUSTOMIZATION.soundFxId,
      };
    }
  } catch (err) {
    console.warn('Failed to load customization:', err);
  }
  return DEFAULT_CUSTOMIZATION;
}

export function saveStudentCustomization(studentId: string, config: StudentCustomizationConfig): void {
  try {
    localStorage.setItem(`sut_customization_${studentId}`, JSON.stringify(config));
    // Also save as global active customization so app shell reads it immediately
    localStorage.setItem('sut_active_customization', JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save customization:', err);
  }
}
