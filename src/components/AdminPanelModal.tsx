import React, { useState, useEffect } from 'react';
import { 
  Formula, SubjectCategory, VariableItem, SimulationType, 
  SolvedExample, DimensionalAnalysis 
} from '../types';
import { MathView } from './MathView';
import { 
  X, Trash2, Edit3, Plus, ArrowUp, ArrowDown, RotateCcw, 
  Check, Save, Eye, Sparkles, Layers, Sliders, Play, 
  Search, ShieldCheck, AlertTriangle, HelpCircle, GripVertical, CheckCircle2
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  formulas: Formula[];
  onUpdateFormulas: (newFormulas: Formula[]) => void;
  onSelectFormulaForDetail: (id: string) => void;
  onOpenLabModal: (formula: Formula) => void;
  initialEditFormulaId?: string | null;
  onResetToDefaults: () => void;
}

const SUBJECT_OPTIONS: { id: SubjectCategory; label: string; icon: string }[] = [
  { id: 'mechanical', label: 'Mechanical Engineering', icon: '⚙️' },
  { id: 'civil', label: 'Civil & Structural', icon: '🏗️' },
  { id: 'physics', label: 'Physics & Mechanics', icon: '⚛️' },
  { id: 'chemistry', label: 'Chemistry & Thermodynamics', icon: '🧪' },
  { id: 'electrical', label: 'Electrical & Electronics', icon: '⚡' },
  { id: 'mathematics', label: 'Pure & Applied Math', icon: '📐' },
  { id: 'computer-science', label: 'Computer Science', icon: '💻' },
  { id: 'biomedical', label: 'Biomedical Engineering', icon: '🧬' },
  { id: 'aerospace', label: 'Aerospace Engineering', icon: '🚀' }
];

const SIMULATION_TYPES: { id: SimulationType; label: string }[] = [
  { id: 'generic-interactive', label: 'Generic Interactive Vector / Sensitivity Sandbox' },
  { id: 'normal-stress-axial', label: 'Axial Stress & Bar Deformation (2D)' },
  { id: 'beam-deflection-elastic', label: 'Euler-Bernoulli Beam Deflection (2D)' },
  { id: 'hookes-law-spring', label: 'Hooke\'s Law Spring Oscillation' },
  { id: 'bernoulli-fluid-flow', label: 'Venturi & Bernoulli Fluid Flow' },
  { id: 'hydrostatic-fluid-pressure', label: 'Hydrostatic Column Pressure' },
  { id: 'force-mass-acceleration', label: 'Newton\'s 2nd Law Dynamic Motion' },
  { id: 'projectile-motion', label: 'Ballistic Projectile Motion' },
  { id: 'ohms-law', label: 'Ohm\'s Law Circuit Visualizer' },
  { id: 'ideal-gas-law', label: 'P-V-T Gas Piston Simulator' },
  { id: 'thermal-conduction', label: 'Fourier Thermal Gradient Wall' },
  { id: 'kinetic-energy', label: 'Kinetic Energy & Velocity Curve' },
  { id: 'torsional-shear-shaft', label: 'Torsional Shaft Shear Twist' },
  { id: 'area-circle', label: 'Geometric Circle Area & Radius' },
  { id: 'pythagorean-theorem', label: 'Right Triangle Geometric Vectors' }
];

