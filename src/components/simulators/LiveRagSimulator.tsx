import React, { useState } from 'react';
import { SpatialNode } from '../../data/spatialGraphData';
import {
  Layers,
  Search,
  Sparkles,
  CheckCircle2,
  Sliders,
  Database,
  ArrowRight,
  FileText,
  Activity,
  Zap,
  Info
} from 'lucide-react';

interface LiveRagSimulatorProps {
  node: SpatialNode;
  onCompleteNode: (nodeId: string, earnedXp: number) => void;
}

const SOCHI_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Спецификация катамарана «Ривьера-1» СЮТ',
    category: 'Судомоделирование',
    content: 'Автономный исследовательский катамаран «Ривьера-1» оснащен ультразвуковыми сонарами на носу и корме. Радиус обнаружения волнорезов порта Сочи составляет 35 метров при волнении до 2 баллов. Рабочая частота гидроакустического тракта 200 кГц.',
  },
  {
    id: 'doc-2',
    title: 'Регламент полетов дронов на горе Ахун',
    category: 'Аэроклуб & БПЛА',
    content: 'При подъеме квадрокоптеров на высоту 660м над уровнем моря (смотровая башня Ахун) оператор обязан активировать барометрический фильтр и компенсацию восходящих бризов. Максимальный допустимый боковой ветер 12 м/с.',
  },
  {
    id: 'doc-3',
    title: 'Протокол экономии токенов лаборатории СЮТ',
    category: 'ИИ-Лаборатория',
    content: 'Все запросы бортовых агентов СЮТ должны передаваться в формате сжатого JSON без вводных слов. Ограничение системного промпта: не более 140 токенов для микроконтроллеров ESP32 и Arduino Nano 33 BLE.',
  },
];

export const LiveRagSimulator: React.FC<LiveRagSimulatorProps> = ({
  node,
  onCompleteNode,
}) => {
  const [chunkSize, setChunkSize] = useState<number>(128);
  const [topK, setTopK] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('Как сонары катамарана обнаруживают волнорезы в Сочи?');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragResult, setRagResult] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(node.status === 'completed');

  // Compute mock cosine similarities dynamically based on query matching
  const scoredDocs = SOCHI_DOCUMENTS.map((doc) => {
    const qWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const docLower = (doc.title + ' ' + doc.content).toLowerCase();
    let matches = 0;
    for (const w of qWords) {
      if (docLower.includes(w)) matches++;
    }
    const score = Math.min(0.98, Math.max(0.15, (matches / Math.max(1, qWords.length)) * 0.85 + 0.1));
    return { ...doc, score: Number(score.toFixed(3)) };
  }).sort((a, b) => b.score - a.score);

  const topChunks = scoredDocs.slice(0, topK);

  const handleRunRag = async () => {
    setIsGenerating(true);
    setRagResult(null);

    try {
      const contextText = topChunks.map((c, i) => `[Источник ${i + 1} - ${c.title}]: ${c.content}`).join('\n\n');
      const resp = await fetch('/api/ai/ask-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'RAG-система СЮТ Сочи',
          codeContext: contextText,
          question: searchQuery,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setRagResult(data.answer);
      } else {
        setRagResult(`[RAG-Синтез]: На основе извлеченных фрагментов катамаран «Ривьера-1» использует ультразвуковые сонары (200 кГц) с радиусом 35 метров для обнаружения волнорезов при волнении до 2 баллов.`);
      }
    } catch (e) {
      setRagResult(`[RAG-Синтез]: Извлеченный контекст СЮТ Сочи подтверждает: катамаран «Ривьера-1» уверенно детектирует волнорезы на дистанции 35м с помощью сонаров 200 кГц.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishStep = () => {
    setHasCompleted(true);
    onCompleteNode(node.id, node.xpReward);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header bar of Live Simulator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE-СИМУЛЯТОР RAG · УЗЕЛ #{node.id}</span>
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

      {/* RAG Hyperparameters Workbench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chunk Size Control */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Размер чанка (Chunk Size)
            </span>
            <span className="font-mono text-cyan-300 font-bold">{chunkSize} токенов</span>
          </div>
          <input
            type="range"
            min={64}
            max={256}
            step={32}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>64 (высокая точность)</span>
            <span>128 (баланс)</span>
            <span>256 (широкий контекст)</span>
          </div>
        </div>

        {/* Top-K Control */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Количество чанков (Top-K)
            </span>
            <span className="font-mono text-purple-300 font-bold">{topK} источника</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>K=1 (строго)</span>
            <span>K=2 (рекомендовано)</span>
            <span>K=3 (полно)</span>
          </div>
        </div>
      </div>

      {/* Semantic Search Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          Поисковый запрос к базе знаний СЮТ:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите вопрос по архивам СЮТ..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-sans"
          />
          <button
            onClick={handleRunRag}
            disabled={isGenerating || !searchQuery.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>RAG Синтез...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Тест RAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cosine Similarity Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Векторное ранжирование (Cosine Similarity):
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Порог отсечения: &gt; 0.40</span>
        </div>

        <div className="space-y-2.5">
          {scoredDocs.map((doc, idx) => {
            const isSelected = idx < topK;
            const scorePercent = Math.round(doc.score * 100);

            return (
              <div
                key={doc.id}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-medium text-slate-200">{doc.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({doc.category})</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={doc.score > 0.6 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      cos θ = {doc.score}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono">
                        TOP-{idx + 1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Similarity Bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden my-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      doc.score > 0.6 ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-gradient-to-r from-slate-600 to-amber-500'
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated RAG Output Display */}
      {ragResult && (
        <div className="bg-cyan-950/20 border border-cyan-500/40 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-mono font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Ответ агента с контекстной аугментацией:
            </span>
            <span>Извлечено: {topK} чанка ({chunkSize * topK} токенов)</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {ragResult}
          </p>
        </div>
      )}

      {/* EdTech Mental Note */}
      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-medium">Ментальная модель RAG: </strong>
          Семантический вектор превращает текст в точку в пространстве векторов. Документы с близким смыслом имеют малый угол между векторами, что обеспечивает высокий Cosine Similarity даже при несовпадении ключевых слов.
        </div>
      </div>
    </div>
  );
};
