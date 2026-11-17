import type { Vector } from './state.ts';
export type Polygon = readonly Vector[];
export const dot = (a: Vector, b: Vector): number => a.x * b.x + a.y * b.y;
const cross = (a: Vector, b: Vector, c: Vector) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
export function transformPolygon(polygon: Polygon, position: Vector, angle = 0): Vector[] {
  const c = Math.cos(angle), s = Math.sin(angle);
  return polygon.map(v => ({ x: position.x + v.x*c-v.y*s, y: position.y + v.x*s+v.y*c }));
}
export function axes(polygon: Polygon): Vector[] {
  return polygon.map((a,i) => { const b=polygon[(i+1)%polygon.length], length=Math.hypot(b.x-a.x,b.y-a.y); return {x:-(b.y-a.y)/length,y:(b.x-a.x)/length}; });
}
export function project(polygon: Polygon, axis: Vector): [number, number] {
  const values=polygon.map(v=>dot(v,axis)); return [Math.min(...values),Math.max(...values)];
}
// Ear clipping supports simple concave polygons; never treats their convex hull as solid.
export function triangulate(polygon: Polygon): Vector[][] {
  const points=[...polygon];
  const area=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a.x*b.y-b.x*a.y;},0);
  const sign=Math.sign(area), triangles: Vector[][]=[];
  while(points.length>3) {
    let found=false;
    for(let i=0;i<points.length;i++) {
      const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];
      if(cross(a,b,c)*sign<=1e-9) continue;
      if(points.some(p=>p!==a&&p!==b&&p!==c&&cross(a,b,p)*sign>=-1e-9&&cross(b,c,p)*sign>=-1e-9&&cross(c,a,p)*sign>=-1e-9)) continue;
      triangles.push([a,b,c]);points.splice(i,1);found=true;break;
    }
    if(!found) throw new Error('Poligono non semplice o degenere.');
  }
  triangles.push(points);return triangles;
}
export function convexOverlap(a: Polygon,b: Polygon): boolean {
  return [...axes(a),...axes(b)].every(axis=>{const [amin,amax]=project(a,axis),[bmin,bmax]=project(b,axis);return amax>bmin+1e-8&&bmax>amin+1e-8;});
}
export function trianglesOverlap(a: readonly Polygon[], b: readonly Polygon[]): boolean {
  return a.some(ta=>b.some(tb=>convexOverlap(ta,tb)));
}
export function sweepConvex(a: Polygon,b: Polygon, displacement: Vector): { time: number; normal: Vector } | null {
  let enter=-Infinity,exit=Infinity,normal={x:0,y:0};
  for(const axis of [...axes(a),...axes(b)]) {
    const [amin,amax]=project(a,axis),[bmin,bmax]=project(b,axis),speed=dot(displacement,axis);
    if(Math.abs(speed)<1e-12) {if(amax<=bmin+1e-9||bmax<=amin+1e-9)return null;continue;}
    const t1=(bmin-amax)/speed,t2=(bmax-amin)/speed;
    const start=Math.min(t1,t2),end=Math.max(t1,t2);
    if(start>enter) {enter=start;normal={x:axis.x*(speed>0?-1:1),y:axis.y*(speed>0?-1:1)};}
    exit=Math.min(exit,end);if(enter>exit)return null;
  }
  return enter>=-1e-9&&enter<=1&&exit>Math.max(0,enter) ? {time:Math.max(0,enter),normal}:null;
}
export function pointSegmentDistance(p: Vector,a: Vector,b: Vector): number {
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
export function polygonBoundaryDistance(a: Polygon,b: Polygon): number {
  let distance=Infinity;
  for(const [points,edges] of [[a,b],[b,a]]) for(const p of points) for(let i=0;i<edges.length;i++) distance=Math.min(distance,pointSegmentDistance(p,edges[i],edges[(i+1)%edges.length]));
  return distance;
}
