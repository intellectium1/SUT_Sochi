import React, { useState } from 'react';
import { MODULES } from '../data/lessonsData';
import { Lesson } from '../types';
import { LessonRunner } from './LessonRunner';
import {
  CheckCircle2,
  Clock,
  Zap,
  Cpu,
  Terminal,
  Code,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Sparkles,
  Play
} from 'lucide-react';

interface LessonsSectionProps {
  completedLessonIds: string[];
  onLessonComplete: (earnedXp: number, lessonId: string) => void;
  onEarnXp?: (amount: number, reason?: string) => void;
}

export const LessonsSection: React.FC<LessonsSectionProps> = ({
  completedLessonIds,
  onLessonComplete,
  onEarnXp,
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-emerald-400" />;
      case 'Code': return <Code className="w-5 h-5 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      default: return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  const allLessons: Lesson[] = MODULES.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // Find next uncompleted lesson
  const nextLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0];

  const filteredModules = selectedFilter === 'all'
    ? MODULES
    : MODULES.filter((m) => m.id === selectedFilter);

  if (activeLesson) {
    return (
      <LessonRunner
        lesson={activeLesson}
        isAlreadyCompleted={completedLessonIds.includes(activeLesson.id)}
        onBack={() => setActiveLesson(null)}
        onEarnXp={onEarnXp}
        onComplete={(earnedXp) => {
          onLessonComplete(earnedXp, activeLesson.id);
          setActiveLesson(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Hero Banner with Next Recommended Lesson */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/50 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              <span>СЮТ СОЧИ</span>
              <span aria-hidden="true">·</span>
              <span>ПРОГРАММА ПОДГОТОВКИ ЮНЫХ ИНЖЕНЕРОВ</span>
              <span aria-hidden="true">·</span>
              <span>2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Интерактивные концепты и архитектура ИИ
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Пошаговый курс: от анатомии токенов и трансформеров до Few-Shot промптинга, микроконтроллеров и этики нейросетей. Каждый урок включает интерактивные симуляторы и проверочный квиз.
            </p>

            {/* Overall Progress Gauge */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Общий прогресс аттестации:</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {completedCount} из {totalLessons} уроков ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Launch Next Lesson Card */}
          {nextLesson && (
            <div className="lg:col-span-5">
              <div className="bg-slate-950/90 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-4 backdrop-blur-xl relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    РЕКОМЕНДОВАНО К ИЗУЧЕНИЮ
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    +{nextLesson.xpReward} XP
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {nextLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {nextLesson.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>~{nextLesson.estimatedMinutes} мин</span>
                  </div>

                  <button
                    onClick={() => setActiveLesson(nextLesson)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <span>Начать урок</span>
                    <Play className="w-3 h-3 fill-slate-950" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
            selectedFilter === 'all'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Все модули ({MODULES.length})
        </button>

        {MODULES.map((m) => {
          const isSelected = selectedFilter === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedFilter(m.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {m.title}
            </button>
          );
        })}
      </div>

      {/* 3. Modules List */}
      <div className="space-y-8">
        {filteredModules.map((module) => {
          const moduleCompletedCount = module.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const isModuleDone = moduleCompletedCount === module.lessons.length;

          return (
            <div key={module.id} className="space-y-4">
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                    {getModuleIcon(module.iconName)}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {module.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto text-xs font-mono">
                  <span className="text-slate-400">
                    {moduleCompletedCount} / {module.lessons.length} освоено
                  </span>
                  {isModuleDone && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>МОДУЛЬ ЗАВЕРШЕН</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {module.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`group relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                        isDone
                          ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
                          : 'border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-cyan-500/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {lesson.title}
                          </h3>
                          {isDone ? (
                            <span className="shrink-0 p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors">
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {lesson.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.estimatedMinutes} мин</span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Zap className="w-3.5 h-3.5" />
                            <span>+{lesson.xpReward} XP</span>
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-cyan-400 group-hover:underline">
                          {isDone ? 'Повторить' : 'Начать →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
