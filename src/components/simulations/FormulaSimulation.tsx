import React, { useState, useEffect, useRef } from 'react';
import { Formula } from '../../types';
import { Play, Pause, RotateCcw, FastForward, Activity } from 'lucide-react';

interface FormulaSimulationProps {
  formula: Formula;
  interactiveValues: Record<string, number>;
  onValuesChange: (newValues: Record<string, number>) => void;
}

export const FormulaSimulation: React.FC<FormulaSimulationProps> = ({
  formula,
  interactiveValues,
  onValuesChange
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);

  // Initialize defaults if not present
  useEffect(() => {
    const initial: Record<string, number> = { ...interactiveValues };
    let modified = false;

    if (formula.simulation?.customInputs && Array.isArray(formula.simulation.customInputs)) {
      formula.simulation.customInputs.forEach(input => {
        if (initial[input.id] === undefined) {
          initial[input.id] = input.defaultValue;
          modified = true;
        }
      });
    } else if (formula.variables && Array.isArray(formula.variables)) {
      formula.variables.forEach(v => {
        if (initial[v.symbol] === undefined) {
          initial[v.symbol] = v.defaultValue ?? 10;
          modified = true;
        }
      });
    }

    if (modified) {
      onValuesChange(initial);
    }
  }, [formula.id]);

  // Physics animation loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setSimTime(prev => prev + dt * animSpeed);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, animSpeed]);

  const handleInputChange = (id: string, value: number) => {
    onValuesChange({
      ...interactiveValues,
      [id]: value
    });
  };

  const resetSimulation = () => {
    setSimTime(0);
    const defaults: Record<string, number> = {};
    if (formula.simulation?.customInputs && Array.isArray(formula.simulation.customInputs)) {
      formula.simulation.customInputs.forEach(inp => {
        defaults[inp.id] = inp.defaultValue;
      });
    } else if (formula.variables && Array.isArray(formula.variables)) {
      formula.variables.forEach(v => {
        defaults[v.symbol] = v.defaultValue ?? 10;
      });
    }
    onValuesChange(defaults);
  };

  // Safe calculated output evaluation
  const calculateOutput = (): number => {
    try {
      const vals = interactiveValues || {};
      switch (formula.id) {
        case 'phys-newton-second-law': {
          const F = vals['F'] ?? 60;
          const m = vals['m'] ?? 12;
          return m > 0 ? F / m : 0;
        }
        case 'mech-bending-moment': {
          const w = vals['w'] ?? 12;
          const L = vals['L'] ?? 6;
          return (w * Math.pow(L, 2)) / 8;
        }
        case 'mech-bending-stress': {
          const M = vals['M'] ?? 25;
          const y = vals['y'] ?? 120;
          return (M * 1000000 * y) / 37500000;
        }
        case 'mech-beam-deflection': {
          const w = vals['w'] ?? 15;
          const L = vals['L'] ?? 4;
          return (5 * w * Math.pow(L, 4) * 1000) / (384 * 200 * 50);
        }
        case 'math-area-circle': {
          const r = vals['r'] ?? 6;
          return Math.PI * Math.pow(r, 2);
        }
        case 'math-pythagorean-theorem': {
          const a = vals['a'] ?? 6;
          const b = vals['b'] ?? 8;
          return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        }
        case 'elec-ohms-law': {
          const V = vals['V'] ?? 12;
          const R = vals['R'] ?? 6;
          return R > 0 ? V / R : 0;
        }
        case 'elec-electrical-power': {
          const V = vals['V'] ?? 120;
          const I = vals['I'] ?? 5;
          return V * I;
        }
        case 'civil-euler-buckling': {
          const L = vals['L'] ?? 3.5;
          const K = vals['K'] ?? 1.0;
          const effL = K * L;
          return effL > 0 ? (Math.pow(Math.PI, 2) * 200 * 400 * 10) / Math.pow(effL, 2) : 0;
        }
        case 'civil-hydrostatic-pressure': {
          const h = vals['h'] ?? 10;
          const rho = vals['ρ'] ?? 1000;
          return (rho * 9.81 * h) / 1000;
        }
        case 'phys-kinetic-energy': {
          const m = vals['m'] ?? 1000;
          const v = vals['v'] ?? 15;
          return 0.5 * m * Math.pow(v, 2);
        }
        case 'phys-projectile-motion': {
          const v = vals['v'] ?? 22;
          const theta = vals['theta'] ?? 45;
          const rad = (theta * Math.PI) / 180;
          return (Math.pow(v, 2) * Math.sin(2 * rad)) / 9.81;
        }
        case 'phys-hookes-law': {
          const k = vals['k'] ?? 150;
          const x = vals['x'] ?? 0.2;
          return k * x;
        }
        case 'cs-shannon-entropy': {
          const p = vals['P'] ?? 0.5;
          if (p <= 0 || p >= 1) return 0;
          return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
        }
        case 'cs-binary-conversion': {
          return vals['val'] ?? 42;
        }
        default:
          return 0;
      }
    } catch {
      return 0;
    }
  };

  const calculatedOutput = calculateOutput();

  return (
    <div id={`sim-container-${formula.id}`} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Simulation Header & Live Readout Banner */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">2D Interactive Simulation</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{formula.simulation.outputLabel}:</span>
              <span className="text-amber-400 font-mono-code text-lg">
                {calculatedOutput.toLocaleString(undefined, { maximumFractionDigits: 2 })} {formula.simulation.outputUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Sim Controls */}
        <div className="flex items-center gap-2">
          <button
            id="sim-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          <button
            id="sim-reset-btn"
            onClick={resetSimulation}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setAnimSpeed(s => s === 1 ? 2 : s === 2 ? 0.5 : 1)}
              className="font-mono-code font-bold hover:text-amber-400"
            >
              {animSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulation Viewport (Canvas / 2D Vector) */}
      <div className="relative h-64 sm:h-72 w-full bg-[#faf9f6] bg-grid-pattern border-b border-slate-200 overflow-hidden flex items-center justify-center p-4">
        {renderSimulationVisual(formula.id, interactiveValues, calculatedOutput, simTime, isPlaying)}
      </div>

      {/* Sliders and Interactive Controls Panel */}
      <div className="p-4 sm:p-5 bg-slate-50">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Manipulate Variables in Real-Time
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formula.simulation.customInputs?.map(input => {
            const val = interactiveValues[input.id] ?? input.defaultValue;
            return (
              <div key={input.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-slate-100 border border-slate-300 text-xs font-mono-code flex items-center justify-center font-bold text-slate-700">
                      {input.symbol}
                    </span>
                    <span>{input.label}</span>
                  </label>
                  <span className="font-mono-code font-bold text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {val} {input.unit}
                  </span>
                </div>

                <input
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={val}
                  onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />

                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono-code">
                  <span>{input.min} {input.unit}</span>
                  <span>{input.max} {input.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sub-renderers for live 2D simulated physics
function renderSimulationVisual(
  formulaId: string,
  values: Record<string, number>,
  calculatedOutput: number,
  time: number,
  isPlaying: boolean
) {
  switch (formulaId) {
    case 'phys-newton-second-law': {
      const a = calculatedOutput; // m/s^2
      // Periodic track loop
      const trackWidth = 440;
      const normalizedPos = ((0.5 * a * Math.pow(time % 4, 2) * 12) % trackWidth);
      const cartX = 30 + (isPlaying ? normalizedPos : 120);

      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          {/* Ground surface track */}
          <line x1="20" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="3" />
          <line x1="20" y1="174" x2="480" y2="174" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* Distance markers along the track */}
          {[50, 150, 250, 350, 450].map((mx, idx) => (
            <g key={mx}>
              <line x1={mx} y1="170" x2={mx} y2="178" stroke="#64748b" strokeWidth="1.5" />
              <text x={mx} y="192" textAnchor="middle" className="font-mono-code text-[10px] fill-slate-400">
                {idx * 10}m
              </text>
            </g>
          ))}

          {/* Dynamic Moving Cart */}
          <g transform={`translate(${cartX}, 0)`}>
            <rect
              x="0"
              y="90"
              width="100"
              height="55"
              rx="4"
              fill="#fed7aa"
              stroke="#ea580c"
              strokeWidth="2.5"
            />
            <text x="50" y="120" textAnchor="middle" className="font-handwritten text-sm font-bold fill-amber-950">
              m = {values['m'] ?? 12} kg
            </text>

            {/* Wheels */}
            <circle cx="25" cy="150" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <circle cx="25" cy="150" r="4" fill="#f8fafc" />
            <circle cx="75" cy="150" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <circle cx="75" cy="150" r="4" fill="#f8fafc" />

            {/* Force Vector */}
            <line x1="100" y1="115" x2="160" y2="115" stroke="#dc2626" strokeWidth="3.5" />
            <polygon points="160,115 150,110 150,120" fill="#dc2626" />
            <text x="130" y="105" textAnchor="middle" className="font-handwritten text-xs font-bold fill-red-600">
              F = {values['F'] ?? 60} N
            </text>

            {/* Velocity / Acceleration visual vector */}
            <line x1="0" y1="70" x2="80" y2="70" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 2" />
            <polygon points="80,70 72,66 72,74" fill="#2563eb" />
            <text x="40" y="62" textAnchor="middle" className="font-mono-code text-[11px] font-bold fill-blue-600">
              a = {a.toFixed(2)} m/s²
            </text>
          </g>
        </svg>
      );
    }

    case 'mech-bending-moment': {
      const w = values['w'] ?? 12;
      const L = values['L'] ?? 6;
      // Visual sag curve amplitude based on w and L
      const sag = Math.min(45, (w * Math.pow(L, 2)) / 30);

      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          {/* Distributed load downward arrows */}
          <g>
            <line x1="80" y1="40" x2="420" y2="40" stroke="#ea580c" strokeWidth="2" strokeDasharray="4 2" />
            {[100, 150, 200, 250, 300, 350, 400].map(x => (
              <g key={x}>
                <line x1={x} y1="40" x2={x} y2="75" stroke="#ea580c" strokeWidth="2" />
                <polygon points={`${x},78 ${x - 4},70 ${x + 4},70`} fill="#ea580c" />
              </g>
            ))}
            <text x="250" y="30" textAnchor="middle" className="font-handwritten text-xs font-bold fill-amber-700">
              w = {w} kN/m
            </text>
          </g>

          {/* Undeflected baseline */}
          <line x1="80" y1="85" x2="420" y2="85" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Deflected Beam Curve (Flexed Path) */}
          <path
            d={`M 80 85 Q 250 ${85 + sag} 420 85`}
            fill="none"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Midspan Moment callout */}
          <circle cx="250" cy={85 + sag} r="5" fill="#dc2626" />
          <line x1="250" y1={85 + sag} x2="250" y2="150" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="180" y="150" width="140" height="28" rx="4" fill="#fef2f2" stroke="#ef4444" strokeWidth="1" />
          <text x="250" y="168" textAnchor="middle" className="font-mono-code text-xs font-bold fill-red-700">
            M_max = {calculatedOutput.toFixed(1)} kN·m
          </text>

          {/* Supports */}
          <polygon points="80,95 68,115 92,115" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <polygon points="420,95 408,110 432,110" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="414" cy="115" r="4" fill="#94a3b8" />
          <circle cx="426" cy="115" r="4" fill="#94a3b8" />

          {/* Dimension L */}
          <text x="250" y="205" textAnchor="middle" className="font-handwritten text-sm font-bold fill-blue-700">
            Span L = {L} meters
          </text>
        </svg>
      );
    }

    case 'math-area-circle': {
      const r = values['r'] ?? 6;
      // Visual scale radius
      const pixelRadius = Math.min(80, Math.max(15, r * 5.5));

      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          {/* Visual Circle with expanding/contracting animation */}
          <circle
            cx="250"
            cy="110"
            r={pixelRadius}
            fill="#dcfce7"
            stroke="#16a34a"
            strokeWidth="3"
          />

          {/* Center point */}
          <circle cx="250" cy="110" r="4" fill="#0f172a" />

          {/* Radius Arrow */}
          <line x1="250" y1="110" x2={250 + pixelRadius} y2="110" stroke="#2563eb" strokeWidth="2.5" />
          <polygon points={`${250 + pixelRadius},110 ${250 + pixelRadius - 8},105 ${250 + pixelRadius - 8},115`} fill="#2563eb" />
          <text x={250 + pixelRadius / 2} y="100" textAnchor="middle" className="font-handwritten text-base font-bold fill-blue-700">
            r = {r} cm
          </text>

          {/* Live Area text inside or below */}
          <text x="250" y={Math.max(135, 110 + pixelRadius + 22)} textAnchor="middle" className="font-mono-code text-sm font-bold fill-emerald-800">
            Area = {calculatedOutput.toFixed(2)} cm²
          </text>
        </svg>
      );
    }

    case 'elec-ohms-law': {
      const v = values['V'] ?? 12;
      const r = values['R'] ?? 6;
      const current = calculatedOutput;
      const electronSpeed = Math.min(10, current * 2);

      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          {/* Wire loop */}
          <rect x="90" y="40" width="320" height="130" rx="8" fill="none" stroke="#334155" strokeWidth="3" />

          {/* Flowing electrons along wire */}
          {[0, 0.2, 0.4, 0.6, 0.8].map((offset, i) => {
            const t = isPlaying ? ((time * electronSpeed + offset * 10) % 10) / 10 : offset;
            // Map t along rectangle perimeter (4 segments)
            let ex = 90;
            let ey = 40;
            if (t < 0.35) {
              ex = 90 + (t / 0.35) * 320;
              ey = 40;
            } else if (t < 0.5) {
              ex = 410;
              ey = 40 + ((t - 0.35) / 0.15) * 130;
            } else if (t < 0.85) {
              ex = 410 - ((t - 0.5) / 0.35) * 320;
              ey = 170;
            } else {
              ex = 90;
              ey = 170 - ((t - 0.85) / 0.15) * 130;
            }

            return (
              <circle key={i} cx={ex} cy={ey} r="4" fill="#0284c7" className="animate-pulse" />
            );
          })}

          {/* Voltage Source (Left) */}
          <rect x="75" y="85" width="30" height="45" fill="#faf9f6" />
          <line x1="75" y1="95" x2="105" y2="95" stroke="#dc2626" strokeWidth="4" />
          <line x1="82" y1="110" x2="98" y2="110" stroke="#1e293b" strokeWidth="4" />
          <text x="50" y="112" className="font-handwritten text-xs font-bold fill-red-600">{v}V</text>

          {/* Resistor (Right) */}
          <rect x="395" y="80" width="30" height="50" fill="#faf9f6" />
          <path d="M 410 80 L 410 90 L 422 95 L 398 102 L 422 109 L 398 116 L 410 122 L 410 130" fill="none" stroke="#ea580c" strokeWidth="3" />
          <text x="435" y="112" className="font-handwritten text-xs font-bold fill-amber-700">{r}Ω</text>

          {/* Live Current readout */}
          <rect x="185" y="85" width="130" height="40" rx="6" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
          <text x="250" y="110" textAnchor="middle" className="font-mono-code text-sm font-bold fill-sky-800">
            I = {current.toFixed(2)} A
          </text>
        </svg>
      );
    }

    case 'phys-hookes-law': {
      const k = values['k'] ?? 150;
      const x = values['x'] ?? 0.2;
      const harmonicOffset = isPlaying ? Math.sin(time * Math.sqrt(k / 5)) * (x * 120) : x * 100;
      const springLength = 160 + harmonicOffset;

      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          {/* Wall */}
          <line x1="40" y1="40" x2="40" y2="170" stroke="#1e293b" strokeWidth="4" />
          {[50, 70, 90, 110, 130, 150].map(y => (
            <line key={y} x1="30" y1={y} x2="40" y2={y - 10} stroke="#64748b" strokeWidth="2" />
          ))}

          {/* Spring Coils */}
          <path
            d={`M 40 105 L 70 105 L 85 85 L 105 125 L 125 85 L 145 125 L 165 85 L 185 125 L ${40 + springLength - 30} 105 L ${40 + springLength} 105`}
            fill="none"
            stroke="#ea580c"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Mass block */}
          <rect
            x={40 + springLength}
            y="75"
            width="60"
            height="60"
            rx="4"
            fill="#cbd5e1"
            stroke="#334155"
            strokeWidth="2.5"
          />
          <text x={70 + springLength} y="110" textAnchor="middle" className="font-handwritten text-sm font-bold fill-slate-800">
            MASS
          </text>

          {/* Restoring Force Arrow */}
          <line x1={40 + springLength} y1="150" x2={40 + springLength - 40} y2="150" stroke="#dc2626" strokeWidth="2.5" />
          <polygon points={`${40 + springLength - 40},150 ${40 + springLength - 32},145 ${40 + springLength - 32},155`} fill="#dc2626" />
          <text x={40 + springLength - 20} y="165" textAnchor="middle" className="font-mono-code text-xs font-bold fill-red-600">
            F = {calculatedOutput.toFixed(1)} N
          </text>
        </svg>
      );
    }

    case 'cs-binary-conversion': {
      const decVal = Math.floor(calculatedOutput);
      const binaryString = decVal.toString(2).padStart(8, '0');

      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          <text x="250" y="40" textAnchor="middle" className="font-handwritten text-base font-bold fill-slate-800">
            8-Bit Register Live State: (Decimal = {decVal})
          </text>

          {/* 8 Bits Blocks */}
          {binaryString.split('').map((bit, idx) => {
            const bx = 65 + idx * 48;
            const weight = Math.pow(2, 7 - idx);
            const isActive = bit === '1';

            return (
              <g key={idx}>
                {/* Bit Cell */}
                <rect
                  x={bx}
                  y="70"
                  width="42"
                  height="60"
                  rx="6"
                  fill={isActive ? '#fce7f3' : '#f8fafc'}
                  stroke={isActive ? '#db2777' : '#cbd5e1'}
                  strokeWidth="2.5"
                />
                <text
                  x={bx + 21}
                  y="108"
                  textAnchor="middle"
                  className={`font-mono-code text-2xl font-bold ${isActive ? 'fill-pink-700' : 'fill-slate-400'}`}
                >
                  {bit}
                </text>
                {/* Place weight */}
                <text x={bx + 21} y="150" textAnchor="middle" className="font-mono-code text-[11px] font-semibold fill-slate-500">
                  2^{7 - idx}
                </text>
                <text x={bx + 21} y="165" textAnchor="middle" className="font-mono-code text-[10px] fill-slate-400">
                  ({weight})
                </text>
              </g>
            );
          })}

          <text x="250" y="195" textAnchor="middle" className="font-mono-code text-xs font-bold fill-pink-800">
            Active Sum: {binaryString.split('').map((b, i) => b === '1' ? Math.pow(2, 7 - i) : null).filter(Boolean).join(' + ') || '0'} = {decVal}
          </text>
        </svg>
      );
    }

    default:
      // Generic high-clarity 2D parameter gauge
      return (
        <svg viewBox="0 0 500 220" className="w-full h-full">
          <circle cx="250" cy="110" r="70" fill="#f8fafc" stroke="#475569" strokeWidth="2.5" />
          <path d="M 200 110 A 50 50 0 0 1 300 110" fill="none" stroke="#2563eb" strokeWidth="4" />
          <line x1="250" y1="110" x2="280" y2="70" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <circle cx="250" cy="110" r="6" fill="#0f172a" />
          <text x="250" y="150" textAnchor="middle" className="font-mono-code text-sm font-bold fill-slate-800">
            Output: {calculatedOutput.toFixed(2)}
          </text>
        </svg>
      );
  }
}
