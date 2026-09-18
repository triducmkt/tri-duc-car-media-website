/**
 * Non-translatable layout data for SystemHero: scroll positions, 3D
 * coordinates and animation timing. Copy lives in messages/*.json under
 * "systemHero" — these arrays are matched to it by index.
 */

export type CapLayout = {
  from: number;
  to: number;
  hit?: boolean;
};

// from / to are scroll positions within the stage, 0 → 1. Keep at least a
// 0.06 gap between two captions. Must stay in the same order as
// messages/*.json → systemHero.caps.
export const CAP_LAYOUT: CapLayout[] = [
  { from: 0.04, to: 0.16 },
  { from: 0.18, to: 0.375 },
  { from: 0.405, to: 0.485, hit: true },
  { from: 0.5, to: 0.685 },
  { from: 0.705, to: 0.845 },
];

// Must stay in the same order as messages/*.json → systemHero.satellites.
export const SATELLITE_POS: { x: number; y: number; z: number }[] = [
  { x: -360, y: 210, z: 70 },
  { x: 360, y: 210, z: 70 },
  { x: -360, y: -190, z: 70 },
  { x: 360, y: -190, z: 70 },
];
