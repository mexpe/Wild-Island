import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/state.ts';
import { update, canStand, nearHelm } from '../src/simulation.ts';
import { helm, tileSize } from '../src/layout.ts';
const idle = { w: false, a: false, s: false, d: false, interact: false };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
test('cardinal and diagonal walking have equal speed', () => {
  const straight = createGame(), diagonal = createGame();
  update(straight, { ...idle, d: true }, .1);
  update(diagonal, { ...idle, d: true, s: true }, .1);
  const origin = createGame().character.position;
  close(Math.hypot(straight.character.position.x - origin.x, straight.character.position.y - origin.y), Math.hypot(diagonal.character.position.x - origin.x, diagonal.character.position.y - origin.y));
});
test('walls and exterior block walking, including long updates', () => {
  const game = createGame();
  update(game, { ...idle, a: true }, 5);
  assert.ok(canStand(game.character.position, game.character.radius));
  assert.ok(game.character.position.x >= tileSize * 2 + game.character.radius);
  game.character.position = { x: 3.5 * tileSize, y: 7.5 * tileSize };
  update(game, { ...idle, s: true }, 3);
  assert.ok(game.character.position.y <= 8 * tileSize - game.character.radius + 1);
  assert.equal(canStand({ x: -10, y: 0 }, 9), false);
});
test('spawn can reach helm; interaction requires proximity', () => {
  const game = createGame();
  update(game, { ...idle, interact: true }, .01);
  assert.equal(game.mode, 'interior');
  update(game, { ...idle, w: true }, 1.7);
  assert.ok(nearHelm(game));
  update(game, { ...idle, interact: true }, .01);
  assert.equal(game.mode, 'flight');
});
test('thrust follows orientation; rotation preserves momentum; brake cannot reverse', () => {
  const game = createGame(); game.mode = 'flight';
  update(game, { ...idle, w: true }, 1);
  close(game.ship.velocity.x, 0); close(game.ship.velocity.y, -85);
  update(game, { ...idle, d: true }, 1);
  close(game.ship.velocity.x, 0); close(game.ship.velocity.y, -85);
  const previous = { ...game.ship.velocity };
  update(game, { ...idle, w: true }, .1);
  assert.ok(game.ship.velocity.x > previous.x);
  update(game, { ...idle, s: true }, 10);
  close(Math.hypot(game.ship.velocity.x, game.ship.velocity.y), 0);
});
test('same ship and world state survive repeated mode switches and interior coasting', () => {
  const game = createGame(); const ship = game.ship;
  game.character.position = { ...helm };
  for (let i = 0; i < 8; i++) {
    update(game, { ...idle, interact: true }, .01);
    assert.equal(game.mode, 'flight');
    update(game, { ...idle, w: true, d: true }, .2);
    const angle = ship.angle, velocity = { ...ship.velocity };
    update(game, { ...idle, interact: true, w: true }, .01);
    assert.equal(game.mode, 'interior'); assert.equal(game.ship, ship); assert.equal(ship.thrusting, false);
    close(ship.angle, angle); close(ship.velocity.x, velocity.x); close(ship.velocity.y, velocity.y);
    const position = { ...ship.position };
    update(game, idle, 2);
    close(ship.position.x, position.x + velocity.x * 2); close(ship.position.y, position.y + velocity.y * 2);
    assert.ok(nearHelm(game));
  }
});
test('simulation is consistent across frame rates', () => {
  const a = createGame(), b = createGame(); a.mode = b.mode = 'flight';
  for (let i = 0; i < 30; i++) update(a, { ...idle, w: true, d: true }, 1 / 30);
  for (let i = 0; i < 120; i++) update(b, { ...idle, w: true, d: true }, 1 / 120);
  close(a.ship.position.x, b.ship.position.x); close(a.ship.position.y, b.ship.position.y);
});
