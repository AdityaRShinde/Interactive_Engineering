import React, { useState } from 'react';
import { Formula, PracticeProblem, UserMasteryData } from '../types';
import { Award, CheckCircle2, ChevronRight, HelpCircle, Trophy, Zap, Sparkles, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeArenaProps {
  formulas: Formula[];
  onSelectFormula: (id: string) => void;
  userMastery: UserMasteryData;
  onUpdateMastery: (formulaId: string, updates: Partial<UserMasteryData[string]>) => void;
  onAddXP: (amount: number) => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  formulas,
  onSelectFormula,
  userMastery,
  onUpdateMastery,
  onAddXP
}) => {
  const allProblems: { formula: Formula; problem: PracticeProblem }[] = [];
  (formulas || []).forEach(f => {
    (f.practiceProblems || []).forEach(p => {
      allProblems.push({ formula: f, problem: p });
    });
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const activeItem = allProblems[currentIndex] || allProblems[0];

  const handleVerify = () => {
    if (!activeItem) return;
    const val = parseFloat(userInput);
    if (isNaN(val)) {
      setFeedback({ isCorrect: false, message: 'Please enter a valid numeric value.' });
      return;
    }

    const { formula, problem } = activeItem;
    const tolerance = problem.tolerance ?? 0.1;
    const isCorrect = Math.abs(val - problem.correctAnswer) <= tolerance;

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Superb! Correct calculation: ${problem.correctAnswer} ${problem.unit}`
      });
      setShowSolution(true);
      onAddXP(50);
      onUpdateMastery(formula.id, {
        status: 'mastered',
        solvedPracticeCount: ((userMastery[formula.id]?.solvedPracticeCount) || 0) + 1,
        lastPracticed: new Date().toISOString()
      });

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      setFeedback({
        isCorrect: false,
        message: `Incorrect. Expected value is around ${problem.correctAnswer} ${problem.unit}. Review the formula and hint!`
      });
    }
  };

  const nextProblem = () => {
    setFeedback(null);
    setUserInput('');
    setShowHint(false);
    setShowSolution(false);
    setCurrentIndex((prev) => (prev + 1) % allProblems.length);
  };

  if (!activeItem) {
    return <div className="p-8 text-center font-mono-tech text-slate-500">No practice problems loaded.</div>;
  }

  const { formula, problem } = activeItem;

  return (
    <div id="practice-arena" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono-tech font-bold uppercase tracking-wider mb-2 border border-blue-200">
              <Trophy className="w-3.5 h-3.5 text-blue-600" />
              Practice & Problem Solving Arena
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Engineering Calculation Drills
            </h1>
            <p className="text-slate-500 font-mono-tech text-xs sm:text-sm mt-1">
              Test your engineering intuition, unit consistency, and parameter calculations with automated verification.
            </p>
          </div>

          <span className="font-mono-tech text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded border border-slate-300">
            Problem {currentIndex + 1} of {allProblems.length}
          </span>
        </div>
      </div>

      {/* Main Problem Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-mono-tech px-2 py-0.5 rounded text-xs uppercase font-bold">
              {formula.subject}
            </span>
            <span className="text-xs font-mono-tech font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {formula.topic}
            </span>
          </div>
          <button
            onClick={() => onSelectFormula(formula.id)}
            className="font-mono-tech text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Open Simulation: {formula.name}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-relaxed">
          {problem.question}
        </h2>

        {/* Input & Action Form */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-mono-tech text-slate-500 mb-1">
                Target Variable ({problem.targetVariable}) in {problem.unit}:
              </label>
              <input
                type="number"
                step="any"
                placeholder={`Enter value (${problem.unit})...`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="w-full px-3 py-2 bg-white text-sm font-mono-tech font-bold rounded border border-slate-300 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              onClick={handleVerify}
              className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded text-xs font-semibold self-end transition-colors"
            >
              Verify Answer
            </button>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div className={`p-3 rounded text-xs font-mono-tech border ${
              feedback.isCorrect 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* Hint & Solution Toggles */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-mono-tech text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs font-mono-tech text-blue-600 hover:text-blue-800"
            >
              {showSolution ? 'Hide Solution Steps' : 'Reveal Solution Steps'}
            </button>
          </div>

          {showHint && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs font-mono-tech text-amber-900">
              <span className="font-bold">Hint: </span>{problem.hint}
            </div>
          )}

          {showSolution && (
            <div className="bg-white border border-slate-200 rounded p-3 text-xs font-mono-tech space-y-1">
              <div className="font-bold text-slate-800 uppercase tracking-wider">Solution Steps:</div>
              {problem.solutionSteps.map((step, idx) => (
                <div key={idx} className="text-slate-600 pl-2 border-l-2 border-blue-500">
                  {step}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Question Navigation */}
        <div className="flex justify-end">
          <button
            onClick={nextProblem}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <span>Next Problem</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
