import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createZoom, changeZoom, smoothZoom, zoomTuning } from '../src/zoom.ts';
import { render } from '../src/render.ts';
import { createGame } from '../src/state.ts';
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9);
test('wheel direction, proportional steps, delta modes and bounds', () => {
  const zoom = createZoom(); assert.equal(zoom.current, 1);
  changeZoom(zoom, -100); close(zoom.target, 1.15);
  changeZoom(zoom, 100); close(zoom.target, 1);
  changeZoom(zoom, -1e6); assert.equal(zoom.target, zoomTuning.max);
  changeZoom(zoom, 1e6); assert.equal(zoom.target, zoomTuning.min);
  const pixels = createZoom(), lines = createZoom();
  changeZoom(pixels, -100); changeZoom(lines, -6.25, 1);
  close(pixels.target, lines.target);
});
test('smoothing is gradual, bounded and independent of frame rate', () => {
  const a = createZoom(), b = createZoom();
  changeZoom(a, -1000); changeZoom(b, -1000);
  smoothZoom(a, 1 / 60); assert.ok(a.current > 1 && a.current < a.target);
  for (let i = 1; i < 60; i++) smoothZoom(a, 1 / 60);
  for (let i = 0; i < 30; i++) smoothZoom(b, 1 / 30);
  close(a.current, b.current); assert.equal(a.current, 3);
});
function recordingContext() {
  const calls: Array<[string, ...number[]]> = [];
  const ctx = new Proxy({}, { get(_target, property) {
    return (...args: number[]) => { calls.push([String(property), ...args]); };
  } }) as CanvasRenderingContext2D;
  return { ctx, calls };
}
test('flight scales ship and stars equally around screen center without mutating game', () => {
  const game = createGame(); game.mode = 'flight';
  const original = structuredClone(game);
  for (const [width, height] of [[1280,800], [900,650]]) for (const zoom of [.25,1,3]) {
    const { ctx, calls } = recordingContext();
    render(ctx, game, width, height, zoom);
    const scales = calls.filter(([name]) => name === 'scale');
    assert.equal(scales.length, 2); assert.deepEqual(scales[0], scales[1]);
    const translations = calls.filter(([name]) => name === 'translate');
    assert.deepEqual(translations[0], ['translate', width / 2, height / 2]);
    assert.deepEqual(translations[2], ['translate', width / 2, height / 2]);
  }
  assert.deepEqual(game, original);
});
test('interior rendering is identical at all space zoom levels', () => {
  const game = createGame(); const a = recordingContext(), b = recordingContext();
  render(a.ctx, game, 1280, 800, .25); render(b.ctx, game, 1280, 800, 3);
  assert.deepEqual(a.calls, b.calls);
});
