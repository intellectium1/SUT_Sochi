import React, { useState } from 'react';
import { Sparkles, Check, Hash, Cpu, Sliders, Info, Terminal, ChevronRight } from 'lucide-react';

interface TokenVisualizerProps {
  onEarnXp?: (amount: number, reason?: string) => void;
}

interface TokenItem {
  id: number;
  rawText: string;
  display: string;
  start: number;
  end: number;
  bytes: number;
  colorClass: string;
  attentionScore: number;
}

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({ onEarnXp }) => {
  const [inputText, setInputText] = useState('Робот СЮТ Сочи исследует глубины Черного моря');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(0);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [tested, setTested] = useState<boolean>(() => {
    try {
      const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
      return localStorage.getItem(`sut_claimed_widget_tokens_${activeId}`) === 'true';
    } catch {
      return false;
    }
  });

  // Sample presets
  const presets = [
    { label: 'Робототехника СЮТ', text: 'Робот СЮТ Сочи исследует глубины Черного моря' },
    { label: 'Python автопилот', text: 'def read_sonar(pin=14):\n    return pulse_in(pin) * 0.034 / 2' },
    { label: 'Английский запрос', text: 'Autonomous marine surface vehicle telemetry Sochi 2026' },
    { label: 'Спецсимволы & Эмодзи', text: '🚢🌊 [GPS: 43.585°N, 39.723°E] Status: OK!' },
  ];

  // Token hashing for deterministic realistic IDs
  function hashString(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  // Realistic token splitting approximation for Russian & English BPE
  const tokenize = (text: string): TokenItem[] => {
    if (!text) return [];
    // Split by punctuation, words, and whitespace chunks
    const chunks = text.split(/(\s+|[.,!?:;—–"«»()[\]{}<>=+*/])/).filter(Boolean);
    const tokens: TokenItem[] = [];
    const colorPalette = [
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30',
      'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30',
    ];

    let currentOffset = 0;

    chunks.forEach((chunk) => {
      // Split words > 5 chars to illustrate BPE subwords
      if (chunk.length > 5 && !/^\s+$/.test(chunk)) {
        const mid = Math.ceil(chunk.length / 2);
        const p1 = chunk.slice(0, mid);
        const p2 = chunk.slice(mid);

        const id1 = 12000 + (hashString(p1) % 65000);
        tokens.push({
          id: id1,
          rawText: p1,
          display: p1.replace(/ /g, '␣'),
          start: currentOffset,
          end: currentOffset + p1.length,
          bytes: new TextEncoder().encode(p1).length,
          colorClass: colorPalette[tokens.length % colorPalette.length],
          attentionScore: 0.4 + (hashString(p1) % 50) / 100,
        });
        currentOffset += p1.length;

        const id2 = 12000 + (hashString(p2) % 65000);
        tokens.push({
          id: id2,
          rawText: p2,
          display: p2.replace(/ /g, '␣'),
          start: currentOffset,
          end: currentOffset + p2.length,
          bytes: new TextEncoder().encode(p2).length,
          colorClass: colorPalette[tokens.length % colorPalette.length],
          attentionScore: 0.5 + (hashString(p2) % 50) / 100,
        });
        currentOffset += p2.length;
      } else {
        const id = /^\s+$/.test(chunk) ? 220 : 10000 + (hashString(chunk) % 70000);
        tokens.push({
          id,
          rawText: chunk,
          display: chunk.replace(/ /g, '␣').replace(/\n/g, '↵\n'),
          start: currentOffset,
          end: currentOffset + chunk.length,
          bytes: new TextEncoder().encode(chunk).length,
          colorClass: /^\s+$/.test(chunk)
            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            : colorPalette[tokens.length % colorPalette.length],
          attentionScore: 0.3 + (hashString(chunk) % 60) / 100,
        });
        currentOffset += chunk.length;
      }
    });

    return tokens;
  };

  const tokens = tokenize(inputText);
  const selectedToken = selectedTokenIdx !== null && tokens[selectedTokenIdx] ? tokens[selectedTokenIdx] : tokens[0];

  // Compression metrics
  const totalChars = inputText.length;
  const totalTokens = Math.max(1, tokens.length);
  const charsPerToken = (totalChars / totalTokens).toFixed(2);
  const totalBytes = new TextEncoder().encode(inputText).length;

  // Next-token logits based on temperature
  const baseLogits = [
    { token: 'при помощи', rawProb: 0.38 },
    { token: 'в автономном', rawProb: 0.28 },
    { token: 'с сонаром', rawProb: 0.18 },
    { token: 'у мыса', rawProb: 0.10 },
    { token: 'на глубине', rawProb: 0.06 },
  ];

  // Softmax with temperature
  const scaledProbs = (() => {
    const temp = Math.max(0.1, temperature);
    const exps = baseLogits.map((b) => Math.exp(Math.log(b.rawProb) / temp));
    const sum = exps.reduce((a, b) => a + b, 0);
    return baseLogits.map((b, idx) => ({
      token: b.token,
      prob: exps[idx] / sum,
    }));
  })();

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 my-6 shadow-xl relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>ЛАБОРАТОРНЫЙ СТЕНД #01</span>
            <span aria-hidden="true">·</span>
            <span>ТОКЕНИЗАЦИЯ BPE & LOGITS</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Интерактивный анализатор токенов и предсказания языковой модели
          </h3>
        </div>

        {/* Action XP Claim */}
        {onEarnXp && (
          <button
            onClick={() => {
              if (!tested) {
                onEarnXp(20, 'Исследование BPE токенизации и логитов');
                setTested(true);
                try {
                  const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
                  localStorage.setItem(`sut_claimed_widget_tokens_${activeId}`, 'true');
                } catch (e) {
                  console.warn(e);
                }
              }
            }}
            disabled={tested}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto ${
              tested
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
            }`}
          >
            {tested ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{tested ? 'Опыт зачислен (+20 XP)' : 'Зафиксировать опыт (+20 XP)'}</span>
          </button>
        )}
      </div>

      {/* Presets and Editor */}
      <div className="space-y-4 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400">Быстрые примеры для проверки:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  setSelectedTokenIdx(0);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setSelectedTokenIdx(0);
            }}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-y leading-relaxed"
            placeholder="Введи любой текст или фрагмент кода..."
          />
        </div>

        {/* Telemetry Stat Bar (Zero-pill discipline: unboxed metadata with separators) */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap py-1">
          <span>Символов: <strong className="text-slate-200 font-mono tabular-nums">{totalChars}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Токенов: <strong className="text-cyan-400 font-mono tabular-nums">{totalTokens}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Коэффициент сжатия: <strong className="text-emerald-400 font-mono tabular-nums">{charsPerToken}</strong> симв./токен</span>
          <span aria-hidden="true">·</span>
          <span>Размер UTF-8: <strong className="text-slate-200 font-mono tabular-nums">{totalBytes} байт</strong></span>
        </div>
      </div>

      {/* Visual Token Stream */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Разбивка на токены (нажми на любой токен для детального инспектирования):</span>
          <span className="text-[11px] font-mono text-slate-500">␣ = пробел</span>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap gap-1.5 min-h-[90px] items-center">
          {tokens.map((tok, idx) => {
            const isSelected = selectedTokenIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedTokenIdx(idx)}
                className={`px-2 py-1 text-xs font-mono rounded border transition-all cursor-pointer whitespace-pre ${tok.colorClass} ${
                  isSelected ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-90'
                }`}
                title={`Токен ID: ${tok.id} | Байт: ${tok.bytes}`}
              >
                {tok.display}
              </button>
            );
          })}
        </div>
      </div>

      {/* Token Inspector & Logits Probability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Token Inspector Detail Card */}
        <div className="md:col-span-6 bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              Инспектор выбранного токена
            </span>
            {selectedToken && (
              <span className="font-mono text-cyan-400">#{selectedTokenIdx! + 1} из {tokens.length}</span>
            )}
          </div>

          {selectedToken ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Текстовый фрагмент:</span>
                <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {selectedToken.display}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">ID в словаре (Vocabulary ID):</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {selectedToken.id}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Длина / Размер памяти:</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  {selectedToken.rawText.length} симв. / {selectedToken.bytes} байт UTF-8
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Вес внимания (Attention Weight):</span>
                <span className="font-mono text-amber-400 tabular-nums">
                  {(selectedToken.attentionScore * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Модель оперирует числами (ID), а не буквами. Чем длиннее сублово в словаре, тем меньше токенов расходуется на промпт.
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4 text-center">Выбери токен выше</div>
          )}
        </div>

        {/* Softmax Temperature & Next Token Probabilities */}
        <div className="md:col-span-6 bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              Предсказание следующего токена (Logits)
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Температура сэмплинга (T):</span>
              <span className="font-mono text-purple-400 font-bold tabular-nums">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0.1 (Строгий детерминизм)</span>
              <span>0.7 (Оптимум)</span>
              <span>1.5 (Креативный разброс)</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 block mb-1">Топ-5 вероятных продолжений фразы:</span>
            {scaledProbs.map((cand, idx) => {
              const pct = (cand.prob * 100).toFixed(1);
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300">«... {cand.token}»</span>
                    <span className="text-cyan-400 font-bold tabular-nums">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(4, cand.prob * 100))}%` }}
                    />
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
