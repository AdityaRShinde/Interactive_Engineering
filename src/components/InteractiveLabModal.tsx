import React, { useState, useEffect, useMemo } from 'react';
import { Formula, UserMasteryData, RearrangementForm, UserCustomDefinition } from '../types';
import { Engineering2DLab } from './simulations/Engineering2DLab';
import { SensitivityGraph } from './simulations/SensitivityGraph';
import { MathView } from './MathView';
import { 
  X, Play, Pause, RotateCcw, Sliders, Layers, Sparkles, 
  HelpCircle, Check, Copy, CheckCheck, Compass, TrendingUp,
  FileText, ExternalLink, ChevronDown, ChevronUp, Settings2, RefreshCw,
  BookOpen, Video, Info, Hash, CheckCircle2, AlertTriangle,
  Lightbulb, ArrowRight, Plus, Trash2, Award, Zap,
  GraduationCap, Trophy, Target, Brain, Wand2, Send, CheckSquare
} from 'lucide-react';
import { detectUnitCategory, getAvailableUnits, convertValue, UNIT_DATABASE } from '../utils/unitConverter';
import { calculateFormulaOutput, calculateRearrangedValue } from '../utils/formulaCalculator';
import { CompetitiveExamQuestion } from '../types';
import confetti from 'canvas-confetti';

interface InteractiveLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: Formula | null;
  onSelectFormula?: (id: string) => void;
  userMastery?: UserMasteryData;
  onUpdateMastery?: (formulaId: string, updates: Partial<UserMasteryData[string]>) => void;
  onOpenAITutor?: (formula: Formula) => void;
}

