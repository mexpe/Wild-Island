import { layout, tileSize, helm } from './layout.ts';
import type { GameState } from './state.ts';
import { asteroidFields, visibleRock } from './asteroids.ts';
import { scaleBar } from './space.ts';
const hull = [[4,0],[9,0],[9,1],[10,1],[10,2],[11,2],[11,3],[12,3],[12,10],[11,10],[11,12],[2,12],[2,10],[1,10],[1,3],[2,3],[2,2],[3,2],[3,1],[4,1]];
function hash(x: number, y: number): number {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function stars(ctx: CanvasRenderingContext2D, width: number, height: number, x: number, y: number, scale = 1): void {
  const cell = 95;
  // Stable subset of the same world stars at distant zooms; bounded screen density.
  const stride = 2 ** Math.max(0, Math.floor(Math.log2(1 / scale)));
  for (let row = Math.floor((y - height / 2) / (cell * stride)) * stride - stride; row <= Math.ceil((y + height / 2) / cell); row += stride) {
    for (let col = Math.floor((x - width / 2) / (cell * stride)) * stride - stride; col <= Math.ceil((x + width / 2) / cell); col += stride) {
      const brightness = hash(col + 97, row - 43);
      ctx.fillStyle = `rgba(181,209,230,${0.18 + brightness * 0.65})`;
      ctx.fillRect(col * cell + hash(col, row) * cell - x + width / 2, row * cell + hash(row, col + 5) * cell - y + height / 2, Math.max(.6 / scale, brightness > .92 ? 2 : 1), Math.max(.6 / scale, brightness > .92 ? 2 : 1));
    }
  }
}
function hullPath(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  hull.forEach(([x,y],i) => { if (i === 0) ctx.moveTo(x * tileSize, y * tileSize); else ctx.lineTo(x * tileSize, y * tileSize); });
  ctx.closePath();
}
export function render(ctx: CanvasRenderingContext2D, game: GameState, width: number, height: number, zoom = 1): void {
  ctx.fillStyle = '#070c14'; ctx.fillRect(0, 0, width, height);
  const flight = game.mode === 'flight';
  const fit = Math.max(.15, Math.min(1, (height - 175) / (layout.length * tileSize), (width * .65) / (layout[0].length * tileSize)));
  const scale = flight ? fit * zoom : fit;
  if (flight) {
    // Same world-to-screen scale and center for stars and ship; cull in world units.
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-width / (2 * scale), -height / (2 * scale));
    stars(ctx, width / scale, height / scale, game.ship.position.x, game.ship.position.y, scale);
    drawAsteroids(ctx, game, width / scale, height / scale);
    ctx.restore();
  } else stars(ctx, width, height, game.ship.position.x, game.ship.position.y);
  if (flight) {
    if (layout.length * tileSize * scale < 10) {
      drawScale(ctx, width, height, scale);
      ctx.beginPath(); ctx.moveTo(width / 2, height / 2 - 6);
      ctx.lineTo(width / 2 + 5, height / 2 + 4); ctx.lineTo(width / 2 - 5, height / 2 + 4);
      ctx.closePath(); ctx.fillStyle = '#79e5ff'; ctx.fill();
      return;
    }
  }
  ctx.save();
  // Preserve the original interior framing; flight is centered on the viewport.
  const centerX = flight ? width / 2 : width > 800 ? width * .59 : width * .62;
  ctx.translate(centerX, flight ? height / 2 : height * .53);
  ctx.scale(scale, scale);
  if (game.mode === 'flight') ctx.rotate(game.ship.angle);
  ctx.translate(-layout[0].length * tileSize / 2, -layout.length * tileSize / 2);
  hullPath(ctx); ctx.fillStyle = '#293744'; ctx.fill(); ctx.strokeStyle = '#8b9ca9'; ctx.lineWidth = 2; ctx.stroke();
  if (game.mode === 'interior') {
    for (let row = 0; row < layout.length; row++) for (let col = 0; col < layout[row].length; col++) {
      const tile = layout[row][col]; if (tile === ' ') continue;
      const x = col * tileSize, y = row * tileSize;
      ctx.fillStyle = tile === '#' ? '#6b7a86' : '#26333f'; ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      if (tile === '#') { ctx.fillStyle = '#8996a0'; ctx.fillRect(x + 2, y + 2, tileSize - 4, 3); }
      else { ctx.strokeStyle = '#35434f'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, tileSize - 1, tileSize - 1); }
    }
    ctx.fillStyle = '#6bdfeb'; ctx.fillRect(helm.x - 13, helm.y - 10, 26, 15);
    ctx.fillStyle = '#1f596b'; ctx.fillRect(helm.x - 10, helm.y - 7, 20, 6);
    const { position, radius } = game.character;
    ctx.beginPath(); ctx.arc(position.x, position.y, radius + 4, 0, Math.PI * 2); ctx.fillStyle = '#e8b86c25'; ctx.fill();
    ctx.beginPath(); ctx.arc(position.x, position.y, radius, 0, Math.PI * 2); ctx.fillStyle = '#efbf7b'; ctx.fill();
    ctx.strokeStyle = '#ffdfa9'; ctx.lineWidth = 2; ctx.stroke();
  } else {
    // Solid hull: the interior grid is never drawn in flight.
    ctx.fillStyle = '#395667'; ctx.beginPath(); ctx.moveTo(5 * tileSize, 2 * tileSize); ctx.lineTo(8 * tileSize, 2 * tileSize); ctx.lineTo(8.5 * tileSize, 3.5 * tileSize); ctx.lineTo(4.5 * tileSize, 3.5 * tileSize); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#526572'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6.5 * tileSize, 4 * tileSize); ctx.lineTo(6.5 * tileSize, 10 * tileSize); ctx.stroke();
    ctx.fillStyle = '#8eacb8'; ctx.fillRect(6.1 * tileSize, 5 * tileSize, .8 * tileSize, 1.8 * tileSize);
  }
  for (const x of [3.5, 8.5]) {
    ctx.fillStyle = '#475966'; ctx.fillRect(x * tileSize, 11.6 * tileSize, tileSize, 20);
    ctx.fillStyle = '#82dfec'; ctx.fillRect(x * tileSize + 5, 12.1 * tileSize, tileSize - 10, 4);
    if (game.ship.thrusting) {
      ctx.beginPath(); ctx.moveTo(x * tileSize + 5, 12.25 * tileSize); ctx.lineTo((x + .5) * tileSize, 13.5 * tileSize); ctx.lineTo((x + 1) * tileSize - 5, 12.25 * tileSize); ctx.fillStyle = '#79e5ff'; ctx.fill();
    }
  }
  ctx.restore();
  if (flight) drawScale(ctx, width, height, scale);
}

