"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/tracking/grid";
import { HERO_FRAME_COUNT, HERO_STEP_STARTS } from "@/lib/heroFrames";
import { Lockup } from "@/components/Lockup";

/** Home hero: scroll-scrubbed real footage of a Trí Đức working session
 *  (AP Car Care visit + AP Education work session, 12/09/2025). Frames are
 *  pre-graded WebP stills from scripts/build-hero-frames.mjs — desktop shows
 *  them in a 3:4 card beside the copy, mobile full-bleed. Scrolling through
 *  the tall stage scrubs the footage; captions follow the 5 reel steps
 *  (messages → reel.steps). Neighbouring frames are cross-faded, so the
 *  sparse frame set still reads as continuous motion. */

const STEPS = HERO_STEP_STARTS.length;
const ZALO_URL = "https://zalo.me/0769918685";
// Load order: a coarse pass first so any scroll position has a nearby frame,
// then fill the gaps.
const PASSES = [8, 4, 2, 1];

const frameUrl = (set: "d" | "m", i: number) =>
  `/hero/${set}/${String(i + 1).padStart(3, "0")}.webp`;

const stepOf = (frame: number) => {
  let s = 0;
  for (let k = 0; k < STEPS; k++) if (frame >= HERO_STEP_STARTS[k]) s = k;
  return s;
};

type Props = {
  /** Anchor the skip link scrolls to. */
  skipHref?: string;
};

