import { layout, tileSize } from './layout.ts';
import type { Vector } from './state.ts';
// Unica sagoma dello scafo, nelle coordinate locali della griglia (ugelli decorativi esclusi).
export const hullOutline: Vector[] = [[4,0],[9,0],[9,1],[10,1],[10,2],[11,2],[11,3],[12,3],[12,10],[11,10],[11,12],[2,12],[2,10],[1,10],[1,3],[2,3],[2,2],[3,2],[3,1],[4,1]].map(([x,y]) => ({ x: x * tileSize, y: y * tileSize }));
export const hullLocal = hullOutline.map(v => ({ x: v.x - layout[0].length * tileSize / 2, y: v.y - layout.length * tileSize / 2 }));
export const hullRadius = Math.max(...hullLocal.map(v => Math.hypot(v.x, v.y)));
