import { RearrangementForm } from '../types';

export const FORMULA_REARRANGEMENTS: Record<string, RearrangementForm[]> = {
  // 1. Normal Stress: σ = F / A
  'mech-normal-stress': [
    {
      targetSymbol: 'F',
      targetName: 'Axial Load / Force (F)',
      latex: 'F = \\sigma \\cdot A',
      plain: 'F = σ * A',
      description: 'Calculates the maximum allowable axial load that can be safely applied for a given allowable stress limit and cross-sectional area.',
      requiredInputs: ['σ', 'A'],
      resultUnit: 'kN',
      calculate: (inputs) => {
        const sigma = inputs['σ'] ?? inputs['sigma'] ?? 2.0; // MPa
        const A = inputs['A'] ?? 0.04; // m²
        // Force in kN: (MPa * 10^6 N/m² * m²) / 1000 = kN
        return sigma * A * 1000;
      }
    },
    {
      targetSymbol: 'A',
      targetName: 'Required Cross-Section Area (A)',
      latex: 'A = \\frac{F}{\\sigma}',
      plain: 'A = F / σ',
      description: 'Determines the minimum cross-sectional area required to prevent material yield or rupture under a given tensile/compressive load.',
      requiredInputs: ['F', 'σ'],
      resultUnit: 'm²',
      calculate: (inputs) => {
        const F = inputs['F'] ?? 120; // kN
        const sigma = inputs['σ'] ?? inputs['sigma'] ?? 2.0; // MPa
        if (sigma <= 0) return 0;
        // Area in m²: (F * 1000 N) / (sigma * 10^6 N/m²)
        return (F * 1000) / (sigma * 1000000);
      }
    }
  ],

  // 2. Beam Deflection: Δ = PL³ / (48EI)
  'mech-beam-deflection': [
    {
      targetSymbol: 'P',
      targetName: 'Allowable Central Load (P)',
      latex: 'P = \\frac{48 \\cdot E \\cdot I \\cdot \\Delta}{L^3}',
      plain: 'P = (48 * E * I * Δ) / L^3',
      description: 'Calculates the maximum concentrated point load permissible before exceeding the allowable deflection limit Δ.',
      requiredInputs: ['Δ', 'L', 'E', 'I'],
      resultUnit: 'kN',
      calculate: (inputs) => {
        const delta = inputs['Δ'] ?? inputs['delta'] ?? 1.0; // mm
        const L = inputs['L'] ?? 5; // m
        const E = (inputs['E'] ?? 200) * 1e9; // Pa
        const I = (inputs['I'] ?? 6) * 1e-4; // m⁴
        const deltaM = delta / 1000; // m
        if (L <= 0) return 0;
        const P_N = (48 * E * I * deltaM) / Math.pow(L, 3);
        return P_N / 1000; // kN
      }
    },
    {
      targetSymbol: 'L',
      targetName: 'Maximum Allowable Span (L)',
      latex: 'L = \\sqrt[3]{\\frac{48 \\cdot E \\cdot I \\cdot \\Delta}{P}}',
      plain: 'L = ((48 * E * I * Δ) / P)^(1/3)',
      description: 'Finds the maximum allowable unsupported beam span length that satisfies serviceability deflection criteria under load P.',
      requiredInputs: ['P', 'Δ', 'E', 'I'],
      resultUnit: 'm',
      calculate: (inputs) => {
        const P = (inputs['P'] ?? 30) * 1000; // N
        const delta = (inputs['Δ'] ?? inputs['delta'] ?? 1.0) / 1000; // m
        const E = (inputs['E'] ?? 200) * 1e9; // Pa
        const I = (inputs['I'] ?? 6) * 1e-4; // m⁴
        if (P <= 0) return 0;
        const L_cubed = (48 * E * I * delta) / P;
        return Math.cbrt(Math.max(0, L_cubed));
      }
    },
    {
      targetSymbol: 'I',
      targetName: 'Required Moment of Inertia (I)',
      latex: 'I = \\frac{P \\cdot L^3}{48 \\cdot E \\cdot \\Delta}',
      plain: 'I = (P * L^3) / (48 * E * Δ)',
      description: 'Determines the minimum second moment of area needed in structural beam sizing to restrict midspan sag to Δ.',
      requiredInputs: ['P', 'L', 'E', 'Δ'],
      resultUnit: '×10⁻⁴ m⁴',
      calculate: (inputs) => {
        const P = (inputs['P'] ?? 30) * 1000; // N
        const L = inputs['L'] ?? 5; // m
        const E = (inputs['E'] ?? 200) * 1e9; // Pa
        const delta = (inputs['Δ'] ?? inputs['delta'] ?? 1.0) / 1000; // m
        const denom = 48 * E * delta;
        if (denom <= 0) return 0;
        const I_m4 = (P * Math.pow(L, 3)) / denom;
        return I_m4 / 1e-4;
      }
    },
    {
      targetSymbol: 'E',
      targetName: 'Material Elastic Modulus (E)',
      latex: 'E = \\frac{P \\cdot L^3}{48 \\cdot I \\cdot \\Delta}',
      plain: 'E = (P * L^3) / (48 * I * Δ)',
      description: 'Used in experimental material characterization to measure Young\'s modulus from a 3-point flexural bend test.',
      requiredInputs: ['P', 'L', 'I', 'Δ'],
      resultUnit: 'GPa',
      calculate: (inputs) => {
        const P = (inputs['P'] ?? 30) * 1000; // N
        const L = inputs['L'] ?? 5; // m
        const I = (inputs['I'] ?? 6) * 1e-4; // m⁴
        const delta = (inputs['Δ'] ?? inputs['delta'] ?? 1.0) / 1000; // m
        const denom = 48 * I * delta;
        if (denom <= 0) return 0;
        const E_Pa = (P * Math.pow(L, 3)) / denom;
        return E_Pa / 1e9;
      }
    }
  ],

  // 3. Torsion in Circular Shaft: τ = Tr / J
  'mech-torsion-shaft': [
    {
      targetSymbol: 'T',
      targetName: 'Torque Transmission Capacity (T)',
      latex: 'T = \\frac{\\tau \\cdot J}{r} = \\frac{\\pi \\cdot \\tau \\cdot r^3}{2}',
      plain: 'T = (τ * J) / r',
      description: 'Calculates the torque rating a shaft of given radius and allowable shear stress can transmit safely.',
      requiredInputs: ['τ', 'r'],
      resultUnit: 'kN·m',
      calculate: (inputs) => {
        const tau = (inputs['τ'] ?? inputs['tau'] ?? 40) * 1e6; // Pa
        const r = (inputs['r'] ?? 45) / 1000; // m
        const J = (Math.PI * Math.pow(r, 4)) / 2;
        if (r <= 0) return 0;
        const T_Nm = (tau * J) / r;
        return T_Nm / 1000; // kN·m
      }
    },
    {
      targetSymbol: 'r',
      targetName: 'Minimum Shaft Radius (r)',
      latex: 'r = \\sqrt[3]{\\frac{2 \\cdot T}{\\pi \\cdot \\tau}}',
      plain: 'r = ((2 * T) / (π * τ))^(1/3)',
      description: 'Sizes the minimum solid shaft radius required to transmit torque T without exceeding maximum shear stress τ.',
      requiredInputs: ['T', 'τ'],
      resultUnit: 'mm',
      calculate: (inputs) => {
        const T = (inputs['T'] ?? 12) * 1000; // N·m
        const tau = (inputs['τ'] ?? inputs['tau'] ?? 40) * 1e6; // Pa
        if (tau <= 0) return 0;
        const r_m = Math.cbrt((2 * T) / (Math.PI * tau));
        return r_m * 1000; // mm
      }
    }
  ],

  // 4. Euler Buckling: P_cr = π²EI / (KL)²
  'civil-euler-buckling': [
    {
      targetSymbol: 'I',
      targetName: 'Required Column Inertia (I)',
      latex: 'I = \\frac{P_{cr} \\cdot (K \\cdot L)^2}{\\pi^2 \\cdot E}',
      plain: 'I = (P_cr * (K * L)^2) / (π^2 * E)',
      description: 'Calculates the minimum weak-axis moment of inertia required to prevent column buckling under axial load P_cr.',
      requiredInputs: ['P_cr', 'L', 'K'],
      resultUnit: '×10⁻⁶ m⁴',
      calculate: (inputs) => {
        const P_cr = (inputs['P_cr'] ?? inputs['P'] ?? 1600) * 1000; // N
        const L = inputs['L'] ?? 3.5; // m
        const K = inputs['K'] ?? 1.0;
        const E = 200 * 1e9; // Pa
        const effLen = K * L;
        const I_m4 = (P_cr * Math.pow(effLen, 2)) / (Math.PI * Math.PI * E);
        return I_m4 / 1e-6;
      }
    },
    {
      targetSymbol: 'L',
      targetName: 'Max Column Height / Length (L)',
      latex: 'L = \\frac{1}{K} \\sqrt{\\frac{\\pi^2 \\cdot E \\cdot I}{P_{cr}}}',
      plain: 'L = (1 / K) * sqrt((π^2 * E * I) / P_cr)',
      description: 'Calculates the maximum unsupported height a structural column can reach before buckling instability occurs.',
      requiredInputs: ['P_cr', 'K', 'I'],
      resultUnit: 'm',
      calculate: (inputs) => {
        const P_cr = (inputs['P_cr'] ?? inputs['P'] ?? 1600) * 1000; // N
        const K = inputs['K'] ?? 1.0;
        const I = (inputs['I'] ?? 16) * 1e-6; // m⁴
        const E = 200 * 1e9; // Pa
        if (P_cr <= 0 || K <= 0) return 0;
        const L = (1 / K) * Math.sqrt((Math.PI * Math.PI * E * I) / P_cr);
        return L;
      }
    }
  ],

  // 5. Hydrostatic Pressure: p = ρ * g * h
  'civil-hydrostatic-pressure': [
    {
      targetSymbol: 'h',
      targetName: 'Submerged Fluid Depth (h)',
      latex: 'h = \\frac{p}{\\rho \\cdot g}',
      plain: 'h = p / (ρ * g)',
      description: 'Calculates the depth in liquid required to create a specific pressure level p (e.g. submersible design, tank level gauging).',
      requiredInputs: ['p', 'ρ'],
      resultUnit: 'm',
      calculate: (inputs) => {
        const p = (inputs['p'] ?? 120) * 1000; // Pa
        const rho = inputs['ρ'] ?? inputs['rho'] ?? 1000; // kg/m³
        const g = 9.80665; // m/s²
        if (rho <= 0) return 0;
        return p / (rho * g);
      }
    },
    {
      targetSymbol: 'ρ',
      targetName: 'Fluid Density (ρ)',
      latex: '\\rho = \\frac{p}{g \\cdot h}',
      plain: 'ρ = p / (g * h)',
      description: 'Determines the density of an unknown liquid by measuring pressure p at depth h using a manometer.',
      requiredInputs: ['p', 'h'],
      resultUnit: 'kg/m³',
      calculate: (inputs) => {
        const p = (inputs['p'] ?? 120) * 1000; // Pa
        const h = inputs['h'] ?? 12; // m
        const g = 9.80665;
        if (h <= 0) return 0;
        return p / (g * h);
      }
    }
  ],

  // 6. Kinetic Energy: E_k = 0.5 * m * v²
  'phys-kinetic-energy': [
    {
      targetSymbol: 'v',
      targetName: 'Kinetic Velocity (v)',
      latex: 'v = \\sqrt{\\frac{2 \\cdot E_k}{m}}',
      plain: 'v = sqrt((2 * E_k) / m)',
      description: 'Calculates the speed attained by a mass m possessing kinetic energy E_k (used in crash safety & ballistic impact analysis).',
      requiredInputs: ['E_k', 'm'],
      resultUnit: 'm/s',
      calculate: (inputs) => {
        const Ek = (inputs['E_k'] ?? inputs['Ek'] ?? 112.5) * 1000; // Joules
        const m = inputs['m'] ?? 1000; // kg
        if (m <= 0 || Ek < 0) return 0;
        return Math.sqrt((2 * Ek) / m);
      }
    },
    {
      targetSymbol: 'm',
      targetName: 'Object Mass (m)',
      latex: 'm = \\frac{2 \\cdot E_k}{v^2}',
      plain: 'm = (2 * E_k) / v^2',
      description: 'Determines the mass of a moving body from its measured kinetic energy and velocity.',
      requiredInputs: ['E_k', 'v'],
      resultUnit: 'kg',
      calculate: (inputs) => {
        const Ek = (inputs['E_k'] ?? inputs['Ek'] ?? 112.5) * 1000; // Joules
        const v = inputs['v'] ?? 15; // m/s
        if (v <= 0) return 0;
        return (2 * Ek) / Math.pow(v, 2);
      }
    }
  ],

  // 7. Ohm's Law: I = V / R
  'elec-ohms-law': [
    {
      targetSymbol: 'V',
      targetName: 'Circuit Voltage (V)',
      latex: 'V = I \\cdot R',
      plain: 'V = I * R',
      description: 'Calculates the potential difference across a resistor required to drive current I through resistance R.',
      requiredInputs: ['I', 'R'],
      resultUnit: 'V',
      calculate: (inputs) => {
        const I = inputs['I'] ?? 2.0; // A
        const R = inputs['R'] ?? 6.0; // Ω
        return I * R;
      }
    },
    {
      targetSymbol: 'R',
      targetName: 'Circuit Resistance (R)',
      latex: 'R = \\frac{V}{I}',
      plain: 'R = V / I',
      description: 'Determines the resistance of an electrical component when voltage V produces current I.',
      requiredInputs: ['V', 'I'],
      resultUnit: 'Ω',
      calculate: (inputs) => {
        const V = inputs['V'] ?? 12.0; // V
        const I = inputs['I'] ?? 2.0; // A
        if (I <= 0) return 0;
        return V / I;
      }
    }
  ],

  // 8. Circle Area: A = π * r²
  'math-area-circle': [
    {
      targetSymbol: 'r',
      targetName: 'Circle Radius (r)',
      latex: 'r = \\sqrt{\\frac{A}{\\pi}}',
      plain: 'r = sqrt(A / π)',
      description: 'Calculates the radius of a circular geometry enclosing a desired surface area A.',
      requiredInputs: ['A'],
      resultUnit: 'cm',
      calculate: (inputs) => {
        const A = inputs['A'] ?? 113.1; // cm²
        if (A <= 0) return 0;
        return Math.sqrt(A / Math.PI);
      }
    },
    {
      targetSymbol: 'd',
      targetName: 'Circle Diameter (d)',
      latex: 'd = 2 \\cdot \\sqrt{\\frac{A}{\\pi}}',
      plain: 'd = 2 * sqrt(A / π)',
      description: 'Directly computes circular cross-sectional diameter from surface area.',
      requiredInputs: ['A'],
      resultUnit: 'cm',
      calculate: (inputs) => {
        const A = inputs['A'] ?? 113.1; // cm²
        if (A <= 0) return 0;
        return 2 * Math.sqrt(A / Math.PI);
      }
    }
  ],

  // 9. Bending Stress: σ = My / I
  'mech-bending-stress': [
    {
      targetSymbol: 'M',
      targetName: 'Bending Moment Capacity (M)',
      latex: 'M = \\frac{\\sigma \\cdot I}{y}',
      plain: 'M = (σ * I) / y',
      description: 'Calculates maximum bending moment a beam section can resist without exceeding allowable fiber stress σ.',
      requiredInputs: ['σ', 'y', 'I'],
      resultUnit: 'kN·m',
      calculate: (inputs) => {
        const sigma = (inputs['σ'] ?? inputs['sigma'] ?? 80) * 1e6; // Pa
        const y = (inputs['y'] ?? 120) / 1000; // m
        const I = (inputs['I'] ?? 90) * 1e-6; // m⁴
        if (y <= 0) return 0;
        const M_Nm = (sigma * I) / y;
        return M_Nm / 1000; // kN·m
      }
    },
    {
      targetSymbol: 'I',
      targetName: 'Required Section Inertia (I)',
      latex: 'I = \\frac{M \\cdot y}{\\sigma}',
      plain: 'I = (M * y) / σ',
      description: 'Calculates required second moment of area for a chosen section depth to resist moment M at allowable stress σ.',
      requiredInputs: ['M', 'y', 'σ'],
      resultUnit: '×10⁻⁶ m⁴',
      calculate: (inputs) => {
        const M = (inputs['M'] ?? 60) * 1000; // N·m
        const y = (inputs['y'] ?? 120) / 1000; // m
        const sigma = (inputs['σ'] ?? inputs['sigma'] ?? 80) * 1e6; // Pa
        if (sigma <= 0) return 0;
        const I_m4 = (M * y) / sigma;
        return I_m4 / 1e-6;
      }
    },
    {
      targetSymbol: 'y',
      targetName: 'Extreme Fiber Distance (y)',
      latex: 'y = \\frac{\\sigma \\cdot I}{M}',
      plain: 'y = (σ * I) / M',
      description: 'Locates the outer fiber coordinate where bending stress reaches value σ.',
      requiredInputs: ['σ', 'I', 'M'],
      resultUnit: 'mm',
      calculate: (inputs) => {
        const sigma = (inputs['σ'] ?? inputs['sigma'] ?? 80) * 1e6; // Pa
        const I = (inputs['I'] ?? 90) * 1e-6; // m⁴
        const M = (inputs['M'] ?? 60) * 1000; // N·m
        if (M <= 0) return 0;
        const y_m = (sigma * I) / M;
        return y_m * 1000; // mm
      }
    }
  ],

  // 10. Hooke's Law: F = k * x
  'phys-hookes-law': [
    {
      targetSymbol: 'x',
      targetName: 'Spring Extension / Compression (x)',
      latex: 'x = \\frac{F}{k}',
      plain: 'x = F / k',
      description: 'Calculates the displacement of an elastic spring subjected to restoring tension or compression force F.',
      requiredInputs: ['F', 'k'],
      resultUnit: 'cm',
      calculate: (inputs) => {
        const F = inputs['F'] ?? 35; // N
        const k = inputs['k'] ?? 250; // N/m
        if (k <= 0) return 0;
        return (F / k) * 100; // cm
      }
    },
    {
      targetSymbol: 'k',
      targetName: 'Spring Stiffness / Constant (k)',
      latex: 'k = \\frac{F}{x}',
      plain: 'k = F / x',
      description: 'Determines the stiffness rating of a suspension coil or measuring spring from applied load and deflection.',
      requiredInputs: ['F', 'x'],
      resultUnit: 'N/m',
      calculate: (inputs) => {
        const F = inputs['F'] ?? 35; // N
        const x = (inputs['x'] ?? 14) / 100; // m
        if (x <= 0) return 0;
        return F / x;
      }
    }
  ],

  // 11. Electrical Power: P = V * I
  'elec-electrical-power': [
    {
      targetSymbol: 'I',
      targetName: 'Electric Current Draw (I)',
      latex: 'I = \\frac{P}{V}',
      plain: 'I = P / V',
      description: 'Calculates the current drawn by an appliance or motor of power rating P connected to supply voltage V.',
      requiredInputs: ['P', 'V'],
      resultUnit: 'A',
      calculate: (inputs) => {
        const P = inputs['P'] ?? 600; // W
        const V = inputs['V'] ?? 120; // V
        if (V <= 0) return 0;
        return P / V;
      }
    },
    {
      targetSymbol: 'V',
      targetName: 'Operating Voltage (V)',
      latex: 'V = \\frac{P}{I}',
      plain: 'V = P / I',
      description: 'Determines the electrical potential required to deliver power P when circuit current is limited to I.',
      requiredInputs: ['P', 'I'],
      resultUnit: 'V',
      calculate: (inputs) => {
        const P = inputs['P'] ?? 600; // W
        const I = inputs['I'] ?? 5; // A
        if (I <= 0) return 0;
        return P / I;
      }
    }
  ],

  // 12. Newton's Second Law: F = m * a
  'phys-newton-second-law': [
    {
      targetSymbol: 'm',
      targetName: 'Object Mass (m)',
      latex: 'm = \\frac{F}{a}',
      plain: 'm = F / a',
      description: 'Calculates inertial mass by dividing the net accelerating force by the resulting acceleration.',
      requiredInputs: ['F', 'a'],
      resultUnit: 'kg',
      calculate: (inputs) => {
        const F = inputs['F'] ?? 300; // N
        const a = inputs['a'] ?? 5; // m/s²
        if (a <= 0) return 0;
        return F / a;
      }
    },
    {
      targetSymbol: 'a',
      targetName: 'Linear Acceleration (a)',
      latex: 'a = \\frac{F}{m}',
      plain: 'a = F / m',
      description: 'Determines the acceleration experienced by mass m when acted upon by net unbalanced force F.',
      requiredInputs: ['F', 'm'],
      resultUnit: 'm/s²',
      calculate: (inputs) => {
        const F = inputs['F'] ?? 300; // N
        const m = inputs['m'] ?? 60; // kg
        if (m <= 0) return 0;
        return F / m;
      }
    }
  ],

  // 13. Ideal Gas Law: P * V = n * R * T
  'chem-ideal-gas-law': [
    {
      targetSymbol: 'P',
      targetName: 'Gas Pressure (P)',
      latex: 'P = \\frac{n \\cdot R \\cdot T}{V}',
      plain: 'P = (n * R * T) / V',
      description: 'Calculates the equilibrium pressure of n moles of ideal gas contained within chamber volume V at temperature T.',
      requiredInputs: ['n', 'T', 'V'],
      resultUnit: 'kPa',
      calculate: (inputs) => {
        const n = inputs['n'] ?? 1.0; // mol
        const T = inputs['T'] ?? 300; // K
        const V = inputs['V'] ?? 25; // L
        const R = 8.314462;
        if (V <= 0) return 0;
        return (n * R * T) / V;
      }
    },
    {
      targetSymbol: 'V',
      targetName: 'Chamber Volume (V)',
      latex: 'V = \\frac{n \\cdot R \\cdot T}{P}',
      plain: 'V = (n * R * T) / P',
      description: 'Calculates the volume occupied by n moles of gas at specified pressure P and absolute temperature T.',
      requiredInputs: ['n', 'T', 'P'],
      resultUnit: 'L',
      calculate: (inputs) => {
        const n = inputs['n'] ?? 1.0; // mol
        const T = inputs['T'] ?? 300; // K
        const P = inputs['P'] ?? 100; // kPa
        const R = 8.314462;
        if (P <= 0) return 0;
        return (n * R * T) / P;
      }
    },
    {
      targetSymbol: 'T',
      targetName: 'Absolute Temperature (T)',
      latex: 'T = \\frac{P \\cdot V}{n \\cdot R}',
      plain: 'T = (P * V) / (n * R)',
      description: 'Calculates the temperature of an enclosed gas sample based on measured pressure and volume.',
      requiredInputs: ['P', 'V', 'n'],
      resultUnit: 'K',
      calculate: (inputs) => {
        const P = inputs['P'] ?? 100; // kPa
        const V = inputs['V'] ?? 25; // L
        const n = inputs['n'] ?? 1.0; // mol
        const R = 8.314462;
        if (n <= 0) return 0;
        return (P * V) / (n * R);
      }
    },
    {
      targetSymbol: 'n',
      targetName: 'Amount of Substance (n)',
      latex: 'n = \\frac{P \\cdot V}{R \\cdot T}',
      plain: 'n = (P * V) / (R * T)',
      description: 'Calculates the molar quantity of gas particles enclosed inside a vessel.',
      requiredInputs: ['P', 'V', 'T'],
      resultUnit: 'mol',
      calculate: (inputs) => {
        const P = inputs['P'] ?? 100; // kPa
        const V = inputs['V'] ?? 25; // L
        const T = inputs['T'] ?? 300; // K
        const R = 8.314462;
        if (T <= 0) return 0;
        return (P * V) / (R * T);
      }
    }
  ],

  // 14. Pythagorean Theorem: c² = a² + b²
  'math-pythagorean': [
    {
      targetSymbol: 'a',
      targetName: 'Base Leg (a)',
      latex: 'a = \\sqrt{c^2 - b^2}',
      plain: 'a = sqrt(c^2 - b^2)',
      description: 'Calculates the unknown adjacent leg of a right-angled triangle given hypotenuse c and opposite leg b.',
      requiredInputs: ['c', 'b'],
      resultUnit: 'm',
      calculate: (inputs) => {
        const c = inputs['c'] ?? 10;
        const b = inputs['b'] ?? 8;
        const diff = Math.pow(c, 2) - Math.pow(b, 2);
        return diff >= 0 ? Math.sqrt(diff) : 0;
      }
    },
    {
      targetSymbol: 'b',
      targetName: 'Height Leg (b)',
      latex: 'b = \\sqrt{c^2 - a^2}',
      plain: 'b = sqrt(c^2 - a^2)',
      description: 'Calculates the unknown vertical leg of a right-angled triangle given hypotenuse c and base leg a.',
      requiredInputs: ['c', 'a'],
      resultUnit: 'm',
      calculate: (inputs) => {
        const c = inputs['c'] ?? 10;
        const a = inputs['a'] ?? 6;
        const diff = Math.pow(c, 2) - Math.pow(a, 2);
        return diff >= 0 ? Math.sqrt(diff) : 0;
      }
    }
  ]
};
