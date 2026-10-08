import React, { useState } from 'react';
import { Sparkles, Check, RotateCcw, AlertTriangle, ShieldCheck, Compass, Sliders, Activity } from 'lucide-react';

interface NeuralWeightSimProps {
  onEarnXp?: (amount: number, reason?: string) => void;
}

export const NeuralWeightSim: React.FC<NeuralWeightSimProps> = ({ onEarnXp }) => {
  // Sensor inputs
  const [sensorDistance, setSensorDistance] = useState(25); // distance in cm (5 to 100)
  const [sensorLight, setSensorLight] = useState(70); // ambient light % (0 to 100)
  
  // Synaptic weights and bias
  const [weightDistance, setWeightDistance] = useState(-0.85); // negative: closer = more alarm
  const [weightLight, setWeightLight] = useState(0.25); // ambient light factor
  const [bias, setBias] = useState(15); // bias percentage (-100 to 100)
  const [claimed, setClaimed] = useState<boolean>(() => {
    try {
      const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
      return localStorage.getItem(`sut_claimed_widget_neural_${activeId}`) === 'true';
    } catch {
      return false;
    }
  });

  // Normalized inputs (0.0 to 1.0)
  const x1 = Math.max(0, Math.min(100, sensorDistance)) / 100;
  const x2 = Math.max(0, Math.min(100, sensorLight)) / 100;

  // Weighted sum z = w1*x1 + w2*x2 + b
  const b = bias / 100;
  const term1 = weightDistance * x1;
  const term2 = weightLight * x2;
  const z = term1 + term2 + b;

  // Sigmoid activation: 1 / (1 + e^(-5z))
  const activation = 1 / (1 + Math.exp(-5 * z));
  const isEmergencyStop = activation > 0.52;

  // Preset scenarios
  const applyPreset = (name: 'rock' | 'clear' | 'glare' | 'night') => {
    switch (name) {
      case 'rock':
        setSensorDistance(12);
        setSensorLight(60);
        setWeightDistance(-0.9);
        setWeightLight(0.2);
        setBias(20);
        break;
      case 'clear':
        setSensorDistance(85);
        setSensorLight(75);
        setWeightDistance(-0.8);
        setWeightLight(0.1);
        setBias(10);
        break;
      case 'glare':
        setSensorDistance(60);
        setSensorLight(95);
        setWeightDistance(-0.7);
        setWeightLight(0.35);
        setBias(15);
        break;
      case 'night':
        setSensorDistance(30);
        setSensorLight(5);
        setWeightDistance(-0.85);
        setWeightLight(0.15);
        setBias(25);
        break;
    }
  };

  const handleReset = () => {
    setSensorDistance(25);
    setSensorLight(70);
    setWeightDistance(-0.85);
    setWeightLight(0.25);
    setBias(15);
  };

  // Sigmoid curve generator for SVG
  const curvePoints = Array.from({ length: 41 }, (_, i) => {
    const valZ = -3 + (i / 40) * 6; // from -3 to +3
    const act = 1 / (1 + Math.exp(-5 * valZ));
    const px = 20 + (i / 40) * 160; // 20 to 180
    const py = 65 - act * 50; // 65 down to 15
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');

  // Current operating point on curve
  const clampedZ = Math.max(-3, Math.min(3, z));
  const currentPx = 20 + ((clampedZ + 3) / 6) * 160;
  const currentPy = 65 - activation * 50;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 my-6 shadow-xl relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>ЛАБОРАТОРНЫЙ СТЕНД #02</span>
            <span aria-hidden="true">·</span>
            <span>МАТЕМАТИЧЕСКИЙ НЕЙРОН СЮТ</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Симулятор искусственного синапса и нелинейной активации
          </h3>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => applyPreset('rock')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Близкая скала
          </button>
          <button
            onClick={() => applyPreset('clear')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Чистый фарватер
          </button>
          <button
            onClick={() => applyPreset('glare')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Блики солнца
          </button>
          <button
            onClick={handleReset}
            title="Сбросить к исходным"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Neural Circuit Diagram (SVG + Telemetry) */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-6 relative">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Схема передачи сигнала: Входы → Веса → Сумматор (Σ) → Сигмоида (σ) → Решение</span>
          <span className="text-cyan-400 font-bold tabular-nums">z = {z.toFixed(3)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Neural Network Visual Canvas (SVG) */}
          <div className="lg:col-span-8 flex justify-center overflow-x-auto py-2">
            <svg viewBox="0 0 540 180" className="w-full max-w-xl h-auto select-none">
              <defs>
                <linearGradient id="gradPosSynapse" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="gradNegSynapse" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
                </linearGradient>
                <filter id="glowEffect">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background grid dots */}
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#1e293b" />
              </pattern>
              <rect width="540" height="180" fill="url(#dotGrid)" rx="12" />

              {/* Synapse line 1: Input 1 (Distance) -> Summation node */}
              <line
                x1="80"
                y1="50"
                x2="240"
                y2="90"
                stroke={weightDistance >= 0 ? "url(#gradPosSynapse)" : "url(#gradNegSynapse)"}
                strokeWidth={Math.max(1.5, Math.abs(weightDistance) * 4)}
                strokeDasharray={weightDistance < 0 ? "6 3" : undefined}
                className="transition-all duration-300"
              />
              <text x="145" y="60" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                w₁={weightDistance.toFixed(2)}
              </text>

              {/* Synapse line 2: Input 2 (Light) -> Summation node */}
              <line
                x1="80"
                y1="130"
                x2="240"
                y2="90"
                stroke={weightLight >= 0 ? "url(#gradPosSynapse)" : "url(#gradNegSynapse)"}
                strokeWidth={Math.max(1.5, Math.abs(weightLight) * 4)}
                strokeDasharray={weightLight < 0 ? "6 3" : undefined}
                className="transition-all duration-300"
              />
              <text x="145" y="130" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                w₂={weightLight.toFixed(2)}
              </text>

              {/* Bias Line: Top down into Summation */}
              <line
                x1="240"
                y1="25"
                x2="240"
                y2="70"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <text x="248" y="42" fill="#c084fc" fontSize="10" fontFamily="monospace">
                +b={b.toFixed(2)}
              </text>

              {/* Node 1: Sensor Distance (x1) */}
              <g transform="translate(60, 50)">
                <circle r="22" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                <text x="0" y="-4" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  x₁ DIST
                </text>
                <text x="0" y="9" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {x1.toFixed(2)}
                </text>
              </g>

              {/* Node 2: Sensor Light (x2) */}
              <g transform="translate(60, 130)">
                <circle r="22" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                <text x="0" y="-4" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  x₂ LUX
                </text>
                <text x="0" y="9" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {x2.toFixed(2)}
                </text>
              </g>

              {/* Summation Node (Sigma) */}
              <g transform="translate(240, 90)">
                <circle r="26" fill="#090d16" stroke="#3b82f6" strokeWidth="2.5" />
                <text x="0" y="-2" fill="#93c5fd" fontSize="14" fontWeight="black" textAnchor="middle">
                  Σ
                </text>
                <text x="0" y="11" fill="#60a5fa" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {z.toFixed(2)}
                </text>
              </g>

              {/* Connection: Sigma to Activation Function */}
              <line x1="266" y1="90" x2="340" y2="90" stroke="#60a5fa" strokeWidth="2.5" />

              {/* Activation Function Node (Sigmoid σ) */}
              <g transform="translate(365, 90)">
                <circle
                  r="24"
                  fill="#090d16"
                  stroke={isEmergencyStop ? '#f43f5e' : '#10b981'}
                  strokeWidth="2.5"
                  className="transition-colors duration-300"
                />
                <text x="0" y="-2" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">
                  σ(z)
                </text>
                <text x="0" y="11" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {(activation * 100).toFixed(0)}%
                </text>
              </g>

              {/* Connection: Activation to Final Actuator Decision */}
              <line
                x1="389"
                y1="90"
                x2="450"
                y2="90"
                stroke={isEmergencyStop ? '#f43f5e' : '#10b981'}
                strokeWidth="3"
                className="transition-colors duration-300"
              />

              {/* Output Decision Badge */}
              <g transform="translate(450, 70)">
                <rect
                  width="80"
                  height="40"
                  rx="8"
                  fill={isEmergencyStop ? '#450a0a' : '#022c22'}
                  stroke={isEmergencyStop ? '#ef4444' : '#10b981'}
                  strokeWidth="1.5"
                  className="transition-colors duration-300"
                />
                <text
                  x="40"
                  y="18"
                  fill={isEmergencyStop ? '#fca5a5' : '#86efac'}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isEmergencyStop ? 'СТОП' : 'ХОД'}
                </text>
                <text
                  x="40"
                  y="30"
                  fill={isEmergencyStop ? '#f87171' : '#4ade80'}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {(activation * 100).toFixed(1)}%
                </text>
              </g>
            </svg>
          </div>

          {/* Real-time Sigmoid Curve Plot */}
          <div className="lg:col-span-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-2">
              <span>График активации σ(z)</span>
              <span className={isEmergencyStop ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isEmergencyStop ? 'Зона тревоги' : 'Безопасно'}
              </span>
            </div>
            <svg viewBox="0 0 200 80" className="w-full h-auto select-none">
              {/* Axis and Threshold */}
              <line x1="20" y1="40" x2="180" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="100" y1="10" x2="100" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="20" y1="39" x2="180" y2="39" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.4" />
              {/* Sigmoid Curve */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={curvePoints}
              />
              {/* Current Operating Dot */}
              <circle
                cx={currentPx}
                cy={currentPy}
                r="5"
                fill={isEmergencyStop ? '#f43f5e' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>z = -3.0</span>
              <span>z = 0.0</span>
              <span>z = +3.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Sensor Inputs Panel */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              1. Физические сенсоры робота (Входы x)
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Сонар: Дистанция до препятствия (x₁)</span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">{sensorDistance} см ({x1.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={sensorDistance}
              onChange={(e) => setSensorDistance(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>5 см (Опасно)</span>
              <span>50 см</span>
              <span>100 см (Открыто)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Фоторезистор: Освещенность акватории (x₂)</span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">{sensorLight}% ({x2.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sensorLight}
              onChange={(e) => setSensorLight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% (Темнота)</span>
              <span>50%</span>
              <span>100% (Яркое солнце)</span>
            </div>
          </div>
        </div>

        {/* Weights & Biases Panel */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              2. Веса синапсов и смещение (Параметры w, b)
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Вес w₁ (Важность дистанции)</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">{weightDistance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={weightDistance}
              onChange={(e) => setWeightDistance(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-2.00 (Отрицательный)</span>
              <span>0.00</span>
              <span>+2.00 (Положительный)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Смещение b (Порог настороженности)</span>
              <span className="font-mono text-purple-400 font-bold tabular-nums">{b.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={bias}
              onChange={(e) => setBias(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-1.00 (Смелый)</span>
              <span>0.00</span>
              <span>+1.00 (Осторожный)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Footer & XP Reward */}
      <div className={`p-4 rounded-xl border transition-all ${
        isEmergencyStop
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              {isEmergencyStop ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Результат нелинейной классификации:</span>
            </div>
            <div className="text-base sm:text-lg font-bold flex items-center gap-3">
              <span>{isEmergencyStop ? '🚨 ЭКСТРЕННАЯ ОСТАНОВКА (Стоп двигатели)' : '🟢 ДВИЖЕНИЕ РАЗРЕШЕНО (Штатный курс)'}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/50 border border-slate-700 tabular-nums">
                Вероятность тревоги: {(activation * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed max-w-xl">
              {isEmergencyStop
                ? 'Нейрон зафиксировал критическую близость препятствия с учетом веса синапса. На моторы подается команда реверса.'
                : 'Потенциал активации ниже порога 52%. Автономный катамаран продолжает движение по фарватеру.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onEarnXp && (
              <button
                onClick={() => {
                  if (!claimed) {
                    onEarnXp(25, 'Калибровка весов искусственного нейрона');
                    setClaimed(true);
                    try {
                      const activeId = localStorage.getItem('sut_sochi_active_student_id_v3') || localStorage.getItem('sut_active_student_id') || 'default';
                      localStorage.setItem(`sut_claimed_widget_neural_${activeId}`, 'true');
                    } catch (e) {
                      console.warn(e);
                    }
                  }
                }}
                disabled={claimed}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                  claimed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                }`}
              >
                {claimed ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{claimed ? 'Опыт зачислен (+25 XP)' : 'Зафиксировать веса (+25 XP)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
