import type { SVGProps } from "react";

/** Facebook "f" mark (lucide no longer ships brand icons). Same API as lucide's size prop. */
export function FacebookIcon({ size = 20, ...rest }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M13.5 21.95V14.2h2.6l.4-3.03h-3v-1.93c0-.88.25-1.48 1.5-1.48h1.6V5.06a21.5 21.5 0 0 0-2.33-.12c-2.3 0-3.88 1.4-3.88 3.98v2.25H7.8v3.03h2.6v7.75A10 10 0 1 1 13.5 21.95Z" />
    </svg>
  );
}
