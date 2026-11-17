import { helm, tileSize, walkable } from './layout.ts';
import { tuning, type GameState, type Vector } from './state.ts';
import { moveShip, rotateShip, spaceRocks } from './collisions.ts';
import type { Asteroid } from './asteroids.ts';
import type { Controls } from './input.ts';
export function nearHelm(game: GameState): boolean {
  return Math.hypot(game.character.position.x - helm.x, game.character.position.y - helm.y) <= tuning.interactionRange;
}
export function canStand(position: Vector, radius: number): boolean {
  for (let row = Math.floor((position.y - radius) / tileSize); row <= Math.floor((position.y + radius) / tileSize); row++) {
    for (let col = Math.floor((position.x - radius) / tileSize); col <= Math.floor((position.x + radius) / tileSize); col++) {
      if (walkable(col, row)) continue;
      const x = Math.max(col * tileSize, Math.min(position.x, (col + 1) * tileSize));
      const y = Math.max(row * tileSize, Math.min(position.y, (row + 1) * tileSize));
      if (Math.hypot(position.x - x, position.y - y) < radius) return false;
    }
  }
  return true;
}
export function update(game: GameState, controls: Controls, dt: number, rocks: readonly Asteroid[] = spaceRocks): void {
  if (!Number.isFinite(dt) || dt <= 0) return;
  if (controls.interact) {
    if (game.mode === 'flight') {
      game.mode = 'interior';
      game.character.position = { x: helm.x, y: helm.y + tileSize };
    } else if (nearHelm(game)) game.mode = 'flight';
  }
  // Small substeps prevent tunnelling and keep the simulation stable at low frame rates.
  const steps = Math.ceil(dt / (1 / 120));
  const step = dt / steps;
  for (let i = 0; i < steps; i++) simulate(game, controls, step, rocks);
}
function simulate(game: GameState, controls: Controls, dt: number, rocks: readonly Asteroid[] = spaceRocks): void {
  const { ship, character } = game;
  ship.thrusting = game.mode === 'flight' && controls.w;
  if (game.mode === 'flight') {
    rotateShip(ship, (Number(controls.d) - Number(controls.a)) * tuning.rotationSpeed * dt, rocks);
    if (ship.thrusting) {
      ship.velocity.x += Math.sin(ship.angle) * tuning.acceleration * dt;
      ship.velocity.y -= Math.cos(ship.angle) * tuning.acceleration * dt;
    }
    if (controls.s) {
      const speed = Math.hypot(ship.velocity.x, ship.velocity.y);
      const ratio = speed > 0 ? Math.max(0, speed - tuning.braking * dt) / speed : 0;
      ship.velocity.x *= ratio; ship.velocity.y *= ratio;
    }
  } else {
    let x = Number(controls.d) - Number(controls.a), y = Number(controls.s) - Number(controls.w);
    const length = Math.hypot(x, y) || 1;
    x *= tuning.walkSpeed * dt / length; y *= tuning.walkSpeed * dt / length;
    const horizontal = { x: character.position.x + x, y: character.position.y };
    if (canStand(horizontal, character.radius)) character.position.x = horizontal.x;
    const vertical = { x: character.position.x, y: character.position.y + y };
    if (canStand(vertical, character.radius)) character.position.y = vertical.y;
  }
  // Always simulate the same ship, including while the character is walking inside.
  moveShip(ship, dt, rocks);
}
