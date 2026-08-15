import React, { useState, useRef, useEffect } from 'react';
import { Formula } from '../../types';
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Grid, Tag, 
  Layers, Eye, Play, Pause, Compass, Activity, ArrowUp, ArrowDown
} from 'lucide-react';

interface Engineering2DLabProps {
  formula: Formula;
  values: Record<string, number>;
  onValueChange: (key: string, val: number) => void;
  calculatedValue: number;
  simTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  highlightedVariable?: string;
  // Rearrangement: when set, the simulation uses these to show the "solved" output state
  activeRearrangementTarget?: string;  // e.g. "F", "V", "σ" — the symbol being solved for
}

export const Engineering2DLab: React.FC<Engineering2DLabProps> = ({
  formula,
  values = {},
  onValueChange,
  calculatedValue,
  simTime,
  isPlaying,
  onTogglePlay,
  onReset,
  highlightedVariable,
  activeRearrangementTarget,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.6, prev - 0.15));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Canvas Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeHandle) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    if (activeHandle && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgY = (e.clientY - rect.top - pan.y) / zoom;
      const svgX = (e.clientX - rect.left - pan.x) / zoom;

      if (formula.id === 'mech-normal-stress') {
        if (activeHandle === 'force') {
          const newF = Math.round(Math.max(10, Math.min(400, (180 - svgY) * 2.5)));
          onValueChange('F', newF);
        } else if (activeHandle === 'area') {
          const newA = parseFloat(Math.max(0.01, Math.min(0.20, (svgX - 300) / 700 + 0.05)).toFixed(3));
          onValueChange('A', newA);
        }
      } else if (formula.id === 'mech-beam-deflection') {
        if (activeHandle === 'load') {
          const newP = Math.round(Math.max(5, Math.min(80, (190 - svgY) * 1.2)));
          onValueChange('P', newP);
        } else if (activeHandle === 'span') {
          const newL = parseFloat(Math.max(2, Math.min(10, (svgX - 100) / 50)).toFixed(1));
          onValueChange('L', newL);
        }
      } else if (formula.id === 'mech-torsion-shaft') {
        if (activeHandle === 'torque') {
          const newT = Math.round(Math.max(1, Math.min(40, (svgY - 80) * 0.4)));
          onValueChange('T', Math.abs(newT));
        } else if (activeHandle === 'radius') {
          const newR = Math.round(Math.max(20, Math.min(80, (svgY - 140) * 1.5)));
          onValueChange('r', newR);
        }
      } else if (formula.id === 'civil-hydrostatic-pressure') {
        if (activeHandle === 'depth') {
          const newH = Math.round(Math.max(1, Math.min(30, (svgY - 60) / 5)));
          onValueChange('h', newH);
        }
      } else if (formula.id === 'civil-euler-buckling') {
        if (activeHandle === 'length') {
          const newL = parseFloat(Math.max(2, Math.min(8, (svgY - 50) / 25)).toFixed(1));
          onValueChange('L', newL);
        }
      } else if (formula.id === 'phys-kinetic-energy') {
        if (activeHandle === 'velocity') {
          const newV = Math.round(Math.max(5, Math.min(50, (svgX - 250) / 4)));
          onValueChange('v', newV);
        } else if (activeHandle === 'mass') {
          const newM = Math.round(Math.max(200, Math.min(2000, (svgY - 100) * 15)));
          onValueChange('m', newM);
        }
      } else if (formula.id === 'elec-ohms-law') {
        if (activeHandle === 'voltage') {
          const newV = Math.round(Math.max(2, Math.min(48, (180 - svgY) * 0.5)));
          onValueChange('V', newV);
        } else if (activeHandle === 'resistance') {
          const newR = parseFloat(Math.max(1, Math.min(24, (svgX - 260) / 8)).toFixed(1));
          onValueChange('R', newR);
        }
      } else if (formula.id === 'math-area-circle') {
        if (activeHandle === 'radius') {
          const dist = Math.sqrt(Math.pow(svgX - 300, 2) + Math.pow(svgY - 160, 2));
          const newR = parseFloat(Math.max(1, Math.min(15, dist / 9)).toFixed(1));
          onValueChange('r', newR);
        }
      } else if (formula.id === 'mech-bending-stress') {
        if (activeHandle === 'moment') {
          const newM = Math.round(Math.max(10, Math.min(150, (svgX - 200) * 0.8)));
          onValueChange('M', newM);
        } else if (activeHandle === 'fiberY') {
          const newY = Math.round(Math.max(20, Math.min(200, Math.abs(160 - svgY) * 2)));
          onValueChange('y', newY);
        }
      } else if (formula.id === 'phys-hookes-law') {
        if (activeHandle === 'displacement') {
          const newX = Math.round(Math.max(2, Math.min(30, (svgX - 240) / 6)));
          onValueChange('x', newX);
        }
      } else if (formula.id === 'elec-electrical-power') {
        if (activeHandle === 'voltage') {
          const newV = Math.round(Math.max(12, Math.min(240, (190 - svgY) * 2)));
          onValueChange('V', newV);
        } else if (activeHandle === 'current') {
          const newI = parseFloat(Math.max(1, Math.min(20, (svgX - 240) / 8)).toFixed(1));
          onValueChange('I', newI);
        }
      } else if (formula.id === 'phys-newton-second-law') {
        if (activeHandle === 'force') {
          const newA = parseFloat(Math.max(1, Math.min(20, (svgX - 300) / 8)).toFixed(1));
          onValueChange('a', newA);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setActiveHandle(null);
  };

  // Helper to extract effective value for any parameter, taking active rearrangement target into account
  const getVal = (key: string, fallback: number) => {
    if (activeRearrangementTarget === key && typeof calculatedValue === 'number' && !isNaN(calculatedValue)) {
      return calculatedValue;
    }
    return values[key] ?? fallback;
  };

  // Render Formula Specific 2D Physics Scene
  const renderSimulationScene = () => {
    const simKey = formula.simulation?.type || formula.id;
    switch (simKey) {
      // ----------------------------------------------------
      // 1. NORMAL STRESS SIMULATION (σ = F / A)
      // ----------------------------------------------------
      case 'normal-stress-axial':
      case 'mech-normal-stress': {
        const force = values['F'] ?? 120;
        const area = values['A'] ?? 0.04;
        const stress = calculatedValue || ((force * 1000) / (area * 1000000));
        
        const colWidth = Math.max(40, Math.min(180, 40 + (area / 0.20) * 140));
        const colHeight = 150;
        const colX = 300 - colWidth / 2;
        const colY = 90;

        const arrowLen = Math.max(30, Math.min(85, 30 + (force / 400) * 55));
        const stressRatio = Math.min(1, Math.max(0, stress / 10));
        const stressColor = stressRatio < 0.25 ? '#3B82F6' : stressRatio < 0.5 ? '#10B981' : stressRatio < 0.75 ? '#F59E0B' : '#EF4444';

        return (
          <g>
            <rect x={colX - 10} y={colY - 8} width={colWidth + 20} height="8" rx="2" fill="#334155" />
            <defs>
              <linearGradient id="stressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={stressColor} stopOpacity="0.85" />
                <stop offset="50%" stopColor={stressColor} stopOpacity="0.65" />
                <stop offset="100%" stopColor={stressColor} stopOpacity="0.85" />
              </linearGradient>
            </defs>

            <rect
              x={colX}
              y={colY}
              width={colWidth}
              height={colHeight}
              fill="url(#stressGrad)"
              stroke="#0F172A"
              strokeWidth="2"
            />

            {Array.from({ length: Math.floor(colWidth / 18) }).map((_, i) => (
              <line
                key={`vert-${i}`}
                x1={colX + (i + 1) * 18}
                y1={colY}
                x2={colX + (i + 1) * 18}
                y2={colY + colHeight}
                stroke="#0F172A"
                strokeWidth="0.75"
                strokeDasharray="3 3"
                opacity="0.3"
              />
            ))}

            <rect x={colX - 15} y={colY + colHeight} width={colWidth + 30} height="10" fill="#334155" rx="2" />
            {Array.from({ length: Math.floor((colWidth + 30) / 10) }).map((_, i) => (
              <line
                key={`hatch-${i}`}
                x1={colX - 15 + i * 10}
                y1={colY + colHeight + 10}
                x2={colX - 25 + i * 10}
                y2={colY + colHeight + 18}
                stroke="#64748B"
                strokeWidth="1.5"
              />
            ))}

            <g className="cursor-ns-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('force'); }}>
              <line
                x1="300"
                y1={colY - 8 - arrowLen}
                x2="300"
                y2={colY - 8}
                stroke="#EF4444"
                strokeWidth="3.5"
                markerEnd="url(#arrow-force)"
              />
              <rect x="235" y={colY - 26 - arrowLen} width="130" height="20" rx="3" fill="#FEF2F2" stroke="#F87171" strokeWidth="1" />
              <text x="300" y={colY - 12 - arrowLen} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-red-700">
                F = {force} kN (Drag ↑↓)
              </text>
            </g>

            {showDimensions && (
              <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('area'); }}>
                <line x1={colX} y1={colY + colHeight + 35} x2={colX + colWidth} y2={colY + colHeight + 35} stroke="#0EA5E9" strokeWidth="1.5" />
                <line x1={colX} y1={colY + colHeight + 25} x2={colX} y2={colY + colHeight + 45} stroke="#0EA5E9" strokeWidth="1.5" />
                <line x1={colX + colWidth} y1={colY + colHeight + 25} x2={colX + colWidth} y2={colY + colHeight + 45} stroke="#0EA5E9" strokeWidth="1.5" />
                <rect x="240" y={colY + colHeight + 40} width="120" height="18" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
                <text x="300" y={colY + colHeight + 53} textAnchor="middle" className="font-mono-tech text-[11px] font-bold fill-sky-700">
                  Area A = {area} m² (Drag ↔)
                </text>
              </g>
            )}

            {showLabels && (
              <g transform={`translate(300, ${colY + colHeight / 2})`}>
                <rect x="-70" y="-15" width="140" height="30" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-slate-900">
                  σ = {stress.toFixed(2)} MPa
                </text>
              </g>
            )}
          </g>
        );
      }

      // ----------------------------------------------------
      // 2. BEAM DEFLECTION (Δ = PL³ / 48EI)
      // ----------------------------------------------------
      case 'beam-deflection-elastic':
      case 'mech-beam-deflection': {
        const loadP = values['P'] ?? 30;
        const spanL = values['L'] ?? 5;
        const actualDelta = calculatedValue || 1.04;
        const visualSag = Math.min(45, Math.max(4, actualDelta * 22));

        const startX = 120;
        const endX = 480;
        const midX = (startX + endX) / 2;
        const baselineY = 140;

        return (
          <g>
            {showDimensions && (
              <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('span'); }}>
                <line x1={startX} y1="70" x2={endX} y2="70" stroke="#0EA5E9" strokeWidth="1.5" />
                <line x1={startX} y1="60" x2={startX} y2="80" stroke="#0EA5E9" strokeWidth="1.5" />
                <line x1={endX} y1="60" x2={endX} y2="80" stroke="#0EA5E9" strokeWidth="1.5" />
                <rect x="235" y="55" width="130" height="20" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
                <text x="300" y="69" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-sky-800">
                  Span L = {spanL} m (Drag ↔)
                </text>
              </g>
            )}

            <line x1={startX} y1={baselineY} x2={endX} y2={baselineY} stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />

            <path
              d={`M ${startX} ${baselineY} Q ${midX} ${baselineY + visualSag * 2} ${endX} ${baselineY}`}
              fill="none"
              stroke="#2563EB"
              strokeWidth="6"
              strokeLinecap="round"
            />

            <polygon points={`${startX},${baselineY} ${startX - 12},${baselineY + 24} ${startX + 12},${baselineY + 24}`} fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
            <line x1={startX - 18} y1={baselineY + 24} x2={startX + 18} y2={baselineY + 24} stroke="#0F172A" strokeWidth="2" />

            <polygon points={`${endX},${baselineY} ${endX - 12},${baselineY + 18} ${endX + 12},${baselineY + 18}`} fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx={endX - 6} cy={baselineY + 22} r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx={endX + 6} cy={baselineY + 22} r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
            <line x1={endX - 18} y1={baselineY + 26} x2={endX + 18} y2={baselineY + 26} stroke="#0F172A" strokeWidth="2" />

            <g className="cursor-ns-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('load'); }}>
              <line
                x1={midX}
                y1={baselineY + visualSag - 55}
                x2={midX}
                y2={baselineY + visualSag - 4}
                stroke="#EF4444"
                strokeWidth="4"
                markerEnd="url(#arrow-force)"
              />
              <rect x={midX - 65} y={baselineY + visualSag - 75} width="130" height="20" rx="3" fill="#FEF2F2" stroke="#F87171" strokeWidth="1" />
              <text x={midX} y={baselineY + visualSag - 61} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-red-700">
                P = {loadP} kN (Drag ↑↓)
              </text>
            </g>

            <g transform={`translate(${midX}, ${baselineY + visualSag + 20})`}>
              <line x1="0" y1="-18" x2="0" y2="0" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2" />
              <rect x="-85" y="0" width="170" height="34" rx="4" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1" />
              <text x="0" y="14" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-amber-900">
                Δ_max = {actualDelta.toFixed(2)} mm
              </text>
              <text x="0" y="27" textAnchor="middle" className="font-mono-tech text-[10px] fill-amber-700">
                [Elastic Deflection Profile]
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 3. TORSION IN CIRCULAR SHAFT (τ = Tr / J)
      // ----------------------------------------------------
      case 'torsional-shear-shaft':
      case 'mech-torsion-shaft': {
        const torque = values['T'] ?? 12;
        const radius = values['r'] ?? 45;
        const shearStress = calculatedValue || 50;

        const shaftLen = 280;
        const startX = 140;
        const endX = startX + shaftLen;
        const centerY = 150;
        const scaledRadius = Math.max(20, Math.min(60, radius * 0.9));
        const twistAngle = isPlaying ? (simTime * torque * 0.8) % 360 : 0;

        return (
          <g>
            <rect x={startX - 20} y={centerY - scaledRadius - 20} width="20" height={(scaledRadius + 20) * 2} fill="#334155" />
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={i}
                x1={startX - 20}
                y1={centerY - scaledRadius - 15 + i * 20}
                x2={startX - 32}
                y2={centerY - scaledRadius - 5 + i * 20}
                stroke="#94A3B8"
                strokeWidth="2"
              />
            ))}

            <rect
              x={startX}
              y={centerY - scaledRadius}
              width={shaftLen}
              height={scaledRadius * 2}
              fill="#E2E8F0"
              stroke="#0F172A"
              strokeWidth="2"
            />

            {[-0.6, 0, 0.6].map((offset, idx) => (
              <line
                key={idx}
                x1={startX}
                y1={centerY + scaledRadius * offset}
                x2={endX}
                y2={centerY + scaledRadius * offset + Math.sin((twistAngle * Math.PI) / 180 + idx) * 8}
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            ))}

            <ellipse
              cx={endX}
              cy={centerY}
              rx="18"
              ry={scaledRadius}
              fill="#CBD5E1"
              stroke="#0F172A"
              strokeWidth="2"
            />

            <g className="cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('torque'); }}>
              <path
                d={`M ${endX + 30} ${centerY - scaledRadius + 5} A 30 30 0 1 1 ${endX + 30} ${centerY + scaledRadius - 5}`}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="4"
                markerEnd="url(#arrow-force)"
              />
              <rect x={endX + 35} y={centerY - 25} width="125" height="20" rx="3" fill="#F5F3FF" stroke="#C4B5FD" strokeWidth="1" />
              <text x={endX + 97} y={centerY - 11} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-purple-700">
                T = {torque} kN·m (↻)
              </text>
            </g>

            {showDimensions && (
              <g className="cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('radius'); }}>
                <line x1={endX} y1={centerY} x2={endX} y2={centerY - scaledRadius} stroke="#0EA5E9" strokeWidth="2" />
                <circle cx={endX} cy={centerY} r="3" fill="#0EA5E9" />
                <rect x={endX - 100} y={centerY - scaledRadius / 2 - 10} width="90" height="20" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
                <text x={endX - 55} y={centerY - scaledRadius / 2 + 4} textAnchor="middle" className="font-mono-tech text-[11px] font-bold fill-sky-700">
                  r = {radius} mm
                </text>
              </g>
            )}

            <g transform={`translate(${startX + shaftLen / 2}, ${centerY + scaledRadius + 30})`}>
              <rect x="-80" y="-12" width="160" height="26" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="5" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-slate-900">
                τ_max = {shearStress.toFixed(2)} MPa
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 4. EULER COLUMN BUCKLING (P_cr = π²EI / (KL)²)
      // ----------------------------------------------------
      case 'euler-column-buckling':
      case 'civil-euler-buckling': {
        const lengthL = values['L'] ?? 3.5;
        const factorK = values['K'] ?? 1.0;
        const pCr = calculatedValue || 1600;

        const colTopY = 60;
        const colBotY = 250;
        const colMidY = (colTopY + colBotY) / 2;
        const colX = 300;

        // Animated lateral buckle wave (sine curve)
        const lateralAmp = isPlaying ? 28 + Math.sin(simTime * 2.5) * 6 : 28;

        return (
          <g>
            {/* Undeformed Centerline Axis (Dashed) */}
            <line x1={colX} y1={colTopY} x2={colX} y2={colBotY} stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Buckled Sinusoidal Lateral Profile */}
            <path
              d={`M ${colX} ${colTopY} Q ${colX + lateralAmp * 1.6} ${colMidY} ${colX} ${colBotY}`}
              fill="none"
              stroke="#2563EB"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Top Support */}
            <rect x={colX - 25} y={colTopY - 12} width="50" height="12" fill="#475569" rx="2" />
            {/* Top Compressive Axial Load Arrow */}
            <g className="cursor-ns-resize">
              <line x1={colX} y1={colTopY - 45} x2={colX} y2={colTopY - 12} stroke="#EF4444" strokeWidth="4" markerEnd="url(#arrow-force)" />
              <rect x={colX - 60} y={colTopY - 65} width="120" height="18" rx="3" fill="#FEF2F2" stroke="#F87171" strokeWidth="1" />
              <text x={colX} y={colTopY - 52} textAnchor="middle" className="font-mono-tech text-[11px] font-bold fill-red-700">
                P_applied (Axial)
              </text>
            </g>

            {/* Bottom Support */}
            <polygon points={`${colX},${colBotY} ${colX - 16},${colBotY + 20} ${colX + 16},${colBotY + 20}`} fill="#475569" />
            <line x1={colX - 25} y1={colBotY + 20} x2={colX + 25} y2={colBotY + 20} stroke="#0F172A" strokeWidth="2" />

            {/* Length Dimension Indicator */}
            {showDimensions && (
              <g className="cursor-ns-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('length'); }}>
                <line x1={colX - 70} y1={colTopY} x2={colX - 70} y2={colBotY} stroke="#0EA5E9" strokeWidth="1.5" />
                <line x1={colX - 80} y1={colTopY} x2={colX - 60} y2={colTopY} stroke="#0EA5E9" strokeWidth="1.5" />
                <line x1={colX - 80} y1={colBotY} x2={colX - 60} y2={colBotY} stroke="#0EA5E9" strokeWidth="1.5" />
                <rect x={colX - 145} y={colMidY - 12} width="115" height="24" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
                <text x={colX - 87} y={colMidY + 4} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-sky-800">
                  L = {lengthL} m (Drag)
                </text>
              </g>
            )}

            {/* Lateral Deflection Callout */}
            <g transform={`translate(${colX + lateralAmp + 15}, ${colMidY})`}>
              <line x1="-15" y1="0" x2="0" y2="0" stroke="#F59E0B" strokeWidth="1.5" />
              <rect x="0" y="-14" width="160" height="28" rx="4" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1" />
              <text x="80" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-amber-900">
                P_cr = {pCr.toFixed(0)} kN (K = {factorK})
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 5. HYDROSTATIC PRESSURE (P = ρgh)
      // ----------------------------------------------------
      case 'hydrostatic-fluid-pressure':
      case 'civil-hydrostatic-pressure': {
        const depthH = values['h'] ?? 10;
        const densityRho = values['ρ'] ?? 1000;
        const pressure = calculatedValue || (densityRho * 9.81 * depthH) / 1000;

        const tankLeft = 140;
        const tankWidth = 260;
        const surfaceY = 70;
        const scaledDepth = Math.min(150, Math.max(30, depthH * 5));
        const bottomY = surfaceY + scaledDepth;

        return (
          <g>
            <rect x={tankLeft} y={surfaceY} width={tankWidth} height={scaledDepth} fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
            <line x1={tankLeft} y1={surfaceY} x2={tankLeft + tankWidth} y2={surfaceY} stroke="#0284C7" strokeWidth="3" />
            <text x={tankLeft + 15} y={surfaceY - 8} className="font-mono-tech text-xs font-bold fill-sky-700">
              ▼ Free Water Surface (h = 0)
            </text>

            <polygon
              points={`${tankLeft + tankWidth},${surfaceY} ${tankLeft + tankWidth + scaledDepth * 0.5},${bottomY} ${tankLeft + tankWidth},${bottomY}`}
              fill="#06B6D4"
              fillOpacity="0.4"
              stroke="#0891B2"
              strokeWidth="1.5"
            />
            {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const y = surfaceY + scaledDepth * frac;
              const len = scaledDepth * 0.5 * frac;
              return (
                <line
                  key={idx}
                  x1={tankLeft + tankWidth}
                  y1={y}
                  x2={tankLeft + tankWidth + len}
                  y2={y}
                  stroke="#0891B2"
                  strokeWidth="1.5"
                />
              );
            })}

            <g className="cursor-ns-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('depth'); }}>
              <line x1={tankLeft - 25} y1={surfaceY} x2={tankLeft - 25} y2={bottomY} stroke="#0EA5E9" strokeWidth="1.5" />
              <line x1={tankLeft - 35} y1={surfaceY} x2={tankLeft - 15} y2={surfaceY} stroke="#0EA5E9" strokeWidth="1.5" />
              <line x1={tankLeft - 35} y1={bottomY} x2={tankLeft - 15} y2={bottomY} stroke="#0EA5E9" strokeWidth="1.5" />
              <rect x={tankLeft - 110} y={surfaceY + scaledDepth / 2 - 12} width="80" height="24" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
              <text x={tankLeft - 70} y={surfaceY + scaledDepth / 2 + 4} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-sky-800">
                h = {depthH} m
              </text>
            </g>

            <g transform={`translate(${tankLeft + tankWidth / 2}, ${bottomY + 25})`}>
              <rect x="-80" y="-12" width="160" height="26" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="5" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-cyan-900">
                P_bottom = {pressure.toFixed(1)} kPa
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 6. KINETIC ENERGY (Ek = ½mv²)
      // ----------------------------------------------------
      case 'kinetic-energy':
      case 'phys-kinetic-energy': {
        const velocity = values['v'] ?? 15;
        const mass = values['m'] ?? 1000;
        const ke = calculatedValue || (0.5 * mass * velocity * velocity) / 1000;

        const groundY = 220;
        const animOffset = isPlaying ? (simTime * velocity * 8) % 360 : 0;
        const carX = 140 + (animOffset * 0.7);

        return (
          <g>
            {/* Roadway Surface */}
            <line x1="40" y1={groundY} x2="560" y2={groundY} stroke="#334155" strokeWidth="3" />
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={i} x1={60 + i * 35} y1={groundY + 1} x2={45 + i * 35} y2={groundY + 12} stroke="#94A3B8" strokeWidth="1.5" />
            ))}

            {/* Kinetic Energy Heat Trail */}
            <defs>
              <linearGradient id="keTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect x={Math.max(40, carX - 100)} y={groundY - 45} width="100" height="40" fill="url(#keTrail)" rx="4" />

            {/* Vehicle / Block Body */}
            <g transform={`translate(${carX}, ${groundY - 50})`}>
              <rect x="0" y="10" width="90" height="35" rx="5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
              <rect x="15" y="0" width="55" height="20" rx="3" fill="#60A5FA" stroke="#0F172A" strokeWidth="1.5" />
              
              {/* Wheels */}
              <circle cx="22" cy="45" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="68" cy="45" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="22" cy="45" r="3" fill="#FFFFFF" />
              <circle cx="68" cy="45" r="3" fill="#FFFFFF" />

              <text x="45" y="32" textAnchor="middle" className="font-mono-tech text-[10px] font-bold fill-white">
                m = {mass} kg
              </text>
            </g>

            {/* Velocity Vector Arrow */}
            <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('velocity'); }}>
              <line
                x1={carX + 95}
                y1={groundY - 30}
                x2={carX + 95 + velocity * 2.5}
                y2={groundY - 30}
                stroke="#10B981"
                strokeWidth="4"
                markerEnd="url(#arrow-force)"
              />
              <rect x={carX + 100} y={groundY - 55} width="110" height="20" rx="3" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
              <text x={carX + 155} y={groundY - 41} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-emerald-800">
                v = {velocity} m/s (Drag ↔)
              </text>
            </g>

            {/* Kinetic Energy Live Box */}
            <g transform="translate(300, 70)">
              <rect x="-90" y="-15" width="180" height="32" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="6" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-slate-900">
                E_k = {ke.toFixed(1)} kJ (½mv²)
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 7. OHM'S LAW (V = I * R)
      // ----------------------------------------------------
      case 'ohms-law':
      case 'elec-ohms-law': {
        const voltage = values['V'] ?? 12;
        const resistance = values['R'] ?? 6;
        const current = calculatedValue || (voltage / resistance);

        const leftX = 140;
        const rightX = 460;
        const topY = 90;
        const botY = 230;

        // Animated charge carriers along wire
        const electronSpeed = isPlaying ? (simTime * current * 40) % 1000 : 0;

        return (
          <g>
            {/* Closed Circuit Loop Path */}
            <rect x={leftX} y={topY} width={rightX - leftX} height={botY - topY} fill="none" stroke="#334155" strokeWidth="3" rx="8" />

            {/* Left DC Battery Source (V) */}
            <g className="cursor-ns-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('voltage'); }}>
              <rect x={leftX - 16} y={topY + 45} width="32" height="50" fill="#FFFFFF" />
              <line x1={leftX - 16} y1={topY + 58} x2={leftX + 16} y2={topY + 58} stroke="#EF4444" strokeWidth="4" />
              <line x1={leftX - 8} y1={topY + 82} x2={leftX + 8} y2={topY + 82} stroke="#334155" strokeWidth="4" />
              <text x={leftX - 25} y={topY + 62} className="font-mono-tech text-xs font-bold fill-red-600">+</text>
              <text x={leftX - 25} y={topY + 86} className="font-mono-tech text-xs font-bold fill-slate-600">-</text>

              <rect x={leftX - 105} y={topY + 55} width="75" height="24" rx="3" fill="#FEF2F2" stroke="#F87171" strokeWidth="1" />
              <text x={leftX - 67} y={topY + 71} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-red-700">
                V = {voltage} V
              </text>
            </g>

            {/* Top Resistor (R) */}
            <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('resistance'); }}>
              <rect x="260" y={topY - 14} width="80" height="28" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" rx="3" />
              {/* Zigzag Resistor Texture */}
              <path d={`M 265 ${topY} L 275 ${topY - 8} L 285 ${topY + 8} L 295 ${topY - 8} L 305 ${topY + 8} L 315 ${topY - 8} L 325 ${topY + 8} L 335 ${topY}`} fill="none" stroke="#78350F" strokeWidth="2" />
              <rect x="255" y={topY - 45} width="90" height="22" rx="3" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1" />
              <text x="300" y={topY - 30} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-amber-900">
                R = {resistance} Ω
              </text>
            </g>

            {/* Animated Electron Carrier Particles */}
            {isPlaying && Array.from({ length: 8 }).map((_, idx) => {
              const perimeter = 2 * (rightX - leftX) + 2 * (botY - topY);
              const pos = (electronSpeed + (idx * perimeter) / 8) % perimeter;
              let ex = leftX;
              let ey = topY;

              if (pos < (rightX - leftX)) {
                ex = leftX + pos;
                ey = topY;
              } else if (pos < (rightX - leftX) + (botY - topY)) {
                ex = rightX;
                ey = topY + (pos - (rightX - leftX));
              } else if (pos < 2 * (rightX - leftX) + (botY - topY)) {
                ex = rightX - (pos - (rightX - leftX) - (botY - topY));
                ey = botY;
              } else {
                ex = leftX;
                ey = botY - (pos - 2 * (rightX - leftX) - (botY - topY));
              }

              return (
                <circle key={idx} cx={ex} cy={ey} r="3.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />
              );
            })}

            {/* Current Readout Meter */}
            <g transform={`translate(${rightX}, ${topY + 70})`}>
              <rect x="-20" y="-15" width="40" height="30" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-blue-700">A</text>
              <rect x="30" y="-12" width="100" height="24" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
              <text x="80" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-sky-900">
                I = {current.toFixed(2)} A
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 8. AREA OF A CIRCLE (A = πr²)
      // ----------------------------------------------------
      case 'area-circle':
      case 'math-area-circle': {
        const radius = values['r'] ?? 6;
        const area = calculatedValue || (Math.PI * radius * radius);
        const centerX = 300;
        const centerY = 160;
        const visualR = Math.max(20, Math.min(120, radius * 9));

        return (
          <g>
            {/* Coordinate Grid Axes */}
            <line x1="80" y1={centerY} x2="520" y2={centerY} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={centerX} y1="30" x2={centerX} y2="290" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />

            {/* Concentric Circle Fill with Area Hash Pattern */}
            <circle cx={centerX} cy={centerY} r={visualR} fill="#D1FAE5" stroke="#059669" strokeWidth="2.5" />
            
            {/* Center Origin Dot */}
            <circle cx={centerX} cy={centerY} r="4" fill="#0F172A" />

            {/* Radius Arrow Vector */}
            <g className="cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('radius'); }}>
              <line
                x1={centerX}
                y1={centerY}
                x2={centerX + visualR}
                y2={centerY}
                stroke="#2563EB"
                strokeWidth="3"
                markerEnd="url(#arrow-force)"
              />
              <rect x={centerX + visualR / 2 - 35} y={centerY - 28} width="70" height="20" rx="3" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1" />
              <text x={centerX + visualR / 2} y={centerY - 14} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-blue-800">
                r = {radius} cm
              </text>
            </g>

            {/* Dynamic Calculated Area HUD Badge */}
            <g transform="translate(300, 45)">
              <rect x="-85" y="-14" width="170" height="28" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-emerald-900">
                A = πr² = {area.toFixed(2)} cm²
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 9. FLEXURAL BENDING STRESS (σ = My / I)
      // ----------------------------------------------------
      case 'bending-stress-beam':
      case 'mech-bending-stress': {
        const momentM = values['M'] ?? 60;
        const fiberY = values['y'] ?? 120;
        const stress = calculatedValue || 80;

        const centerX = 240;
        const centerY = 160;
        const beamH = 160;
        const beamW = 100;

        const stressDiagramX = 400;

        return (
          <g>
            {/* I-Beam / Cross-Section Elevation */}
            <g transform={`translate(${centerX - beamW / 2}, ${centerY - beamH / 2})`}>
              {/* Flanges & Web */}
              <rect x="0" y="0" width={beamW} height="20" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
              <rect x="38" y="20" width="24" height={beamH - 40} fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
              <rect x="0" y={beamH - 20} width={beamW} height="20" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
            </g>

            {/* Neutral Axis (NA) */}
            <line x1="160" y1={centerY} x2="480" y2={centerY} stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="145" y={centerY + 4} textAnchor="end" className="font-mono-tech text-[10px] font-bold fill-sky-700">
              Neutral Axis (y=0)
            </text>

            {/* Linear Bending Stress Profile Triangle on Right */}
            <line x1={stressDiagramX} y1={centerY - beamH / 2} x2={stressDiagramX} y2={centerY + beamH / 2} stroke="#0F172A" strokeWidth="2" />
            <polygon
              points={`${stressDiagramX},${centerY} ${stressDiagramX - 50},${centerY - beamH / 2} ${stressDiagramX},${centerY - beamH / 2}`}
              fill="#EF4444"
              fillOpacity="0.3"
              stroke="#DC2626"
              strokeWidth="1.5"
            />
            <polygon
              points={`${stressDiagramX},${centerY} ${stressDiagramX + 50},${centerY + beamH / 2} ${stressDiagramX},${centerY + beamH / 2}`}
              fill="#3B82F6"
              fillOpacity="0.3"
              stroke="#2563EB"
              strokeWidth="1.5"
            />

            <text x={stressDiagramX - 55} y={centerY - beamH / 2 + 12} textAnchor="end" className="font-mono-tech text-[10px] font-bold fill-red-700">
              Compression (-)
            </text>
            <text x={stressDiagramX + 55} y={centerY + beamH / 2 - 4} textAnchor="start" className="font-mono-tech text-[10px] font-bold fill-blue-700">
              Tension (+)
            </text>

            {/* Fiber Distance Drag Handle */}
            <g className="cursor-ns-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('fiberY'); }}>
              <line x1={centerX + 65} y1={centerY} x2={centerX + 65} y2={centerY - fiberY * 0.6} stroke="#F59E0B" strokeWidth="2" />
              <circle cx={centerX + 65} cy={centerY - fiberY * 0.6} r="4" fill="#F59E0B" />
              <rect x={centerX + 75} y={centerY - fiberY * 0.6 - 10} width="80" height="20" rx="3" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1" />
              <text x={centerX + 115} y={centerY - fiberY * 0.6 + 4} textAnchor="middle" className="font-mono-tech text-[10px] font-bold fill-amber-900">
                y = {fiberY} mm
              </text>
            </g>

            {/* Stress Badge */}
            <g transform="translate(300, 45)">
              <rect x="-85" y="-14" width="170" height="28" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-slate-900">
                σ = {stress.toFixed(2)} MPa (M = {momentM} kN·m)
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 10. HOOKE'S LAW FOR SPRINGS (F = k * x)
      // ----------------------------------------------------
      case 'hookes-law-spring':
      case 'phys-hookes-law': {
        const displacementX = values['x'] ?? 14;
        const springK = values['k'] ?? 250;
        const force = calculatedValue || (springK * displacementX * 0.01);

        const wallX = 120;
        const equilibriumX = 260;
        const scaledDisp = Math.max(10, Math.min(150, displacementX * 6));
        const blockX = equilibriumX + scaledDisp;
        const centerY = 160;

        return (
          <g>
            {/* Anchor Wall */}
            <rect x={wallX - 20} y="80" width="20" height="160" fill="#334155" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={wallX - 20} y1={90 + i * 18} x2={wallX - 32} y2={102 + i * 18} stroke="#94A3B8" strokeWidth="2" />
            ))}

            {/* Ground Surface */}
            <line x1={wallX} y1="220" x2="520" y2="220" stroke="#475569" strokeWidth="2" />

            {/* Equilibrium Centerline (Dashed) */}
            <line x1={equilibriumX} y1="90" x2={equilibriumX} y2="220" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
            <text x={equilibriumX} y="80" textAnchor="middle" className="font-mono-tech text-[10px] fill-slate-500">
              Equilibrium (x = 0)
            </text>

            {/* Dynamic Coiled Spring Path */}
            {(() => {
              const numCoils = 10;
              const coilWidth = (blockX - wallX) / numCoils;
              let pathStr = `M ${wallX} ${centerY}`;
              for (let i = 0; i < numCoils; i++) {
                const cx1 = wallX + (i + 0.25) * coilWidth;
                const cy1 = centerY - 25;
                const cx2 = wallX + (i + 0.75) * coilWidth;
                const cy2 = centerY + 25;
                const ex = wallX + (i + 1) * coilWidth;
                pathStr += ` Q ${cx1} ${cy1} ${cx1 + coilWidth * 0.25} ${centerY} Q ${cx2} ${cy2} ${ex} ${centerY}`;
              }
              return (
                <path d={pathStr} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              );
            })()}

            {/* Mass Block */}
            <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('displacement'); }}>
              <rect x={blockX} y={centerY - 35} width="70" height="60" rx="4" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
              <text x={blockX + 35} y={centerY - 3} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-white">
                Drag Mass ↔
              </text>
            </g>

            {/* Restoring Force Vector F */}
            <line
              x1={blockX}
              y1={centerY - 45}
              x2={blockX - Math.min(80, force * 1.5)}
              y2={centerY - 45}
              stroke="#EF4444"
              strokeWidth="3.5"
              markerEnd="url(#arrow-force)"
            />
            <text x={blockX - 20} y={centerY - 52} textAnchor="end" className="font-mono-tech text-xs font-bold fill-red-700">
              F_restoring = {force.toFixed(1)} N
            </text>

            {/* Displacement Dimension */}
            <g transform={`translate(${equilibriumX + scaledDisp / 2}, 235)`}>
              <line x1={-scaledDisp / 2} y1="0" x2={scaledDisp / 2} y2="0" stroke="#0EA5E9" strokeWidth="1.5" />
              <rect x="-40" y="5" width="80" height="20" rx="3" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1" />
              <text x="0" y="19" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-sky-800">
                x = {displacementX} cm
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 11. ELECTRICAL POWER (P = V * I)
      // ----------------------------------------------------
      case 'electrical-power':
      case 'elec-electrical-power': {
        const voltage = values['V'] ?? 120;
        const current = values['I'] ?? 5;
        const power = calculatedValue || (voltage * current);

        const heatGlowRadius = Math.min(65, 20 + (power / 2400) * 45);

        return (
          <g>
            {/* Heating Element Load (Center) */}
            <circle cx="300" cy="160" r={heatGlowRadius} fill="#F97316" fillOpacity="0.25" />
            <circle cx="300" cy="160" r="35" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />
            <text x="300" y="165" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-white">
              LOAD
            </text>

            {/* Power Thermal Radiation Waves */}
            <circle cx="300" cy="160" r={heatGlowRadius + 15} fill="none" stroke="#FB923C" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            {/* Supply Lead Left */}
            <line x1="140" y1="160" x2="265" y2="160" stroke="#334155" strokeWidth="3" />
            {/* Return Lead Right */}
            <line x1="335" y1="160" x2="460" y2="160" stroke="#334155" strokeWidth="3" />

            {/* Voltage Badge */}
            <g className="cursor-pointer" transform="translate(170, 120)">
              <rect x="-40" y="-12" width="80" height="24" rx="3" fill="#FEF2F2" stroke="#F87171" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-red-700">
                V = {voltage} V
              </text>
            </g>

            {/* Current Arrow */}
            <g className="cursor-pointer" transform="translate(200, 160)">
              <line x1="-20" y1="-10" x2="20" y2="-10" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow-force)" />
              <text x="0" y="-16" textAnchor="middle" className="font-mono-tech text-[11px] font-bold fill-emerald-700">
                I = {current} A
              </text>
            </g>

            {/* Power Output Banner */}
            <g transform="translate(300, 60)">
              <rect x="-90" y="-15" width="180" height="30" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <text x="0" y="5" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-amber-900">
                Power P = {power.toFixed(0)} W ({ (power / 1000).toFixed(2) } kW)
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 12. NEWTON'S SECOND LAW (F = m * a)
      // ----------------------------------------------------
      case 'force-mass-acceleration':
      case 'phys-newton-second-law': {
        const mass = values['m'] ?? 60;
        const accel = values['a'] ?? 5;
        const force = calculatedValue || (mass * accel);

        const groundY = 210;
        const blockX = 260;
        const forceArrowLen = Math.min(140, Math.max(30, force * 0.4));

        return (
          <g>
            {/* Guide Track Surface */}
            <line x1="80" y1={groundY} x2="520" y2={groundY} stroke="#334155" strokeWidth="3" />
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1={95 + i * 30} y1={groundY + 1} x2={85 + i * 30} y2={groundY + 10} stroke="#94A3B8" strokeWidth="1.5" />
            ))}

            {/* Dynamic Sliding Mass Block */}
            <rect x={blockX} y={groundY - 60} width="80" height="60" rx="4" fill="#6366F1" stroke="#0F172A" strokeWidth="2" />
            <text x={blockX + 40} y={groundY - 26} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-white">
              m = {mass} kg
            </text>

            {/* Applied Force Vector F */}
            <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setActiveHandle('force'); }}>
              <line
                x1={blockX + 80}
                y1={groundY - 30}
                x2={blockX + 80 + forceArrowLen}
                y2={groundY - 30}
                stroke="#EF4444"
                strokeWidth="4"
                markerEnd="url(#arrow-force)"
              />
              <rect x={blockX + 90} y={groundY - 58} width="110" height="22" rx="3" fill="#FEF2F2" stroke="#F87171" strokeWidth="1" />
              <text x={blockX + 145} y={groundY - 43} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-red-700">
                F_net = {force.toFixed(0)} N
              </text>
            </g>

            {/* Acceleration Vector Callout */}
            <g transform={`translate(${blockX + 40}, ${groundY - 80})`}>
              <line x1="-30" y1="0" x2="30" y2="0" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow-force)" />
              <text x="0" y="-8" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-emerald-800">
                a = {accel} m/s²
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 13. CHEMISTRY & THERMODYNAMICS: IDEAL GAS LAW (PV = nRT)
      // ----------------------------------------------------
      case 'ideal-gas-law':
      case 'chem-ideal-gas-law': {
        const moles = values['n'] ?? 1.0;
        const temp = values['T'] ?? 300;
        const volume = values['V'] ?? 25;
        const pressure = calculatedValue || ((moles * 8.314 * temp) / volume);

        const chamberLeft = 140;
        const chamberWidth = 320;
        const chamberBottom = 240;
        const maxChamberHeight = 180;
        const currentHeight = Math.min(160, Math.max(40, (volume / 60) * 160));
        const pistonY = chamberBottom - currentHeight;

        // Particle count and speed based on moles and temperature
        const particleCount = Math.min(24, Math.max(6, Math.round(moles * 4)));
        const speedFactor = (temp / 300);

        return (
          <g>
            {/* Cylinder Outer Walls */}
            <rect x={chamberLeft - 8} y={chamberBottom - maxChamberHeight - 10} width="8" height={maxChamberHeight + 18} fill="#334155" />
            <rect x={chamberLeft + chamberWidth} y={chamberBottom - maxChamberHeight - 10} width="8" height={maxChamberHeight + 18} fill="#334155" />
            <rect x={chamberLeft - 8} y={chamberBottom + 8} width={chamberWidth + 16} height="12" fill="#1e293b" rx="2" />

            {/* Chamber Interior Background (gas glow increases with temp/pressure) */}
            <rect
              x={chamberLeft}
              y={pistonY}
              width={chamberWidth}
              height={currentHeight + 8}
              fill={temp > 450 ? '#fee2e2' : temp > 350 ? '#fef3c7' : '#ecfeff'}
              opacity="0.7"
            />

            {/* Gas Particles with Animated Motion */}
            {Array.from({ length: particleCount }).map((_, i) => {
              const offsetX = (i * 47 + Math.sin(simTime * speedFactor + i * 2) * 35) % (chamberWidth - 30);
              const offsetY = (i * 29 + Math.cos(simTime * speedFactor + i * 3) * 20) % Math.max(20, currentHeight - 20);
              const px = chamberLeft + 15 + Math.abs(offsetX);
              const py = pistonY + 10 + Math.abs(offsetY);

              return (
                <g key={`particle-${i}`}>
                  <circle cx={px} cy={py} r="4" fill={temp > 400 ? '#ef4444' : '#0891b2'} stroke="#ffffff" strokeWidth="1" />
                  <line
                    x1={px}
                    y1={py}
                    x2={px + Math.sin(i * 1.5 + simTime) * 8 * speedFactor}
                    y2={py + Math.cos(i * 1.5 + simTime) * 8 * speedFactor}
                    stroke={temp > 400 ? '#f87171' : '#38bdf8'}
                    strokeWidth="1.2"
                    strokeDasharray="1 1"
                  />
                </g>
              );
            })}

            {/* Movable Piston Head */}
            <g>
              <rect x={chamberLeft} y={pistonY - 14} width={chamberWidth} height="14" rx="2" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
              <rect x={chamberLeft + chamberWidth / 2 - 8} y={pistonY - 45} width="16" height="32" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
              
              {/* Weights on Piston */}
              <rect x={chamberLeft + chamberWidth / 2 - 35} y={pistonY - 55} width="70" height="12" rx="3" fill="#1e293b" />
              <text x={chamberLeft + chamberWidth / 2} y={pistonY - 46} textAnchor="middle" className="font-mono-tech text-[10px] font-bold fill-white">
                V = {volume} L
              </text>
            </g>

            {/* Burner / Heat Source at Bottom */}
            <g transform={`translate(${chamberLeft + chamberWidth / 2}, ${chamberBottom + 24})`}>
              <ellipse cx="0" cy="0" rx={Math.min(50, 15 + (temp / 600) * 35)} ry="6" fill={temp > 350 ? '#f59e0b' : '#38bdf8'} opacity="0.8" />
              <text x="0" y="16" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#000000]">
                Heat Source: T = {temp} K ({(temp - 273.15).toFixed(1)}°C)
              </text>
            </g>

            {/* Pressure Gauge Dial on Right */}
            <g transform={`translate(${chamberLeft + chamberWidth + 50}, ${chamberBottom - 70})`}>
              <circle cx="0" cy="0" r="36" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="32" fill="#faf8f0" />
              
              {/* Dial Ticks */}
              {Array.from({ length: 9 }).map((_, i) => {
                const angle = -140 + i * 35;
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={`tick-${i}`}
                    x1={Math.cos(rad) * 26}
                    y1={Math.sin(rad) * 26}
                    x2={Math.cos(rad) * 30}
                    y2={Math.sin(rad) * 30}
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Needle based on pressure */}
              {(() => {
                const pRatio = Math.min(1, Math.max(0, pressure / 800));
                const needleAngle = -140 + pRatio * 280;
                const nRad = (needleAngle * Math.PI) / 180;
                return (
                  <>
                    <line x1="0" y1="0" x2={Math.cos(nRad) * 25} y2={Math.sin(nRad) * 25} stroke="#d8573f" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3.5" fill="#d8573f" />
                  </>
                );
              })()}

              <text x="0" y="18" textAnchor="middle" className="font-mono-tech text-[10px] font-black fill-[#000000]">
                {pressure.toFixed(1)} kPa
              </text>
            </g>
          </g>
        );
      }

      // ----------------------------------------------------
      // 14. MATHEMATICS: PYTHAGOREAN THEOREM (c = √(a² + b²))
      // ----------------------------------------------------
      case 'pythagorean-theorem':
      case 'math-pythagorean': {
        const a = values['a'] ?? 6;
        const b = values['b'] ?? 8;
        const c = calculatedValue || Math.sqrt(a * a + b * b);

        const originX = 220;
        const originY = 220;
        const scale = 11;

        const legA = Math.min(160, Math.max(30, a * scale));
        const legB = Math.min(150, Math.max(30, b * scale));

        const ptRightX = originX + legA;
        const ptRightY = originY;
        const ptTopX = originX;
        const ptTopY = originY - legB;

        return (
          <g>
            {/* Square on base leg a */}
            <rect
              x={originX}
              y={originY}
              width={legA}
              height={legA}
              fill="#ecfeff"
              stroke="#0891b2"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.75"
            />
            <text x={originX + legA / 2} y={originY + legA / 2 + 5} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#0891b2]">
              a² = {(a * a).toFixed(1)} m²
            </text>

            {/* Square on altitude leg b */}
            <rect
              x={originX - legB}
              y={originY - legB}
              width={legB}
              height={legB}
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.75"
            />
            <text x={originX - legB / 2} y={originY - legB / 2 + 5} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#d97706]">
              b² = {(b * b).toFixed(1)} m²
            </text>

            {/* Main Right Triangle Filled */}
            <polygon
              points={`${originX},${originY} ${ptRightX},${ptRightY} ${ptTopX},${ptTopY}`}
              fill="#10b981"
              fillOpacity="0.25"
              stroke="#0f172a"
              strokeWidth="3"
            />

            {/* 90° Right Angle Marker Box */}
            <path
              d={`M ${originX + 14} ${originY} L ${originX + 14} ${originY - 14} L ${originX} ${originY - 14}`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Hypotenuse Label */}
            <g transform={`translate(${(ptRightX + ptTopX) / 2 + 10}, ${(ptRightY + ptTopY) / 2 - 10})`}>
              <rect x="-40" y="-12" width="80" height="24" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#059669]">
                c = {c.toFixed(2)} m
              </text>
            </g>

            {/* Dimension Labels on Legs */}
            {showDimensions && (
              <>
                <text x={originX + legA / 2} y={originY - 6} textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#000000]">
                  a = {a} m
                </text>
                <text x={originX + 12} y={originY - legB / 2} textAnchor="start" className="font-mono-tech text-xs font-bold fill-[#000000]">
                  b = {b} m
                </text>
              </>
            )}
          </g>
        );
      }

      // 15. Bernoulli Fluid Dynamics / Pipe Venturi Flow
      case 'bernoulli-fluid-flow':
      case 'fluid-dynamics':
      case 'pipe-flow': {
        const val = values as Record<string, number>;
        const v1 = val['v1'] ?? val['v'] ?? 5;
        const p1 = val['p1'] ?? val['P'] ?? 150;
        const v2 = v1 * 1.8;
        const p2 = Math.max(20, p1 - (0.5 * 1000 * (v2 * v2 - v1 * v1)) / 1000);

        return (
          <g transform="translate(60, 60)">
            {/* Venturi Tube Boundary */}
            <path
              d="M 20 40 L 160 40 L 230 70 L 310 70 L 380 40 L 480 40 L 480 180 L 380 180 L 310 150 L 230 150 L 160 180 L 20 180 Z"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="2.5"
              fillOpacity="0.45"
            />
            {/* Streamlines with velocity particles */}
            {[-30, 0, 30].map((offset, sIdx) => {
              const yBase = 110 + offset;
              const yThroat = 110 + offset * 0.55;
              const particleOffset = ((simTime * (v1 * 8) + sIdx * 50) % 440);
              const px = 30 + particleOffset;
              let py = yBase;
              if (px >= 160 && px <= 230) {
                const ratio = (px - 160) / 70;
                py = yBase + (yThroat - yBase) * ratio;
              } else if (px > 230 && px < 310) {
                py = yThroat;
              } else if (px >= 310 && px <= 380) {
                const ratio = (px - 310) / 70;
                py = yThroat + (yBase - yThroat) * ratio;
              }

              return (
                <g key={sIdx}>
                  <path
                    d={`M 25 ${yBase} L 160 ${yBase} L 230 ${yThroat} L 310 ${yThroat} L 380 ${yBase} L 475 ${yBase}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                  />
                  <circle cx={px} cy={py} r="4" fill="#0284c7" />
                  <line
                    x1={px}
                    y1={py}
                    x2={px + (px > 220 && px < 320 ? v2 * 2.5 : v1 * 2)}
                    y2={py}
                    stroke="#d8573f"
                    strokeWidth="2"
                    markerEnd="url(#arrow-force)"
                  />
                </g>
              );
            })}

            {/* Manometer Tube 1 (Inlet - High Pressure) */}
            <rect x="90" y="-10" width="20" height="50" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="91" y={40 - Math.min(45, p1 * 0.25)} width="18" height={Math.min(45, p1 * 0.25)} fill="#38bdf8" />
            <text x="100" y="-15" textAnchor="middle" className="font-mono-tech text-[10px] font-bold fill-[#0369a1]">
              h₁ (P₁)
            </text>

            {/* Manometer Tube 2 (Throat - Low Pressure / High Velocity) */}
            <rect x="260" y="20" width="20" height="50" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="261" y={70 - Math.min(45, p2 * 0.25)} width="18" height={Math.min(45, p2 * 0.25)} fill="#38bdf8" />
            <text x="270" y="15" textAnchor="middle" className="font-mono-tech text-[10px] font-bold fill-[#d8573f]">
              h₂ (P₂ &lt; P₁)
            </text>

            {/* Readout labels */}
            <text x="90" y="205" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#000000]">
              Inlet: v₁ = {v1.toFixed(1)} m/s
            </text>
            <text x="270" y="205" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#d8573f]">
              Throat: v₂ = {v2.toFixed(1)} m/s ↑
            </text>
          </g>
        );
      }

      // 14. Thermal Conduction & Radiation Heat Transfer
      case 'thermal-conduction':
      case 'heat-transfer':
      case 'fourier-conduction':
      case 'stefan-boltzmann': {
        const val = values as Record<string, number>;
        const k = val['k'] ?? val['conductivity'] ?? 45;
        const T1 = val['T1'] ?? val['Thot'] ?? val['T'] ?? 350;
        const T2 = val['T2'] ?? val['Tcold'] ?? 290;
        const deltaT = Math.max(5, T1 - T2);
        const heatFlux = (k * deltaT) / 10;

        return (
          <g transform="translate(70, 70)">
            {/* Hot Thermal Wall (Left) */}
            <rect x="0" y="10" width="60" height="150" rx="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
            <text x="30" y="85" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#dc2626]">
              {T1} K
            </text>
            <text x="30" y="105" textAnchor="middle" className="font-mono-tech text-[9px] font-bold fill-[#dc2626]">
              HOT FACE
            </text>

            {/* Conducting Solid Slab (Gradient) */}
            <defs>
              <linearGradient id="slab-temp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <rect x="60" y="25" width="260" height="120" rx="4" fill="url(#slab-temp-gradient)" fillOpacity="0.85" stroke="#222222" strokeWidth="2" />

            {/* Isothermal Heat Flux Arrows */}
            {[0, 1, 2].map((row) => {
              const arrowY = 55 + row * 30;
              const arrowAnimOffset = (simTime * (heatFlux * 0.2) + row * 20) % 200;
              return (
                <g key={row}>
                  <line x1="70" y1={arrowY} x2="310" y2={arrowY} stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
                  <circle cx={70 + arrowAnimOffset} cy={arrowY} r="4" fill="#ffffff" stroke="#d8573f" strokeWidth="1.5" />
                  <line x1={70 + arrowAnimOffset} y1={arrowY} x2={70 + arrowAnimOffset + 25} y2={arrowY} stroke="#ffffff" strokeWidth="2.5" markerEnd="url(#arrow-force)" />
                </g>
              );
            })}

            {/* Cold Thermal Wall (Right) */}
            <rect x="320" y="10" width="60" height="150" rx="8" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
            <text x="350" y="85" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#2563eb]">
              {T2} K
            </text>
            <text x="350" y="105" textAnchor="middle" className="font-mono-tech text-[9px] font-bold fill-[#2563eb]">
              COLD FACE
            </text>

            {/* Heat Transfer Rate Badge */}
            <g transform="translate(190, 175)">
              <rect x="-85" y="-12" width="170" height="24" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#d8573f]">
                q = {calculatedValue.toFixed(1)} W/m² (ΔT = {deltaT.toFixed(0)} K)
              </text>
            </g>
          </g>
        );
      }

      // 15. Coulomb Electrostatic Field & Point Charges
      case 'coulomb-electrostatics':
      case 'coulomb-law':
      case 'electrostatic-force': {
        const val = values as Record<string, number>;
        const q1 = val['q1'] ?? val['Q1'] ?? 5;
        const q2 = val['q2'] ?? val['Q2'] ?? -5;
        const r = val['r'] ?? val['distance'] ?? 2;
        const isAttractive = (q1 * q2) < 0;
        const spacing = Math.min(260, Math.max(100, r * 50));

        return (
          <g transform="translate(120, 100)">
            {/* Electric Field Lines */}
            {[-25, 0, 25].map((curve, idx) => (
              <path
                key={idx}
                d={`M 40 ${curve} Q ${40 + spacing / 2} ${curve * 2.5} ${40 + spacing} ${curve}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            ))}

            {/* Charge 1 */}
            <circle cx="40" cy="0" r="22" fill={q1 >= 0 ? '#fee2e2' : '#dbeafe'} stroke={q1 >= 0 ? '#dc2626' : '#2563eb'} strokeWidth="2.5" />
            <text x="40" y="5" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#000000]">
              {q1 >= 0 ? `+${q1} μC` : `${q1} μC`}
            </text>

            {/* Charge 2 */}
            <circle cx={40 + spacing} cy="0" r="22" fill={q2 >= 0 ? '#fee2e2' : '#dbeafe'} stroke={q2 >= 0 ? '#dc2626' : '#2563eb'} strokeWidth="2.5" />
            <text x={40 + spacing} y="5" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#000000]">
              {q2 >= 0 ? `+${q2} μC` : `${q2} μC`}
            </text>

            {/* Force Vectors */}
            {isAttractive ? (
              <>
                <line x1="40" y1="0" x2="80" y2="0" stroke="#d8573f" strokeWidth="3" markerEnd="url(#arrow-force)" />
                <line x1={40 + spacing} y1="0" x2={40 + spacing - 40} y2="0" stroke="#d8573f" strokeWidth="3" markerEnd="url(#arrow-force)" />
              </>
            ) : (
              <>
                <line x1="40" y1="0" x2="0" y2="0" stroke="#d8573f" strokeWidth="3" markerEnd="url(#arrow-force)" />
                <line x1={40 + spacing} y1="0" x2={40 + spacing + 40} y2="0" stroke="#d8573f" strokeWidth="3" markerEnd="url(#arrow-force)" />
              </>
            )}

            {/* Distance Dimension */}
            <line x1="40" y1="45" x2={40 + spacing} y2="45" stroke="#000000" strokeWidth="1.5" />
            <text x={40 + spacing / 2} y="62" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#000000]">
              r = {r} m ({isAttractive ? 'Attractive Force' : 'Repulsive Force'})
            </text>
          </g>
        );
      }

      // 16. Arrhenius Reaction Kinetics & Energy Barrier
      case 'arrhenius-kinetics':
      case 'chemical-kinetics':
      case 'reaction-rate': {
        const val = values as Record<string, number>;
        const Ea = val['Ea'] ?? val['energy'] ?? 50;
        const T = val['T'] ?? val['temperature'] ?? 300;
        const peakHeight = Math.min(110, Math.max(30, Ea * 1.4));
        const activeMolecules = Math.min(8, Math.max(2, Math.round(T / 50)));

        return (
          <g transform="translate(90, 80)">
            {/* Coordinate Axis */}
            <line x1="20" y1="130" x2="380" y2="130" stroke="#64748b" strokeWidth="1.5" />
            <line x1="20" y1="10" x2="20" y2="130" stroke="#64748b" strokeWidth="1.5" />
            <text x="375" y="145" textAnchor="end" className="font-mono-tech text-[10px] font-bold fill-[#64748b]">
              Reaction Coordinate →
            </text>
            <text x="15" y="20" textAnchor="end" className="font-mono-tech text-[10px] font-bold fill-[#64748b]">
              Potential Energy (E)
            </text>

            {/* Reaction Energy Curve */}
            <path
              d={`M 30 100 Q 120 100 170 ${130 - peakHeight} Q 220 100 350 115`}
              fill="none"
              stroke="#d8573f"
              strokeWidth="3.5"
            />

            {/* Transition State (TS) Peak */}
            <circle cx="170" cy={130 - peakHeight} r="6" fill="#ffdd00" stroke="#000000" strokeWidth="2" />
            <text x="170" y={115 - peakHeight} textAnchor="middle" className="font-mono-tech text-[10px] font-black fill-[#000000]">
              Transition State ‡
            </text>

            {/* Activation Energy Dimension Arrow */}
            <line x1="170" y1="100" x2="170" y2={130 - peakHeight} stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
            <text x="185" y={115 - peakHeight / 2} className="font-mono-tech text-[10px] font-bold fill-[#059669]">
              Ea = {Ea} kJ/mol
            </text>

            {/* Reactant & Product Nodes */}
            <text x="50" y="90" className="font-mono-tech text-xs font-bold fill-[#0284c7]">
              Reactants (A + B)
            </text>
            <text x="320" y="105" className="font-mono-tech text-xs font-bold fill-[#059669]">
              Products (C)
            </text>

            {/* Kinetic Rate Readout */}
            <g transform="translate(200, -10)">
              <rect x="-80" y="-12" width="160" height="24" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#000000]">
                Rate k = <tspan fill="#d8573f">{calculatedValue.toExponential(2)}</tspan> s⁻¹
              </text>
            </g>
          </g>
        );
      }

      // 17. AC RLC Impedance Phasor Diagram
      case 'ac-impedance-rlc':
      case 'rlc-circuit':
      case 'ac-impedance': {
        const val = values as Record<string, number>;
        const R = val['R'] ?? val['resistance'] ?? 50;
        const XL = val['XL'] ?? val['reactanceL'] ?? 40;
        const XC = val['XC'] ?? val['reactanceC'] ?? 15;
        const Xnet = XL - XC;
        const rScale = Math.min(180, Math.max(40, (R / 100) * 140));
        const xnetScale = Math.min(100, Math.max(-100, (Xnet / 100) * 120));

        return (
          <g transform="translate(140, 150)">
            {/* Real & Imaginary Coordinate Axes */}
            <line x1="-30" y1="0" x2="240" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="235" y="-6" textAnchor="end" className="font-mono-tech text-[10px] font-bold fill-[#64748b]">
              +Real (R)
            </text>
            <text x="8" y="-100" textAnchor="start" className="font-mono-tech text-[10px] font-bold fill-[#64748b]">
              +j (XL - XC)
            </text>

            {/* Resistance Vector R (Horizontal Green) */}
            <line x1="0" y1="0" x2={rScale} y2="0" stroke="#059669" strokeWidth="3" markerEnd="url(#arrow-force)" />
            <text x={rScale / 2} y="18" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#059669]">
              R = {R} Ω
            </text>

            {/* Net Reactance Vector X (Vertical Blue) */}
            <line x1={rScale} y1="0" x2={rScale} y2={-xnetScale} stroke="#0284c7" strokeWidth="3" markerEnd="url(#arrow-force)" />
            <text x={rScale + 12} y={-xnetScale / 2} textAnchor="start" className="font-mono-tech text-xs font-bold fill-[#0284c7]">
              X_net = {Xnet.toFixed(1)} Ω
            </text>

            {/* Total Impedance Hypotenuse Z (Red) */}
            <line x1="0" y1="0" x2={rScale} y2={-xnetScale} stroke="#d8573f" strokeWidth="3.5" />
            <circle cx={rScale} cy={-xnetScale} r="5" fill="#ffdd00" stroke="#000000" strokeWidth="1.5" />

            {/* Result Readout */}
            <g transform="translate(100, -80)">
              <rect x="-70" y="-12" width="140" height="24" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-black fill-[#d8573f]">
                |Z| = {calculatedValue.toFixed(2)} Ω
              </text>
            </g>
          </g>
        );
      }

      // Default Intelligent Domain-Adaptive Physics Model
      default: {
        const keys = formula.variables?.map(v => v.symbol) || Object.keys(values);
        const primaryKey = keys[0];
        const secondaryKey = keys[1];
        const primaryVal = primaryKey ? getVal(primaryKey, 50) : 50;
        const secondaryVal = secondaryKey ? getVal(secondaryKey, 20) : 20;

        const waveAmplitude = Math.min(45, Math.max(10, (Math.abs(primaryVal) / 100) * 35));
        const waveFreq = Math.min(5, Math.max(0.5, (Math.abs(secondaryVal) / 20) * 3));

        return (
          <g transform="translate(80, 150)">
            {/* Horizontal Axis Guideline */}
            <line x1="0" y1="0" x2="440" y2="0" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="0" y1="-85" x2="0" y2="85" stroke="#0f172a" strokeWidth="2" />

            {/* Dynamic Physical Wave / Parameter Response Curve */}
            <path
              d={Array.from({ length: 44 }).map((_, i) => {
                const x = i * 10;
                const y = -Math.sin((i * 0.2 * waveFreq) + simTime * 2) * waveAmplitude;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke={activeRearrangementTarget ? '#d8573f' : '#2563eb'}
              strokeWidth="3.5"
            />

            {/* Active Data Nodes */}
            <circle cx="220" cy={-Math.sin((22 * 0.2 * waveFreq) + simTime * 2) * waveAmplitude} r="6" fill="#ffdd00" stroke="#000000" strokeWidth="2" />

            {/* Readout Card */}
            <g transform="translate(220, -65)">
              <rect x="-110" y="-15" width="220" height="30" rx="15" fill="#ffffff" stroke="#2b2b2b" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
              <text x="0" y="4" textAnchor="middle" className="font-mono-tech text-xs font-bold fill-[#000000]">
                {activeRearrangementTarget ? `Solved ${activeRearrangementTarget}` : formula.name}: <tspan fill="#d8573f">{calculatedValue.toFixed(2)} {activeRearrangementTarget ? '' : formula.simulation?.outputUnit}</tspan>
              </text>
            </g>

            {/* Parameter Badges */}
            <g transform="translate(0, 65)">
              {keys.slice(0, 4).map((k, idx) => {
                const val = getVal(k, 0);
                const isTarget = activeRearrangementTarget === k;
                return (
                  <g key={k} transform={`translate(${idx * 110}, 0)`}>
                    <rect x="0" y="0" width="100" height="22" rx="6" fill={isTarget ? '#fff5eb' : '#ffffff'} stroke={isTarget ? '#d8573f' : '#cbd5e1'} strokeWidth={isTarget ? 1.5 : 1} />
                    <text x="50" y="14" textAnchor="middle" className="font-mono-tech text-[10px] font-bold" fill={isTarget ? '#d8573f' : '#334155'}>
                      {k} = {typeof val === 'number' ? val.toFixed(1) : val}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-[#e5e7eb] overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#faf8f0] border-b border-[#e5e7eb] text-xs">
        {/* Left Status & Tools */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdd00] text-[#000000] font-bold text-[11px] border border-[#f7d046] shadow-xs">
            <Activity className="w-3 h-3 text-[#000000] animate-pulse" />
            2D Physics Lab
          </span>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${showGrid ? 'bg-[#000000] text-white border-[#000000]' : 'bg-white text-[#717171] border-[#e5e7eb] hover:bg-[#faf8f0]'}`}
            title="Toggle Grid"
          >
            <Grid className="w-3 h-3 inline mr-1" />
            Grid
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${showDimensions ? 'bg-[#000000] text-white border-[#000000]' : 'bg-white text-[#717171] border-[#e5e7eb] hover:bg-[#faf8f0]'}`}
            title="Toggle Dimension Annotations"
          >
            <Tag className="w-3 h-3 inline mr-1" />
            Dims
          </button>
        </div>

        {/* Right Camera & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-full bg-white border border-[#e5e7eb] hover:bg-[#faf8f0] text-[#222222] flex items-center justify-center transition-colors shadow-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-[#222222] w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-full bg-white border border-[#e5e7eb] hover:bg-[#faf8f0] text-[#222222] flex items-center justify-center transition-colors shadow-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="w-7 h-7 rounded-full bg-white border border-[#e5e7eb] hover:bg-[#faf8f0] text-[#222222] flex items-center justify-center transition-colors shadow-xs"
            title="Reset Camera View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Simulation Canvas */}
      <div 
        className={`relative flex-1 bg-[#faf8f0]/40 overflow-hidden select-none cursor-grab ${isDraggingCanvas ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 600 320"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Arrow Head Marker & Grid Definitions */}
          <defs>
            <marker id="arrow-force" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#d8573f" />
            </marker>
            <marker id="arrow-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#000000" />
            </marker>
            <pattern id="lab-engineering-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Zoom & Pan Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render Background Engineering Grid if Toggled */}
            {showGrid && (
              <rect x="-600" y="-320" width="1800" height="960" fill="url(#lab-engineering-grid)" />
            )}
            {renderSimulationScene()}
          </g>
        </svg>

        {/* Live HUD Floating Data Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-[#e5e7eb] rounded-2xl px-3 py-2 shadow-sm text-xs pointer-events-none">
          <div className="text-[10px] text-[#717171] uppercase tracking-wider font-bold">
            {activeRearrangementTarget ? 'Rearrangement Solved' : 'Dynamic Readout'}
          </div>
          <div className="text-sm font-black text-[#000000]">
            {activeRearrangementTarget
              ? `Target ${activeRearrangementTarget}: `
              : `${formula.simulation?.outputLabel.split('(')[0] || 'Result'}: `}
            <span className="text-[#d8573f]">
              {typeof calculatedValue === 'number' ? calculatedValue.toFixed(2) : calculatedValue} {activeRearrangementTarget ? '' : formula.simulation?.outputUnit}
            </span>
          </div>
        </div>

        {/* Active Rearranged Highlight Badge */}
        {(highlightedVariable || activeRearrangementTarget) && (
          <div className="absolute top-3 right-3 bg-[#ffdd00] border-2 border-[#2b2b2b] text-[#000000] rounded-full px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#2b2b2b] animate-bounce pointer-events-none">
            🎯 {activeRearrangementTarget ? `Solving for ${activeRearrangementTarget}` : `Focus: ${highlightedVariable}`}
          </div>
        )}

        {/* Direct Drag Hint */}
        <div className="absolute bottom-3 right-3 bg-[#000000]/80 text-white rounded-full px-3 py-1 text-[11px] font-medium pointer-events-none">
          💡 Drag load vectors or dimensions on canvas
        </div>
      </div>

      {/* Bottom Animation Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#faf8f0] border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isPlaying ? 'bg-[#222222] text-white' : 'bg-[#d8573f] text-white hover:bg-[#c24630]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Animate'}</span>
          </button>

          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-[#e5e7eb] text-[#222222] hover:bg-[#ffffff] hover:border-[#000000] flex items-center gap-1 transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Gradient Intensity Key */}
        <div className="flex items-center gap-2 text-[10px] text-[#717171] font-semibold">
          <span>Low</span>
          <div className="w-20 h-2 rounded-full bg-gradient-to-r from-[#2a7a4c] via-[#ffdd00] to-[#d8573f] border border-[#e5e7eb]" />
          <span>High Intensity</span>
        </div>
      </div>
    </div>
  );
};