const BLANK_FORMULA: Formula = {
  id: '',
  name: '',
  topic: '',
  chapter: '',
  subject: 'mechanical',
  level: ['engineering', 'class-11-12'],
  formulaLatex: '',
  formulaPlain: '',
  realWorldApplication: '',
  variables: [
    { symbol: 'F', name: 'Applied Force', unit: 'N', defaultValue: 100, min: 0, max: 1000, step: 10 },
    { symbol: 'A', name: 'Cross-sectional Area', unit: 'm²', defaultValue: 0.05, min: 0.001, max: 1, step: 0.005 }
  ],
  simulation: {
    type: 'generic-interactive',
    primaryVariable: 'F',
    secondaryVariable: 'A',
    outputLabel: 'Calculated Result',
    outputUnit: 'Units',
    formulaCode: 'F / A'
  },
  solvedExamples: [
    {
      question: 'Sample engineering calculation for this formula',
      given: { 'F': '100 N', 'A': '0.05 m²' },
      formulaUsed: 'Result = F / A',
      substitution: '100 / 0.05',
      calculation: '100 / 0.05 = 2000',
      finalAnswer: '2000',
      unit: 'Units',
      explanation: 'Direct substitution of given parameters.'
    }
  ],
  conceptQuestions: [],
  practiceProblems: [],
  prerequisites: ['Basic Algebra'],
  relatedFormulaIds: [],
  diagramDescription: '2D Visual Diagram'
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  formulas,
  onUpdateFormulas,
  onSelectFormulaForDetail,
  onOpenLabModal,
  initialEditFormulaId,
  onResetToDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'rearrange' | 'editor'>('rearrange');
  const [searchFilter, setSearchFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectCategory | 'all'>('all');
  const [editingFormula, setEditingFormula] = useState<Formula>(BLANK_FORMULA);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // If opened with a specific formula ID to edit
  useEffect(() => {
    if (initialEditFormulaId && isOpen) {
      const target = formulas.find(f => f.id === initialEditFormulaId);
      if (target) {
        setEditingFormula(JSON.parse(JSON.stringify(target)));
        setIsEditingExisting(true);
        setActiveTab('editor');
      }
    }
  }, [initialEditFormulaId, isOpen, formulas]);

  // Show Toast
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3000);
  };

  // Filtered list for rearrangement tab
  const displayedFormulas = (formulas || []).filter(f => {
    if (subjectFilter !== 'all' && f.subject !== subjectFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (f.name?.toLowerCase().includes(q) ?? false) || 
             (f.formulaPlain?.toLowerCase().includes(q) ?? false) || 
             (f.topic && f.topic.toLowerCase().includes(q)) ||
             (f.id?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  // Reordering handlers
  const handleMoveUp = (indexInFormulas: number) => {
    if (indexInFormulas <= 0) return;
    const newFormulas = [...formulas];
    const item = newFormulas[indexInFormulas];
    newFormulas.splice(indexInFormulas, 1);
    newFormulas.splice(indexInFormulas - 1, 0, item);
    onUpdateFormulas(newFormulas);
    showToast(`Moved "${item.name}" up`);
  };

  const handleMoveDown = (indexInFormulas: number) => {
    if (indexInFormulas >= formulas.length - 1) return;
    const newFormulas = [...formulas];
    const item = newFormulas[indexInFormulas];
    newFormulas.splice(indexInFormulas, 1);
    newFormulas.splice(indexInFormulas + 1, 0, item);
    onUpdateFormulas(newFormulas);
    showToast(`Moved "${item.name}" down`);
  };

  const handleMoveToTop = (indexInFormulas: number) => {
    if (indexInFormulas <= 0) return;
    const newFormulas = [...formulas];
    const item = newFormulas[indexInFormulas];
    newFormulas.splice(indexInFormulas, 1);
    newFormulas.unshift(item);
    onUpdateFormulas(newFormulas);
    showToast(`Moved "${item.name}" to top position`);
  };

  const handleMoveToBottom = (indexInFormulas: number) => {
    if (indexInFormulas >= formulas.length - 1) return;
    const newFormulas = [...formulas];
    const item = newFormulas[indexInFormulas];
    newFormulas.splice(indexInFormulas, 1);
    newFormulas.push(item);
    onUpdateFormulas(newFormulas);
    showToast(`Moved "${item.name}" to bottom position`);
  };

  // Delete handler
  const handleDeleteFormula = (id: string) => {
    const target = formulas.find(f => f.id === id);
    const newFormulas = formulas.filter(f => f.id !== id);
    onUpdateFormulas(newFormulas);
    setDeleteConfirmId(null);
    showToast(`Deleted "${target?.name || id}" successfully`, 'info');
  };

  // Open Edit Mode
  const handleStartEdit = (formula: Formula) => {
    setEditingFormula(JSON.parse(JSON.stringify(formula)));
    setIsEditingExisting(true);
    setActiveTab('editor');
  };

  // Open Create Mode
  const handleStartCreate = () => {
    const freshId = `custom-formula-${Date.now()}`;
    setEditingFormula({
      ...BLANK_FORMULA,
      id: freshId,
      name: 'New Custom Equation'
    });
    setIsEditingExisting(false);
    setActiveTab('editor');
  };

  // Save Formula
  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFormula.name.trim() || !editingFormula.formulaPlain.trim()) {
      alert('Please provide both a Formula Name and Equation text.');
      return;
    }

    const safeFormula: Formula = {
      ...editingFormula,
      id: editingFormula.id || `custom-${Date.now()}`,
      formulaLatex: editingFormula.formulaLatex || editingFormula.formulaPlain,
      variables: editingFormula.variables.length > 0 ? editingFormula.variables : [
        { symbol: 'x', name: 'Input Parameter', unit: 'units', defaultValue: 10, min: 0, max: 100, step: 1 }
      ]
    };

    if (isEditingExisting) {
      const updated = formulas.map(f => f.id === safeFormula.id ? safeFormula : f);
      onUpdateFormulas(updated);
      showToast(`Updated "${safeFormula.name}"`);
    } else {
      const updated = [safeFormula, ...formulas];
      onUpdateFormulas(updated);
      showToast(`Created new formula "${safeFormula.name}"`);
    }

    setActiveTab('rearrange');
  };

  // Variable management within Editor
  const handleAddVariable = () => {
    const newVar: VariableItem = {
      symbol: `v${editingFormula.variables.length + 1}`,
      name: `Parameter ${editingFormula.variables.length + 1}`,
      unit: 'unit',
      defaultValue: 10,
      min: 0,
      max: 100,
      step: 1
    };
    setEditingFormula(prev => ({
      ...prev,
      variables: [...prev.variables, newVar]
    }));
  };

  const handleUpdateVariable = (idx: number, field: keyof VariableItem, val: any) => {
    setEditingFormula(prev => {
      const copy = [...prev.variables];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, variables: copy };
    });
  };

  const handleRemoveVariable = (idx: number) => {
    setEditingFormula(prev => ({
      ...prev,
      variables: (prev.variables || []).filter((_, i) => i !== idx)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#faf8f0] rounded-2xl border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Top Navigation Header */}
        <div className="p-4 sm:p-5 bg-[#ffffff] border-b-2 border-[#2b2b2b] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdd00] border-2 border-[#2b2b2b] text-[#000000] flex items-center justify-center font-black shadow-[2px_2px_0px_#2b2b2b]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-black text-[#111827]">
                  Formula Catalog Admin & Reorder Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#e0f2fe] border border-[#0284c7]/40 text-[#0284c7] text-[10px] font-black uppercase">
                  {formulas.length} Total
                </span>
              </div>
              <p className="text-xs text-[#4b5563]">
                Rearrange order, edit equations, delete formulas, or create custom engineering simulations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-[#4b5563] hover:text-[#000000] rounded-xl border-2 border-transparent hover:border-[#2b2b2b] hover:bg-[#faf8f0] transition-all"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Tabs Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#ffffff] border-b-2 border-[#2b2b2b] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rearrange')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 border-[#2b2b2b] flex items-center gap-2 ${
                activeTab === 'rearrange'
                  ? 'bg-[#000000] text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#faf8f0]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Catalog & Reorder ({formulas.length})</span>
            </button>

            <button
              onClick={handleStartCreate}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 border-[#2b2b2b] flex items-center gap-2 ${
                activeTab === 'editor' && !isEditingExisting
                  ? 'bg-[#000000] text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-[#ffdd00] text-[#000000] hover:bg-[#ffe633] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Plus className="w-4 h-4 font-black" />
              <span>+ Add New Formula</span>
            </button>

            {activeTab === 'editor' && isEditingExisting && (
              <span className="px-3 py-1.5 rounded-xl bg-[#fef3c7] border-2 border-[#2b2b2b] text-xs font-bold text-[#92400e] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editing: {editingFormula.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all formulas back to default initial engineering library? Custom changes will be restored to defaults.')) {
                  onResetToDefaults();
                  showToast('Restored initial formula catalog');
                }
              }}
              className="px-3 py-1.5 text-xs font-bold text-[#6b7280] hover:text-[#dc2626] border border-dashed border-[#9ca3af] hover:border-[#dc2626] rounded-xl flex items-center gap-1.5 bg-white transition-all"
              title="Reset catalog back to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {/* Feedback Toast Notification */}
        {feedbackToast && (
          <div className="px-4 py-2 bg-[#dcfce7] border-b border-[#22c55e] text-[#15803d] text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>{feedbackToast.message}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: REARRANGE & MANAGE CATALOG */}
          {activeTab === 'rearrange' && (
            <div className="space-y-4">
              
              {/* Search & Subject Quick Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#6b7280] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter by formula name, symbol, topic, or id..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-[#d1d5db] focus:border-[#000000] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:outline-none"
                  >
                    <option value="all">All Disciplines ({formulas.length})</option>
                    {SUBJECT_OPTIONS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#2b2b2b]/30 text-xs text-[#4b5563] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[#6b7280]" />
                  <span>
                    Use the <strong>Up (▲)</strong> and <strong>Down (▼)</strong> buttons to rearrange how formulas appear on the main dashboard and catalog.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#111827]">
                  Showing {displayedFormulas.length} of {formulas.length}
                </span>
              </div>

              {/* Formulas Reorder Table / List */}
              <div className="space-y-2">
                {displayedFormulas.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border-2 border-dashed border-[#2b2b2b]">
                    <p className="text-sm font-bold text-[#6b7280]">No formulas match your filter criteria.</p>
                  </div>
                ) : (
                  displayedFormulas.map((f) => {
                    const originalIndex = formulas.findIndex(x => x.id === f.id);
                    const isFirst = originalIndex === 0;
                    const isLast = originalIndex === formulas.length - 1;

                    return (
                      <div
                        key={f.id}
                        className="bg-white rounded-xl p-3 sm:p-4 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fcfdfd] transition-all"
                      >
                        {/* Left: Position & Formula Details */}
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          {/* Order Position Badge */}
                          <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] border border-[#2b2b2b] flex items-center justify-center font-mono text-xs font-black text-[#111827] shrink-0">
                            #{originalIndex + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display font-black text-sm text-[#111827] truncate">
                                {f.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#f3f4f6] text-[10px] font-bold uppercase tracking-wider text-[#4b5563] border border-[#d1d5db]">
                                {f.subject}
                              </span>
                              {f.chapter && (
                                <span className="text-[11px] text-[#6b7280] truncate">
                                  • {f.chapter}
                                </span>
                              )}
                            </div>

                            {/* Math Equation Snippet */}
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                                {f.formulaPlain}
                              </span>
                              <span className="text-[11px] text-[#6b7280] truncate">
                                ({f.variables?.length || 0} variables)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Actions: Reordering Controls & Edit / Delete */}
                        <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f3f4f6]">
                          
                          {/* Move Up */}
                          <button
                            disabled={isFirst}
                            onClick={() => handleMoveUp(originalIndex)}
                            className="p-1.5 rounded-lg border-2 border-[#2b2b2b] bg-white hover:bg-[#ffdd00] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[1px_1px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4 text-[#111827]" />
                          </button>

                          {/* Move Down */}
                          <button
                            disabled={isLast}
                            onClick={() => handleMoveDown(originalIndex)}
                            className="p-1.5 rounded-lg border-2 border-[#2b2b2b] bg-white hover:bg-[#ffdd00] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[1px_1px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4 text-[#111827]" />
                          </button>

                          {/* Move to Top */}
                          <button
                            disabled={isFirst}
                            onClick={() => handleMoveToTop(originalIndex)}
                            className="px-2 py-1.5 rounded-lg border-2 border-[#2b2b2b] bg-white hover:bg-[#faf8f0] disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold text-[#111827] transition-all shadow-[1px_1px_0px_#2b2b2b]"
                            title="Send to Top"
                          >
                            Top
                          </button>

                          {/* Move to Bottom */}
                          <button
                            disabled={isLast}
                            onClick={() => handleMoveToBottom(originalIndex)}
                            className="px-2 py-1.5 rounded-lg border-2 border-[#2b2b2b] bg-white hover:bg-[#faf8f0] disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold text-[#111827] transition-all shadow-[1px_1px_0px_#2b2b2b]"
                            title="Send to Bottom"
                          >
                            End
                          </button>

                          <div className="w-[1px] h-6 bg-[#e5e7eb] mx-1" />

                          {/* Open Lab Modal Preview */}
                          <button
                            onClick={() => onOpenLabModal(f)}
                            className="p-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] transition-all shadow-[1px_1px_0px_#2b2b2b]"
                            title="Test 2D Simulation Lab"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(f)}
                            className="p-1.5 rounded-lg border-2 border-[#2b2b2b] bg-white hover:bg-[#ffdd00] text-[#111827] transition-all shadow-[1px_1px_0px_#2b2b2b]"
                            title="Edit Formula Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Dustbin Button with Confirmation Prompt */}
                          {deleteConfirmId === f.id ? (
                            <div className="flex items-center gap-1 bg-[#fee2e2] p-1 rounded-lg border border-[#ef4444]">
                              <button
                                onClick={() => handleDeleteFormula(f.id)}
                                className="px-2 py-1 bg-[#dc2626] text-white text-[11px] font-black rounded hover:bg-[#b91c1c]"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 text-[#4b5563] hover:text-[#000000]"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(f.id)}
                              className="p-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#fff1f2] hover:bg-[#fee2e2] text-[#e11d48] transition-all shadow-[1px_1px_0px_#2b2b2b]"
                              title="Delete Formula"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORMULA EDITOR (ADD / EDIT) */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSaveFormula} className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-[#e5e7eb]">
                  <h3 className="font-display text-base font-black text-[#111827] flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#d8573f]" />
                    <span>{isEditingExisting ? 'Edit Engineering Formula' : 'Synthesize / Create New Formula'}</span>
                  </h3>
                  <span className="font-mono text-xs text-[#6b7280]">
                    ID: {editingFormula.id}
                  </span>
                </div>

                {/* Primary Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Formula Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingFormula.name}
                      onChange={(e) => setEditingFormula(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Hooke's Law of Elasticity"
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Discipline / Subject *
                    </label>
                    <select
                      value={editingFormula.subject}
                      onChange={(e) => setEditingFormula(prev => ({ ...prev, subject: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                    >
                      {SUBJECT_OPTIONS.map(s => (
                        <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Topic / Sub-domain
                    </label>
                    <input
                      type="text"
                      value={editingFormula.topic || ''}
                      onChange={(e) => setEditingFormula(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="e.g., Solid Mechanics & Elasticity"
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Chapter / Category
                    </label>
                    <input
                      type="text"
                      value={editingFormula.chapter || ''}
                      onChange={(e) => setEditingFormula(prev => ({ ...prev, chapter: e.target.value }))}
                      placeholder="e.g., Stress, Strain and Deflection"
                      className="w-full px-3 py-2 text-xs font-medium rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mathematical Equation & LaTeX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      Plain Text Equation *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingFormula.formulaPlain}
                      onChange={(e) => setEditingFormula(prev => ({ ...prev, formulaPlain: e.target.value }))}
                      placeholder="e.g., F = k * x or sigma = P / A"
                      className="w-full px-3 py-2 font-mono text-xs font-bold rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1">
                      LaTeX Formula (Optional, for crisp typography)
                    </label>
                    <input
                      type="text"
                      value={editingFormula.formulaLatex || ''}
                      onChange={(e) => setEditingFormula(prev => ({ ...prev, formulaLatex: e.target.value }))}
                      placeholder="e.g., F = k \cdot \Delta x or \sigma = \frac{P}{A}"
                      className="w-full px-3 py-2 font-mono text-xs font-medium rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Equation Live Preview Box */}
                <div className="p-3 bg-[#fdfbf7] rounded-xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] block mb-1">
                    Live Equation Render Preview:
                  </span>
                  <div className="py-2 text-center">
                    {editingFormula.formulaLatex ? (
                      <MathView latex={editingFormula.formulaLatex} block={true} fallbackText={editingFormula.formulaPlain} />
                    ) : (
                      <span className="font-mono text-base font-bold text-[#111827]">
                        {editingFormula.formulaPlain || 'Enter equation above to preview'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Real World Application Description */}
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">
                    Real-World Engineering Application / Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingFormula.realWorldApplication || ''}
                    onChange={(e) => setEditingFormula(prev => ({ ...prev, realWorldApplication: e.target.value }))}
                    placeholder="Explain how this formula is applied in engineering designs, real machines, structures, or experiments..."
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Variables List Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-xs font-black text-[#111827] uppercase tracking-wider">
                        Variables & Interactive Slider Bounds ({editingFormula.variables.length})
                      </h4>
                      <p className="text-[11px] text-[#6b7280]">
                        Define symbols, units, and slider ranges used in 2D simulations and calculations.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="px-3 py-1.5 bg-[#ffdd00] hover:bg-[#ffe633] text-[#000000] rounded-lg border-2 border-[#2b2b2b] text-xs font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#2b2b2b]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variable</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editingFormula.variables.map((v, vIdx) => (
                      <div
                        key={vIdx}
                        className="bg-[#faf8f0] p-3 rounded-xl border-2 border-[#2b2b2b] grid grid-cols-2 sm:grid-cols-6 gap-2 items-center"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-[#4b5563]">Symbol</label>
                          <input
                            type="text"
                            required
                            value={v.symbol}
                            onChange={(e) => handleUpdateVariable(vIdx, 'symbol', e.target.value)}
                            className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-[#2b2b2b] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#4b5563]">Name / Description</label>
                          <input
                            type="text"
                            required
                            value={v.name}
                            onChange={(e) => handleUpdateVariable(vIdx, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-[#2b2b2b] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#4b5563]">Unit</label>
                          <input
                            type="text"
                            value={v.unit}
                            onChange={(e) => handleUpdateVariable(vIdx, 'unit', e.target.value)}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-[#2b2b2b] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#4b5563]">Default</label>
                          <input
                            type="number"
                            value={v.defaultValue ?? 10}
                            onChange={(e) => handleUpdateVariable(vIdx, 'defaultValue', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-[#2b2b2b] bg-white"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-3 sm:pt-0">
                          <div>
                            <label className="block text-[9px] font-bold text-[#4b5563]">Min - Max</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={v.min ?? 0}
                                onChange={(e) => handleUpdateVariable(vIdx, 'min', parseFloat(e.target.value))}
                                className="w-12 px-1 py-0.5 text-[10px] font-mono rounded border border-[#2b2b2b] bg-white"
                              />
                              <span className="text-[10px]">-</span>
                              <input
                                type="number"
                                value={v.max ?? 100}
                                onChange={(e) => handleUpdateVariable(vIdx, 'max', parseFloat(e.target.value))}
                                className="w-12 px-1 py-0.5 text-[10px] font-mono rounded border border-[#2b2b2b] bg-white"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveVariable(vIdx)}
                            className="p-1.5 text-[#e11d48] hover:bg-[#fee2e2] rounded border border-transparent hover:border-[#e11d48]"
                            title="Remove variable"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation Mode Configuration */}
                <div className="pt-2 border-t border-[#e5e7eb]">
                  <label className="block text-xs font-bold text-[#111827] mb-1">
                    2D Simulation Mode / Visual Engine
                  </label>
                  <select
                    value={editingFormula.simulation?.type || 'generic-interactive'}
                    onChange={(e) => setEditingFormula(prev => ({
                      ...prev,
                      simulation: {
                        ...(prev.simulation || { primaryVariable: 'x', outputLabel: 'Result', outputUnit: 'units', formulaCode: 'x' }),
                        type: e.target.value as any
                      }
                    }))}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border-2 border-[#2b2b2b] bg-[#faf8f0] focus:bg-white focus:outline-none"
                  >
                    {SIMULATION_TYPES.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('rearrange')}
                  className="px-4 py-2.5 bg-white hover:bg-[#f3f4f6] text-[#2b2b2b] rounded-xl text-xs font-bold border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#000000] hover:bg-[#d8573f] text-white rounded-xl text-xs font-black border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Save className="w-4 h-4 text-[#ffdd00]" />
                  <span>{isEditingExisting ? 'Save Formula Changes' : 'Create & Add to Catalog'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
