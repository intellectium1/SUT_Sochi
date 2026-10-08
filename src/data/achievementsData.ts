import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Первый импульс',
    description: 'Успешно заверши свой первый интерактивный урок по основам нейросетей.',
    icon: 'Zap',
    category: 'learning',
    isUnlocked: true,
    unlockedAt: '2026-10-01',
    requiredXp: 80,
  },
  {
    id: 'prompt_novice',
    title: 'Инженер формул',
    description: 'Освой формулу идеального промпта R-C-I-O и примени её на практике.',
    icon: 'Sliders',
    category: 'prompting',
    isUnlocked: false,
    requiredXp: 200,
  },
  {
    id: 'prompt_sniper',
    title: 'Снайпер точности (90+)',
    description: 'Получи от робота Байта наивысшую оценку 90+ баллов за составленный промпт.',
    icon: 'Target',
    category: 'prompting',
    isUnlocked: false,
    requiredXp: 350,
  },
  {
    id: 'code_pioneer',
    title: 'Повелитель кода',
    description: 'Запусти и протестируй работающий скрипт или физическую симуляцию в песочнице.',
    icon: 'Code2',
    category: 'coding',
    isUnlocked: false,
    requiredXp: 450,
  },
  {
    id: 'sochi_explorer',
    title: 'Черноморский исследователь',
    description: 'Выполни сочинский квест по спасению датчиков метеостанции или батискафа СЮТ.',
    icon: 'Compass',
    category: 'quests',
    isUnlocked: false,
    requiredXp: 600,
  },
  {
    id: 'ai_ethics',
    title: 'Страж кибербезопасности',
    description: 'Изучи методы борьбы с галлюцинациями и подпиши Кодекс чести юного инженера.',
    icon: 'ShieldCheck',
    category: 'learning',
    isUnlocked: false,
    requiredXp: 750,
  },
  {
    id: 'mentor_friend',
    title: 'Друг робота Байта',
    description: 'Задай не менее 3 интересных технических вопросов нашему ИИ-наставнику.',
    icon: 'Bot',
    category: 'learning',
    isUnlocked: false,
    requiredXp: 500,
  },
  {
    id: 'grandmaster',
    title: 'Магистр ИИ СЮТ Сочи',
    description: 'Набери более 1000 очков Techno-XP и получи персональный квалификационный диплом.',
    icon: 'Award',
    category: 'learning',
    isUnlocked: false,
    requiredXp: 1000,
  }
];

export const LEVEL_TIERS = [
  { level: 1, minXp: 0, maxXp: 250, title: 'Юный испытатель' },
  { level: 2, minXp: 251, maxXp: 600, title: 'Оператор алгоритмов' },
  { level: 3, minXp: 601, maxXp: 1100, title: 'Младший промпт-инженер' },
  { level: 4, minXp: 1101, maxXp: 1800, title: 'Архитектор нейросетей СЮТ' },
  { level: 5, minXp: 1801, maxXp: 3000, title: 'Магистр ИИ СЮТ Сочи' },
];

export function calculateLevel(xp: number) {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      return LEVEL_TIERS[i];
    }
  }
  return LEVEL_TIERS[0];
}
