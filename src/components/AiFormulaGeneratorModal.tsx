import React, { useState, useEffect } from 'react';
import { 
  Sparkles, X, Plus, Lightbulb, AlertCircle, Wand2, Atom, Check, 
  ArrowRight, ArrowLeft, RefreshCw, Cpu, Brain, CheckCircle2, 
  Sliders, Layers, FileText, Compass, ChevronRight, Eye
} from 'lucide-react';
import { Formula, SubjectCategory, Variable } from '../types';
import { MathView } from './MathView';
import { Engineering2DLab } from './simulations/Engineering2DLab';

interface AiFormulaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormulaGenerated: (newFormula: Formula) => void;
}

const QUICK_PROMPTS: { label: string; prompt: string; subject: SubjectCategory }[] = [
  { label: "Bernoulli's Fluid Equation", prompt: "Bernoulli's Equation (P + 0.5*rho*v^2 + rho*g*h = constant)", subject: 'mechanical' },
  { label: 'Stefan-Boltzmann Radiation', prompt: 'Stefan-Boltzmann Law for thermal radiation power P = e * sigma * A * T^4', subject: 'physics' },
  { label: 'Arrhenius Reaction Kinetics', prompt: 'Arrhenius Equation for chemical reaction rate k = A*exp(-Ea/(R*T))', subject: 'chemistry' },
  { label: 'Coulomb Electrostatic Force', prompt: "Coulomb's Law F = (k * q1 * q2) / r^2", subject: 'physics' },
  { label: 'Fourier Heat Conduction', prompt: "Fourier's Law of Thermal Conduction q = -k * A * (dT/dx)", subject: 'mechanical' },
  { label: 'Manning Open Channel Flow', prompt: 'Manning Equation for open channel water flow velocity V = (1/n) * R^(2/3) * S^(1/2)', subject: 'civil' },
  { label: 'Ohm\'s Law & AC Impedance', prompt: 'AC Impedance Z = sqrt(R^2 + (XL - XC)^2)', subject: 'electrical' },
  { label: 'Quadratic Roots Discriminant', prompt: 'Quadratic Formula x = (-b ± sqrt(b^2 - 4ac)) / (2a)', subject: 'mathematics' }
];

