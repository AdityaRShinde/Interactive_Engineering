import React from 'react';
import { Formula, UserMasteryData } from '../types';
import { CheckCircle2, Award, Zap, Activity, Layers, Compass } from 'lucide-react';

interface CoverageDashboardProps {
  formulas: Formula[];
  userMastery: UserMasteryData;
  xp: number;
  streak: number;
}

export const CoverageDashboard: React.FC<CoverageDashboardProps> = ({
  formulas,
  userMastery,
  xp,
  streak
}) => {
  const totalFormulas = formulas.length;
  const verifiedFormulas = formulas.filter(f => f.isVerified).length;
  const masteredCount = Object.values(userMastery).filter((m: UserMasteryData[string]) => m.status === 'mastered').length;
  const discoveredCount = Object.values(userMastery).filter((m: UserMasteryData[string]) => m.status === 'discovered' || m.status === 'understood').length;

  const subjects = ['mechanical', 'civil', 'physics', 'electrical', 'mathematics', 'computer-science'] as const;

  return (
    <div id="coverage-dashboard" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono-tech font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Engineering Curriculum Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              Learning Progress & Mastery Analytics
            </h1>
            <p className="text-slate-500 font-mono-tech text-xs sm:text-sm mt-1">
              Tracking verified 2D engineering physics simulations across structural, mechanical, fluid, and circuit disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-center">
              <div className="text-[11px] font-bold text-slate-600 font-mono-tech flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                <span>Total XP</span>
              </div>
              <div className="text-xl font-bold font-mono-tech text-slate-900">{xp}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-center">
              <div className="text-[11px] font-bold text-slate-600 font-mono-tech flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-orange-600" />
                <span>Streak</span>
              </div>
              <div className="text-xl font-bold font-mono-tech text-slate-900">{streak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-mono-tech font-bold text-slate-500 uppercase tracking-wider">Total Formulas</div>
          <div className="text-3xl font-bold font-mono-tech text-slate-900">{totalFormulas}</div>
          <div className="text-xs font-mono-tech text-emerald-700 font-semibold flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% 2D Simulation Verified
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-mono-tech font-bold text-slate-500 uppercase tracking-wider">Formulas Mastered</div>
          <div className="text-3xl font-bold font-mono-tech text-blue-600">{masteredCount}</div>
          <div className="text-xs font-mono-tech text-slate-500 pt-1">
            {discoveredCount} currently in progress
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-mono-tech font-bold text-slate-500 uppercase tracking-wider">Quality Score</div>
          <div className="text-3xl font-bold font-mono-tech text-emerald-600">
            {Math.round((verifiedFormulas / totalFormulas) * 100)}%
          </div>
          <div className="text-xs font-mono-tech text-slate-500 pt-1">
            Dimensional & Vector validated
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <h2 className="text-lg font-display font-bold text-slate-900 mb-4">
          Discipline Coverage Breakdown
        </h2>

        <div className="space-y-4">
          {subjects.map(subj => {
            const count = formulas.filter(f => f.subject === subj).length;
            const percentage = Math.round((count / totalFormulas) * 100);

            return (
              <div key={subj} className="space-y-1.5 font-mono-tech text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span className="capitalize">{subj.replace('-', ' ')}</span>
                  <span>{count} Formulas ({percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.max(6, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
