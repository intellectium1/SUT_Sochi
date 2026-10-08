import React from 'react';
import { StudentProfile } from '../types';
import { FileText, Zap, LogOut, Home, Award, ChevronRight } from 'lucide-react';

export type AppTab = 'lessons' | 'lab' | 'playground' | 'quests' | 'leaderboard';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  profile: StudentProfile;
  onOpenAchievements: () => void;
  onOpenCertificate: () => void;
  onLogout: () => void;
  onNavigateToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenAchievements,
  onOpenCertificate,
  onLogout,
  onNavigateToLanding,
}) => {
  const tokenMax = 5000;
  const tokenPercent = Math.min(100, Math.max(5, Math.round((profile.tokenBalance / tokenMax) * 100)));

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Student Callsign */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('lessons')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap flex items-center gap-2">
                <span>СЮТ Сочи</span>
                <span className="text-slate-600 font-light hidden sm:inline">/</span>
                <span className="text-cyan-400 hidden sm:inline">ИИ-Академия</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono -mt-0.5">
                Кабинет: @{profile.callsign}
              </div>
            </div>
          </button>
        </div>

        {/* Clean Segmented Navigation Links strictly for student */}
        <nav className="hidden lg:flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/60'
                : 'hover:text-white'
            }`}
          >
            Уроки и концепты
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lab'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/60'
                : 'hover:text-white'
            }`}
          >
            Лаборатория промптов
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'playground'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/60'
                : 'hover:text-white'
            }`}
          >
            Песочница кода
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/60'
                : 'hover:text-white'
            }`}
          >
            Спецквесты
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700/60'
                : 'hover:text-white'
            }`}
          >
            Табель почета
          </button>
        </nav>

        {/* Right Action Tools: Token Battery, Level Badge, Certificate, Logout */}
        <div className="flex items-center gap-2.5">
          {/* High-tech Token Battery Gauge */}
          <div
            className="hidden sm:flex flex-col justify-center px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono"
            title={`Баланс вычислительных токенов: ${profile.tokenBalance} из ${tokenMax}`}
          >
            <div className="flex items-center justify-between gap-2 text-[10px] text-amber-400 font-bold leading-tight">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-400" />
                <span>{profile.tokenBalance}</span>
              </span>
              <span className="text-slate-500 font-normal">{tokenPercent}%</span>
            </div>
            <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${tokenPercent}%` }}
              />
            </div>
          </div>

          {/* Active Student Level & Profile Trigger */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            title="Открыть достижения, уровень и табель почета"
          >
            <span className="text-lg p-1 bg-slate-950 rounded-lg border border-slate-800 leading-none">
              {profile.avatar}
            </span>
            <div className="text-left hidden md:block">
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[85px] leading-tight">
                Ур. {profile.level} · {profile.levelTitle.split(' ')[0]}
              </div>
              <div className="font-bold text-amber-400 font-mono leading-none tabular-nums text-xs">
                {profile.xp} XP
              </div>
            </div>
          </button>

          {/* Certificate Trigger */}
          <button
            onClick={onOpenCertificate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-cyan-500/10"
            title="Мой именной сертификат инженера СЮТ"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Сертификат</span>
          </button>

          {/* Landing Link */}
          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer text-xs"
              title="Перейти на главную страницу (лендинг)"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="text-[11px]">Лендинг</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer text-xs"
            title="Выйти из личного кабинета"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Выход</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-400 bg-slate-950/95 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-2.5 py-1 whitespace-nowrap rounded-lg ${
            activeTab === 'lessons' ? 'bg-slate-800 text-cyan-400 font-bold' : ''
          }`}
        >
          Уроки
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-2.5 py-1 whitespace-nowrap rounded-lg ${
            activeTab === 'lab' ? 'bg-slate-800 text-cyan-400 font-bold' : ''
          }`}
        >
          Лаборатория
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-2.5 py-1 whitespace-nowrap rounded-lg ${
            activeTab === 'playground' ? 'bg-slate-800 text-cyan-400 font-bold' : ''
          }`}
        >
          Песочница
        </button>
        <button
          onClick={() => setActiveTab('quests')}
          className={`px-2.5 py-1 whitespace-nowrap rounded-lg ${
            activeTab === 'quests' ? 'bg-slate-800 text-cyan-400 font-bold' : ''
          }`}
        >
          Квесты
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-2.5 py-1 whitespace-nowrap rounded-lg ${
            activeTab === 'leaderboard' ? 'bg-slate-800 text-cyan-400 font-bold' : ''
          }`}
        >
          Рейтинг
        </button>
      </div>
    </header>
  );
};
