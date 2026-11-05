"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { COMPANY } from "@/lib/company";
import {
  COMBOS,
  HAS_ESTIMATES,
  SERVICES,
  comboListTotal,
  formatVnd,
  partValue,
  serviceBySlug,
  shortVnd,
  type Locale,
  type Service,
} from "@/lib/servicesCatalog";
import { trackEvent } from "@/lib/tracking/grid";

/** Dịch vụ → #bang-gia. Price table with single services and combos, and a
 *  three.js "price tower": the chosen combo's services drop in as stacked
 *  blocks (height = what each costs bought separately), a ghost frame marks
 *  the separate total, then a green price plane slides down to the combo price
 *  — the saving is the gap. A single service shows as one block.
 *  Data: lib/servicesCatalog.ts. Copy: messages → pricing. */

type Pick = { kind: "combo"; key: string } | { kind: "single"; slug: string };
type Seg = { label: string; value: number };

const SEG_COLORS = [0x0a6fb8, 0x17a85a, 0x3aa3ec, 0x45d17f, 0x085d9b];
const H = 2.6;
const hexOf = (i: number) => `#${SEG_COLORS[i % SEG_COLORS.length].toString(16).padStart(6, "0")}`;

function unitLabel(s: Service, t: ReturnType<typeof useTranslations>) {
  return s.price.unit === "month" ? t("perMonth") : t("once");
}

