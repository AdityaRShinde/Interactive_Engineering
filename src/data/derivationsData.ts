import { FormulaDerivation } from '../types';

export const FORMULA_DERIVATIONS: Record<string, FormulaDerivation> = {
  // 1. Normal Stress (σ = F / A)
  'mech-normal-stress': {
    title: 'Derivation of Axial Normal Stress from Internal Equilibrium',
    startingPrinciples: [
      'Newtonian Static Force Equilibrium (∑F_x = 0)',
      'Continuum Mechanics Stress Tensor definition',
      'Saint-Venant\'s Principle for uniform stress distribution'
    ],
    assumptions: [
      'Prismatic bar with uniform cross-sectional area A',
      'Line of action of axial force F passes through centroid of cross-section',
      'Homogeneous, isotropic, linear-elastic material'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Section Method and Internal Resisting Force',
        latex: '\\sum F_x = 0 \\implies F_{ext} - \\int_A \\sigma \\, dA = 0',
        explanation: 'Pass an imaginary cutting plane perpendicular to the longitudinal axis of the bar. For the severed free body to remain in static equilibrium, the sum of all microscopic internal traction forces must equal the external applied load F.',
        keyPrinciple: 'Newton\'s 1st Law of Equilibrium'
      },
      {
        stepNumber: 2,
        title: 'Uniform Stress Distribution Assumption',
        latex: '\\sigma(y, z) = \\sigma = \\text{constant across section } A',
        explanation: 'Away from load application points and geometric discontinuities, the normal strain is uniform (ε = constant). For a homogeneous elastic material (σ = Eε), the normal stress σ is constant across the entire cross-section.',
        keyPrinciple: 'Saint-Venant\'s Principle'
      },
      {
        stepNumber: 3,
        title: 'Integration over Cross-Sectional Area',
        latex: 'F = \\int_A \\sigma \\, dA = \\sigma \\int_A dA = \\sigma \\cdot A',
        explanation: 'Pulling the constant scalar stress σ outside the area integral yields the total resisting force as the product of stress and total area A.',
        keyPrinciple: 'Definite Area Integral'
      },
      {
        stepNumber: 4,
        title: 'Isolation of Normal Stress',
        latex: '\\sigma = \\frac{F}{A}',
        explanation: 'Dividing both sides by the cross-sectional area A yields the fundamental formula for average axial normal stress.',
        keyPrinciple: 'Algebraic Isolation'
      }
    ],
    finalEquationLatex: '\\sigma = \\frac{F}{A}',
    physicalSignificance: 'Normal stress represents the internal force intensity resisting axial deformation per unit surface area. It provides the core basis for sizing structural members against material yield strength.'
  },

  // 2. Beam Deflection (Δ = PL³ / 48EI)
  'mech-beam-deflection': {
    title: 'Derivation of Elastic Beam Deflection using Double Integration',
    startingPrinciples: [
      'Euler-Bernoulli Beam Bending Differential Equation: EI \\frac{d^2v}{dx^2} = M(x)',
      'Moment Equilibrium for Simply Supported Beam with Midspan Point Load',
      'Kinematic Boundary Conditions at Supports and Line of Symmetry'
    ],
    assumptions: [
      'Small deflections and linear elastic material behaviour (Hooke\'s Law)',
      'Cross-sections remain plane and perpendicular to the deformed neutral axis',
      'Beam is prismatic with constant Young\'s Modulus E and Inertia I'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Bending Moment Function M(x) for Left Half (0 ≤ x ≤ L/2)',
        latex: 'R_A = \\frac{P}{2} \\implies M(x) = R_A \\cdot x = \\frac{P}{2} x',
        explanation: 'By symmetry, both vertical support reactions equal P/2. Sectioning the beam at distance x from the left support gives the internal bending moment.',
        keyPrinciple: 'Equilibrium of Moments'
      },
      {
        stepNumber: 2,
        title: 'First Integration for Beam Slope (θ = dv/dx)',
        latex: 'E I \\frac{d^2 v}{d x^2} = \\frac{P}{2} x \\implies E I \\frac{d v}{d x} = \\frac{P}{4} x^2 + C_1',
        explanation: 'Integrating the Euler-Bernoulli curvature equation with respect to x gives the angular slope distribution along the span with integration constant C_1.',
        keyPrinciple: 'Direct Integration'
      },
      {
        stepNumber: 3,
        title: 'Applying Symmetry Slope Boundary Condition at Midspan',
        latex: '\\left. \\frac{d v}{d x} \\right|_{x = L/2} = 0 \\implies \\frac{P}{4} \\left(\\frac{L}{2}\\right)^2 + C_1 = 0 \\implies C_1 = -\\frac{P L^2}{16}',
        explanation: 'Due to structural symmetry, the slope of the elastic curve must be zero at the exact midspan point where the maximum sag occurs.',
        keyPrinciple: 'Symmetry Boundary Condition'
      },
      {
        stepNumber: 4,
        title: 'Second Integration for Deflection Curve v(x)',
        latex: 'E I \\, v(x) = \\frac{P}{12} x^3 - \\frac{P L^2}{16} x + C_2, \\quad v(0) = 0 \\implies C_2 = 0',
        explanation: 'Integrating again yields deflection v(x). Since the pin support at x = 0 has zero vertical displacement, C_2 = 0.',
        keyPrinciple: 'Support Boundary Condition'
      },
      {
        stepNumber: 5,
        title: 'Evaluating Maximum Midspan Deflection at x = L/2',
        latex: 'v\\left(\\frac{L}{2}\\right) = \\frac{1}{E I} \\left[ \\frac{P}{12} \\left(\\frac{L}{2}\\right)^3 - \\frac{P L^2}{16} \\left(\\frac{L}{2}\\right) \\right] = -\\frac{P L^3}{48 E I}',
        explanation: 'Substituting x = L/2 gives the downward deflection. Taking magnitude yields the classic structural formula.',
        keyPrinciple: 'Midspan Evaluation'
      }
    ],
    finalEquationLatex: '\\Delta_{\\max} = \\frac{P L^3}{48 E I}',
    physicalSignificance: 'Demonstrates the cubic sensitivity of beam sag to span length (L³), showing why span control and deep cross-sections (I) dominate structural serviceability design.'
  },

  // 3. Torsional Shear Stress (τ = Tr / J)
  'mech-torsion-shaft': {
    title: 'Derivation of Torsional Shear Stress in Solid Circular Shafts',
    startingPrinciples: [
      'Kinematics of Circular Torsion (plane sections remain plane and circular)',
      'Hooke\'s Law for Shear Stress and Strain (τ = G · γ)',
      'Internal Torsional Moment Integral: T = \\int_A r \\cdot \\tau \\, dA'
    ],
    assumptions: [
      'Axisymmetric solid circular shaft under pure torsion',
      'Small angle of twist θ per unit length dθ/dx = constant',
      'Linear elastic material behaviour'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Shear Strain Kinematics across Radius',
        latex: '\\gamma(r) = r \\frac{d\\theta}{dx} = r \\cdot \\theta\'',
        explanation: 'A radial line at the cross-section rotates through angle θ without warping. The shear strain γ is directly proportional to radial distance r from the shaft center.',
        keyPrinciple: 'Axisymmetric Kinematics'
      },
      {
        stepNumber: 2,
        title: 'Applying Hooke\'s Law in Shear',
        latex: '\\tau(r) = G \\cdot \\gamma(r) = G \\cdot r \\cdot \\theta\' \\implies \\frac{\\tau(r)}{r} = G \\theta\' = \\text{constant}',
        explanation: 'Combining shear strain with Hooke\'s Law shows that shear stress increases linearly from zero at the center to maximum at the outer perimeter radius.',
        keyPrinciple: 'Elastic Constitutive Law'
      },
      {
        stepNumber: 3,
        title: 'Moment Equilibrium about Shaft Longitudinal Axis',
        latex: 'T = \\int_A r \\, dF = \\int_A r (\\tau \\, dA) = \\int_A r \\left( \\frac{\\tau_{\\max}}{r_o} r \\right) dA = \\frac{\\tau_{\\max}}{r_o} \\int_A r^2 dA',
        explanation: 'Summing the differential torque contributions of each concentric ring area dA over the total shaft section.',
        keyPrinciple: 'Torsional Moment Integral'
      },
      {
        stepNumber: 4,
        title: 'Introduction of Polar Moment of Inertia (J)',
        latex: 'J = \\int_A r^2 dA = \\frac{\\pi r_o^4}{2} \\implies T = \\frac{\\tau_{\\max}}{r_o} J \\implies \\tau(r) = \\frac{T \\cdot r}{J}',
        explanation: 'The integral ∫ r² dA is defined as the polar second moment of area J. Substituting gives the universal torsion formula.',
        keyPrinciple: 'Polar Second Moment'
      }
    ],
    finalEquationLatex: '\\tau = \\frac{T \\cdot r}{J}',
    physicalSignificance: 'Shows why hollow and large-diameter drive shafts are vastly superior in transmitting torque: placing material far from the axis increases J by r⁴ while only increasing weight by r².'
  },

  // 4. Euler Buckling (P_cr = π²EI / (KL)²)
  'civil-euler-buckling': {
    title: 'Derivation of Euler\'s Critical Buckling Load for Pinned Columns',
    startingPrinciples: [
      'Differential Equation of Column Deflection: EI \\frac{d^2 v}{dx^2} + P v = 0',
      'Eigenvalue Formulation for Lateral Instability',
      'Boundary Conditions: v(0) = 0 and v(L) = 0'
    ],
    assumptions: [
      'Ideal slender column with initially perfectly straight geometry',
      'Pure concentric axial compressive load P',
      'Linear elastic material behaviour'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Bending Moment under Lateral Perturbation',
        latex: 'M(x) = -P \\cdot v(x) \\implies E I \\frac{d^2 v}{dx^2} + P v(x) = 0',
        explanation: 'When a column deflects laterally by distance v(x), the axial load P induces an internal destabilizing bending moment M = -Pv.',
        keyPrinciple: '2nd Order Geometry Equilibrium'
      },
      {
        stepNumber: 2,
        title: 'Setting up Characteristic Differential Equation',
        latex: '\\frac{d^2 v}{dx^2} + \\lambda^2 v = 0, \\quad \\text{where } \\lambda^2 = \\frac{P}{E I}',
        explanation: 'This standard homogeneous 2nd order ordinary differential equation has the general trigonometric solution v(x) = A sin(λx) + B cos(λx).',
        keyPrinciple: 'Helmholtz ODE'
      },
      {
        stepNumber: 3,
        title: 'Applying Pinned End Boundary Conditions',
        latex: 'v(0) = 0 \\implies B = 0; \\quad v(L) = 0 \\implies A \\sin(\\lambda L) = 0',
        explanation: 'For a non-trivial buckled shape (A ≠ 0), we must have sin(λL) = 0, which requires λL = nπ for n = 1, 2, 3...',
        keyPrinciple: 'Eigenvalue Condition'
      },
      {
        stepNumber: 4,
        title: 'Fundamental Buckling Mode (n = 1)',
        latex: '\\lambda L = \\pi \\implies \\sqrt{\\frac{P_{cr}}{E I}} L = \\pi \\implies P_{cr} = \\frac{\\pi^2 E I}{L^2}',
        explanation: 'The lowest non-zero eigenvalue (n = 1) represents the fundamental half-sine buckling wave with critical bifurcation load P_cr.',
        keyPrinciple: 'Fundamental Eigenmode'
      }
    ],
    finalEquationLatex: 'P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}',
    physicalSignificance: 'Buckling is a stability limit state dictated by flexural stiffness (EI) and unsupported length rather than material tensile or compressive yield strength.'
  },

  // 5. Hydrostatic Pressure (p = ρgh)
  'civil-hydrostatic-pressure': {
    title: 'Derivation of Hydrostatic Fluid Pressure from Static Equilibrium',
    startingPrinciples: [
      'Vertical Static Force Equilibrium of a Fluid Element (∑F_z = 0)',
      'Definition of Fluid Density (dm = ρ · dV)',
      'Pascal\'s Law for Static Fluids'
    ],
    assumptions: [
      'Incompressible static fluid (constant density ρ)',
      'Uniform gravitational field g',
      'No shear stresses present in static equilibrium'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Vertical Forces on Infinitesimal Fluid Element (dz)',
        latex: '\\sum F_z = p \\cdot A - (p + dp) \\cdot A - \\rho g (A \\, dz) = 0',
        explanation: 'Consider a cylinder of fluid of horizontal cross-sectional area A and height dz. Upward force at bottom balances downward pressure at top plus element weight.',
        keyPrinciple: 'Static Equilibrium'
      },
      {
        stepNumber: 2,
        title: 'Hydrostatic Differential Equation',
        latex: '-dp \\cdot A - \\rho g A \\, dz = 0 \\implies \\frac{dp}{dz} = -\\rho g',
        explanation: 'Canceling area A gives the fundamental governing differential relation between pressure gradient and vertical depth.',
        keyPrinciple: 'Pressure Gradient Law'
      },
      {
        stepNumber: 3,
        title: 'Integration from Surface (z = 0) to Depth h',
        latex: '\\int_{p_{atm}}^{p} dp = \\int_{0}^{h} \\rho g \\, dh \\implies p - p_{atm} = \\rho g h',
        explanation: 'Assuming constant density ρ and gravity g, integrating over fluid column depth h yields the gauge pressure formula.',
        keyPrinciple: 'Definite Integration'
      }
    ],
    finalEquationLatex: 'p = \\rho \\cdot g \\cdot h',
    physicalSignificance: 'Hydrostatic pressure acts equally in all directions and depends strictly on vertical fluid depth and density, completely independent of container shape or volume.'
  },

  // 6. Kinetic Energy (E_k = 1/2 m v²)
  'phys-kinetic-energy': {
    title: 'Derivation of Kinetic Energy via Work-Energy Theorem',
    startingPrinciples: [
      'Work Done by Net Force: W = \\int F \\, dx',
      'Newton\'s Second Law: F = m \\frac{dv}{dt}',
      'Chain Rule for Kinematics: \\frac{dx}{dt} = v'
    ],
    assumptions: [
      'Constant mass m (non-relativistic speed v ≪ c)',
      'Frictional dissipative forces ignored',
      'One-dimensional translational motion'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Work Integral Definition',
        latex: 'W = \\int_{x_0}^{x_1} F_{net} \\, dx = \\int_{x_0}^{x_1} m \\frac{dv}{dt} \\, dx',
        explanation: 'Work done by the resultant force equals the integral of force along the displacement path.',
        keyPrinciple: 'Work-Energy Theorem'
      },
      {
        stepNumber: 2,
        title: 'Kinematic Transformation (Chain Rule)',
        latex: '\\frac{dv}{dt} \\, dx = \\frac{dx}{dt} \\, dv = v \\, dv',
        explanation: 'Applying the chain rule transforms the spatial integral with respect to x into a velocity integral with respect to v.',
        keyPrinciple: 'Calculus Change of Variables'
      },
      {
        stepNumber: 3,
        title: 'Integration from Rest (v = 0) to Final Velocity v',
        latex: 'W = \\int_{0}^{v} m \\cdot v \\, dv = m \\left[ \\frac{v^2}{2} \\right]_0^v = \\frac{1}{2} m v^2',
        explanation: 'Carrying out the definite integration gives the total mechanical work required to accelerate mass m from rest to velocity v.',
        keyPrinciple: 'Definite Integration'
      }
    ],
    finalEquationLatex: 'E_k = \\frac{1}{2} m v^2',
    physicalSignificance: 'Kinetic energy represents the capacity of a moving body to perform work. Because it scales quadratically with speed (v²), doubling vehicle velocity quadruples required braking distance.'
  },

  // 7. Ohm's Law (I = V / R)
  'elec-ohms-law': {
    title: 'Microscopic Derivation of Ohm\'s Law via Drude Conduction Model',
    startingPrinciples: [
      'Drude Model for Electron Transport in Conductors',
      'Electric Field and Electric Potential Relation: E = V / L',
      'Current Density: J = n \\cdot q \\cdot v_d = \\sigma \\cdot E'
    ],
    assumptions: [
      'Uniform macroscopic conductor of length L and cross-section A',
      'Constant mean free time τ between electron scattering collisions',
      'Ohmic material with constant resistivity ρ'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Electron Drift Velocity under Electric Field E',
        latex: 'F = q \\cdot E = m_e \\frac{v_d}{\\tau} \\implies v_d = \\frac{q \\tau}{m_e} E',
        explanation: 'Electric field E accelerates free conduction electrons against momentum relaxation collisions occurring with average period τ.',
        keyPrinciple: 'Drude Force Balance'
      },
      {
        stepNumber: 2,
        title: 'Microscopic Current Density (J)',
        latex: 'J = n q v_d = n q \\left( \\frac{q \\tau}{m_e} E \\right) = \\left( \\frac{n q^2 \\tau}{m_e} \\right) E = \\sigma_{cond} E',
        explanation: 'Summing charge transport yields microscopic Ohm\'s Law J = σE, where σ_cond is electrical conductivity.',
        keyPrinciple: 'Microscopic Ohm\'s Law'
      },
      {
        stepNumber: 3,
        title: 'Macroscopic Integration over Wire Geometry',
        latex: 'I = J \\cdot A = \\sigma_{cond} A \\left(\\frac{V}{L}\\right) = \\frac{V}{\\rho_{res} \\frac{L}{A}} = \\frac{V}{R}',
        explanation: 'Replacing E with V/L and J with I/A introduces macroscopic circuit resistance R = ρL/A.',
        keyPrinciple: 'Geometric Resistance'
      }
    ],
    finalEquationLatex: 'I = \\frac{V}{R} \\iff V = I \\cdot R',
    physicalSignificance: 'Ohm\'s law establishes linear voltage-current proportionality in resistive electrical circuits, forming the fundamental building block of electronics analysis.'
  },

  // 8. Newton's 2nd Law (F = m * a)
  'phys-newton-second-law': {
    title: 'Derivation of Newton\'s Second Law from Momentum Conservation',
    startingPrinciples: [
      'Definition of Linear Momentum: p = m \\cdot v',
      'Newton\'s Original Second Law: F = \\frac{dp}{dt}',
      'Calculus Product Rule for Derivatives'
    ],
    assumptions: [
      'Inertial reference frame',
      'Constant mass system (dm/dt = 0)',
      'Classical non-relativistic mechanics'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Rate of Change of Momentum',
        latex: 'F = \\frac{d p}{dt} = \\frac{d(m v)}{dt}',
        explanation: 'Newton originally formulated his second law stating that the applied net force is proportional to the time rate of change of linear momentum.',
        keyPrinciple: 'Newton\'s Principia'
      },
      {
        stepNumber: 2,
        title: 'Applying the Product Rule of Differentiation',
        latex: 'F = m \\frac{dv}{dt} + v \\frac{dm}{dt}',
        explanation: 'Differentiating the product of mass and velocity yields two terms: acceleration of mass, and propulsion due to mass variation.',
        keyPrinciple: 'Product Rule'
      },
      {
        stepNumber: 3,
        title: 'Constant Mass Specialization',
        latex: '\\frac{dm}{dt} = 0 \\implies F = m \\frac{dv}{dt} = m \\cdot a',
        explanation: 'For systems where mass is invariant with time, the second term vanishes, giving the familiar force equation.',
        keyPrinciple: 'Constant Mass Invariance'
      }
    ],
    finalEquationLatex: 'F = m \\cdot a',
    physicalSignificance: 'Force is the physical agent that produces acceleration on an inertial mass, linking kinematics directly to dynamics.'
  },

  // 9. Ideal Gas Law (PV = nRT)
  'chem-ideal-gas-law': {
    title: 'Kinetic Theory Derivation of the Ideal Gas Law',
    startingPrinciples: [
      'Kinetic Theory of Gases: Microscopic Momentum Transfer to Container Walls',
      'Average Kinetic Energy of Gas Molecules: \\langle E_k \\rangle = \\frac{3}{2} k_B T',
      'Definition of Molar Gas Constant: R = N_A \\cdot k_B'
    ],
    assumptions: [
      'Point-like particles with negligible molecular volume',
      'Perfect elastic collisions with container walls',
      'No intermolecular attractive or repulsive forces'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Momentum Change per Particle Wall Collision',
        latex: '\\Delta p_x = m v_x - (-m v_x) = 2 m v_x',
        explanation: 'When a particle of mass m collides elastically with a container wall perpendicular to the x-axis, its velocity reverses from +v_x to -v_x.',
        keyPrinciple: 'Elastic Collision'
      },
      {
        stepNumber: 2,
        title: 'Collision Frequency and Force on Wall',
        latex: '\\Delta t = \\frac{2 L_x}{v_x} \\implies F_{1} = \\frac{\\Delta p_x}{\\Delta t} = \\frac{m v_x^2}{L_x}',
        explanation: 'The time between successive collisions with the same wall is 2L_x/v_x, leading to an average force contribution.',
        keyPrinciple: 'Impulse-Momentum'
      },
      {
        stepNumber: 3,
        title: 'Summing over N Molecules in 3 Dimensions',
        latex: 'P = \\frac{\\sum F}{A} = \\frac{N m \\langle v_x^2 \\rangle}{V} = \\frac{1}{3} \\frac{N m \\langle v^2 \\rangle}{V}',
        explanation: 'Due to spatial isotropy, ⟨v_x²⟩ = ⟨v_y²⟩ = ⟨v_z²⟩ = ⅓⟨v²⟩.',
        keyPrinciple: 'Spatial Isotropy'
      },
      {
        stepNumber: 4,
        title: 'Connecting Molecular Kinetic Energy to Temperature',
        latex: 'P V = \\frac{2}{3} N \\left( \\frac{1}{2} m \\langle v^2 \\rangle \\right) = \\frac{2}{3} N \\left( \\frac{3}{2} k_B T \\right) = N k_B T = n R T',
        explanation: 'Substituting thermal kinetic energy gives the universal equation of state.',
        keyPrinciple: 'Equipartition of Energy'
      }
    ],
    finalEquationLatex: 'P \\cdot V = n \\cdot R \\cdot T',
    physicalSignificance: 'Bridges macroscopic thermodynamics (P, V, T) with statistical microscopic mechanics, showing temperature is average kinetic energy per particle.'
  }
};
