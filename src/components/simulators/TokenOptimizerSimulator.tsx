import React, { useState } from 'react';
import { SpatialNode } from '../../data/spatialGraphData';
import {
  Activity,
  CheckCircle2,
  Zap,
  Sparkles,
  Cpu,
  Minimize2,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';

interface TokenOptimizerSimulatorProps {
  node: SpatialNode;
  onCompleteNode: (nodeId: string, earnedXp: number) => void;
}

export const TokenOptimizerSimulator: React.FC<TokenOptimizerSimulatorProps> = ({
  node,
  onCompleteNode,
}) => {
  const [inputText, setInputText] = useState(
    'Пожалуйста, если вам не сложно, напишите подробный код для робота СЮТ Сочи с датчиками расстояния, очень прошу чтобы это было быстро и без ошибок.'
  );
  const [optimizedText, setOptimizedText] = useState('');
  const [tokensBefore, setTokensBefore] = useState(38);
  const [tokensAfter, setTokensAfter] = useState(14);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(node.status === 'completed');

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const resp = await fetch('/api/ai/byte-optimize-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: inputText }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setOptimizedText(data.optimizedPrompt);
        setTokensBefore(data.originalTokens);
        setTokensAfter(data.optimizedTokens);
      } else {
        // Fallback
        const compressed = 'Робот СЮТ: код навигации по сонару. Формат: JS модуль.';
        setOptimizedText(compressed);
        setTokensBefore(36);
        setTokensAfter(12);
      }
    } catch (e) {
      const compressed = 'Робот СЮТ: код навигации по сонару. Формат: JS модуль.';
      setOptimizedText(compressed);
      setTokensBefore(36);
      setTokensAfter(12);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFinishStep = () => {
    setHasCompleted(true);
    onCompleteNode(node.id, node.xpReward);
  };

  const savedTokens = Math.max(0, tokensBefore - tokensAfter);
  const compressionRatio = tokensBefore > 0 ? Math.round((savedTokens / tokensBefore) * 100) : 0;
  const latencySavedMs = savedTokens * 14;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE-СИМУЛЯТОР ТОКЕНОВ · УЗЕЛ #{node.id}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{node.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{node.instruction}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>УЗЕЛ ОСВОЕН (+{node.xpReward} XP)</span>
            </div>
          ) : (
            <button
              onClick={handleFinishStep}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Сдать шаг (+{node.xpReward} XP)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Compression Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-mono">ИСХОДНЫЕ ТОКЕНЫ</div>
          <div className="text-lg font-bold text-slate-200 mt-0.5">{tokensBefore}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-mono">СЖАТЫЙ РАЗМЕР</div>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">{tokensAfter}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-mono">СЭКОНОМЛЕНО</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">-{compressionRatio}%</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-mono">ВЫИГРЫШ ЗАДЕРЖКИ</div>
          <div className="text-lg font-bold text-purple-400 mt-0.5">~{latencySavedMs} мс</div>
        </div>
      </div>

      {/* Input / Output Compare Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Raw Text */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Исходный запрос (много воды):</span>
            <span className="font-mono text-[11px] text-amber-400">{tokensBefore} токенов</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 text-xs text-slate-200 outline-none font-sans resize-none"
          />
          <button
            onClick={handleOptimize}
            disabled={isOptimizing || !inputText.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            {isOptimizing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Сжатие энтропии...</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Сжать через робота Байта</span>
              </>
            )}
          </button>
        </div>

        {/* Compressed Text */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Оптимизированный микро-промпт:</span>
            <span className="font-mono text-[11px] text-emerald-400">{tokensAfter} токенов</span>
          </div>
          <div className="w-full h-[96px] bg-slate-950 rounded-lg border border-slate-800 p-2.5 text-xs text-cyan-300 font-mono overflow-y-auto leading-relaxed">
            {optimizedText || 'Нажмите кнопку «Сжать через робота Байта» для расчета...'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Готово к загрузке в контроллер ESP32 робота СЮТ.</span>
          </div>
        </div>
      </div>

      {/* EdTech Mental Note */}
      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-medium">Ментальная модель Промпт-сжатия: </strong>
          Нейросеть не обижается на отсутствие вежливых слов («пожалуйста», «будьте добры»). В микроконтроллерах каждый лишний токен расходует оперативную память и энергию аккумулятора.
        </div>
      </div>
    </div>
  );
};
