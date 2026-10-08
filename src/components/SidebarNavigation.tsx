import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  BookOpen,
  Sparkles,
  Terminal,
  Compass,
  Trophy,
  Award,
  FileText,
  Zap,
  LogOut,
  Home,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Shield,
  Layers,
  Cpu,
  UserCheck,
  Palette,
  MessageSquare,
  Brain
} from 'lucide-react';

export type AppTab = 'spatial' | 'lessons' | 'lab' | 'playground' | 'quests' | 'leaderboard' | 'chat';

export interface SidebarNavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  profile: StudentProfile;
  totalLessons?: number;
  totalQuests?: number;
  studentRank?: number;
  totalStudents?: number;
  onOpenAchievements: () => void;
  onOpenCertificate: () => void;
  onOpenCustomization?: () => void;
  onOpenFeedback?: () => void;
  onLogout: () => void;
  onNavigateToLanding?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  setActiveTab,
  profile,
  totalLessons = 10,
  totalQuests = 6,
  studentRank = 1,
  totalStudents = 12,
  onOpenAchievements,
  onOpenCertificate,
  onOpenCustomization,
  onOpenFeedback,
  onLogout,
  onNavigateToLanding,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tokenMax = 5000;
  const tokenPercent = Math.min(100, Math.max(5, Math.round((profile.tokenBalance / tokenMax) * 100)));
  const completedLessons = profile.completedLessonIds.length;
  const completedQuests = profile.completedQuestIds.length;

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navGroups = [
    {
      groupTitle: 'ИИ-Оркестрация & Холст',
      items: [
        {
          id: 'spatial' as AppTab,
          label: 'ИИ-Оркестратор',
          subtitle: 'Пространственный граф & UX',
          icon: <Brain className="w-4 h-4 shrink-0 text-cyan-400" />,
          badge: '2D/Spatial',
          badgeColor: 'text-cyan-400 bg-cyan-950/60',
        },
      ],
    },
    {
      groupTitle: 'Обучающий трек',
      items: [
        {
          id: 'lessons' as AppTab,
          label: 'Уроки и концепты',
          subtitle: 'Архитектура ИИ и тренажеры',
          icon: <BookOpen className="w-4 h-4 shrink-0" />,
          badge: `${completedLessons}/${totalLessons}`,
          badgeColor: completedLessons === totalLessons ? 'text-emerald-400 bg-emerald-950/60' : 'text-cyan-400 bg-cyan-950/60',
        },
        {
          id: 'lab' as AppTab,
          label: 'ИИ-Лаборатория',
          subtitle: 'Верстак, BPE, RCIO-матрица',
          icon: <Sparkles className="w-4 h-4 shrink-0" />,
          badge: '4 стенда',
          badgeColor: 'text-purple-400 bg-purple-950/60',
        },
        {
          id: 'playground' as AppTab,
          label: 'Песочница кода',
          subtitle: '5 программных эмуляторов',
          icon: <Terminal className="w-4 h-4 shrink-0" />,
          badge: 'Canvas 2D',
          badgeColor: 'text-emerald-400 bg-emerald-950/60',
        },
      ],
    },
    {
      groupTitle: 'Практика и рейтинг',
      items: [
        {
          id: 'quests' as AppTab,
          label: 'Спецмиссии Сочи',
          subtitle: 'Черноморские спецзадания',
          icon: <Compass className="w-4 h-4 shrink-0" />,
          badge: `${completedQuests}/${totalQuests}`,
          badgeColor: completedQuests > 0 ? 'text-amber-400 bg-amber-950/60' : 'text-slate-400 bg-slate-900',
        },
        {
          id: 'leaderboard' as AppTab,
          label: 'Табель почета',
          subtitle: 'Рейтинг изобретателей СЮТ',
          icon: <Trophy className="w-4 h-4 shrink-0" />,
          badge: `#${studentRank} из ${totalStudents}`,
          badgeColor: 'text-amber-400 bg-amber-950/60',
        },
        {
          id: 'chat' as AppTab,
          label: 'Инженерный чат',
          subtitle: 'Связь 15 учеников СЮТ',
          icon: <MessageSquare className="w-4 h-4 shrink-0" />,
          badge: 'Online',
          badgeColor: 'text-emerald-400 bg-emerald-950/60',
        },
      ],
    },
  ];

  return (
    <>
      {/* 1. MOBILE TOP HEADER (shown only on small screens < lg) */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl px-4 h-16 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Открыть навигацию"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm">
              ⚡
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">СЮТ Сочи</div>
              <div className="text-[10px] text-cyan-400 font-mono -mt-0.5">@{profile.callsign}</div>
            </div>
          </div>
        </div>

        {/* Quick battery & profile trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span className="tabular-nums font-bold">{profile.tokenBalance}</span>
          </div>

          <button
            onClick={onOpenAchievements}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-base"
            title="Достижения"
          >
            {profile.avatar}
          </button>
        </div>
      </div>

      {/* 2. MOBILE DRAWER BACKDROP & SLIDE-OVER */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black">
                  ⚡
                </div>
                <div>
                  <div className="text-sm font-bold text-white">СЮТ Сочи</div>
                  <div className="text-[10px] text-slate-400 font-mono">Навигация по модулям</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Scrollable Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 font-semibold">
                    {group.groupTitle}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/5 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Certification & Rewards Section */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 font-semibold">
                  Аттестация и документы
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenAchievements();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Мои достижения</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      {profile.unlockedAchievementIds.length} бейджей
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenCertificate();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Именной аттестат</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      СЮТ Сочи
                    </span>
                  </button>

                  {onOpenCustomization && (
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        onOpenCustomization();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:bg-slate-900 hover:text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Palette className="w-4 h-4 text-purple-400" />
                        <span>Студия кастомизации</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                        Стили & Скины
                      </span>
                    </button>
                  )}

                  {onOpenFeedback && (
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        onOpenFeedback();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-slate-900 hover:text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span>Обратная связь & Поддержка</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        Тестеры
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Footer with profile and actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{profile.avatar}</span>
                    <div>
                      <div className="font-bold text-white leading-tight">{profile.name}</div>
                      <div className="text-[11px] font-mono text-cyan-400">@{profile.callsign}</div>
                    </div>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">{profile.xp} XP</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Токены: {profile.tokenBalance}</span>
                  </span>
                  <span>{tokenPercent}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToLanding && (
                  <button
                    onClick={onNavigateToLanding}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Главная</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 hover:border-rose-800/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DESKTOP VERTICAL SIDEBAR (sticky on desktop >= lg) */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl z-30 transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-cyan-500/20 shrink-0">
                ⚡
              </div>
              <div className="truncate">
                <div className="text-sm font-extrabold text-white tracking-tight leading-tight flex items-center gap-1.5">
                  <span>СЮТ Сочи</span>
                  <span className="text-slate-600 font-light">/</span>
                  <span className="text-cyan-400 text-xs font-normal">ИИ</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  Кабинет: @{profile.callsign}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-cyan-500/20">
              ⚡
            </div>
          )}

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              {!isCollapsed && (
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 font-semibold flex items-center justify-between">
                  <span>{group.groupTitle}</span>
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full text-left rounded-xl transition-all cursor-pointer relative group ${
                        isCollapsed ? 'p-2.5 flex justify-center' : 'px-3 py-2.5 flex items-center justify-between'
                      } ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold border border-slate-700/80 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                      title={isCollapsed ? `${item.label} (${item.subtitle})` : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r" />
                      )}

                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <div className="truncate">
                            <div className="text-xs tracking-tight truncate leading-tight">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        )}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/5 shrink-0 ml-1.5 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Credentials and Rewards Section */}
          <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
            {!isCollapsed && (
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 font-semibold">
                Аттестация
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={onOpenAchievements}
                className={`w-full text-left rounded-xl transition-all cursor-pointer text-slate-400 hover:text-amber-300 hover:bg-slate-900/60 ${
                  isCollapsed ? 'p-2.5 flex justify-center' : 'px-3 py-2.5 flex items-center justify-between'
                }`}
                title="Достижения и бейджи"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  {!isCollapsed && (
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-300 truncate">Мои достижения</div>
                      <div className="text-[10px] text-slate-500">Уровень и бейджи</div>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {profile.unlockedAchievementIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenCertificate}
                className={`w-full text-left rounded-xl transition-all cursor-pointer text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 ${
                  isCollapsed ? 'p-2.5 flex justify-center' : 'px-3 py-2.5 flex items-center justify-between'
                }`}
                title="Именной сертификат инженера СЮТ"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  {!isCollapsed && (
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-300 truncate">Именной аттестат</div>
                      <div className="text-[10px] text-slate-500">Сертификация СЮТ</div>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    2026
                  </span>
                )}
              </button>

              {onOpenCustomization && (
                <button
                  onClick={onOpenCustomization}
                  className={`w-full text-left rounded-xl transition-all cursor-pointer text-slate-400 hover:text-purple-300 hover:bg-slate-900/60 ${
                    isCollapsed ? 'p-2.5 flex justify-center' : 'px-3 py-2.5 flex items-center justify-between'
                  }`}
                  title="Студия кастомизации интерфейса и стилей"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Palette className="w-4 h-4 text-purple-400 shrink-0" />
                    {!isCollapsed && (
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-300 truncate">Студия стилей</div>
                        <div className="text-[10px] text-slate-500">Темы и скины Байта</div>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                      Стили
                    </span>
                  )}
                </button>
              )}

              {onOpenFeedback && (
                <button
                  onClick={onOpenFeedback}
                  className={`w-full text-left rounded-xl transition-all cursor-pointer text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 ${
                    isCollapsed ? 'p-2.5 flex justify-center' : 'px-3 py-2.5 flex items-center justify-between'
                  }`}
                  title="Окно обратной связи и техподдержки"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    {!isCollapsed && (
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-300 truncate">Обратная связь</div>
                        <div className="text-[10px] text-slate-500">Баги и предложения</div>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      Поддержка
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Student Profile & Token Gauge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0 space-y-2.5">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              {/* Profile Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-2xl p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
                    {profile.avatar}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate leading-tight">
                      {profile.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Ур. {profile.level} · {profile.levelTitle.split(' ')[0]}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                    {profile.xp}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">XP</div>
                </div>
              </div>

              {/* Token Battery Gauge */}
              <div className="space-y-1 pt-1.5 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Токены СЮТ:</span>
                  </span>
                  <span className="text-amber-400 font-bold tabular-nums">
                    {profile.tokenBalance} <span className="text-slate-500 font-normal">({tokenPercent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${tokenPercent}%` }}
                  />
                </div>
              </div>

              {/* Bottom Quick Actions Row */}
              <div className="flex items-center gap-1.5 pt-1">
                {onNavigateToLanding && (
                  <button
                    onClick={onNavigateToLanding}
                    className="flex-1 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 border border-slate-800 transition-colors"
                    title="Вернуться на промо-лендинг"
                  >
                    <Home className="w-3 h-3" />
                    <span>Лендинг</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="flex-1 py-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-[11px] font-medium flex items-center justify-center gap-1 border border-slate-800 hover:border-rose-900/50 transition-colors"
                  title="Выйти из личного кабинета"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Выход</span>
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed Footer */
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={onOpenAchievements}
                className="text-xl p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                title={`${profile.name} (@${profile.callsign}) - ${profile.xp} XP`}
              >
                {profile.avatar}
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                title="Выход из кабинета"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
