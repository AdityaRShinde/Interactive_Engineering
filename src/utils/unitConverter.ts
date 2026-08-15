export interface UnitDefinition {
  symbol: string;
  name: string;
  factorToBase: number; // Multiplier to convert this unit to standard base SI unit
  offsetToBase?: number; // For temperature (e.g. °C to K)
}

export interface UnitCategoryInfo {
  name: string;
  baseUnit: string;
  units: Record<string, UnitDefinition>;
}

export const UNIT_DATABASE: Record<string, UnitCategoryInfo> = {
  length: {
    name: 'Length & Displacement',
    baseUnit: 'm',
    units: {
      'm': { symbol: 'm', name: 'Meters', factorToBase: 1.0 },
      'cm': { symbol: 'cm', name: 'Centimeters', factorToBase: 0.01 },
      'mm': { symbol: 'mm', name: 'Millimeters', factorToBase: 0.001 },
      'km': { symbol: 'km', name: 'Kilometers', factorToBase: 1000.0 },
      'in': { symbol: 'in', name: 'Inches', factorToBase: 0.0254 },
      'ft': { symbol: 'ft', name: 'Feet', factorToBase: 0.3048 },
      'yd': { symbol: 'yd', name: 'Yards', factorToBase: 0.9144 }
    }
  },
  force: {
    name: 'Force & Load',
    baseUnit: 'N',
    units: {
      'N': { symbol: 'N', name: 'Newtons', factorToBase: 1.0 },
      'kN': { symbol: 'kN', name: 'Kilonewtons', factorToBase: 1000.0 },
      'MN': { symbol: 'MN', name: 'Meganewtons', factorToBase: 1000000.0 },
      'lbf': { symbol: 'lbf', name: 'Pounds-Force', factorToBase: 4.44822 },
      'kgf': { symbol: 'kgf', name: 'Kilograms-Force', factorToBase: 9.80665 }
    }
  },
  pressure: {
    name: 'Stress & Pressure',
    baseUnit: 'Pa',
    units: {
      'Pa': { symbol: 'Pa', name: 'Pascals (N/m²)', factorToBase: 1.0 },
      'kPa': { symbol: 'kPa', name: 'Kilopascals', factorToBase: 1000.0 },
      'MPa': { symbol: 'MPa', name: 'Megapascals (N/mm²)', factorToBase: 1000000.0 },
      'GPa': { symbol: 'GPa', name: 'Gigapascals', factorToBase: 1000000000.0 },
      'psi': { symbol: 'psi', name: 'Pounds/Sq Inch', factorToBase: 6894.76 },
      'ksi': { symbol: 'ksi', name: 'Kilo-psi', factorToBase: 6894760.0 },
      'bar': { symbol: 'bar', name: 'Bar', factorToBase: 100000.0 },
      'atm': { symbol: 'atm', name: 'Atmospheres', factorToBase: 101325.0 }
    }
  },
  energy: {
    name: 'Energy & Work',
    baseUnit: 'J',
    units: {
      'J': { symbol: 'J', name: 'Joules (N·m)', factorToBase: 1.0 },
      'kJ': { symbol: 'kJ', name: 'Kilojoules', factorToBase: 1000.0 },
      'MJ': { symbol: 'MJ', name: 'Megajoules', factorToBase: 1000000.0 },
      'cal': { symbol: 'cal', name: 'Calories', factorToBase: 4.184 },
      'kcal': { symbol: 'kcal', name: 'Kilocalories', factorToBase: 4184.0 },
      'Wh': { symbol: 'Wh', name: 'Watt-Hours', factorToBase: 3600.0 },
      'kWh': { symbol: 'kWh', name: 'Kilowatt-Hours', factorToBase: 3600000.0 },
      'BTU': { symbol: 'BTU', name: 'British Thermal Units', factorToBase: 1055.06 },
      'ft·lbf': { symbol: 'ft·lbf', name: 'Foot-Pounds', factorToBase: 1.35582 }
    }
  },
  power: {
    name: 'Power',
    baseUnit: 'W',
    units: {
      'W': { symbol: 'W', name: 'Watts (J/s)', factorToBase: 1.0 },
      'kW': { symbol: 'kW', name: 'Kilowatts', factorToBase: 1000.0 },
      'MW': { symbol: 'MW', name: 'Megawatts', factorToBase: 1000000.0 },
      'hp': { symbol: 'hp', name: 'Horsepower (metric/imperial)', factorToBase: 745.7 },
      'BTU/h': { symbol: 'BTU/h', name: 'BTU per Hour', factorToBase: 0.293071 }
    }
  },
  velocity: {
    name: 'Velocity & Speed',
    baseUnit: 'm/s',
    units: {
      'm/s': { symbol: 'm/s', name: 'Meters/Second', factorToBase: 1.0 },
      'km/h': { symbol: 'km/h', name: 'Kilometers/Hour', factorToBase: 1 / 3.6 },
      'mph': { symbol: 'mph', name: 'Miles/Hour', factorToBase: 0.44704 },
      'ft/s': { symbol: 'ft/s', name: 'Feet/Second', factorToBase: 0.3048 },
      'knot': { symbol: 'knot', name: 'Knots', factorToBase: 0.514444 }
    }
  },
  mass: {
    name: 'Mass',
    baseUnit: 'kg',
    units: {
      'kg': { symbol: 'kg', name: 'Kilograms', factorToBase: 1.0 },
      'g': { symbol: 'g', name: 'Grams', factorToBase: 0.001 },
      'mg': { symbol: 'mg', name: 'Milligrams', factorToBase: 0.000001 },
      'ton': { symbol: 'ton', name: 'Metric Tonnes', factorToBase: 1000.0 },
      'lb': { symbol: 'lb', name: 'Pounds (mass)', factorToBase: 0.453592 },
      'slug': { symbol: 'slug', name: 'Slugs', factorToBase: 14.5939 }
    }
  },
  area: {
    name: 'Area',
    baseUnit: 'm²',
    units: {
      'm²': { symbol: 'm²', name: 'Square Meters', factorToBase: 1.0 },
      'cm²': { symbol: 'cm²', name: 'Square Centimeters', factorToBase: 0.0001 },
      'mm²': { symbol: 'mm²', name: 'Square Millimeters', factorToBase: 0.000001 },
      'ft²': { symbol: 'ft²', name: 'Square Feet', factorToBase: 0.092903 },
      'in²': { symbol: 'in²', name: 'Square Inches', factorToBase: 0.00064516 }
    }
  },
  torque: {
    name: 'Torque & Moment',
    baseUnit: 'N·m',
    units: {
      'N·m': { symbol: 'N·m', name: 'Newton-Meters', factorToBase: 1.0 },
      'kN·m': { symbol: 'kN·m', name: 'Kilonewton-Meters', factorToBase: 1000.0 },
      'lbf·ft': { symbol: 'lbf·ft', name: 'Foot-Pounds', factorToBase: 1.35582 },
      'lbf·in': { symbol: 'lbf·in', name: 'Inch-Pounds', factorToBase: 0.112985 }
    }
  },
  temperature: {
    name: 'Temperature',
    baseUnit: 'K',
    units: {
      'K': { symbol: 'K', name: 'Kelvin', factorToBase: 1.0, offsetToBase: 0 },
      '°C': { symbol: '°C', name: 'Celsius', factorToBase: 1.0, offsetToBase: 273.15 },
      '°F': { symbol: '°F', name: 'Fahrenheit', factorToBase: 5 / 9, offsetToBase: 459.67 * (5 / 9) }
    }
  },
  voltage: {
    name: 'Voltage & Electric Potential',
    baseUnit: 'V',
    units: {
      'V': { symbol: 'V', name: 'Volts', factorToBase: 1.0 },
      'mV': { symbol: 'mV', name: 'Millivolts', factorToBase: 0.001 },
      'kV': { symbol: 'kV', name: 'Kilovolts', factorToBase: 1000.0 }
    }
  },
  current: {
    name: 'Electric Current',
    baseUnit: 'A',
    units: {
      'A': { symbol: 'A', name: 'Amperes', factorToBase: 1.0 },
      'mA': { symbol: 'mA', name: 'Milliamperes', factorToBase: 0.001 },
      'kA': { symbol: 'kA', name: 'Kiloamperes', factorToBase: 1000.0 }
    }
  },
  resistance: {
    name: 'Resistance & Impedance',
    baseUnit: 'Ω',
    units: {
      'Ω': { symbol: 'Ω', name: 'Ohms', factorToBase: 1.0 },
      'mΩ': { symbol: 'mΩ', name: 'Milliohms', factorToBase: 0.001 },
      'kΩ': { symbol: 'kΩ', name: 'Kiloohms', factorToBase: 1000.0 },
      'MΩ': { symbol: 'MΩ', name: 'Megaohms', factorToBase: 1000000.0 }
    }
  }
};

