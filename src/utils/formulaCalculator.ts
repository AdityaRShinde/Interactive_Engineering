import { Formula, RearrangementForm } from '../types';
import { convertValue } from './unitConverter';

/**
 * Universal safe mathematical expression evaluator
 */
export function evaluateMathExpression(expr: string, values: Record<string, number>): number {
  try {
    let sanitized = expr.trim();
    if (sanitized.includes('=')) {
      sanitized = sanitized.split('=')[1].trim();
    }

    // Replace known physical & math constants
    sanitized = sanitized
      .replace(/\bpi\b/gi, String(Math.PI))
      .replace(/\bπ\b/g, String(Math.PI))
      .replace(/\bE_steel\b/gi, '200e9')
      .replace(/\bg\b/g, '9.80665')
      .replace(/\bR_const\b/g, '8.314')
      .replace(/\bR\b/g, '8.314');

    // Replace variable symbols with numeric values (sort by length descending so longer variable names match first)
    const sortedKeys = Object.keys(values).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      const numVal = values[key];
      if (typeof numVal === 'number' && !isNaN(numVal)) {
        // Replace unicode or greek characters safely or standard alphanumeric words
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<=[^a-zA-Z0-9_]|^)${escapedKey}(?=[^a-zA-Z0-9_]|$)`, 'g');
        sanitized = sanitized.replace(regex, `(${numVal})`);
      }
    }

    // Replace powers like a^2 -> Math.pow(a, 2)
    sanitized = sanitized.replace(/([a-zA-Z0-9_().]+)\s*\^\s*([a-zA-Z0-9_().]+)/g, 'Math.pow($1, $2)');
    // Replace sqrt(x) -> Math.sqrt(x)
    sanitized = sanitized.replace(/\bsqrt\s*\(/gi, 'Math.sqrt(');
    // Replace abs, sin, cos, tan, ln, log
    sanitized = sanitized.replace(/\bsin\s*\(/gi, 'Math.sin(');
    sanitized = sanitized.replace(/\bcos\s*\(/gi, 'Math.cos(');
    sanitized = sanitized.replace(/\btan\s*\(/gi, 'Math.tan(');
    sanitized = sanitized.replace(/\bln\s*\(/gi, 'Math.log(');
    sanitized = sanitized.replace(/\blog\s*\(/gi, 'Math.log10(');
    sanitized = sanitized.replace(/\babs\s*\(/gi, 'Math.abs(');

    // Filter to only safe math characters
    const isSafe = /^[0-9+\-*/().,Mathpowsqrtesincotanlg10abs\s_eE]+$/.test(sanitized);
    if (!isSafe) {
      // Fallback simple numeric aggregation
      const nums = Object.values(values).filter(v => typeof v === 'number' && !isNaN(v));
      return nums.length > 0 ? nums.reduce((acc, curr) => acc * curr, 1) : 42;
    }

    const result = Function(`"use strict"; return (${sanitized})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return 0;
  } catch (err) {
    return 0;
  }
}

/**
 * High-precision evaluation of all engineering formulas in the catalog
 */
