import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import {
  SpatialNode,
  SpatialEdge,
  LearningTrajectory,
  MentalMode,
  INITIAL_INTENTS,
  getSavedTrajectory,
  saveTrajectory,
  orchestrateIntentWithAI,
  DEFAULT_RAG_TRAJECTORY,
  ALL_DEFAULT_TRAJECTORIES,
} from '../data/spatialGraphData';
import { SpatialCanvas } from './SpatialCanvas';
import { LiveRagSimulator } from './simulators/LiveRagSimulator';
import { MarineCvSimulator } from './simulators/MarineCvSimulator';
import { DroneSwarmSimulator } from './simulators/DroneSwarmSimulator';
import { TokenOptimizerSimulator } from './simulators/TokenOptimizerSimulator';
import {
  Compass,
  Sparkles,
  Layers,
  Activity,
  Sliders,
  Send,
  Brain,
  Zap,
  Eye,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  FolderSync,
  Cpu,
  ChevronRight,
  Maximize2,
  Terminal,
  HelpCircle,
  Info
} from 'lucide-react';
import { playByteSound } from '../utils/byteAudio';

interface AgenticWorkspaceProps {
  profile: StudentProfile;
  onEarnXp: (amount: number, reason?: string) => void;
  onUnlockAchievement: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AgenticWorkspace: React.FC<AgenticWorkspaceProps> = ({
  profile,
  onEarnXp,
  onUnlockAchievement,
}) => {
  // 1. Trajectory State (persisted per student)
  const [trajectory, setTrajectory] = useState<LearningTrajectory>(() =>
    getSavedTrajectory(profile.id)
  );

  // 2. Active Mode (Cognitive Load Architecture)
  const [mentalMode, setMentalMode] = useState<MentalMode>('split');

  // 3. Selected Node on Spatial Canvas
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    const active = trajectory.nodes.find((n) => n.status === 'active');
    return active ? active.id : trajectory.nodes[0]?.id || 'rag-1';
  });

  // 4. Intent Input State
  const [intentInput, setIntentInput] = useState<string>(trajectory.intentText || '');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<string>('');

  // 5. Adaptive Mutation State
  const [isAdapting, setIsAdapting] = useState<boolean>(false);

  // Derive active node
  const activeNode = trajectory.nodes.find((n) => n.id === selectedNodeId) || trajectory.nodes[0];

  // Save changes to localStorage
  useEffect(() => {
    saveTrajectory(profile.id, trajectory);
  }, [profile.id, trajectory]);

  // Handle Intent Submission & Agentic Orchestration
  const handleOrchestrate = async (customIntent?: string) => {
    const text = customIntent || intentInput;
    if (!text.trim()) return;

    setIsSynthesizing(true);
    setSynthesisStage('Анализ профиля и навыков ученика СЮТ...');
    playByteSound('thinking');

    setTimeout(() => {
      setSynthesisStage('Синтез графа и расчет когнитивной нагрузки...');
    }, 700);

    setTimeout(() => {
      setSynthesisStage('Генерация Live-симуляторов и топологии...');
    }, 1400);

    try {
      const newTraj = await orchestrateIntentWithAI(
        text,
        profile.name,
        profile.department,
        profile.level
      );

      setTrajectory(newTraj);
      setSelectedNodeId(newTraj.nodes[0]?.id || 'node-1');
      playByteSound('success');
      onEarnXp(25, 'Оркестрация нового учебного пути');
    } catch (e) {
      console.warn('Orchestration error:', e);
    } finally {
      setIsSynthesizing(false);
      setSynthesisStage('');
    }
  };

  // Node position update from canvas drag
  const handleUpdateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    setTrajectory((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    }));
  };

  // Handle Node Completion in Live Simulator
  const handleCompleteNode = (nodeId: string, earnedXp: number) => {
    playByteSound('levelUp');
    onEarnXp(earnedXp, `Завершение микро-модуля #${nodeId}`);

    setTrajectory((prev) => {
      // Find downstream nodes to unlock
      const currentNode = prev.nodes.find((n) => n.id === nodeId);
      const unlockedNodeIds = currentNode ? currentNode.outputs : [];

      const updatedNodes = prev.nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, status: 'completed' as const, completedAt: new Date().toISOString() };
        }
        if (unlockedNodeIds.includes(n.id) && n.status === 'locked') {
          return { ...n, status: 'active' as const };
        }
        return n;
      });

      return {
        ...prev,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString(),
      };
    });

    onUnlockAchievement('first_step');
  };

  // Dynamic Path Adaptation (Live Feedback Loop)
  const handleAdaptPath = () => {
    setIsAdapting(true);
    playByteSound('beep');

    setTimeout(() => {
      setTrajectory((prev) => {
        // Add an adaptive bonus research node into the graph
        const newNodeId = `node-adapt-${Date.now()}`;
        const lastNode = prev.nodes[prev.nodes.length - 1];

        const adaptiveNode: SpatialNode = {
          id: newNodeId,
          title: '★ Адаптивный спецмодуль: Стресс-тест в экстремальных условиях',
          category: 'eval',
          status: 'active',
          position: {
            x: lastNode ? lastNode.position.x + 240 : 700,
            y: lastNode ? lastNode.position.y - 40 : 200,
          },
          xpReward: 150,
          estimatedMinutes: 15,
          simulatorType: lastNode ? lastNode.simulatorType : 'rag_agent',
          summary: 'Персонально адаптированное углубленное испытание по результатам прогресса',
          instruction: 'ИИ-Оркестратор сгенерировал дополнительный вызов: проверь устойчивость системы к аномальным возмущениям.',
          cognitiveLoad: { intrinsic: 55, germane: 45, extraneous: 0 },
          inputs: lastNode ? [lastNode.id] : [],
          outputs: [],
        };

        const newEdge: SpatialEdge = {
          id: `edge-adapt-${Date.now()}`,
          from: lastNode ? lastNode.id : prev.nodes[0].id,
          to: newNodeId,
          label: 'Адаптация пути',
          isActive: true,
        };

        return {
          ...prev,
          nodes: [...prev.nodes, adaptiveNode],
          edges: [...prev.edges, newEdge],
          byteAdvice: 'Байт адаптировал твой путь! На основе твоего высокого темпа добавлен специальный исследовательский модуль с повышенной наградой.',
          cognitiveLoad: { intrinsic: 50, germane: 50, extraneous: 0 },
        };
      });

      setIsAdapting(false);
      playByteSound('success');
      onEarnXp(40, 'Динамическая адаптация пути ИИ');
    }, 800);
  };

  // Render appropriate simulator widget
  const renderLiveSimulator = () => {
    if (!activeNode) return null;

    switch (activeNode.simulatorType) {
      case 'rag_agent':
        return <LiveRagSimulator node={activeNode} onCompleteNode={handleCompleteNode} />;
      case 'marine_cv':
        return <MarineCvSimulator node={activeNode} onCompleteNode={handleCompleteNode} />;
      case 'drone_flight':
        return <DroneSwarmSimulator node={activeNode} onCompleteNode={handleCompleteNode} />;
      case 'token_optimizer':
        return <TokenOptimizerSimulator node={activeNode} onCompleteNode={handleCompleteNode} />;
      default:
        return <LiveRagSimulator node={activeNode} onCompleteNode={handleCompleteNode} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PILLAR 1: INTENT-ORIENTED & AGENTIC UX COMMAND BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-20 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>ИИ-ОРКЕСТРАТОР СЮТ СОЧИ</span>
                <span aria-hidden="true">·</span>
                <span>AGENTIC UX DISPATCHER</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {trajectory.title}
              </h2>
            </div>
          </div>

          {/* Quick Pre-set Intent Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
            <span className="text-[11px] font-mono text-slate-500 shrink-0">Интенты СЮТ:</span>
            {INITIAL_INTENTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIntentInput(item.intent);
                  handleOrchestrate(item.intent);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all text-[11px] whitespace-nowrap cursor-pointer shrink-0"
              >
                {item.type === 'rag_agent' && '📚 RAG-Агент'}
                {item.type === 'marine_cv' && '⚓ Катер Сочи'}
                {item.type === 'drone_flight' && '🛸 Дроны Ахун'}
                {item.type === 'token_optimizer' && '⚡ Токены'}
              </button>
            ))}
          </div>
        </div>

        {/* Intent One-Box Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOrchestrate();
          }}
          className="mt-4 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              placeholder="Сформулируй свой интент (например: «Хочу собрать RAG-агента для архивов СЮТ»)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none pr-16 font-sans transition-all shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 border border-slate-800 bg-slate-900 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </div>

          <button
            type="submit"
            disabled={isSynthesizing || !intentInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/25 cursor-pointer shrink-0"
          >
            {isSynthesizing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Оркестрация...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Оркестровать путь</span>
              </>
            )}
          </button>
        </form>

        {/* Synthesis Status Banner */}
        {isSynthesizing && (
          <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-cyan-300 font-mono animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>{synthesisStage}</span>
          </div>
        )}

        {/* Byte Advice Bubble */}
        {trajectory.byteAdvice && !isSynthesizing && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
            <span className="text-base leading-none shrink-0 mt-0.5">🤖</span>
            <div className="leading-relaxed">
              <strong className="text-cyan-300 font-mono mr-1">Робот Байт:</strong>
              {trajectory.byteAdvice}
            </div>
          </div>
        )}
      </div>

      {/* 2. PILLAR 4: COGNITIVE LOAD ARCHITECTURE & MENTAL MODE SWITCHER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Mental Effort Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setMentalMode('split')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mentalMode === 'split'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Сплит-студия</span>
          </button>

          <button
            onClick={() => setMentalMode('spatial')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mentalMode === 'spatial'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Холст связей (Germane)</span>
          </button>

          <button
            onClick={() => setMentalMode('simulator')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mentalMode === 'simulator'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live-Симулятор (Intrinsic)</span>
          </button>
        </div>

        {/* Cognitive Load Telemetry Bar (Sweller's Theory) */}
        <div className="flex items-center gap-4 text-xs font-mono w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Сущностная: {trajectory.cognitiveLoad.intrinsic}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Синтез: {trajectory.cognitiveLoad.germane}%</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Шум UI: 0%</span>
            </div>
          </div>

          {/* Dynamic Adaptation Trigger */}
          <button
            onClick={handleAdaptPath}
            disabled={isAdapting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/60 text-purple-300 text-xs font-mono font-medium transition-colors cursor-pointer shrink-0"
            title="Динамически мутировать граф на основе прогресса"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAdapting ? 'animate-spin' : ''}`} />
            <span>Адаптировать путь</span>
          </button>
        </div>
      </div>

      {/* 3. PILLAR 2 & 3: SPATIAL CANVASES & GENERATIVE LIVE-SIMULATORS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* LEFT / TOP: SPATIAL CANVAS */}
        {(mentalMode === 'split' || mentalMode === 'spatial') && (
          <div
            className={`transition-all ${
              mentalMode === 'spatial' ? 'lg:col-span-12 h-[680px]' : 'lg:col-span-6 h-[580px]'
            }`}
          >
            <SpatialCanvas
              nodes={trajectory.nodes}
              edges={trajectory.edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                playByteSound('beep');
              }}
              onUpdateNodePosition={handleUpdateNodePosition}
            />
          </div>
        )}

        {/* RIGHT / BOTTOM: GENERATIVE & ADAPTIVE LIVE-SIMULATOR WIDGET */}
        {(mentalMode === 'split' || mentalMode === 'simulator') && (
          <div
            className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl overflow-y-auto ${
              mentalMode === 'simulator' ? 'lg:col-span-12' : 'lg:col-span-6 h-[580px]'
            }`}
          >
            {renderLiveSimulator()}
          </div>
        )}
      </div>

      {/* Trajectory Navigation Footer Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">ТОПОЛОГИЯ:</span>
          <span>Всего узлов: {trajectory.nodes.length}</span>
          <span aria-hidden="true">·</span>
          <span>Освоено: {trajectory.nodes.filter(n => n.status === 'completed').length}</span>
          <span aria-hidden="true">·</span>
          <span>Награда пути: +{trajectory.nodes.reduce((acc, n) => acc + n.xpReward, 0)} XP</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">Станция Юных Техников г. Сочи</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-300">Платформа Кибер-Обучения 2026</span>
        </div>
      </div>
    </div>
  );
};
