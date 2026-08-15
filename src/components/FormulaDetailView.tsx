import React, { useState, useEffect, useRef } from 'react';
import { Formula, UserMasteryData, ActiveTab, RearrangementForm, UserCustomDefinition, UnitSystem } from '../types';
import { Engineering2DLab } from './simulations/Engineering2DLab';
import { SensitivityGraph } from './simulations/SensitivityGraph';
import { MathView } from './MathView';
import { 
  ArrowLeft, ArrowRight, Bookmark, CheckCircle2, 
  Sliders, TrendingUp, Sparkles, BookOpen, AlertTriangle,
  Play, RotateCcw, HelpCircle, Check, Award, Compass, Layers, CheckCircle,
  Calculator, Youtube, Plus, Trash2, ExternalLink, Hash, Info, FileText,
  ArrowRightLeft, Globe, Settings2, GraduationCap, Trophy, Split, CheckSquare
} from 'lucide-react';
import { getAvailableUnits, convertValue } from '../utils/unitConverter';
import { calculateFormulaOutput, calculateRearrangedValue } from '../utils/formulaCalculator';
import confetti from 'canvas-confetti';

interface FormulaDetailViewProps {
  formula: Formula;
  onBack: () => void;
  onSelectFormula: (id: string) => void;
  userMastery: UserMasteryData;
  onUpdateMastery: (formulaId: string, updates: Partial<UserMasteryData[string]>) => void;
  onAddXP: (amount: number) => void;
  onOpenAITutor: (formula: Formula) => void;
  allFormulas: Formula[];
}