export function FootageHero({ skipHref = "#tinh-gio" }: Props) {
  const tHero = useTranslations("systemHero");
  const t = useTranslations("reel");
  const steps = t.raw("steps") as { title: string; text: string }[];

  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const cv = canvasRef.current;
    if (!stage || !cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set: "d" | "m" = window.matchMedia("(min-width: 1024px)").matches ? "d" : "m";
    const frames: (ImageBitmap | HTMLImageElement | null)[] = new Array(HERO_FRAME_COUNT).fill(null);
    let disposed = false;

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        if (frames[i] || disposed) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(set, i);
        img
          .decode()
          .then((): Promise<ImageBitmap | HTMLImageElement> | HTMLImageElement =>
            "createImageBitmap" in window ? createImageBitmap(img) : img,
          )
          .then((bmp) => {
            if (disposed) return;
            frames[i] = bmp;
            if (i === 0) setReady(true);
          })
          .catch(() => {})
          .finally(resolve);
      });

    (async () => {
      await load(0);
      for (const step of PASSES) {
        const batch: number[] = [];
        for (let i = 0; i < HERO_FRAME_COUNT; i += step) if (!frames[i]) batch.push(i);
        // A few requests in flight at a time keeps the main thread smooth.
        for (let k = 0; k < batch.length; k += 6) {
          if (disposed) return;
          await Promise.all(batch.slice(k, k + 6).map(load));
        }
      }
    })();

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";
      drawn = -1;
    };

    // Nearest loaded frame at or before / after i.
    const below = (i: number) => {
      for (let k = i; k >= 0; k--) if (frames[k]) return k;
      return -1;
    };
    const above = (i: number) => {
      for (let k = i; k < HERO_FRAME_COUNT; k++) if (frames[k]) return k;
      return -1;
    };

    const cover = (img: ImageBitmap | HTMLImageElement) => {
      const iw = img.width, ih = img.height;
      const s = Math.max(W / iw, H / ih);
      const w = iw * s, h = ih * s;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    };

    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let pT = 0, p = 0, raf = 0, drawn = -1, lastStep = 0;
    const seen = new Set<number>([0]);

    const readScroll = () => {
      const r = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      pT = clamp(-r.top / (total || 1));
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      p += (pT - p) * (reduce ? 1 : 0.14);
      if (Math.abs(pT - p) < 0.0002) p = pT;

      // The opening title holds for the first 8% of the stage, then the
      // footage scrubs across the rest.
      const f = clamp((p - 0.08) / 0.9) * (HERO_FRAME_COUNT - 1);
      const key = Math.round(f * 50);
      if (key !== drawn && W && H) {
        const a = below(Math.floor(f));
        const b = above(Math.ceil(f));
        if (a >= 0 || b >= 0) {
          const lo = a >= 0 ? a : b;
          const hi = b >= 0 ? b : a;
          cover(frames[lo]!);
          if (hi !== lo) {
            ctx.globalAlpha = (f - lo) / (hi - lo);
            cover(frames[hi]!);
            ctx.globalAlpha = 1;
          }
          drawn = key;
        }
      }

      const s = stepOf(Math.round(f));
      if (s !== lastStep) {
        lastStep = s;
        setStep(s);
        if (!seen.has(s)) {
          seen.add(s);
          trackEvent("hero_step", { step: s + 1 });
        }
      }
      if (openRef.current) {
        const o = 1 - clamp(p / 0.07);
        openRef.current.style.setProperty("--open", String(o));
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp((p - 0.08) / 0.9)})`;
    };

    const onResize = () => { resize(); readScroll(); };
    resize();
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", onResize);
      frames.forEach((fr) => fr && "close" in fr && fr.close());
    };
  }, []);

  const s = steps[step];

  const stepBlock = (
    <div key={step} className="flex animate-[fadeUp_.45s_ease] flex-col gap-1.5" aria-live="polite">
      <p className="font-display text-sm font-semibold text-brand-400">
        {String(step + 1).padStart(2, "0")} / {String(STEPS).padStart(2, "0")}
      </p>
      <p className="font-serif text-2xl font-bold sm:text-3xl">{s.title}</p>
      <p className="text-white/70 sm:text-lg">{s.text}</p>
    </div>
  );

  const rail = (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-1.5">
        {steps.map((item, k) => (
          <span
            key={item.title}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${
              k <= step ? "bg-brand-400" : "bg-white/15"
            }`}
          />
        ))}
      </div>
      <div ref={barRef} aria-hidden className="h-px origin-left scale-x-0 bg-white/30" />
    </div>
  );

  const ctas = (
    <div className="flex flex-wrap gap-3">
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("hero_cta", { channel: "zalo" })}
        className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-500"
      >
        <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
      </a>
      <Link
        href="/booking"
        onClick={() => trackEvent("hero_cta", { channel: "booking" })}
        className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/60"
      >
        {t("ctaBook")}
      </Link>
    </div>
  );

  return (
    <section
      ref={stageRef}
      aria-label={tHero("ariaLabel")}
      className="relative h-[460vh] bg-ink text-white lg:h-[520vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Soft ink glow behind the card (desktop). */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-[radial-gradient(60%_70%_at_72%_50%,rgba(110,166,247,0.08),transparent_70%)] lg:block"
        />

        <div className="relative mx-auto grid h-full w-full max-w-7xl lg:grid-cols-[1fr_minmax(0,0.82fr)] lg:items-center lg:gap-16 lg:px-8">
          {/* Footage: full-bleed on mobile, a 3:4 card on desktop. */}
          <figure className="absolute inset-0 m-0 lg:relative lg:inset-auto lg:order-2 lg:mx-auto lg:aspect-[3/4] lg:w-[min(100%,calc(min(80svh,780px)*0.75))] lg:overflow-hidden lg:rounded-2xl lg:shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] lg:ring-1 lg:ring-brand-400/25">
            {/* Frame 1 doubles as the instant-paint poster and reduced-data fallback. */}
            <picture>
              <source media="(min-width: 1024px)" srcSet={frameUrl("d", 0)} />
              <img
                src={frameUrl("m", 0)}
                alt=""
                fetchPriority="high"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  ready ? "opacity-0" : "opacity-100"
                }`}
              />
            </picture>
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,32,0.92)_0%,rgba(11,18,32,0.6)_34%,rgba(11,18,32,0.3)_50%,rgba(11,18,32,0.82)_64%,rgba(11,18,32,0.97)_84%)] lg:bg-[linear-gradient(180deg,transparent_60%,rgba(11,18,32,0.75)_100%)]"
            />
            <figcaption className="absolute bottom-3 right-4 hidden text-[11px] tracking-wide text-white/55 lg:block">
              {tHero("footageNote")}
            </figcaption>
          </figure>

          {/* Copy column. */}
          <div className="relative flex h-full flex-col justify-between px-4 pb-20 pt-24 sm:px-6 sm:pb-8 lg:order-1 lg:h-auto lg:justify-center lg:gap-10 lg:p-0">
            <div
              ref={openRef}
              className="flex max-w-xl flex-col gap-4 [--open:1] max-lg:opacity-[var(--open)] max-lg:[transform:translateY(calc((1-var(--open))*-24px))]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                {tHero("open.eyebrow")}
              </p>
              <Lockup
                as="h1"
                size="hero"
                reveal="load"
                accent={tHero("open.accent")}
                anchor={tHero("open.lockupAnchor")}
              />
              <p className="max-w-lg text-white/70 sm:text-lg">{tHero("open.sub")}</p>
            </div>

            <div className="flex max-w-xl flex-col gap-6">
              {stepBlock}
              {rail}
              {ctas}
              <div className="flex items-center justify-between gap-4 text-[11px] text-white/45">
                <span className="lg:hidden">{tHero("footageNote")}</span>
                <a href={skipHref} className="shrink-0 underline-offset-4 transition hover:text-white hover:underline">
                  {tHero("skip")} ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