/**
 * Detects the unit category given an engineering unit string (e.g. 'MPa', 'm', 'N', 'kW')
 */
export function detectUnitCategory(unitStr: string): string | null {
  if (!unitStr) return null;
  const clean = unitStr.trim();

  for (const [catKey, catInfo] of Object.entries(UNIT_DATABASE)) {
    if (catInfo.units[clean]) return catKey;
  }

  // Soft matches
  const lower = clean.toLowerCase();
  if (lower.includes('pa') || lower.includes('psi') || lower.includes('bar') || lower.includes('n/m²') || lower.includes('n/mm²')) return 'pressure';
  if (lower.includes('n·m') || lower.includes('nm') || lower.includes('ft-lb') || lower.includes('ft·lbf')) return 'torque';
  if (lower.includes('n') || lower.includes('kn') || lower.includes('lbf')) return 'force';
  if (lower.includes('j') || lower.includes('cal') || lower.includes('btu') || lower.includes('wh')) return 'energy';
  if (lower.includes('w') || lower.includes('hp') || lower.includes('watt')) return 'power';
  if (lower.includes('m/s') || lower.includes('km/h') || lower.includes('mph') || lower.includes('fps')) return 'velocity';
  if (lower.includes('kg') || lower.includes('gram') || lower.includes('lb') || lower.includes('slug')) return 'mass';
  if (lower.includes('m²') || lower.includes('cm²') || lower.includes('mm²') || lower.includes('ft²') || lower.includes('in²')) return 'area';
  if (lower.includes('m') || lower.includes('cm') || lower.includes('mm') || lower.includes('ft') || lower.includes('inch') || lower.includes('in')) return 'length';
  if (lower.includes('k') || lower.includes('°c') || lower.includes('°f')) return 'temperature';
  if (lower.includes('v') || lower.includes('volt')) return 'voltage';
  if (lower.includes('a') || lower.includes('amp')) return 'current';
  if (lower.includes('ω') || lower.includes('ohm')) return 'resistance';

  return null;
}