export const FormulaDetailView: React.FC<FormulaDetailViewProps> = ({
  formula,
  onBack,
  userMastery,
  onUpdateMastery,
  onAddXP
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('controls');
  const [interactiveValues, setInteractiveValues] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  
  // Custom Unit Selector State
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [selectedOutputUnit, setSelectedOutputUnit] = useState<string>(
    formula.simulation?.outputUnit || formula.variables?.[0]?.unit || 'Units'
  );

  // Initialize selected units from formula variables
  useEffect(() => {
    const unitsMap: Record<string, string> = {};
    if (formula.simulation?.customInputs) {
      formula.simulation.customInputs.forEach(inp => {
        unitsMap[inp.id] = inp.unit || '';
      });
    } else if (formula.variables) {
      formula.variables.forEach(v => {
        unitsMap[v.symbol] = v.unit || '';
      });
    }
    setSelectedUnits(unitsMap);
    setSelectedOutputUnit(formula.simulation?.outputUnit || 'Units');
  }, [formula]);

  const handleUnitChange = (varId: string, newUnit: string) => {
    const currentUnit = selectedUnits[varId];
    if (!currentUnit || currentUnit === newUnit) {
      setSelectedUnits(prev => ({ ...prev, [varId]: newUnit }));
      return;
    }

    const currentVal = interactiveValues[varId] ?? 10;
    const converted = convertValue(currentVal, currentUnit, newUnit);

    setSelectedUnits(prev => ({ ...prev, [varId]: newUnit }));
    setInteractiveValues(prev => ({ ...prev, [varId]: converted }));
    setCalculatorInputs(prev => ({ ...prev, [varId]: converted }));
  };
  
  // Rearrangement / Calculator Mode State
  const [activeRearrangementIndex, setActiveRearrangementIndex] = useState<number>(-1); // -1 is standard/default formula
  const [calculatorInputs, setCalculatorInputs] = useState<Record<string, number>>({});
  const [highlightedTargetSymbol, setHighlightedTargetSymbol] = useState<string | undefined>(undefined);

  // Prediction State
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [predictionRevealed, setPredictionRevealed] = useState<boolean>(false);
  const [predictionCorrect, setPredictionCorrect] = useState<boolean>(false);

  // Practice State
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [practiceStatus, setPracticeStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // Competitive Exam Quiz State
  const [selectedExamAnswers, setSelectedExamAnswers] = useState<Record<string, number | string>>({});
  const [examAnswerFeedback, setExamAnswerFeedback] = useState<Record<string, { isCorrect: boolean; showExplanation: boolean }>>({});
  const [activeExamFilter, setActiveExamFilter] = useState<string>('All');

  const handleSelectMCQOption = (qId: string, optionIndex: number, correctIndex: number) => {
    setSelectedExamAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    const isCorrect = optionIndex === correctIndex;
    setExamAnswerFeedback(prev => ({
      ...prev,
      [qId]: { isCorrect, showExplanation: true }
    }));
    if (isCorrect) {
      onAddXP(100);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleCheckNATAnswer = (qId: string, correctVal: number, tolerance: number = 0.1) => {
    const inputStr = String(selectedExamAnswers[qId] ?? '').trim();
    const num = parseFloat(inputStr);
    if (isNaN(num)) return;
    const isCorrect = Math.abs(num - correctVal) <= (tolerance || 0.1);
    setExamAnswerFeedback(prev => ({
      ...prev,
      [qId]: { isCorrect, showExplanation: true }
    }));
    if (isCorrect) {
      onAddXP(150);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }
  };

  // Custom User Definitions (Reference Tab)
  const [customDefinitions, setCustomDefinitions] = useState<UserCustomDefinition[]>([]);
  const [isAddingDefinition, setIsAddingDefinition] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newSymbol, setNewSymbol] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('');
  const [newDefText, setNewDefText] = useState<string>('');

  const animFrameRef = useRef<number | null>(null);

  // Load custom definitions from localStorage
  useEffect(() => {
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
  }, [formula.id]);

  const handleSaveCustomDefinition = () => {
    if (!newTerm.trim() || !newDefText.trim()) return;
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
    const updated = customDefinitions.filter(d => d.id !== id);
    setCustomDefinitions(updated);
    try {
      localStorage.setItem(`custom_defs_${formula.id}`, JSON.stringify(updated));
    } catch {}
  };

  // Initialize interactive parameter defaults
  useEffect(() => {
    const initial: Record<string, number> = {};
    if (formula.simulation?.customInputs && Array.isArray(formula.simulation.customInputs)) {
      formula.simulation.customInputs.forEach(input => {
        initial[input.id] = input.defaultValue;
      });
    } else if (formula.variables && Array.isArray(formula.variables)) {
      formula.variables.forEach(v => {
        initial[v.symbol] = v.defaultValue ?? 10;
      });
    }
    setInteractiveValues(initial);
    setCalculatorInputs(initial);
    setActiveRearrangementIndex(-1);
    setHighlightedTargetSymbol(undefined);
    setSelectedPrediction(null);
    setPredictionRevealed(false);
    setPracticeStatus('idle');
    setUserAnswer('');
  }, [formula.id]);

  // Real-time animation loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setSimTime(prev => prev + dt);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const currentMastery = userMastery[formula.id] || {
    status: 'discovered',
    solvedPracticeCount: 0,
    isBookmarked: false
  };

  const toggleBookmark = () => {
    onUpdateMastery(formula.id, {
      isBookmarked: !currentMastery.isBookmarked
    });
  };

  const handleSliderChange = (id: string, val: number) => {
    setInteractiveValues(prev => ({
      ...prev,
      [id]: val
    }));
    setCalculatorInputs(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleResetSim = () => {
    setSimTime(0);
    const initial: Record<string, number> = {};
    if (formula.simulation?.customInputs && Array.isArray(formula.simulation.customInputs)) {
      formula.simulation.customInputs.forEach(input => {
        initial[input.id] = input.defaultValue;
      });
    } else if (formula.variables && Array.isArray(formula.variables)) {
      formula.variables.forEach(v => {
        initial[v.symbol] = v.defaultValue ?? 10;
      });
    }
    setInteractiveValues(initial);
    setCalculatorInputs(initial);
    setActiveRearrangementIndex(-1);
    setHighlightedTargetSymbol(undefined);
  };

  const handlePresetSelect = (presetValues: Record<string, number>) => {
    setInteractiveValues(presetValues);
    setCalculatorInputs(presetValues);
  };

  // Calculated output evaluation for standard formula
  const calculatedValue = calculateFormulaOutput(formula, interactiveValues, selectedOutputUnit);

  // Calculated value when rearrangement mode is selected
  const activeRearrangement: RearrangementForm | undefined = 
    activeRearrangementIndex >= 0 && formula.rearrangements 
      ? formula.rearrangements[activeRearrangementIndex] 
      : undefined;

  const calculatedRearrangementValue = calculateRearrangedValue(
    activeRearrangement,
    calculatorInputs,
    calculatedValue
  );

  const handleSelectRearrangement = (idx: number) => {
    setActiveRearrangementIndex(idx);
    if (idx >= 0 && formula.rearrangements && formula.rearrangements[idx]) {
      const target = formula.rearrangements[idx].targetSymbol;
      setHighlightedTargetSymbol(target);
    } else {
      setHighlightedTargetSymbol(undefined);
    }
  };

  const handleCalculatorInputChange = (sym: string, val: number) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [sym]: val
    }));
    // Sync into simulation if applicable
    setInteractiveValues(prev => ({
      ...prev,
      [sym]: val
    }));
  };

  // Handle What-If Trigger
  const handleApplyWhatIf = (targetValues: Record<string, number>) => {
    setInteractiveValues(targetValues);
    setCalculatorInputs(targetValues);
  };

  // Handle Prediction Submission
  const handleVerifyPrediction = (option: { isCorrect: boolean; value: number }) => {
    setSelectedPrediction(option.value);
    setPredictionRevealed(true);
    setPredictionCorrect(option.isCorrect);

    if (option.isCorrect) {
      onAddXP(50);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // Handle Practice Problem Check
  const handleCheckPractice = () => {
    const practice = formula.practiceProblems?.[0];
    if (!practice) return;

    const numAnswer = parseFloat(userAnswer);
    const tol = practice.tolerance || 0.1;
    const isCorrect = Math.abs(numAnswer - practice.correctAnswer) <= tol;

    if (isCorrect) {
      setPracticeStatus('correct');
      onAddXP(100);
      onUpdateMastery(formula.id, {
        status: 'mastered',
        solvedPracticeCount: (currentMastery.solvedPracticeCount || 0) + 1
      });
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else {
      setPracticeStatus('incorrect');
    }
  };

  return (
    <div id="formula-detail-workspace" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bmac-card p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 bg-[#ffffff] hover:bg-[#faf8f0] text-[#000000] text-xs font-bold rounded-full flex items-center gap-1.5 border border-[#e5e7eb] transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#d8573f]" />
            <span>Formulas Catalog</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faf8f0] text-[#000000] px-2.5 py-0.5 rounded-full border border-[#e5e7eb]">
                {formula.subject}
              </span>
              <h1 className="font-display font-black text-base sm:text-lg text-[#000000] leading-tight">
                {formula.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Unit System Selector (SI, MKS, Imperial) */}
          <div className="flex items-center gap-1 bg-[#faf8f0] px-2.5 py-1 rounded-full border border-[#e5e7eb]">
            <Globe className="w-3.5 h-3.5 text-[#d8573f]" />
            <span className="text-[11px] font-bold text-[#717171] hidden sm:inline">Unit System:</span>
            <div className="flex items-center gap-0.5">
              {(['SI', 'MKS', 'Imperial'] as UnitSystem[]).map((sys) => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => setUnitSystem(sys)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    unitSystem === sys
                      ? 'bg-[#000000] text-white shadow-xs'
                      : 'text-[#717171] hover:text-[#000000] hover:bg-white'
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Presets Selector */}
          {formula.scenarioPresets && formula.scenarioPresets.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#717171] hidden sm:inline font-medium">Scenario:</span>
              <select
                onChange={(e) => {
                  const selected = formula.scenarioPresets?.find(p => p.id === e.target.value);
                  if (selected) handlePresetSelect(selected.values);
                }}
                className="px-3 py-1 bg-[#ffffff] border border-[#e5e7eb] rounded-full font-bold text-[#000000] focus:outline-none focus:border-[#000000] text-xs shadow-xs"
              >
                {(formula.scenarioPresets || []).map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-full border text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
              currentMastery.isBookmarked
                ? 'bg-[#ffffff] border-[#d8573f] text-[#d8573f]'
                : 'bg-white border-[#e5e7eb] text-[#717171] hover:bg-[#faf8f0]'
            }`}
            title="Save to Notebook"
          >
            <Bookmark className={`w-4 h-4 ${currentMastery.isBookmarked ? 'fill-[#d8573f] text-[#d8573f]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Window (Left: Simulation | Right: Tabbed Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ==================================================== */}
        {/* LEFT PANE: 2D Interactive Physics Lab Simulation */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="h-[430px] sm:h-[490px]">
            <Engineering2DLab
              formula={formula}
              values={interactiveValues}
              onValueChange={handleSliderChange}
              calculatedValue={calculatedValue}
              simTime={simTime}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={handleResetSim}
              highlightedVariable={highlightedTargetSymbol}
            />
          </div>

          {/* Dynamic Takeaway Banner in BuyMeACoffee style */}
          <div className="bmac-card p-4 flex items-start gap-3 bg-white">
            <div className="w-8 h-8 rounded-full bg-[#ffdd00] text-[#000000] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Compass className="w-4 h-4 fill-current" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-[#000000] uppercase tracking-wider text-[11px]">
                Engineering Physical Insight
              </div>
              <p className="text-[#717171] font-medium leading-relaxed">
                {formula.relationships?.[0]?.resultEffect || 'Real-time 2D vector and physical simulation dynamically updates with parameter changes.'}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT PANE: Sliders, Rearrangement, What-If, Predict, Graph, Theory, & Reference */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 bmac-card bg-white flex flex-col overflow-hidden">
          {/* Navigation Pill Tabs */}
          <div className="flex items-center border-b border-[#e5e7eb] bg-[#faf8f0] p-2 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'controls'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sliders & Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'theory'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory</span>
            </button>

            <button
              onClick={() => setActiveTab('derivation')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'derivation'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#2a7a4c]" />
              <span>Derivation & Proof</span>
            </button>

            <button
              onClick={() => setActiveTab('competitive')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'competitive'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#d8573f]" />
              <span>Exam Quizzes</span>
              {(formula.competitiveExamQuestions?.length ?? 0) > 0 && (
                <span className="px-1.5 py-0.2 bg-[#ffdd00] text-[#000000] text-[10px] font-black rounded-full">
                  {formula.competitiveExamQuestions?.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('whatif')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'whatif'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d8573f]" />
              <span>What If?</span>
            </button>

            <button
              onClick={() => setActiveTab('predict')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'predict'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ffdd00]" />
              <span>Predict</span>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'graph'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2a7a4c]" />
              <span>Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('reference')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === 'reference'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#717171] hover:text-[#000000] hover:bg-[#ffffff]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#d8573f]" />
              <span>Reference</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto">
            {/* ---------------------------------------------------- */}
            {/* TAB 1: PARAMETER CONTROLS & REARRANGEABLE CALCULATOR */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                {/* Rearrangement Target Variable Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#000000]">
                    <span className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-[#d8573f]" />
                      Formula Rearranger (Solve For):
                    </span>
                    <span className="text-[10px] text-[#717171] font-normal">
                      Click any variable to rearrange
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Default standard formula pill */}
                    <button
                      onClick={() => handleSelectRearrangement(-1)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                        activeRearrangementIndex === -1
                          ? 'bg-[#000000] text-white border-[#000000] shadow-xs'
                          : 'bg-[#faf8f0] text-[#222222] border-[#e5e7eb] hover:bg-[#ffffff]'
                      }`}
                    >
                      Default: {formula.simulation?.outputLabel.split('(')[0] || 'Standard'}
                    </button>

                    {/* Formula specific rearrangements */}
                    {(formula.rearrangements || []).map((rearr, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectRearrangement(i)}
                        className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                          activeRearrangementIndex === i
                            ? 'bg-[#ffdd00] text-[#000000] border-[#f7d046] shadow-xs'
                            : 'bg-[#faf8f0] text-[#222222] border-[#e5e7eb] hover:bg-[#ffffff]'
                        }`}
                      >
                        Solve {rearr.targetSymbol} ({rearr.targetName})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Governing Equation Box */}
                <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-3.5 text-center">
                  <div className="text-[10px] text-[#717171] uppercase tracking-wider font-bold mb-1">
                    {activeRearrangement ? `Rearranged for ${activeRearrangement.targetName}` : 'Active Governing Equation'}
                  </div>
                  <div className="text-xl font-black text-[#000000]">
                    <MathView 
                      math={activeRearrangement ? activeRearrangement.latex : formula.formulaLatex} 
                      displayMode={true} 
                    />
                  </div>
                  {activeRearrangement && (
                    <div className="text-xs text-[#717171] mt-1.5 font-medium">
                      {activeRearrangement.description}
                    </div>
                  )}
                </div>

                {/* Unified Parameter Sliders (Dynamic inputs based on active formula / rearrangement) */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center justify-between">
                    <span>
                      {activeRearrangement ? `Required Inputs for ${activeRearrangement.targetSymbol}:` : 'Interactive Variables:'}
                    </span>
                    <span className="text-[10px] text-[#717171] font-normal">
                      Real-Time Dynamic Evaluation
                    </span>
                  </div>

                  {(() => {
                    // Compute the active input fields: if rearrangement is chosen, show its required inputs
                    const inputsToRender = activeRearrangement
                      ? (activeRearrangement.requiredInputs || []).map(sym => {
                          const v = (formula.variables || []).find(item => item.symbol === sym || item.symbol.toLowerCase() === sym.toLowerCase() || item.name.toLowerCase().includes(sym.toLowerCase()))
                            || (formula.simulation?.customInputs || []).find(ci => ci.symbol === sym || ci.id === sym);
                          
                          const defaultVal = v?.defaultValue ?? (sym === 'A' ? 0.05 : sym === 'I' ? 16 : sym === 'P' || sym === 'F' ? 100 : 10);
                          const min = v?.min ?? (sym === 'A' ? 0.005 : sym === 'I' ? 1 : 1);
                          const max = v?.max ?? (sym === 'A' ? 0.2 : sym === 'I' ? 100 : 300);
                          const step = v?.step ?? (sym === 'A' ? 0.005 : sym === 'I' ? 0.5 : 1);
                          const unit = v?.unit || (formula.simulation?.customInputs || []).find(ci => ci.symbol === sym)?.unit || '';

                          return {
                            id: sym,
                            label: v?.name || sym,
                            symbol: sym,
                            unit: unit,
                            min,
                            max,
                            step,
                            defaultValue: defaultVal
                          };
                        })
                      : (formula.simulation?.customInputs || (formula.variables || []).map(v => ({
                          id: v.symbol,
                          label: v.name,
                          symbol: v.symbol,
                          unit: v.unit,
                          min: v.min ?? 1,
                          max: v.max ?? 100,
                          step: v.step ?? 1,
                          defaultValue: v.defaultValue ?? 10
                        })));

                    return inputsToRender.map((input) => {
                      const currentVal = interactiveValues[input.id] ?? calculatorInputs[input.id] ?? input.defaultValue;
                      const activeUnit = selectedUnits[input.id] || input.unit || '';
                      const availableUnits = getAvailableUnits(input.unit || '');

                      return (
                        <div key={input.id} className="space-y-1 bg-[#faf8f0] p-3 rounded-2xl border border-[#e5e7eb]">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[#000000]">
                              {input.label} ({input.symbol})
                            </span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={currentVal}
                                onChange={(e) => handleSliderChange(input.id, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 bg-white border border-[#e5e7eb] rounded-full text-right font-bold text-[#000000] focus:outline-none focus:border-[#000000] text-xs shadow-xs"
                              />
                              {availableUnits.length > 1 ? (
                                <select
                                  value={activeUnit}
                                  onChange={(e) => handleUnitChange(input.id, e.target.value)}
                                  className="text-xs font-bold text-[#d8573f] bg-white border border-[#e5e7eb] rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer"
                                  title="Change unit"
                                >
                                  {availableUnits.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[#717171] text-xs font-bold">{activeUnit || input.unit}</span>
                              )}
                            </div>
                          </div>

                          <input
                            type="range"
                            min={input.min}
                            max={input.max}
                            step={input.step}
                            value={currentVal}
                            onChange={(e) => handleSliderChange(input.id, parseFloat(e.target.value) || 0)}
                            className="w-full bmac-slider"
                          />

                          <div className="flex justify-between text-[10px] text-[#717171]">
                            <span>Min: {input.min}</span>
                            <span>Max: {input.max}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Solved Output Readout Card (Updates seamlessly in-place) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  activeRearrangement 
                    ? 'bg-[#faf8f0] border-2 border-[#f7d046]' 
                    : 'bg-[#ffffff] border border-[#e5e7eb] shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
                        {activeRearrangement 
                          ? `Solved Target (${activeRearrangement.targetName || activeRearrangement.targetSymbol}):` 
                          : (formula.simulation?.outputLabel || 'Governing Output:')}
                      </div>
                      <div className="text-2xl font-black text-[#000000] mt-0.5">
                        {activeRearrangement ? (
                          <>
                            {activeRearrangement.targetSymbol} = <span className="text-[#d8573f]">{calculatedRearrangementValue.toFixed(3)}</span> {activeRearrangement.resultUnit}
                          </>
                        ) : (
                          <>
                            <span className="text-[#d8573f]">{calculatedValue.toFixed(3)}</span> {selectedOutputUnit}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-white rounded-full border border-[#e5e7eb] text-[#2a7a4c]">
                        ⚡ Continuous Solved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB: STEP-BY-STEP DERIVATION & PROOFS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'derivation' && (
              <div className="space-y-4">
                {formula.derivationDetail ? (
                  <div className="space-y-4">
                    {/* Derivation Title & Overview */}
                    <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-[#ffdd00] text-[#000000] rounded-lg">
                          <Layers className="w-4 h-4 text-[#000000]" />
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-sm text-[#000000]">
                            {formula.derivationDetail.title}
                          </h3>
                          <div className="text-[11px] text-[#717171]">
                            Rigorous analytical proof from first physical principles
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Starting Principles & Governing Assumptions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-3.5 space-y-2 shadow-xs">
                        <div className="font-bold text-xs text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#2a7a4c]" />
                          <span>Starting Physical Principles:</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#717171]">
                          {formula.derivationDetail.startingPrinciples.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#2a7a4c] font-black text-xs">▸</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-3.5 space-y-2 shadow-xs">
                        <div className="font-bold text-xs text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-[#d8573f]" />
                          <span>Governing Ideal Assumptions:</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#717171]">
                          {formula.derivationDetail.assumptions.map((a, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#d8573f] font-black text-xs">✓</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sequential Derivation Steps */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#000000]" />
                        <span>Step-by-Step Mathematical Proof ({formula.derivationDetail.steps.length} Steps):</span>
                      </div>

                      {formula.derivationDetail.steps.map((step) => (
                        <div 
                          key={step.stepNumber} 
                          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 space-y-2.5 shadow-xs transition-all hover:border-[#000000]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#000000] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {step.stepNumber}
                              </span>
                              <h4 className="font-bold text-xs text-[#000000]">
                                {step.title}
                              </h4>
                            </div>
                            {step.keyPrinciple && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#faf8f0] text-[#717171] rounded-full border border-[#e5e7eb]">
                                {step.keyPrinciple}
                              </span>
                            )}
                          </div>

                          {/* LaTeX Equation Block */}
                          <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-3 text-center overflow-x-auto">
                            <MathView math={step.latex} displayMode={true} />
                          </div>

                          {/* Physical Explanation */}
                          <p className="text-xs text-[#717171] leading-relaxed">
                            {step.explanation}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Final Result & Physical Significance Box */}
                    <div className="bg-[#faf8f0] border-2 border-[#2a7a4c] rounded-2xl p-4 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#2a7a4c]">
                        Derived Governing Law
                      </div>
                      <div className="text-xl font-black text-center text-[#000000] py-1">
                        <MathView math={formula.derivationDetail.finalEquationLatex} displayMode={true} />
                      </div>
                      <div className="text-xs text-[#222222] pt-2 border-t border-[#e5e7eb] leading-relaxed">
                        <span className="font-bold text-[#2a7a4c]">Physical Significance: </span>
                        {formula.derivationDetail.physicalSignificance}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Derivation Summary Fallback */
                  <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-4 space-y-3">
                    <div className="font-display font-bold text-sm text-[#000000] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#d8573f]" />
                      <span>Analytical Derivation: {formula.name}</span>
                    </div>
                    <div className="bg-white border border-[#e5e7eb] rounded-xl p-3 text-center">
                      <MathView math={formula.formulaLatex} displayMode={true} />
                    </div>
                    <p className="text-xs text-[#717171] leading-relaxed">
                      {formula.derivationSummary || 'Normal derivation from equilibrium and constitutive material equations.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB: COMPETITIVE EXAMS & QUIZZES */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'competitive' && (
              <div className="space-y-4">
                {/* Header with Exam Filter Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-[#d8573f]" />
                      <span>Competitive Exam Drills & Quizzes</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#2a7a4c] bg-[#f2f8f4] px-2 py-0.5 rounded-full border border-[#d0ebd9]">
                      +100-150 XP per Solve
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['All', 'GATE ME', 'GATE CE', 'GATE EE', 'NCEES FE Exam', 'PE Exam', 'JEE Advanced'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => setActiveExamFilter(ex)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-full border transition-all ${
                          activeExamFilter === ex
                            ? 'bg-[#000000] text-white border-[#000000] shadow-xs'
                            : 'bg-[#faf8f0] text-[#717171] border-[#e5e7eb] hover:bg-white hover:text-[#000000]'
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Questions List */}
                {(() => {
                  const allQuestions = formula.competitiveExamQuestions || [];
                  const filtered = activeExamFilter === 'All' 
                    ? allQuestions 
                    : allQuestions.filter(q => q.exam.toLowerCase().includes(activeExamFilter.toLowerCase()));

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-6 text-center space-y-2">
                        <GraduationCap className="w-8 h-8 text-[#717171] mx-auto opacity-50" />
                        <div className="font-bold text-xs text-[#000000]">No questions found for {activeExamFilter}</div>
                        <p className="text-[11px] text-[#717171]">
                          Try selecting 'All' to view all national & international competitive exam questions for this formula.
                        </p>
                        <button
                          onClick={() => setActiveExamFilter('All')}
                          className="px-3 py-1 bg-[#000000] text-white rounded-full text-xs font-bold shadow-xs hover:bg-[#d8573f] transition-all"
                        >
                          Show All Questions
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filtered.map((q, idx) => {
                        const feedback = examAnswerFeedback[q.id];
                        const selectedVal = selectedExamAnswers[q.id];

                        return (
                          <div 
                            key={q.id || idx} 
                            className="bg-white border border-[#e5e7eb] rounded-2xl p-4 space-y-3 shadow-xs hover:border-[#000000] transition-all"
                          >
                            {/* Question Header Badges */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 bg-[#000000] text-white rounded-full text-xs font-bold">
                                  {q.exam} {q.year ? `'${q.year}` : ''}
                                </span>
                                <span className="text-[11px] font-bold text-[#717171] bg-[#faf8f0] px-2 py-0.5 rounded-full border border-[#e5e7eb]">
                                  {q.topic}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                q.difficulty === 'Foundation' 
                                  ? 'bg-[#f2f8f4] text-[#2a7a4c] border-[#d0ebd9]' 
                                  : q.difficulty === 'Medium'
                                  ? 'bg-[#faf8f0] text-[#d8573f] border-[#f7d046]'
                                  : 'bg-[#faf0e6] text-[#d8573f] border-[#f5d5cf]'
                              }`}>
                                {q.difficulty} • {q.type}
                              </span>
                            </div>

                            {/* Question Text */}
                            <p className="text-xs text-[#000000] font-medium leading-relaxed">
                              {q.question}
                            </p>

                            {/* MCQ Options */}
                            {q.type === 'MCQ' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = selectedVal === optIdx;
                                  const isCorrect = optIdx === q.correctOptionIndex;
                                  const showState = feedback?.showExplanation;

                                  let btnClass = 'bg-[#faf8f0] border-[#e5e7eb] text-[#000000] hover:bg-[#ffffff]';
                                  if (showState) {
                                    if (isCorrect) {
                                      btnClass = 'bg-[#f2f8f4] border-[#2a7a4c] text-[#2a7a4c] font-bold';
                                    } else if (isSelected && !isCorrect) {
                                      btnClass = 'bg-[#faf0e6] border-[#d8573f] text-[#d8573f] font-bold line-through';
                                    }
                                  } else if (isSelected) {
                                    btnClass = 'bg-[#000000] text-white border-[#000000]';
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectMCQOption(q.id, optIdx, q.correctOptionIndex ?? 0)}
                                      className={`p-2.5 text-xs text-left rounded-xl border transition-all flex items-center justify-between shadow-xs ${btnClass}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-white border border-[#e5e7eb] text-[#000000] text-[10px] font-bold flex items-center justify-center shrink-0">
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span>{opt}</span>
                                      </span>
                                      {showState && isCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-[#2a7a4c] shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* NAT (Numerical Answer Type) Input */}
                            {q.type === 'NAT' && (
                              <div className="space-y-2 pt-1">
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      step="any"
                                      placeholder={`Enter numerical value in ${q.unit || 'units'}`}
                                      value={String(selectedVal ?? '')}
                                      onChange={(e) => setSelectedExamAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                      className="w-full px-3 py-2 bg-[#faf8f0] border border-[#e5e7eb] rounded-full text-xs font-bold text-[#000000] focus:outline-none focus:border-[#000000]"
                                    />
                                    {q.unit && (
                                      <span className="absolute right-3 top-2 text-[11px] font-bold text-[#717171]">
                                        {q.unit}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleCheckNATAnswer(q.id, q.correctNumericalValue ?? 0, q.tolerance ?? 0.1)}
                                    className="px-4 py-2 bg-[#000000] hover:bg-[#d8573f] text-white rounded-full text-xs font-bold transition-all shadow-xs shrink-0"
                                  >
                                    Verify Answer
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Solution & Shortcut Explanation Box */}
                            {feedback?.showExplanation && (
                              <div className={`p-3.5 rounded-2xl text-xs border space-y-2 ${
                                feedback.isCorrect 
                                  ? 'bg-[#f2f8f4] border-[#d0ebd9] text-[#2a7a4c]' 
                                  : 'bg-[#faf0e6] border-[#f5d5cf] text-[#222222]'
                              }`}>
                                <div className="flex items-center justify-between font-bold">
                                  <span className="flex items-center gap-1">
                                    {feedback.isCorrect ? (
                                      <>
                                        <CheckCircle2 className="w-4 h-4 text-[#2a7a4c]" />
                                        <span>Correct Solution! (+{q.type === 'NAT' ? '150' : '100'} XP)</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertTriangle className="w-4 h-4 text-[#d8573f]" />
                                        <span className="text-[#d8573f]">Detailed Step-by-Step Solution:</span>
                                      </>
                                    )}
                                  </span>
                                  {q.type === 'NAT' && (
                                    <span className="font-mono-tech text-[11px]">
                                      Correct = {q.correctNumericalValue} {q.unit}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-[#222222] leading-relaxed">
                                  {q.explanation}
                                </p>

                                {q.shortcutTrick && (
                                  <div className="bg-white border border-[#e5e7eb] rounded-xl p-2.5 text-[11px] text-[#000000] flex items-start gap-2 shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-[#ffdd00] shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-bold text-[#d8573f]">Exam Speed Shortcut: </span>
                                      <span>{q.shortcutTrick}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: "WHAT IF?" SCENARIOS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'whatif' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                  ✨ Instant Physical "What If?" Scenarios
                </div>
                <p className="text-xs text-[#717171]">
                  Select a hypothesis below to immediately observe physical changes in the 2D laboratory:
                </p>

                {(formula.whatIfScenarios || []).map((scenario, idx) => (
                  <div key={idx} className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-3.5 space-y-2">
                    <div className="font-display font-bold text-sm text-[#000000] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#d8573f] shrink-0" />
                      <span>{scenario.title}</span>
                    </div>
                    <p className="text-xs text-[#717171] leading-relaxed">
                      {scenario.prompt}
                    </p>
                    <div className="bg-[#ffffff] border border-[#e5e7eb] rounded-xl p-2.5 text-xs text-[#222222]">
                      <span className="font-bold text-[#d8573f]">Insight: </span>{scenario.insight}
                    </div>
                    <button
                      onClick={() => handleApplyWhatIf(scenario.targetValues)}
                      className="w-full py-2 bg-[#000000] hover:bg-[#d8573f] text-white rounded-full text-xs font-bold transition-all shadow-xs"
                    >
                      Apply Scenario →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: "PREDICT BEFORE YOU SEE" */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'predict' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#000000] uppercase tracking-wider">
                  🎯 Predict Before You See
                </div>

                {formula.predictionChallenge ? (
                  <div className="space-y-3">
                    <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-3.5 text-xs text-[#000000] font-medium leading-relaxed">
                      {formula.predictionChallenge.question}
                    </div>

                    <div className="space-y-2">
                      {formula.predictionChallenge.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={predictionRevealed}
                          onClick={() => handleVerifyPrediction(opt)}
                          className={`w-full p-3 text-left text-xs rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                            selectedPrediction === opt.value
                              ? opt.isCorrect
                                ? 'bg-[#f2f8f4] border-[#2a7a4c] text-[#2a7a4c] font-bold'
                                : 'bg-[#faf0e6] border-[#d8573f] text-[#d8573f] font-bold'
                              : 'bg-white border-[#e5e7eb] hover:bg-[#faf8f0] text-[#000000]'
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
                      <div className={`p-3.5 rounded-2xl text-xs border ${predictionCorrect ? 'bg-[#f2f8f4] border-[#d0ebd9] text-[#2a7a4c]' : 'bg-[#faf0e6] border-[#f5d5cf] text-[#d8573f]'}`}>
                        <div className="font-bold mb-1">
                          {predictionCorrect ? '✓ Correct Physical Prediction (+50 XP)' : '✗ Physical Feedback'}
                        </div>
                        <p>
                          {formula.predictionChallenge.options.find(o => o.value === selectedPrediction)?.reason}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#717171] p-4 text-center">
                    Prediction challenge is ready for this formula.
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 4: SENSITIVITY GRAPH */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'graph' && (
              <SensitivityGraph
                formula={formula}
                currentValues={interactiveValues}
                calculatedValue={calculatedValue}
              />
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 5: THEORY, ASSUMPTIONS & PRACTICE */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'theory' && (
              <div className="space-y-4 text-xs">
                {/* Direct Shortcut to Step-by-Step Derivation */}
                <div className="bg-[#faf8f0] border-2 border-[#2a7a4c] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-[#2a7a4c] text-white rounded-xl">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#000000]">
                        Analytical Derivations & Mathematical Proofs
                      </div>
                      <div className="text-[11px] text-[#717171]">
                        Explore complete step-by-step physical equations & boundary proofs
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('derivation')}
                    className="px-3.5 py-1.5 bg-[#000000] hover:bg-[#2a7a4c] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <span>View Derivation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Engineering Assumptions */}
                {formula.assumptions && formula.assumptions.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#2a7a4c]" />
                      <span>Governing Assumptions:</span>
                    </div>
                    <ul className="space-y-1 text-[#717171] pl-2">
                      {formula.assumptions.map((asm, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#2a7a4c] font-bold">✓</span>
                          <span>{asm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Engineering Mistakes */}
                {formula.commonMistakes && formula.commonMistakes.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-[#d8573f] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#d8573f]" />
                      <span>Common Pitfalls & Exam Traps:</span>
                    </div>
                    <ul className="space-y-1 text-[#d8573f] pl-2 bg-[#faf0e6] p-3 rounded-2xl border border-[#f5d5cf]">
                      {formula.commonMistakes.map((mis, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold">⚠</span>
                          <span>{mis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dimensional Analysis Proof */}
                {formula.dimensionalAnalysis && (
                  <div className="bg-[#faf8f0] border border-[#e5e7eb] rounded-2xl p-3 space-y-1">
                    <div className="font-bold text-[#000000] uppercase tracking-wider">
                      Dimensional Consistency Proof:
                    </div>
                    <div className="text-[#717171]">
                      {formula.dimensionalAnalysis.unitsBreakdown} = <span className="font-bold text-[#000000]">{formula.dimensionalAnalysis.finalUnit}</span>
                    </div>
                  </div>
                )}

                {/* Solved Example */}
                {formula.solvedExamples?.[0] && (
                  <div className="space-y-2 border-t border-[#e5e7eb] pt-3">
                    <div className="font-bold text-[#000000] uppercase tracking-wider">
                      Textbook Solved Example:
                    </div>
                    <div className="bg-[#faf8f0] p-3.5 rounded-2xl border border-[#e5e7eb] space-y-1.5 text-[#222222]">
                      <div className="font-bold text-[#000000]">{formula.solvedExamples[0].question}</div>
                      <div className="text-[#d8573f] font-black">Answer: {formula.solvedExamples[0].finalAnswer}</div>
                      <div className="text-[#717171] text-[11px]">{formula.solvedExamples[0].explanation}</div>
                    </div>
                  </div>
                )}

                {/* Interactive Practice Question */}
                {formula.practiceProblems?.[0] && (
                  <div className="space-y-2 border-t border-[#e5e7eb] pt-3">
                    <div className="font-bold text-[#000000] uppercase tracking-wider flex items-center justify-between">
                      <span>Practice Drill (100 XP):</span>
                      {practiceStatus === 'correct' && (
                        <span className="text-[#2a7a4c] flex items-center gap-1 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                        </span>
                      )}
                    </div>
                    <div className="bg-[#ffffff] p-3.5 rounded-2xl border border-[#e5e7eb] space-y-2.5 shadow-xs">
                      <p className="text-[#000000] font-medium">{formula.practiceProblems[0].question}</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Your answer"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-[#faf8f0] border border-[#e5e7eb] rounded-full text-xs font-bold text-[#000000] focus:outline-none focus:border-[#000000]"
                        />
                        <button
                          onClick={handleCheckPractice}
                          className="px-4 py-1.5 bg-[#000000] hover:bg-[#d8573f] text-white rounded-full text-xs font-bold transition-all shadow-xs"
                        >
                          Check
                        </button>
                      </div>

                      {practiceStatus === 'correct' && (
                        <div className="text-[#2a7a4c] text-xs font-bold bg-[#f2f8f4] p-2 rounded-xl border border-[#d0ebd9]">
                          ✓ Correct! You mastered this formula.
                        </div>
                      )}
                      {practiceStatus === 'incorrect' && (
                        <div className="text-[#d8573f] text-xs bg-[#faf0e6] p-2 rounded-xl border border-[#f5d5cf]">
                          ✗ Incorrect. Hint: {formula.practiceProblems[0].hint}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 6: REFERENCE TAB (Definitions, Constants & YouTube References) */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'reference' && (
              <div className="space-y-4 text-xs">
                {/* Definitions & Terminology Section */}
                <div className="space-y-2">
                  <div className="font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#d8573f]" />
                    <span>Definitions & Symbols Glossary:</span>
                  </div>

                  <div className="space-y-1.5">
                    {(formula.variables || []).map((v) => (
                      <div key={v.symbol} className="bg-[#faf8f0] border border-[#e5e7eb] rounded-xl p-2.5 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-[#000000] flex items-center gap-1.5">
                            <span className="font-mono-tech px-1.5 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-[#000000] text-[11px]">
                              {v.symbol}
                            </span>
                            <span>{v.name}</span>
                          </div>
                          <div className="text-[11px] text-[#717171] mt-0.5">
                            {v.description || `${v.name} measured in ${v.unit}`}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono-tech text-[#717171] px-2 py-0.5 bg-white rounded-full border border-[#e5e7eb] shrink-0">
                          {v.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical, Material & Mathematical Constants Section */}
                <div className="space-y-2 border-t border-[#e5e7eb] pt-3">
                  <div className="font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#2a7a4c]" />
                    <span>Governing Physical & Material Constants:</span>
                  </div>

                  <div className="space-y-1.5">
                    {(formula.constants && formula.constants.length > 0) ? (
                      formula.constants.map((c, i) => (
                        <div key={i} className="bg-[#ffffff] border border-[#e5e7eb] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                          <div>
                            <div className="font-bold text-[#000000] flex items-center gap-1.5">
                              <span className="font-mono-tech px-2 py-0.5 bg-[#faf8f0] rounded-full border border-[#e5e7eb] text-[#d8573f]">
                                {c.symbol}
                              </span>
                              <span>{c.name}</span>
                            </div>
                            <div className="text-[11px] text-[#717171] mt-0.5">
                              {c.description}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold font-mono-tech text-[#000000]">{c.value}</div>
                            <div className="text-[10px] text-[#717171]">{c.unit}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Universal Fallback Constants */
                      <div className="space-y-1.5">
                        <div className="bg-[#ffffff] border border-[#e5e7eb] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                          <div>
                            <div className="font-bold text-[#000000] flex items-center gap-1.5">
                              <span className="font-mono-tech px-2 py-0.5 bg-[#faf8f0] rounded-full border border-[#e5e7eb] text-[#d8573f]">g</span>
                              <span>Gravitational Acceleration</span>
                            </div>
                            <div className="text-[11px] text-[#717171]">Standard Earth surface acceleration</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold font-mono-tech text-[#000000]">9.80665</div>
                            <div className="text-[10px] text-[#717171]">m/s²</div>
                          </div>
                        </div>
                        <div className="bg-[#ffffff] border border-[#e5e7eb] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                          <div>
                            <div className="font-bold text-[#000000] flex items-center gap-1.5">
                              <span className="font-mono-tech px-2 py-0.5 bg-[#faf8f0] rounded-full border border-[#e5e7eb] text-[#d8573f]">E (Steel)</span>
                              <span>Young's Modulus of Structural Steel</span>
                            </div>
                            <div className="text-[11px] text-[#717171]">Typical engineering structural steel elasticity</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold font-mono-tech text-[#000000]">200</div>
                            <div className="text-[10px] text-[#717171]">GPa</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* YouTube Video References Section */}
                <div className="space-y-2 border-t border-[#e5e7eb] pt-3">
                  <div className="font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-[#d8573f]" />
                    <span>Curated Video & Lecture References:</span>
                  </div>

                  <div className="space-y-2">
                    {(formula.videoReferences && formula.videoReferences.length > 0) ? (
                      formula.videoReferences.map((vid, idx) => (
                        <div key={idx} className="bg-[#ffffff] border border-[#e5e7eb] rounded-2xl p-3 space-y-2 shadow-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-[#000000]">{vid.title}</h4>
                              <p className="text-[11px] text-[#717171]">{vid.channel} • {vid.duration || 'Video Lecture'}</p>
                            </div>
                            <a
                              href={vid.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#faf8f0] hover:bg-[#ffdd00] text-[#000000] rounded-full text-[11px] font-bold flex items-center gap-1 border border-[#e5e7eb] transition-all shrink-0"
                            >
                              <span>Watch</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <p className="text-[11px] text-[#717171] leading-relaxed">
                            {vid.description}
                          </p>

                          {/* Key Timestamps */}
                          {vid.timestamps && vid.timestamps.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] font-bold text-[#717171]">Timestamps:</span>
                              {vid.timestamps.map((t, ti) => (
                                <a
                                  key={ti}
                                  href={`${vid.youtubeUrl}&t=${t.time.replace(':', 'm')}s`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-mono-tech px-2 py-0.5 bg-[#faf8f0] hover:bg-[#ffffff] text-[#000000] rounded-full border border-[#e5e7eb]"
                                >
                                  {t.time} {t.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      /* Fallback curated video reference */
                      <div className="bg-[#ffffff] border border-[#e5e7eb] rounded-2xl p-3 space-y-1.5 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-[#000000]">Intuitive Engineering: {formula.name}</h4>
                            <p className="text-[11px] text-[#717171]">MIT OpenCourseWare / The Efficient Engineer</p>
                          </div>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(formula.name + ' engineering derivation')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-[#faf8f0] hover:bg-[#ffdd00] text-[#000000] rounded-full text-[11px] font-bold flex items-center gap-1 border border-[#e5e7eb] transition-all"
                          >
                            <span>Search</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[11px] text-[#717171]">
                          Watch university derivations, physical experiments, and real-world failure analyses.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom User Definitions & Formula Notes */}
                <div className="space-y-2 border-t border-[#e5e7eb] pt-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#d8573f]" />
                      <span>Custom Definitions & Notes:</span>
                    </div>

                    {!isAddingDefinition && (
                      <button
                        onClick={() => setIsAddingDefinition(true)}
                        className="px-2.5 py-1 bg-[#000000] hover:bg-[#d8573f] text-white rounded-full text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Note/Definition</span>
                      </button>
                    )}
                  </div>

                  {/* Add Definition Form Modal / Card */}
                  {isAddingDefinition && (
                    <div className="bg-[#faf8f0] border border-[#f7d046] rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                      <div className="font-bold text-xs text-[#000000]">Add Custom Constant or Definition:</div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Term / Name (e.g. Poisson Ratio)"
                          value={newTerm}
                          onChange={(e) => setNewTerm(e.target.value)}
                          className="col-span-2 px-2.5 py-1 bg-white border border-[#e5e7eb] rounded-xl text-xs focus:outline-none focus:border-[#000000]"
                        />
                        <input
                          type="text"
                          placeholder="Symbol (ν)"
                          value={newSymbol}
                          onChange={(e) => setNewSymbol(e.target.value)}
                          className="px-2.5 py-1 bg-white border border-[#e5e7eb] rounded-xl text-xs focus:outline-none focus:border-[#000000]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Unit (e.g. dimensionless)"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          className="col-span-3 px-2.5 py-1 bg-white border border-[#e5e7eb] rounded-xl text-xs focus:outline-none focus:border-[#000000]"
                        />
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Definition, textbook formula reference, or personal note..."
                        value={newDefText}
                        onChange={(e) => setNewDefText(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-xl text-xs focus:outline-none focus:border-[#000000]"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAddingDefinition(false)}
                          className="px-3 py-1 bg-white border border-[#e5e7eb] rounded-full text-xs font-bold text-[#717171]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCustomDefinition}
                          className="px-4 py-1 bg-[#000000] hover:bg-[#d8573f] text-white rounded-full text-xs font-bold transition-all"
                        >
                          Save Definition
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of user added definitions */}
                  {customDefinitions.length > 0 ? (
                    <div className="space-y-1.5">
                      {customDefinitions.map((d) => (
                        <div key={d.id} className="bg-[#ffffff] border border-[#e5e7eb] rounded-xl p-2.5 flex items-start justify-between gap-2 shadow-xs">
                          <div>
                            <div className="font-bold text-[#000000] flex items-center gap-1.5">
                              {d.symbol && (
                                <span className="font-mono-tech px-1.5 py-0.2 rounded-full bg-[#faf8f0] border border-[#e5e7eb] text-[#000000]">
                                  {d.symbol}
                                </span>
                              )}
                              <span>{d.term}</span>
                              {d.unit && (
                                <span className="text-[10px] text-[#717171]">({d.unit})</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#717171] mt-0.5 leading-relaxed">{d.definition}</p>
                          </div>

                          <button
                            onClick={() => handleDeleteCustomDefinition(d.id)}
                            className="p-1 text-[#717171] hover:text-[#d8573f] transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#717171] italic bg-[#faf8f0] p-2.5 rounded-xl border border-[#e5e7eb] text-center">
                      No custom definitions added yet. Click "Add Note/Definition" to save custom physical constants or study notes!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
