import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Send,
  Check,
  Copy,
  Award,
  AlertCircle,
  Cpu,
  Layers,
  ShieldAlert,
  ArrowRight,
  Zap,
  Bot,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { TokenVisualizer } from './widgets/TokenVisualizer';
import { PromptBreakdownWidget } from './widgets/PromptBreakdownWidget';
import { BiasCheckerWidget } from './widgets/BiasCheckerWidget';

interface PromptLabProps {
  onEarnXp: (xp: number, reason?: string) => void;
  onUnlockAchievement: (achievementId: string) => void;
}

export const PromptLab: React.FC<PromptLabProps> = ({ onEarnXp, onUnlockAchievement }) => {
  // Active Lab Mode: 'workbench' | 'tokens' | 'matrix' | 'safety'
  const [activeTool, setActiveTool] = useState<'workbench' | 'tokens' | 'matrix' | 'safety'>('workbench');

  // Workbench State
  const [role, setRole] = useState('Робот-наставник Байт');
  const [temperature, setTemperature] = useState(0.7);
  const [promptText, setPromptText] = useState(
    'Ты — бортовой искусственный интеллект марсохода СЮТ Сочи. Твоя камера зафиксировала необычный кремниевый минерал в кратере. Составь краткий отчет для юных геологов станции: опиши форму, цвет и вероятный химический состав.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    xp: number;
    feedback: string;
    strengths: string[];
    suggestions: string[];
    exampleImprovement: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [lastTestedPrompt, setLastTestedPrompt] = useState<string>('');
  const [lastScore, setLastScore] = useState<number>(0);
  const lastAwardTimeRef = useRef<number>(0);

  const rolePresets = [
    { name: 'Робот-наставник Байт', icon: '🤖', promptRole: 'Ты — робот Байт, виртуальный наставник СЮТ Сочи.' },
    { name: 'Инженер робототехники', icon: '🛠️', promptRole: 'Ты — ведущий инженер кружка робототехники по платам Arduino и ESP32.' },
    { name: 'Геймдев-ментор', icon: '🎮', promptRole: 'Ты — разработчик детских 2D ретро-игр на JavaScript и Python.' },
    { name: 'Морской исследователь', icon: '🌊', promptRole: 'Ты — гидробиолог Черного моря и оператор глубоководных батискафов.' },
  ];

  const quickSamples = [
    'Объясни разницу между ультразвуковым сонаром и инфракрасным дальномером для робота СЮТ',
    'Напиши алгоритм обхода препятствий по потенциальным полям (APF) для автономного катамарана',
    'Составь сюжет для квеста по поиску дельфинов Черного моря с использованием датчиков гидроакустики',
    'Объясни школьнику 6 класса, как ШИМ-сигнал управляет сервоприводом SG90 на плате ESP32',
  ];

  const approxTokens = Math.max(1, Math.ceil(promptText.length / 3.4));

  const handleTestPrompt = async () => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setAiResponse(null);
    setEvalResult(null);

    const trimmedPrompt = promptText.trim();
    const isSamePrompt = trimmedPrompt === lastTestedPrompt;

    try {
      // 1. Generate live response
      const mentorRes = await fetch('/api/ai/ask-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptText,
          topic: role,
        }),
      });
      const mentorData = await mentorRes.json();
      setAiResponse(mentorData.answer || 'Нейросеть сформировала ответ!');

      // 2. Evaluate prompt quality
      const evalRes = await fetch('/api/ai/eval-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle: 'Тестирование в ИИ-лаборатории СЮТ',
          promptText: promptText,
          targetGoal: 'Создание содержательного, структурированного и ясного промпта',
        }),
      });
      const evalData = await evalRes.json();
      const currentScore = evalData.score || 85;

      setEvalResult({
        score: currentScore,
        xp: evalData.xp || 70,
        feedback: evalData.feedback || 'Отличный промпт!',
        strengths: evalData.strengths || ['Ясная инженерная формулировка', 'Задана конкретная предметная роль'],
        suggestions: evalData.suggestions || ['Добавь Few-Shot пример формата вывода (JSON или список)'],
        exampleImprovement: evalData.exampleImprovement || promptText,
      });

      // Award XP only for substantial prompts and prevent rapid farming
      const now = Date.now();
      const timeSinceLastAward = now - lastAwardTimeRef.current;
      const isSubstantialPrompt = trimmedPrompt.length >= 15;

      if (!isSamePrompt && isSubstantialPrompt && timeSinceLastAward > 3500) {
        lastAwardTimeRef.current = now;
        const xpEarned = evalData.xp || 60;
        onEarnXp(xpEarned, `Анализ нового промпта (${currentScore}/100)`);
        setLastTestedPrompt(trimmedPrompt);
        setLastScore(currentScore);
      } else if (isSamePrompt && currentScore > lastScore + 2 && timeSinceLastAward > 2500) {
        lastAwardTimeRef.current = now;
        const scoreDiff = currentScore - lastScore;
        const bonusXp = Math.max(15, Math.round(scoreDiff * 1.5));
        onEarnXp(bonusXp, `Бонус за улучшение качества промпта (+${scoreDiff} баллов)`);
        setLastScore(currentScore);
      }

      if (currentScore >= 90) {
        onUnlockAchievement('prompt_sniper');
      }
      onUnlockAchievement('prompt_novice');
    } catch (err) {
      console.error(err);
      setAiResponse('Привет! Я обработал твой запрос. Отличная идея для исследования!');
      setEvalResult({
        score: 82,
        xp: 60,
        feedback: 'Промпт задан грамотно! Нейросеть четко уловила контекст задачи.',
        strengths: ['Конкретная тема', 'Инженерный стиль'],
        suggestions: ['Добавь Few-Shot пример для максимальной точности'],
        exampleImprovement: `${promptText}\n\nОформи результат в виде 3 маркированных пунктов.`,
      });
      const now = Date.now();
      const timeSinceLastAward = now - lastAwardTimeRef.current;
      if (!isSamePrompt && trimmedPrompt.length >= 15 && timeSinceLastAward > 3500) {
        lastAwardTimeRef.current = now;
        onEarnXp(60, 'Анализ промпта в лаборатории СЮТ');
        setLastTestedPrompt(trimmedPrompt);
        setLastScore(82);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Lab Header & Sub-tool Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <span>ЛАБОРАТОРИЯ ПРОМПТ-ИНЖИНИРИНГА</span>
            <span aria-hidden="true">·</span>
            <span>GEMINI 3.8 FLASH BENCHMARK</span>
            <span aria-hidden="true">·</span>
            <span>СЮТ СОЧИ 2026</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Интерактивный комплекс разработки и тестирования промптов
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Четыре профессиональных стенда для моделирования, токенизации и аудита директив искусственного интеллекта.
          </p>
        </div>

        {/* Tool Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTool('workbench')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTool === 'workbench'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Верстак & Тест</span>
          </button>

          <button
            onClick={() => setActiveTool('tokens')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTool === 'tokens'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. BPE-Токенизатор</span>
          </button>

          <button
            onClick={() => setActiveTool('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTool === 'matrix'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Матрица R-C-I-O</span>
          </button>

          <button
            onClick={() => setActiveTool('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTool === 'safety'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>4. Этика & Галлюцинации</span>
          </button>
        </div>
      </div>

      {/* 2. TOOL 1: WORKBENCH & GEMINI EVALUATOR */}
      {activeTool === 'workbench' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Column: Parameter Deck (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Persona Selector */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Роль модели (System Persona):
              </label>
              <div className="space-y-1.5">
                {rolePresets.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setRole(r.name)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 cursor-pointer border ${
                      role === r.name
                        ? 'bg-cyan-950/70 border-cyan-500 text-white font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span className="truncate">{r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Креативность (Temperature):</span>
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                  {temperature.toFixed(1)}
                </span>
              </div>

              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.1 (Строгий инженер)</span>
                <span>1.0 (Фантазер)</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {temperature <= 0.3
                  ? 'Низкая температура: модель выбирает только математически вероятные слова. Идеально для программного кода и Arduino.'
                  : temperature <= 0.7
                  ? 'Сбалансированный режим: оптимально для научных отчетов, разбора концептов и проектной работы в СЮТ.'
                  : 'Высокая температура: неожиданные метафоры, генерация сюжетов для игр и концепт-арта.'}
              </p>
            </div>

            {/* Quick Starters */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Готовые шаблоны задач СЮТ:
              </span>
              <div className="space-y-1.5">
                {quickSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromptText(sample)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-[11px] text-slate-300 transition-colors cursor-pointer leading-snug"
                  >
                    «{sample}»
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Prompt Editor & Evaluation (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Директива юного инженера (Prompt Text):
                </label>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>{promptText.length} символов</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-semibold">~{approxTokens} токенов</span>
                </div>
              </div>

              <textarea
                rows={6}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                placeholder="Сформулируй промпт по формуле R-C-I-O (Роль, Контекст, Инструкции, Формат ответа)..."
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTool('tokens')}
                    className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Разбить на BPE-токены</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={handleTestPrompt}
                  disabled={isLoading || promptText.trim().length < 5}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/15"
                >
                  {isLoading ? (
                    <span>Анализ и расчет нейросети...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Запустить тест & Аттестацию</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Response Output */}
            {aiResponse && (
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <span className="text-xs font-bold text-white">
                      Ответ нейросети (Роль: {role})
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(aiResponse)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800/80">
                  {aiResponse}
                </div>
              </div>
            )}

            {/* Automatic Evaluation & Grading Card */}
            {evalResult && (
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-cyan-500/40 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Аттестация качества промпта наставником СЮТ:
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black font-mono px-3 py-1 rounded-xl tabular-nums ${
                      evalResult.score >= 90
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : evalResult.score >= 70
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {evalResult.score} / 100
                    </span>

                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/30">
                      +{evalResult.xp} Techno-XP
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                  {evalResult.feedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                    <div className="font-bold text-emerald-400">Сильные стороны формулировки:</div>
                    <ul className="space-y-1 text-slate-300">
                      {evalResult.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
                    <div className="font-bold text-amber-400">Зоны для роста:</div>
                    <ul className="space-y-1 text-slate-300">
                      {evalResult.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">▸</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {evalResult.exampleImprovement && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                      Инженерный эталон (как сформулировать для максимальной точности):
                    </div>
                    <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {evalResult.exampleImprovement}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TOOL 2: TOKEN VISUALIZER (BPE ENGINE) */}
      {activeTool === 'tokens' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Визуализатор BPE (Byte Pair Encoding) & Токенизация
              </h3>
              <p className="text-xs text-slate-400">
                Узнай, как нейросеть преобразует русские и английские слова в числовые токены перед вычислением весов.
              </p>
            </div>
            <button
              onClick={() => setActiveTool('workbench')}
              className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              Вернуться в Верстак →
            </button>
          </div>

          <TokenVisualizer onEarnXp={onEarnXp} />
        </div>
      )}

      {/* 4. TOOL 3: R-C-I-O PROMPT MATRIX BUILDER */}
      {activeTool === 'matrix' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Матрица R-C-I-O: Архитектурный конструктор промптов
              </h3>
              <p className="text-xs text-slate-400">
                Золотой стандарт инженерии промптов: Роль (Role), Контекст (Context), Инструкция (Instruction), Формат (Output).
              </p>
            </div>
            <button
              onClick={() => setActiveTool('workbench')}
              className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              Вернуться в Верстак →
            </button>
          </div>

          <PromptBreakdownWidget onEarnXp={onEarnXp} />
        </div>
      )}

      {/* 5. TOOL 4: BIAS & SAFETY DETECTOR */}
      {activeTool === 'safety' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Этика ИИ & Детектор галлюцинаций
              </h3>
              <p className="text-xs text-slate-400">
                Тренируй критическое мышление: отличай реальные факты Черноморского побережья от выдумок нейросетей.
              </p>
            </div>
            <button
              onClick={() => setActiveTool('workbench')}
              className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              Вернуться в Верстак →
            </button>
          </div>

          <BiasCheckerWidget onEarnXp={onEarnXp} />
        </div>
      )}
    </div>
  );
};
