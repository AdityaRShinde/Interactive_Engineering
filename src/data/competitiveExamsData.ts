import { CompetitiveExamQuestion } from '../types';

export const COMPETITIVE_EXAM_QUESTIONS: Record<string, CompetitiveExamQuestion[]> = {
  // 1. Normal Stress (σ = F / A)
  'mech-normal-stress': [
    {
      id: 'gate-me-stress-1',
      exam: 'GATE ME',
      year: '2022',
      topic: 'Axial Stress & Stepped Bar',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'A stepped circular bar with section diameters d₁ = 20 mm and d₂ = 40 mm is subjected to an axial tensile load P. If the maximum tensile stress developed in section 1 is 160 MPa, the tensile stress developed in section 2 in MPa is:',
      options: ['80 MPa', '40 MPa', '20 MPa', '10 MPa'],
      correctOptionIndex: 1,
      explanation: 'Stress is inversely proportional to cross-sectional area: σ = P / A = P / (π d² / 4) ∝ 1/d². When diameter doubles (d₂ = 2d₁), the cross-sectional area quadruples (A₂ = 4A₁). Therefore, σ₂ = σ₁ / 4 = 160 / 4 = 40 MPa.',
      shortcutTrick: 'Ratio trick: σ₂ / σ₁ = (d₁ / d₂)² = (20/40)² = 1/4 -> 160 / 4 = 40 MPa directly.',
      conceptTested: 'Inverse square relationship between normal stress and circular bar diameter.'
    },
    {
      id: 'fe-exam-stress-2',
      exam: 'NCEES FE Exam',
      year: '2023 Reference',
      topic: 'Allowable Stress Sizing',
      difficulty: 'Foundation',
      type: 'NAT',
      question: 'A steel rod must carry an axial tension load of 150 kN. If the allowable tensile stress of the steel alloy is 250 MPa, what is the minimum required cross-sectional area of the rod in mm²? (Enter integer value)',
      correctNumericalValue: 600,
      tolerance: 2,
      unit: 'mm²',
      explanation: 'From σ = F / A, we rearrange for A = F / σ_allow = (150 × 10³ N) / (250 N/mm²) = 600 mm².',
      shortcutTrick: 'Remember 1 MPa = 1 N/mm². So directly divide kN by MPa: (150 × 1000) / 250 = 600 mm².',
      conceptTested: 'Standard allowable stress sizing rearrangement (A = F / σ).'
    },
    {
      id: 'jee-adv-stress-3',
      exam: 'JEE Advanced',
      year: '2021',
      topic: 'Elastic Energy & Stress',
      difficulty: 'Advanced',
      type: 'MCQ',
      question: 'Two wires of identical material and lengths L and 2L have cross-sectional radii r and 2r respectively. If both wires are subjected to equal tensile load F, the ratio of elastic strain energy stored in the first wire to the second wire is:',
      options: ['1 : 2', '2 : 1', '4 : 1', '8 : 1'],
      correctOptionIndex: 3,
      explanation: 'Strain energy U = F²L / (2AE) = F²L / (2π r² E) ∝ L / r². For wire 1: U₁ ∝ L / r². For wire 2: U₂ ∝ (2L) / (2r)² = 2L / (4r²) = L / (2r²). Thus U₁ / U₂ = (L/r²) / (L / 2r²) = 2 : 1. If considering volume energy density u = σ²/2E, since σ₁ = 4σ₂, u₁/u₂ = 16.',
      shortcutTrick: 'U ∝ L / r² -> U₁/U₂ = (L₁/L₂) * (r₂/r₁)² = (1/2) * (2/1)² = 2.',
      conceptTested: 'Strain energy scaling with member length and cross-sectional radius.'
    }
  ],

  // 2. Beam Deflection (Δ = PL³ / 48EI)
  'mech-beam-deflection': [
    {
      id: 'gate-me-deflect-1',
      exam: 'GATE ME',
      year: '2020',
      topic: 'Beam Span Scaling',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'A simply supported beam with central point load P has a midspan deflection of 3 mm for a span length of 2 m. If the span is increased to 4 m while keeping load P, width, and material unchanged, the new midspan deflection in mm is:',
      options: ['6 mm', '12 mm', '24 mm', '48 mm'],
      correctOptionIndex: 2,
      explanation: 'From Δ = P L³ / (48 E I), deflection is proportional to L³. When span L doubles (from 2 m to 4 m), deflection scales by 2³ = 8. New deflection = 3 mm × 8 = 24 mm.',
      shortcutTrick: 'Δ_new = Δ_old × (L_new / L_old)³ = 3 × 2³ = 24 mm.',
      conceptTested: 'Cubic sensitivity of beam deflection with unsupported span length.'
    },
    {
      id: 'pe-civil-deflect-2',
      exam: 'PE Exam',
      year: '2022',
      topic: 'Serviceability Deflection Limit',
      difficulty: 'Advanced',
      type: 'NAT',
      question: 'A steel beam (E = 200 GPa, I = 8 × 10⁻⁴ m⁴) spans L = 6 m. A central load P = 60 kN is applied. What is the midspan deflection in mm? (Round to 2 decimal places)',
      correctNumericalValue: 1.69,
      tolerance: 0.05,
      unit: 'mm',
      explanation: 'Δ = (P L³) / (48 E I) = (60,000 × 6³) / (48 × 200 × 10⁹ × 8 × 10⁻⁴) = (60,000 × 216) / (7.68 × 10⁹) = 12,960,000 / 7,680,000,000 = 0.0016875 m = 1.69 mm.',
      shortcutTrick: 'Numerator = 60 × 216 = 12960. Denom = 48 × 200 × 0.8 = 7680. 12960 / 7680 = 1.6875 mm.',
      conceptTested: 'Structural midspan displacement evaluation in SI units.'
    }
  ],

  // 3. Torsion (τ = Tr / J)
  'mech-torsion-shaft': [
    {
      id: 'gate-me-torsion-1',
      exam: 'GATE ME',
      year: '2023',
      topic: 'Solid vs Hollow Shaft Strength',
      difficulty: 'Advanced',
      type: 'MCQ',
      question: 'A solid circular shaft of diameter D is replaced by a hollow shaft of outer diameter D and inner diameter D/2 of identical material. The ratio of torque capacity of the hollow shaft to that of the solid shaft at the same maximum shear stress is:',
      options: ['15 / 16', '7 / 8', '3 / 4', '1 / 2'],
      correctOptionIndex: 0,
      explanation: 'T = (τ · J) / r. For solid shaft: J_s = π D⁴ / 32. For hollow shaft: J_h = π (D⁴ - (D/2)⁴) / 32 = (π D⁴ / 32) · (1 - 1/16) = (15/16) J_s. Since outer radius r = D/2 is identical, T_h / T_s = J_h / J_s = 15/16.',
      shortcutTrick: 'J_h / J_s = 1 - k⁴ where k = d_in/d_out = 1/2 -> 1 - (1/2)⁴ = 1 - 1/16 = 15/16 = 0.9375.',
      conceptTested: 'Polar moment of inertia reduction in hollow shafts.'
    }
  ],

  // 4. Euler Buckling (P_cr = π²EI / (KL)²)
  'civil-euler-buckling': [
    {
      id: 'gate-ce-buckling-1',
      exam: 'GATE CE',
      year: '2021',
      topic: 'Effective Length Factors',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'A column of length L with fixed-fixed end conditions has an Euler critical buckling load P₁. If the end conditions are changed to fixed-free (cantilever column) of same length and cross-section, the new critical load P₂ is:',
      options: ['P₁ / 16', 'P₁ / 4', '4 P₁', '16 P₁'],
      correctOptionIndex: 0,
      explanation: 'P_cr ∝ 1 / K². For Fixed-Fixed: K₁ = 0.5. For Fixed-Free: K₂ = 2.0. Therefore P₂ / P₁ = (K₁ / K₂)² = (0.5 / 2.0)² = (1/4)² = 1/16. Thus P₂ = P₁ / 16.',
      shortcutTrick: 'Ratio = (0.5 / 2)² = 1/16.',
      conceptTested: 'Effective length factor K influence on column stability.'
    },
    {
      id: 'ese-ce-buckling-2',
      exam: 'ESE / IES',
      year: '2020',
      topic: 'Slenderness Ratio Limit',
      difficulty: 'Advanced',
      type: 'NAT',
      question: 'A pinned-pinned steel column (E = 200 GPa) of length 4 m has I = 16 × 10⁻⁶ m⁴. Calculate its theoretical Euler buckling load in kN. (Use π² ≈ 9.87, round to nearest integer)',
      correctNumericalValue: 1974,
      tolerance: 20,
      unit: 'kN',
      explanation: 'P_cr = (π² · E · I) / L² = (9.87 × 200 × 10⁹ × 16 × 10⁻⁶) / 4² = (9.87 × 3.2 × 10⁶) / 16 = 31,584,000 / 16 = 1,974,000 N = 1974 kN.',
      shortcutTrick: '(9.87 × 200 × 16) / 16 = 9.87 × 200 = 1974 kN directly.',
      conceptTested: 'Standard Euler formula calculation for pinned columns.'
    }
  ],

  // 5. Hydrostatic Pressure (p = ρgh)
  'civil-hydrostatic-pressure': [
    {
      id: 'gate-ce-hydro-1',
      exam: 'GATE CE',
      year: '2022',
      topic: 'Manometer & Hydrostatic Pressure',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'At a depth of 10 m in fresh water (ρ = 1000 kg/m³), the gauge pressure is P_w. At what depth in oil of specific gravity 0.8 will the gauge pressure be equal to P_w? (Take g = 10 m/s²)',
      options: ['8.0 m', '10.0 m', '12.5 m', '15.0 m'],
      correctOptionIndex: 2,
      explanation: 'Equating pressures: ρ_w · g · h_w = ρ_oil · g · h_oil. Since ρ_oil = 0.8 ρ_w, we get h_oil = h_w / 0.8 = 10 / 0.8 = 12.5 m.',
      shortcutTrick: 'h_oil = h_water / SG = 10 / 0.8 = 12.5 m.',
      conceptTested: 'Hydrostatic pressure invariance across fluid densities.'
    }
  ],

  // 6. Kinetic Energy (E_k = 1/2 m v²)
  'phys-kinetic-energy': [
    {
      id: 'jee-adv-energy-1',
      exam: 'JEE Advanced',
      year: '2023',
      topic: 'Momentum vs Kinetic Energy',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'If the linear momentum of a moving body is increased by 50%, the percentage increase in its kinetic energy is:',
      options: ['50%', '100%', '125%', '225%'],
      correctOptionIndex: 2,
      explanation: 'Kinetic energy in terms of momentum: E_k = p² / (2m). If momentum becomes p\' = 1.5 p, new kinetic energy E_k\' = (1.5 p)² / (2m) = 2.25 E_k. The percentage increase is (2.25 - 1.0) × 100% = 125%.',
      shortcutTrick: '(1.5)² - 1 = 2.25 - 1 = 1.25 -> 125%.',
      conceptTested: 'Quadratic relationship between kinetic energy and momentum.'
    }
  ],

  // 7. Ohm's Law (I = V / R)
  'elec-ohms-law': [
    {
      id: 'gate-ee-ohms-1',
      exam: 'GATE EE',
      year: '2021',
      topic: 'Wire Stretching & Resistance',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'A uniform cylindrical wire of resistance R is stretched uniformly such that its length increases by 20% while volume remains constant. The new resistance of the wire is:',
      options: ['1.20 R', '1.40 R', '1.44 R', '1.60 R'],
      correctOptionIndex: 2,
      explanation: 'Resistance R = ρ L / A. With constant volume V = A · L, A = V / L. So R = ρ L² / V ∝ L². When length increases by 20% (L\' = 1.20 L), new resistance R\' = (1.20)² R = 1.44 R.',
      shortcutTrick: 'For wire stretching with constant volume: R ∝ L² -> (1.2)² = 1.44 R.',
      conceptTested: 'Volume conservation and quadratic resistance scaling with stretched wire length.'
    }
  ],

  // 8. Newton's 2nd Law (F = m * a)
  'phys-newton-second-law': [
    {
      id: 'jee-main-newton-1',
      exam: 'JEE Advanced',
      year: '2022',
      topic: 'Variable Mass & Rocket Thrust',
      difficulty: 'Advanced',
      type: 'MCQ',
      question: 'A sandbag of mass M is pushed with force F on a frictionless surface. Sand leaks out from a hole at a constant rate α = dm/dt. The acceleration of the sandbag as a function of time t is:',
      options: ['F / M', 'F / (M - α t)', 'F / (M + α t)', '(F + α v) / M'],
      correctOptionIndex: 1,
      explanation: 'Since leaked sand leaves the bag with zero relative velocity with respect to the bag, no reaction thrust is exerted. The net external force is just F. At time t, mass m(t) = M - α t. Hence a(t) = F / (M - α t).',
      shortcutTrick: 'Standard F = m(t) · a -> a(t) = F / (M - α t).',
      conceptTested: 'Newton\'s second law with time-dependent system mass.'
    },
    {
      id: 'fe-exam-newton-2',
      exam: 'NCEES FE Exam',
      year: '2023',
      topic: 'Connected Bodies Acceleration',
      difficulty: 'Foundation',
      type: 'NAT',
      question: 'A horizontal net force F = 300 N acts on a mass m = 60 kg. What is the acceleration in m/s²? (Enter exact decimal)',
      correctNumericalValue: 5.0,
      tolerance: 0.1,
      unit: 'm/s²',
      explanation: 'a = F / m = 300 N / 60 kg = 5.0 m/s².',
      shortcutTrick: '300 / 60 = 5.0 m/s².',
      conceptTested: 'Fundamental Newton second law acceleration calculation.'
    }
  ],

  // 9. Ideal Gas Law (PV = nRT)
  'chem-ideal-gas-law': [
    {
      id: 'gate-ch-gas-1',
      exam: 'GATE CH',
      year: '2022',
      topic: 'Isothermal Expansion Work',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'One mole of an ideal gas at 300 K expands isothermally from volume V₁ to 2V₁. The work done by the gas is: (R = 8.314 J/mol·K, ln 2 ≈ 0.693)',
      options: ['831.4 J', '1728.5 J', '2494.2 J', '3457.0 J'],
      correctOptionIndex: 1,
      explanation: 'For isothermal expansion of an ideal gas, W = n R T ln(V₂ / V₁) = 1 × 8.314 × 300 × ln(2) = 2494.2 × 0.693 = 1728.48 J ≈ 1728.5 J.',
      shortcutTrick: 'W = 2494.2 × 0.693 = 1728.5 J.',
      conceptTested: 'Thermodynamic work integration from PV = nRT.'
    }
  ]
};
