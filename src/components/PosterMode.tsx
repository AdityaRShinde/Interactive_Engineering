import React, { useState } from 'react';
import { Formula, SubjectCategory } from '../types';
import { MathView } from './MathView';
import { ExcalidrawDiagram } from './ExcalidrawDiagram';
import { Sparkles, Printer, SlidersHorizontal, BookOpen } from 'lucide-react';

interface PosterModeProps {
  formulas: Formula[];
  onSelectFormula: (id: string) => void;
  selectedSubject: SubjectCategory | 'all';
}

export const PosterMode: React.FC<PosterModeProps> = ({
  formulas,
  onSelectFormula,
  selectedSubject
}) => {
  const [activeTopicFilter, setActiveTopicFilter] = useState<string>('all');

  const filtered = formulas.filter(f => {
    if (selectedSubject !== 'all' && f.subject !== selectedSubject) return false;
    if (activeTopicFilter !== 'all' && f.chapter !== activeTopicFilter) return false;
    return true;
  });

  const uniqueChapters = Array.from(new Set(formulas.map(f => f.chapter)));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="poster-mode-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Poster Mode Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-6 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Engineering Infographic Poster Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            High-Density Technical Formula Sheet
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-handwritten text-base">
            Excalidraw-inspired engineering notebook visual overview. Perfect for rapid revision and exam preparation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Poster</span>
          </button>
        </div>
      </div>

      {/* Chapter Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter Chapter:
        </span>
        <button
          onClick={() => setActiveTopicFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
            activeTopicFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Topics ({formulas.length})
        </button>
        {uniqueChapters.map((ch, i) => (
          <button
            key={`chapter-${ch}-${i}`}
            onClick={() => setActiveTopicFilter(ch)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTopicFilter === ch
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* 4x3 / 3x3 Responsive High-Density Technical Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((formula, idx) => (
          <div
            key={formula.id ? `poster-${formula.id}` : `poster-idx-${idx}`}
            id={`poster-card-${formula.id || idx}`}
            onClick={() => onSelectFormula(formula.id)}
            className="bg-[#faf9f6] bg-grid-pattern rounded-xl border-2 border-slate-700 hover:border-blue-600 p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Header / Number Badge */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-md bg-slate-900 text-white text-xs font-mono-code font-bold flex items-center justify-center">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white/90 px-2 py-0.5 rounded border border-slate-300">
                  {formula.subject}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {formula.name}
              </h3>
              <div className="text-xs text-slate-500 mb-3">{formula.chapter}</div>

              {/* Technical Drawing View */}
              <div className="bg-white/80 rounded-lg border border-slate-300 p-2 h-36 flex items-center justify-center mb-3">
                <ExcalidrawDiagram formula={formula} className="max-h-32" />
              </div>

              {/* Formula KaTeX Box */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-300 text-center mb-3">
                <MathView latex={formula.formulaLatex} block fallbackText={formula.formulaPlain} className="text-base font-bold text-slate-900" />
              </div>

              {/* Variables List */}
              <div className="text-[11px] text-slate-600 space-y-0.5 mb-4 font-mono-code bg-white/60 p-2 rounded border border-slate-200">
                <div className="font-bold text-slate-800 text-[10px] uppercase">Variables:</div>
                {(formula.variables || []).slice(0, 3).map(v => (
                  <div key={v.symbol} className="truncate">
                    <span className="font-bold text-blue-700">{v.symbol}</span> = {v.name} ({v.unit})
                  </div>
                ))}
              </div>
            </div>

            {/* Card Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs">
              <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <BookOpen className="w-3.5 h-3.5" />
                Simulate & Learn →
              </span>
              <span className="text-[10px] text-slate-400 font-mono-code">
                {formula.solvedExamples.length} Examples
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
