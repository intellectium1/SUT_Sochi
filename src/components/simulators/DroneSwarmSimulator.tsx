import React, { useState } from 'react';
import { SpatialNode } from '../../data/spatialGraphData';
import {
  Activity,
  CheckCircle2,
  Zap,
  Wind,
  Navigation,
  Send,
  Sparkles,
  Sliders,
  Check,
  Compass,
  Info
} from 'lucide-react';

interface DroneSwarmSimulatorProps {
  node: SpatialNode;
  onCompleteNode: (nodeId: string, earnedXp: number) => void;
}

interface DroneState {
  id: number;
  callsign: string;
  role: string;
  altitude: number; // meters
  battery: number;  // %
  sensor: 'thermal' | 'optical' | 'lidar';
  status: 'searching' | 'hovering' | 'compensating_wind';
  sector: string;
}

export const DroneSwarmSimulator: React.FC<DroneSwarmSimulatorProps> = ({
  node,
  onCompleteNode,
}) => {
  const [windSpeed, setWindSpeed] = useState<number>(11); // m/s
  const [nlCommand, setNlCommand] = useState<string>('Дрон 2, снизься до 45м над северным ущельем и включи тепловизор');
  const [executedCall, setExecutedCall] = useState<any>({
    function: 'dispatchDroneMission',
    droneId: 2,
    waypoint: [120, 45, -80],
    targetAltitude: 45,
    activeSensor: 'thermal',
    sector: 'Северное ущелье Ахун',
  });
  const [hasCompleted, setHasCompleted] = useState<boolean>(node.status === 'completed');

  const [drones, setDrones] = useState<DroneState[]>([
    { id: 1, callsign: 'Ахун-Alpha', role: 'Лидер разведки', altitude: 90, battery: 84, sensor: 'optical', status: 'searching', sector: 'Смотровая башня' },
    { id: 2, callsign: 'Ахун-Beta', role: 'Тепловизионный поиск', altitude: 45, battery: 72, sensor: 'thermal', status: 'searching', sector: 'Северное ущелье' },
    { id: 3, callsign: 'Ахун-Gamma', role: 'Метеоретранслятор', altitude: 140, battery: 91, sensor: 'lidar', status: 'hovering', sector: 'Базовый лагерь СЮТ' },
  ]);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlCommand.trim()) return;

    // Simulate Function Calling parse
    const lower = nlCommand.toLowerCase();
    const droneId = lower.includes('1') ? 1 : lower.includes('3') ? 3 : 2;
    const altitude = lower.includes('снизься') || lower.includes('40') || lower.includes('45') ? 40 : 100;
    const sensor = lower.includes('тепло') ? 'thermal' : lower.includes('лидар') ? 'lidar' : 'optical';
    const sector = lower.includes('ущель') ? 'Северное ущелье' : lower.includes('башн') ? 'Башня Ахун' : 'Сектор поиска №3';

    setExecutedCall({
      function: 'dispatchDroneMission',
      droneId,
      waypoint: [Math.floor(Math.random() * 200), altitude, Math.floor(Math.random() * 100)],
      targetAltitude: altitude,
      activeSensor: sensor,
      sector,
      windCompensationGain: Number((windSpeed * 0.12).toFixed(2)),
    });

    setDrones((prev) =>
      prev.map((d) =>
        d.id === droneId
          ? { ...d, altitude, sensor: sensor as any, sector, status: 'compensating_wind' }
          : d
      )
    );
  };

  const handleFinishStep = () => {
    setHasCompleted(true);
    onCompleteNode(node.id, node.xpReward);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE-СИМУЛЯТОР БПЛА · УЗЕЛ #{node.id}</span>
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

      {/* Drones Swarm Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {drones.map((d) => (
          <div key={d.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                {d.callsign}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                АКБ {d.battery}%
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-sans">{d.role}</div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[11px] font-mono">
              <div>
                <span className="text-slate-500">Высота: </span>
                <span className="text-slate-200 font-bold">{d.altitude}м</span>
              </div>
              <div>
                <span className="text-slate-500">Сенсор: </span>
                <span className="text-purple-300 font-bold">{d.sensor}</span>
              </div>
              <div className="col-span-2 text-slate-400 truncate">
                <span className="text-slate-500">Сектор: </span>
                <span>{d.sector}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wind & Environment Sliders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            Горный ветер на смотровой башне Ахун (660м)
          </span>
          <span className="font-mono text-cyan-300 font-bold">{windSpeed} м/с</span>
        </div>

        <input
          type="range"
          min={2}
          max={18}
          step={1}
          value={windSpeed}
          onChange={(e) => setWindSpeed(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Штиль (2 м/с)</span>
          <span>Рабочий бриз (10-12 м/с)</span>
          <span>Штормовой предел (18 м/с)</span>
        </div>
      </div>

      {/* Natural Language Command Bar */}
      <form onSubmit={handleDispatch} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          Естественно-языковая команда для роя БПЛА (Agentic Function Calling):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nlCommand}
            onChange={(e) => setNlCommand(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-sans"
            placeholder="Например: Дрон 1, набери высоту 120м над башней..."
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Разобрать команду</span>
          </button>
        </div>
      </form>

      {/* Function Calling Output Inspector */}
      {executedCall && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300 font-mono font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Сгенерированный Function Call для автопилота:
            </span>
            <span className="text-[10px] text-emerald-400">Синхронизировано по радиоканалу</span>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(executedCall, null, 2)}
          </pre>
        </div>
      )}

      {/* EdTech Mental Note */}
      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-medium">Ментальная модель Мультиагентных систем: </strong>
          LLM-модель не управляет моторами напрямую. Она преобразует размытую интенцию человека в строгую схему аргументов (Function Calling), а локальный ПИД-регулятор каждого дрона компенсирует горный ветер в реальном времени.
        </div>
      </div>
    </div>
  );
};