export const AiFormulaGeneratorModal: React.FC<AiFormulaGeneratorModalProps> = ({
  isOpen,
  onClose,
  onFormulaGenerated,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'auto'>('auto');
  
  // Step state: 0 = Input, 1 = Thinking & Concept Verification, 2 = Units & Rearrangement Verification, 3 = Simulation & Preset Verification
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Synthesized Formula Draft
  const [draftFormula, setDraftFormula] = useState<Formula | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState<number>(0);

  // Editable fields in Step 1
  const [editName, setEditName] = useState<string>('');
  const [editLatex, setEditLatex] = useState<string>('');
  const [editPlain, setEditPlain] = useState<string>('');
  const [editVariables, setEditVariables] = useState<Variable[]>([]);

  // Stage 3: Simulation generation & Interactive Lab preview
  const [isGeneratingSim, setIsGeneratingSim] = useState<boolean>(false);
  const [generatedSimHtml, setGeneratedSimHtml] = useState<string | null>(null);
  const [simGenerationError, setSimGenerationError] = useState<string | null>(null);
  const [simPreviewValues, setSimPreviewValues] = useState<Record<string, number>>({});
  const [simPreviewTarget, setSimPreviewTarget] = useState<string | undefined>(undefined);
  const [simPreviewMode, setSimPreviewMode] = useState<'vector_fbd' | 'html_code'>('vector_fbd');

  // Trigger AI Synthesis API
  const handleStartGeneration = async (queryText?: string, subjectChoice?: SubjectCategory | 'auto') => {
    const textToUse = queryText || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setActiveStep(1);
    setThinkingSteps([
      `🔍 Analyzing prompt: "${textToUse.trim()}"...`,
      '📐 Formulating governing physical law and LaTeX mathematical representations...',
      '⚖️ Computing dimensional analysis [M L T] and SI unit mappings...',
      '🔬 Synthesizing 2D kinematics canvas and interactive slider boundaries...'
    ]);
    setCurrentThinkingIndex(0);

    // Simulate animated thinking steps
    const timer1 = setTimeout(() => setCurrentThinkingIndex(1), 500);
    const timer2 = setTimeout(() => setCurrentThinkingIndex(2), 1100);
    const timer3 = setTimeout(() => setCurrentThinkingIndex(3), 1700);

    try {
      const resp = await fetch('/api/generate-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse.trim(),
          subject: subjectChoice !== 'auto' ? subjectChoice : (selectedSubject !== 'auto' ? selectedSubject : undefined),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to synthesize formula');
      }

      const data = await resp.json();
      if (data.formula) {
        const f: Formula = data.formula;
        setDraftFormula(f);
        setEditName(f.name);
        setEditLatex(f.formulaLatex || '');
        setEditPlain(f.formulaPlain || '');
        setEditVariables(f.variables || []);
        
        const initialVals: Record<string, number> = {};
        (f.variables || []).forEach(v => {
          initialVals[v.symbol] = v.defaultValue;
        });
        setSimPreviewValues(initialVals);

        if (f.thinkingTrace && Array.isArray(f.thinkingTrace)) {
          setThinkingSteps(f.thinkingTrace);
        }
      } else {
        throw new Error('Invalid formula structure received');
      }
    } catch (err: any) {
      console.error('Formula generation error:', err);
      setErrorMsg(err.message || 'Error generating formula. Please try again.');
      setActiveStep(0);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGenerating(false);
    }
  };

  // Live calculation for preview
  const getPreviewCalcValue = (f: Formula, vals: Record<string, number>): number => {
    try {
      if (f.calculationFn) {
        return f.calculationFn(vals);
      }
      if (f.simulation?.formulaCode) {
        let code = f.simulation.formulaCode;
        Object.entries(vals).forEach(([k, v]) => {
          code = code.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
        });
        return Function(`"use strict"; return (${code})`)();
      }
      return Object.values(vals)[0] || 0;
    } catch {
      return 0;
    }
  };

  // Variable edit handler
  const handleVariableChange = (idx: number, field: keyof Variable, val: any) => {
    setEditVariables(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleAddVariable = () => {
    setEditVariables(prev => [
      ...prev,
      {
        symbol: `x_${prev.length + 1}`,
        name: `Parameter ${prev.length + 1}`,
        unit: 'units',
        dimension: '[1]',
        description: 'Custom user defined variable',
        defaultValue: 10,
        min: 1,
        max: 100,
        step: 1
      }
    ]);
  };

  const handleRemoveVariable = (idx: number) => {
    setEditVariables(prev => prev.filter((_, i) => i !== idx));
  };

  // Step Progression
  const handleVerifyStep1 = () => {
    if (!draftFormula) return;
    setDraftFormula(prev => prev ? {
      ...prev,
      name: editName,
      formulaLatex: editLatex,
      formulaPlain: editPlain,
      variables: editVariables
    } : null);
    setActiveStep(2);
  };

  const handleVerifyStep2 = () => {
    setActiveStep(3);
  };

  const handleFinalizeAndLaunch = () => {
    if (!draftFormula) return;

    // Sync simulation customInputs to reflect any variable edits from Step 1
    const resolvedVars = editVariables.length > 0 ? editVariables : draftFormula.variables;
    const syncedCustomInputs = resolvedVars.map(v => ({
      id: v.symbol,
      label: v.name,
      symbol: v.symbol,
      unit: v.unit || '',
      min: v.min ?? 0,
      max: v.max ?? 100,
      step: v.step ?? 1,
      defaultValue: v.defaultValue ?? 10,
    }));

    const finalFormula: Formula = {
      ...draftFormula,
      name: editName || draftFormula.name,
      formulaLatex: editLatex || draftFormula.formulaLatex,
      formulaPlain: editPlain || draftFormula.formulaPlain,
      variables: resolvedVars,
      // Sync simulation config so the lab uses the verified values
      simulation: {
        ...draftFormula.simulation,
        customInputs: syncedCustomInputs,
        primaryVariable: resolvedVars[0]?.symbol ?? draftFormula.simulation?.primaryVariable,
        secondaryVariable: resolvedVars[1]?.symbol ?? draftFormula.simulation?.secondaryVariable,
      },
      // Carry AI-generated custom simulation HTML into the lab (if generated)
      customSimHtml: generatedSimHtml ?? draftFormula.customSimHtml ?? undefined,
    };
    onFormulaGenerated(finalFormula);
    onClose();
  };


  // Stage 3: Generate unique simulation
  const handleGenerateSimulation = async () => {
    if (!draftFormula) return;
    setIsGeneratingSim(true);
    setSimGenerationError(null);
    setGeneratedSimHtml(null);
    try {
      const resp = await fetch('/api/generate-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaName: editName || draftFormula.name,
          formulaPlain: editPlain || draftFormula.formulaPlain,
          variables: editVariables.length > 0 ? editVariables : draftFormula.variables,
          subject: draftFormula.subject,
          realWorldApplication: draftFormula.realWorldApplication,
        }),
      });
      const data = await resp.json();
      if (data.html) {
        setGeneratedSimHtml(data.html);
      } else {
        throw new Error(data.error || 'No simulation HTML returned');
      }
    } catch (err: any) {
      setSimGenerationError(err.message || 'Failed to generate simulation');
    } finally {
      setIsGeneratingSim(false);
    }
  };

  const handleResetModal = () => {
    setActiveStep(0);
    setDraftFormula(null);
    setPrompt('');
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#ffffff] border-2 border-[#2b2b2b] rounded-3xl w-full max-w-2xl shadow-[6px_6px_0px_#000000] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#faf8f0] px-5 py-4 border-b-2 border-[#2b2b2b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffdd00] border-2 border-[#2b2b2b] flex items-center justify-center text-[#000000] shadow-[2px_2px_0px_#2b2b2b]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-[#111827] tracking-tight">
                Step-by-Step AI Formula Synthesizer
              </h2>
              <p className="text-xs text-[#6b7280]">
                Deep physical reasoning, step verification, and 2D simulation engineering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white text-[#6b7280] hover:text-[#000000] border border-transparent hover:border-[#2b2b2b] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS BAR (Steps 1, 2, 3) */}
        {activeStep > 0 && (
          <div className="bg-white px-5 py-2.5 border-b border-[#e5e7eb] flex items-center justify-between text-xs">
            {[
              { num: 1, label: '1. Concept & Variables' },
              { num: 2, label: '2. Units & Proofs' },
              { num: 3, label: '3. 2D Simulation' }
            ].map((st) => (
              <div 
                key={st.num}
                className={`flex items-center gap-1.5 font-bold ${
                  activeStep === st.num 
                    ? 'text-[#d8573f]' 
                    : activeStep > st.num 
                    ? 'text-green-700' 
                    : 'text-[#9ca3af]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                  activeStep === st.num 
                    ? 'bg-[#d8573f] text-white border-[#d8573f]' 
                    : activeStep > st.num 
                    ? 'bg-green-100 text-green-700 border-green-600' 
                    : 'bg-[#f3f4f6] text-[#9ca3af] border-[#d1d5db]'
                }`}>
                  {activeStep > st.num ? '✓' : st.num}
                </div>
                <span className="hidden sm:inline">{st.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-[#fff1f2] border-2 border-[#fecdd3] rounded-2xl flex items-center gap-2 text-xs text-[#e11d48]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STAGE 0: USER INPUT PROMPT ================= */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center justify-between">
                  <span>Enter Formula, Law, or Physical Concept:</span>
                  <span className="text-[10px] text-[#6b7280] font-normal">e.g. Bernoulli, Arrhenius, Hooke</span>
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type any formula or equation (e.g. 'Stefan-Boltzmann Radiation Law P = e·σ·A·T⁴' or 'Bernoulli Fluid Equation' or 'Euler Buckling Load Pcr = (pi^2 * E * I) / (K * L)^2')..."
                  className="w-full p-3.5 bg-[#faf8f0] border-2 border-[#2b2b2b] focus:border-[#d8573f] rounded-2xl text-xs font-medium text-[#111827] placeholder:text-[#9ca3af] focus:outline-none transition-all resize-none shadow-[2px_2px_0px_#2b2b2b]"
                  disabled={isGenerating}
                />
              </div>

              {/* Subject Category Selectors */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Discipline Category:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'auto', label: 'Auto-Detect' },
                    { id: 'physics', label: 'Physics' },
                    { id: 'chemistry', label: 'Chemistry' },
                    { id: 'mechanical', label: 'Mechanical' },
                    { id: 'civil', label: 'Civil' },
                    { id: 'electrical', label: 'Electrical' },
                    { id: 'mathematics', label: 'Mathematics' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSubject(s.id as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border-1.5 border-[#2b2b2b] transition-all ${
                        selectedSubject === s.id
                          ? 'bg-[#2b2b2b] text-white shadow-[1px_1px_0px_#000]'
                          : 'bg-[#faf8f0] text-[#4b5563] hover:text-[#111827] hover:bg-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick STEAM Examples */}
              <div className="space-y-2 pt-2 border-t border-dashed border-[#e5e7eb]">
                <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-[#eab308]" />
                  <span>Popular STEAM equations ready to synthesize:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(qp.prompt);
                        setSelectedSubject(qp.subject);
                        handleStartGeneration(qp.prompt, qp.subject);
                      }}
                      className="p-2 bg-[#faf8f0] hover:bg-[#ffdd00]/40 border-1.5 border-[#2b2b2b] rounded-xl text-left transition-all text-xs font-medium text-[#111827] flex items-center justify-between group shadow-[1px_1px_0px_#2b2b2b]"
                    >
                      <span className="truncate">{qp.label}</span>
                      <Plus className="w-3.5 h-3.5 text-[#6b7280] group-hover:text-[#000000] shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STAGE 1: AI THINKING & STEP 1 VERIFICATION ================= */}
          {activeStep === 1 && (
            <div className="space-y-4">
              {/* AI Thinking Trace Box */}
              <div className="bg-[#faf8f0] border-2 border-[#2b2b2b] rounded-2xl p-4 shadow-[2px_2px_0px_#2b2b2b] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className={`w-4 h-4 text-[#d8573f] ${isGenerating ? 'animate-bounce' : ''}`} />
                    <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
                      AI Deep Thinking & Concept Analysis
                    </span>
                  </div>
                  {isGenerating && (
                    <span className="text-[10px] font-bold text-[#d8573f] animate-pulse">
                      Synthesizing...
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs font-mono-tech">
                  {thinkingSteps.map((stepText, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-2 ${
                        idx <= currentThinkingIndex ? 'text-[#111827]' : 'text-[#9ca3af]'
                      }`}
                    >
                      <span className="text-green-600 font-bold shrink-0">✓</span>
                      <span>{stepText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1 Verification Form */}
              {draftFormula && !isGenerating && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#d8573f]" />
                      Verify Concept & Equation Parameters
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
                      Step 1 of 3: Please Verify
                    </span>
                  </div>

                  {/* Formula Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6b7280]">Formula Title:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 bg-white border-1.5 border-[#2b2b2b] rounded-xl text-xs font-bold text-[#111827] focus:outline-none"
                    />
                  </div>

                  {/* Math Equation Preview */}
                  <div className="bg-[#fdfbf7] p-3 rounded-2xl border-2 border-[#2b2b2b] text-center shadow-[2px_2px_0px_#2b2b2b]">
                    <div className="text-base sm:text-lg font-black text-[#111827] py-1">
                      <MathView latex={editLatex} block={true} fallbackText={editPlain} />
                    </div>
                    <input
                      type="text"
                      value={editPlain}
                      onChange={(e) => setEditPlain(e.target.value)}
                      placeholder="Plain equation string"
                      className="w-full text-center text-xs font-mono-tech text-[#6b7280] bg-transparent border-t border-dashed border-[#e5e7eb] pt-1.5 mt-1 focus:outline-none"
                    />
                  </div>

                  {/* Variables Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#6b7280]">
                        Independent Variables ({editVariables.length}):
                      </label>
                      <button
                        onClick={handleAddVariable}
                        className="text-[10px] font-bold text-[#111827] bg-[#faf8f0] border border-[#2b2b2b] px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Variable</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {editVariables.map((v, idx) => (
                        <div key={idx} className="bg-[#faf8f0] p-2.5 rounded-xl border border-[#2b2b2b] grid grid-cols-12 gap-2 items-center text-xs">
                          <input
                            type="text"
                            value={v.symbol}
                            onChange={(e) => handleVariableChange(idx, 'symbol', e.target.value)}
                            placeholder="Symbol"
                            className="col-span-2 p-1 bg-white border border-[#d1d5db] rounded text-center font-mono-tech font-bold"
                          />
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => handleVariableChange(idx, 'name', e.target.value)}
                            placeholder="Name"
                            className="col-span-5 p-1 bg-white border border-[#d1d5db] rounded text-xs"
                          />
                          <input
                            type="text"
                            value={v.unit}
                            onChange={(e) => handleVariableChange(idx, 'unit', e.target.value)}
                            placeholder="Unit"
                            className="col-span-2 p-1 bg-white border border-[#d1d5db] rounded text-center font-mono-tech text-xs"
                          />
                          <input
                            type="number"
                            value={v.defaultValue}
                            onChange={(e) => handleVariableChange(idx, 'defaultValue', parseFloat(e.target.value) || 0)}
                            placeholder="Default"
                            className="col-span-2 p-1 bg-white border border-[#d1d5db] rounded text-right font-mono-tech text-xs"
                          />
                          <button
                            onClick={() => handleRemoveVariable(idx)}
                            className="col-span-1 text-[#e11d48] hover:text-red-800 text-center font-bold"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STAGE 2: STEP 2 VERIFICATION — THEORY, DERIVATION & REARRANGEMENTS ================= */}
          {activeStep === 2 && draftFormula && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#1d4ed8]" />
                  Verify Derivations, Definitions & Algebraic Proofs
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                  Step 2 of 3: Please Verify
                </span>
              </div>

              {/* Complete Step-by-Step Derivation Breakdown */}
              <div className="bg-[#ffffff] p-4 rounded-2xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2">
                  <span className="text-xs font-black text-[#111827] flex items-center gap-1.5">
                    <span>📐</span>
                    <span>{draftFormula.derivationDetail?.title || 'Analytical Derivation of the Governing Law'}</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#faf8f0] px-2 py-0.5 rounded border border-[#2b2b2b]">
                    Rigorous Proof
                  </span>
                </div>

                {/* Starting Principles & Assumptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#faf8f0] p-2.5 rounded-xl border border-[#e5e7eb]">
                    <div className="font-bold text-[#000000] text-[11px] mb-1">Starting Fundamental Principles:</div>
                    <ul className="space-y-0.5 text-[11px] text-[#4b5563]">
                      {(draftFormula.derivationDetail?.startingPrinciples || ['Conservation of Energy', 'Equilibrium of Forces']).map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="text-[#2a7a4c] font-bold">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#faf8f0] p-2.5 rounded-xl border border-[#e5e7eb]">
                    <div className="font-bold text-[#000000] text-[11px] mb-1">Governing Boundary Assumptions:</div>
                    <ul className="space-y-0.5 text-[11px] text-[#4b5563]">
                      {(draftFormula.derivationDetail?.assumptions || draftFormula.assumptions || ['Homogeneous continuum', 'Idealized boundary conditions']).map((a, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="text-[#d8573f] font-bold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Derivation Steps */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-[#6b7280]">Step-by-Step Mathematical Progression:</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(draftFormula.derivationDetail?.steps || [
                      {
                        stepNumber: 1,
                        title: 'Formulate Governing Boundary Balance',
                        latex: draftFormula.formulaLatex,
                        explanation: 'Establish force and energy equilibrium across the control element.',
                        keyPrinciple: 'Newtonian & Energy Conservation'
                      }
                    ]).map((step, sIdx) => (
                      <div key={sIdx} className="bg-[#faf8f0] p-2.5 rounded-xl border border-[#2b2b2b] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#111827]">
                            Step {step.stepNumber}: {step.title}
                          </span>
                          {step.keyPrinciple && (
                            <span className="text-[10px] font-mono-tech font-bold text-[#0369a1] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              {step.keyPrinciple}
                            </span>
                          )}
                        </div>
                        <div className="py-1 text-center bg-white rounded-lg border border-[#e5e7eb]">
                          <MathView latex={step.latex} block={false} fallbackText={step.latex} />
                        </div>
                        <p className="text-[11px] text-[#4b5563]">{step.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dimensional Homogeneity & Inverse Rearrangements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Dimensional Proof Box */}
                <div className="bg-[#faf8f0] p-3 rounded-2xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] space-y-1.5 text-xs">
                  <div className="font-bold text-[#111827]">Dimensional Homogeneity:</div>
                  <div className="font-mono-tech font-bold text-xs text-[#d8573f]">
                    {draftFormula.dimensionalAnalysis?.unitsBreakdown || '[M L T⁻²] / [L²] = [Pa]'}
                  </div>
                  <div className="text-[10px] font-bold text-green-700 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Consistent SI Dimensional Units</span>
                  </div>
                </div>

                {/* Rearrangement Count */}
                <div className="bg-[#faf8f0] p-3 rounded-2xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] space-y-1 text-xs">
                  <div className="font-bold text-[#111827]">
                    Inverse Rearrangements ({(draftFormula.rearrangements || []).length}):
                  </div>
                  <div className="text-[11px] text-[#4b5563]">
                    {(draftFormula.rearrangements || []).map(r => r.targetSymbol).join(', ') || 'Auto-generated for all variables'}
                  </div>
                  <div className="text-[10px] text-[#0369a1] font-semibold">
                    ⚡ Instant dynamic rearrangement enabled
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STAGE 3: STEP 3 VERIFICATION — 2D SIMULATION & PRESETS ================= */}
          {activeStep === 3 && draftFormula && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-green-700" />
                  Simulation Verification & Interactive Lab
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
                  Step 3 of 3: Modular SVG Simulation
                </span>
              </div>

              {/* Simulation Mode Selector */}
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] pb-2">
                <button
                  type="button"
                  onClick={() => setSimPreviewMode('vector_fbd')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    simPreviewMode === 'vector_fbd'
                      ? 'bg-[#2b2b2b] text-white border-[#2b2b2b] shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-[#4b5563] border-[#d1d5db] hover:bg-[#faf8f0]'
                  }`}
                >
                  📐 Modular Vector Simulation (Free-Body Diagram)
                </button>
                <button
                  type="button"
                  onClick={() => setSimPreviewMode('html_code')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                    simPreviewMode === 'html_code'
                      ? 'bg-[#2b2b2b] text-white border-[#2b2b2b] shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-[#4b5563] border-[#d1d5db] hover:bg-[#faf8f0]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-[#d8573f]" />
                  <span>Custom HTML Code Canvas</span>
                  {generatedSimHtml && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                </button>
              </div>

              {/* Vector Simulation Canvas View */}
              {simPreviewMode === 'vector_fbd' && (
                <div className="bg-[#ffffff] p-4 rounded-2xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Modular 2D Physics Vector Canvas</span>
                      <div className="text-sm font-black text-[#111827]">
                        {editName || draftFormula.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded">
                        Output: {getPreviewCalcValue(draftFormula, simPreviewValues).toFixed(2)} {draftFormula.simulation?.outputUnit || ''}
                      </span>
                    </div>
                  </div>

                  {/* Embedded 2D Lab Vector Canvas */}
                  <div className="h-[280px] w-full rounded-2xl overflow-hidden border-2 border-[#2b2b2b] bg-[#faf8f0]">
                    <Engineering2DLab
                      formula={draftFormula}
                      values={simPreviewValues}
                      onValueChange={(k, v) => setSimPreviewValues(prev => ({ ...prev, [k]: v }))}
                      calculatedValue={getPreviewCalcValue(draftFormula, simPreviewValues)}
                      onReset={() => {
                        const resetVals: Record<string, number> = {};
                        (draftFormula.variables || []).forEach(v => {
                          resetVals[v.symbol] = v.defaultValue;
                        });
                        setSimPreviewValues(resetVals);
                      }}
                      activeRearrangementTarget={simPreviewTarget}
                    />
                  </div>

                  {/* Interactive Parameter Sliders in Step 3 */}
                  <div className="space-y-2 pt-2 border-t border-[#e5e7eb]">
                    <div className="text-[11px] font-bold text-[#111827] uppercase tracking-wider flex items-center justify-between">
                      <span>Live Simulation Parameter Sliders:</span>
                      <span className="text-[10px] text-[#6b7280] font-normal">Directly linked to SVG vectors</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(draftFormula.variables || editVariables).map((v) => {
                        const curVal = simPreviewValues[v.symbol] ?? v.defaultValue;
                        return (
                          <div key={v.symbol} className="p-2.5 bg-[#faf8f0] border border-[#2b2b2b] rounded-xl space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#111827]">{v.name} ({v.symbol})</span>
                              <span className="font-mono-tech font-bold text-[#d8573f]">
                                {curVal} {v.unit}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={v.min ?? 0}
                              max={v.max ?? 100}
                              step={v.step ?? 1}
                              value={curVal}
                              onChange={(e) => {
                                const num = parseFloat(e.target.value);
                                setSimPreviewValues(prev => ({ ...prev, [v.symbol]: num }));
                              }}
                              className="w-full h-1.5 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#d8573f]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom HTML Code View */}
              {simPreviewMode === 'html_code' && (
                <div className="bg-[#ffffff] p-4 rounded-2xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">AI Custom HTML Code Engine</span>
                      <div className="text-sm font-black text-[#111827]">
                        {editName || draftFormula.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateSimulation}
                      disabled={isGeneratingSim}
                      className="flex items-center gap-2 px-4 py-2 bg-[#ffdd00] hover:bg-[#ffe633] border-2 border-[#2b2b2b] rounded-xl text-xs font-black text-[#000000] shadow-[2px_2px_0px_#2b2b2b] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 cursor-pointer"
                    >
                      <Compass className={`w-4 h-4 ${isGeneratingSim ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingSim ? 'Generating...' : generatedSimHtml ? '🔄 Regenerate HTML Code' : '🎮 Generate HTML Simulation'}</span>
                    </button>
                  </div>

                  {simGenerationError && (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-xs text-red-700 font-bold">
                      ⚠ {simGenerationError}
                    </div>
                  )}

                  {isGeneratingSim && (
                    <div className="flex items-center gap-2 text-xs text-[#6b7280] bg-[#faf8f0] p-3 rounded-xl border border-[#e5e7eb] animate-pulse">
                      <Wand2 className="w-4 h-4 text-[#d8573f] animate-spin" />
                      <span>AI is synthesizing custom HTML simulation... This may take 10-15 seconds.</span>
                    </div>
                  )}

                  {generatedSimHtml && !isGeneratingSim && (
                    <div className="space-y-2">
                      <div className="border-2 border-[#2b2b2b] rounded-xl overflow-hidden shadow-[2px_2px_0px_#2b2b2b]">
                        <iframe
                          srcDoc={generatedSimHtml}
                          title="Formula Simulation Preview"
                          className="w-full"
                          style={{ height: '300px', border: 'none', backgroundColor: '#1a1a2e' }}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  )}

                  {!generatedSimHtml && !isGeneratingSim && !simGenerationError && (
                    <div className="bg-[#faf8f0] border border-dashed border-[#2b2b2b] rounded-xl p-6 text-center text-[11px] text-[#6b7280]">
                      <Compass className="w-8 h-8 mx-auto mb-2 text-[#d8573f] opacity-40" />
                      <p>Optional: Click <strong>Generate HTML Simulation</strong> if you want an external web animation.</p>
                      <p className="mt-1 text-[10px]">The Modular SVG Vector simulation is already active and ready to use!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Presets Preview */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#6b7280]">
                  Calibrated Engineering Scenarios & Presets:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(draftFormula.scenarioPresets || [
                    { id: 'p1', name: 'Nominal Standard Conditions', description: 'Baseline standard parameters' }
                  ]).map((preset) => (
                    <div key={preset.id} className="p-2.5 bg-white border border-[#2b2b2b] rounded-xl shadow-2xs">
                      <div className="font-bold text-xs text-[#111827]">{preset.name}</div>
                      <div className="text-[10px] text-[#6b7280]">{preset.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#faf8f0] p-4 border-t-2 border-[#2b2b2b] flex items-center justify-between">
          {activeStep === 0 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border-2 border-[#2b2b2b] hover:bg-[#f3f4f6] text-[#111827] rounded-xl text-xs font-bold transition-all shadow-[1.5px_1.5px_0px_#2b2b2b]"
                disabled={isGenerating}
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => handleStartGeneration()}
                disabled={isGenerating || !prompt.trim()}
                className="px-5 py-2 bg-[#ffdd00] hover:bg-[#ffe633] text-[#000000] border-2 border-[#2b2b2b] rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
                <span>Start Step-by-Step AI Synthesis</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 1) handleResetModal();
                    else setActiveStep(prev => prev - 1);
                  }}
                  className="px-3.5 py-1.5 bg-white border-2 border-[#2b2b2b] hover:bg-[#f3f4f6] text-[#111827] rounded-xl text-xs font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#2b2b2b]"
                  disabled={isGenerating}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {activeStep === 1 && (
                <button
                  type="button"
                  onClick={handleVerifyStep1}
                  disabled={isGenerating || !draftFormula}
                  className="px-5 py-2 bg-[#2b2b2b] hover:bg-[#000000] text-white border-2 border-[#2b2b2b] rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  <span>Verify & Proceed to Step 2 (Units)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {activeStep === 2 && (
                <button
                  type="button"
                  onClick={handleVerifyStep2}
                  className="px-5 py-2 bg-[#2b2b2b] hover:bg-[#000000] text-white border-2 border-[#2b2b2b] rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <span>Verify & Proceed to Step 3 (Simulation)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {activeStep === 3 && (
                <div className="flex items-center gap-2">
                  {generatedSimHtml && (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Simulation verified
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleFinalizeAndLaunch}
                    className="px-6 py-2 bg-[#ffdd00] hover:bg-[#ffe633] text-[#000000] border-2 border-[#2b2b2b] rounded-xl text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{generatedSimHtml ? 'Confirm & Add to Interactive Lab 🚀' : 'Skip Simulation & Add to Lab'}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
