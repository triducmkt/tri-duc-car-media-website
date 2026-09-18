/**
 * Non-translatable layout and scoring data for Diagnostic: 3D module
 * positions, the dependency graph and the question → module mapping. Copy
 * lives in messages/*.json under "diagnostic" — matched to this by key/index.
 */

export type ModuleKey = "MKT" | "SALES" | "CSKH" | "SOP" | "DATA";

export const MODULE_LAYOUT: { k: ModuleKey; x: number; y: number; z: number }[] = [
  { k: "MKT", x: 0, y: 210, z: -40 },
  { k: "SALES", x: 225, y: 45, z: 30 },
  { k: "CSKH", x: 140, y: -185, z: -10 },
  { k: "SOP", x: -140, y: -185, z: -10 },
  { k: "DATA", x: -225, y: 45, z: 30 },
];

export const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];

// A red block drags these modules with it — the source of the "oh wow" moment.
export const DEPENDENCIES: Record<ModuleKey, ModuleKey[]> = {
  CSKH: ["MKT"],
  DATA: ["MKT", "SALES"],
  SOP: ["SALES"],
  SALES: ["MKT"],
  MKT: [],
};

// Priority order when several modules tie for the lowest score.
export const PRIORITY: ModuleKey[] = ["CSKH", "DATA", "SALES", "SOP", "MKT"];

// Which services-page package each bottleneck points to. CSKH and DATA both
// point at the SME OS platform package, so they share the "DATA" id.
export const PACKAGE_FOR_MODULE: Record<ModuleKey, string> = {
  MKT: "MKT",
  SALES: "SALES",
  CSKH: "DATA",
  SOP: "SOP",
  DATA: "DATA",
};

// Must stay in the same order as messages/*.json → diagnostic.questions.
export const QUESTION_MODULES: ModuleKey[] = ["MKT", "SALES", "CSKH", "SOP", "DATA", "CSKH"];

// Each question's 3 options are always ordered best → worst.
export const OPTION_SCORES: [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2] = [2, 1, 0];
