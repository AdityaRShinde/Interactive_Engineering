import React, { useState, useEffect, useMemo } from 'react';
import { Formula, ViewMode, SubjectCategory, UserMasteryData } from './types';
import { initialFormulas } from './data/formulasData';
import { Header } from './components/Header';
import { FormulaCard } from './components/FormulaCard';
import { FormulaDetailView } from './components/FormulaDetailView';
import { PosterMode } from './components/PosterMode';
import { FormulaNotebook } from './components/FormulaNotebook';
import { UnitConverterModal } from './components/UnitConverterModal';
import { AITutorModal } from './components/AITutorModal';
import { AiFormulaGeneratorModal } from './components/AiFormulaGeneratorModal';
import { InteractiveLabModal } from './components/InteractiveLabModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { 
  Sparkles, BookOpen, Layers, 
  ArrowRight, Search, Activity, Cpu, Wand2, Plus, Play, Compass, Atom, Flame,
  Settings2, Trash2, Edit3
} from 'lucide-react';

export default function App() {
  const [formulas, setFormulas] = useState<Formula[]>(() => {
    try {
      const savedManaged = localStorage.getItem('vfl_managed_formulas');
      if (savedManaged) {
        const parsed = JSON.parse(savedManaged);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      const saved = localStorage.getItem('custom_synthesized_formulas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge initial with saved custom formulas (sanitize IDs and avoid duplicates)
          const seenIds = new Set(initialFormulas.map(f => f.id));
          const validCustom: Formula[] = [];
          
          parsed.forEach((pf, idx) => {
            if (pf && typeof pf === 'object') {
              const safeId = pf.id || `custom-saved-${idx}-${Date.now()}`;
              if (!seenIds.has(safeId)) {
                seenIds.add(safeId);
                validCustom.push({ ...pf, id: safeId });
              }
            }
          });

          return [...validCustom, ...initialFormulas];
        }
      }
    } catch {}
    return initialFormulas;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('library');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // User Progress and Mastery
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('vfl_xp');
    return saved ? parseInt(saved, 10) : 120;
  });

  const [streak] = useState<number>(() => {
    const saved = localStorage.getItem('vfl_streak');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [userMastery, setUserMastery] = useState<UserMasteryData>(() => {
    const saved = localStorage.getItem('vfl_mastery');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      'mech-normal-stress': {
        status: 'mastered',
        solvedPracticeCount: 2,
        isBookmarked: true,
        notes: 'Recall that σ is the axial normal stress over cross-sectional area A.'
      },
      'mech-beam-deflection': {
        status: 'understood',
        solvedPracticeCount: 1,
        isBookmarked: true,
        notes: 'Max deflection Δ = PL³/(48EI) at midspan for simply supported beam.'
      }
    };
  });

  // Modal states
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState<boolean>(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
  const [aiTutorFormula, setAiTutorFormula] = useState<Formula | null>(null);
  const [activeLabFormula, setActiveLabFormula] = useState<Formula | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [adminEditFormulaId, setAdminEditFormulaId] = useState<string | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('vfl_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('vfl_mastery', JSON.stringify(userMastery));
  }, [userMastery]);

  // Persist managed formulas whenever changed
  const handleUpdateFormulas = (newFormulas: Formula[]) => {
    setFormulas(newFormulas);
    try {
      localStorage.setItem('vfl_managed_formulas', JSON.stringify(newFormulas));
    } catch {}
  };

  // Direct Delete from FormulaCard or Admin Panel
  const handleDeleteFormula = (id: string) => {
    const updated = formulas.filter(f => f.id !== id);
    handleUpdateFormulas(updated);
    if (selectedFormulaId === id) {
      setSelectedFormulaId(null);
      setCurrentView('library');
    }
  };

  // Direct Edit from FormulaCard
  const handleEditFormula = (formula: Formula) => {
    setAdminEditFormulaId(formula.id);
    setIsAdminPanelOpen(true);
  };

  // Reset to initial factory defaults
  const handleResetToDefaults = () => {
    setFormulas(initialFormulas);
    try {
      localStorage.removeItem('vfl_managed_formulas');
      localStorage.removeItem('custom_synthesized_formulas');
    } catch {}
  };

  const handleAddXP = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const handleUpdateMastery = (formulaId: string, updates: Partial<UserMasteryData[string]>) => {
    setUserMastery(prev => ({
      ...prev,
      [formulaId]: {
        ...(prev[formulaId] || { status: 'discovered', isBookmarked: false }),
        ...updates
      }
    }));
  };

  const handleToggleBookmark = (id: string) => {
    const current = userMastery[id]?.isBookmarked;
    handleUpdateMastery(id, { isBookmarked: !current });
  };

  const handleSelectFormula = (id: string) => {
    setSelectedFormulaId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormulaGenerated = (newFormula: Formula) => {
    const safeId = newFormula.id || `custom-gen-${Date.now()}`;
    const safeFormula = { ...newFormula, id: safeId };

    const exists = formulas.some(f => f.id === safeFormula.id);
    const updated = exists ? formulas.map(f => f.id === safeFormula.id ? safeFormula : f) : [safeFormula, ...formulas];
    handleUpdateFormulas(updated);

    // Automatically navigate to the newly synthesized interactive formula
    setSelectedFormulaId(safeFormula.id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Formulas
  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      // Subject filter
      if (selectedSubject !== 'all' && f.subject !== selectedSubject) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name?.toLowerCase().includes(q) ?? false;
        const matchesPlain = f.formulaPlain?.toLowerCase().includes(q) ?? false;
        const matchesLatex = f.formulaLatex?.toLowerCase().includes(q) ?? false;
        const matchesChapter = f.chapter?.toLowerCase().includes(q) ?? false;
        const matchesTopic = f.topic?.toLowerCase().includes(q) ?? false;
        const matchesCode = f.codeName?.toLowerCase().includes(q) ?? false;
        const matchesVar = Array.isArray(f.variables) && f.variables.some(v => 
          (v?.name && v.name.toLowerCase().includes(q)) || 
          (v?.symbol && v.symbol.toLowerCase().includes(q))
        );

        return matchesName || matchesPlain || matchesLatex || matchesChapter || matchesTopic || matchesCode || matchesVar;
      }

      return true;
    });
  }, [formulas, selectedSubject, searchQuery]);

  const bookmarkedCount = Object.values(userMastery).filter((m: UserMasteryData[string]) => m.isBookmarked).length;
  const currentFormula = formulas.find(f => f.id === selectedFormulaId);

  const categories: { id: SubjectCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'mechanical', label: 'Mechanical & Structural' },
    { id: 'civil', label: 'Civil & Geotechnical' },
    { id: 'electrical', label: 'Electrical & Circuits' },
    { id: 'physics', label: 'Engineering Physics' },
    { id: 'chemistry', label: 'Chemistry & Thermodynamics' },
    { id: 'mathematics', label: 'Applied Mathematics' }
  ];

  return (
    <div className="min-h-screen text-[#000000] flex flex-col font-sans selection:bg-[#ffdd00] selection:text-[#000000] bg-[#faf8f0]">
      {/* Top Main Navigation Header */}
      <Header
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view !== 'detail') setSelectedFormulaId(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
        onOpenAdminPanel={() => {
          setAdminEditFormulaId(null);
          setIsAdminPanelOpen(true);
        }}
        xp={xp}
        streak={streak}
        bookmarkedCount={bookmarkedCount}
        totalFormulasCount={formulas.length}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: DETAIL / FORMULA LEARNING PAGE */}
        {currentView === 'detail' && currentFormula && (
          <FormulaDetailView
            formula={currentFormula}
            onBack={() => setCurrentView('library')}
            onSelectFormula={handleSelectFormula}
            userMastery={userMastery}
            onUpdateMastery={handleUpdateMastery}
            onAddXP={handleAddXP}
            onOpenAITutor={(f) => setAiTutorFormula(f)}
            allFormulas={formulas}
          />
        )}

        {/* VIEW 2: LIBRARY / EXPLORE HOME VIEW */}
        {currentView === 'library' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
            {/* Dynamic Interactive Hero Section */}
            <div className="rounded-2xl border-2 border-[#2b2b2b] bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#2b2b2b] relative overflow-hidden">
              {/* Background blueprint grid watermark */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#000000 1.5px, transparent 1.5px)`,
                  backgroundSize: '16px 16px'
                }}
              />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdd00] border-2 border-[#2b2b2b] text-[#000000] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#2b2b2b]">
                      <Activity className="w-3.5 h-3.5 text-[#000000] animate-pulse" />
                      Visual STEM Lab
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f5e9] border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-bold font-mono">
                      <Sparkles className="w-3 h-3 text-[#2e7d32]" />
                      2D Vector Simulations & Dimensional Proofs
                    </span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#000000] tracking-tight leading-tight">
                    Interactive Engineering Formulas & Live Visual Sandbox
                  </h1>

                  <p className="text-[#4b5563] text-sm leading-relaxed">
                    Explore physical laws through real-time 2D vector simulations, rearrangeable algebra solvers, step-by-step AI derivations, and dynamic SI/Imperial unit conversions.
                  </p>

                  {/* Dynamic quick-select equation tags */}
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wide mr-1">Quick Labs:</span>
                    {[
                      { name: "Hooke's Law", id: "hookes-law" },
                      { name: "Bernoulli Flow", id: "bernoulli" },
                      { name: "Euler Beam Deflection", id: "beam-deflection" },
                      { name: "Stefan-Boltzmann", id: "stefan-boltzmann" },
                      { name: "Coulomb Electrostatics", id: "coulombs-law" },
                      { name: "Ohm's Law", id: "ohms-law" }
                    ].map((item) => {
                      const f = formulas.find(x => x.id === item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (f) {
                              setActiveLabFormula(f);
                              setIsLabModalOpen(true);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-[#f3f4f6] hover:bg-[#ffdd00] border border-[#2b2b2b] text-[#1f2937] hover:text-[#000000] transition-all shadow-[1.5px_1.5px_0px_#2b2b2b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hero Call-to-Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setAdminEditFormulaId(null);
                      setIsAdminPanelOpen(true);
                    }}
                    className="px-5 py-2.5 bg-[#ffdd00] hover:bg-[#ffe633] text-[#000000] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    title="Open Admin Studio to Rearrange, Add, Edit or Delete Formulas"
                  >
                    <Settings2 className="w-4 h-4 text-[#000000]" />
                    <span>Admin Studio: Reorder & Manage ({formulas.length})</span>
                  </button>

                  <button
                    onClick={() => setIsAiGeneratorOpen(true)}
                    className="px-5 py-2.5 bg-[#000000] hover:bg-[#d8573f] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Wand2 className="w-4 h-4 text-[#ffdd00]" />
                    <span>Synthesize AI Formula (Step-by-Step)</span>
                  </button>

                  <button
                    onClick={() => {
                      const randomFormula = formulas[Math.floor(Math.random() * formulas.length)];
                      if (randomFormula) {
                        setActiveLabFormula(randomFormula);
                        setIsLabModalOpen(true);
                      }
                    }}
                    className="px-5 py-2 bg-[#ffffff] hover:bg-[#faf8f0] text-[#000000] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Random 2D Lab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSubject(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 border-[#2b2b2b] ${
                    selectedSubject === cat.id
                      ? 'bg-[#000000] text-white shadow-[2px_2px_0px_#2b2b2b]'
                      : 'bg-white text-[#222222] hover:bg-[#ffdd00]/30 shadow-[2px_2px_0px_#2b2b2b]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Formulas Cards Grid */}
            {filteredFormulas.length === 0 ? (
              <div className="rounded-2xl border-2 border-[#2b2b2b] bg-white p-10 text-center max-w-md mx-auto shadow-[3px_3px_0px_#2b2b2b]">
                <Search className="w-10 h-10 text-[#717171] mx-auto mb-3" />
                <h3 className="font-display text-base font-bold text-[#000000] mb-1">No matching equations found</h3>
                <p className="text-xs text-[#717171] mb-4">
                  Generate this formula instantly with AI, search for symbols (like σ, P, T, c), or clear filters.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubject('all');
                    }}
                    className="px-4 py-2 bg-white border-2 border-[#2b2b2b] hover:bg-[#faf8f0] text-[#000000] rounded-xl text-xs font-bold transition-all shadow-[2px_2px_0px_#2b2b2b]"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsAiGeneratorOpen(true)}
                    className="px-4 py-2 bg-[#000000] hover:bg-[#d8573f] text-white rounded-xl text-xs font-bold transition-all border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#ffdd00]" />
                    <span>Generate With AI</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFormulas.map((formula, idx) => (
                  <FormulaCard
                    key={formula.id ? `fcard-${formula.id}` : `fcard-idx-${idx}`}
                    formula={formula}
                    onSelect={handleSelectFormula}
                    userMastery={userMastery}
                    onToggleBookmark={handleToggleBookmark}
                    onDelete={handleDeleteFormula}
                    onEdit={handleEditFormula}
                    onOpenLabModal={(f) => {
                      setActiveLabFormula(f);
                      setIsLabModalOpen(true);
                    }}
                  />
                ))}

                {/* AI Synthesizer Action Card */}
                <div
                  onClick={() => setIsAiGeneratorOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-[#2b2b2b] hover:border-[#000000] bg-white hover:bg-[#fffde6] flex flex-col items-center justify-center p-6 text-center min-h-[220px] cursor-pointer transition-all group shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[5px_5px_0px_#2b2b2b]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ffdd00] border-2 border-[#2b2b2b] flex items-center justify-center mb-3 transition-all shadow-[2px_2px_0px_#2b2b2b] group-hover:rotate-6">
                    <Plus className="w-6 h-6 text-[#000000]" />
                  </div>
                  <h3 className="font-display text-sm font-black text-[#000000] flex items-center gap-1.5">
                    <span>Synthesize New Formula</span>
                    <Wand2 className="w-4 h-4 text-[#d8573f]" />
                  </h3>
                  <p className="text-xs text-[#4b5563] mt-1.5 max-w-xs leading-relaxed">
                    Step-by-step verification, 2D vector simulations, dynamic units, and proofs for any STEM equation.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: POSTER / CHEAT-SHEET MODE */}
        {currentView === 'poster' && (
          <PosterMode
            formulas={formulas}
            onSelectFormula={handleSelectFormula}
            selectedSubject={selectedSubject}
          />
        )}

        {/* VIEW 4: PERSONAL NOTEBOOK */}
        {currentView === 'notebook' && (
          <FormulaNotebook
            formulas={formulas}
            userMastery={userMastery}
            onSelectFormula={handleSelectFormula}
            onUpdateMastery={handleUpdateMastery}
          />
        )}
      </main>

      {/* Engineering Unit Converter Modal */}
      {isUnitConverterOpen && (
        <UnitConverterModal
          isOpen={isUnitConverterOpen}
          onClose={() => setIsUnitConverterOpen(false)}
        />
      )}

      {/* AI Formula Generator Modal */}
      {isAiGeneratorOpen && (
        <AiFormulaGeneratorModal
          isOpen={isAiGeneratorOpen}
          onClose={() => setIsAiGeneratorOpen(false)}
          onFormulaGenerated={handleFormulaGenerated}
        />
      )}

      {/* AI Formula Tutor Modal */}
      {aiTutorFormula && (
        <AITutorModal
          isOpen={!!aiTutorFormula}
          onClose={() => setAiTutorFormula(null)}
          formula={aiTutorFormula}
        />
      )}

      {/* Interactive 2D Engineering Lab Modal (Split Pane) */}
      {isLabModalOpen && activeLabFormula && (
        <InteractiveLabModal
          isOpen={isLabModalOpen}
          formula={activeLabFormula}
          onClose={() => {
            setIsLabModalOpen(false);
            setActiveLabFormula(null);
          }}
          userMastery={userMastery}
          onUpdateMastery={handleUpdateMastery}
          onAddXP={handleAddXP}
        />
      )}

      {/* Formula Catalog Admin & Reorder Studio Modal */}
      {isAdminPanelOpen && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => {
            setIsAdminPanelOpen(false);
            setAdminEditFormulaId(null);
          }}
          formulas={formulas}
          onUpdateFormulas={handleUpdateFormulas}
          onSelectFormulaForDetail={handleSelectFormula}
          onOpenLabModal={(f) => {
            setIsAdminPanelOpen(false);
            setActiveLabFormula(f);
            setIsLabModalOpen(true);
          }}
          initialEditFormulaId={adminEditFormulaId}
          onResetToDefaults={handleResetToDefaults}
        />
      )}
    </div>
  );
}
