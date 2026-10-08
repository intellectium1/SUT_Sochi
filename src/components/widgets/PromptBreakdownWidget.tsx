import React, { useState } from 'react';
import { Sparkles, Check, Copy, BookOpen, Layers, Terminal, ArrowRight, ShieldCheck } from 'lucide-react';

interface PromptBreakdownWidgetProps {
  onEarnXp?: (amount: number, reason?: string) => void;
}

interface PromptArchetype {
  label: string;
  role: string;
  context: string;
  instruction: string;
  outputFormat: string;
  guardrails: string;
}

export const PromptBreakdownWidget: React.FC<PromptBreakdownWidgetProps> = ({ onEarnXp }) => {
  const archetypes: PromptArchetype[] = [
    {
      label: 'Морской дрон СЮТ',
      role: 'Бортовой навигационный ИИ автономного катамарана СЮТ Сочи «Акватрон-26».',
      context: 'Катамаран выполняет экологический рейд в районе мыса Видный. УЗ-сонар фиксирует риф по курсу 45° на дистанции 18 метров.',
      instruction: 'Рассчитай корректирующий угол рыскания и режим оборотов левого и правого электромоторов для безопасного обхода рифа по методу потенциальных полей.',
      outputFormat: 'Формат: краткий телеметрический протокол JSON с полями target_heading, left_rpm, right_rpm и rationale.',
      guardrails: 'Не предлагай остановку без необходимости; маневр должен быть плавным с радиусом не менее 5 метров.'
    },
    {
      label: 'Наставник по ESP32',
      role: 'Ведущий преподаватель кружка микроэлектроники и IoT Станции Юных Техников.',
      context: 'Ученик 7 класса подключает ультразвуковой датчик HC-SR04 к микроконтроллеру ESP32 с питанием 3.3V.',
      instruction: 'Объясни назначение делителя напряжения на резисторах для пина Echo и напиши 5 строк кода на C++ Arduino IDE для считывания импульса.',
      outputFormat: 'Формат: 1) Схема подключения, 2) Код C++ с комментариями, 3) Предупреждение о защите GPIO.',
      guardrails: 'Не используй блокирующие задержки delay() более 10 мс; объясни концепцию на простом понятном школьнику языке.'
    },
    {
      label: 'Эко-мониторинг Сочи',
      role: 'Научный консультант Черноморской биостанции и юных исследователей СЮТ.',
      context: 'Экспедиция собрала пробы морской воды в устье реки Мзымта после весеннего паводка.',
      instruction: 'Составь экспресс-план тестирования проб на минерализацию, мутность и присутствие микропластика с помощью учебного спектрометра.',
      outputFormat: 'Формат: поэтапный чеклист из 4 шагов с техникой безопасности в лаборатории.',
      guardrails: 'Учитывай специфику солености Черного моря (18‰) и безопасность при работе с реактивами.'
    }
  ];

  const [activeArchetype, setActiveArchetype] = useState<number>(0);
  const [role, setRole] = useState(archetypes[0].role);
  const [context, setContext] = useState(archetypes[0].context);
  const [instruction, setInstruction] = useState(archetypes[0].instruction);
  const [outputFormat, setOutputFormat] = useState(archetypes[0].outputFormat);
  const [guardrails, setGuardrails] = useState(archetypes[0].guardrails);

  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState<boolean>(() => {
    try {
      const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
      return localStorage.getItem(`sut_claimed_widget_rcio_${activeId}`) === 'true';
    } catch {
      return false;
    }
  });

  const applyArchetype = (idx: number) => {
    setActiveArchetype(idx);
    const arch = archetypes[idx];
    setRole(arch.role);
    setContext(arch.context);
    setInstruction(arch.instruction);
    setOutputFormat(arch.outputFormat);
    setGuardrails(arch.guardrails);
  };

  // Assembled Prompt
  const assembledPrompt = `### [РОЛЬ И ПЕРСОНА]
${role}

### [КОНТЕКСТ И УСЛОВИЯ]
${context}

### [КОНКРЕТНАЯ ИНСТРУКЦИЯ]
${instruction}

### [ФОРМАТ ВЫВОДА]
${outputFormat}

### [ОГРАНИЧЕНИЯ И ПРАВИЛА БЕЗОПАСНОСТИ]
${guardrails}`;

  // Quality score based on RCIO completeness
  const scoreRole = role.trim().length >= 15 ? 20 : 5;
  const scoreContext = context.trim().length >= 25 ? 20 : 5;
  const scoreInstruction = instruction.trim().length >= 25 ? 25 : 5;
  const scoreOutput = outputFormat.trim().length >= 20 ? 20 : 5;
  const scoreGuardrails = guardrails.trim().length >= 15 ? 15 : 5;
  const totalScore = Math.min(100, scoreRole + scoreContext + scoreInstruction + scoreOutput + scoreGuardrails);

  const handleCopy = () => {
    navigator.clipboard.writeText(assembledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 my-6 shadow-xl relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>ЛАБОРАТОРНЫЙ СТЕНД #03</span>
            <span aria-hidden="true">·</span>
            <span>ЗОЛОТОЙ СТАНДАРТ R-C-I-O-G</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Инженерный конструктор структурированных промптов
          </h3>
        </div>

        {/* Archetypes Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {archetypes.map((arch, idx) => (
            <button
              key={idx}
              onClick={() => applyArchetype(idx)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                activeArchetype === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {arch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structural Input Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* R - Role */}
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-[10px]">R</span>
              Role (Роль и экспертность ИИ)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">20 баллов</span>
          </div>
          <textarea
            value={role}
            onChange={(e) => setRole(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono resize-none"
          />
        </div>

        {/* C - Context */}
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-mono text-[10px]">C</span>
              Context (Обстоятельства и вводные данные)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">20 баллов</span>
          </div>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono resize-none"
          />
        </div>

        {/* I - Instruction */}
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-mono text-[10px]">I</span>
              Instruction (Точная задача и действие)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">25 баллов</span>
          </div>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono resize-none"
          />
        </div>

        {/* O - Output Format */}
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-mono text-[10px]">O</span>
              Output Format (Структура ответа: JSON, таблица)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">20 баллов</span>
          </div>
          <textarea
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
          />
        </div>
      </div>

      {/* G - Guardrails (Full width) */}
      <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5 mb-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-rose-400 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center font-mono text-[10px]">G</span>
            Guardrails & Constraints (Ограничения безопасности и запреты)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">15 баллов</span>
        </div>
        <input
          type="text"
          value={guardrails}
          onChange={(e) => setGuardrails(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
        />
      </div>

      {/* Assembled Result View */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Скомпонованный системный запрос для LLM
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
          </button>
        </div>
        <pre className="text-xs font-mono text-cyan-200/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {assembledPrompt}
        </pre>
      </div>

      {/* Score & Reward Footer */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Инженерная зрелость структуры:</div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="tabular-nums font-mono text-cyan-400">{totalScore}%</span>
              <span className="text-xs font-normal text-slate-400">
                {totalScore >= 90 ? 'Идеальная архитектура' : 'Требует уточнения блоков'}
              </span>
            </div>
          </div>
        </div>

        {onEarnXp && totalScore >= 80 && (
          <button
            onClick={() => {
              if (!claimed) {
                onEarnXp(25, 'Освоение инженерной структуры RCIO-G');
                setClaimed(true);
                try {
                  const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
                  localStorage.setItem(`sut_claimed_widget_rcio_${activeId}`, 'true');
                } catch (e) {
                  console.warn(e);
                }
              }
            }}
            disabled={claimed}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg self-start sm:self-auto ${
              claimed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
            }`}
          >
            {claimed ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{claimed ? 'Опыт зачислен (+25 XP)' : 'Забрать награду (+25 XP)'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
