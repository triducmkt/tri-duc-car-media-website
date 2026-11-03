/** "Bản sao cơ sở" (components/case-studies/CaseTwin.tsx): 4 quick questions
 *  about the visitor's shop, scored against the real profile of each case
 *  study. Labels live in messages → caseStudies.twin.questions.<key>.options.
 *  Profiles come from the published case studies (hq/02-CASE-STUDIES.md);
 *  add one here when a new case study is published. */

export const TWIN_QUESTIONS = {
  industry: { weight: 40, options: ["car-care", "garage", "beauty", "training", "other"] },
  scale: { weight: 20, options: ["one", "few", "expand"] },
  channels: { weight: 20, options: ["none", "some", "steady"] },
  goal: { weight: 20, options: ["new", "retain", "owner"] },
} as const;

export type TwinKey = keyof typeof TWIN_QUESTIONS;
export const TWIN_KEYS = Object.keys(TWIN_QUESTIONS) as TwinKey[];
export type TwinAnswers = Partial<Record<TwinKey, string>>;
type Profile = Record<TwinKey, string>;

export const CASE_PROFILES: Record<string, Profile> = {
  // 2 branches, brand built on returning customers (60%+ of revenue).
  "ap-car-care": { industry: "car-care", scale: "few", channels: "some", goal: "retain" },
  // Near-silent fanpage before July 2026, single shop.
  "khang-vu-auto-care": { industry: "car-care", scale: "one", channels: "none", goal: "new" },
  // Single shop in Rach Gia, Facebook existed, TikTok started from zero.
  "apex-autocare": { industry: "car-care", scale: "one", channels: "some", goal: "new" },
  // Training academy (HCMC + Bac Ninh), recovering prospective students.
  "hoc-vien-detailing-viet-nam": { industry: "training", scale: "few", channels: "some", goal: "new" },
  // Founder hands marketing to an external CMO to lead a 5-brand expansion.
  "johnny-loc-nguyen-he-sinh-thai-ap": { industry: "car-care", scale: "expand", channels: "steady", goal: "owner" },
};

// Partial credit between neighbouring industries (same marketing playbook).
const NEAR: Record<string, Record<string, number>> = {
  "car-care": { garage: 0.6, beauty: 0.3, training: 0.3, other: 0.15 },
  garage: { "car-care": 0.6, beauty: 0.25, training: 0.25, other: 0.15 },
  beauty: { "car-care": 0.3, garage: 0.25, training: 0.45, other: 0.2 },
  training: { "car-care": 0.3, garage: 0.25, beauty: 0.45, other: 0.2 },
  other: { "car-care": 0.15, garage: 0.15, beauty: 0.2, training: 0.2 },
};
const NEAR_SCALE: Record<string, Record<string, number>> = {
  one: { few: 0.5, expand: 0.3 },
  few: { one: 0.5, expand: 0.6 },
  expand: { few: 0.6, one: 0.3 },
};

/** Per-question match (0..1) between the visitor and one case. */
export function matchParts(answers: TwinAnswers, slug: string): Partial<Record<TwinKey, number>> {
  const p = CASE_PROFILES[slug];
  if (!p) return {};
  const out: Partial<Record<TwinKey, number>> = {};
  for (const k of TWIN_KEYS) {
    const a = answers[k];
    if (!a) continue;
    if (a === p[k]) out[k] = 1;
    else if (k === "industry") out[k] = NEAR[a]?.[p[k]] ?? 0;
    else if (k === "scale") out[k] = NEAR_SCALE[a]?.[p[k]] ?? 0;
    else out[k] = 0;
  }
  return out;
}

/** Similarity in % over the questions answered so far. */
export function similarity(answers: TwinAnswers, slug: string) {
  const parts = matchParts(answers, slug);
  let got = 0, max = 0;
  for (const k of TWIN_KEYS) {
    if (parts[k] === undefined) continue;
    got += parts[k]! * TWIN_QUESTIONS[k].weight;
    max += TWIN_QUESTIONS[k].weight;
  }
  return max ? Math.round((got / max) * 100) : 0;
}

/** The published case closest to the visitor (ties keep the current one). */
export function bestMatch(answers: TwinAnswers, current: string, slugs: string[]) {
  let best = current, bestPct = similarity(answers, current);
  for (const s of slugs) {
    if (!CASE_PROFILES[s]) continue;
    const pct = similarity(answers, s);
    if (pct > bestPct) {
      best = s;
      bestPct = pct;
    }
  }
  return { slug: best, pct: bestPct };
}
