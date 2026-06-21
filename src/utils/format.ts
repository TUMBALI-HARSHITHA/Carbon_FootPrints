/**
 * Formats carbon dioxide equivalents (CO2e) in kilograms to user-friendly units
 * @param kgValue Emissions in kilograms
 * @returns String representation in tonnes (t) or kilograms (kg)
 */
export function formatEmissions(kgValue: number): string {
  if (kgValue >= 1000) {
    const tonnes = kgValue / 1000;
    // Returns e.g. "4.2 t" or "10.0 t"
    return `${tonnes.toFixed(1)} t`;
  }
  return `${Math.round(kgValue)} kg`;
}

/**
 * Formats user experience points (XP) to user-friendly labels
 * @param xp Experience points
 * @returns Formatted XP string e.g. "120 XP"
 */
export function formatXp(xp: number): string {
  return `${xp} XP`;
}
