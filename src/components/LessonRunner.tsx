import React, { useState } from 'react';
import { Lesson } from '../types';
import { TokenVisualizer } from './widgets/TokenVisualizer';
import { NeuralWeightSim } from './widgets/NeuralWeightSim';
import { PromptBreakdownWidget } from './widgets/PromptBreakdownWidget';
import { BiasCheckerWidget } from './widgets/BiasCheckerWidget';
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface LessonRunnerProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (earnedXp: number) => void;
  isAlreadyCompleted: boolean;
  onEarnXp?: (amount: number, reason?: string) => void;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({
  lesson,
  onBack,
  onComplete,
  isAlreadyCompleted,
  onEarnXp,
}) => {
  const [currentStep, setCurrentStep] = useState<'theory' | 'quiz' | 'practice'>('theory');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Practical task state
  const [promptInput, setPromptInput] = useState(lesson.practicalTask?.starterPrompt || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    suggestions: string[];
    xp: number;
  } | null>(null);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    lesson.quiz.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selected);
      if (opt?.isCorrect) correct++;
    });
    return {
      correct,
      total: lesson.quiz.length,
      isPerfect: correct === lesson.quiz.length,
    };
  };

  const handleEvaluatePractice = async () => {
    if (!lesson.practicalTask) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/ai/eval-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle: lesson.practicalTask.title,
          promptText: promptInput,
          targetGoal: lesson.practicalTask.targetGoal,
        }),
      });
      const data = await res.json();
      setEvalResult({
        score: data.score || 85,
        feedback: data.feedback || 'Отличная инженерная формулировка!',
        strengths: data.strengths || ['Четкая структура'],
        suggestions: data.suggestions || ['Продолжай экспериментировать с форматами'],
        xp: data.xp || lesson.practicalTask.xpReward,
      });
    } catch (err) {
      // Fallback
      setEvalResult({
        score: 85,
        feedback: 'Хорошо структурированный запрос! Задача понятна модели.',
        strengths: ['Конкретная цель'],
        suggestions: ['Укажи точный лимит строк'],
        xp: lesson.practicalTask.xpReward,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFinishLesson = () => {
    const quizScore = calculateQuizScore();
    const quizRatio = quizScore.total > 0 ? quizScore.correct / quizScore.total : 1;

    let earned = 0;
    if (lesson.practicalTask) {
      const quizPart = Math.round(quizRatio * (lesson.xpReward * 0.5));
      const practicePart = evalResult ? evalResult.xp : Math.round(lesson.xpReward * 0.5);
      earned = quizPart + practicePart;
    } else {
      earned = Math.max(30, Math.round(quizRatio * lesson.xpReward));
    }

    const totalEarned = isAlreadyCompleted ? 0 : Math.max(20, earned);
    onComplete(totalEarned);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top Bar for Lesson */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>К списку уроков</span>
        </button>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">{lesson.estimatedMinutes} мин</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-mono font-medium">+{lesson.xpReward} XP</span>
          {isAlreadyCompleted && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Пройден
            </span>
          )}
        </div>
      </div>

      {/* Lesson Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
          {lesson.title}
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          {lesson.subtitle}
        </p>
      </div>

      {/* Step Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60 mb-6">
        <button
          onClick={() => setCurrentStep('theory')}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
            currentStep === 'theory'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          1. Теория и симуляторы
        </button>
        <button
          onClick={() => setCurrentStep('quiz')}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
            currentStep === 'quiz'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          2. Блиц-тест ({lesson.quiz.length} вопр.)
        </button>
        {lesson.practicalTask && (
          <button
            onClick={() => setCurrentStep('practice')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
              currentStep === 'practice'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            3. Практика с ИИ
          </button>
        )}
      </div>

      {/* STEP 1: THEORY */}
      {currentStep === 'theory' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">
              {lesson.theoryContent.heading}
            </h2>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              {lesson.theoryContent.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Code snippet if any */}
            {lesson.theoryContent.codeSnippet && (
              <div className="my-5 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950">
                <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  Пример кода
                </div>
                <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                  {lesson.theoryContent.codeSnippet}
                </pre>
              </div>
            )}

            {/* Interactive Widget attached to theory */}
            {lesson.theoryContent.interactiveWidgetType === 'tokens' && <TokenVisualizer onEarnXp={onEarnXp} />}
            {lesson.theoryContent.interactiveWidgetType === 'neural_weights' && <NeuralWeightSim onEarnXp={onEarnXp} />}
            {lesson.theoryContent.interactiveWidgetType === 'prompt_breakdown' && <PromptBreakdownWidget onEarnXp={onEarnXp} />}
            {lesson.theoryContent.interactiveWidgetType === 'bias_checker' && <BiasCheckerWidget onEarnXp={onEarnXp} />}

            {/* Key takeaway */}
            <div className="mt-6 p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
                  Главный инженерный вывод:
                </div>
                <div className="text-xs text-slate-200">
                  {lesson.theoryContent.keyTakeaway}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep('quiz')}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>Перейти к блиц-тесту</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: QUIZ */}
      {currentStep === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-2">
              Проверка понимания материала
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Выбери правильные варианты ответов. За каждый верный ответ начисляются баллы в рейтинг!
            </p>

            <div className="space-y-6">
              {lesson.quiz.map((q, qIndex) => {
                const selectedOptId = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="p-4 bg-slate-900/60 rounded-lg border border-slate-700/60">
                    <div className="text-sm font-semibold text-white mb-3 flex items-start gap-2">
                      <span className="text-cyan-400 font-mono">{qIndex + 1}.</span>
                      <span>{q.question}</span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {q.options.map((opt) => {
                        const isChosen = selectedOptId === opt.id;
                        let optionStyle = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500';

                        if (quizSubmitted) {
                          if (opt.isCorrect) {
                            optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-medium';
                          } else if (isChosen && !opt.isCorrect) {
                            optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                          } else {
                            optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-500';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-medium';
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(q.id, opt.id)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt.text}</span>
                            {quizSubmitted && opt.isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                            {quizSubmitted && isChosen && !opt.isCorrect && (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && selectedOptId && (
                      <div className="text-xs mt-2 p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {q.options.find((o) => o.id === selectedOptId)?.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-700/60 pt-4">
              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Проверить ответы
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-300">
                    Правильно: <strong className="text-emerald-400 tabular-nums">{calculateQuizScore().correct}</strong> из {lesson.quiz.length}
                  </div>
                </div>
              )}

              {quizSubmitted && (
                lesson.practicalTask ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFinishLesson}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      title={isAlreadyCompleted ? "Урок уже завершен ранее" : "Завершить урок на основе результатов теста"}
                    >
                      {isAlreadyCompleted ? 'Завершить повторение (без XP)' : 'Завершить сейчас (+XP)'}
                    </button>
                    <button
                      onClick={() => setCurrentStep('practice')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <span>К практическому заданию</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleFinishLesson}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{isAlreadyCompleted ? 'Завершить повторение' : 'Завершить урок и забрать XP!'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PRACTICE */}
      {currentStep === 'practice' && lesson.practicalTask && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">
                {lesson.practicalTask.title}
              </h2>
              <span className="text-xs font-mono text-amber-400 font-medium">
                +{lesson.practicalTask.xpReward} XP
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              {lesson.practicalTask.description}
            </p>
            <div className="text-xs text-cyan-400 font-medium mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Цель: {lesson.practicalTask.targetGoal}</span>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">
                Твой промпт для ИИ-лаборатории СЮТ:
              </label>
              <textarea
                rows={5}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                placeholder="Составь свой инженерный промпт..."
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                <span>Рекомендуемые ключевые слова:</span>
                {lesson.practicalTask.expectedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className={`font-mono px-1.5 py-0.5 rounded ${
                      promptInput.toLowerCase().includes(kw.toLowerCase())
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {kw}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFinishLesson}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  title="Завершить урок с текущим решением"
                >
                  Завершить без ИИ-оценки (+XP)
                </button>
                <button
                  onClick={handleEvaluatePractice}
                  disabled={isEvaluating || promptInput.trim().length < 15}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isEvaluating ? (
                    <span>Анализ нейросетью...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Оценить промпт</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {evalResult && (
              <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-300">
                    Вердикт робота Байта:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Оценка:</span>
                    <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">
                      {evalResult.score} / 100
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-semibold">
                      +{evalResult.xp} XP
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded border border-slate-800">
                  {evalResult.feedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded">
                    <div className="font-semibold text-emerald-400 mb-1">Сильные стороны:</div>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {evalResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded">
                    <div className="font-semibold text-amber-400 mb-1">Советы инженеру:</div>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {evalResult.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleFinishLesson}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <span>{isAlreadyCompleted ? 'Завершить повторение' : 'Завершить урок и получить опыт'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
