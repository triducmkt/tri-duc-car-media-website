"use client";

import { useEffect, useRef } from "react";

/** A glowing wireframe gift box (three.js) for the check result: idles with a
 *  little lid wiggle, then when `open` turns true the lid swings back and
 *  gold sparks rise out of it. Purely decorative (aria-hidden). */
export function GiftBox({ open, className = "" }: { open: boolean; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
      camera.position.set(0, 1.1, 4.6);
      camera.lookAt(0, 0.1, 0);
      const box = new THREE.Group();
      scene.add(box);
      const ratio = renderer.getPixelRatio();

      const edges = (w: number, h: number, d: number, color: number, opacity: number) => {
        const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
        return { obj: new THREE.LineSegments(geo, mat), geo, mat };
      };
      const lines = (pts: number[], color: number, opacity: number) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
        return { obj: new THREE.LineSegments(geo, mat), geo, mat };
      };

      // Body + ribbon.
      const body = edges(1.6, 1.1, 1.6, 0x8fb6f9, 0.9);
      body.obj.position.y = -0.25;
      const ribbon = lines([0, 0.3, 0.81, 0, -0.8, 0.81, 0, 0.3, -0.81, 0, -0.8, -0.81, 0.81, 0.3, 0, 0.81, -0.8, 0, -0.81, 0.3, 0, -0.81, -0.8, 0], 0x6ea6f7, 0.95);
      box.add(body.obj, ribbon.obj);
      // Lid hinged on the back edge: pivot at z = -0.85.
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.32, -0.85);
      box.add(hinge);
      const lid = edges(1.75, 0.28, 1.75, 0x8fb6f9, 0.95);
      lid.obj.position.set(0, 0.14, 0.85);
      const bow = lines([0, 0.28, 0.85, -0.45, 0.62, 0.55, 0, 0.28, 0.85, 0.45, 0.62, 0.55, 0, 0.28, 0.85, -0.45, 0.62, 1.15, 0, 0.28, 0.85, 0.45, 0.62, 1.15], 0x6ea6f7, 1);
      hinge.add(lid.obj, bow.obj);

      // Sparks rising from inside the box.
      const N = 140;
      const pos = new Float32Array(N * 3), alpha = new Float32Array(N), seed = new Float32Array(N);
      for (let i = 0; i < N; i++) seed[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const sparkGeo = new THREE.BufferGeometry();
      sparkGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      sparkGeo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
      const sparkMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uScale: { value: ratio } },
        vertexShader: /* glsl */ `
          attribute float aAlpha; uniform float uScale; varying float vA;
          void main() {
            vA = aAlpha;
            gl_PointSize = 9.0 * uScale;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = pow(smoothstep(0.5, 0.0, d), 2.0);
            gl_FragColor = vec4(1.0, 0.82, 0.45, a * vA);
          }`,
      });
      box.add(new THREE.Points(sparkGeo, sparkMat));

      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let openAmt = 0, openedAt = -1, raf = 0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const time = now / 1000;
        const isOpen = openRef.current;
        if (isOpen && openedAt < 0) openedAt = time;
        if (!isOpen) openedAt = -1;
        openAmt += ((isOpen ? 1 : 0) - openAmt) * (reduce ? 1 : 0.07);
        const wiggle = !isOpen && !reduce ? Math.max(0, Math.sin(time * 2.2)) ** 8 * 0.18 : 0;
        hinge.rotation.x = -(openAmt * 1.9 + wiggle);
        if (!reduce) box.rotation.y = Math.sin(time * 0.5) * 0.45 + 0.5;
        const t = openedAt < 0 ? 0 : time - openedAt;
        for (let i = 0; i < N; i++) {
          const s = Math.abs(seed[i]);
          const u = reduce ? s : (t * 0.35 + s) % 1;
          const ang = s * 40;
          const r = 0.15 + u * 0.9 * (0.4 + s);
          pos.set([Math.cos(ang) * r, 0.2 + u * 2.2, Math.sin(ang) * r], i * 3);
          alpha[i] = openAmt * Math.sin(u * Math.PI) * 0.9;
        }
        sparkGeo.attributes.position.needsUpdate = true;
        sparkGeo.attributes.aAlpha.needsUpdate = true;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        [body, ribbon, lid, bow].forEach(({ geo, mat }) => {
          geo.dispose();
          mat.dispose();
        });
        sparkGeo.dispose();
        sparkMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={`[&>canvas]:h-full [&>canvas]:w-full ${className}`} />;
}
