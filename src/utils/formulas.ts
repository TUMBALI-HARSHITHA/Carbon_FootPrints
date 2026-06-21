import type { FootprintData, CategoryEmissions } from './types';

// Constants for CO2 calculation (in kg CO2e)
export const EMISSION_FACTORS = {
  // Energy (electricity in kWh, gas in m3, water in L)
  electricityKwh: 0.4,     // kg CO2e per kWh (grid average)
  gasM3: 1.9,              // kg CO2e per m3
  waterLiter: 0.0003,      // kg CO2e per liter

  // Transport
  carType: {
    petrol: 0.17,          // kg CO2e per km
    diesel: 0.16,          // kg CO2e per km
    hybrid: 0.10,          // kg CO2e per km
    electric: 0.05,        // kg CO2e per km (charging carbon intensity)
  },
  transitHourKmSpeed: 25,  // assume average speed of 25 km/h for transit
  transitKm: 0.04,         // kg CO2e per passenger-km

  flightShort: 250,        // kg CO2e per short-haul flight (<3 hrs, ~800km)
  flightLong: 1000,        // kg CO2e per long-haul flight (>3 hrs, ~6000km)

  // Diet (base kg CO2e per year)
  diet: {
    'heavy-meat': 2500,
    'low-meat': 1700,
    vegetarian: 1200,
    vegan: 800,
  },
  foodWasteMultiplier: 100, // 100 kg CO2e per index level (1 to 5)

  // Waste (weekly 50L bag of landfill waste)
  garbageBagYearly: 2.5 * 52, // 2.5 kg CO2e per bag * 52 weeks
};

/**
 * Calculates annual CO2 emissions (in kg) based on input data
 */
export function calculateEmissions(data: FootprintData): CategoryEmissions {
  // 1. Energy Calculation (annualized)
  const electricityAnnual = data.energy.electricity * 12 * EMISSION_FACTORS.electricityKwh;
  const gasAnnual = data.energy.gas * 12 * EMISSION_FACTORS.gasM3;
  const waterAnnual = data.energy.water * 365 * EMISSION_FACTORS.waterLiter;
  const energy = Math.max(0, electricityAnnual + gasAnnual + waterAnnual);

  // 2. Transport Calculation (annualized)
  const carAnnual = data.transport.carKm * 52 * EMISSION_FACTORS.carType[data.transport.carType];
  const transitAnnual = data.transport.transitHours * EMISSION_FACTORS.transitHourKmSpeed * 52 * EMISSION_FACTORS.transitKm;
  const flightsShortAnnual = data.transport.flightsShort * EMISSION_FACTORS.flightShort;
  const flightsLongAnnual = data.transport.flightsLong * EMISSION_FACTORS.flightLong;
  const transport = Math.max(0, carAnnual + transitAnnual + flightsShortAnnual + flightsLongAnnual);

  // 3. Food Calculation (annualized)
  const dietBase = EMISSION_FACTORS.diet[data.food.dietType];
  const foodWaste = (data.food.wasteIndex - 1) * EMISSION_FACTORS.foodWasteMultiplier;
  // Local food reduction: local ratio offsets up to 10% of base food emissions
  const localOffset = dietBase * (data.food.localRatio / 100) * 0.10;
  const food = Math.max(0, dietBase + foodWaste - localOffset);

  // 4. Waste Calculation (annualized)
  const rawWaste = data.waste.bags * EMISSION_FACTORS.garbageBagYearly;
  // Recycling offset: recycling up to 50% of landfill emissions
  const recyclingOffset = rawWaste * (data.waste.recycleRatio / 100) * 0.50;
  const waste = Math.max(0, rawWaste - recyclingOffset);

  const total = energy + transport + food + waste;

  return {
    energy: Math.round(energy * 10) / 10,
    transport: Math.round(transport * 10) / 10,
    food: Math.round(food * 10) / 10,
    waste: Math.round(waste * 10) / 10,
    total: Math.round(total * 10) / 10,
  };
}

/**
 * Default empty footprint data values
 */
export const DEFAULT_FOOTPRINT_DATA: FootprintData = {
  energy: {
    electricity: 0,
    gas: 0,
    water: 0,
  },
  transport: {
    carKm: 0,
    carType: 'petrol',
    transitHours: 0,
    flightsShort: 0,
    flightsLong: 0,
  },
  food: {
    dietType: 'low-meat',
    wasteIndex: 3,
    localRatio: 0,
  },
  waste: {
    bags: 0,
    recycleRatio: 0,
  },
};
