import React, { useState } from 'react';
import { Formula } from '../../types';
import { Activity, TrendingUp } from 'lucide-react';
import { calculateFormulaOutput } from '../../utils/formulaCalculator';

interface SensitivityGraphProps {
  formula: Formula;
  currentValues: Record<string, number>;
  calculatedValue: number;
}

export const SensitivityGraph: React.FC<SensitivityGraphProps> = ({
  formula,
  currentValues,
  calculatedValue
}) => {
  const [xAxisVar, setXAxisVar] = useState<string>(
    formula.simulation?.customInputs?.[0]?.id || formula.variables?.[0]?.symbol || 'F'
  );

  // Generate 20 graph plot points around the current operating range
  const inputConfig = formula.simulation?.customInputs?.find(c => c.id === xAxisVar) || {
    min: 5,
    max: 100,
    step: 5,
    label: xAxisVar,
    unit: ''
  };

  const minX = inputConfig.min || 1;
  const maxX = inputConfig.max || 100;
  const stepX = (maxX - minX) / 20;

  const points: { x: number; y: number }[] = [];
  const vals = currentValues || {};
  for (let x = minX; x <= maxX; x += stepX) {
    const pointVals = { ...vals, [xAxisVar]: x };
    const y = calculateFormulaOutput(formula, pointVals);
    points.push({ x, y });
  }

  const maxY = Math.max(...points.map(p => p.y), calculatedValue * 1.2, 1);
  const minY = 0;

  // SVG Coordinates mapping (viewBox 0 0 500 240)
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = 500 - padLeft - padRight;
  const plotHeight = 240 - padTop - padBottom;

  const getSvgX = (xVal: number) => padLeft + ((xVal - minX) / (maxX - minX)) * plotWidth;
  const getSvgY = (yVal: number) => padTop + plotHeight - ((yVal - minY) / (maxY - minY)) * plotHeight;

  const pathD = points.reduce((acc, pt, idx) => {
    const sx = getSvgX(pt.x);
    const sy = getSvgY(pt.y);
    return idx === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
  }, '');

  const currentX = currentValues[xAxisVar] ?? minX;
  const currSvgX = getSvgX(currentX);
  const currSvgY = getSvgY(calculatedValue);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
      {/* Header & Axis Selection */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Real-Time Parameter Sensitivity Curve</span>
        </div>

        {/* X-Axis Selector */}
        {formula.simulation?.customInputs && formula.simulation.customInputs.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-[#717171]">
            <span className="font-medium">Sweep Variable:</span>
            <select
              value={xAxisVar}
              onChange={(e) => setXAxisVar(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#e5e7eb] rounded-full font-bold text-[#000000] focus:outline-none focus:border-[#000000] shadow-xs"
            >
              {formula.simulation.customInputs.map(inp => (
                <option key={inp.id} value={inp.id}>
                  {inp.label} ({inp.symbol})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SVG Sensitivity Curve */}
      <div className="relative w-full aspect-2/1 bg-[#faf8f0] rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <svg viewBox="0 0 500 240" className="w-full h-full">
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
            const y = padTop + plotHeight * (1 - frac);
            const val = (minY + frac * (maxY - minY)).toFixed(1);
            return (
              <g key={`grid-${i}`}>
                <line x1={padLeft} y1={y} x2={500 - padRight} y2={y} stroke="#E5E7EB" strokeWidth="1" />
                <text x={padLeft - 8} y={y + 4} textAnchor="end" className="font-mono-tech text-[10px] fill-[#717171]">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotHeight} stroke="#000000" strokeWidth="1.5" />
          <line x1={padLeft} y1={padTop + plotHeight} x2={500 - padRight} y2={padTop + plotHeight} stroke="#000000" strokeWidth="1.5" />

          {/* Plotted Sensitivity Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#d8573f"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Current Operating Point Marker */}
          <g transform={`translate(${currSvgX}, ${currSvgY})`}>
            {/* Pulsing Target Ring */}
            <circle cx="0" cy="0" r="12" fill="#ffdd00" fillOpacity="0.4" className="animate-ping" />
            <circle cx="0" cy="0" r="5" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
            
            {/* Coordinate Label */}
            <rect x="-45" y="-28" width="90" height="20" rx="10" fill="#000000" />
            <text x="0" y="-15" textAnchor="middle" className="font-mono-tech text-[10px] fill-white font-bold">
              ({currentX}, {calculatedValue.toFixed(1)})
            </text>
          </g>

          {/* X Axis Label */}
          <text x={250} y={232} textAnchor="middle" className="font-mono-tech text-[11px] font-bold fill-[#000000]">
            {xAxisVar} [{inputConfig.unit || ''}] →
          </text>

          {/* Y Axis Label */}
          <text x={20} y={15} className="font-mono-tech text-[10px] font-bold fill-[#000000]">
            {formula.simulation?.outputUnit} ↑
          </text>
        </svg>
      </div>

      {/* Engineering Insight Footer */}
      <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-3 text-xs text-[#222222]">
        <span className="font-bold text-[#d8573f]">Operating State Insight: </span>
        <span>
          Operating at {xAxisVar} = {currentX} {inputConfig.unit || ''}. Slope shows sensitivity rate ∂(Result)/∂({xAxisVar}).
        </span>
      </div>
    </div>
  );
};
