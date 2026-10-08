import React, { useState } from 'react';
import { LeaderboardEntry, StudentProfile } from '../types';
import { Trophy, Medal, Award, Search, Users, ChevronUp, Sparkles } from 'lucide-react';

interface LeaderboardSectionProps {
  entries?: LeaderboardEntry[];
  students?: StudentProfile[];
  currentStudentId?: string;
  currentUserXp?: number;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  entries: propEntries,
  students,
  currentStudentId,
  currentUserXp,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('Все');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // If students array is passed, convert to LeaderboardEntry array
  const sourceEntries: LeaderboardEntry[] = students && students.length > 0
    ? students.map((s) => ({
        id: s.id,
        rank: 1,
        name: s.name,
        callsign: s.callsign,
        avatar: s.avatar,
        department: s.department,
        xp: s.xp,
        level: s.level,
        levelTitle: s.levelTitle,
        badgesCount: s.unlockedAchievementIds.length,
        isCurrentUser: s.id === currentStudentId,
      }))
    : (propEntries || []).map((e) => (currentUserXp !== undefined && e.isCurrentUser ? { ...e, xp: currentUserXp } : e));

  // Sort and re-rank entries
  const updatedEntries = [...sourceEntries]
    .sort((a, b) => b.xp - a.xp)
    .map((e, index) => ({ ...e, rank: index + 1 }));

  const departments = ['Все', 'Робототехника', 'Программирование', 'IT & ИИ', 'Аэроклуб', 'Судомоделирование'];

  const filteredEntries = updatedEntries.filter((item) => {
    const matchesDept = selectedDept === 'Все' || item.department === selectedDept;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.callsign.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const currentUser = updatedEntries.find((e) => e.isCurrentUser);
  const nextUserAhead = currentUser && currentUser.rank > 1 ? updatedEntries[currentUser.rank - 2] : null;
  const xpToNextRank = nextUserAhead && currentUser ? nextUserAhead.xp - currentUser.xp + 1 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <span>Табель почета изобретателей СЮТ</span>
            <span aria-hidden="true">·</span>
            <span>Сезон 2026</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Рейтинг юных инженеров и программистов Сочи
          </h1>
        </div>

        {/* Current user quick standing */}
        {currentUser && (
          <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/40 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="text-2xl">{currentUser.avatar}</div>
            <div className="text-xs">
              <div className="text-slate-400">Твое место в рейтинге:</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                <span className="text-cyan-400">#{currentUser.rank}</span>
                <span className="text-slate-400 font-normal">из {updatedEntries.length}</span>
                <span className="text-amber-400 font-semibold tabular-nums ml-2">
                  {currentUser.xp} XP
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Motivational Callout if behind someone */}
      {nextUserAhead && xpToNextRank > 0 && (
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              До #{nextUserAhead.rank} места ({nextUserAhead.callsign}) осталось всего{' '}
              <strong className="text-cyan-300 font-mono tabular-nums">{xpToNextRank} XP</strong>! Пройди урок или квест!
            </span>
          </div>
        </div>
      )}

      {/* Controls Bar: Department tabs, Timeframe & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Department filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search & Timeframe */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск ученика..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                timeframe === 'week' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                timeframe === 'month' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                timeframe === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Всё время
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700 font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Ранг</th>
                <th className="py-3.5 px-4">Ученик СЮТ</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Направление</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Квалификация</th>
                <th className="py-3.5 px-4 text-center">Значки</th>
                <th className="py-3.5 px-4 text-right">Опыт (XP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEntries.map((student) => {
                const isCurrentUser = student.isCurrentUser;
                const isTop3 = student.rank <= 3;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-cyan-950/40 hover:bg-cyan-900/40 font-medium'
                        : 'hover:bg-slate-700/30'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {student.rank === 1 && <span className="text-amber-400 text-base">🥇</span>}
                      {student.rank === 2 && <span className="text-slate-300 text-base">🥈</span>}
                      {student.rank === 3 && <span className="text-amber-600 text-base">🥉</span>}
                      {student.rank > 3 && (
                        <span className="text-slate-400 tabular-nums">#{student.rank}</span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0 p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                          {student.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                              {student.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono">
                                ВЫ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            @{student.callsign}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className="text-slate-300">{student.department}</span>
                    </td>

                    {/* Level Title */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/70 text-slate-300 text-[11px]">
                        Ур. {student.level} · {student.levelTitle}
                      </span>
                    </td>

                    {/* Badges count */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span className="tabular-nums font-semibold">{student.badgesCount}</span>
                      </span>
                    </td>

                    {/* XP Score */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className="text-amber-400 text-sm tabular-nums">
                        {student.xp}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 font-normal">XP</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
