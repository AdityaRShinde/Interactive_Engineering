import { Formula } from '../types';
import { FORMULA_REARRANGEMENTS } from './rearrangementsData';
import { FORMULA_DERIVATIONS } from './derivationsData';
import { COMPETITIVE_EXAM_QUESTIONS } from './competitiveExamsData';

const RAW_FORMULA_DATABASE: Formula[] = [
  // ==========================================
  // STRENGTH OF MATERIALS: NORMAL STRESS (σ = F/A)
  // ==========================================
  {
    id: 'mech-normal-stress',
    name: 'Normal Stress (Axial Tension / Compression)',
    codeName: 'σ = F / A',
    topic: 'Axial Loading & Stress Analysis',
    chapter: 'Strength of Materials',
    subject: 'mechanical',
    level: ['diploma', 'engineering', 'professional'],
    formulaLatex: '\\sigma = \\frac{F}{A}',
    formulaPlain: 'σ = F / A',
    derivationSummary: 'Normal stress is defined as the internal resisting force per unit cross-sectional area acting perpendicular to the cut plane: σ = lim(ΔA→0) ΔF_n / ΔA = F / A under uniform stress distribution.',
    realWorldApplication: 'Sizing structural columns in high-rises, sizing suspension bridge stay cables, and verifying bolt tension limits against material yield strength (σ_yield).',
    variables: [
      { symbol: 'F', name: 'Axial Applied Force', unit: 'kN', dimension: '[M L T⁻²]', description: 'Total tensile or compressive force acting along the member centroidal axis', defaultValue: 100, min: 10, max: 500, step: 10 },
      { symbol: 'A', name: 'Cross-Sectional Area', unit: 'm²', dimension: '[L²]', description: 'Area of the member resisting the axial force perpendicular to the load axis', defaultValue: 0.05, min: 0.005, max: 0.2, step: 0.005 },
      { symbol: 'σ', name: 'Normal Stress', unit: 'MPa', dimension: '[M L⁻¹ T⁻²]', description: 'Internal force intensity per unit area (1 MPa = 1000 kPa = 1 N/mm²)', defaultValue: 2.0 }
    ],
    simulation: {
      type: 'normal-stress-axial',
      primaryVariable: 'F',
      secondaryVariable: 'A',
      outputLabel: 'Normal Stress (σ = F / A)',
      outputUnit: 'MPa',
      formulaCode: '(F * 1000) / (A * 1000000)',
      customInputs: [
        { id: 'F', label: 'Axial Load (F)', symbol: 'F', unit: 'kN', min: 10, max: 400, step: 5, defaultValue: 120 },
        { id: 'A', label: 'Cross-Section Area (A)', symbol: 'A', unit: 'm²', min: 0.01, max: 0.20, step: 0.005, defaultValue: 0.04 }
      ]
    },
    relationships: [
      { variable: 'F', direction: 'increase', resultEffect: 'Stress increases proportionally (direct linear relationship)', mathExpression: 'σ ∝ F' },
      { variable: 'A', direction: 'increase', resultEffect: 'Stress decreases inversely as area widens', mathExpression: 'σ ∝ 1/A' }
    ],
    assumptions: [
      'Pure axial load applied through the centroid of the cross-section',
      'Homogeneous and isotropic material properties throughout the member',
      'Prismatic member with constant cross-section along its length',
      'Stress distribution is completely uniform away from load application points (Saint-Venant\'s Principle)',
      'Linear elastic regime below the proportional limit (Hooke\'s Law holds)'
    ],
    commonMistakes: [
      'Mixing units: substituting force in kN with area in mm² without unit factor correction (1 kN/m² = 1 kPa, 1 N/mm² = 1 MPa)',
      'Assuming stress is independent of cross-sectional geometry or orientation',
      'Ignoring stress concentrations near holes, notches, or sudden diameter steps',
      'Confusing normal stress (perpendicular to surface) with shear stress (tangential to surface)'
    ],
    dimensionalAnalysis: {
      equation: 'σ = F / A',
      unitsBreakdown: '[Force] / [Area] = [N] / [m²] = [kg·m/s²] / [m²] = kg / (m·s²)',
      finalUnit: 'Pa (Pascals) or N/m² (1 MPa = 10⁶ Pa)',
      isConsistent: true,
      notes: 'Dimensionally identical to pressure [M L⁻¹ T⁻²], but represents an internal directional tensor field.'
    },
    scenarioPresets: [
      { id: 'preset-typical', name: 'Typical Structural Column', description: 'Standard building column under design dead & live gravity loads.', values: { F: 120, A: 0.04 } },
      { id: 'preset-high-load', name: 'High Load Stress Test', description: 'Heavy industrial column near design allowable limit.', values: { F: 360, A: 0.03 } },
      { id: 'preset-wide-section', name: 'Oversized Safety Pier', description: 'Wide concrete footing dispersing heavy axial forces.', values: { F: 200, A: 0.16 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Axial Force',
        prompt: 'What happens to the internal normal stress if load F is doubled from 120 kN to 240 kN?',
        targetValues: { F: 240, A: 0.04 },
        outcomeText: 'Stress exactly doubles from 3.00 MPa to 6.00 MPa.',
        insight: 'Normal stress is directly proportional to applied axial force (σ ∝ F). Doubling force doubles internal stress.'
      },
      {
        title: 'Halve the Cross-Sectional Area',
        prompt: 'What happens to normal stress if area A is reduced by 50% from 0.04 m² to 0.02 m²?',
        targetValues: { F: 120, A: 0.02 },
        outcomeText: 'Stress doubles from 3.00 MPa to 6.00 MPa.',
        insight: 'Stress is inversely proportional to resisting area (σ ∝ 1/A). Smaller cross-sections concentrate load into higher stress intensity.'
      }
    ],
    predictionChallenge: {
      question: 'Current load is F = 100 kN and Area A = 0.05 m² (σ = 2.0 MPa). If you increase F to 250 kN while keeping A constant, what will be the new stress?',
      paramToChange: 'F',
      newValue: 250,
      options: [
        { label: '2.5 MPa', value: 2.5, isCorrect: false, reason: 'Incorrect. 250 kN / 0.05 m² = 5000 kPa = 5.0 MPa.' },
        { label: '5.0 MPa', value: 5.0, isCorrect: true, reason: 'Correct! σ = 250 kN / 0.05 m² = 5000 kPa = 5.0 MPa (2.5× increase).' },
        { label: '10.0 MPa', value: 10.0, isCorrect: false, reason: 'Too high. Force increased 2.5×, not 5×.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A solid circular steel bar of cross-sectional area 0.02 m² supports a tensile axial load of 150 kN. Calculate the normal stress developed inside the bar.',
        given: { 'F': '150 kN = 150,000 N', 'A': '0.02 m²' },
        formulaUsed: 'σ = F / A',
        substitution: 'σ = 150,000 N / 0.02 m²',
        calculation: 'σ = 7,500,000 Pa = 7.5 MPa',
        finalAnswer: '7.5 MPa (or 7500 kPa)',
        unit: 'MPa',
        explanation: 'Direct division of axial force by cross-sectional area yields normal stress. Since the load is tensile, the bar experiences positive tensile stress.'
      }
    ],
    conceptQuestions: [
      {
        question: 'Two rods of the same material have lengths L and 2L, but identical cross-sectional areas A. If both are subjected to equal tensile load F, how do their normal stresses compare?',
        options: ['The longer rod has double the stress', 'Both rods experience identical normal stress', 'The longer rod has half the stress', 'Stress depends on Young\'s modulus'],
        correctAnswer: 'Both rods experience identical normal stress',
        explanation: 'Normal stress σ = F/A depends only on axial load and cross-sectional area, not on member length. Length affects total elongation (ΔL = FL/AE), but not stress intensity.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-stress-1',
        question: 'A structural column carries an axial compression load of 240 kN. If its cross-sectional area is 0.06 m², what is the compressive stress in MPa?',
        givenValues: { 'F': 240, 'A': 0.06 },
        targetVariable: 'σ',
        correctAnswer: 4,
        unit: 'MPa',
        tolerance: 0.05,
        hint: 'Use σ = F / A -> 240 kN / 0.06 m² = 4000 kPa = 4.0 MPa.',
        solutionSteps: [
          'Given: F = 240 kN = 240,000 N, A = 0.06 m²',
          'Formula: σ = F / A',
          'Calculation: σ = 240,000 / 0.06 = 4,000,000 Pa = 4.0 MPa'
        ]
      }
    ],
    prerequisites: ['Free Body Diagrams', 'SI Units (N, m², Pa)', 'Centroids & Cross-Sections'],
    relatedFormulaIds: ['mech-bending-stress', 'civil-euler-buckling', 'mech-torsion-shaft'],
    diagramDescription: 'A 2D prismatic engineering column subjected to tensile or compressive axial force vectors with a real-time stress contour gradient bar.',
    categoryAccentColor: '#EF4444',
    isVerified: true
  },

  // ==========================================
  // STRUCTURAL ENGINEERING: BEAM DEFLECTION (Δ = PL³ / 48EI)
  // ==========================================
  {
    id: 'mech-beam-deflection',
    name: 'Elastic Beam Deflection (Point Load at Midspan)',
    codeName: 'Δ = PL³ / 48EI',
    topic: 'Beam Deflections & Elastic Curves',
    chapter: 'Structural Engineering',
    subject: 'mechanical',
    level: ['diploma', 'engineering', 'professional'],
    formulaLatex: '\\Delta_{\\max} = \\frac{P \\cdot L^3}{48 \\cdot E \\cdot I}',
    formulaPlain: 'Δ_max = (P * L^3) / (48 * E * I)',
    derivationSummary: 'From Euler-Bernoulli beam theory, d²v/dx² = M(x)/EI. For a point load P at midspan, M(x) = (P/2)x. Integrating twice with boundary conditions v(0)=0 and v\'(L/2)=0 gives maximum midspan deflection Δ_max = PL³ / (48EI).',
    realWorldApplication: 'Serviceability limit checks for floor girders, bridge spans, railway tracks, and precision machine tool beds to prevent excessive sagging and vibration.',
    variables: [
      { symbol: 'P', name: 'Central Point Load', unit: 'kN', dimension: '[M L T⁻²]', description: 'Concentrated downward vertical load applied at beam midspan', defaultValue: 30, min: 5, max: 100, step: 5 },
      { symbol: 'L', name: 'Beam Span Length', unit: 'm', dimension: '[L]', description: 'Unsupported distance between simple supports', defaultValue: 6, min: 2, max: 14, step: 0.5 },
      { symbol: 'E', name: 'Young\'s Modulus', unit: 'GPa', dimension: '[M L⁻¹ T⁻²]', description: 'Material elastic modulus (e.g. Steel = 200 GPa, Aluminium = 70 GPa)', defaultValue: 200, min: 50, max: 250, step: 10 },
      { symbol: 'I', name: 'Moment of Inertia', unit: '×10⁻⁴ m⁴', dimension: '[L⁴]', description: 'Second moment of area resisting flexural bending', defaultValue: 8, min: 1, max: 30, step: 1 }
    ],
    simulation: {
      type: 'beam-deflection-elastic',
      primaryVariable: 'P',
      secondaryVariable: 'L',
      tertiaryVariable: 'E',
      outputLabel: 'Peak Midspan Deflection (Δ_max)',
      outputUnit: 'mm',
      formulaCode: '(P * 1000 * Math.pow(L, 3)) / (48 * (E * 1e9) * (I * 1e-4)) * 1000',
      customInputs: [
        { id: 'P', label: 'Central Load (P)', symbol: 'P', unit: 'kN', min: 5, max: 80, step: 5, defaultValue: 30 },
        { id: 'L', label: 'Beam Span (L)', symbol: 'L', unit: 'm', min: 2, max: 10, step: 0.5, defaultValue: 5 },
        { id: 'E', label: 'Elastic Modulus (E)', symbol: 'E', unit: 'GPa', min: 50, max: 220, step: 10, defaultValue: 200 },
        { id: 'I', label: 'Moment of Inertia (I)', symbol: 'I', unit: '×10⁻⁴ m⁴', min: 1, max: 25, step: 1, defaultValue: 6 }
      ]
    },
    relationships: [
      { variable: 'L', direction: 'increase', resultEffect: 'Deflection increases with the CUBE of span length (L³)', mathExpression: 'Δ ∝ L³' },
      { variable: 'P', direction: 'increase', resultEffect: 'Deflection scales directly with applied load', mathExpression: 'Δ ∝ P' },
      { variable: 'E', direction: 'increase', resultEffect: 'Stiffer materials reduce deflection inversely', mathExpression: 'Δ ∝ 1/E' },
      { variable: 'I', direction: 'increase', resultEffect: 'Deeper cross-sections dramatically reduce deflection', mathExpression: 'Δ ∝ 1/I' }
    ],
    assumptions: [
      'Euler-Bernoulli beam assumption: plane sections remain plane and normal to the neutral axis',
      'Small deflections and slopes (linear curvature approximation d²v/dx² ≈ 1/ρ)',
      'Linear elastic, homogeneous, isotropic material obeying Hooke\'s Law',
      'Shear deformation is negligible compared to flexural bending (slender beam L/d > 10)'
    ],
    commonMistakes: [
      'Underestimating span length sensitivity: doubling span L increases deflection by 8× (2³ = 8)',
      'Confusing cross-sectional area with second moment of area (I = bh³/12 for rectangular beams)',
      'Mixing units between GPa, m⁴, kN, and converting final displacement to millimeters (mm)'
    ],
    dimensionalAnalysis: {
      equation: 'Δ = (P · L³) / (48 · E · I)',
      unitsBreakdown: '[N] · [m]³ / ([N/m²] · [m⁴]) = [N · m³] / [N · m²] = [m]',
      finalUnit: 'm (converted to mm for engineering display)',
      isConsistent: true,
      notes: 'Dimensionally valid: result is a pure linear displacement [L].'
    },
    scenarioPresets: [
      { id: 'preset-steel-std', name: 'Standard Structural Steel Girder', description: 'Steel W-beam (E = 200 GPa) over a 5 m span with a 30 kN load.', values: { P: 30, L: 5, E: 200, I: 6 } },
      { id: 'preset-long-span', name: 'Long Span Pedestrian Bridge', description: 'Long span highlighting high cubic deflection sensitivity.', values: { P: 25, L: 8, E: 200, I: 12 } },
      { id: 'preset-aluminium', name: '6061-T6 Aluminium Frame', description: 'Lightweight aluminium beam (E = 70 GPa) displaying higher flexibility.', values: { P: 20, L: 4, E: 70, I: 5 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Span Length (L → 2L)',
        prompt: 'What happens to maximum midspan deflection if span L increases from 4 m to 8 m?',
        targetValues: { P: 30, L: 8, E: 200, I: 6 },
        outcomeText: 'Deflection increases by 800% (8× higher).',
        insight: 'Because deflection is proportional to L³, (2)³ = 8. Span length is the most sensitive parameter in structural beam design.'
      },
      {
        title: 'Switch Material: Steel to Aluminium',
        prompt: 'What happens if material is changed from Structural Steel (E = 200 GPa) to Aluminium (E = 70 GPa)?',
        targetValues: { P: 30, L: 5, E: 70, I: 6 },
        outcomeText: 'Deflection increases by ~2.86× due to lower elastic stiffness.',
        insight: 'Deflection is inversely proportional to elastic modulus E. Aluminium deflects nearly three times as much under identical loading and geometry.'
      }
    ],
    predictionChallenge: {
      question: 'A beam has deflection Δ = 2.0 mm under span L = 3 m. If span L is increased to 6 m (doubled) while keeping P, E, and I constant, what is the new deflection?',
      paramToChange: 'L',
      newValue: 6,
      options: [
        { label: '4.0 mm (2×)', value: 4.0, isCorrect: false, reason: 'Incorrect. Deflection is cubic with span length, not linear.' },
        { label: '8.0 mm (4×)', value: 8.0, isCorrect: false, reason: 'Incorrect. 4× would correspond to quadratic L² scaling.' },
        { label: '16.0 mm (8×)', value: 16.0, isCorrect: true, reason: 'Spot on! Δ ∝ L³. When span doubles (2×), deflection increases by 2³ = 8× (2.0 mm × 8 = 16.0 mm).' }
      ]
    },
    solvedExamples: [
      {
        question: 'A simply supported steel beam of span L = 5 m carries a central point load P = 40 kN. Given E = 200 GPa and I = 5 × 10⁻⁴ m⁴, calculate the maximum midspan deflection in mm.',
        given: { 'P': '40 kN = 40,000 N', 'L': '5 m', 'E': '200 GPa = 200 × 10⁹ Pa', 'I': '5 × 10⁻⁴ m⁴' },
        formulaUsed: 'Δ_max = (P · L³) / (48 · E · I)',
        substitution: 'Δ = (40,000 · 5³) / (48 · 200 × 10⁹ · 5 × 10⁻⁴)',
        calculation: 'Δ = (40,000 · 125) / (4.8 × 10⁹) = 5,000,000 / 4,800,000,000 = 0.001042 m = 1.04 mm',
        finalAnswer: '1.04 mm',
        unit: 'mm',
        explanation: 'The deflection is 1.04 mm at beam midspan. Note that the visual diagram exaggerates this curvature for clear educational inspection.'
      }
    ],
    conceptQuestions: [
      {
        question: 'Which parameter change will have the GREATEST impact on reducing the deflection of a simply supported beam?',
        options: ['Doubling Young\'s Modulus E', 'Doubling the Moment of Inertia I', 'Halving the span length L', 'Halving the applied load P'],
        correctAnswer: 'Halving the span length L',
        explanation: 'Halving span length L reduces deflection by (1/2)³ = 1/8 (an 87.5% reduction), far surpassing the 50% reduction achieved by doubling E or I or halving P.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-deflect-1',
        question: 'A beam with P = 24 kN, L = 4 m, E = 200 GPa, and I = 4 × 10⁻⁴ m⁴ is tested. Calculate the midspan deflection in mm.',
        givenValues: { 'P': 24, 'L': 4, 'E': 200, 'I': 4 },
        targetVariable: 'Δ',
        correctAnswer: 0.4,
        unit: 'mm',
        tolerance: 0.05,
        hint: 'Use Δ = (P * 1000 * L³) / (48 * E * 1e9 * I * 1e-4) * 1000',
        solutionSteps: [
          'Given: P = 24 kN, L = 4 m, E = 200 GPa, I = 4 × 10⁻⁴ m⁴',
          'Formula: Δ = (P · L³) / (48 · E · I)',
          'Calculation: (24000 · 64) / (48 · 200×10⁹ · 4×10⁻⁴) = 1,536,000 / 3,840,000,000 = 0.0004 m = 0.40 mm'
        ]
      }
    ],
    prerequisites: ['Bending Moment Diagrams', 'Euler-Bernoulli Beam Theory', 'Moment of Inertia (I = bh³/12)'],
    relatedFormulaIds: ['mech-bending-moment', 'mech-bending-stress', 'civil-euler-buckling'],
    diagramDescription: 'A 2D simply supported beam on pin and roller supports deflecting under central concentrated vertical load vector P, with an exaggerated elastic curve and real vs visual scale readout.',
    categoryAccentColor: '#0EA5E9',
    isVerified: true
  },

  // ==========================================
  // MECHANICAL: TORSIONAL SHEAR STRESS (τ = Tr / J)
  // ==========================================
  {
    id: 'mech-torsion-shaft',
    name: 'Torsional Shear Stress in Circular Shaft',
    codeName: 'τ = T · r / J',
    topic: 'Torsion & Circular Shafts',
    chapter: 'Machine Design & Mechanics',
    subject: 'mechanical',
    level: ['diploma', 'engineering', 'professional'],
    formulaLatex: '\\tau_{\\max} = \\frac{T \\cdot r}{J}',
    formulaPlain: 'τ = (T * r) / J',
    derivationSummary: 'For a circular shaft subjected to torque T, shear strain γ varies linearly with radius r: γ = r(dθ/dx). Applying Hooke\'s law in shear (τ = Gγ) and integrating internal torque gives T = (τ_max / r_o) ∫ r² dA = (τ_max / r_o) J, yielding τ = Tr/J.',
    realWorldApplication: 'Designing automotive driveshafts, turbine rotor shafts, power takeoff (PTO) axles, and mechanical gearboxes.',
    variables: [
      { symbol: 'T', name: 'Applied Torque', unit: 'kN·m', dimension: '[M L² T⁻²]', description: 'Twisting moment applied around the longitudinal shaft axis', defaultValue: 15, min: 1, max: 60, step: 1 },
      { symbol: 'r', name: 'Outer Shaft Radius', unit: 'mm', dimension: '[L]', description: 'Radial distance from shaft center to the outer perimeter surface', defaultValue: 50, min: 15, max: 100, step: 5 },
      { symbol: 'J', name: 'Polar Moment of Inertia', unit: '×10⁻⁶ m⁴', dimension: '[L⁴]', description: 'Polar second moment of circular area (J = π·d⁴ / 32 = π·r⁴ / 2)', defaultValue: 9.82 }
    ],
    simulation: {
      type: 'torsional-shear-shaft',
      primaryVariable: 'T',
      secondaryVariable: 'r',
      outputLabel: 'Max Surface Shear Stress (τ_max)',
      outputUnit: 'MPa',
      formulaCode: '(T * 1000 * (r / 1000)) / ( (Math.PI * Math.pow(r / 1000, 4) / 2) ) / 1000000',
      customInputs: [
        { id: 'T', label: 'Applied Torque (T)', symbol: 'T', unit: 'kN·m', min: 1, max: 40, step: 1, defaultValue: 12 },
        { id: 'r', label: 'Shaft Radius (r)', symbol: 'r', unit: 'mm', min: 20, max: 80, step: 2, defaultValue: 45 }
      ]
    },
    relationships: [
      { variable: 'T', direction: 'increase', resultEffect: 'Shear stress increases proportionally with applied torque', mathExpression: 'τ ∝ T' },
      { variable: 'r', direction: 'increase', resultEffect: 'For a solid shaft (J = πr⁴/2), τ_max scales as 1/r³', mathExpression: 'τ_max ∝ 1/r³' }
    ],
    assumptions: [
      'Circular cross-section remains planar and undistorted after twisting (no warping)',
      'Shaft is subjected to pure torque without axial loading or transverse shear',
      'Linear elastic shear regime (Hooke\'s law in shear τ = Gγ holds)',
      'Homogeneous and isotropic material'
    ],
    commonMistakes: [
      'Forgetting that polar moment of inertia J scales with the fourth power of radius (r⁴)',
      'Confusing radius r with diameter d (J = πd⁴/32 vs J = πr⁴/2)',
      'Using bending second moment of area (I) instead of polar second moment (J = 2I for circle)'
    ],
    dimensionalAnalysis: {
      equation: 'τ = (T · r) / J',
      unitsBreakdown: '[N·m] · [m] / [m⁴] = [N·m²] / [m⁴] = [N/m²] = Pa',
      finalUnit: 'MPa (MegaPascals)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-car-shaft', name: 'Automotive Propeller Shaft', description: 'Typical passenger vehicle driveshaft transmitting engine torque.', values: { T: 8, r: 40 } },
      { id: 'preset-heavy-driveshaft', name: 'Industrial Marine Shaft', description: 'Heavy ship propeller shaft carrying high torque loads.', values: { T: 30, r: 70 } }
    ],
    whatIfScenarios: [
      {
        title: 'Increase Shaft Diameter by 26%',
        prompt: 'What happens to surface shear stress if shaft radius is increased from 40 mm to 50 mm (a 25% increase)?',
        targetValues: { T: 12, r: 50 },
        outcomeText: 'Max shear stress drops by nearly 50% due to the 1/r³ cubic relationship.',
        insight: 'Increasing diameter is the most effective method to reduce torsional shear stress because J grows with r⁴ while lever arm grows only with r.'
      }
    ],
    predictionChallenge: {
      question: 'If torque T is doubled from 10 kN·m to 20 kN·m on a fixed diameter solid shaft, what happens to the maximum surface shear stress τ_max?',
      paramToChange: 'T',
      newValue: 20,
      options: [
        { label: 'It stays constant', value: 0, isCorrect: false, reason: 'Incorrect. Torque directly drives torsional shear stress.' },
        { label: 'It exactly doubles (2×)', value: 2, isCorrect: true, reason: 'Correct! From τ = Tr/J, shear stress is directly proportional to applied torque T.' },
        { label: 'It quadruples (4×)', value: 4, isCorrect: false, reason: 'Incorrect. That would be quadratic scaling.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A solid circular shaft of radius r = 40 mm (0.04 m) is subjected to a torque T = 5 kN·m (5000 N·m). Calculate the maximum shear stress at its outer surface.',
        given: { 'T': '5000 N·m', 'r': '0.04 m', 'J': 'J = π·r⁴/2 = π·(0.04)⁴/2 = 4.021 × 10⁻⁶ m⁴' },
        formulaUsed: 'τ = (T · r) / J',
        substitution: 'τ = (5000 · 0.04) / (4.021 × 10⁻⁶)',
        calculation: 'τ = 200 / (4.021 × 10⁻⁶) = 49,735,920 Pa ≈ 49.74 MPa',
        finalAnswer: '49.74 MPa',
        unit: 'MPa',
        explanation: 'Shear stress is zero at the shaft centerline (neutral axis) and reaches its maximum value at the outer perimeter (r = r_outer).'
      }
    ],
    conceptQuestions: [
      {
        question: 'Where is the torsional shear stress maximum in a solid circular shaft under pure torque?',
        options: ['At the center axis (r = 0)', 'At mid-radius (r = R/2)', 'At the outer circumference surface (r = R)', 'Uniform everywhere across the section'],
        correctAnswer: 'At the outer circumference surface (r = R)',
        explanation: 'Because shear strain is proportional to distance from the center, shear stress increases linearly from zero at the center to maximum at the outer surface (τ ∝ r).'
      }
    ],
    practiceProblems: [
      {
        id: 'p-torsion-1',
        question: 'A solid shaft with radius r = 50 mm carries torque T = 10 kN·m. Given J = 9.817 × 10⁻⁶ m⁴, compute max shear stress in MPa.',
        givenValues: { 'T': 10, 'r': 50 },
        targetVariable: 'τ',
        correctAnswer: 50.9,
        unit: 'MPa',
        tolerance: 0.5,
        hint: 'τ = (10,000 * 0.05) / 9.817e-6 in Pa -> divide by 10^6 for MPa.',
        solutionSteps: [
          'Given: T = 10,000 N·m, r = 0.05 m, J = 9.817 × 10⁻⁶ m⁴',
          'Formula: τ = Tr / J',
          'Calculation: (10,000 · 0.05) / 9.817×10⁻⁶ = 500 / 9.817×10⁻⁶ = 50.93 MPa'
        ]
      }
    ],
    prerequisites: ['Polar Moment of Inertia', 'Shear Modulus G', 'Shaft Cross-Sections'],
    relatedFormulaIds: ['mech-normal-stress', 'mech-bending-stress', 'mech-bending-moment'],
    diagramDescription: 'A 2D circular cylindrical shaft anchored at the fixed wall with an animated twisting torque vector T and a radial shear stress gradient distribution.',
    categoryAccentColor: '#8B5CF6',
    isVerified: true
  },

  // ==========================================
  // STRUCTURAL / CIVIL: EULER COLUMN BUCKLING (P_cr = π²EI / (KL)²)
  // ==========================================
  {
    id: 'civil-euler-buckling',
    name: 'Euler Critical Buckling Load for Slender Columns',
    codeName: 'P_cr = π²EI / (KL)²',
    topic: 'Column Stability & Buckling',
    chapter: 'Structural Mechanics',
    subject: 'civil',
    level: ['diploma', 'engineering', 'professional'],
    formulaLatex: 'P_{cr} = \\frac{\\pi^2 \\cdot E \\cdot I}{(K \\cdot L)^2}',
    formulaPlain: 'P_cr = (π^2 * E * I) / (K * L)^2',
    derivationSummary: 'Formulated by Leonhard Euler from differential equation of lateral column deflection: EI(d²v/dx²) + P·v = 0. Solving with end boundary conditions yields the fundamental eigenvalue corresponding to critical compressive load P_cr = π²EI / L_eff².',
    realWorldApplication: 'Bridge piers, crane support legs, high-rise structural building columns, and hydraulic cylinder ram buckling safety margins.',
    variables: [
      { symbol: 'P_cr', name: 'Critical Buckling Load', unit: 'kN', dimension: '[M L T⁻²]', description: 'Theoretical maximum axial compressive load before elastic lateral bifurcation instability', defaultValue: 1600 },
      { symbol: 'L', name: 'Column Physical Length', unit: 'm', dimension: '[L]', description: 'Physical unsupported length of the column', defaultValue: 4, min: 2, max: 10, step: 0.5 },
      { symbol: 'K', name: 'Effective Length Factor', unit: 'dimensionless', dimension: '[1]', description: 'End condition factor (K=1.0 Pin-Pin, K=0.7 Fixed-Pin, K=0.5 Fixed-Fixed, K=2.0 Fixed-Free)', defaultValue: 1.0, min: 0.5, max: 2.0, step: 0.1 },
      { symbol: 'E', name: 'Young\'s Modulus', unit: 'GPa', dimension: '[M L⁻¹ T⁻²]', description: 'Elastic modulus of the structural material', defaultValue: 200, min: 50, max: 250, step: 10 },
      { symbol: 'I', name: 'Minor Moment of Inertia', unit: '×10⁻⁶ m⁴', dimension: '[L⁴]', description: 'Second moment of area about the weak buckling axis', defaultValue: 16, min: 2, max: 50, step: 2 }
    ],
    simulation: {
      type: 'euler-column-buckling',
      primaryVariable: 'L',
      secondaryVariable: 'K',
      tertiaryVariable: 'I',
      outputLabel: 'Critical Buckling Load (P_cr)',
      outputUnit: 'kN',
      formulaCode: '(Math.PI * Math.PI * (E * 1e9) * (I * 1e-6)) / Math.pow(K * L, 2) / 1000',
      customInputs: [
        { id: 'L', label: 'Column Length (L)', symbol: 'L', unit: 'm', min: 2, max: 8, step: 0.5, defaultValue: 3.5 },
        { id: 'K', label: 'End Factor (K)', symbol: 'K', unit: '', min: 0.5, max: 2.0, step: 0.1, defaultValue: 1.0 },
        { id: 'I', label: 'Weak Axis Inertia (I)', symbol: 'I', unit: '×10⁻⁶ m⁴', min: 4, max: 40, step: 2, defaultValue: 16 }
      ]
    },
    relationships: [
      { variable: 'L', direction: 'increase', resultEffect: 'Buckling resistance drops inversely with the SQUARE of column length (1/L²)', mathExpression: 'P_cr ∝ 1/L²' },
      { variable: 'K', direction: 'increase', resultEffect: 'Free ends (higher K) dramatically reduce buckling strength', mathExpression: 'P_cr ∝ 1/K²' }
    ],
    assumptions: [
      'Slender column with slenderness ratio λ = KL/r > 100 (Euler elastic buckling governs over compressive yield)',
      'Column is perfectly straight initially with concentric axial compressive load',
      'Material behaves in a linear elastic regime without residual stresses',
      'Lateral buckling occurs about the principal axis with the minimum moment of inertia (I_min)'
    ],
    commonMistakes: [
      'Using the major axis moment of inertia instead of the weak axis (I_min governs buckling direction)',
      'Ignoring effective length factor K: a fixed-free flagpole (K=2.0) has 1/16 the strength of fixed-fixed (K=0.5)',
      'Applying Euler\'s formula to short stocky columns where material yield/crushing occurs before elastic buckling'
    ],
    dimensionalAnalysis: {
      equation: 'P_cr = π² · E · I / (K · L)²',
      unitsBreakdown: '[1] · [N/m²] · [m⁴] / [m²] = [N · m²] / [m²] = [N]',
      finalUnit: 'kN (kiloNewtons)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-pin-pin', name: 'Pinned-Pinned Standard (K = 1.0)', description: 'Standard truss member or simple hinge column.', values: { L: 3.5, K: 1.0, I: 16 } },
      { id: 'preset-fixed-fixed', name: 'Fixed-Fixed Rigid Frame (K = 0.5)', description: 'Monolithic concrete column with rigid foundation connections.', values: { L: 3.5, K: 0.5, I: 16 } },
      { id: 'preset-cantilever', name: 'Cantilever Fixed-Free (K = 2.0)', description: 'Tall flagpole or unsupported vertical mast subject to high buckling risk.', values: { L: 3.5, K: 2.0, I: 16 } }
    ],
    whatIfScenarios: [
      {
        title: 'Compare Fixed-Fixed (K=0.5) vs Cantilever (K=2.0)',
        prompt: 'How does changing end restraint from Fixed-Fixed to Fixed-Free affect buckling capacity?',
        targetValues: { L: 3.5, K: 2.0, I: 16 },
        outcomeText: 'Buckling capacity collapses by 93.75% (16× reduction).',
        insight: 'P_cr is inversely proportional to K². (2.0 / 0.5)² = 4² = 16× difference in load capacity based purely on support rigidity.'
      }
    ],
    predictionChallenge: {
      question: 'A column has critical load P_cr = 400 kN at length L = 2 m. If the length is doubled to L = 4 m (with identical supports and section), what is the new critical buckling load?',
      paramToChange: 'L',
      newValue: 4,
      options: [
        { label: '200 kN (Half)', value: 200, isCorrect: false, reason: 'Incorrect. Buckling load drops with the square of length (1/L²), not linearly.' },
        { label: '100 kN (Quarter)', value: 100, isCorrect: true, reason: 'Correct! P_cr ∝ 1/L². Doubling length reduces capacity to 1/(2²) = 1/4 of 400 kN = 100 kN.' },
        { label: '50 kN (Eighth)', value: 50, isCorrect: false, reason: 'Too low. That would correspond to cubic 1/L³ scaling.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A pinned-pinned steel column (E = 200 GPa, K = 1.0) has length L = 3 m and moment of inertia I = 10 × 10⁻⁶ m⁴. Calculate Euler critical buckling load in kN.',
        given: { 'E': '200 GPa = 200 × 10⁹ Pa', 'I': '10 × 10⁻⁶ m⁴', 'L': '3 m', 'K': '1.0' },
        formulaUsed: 'P_cr = (π² · E · I) / (K · L)²',
        substitution: 'P_cr = (9.8696 · 200×10⁹ · 10×10⁻⁶) / (1.0 · 3)²',
        calculation: 'P_cr = 19,739,208 / 9 = 2,193,245 N ≈ 2193 kN',
        finalAnswer: '2193 kN',
        unit: 'kN',
        explanation: 'Any axial compressive load exceeding 2193 kN will cause the column to buckle elastically to the side.'
      }
    ],
    conceptQuestions: [
      {
        question: 'Why do slender columns buckle laterally under compressive load rather than failing in direct material compression?',
        options: ['Material strength is lower in compression', 'Buckling represents the lowest energy state path of instability', 'Shear stress exceeds yield strength first', 'Columns only buckle if loaded off-center'],
        correctAnswer: 'Buckling represents the lowest energy state path of instability',
        explanation: 'For slender columns (high slenderness ratio), the critical load required to cause geometric lateral instability (buckling) is much lower than the load required to cause compressive material yield.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-buckle-1',
        question: 'Calculate P_cr (in kN) for a column with E = 200 GPa, I = 8 × 10⁻⁶ m⁴, L = 4 m, K = 1.0.',
        givenValues: { 'L': 4, 'K': 1.0, 'I': 8 },
        targetVariable: 'P_cr',
        correctAnswer: 987,
        unit: 'kN',
        tolerance: 15,
        hint: 'Use P_cr = (π² * 200e9 * 8e-6) / (4^2) in N -> divide by 1000.',
        solutionSteps: [
          'Given: E = 200 GPa, I = 8 × 10⁻⁶ m⁴, L = 4 m, K = 1.0',
          'Calculation: (9.8696 · 200×10⁹ · 8×10⁻⁶) / 16 = 15,791,360 / 16 = 986,960 N = 987 kN'
        ]
      }
    ],
    prerequisites: ['Second Moment of Area (I)', 'Boundary Conditions & Supports', 'Slenderness Ratio'],
    relatedFormulaIds: ['mech-normal-stress', 'mech-bending-moment', 'mech-beam-deflection'],
    diagramDescription: 'A 2D vertical structural column between top and bottom supports undergoing lateral sinusoidal bifurcation deformation under downward compressive load vector P.',
    categoryAccentColor: '#2563EB',
    isVerified: true
  },

  // ==========================================
  // FLUID MECHANICS: HYDROSTATIC PRESSURE (P = ρgh)
  // ==========================================
  {
    id: 'civil-hydrostatic-pressure',
    name: 'Hydrostatic Fluid Pressure',
    codeName: 'P = ρ · g · h',
    topic: 'Fluid Statics & Hydrostatics',
    chapter: 'Fluid Mechanics',
    subject: 'civil',
    level: ['class-11-12', 'diploma', 'engineering'],
    formulaLatex: 'P = \\rho \\cdot g \\cdot h',
    formulaPlain: 'P = ρ * g * h',
    derivationSummary: 'From vertical static fluid equilibrium: ΣF_z = 0 -> (P + dP)A - P·A - (ρ·A·dz)g = 0 -> dP/dz = -ρg. Integrating over depth h with P(0)=0 gives gauge hydrostatic pressure P = ρgh.',
    realWorldApplication: 'Designing dam wall thickness profiles, submarine hull pressure ratings, water reservoir tanks, and scuba diving decompression limits.',
    variables: [
      { symbol: 'P', name: 'Hydrostatic Gauge Pressure', unit: 'kPa', dimension: '[M L⁻¹ T⁻²]', description: 'Pressure exerted by static fluid at depth h', defaultValue: 98.1 },
      { symbol: 'ρ', name: 'Fluid Density', unit: 'kg/m³', dimension: '[M L⁻³]', description: 'Mass density of fluid (Water = 1000, Seawater = 1025, Mercury = 13600)', defaultValue: 1000, min: 700, max: 2000, step: 25 },
      { symbol: 'g', name: 'Gravitational Acceleration', unit: 'm/s²', dimension: '[L T⁻²]', description: 'Local standard gravitational acceleration (9.81 m/s²)', defaultValue: 9.81, min: 1.62, max: 24.8, step: 0.1 },
      { symbol: 'h', name: 'Fluid Depth / Column Height', unit: 'm', dimension: '[L]', description: 'Vertical distance below the free liquid surface', defaultValue: 10, min: 1, max: 50, step: 1 }
    ],
    simulation: {
      type: 'hydrostatic-fluid-pressure',
      primaryVariable: 'h',
      secondaryVariable: 'ρ',
      outputLabel: 'Hydrostatic Pressure (P = ρ·g·h)',
      outputUnit: 'kPa',
      formulaCode: '(ρ * g * h) / 1000',
      customInputs: [
        { id: 'h', label: 'Fluid Depth (h)', symbol: 'h', unit: 'm', min: 1, max: 30, step: 1, defaultValue: 12 },
        { id: 'ρ', label: 'Fluid Density (ρ)', symbol: 'ρ', unit: 'kg/m³', min: 800, max: 1400, step: 50, defaultValue: 1000 }
      ]
    },
    relationships: [
      { variable: 'h', direction: 'increase', resultEffect: 'Pressure increases linearly with fluid depth', mathExpression: 'P ∝ h' },
      { variable: 'ρ', direction: 'increase', resultEffect: 'Denser fluids produce higher hydrostatic pressure', mathExpression: 'P ∝ ρ' }
    ],
    assumptions: [
      'Incompressible fluid with uniform constant density ρ',
      'Fluid is completely static (no flow, velocity v = 0, no viscous shear stresses)',
      'Uniform gravitational field g'
    ],
    commonMistakes: [
      'Confusing gauge pressure (P_gauge = ρgh) with absolute pressure (P_abs = P_atm + ρgh)',
      'Assuming hydrostatic pressure depends on container width or volume (Hydrostatic Paradox)',
      'Using slant distance along inclined surfaces instead of true vertical depth h'
    ],
    dimensionalAnalysis: {
      equation: 'P = ρ · g · h',
      unitsBreakdown: '[kg/m³] · [m/s²] · [m] = kg / (m · s²) = N/m² = Pa',
      finalUnit: 'kPa (10³ Pascals)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-water-10m', name: 'Freshwater Pool (10m)', description: 'Standard 10 m water depth creating approximately 1 atmosphere of gauge pressure.', values: { h: 10, ρ: 1000 } },
      { id: 'preset-deep-dam', name: 'Hydroelectric Dam Base (25m)', description: 'Deep water pressure acting against a reinforced concrete gravity dam wall.', values: { h: 25, ρ: 1000 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Depth',
        prompt: 'What happens to hydrostatic pressure if depth is increased from 10 m to 20 m?',
        targetValues: { h: 20, ρ: 1000 },
        outcomeText: 'Pressure exactly doubles from 98.1 kPa to 196.2 kPa.',
        insight: 'Hydrostatic pressure creates a linear triangular pressure distribution increasing by approximately 9.81 kPa per meter of freshwater depth.'
      }
    ],
    predictionChallenge: {
      question: 'At depth h = 5 m in water (ρ = 1000 kg/m³), P = 49.05 kPa. What will the gauge pressure be at depth h = 15 m (3× depth)?',
      paramToChange: 'h',
      newValue: 15,
      options: [
        { label: '98.1 kPa (2×)', value: 98.1, isCorrect: false, reason: 'Incorrect. That would be for 10 m depth.' },
        { label: '147.15 kPa (3×)', value: 147.15, isCorrect: true, reason: 'Correct! P = ρgh is directly linear with depth. 3 × 49.05 = 147.15 kPa.' },
        { label: '441.45 kPa (9×)', value: 441.45, isCorrect: false, reason: 'Incorrect. Pressure varies linearly with h, not quadratically.' }
      ]
    },
    solvedExamples: [
      {
        question: 'Calculate the hydrostatic gauge pressure at the bottom of a 15 m deep freshwater tank (ρ = 1000 kg/m³, g = 9.81 m/s²).',
        given: { 'ρ': '1000 kg/m³', 'g': '9.81 m/s²', 'h': '15 m' },
        formulaUsed: 'P = ρ · g · h',
        substitution: 'P = 1000 · 9.81 · 15',
        calculation: 'P = 147,150 Pa = 147.15 kPa',
        finalAnswer: '147.15 kPa',
        unit: 'kPa',
        explanation: 'The hydrostatic pressure is 147.15 kPa. This pressure acts uniformly in all directions at this depth (Pascal\'s Law).'
      }
    ],
    conceptQuestions: [
      {
        question: 'Two containers with different shapes and volumes are filled with water to the exact same vertical depth h = 4 m. How does the hydrostatic pressure at the bottom compare?',
        options: ['The wider container has higher pressure', 'The narrower container has higher pressure', 'Both containers have identical hydrostatic pressure at the bottom', 'Pressure depends on total water weight'],
        correctAnswer: 'Both containers have identical hydrostatic pressure at the bottom',
        explanation: 'This is the classic Hydrostatic Paradox: pressure at a point in a static fluid depends solely on vertical depth h and fluid density ρ, not on the shape, width, or total volume of the container.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-hydro-1',
        question: 'A diver descends to a depth of 22 m in seawater (density ρ = 1025 kg/m³). Taking g = 9.81 m/s², what is the gauge pressure in kPa?',
        givenValues: { 'h': 22, 'ρ': 1025 },
        targetVariable: 'P',
        correctAnswer: 221.2,
        unit: 'kPa',
        tolerance: 2,
        hint: 'Use P = (1025 * 9.81 * 22) / 1000',
        solutionSteps: [
          'Given: ρ = 1025 kg/m³, g = 9.81 m/s², h = 22 m',
          'Calculation: (1025 · 9.81 · 22) = 221,215.5 Pa = 221.2 kPa'
        ]
      }
    ],
    prerequisites: ['Density & Specific Weight', 'Pascal\'s Law', 'Gauge vs Absolute Pressure'],
    relatedFormulaIds: ['mech-normal-stress', 'phys-newton-second-law'],
    diagramDescription: 'A 2D water reservoir tank cross-section with a triangular hydrostatic pressure distribution profile and depth indicator dimension lines.',
    categoryAccentColor: '#06B6D4',
    isVerified: true
  },

  // ==========================================
  // PHYSICS: KINETIC ENERGY (Ek = 1/2 m v²)
  // ==========================================
  {
    id: 'phys-kinetic-energy',
    name: 'Translational Kinetic Energy',
    codeName: 'Ek = ½ m v²',
    topic: 'Work, Energy & Power',
    chapter: 'Classical Mechanics',
    subject: 'physics',
    level: ['class-9-10', 'class-11-12', 'diploma', 'engineering'],
    formulaLatex: 'E_k = \\frac{1}{2} \\cdot m \\cdot v^2',
    formulaPlain: 'Ek = 0.5 * m * v^2',
    derivationSummary: 'From the Work-Energy Theorem: W = ∫ F dx = ∫ (m dv/dt) dx = ∫ m v dv = ½ m v² - ½ m v₀².',
    realWorldApplication: 'Automotive braking distance calculations, ballistic impact armor design, flywheel energy storage systems, and wind turbine power extraction.',
    variables: [
      { symbol: 'm', name: 'Object Mass', unit: 'kg', dimension: '[M]', description: 'Inertial mass of the moving body', defaultValue: 1000, min: 100, max: 3000, step: 50 },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', dimension: '[L T⁻¹]', description: 'Translational speed of the body (1 m/s = 3.6 km/h)', defaultValue: 20, min: 1, max: 60, step: 1 },
      { symbol: 'Ek', name: 'Kinetic Energy', unit: 'kJ', dimension: '[M L² T⁻²]', description: 'Capacity to perform work due to motion', defaultValue: 200 }
    ],
    simulation: {
      type: 'kinetic-energy',
      primaryVariable: 'v',
      secondaryVariable: 'm',
      outputLabel: 'Kinetic Energy (Ek = ½mv²)',
      outputUnit: 'kJ',
      formulaCode: '(0.5 * m * Math.pow(v, 2)) / 1000',
      customInputs: [
        { id: 'v', label: 'Velocity (v)', symbol: 'v', unit: 'm/s', min: 5, max: 50, step: 1, defaultValue: 15 },
        { id: 'm', label: 'Mass (m)', symbol: 'm', unit: 'kg', min: 200, max: 2000, step: 50, defaultValue: 1000 }
      ]
    },
    relationships: [
      { variable: 'v', direction: 'increase', resultEffect: 'Energy increases with the SQUARE of velocity (v²)', mathExpression: 'Ek ∝ v²' },
      { variable: 'm', direction: 'increase', resultEffect: 'Energy scales linearly with mass', mathExpression: 'Ek ∝ m' }
    ],
    assumptions: [
      'Translational motion without rotational components (rigid body translation)',
      'Classical non-relativistic speeds (v << c, where c is speed of light)',
      'Constant mass during the motion interval'
    ],
    commonMistakes: [
      'Underestimating velocity squaring: doubling vehicle speed quadruples required braking energy and distance (2² = 4)',
      'Using speed in km/h instead of m/s (divide km/h by 3.6 to convert to m/s)',
      'Confusing momentum (p = mv, linear) with kinetic energy (Ek = ½mv², quadratic)'
    ],
    dimensionalAnalysis: {
      equation: 'Ek = ½ · m · v²',
      unitsBreakdown: '[kg] · [m/s]² = kg · m² / s² = (kg·m/s²) · m = N · m = Joules (J)',
      finalUnit: 'kJ (kiloJoules = 10³ J)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-car-50', name: 'Car at 54 km/h (15 m/s)', description: 'Typical 1000 kg family car driving in urban traffic.', values: { v: 15, m: 1000 } },
      { id: 'preset-car-108', name: 'Car at 108 km/h (30 m/s)', description: 'Highway cruising speed showing 4× energy surge.', values: { v: 30, m: 1000 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Speed (15 m/s → 30 m/s)',
        prompt: 'What happens to vehicle kinetic energy when speed doubles from 15 m/s to 30 m/s?',
        targetValues: { v: 30, m: 1000 },
        outcomeText: 'Kinetic energy quadruples (4×) from 112.5 kJ to 450.0 kJ.',
        insight: 'Because Ek ∝ v², doubling speed requires 4 times the braking work to stop safely.'
      }
    ],
    predictionChallenge: {
      question: 'A vehicle has kinetic energy Ek = 50 kJ at speed v = 10 m/s. If the driver accelerates to v = 20 m/s (double), what is the new kinetic energy?',
      paramToChange: 'v',
      newValue: 20,
      options: [
        { label: '100 kJ (2×)', value: 100, isCorrect: false, reason: 'Incorrect. Momentum doubles, but kinetic energy scales with v².' },
        { label: '200 kJ (4×)', value: 200, isCorrect: true, reason: 'Correct! Ek ∝ v². Doubling velocity multiplies energy by 2² = 4× (50 kJ × 4 = 200 kJ).' },
        { label: '400 kJ (8×)', value: 400, isCorrect: false, reason: 'Too high. That would be cubic scaling.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A 1200 kg car travels at 25 m/s (90 km/h). Calculate its kinetic energy in kJ.',
        given: { 'm': '1200 kg', 'v': '25 m/s' },
        formulaUsed: 'Ek = ½ · m · v²',
        substitution: 'Ek = 0.5 · 1200 · 25²',
        calculation: 'Ek = 600 · 625 = 375,000 J = 375 kJ',
        finalAnswer: '375 kJ',
        unit: 'kJ',
        explanation: 'The kinetic energy of the vehicle is 375 kJ, all of which must be dissipated as thermal friction in the brakes to bring the car to rest.'
      }
    ],
    conceptQuestions: [
      {
        question: 'If two objects have equal kinetic energy, does the heavier object or the lighter object possess greater momentum?',
        options: ['The lighter object has greater momentum', 'The heavier object has greater momentum', 'Both have identical momentum', 'Cannot be determined without speed'],
        correctAnswer: 'The heavier object has greater momentum',
        explanation: 'From p = √(2mEk), for a given constant kinetic energy Ek, momentum p is proportional to the square root of mass (p ∝ √m). The heavier mass carries greater momentum.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-ke-1',
        question: 'A 800 kg racing car accelerates to 30 m/s. Find its kinetic energy in kJ.',
        givenValues: { 'm': 800, 'v': 30 },
        targetVariable: 'Ek',
        correctAnswer: 360,
        unit: 'kJ',
        tolerance: 1,
        hint: 'Ek = 0.5 * 800 * (30^2) / 1000',
        solutionSteps: [
          'Given: m = 800 kg, v = 30 m/s',
          'Calculation: 0.5 · 800 · 900 = 360,000 J = 360 kJ'
        ]
      }
    ],
    prerequisites: ['Velocity & Acceleration', 'Work-Energy Theorem', 'Conservation of Energy'],
    relatedFormulaIds: ['phys-newton-second-law', 'phys-hookes-law'],
    diagramDescription: 'A 2D moving vehicle on horizontal pavement with velocity vector v and an animated kinetic energy particle field indicator.',
    categoryAccentColor: '#EF4444',
    isVerified: true
  },

  // ==========================================
  // ELECTRICAL ENGINEERING: OHM'S LAW (V = I * R)
  // ==========================================
  {
    id: 'elec-ohms-law',
    name: 'Ohm\'s Law of Electrical Circuits',
    codeName: 'V = I · R',
    topic: 'DC Circuits & Electrodynamics',
    chapter: 'Electrical Engineering',
    subject: 'electrical',
    level: ['class-9-10', 'class-11-12', 'diploma', 'engineering'],
    formulaLatex: 'V = I \\cdot R',
    formulaPlain: 'V = I * R',
    derivationSummary: 'Microscopic Ohm\'s law states current density J = σ_c · E. Integrating across a conductor of length L and cross-section A gives V = E·L = (J / σ_c)L = (I/A)(L/σ_c) = I · R.',
    realWorldApplication: 'Circuit design, sizing current limiting resistors, power supply voltage regulation, and electronic sensor signal conditioning.',
    variables: [
      { symbol: 'V', name: 'Voltage / Potential Difference', unit: 'V (Volts)', dimension: '[M L² T⁻³ I⁻¹]', description: 'Electromotive force driving charge carrier flow', defaultValue: 12, min: 1, max: 240, step: 1 },
      { symbol: 'I', name: 'Current', unit: 'A (Amperes)', dimension: '[I]', description: 'Rate of electric charge flow (1 A = 1 Coulomb/second)', defaultValue: 2 },
      { symbol: 'R', name: 'Resistance', unit: 'Ω (Ohms)', dimension: '[M L² T⁻³ I⁻²]', description: 'Opposition to current flow through the material', defaultValue: 6, min: 1, max: 100, step: 1 }
    ],
    simulation: {
      type: 'ohms-law',
      primaryVariable: 'V',
      secondaryVariable: 'R',
      outputLabel: 'Current Flow (I = V / R)',
      outputUnit: 'A',
      formulaCode: 'V / R',
      customInputs: [
        { id: 'V', label: 'Source Voltage (V)', symbol: 'V', unit: 'V', min: 2, max: 48, step: 1, defaultValue: 12 },
        { id: 'R', label: 'Circuit Resistance (R)', symbol: 'R', unit: 'Ω', min: 1, max: 24, step: 0.5, defaultValue: 6 }
      ]
    },
    relationships: [
      { variable: 'V', direction: 'increase', resultEffect: 'Current increases directly with source voltage', mathExpression: 'I ∝ V' },
      { variable: 'R', direction: 'increase', resultEffect: 'Current decreases inversely with circuit resistance', mathExpression: 'I ∝ 1/R' }
    ],
    assumptions: [
      'Ohmic material with linear constant resistance over operating temperature range',
      'Direct Current (DC) steady-state conditions without transient inductance or capacitance',
      'Uniform temperature avoiding thermal resistivity drift (R(T) = R₀(1 + αΔT))'
    ],
    commonMistakes: [
      'Applying Ohm\'s law directly to non-linear semiconductor devices (diodes, transistors)',
      'Ignoring internal resistance of voltage sources or resistance of connecting wires in high-current paths'
    ],
    dimensionalAnalysis: {
      equation: 'I = V / R',
      unitsBreakdown: '[Volts] / [Ohms] = [W/A] / [V/A] = Amperes (A)',
      finalUnit: 'A (Amperes)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-12v-battery', name: '12V Automotive Circuit', description: 'Standard 12 V battery powering a 6 Ω load.', values: { V: 12, R: 6 } },
      { id: 'preset-usb-5v', name: '5V USB Electronic Load', description: '5V logic circuit powering a 2.5 Ω peripheral.', values: { V: 5, R: 2.5 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Resistance',
        prompt: 'What happens to circuit current if resistance R is doubled from 6 Ω to 12 Ω at constant 12 V?',
        targetValues: { V: 12, R: 12 },
        outcomeText: 'Current is halved from 2.0 A to 1.0 A.',
        insight: 'Current is inversely proportional to resistance (I ∝ 1/R).'
      }
    ],
    predictionChallenge: {
      question: 'A 24 V source powers an 8 Ω resistor (Current I = 3 A). If voltage is increased to 48 V while resistance remains 8 Ω, what is the new current?',
      paramToChange: 'V',
      newValue: 48,
      options: [
        { label: '3 A', value: 3, isCorrect: false, reason: 'Incorrect. Voltage increase drives higher current.' },
        { label: '6 A', value: 6, isCorrect: true, reason: 'Correct! I = V/R -> 48 V / 8 Ω = 6 A (doubled).' },
        { label: '12 A', value: 12, isCorrect: false, reason: 'Too high.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A 24 V DC power supply is connected across a 12 Ω heating element. Calculate the current in the circuit.',
        given: { 'V': '24 V', 'R': '12 Ω' },
        formulaUsed: 'I = V / R',
        substitution: 'I = 24 / 12',
        calculation: 'I = 2.0 A',
        finalAnswer: '2.0 A',
        unit: 'A',
        explanation: 'According to Ohm\'s law, 2 Amperes of current flow through the 12 Ohm resistor when excited by 24 Volts.'
      }
    ],
    conceptQuestions: [
      {
        question: 'If you double the voltage across a constant ohmic resistor, what happens to the power dissipated (P = V²/R)?',
        options: ['Power doubles (2x)', 'Power quadruples (4x)', 'Power remains constant', 'Power is halved'],
        correctAnswer: 'Power quadruples (4x)',
        explanation: 'Because P = V²/R, doubling voltage multiplies power dissipation by 2² = 4 times.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-ohm-1',
        question: 'A 36 V battery supplies a 9 Ω resistor. What current in Amperes flows?',
        givenValues: { 'V': 36, 'R': 9 },
        targetVariable: 'I',
        correctAnswer: 4,
        unit: 'A',
        tolerance: 0.1,
        hint: 'Use I = V / R -> 36 / 9',
        solutionSteps: ['Given: V = 36 V, R = 9 Ω', 'Formula: I = V / R', 'Calculation: 36 / 9 = 4 A']
      }
    ],
    prerequisites: ['Electric Potential', 'Charge & Current', 'Resistivity & Materials'],
    relatedFormulaIds: ['elec-electrical-power', 'phys-kinetic-energy'],
    diagramDescription: 'A 2D DC closed circuit loop containing battery source V, resistor R, and animated electron particle circulation indicating current flow speed.',
    categoryAccentColor: '#6366F1',
    isVerified: true
  },

  // ==========================================
  // ENGINEERING MATHEMATICS: AREA OF CIRCLE (A = πr²)
  // ==========================================
  {
    id: 'math-area-circle',
    name: 'Area of a Circle',
    codeName: 'A = π · r²',
    topic: 'Geometry & Integral Calculus',
    chapter: 'Engineering Mathematics',
    subject: 'mathematics',
    level: ['class-5-8', 'class-9-10', 'diploma', 'engineering'],
    formulaLatex: 'A = \\pi \\cdot r^2',
    formulaPlain: 'A = π * r^2',
    derivationSummary: 'Integrating concentric thin circular rings of radius x and width dx: A = ∫₀^r 2πx dx = 2π [x²/2]₀^r = πr².',
    realWorldApplication: 'Computing pipe cross-sectional hydraulic flow area, hydraulic piston thrust area, and wire cross-section current capacities.',
    variables: [
      { symbol: 'r', name: 'Radius of Circle', unit: 'cm', dimension: '[L]', description: 'Distance from geometric center to outer boundary perimeter', defaultValue: 6, min: 1, max: 20, step: 0.5 },
      { symbol: 'A', name: 'Enclosed Area', unit: 'cm²', dimension: '[L²]', description: 'Total surface area bounded by the circle', defaultValue: 113.1 }
    ],
    simulation: {
      type: 'area-circle',
      primaryVariable: 'r',
      outputLabel: 'Enclosed Area (A = πr²)',
      outputUnit: 'cm²',
      formulaCode: 'Math.PI * Math.pow(r, 2)',
      customInputs: [
        { id: 'r', label: 'Radius (r)', symbol: 'r', unit: 'cm', min: 1, max: 15, step: 0.5, defaultValue: 6 }
      ]
    },
    relationships: [
      { variable: 'r', direction: 'increase', resultEffect: 'Area expands quadratically with the SQUARE of radius (r²)', mathExpression: 'A ∝ r²' }
    ],
    assumptions: [
      'Euclidean two-dimensional flat plane geometry',
      'Perfect geometric circle with constant radius from center'
    ],
    commonMistakes: [
      'Confusing radius r with diameter d: A = πr² = πd²/4 (using d in πr² gives 4× error)',
      'Confusing circumference (C = 2πr) with area (A = πr²)'
    ],
    dimensionalAnalysis: {
      equation: 'A = π · r²',
      unitsBreakdown: '[1] · [cm]² = cm²',
      finalUnit: 'cm² (or m² in SI)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-r-5', name: '5 cm Radius Circle', description: 'Standard small circular section.', values: { r: 5 } },
      { id: 'preset-r-10', name: '10 cm Radius Circle (2×)', description: 'Demonstrating 4× area expansion.', values: { r: 10 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Radius (5 cm → 10 cm)',
        prompt: 'What happens to the area of a circle when its radius is doubled?',
        targetValues: { r: 10 },
        outcomeText: 'Area quadruples (4×) from 78.54 cm² to 314.16 cm².',
        insight: 'Area scales quadratically with linear dimensions (A ∝ r²).'
      }
    ],
    predictionChallenge: {
      question: 'A circle of radius r = 3 cm has area A ≈ 28.27 cm². If radius is doubled to r = 6 cm, what is the new area?',
      paramToChange: 'r',
      newValue: 6,
      options: [
        { label: '56.55 cm² (2×)', value: 56.55, isCorrect: false, reason: 'Incorrect. Circumference doubles, but area quadruples.' },
        { label: '113.10 cm² (4×)', value: 113.1, isCorrect: true, reason: 'Correct! A ∝ r². (2)² = 4× -> 28.27 × 4 = 113.1 cm².' },
        { label: '226.20 cm² (8×)', value: 226.2, isCorrect: false, reason: 'Too high.' }
      ]
    },
    solvedExamples: [
      {
        question: 'Find the area of a circular cross-section with radius r = 7 cm.',
        given: { 'r': '7 cm', 'π': '≈ 3.14159' },
        formulaUsed: 'A = π · r²',
        substitution: 'A = π · 7²',
        calculation: 'A = π · 49 = 153.94 cm²',
        finalAnswer: '153.94 cm²',
        unit: 'cm²',
        explanation: 'Squaring the radius and multiplying by π gives the bounded area.'
      }
    ],
    conceptQuestions: [
      {
        question: 'If a pipe\'s diameter is doubled, by what factor does its cross-sectional flow area increase?',
        options: ['2 times', '4 times', '8 times', '16 times'],
        correctAnswer: '4 times',
        explanation: 'Because area is proportional to the square of diameter (A = πd²/4), doubling diameter multiplies flow area by 2² = 4.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-area-1',
        question: 'Calculate the area of a circular disk with radius r = 8 cm in cm².',
        givenValues: { 'r': 8 },
        targetVariable: 'A',
        correctAnswer: 201.06,
        unit: 'cm²',
        tolerance: 0.5,
        hint: 'Use A = π * 8^2',
        solutionSteps: ['Formula: A = π · r²', 'Calculation: π · 64 = 201.06 cm²']
      }
    ],
    prerequisites: ['Euclidean Geometry', 'Algebraic Exponents', 'Constants (π)'],
    relatedFormulaIds: ['mech-normal-stress', 'mech-torsion-shaft'],
    diagramDescription: 'A 2D green Euclidean circle with center point, radius dimension arrow r, and dynamic hatched area fill readout.',
    categoryAccentColor: '#10B981',
    isVerified: true
  },

  // ==========================================
  // MECHANICAL: FLEXURAL BENDING STRESS (σ = M * y / I)
  // ==========================================
  {
    id: 'mech-bending-stress',
    name: 'Flexural Bending Stress (Elastic Flexure)',
    codeName: 'σ = M · y / I',
    topic: 'Beam Bending & Stress Profiles',
    chapter: 'Strength of Materials',
    subject: 'mechanical',
    level: ['diploma', 'engineering', 'professional'],
    formulaLatex: '\\sigma = \\frac{M \\cdot y}{I}',
    formulaPlain: 'σ = (M * y) / I',
    derivationSummary: 'From Navier\'s Bernoulli-Euler hypothesis that transverse planes remain planar: longitudinal strain ε_x = -y/ρ. Applying Hooke\'s law σ_x = E·ε_x = -Ey/ρ. Enforcing pure moment equilibrium ∫ σ_x y dA = M yields M = (E/ρ) ∫ y² dA = (E/ρ)I, giving the elastic flexure formula σ = My/I.',
    realWorldApplication: 'Sizing I-beams and W-sections for building floor girders, crane runways, railway bridge spans, and aircraft wing spar structural flanges.',
    variables: [
      { symbol: 'M', name: 'Internal Bending Moment', unit: 'kN·m', dimension: '[M L² T⁻²]', description: 'Resultant bending couple acting at the cross section', defaultValue: 50, min: 5, max: 200, step: 5 },
      { symbol: 'y', name: 'Fiber Distance from NA', unit: 'mm', dimension: '[L]', description: 'Perpendicular distance from the neutral axis to the fiber layer', defaultValue: 150, min: 10, max: 300, step: 5 },
      { symbol: 'I', name: 'Second Moment of Area', unit: '×10⁻⁶ m⁴', dimension: '[L⁴]', description: 'Bending inertia of the section about the neutral axis', defaultValue: 80, min: 10, max: 400, step: 10 },
      { symbol: 'σ', name: 'Flexural Normal Stress', unit: 'MPa', dimension: '[M L⁻¹ T⁻²]', description: 'Tension or compressive stress at distance y (1 MPa = 10⁶ N/m²)', defaultValue: 93.75 }
    ],
    simulation: {
      type: 'bending-stress-beam',
      primaryVariable: 'M',
      secondaryVariable: 'y',
      tertiaryVariable: 'I',
      outputLabel: 'Flexural Stress at Fiber y (σ)',
      outputUnit: 'MPa',
      formulaCode: '(M * 1000 * (y / 1000)) / (I * 1e-6) / 1000000',
      customInputs: [
        { id: 'M', label: 'Bending Moment (M)', symbol: 'M', unit: 'kN·m', min: 10, max: 150, step: 5, defaultValue: 60 },
        { id: 'y', label: 'Distance from NA (y)', symbol: 'y', unit: 'mm', min: 20, max: 200, step: 5, defaultValue: 120 },
        { id: 'I', label: 'Moment of Inertia (I)', symbol: 'I', unit: '×10⁻⁶ m⁴', min: 20, max: 250, step: 10, defaultValue: 90 }
      ]
    },
    relationships: [
      { variable: 'M', direction: 'increase', resultEffect: 'Flexural stress scales linearly with applied bending moment', mathExpression: 'σ ∝ M' },
      { variable: 'y', direction: 'increase', resultEffect: 'Stress increases linearly away from the neutral axis (maximum at outer extreme fibers)', mathExpression: 'σ ∝ y' },
      { variable: 'I', direction: 'increase', resultEffect: 'Deeper sections with higher moment of inertia drastically reduce stress intensity', mathExpression: 'σ ∝ 1/I' }
    ],
    assumptions: [
      'Beam is straight and has a constant prismatic cross section with a vertical plane of symmetry',
      'Euler-Bernoulli hypothesis: cross sections remain plane and perpendicular to the deformed neutral axis',
      'Material is homogeneous, isotropic, and strictly linear-elastic within Hooke\'s law limits',
      'Neutral axis passes through the cross-sectional area centroid in pure bending'
    ],
    commonMistakes: [
      'Forgetting that bending stress is zero at the neutral axis (y = 0) and reaches peak values only at outermost extreme fibers (y = c = h/2)',
      'Mixing metric units: substituting y in mm without converting to meters or failing to scale I in 10⁻⁶ m⁴',
      'Confusing bending moment M (torque/couple in kN·m) with vertical shear force V (load in kN)'
    ],
    dimensionalAnalysis: {
      equation: 'σ = (M · y) / I',
      unitsBreakdown: '[N·m] · [m] / [m⁴] = [N·m²] / [m⁴] = N/m² = Pa',
      finalUnit: 'MPa (10⁶ N/m²)',
      isConsistent: true,
      notes: 'Directly yields pressure/stress dimensions [M L⁻¹ T⁻²].'
    },
    scenarioPresets: [
      { id: 'preset-w-beam', name: 'Standard W-Flange Steel Beam', description: 'Heavy structural steel girder carrying commercial floor loads.', values: { M: 60, y: 120, I: 90 } },
      { id: 'preset-outer-fiber', name: 'Peak Extreme Top Fiber (Compression)', description: 'Evaluating maximum outer fiber compressive stress near the top flange.', values: { M: 80, y: 180, I: 100 } }
    ],
    whatIfScenarios: [
      {
        title: 'Evaluate Stress at Neutral Axis (y = 0)',
        prompt: 'What is the flexural stress exactly at the centroidal neutral axis (y = 0 mm)?',
        targetValues: { M: 60, y: 20, I: 90 },
        outcomeText: 'Stress drops towards zero as y approaches the neutral axis.',
        insight: 'At the neutral axis (y = 0), bending strain and stress are identically zero. The neutral axis undergoes neither elongation nor compression.'
      },
      {
        title: 'Double the Section Depth (4× Inertia boost)',
        prompt: 'What happens if we increase cross-section inertia I from 60 to 120 × 10⁻⁶ m⁴?',
        targetValues: { M: 60, y: 120, I: 180 },
        outcomeText: 'Flexural stress is cut in half from 80 MPa to 40 MPa.',
        insight: 'Flexural stress is inversely proportional to section moment of inertia (σ ∝ 1/I). Deeper beams carry large bending moments with minimal stress.'
      }
    ],
    predictionChallenge: {
      question: 'A beam has extreme fiber stress σ = 60 MPa under moment M = 30 kN·m. If the applied moment is doubled to M = 60 kN·m with geometry unchanged, what is the new stress?',
      paramToChange: 'M',
      newValue: 60,
      options: [
        { label: '60 MPa', value: 60, isCorrect: false, reason: 'Incorrect. Higher bending moment induces higher internal stress.' },
        { label: '120 MPa (2×)', value: 120, isCorrect: true, reason: 'Correct! From σ = My/I, stress is directly linear with bending moment M. Doubling M exactly doubles σ (60 × 2 = 120 MPa).' },
        { label: '240 MPa (4×)', value: 240, isCorrect: false, reason: 'Too high. Scaling is linear, not quadratic.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A steel I-beam is subjected to a bending moment M = 45 kN·m (45,000 N·m). If the moment of inertia I = 60 × 10⁻⁶ m⁴, calculate the stress at a fiber distance y = 100 mm (0.1 m) from the neutral axis.',
        given: { 'M': '45,000 N·m', 'y': '0.10 m', 'I': '60 × 10⁻⁶ m⁴' },
        formulaUsed: 'σ = (M · y) / I',
        substitution: 'σ = (45,000 · 0.10) / (60 × 10⁻⁶)',
        calculation: 'σ = 4,500 / 60 × 10⁻⁶ = 75,000,000 Pa = 75 MPa',
        finalAnswer: '75.0 MPa',
        unit: 'MPa',
        explanation: 'The tensile or compressive stress at 100 mm above or below the neutral axis is 75 MPa.'
      }
    ],
    conceptQuestions: [
      {
        question: 'In a simply supported beam with downward gravity loads causing positive sagging curvature, where does maximum compressive stress occur?',
        options: ['At the bottom extreme fibers', 'At the top extreme fibers', 'At the neutral axis', 'Uniformly across the full section'],
        correctAnswer: 'At the top extreme fibers',
        explanation: 'Positive sagging curvature causes compression in the fibers above the neutral axis (maximum at top surface) and tension below the neutral axis.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-bend-1',
        question: 'An engineered beam has M = 50 kN·m, y = 150 mm (0.15 m), and I = 75 × 10⁻⁶ m⁴. Calculate the bending stress in MPa.',
        givenValues: { 'M': 50, 'y': 150, 'I': 75 },
        targetVariable: 'σ',
        correctAnswer: 100,
        unit: 'MPa',
        tolerance: 1,
        hint: 'Use σ = (50,000 * 0.15) / 75e-6 in Pa -> divide by 10^6 for MPa.',
        solutionSteps: [
          'Given: M = 50,000 N·m, y = 0.15 m, I = 75 × 10⁻⁶ m⁴',
          'Formula: σ = (M · y) / I',
          'Calculation: (50,000 · 0.15) / 75×10⁻⁶ = 7,500 / 75×10⁻⁶ = 100 MPa'
        ]
      }
    ],
    prerequisites: ['Centroids & First Moments', 'Second Moment of Area (I)', 'Shear Force & Bending Moment Diagrams'],
    relatedFormulaIds: ['mech-beam-deflection', 'mech-normal-stress', 'mech-torsion-shaft'],
    diagramDescription: 'A 2D beam cross-sectional elevation showing the linear triangular stress profile through the neutral axis: compressive arrows on top, tensile arrows below, and live fiber distance indicator y.',
    categoryAccentColor: '#0284C7',
    isVerified: true
  },

  // ==========================================
  // PHYSICS: HOOKE'S LAW FOR SPRINGS (F = k * x)
  // ==========================================
  {
    id: 'phys-hookes-law',
    name: 'Hooke\'s Law for Elastic Springs',
    codeName: 'F = k · x',
    topic: 'Elasticity & Harmonic Oscillations',
    chapter: 'Classical Mechanics',
    subject: 'physics',
    level: ['class-9-10', 'class-11-12', 'diploma', 'engineering'],
    formulaLatex: 'F_s = -k \\cdot x',
    formulaPlain: 'F = k * x',
    derivationSummary: 'Robert Hooke\'s empirical relationship for linear elastic deformation: the restoring force exerted by an ideal spring is directly proportional to displacement from equilibrium: F_restoring = -k·x, where k is the spring stiffness constant.',
    realWorldApplication: 'Automotive suspension coil springs, weighing scales, seismic vibration isolation dampers, and precision mechanical clock escapements.',
    variables: [
      { symbol: 'k', name: 'Spring Stiffness Constant', unit: 'N/m', dimension: '[M T⁻²]', description: 'Rigidity of the spring (force required per meter of elongation)', defaultValue: 250, min: 20, max: 1000, step: 20 },
      { symbol: 'x', name: 'Elongation / Displacement', unit: 'cm', dimension: '[L]', description: 'Extension or compression distance relative to unstretched resting length', defaultValue: 12, min: 1, max: 40, step: 1 },
      { symbol: 'F', name: 'Elastic Restoring Force', unit: 'N', dimension: '[M L T⁻²]', description: 'Magnitude of resisting force developed by the spring', defaultValue: 30 }
    ],
    simulation: {
      type: 'hookes-law-spring',
      primaryVariable: 'x',
      secondaryVariable: 'k',
      outputLabel: 'Restoring Force Magnitude (F = k·x)',
      outputUnit: 'N',
      formulaCode: '(k * (x / 100))',
      customInputs: [
        { id: 'x', label: 'Displacement (x)', symbol: 'x', unit: 'cm', min: 2, max: 30, step: 1, defaultValue: 14 },
        { id: 'k', label: 'Spring Constant (k)', symbol: 'k', unit: 'N/m', min: 50, max: 500, step: 25, defaultValue: 250 }
      ]
    },
    relationships: [
      { variable: 'x', direction: 'increase', resultEffect: 'Restoring force grows linearly with stretch displacement', mathExpression: 'F ∝ x' },
      { variable: 'k', direction: 'increase', resultEffect: 'Stiffer springs generate larger restoring forces for the same stretch', mathExpression: 'F ∝ k' }
    ],
    assumptions: [
      'Linear elastic behavior within the elastic proportional limit (no plastic yielding or coil binding)',
      'Negligible mass of the spring coils (massless spring approximation)',
      'Pure uniaxial 1D extension or compression without lateral buckling'
    ],
    commonMistakes: [
      'Mixing centimeters (cm) with meters (m) when calculating force in Newtons (1 cm = 0.01 m)',
      'Forgetting that the negative sign in F = -kx signifies direction (restoring force opposes displacement)',
      'Confusing spring constant k (N/m) with elastic modulus E (N/m²)'
    ],
    dimensionalAnalysis: {
      equation: 'F = k · x',
      unitsBreakdown: '[N/m] · [m] = N = kg · m / s²',
      finalUnit: 'N (Newtons)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-soft-spring', name: 'Soft Precision Sensor Spring', description: 'High sensitivity spring (k = 80 N/m) with noticeable deflection.', values: { x: 18, k: 80 } },
      { id: 'preset-stiff-damper', name: 'Heavy Vehicle Suspension Spring', description: 'Stiff coil spring (k = 400 N/m) providing heavy load support.', values: { x: 8, k: 400 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Stretch Displacement',
        prompt: 'What happens to the restoring force if spring extension x is increased from 10 cm to 20 cm?',
        targetValues: { x: 20, k: 250 },
        outcomeText: 'Restoring force exactly doubles from 25.0 N to 50.0 N.',
        insight: 'Force is strictly proportional to displacement (F ∝ x) under Hooke\'s law.'
      }
    ],
    predictionChallenge: {
      question: 'A spring with stiffness k = 200 N/m is stretched by x = 5 cm (0.05 m), generating F = 10 N. If stretch increases to x = 15 cm (3×), what is the new restoring force?',
      paramToChange: 'x',
      newValue: 15,
      options: [
        { label: '20 N (2×)', value: 20, isCorrect: false, reason: 'Incorrect.' },
        { label: '30 N (3×)', value: 30, isCorrect: true, reason: 'Correct! F = kx is directly linear. 3 × 10 N = 30 N.' },
        { label: '90 N (9×)', value: 90, isCorrect: false, reason: 'Incorrect. Spring force is linear, not quadratic.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A spring of constant k = 300 N/m is stretched by 12 cm (0.12 m). Determine the restoring force developed by the spring.',
        given: { 'k': '300 N/m', 'x': '0.12 m' },
        formulaUsed: 'F = k · x',
        substitution: 'F = 300 · 0.12',
        calculation: 'F = 36.0 N',
        finalAnswer: '36.0 N',
        unit: 'N',
        explanation: 'The spring develops a 36 N restoring force directed back towards equilibrium.'
      }
    ],
    conceptQuestions: [
      {
        question: 'If two identical springs with stiffness k are connected in parallel, what is the equivalent stiffness of the combination?',
        options: ['k / 2', 'k', '2k', '4k'],
        correctAnswer: '2k',
        explanation: 'Springs in parallel share the load equally and require double the force for the same displacement: k_eq = k₁ + k₂ = 2k.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-hooke-1',
        question: 'A spring with k = 350 N/m is compressed by 8 cm (0.08 m). Find the spring force in Newtons.',
        givenValues: { 'k': 350, 'x': 8 },
        targetVariable: 'F',
        correctAnswer: 28,
        unit: 'N',
        tolerance: 0.5,
        hint: 'Use F = 350 * 0.08',
        solutionSteps: ['Formula: F = k · x', 'Calculation: 350 · 0.08 = 28 N']
      }
    ],
    prerequisites: ['Equilibrium & Vectors', 'Work & Potential Energy in Springs (U = ½kx²)', 'Harmonic Motion'],
    relatedFormulaIds: ['phys-kinetic-energy', 'phys-newton-second-law'],
    diagramDescription: 'A 2D mechanical spring anchored to a left support wall connected to a mass block, with dynamic coil geometry expanding/compressing, restoring force vector F, and displacement dimension x.',
    categoryAccentColor: '#10B981',
    isVerified: true
  },

  // ==========================================
  // ELECTRICAL: JOULE'S ELECTRICAL POWER (P = V * I)
  // ==========================================
  {
    id: 'elec-electrical-power',
    name: 'Electrical Power & Joule Heating',
    codeName: 'P = V · I',
    topic: 'Power & Energy Dissipation',
    chapter: 'Electrical Engineering',
    subject: 'electrical',
    level: ['class-9-10', 'class-11-12', 'diploma', 'engineering'],
    formulaLatex: 'P = V \\cdot I = I^2 \\cdot R = \\frac{V^2}{R}',
    formulaPlain: 'P = V * I',
    derivationSummary: 'Electric power is the time rate of electrical energy transfer: P = dW/dt = d(qV)/dt = V(dq/dt) = V · I. Combining with Ohm\'s law (V = IR) yields P = I²R = V²/R.',
    realWorldApplication: 'Sizing electrical cables, transformers, circuit breakers, sizing electric vehicle battery discharge rates, and HVAC resistive heating elements.',
    variables: [
      { symbol: 'V', name: 'Operating Voltage', unit: 'V', dimension: '[M L² T⁻³ I⁻¹]', description: 'Electric potential drop across the load element', defaultValue: 120, min: 12, max: 400, step: 5 },
      { symbol: 'I', name: 'Current Flow', unit: 'A', dimension: '[I]', description: 'Current traversing through the circuit load', defaultValue: 5, min: 0.5, max: 30, step: 0.5 },
      { symbol: 'P', name: 'Electric Power', unit: 'W (Watts)', dimension: '[M L² T⁻³]', description: 'Rate of energy consumption or thermal dissipation (1 kW = 1000 W)', defaultValue: 600 }
    ],
    simulation: {
      type: 'electrical-power',
      primaryVariable: 'V',
      secondaryVariable: 'I',
      outputLabel: 'Electrical Power Dissipation (P = V·I)',
      outputUnit: 'W',
      formulaCode: 'V * I',
      customInputs: [
        { id: 'V', label: 'Voltage (V)', symbol: 'V', unit: 'V', min: 12, max: 240, step: 6, defaultValue: 120 },
        { id: 'I', label: 'Current (I)', symbol: 'I', unit: 'A', min: 1, max: 20, step: 0.5, defaultValue: 5 }
      ]
    },
    relationships: [
      { variable: 'V', direction: 'increase', resultEffect: 'Power scales directly with applied terminal voltage', mathExpression: 'P ∝ V' },
      { variable: 'I', direction: 'increase', resultEffect: 'Power scales directly with current flow (and as I² for fixed resistance loads)', mathExpression: 'P ∝ I' }
    ],
    assumptions: [
      'Steady-state DC circuit or purely resistive AC load with unity power factor (cos φ = 1.0)',
      'Linear conductor properties without temperature-induced thermal runaway'
    ],
    commonMistakes: [
      'Confusing Power (Watts = Joules/second) with total Energy (Joules or kilowatt-hours kWh = Power × time)',
      'Using P = VI for AC inductive/capacitive loads without accounting for power factor (P_real = VI cos φ)'
    ],
    dimensionalAnalysis: {
      equation: 'P = V · I',
      unitsBreakdown: '[Volts] · [Amperes] = [J/C] · [C/s] = Joules / second = Watts (W)',
      finalUnit: 'W (Watts)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-lamp-60w', name: 'Incandescent Lamp (120V, 0.5A)', description: 'Standard residential 60 Watt light bulb.', values: { V: 120, I: 0.5 } },
      { id: 'preset-heater-1kw', name: 'Space Heater (120V, 10A)', description: 'Heavy residential 1200 Watt resistive heater.', values: { V: 120, I: 10 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Current at Constant Voltage',
        prompt: 'What happens to power consumption if current increases from 5 A to 10 A at 120 V?',
        targetValues: { V: 120, I: 10 },
        outcomeText: 'Power doubles from 600 W to 1200 W.',
        insight: 'Power is directly proportional to current (P ∝ I) when terminal voltage is fixed.'
      }
    ],
    predictionChallenge: {
      question: 'A 240 V industrial heater draws 5 A of current (P = 1200 W). If current increases to 10 A at 240 V, what is the new power dissipation?',
      paramToChange: 'I',
      newValue: 10,
      options: [
        { label: '1200 W', value: 1200, isCorrect: false, reason: 'Incorrect.' },
        { label: '2400 W (2×)', value: 2400, isCorrect: true, reason: 'Correct! P = V · I = 240 V × 10 A = 2400 W.' },
        { label: '4800 W (4×)', value: 4800, isCorrect: false, reason: 'Too high.' }
      ]
    },
    solvedExamples: [
      {
        question: 'An electric motor operates at 230 V and draws 4.5 A. Compute the electrical power input.',
        given: { 'V': '230 V', 'I': '4.5 A' },
        formulaUsed: 'P = V · I',
        substitution: 'P = 230 · 4.5',
        calculation: 'P = 1035 W = 1.035 kW',
        finalAnswer: '1035 W (or 1.035 kW)',
        unit: 'W',
        explanation: 'Direct multiplication of voltage and current yields 1035 Watts.'
      }
    ],
    conceptQuestions: [
      {
        question: 'Why are long-distance power transmission lines operated at very high voltages (e.g. 400 kV)?',
        options: ['High voltage reduces line resistance', 'High voltage reduces current I for a given power P, drastically cutting I²R transmission heat losses', 'High voltage prevents lightning strikes', 'Electrons move faster at higher voltage'],
        correctAnswer: 'High voltage reduces current I for a given power P, drastically cutting I²R transmission heat losses',
        explanation: 'Since P = VI, transmitting power at ultra-high voltage allows low current I. Because line heat loss is P_loss = I²R_line, halving current quarters thermal line losses.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-pwr-1',
        question: 'A 48 V DC battery bank powers a load drawing 15 A. Calculate the total power delivered in Watts.',
        givenValues: { 'V': 48, 'I': 15 },
        targetVariable: 'P',
        correctAnswer: 720,
        unit: 'W',
        tolerance: 5,
        hint: 'Use P = 48 * 15',
        solutionSteps: ['Formula: P = V · I', 'Calculation: 48 · 15 = 720 W']
      }
    ],
    prerequisites: ['Ohm\'s Law (V = IR)', 'Work & Energy', 'Conservation of Energy'],
    relatedFormulaIds: ['elec-ohms-law', 'phys-kinetic-energy'],
    diagramDescription: 'A 2D circuit load with glowing thermal dissipation radiation waves, voltage drop indicator V, and current flow vector I.',
    categoryAccentColor: '#F59E0B',
    isVerified: true
  },

  // ==========================================
  // PHYSICS: NEWTON'S SECOND LAW (F = m * a)
  // ==========================================
  {
    id: 'phys-newton-second-law',
    name: 'Newton\'s Second Law of Motion',
    codeName: 'F = m · a',
    topic: 'Dynamics & Kinetics',
    chapter: 'Classical Mechanics',
    subject: 'physics',
    level: ['class-9-10', 'class-11-12', 'diploma', 'engineering'],
    formulaLatex: '\\Sigma \\vec{F} = m \\cdot \\vec{a}',
    formulaPlain: 'F = m * a',
    derivationSummary: 'Newton defined force as the time rate of change of linear momentum: F = dp/dt = d(mv)/dt. For constant mass m, differentiating yields F = m(dv/dt) = m · a.',
    realWorldApplication: 'Rocket thrust and trajectory dynamics, automotive crash safety impact forces, elevator cable tension, and robotic manipulator torque control.',
    variables: [
      { symbol: 'm', name: 'Inertial Mass', unit: 'kg', dimension: '[M]', description: 'Resistance of the body to changes in its state of motion', defaultValue: 50, min: 5, max: 500, step: 5 },
      { symbol: 'a', name: 'Linear Acceleration', unit: 'm/s²', dimension: '[L T⁻²]', description: 'Rate of change of velocity with respect to time', defaultValue: 4, min: 0.5, max: 30, step: 0.5 },
      { symbol: 'F', name: 'Net Resultant Force', unit: 'N', dimension: '[M L T⁻²]', description: 'Net external vector sum of forces acting on the mass', defaultValue: 200 }
    ],
    simulation: {
      type: 'force-mass-acceleration',
      primaryVariable: 'a',
      secondaryVariable: 'm',
      outputLabel: 'Net Accelerating Force (F = m·a)',
      outputUnit: 'N',
      formulaCode: 'm * a',
      customInputs: [
        { id: 'm', label: 'Object Mass (m)', symbol: 'm', unit: 'kg', min: 10, max: 200, step: 10, defaultValue: 60 },
        { id: 'a', label: 'Acceleration (a)', symbol: 'a', unit: 'm/s²', min: 1, max: 20, step: 0.5, defaultValue: 5 }
      ]
    },
    relationships: [
      { variable: 'a', direction: 'increase', resultEffect: 'Required force scales linearly with desired acceleration', mathExpression: 'F ∝ a' },
      { variable: 'm', direction: 'increase', resultEffect: 'Heavier bodies require proportionally greater force for identical acceleration', mathExpression: 'F ∝ m' }
    ],
    assumptions: [
      'Inertial reference frame (non-accelerating observer)',
      'Constant mass m over the dynamic time interval (non-relativistic v << c)'
    ],
    commonMistakes: [
      'Confusing mass (m in kg, scalar property) with weight (W = mg in N, gravitational force vector)',
      'Forgetting that F is the NET vector sum of all external forces, not individual applied forces'
    ],
    dimensionalAnalysis: {
      equation: 'F = m · a',
      unitsBreakdown: '[kg] · [m/s²] = kg·m/s² = Newtons (N)',
      finalUnit: 'N (Newtons)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-sprinter', name: 'Athletic Sprinter Acceleration', description: '70 kg athlete accelerating out of starting blocks at 4 m/s².', values: { m: 70, a: 4 } },
      { id: 'preset-car-accel', name: 'Sports Car Launch', description: 'Heavy sports vehicle undergoing rapid 8 m/s² linear acceleration.', values: { m: 150, a: 8 } }
    ],
    whatIfScenarios: [
      {
        title: 'Double the Mass at Same Acceleration',
        prompt: 'What happens to required accelerating force if object mass is doubled from 50 kg to 100 kg at a = 5 m/s²?',
        targetValues: { m: 100, a: 5 },
        outcomeText: 'Required force doubles from 250 N to 500 N.',
        insight: 'Force is directly proportional to mass (F ∝ m).'
      }
    ],
    predictionChallenge: {
      question: 'A 40 kg cart is accelerated at 3 m/s² by a net force of 120 N. If acceleration is boosted to 6 m/s² (doubled), what net force is required?',
      paramToChange: 'a',
      newValue: 6,
      options: [
        { label: '120 N', value: 120, isCorrect: false, reason: 'Incorrect.' },
        { label: '240 N (2×)', value: 240, isCorrect: true, reason: 'Correct! F = m · a -> 40 kg × 6 m/s² = 240 N.' },
        { label: '480 N (4×)', value: 480, isCorrect: false, reason: 'Too high.' }
      ]
    },
    solvedExamples: [
      {
        question: 'A crate of mass 80 kg is pushed across a frictionless surface with an acceleration of 2.5 m/s². What net force is acting on it?',
        given: { 'm': '80 kg', 'a': '2.5 m/s²' },
        formulaUsed: 'F = m · a',
        substitution: 'F = 80 · 2.5',
        calculation: 'F = 200 N',
        finalAnswer: '200 N',
        unit: 'N',
        explanation: 'Multiplying mass by acceleration gives 200 Newtons of net horizontal force.'
      }
    ],
    conceptQuestions: [
      {
        question: 'If a constant net force F acts on a body of mass m, what is the nature of its motion?',
        options: ['Constant velocity', 'Uniform constant acceleration', 'Exponentially increasing speed', 'Rest state'],
        correctAnswer: 'Uniform constant acceleration',
        explanation: 'Since a = F/m, a constant net force creates a constant, unchanging acceleration.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-fma-1',
        question: 'Find the net force in Newtons required to accelerate a 45 kg payload at 6 m/s².',
        givenValues: { 'm': 45, 'a': 6 },
        targetVariable: 'F',
        correctAnswer: 270,
        unit: 'N',
        tolerance: 2,
        hint: 'Use F = 45 * 6',
        solutionSteps: ['Formula: F = m · a', 'Calculation: 45 · 6 = 270 N']
      }
    ],
    prerequisites: ['Kinematics (v = u + at)', 'Free Body Diagrams', 'Vector Addition'],
    relatedFormulaIds: ['phys-kinetic-energy', 'phys-hookes-law'],
    diagramDescription: 'A 2D physical block on a frictionless horizontal guideline with applied force arrow F, acceleration vector a, and animated velocity streak.',
    categoryAccentColor: '#EF4444',
    isVerified: true
  },

  // ==========================================
  // CHEMISTRY & THERMODYNAMICS: IDEAL GAS LAW (PV = nRT)
  // ==========================================
  {
    id: 'chem-ideal-gas-law',
    name: 'Ideal Gas Law (Equation of State)',
    codeName: 'P · V = n · R · T',
    topic: 'Chemical Thermodynamics & Gas Kinetics',
    chapter: 'Physical Chemistry & Thermal Engineering',
    subject: 'chemistry',
    level: ['diploma', 'engineering', 'professional'],
    formulaLatex: 'P \\cdot V = n \\cdot R \\cdot T',
    formulaPlain: 'P * V = n * R * T',
    derivationSummary: 'Combined equation uniting Boyle\'s Law (P ∝ 1/V), Charles\'s Law (V ∝ T), and Avogadro\'s Law (V ∝ n) through the Universal Gas Constant R = 8.314 J/(mol·K).',
    realWorldApplication: 'Chemical reactor sizing, internal combustion cylinder compression, high-pressure gas storage tanks, HVAC refrigeration cycles, and atmospheric pressure modeling.',
    variables: [
      { symbol: 'P', name: 'Gas Pressure', unit: 'kPa', dimension: '[M L⁻¹ T⁻²]', description: 'Absolute pressure exerted by gas molecules colliding against chamber walls', defaultValue: 101.3, min: 10, max: 1000, step: 5 },
      { symbol: 'V', name: 'Chamber Volume', unit: 'L', dimension: '[L³]', description: 'Volume occupied by the gas molecules in the container', defaultValue: 24.4, min: 2, max: 100, step: 1 },
      { symbol: 'n', name: 'Amount of Substance', unit: 'mol', dimension: '[N]', description: 'Molar quantity of gas particles (1 mol = 6.022×10²³ molecules)', defaultValue: 1.0, min: 0.1, max: 20, step: 0.1 },
      { symbol: 'T', name: 'Absolute Temperature', unit: 'K', dimension: '[Θ]', description: 'Thermodynamic temperature in Kelvin (K = °C + 273.15)', defaultValue: 298, min: 100, max: 800, step: 5 }
    ],
    simulation: {
      type: 'ideal-gas-law',
      primaryVariable: 'T',
      secondaryVariable: 'V',
      outputLabel: 'Gas Pressure (P = nRT / V)',
      outputUnit: 'kPa',
      formulaCode: '(n * 8.314 * T) / V',
      customInputs: [
        { id: 'n', label: 'Amount of Gas (n)', symbol: 'n', unit: 'mol', min: 0.2, max: 10, step: 0.2, defaultValue: 1.0 },
        { id: 'T', label: 'Temperature (T)', symbol: 'T', unit: 'K', min: 150, max: 600, step: 10, defaultValue: 300 },
        { id: 'V', label: 'Chamber Volume (V)', symbol: 'V', unit: 'L', min: 5, max: 60, step: 1, defaultValue: 25 }
      ]
    },
    relationships: [
      { variable: 'T', direction: 'increase', resultEffect: 'Gas pressure increases linearly with rising thermal excitation', mathExpression: 'P ∝ T (Gay-Lussac)' },
      { variable: 'V', direction: 'increase', resultEffect: 'Gas pressure drops inversely as volume expands', mathExpression: 'P ∝ 1/V (Boyle)' },
      { variable: 'n', direction: 'increase', resultEffect: 'Pressure scales directly with number of gas moles added', mathExpression: 'P ∝ n (Avogadro)' }
    ],
    assumptions: [
      'Gas molecules occupy negligible volume compared to container volume',
      'No intermolecular forces (van der Waals attractions or repulsions) between particles',
      'All collisions between molecules and chamber walls are perfectly elastic',
      'System is in steady thermodynamic equilibrium with uniform temperature'
    ],
    commonMistakes: [
      'Using Celsius (°C) instead of Absolute Kelvin (K = °C + 273.15)',
      'Mixing up universal gas constant R (8.314 J/mol·K) with specific gas constant R_specific',
      'Applying ideal gas law at ultra-high pressures or near liquefaction temperatures where Real Gas (Van der Waals) corrections are required'
    ],
    dimensionalAnalysis: {
      equation: 'P · V = n · R · T',
      unitsBreakdown: '[N/m²] · [m³] = [N·m] = [Joules] = [mol] · [J/(mol·K)] · [K]',
      finalUnit: 'Energy Balance in Joules (J)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-stp', name: 'Standard Temperature & Pressure (STP)', description: '1 mol of ideal gas at 273.15 K and 101.325 kPa (occupies 22.414 L).', values: { n: 1.0, T: 273.15, V: 22.4 } },
      { id: 'preset-room', name: 'Standard Ambient (SATP)', description: 'Room temperature 298.15 K and 100 kPa ambient chamber.', values: { n: 1.0, T: 298.15, V: 24.8 } },
      { id: 'preset-combustion', name: 'High Compression Engine Chamber', description: 'Compressed high-temperature gas before ignition.', values: { n: 2.0, T: 580, V: 8.0 } }
    ],
    whatIfScenarios: [
      {
        title: 'Halve Chamber Volume (Isothermal Compression)',
        prompt: 'What happens to gas pressure P if volume V is compressed by 50% at constant temperature?',
        targetValues: { n: 1.0, T: 300, V: 12.5 },
        outcomeText: 'Pressure exactly doubles (Boyle\'s Law).',
        insight: 'Halving volume doubles collision frequency against the chamber walls.'
      },
      {
        title: 'Double the Temperature (Isochoric Heating)',
        prompt: 'What happens if temperature T increases from 300 K to 600 K inside a rigid container?',
        targetValues: { n: 1.0, T: 600, V: 25 },
        outcomeText: 'Gas pressure exactly doubles.',
        insight: 'Higher thermal kinetic energy translates to faster molecular velocities and harder wall collisions.'
      }
    ],
    predictionChallenge: {
      question: 'In a closed rigid cylinder (V = 20 L), gas temperature is increased from 300 K to 600 K (2× increase). What is the new pressure?',
      paramToChange: 'T',
      newValue: 600,
      options: [
        { label: 'Unchanged', value: 1, isCorrect: false, reason: 'Incorrect. Pressure is directly proportional to temperature.' },
        { label: '2× Higher Pressure', value: 2, isCorrect: true, reason: 'Correct! P = (nRT)/V is directly proportional to absolute temperature T.' },
        { label: '4× Higher Pressure', value: 4, isCorrect: false, reason: 'Incorrect. T is not squared.' }
      ]
    },
    rearrangements: [
      {
        targetSymbol: 'V',
        targetName: 'Chamber Volume',
        latex: 'V = \\frac{n \\cdot R \\cdot T}{P}',
        plain: 'V = (n * R * T) / P',
        description: 'Calculate required container volume for given gas mass and pressure',
        requiredInputs: ['n', 'T', 'P'],
        resultUnit: 'L or m³'
      },
      {
        targetSymbol: 'T',
        targetName: 'Absolute Temperature',
        latex: 'T = \\frac{P \\cdot V}{n \\cdot R}',
        plain: 'T = (P * V) / (n * R)',
        description: 'Determine gas temperature from measured pressure and volume',
        requiredInputs: ['P', 'V', 'n'],
        resultUnit: 'K'
      },
      {
        targetSymbol: 'n',
        targetName: 'Molar Quantity',
        latex: 'n = \\frac{P \\cdot V}{R \\cdot T}',
        plain: 'n = (P * V) / (R * T)',
        description: 'Calculate moles of gas stored in the vessel',
        requiredInputs: ['P', 'V', 'T'],
        resultUnit: 'mol'
      }
    ],
    constants: [
      { symbol: 'R', name: 'Universal Gas Constant', value: 8.314462, unit: 'J/(mol·K)', description: 'Molar gas constant linking energy and temperature scales', category: 'physical' },
      { symbol: 'N_A', name: 'Avogadro Constant', value: '6.02214076 × 10²³', unit: 'mol⁻¹', description: 'Number of constituent particles in one mole', category: 'physical' },
      { symbol: 'k_B', name: 'Boltzmann Constant', value: '1.380649 × 10⁻²³', unit: 'J/K', description: 'R divided by Avogadro constant for single particle kinetics', category: 'physical' }
    ],
    videoReferences: [
      {
        title: 'Ideal Gas Law & Kinetic Molecular Theory Explained',
        channel: 'CrashCourse Chemistry / Khan Academy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=ideal+gas+law+derivation+and+examples',
        duration: '11:45',
        description: 'Visual demonstration of gas kinetics, molecular collision pressure, and phase boundaries.'
      }
    ],
    solvedExamples: [
      {
        question: 'Calculate the pressure exerted by 2.0 moles of nitrogen gas confined in a 10.0 L container at 300 K.',
        given: { 'n': '2.0 mol', 'V': '10.0 L = 0.01 m³', 'T': '300 K', 'R': '8.314 J/(mol·K)' },
        formulaUsed: 'P = (n · R · T) / V',
        substitution: 'P = (2.0 · 8.314 · 300) / 0.01',
        calculation: 'P = 498,840 Pa = 498.8 kPa (~4.92 atm)',
        finalAnswer: '498.8 kPa',
        unit: 'kPa',
        explanation: 'Direct substitution into the Ideal Gas Law gives the absolute pressure.'
      }
    ],
    conceptQuestions: [
      {
        question: 'Which gas condition exhibits closest agreement with the Ideal Gas Law?',
        options: ['High pressure and low temperature', 'Low pressure and high temperature', 'At critical boiling point', 'High density phase'],
        correctAnswer: 'Low pressure and high temperature',
        explanation: 'At low pressures and high temperatures, molecular volume and intermolecular attractive forces become negligible.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-gas-1',
        question: 'Find the pressure in kPa exerted by 1.5 moles of helium in a 15 L cylinder at 320 K (use R = 8.314).',
        givenValues: { 'n': 1.5, 'V': 15, 'T': 320 },
        targetVariable: 'P',
        correctAnswer: 266.0,
        unit: 'kPa',
        tolerance: 3.0,
        hint: 'Use P = (1.5 * 8.314 * 320) / 15',
        solutionSteps: [
          'P = (n · R · T) / V',
          'P = (1.5 · 8.314 · 320) / 15 = 266.05 kPa'
        ]
      }
    ],
    prerequisites: ['Gas Laws (Boyle, Charles)', 'Moles & Molar Mass', 'Kelvin Temperature Scale'],
    relatedFormulaIds: ['phys-kinetic-energy'],
    diagramDescription: 'A 2D sealed thermodynamic cylinder with a movable weighted piston, gas molecules with velocity collision vectors, and pressure readout gauge.',
    categoryAccentColor: '#06B6D4',
    isVerified: true
  },

  // ==========================================
  // MATHEMATICS: PYTHAGOREAN THEOREM (c = √(a² + b²))
  // ==========================================
  {
    id: 'math-pythagorean',
    name: 'Pythagorean Theorem & Euclidean Distance',
    codeName: 'c² = a² + b²',
    topic: 'Right Triangles & Vector Norms',
    chapter: 'Applied Mathematics & Geometry',
    subject: 'mathematics',
    level: ['class-9-10', 'diploma', 'engineering'],
    formulaLatex: 'c = \\sqrt{a^2 + b^2}',
    formulaPlain: 'c = sqrt(a^2 + b^2)',
    derivationSummary: 'Geometric proof from square dissection and dot product metric tensor in Euclidean space ℝ²: for any right-angled triangle with legs a and b, the square on the hypotenuse c equals the sum of the squares on the two legs.',
    realWorldApplication: 'Surveying triangulation, civil road gradient layout, computer graphics raytracing distance metrics, and vector magnitude resolution in 2D force systems.',
    variables: [
      { symbol: 'a', name: 'Base Leg (a)', unit: 'm', dimension: '[L]', description: 'Horizontal leg of the right triangle', defaultValue: 3, min: 1, max: 50, step: 0.5 },
      { symbol: 'b', name: 'Altitude Leg (b)', unit: 'm', dimension: '[L]', description: 'Vertical perpendicular leg of the right triangle', defaultValue: 4, min: 1, max: 50, step: 0.5 },
      { symbol: 'c', name: 'Hypotenuse (c)', unit: 'm', dimension: '[L]', description: 'Longest side opposite the 90° right angle', defaultValue: 5 }
    ],
    simulation: {
      type: 'pythagorean-theorem',
      primaryVariable: 'a',
      secondaryVariable: 'b',
      outputLabel: 'Hypotenuse Length (c = √(a²+b²))',
      outputUnit: 'm',
      formulaCode: 'Math.sqrt(a * a + b * b)',
      customInputs: [
        { id: 'a', label: 'Base Leg (a)', symbol: 'a', unit: 'm', min: 1, max: 30, step: 0.5, defaultValue: 6 },
        { id: 'b', label: 'Height Leg (b)', symbol: 'b', unit: 'm', min: 1, max: 30, step: 0.5, defaultValue: 8 }
      ]
    },
    relationships: [
      { variable: 'a', direction: 'increase', resultEffect: 'Hypotenuse increases non-linearly with leg length', mathExpression: 'c = √(a²+b²)' },
      { variable: 'b', direction: 'increase', resultEffect: 'Hypotenuse scales with vertical leg elongation', mathExpression: 'c = √(a²+b²)' }
    ],
    assumptions: [
      'Euclidean flat 2D geometry (zero space curvature)',
      'Angle between legs a and b is precisely 90.00°'
    ],
    commonMistakes: [
      'Applying the theorem to non-right triangles without the Law of Cosines correction c² = a² + b² - 2ab·cos(C)',
      'Forgetting the square root after adding a² and b²'
    ],
    dimensionalAnalysis: {
      equation: 'c = √(a² + b²)',
      unitsBreakdown: '√([m²] + [m²]) = √[m²] = [m]',
      finalUnit: 'm (Meters)',
      isConsistent: true
    },
    scenarioPresets: [
      { id: 'preset-345', name: 'Classic 3-4-5 Triangle', description: 'Integer Pythagorean triplet (3² + 4² = 9 + 16 = 25 = 5²).', values: { a: 3, b: 4 } },
      { id: 'preset-51213', name: '5-12-13 Triplet', description: 'Integer triplet (25 + 144 = 169 = 13²).', values: { a: 5, b: 12 } },
      { id: 'preset-equal', name: 'Isosceles 45°-45°-90°', description: 'Equal leg triangle (c = a√2).', values: { a: 10, b: 10 } }
    ],
    whatIfScenarios: [
      {
        title: 'Scale Both Legs by 2×',
        prompt: 'What happens to hypotenuse c if both legs a and b are doubled?',
        targetValues: { a: 12, b: 16 },
        outcomeText: 'Hypotenuse c exactly doubles from 10 to 20.',
        insight: 'Geometric similarity preserves proportionality (2a)² + (2b)² = 4(a²+b²) -> √(4c²) = 2c.'
      }
    ],
    predictionChallenge: {
      question: 'If base leg a = 6 m and altitude b = 8 m, what is the length of hypotenuse c?',
      paramToChange: 'a',
      newValue: 6,
      options: [
        { label: '14 m (6 + 8)', value: 14, isCorrect: false, reason: 'Incorrect. Triangle inequality states c < a + b.' },
        { label: '10 m (√(36 + 64))', value: 10, isCorrect: true, reason: 'Correct! √(36 + 64) = √100 = 10 m.' },
        { label: '12 m', value: 12, isCorrect: false, reason: 'Incorrect.' }
      ]
    },
    rearrangements: [
      {
        targetSymbol: 'a',
        targetName: 'Base Leg (a)',
        latex: 'a = \\sqrt{c^2 - b^2}',
        plain: 'a = sqrt(c^2 - b^2)',
        description: 'Solve base leg given hypotenuse c and altitude b',
        requiredInputs: ['c', 'b'],
        resultUnit: 'm'
      },
      {
        targetSymbol: 'b',
        targetName: 'Altitude Leg (b)',
        latex: 'b = \\sqrt{c^2 - a^2}',
        plain: 'b = sqrt(c^2 - a^2)',
        description: 'Solve vertical leg given hypotenuse c and base a',
        requiredInputs: ['c', 'a'],
        resultUnit: 'm'
      }
    ],
    constants: [
      { symbol: '√2', name: 'Pythagoras Constant', value: 1.41421356, unit: 'dimensionless', description: 'Ratio of diagonal to side in a unit square', category: 'mathematical' },
      { symbol: 'π', name: 'Pi', value: 3.14159265, unit: 'dimensionless', description: 'Ratio of circle circumference to diameter', category: 'mathematical' }
    ],
    videoReferences: [
      {
        title: 'Visual Proofs of the Pythagorean Theorem',
        channel: '3Blue1Brown / Numberphile',
        youtubeUrl: 'https://www.youtube.com/results?search_query=pythagorean+theorem+visual+proof',
        duration: '8:20',
        description: 'Geometric rearrangement proofs and water demonstration of a² + b² = c².'
      }
    ],
    solvedExamples: [
      {
        question: 'Find the hypotenuse of a right triangle with legs measuring 9 m and 12 m.',
        given: { 'a': '9 m', 'b': '12 m' },
        formulaUsed: 'c = √(a² + b²)',
        substitution: 'c = √(9² + 12²) = √(81 + 144)',
        calculation: 'c = √225 = 15 m',
        finalAnswer: '15 m',
        unit: 'm',
        explanation: 'Applying Pythagorean square addition yields 15 meters.'
      }
    ],
    conceptQuestions: [
      {
        question: 'In a right triangle, can the hypotenuse ever be shorter than or equal to either leg?',
        options: ['Yes, in acute triangles', 'No, hypotenuse is strictly the longest side', 'Only when angles are equal', 'Depends on coordinate system'],
        correctAnswer: 'No, hypotenuse is strictly the longest side',
        explanation: 'Because the right angle (90°) is strictly the largest interior angle, the opposite side (hypotenuse) is strictly the longest side.'
      }
    ],
    practiceProblems: [
      {
        id: 'p-pyth-1',
        question: 'Calculate hypotenuse c when a = 15 m and b = 20 m.',
        givenValues: { 'a': 15, 'b': 20 },
        targetVariable: 'c',
        correctAnswer: 25,
        unit: 'm',
        tolerance: 0.1,
        hint: 'c = √(15² + 20²) = √(225 + 400) = √625',
        solutionSteps: ['c = √(225 + 400) = √625 = 25 m']
      }
    ],
    prerequisites: ['Square Roots', 'Right-Angled Triangle Properties'],
    relatedFormulaIds: ['math-area-circle'],
    diagramDescription: 'A 2D interactive right-angled triangle with square geometric area projections on each of the three sides.',
    categoryAccentColor: '#10B981',
    isVerified: true
  }
];

export const FORMULA_DATABASE: Formula[] = RAW_FORMULA_DATABASE.map(formula => {
  const customRearrangements = FORMULA_REARRANGEMENTS[formula.id];
  const customDerivation = FORMULA_DERIVATIONS[formula.id];
  const customCompetitive = COMPETITIVE_EXAM_QUESTIONS[formula.id];

  return {
    ...formula,
    rearrangements: customRearrangements || formula.rearrangements || [],
    derivationDetail: customDerivation || formula.derivationDetail,
    competitiveExamQuestions: customCompetitive || formula.competitiveExamQuestions || []
  };
});

export const initialFormulas = FORMULA_DATABASE;
