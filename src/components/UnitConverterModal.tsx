import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConverterCategory = 'force' | 'pressure' | 'power' | 'energy' | 'length';

export const UnitConverterModal: React.FC<UnitConverterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [category, setCategory] = useState<ConverterCategory>('force');
  const [inputValue, setInputValue] = useState<number>(10);
  const [fromUnit, setFromUnit] = useState<string>('kN');
  const [toUnit, setToUnit] = useState<string>('N');

  const CONVERSIONS: Record<ConverterCategory, { label: string; units: Record<string, number> }> = {
    force: {
      label: 'Force (F)',
      units: {
        'N': 1,
        'kN': 1000,
        'MN': 1000000,
        'lbf': 4.44822,
        'kgf': 9.80665,
        'dyn': 0.00001
      }
    },
    pressure: {
      label: 'Pressure & Stress (P, σ)',
      units: {
        'Pa': 1,
        'kPa': 1000,
        'MPa': 1000000,
        'GPa': 1000000000,
        'bar': 100000,
        'psi': 6894.76,
        'atm': 101325
      }
    },
    power: {
      label: 'Power (P)',
      units: {
        'W': 1,
        'kW': 1000,
        'MW': 1000000,
        'hp (metric)': 735.499,
        'hp (mech)': 745.7,
        'BTU/hr': 0.293071
      }
    },
    energy: {
      label: 'Energy & Work (E, W)',
      units: {
        'J': 1,
        'kJ': 1000,
        'MJ': 1000000,
        'kWh': 3600000,
        'cal': 4.184,
        'kcal': 4184,
        'BTU': 1055.06,
        'eV': 1.60218e-19
      }
    },
    length: {
      label: 'Length & Span (L, r)',
      units: {
        'm': 1,
        'cm': 0.01,
        'mm': 0.001,
        'km': 1000,
        'in': 0.0254,
        'ft': 0.3048,
        'yd': 0.9144,
        'mi': 1609.34
      }
    }
  };

  const currentCatData = CONVERSIONS[category];
  const unitKeys = Object.keys(currentCatData.units);

  const validFrom = unitKeys.includes(fromUnit) ? fromUnit : unitKeys[0];
  const validTo = unitKeys.includes(toUnit) ? toUnit : unitKeys[1] || unitKeys[0];

  const fromFactor = currentCatData.units[validFrom] || 1;
  const toFactor = currentCatData.units[validTo] || 1;

  const convertedValue = (inputValue * fromFactor) / toFactor;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div id="unit-converter-modal" className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900">Engineering Unit Converter</h3>
              <p className="text-[11px] font-mono-tech text-slate-500">Fast SI & Technical conversion for calculations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CONVERSIONS) as ConverterCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                const keys = Object.keys(CONVERSIONS[cat].units);
                setFromUnit(keys[0]);
                setToUnit(keys[1] || keys[0]);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono-tech font-bold transition-all ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {CONVERSIONS[cat].label}
            </button>
          ))}
        </div>

        {/* Input & Units */}
        <div className="space-y-3 font-mono-tech text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Input Value</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 rounded border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <select
                value={validFrom}
                onChange={(e) => setFromUnit(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50 text-slate-900 focus:outline-none"
              >
                {unitKeys.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center my-0.5">
            <button
              onClick={() => {
                const temp = validFrom;
                setFromUnit(validTo);
                setToUnit(temp);
              }}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Swap units"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Converted Target Unit</label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm">
                {convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </div>
              <select
                value={validTo}
                onChange={(e) => setToUnit(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 font-bold bg-slate-50 text-slate-900 focus:outline-none"
              >
                {unitKeys.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Multi-unit quick preview table */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 font-mono-tech">Equivalent Technical Values:</div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
            {unitKeys.slice(0, 4).map(u => {
              const val = (inputValue * fromFactor) / currentCatData.units[u];
              return (
                <div key={u} className="bg-white p-1.5 rounded border border-slate-200 truncate">
                  <span className="text-slate-500">{u}: </span>
                  <span className="font-bold text-slate-900">{val.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
