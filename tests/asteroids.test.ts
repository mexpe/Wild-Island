import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAsteroidFields, asteroidFields, visibleRock } from '../src/asteroids.ts';
import { metersToUnits, unitsToMeters, scaleBar } from '../src/space.ts';
import { layout, tileSize } from '../src/layout.ts';
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-8);
test('one cell is one meter; 60m body has five times the 12m hull span', () => {
  close(unitsToMeters(tileSize), 1);
  assert.equal(layout.length, 12);
  const main = asteroidFields[0].rocks[0];
  const xs = main.vertices.map(v => v.x), ys = main.vertices.map(v => v.y);
  const actualSpan = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  close(unitsToMeters(actualSpan), 60);
  close(actualSpan / (layout.length * tileSize), 5);
});
test('fixed seed reproduces global positions, faces and cached irregular geometry', () => {
  assert.deepEqual(generateAsteroidFields(), asteroidFields);
  assert.notDeepEqual(generateAsteroidFields(5), asteroidFields);
  for (const field of asteroidFields) for (const rock of field.rocks) {
    assert.ok(rock.vertices.length >= 9);
    const radii = rock.vertices.map(v => Math.hypot(v.x, v.y));
    assert.ok(Math.max(...radii) - Math.min(...radii) > .1);
    assert.equal(rock.faces.length, rock.vertices.length);
  }
});
test('ten fields within 5km square, one 200m away, all size classes and no overlaps', () => {
  assert.equal(asteroidFields.length, 10);
  close(unitsToMeters(Math.hypot(asteroidFields[0].position.x, asteroidFields[0].position.y)), 200);
  for (const field of asteroidFields) {
    const [main, ...fragments] = field.rocks;
    assert.ok(unitsToMeters(main.diameter) >= 50 && unitsToMeters(main.diameter) <= 100);
    assert.ok(fragments.length >= 15 && fragments.length <= 30);
    assert.ok(unitsToMeters(field.radius * 2) >= 200 && unitsToMeters(field.radius * 2) <= 400);
    for (const [min,max] of [[2,5],[5,10],[10,20]]) assert.ok(fragments.some(r => unitsToMeters(r.diameter) >= min && unitsToMeters(r.diameter) <= max));
    for (const rock of field.rocks) {
      assert.ok(Math.abs(rock.position.x) + rock.radius <= metersToUnits(2500));
      assert.ok(Math.abs(rock.position.y) + rock.radius <= metersToUnits(2500));
      for (const other of field.rocks) if (other !== rock) {
        assert.ok(Math.hypot(other.position.x - rock.position.x, other.position.y - rock.position.y) > rock.radius + other.radius);
      }
    }
  }
});
test('culling retains partially visible objects and follows world camera', () => {
  const rock = { position: { x: 100, y: 0 }, radius: 10 };
  assert.equal(visibleRock(rock, { x: 0, y: 0 }, 100, 100), false);
  assert.equal(visibleRock(rock, { x: 45, y: 0 }, 100, 100), true);
  assert.equal(visibleRock(rock, { x: 100, y: 100 }, 100, 100), false);
});
test('scale bar uses physical meters/kilometers and bounded screen length', () => {
  assert.equal(scaleBar(1).label, '2 m');
  assert.equal(scaleBar(.001).label, '2 km');
  for (const scale of [.001,.01,.1,1,3]) assert.ok(scaleBar(scale).pixels > 0 && scaleBar(scale).pixels <= 120);
});