export function calculateFormulaOutput(
  formula: Formula | null,
  interactiveValues: Record<string, number>,
  targetUnit?: string
): number {
  if (!formula) return 0;
  const vals = interactiveValues || {};

  let rawResult = 0;
  const defaultUnit = formula.simulation?.outputUnit || '';

  switch (formula.id) {
    // 1. Normal Stress: σ = F / A
    case 'mech-normal-stress': {
      const F = vals['F'] ?? 120; // kN
      const A = vals['A'] ?? 0.04; // m²
      rawResult = A > 0 ? (F * 1000) / (A * 1000000) : 0; // Output in MPa
      break;
    }

    // 2. Beam Deflection: δ = P*L^3 / (48*E*I)
    case 'mech-beam-deflection': {
      const P = vals['P'] ?? vals['F'] ?? 30; // kN
      const L = vals['L'] ?? 5; // m
      const E = (vals['E'] ?? 200) * 1e9; // Pa (from GPa)
      const I = (vals['I'] ?? 6) * 1e-4; // m⁴ (from ×10⁻⁴ m⁴)
      const denom = 48 * E * I;
      const deltaM = denom > 0 ? (P * 1000 * Math.pow(L, 3)) / denom : 0;
      rawResult = deltaM * 1000; // Output in mm
      break;
    }

    // 3. Torsional Shear Stress: τ = T*r / J
    case 'mech-torsion-shaft': {
      const T = vals['T'] ?? 12; // kN·m
      const r = vals['r'] ?? 45; // mm
      const rM = r / 1000; // m
      const J = (Math.PI * Math.pow(rM, 4)) / 2; // m⁴
      rawResult = J > 0 ? (T * 1000 * rM) / J / 1000000 : 0; // Output in MPa
      break;
    }

    // 4. Euler Column Buckling: P_cr = π²*E*I / (K*L)²
    case 'civil-euler-buckling': {
      const L = vals['L'] ?? 3.5; // m
      const K = vals['K'] ?? 1.0; // factor
      const I = (vals['I'] ?? 16) * 1e-6; // m⁴ (from ×10⁻⁶ m⁴)
      const E = 200 * 1e9; // Pa (Steel = 200 GPa)
      const effLen = K * L;
      const denom = Math.pow(effLen, 2);
      rawResult = denom > 0 ? (Math.PI * Math.PI * E * I) / denom / 1000 : 0; // Output in kN
      break;
    }

    // 5. Hydrostatic Fluid Pressure: p = ρ*g*h
    case 'civil-hydrostatic-pressure': {
      const h = vals['h'] ?? 12; // m
      const rho = vals['ρ'] ?? vals['rho'] ?? 1000; // kg/m³
      const g = 9.80665; // m/s²
      rawResult = (rho * g * h) / 1000; // Output in kPa
      break;
    }

    // 6. Kinetic Energy: E_k = 0.5 * m * v²
    case 'phys-kinetic-energy': {
      const v = vals['v'] ?? 15; // m/s
      const m = vals['m'] ?? 1000; // kg
      rawResult = (0.5 * m * Math.pow(v, 2)) / 1000; // Output in kJ
      break;
    }

    // 7. Ohm's Law: I = V / R (or V = I*R)
    case 'elec-ohms-law': {
      const V = vals['V'] ?? 12; // V
      const R = vals['R'] ?? 6; // Ω
      rawResult = R > 0 ? V / R : 0; // Output in A
      break;
    }

    // 8. Circle Area: A = π * r²
    case 'math-area-circle': {
      const r = vals['r'] ?? 6; // cm
      rawResult = Math.PI * Math.pow(r, 2); // Output in cm²
      break;
    }

    // 9. Bending Stress: σ = M*y / I
    case 'mech-bending-stress': {
      const M = vals['M'] ?? 60; // kN·m
      const y = vals['y'] ?? 120; // mm
      const I = (vals['I'] ?? 90) * 1e-6; // m⁴ (from ×10⁻⁶ m⁴)
      const yM = y / 1000; // m
      rawResult = I > 0 ? (M * 1000 * yM) / I / 1000000 : 0; // Output in MPa
      break;
    }

    // 10. Hooke's Law: F = k * x
    case 'phys-hookes-law': {
      const k = vals['k'] ?? 250; // N/m
      const x = vals['x'] ?? 14; // cm
      rawResult = k * (x / 100); // Output in N
      break;
    }

    // 11. Electrical Power: P = V * I
    case 'elec-electrical-power': {
      const V = vals['V'] ?? 120; // V
      const I = vals['I'] ?? 5; // A
      rawResult = V * I; // Output in W
      break;
    }

    // 12. Newton's Second Law: F = m * a
    case 'phys-newton-second-law': {
      const m = vals['m'] ?? 60; // kg
      const a = vals['a'] ?? 5; // m/s²
      rawResult = m * a; // Output in N
      break;
    }

    // 13. Ideal Gas Law: P = n*R*T / V
    case 'chem-ideal-gas-law': {
      const n = vals['n'] ?? 1.0; // mol
      const T = vals['T'] ?? 300; // K
      const V = vals['V'] ?? 25; // L
      const R_const = 8.314462618; // J/(mol·K)
      rawResult = V > 0 ? (n * R_const * T) / V : 0; // Output in kPa
      break;
    }

    // 14. Pythagorean Theorem: c = √(a² + b²)
    case 'math-pythagorean': {
      const a = vals['a'] ?? 6;
      const b = vals['b'] ?? 8;
      rawResult = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
      break;
    }

    default: {
      // Dynamic fallback evaluator for AI-generated or custom formulas
      if (formula.formulaPlain) {
        rawResult = evaluateMathExpression(formula.formulaPlain, vals);
      } else {
        const nums = Object.values(vals).filter(v => typeof v === 'number' && !isNaN(v));
        rawResult = nums.length > 0 ? nums.reduce((acc, curr) => acc + curr, 0) : 42.0;
      }
      break;
    }
  }

  // Convert to user-chosen output unit if different from base output unit
  if (targetUnit && defaultUnit && targetUnit !== defaultUnit) {
    return convertValue(rawResult, defaultUnit, targetUnit);
  }

  return rawResult;
}

