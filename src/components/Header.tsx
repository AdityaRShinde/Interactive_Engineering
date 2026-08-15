import React from 'react';
import { ViewMode, SubjectCategory } from '../types';
import { 
  Compass, LayoutGrid, Bookmark, 
  Search, ArrowRightLeft, Sparkles, Zap,
  Coffee, Wand2, Plus, Sliders, Settings2, ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: SubjectCategory | 'all';
  onSelectSubject: (subject: SubjectCategory | 'all') => void;
  onOpenUnitConverter: () => void;
  onOpenAiGenerator: () => void;
  onOpenAdminPanel: () => void;
  xp: number;
  streak: number;
  bookmarkedCount: number;
  totalFormulasCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSelectSubject,
  onOpenUnitConverter,
  onOpenAiGenerator,
  onOpenAdminPanel,
  xp,
  streak,
  bookmarkedCount,
  totalFormulasCount = 0
}) => {
  const subjects: { id: SubjectCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'mechanical', label: 'Mechanical' },
    { id: 'civil', label: 'Civil & Struct' },
    { id: 'physics', label: 'Physics' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'mathematics', label: 'Math' }
  ];

  return (
    <header className="bg-[#faf8f0]/95 backdrop-blur-md border-b border-[#e5e7eb] sticky top-0 z-40">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectView('library')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-[#ffdd00] border border-[#f7d046] text-[#000000] flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <Coffee className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg text-[#000000] tracking-tight">
                  INTERACTIVE ENGINEERING
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ffffff] text-[#000000] border border-[#e5e7eb] px-2 py-0.5 rounded-full shadow-xs">
                  2D STUDIO
                </span>
              </div>
              <p className="text-[11px] text-[#717171] hidden sm:block">
                Equations, 2D Vector Physics & Dynamic Calculators
              </p>
            </div>
          </div>

          {/* Search Box in BuyMeACoffee pill style */}
          <div className="flex-1 max-w-sm mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search equations, symbols (σ, P, T, V, F, c)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#ffffff] text-xs font-medium rounded-full border border-[#e5e7eb] focus:border-[#000000] focus:outline-none transition-all text-[#000000] placeholder:text-[#717171] shadow-xs"
              />
            </div>
          </div>

          {/* Action Tools & Stats in pill badges */}
          <div className="flex items-center gap-2">
            {/* Admin Studio / Rearrange Catalog Button */}
            <button
              onClick={onOpenAdminPanel}
              className="px-3 py-1.5 bg-[#ffdd00] hover:bg-[#ffe633] text-[#000000] text-xs font-black rounded-full flex items-center gap-1.5 border-2 border-[#2b2b2b] transition-all shadow-[1.5px_1.5px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Open Admin Panel to Delete, Edit, Add, and Rearrange formulas"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#000000]" />
              <span className="hidden sm:inline">Admin Studio</span>
              <span className="sm:hidden">Admin</span>
              {totalFormulasCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#000000] text-white font-mono">
                  {totalFormulasCount}
                </span>
              )}
            </button>

            {/* AI Generator Quick Action */}
            <button
              onClick={onOpenAiGenerator}
              className="px-3.5 py-1.5 bg-[#000000] hover:bg-[#d8573f] text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              title="Synthesize any new equation with AI"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#ffdd00]" />
              <span className="hidden sm:inline">+ Generate Formula</span>
              <span className="sm:hidden">+ AI</span>
            </button>

            {/* Unit Converter Trigger */}
            <button
              onClick={onOpenUnitConverter}
              className="px-3 py-1.5 bg-[#ffffff] hover:bg-[#faf8f0] text-[#222222] text-xs font-semibold rounded-full flex items-center gap-1.5 border border-[#e5e7eb] transition-all shadow-xs"
              title="Open SI Unit Conversion & Dimensional Tools"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#d8573f]" />
              <span className="hidden sm:inline">Units</span>
            </button>

            {/* XP Counter */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#f5d5cf] bg-[#ffffff] text-[#000000] text-xs font-bold shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-[#ffdd00] text-[#a17a0b]" />
              <span>{xp} XP</span>
            </div>

            {/* Streak */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-[#ffffff] text-[#222222] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#d8573f]" />
              <span>{streak}d</span>
            </div>

            {/* Notebook Bookmark Counter */}
            <button
              onClick={() => onSelectView('notebook')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 border transition-all shadow-xs ${
                currentView === 'notebook'
                  ? 'bg-[#000000] text-white border-[#000000]'
                  : 'bg-[#ffffff] hover:bg-[#faf8f0] text-[#222222] border-[#e5e7eb]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedCount > 0 && currentView !== 'notebook' ? 'fill-[#d8573f] text-[#d8573f]' : ''}`} />
              <span className="hidden sm:inline">Saved</span>
              {bookmarkedCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${currentView === 'notebook' ? 'bg-[#ffdd00] text-[#000000]' : 'bg-[#000000] text-white'}`}>
                  {bookmarkedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs & Subject Filter */}
        <div className="flex items-center justify-between overflow-x-auto py-2 border-t border-[#e5e7eb]/70 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectView('library')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                currentView === 'library'
                  ? 'bg-[#000000] text-white shadow-xs'
                  : 'text-[#222222] hover:bg-[#ffffff] border border-transparent hover:border-[#e5e7eb]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5" />
              <span>Formulas Catalog</span>
            </button>
          </div>

          {/* Quick Subject Filter Pill on Library/Explore */}
          {currentView === 'library' && (
            <div className="flex items-center gap-1 overflow-x-auto pl-3 border-l border-[#e5e7eb]">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelectSubject(s.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-all ${
                    selectedSubject === s.id
                      ? 'bg-[#ffdd00] text-[#000000] border border-[#f7d046] shadow-xs'
                      : 'bg-[#ffffff] text-[#717171] border border-[#e5e7eb] hover:text-[#000000] hover:bg-[#faf8f0]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
