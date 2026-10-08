import React, { useState } from 'react';
import { QUESTS } from '../data/questsData';
import { Quest } from '../types';
import {
  Compass,
  CheckCircle2,
  ChevronRight,
  Award,
  MapPin,
  Sparkles,
  Send,
  ArrowLeft,
  Shield,
  Zap,
  Target,
  Radar
} from 'lucide-react';

interface QuestsSectionProps {
  quests?: Quest[];
  completedQuestIds: string[];
  onCompleteQuest: (earnedXp: number, questId: string) => void;
  onUnlockAchievement: (achievementId: string) => void;
  onEarnXp?: (amount: number, reason?: string) => void;
}

export const QuestsSection: React.FC<QuestsSectionProps> = ({
  quests: propQuests,
  completedQuestIds,
  onCompleteQuest,
  onUnlockAchievement,
  onEarnXp,
}) => {
  const questsList = propQuests && propQuests.length > 0 ? propQuests : QUESTS;
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const [promptInput, setPromptInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedQuestIds, setAttemptedQuestIds] = useState<string[]>([]);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    score: number;
    feedback: string;
    xp: number;
    passed: boolean;
  } | null>(null);

  const handleStartQuest = (quest: Quest) => {
    setActiveQuest(quest);
    setPromptInput(quest.sampleStarter);
    setSubmissionFeedback(null);
  };

  const handleSubmitSolution = async () => {
    if (!activeQuest || !promptInput.trim()) return;
    setIsSubmitting(true);
    const isAlreadyDone = completedQuestIds.includes(activeQuest.id);

    try {
      const res = await fetch('/api/ai/eval-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle: activeQuest.title,
          promptText: promptInput,
          targetGoal: activeQuest.targetObjective,
        }),
      });
      const data = await res.json();
      const score = data.score || 85;
      const passed = score >= 70;
      const xp = passed ? (isAlreadyDone ? 0 : activeQuest.xpReward) : 0;

      setSubmissionFeedback({
        score,
        feedback: data.feedback || (passed ? 'Инженерная директива безупречно выполнена!' : 'Промпт требует уточнения параметров.'),
        xp,
        passed,
      });

      if (passed) {
        if (!isAlreadyDone) {
          onCompleteQuest(xp, activeQuest.id);
          onUnlockAchievement('sochi_explorer');
        }
      } else if (onEarnXp && !isAlreadyDone && !attemptedQuestIds.includes(activeQuest.id)) {
        // Single first-attempt effort reward, no infinite spam on retries
        setAttemptedQuestIds((prev) => [...prev, activeQuest.id]);
        onEarnXp(10, 'Первая попытка решения спецмиссии СЮТ');
      }
    } catch (err) {
      const xp = isAlreadyDone ? 0 : activeQuest.xpReward;
      setSubmissionFeedback({
        score: 85,
        feedback: 'Отличная инженерная директива! Протокол связи успешно настроен в штабе.',
        xp,
        passed: true,
      });
      if (!isAlreadyDone) {
        onCompleteQuest(xp, activeQuest.id);
        onUnlockAchievement('sochi_explorer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuests = selectedDifficulty === 'all'
    ? questsList
    : questsList.filter((q) => q.difficulty === selectedDifficulty);

  const completedCount = questsList.filter((q) => completedQuestIds.includes(q.id)).length;

  if (activeQuest) {
    const isCompleted = completedQuestIds.includes(activeQuest.id);

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
        <button
          onClick={() => setActiveQuest(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>К списку спецмиссий</span>
        </button>

        {/* Mission Briefing Card */}
        <div className="bg-slate-900/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeQuest.location}</span>
            </div>

            <div className="flex items-center gap-2.5 font-mono text-xs">
              <span className="text-amber-400 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                +{activeQuest.xpReward} XP
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {activeQuest.difficulty}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1">
              ОПЕРАТИВНАЯ СВОДКА СЮТ
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mb-3">
              {activeQuest.title}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 italic">
              «{activeQuest.briefing}»
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Боевая задача юного инженера:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {activeQuest.targetObjective}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Критерии аттестации (Рубрика проверки):
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {activeQuest.rubric.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Input */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
              Твое решение (Инженерный промпт для системы):
            </label>
            <textarea
              rows={6}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              placeholder="Сформулируй свой промпт для выполнения миссии..."
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting || promptInput.trim().length < 15}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/15"
              >
                {isSubmitting ? (
                  <span>Экспертиза штаба СЮТ...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Сдать миссию на проверку</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Card */}
          {submissionFeedback && (
            <div className={`p-4 rounded-2xl border animate-fadeIn space-y-2 ${
              submissionFeedback.passed
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wide">
                  {submissionFeedback.passed ? '🎉 МИССИЯ ВЫПОЛНЕНА УСПЕШНО!' : '⚠️ ТРЕБУЕТСЯ КОРРЕКТИРОВКА'}
                </span>
                <span className="font-mono text-xs font-bold">
                  Балл: {submissionFeedback.score} / 100 {submissionFeedback.passed && `(+${submissionFeedback.xp} XP)`}
                </span>
              </div>
              <p className="text-xs leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 font-mono">
                {submissionFeedback.feedback}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
            <Radar className="w-4 h-4 animate-spin text-amber-400" />
            <span>ШТАБ СПЕЦИАЛЬНЫХ ОПЕРАЦИЙ СЮТ СОЧИ</span>
            <span aria-hidden="true">·</span>
            <span>2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Прикладные инженерные спецквесты
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Реальные сценарии Большого Сочи: гидроакустический мониторинг дельфинов Черного моря, навигация дронов на башне Ахун, оцифровка флоры Дендрария и спасение телеметрии в Кавказском биосферном заповеднике.
          </p>

          <div className="pt-2 flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">
              Сдано миссий: <strong className="text-amber-400">{completedCount}</strong> из {questsList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {['all', 'Легкий', 'Средний', 'Сложный', 'Продвинутый'].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              selectedDifficulty === diff
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {diff === 'all' ? `Все спецмиссии (${questsList.length})` : diff}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuests.map((quest) => {
          const isDone = completedQuestIds.includes(quest.id);

          return (
            <div
              key={quest.id}
              onClick={() => handleStartQuest(quest)}
              className={`group rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-amber-500/5'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{quest.location}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                      +{quest.xpReward} XP
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {quest.difficulty}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {quest.briefing}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs mt-4">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Target className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] truncate max-w-[180px]">{quest.targetObjective}</span>
                </div>

                <div className="flex items-center gap-1 font-bold font-mono">
                  {isDone ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>СДАНА</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 group-hover:underline text-[11px]">
                      Принять миссию →
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
