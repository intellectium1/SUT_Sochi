import React, { useState } from 'react';
import { Achievement, StudentProfile } from '../types';
import { LEVEL_TIERS, calculateLevel } from '../data/achievementsData';
import { X, Award, Zap, Sliders, Target, Code2, Compass, ShieldCheck, Bot, Lock, CheckCircle2 } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  profile: StudentProfile;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  profile,
}) => {
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  const currentTier = calculateLevel(profile.xp);
  const nextTier = LEVEL_TIERS.find((t) => t.level === currentTier.level + 1);

  const xpInTier = profile.xp - currentTier.minXp;
  const xpTierRange = nextTier ? nextTier.minXp - currentTier.minXp : 1000;
  const progressPercent = Math.min(100, Math.round((xpInTier / Math.max(1, xpTierRange)) * 100));

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-cyan-400" />;
      case 'Target': return <Target className="w-5 h-5 text-rose-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case 'Bot': return <Bot className="w-5 h-5 text-teal-400" />;
      case 'Award': return <Award className="w-5 h-5 text-yellow-400" />;
      default: return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const isBadgeUnlocked = (id: string, defUnlocked: boolean) => {
    return profile.unlockedAchievementIds ? profile.unlockedAchievementIds.includes(id) : defUnlocked;
  };

  const filteredAchievements = achievements.filter((a) => {
    const unlocked = isBadgeUnlocked(a.id, a.isUnlocked);
    if (filter === 'all') return true;
    if (filter === 'unlocked') return unlocked;
    if (filter === 'locked') return !unlocked;
    return a.category === filter;
  });

  const unlockedCount = achievements.filter((a) => isBadgeUnlocked(a.id, a.isUnlocked)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Зал достижений и квалификация инженера
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Level Status Card */}
          <div className="bg-gradient-to-br from-slate-850 to-slate-800 p-5 rounded-xl border border-slate-700/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{profile.avatar}</span>
                <div>
                  <div className="text-sm font-bold text-white">
                    {profile.name} (@{profile.callsign})
                  </div>
                  <div className="text-xs text-cyan-400 font-semibold">
                    Уровень {currentTier.level}: {currentTier.title}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                  {profile.xp} XP
                </div>
                <div className="text-[11px] text-slate-400">
                  {unlockedCount} из {achievements.length} значков
                </div>
              </div>
            </div>

            {/* Level XP Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Прогресс до {nextTier ? `Ур. ${nextTier.level} (${nextTier.title})` : 'Максимального ранга'}:</span>
                <span className="font-mono tabular-nums text-slate-300">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Все ({achievements.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'unlocked' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Открытые ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'locked' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              В процессе ({achievements.length - unlockedCount})
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredAchievements.map((badge) => {
              const isUnlocked = isBadgeUnlocked(badge.id, badge.isUnlocked);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'bg-slate-800/80 border-slate-700/80'
                      : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    isUnlocked
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-slate-950 border-slate-800'
                  }`}>
                    {isUnlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5 text-slate-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                        {badge.title}
                      </h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      {badge.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Требуется: {badge.requiredXp} XP</span>
                      {isUnlocked && <span className="text-emerald-400">ПОЛУЧЕНО</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
