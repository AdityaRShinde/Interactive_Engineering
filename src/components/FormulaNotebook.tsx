import React, { useState } from 'react';
import { Formula, UserMasteryData } from '../types';
import { Bookmark, Trash2, Printer, Play, Edit3, Check, BookOpen } from 'lucide-react';
import { MathView } from './MathView';

interface FormulaNotebookProps {
  formulas: Formula[];
  userMastery: UserMasteryData;
  onSelectFormula: (id: string) => void;
  onUpdateMastery: (formulaId: string, updates: Partial<UserMasteryData[string]>) => void;
}

export const FormulaNotebook: React.FC<FormulaNotebookProps> = ({
  formulas,
  userMastery,
  onSelectFormula,
  onUpdateMastery
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const bookmarkedFormulas = formulas.filter(f => userMastery[f.id]?.isBookmarked);

  const handleSaveNote = (formulaId: string) => {
    onUpdateMastery(formulaId, {
      notes: noteText
    });
    setEditingNoteId(null);
  };

  const handleStartEditNote = (formulaId: string, currentNote?: string) => {
    setEditingNoteId(formulaId);
    setNoteText(currentNote || '');
  };

  const handleRemoveBookmark = (formulaId: string) => {
    onUpdateMastery(formulaId, {
      isBookmarked: false
    });
  };

  return (
    <div id="formula-notebook" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-mono-tech font-bold uppercase tracking-wider mb-2 border border-amber-200">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            Engineering Lab Notebook
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            Saved Simulations & Field Notes
          </h1>
          <p className="text-slate-500 font-mono-tech text-xs sm:text-sm mt-1">
            Your customized revision cheat sheet with quick simulation links, design notes, and parameter memories.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-slate-900 text-white font-semibold text-xs rounded-md flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Notebook</span>
        </button>
      </div>

      {bookmarkedFormulas.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center">
          <Bookmark className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Your Notebook is Empty</h3>
          <p className="font-mono-tech text-xs text-slate-500 max-w-md mx-auto mb-5">
            Click the bookmark icon on any formula card to save it here for fast access and personal engineering notes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedFormulas.map((formula, idx) => {
            const mastery = userMastery[formula.id];
            const isEditing = editingNoteId === formula.id;

            return (
              <div key={formula.id ? `notebook-${formula.id}` : `notebook-idx-${idx}`} className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="bg-slate-900 text-white font-mono-tech px-2 py-0.5 rounded text-xs uppercase font-bold mr-2">
                      {formula.subject}
                    </span>
                    <h2 className="font-display text-base font-bold text-slate-900 inline align-middle">
                      {formula.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFormula(formula.id)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch 2D Sim</span>
                    </button>

                    <button
                      onClick={() => handleRemoveBookmark(formula.id)}
                      className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-center">
                  <div className="text-xl font-bold font-mono-tech text-slate-900">
                    <MathView math={formula.formulaLatex} displayMode={true} />
                  </div>
                </div>

                {/* Notes Section */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-tech text-xs font-bold text-slate-700">Engineering Notes:</span>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditNote(formula.id, mastery?.notes)}
                        className="text-xs font-mono-tech font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{mastery?.notes ? 'Edit Note' : 'Add Note'}</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write design notes, safety factors, exam derivations..."
                        rows={3}
                        className="w-full p-2.5 rounded border border-slate-300 font-mono-tech text-xs focus:outline-none focus:border-blue-600"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-xs font-mono-tech text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(formula.id)}
                          className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-mono-tech font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-mono-tech text-slate-600 italic bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      {mastery?.notes || 'No notes added yet. Click "Add Note" to write custom annotations.'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