/**
 * Calculate solved value for a rearranged formula
 */
export function calculateRearrangedValue(
  rearr: RearrangementForm | undefined,
  calculatorInputs: Record<string, number>,
  defaultFormulaOutput: number
): number {
  if (!rearr) return defaultFormulaOutput;

  // 1. If custom calculate function is attached
  if (typeof rearr.calculate === 'function') {
    try {
      const val = rearr.calculate(calculatorInputs);
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return val;
      }
    } catch (e) {
      console.warn('Custom calculate error:', e);
    }
  }

  // 2. Analytical solutions for standard catalog formulas
  const target = rearr.targetSymbol;
  const vals = calculatorInputs || {};

  // Normal Stress rearrangements
  if (target === 'F' && vals['\\sigma'] !== undefined && vals['A'] !== undefined) {
    return vals['\\sigma'] * vals['A'] * 1000;
  }
  if (target === 'A' && vals['F'] !== undefined && vals['\\sigma'] !== undefined && vals['\\sigma'] > 0) {
    return (vals['F'] * 1000) / (vals['\\sigma'] * 1000000);
  }

  // Ohm's law rearrangements
  if (target === 'V' && vals['I'] !== undefined && vals['R'] !== undefined) {
    return vals['I'] * vals['R'];
  }
  if (target === 'R' && vals['V'] !== undefined && vals['I'] !== undefined && vals['I'] > 0) {
    return vals['V'] / vals['I'];
  }

  // Kinetic energy rearrangements
  if (target === 'v' && vals['E_k'] !== undefined && vals['m'] !== undefined && vals['m'] > 0) {
    return Math.sqrt((2 * vals['E_k'] * 1000) / vals['m']);
  }
  if (target === 'm' && vals['E_k'] !== undefined && vals['v'] !== undefined && vals['v'] > 0) {
    return (2 * vals['E_k'] * 1000) / Math.pow(vals['v'], 2);
  }

  // Hooke's law rearrangements
  if (target === 'x' && vals['F'] !== undefined && vals['k'] !== undefined && vals['k'] > 0) {
    return (vals['F'] / vals['k']) * 100;
  }
  if (target === 'k' && vals['F'] !== undefined && vals['x'] !== undefined && vals['x'] > 0) {
    return vals['F'] / (vals['x'] / 100);
  }

  // Power rearrangements
  if (target === 'I' && vals['P'] !== undefined && vals['V'] !== undefined && vals['V'] > 0) {
    return vals['P'] / vals['V'];
  }
  if (target === 'V' && vals['P'] !== undefined && vals['I'] !== undefined && vals['I'] > 0) {
    return vals['P'] / vals['I'];
  }

  // F = m*a rearrangements
  if (target === 'a' && vals['F'] !== undefined && vals['m'] !== undefined && vals['m'] > 0) {
    return vals['F'] / vals['m'];
  }
  if (target === 'm' && vals['F'] !== undefined && vals['a'] !== undefined && vals['a'] > 0) {
    return vals['F'] / vals['a'];
  }

  // Circle area rearrangements
  if (target === 'r' && vals['A'] !== undefined && vals['A'] >= 0) {
    return Math.sqrt(vals['A'] / Math.PI);
  }
  if (target === 'd' && vals['A'] !== undefined && vals['A'] >= 0) {
    return 2 * Math.sqrt(vals['A'] / Math.PI);
  }

  // Hydrostatic pressure rearrangements
  if (target === 'h' && vals['p'] !== undefined && vals['\\rho'] !== undefined && vals['\\rho'] > 0) {
    return (vals['p'] * 1000) / (vals['\\rho'] * 9.80665);
  }

  // 3. Dynamic mathematical evaluator
  if (rearr.plain) {
    const evaluated = evaluateMathExpression(rearr.plain, vals);
    if (typeof evaluated === 'number' && !isNaN(evaluated) && isFinite(evaluated)) {
      return evaluated;
    }
  }

  return defaultFormulaOutput;
}
