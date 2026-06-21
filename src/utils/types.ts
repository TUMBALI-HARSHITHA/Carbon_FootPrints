export interface EnergyInputs {
  electricity: number; // kWh per month
  gas: number;         // therms or m3 per month
  water: number;       // liters per day
}

export interface TransportInputs {
  carKm: number;       // km per week
  carType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  transitHours: number; // hours per week on bus/train
  flightsShort: number; // flights per year (< 3 hours)
  flightsLong: number;  // flights per year (> 3 hours)
}

export interface FoodInputs {
  dietType: 'heavy-meat' | 'low-meat' | 'vegetarian' | 'vegan';
  wasteIndex: 1 | 2 | 3 | 4 | 5; // 1 = minimal waste, 5 = high waste
  localRatio: number; // percentage of local/seasonal food (0 to 100)
}

export interface WasteInputs {
  bags: number;        // garbage bags per week (e.g. 50L bags)
  recycleRatio: number; // percentage recycled (0 to 100)
}

export interface FootprintData {
  energy: EnergyInputs;
  transport: TransportInputs;
  food: FoodInputs;
  waste: WasteInputs;
}

export interface CategoryEmissions {
  energy: number;      // kg CO2e per year
  transport: number;   // kg CO2e per year
  food: number;        // kg CO2e per year
  waste: number;       // kg CO2e per year
  total: number;       // kg CO2e per year
}

export interface LogEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  inputs: FootprintData;
  emissions: CategoryEmissions;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'transport' | 'food' | 'waste';
  potentialSavings: number; // kg CO2e saved per year
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'transport' | 'food' | 'waste';
  xp: number;
  completed: boolean;
  dateCompleted?: string;
}

export interface UserStats {
  totalXp: number;
  unlockedBadges: string[];
}