export function PriceStudio() {
  const t = useTranslations("pricing");
  const locale = useLocale() as Locale;
  const [pick, setPick] = useState<Pick>({ kind: "combo", key: COMBOS[0].key });
  // No WebGL (old phone, GPU blocked): show the same tower as plain CSS bars.
  const [noGL, setNoGL] = useState(false);
  const state = useRef<{ segs: Seg[]; list: number; price: number; token: number }>({ segs: [], list: 0, price: 0, token: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const segLabels = useRef<(HTMLSpanElement | null)[]>([]);
  const listLabel = useRef<HTMLSpanElement>(null);
  const priceLabel = useRef<HTMLSpanElement>(null);

  // What the tower shows for the current pick.
  const combo = pick.kind === "combo" ? COMBOS.find((c) => c.key === pick.key)! : null;
  const single = pick.kind === "single" ? serviceBySlug(pick.slug)! : null;
  const segs: Seg[] = combo
    ? combo.parts.map((p) => ({ label: serviceBySlug(p.slug)!.short[locale], value: partValue(p) }))
    : single
      ? [{ label: single.short[locale], value: partValue({ slug: single.slug }) }]
      : [];
  const list = segs.reduce((s, x) => s + x.value, 0);
  const price = combo?.price ?? list;
  const saving = combo && combo.price ? list - combo.price : 0;

  useEffect(() => {
    state.current = { segs, list, price, token: state.current.token + 1 };
    // segs is derived from pick; re-run only when the pick changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick, locale]);

  useEffect(() => {
    const host = canvasHost.current;
    const section = sectionRef.current;
    if (!host || !section) return;
    let disposed = false;
    let cleanup = () => {};
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const THREE = await import("three");
        if (disposed) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          setNoGL(true);
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        const stage = new THREE.Group();
        scene.add(stage);
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(3, 5, 4);
        scene.add(key);

        // Floor ring of dots.
        const dots: number[] = [];
        for (let i = 0; i < 260; i++) {
          const a = (i / 260) * Math.PI * 2;
          const r = 1.25 + (i % 4) * 0.18;
          dots.push(Math.cos(a) * r, 0, Math.sin(a) * r);
        }
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
        const dotMat = new THREE.PointsMaterial({ color: 0x3aa3ec, size: 0.03, transparent: true, opacity: 0.45 });
        stage.add(new THREE.Points(dotGeo, dotMat));

        const W = 1.15;
        const boxGeo = new THREE.BoxGeometry(W, 1, W);
        boxGeo.translate(0, 0.5, 0);
        const blocks = SEG_COLORS.map((c) => {
          const m = new THREE.Mesh(
            boxGeo,
            new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.15, transparent: true, opacity: 0.95 }),
          );
          m.visible = false;
          stage.add(m);
          return m;
        });
        // Ghost frame = bought separately.
        const ghostGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W * 1.12, 1, W * 1.12).translate(0, 0.5, 0));
        const ghostMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0 });
        const ghost = new THREE.LineSegments(ghostGeo, ghostMat);
        ghost.computeLineDistances();
        stage.add(ghost);
        // Price plane = what you pay.
        const planeGeo = new THREE.PlaneGeometry(W * 1.7, W * 1.7);
        planeGeo.rotateX(-Math.PI / 2);
        const planeMat = new THREE.MeshBasicMaterial({ color: 0x45d17f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        stage.add(plane);
        const rimGeo = new THREE.EdgesGeometry(planeGeo);
        const rimMat = new THREE.LineBasicMaterial({ color: 0x45d17f, transparent: true, opacity: 0 });
        const rim = new THREE.LineSegments(rimGeo, rimMat);
        stage.add(rim);

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          camera.position.set(0, 2.6, camera.aspect < 0.9 ? 9.4 : 7.8);
          camera.lookAt(0, 1.25, 0);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);
        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        const v = new THREE.Vector3();
        const place = (el: HTMLElement | null, x: number, y: number, z: number, alpha: number, left = false) => {
          if (!el) return;
          v.set(x, y, z);
          stage.localToWorld(v);
          v.project(camera);
          el.style.transform = `translate(${(v.x * 0.5 + 0.5) * host.clientWidth}px, ${(-v.y * 0.5 + 0.5) * host.clientHeight}px) translateY(-50%)${left ? " translateX(-100%) translateX(-8px)" : ""}`;
          el.style.opacity = String(alpha);
        };

        let token = -1;
        let t0 = 0;
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const st = state.current;
          if (st.token !== token) {
            token = st.token;
            t0 = now;
          }
          const el = reduce ? 99 : (now - t0) / 1000;
          stage.rotation.y = reduce ? -0.5 : -0.5 + Math.sin(now / 3200) * 0.18;
          const n = st.segs.length;
          let y = 0;
          blocks.forEach((b, i) => {
            const lbl = segLabels.current[i];
            if (i >= n || st.list <= 0) {
              b.visible = false;
              if (lbl) lbl.style.opacity = "0";
              return;
            }
            const hh = (st.segs[i].value / st.list) * H;
            const p = Math.min(1, Math.max(0, (el - i * 0.18) / 0.45));
            const e = 1 - Math.pow(1 - p, 3);
            b.visible = p > 0;
            b.scale.set(1, Math.max(0.0001, hh - 0.025), 1);
            b.position.y = y + (1 - e) * 2.2;
            (b.material as InstanceType<typeof THREE.MeshStandardMaterial>).opacity = 0.95 * e;
            place(lbl, W / 2 + 0.12, y + hh / 2, W / 2, e);
            y += hh;
          });
          // After the drop: ghost frame + price plane sliding down to the price.
          const after = Math.min(1, Math.max(0, (el - n * 0.18 - 0.35) / 0.9));
          const ea = 1 - Math.pow(1 - after, 3);
          const priceY = st.list > 0 ? (st.price / st.list) * H : 0;
          const hasSaving = st.price < st.list - 1;
          ghost.scale.y = H;
          ghostMat.opacity = hasSaving ? 0.55 * ea : 0;
          const py = H + 0.0001 - (H - priceY) * ea;
          plane.position.y = py;
          rim.position.y = py;
          planeMat.opacity = 0.16 * ea;
          rimMat.opacity = 0.95 * ea;
          place(listLabel.current, -W / 2 - 0.1, H, 0, hasSaving ? ea : 0, true);
          place(priceLabel.current, -W / 2 - 0.1, py, 0, ea, true);
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          [dotGeo, boxGeo, ghostGeo, planeGeo, rimGeo].forEach((g) => g.dispose());
          [dotMat, ghostMat, planeMat, rimMat, ...blocks.map((b) => b.material as InstanceType<typeof THREE.Material>)].forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  const choose = (p: Pick) => {
    setPick(p);
    trackEvent("price_pick", p.kind === "combo" ? { combo: p.key } : { service: p.slug });
  };

  const star = (est: boolean) => (est ? <span className="text-gold-400">*</span> : null);

  return (
    <section ref={sectionRef} id="bang-gia" className="relative overflow-hidden bg-ink py-20 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_25%_40%,rgba(10,111,184,0.22),transparent_70%),radial-gradient(35%_35%_at_80%_80%,rgba(23,168,90,0.12),transparent_70%)]" />
      <Container className="relative flex flex-col gap-10">
        <div className="flex max-w-3xl flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{t("eyebrow")}</p>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{t("heading")}</h2>
          <p className="text-white/70 sm:text-lg">{t("sub")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Tower */}
          <div className="lg:sticky lg:top-24">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
              <div ref={canvasHost} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
              {noGL ? (
                <div aria-hidden className="absolute inset-0 flex items-end justify-center gap-6 p-8">
                  <div className="relative flex h-[78%] w-28 flex-col-reverse overflow-hidden rounded-xl ring-1 ring-dashed ring-white/40">
                    {segs.map((sg, i) => (
                      <div
                        key={sg.label}
                        style={{ height: `${(sg.value / Math.max(list, 1)) * 100}%`, background: hexOf(i) }}
                        className="border-t border-ink/30"
                      />
                    ))}
                    <div className="absolute inset-x-0 border-t-2 border-gold-400" style={{ bottom: `${(price / Math.max(list, 1)) * 100}%` }} />
                  </div>
                  <ul className="flex flex-col gap-1.5 pb-2 text-xs text-white/80">
                    {segs.map((sg, i) => (
                      <li key={sg.label} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: hexOf(i) }} />
                        {sg.label} · {shortVnd(sg.value, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {Array.from({ length: SEG_COLORS.length }, (_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      segLabels.current[i] = el;
                    }}
                    className="absolute left-0 top-0 w-max max-w-[9.5rem] text-[10px] font-semibold leading-tight text-white/85 opacity-0 sm:max-w-[11rem] sm:text-xs"
                  >
                    {segs[i] ? `${segs[i].label} · ${shortVnd(segs[i].value, locale)}` : ""}
                  </span>
                ))}
                <span ref={listLabel} className="absolute left-0 top-0 whitespace-nowrap text-right text-[10px] text-white/55 line-through opacity-0 sm:text-xs">
                  {t("separate")} {shortVnd(list, locale)}
                </span>
                <span ref={priceLabel} className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold text-ink opacity-0 sm:text-sm">
                  {combo && combo.price === null ? t("contact") : `${shortVnd(price, locale)}${(combo ? combo.estimated : single?.price.estimated) ? "*" : ""}`}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10" aria-live="polite">
              <p className="text-sm text-white/60">{combo ? `${t("comboLabel")} · ${combo.name[locale]}` : t("singleLabel")}</p>
              {combo && combo.price === null ? (
                <p className="font-display text-2xl font-bold">{t("contact")}</p>
              ) : (
                <p className="font-display text-2xl font-bold sm:text-3xl">
                  {formatVnd(price, locale)}
                  {star(combo ? combo.estimated : !!single?.price.estimated)}
                  {single ? <span className="ml-1 text-base font-medium text-white/60">{unitLabel(single, t)}</span> : null}
                </p>
              )}
              {saving > 0 ? (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-gold-400">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  {t("saving", { amount: formatVnd(saving, locale), pct: Math.round((saving / list) * 100) })}
                </p>
              ) : null}
              {single?.price.minMonths ? <p className="text-xs text-white/50">{t("minMonths", { n: single.price.minMonths })}</p> : null}
              {single?.price.plus ? (
                <p className="text-xs text-white/50">
                  {t("plus", { amount: formatVnd(single.price.plus.amount, locale) })}
                  {star(single.price.estimated)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Combos */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">{t("combosHeading")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {COMBOS.map((c) => {
                  const on = combo?.key === c.key;
                  const lt = comboListTotal(c);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose({ kind: "combo", key: c.key })}
                      className={`flex flex-col gap-2 rounded-2xl p-4 text-left transition-all ${
                        on ? "bg-gold-500/[0.12] ring-2 ring-gold-500" : "bg-white/[0.03] ring-1 ring-white/10 hover:ring-gold-500/50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400">{c.step[locale]}</span>
                        <span className="text-[11px] text-white/50">{c.duration[locale]}</span>
                      </span>
                      <span className="font-display text-lg font-bold">{c.name[locale]}</span>
                      <span className="text-xs text-white/55">{c.fit[locale]}</span>
                      {c.price === null ? (
                        <span className="font-display text-xl font-bold">{t("contact")}</span>
                      ) : (
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-display text-xl font-bold">
                            {formatVnd(c.price, locale)}
                            {star(c.estimated)}
                          </span>
                          <span className="text-xs text-white/45 line-through">{formatVnd(lt, locale)}</span>
                        </span>
                      )}
                      {c.parts.length ? (
                        <ul className="flex flex-col gap-1">
                          {c.parts.map((p) => (
                            <li key={p.slug} className="flex items-start gap-1.5 text-xs text-white/70">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" aria-hidden />
                              {serviceBySlug(p.slug)!.short[locale]}
                              {p.months && serviceBySlug(p.slug)!.price.unit === "month" ? ` · ${t("months", { n: p.months })}` : ""}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-white/60">{t("contactNote")}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Singles */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">{t("singlesHeading")}</h3>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-3 rounded-2xl bg-gold-500/[0.08] p-4 ring-1 ring-gold-500/40">
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{t("freeName")}</span>
                    <span className="block text-xs text-white/55">{t("freeNote")}</span>
                  </span>
                  <span className="font-display text-lg font-bold text-gold-400">0đ</span>
                </li>
                {SERVICES.map((s, i) => {
                  const on = single?.slug === s.slug;
                  return (
                    <li key={s.slug}>
                      <div
                        className={`flex flex-col gap-3 rounded-2xl p-4 transition-all sm:flex-row sm:items-center ${
                          on ? "bg-brand-500/[0.14] ring-2 ring-brand-500" : "bg-white/[0.03] ring-1 ring-white/10"
                        }`}
                      >
                        <button type="button" aria-pressed={on} onClick={() => choose({ kind: "single", slug: s.slug })} className="flex flex-1 items-start gap-3 text-left">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                            {i + 1}
                          </span>
                          <span className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold">{s.name[locale]}</span>
                            <span className="text-xs text-white/55">{s.pitch[locale]}</span>
                          </span>
                        </button>
                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <span className="whitespace-nowrap text-right">
                            <span className="font-display text-lg font-bold">
                              {formatVnd(s.price.amount, locale)}
                              {star(s.price.estimated)}
                            </span>
                            <span className="block text-[11px] text-white/50">
                              {unitLabel(s, t)}
                              {s.price.plus ? ` + ${shortVnd(s.price.plus.amount, locale)}${t("perMonth")}${s.price.estimated ? "*" : ""}` : ""}
                            </span>
                          </span>
                          <Link
                            href={{ pathname: "/services/[slug]", params: { slug: s.slug } }}
                            onClick={() => trackEvent("price_detail", { service: s.slug })}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand-300 hover:text-white"
                          >
                            {t("detail")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={COMPANY.zalo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("price_cta", { channel: "zalo", pick: pick.kind === "combo" ? pick.key : pick.slug })}
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-ink transition hover:bg-gold-400"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
              </a>
              <Link
                href="/booking"
                onClick={() => trackEvent("price_cta", { channel: "booking", pick: pick.kind === "combo" ? pick.key : pick.slug })}
                className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                {t("ctaBook")}
              </Link>
            </div>

            <p className="text-xs leading-relaxed text-white/55">
              {HAS_ESTIMATES ? <span className="text-gold-400">(*) </span> : null}
              {HAS_ESTIMATES ? t("footnote") : t("note")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
