import React, { useState, useEffect, useRef } from 'react';
import { SpatialNode } from '../../data/spatialGraphData';
import {
  Activity,
  Sliders,
  CheckCircle2,
  Zap,
  Play,
  RotateCcw,
  Shield,
  Eye,
  Info
} from 'lucide-react';

interface MarineCvSimulatorProps {
  node: SpatialNode;
  onCompleteNode: (nodeId: string, earnedXp: number) => void;
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
  type: 'buoy' | 'rock' | 'pier';
  label: string;
  detected: boolean;
  confidence: number;
}

export const MarineCvSimulator: React.FC<MarineCvSimulatorProps> = ({
  node,
  onCompleteNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [isStormActive, setIsStormActive] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [detectionsCount, setDetectionsCount] = useState<number>(0);
  const [passedObstacles, setPassedObstacles] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(node.status === 'completed');

  // Catamaran position & state
  const boatRef = useRef({
    x: 60,
    y: 150,
    angle: 0,
    speed: 1.8,
    targetAngle: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([
    { x: 220, y: 130, radius: 18, type: 'buoy', label: 'Буй №4 (Фарватер)', detected: false, confidence: 0.92 },
    { x: 380, y: 190, radius: 24, type: 'rock', label: 'Риф мыса Видный', detected: false, confidence: 0.88 },
    { x: 520, y: 110, radius: 20, type: 'buoy', label: 'Буй южный', detected: false, confidence: 0.78 },
    { x: 650, y: 170, radius: 30, type: 'pier', label: 'Мол порта Сочи', detected: false, confidence: 0.95 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Water background with gentle waves
      ctx.fillStyle = isStormActive ? '#091e36' : '#07162c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw wave lines
      ctx.strokeStyle = isStormActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      const time = Date.now() * 0.002;
      for (let y = 30; y < canvas.height; y += 40) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 15) {
          const wave = Math.sin(x * 0.03 + time + y) * (isStormActive ? 6 : 3);
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      // Update boat position
      const boat = boatRef.current;
      if (isRunning) {
        // Simple steering away from obstacles
        let steer = 0;
        let detectedNow = 0;

        obstaclesRef.current.forEach((obs) => {
          const dx = obs.x - boat.x;
          const dy = obs.y - boat.y;
          const dist = Math.hypot(dx, dy);

          // Simulated vision cone detection
          const isAhead = dx > 0 && Math.abs(dy) < 70 && dist < 140;
          const stormNoise = isStormActive ? (Math.random() * 0.25 - 0.12) : 0;
          const effectiveConf = Math.max(0.1, Math.min(0.99, obs.confidence + stormNoise));

          if (isAhead && effectiveConf >= confidenceThreshold) {
            obs.detected = true;
            detectedNow++;
            // Steer away
            if (dy > 0) steer -= 0.04;
            else steer += 0.04;
          } else if (dist > 160) {
            obs.detected = false;
          }
        });

        setDetectionsCount(detectedNow);

        boat.angle += (steer - boat.angle) * 0.1;
        boat.x += Math.cos(boat.angle) * boat.speed;
        boat.y += Math.sin(boat.angle) * boat.speed;

        // Loop boat back to start
        if (boat.x > canvas.width + 30) {
          boat.x = -20;
          boat.y = 150;
          boat.angle = 0;
          setPassedObstacles((c) => c + 4);
        }
      }

      // 2. Draw Obstacles
      obstaclesRef.current.forEach((obs) => {
        ctx.save();
        // Base shape
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        if (obs.type === 'buoy') {
          ctx.fillStyle = '#ef4444';
        } else if (obs.type === 'rock') {
          ctx.fillStyle = '#64748b';
        } else {
          ctx.fillStyle = '#eab308';
        }
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. CV Bounding Box if detected
        if (obs.detected) {
          const boxPadding = 8;
          const bx = obs.x - obs.radius - boxPadding;
          const by = obs.y - obs.radius - boxPadding;
          const bsize = (obs.radius + boxPadding) * 2;

          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bsize, bsize);

          // Confidence Tag
          ctx.fillStyle = 'rgba(8, 51, 68, 0.9)';
          ctx.fillRect(bx, by - 16, 90, 14);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px monospace';
          ctx.fillText(`CV: ${Math.round(obs.confidence * 100)}%`, bx + 4, by - 5);
        }
        ctx.restore();
      });

      // 4. Draw Catamaran Boat
      ctx.save();
      ctx.translate(boat.x, boat.y);
      ctx.rotate(boat.angle);

      // Vision cone
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(130, -50);
      ctx.lineTo(130, 50);
      ctx.closePath();
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.stroke();

      // Twin hulls (catamaran)
      ctx.fillStyle = '#38bdf8';
      // Left hull
      ctx.fillRect(-16, -12, 32, 6);
      // Right hull
      ctx.fillRect(-16, 6, 32, 6);
      // Bridge
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-8, -6, 16, 12);
      // Bow marker
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(14, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [confidenceThreshold, isStormActive, isRunning]);

  const handleFinishStep = () => {
    setHasCompleted(true);
    onCompleteNode(node.id, node.xpReward);
  };

  const handleResetBoat = () => {
    boatRef.current.x = 40;
    boatRef.current.y = 150;
    boatRef.current.angle = 0;
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE-СИМУЛЯТОР CV · УЗЕЛ #{node.id}</span>
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

      {/* Interactive 2D Sea Canvas */}
      <div className="relative border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={760}
          height={300}
          className="w-full h-[280px] block cursor-crosshair"
        />

        {/* Real-time telemetry HUD overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1 text-slate-300 pointer-events-none">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Eye className="w-3.5 h-3.5" />
            <span>ТЕЛЕМЕТРИЯ CV «РИВЬЕРА-1»</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Детекций в конусе:</span>
            <span className="text-white font-bold">{detectionsCount} объекта</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Пройдено преград:</span>
            <span className="text-emerald-400 font-bold">{passedObstacles}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Состояние моря:</span>
            <span className={isStormActive ? 'text-amber-400 font-bold' : 'text-cyan-300'}>
              {isStormActive ? 'Шторм 3 балла' : 'Штиль (1 балл)'}
            </span>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={() => setIsStormActive(!isStormActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer border ${
              isStormActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isStormActive ? 'Шторм: ВКЛ' : 'Включить шторм'}
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white cursor-pointer"
            title={isRunning ? 'Пауза' : 'Пуск'}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleResetBoat}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white cursor-pointer"
            title="Сброс позиции"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CV Hyperparameter Sliders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Порог уверенности детекции (Confidence Threshold)
          </span>
          <span className="font-mono text-cyan-300 font-bold">{Math.round(confidenceThreshold * 100)}%</span>
        </div>

        <input
          type="range"
          min={0.2}
          max={0.95}
          step={0.05}
          value={confidenceThreshold}
          onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Низкий (0.20): частые ложные тревоги</span>
          <span>Оптимум (0.65): надежное распознавание буев</span>
          <span>Высокий (0.95): риск пропуска рифов в шторм</span>
        </div>
      </div>

      {/* EdTech Mental Note */}
      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-medium">Ментальная модель Computer Vision: </strong>
          Детектор YOLO генерирует тысячи рамок кандидатов. Слишком высокий порог отсекает слабоосвещенные объекты во время шторма, а слишком низкий перегружает рулевой контроллер ложными уклонениями от пены.
        </div>
      </div>
    </div>
  );
};
