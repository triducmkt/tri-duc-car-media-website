/**
 * Decorative ambient motion behind the founder portrait on the About page —
 * two slowly counter-rotating rings with a node on each, echoing the
 * satellite/strand motif from SystemHero and Diagnostic, but quiet enough
 * for a page that isn't trying to be a second hero. Pure CSS, no canvas.
 */
export function FounderAura() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <span className="animate-orbit-slow absolute inset-[-10%] rounded-[2.2rem] border border-gold-400/20">
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold-400/70" />
      </span>
      <span className="animate-orbit-slow-reverse absolute inset-[-18%] rounded-[2.6rem] border border-dashed border-gold-400/15">
        <span className="absolute -bottom-1 left-1/4 h-1.5 w-1.5 rounded-full bg-gold-400/50" />
      </span>
    </div>
  );
}
