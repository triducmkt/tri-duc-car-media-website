/** "Kiểm tra cơ sở 60 giây" — ads landing page (/check). Five axes, each
 *  answered on a 0–3 scale; copy in messages → check.axes.<key>.
 *  `caseSlug` is the real case shown when that axis is the weakest. */
export const CHECK_AXES = {
  "khach-moi": { caseSlug: "khang-vu-auto-care" },
  "khach-cu": { caseSlug: "ap-car-care" },
  "doi-ngu": { caseSlug: "johnny-loc-nguyen-he-sinh-thai-ap" },
  kenh: { caseSlug: "hoc-vien-detailing-viet-nam" },
  "so-lieu": { caseSlug: "ap-car-care" },
} as const;

export type CheckAxis = keyof typeof CHECK_AXES;
export const AXIS_KEYS = Object.keys(CHECK_AXES) as CheckAxis[];
export const LEVELS = 4; // answers 0..3

/** Industry variants for ad groups: /kiem-tra-co-so?nganh=gara → message-matched H1. */
export const INDUSTRY_VARIANTS = ["gara", "cham-soc-xe", "spa", "gym", "dao-tao"] as const;

/** Ad attribution captured on landing and sent with the lead. */
export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "nganh"] as const;

export function checkScore(values: Partial<Record<CheckAxis, number>>) {
  const sum = AXIS_KEYS.reduce((s, k) => s + (values[k] ?? 0), 0);
  return Math.round((sum / (AXIS_KEYS.length * (LEVELS - 1))) * 100);
}

/** Lowest-scoring axis (first one wins a tie, in AXIS_KEYS order). */
export function weakestAxis(values: Partial<Record<CheckAxis, number>>): CheckAxis {
  return AXIS_KEYS.reduce((w, k) => ((values[k] ?? 0) < (values[w] ?? 0) ? k : w), AXIS_KEYS[0]);
}
