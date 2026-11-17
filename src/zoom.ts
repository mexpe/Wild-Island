// Stato esclusivamente visivo, indipendente dalla simulazione della nave.
export const zoomTuning = { default: 1, min: .01, max: 3, step: 1.15, pixelsPerStep: 100, smoothing: 12 };
export function createZoom() { return { current: zoomTuning.default, target: zoomTuning.default }; }
export type SpaceZoom = ReturnType<typeof createZoom>;
export function changeZoom(zoom: SpaceZoom, deltaY: number, deltaMode = 0): void {
  if (!Number.isFinite(deltaY)) return;
  const pixels = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 800 : 1);
  const steps = Math.max(-100, Math.min(100, pixels / zoomTuning.pixelsPerStep));
  zoom.target = Math.max(zoomTuning.min, Math.min(zoomTuning.max, zoom.target * zoomTuning.step ** -steps));
}
export function smoothZoom(zoom: SpaceZoom, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0) return;
  zoom.current += (zoom.target - zoom.current) * (1 - Math.exp(-zoomTuning.smoothing * dt));
  if (Math.abs(zoom.target - zoom.current) < .0001) zoom.current = zoom.target;
}
