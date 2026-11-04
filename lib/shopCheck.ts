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

/** Ad attribution captured on landing and sent with the lead.
 *  `from` = Kiến thức article that sent the visitor (RadarPrompt). */
export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "nganh", "from"] as const;

/** Which axis each Kiến thức article is about (RadarPrompt at the end of the
 *  article asks that axis' question). Slug wins, then category. */
const ARTICLE_AXIS: Record<string, CheckAxis> = {
  "quang-cao-khong-ra-don-nguyen-nhan": "khach-moi",
  "marketing-dung-du-deu-xuong-xe-spa-gym": "khach-moi",
  "he-thong-marketing-cho-chu-co-so": "khach-moi",
  "chuan-hoa-kenh-online-ap-car-care": "kenh",
  "nhan-su-content-lam-gi": "kenh",
  "mo-chi-nhanh-thu-hai-khi-nao": "so-lieu",
};
const CATEGORY_AXIS: Record<string, CheckAxis> = {
  "van-hanh": "doi-ngu",
  "he-thong": "khach-moi",
  "khach-hang": "khach-cu",
  "noi-dung": "kenh",
  "thuong-hieu": "kenh",
};

export function axisForArticle(slug: string, category?: string): CheckAxis {
  return ARTICLE_AXIS[slug] ?? (category ? CATEGORY_AXIS[category] : undefined) ?? "doi-ngu";
}

/** Articles per axis, for the landing page's internal links. */
export function articlesByAxis<T extends { slug: string; category?: string }>(posts: T[]) {
  const out = Object.fromEntries(AXIS_KEYS.map((k) => [k, [] as T[]])) as Record<CheckAxis, T[]>;
  for (const p of posts) out[axisForArticle(p.slug, p.category)].push(p);
  return out;
}

/** Client only: the first external referrer of the visit (e.g. google.com),
 *  so a lead says whether it came from organic search. */
const ENTRY_KEY = "td-entry-ref";
export function entryReferrer(): string {
  try {
    const saved = sessionStorage.getItem(ENTRY_KEY);
    if (saved !== null) return saved;
    const ref = document.referrer ? new URL(document.referrer).hostname : "";
    const external = ref && ref !== window.location.hostname ? ref : "";
    sessionStorage.setItem(ENTRY_KEY, external || "(direct)");
    return external || "(direct)";
  } catch {
    return "";
  }
}

export function checkScore(values: Partial<Record<CheckAxis, number>>) {
  const sum = AXIS_KEYS.reduce((s, k) => s + (values[k] ?? 0), 0);
  return Math.round((sum / (AXIS_KEYS.length * (LEVELS - 1))) * 100);
}

/** Lowest-scoring axis (first one wins a tie, in AXIS_KEYS order). */
export function weakestAxis(values: Partial<Record<CheckAxis, number>>): CheckAxis {
  return AXIS_KEYS.reduce((w, k) => ((values[k] ?? 0) < (values[w] ?? 0) ? k : w), AXIS_KEYS[0]);
}
