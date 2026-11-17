import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, type Ship } from '../src/state.ts';
import { moveShip, rotateShip, collisionTuning } from '../src/collisions.ts';
import { hullLocal } from '../src/hull.ts';
import { triangulate, transformPolygon, trianglesOverlap } from '../src/geometry.ts';
import { update } from '../src/simulation.ts';
import type { Asteroid } from '../src/asteroids.ts';
const idle={w:false,a:false,s:false,d:false,interact:false};
function polygon(vertices: number[][], x=0,y=0): Asteroid {
  const points=vertices.map(([x,y])=>({x,y}));
  return {position:{x,y},vertices:points,radius:Math.max(...points.map(v=>Math.hypot(v.x,v.y))),diameter:100,faces:points.map(()=> '#888')};
}
const wall=polygon([[-100,-2000],[100,-2000],[100,2000],[-100,2000]],500);
const overlap=(ship:Ship,rock:Asteroid)=>trianglesOverlap(triangulate(transformPolygon(hullLocal,ship.position,ship.angle)),triangulate(transformPolygon(rock.vertices,rock.position)));
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('frontal impact applies restitution, corrects contact and cannot penetrate',()=>{
  const ship=createGame().ship;ship.velocity={x:1000,y:0};
  moveShip(ship,1,[wall]);
  close(ship.velocity.x,-1000*collisionTuning.restitution);assert.ok(ship.position.x<202);assert.equal(overlap(ship,wall),false);
});
test('side impact preserves tangential speed and slides along wall',()=>{
  const ship=createGame().ship;ship.velocity={x:1000,y:200};
  moveShip(ship,.5,[wall]);
  close(ship.velocity.y,200);close(ship.position.y,100);assert.ok(ship.velocity.x<0);assert.equal(overlap(ship,wall),false);
});
test('small 2m debris blocks even extremely fast translation',()=>{
  const debris=polygon([[-36,-36],[36,-36],[36,36],[-36,36]],500);
  for(const speed of [2000,1e7]) {
    const ship=createGame().ship;ship.velocity.x=speed;
    moveShip(ship,.01,[debris]);
    if(speed===2000) moveShip(ship,.3,[debris]);
    assert.ok(ship.velocity.x<0);assert.ok(ship.position.x<500);assert.equal(overlap(ship,debris),false);
  }
});
test('rotated hull uses its precise world geometry',()=>{
  const ship=createGame().ship;ship.angle=Math.PI/2;ship.velocity.x=1000;
  moveShip(ship,.2,[wall]);
  assert.ok(ship.velocity.x<0);assert.ok(ship.position.x<184);assert.equal(overlap(ship,wall),false);
});
test('rotation stops before contact, including a clear end pose beyond the obstacle',()=>{
  const obstacle=polygon([[-100,-2000],[100,-2000],[100,2000],[-100,2000]],320);
  const ship=createGame().ship;
  assert.equal(overlap(ship,obstacle),false);
  ship.angle=Math.PI;assert.equal(overlap(ship,obstacle),false);ship.angle=0;
  rotateShip(ship,Math.PI,[obstacle]);
  assert.ok(ship.angle>0&&ship.angle<Math.PI);assert.equal(overlap(ship,obstacle),false);
  const stopped=ship.angle;rotateShip(ship,-.1,[obstacle]);assert.ok(ship.angle<stopped);
  close(Math.hypot(ship.velocity.x,ship.velocity.y),0);
});
test('collisions remain active while walking inside; character stays local',()=>{
  const game=createGame();const start={...game.character.position};game.ship.velocity.x=1000;
  update(game,{...idle,w:true},.5,[wall]);
  assert.equal(game.mode,'interior');assert.ok(game.ship.velocity.x<0);assert.equal(overlap(game.ship,wall),false);
  close(game.character.position.x,start.x);assert.ok(game.character.position.y<start.y);
});
test('steady thrust does not jitter or add energy; reversing thrust leaves contact',()=>{
  const game=createGame();game.mode='flight';game.ship.angle=Math.PI/2;game.ship.position.x=201.999;
  for(let i=0;i<240;i++)update(game,{...idle,w:true},1/120,[wall]);
  assert.ok(game.ship.position.x<=202);assert.ok(Math.abs(game.ship.velocity.x)<1e-6);assert.equal(overlap(game.ship,wall),false);
  game.ship.angle=-Math.PI/2;const before=game.ship.position.x;
  update(game,{...idle,w:true},1,[wall]);assert.ok(game.ship.position.x<before-30);
});
test('initial penetration recovers and outward motion is allowed',()=>{
  const ship=createGame().ship;ship.position.x=350;ship.velocity.x=-100;
  moveShip(ship,.1,[wall]);
  assert.equal(overlap(ship,wall),false);close(ship.velocity.x,-100);assert.ok(ship.position.x<202);
});
test('concave polygon cavity is empty despite overlapping bounds',()=>{
  const obstacle=polygon([[300,-500],[1100,-500],[1100,500],[1000,500],[1000,-400],[400,-400],[400,500],[300,500]]);
  const ship=createGame().ship;ship.position={x:700,y:0};ship.velocity.y=100;
  assert.equal(overlap(ship,obstacle),false);moveShip(ship,.2,[obstacle]);
  close(ship.position.x,700);close(ship.position.y,20);close(ship.velocity.y,100);
});
test('free flight preserves exact inertia and rotation',()=>{
  const game=createGame();game.mode='flight';game.ship.velocity={x:120,y:-40};
  update(game,{...idle,d:true},1,[]);
  close(game.ship.position.x,120);close(game.ship.position.y,-40);close(game.ship.angle,1.8);
  close(game.ship.velocity.x,120);close(game.ship.velocity.y,-40);
});
test('all generated asteroid and debris polygons deflect a fast rotated hull without gaining energy',async()=>{
  const { asteroidFields }=await import('../src/asteroids.ts');
  for(const [i,rock] of asteroidFields.flatMap(f=>f.rocks).entries()) {
    const ship=createGame().ship;ship.angle=(i%12)*Math.PI/6;
    ship.position={x:rock.position.x-rock.radius-1000,y:rock.position.y};ship.velocity.x=200000;
    moveShip(ship,.02,[rock]);
    assert.ok(ship.velocity.x<200000-1e-6,`No contact for rock ${i}`);
    assert.ok(Math.hypot(ship.velocity.x,ship.velocity.y)<=200000+1e-6);
    assert.equal(overlap(ship,rock),false,`Penetration for rock ${i}`);
  }
});
