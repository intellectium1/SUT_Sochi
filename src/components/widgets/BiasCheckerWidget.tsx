import React, { useState } from 'react';
import { Sparkles, Check, AlertTriangle, ShieldCheck, HelpCircle, RotateCcw, Brain, CheckCircle2, XCircle } from 'lucide-react';

interface Scenario {
  title: string;
  category: string;
  description: string;
  statements: {
    id: number;
    claim: string;
    isHallucination: boolean;
    explanation: string;
    llmConfidence: number; // e.g., 94% confident even if wrong!
  }[];
}

interface BiasCheckerWidgetProps {
  onEarnXp?: (amount: number, reason?: string) => void;
}

export const BiasCheckerWidget: React.FC<BiasCheckerWidgetProps> = ({ onEarnXp }) => {
  const scenarios: Scenario[] = [
    {
      title: 'Раунд 1: Морская робототехника и Черное море',
      category: 'Гидроакустика & География',
      description: 'Нейросеть сгенерировала 3 факта о побережье Сочи и подводных аппаратах. Одно утверждение — опасная галлюцинация модели:',
      statements: [
        {
          id: 1,
          claim: '«Станция Юных Техников (СЮТ) города Сочи обучает школьников конструированию морских катамаранов, подводных роботов и автономных метеостанций.»',
          isHallucination: false,
          explanation: 'Это чистая правда! СЮТ Сочи десятилетиями воспитывает молодых инженеров и исследователей Черноморского побережья.',
          llmConfidence: 98,
        },
        {
          id: 2,
          claim: '«Ультразвуковой сонар HC-SR04 из набора Arduino можно погружать прямо в соленую морскую воду без герметизации, так как звуковые волны сами изолируют датчик от короткого замыкания.»',
          isHallucination: true,
          explanation: 'Критическая галлюцинация! Морская вода — электролит с высокой проводимостью. Погружение незащищенного пьезоизлучателя немедленно выведет датчик и плату из строя.',
          llmConfidence: 92,
        },
        {
          id: 3,
          claim: '«В Черном море на глубинах свыше 150-200 метров содержится сероводородная зона без кислорода, что требует использования антикоррозийных титановых и полимерных корпусов для глубоководных аппаратов.»',
          isHallucination: false,
          explanation: 'Абсолютно верный научный факт океанографии Черного моря!',
          llmConfidence: 96,
        }
      ]
    },
    {
      title: 'Раунд 2: Микроэлектроника и физика микроконтроллеров',
      category: 'Hardware & Схемотехника',
      description: 'Проверь рассуждения ИИ о подключении моторов и питания микроконтроллера ESP32:',
      statements: [
        {
          id: 4,
          claim: '«Если напрямую подключить силовой коллекторный мотор 12V к логическому пину GPIO ESP32, микроконтроллер автоматически преобразует напряжение силой мысли языковой модели.»',
          isHallucination: true,
          explanation: 'Галлюцинация! Пины GPIO ESP32 выдерживают максимум 3.3V и ток до 12 мА. Прямое подключение 12V мотора выжжет кремниевый кристалл за доли секунды. Нужен драйвер L298N или MOSFET!',
          llmConfidence: 89,
        },
        {
          id: 5,
          claim: '«Для фильтрации импульсных помех от щеток мотора параллельно его клеммам напаивают керамический конденсатор емкостью 0.1 мкФ.»',
          isHallucination: false,
          explanation: 'Классическое инженерное правило схемотехники для подавления искровых радиопомех.',
          llmConfidence: 97,
        },
        {
          id: 6,
          claim: '«ШИМ (PWM) модуляция позволяет регулировать эффективное напряжение на моторе за счет изменения скважности прямоугольных импульсов.»',
          isHallucination: false,
          explanation: 'Точное физическое описание широтно-импульсной модуляции.',
          llmConfidence: 99,
        }
      ]
    }
  ];

  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [claimed, setClaimed] = useState<boolean>(() => {
    try {
      const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
      return localStorage.getItem(`sut_claimed_widget_bias_${activeId}`) === 'true';
    } catch {
      return false;
    }
  });

  const scenario = scenarios[currentScenarioIdx];
  const activeStatement = scenario.statements.find((s) => s.id === selectedStatementId);

  const handleSelect = (id: number) => {
    setSelectedStatementId(id);
    setRevealed(true);
    const item = scenario.statements.find((s) => s.id === id);
    if (item?.isHallucination && !claimed && onEarnXp) {
      onEarnXp(25, 'Распознана опасная галлюцинация ИИ');
      setClaimed(true);
      try {
        const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
        localStorage.setItem(`sut_claimed_widget_bias_${activeId}`, 'true');
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleNextRound = () => {
    setCurrentScenarioIdx((prev) => (prev + 1) % scenarios.length);
    setSelectedStatementId(null);
    setRevealed(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 my-6 shadow-xl relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
            <Brain className="w-3.5 h-3.5" />
            <span>ЛАБОРАТОРНЫЙ СТЕНД #04</span>
            <span aria-hidden="true">·</span>
            <span>АУДИТ НАДЕЖНОСТИ & ГАЛЛЮЦИНАЦИЙ</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Детектор галлюцинаций и физических ошибок генеративного ИИ
          </h3>
        </div>

        {/* Round Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentScenarioIdx(0);
              setSelectedStatementId(null);
              setRevealed(false);
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              currentScenarioIdx === 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Раунд 1
          </button>
          <button
            onClick={() => {
              setCurrentScenarioIdx(1);
              setSelectedStatementId(null);
              setRevealed(false);
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              currentScenarioIdx === 1
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Раунд 2
          </button>
        </div>
      </div>

      {/* Scenario Brief */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-200 mb-1">{scenario.title}</div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {scenario.description}
        </p>
      </div>

      {/* Statements List */}
      <div className="space-y-3 mb-5">
        {scenario.statements.map((statement) => {
          const isSelected = selectedStatementId === statement.id;
          let cardStyle = 'border-slate-800 bg-slate-950/70 hover:border-slate-700';

          if (revealed && isSelected) {
            cardStyle = statement.isHallucination
              ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-100 shadow-md ring-1 ring-emerald-500/30'
              : 'border-rose-500/80 bg-rose-950/40 text-rose-100 shadow-md ring-1 ring-rose-500/30';
          }

          return (
            <button
              key={statement.id}
              onClick={() => handleSelect(statement.id)}
              className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer relative ${cardStyle}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-slate-200">{statement.claim}</span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  Уверенность ИИ: {statement.llmConfidence}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Diagnostic Explanation Banner */}
      {revealed && activeStatement && (
        <div className={`p-4 rounded-xl border text-xs mb-4 animate-fadeIn ${
          activeStatement.isHallucination
            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
            : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
        }`}>
          <div className="font-bold mb-1 flex items-center gap-2 text-sm">
            {activeStatement.isHallucination ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>БРАВО! ВЫЯВЛЕНА ГАЛЛЮЦИНАЦИЯ МОДЕЛИ</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>ЭТО РЕАЛЬНЫЙ ФАКТ, А НЕ ОШИБКА</span>
              </>
            )}
          </div>
          <p className="leading-relaxed opacity-95">
            {activeStatement.explanation}
          </p>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <span className="opacity-80">
              {activeStatement.isHallucination
                ? 'Инженерный вывод: LLM предсказывает статистически вероятные слова, но не имеет встроенных законов физики. Всегда перепроверяй расчеты!'
                : 'Попробуй проверить другие утверждения, чтобы отыскать скрытую галлюцинацию.'}
            </span>
            <button
              onClick={handleNextRound}
              className="text-xs font-semibold underline hover:text-white cursor-pointer ml-auto"
            >
              Следующий кейс →
            </button>
          </div>
        </div>
      )}

      {/* Rewards Bar */}
      {onEarnXp && (
        <div className="flex justify-end">
          {claimed && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-800/60">
              <Check className="w-3.5 h-3.5" />
              <span>Награда за наблюдательность зачислена (+25 XP)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
