import React, { useState } from 'react';
import { Formula, UserMasteryData } from '../types';
import { Bookmark, Play, Sparkles, SlidersHorizontal, Eye, Trash2, Edit3, X, AlertCircle } from 'lucide-react';
import { MathView } from './MathView';

interface FormulaCardProps {
  formula: Formula;
  onSelect: (id: string) => void;
  onOpenLabModal?: (formula: Formula) => void;
  userMastery: UserMasteryData;
  onToggleBookmark: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (formula: Formula) => void;
}

const SUBJECT_ACCENTS: Record<string, { 
  tagBg: string; 
  tagText: string; 
  tagBorder: string; 
  accent: string;
  badgeLabel: string;
  pinColor: string;
}> = {
  mechanical: { 
    tagBg: 'bg-[#fff5eb]', 
    tagText: 'text-[#d8573f]', 
    tagBorder: 'border-[#f8c4b8]', 
    accent: '#d8573f',
    badgeLabel: '⚙️ Mechanical',
    pinColor: 'bg-[#d8573f]'
  },
  civil: { 
    tagBg: 'bg-[#f0f7ff]', 
    tagText: 'text-[#1d4ed8]', 
    tagBorder: 'border-[#bfdbfe]', 
    accent: '#1d4ed8',
    badgeLabel: '🏗️ Civil & Structural',
    pinColor: 'bg-[#1d4ed8]'
  },
  physics: { 
    tagBg: 'bg-[#faf5ff]', 
    tagText: 'text-[#7e22ce]', 
    tagBorder: 'border-[#e9d5ff]', 
    accent: '#7e22ce',
    badgeLabel: '⚛️ Physics',
    pinColor: 'bg-[#7e22ce]'
  },
  mathematics: { 
    tagBg: 'bg-[#f0fdf4]', 
    tagText: 'text-[#15803d]', 
    tagBorder: 'border-[#bbf7d0]', 
    accent: '#15803d',
    badgeLabel: '📐 Mathematics',
    pinColor: 'bg-[#15803d]'
  },
  chemistry: { 
    tagBg: 'bg-[#ecfeff]', 
    tagText: 'text-[#0e7490]', 
    tagBorder: 'border-[#a5f3fc]', 
    accent: '#0e7490',
    badgeLabel: '🧪 Chemistry',
    pinColor: 'bg-[#0e7490]'
  },
  electrical: { 
    tagBg: 'bg-[#fffbeb]', 
    tagText: 'text-[#b45309]', 
    tagBorder: 'border-[#fde68a]', 
    accent: '#b45309',
    badgeLabel: '⚡ Electrical',
    pinColor: 'bg-[#b45309]'
  },
  'computer-science': { 
    tagBg: 'bg-[#f8fafc]', 
    tagText: 'text-[#334155]', 
    tagBorder: 'border-[#cbd5e1]', 
    accent: '#334155',
    badgeLabel: '💻 CompSci',
    pinColor: 'bg-[#334155]'
  },
  biomedical: { 
    tagBg: 'bg-[#fff1f2]', 
    tagText: 'text-[#be123c]', 
    tagBorder: 'border-[#fecdd3]', 
    accent: '#be123c',
    badgeLabel: '🧬 Biomedical',
    pinColor: 'bg-[#be123c]'
  },
  aerospace: { 
    tagBg: 'bg-[#f0f9ff]', 
    tagText: 'text-[#0369a1]', 
    tagBorder: 'border-[#bae6fd]', 
    accent: '#0369a1',
    badgeLabel: '🚀 Aerospace',
    pinColor: 'bg-[#0369a1]'
  }
};

