import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SpatialNode, SpatialEdge, NodeStatus } from '../data/spatialGraphData';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Move,
  RotateCcw
} from 'lucide-react';

interface SpatialCanvasProps {
  nodes: SpatialNode[];
  edges: SpatialEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onAddCustomNode?: () => void;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pan and Zoom transform state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [zoom, setZoom] = useState<number>(0.95);
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging individual node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas bounds calculation for auto-fit
  const nodeMap = useMemo(() => {
    const map = new Map<string, SpatialNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Handle pan drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // If target is node card or button, don't pan canvas
    if ((e.target as HTMLElement).closest('.spatial-node') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsPanning(true);
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = Math.round((e.clientX - pan.x - dragOffsetRef.current.x) / zoom);
      const newY = Math.round((e.clientY - pan.y - dragOffsetRef.current.y) / zoom);
      onUpdateNodePosition(draggingNodeId, {
        x: Math.max(10, Math.min(1400, newX)),
        y: Math.max(10, Math.min(800, newY)),
      });
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(1.4, Math.max(0.45, prev * zoomFactor)));
  };

  const handleFitToView = () => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const maxX = Math.max(...nodes.map((n) => n.position.x + 240));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxY = Math.max(...nodes.map((n) => n.position.y + 140));

    const width = maxX - minX;
    const height = maxY - minY;

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 500;

    const fitZoom = Math.min(0.9, Math.max(0.55, Math.min(containerWidth / (width + 120), containerHeight / (height + 120))));
    setZoom(fitZoom);
    setPan({
      x: (containerWidth - width * fitZoom) / 2 - minX * fitZoom,
      y: (containerHeight - height * fitZoom) / 2 - minY * fitZoom,
    });
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: SpatialNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    dragOffsetRef.current = {
      x: e.clientX - (node.position.x * zoom + pan.x),
      y: e.clientY - (node.position.y * zoom + pan.y),
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 select-none cursor-grab active:cursor-grabbing border border-slate-800 rounded-2xl shadow-inner"
    >
      {/* Background Spatial Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <pattern id="spatial-grid" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <circle cx="1.5" cy="1.5" r="1.5" fill="#38bdf8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spatial-grid)" />
      </svg>

      {/* Canvas Layer Container */}
      <div
        className="absolute top-0 left-0 w-full h-full origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {/* SVG Connections Layer (Bézier Curves) */}
        <svg
          className="absolute top-0 left-0 w-[2400px] h-[1600px] pointer-events-none overflow-visible"
          style={{ zIndex: 1 }}
        >
          <defs>
            <linearGradient id="edge-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edge-gradient-muted" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.from);
            const targetNode = nodeMap.get(edge.to);
            if (!sourceNode || !targetNode) return null;

            // Connection ports (from right side of source to left side of target)
            const x1 = sourceNode.position.x + 230;
            const y1 = sourceNode.position.y + 65;
            const x2 = targetNode.position.x;
            const y2 = targetNode.position.y + 65;

            const dx = Math.abs(x2 - x1);
            const cp1x = x1 + Math.max(60, dx * 0.45);
            const cp2x = x2 - Math.max(60, dx * 0.45);

            const pathData = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
            const isConnectionActive = sourceNode.status === 'completed' || sourceNode.status === 'active';

            return (
              <g key={edge.id}>
                {/* Glow shadow line */}
                {isConnectionActive && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="5"
                    strokeOpacity="0.15"
                  />
                )}

                {/* Main Curve */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isConnectionActive ? 'url(#edge-gradient-active)' : 'url(#edge-gradient-muted)'}
                  strokeWidth={isConnectionActive ? '2.5' : '1.5'}
                  strokeDasharray={isConnectionActive ? 'none' : '4 4'}
                />

                {/* Animated data particle moving along path */}
                {isConnectionActive && (
                  <circle r="3.5" fill="#38bdf8">
                    <animateMotion
                      path={pathData}
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Optional Edge Label */}
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Spatial Node Cards */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isCompleted = node.status === 'completed';
          const isActive = node.status === 'active';
          const isLocked = node.status === 'locked';

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`spatial-node absolute w-[230px] rounded-xl border p-3.5 transition-all select-none cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400 z-20'
                  : isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-md hover:border-emerald-400 z-10'
                  : isActive
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg hover:border-cyan-300 z-10 animate-pulse'
                  : 'bg-slate-950/70 border-slate-800 text-slate-500 opacity-75 z-0'
              }`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
            >
              {/* Node Header */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] text-slate-400 font-semibold tracking-wide flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  {node.category.toUpperCase()}
                </span>

                {isCompleted ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    +{node.xpReward} XP
                  </span>
                ) : isLocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    <Lock className="w-3 h-3" />
                    БЛОК
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 font-bold">
                    <Zap className="w-3 h-3 fill-current" />
                    +{node.xpReward} XP
                  </span>
                )}
              </div>

              {/* Node Title */}
              <h4 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2">
                {node.title}
              </h4>

              {/* Node Summary */}
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                {node.summary}
              </p>

              {/* Cognitive Load Metric Indicator */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span title="Сущностная нагрузка задачи">Intr: {node.cognitiveLoad.intrinsic}%</span>
                <span aria-hidden="true">·</span>
                <span title="Конструктивная ментальная нагрузка">Germ: {node.cognitiveLoad.germane}%</span>
                <span aria-hidden="true">·</span>
                <span>{node.estimatedMinutes}м</span>
              </div>

              {/* Anchor Ports */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow" />
              <div className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow ${
                isCompleted ? 'bg-emerald-400 border border-emerald-200' : 'bg-cyan-500 border border-cyan-200'
              }`} />
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Controls HUD */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl text-xs">
        <button
          onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Приблизить"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.45, z - 0.15))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Отдалить"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitToView}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Вместить весь граф (Fit)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-800 mx-1" />
        <span className="font-mono text-[11px] text-cyan-300 font-bold px-1.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Minimap in Bottom-Right Corner */}
      <div className="absolute bottom-4 right-4 z-30 hidden sm:block w-36 h-24 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-2xl">
        <div className="text-[9px] font-mono text-slate-500 mb-1 flex items-center justify-between">
          <span>SPATIAL MINIMAP</span>
          <span className="text-cyan-400">{nodes.length} узлов</span>
        </div>
        <div className="relative w-full h-14 bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`absolute w-2 h-1.5 rounded-xs ${
                n.id === selectedNodeId
                  ? 'bg-cyan-300 ring-1 ring-cyan-400'
                  : n.status === 'completed'
                  ? 'bg-emerald-400'
                  : 'bg-slate-600'
              }`}
              style={{
                left: `${Math.min(110, Math.max(4, (n.position.x / 800) * 110))}px`,
                top: `${Math.min(42, Math.max(4, (n.position.y / 400) * 42))}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
