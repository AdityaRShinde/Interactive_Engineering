import React from 'react';
import { Formula } from '../types';

interface ExcalidrawDiagramProps {
  formula: Formula;
  interactiveValues?: Record<string, number>;
  className?: string;
}

export const ExcalidrawDiagram: React.FC<ExcalidrawDiagramProps> = ({
  formula,
  interactiveValues = {},
  className = ''
}) => {
  // Render specific SVG diagrams based on formula.id or simulation type
  switch (formula.id) {
    case 'phys-newton-second-law': {
      const force = interactiveValues['F'] ?? 60;
      const mass = interactiveValues['m'] ?? 12;
      const arrowLength = Math.min(120, Math.max(30, force * 0.8));
      return (
        <svg viewBox="0 0 500 240" className={`w-full h-full ${className}`}>
          {/* Grid lines */}
          <line x1="20" y1="200" x2="480" y2="200" stroke="#475569" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="20" y1="203" x2="480" y2="203" stroke="#94a3b8" strokeWidth="1" />

          {/* Cart body */}
          <rect
            x="160"
            y="100"
            width="130"
            height="70"
            rx="4"
            fill="#fed7aa"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Cart Label */}
          <text x="225" y="135" textAnchor="middle" className="font-handwritten text-lg fill-amber-950 font-bold">
            CART (m = {mass} kg)
          </text>
          <text x="225" y="155" textAnchor="middle" className="font-mono-code text-xs fill-amber-800">
            [Inertial Mass]
          </text>

          {/* Wheels */}
          <circle cx="190" cy="180" r="14" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <circle cx="190" cy="180" r="5" fill="#f8fafc" />
          <circle cx="260" cy="180" r="14" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <circle cx="260" cy="180" r="5" fill="#f8fafc" />

          {/* Applied Force Vector Arrow (Red/Orange) */}
          <g>
            <line
              x1="290"
              y1="135"
              x2={290 + arrowLength}
              y2="135"
              stroke="#dc2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <polygon
              points={`${290 + arrowLength},135 ${280 + arrowLength},128 ${280 + arrowLength},142`}
              fill="#dc2626"
            />
            <text
              x={295 + arrowLength / 2}
              y="120"
              textAnchor="middle"
              className="font-handwritten text-base fill-red-700 font-bold"
            >
              F = {force} N →
            </text>
          </g>

          {/* Resulting Acceleration Vector */}
          <g>
            <line x1="160" y1="65" x2="260" y2="65" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />
            <polygon points="260,65 252,60 252,70" fill="#2563eb" />
            <text x="210" y="55" textAnchor="middle" className="font-handwritten text-sm fill-blue-700 font-bold">
              Acceleration a →
            </text>
          </g>

          {/* Handwritten Annotation Note */}
          <text x="40" y="50" className="font-handwritten text-sm fill-slate-600">
            ✎ Frictionless Plane
          </text>
          <path d="M 120 52 Q 140 70 160 100" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    }

    case 'mech-bending-moment': {
      const spanL = interactiveValues['L'] ?? 6;
      const loadW = interactiveValues['w'] ?? 12;
      return (
        <svg viewBox="0 0 500 250" className={`w-full h-full ${className}`}>
          {/* Distributed Load Arrows on top of beam */}
          <g>
            <line x1="80" y1="65" x2="420" y2="65" stroke="#ea580c" strokeWidth="2" strokeDasharray="4 2" />
            {[100, 150, 200, 250, 300, 350, 400].map((x) => (
              <g key={x}>
                <line x1={x} y1="65" x2={x} y2="105" stroke="#ea580c" strokeWidth="2" />
                <polygon points={`${x},108 ${x - 4},98 ${x + 4},98`} fill="#ea580c" />
              </g>
            ))}
            <text x="250" y="50" textAnchor="middle" className="font-handwritten text-base fill-amber-700 font-bold">
              w = {loadW} kN/m (Uniform Distributed Load)
            </text>
          </g>

          {/* Beam Member */}
          <rect
            x="80"
            y="110"
            width="340"
            height="18"
            rx="2"
            fill="#94a3b8"
            stroke="#1e293b"
            strokeWidth="2.5"
          />

          {/* Pin Support (Left) */}
          <polygon points="80,128 68,150 92,150" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
          <line x1="62" y1="150" x2="98" y2="150" stroke="#334155" strokeWidth="2" />
          <line x1="64" y1="154" x2="72" y2="162" stroke="#64748b" strokeWidth="1.5" />
          <line x1="74" y1="154" x2="82" y2="162" stroke="#64748b" strokeWidth="1.5" />
          <line x1="84" y1="154" x2="92" y2="162" stroke="#64748b" strokeWidth="1.5" />
          <text x="80" y="175" textAnchor="middle" className="font-handwritten text-xs fill-slate-700 font-bold">
            R_A = wL/2 ↑
          </text>

          {/* Roller Support (Right) */}
          <polygon points="420,128 408,144 432,144" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
          <circle cx="414" cy="150" r="5" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
          <circle cx="426" cy="150" r="5" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
          <line x1="404" y1="156" x2="436" y2="156" stroke="#334155" strokeWidth="2" />
          <text x="420" y="175" textAnchor="middle" className="font-handwritten text-xs fill-slate-700 font-bold">
            R_B = wL/2 ↑
          </text>

          {/* Dimension Line Span L */}
          <g>
            <line x1="80" y1="195" x2="420" y2="195" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="80" y1="188" x2="80" y2="202" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="420" y1="188" x2="420" y2="202" stroke="#2563eb" strokeWidth="1.5" />
            <text x="250" y="215" textAnchor="middle" className="font-handwritten text-base fill-blue-700 font-bold">
              Span L = {spanL} m
            </text>
          </g>

          {/* Parabolic Bending Moment Curve Preview */}
          <path
            d="M 80 120 Q 250 160 420 120"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text x="250" y="145" textAnchor="middle" className="font-handwritten text-xs fill-purple-700 font-bold">
            M_max = wL²/8
          </text>
        </svg>
      );
    }

    case 'math-area-circle': {
      const radius = interactiveValues['r'] ?? 6;
      return (
        <svg viewBox="0 0 500 240" className={`w-full h-full ${className}`}>
          {/* Circle */}
          <circle
            cx="250"
            cy="120"
            r="85"
            fill="#dcfce7"
            stroke="#15803d"
            strokeWidth="3"
            strokeDasharray="0"
          />

          {/* Center Point */}
          <circle cx="250" cy="120" r="4" fill="#0f172a" />
          <text x="242" y="112" className="font-handwritten text-xs fill-slate-700">O (Center)</text>

          {/* Radius Arrow */}
          <line x1="250" y1="120" x2="335" y2="120" stroke="#2563eb" strokeWidth="2.5" />
          <polygon points="335,120 327,115 327,125" fill="#2563eb" />
          <text x="290" y="112" textAnchor="middle" className="font-handwritten text-base fill-blue-700 font-bold">
            r = {radius} cm
          </text>

          {/* Shaded Area Formula Callout */}
          <rect x="180" y="145" width="140" height="32" rx="6" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
          <text x="250" y="166" textAnchor="middle" className="font-handwritten text-sm fill-emerald-800 font-bold">
            Area A = πr²
          </text>

          {/* Circumference Note */}
          <path d="M 345 90 Q 380 60 410 70" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="415" y="75" className="font-handwritten text-xs fill-slate-600">
            Perimeter C = 2πr
          </text>
        </svg>
      );
    }

    case 'elec-ohms-law': {
      const v = interactiveValues['V'] ?? 12;
      const r = interactiveValues['R'] ?? 6;
      return (
        <svg viewBox="0 0 500 240" className={`w-full h-full ${className}`}>
          {/* Circuit Loop Wires */}
          <rect x="90" y="40" width="320" height="150" rx="8" fill="none" stroke="#334155" strokeWidth="3" />

          {/* Battery DC Source on Left */}
          <rect x="80" y="90" width="20" height="50" fill="#faf9f6" />
          <line x1="75" y1="100" x2="105" y2="100" stroke="#dc2626" strokeWidth="4" />
          <line x1="82" y1="118" x2="98" y2="118" stroke="#1e293b" strokeWidth="4" />
          <line x1="75" y1="130" x2="105" y2="130" stroke="#dc2626" strokeWidth="4" />
          <text x="50" y="105" className="font-handwritten text-sm fill-red-600 font-bold">+</text>
          <text x="50" y="125" className="font-handwritten text-sm fill-slate-700 font-bold">-</text>
          <text x="40" y="148" className="font-handwritten text-sm fill-slate-800 font-bold">
            V = {v} V
          </text>

          {/* Resistor on Right */}
          <rect x="395" y="85" width="30" height="60" fill="#faf9f6" />
          <path
            d="M 410 85 L 410 95 L 422 100 L 398 108 L 422 116 L 398 124 L 422 132 L 410 137 L 410 145"
            fill="none"
            stroke="#ea580c"
            strokeWidth="3"
          />
          <text x="435" y="120" className="font-handwritten text-base fill-amber-700 font-bold">
            R = {r} Ω
          </text>

          {/* Current Flow Arrows on Top and Bottom */}
          <g>
            <line x1="200" y1="40" x2="280" y2="40" stroke="#0284c7" strokeWidth="3" />
            <polygon points="280,40 270,34 270,46" fill="#0284c7" />
            <text x="250" y="28" textAnchor="middle" className="font-handwritten text-base fill-sky-700 font-bold">
              Current I = V/R →
            </text>
          </g>

          {/* Formula Center Note */}
          <rect x="180" y="95" width="140" height="40" rx="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
          <text x="250" y="120" textAnchor="middle" className="font-handwritten text-base fill-sky-900 font-bold">
            V = I · R
          </text>
        </svg>
      );
    }

    default:
      // Generic high-precision Excalidraw diagram fallback
      return (
        <svg viewBox="0 0 500 230" className={`w-full h-full ${className}`}>
          {/* Engineering grid lines */}
          <line x1="20" y1="190" x2="480" y2="190" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />

          {/* Central schematic box */}
          <rect
            x="130"
            y="60"
            width="240"
            height="90"
            rx="8"
            fill="#f8fafc"
            stroke="#475569"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Header */}
          <text x="250" y="95" textAnchor="middle" className="font-handwritten text-lg fill-slate-800 font-bold">
            {formula.name}
          </text>
          <text x="250" y="125" textAnchor="middle" className="font-mono-code text-sm fill-slate-600 font-semibold">
            {formula.codeName || formula.formulaPlain}
          </text>

          {/* Technical dimension markers */}
          <line x1="130" y1="165" x2="370" y2="165" stroke="#2563eb" strokeWidth="1.5" />
          <line x1="130" y1="158" x2="130" y2="172" stroke="#2563eb" strokeWidth="1.5" />
          <line x1="370" y1="158" x2="370" y2="172" stroke="#2563eb" strokeWidth="1.5" />
          <text x="250" y="180" textAnchor="middle" className="font-handwritten text-xs fill-blue-700 font-bold">
            Variables: {(formula.variables || []).map(v => v.symbol).join(', ')}
          </text>

          {/* Annotation arrow */}
          <path d="M 50 80 Q 90 70 130 90" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="45" y="70" className="font-handwritten text-xs fill-slate-600">
            ✎ {formula.chapter}
          </text>
        </svg>
      );
  }
};