export const FormulaCard: React.FC<FormulaCardProps> = ({
  formula,
  onSelect,
  onOpenLabModal,
  userMastery,
  onToggleBookmark,
  onDelete,
  onEdit
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const mastery = userMastery[formula.id];
  const isBookmarked = mastery?.isBookmarked;
  const styling = SUBJECT_ACCENTS[formula.subject] || SUBJECT_ACCENTS.mechanical;

  const handleLaunchLab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenLabModal) {
      onOpenLabModal(formula);
    } else {
      onSelect(formula.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmingDelete) {
      if (onDelete) {
        onDelete(formula.id);
      }
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingDelete(false);
  };

  return (
    <div
      id={`formula-card-${formula.id}`}
      onClick={() => onSelect(formula.id)}
      className="relative bg-[#ffffff] rounded-2xl p-4 sm:p-5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[5px_5px_0px_#2b2b2b] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
        backgroundSize: '16px 16px'
      }}
    >
      {/* Top Sketchy Pin / Tape Badge */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#fef08a] border border-[#ca8a04] rotate-1 shadow-2xs opacity-80 rounded-xs pointer-events-none" />

      <div>
        {/* Header Row: Subject Badge & Action Buttons (Bookmark, Edit, Dustbin Delete) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border-1.5 border-[#2b2b2b] ${styling.tagBg} ${styling.tagText} shadow-[1px_1px_0px_#2b2b2b]`}>
            {styling.badgeLabel}
          </span>

          <div className="flex items-center gap-1">
            {/* Inline Confirm Delete Popup */}
            {isConfirmingDelete ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#fee2e2] border-1.5 border-[#ef4444] shadow-xs animate-in fade-in"
              >
                <span className="text-[10px] font-bold text-[#b91c1c]">Delete?</span>
                <button
                  onClick={handleDeleteClick}
                  className="px-1.5 py-0.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[10px] font-black rounded"
                  title="Confirm Delete"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="p-0.5 text-[#6b7280] hover:text-[#111827]"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                {/* Dustbin Delete Button */}
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="p-1.5 rounded-lg border-1.5 border-transparent hover:border-[#2b2b2b] hover:bg-[#fff1f2] transition-all text-[#9ca3af] hover:text-[#e11d48]"
                    title="Delete formula from dashboard"
                    aria-label="Delete formula"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Edit Button */}
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(formula);
                    }}
                    className="p-1.5 rounded-lg border-1.5 border-transparent hover:border-[#2b2b2b] hover:bg-[#faf8f0] transition-all text-[#9ca3af] hover:text-[#111827]"
                    title="Edit formula in Admin Panel"
                    aria-label="Edit formula"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(formula.id);
                  }}
                  className="p-1.5 rounded-lg border-1.5 border-transparent hover:border-[#2b2b2b] hover:bg-[#faf8f0] transition-all text-[#6b7280] hover:text-[#d8573f]"
                  title="Bookmark equation"
                  aria-label="Bookmark equation"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#d8573f] text-[#d8573f]' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Formula Title */}
        <div className="mb-2">
          <h3 className="font-display text-[15px] font-black text-[#111827] group-hover:text-[#d8573f] transition-colors leading-snug line-clamp-1">
            {formula.name}
          </h3>
          <p className="text-[11px] text-[#6b7280] line-clamp-1 font-medium mt-0.5">
            {formula.chapter || formula.topic || 'Engineering Governing Law'}
          </p>
        </div>

        {/* PROMINENT FORMULA DISPLAY BOX (Excalidraw / Chalkboard / Blueprint Style) */}
        <div className="my-2.5 bg-[#fdfbf7] border-2 border-[#2b2b2b] rounded-xl p-3 text-center shadow-[2px_2px_0px_#2b2b2b] group-hover:bg-[#fffefb] transition-all relative overflow-hidden">
          {/* Subtle Sketchy corner accent */}
          <div className="absolute top-1 left-1.5 text-[9px] font-mono-tech text-[#9ca3af] select-none font-bold">
            f(x)
          </div>

          <div className="min-h-[48px] flex items-center justify-center py-1 px-1">
            {formula.formulaLatex ? (
              <div className="text-base sm:text-lg font-black text-[#111827] overflow-x-auto max-w-full">
                <MathView latex={formula.formulaLatex} block={true} fallbackText={formula.formulaPlain} />
              </div>
            ) : (
              <div className="font-mono-tech font-bold text-base text-[#111827] tracking-wide">
                {formula.formulaPlain}
              </div>
            )}
          </div>

          {/* Secondary Plain Text representation preview */}
          {formula.formulaPlain && (
            <div className="text-[11px] font-mono-tech text-[#6b7280] mt-1 border-t border-dashed border-[#e5e7eb] pt-1 truncate">
              {formula.formulaPlain}
            </div>
          )}
        </div>

        {/* Variable Tags Preview */}
        <div className="flex items-center gap-1.5 flex-wrap my-2">
          {(formula.variables || []).slice(0, 3).map((v, i) => (
            <span
              key={v?.symbol || `var-${i}`}
              className="text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded-md bg-[#f3f4f6] border border-[#d1d5db] text-[#374151]"
            >
              <strong className="text-[#111827]">{v?.symbol || ''}</strong>: {v?.unit || 'unit'}
            </span>
          ))}
          {(formula.variables || []).length > 3 && (
            <span className="text-[10px] font-mono-tech text-[#9ca3af] font-bold">
              +{(formula.variables?.length || 0) - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-2 flex items-center gap-2 mt-1 border-t border-dashed border-[#e5e7eb]">
        <button 
          onClick={handleLaunchLab}
          className="flex-1 py-2 px-3 bg-[#ffdd00] hover:bg-[#ffe633] text-[#000000] border-2 border-[#2b2b2b] rounded-xl text-xs font-black flex justify-center items-center gap-1.5 transition-all shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Interactive 2D Lab</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(formula.id);
          }}
          className="p-2 bg-[#ffffff] hover:bg-[#f3f4f6] text-[#2b2b2b] border-2 border-[#2b2b2b] rounded-xl text-xs font-bold transition-all shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          title="Open Full Formula Detail"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
