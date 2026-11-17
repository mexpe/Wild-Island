import { helm, tileSize } from './layout.ts';
export interface Vector { x: number; y: number }
export interface Ship { position: Vector; velocity: Vector; angle: number; thrusting: boolean }
export interface Character { position: Vector; radius: number }
export interface GameState { mode: 'interior' | 'flight'; ship: Ship; character: Character }
export const tuning = { walkSpeed: 115, acceleration: 85, rotationSpeed: 1.8, braking: 65, interactionRange: 57 };
export function createGame(): GameState {
  return { mode: 'interior', ship: { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, angle: 0, thrusting: false }, character: { position: { x: helm.x, y: 7.5 * tileSize }, radius: 9 } };
}
