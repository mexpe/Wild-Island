import { metersToUnits } from './space.ts';
import type { Vector } from './state.ts';
export interface Asteroid {
  position: Vector;
  diameter: number;
  radius: number;
  vertices: Vector[];
  faces: string[];
}
export interface AsteroidField { position: Vector; radius: number; rocks: Asteroid[] }
export function generateAsteroidFields(seed = 73129): AsteroidField[] {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const between = (min: number, max: number) => min + random() * (max - min);
  function rock(position: Vector, diameterMeters: number): Asteroid {
    const count = 9 + Math.floor(random() * 5), angle = random() * Math.PI * 2;
    const vertices = Array.from({ length: count }, (_, i) => {
      const a = angle + i * Math.PI * 2 / count;
      const radius = between(.72, 1);
      return { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
    });
    // Diameter is the largest axis-aligned span of the final, oriented geometry.
    const xs = vertices.map(v => v.x), ys = vertices.map(v => v.y);
    const factor = metersToUnits(diameterMeters) / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    for (const vertex of vertices) { vertex.x *= factor; vertex.y *= factor; }
    const brown = random() > .5;
    const shade = between(75, 105);
    const faces = vertices.map(v => {
      const light = Math.round(shade + (-v.x - v.y) / metersToUnits(diameterMeters) * 35);
      return brown ? `rgb(${light + 15},${light + 4},${light - 6})` : `rgb(${light},${light + 4},${light + 8})`;
    });
    return { position, diameter: metersToUnits(diameterMeters), radius: Math.max(...vertices.map(v => Math.hypot(v.x, v.y))), vertices, faces };
  }
  const fields: AsteroidField[] = [];
  for (let i = 0; i < 10; i++) {
    let position: Vector;
    do {
      position = i === 0 ? { x: metersToUnits(200), y: 0 } : { x: metersToUnits(between(-2300, 2300)), y: metersToUnits(between(-2300, 2300)) };
    } while (fields.some(f => Math.hypot(f.position.x - position.x, f.position.y - position.y) < metersToUnits(450)));
    const rocks = [rock({ ...position }, i === 0 ? 60 : between(50, 100))];
    const count = 15 + Math.floor(random() * 16), extent = metersToUnits(between(125, 175));
    const axis = random() * Math.PI * 2;
    for (let j = 0; j < count; j++) {
      const diameter = j < 3 ? between(10, 20) : j % 2 === 0 ? between(5, 10) : between(2, 5);
      const fragment = rock({ x: 0, y: 0 }, diameter);
      let placed = false;
      for (let attempt = 0; attempt < 2000; attempt++) {
        const angle = j < 2 ? axis + j * Math.PI : random() * Math.PI * 2;
        const distance = j < 2 ? extent : between(rocks[0].radius + fragment.radius + metersToUnits(5), extent);
        fragment.position = { x: position.x + Math.cos(angle) * distance, y: position.y + Math.sin(angle) * distance };
        if (rocks.every(other => Math.hypot(other.position.x - fragment.position.x, other.position.y - fragment.position.y) > other.radius + fragment.radius + metersToUnits(2))) { placed = true; break; }
      }
      if (!placed) throw new Error('Impossibile posizionare il frammento senza sovrapposizioni.');
      rocks.push(fragment);
    }
    fields.push({ position, rocks, radius: Math.max(...rocks.map(r => Math.hypot(r.position.x - position.x, r.position.y - position.y) + r.radius)) });
  }
  return fields;
}
// Generazione unica: nessuna geometria o posizione dipende dai frame o dalla nave.
export const asteroidFields = generateAsteroidFields();
export function visibleRock(rock: { position: Vector; radius: number }, center: Vector, width: number, height: number): boolean {
  return Math.abs(rock.position.x - center.x) <= width / 2 + rock.radius && Math.abs(rock.position.y - center.y) <= height / 2 + rock.radius;
}
