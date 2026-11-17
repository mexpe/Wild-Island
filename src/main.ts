import './style.css';
import { Keyboard } from './input.ts';
import { createGame } from './state.ts';
import { update, nearHelm } from './simulation.ts';
import { render } from './render.ts';
import { unitsToMeters } from './space.ts';
import { createZoom, changeZoom, smoothZoom } from './zoom.ts';
const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas 2D non disponibile nel browser.');
const context = ctx;
const mode = document.querySelector<HTMLElement>('#mode')!;
const controls = document.querySelector<HTMLElement>('#controls')!;
const speed = document.querySelector<HTMLElement>('#speed')!;
const prompt = document.querySelector<HTMLElement>('#prompt')!;
const game = createGame();
const keyboard = new Keyboard();
const spaceZoom = createZoom();
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  if (game.mode === 'flight') changeZoom(spaceZoom, event.deltaY, event.deltaMode);
}, { passive: false });
let width = 0, height = 0;
function resize(): void {
  width = window.innerWidth; height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resize); resize();
let previous = performance.now();
function frame(now: number): void {
  // Ignore long suspended-tab gaps rather than performing a huge catch-up simulation.
  const dt = Math.min((now - previous) / 1000, .1); previous = now;
  update(game, keyboard.consume(), dt);
  if (game.mode === 'flight') smoothZoom(spaceZoom, dt);
  render(context, game, width, height, spaceZoom.current);
  const interior = game.mode === 'interior';
  mode.textContent = interior ? 'A bordo' : 'Navigazione';
  controls.textContent = interior ? 'W A S D  Muoviti\nE  Interagisci con il timone' : 'W  Accelera · S  Frena\nA D  Ruota\nE  Lascia il timone\nRotellina  Zoom · ' + spaceZoom.current.toFixed(2) + '×';
  speed.textContent = unitsToMeters(Math.hypot(game.ship.velocity.x, game.ship.velocity.y)).toFixed(1);
  prompt.textContent = interior && nearHelm(game) ? 'Premi E per pilotare' : '';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
