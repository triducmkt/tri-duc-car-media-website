import type { TypedObject } from "@portabletext/types";

/** ~200 words/minute for Vietnamese reading. */
export function readingMinutes(blocks?: TypedObject[]) {
  const text = (blocks ?? [])
    .flatMap((b) => ((b as { children?: { text?: string }[] }).children ?? []).map((c) => c.text ?? ""))
    .join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}
