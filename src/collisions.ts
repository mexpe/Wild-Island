import { asteroidFields, type Asteroid } from './asteroids.ts';
import { hullLocal, hullRadius } from './hull.ts';
import { axes, dot, pointSegmentDistance, polygonBoundaryDistance, project, sweepConvex, transformPolygon, trianglesOverlap, triangulate } from './geometry.ts';
import type { Ship, Vector } from './state.ts';
export const collisionTuning = { restitution: .15, skin: .001, bounceThreshold: 1, maxContacts: 12 };
export const spaceRocks = asteroidFields.flatMap(field=>field.rocks);
const localTriangles=triangulate(hullLocal);
const cache=new WeakMap<Asteroid,{polygon:Vector[];triangles:Vector[][]}>();
function geometry(rock: Asteroid) {
  let result=cache.get(rock);
  if(!result) {const polygon=transformPolygon(rock.vertices,rock.position);result={polygon,triangles:triangulate(polygon)};cache.set(rock,result);}
  return result;
}
function shipGeometry(ship: Ship,angle=ship.angle) {
  return localTriangles.map(t=>transformPolygon(t,ship.position,angle));
}
function near(ship: Ship, rock: Asteroid, end=ship.position): boolean {
  return pointSegmentDistance(rock.position,ship.position,end)<=hullRadius+rock.radius+collisionTuning.skin;
}
function respond(ship: Ship,normal: Vector): void {
  const inward=dot(ship.velocity,normal);
  if(inward>=0)return;
  const restitution=-inward>collisionTuning.bounceThreshold?collisionTuning.restitution:0;
  ship.velocity.x-=(1+restitution)*inward*normal.x;
  ship.velocity.y-=(1+restitution)*inward*normal.y;
}
// Recovery for an initially overlapping pose; normal motion is stopped at time of impact.
function depenetrate(ship: Ship,rocks: readonly Asteroid[]): void {
  for(let iteration=0;iteration<collisionTuning.maxContacts;iteration++) {
    let corrected=false;
    for(const rock of rocks) {
      if(!near(ship,rock))continue;
      const obstacle=geometry(rock);
      if(!trianglesOverlap(shipGeometry(ship),obstacle.triangles))continue;
      const polygon=transformPolygon(hullLocal,ship.position,ship.angle);
      let best=Infinity,normal={x:0,y:0};
      for(const axis of [...axes(polygon),...axes(obstacle.polygon)]) {
        const [amin,amax]=project(polygon,axis),[bmin,bmax]=project(obstacle.polygon,axis);
        for(const [depth,sign] of [[bmax-amin,1],[amax-bmin,-1]]) if(depth>=0&&depth<best){best=depth;normal={x:axis.x*sign,y:axis.y*sign};}
      }
      ship.position.x+=normal.x*(best+collisionTuning.skin);ship.position.y+=normal.y*(best+collisionTuning.skin);
      respond(ship,normal);corrected=true;
    }
    if(!corrected)break;
  }
}
export function rotateShip(ship: Ship,delta: number,rocks: readonly Asteroid[]=spaceRocks): void {
  if(delta===0)return;
  const candidates=rocks.filter(r=>near(ship,r));
  if(!candidates.length){ship.angle=(ship.angle+delta)%(Math.PI*2);return;}
  depenetrate(ship,candidates);
  let remaining=delta;
  // Conservative advancement: no point on the rotating hull moves farther than
  // radius * angle. This also detects obstacles crossed between two clear poses.
  for(let i=0;i<256&&Math.abs(remaining)>1e-12;i++) {
    const polygon=transformPolygon(hullLocal,ship.position,ship.angle);
    const distance=Math.min(...candidates.map(r=>polygonBoundaryDistance(polygon,geometry(r).polygon)));
    const step=Math.sign(remaining)*Math.min(Math.abs(remaining),Math.max(collisionTuning.skin/hullRadius,distance*.8/hullRadius));
    const next=shipGeometry(ship,ship.angle+step);
    if(candidates.some(r=>trianglesOverlap(next,geometry(r).triangles)))return;
    ship.angle=(ship.angle+step)%(Math.PI*2);remaining-=step;
  }
}
export function moveShip(ship: Ship,dt: number,rocks: readonly Asteroid[]=spaceRocks): void {
  depenetrate(ship,rocks);
  let remaining=dt;
  for(let iteration=0;iteration<collisionTuning.maxContacts&&remaining>1e-12;iteration++) {
    const displacement={x:ship.velocity.x*remaining,y:ship.velocity.y*remaining};
    const end={x:ship.position.x+displacement.x,y:ship.position.y+displacement.y};
    const triangles=shipGeometry(ship);
    const timeTolerance=collisionTuning.skin/Math.max(1,Math.hypot(displacement.x,displacement.y));
    let time=Infinity;let normals:Vector[]=[];
    for(const rock of rocks) {
      if(!near(ship,rock,end))continue;
      for(const a of triangles)for(const b of geometry(rock).triangles) {
        const hit=sweepConvex(a,b,displacement);if(!hit)continue;
        if(hit.time<time-timeTolerance){time=hit.time;normals=[hit.normal];}
        else if(Math.abs(hit.time-time)<timeTolerance&&!normals.some(n=>dot(n,hit.normal)>.99999))normals.push(hit.normal);
      }
    }
    if(time===Infinity){ship.position.x=end.x;ship.position.y=end.y;return;}
    ship.position.x+=displacement.x*time;ship.position.y+=displacement.y*time;
    for(const normal of normals){ship.position.x+=normal.x*collisionTuning.skin;ship.position.y+=normal.y*collisionTuning.skin;respond(ship,normal);}
    remaining*=1-time;
  }
}