export const InteractiveLabModal: React.FC<InteractiveLabModalProps> = ({
  isOpen,
  onClose,
  formula,
  userMastery,
  onUpdateMastery,
  onOpenAITutor,
}) => {
  // Active interactive parameter state (base units)
  const [interactiveValues, setInteractiveValues] = useState<Record<string, number>>({});
  // User-selected custom units per variable (e.g. { 'L': 'cm', 'F': 'kN' })
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [outputUnit, setOutputUnit] = useState<string>(formula?.simulation?.outputUnit || '');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [copiedFormula, setCopiedFormula] = useState<boolean>(false);
  
  // Tabs for the Right Panel / Viewer
  const [activeTab, setActiveTab] = useState<'simulation' | 'graph' | 'theory' | 'practice' | 'definitions' | 'youtube' | 'whatif'>('simulation');

  // Rearrangement mode
  const [activeRearrangementIndex, setActiveRearrangementIndex] = useState<number>(-1);
  const [calculatorInputs, setCalculatorInputs] = useState<Record<string, number>>({});
  
  // Track last modified variable and result animation pulse
  const [lastChangedVar, setLastChangedVar] = useState<string | null>(null);
  const [isResultPulsing, setIsResultPulsing] = useState<boolean>(false);

  // Prediction challenge state
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [predictionRevealed, setPredictionRevealed] = useState<boolean>(false);

  // Practice problem state (legacy single problem)
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [practiceStatus, setPracticeStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // AI-Driven Competitive Exam Practice Tab State
  const [quizExamType, setQuizExamType] = useState<string>('GATE / ESE Engineering');
  const [quizDifficulty, setQuizDifficulty] = useState<string>('All Difficulties');
  const [quizFilterType, setQuizFilterType] = useState<'all' | 'MCQ' | 'NAT'>('all');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizGenerationStatus, setQuizGenerationStatus] = useState<string>('');
  const [quizList, setQuizList] = useState<CompetitiveExamQuestion[]>([]);
  const [selectedOption, setSelectedOption] = useState<Record<string, number>>({});
  const [numericalInputs, setNumericalInputs] = useState<Record<string, string>>({});
  const [questionResults, setQuestionResults] = useState<Record<string, { status: 'correct' | 'incorrect'; feedback: string }>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [sessionXp, setSessionXp] = useState<number>(0);

  // Custom User Definitions
  const [customDefinitions, setCustomDefinitions] = useState<UserCustomDefinition[]>([]);
  const [isAddingDefinition, setIsAddingDefinition] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newSymbol, setNewSymbol] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('');
  const [newDefText, setNewDefText] = useState<string>('');

  // Load custom definitions from localStorage
  useEffect(() => {
    if (!formula) return;
    try {
      const saved = localStorage.getItem(`custom_defs_${formula.id}`);
      if (saved) {
        setCustomDefinitions(JSON.parse(saved));
      } else {
        setCustomDefinitions([]);
      }
    } catch {
      setCustomDefinitions([]);
    }
  }, [formula?.id]);

  const handleSaveCustomDefinition = () => {
    if (!formula || !newTerm.trim() || !newDefText.trim()) return;
    const item: UserCustomDefinition = {
      id: Date.now().toString(),
      term: newTerm.trim(),
      symbol: newSymbol.trim() || undefined,
      unit: newUnit.trim() || undefined,
      definition: newDefText.trim(),
      createdAt: new Date().toLocaleDateString()
    };
    const updated = [...customDefinitions, item];
    setCustomDefinitions(updated);
    try {
      localStorage.setItem(`custom_defs_${formula.id}`, JSON.stringify(updated));
    } catch {}
    setNewTerm('');
    setNewSymbol('');
    setNewUnit('');
    setNewDefText('');
    setIsAddingDefinition(false);
  };

  const handleDeleteCustomDefinition = (id: string) => {
    if (!formula) return;
    const updated = customDefinitions.filter(d => d.id !== id);
    setCustomDefinitions(updated);
    try {
      localStorage.setItem(`custom_defs_${formula.id}`, JSON.stringify(updated));
    } catch {}
  };

  // Initialize interactive parameter defaults
  useEffect(() => {
    if (!formula) return;
    const initialValues: Record<string, number> = {};
    const initialUnits: Record<string, string> = {};

    if (formula.simulation?.customInputs && Array.isArray(formula.simulation.customInputs)) {
      formula.simulation.customInputs.forEach(input => {
        initialValues[input.id] = input.defaultValue;
        initialUnits[input.id] = input.unit || '';
      });
    } else if (formula.variables && Array.isArray(formula.variables)) {
      formula.variables.forEach(v => {
        initialValues[v.symbol] = v.defaultValue ?? 10;
        initialUnits[v.symbol] = v.unit || '';
      });
    }

    setInteractiveValues(initialValues);
    setSelectedUnits(initialUnits);
    setOutputUnit(formula.simulation?.outputUnit || '');
    setCalculatorInputs({ ...initialValues });
    setActiveRearrangementIndex(-1);
    setSelectedPrediction(null);
    setPredictionRevealed(false);
    setPracticeStatus('idle');
    setUserAnswer('');
    setSimTime(0);
    setIsPlaying(true);
  }, [formula]);

  // Handle animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime(prev => prev + 0.05 * simSpeed);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Trigger smooth result pulse animation when calculated value changes
  useEffect(() => {
    setIsResultPulsing(true);
    const timer = setTimeout(() => setIsResultPulsing(false), 300);
    return () => clearTimeout(timer);
  }, [interactiveValues, outputUnit, activeRearrangementIndex, calculatorInputs]);

  // Handle value change for a variable slider (standard formula mode)
  const handleSliderChange = (varKey: string, displayVal: number) => {
    setLastChangedVar(varKey);
    setInteractiveValues(prev => ({
      ...prev,
      [varKey]: displayVal
    }));
    setCalculatorInputs(prev => ({
      ...prev,
      [varKey]: displayVal
    }));
  };

  // Handle value change for rearranged formula inputs
  const handleRearrangementInputChange = (inputSymbol: string, val: number) => {
    setLastChangedVar(inputSymbol);
    setCalculatorInputs(prev => ({
      ...prev,
      [inputSymbol]: val
    }));
  };

  // Handle Unit Change for a variable (e.g. changing Length from m to cm)
  const handleVariableUnitChange = (varKey: string, newUnit: string) => {
    setLastChangedVar(varKey);
    const currentUnit = selectedUnits[varKey] || '';
    if (!currentUnit || currentUnit === newUnit) {
      setSelectedUnits(prev => ({ ...prev, [varKey]: newUnit }));
      return;
    }

    const currentDisplayVal = interactiveValues[varKey] ?? 10;
    const converted = convertValue(currentDisplayVal, currentUnit, newUnit);
    
    setSelectedUnits(prev => ({ ...prev, [varKey]: newUnit }));
    setInteractiveValues(prev => ({ ...prev, [varKey]: Number(converted.toFixed(4)) }));
  };

  // Preset loader
  const handleApplyPreset = (presetValues: Record<string, number>) => {
    setLastChangedVar(null);
    setInteractiveValues(prev => ({
      ...prev,
      ...presetValues
    }));
    setCalculatorInputs(prev => ({
      ...prev,
      ...presetValues
    }));
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ffdd00', '#d8573f', '#000000']
    });
  };

  const handleReset = () => {
    if (!formula) return;
    setSimTime(0);
    setLastChangedVar(null);
    const defaults: Record<string, number> = {};
    if (formula.simulation?.customInputs && Array.isArray(formula.simulation.customInputs)) {
      formula.simulation.customInputs.forEach(i => { defaults[i.id] = i.defaultValue; });
    } else if (formula.variables && Array.isArray(formula.variables)) {
      formula.variables.forEach(v => { defaults[v.symbol] = v.defaultValue ?? 10; });
    }
    setInteractiveValues(defaults);
    setCalculatorInputs({ ...defaults });
    setActiveRearrangementIndex(-1);
  };

  const handleCopyEquation = () => {
    if (!formula) return;
    const activeRearr = activeRearrangementIndex >= 0 && formula.rearrangements?.[activeRearrangementIndex];
    const textToCopy = activeRearr ? (activeRearr.latex || activeRearr.plain) : (formula.formulaLatex || formula.formulaPlain || '');
    navigator.clipboard.writeText(textToCopy);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // Calculate default formula output
  const calculatedOutput = useMemo(() => {
    return calculateFormulaOutput(formula, interactiveValues, outputUnit);
  }, [formula, interactiveValues, outputUnit]);

  // Active Rearrangement details
  const activeRearrangement: RearrangementForm | undefined = useMemo(() => {
    if (!formula || activeRearrangementIndex < 0 || !formula.rearrangements) return undefined;
    return formula.rearrangements[activeRearrangementIndex];
  }, [formula, activeRearrangementIndex]);

  // Calculate solved rearrangement value
  const solvedRearrangementValue = useMemo(() => {
    if (!activeRearrangement) return calculatedOutput;
    return calculateRearrangedValue(activeRearrangement, calculatorInputs, calculatedOutput);
  }, [activeRearrangement, calculatorInputs, calculatedOutput]);

  // Verify Prediction Handler
  const handleVerifyPrediction = (opt: { value: number; isCorrect: boolean; reason: string }) => {
    setSelectedPrediction(opt.value);
    setPredictionRevealed(true);
    if (opt.isCorrect) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2a7a4c', '#ffdd00', '#000000']
      });
      if (formula && onUpdateMastery) {
        onUpdateMastery(formula.id, {
          status: 'practiced',
          solvedPracticeCount: (userMastery?.[formula.id]?.solvedPracticeCount || 0) + 1
        });
      }
    }
  };

  // Check Practice Drill Handler
  const handleCheckPractice = () => {
    if (!formula || !formula.practiceProblems?.[0]) return;
    const p = formula.practiceProblems[0];
    const userNum = parseFloat(userAnswer);
    if (isNaN(userNum)) return;

    const tol = p.tolerance || 0.05;
    const isCorrect = Math.abs(userNum - p.correctAnswer) <= (Math.abs(p.correctAnswer) * tol + 0.0001);

    if (isCorrect) {
      setPracticeStatus('correct');
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#2a7a4c', '#d8573f', '#ffdd00']
      });
      if (onUpdateMastery) {
        onUpdateMastery(formula.id, {
          status: 'mastered',
          solvedPracticeCount: (userMastery?.[formula.id]?.solvedPracticeCount || 0) + 1
        });
      }
    } else {
      setPracticeStatus('incorrect');
    }
  };

  // Sync and initialize quizList when formula changes
  useEffect(() => {
    if (!formula) return;
    if (formula.competitiveExamQuestions && formula.competitiveExamQuestions.length > 0) {
      setQuizList(formula.competitiveExamQuestions);
    } else {
      // Dynamic rich fallback questions synthesized from current formula theory
      const v1 = formula.variables?.[0] || { symbol: 'X', name: 'Primary Driver', unit: 'SI', defaultValue: 10 };
      const v2 = formula.variables?.[1] || { symbol: 'Y', name: 'Boundary Dimension', unit: 'm', defaultValue: 5 };
      const rearr = formula.rearrangements?.[0];

      const initialDrill: CompetitiveExamQuestion[] = [
        {
          id: `init-mcq-${formula.id}`,
          exam: 'GATE 2025 Comprehensive Drill',
          topic: formula.topic || 'Governing Law & Proportionality',
          difficulty: 'Medium',
          type: 'MCQ',
          question: `In a physical system modeled by "${formula.name}" (${formula.formulaPlain || ''}), if ${v1.name} (${v1.symbol}) is increased by a factor of 2 while holding all other boundary variables fixed, what is the theoretical change in the governing output?`,
          options: [
            'A: The output scales linearly (doubles by 100%)',
            'B: The output quadruples (scales by 4×)',
            'C: The output is halved (50% reduction)',
            'D: The output remains invariant under steady-state assumptions'
          ],
          correctOptionIndex: 0,
          explanation: `Inspection of the governing equation ${formula.formulaPlain || formula.name} shows direct linear dependency on ${v1.symbol}. Scaling ${v1.symbol} by 2× doubles the output value directly.`,
          shortcutTrick: 'Write the proportionality relationship (y ∝ xⁿ) before computing numbers to save precious exam time.',
          conceptTested: 'Proportional scaling and dimensional sensitivity'
        },
        {
          id: `init-nat-${formula.id}`,
          exam: 'JEE Advanced / NCEES FE',
          topic: formula.topic || 'Quantitative Problem Solving',
          difficulty: 'Advanced',
          type: 'NAT',
          question: `Given standard test conditions where ${v1.symbol} = ${v1.defaultValue || 20} ${v1.unit || ''} and ${v2.symbol} = ${v2.defaultValue || 5} ${v2.unit || ''}, calculate the exact magnitude of the response. (Provide answer in standard base units).`,
          correctNumericalValue: Number(((v1.defaultValue || 20) / (v2.defaultValue || 5)).toFixed(2)),
          tolerance: 0.1,
          unit: formula.simulation?.outputUnit || 'SI Units',
          explanation: `Substitute given variables: ${v1.symbol} = ${v1.defaultValue || 20} and ${v2.symbol} = ${v2.defaultValue || 5} into ${formula.formulaPlain || formula.name} to obtain ${Number(((v1.defaultValue || 20) / (v2.defaultValue || 5)).toFixed(2))}.`,
          shortcutTrick: rearr ? `Using rearrangement ${rearr.plain} simplifies isolating the target parameter immediately.` : 'Always verify unit prefix conversions before multiplying.',
          conceptTested: 'Direct algebraic evaluation & SI unit consistency'
        },
        {
          id: `init-trap-${formula.id}`,
          exam: 'ESE / IES Challenger',
          topic: formula.topic || 'Boundary Conditions & Traps',
          difficulty: 'Challenger',
          type: 'MCQ',
          question: `Which critical engineering constraint represents the most frequent trap when evaluating ${formula.name} (${formula.formulaPlain || ''}) in high-precision designs?`,
          options: [
            `A: ${formula.commonMistakes?.[0] || 'Assuming infinite linear elasticity beyond yield points'}`,
            'B: Mixing non-coherent engineering sub-units without SI conversion',
            'C: Neglecting non-steady transient dissipative losses',
            'D: All of the above are fundamental design pitfalls'
          ],
          correctOptionIndex: 3,
          explanation: `Engineering analysis requires verifying all governing assumptions: ${formula.assumptions?.join('; ') || 'steady state, linear elasticity, and homogeneous medium'}. Overlooking boundary constraints leads to structural failure in real-world systems.`,
          shortcutTrick: 'When exam questions present multi-physics constraints, verify whether ideal assumptions are violated.',
          conceptTested: 'Engineering assumptions and practical safety margins'
        }
      ];
      setQuizList(initialDrill);
    }

    // Reset user quiz state on formula switch
    setSelectedOption({});
    setNumericalInputs({});
    setQuestionResults({});
    setRevealedHints({});
    setRevealedSolutions({});
  }, [formula]);

  // AI Quiz Generator Caller
  const handleGenerateAIQuiz = async (examStyle?: string, diff?: string) => {
    if (!formula) return;
    setIsGeneratingQuiz(true);
    setQuizGenerationStatus('Synthesizing formula theory, boundary limits, and exam traps...');
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula,
          examType: examStyle || quizExamType,
          difficulty: diff || quizDifficulty,
          count: 3
        })
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuizList(data.questions);
        setSelectedOption({});
        setNumericalInputs({});
        setQuestionResults({});
        setRevealedHints({});
        setRevealedSolutions({});
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Failed to generate AI quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
      setQuizGenerationStatus('');
    }
  };

  // Handle MCQ Answer Submission
  const handleSubmitMCQ = (q: CompetitiveExamQuestion, optionIdx: number) => {
    setSelectedOption(prev => ({ ...prev, [q.id]: optionIdx }));
    const isCorrect = optionIdx === (q.correctOptionIndex ?? 0);

    setQuestionResults(prev => ({
      ...prev,
      [q.id]: {
        status: isCorrect ? 'correct' : 'incorrect',
        feedback: isCorrect 
          ? `✓ Correct! Mastered this ${q.exam || 'Competitive'} concept. (+100 XP)` 
          : `✗ Incorrect option selected. Check the step-by-step solution below.`
      }
    }));

    if (isCorrect) {
      setSessionXp(prev => prev + 100);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2a7a4c', '#ffdd00', '#d8573f']
      });
      if (formula && onUpdateMastery) {
        const curCount = userMastery?.[formula.id]?.solvedPracticeCount || 0;
        onUpdateMastery(formula.id, {
          status: curCount >= 2 ? 'mastered' : 'practiced',
          solvedPracticeCount: curCount + 1,
          lastPracticed: new Date().toISOString()
        });
      }
    }
  };

  // Handle NAT (Numerical) Answer Submission
  const handleSubmitNAT = (q: CompetitiveExamQuestion) => {
    const inputVal = numericalInputs[q.id];
    if (inputVal === undefined || inputVal.trim() === '') return;
    const userNum = parseFloat(inputVal);
    if (isNaN(userNum)) return;

    const targetVal = q.correctNumericalValue ?? 0;
    const tolPercent = q.tolerance ?? 0.05;
    const allowedDelta = Math.abs(targetVal) * tolPercent + 0.0001;
    const isCorrect = Math.abs(userNum - targetVal) <= allowedDelta;

    setQuestionResults(prev => ({
      ...prev,
      [q.id]: {
        status: isCorrect ? 'correct' : 'incorrect',
        feedback: isCorrect
          ? `✓ Spot-on calculation! Within exact ${(tolPercent * 100).toFixed(0)}% tolerance. (+100 XP)`
          : `✗ Computed value ${userNum} is outside expected range (${(targetVal - allowedDelta).toFixed(2)} to ${(targetVal + allowedDelta).toFixed(2)} ${q.unit || ''}).`
      }
    }));

    if (isCorrect) {
      setSessionXp(prev => prev + 100);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2a7a4c', '#d8573f', '#ffdd00']
      });
      if (formula && onUpdateMastery) {
        const curCount = userMastery?.[formula.id]?.solvedPracticeCount || 0;
        onUpdateMastery(formula.id, {
          status: curCount >= 2 ? 'mastered' : 'practiced',
          solvedPracticeCount: curCount + 1,
          lastPracticed: new Date().toISOString()
        });
      }
    }
  };

  if (!isOpen || !formula) return null;

  const currentInputs = formula.simulation?.customInputs || formula.variables?.map(v => ({
    id: v.symbol,
    label: v.name,
    symbol: v.symbol,
    unit: v.unit,
    min: v.min ?? 1,
    max: v.max ?? 100,
    step: v.step ?? 1,
    defaultValue: v.defaultValue ?? 10
  })) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#faf8f0] w-full max-w-7xl h-[94vh] rounded-3xl border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] flex flex-col overflow-hidden">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-3.5 bg-white border-b-2 border-[#2b2b2b] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-[#ffdd00] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex items-center justify-center text-lg font-black shrink-0">
              🧪
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-lg sm:text-xl text-[#111827] truncate">
                  {formula.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#faf8f0] border border-[#2b2b2b] text-[#2b2b2b]">
                  {formula.subject}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff5eb] border border-[#f8c4b8] text-[#d8573f]">
                  {formula.topic}
                </span>
              </div>
              <p className="text-xs text-[#6b7280] truncate mt-0.5">
                {formula.chapter} • Interactive Simulation & Engineering Analysis Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAITutor && (
              <button
                onClick={() => onOpenAITutor(formula)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffdd00] hover:bg-[#ffea66] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] text-xs font-black text-[#111827] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Tutor</span>
              </button>
            )}

            <button
              onClick={handleCopyEquation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf8f0] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] text-xs font-bold text-[#111827] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Copy LaTeX formula"
            >
              {copiedFormula ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy LaTeX</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white hover:bg-[#d8573f] hover:text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex items-center justify-center transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY: 2-COLUMN LAYOUT ================= */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ================= LEFT PANEL: FORMULA MATH & PARAMETER CONTROLS ================= */}
          <div className="w-full lg:w-[410px] xl:w-[440px] border-b-2 lg:border-b-0 lg:border-r-2 border-[#2b2b2b] bg-white flex flex-col overflow-y-auto">
            
            <div className="p-4 space-y-4">
              {/* Formula Mathematical Display Card */}
              <div className="bg-[#faf8f0] p-4 rounded-2xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6b7280]">
                    {activeRearrangement ? `Rearranged: Solve for ${activeRearrangement.targetSymbol}` : 'Governing Equation'}
                  </span>
                  <span className="text-[10px] font-mono-tech text-[#d8573f] font-bold">
                    {formula.codeName || formula.id}
                  </span>
                </div>

                <div className="py-2 px-3 bg-white rounded-xl border border-[#e5e7eb] flex items-center justify-center min-h-[60px] overflow-x-auto shadow-2xs">
                  {activeRearrangement ? (
                    <MathView latex={activeRearrangement.latex} block />
                  ) : (
                    <MathView latex={formula.formulaLatex || formula.formulaPlain} block />
                  )}
                </div>

                {/* Live Variable Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {currentInputs.map((input) => {
                    const isChanged = lastChangedVar === input.id;
                    const curVal = interactiveValues[input.id] ?? input.defaultValue;
                    const curUnit = selectedUnits[input.id] || input.unit;
                    return (
                      <span 
                        key={input.id}
                        className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full border transition-all duration-200 ${
                          isChanged 
                            ? 'bg-[#ffdd00] border-[#2b2b2b] font-black shadow-xs scale-105' 
                            : 'bg-white border-[#e5e7eb] text-[#6b7280]'
                        }`}
                      >
                        {input.symbol} = {curVal} {curUnit}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* REARRANGEMENT PARAMETER FEATURE ("SOLVE FOR") */}
              {/* ---------------------------------------------------- */}
              {formula.rearrangements && formula.rearrangements.length > 0 && (
                <div className="bg-[#faf8f0] p-3.5 rounded-2xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-[#d8573f]" />
                      <span className="font-display font-black text-xs text-[#111827] uppercase tracking-wider">
                        Formula Rearrangement
                      </span>
                    </div>
                    {activeRearrangementIndex >= 0 && (
                      <button
                        onClick={() => setActiveRearrangementIndex(-1)}
                        className="text-[10px] font-bold text-[#d8573f] hover:underline cursor-pointer"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-[#6b7280]">
                    Select any variable to isolate and solve for its exact value algebraically:
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setActiveRearrangementIndex(-1)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                        activeRearrangementIndex === -1
                          ? 'bg-[#2b2b2b] text-white border-[#2b2b2b] shadow-xs'
                          : 'bg-white hover:bg-[#faf8f0] border-[#e5e7eb] text-[#111827]'
                      }`}
                    >
                      Default ({formula.simulation?.outputLabel.split('(')[0] || 'Standard'})
                    </button>
                    {formula.rearrangements.map((rearr, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveRearrangementIndex(idx)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                          activeRearrangementIndex === idx
                            ? 'bg-[#d8573f] text-white border-[#d8573f] shadow-xs'
                            : 'bg-white hover:bg-[#faf8f0] border-[#e5e7eb] text-[#111827]'
                        }`}
                      >
                        Solve for {rearr.targetSymbol}
                      </button>
                    ))}
                  </div>

                  {/* Rearrangement Active Info Box */}
                  {activeRearrangement && (
                    <div className="bg-[#fff5eb] p-3 rounded-xl border border-[#f8c4b8] space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#d8573f]">
                          Target: {activeRearrangement.targetName} ({activeRearrangement.targetSymbol})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#f8c4b8] font-bold text-[#d8573f]">
                          {activeRearrangement.resultUnit}
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-[#f8c4b8] text-center">
                        <MathView latex={activeRearrangement.latex} block />
                      </div>

                      <p className="text-[11px] text-[#6b7280] leading-relaxed">
                        {activeRearrangement.description}
                      </p>

                      {/* Solved Target Readout in Rearrangement Box */}
                      <div className="bg-white p-2.5 rounded-xl border border-[#f8c4b8] flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-bold text-[#6b7280]">
                          Solved {activeRearrangement.targetSymbol}:
                        </span>
                        <span className="font-mono-tech font-black text-base text-[#d8573f]">
                          {typeof solvedRearrangementValue === 'number'
                            ? solvedRearrangementValue.toLocaleString(undefined, { maximumFractionDigits: 4 })
                            : solvedRearrangementValue} {activeRearrangement.resultUnit}
                        </span>
                      </div>

                      {/* Required inputs for Rearrangement */}
                      {activeRearrangement.requiredInputs && activeRearrangement.requiredInputs.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-[#f8c4b8]/50">
                          <div className="text-[10px] font-bold uppercase text-[#6b7280]">
                            Rearrangement Inputs:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {activeRearrangement.requiredInputs.map((sym) => {
                              const vItem = formula.variables?.find(v => v.symbol === sym);
                              const curVal = calculatorInputs[sym] ?? (interactiveValues[sym] ?? (vItem?.defaultValue ?? 10));
                              return (
                                <div key={sym} className="bg-white p-2 rounded-lg border border-[#e5e7eb] space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold font-mono-tech text-[#111827]">{sym}</span>
                                    <span className="text-[10px] text-[#6b7280]">{vItem?.unit || ''}</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={curVal}
                                    onChange={(e) => handleRearrangementInputChange(sym, parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 bg-[#faf8f0] border border-[#e5e7eb] rounded text-xs font-mono-tech font-bold focus:outline-none focus:border-[#d8573f]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* INTERACTIVE PARAMETER SLIDERS */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#2b2b2b]" />
                    <span className="font-display font-black text-xs text-[#111827] uppercase tracking-wider">
                      Interactive Variables
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#6b7280] hover:text-[#111827] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentInputs.map((input) => {
                    const curVal = interactiveValues[input.id] ?? input.defaultValue;
                    const curUnit = selectedUnits[input.id] || input.unit;
                    const isHighlighted = lastChangedVar === input.id;
                    const availableUnits = getAvailableUnits(input.unit);

                    return (
                      <div 
                        key={input.id}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                          isHighlighted 
                            ? 'bg-[#fffdf0] border-[#d8573f] shadow-[2px_2px_0px_#d8573f]' 
                            : 'bg-[#faf8f0] border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <label className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-white border border-[#2b2b2b] flex items-center justify-center font-mono-tech text-[11px] font-bold">
                              {input.symbol}
                            </span>
                            <span>{input.label}</span>
                          </label>

                          <div className="flex items-center gap-1.5">
                            {/* Direct numeric input */}
                            <input
                              type="number"
                              value={curVal}
                              onChange={(e) => handleSliderChange(input.id, parseFloat(e.target.value) || 0)}
                              className="w-18 px-1.5 py-0.5 bg-white border border-[#2b2b2b] rounded-lg text-xs font-mono-tech font-bold text-[#111827] text-right focus:outline-none focus:ring-1 focus:ring-[#d8573f]"
                            />

                            {/* Unit selector dropdown */}
                            {availableUnits.length > 1 ? (
                              <select
                                value={curUnit}
                                onChange={(e) => handleVariableUnitChange(input.id, e.target.value)}
                                className="px-1.5 py-0.5 bg-white border border-[#2b2b2b] rounded-lg text-[11px] font-bold text-[#111827] focus:outline-none cursor-pointer"
                              >
                                {availableUnits.map(u => (
                                  <option key={u.symbol} value={u.symbol}>
                                    {u.symbol}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] font-mono-tech text-[#6b7280] font-bold px-1">
                                {curUnit}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Slider control */}
                        <input
                          type="range"
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          value={curVal}
                          onChange={(e) => handleSliderChange(input.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#d8573f]"
                        />

                        <div className="flex justify-between text-[9px] text-[#6b7280] font-mono-tech mt-1">
                          <span>Min: {input.min} {curUnit}</span>
                          <span>Max: {input.max} {curUnit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* REAL WORLD ENGINEERING PRESETS */}
              {/* ---------------------------------------------------- */}
              {formula.presets && formula.presets.length > 0 && (
                <div className="bg-[#faf8f0] p-3.5 rounded-2xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffdd00] fill-current" />
                    <span className="font-display font-black text-xs text-[#111827] uppercase tracking-wider">
                      Real-World Case Presets
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {formula.presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.values)}
                        className="w-full p-2.5 bg-white hover:bg-[#fffdf0] border border-[#2b2b2b] rounded-xl text-left transition-all duration-150 hover:shadow-xs active:translate-x-0.5 active:translate-y-0.5 flex flex-col gap-0.5 cursor-pointer"
                      >
                        <div className="font-bold text-xs text-[#111827] flex items-center justify-between">
                          <span>{preset.name}</span>
                          <ArrowRight className="w-3 h-3 text-[#d8573f]" />
                        </div>
                        <p className="text-[10px] text-[#6b7280] line-clamp-1">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ================= RIGHT PANEL: MULTI-TAB VIEWER ================= */}
          <div className="flex-1 flex flex-col bg-[#faf8f0] overflow-y-auto">
            
            {/* Top Diagnostics & Live Output Readout Bar */}
            <div className="p-4 bg-white border-b-2 border-[#2b2b2b] flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              {/* Output Result Card with Smooth Animated Values */}
              <div className="flex items-center gap-3">
                <div 
                  className={`p-2.5 rounded-2xl border-2 transition-all duration-300 ease-out flex flex-col gap-1 min-w-[210px] ${
                    isResultPulsing 
                      ? 'bg-[#fff5eb] border-[#d8573f] shadow-[3px_3px_0px_#d8573f] scale-[1.02]' 
                      : 'bg-[#faf8f0] border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-[#6b7280] block">
                      {activeRearrangement 
                        ? `Solved: ${activeRearrangement.targetName}` 
                        : `Calculated (${formula.simulation?.outputLabel.split('(')[0] || 'Output'})`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded-md shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span 
                      className={`font-mono-tech font-black text-2xl sm:text-3xl tabular-nums transition-all duration-250 ease-out inline-block ${
                        isResultPulsing ? 'text-[#ff3b19] scale-105' : 'text-[#d8573f] scale-100'
                      }`}
                    >
                      {activeRearrangement ? (
                        typeof solvedRearrangementValue === 'number'
                          ? solvedRearrangementValue.toLocaleString(undefined, { maximumFractionDigits: 3 })
                          : solvedRearrangementValue
                      ) : (
                        typeof calculatedOutput === 'number' 
                          ? calculatedOutput.toLocaleString(undefined, { maximumFractionDigits: 3 }) 
                          : calculatedOutput
                      )}
                    </span>
                    
                    {/* Editable Output Unit Selector */}
                    {activeRearrangement ? (
                      <span className="font-bold text-xs text-[#111827] px-1">
                        {activeRearrangement.resultUnit}
                      </span>
                    ) : formula.simulation?.outputUnit ? (
                      <select
                        value={outputUnit}
                        onChange={(e) => setOutputUnit(e.target.value)}
                        className="px-1.5 py-0.5 bg-white border-1.5 border-[#2b2b2b] rounded-lg text-xs font-bold text-[#111827] focus:outline-none cursor-pointer hover:bg-[#faf8f0] transition-colors"
                      >
                        {getAvailableUnits(formula.simulation.outputUnit).map(u => (
                          <option key={u.symbol} value={u.symbol}>
                            {u.symbol} ({u.name})
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>

                {/* Physics Time / Animation Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-xl bg-[#2b2b2b] text-white hover:bg-[#d8573f] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => setSimSpeed(s => (s === 1.0 ? 2.0 : s === 2.0 ? 0.5 : 1.0))}
                    className="px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#2b2b2b] text-xs font-bold text-[#111827] shadow-[2px_2px_0px_#2b2b2b] hover:bg-[#faf8f0] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    title="Simulation playback speed"
                  >
                    {simSpeed}x
                  </button>
                </div>
              </div>

              {/* Viewer Navigation Tabs */}
              <div className="flex items-center gap-1 bg-[#faf8f0] p-1 rounded-xl border border-[#e5e7eb] flex-wrap">
                {[
                  { id: 'simulation', label: '🧪 2D Simulation', icon: Compass },
                  { id: 'graph', label: '📈 Graph', icon: TrendingUp },
                  { id: 'theory', label: '📖 Theory & Proofs', icon: BookOpen },
                  { id: 'definitions', label: '📑 Definitions', icon: Info },
                  { id: 'youtube', label: '🎥 YouTube Reference', icon: Video },
                  { id: 'whatif', label: '✨ What-If & Predict', icon: Lightbulb }
                ].map(t => {
                  const IconComp = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#2b2b2b] text-white shadow-xs'
                          : 'text-[#6b7280] hover:text-[#111827] hover:bg-white/60'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================= TAB 1: 2D SIMULATION CANVAS ================= */}
            {activeTab === 'simulation' && (
              <div className="p-4 flex-1 flex flex-col min-h-[380px]">
                <div className="flex-1 bg-white border-2 border-[#2b2b2b] rounded-2xl shadow-[3px_3px_0px_#2b2b2b] overflow-hidden flex flex-col p-2 transition-all duration-200">
                  <Engineering2DLab
                    formula={formula}
                    values={interactiveValues}
                    onValueChange={handleSliderChange}
                    calculatedValue={typeof calculatedOutput === 'number' ? calculatedOutput : 10}
                    isPlaying={isPlaying}
                    simTime={simTime}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onReset={handleReset}
                    highlightedVariable={lastChangedVar || undefined}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB 2: SENSITIVITY GRAPH ================= */}
            {activeTab === 'graph' && (
              <div className="p-4 flex-1">
                <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-4 shadow-[3px_3px_0px_#2b2b2b] h-full flex flex-col transition-all duration-200">
                  <SensitivityGraph
                    formula={formula}
                    currentValues={interactiveValues}
                    calculatedValue={typeof calculatedOutput === 'number' ? calculatedOutput : 10}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB 3: THEORY, PROOFS & PRACTICE ================= */}
            {activeTab === 'theory' && (
              <div className="p-4 flex-1 space-y-4">
                
                {/* Governing Assumptions */}
                {formula.assumptions && formula.assumptions.length > 0 && (
                  <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-2.5">
                    <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2a7a4c]" />
                      <span>Governing Assumptions & Validity Limits</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#6b7280]">
                      {formula.assumptions.map((asm, i) => (
                        <li key={i} className="flex items-start gap-2 bg-[#f2f8f4] p-2.5 rounded-xl border border-[#d0ebd9]">
                          <span className="text-[#2a7a4c] font-bold">✓</span>
                          <span className="text-[#111827]">{asm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Engineering Pitfalls & Exam Traps */}
                {formula.commonMistakes && formula.commonMistakes.length > 0 && (
                  <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-2.5">
                    <div className="font-display font-black text-xs text-[#d8573f] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#d8573f]" />
                      <span>Common Pitfalls & Exam Traps</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#d8573f]">
                      {formula.commonMistakes.map((mis, i) => (
                        <li key={i} className="flex items-start gap-2 bg-[#fff5eb] p-2.5 rounded-xl border border-[#f8c4b8]">
                          <span className="font-bold">⚠</span>
                          <span>{mis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dimensional Consistency Proof */}
                {formula.dimensionalAnalysis && (
                  <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                    <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-[#ffdd00] border border-[#2b2b2b] flex items-center justify-center text-[10px] font-black">
                        SI
                      </span>
                      <span>Dimensional Consistency Analysis</span>
                    </div>

                    <div className="bg-[#faf8f0] p-3.5 rounded-xl border border-[#e5e7eb] space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-[#6b7280]">Equation Form:</span>
                        <div className="font-mono-tech font-bold text-[#111827] mt-0.5">
                          {formula.dimensionalAnalysis.equation || formula.formulaPlain}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-[#6b7280]">Units Breakdown:</span>
                        <div className="font-mono-tech text-[#d8573f] font-bold mt-0.5">
                          {formula.dimensionalAnalysis.unitsBreakdown} = <span className="text-green-700">{formula.dimensionalAnalysis.finalUnit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solved Textbook Examples */}
                {(formula.solvedExamples || []).map((example, idx) => (
                  <div key={idx} className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-2.5">
                    <div className="font-display font-black text-xs text-[#d8573f] uppercase tracking-wider">
                      Textbook Solved Example #{idx + 1}
                    </div>
                    <p className="font-bold text-sm text-[#111827]">
                      {example.question}
                    </p>
                    <div className="bg-[#faf8f0] p-3.5 rounded-xl border border-[#e5e7eb] space-y-1.5 text-xs">
                      <div><strong className="text-[#111827]">Formula Used:</strong> <span className="font-mono-tech text-[#d8573f] font-bold">{example.formulaUsed}</span></div>
                      <div><strong className="text-[#111827]">Substitution:</strong> <span className="font-mono-tech text-[#4b5563]">{example.substitution}</span></div>
                      <div><strong className="text-[#111827]">Calculation:</strong> <span className="font-mono-tech text-[#4b5563]">{example.calculation}</span></div>
                      <div className="pt-1 border-t border-[#e5e7eb] font-bold text-[#111827]">
                        Final Answer: <span className="text-green-700 font-mono-tech font-black text-sm">{example.finalAnswer} {example.unit}</span>
                      </div>
                    </div>
                    {example.explanation && (
                      <p className="text-xs text-[#6b7280] italic">
                        {example.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {/* Interactive Practice Drill Problem */}
                {formula.practiceProblems?.[0] && (
                  <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                    <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#ffdd00] fill-current" />
                        <span>Interactive Practice Challenge (100 XP)</span>
                      </div>
                      {practiceStatus === 'correct' && (
                        <span className="text-green-700 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#111827] font-medium leading-relaxed">
                      {formula.practiceProblems[0].question}
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Enter numerical answer"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#faf8f0] border-2 border-[#2b2b2b] rounded-xl text-xs font-bold font-mono-tech text-[#111827] focus:outline-none focus:border-[#d8573f]"
                      />
                      <button
                        onClick={handleCheckPractice}
                        className="px-5 py-2 bg-[#2b2b2b] hover:bg-[#d8573f] text-white rounded-xl text-xs font-black shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer"
                      >
                        Submit & Verify
                      </button>
                    </div>

                    {practiceStatus === 'correct' && (
                      <div className="bg-[#f2f8f4] border border-[#d0ebd9] p-3 rounded-xl text-xs text-[#2a7a4c] font-bold animate-in fade-in">
                        ✓ Correct! You mastered this formula's calculation. (+100 XP)
                      </div>
                    )}

                    {practiceStatus === 'incorrect' && (
                      <div className="bg-[#fff5eb] border border-[#f8c4b8] p-3 rounded-xl text-xs text-[#d8573f] animate-in fade-in space-y-1">
                        <div className="font-bold">✗ Not quite right.</div>
                        <p className="text-[11px] text-[#6b7280]">
                          Hint: {formula.practiceProblems[0].hint}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* ================= TAB 4: DEFINITIONS & GLOSSARY ================= */}
            {activeTab === 'definitions' && (
              <div className="p-4 flex-1 space-y-4">
                
                {/* Variable Glossary Table */}
                <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                  <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#d8573f]" />
                    <span>Variables & Symbol Definitions</span>
                  </div>

                  <div className="space-y-2">
                    {(formula.variables || []).map((v) => (
                      <div key={v.symbol} className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                            <span className="font-mono-tech px-2 py-0.5 rounded-md bg-white border border-[#2b2b2b] text-[#111827] text-xs font-black">
                              {v.symbol}
                            </span>
                            <span>{v.name}</span>
                          </div>
                          <p className="text-xs text-[#6b7280] mt-1">
                            {v.description || `${v.name} measured in SI units.`}
                          </p>
                        </div>
                        <span className="text-xs font-mono-tech font-bold text-[#6b7280] px-2.5 py-1 bg-white rounded-lg border border-[#e5e7eb] shrink-0">
                          {v.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical, Material & Mathematical Constants */}
                <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                  <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-[#2a7a4c]" />
                    <span>Governing Physical & Material Constants</span>
                  </div>

                  <div className="space-y-2">
                    {(formula.constants && formula.constants.length > 0) ? (
                      formula.constants.map((c, i) => (
                        <div key={i} className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                              <span className="font-mono-tech px-2 py-0.5 rounded-md bg-white border border-[#e5e7eb] text-[#d8573f] text-xs font-bold">
                                {c.symbol}
                              </span>
                              <span>{c.name}</span>
                            </div>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">
                              {c.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono-tech font-bold text-xs text-[#111827]">{c.value}</div>
                            <div className="text-[10px] text-[#6b7280] font-mono-tech">{c.unit}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Universal Fallback Constants */
                      <div className="space-y-2">
                        <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                              <span className="font-mono-tech px-2 py-0.5 rounded-md bg-white border border-[#e5e7eb] text-[#d8573f] text-xs font-bold">g</span>
                              <span>Gravitational Acceleration</span>
                            </div>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">Standard Earth surface acceleration</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono-tech font-bold text-xs text-[#111827]">9.80665</div>
                            <div className="text-[10px] text-[#6b7280] font-mono-tech">m/s²</div>
                          </div>
                        </div>
                        <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                              <span className="font-mono-tech px-2 py-0.5 rounded-md bg-white border border-[#e5e7eb] text-[#d8573f] text-xs font-bold">E (Steel)</span>
                              <span>Young's Modulus of Structural Steel</span>
                            </div>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">Typical engineering structural steel elasticity</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono-tech font-bold text-xs text-[#111827]">200</div>
                            <div className="text-[10px] text-[#6b7280] font-mono-tech">GPa</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Custom Definitions Section */}
                <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#ffdd00]" />
                      <span>Custom Study Notes & Definitions</span>
                    </div>
                    <button
                      onClick={() => setIsAddingDefinition(!isAddingDefinition)}
                      className="px-2.5 py-1 bg-[#ffdd00] hover:bg-[#ffea66] border border-[#2b2b2b] rounded-lg text-xs font-bold text-[#111827] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Term</span>
                    </button>
                  </div>

                  {/* Add Definition Form */}
                  {isAddingDefinition && (
                    <div className="bg-[#faf8f0] p-3.5 rounded-xl border border-[#2b2b2b] space-y-2.5 animate-in fade-in">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Term / Concept name"
                          value={newTerm}
                          onChange={(e) => setNewTerm(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg text-xs font-bold text-[#111827] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Symbol (e.g. θ)"
                          value={newSymbol}
                          onChange={(e) => setNewSymbol(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg text-xs font-mono-tech text-[#111827] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Unit (e.g. rad)"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg text-xs font-mono-tech text-[#111827] focus:outline-none"
                        />
                      </div>
                      <textarea
                        placeholder="Detailed physical meaning or study note..."
                        value={newDefText}
                        onChange={(e) => setNewDefText(e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg text-xs text-[#111827] focus:outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAddingDefinition(false)}
                          className="px-3 py-1 bg-white border border-[#e5e7eb] rounded-lg text-xs font-bold text-[#6b7280] hover:text-[#111827] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCustomDefinition}
                          className="px-4 py-1 bg-[#2b2b2b] hover:bg-[#d8573f] text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Save Definition
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Custom Definitions */}
                  {customDefinitions.length > 0 ? (
                    <div className="space-y-2">
                      {customDefinitions.map((item) => (
                        <div key={item.id} className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                              {item.symbol && (
                                <span className="font-mono-tech px-2 py-0.5 rounded-md bg-white border border-[#e5e7eb] text-[#d8573f] text-xs font-bold">
                                  {item.symbol}
                                </span>
                              )}
                              <span>{item.term}</span>
                              {item.unit && (
                                <span className="text-[10px] font-mono-tech text-[#6b7280] px-1.5 py-0.2 bg-white rounded border border-[#e5e7eb]">
                                  {item.unit}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6b7280] mt-1">
                              {item.definition}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteCustomDefinition(item.id)}
                            className="text-[#6b7280] hover:text-[#d8573f] p-1 cursor-pointer"
                            title="Delete custom definition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6b7280] italic">
                      No custom study notes yet. Click "+ Add Term" to record personal observations and exam definitions.
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* ================= TAB 5: YOUTUBE REFERENCES ================= */}
            {activeTab === 'youtube' && (
              <div className="p-4 flex-1 space-y-4">
                <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                  <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#d8573f]" />
                    <span>Curated Video Lectures & Engineering Demonstrations</span>
                  </div>

                  {(formula.videoReferences && formula.videoReferences.length > 0) ? (
                    <div className="space-y-3">
                      {formula.videoReferences.map((vid, idx) => (
                        <div key={idx} className="bg-[#faf8f0] border-2 border-[#2b2b2b] rounded-2xl p-4 space-y-2.5 shadow-xs">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-sm text-[#111827]">{vid.title}</h4>
                              <p className="text-xs text-[#6b7280] mt-0.5">
                                {vid.channel} • {vid.duration || 'Lecture Video'}
                              </p>
                            </div>
                            <a
                              href={vid.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#ffdd00] hover:bg-[#ffea66] text-[#111827] rounded-xl text-xs font-black flex items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all shrink-0 cursor-pointer"
                            >
                              <span>Watch on YouTube</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <p className="text-xs text-[#4b5563] leading-relaxed">
                            {vid.description}
                          </p>

                          {/* Key Timestamps */}
                          {vid.timestamps && vid.timestamps.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#e5e7eb]">
                              <span className="text-[10px] font-bold uppercase text-[#6b7280]">Key Timestamps:</span>
                              {vid.timestamps.map((t, ti) => (
                                <a
                                  key={ti}
                                  href={`${vid.youtubeUrl}&t=${t.time.replace(':', 'm')}s`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 bg-white hover:bg-[#fff5eb] border border-[#e5e7eb] hover:border-[#d8573f] rounded-lg text-[11px] font-mono-tech text-[#111827] transition-colors"
                                >
                                  {t.time} - {t.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback Search Links */
                    <div className="bg-[#faf8f0] border-2 border-[#2b2b2b] rounded-2xl p-5 text-center space-y-3">
                      <p className="text-xs text-[#6b7280]">
                        Looking for video lectures on <strong>{formula.name}</strong>?
                      </p>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(formula.name + ' engineering physics explanation derivation')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffdd00] hover:bg-[#ffea66] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] rounded-xl text-xs font-black text-[#111827] transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-[#d8573f]" />
                        <span>Search YouTube Lectures for "{formula.name}"</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 6: WHAT-IF SCENARIOS & PREDICT ================= */}
            {activeTab === 'whatif' && (
              <div className="p-4 flex-1 space-y-4">
                
                {/* Physical Prediction Challenge */}
                {formula.predictionChallenge && (
                  <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                    <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#ffdd00] fill-current" />
                      <span>Physical Behavior Prediction Challenge</span>
                    </div>

                    <div className="bg-[#faf8f0] p-3.5 rounded-xl border border-[#e5e7eb] text-xs font-bold text-[#111827]">
                      {formula.predictionChallenge.question}
                    </div>

                    <div className="space-y-2">
                      {formula.predictionChallenge.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={predictionRevealed}
                          onClick={() => handleVerifyPrediction(opt)}
                          className={`w-full p-3 text-left text-xs rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                            selectedPrediction === opt.value
                              ? opt.isCorrect
                                ? 'bg-[#f2f8f4] border-[#2a7a4c] text-[#2a7a4c] font-bold shadow-xs'
                                : 'bg-[#fff5eb] border-[#d8573f] text-[#d8573f] font-bold shadow-xs'
                              : 'bg-white border-[#e5e7eb] hover:bg-[#faf8f0] text-[#111827]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {predictionRevealed && opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-[#2a7a4c]" />
                          )}
                        </button>
                      ))}
                    </div>

                    {predictionRevealed && (
                      <div className={`p-3.5 rounded-xl text-xs border ${
                        formula.predictionChallenge.options.find(o => o.value === selectedPrediction)?.isCorrect
                          ? 'bg-[#f2f8f4] border-[#d0ebd9] text-[#2a7a4c]'
                          : 'bg-[#fff5eb] border-[#f8c4b8] text-[#d8573f]'
                      }`}>
                        <div className="font-bold mb-1">
                          {formula.predictionChallenge.options.find(o => o.value === selectedPrediction)?.isCorrect
                            ? '✓ Correct Physical Prediction (+50 XP)'
                            : '✗ Physical Feedback'}
                        </div>
                        <p className="text-[11px] text-[#4b5563]">
                          {formula.predictionChallenge.options.find(o => o.value === selectedPrediction)?.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* What-If Scenarios List */}
                {(formula.whatIfScenarios && formula.whatIfScenarios.length > 0) && (
                  <div className="bg-white border-2 border-[#2b2b2b] rounded-2xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
                    <div className="font-display font-black text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-[#ffdd00] fill-current" />
                      <span>What-If Engineering Hypotheses</span>
                    </div>

                    <div className="space-y-3">
                      {formula.whatIfScenarios.map((scen, idx) => (
                        <div key={idx} className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-[#111827]">{scen.title}</h4>
                            <button
                              onClick={() => handleApplyPreset(scen.targetValues)}
                              className="px-2.5 py-1 bg-[#2b2b2b] hover:bg-[#d8573f] text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Apply Scenario
                            </button>
                          </div>
                          <p className="text-xs text-[#6b7280]">
                            {scen.prompt}
                          </p>
                          <div className="bg-white p-2 rounded-lg border border-[#e5e7eb] text-[11px] text-[#111827] font-medium">
                            <strong className="text-[#d8573f]">Physical Insight:</strong> {scen.insight}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
