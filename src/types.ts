export type EducationLevel = 
  | 'class-1-4'
  | 'class-5-8'
  | 'class-9-10'
  | 'class-11-12'
  | 'diploma'
  | 'engineering'
  | 'professional';

export type SubjectCategory = 
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'mechanical'
  | 'civil'
  | 'electrical'
  | 'electronics'
  | 'computer-science'
  | 'biomedical'
  | 'aerospace';

export type UnitSystem = 'SI' | 'MKS' | 'Imperial';

export interface VariableItem {
  symbol: string;
  name: string;
  unit: string;
  dimension?: string;
  description?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export type Variable = VariableItem;

export interface SolvedExample {
  question: string;
  given: Record<string, string>;
  formulaUsed: string;
  substitution: string;
  calculation: string;
  finalAnswer: string;
  unit: string;
  explanation?: string;
}

export interface ConceptQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PracticeProblem {
  id: string;
  question: string;
  givenValues: Record<string, number>;
  targetVariable: string;
  correctAnswer: number;
  unit: string;
  tolerance?: number;
  hint: string;
  solutionSteps: string[];
}

export type SimulationType = 
  | 'force-mass-acceleration'
  | 'normal-stress-axial'
  | 'bending-moment-beam'
  | 'beam-deflection-elastic'
  | 'torsional-shear-shaft'
  | 'bending-stress-beam'
  | 'euler-column-buckling'
  | 'hydrostatic-fluid-pressure'
  | 'bernoulli-fluid-flow'
  | 'projectile-motion'
  | 'area-circle'
  | 'pythagorean-theorem'
  | 'ohms-law'
  | 'electrical-power'
  | 'hookes-law-spring'
  | 'kinetic-energy'
  | 'ideal-gas-law'
  | 'thermal-conduction'
  | 'shannon-entropy'
  | 'binary-conversion'
  | 'generic-interactive';

export interface SimulationConfig {
  type: SimulationType;
  primaryVariable: string;
  secondaryVariable?: string;
  tertiaryVariable?: string;
  outputLabel: string;
  outputUnit: string;
  formulaCode: string;
  customInputs?: {
    id: string;
    label: string;
    symbol: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  }[];
}

export interface RelationshipItem {
  variable: string;
  direction: 'increase' | 'decrease';
  resultEffect: string;
  mathExpression: string;
}

export interface DimensionalAnalysis {
  equation: string;
  unitsBreakdown: string;
  finalUnit: string;
  isConsistent: boolean;
  notes?: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  values: Record<string, number>;
}

export interface WhatIfItem {
  title: string;
  prompt: string;
  targetValues: Record<string, number>;
  outcomeText: string;
  insight: string;
}

export interface PredictionChallenge {
  question: string;
  paramToChange: string;
  newValue: number;
  options: {
    label: string;
    value: number;
    isCorrect: boolean;
    reason: string;
  }[];
}

export interface FormulaConstant {
  symbol: string;
  name: string;
  value: string | number;
  unit: string;
  description: string;
  category?: 'physical' | 'material' | 'mathematical';
}

export interface VideoReference {
  title: string;
  channel: string;
  youtubeUrl: string;
  embedId?: string;
  duration?: string;
  description: string;
  timestamps?: { time: string; label: string }[];
}

export interface RearrangementForm {
  targetSymbol: string;
  targetName: string;
  latex: string;
  plain: string;
  description: string;
  requiredInputs: string[];
  resultUnit: string;
  calculate?: (inputs: Record<string, number>) => number;
}

export interface DerivationStep {
  stepNumber: number;
  title: string;
  latex: string;
  explanation: string;
  keyPrinciple?: string;
  mathNotes?: string;
}

export interface FormulaDerivation {
  title: string;
  startingPrinciples: string[];
  assumptions: string[];
  steps: DerivationStep[];
  finalEquationLatex: string;
  physicalSignificance: string;
}

export interface CompetitiveExamQuestion {
  id: string;
  exam: string; // e.g. 'GATE ME', 'GATE CE', 'GATE EE', 'NCEES FE Exam', 'PE Exam', 'JEE Advanced', 'ESE / IES'
  year?: string;
  topic: string;
  difficulty: 'Foundation' | 'Medium' | 'Advanced' | 'Challenger';
  question: string;
  type: 'MCQ' | 'NAT';
  options?: string[];
  correctOptionIndex?: number;
  correctNumericalValue?: number;
  tolerance?: number;
  unit?: string;
  explanation: string;
  shortcutTrick?: string;
  conceptTested: string;
}

export interface UserCustomDefinition {
  id: string;
  term: string;
  definition: string;
  unit?: string;
  symbol?: string;
  createdAt: string;
}

export interface Formula {
  id: string;
  name: string;
  codeName?: string;
  topic: string;
  chapter: string;
  subject: SubjectCategory;
  level: EducationLevel[];
  formulaLatex: string;
  formulaPlain: string;
  derivationSummary?: string;
  realWorldApplication: string;
  variables: VariableItem[];
  simulation: SimulationConfig;
  solvedExamples: SolvedExample[];
  conceptQuestions: ConceptQuestion[];
  practiceProblems: PracticeProblem[];
  prerequisites: string[];
  relatedFormulaIds: string[];
  diagramDescription: string;
  categoryAccentColor?: string;
  isVerified?: boolean;
  thinkingTrace?: string[];
  
  // Professional Engineering Fields
  relationships?: RelationshipItem[];
  assumptions?: string[];
  commonMistakes?: string[];
  dimensionalAnalysis?: DimensionalAnalysis;
  scenarioPresets?: ScenarioPreset[];
  whatIfScenarios?: WhatIfItem[];
  predictionChallenge?: PredictionChallenge;

  // Rearrangements, Derivations, Competitive Exam Quizzes & References
  rearrangements?: RearrangementForm[];
  derivationDetail?: FormulaDerivation;
  competitiveExamQuestions?: CompetitiveExamQuestion[];
  constants?: FormulaConstant[];
  videoReferences?: VideoReference[];
}

export type ActiveTab = 'controls' | 'derivation' | 'graph' | 'theory' | 'competitive' | 'whatif' | 'predict' | 'reference';

export type ViewMode = 
  | 'explore'
  | 'library'
  | 'detail'
  | 'practice'
  | 'notebook'
  | 'coverage';

export type MasteryLevel = 'discovered' | 'understood' | 'practiced' | 'mastered';

export interface UserMasteryData {
  [formulaId: string]: {
    status: MasteryLevel;
    solvedPracticeCount: number;
    lastPracticed?: string;
    notes?: string;
    isBookmarked?: boolean;
  };
}

export interface UserStats {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  masteredCount: number;
}