function drawAsteroids(ctx: CanvasRenderingContext2D, game: GameState, width: number, height: number): void {
  const center = game.ship.position;
  for (const field of asteroidFields) {
    if (!visibleRock(field, center, width, height)) continue;
    for (const rock of field.rocks) {
      if (!visibleRock(rock, center, width, height)) continue;
      const x = rock.position.x - center.x + width / 2, y = rock.position.y - center.y + height / 2;
      for (let i = 0; i < rock.vertices.length; i++) {
        const a = rock.vertices[i], b = rock.vertices[(i + 1) % rock.vertices.length];
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + a.x, y + a.y); ctx.lineTo(x + b.x, y + b.y); ctx.closePath();
        ctx.fillStyle = rock.faces[i]; ctx.fill();
      }
      ctx.beginPath(); rock.vertices.forEach((v, i) => { if (i === 0) ctx.moveTo(x + v.x, y + v.y); else ctx.lineTo(x + v.x, y + v.y); });
      ctx.closePath(); ctx.strokeStyle = '#938d7c'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}
function drawScale(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number): void {
  const bar = scaleBar(scale), right = width - 32, y = height - 105;
  ctx.save(); ctx.strokeStyle = '#8da6b7'; ctx.fillStyle = '#a9c2d0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(right - bar.pixels, y - 4); ctx.lineTo(right - bar.pixels, y);
  ctx.lineTo(right, y); ctx.lineTo(right, y - 4); ctx.stroke();
  ctx.font = '11px monospace'; ctx.textAlign = 'right'; ctx.fillText(bar.label, right, y - 10); ctx.restore();
}
