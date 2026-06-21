import { describe, it, expect } from 'vitest';
import { calculateEmissions, DEFAULT_FOOTPRINT_DATA } from '../src/utils/formulas';
import type { FootprintData } from '../src/utils/types';
import { formatEmissions, formatXp } from '../src/utils/format';

describe('Carbon Footprint Mathematical Formulas', () => {
  it('should calculate zero emissions for empty baseline inputs', () => {
    const emptyInputs: FootprintData = {
      energy: { electricity: 0, gas: 0, water: 0 },
      transport: { carKm: 0, carType: 'petrol', transitHours: 0, flightsShort: 0, flightsLong: 0 },
      food: { dietType: 'vegan', wasteIndex: 1, localRatio: 0 },
      waste: { bags: 0, recycleRatio: 0 },
    };

    const result = calculateEmissions(emptyInputs);
    expect(result.energy).toBe(0);
    expect(result.transport).toBe(0);
    expect(result.food).toBe(800); // vegan base is 800
    expect(result.waste).toBe(0);
    expect(result.total).toBe(800);
  });

  it('should calculate energy emissions correctly', () => {
    const inputs: FootprintData = {
      ...DEFAULT_FOOTPRINT_DATA,
      energy: {
        electricity: 100, // 100 kWh * 12 * 0.4 = 480 kg
        gas: 50,          // 50 m3 * 12 * 1.9 = 1140 kg
        water: 200,       // 200 L * 365 * 0.0003 = 21.9 kg
      },
    };

    const result = calculateEmissions(inputs);
    expect(result.energy).toBe(1641.9); // 480 + 1140 + 21.9 = 1641.9
  });

  it('should calculate transport emissions based on car engine fuel type', () => {
    const carDistance = 100; // km per week
    
    const baseInput = {
      ...DEFAULT_FOOTPRINT_DATA,
      transport: {
        carKm: carDistance,
        carType: 'petrol' as const,
        transitHours: 0,
        flightsShort: 0,
        flightsLong: 0,
      }
    };

    // Petrol: 100 * 52 * 0.17 = 884
    const petrolResult = calculateEmissions(baseInput);
    expect(petrolResult.transport).toBe(884);

    // Electric: 100 * 52 * 0.05 = 260
    const electricInput = {
      ...baseInput,
      transport: { ...baseInput.transport, carType: 'electric' as const }
    };
    const electricResult = calculateEmissions(electricInput);
    expect(electricResult.transport).toBe(260);
  });

  it('should calculate diet food emissions with waste index and local ratios', () => {
    const inputs: FootprintData = {
      ...DEFAULT_FOOTPRINT_DATA,
      food: {
        dietType: 'heavy-meat', // base 2500
        wasteIndex: 3,         // (3-1) * 100 = 200
        localRatio: 50,        // 50% local -> reduces dietBase (2500) by 50% * 10% = 5% -> -125
      }
    };

    const result = calculateEmissions(inputs);
    expect(result.food).toBe(2575); // 2500 + 200 - 125 = 2575
  });

  it('should reduce waste emissions when recycle ratio is high', () => {
    const inputs: FootprintData = {
      ...DEFAULT_FOOTPRINT_DATA,
      waste: {
        bags: 2,           // 2 * 2.5 * 52 = 260 kg
        recycleRatio: 80,  // offsets waste by 80% * 50% = 40% -> -104 kg
      }
    };

    const result = calculateEmissions(inputs);
    expect(result.waste).toBe(156); // 260 - 104 = 156
  });

  describe('Formatting Utilities', () => {
    it('formats emissions under 1000 kg as kg', () => {
      expect(formatEmissions(350)).toBe('350 kg');
      expect(formatEmissions(999.4)).toBe('999 kg');
    });

    it('formats emissions 1000 kg or above as tonnes (t)', () => {
      expect(formatEmissions(1000)).toBe('1.0 t');
      expect(formatEmissions(4520)).toBe('4.5 t');
    });

    it('formats XP values correctly', () => {
      expect(formatXp(0)).toBe('0 XP');
      expect(formatXp(120)).toBe('120 XP');
    });
  });
});
