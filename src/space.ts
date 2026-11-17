import { tileSize } from './layout.ts';
// Una cella = un metro. La simulazione conserva le unità e i parametri originali.
export const unitsPerMeter = tileSize;
export const metersToUnits = (meters: number): number => meters * unitsPerMeter;
export const unitsToMeters = (units: number): number => units / unitsPerMeter;
export function scaleBar(scale: number) {
  const maxMeters = unitsToMeters(120 / scale);
  const magnitude = 10 ** Math.floor(Math.log10(maxMeters));
  const meters = [5, 2, 1].map(n => n * magnitude).find(n => n <= maxMeters)!;
  return { pixels: metersToUnits(meters) * scale, label: meters >= 1000 ? `${meters / 1000} km` : `${meters} m` };
}
