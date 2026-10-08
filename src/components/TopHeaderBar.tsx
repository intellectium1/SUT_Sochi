import React from 'react';
import { AppTab } from './SidebarNavigation';
import { StudentProfile } from '../types';
import {
  BookOpen,
  Sparkles,
  Terminal,
  Compass,
  Trophy,
  Zap,
  Home,
  ExternalLink,
  Shield,
  ArrowLeft,
  Palette,
  MessageSquare
} from 'lucide-react';

interface TopHeaderBarProps {
  activeTab: AppTab;
  profile: StudentProfile;
  isAdminInspecting?: boolean;
  onExitInspect?: () => void;
  onOpenAchievements?: () => void;
  onOpenCustomization?: () => void;
  onOpenFeedback?: () => void;
  onNavigateToLanding?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  activeTab,
  profile,
  isAdminInspecting,
  onExitInspect,
  onOpenAchievements,
  onOpenCustomization,
  onOpenFeedback,
  onNavigateToLanding,
}) => {
  const tabMetadata: Record<AppTab, { title: string; category: string; description: string; icon: React.ReactNode }> = {
    lessons: {
      category: 'Образовательный контур',
      title: 'Интерактивные концепты и архитектура ИИ',
      description: 'Пошаговый курс с интерактивными симуляторами, BPE-токенизацией и блиц-квизами',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
    },
    lab: {
      category: 'Образовательный контур',
      title: 'Лаборатория промпт-инжиниринга',
      description: 'Верстак тестирования, BPE-токенизатор, RCIO-матрица и детектор галлюцинаций',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
    playground: {
      category: 'Образовательный контур',
      title: 'Песочница кода и программные эмуляторы',
      description: 'Автономный катамаран, перцептрон, радар ESP32, полет БПЛА и L-система дендрария',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
    },
    quests: {
      category: 'Практика и соревнования',
      title: 'Спецмиссии юных инженеров г. Сочи',
      description: 'Оперативные задания штаба СЮТ: экологический патруль, дельфины и маяк Видный',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
    },
    leaderboard: {
      category: 'Практика и соревнования',
      title: 'Табель почета изобретателей СЮТ',
      description: 'Общий рейтинг учащихся по направлениям робототехники, IT и судомоделирования',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
    },
  };

  const currentMeta = tabMetadata[activeTab];

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
      {/* Mentor Inspection Alert if active */}
      {isAdminInspecting && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-amber-300 uppercase tracking-wide font-mono text-[11px]">Режим наставника:</strong> Инспекция личного кабинета ученика <strong className="text-white font-bold">{profile.name}</strong> (@{profile.callsign})
            </span>
          </div>
          {onExitInspect && (
            <button
              onClick={onExitInspect}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-xs shadow"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться в панель наставника</span>
            </button>
          )}
        </div>
      )}

      {/* Main Top Header Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb & Section indicator */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>СЮТ Сочи</span>
            <span aria-hidden="true">/</span>
            <span>{currentMeta.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-cyan-400 font-semibold">{currentMeta.title.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            {currentMeta.icon}
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              {currentMeta.title}
            </span>
          </div>
        </div>

        {/* Right Status Badges (Token Balance, Quick Profile) */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Quick Token pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-slate-400">Баланс:</span>
            <span className="font-bold text-amber-400 tabular-nums">{profile.tokenBalance}</span>
          </div>

          {/* Quick Profile trigger */}
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <span>{profile.avatar}</span>
              <span className="font-bold text-white">@{profile.callsign}</span>
              <span className="text-amber-400 tabular-nums">+{profile.xp} XP</span>
            </button>
          )}

          {/* Quick Customization Button */}
          {onOpenCustomization && (
            <button
              onClick={onOpenCustomization}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Открыть студию тем и кастомизации"
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Стили</span>
            </button>
          )}

          {/* Quick Feedback Button */}
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Окно обратной связи для поддержки и тестировщиков"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Поддержка</span>
            </button>
          )}

          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
              title="Перейти на промо-лендинг проекта"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Главная</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