/**
 * Converts a numerical value from fromUnit to toUnit within the same category
 */
export function convertValue(val: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return val;
  const category = detectUnitCategory(fromUnit) || detectUnitCategory(toUnit);
  if (!category || !UNIT_DATABASE[category]) return val;

  const cat = UNIT_DATABASE[category];
  const fromDef = cat.units[fromUnit];
  const toDef = cat.units[toUnit];

  if (!fromDef || !toDef) return val;

  // Temperature special case
  if (category === 'temperature') {
    let kelvin = val;
    if (fromUnit === '°C') kelvin = val + 273.15;
    else if (fromUnit === '°F') kelvin = (val - 32) * (5 / 9) + 273.15;

    if (toUnit === '°C') return kelvin - 273.15;
    if (toUnit === '°F') return (kelvin - 273.15) * (9 / 5) + 32;
    return kelvin;
  }

  // Base conversion
  const baseValue = val * fromDef.factorToBase;
  return baseValue / toDef.factorToBase;
}

/**
 * Returns available units for a given unit string
 */
export function getAvailableUnits(unitStr: string): UnitDefinition[] {
  const category = detectUnitCategory(unitStr);
  if (!category || !UNIT_DATABASE[category]) {
    return [{ symbol: unitStr, name: unitStr, factorToBase: 1.0 }];
  }
  return Object.values(UNIT_DATABASE[category].units);
}
