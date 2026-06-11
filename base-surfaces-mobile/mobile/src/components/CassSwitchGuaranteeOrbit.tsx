import { useEffect, useRef, useState } from 'react';
import './CassSwitchGuaranteeOrbit.css';

/**
 * CASS "bring your banks to Wise" orbit. A faithful web port of the
 * SwiftUI/SpriteKit iCloud orbit (wise-world/AppleLoginAnimation-main),
 * re-skinned into Wise's palette:
 *
 *  • 4 concentric rings of 23 uniform dots (Apple parity:
 *    AnimatedLogoOrbitScene.generateCircles + buildCircles), one shared
 *    rotation for the whole field so dots and bank icons orbit at the same
 *    angular speed.
 *  • The dots are coloured by a conic gradient that REPLACES Apple's
 *    purple/pink/orange/blue 1:1 with Wise colours, anchored so each bank
 *    sits over its brand-matched hue (lloyds→green, hsbc→teal, natwest→purple,
 *    santander→red). The gradient rotates rigidly with the field.
 *  • Bank logos pop in on the outer ring (scaling up like the SpriteKit icon),
 *    shove the neighbouring dots, and PERSIST orbiting the centre.
 *  • The Wise logo settles into a faint container and "sucks the banks in":
 *    they accelerate inward, leave an upright motion-trail and dissolve into
 *    the rim (never overlapping the logo). Then the Current Account Switch
 *    Guarantee rises in. Plays once, settles on the end state.
 *
 * Canvas 2D + one rAF loop; the Wise disc/logo/badge are a theme-aware overlay.
 */

type RGB = [number, number, number];

type Bank = {
  id: string;
  src: string;
  bg: string;
  logoScale: number; // logo width as fraction of bubble diameter
  ratio: number; // logo aspect ratio (w/h) from its viewBox
  slot: number; // orbit position, 0..1 — aligned to its palette hue
};

// Brand fills + insets mirror the Figma bank marks (node 2077:2497). Each slot
// is placed so the bank sits over its matching gradient hue (see PALETTE).
const BANKS: Bank[] = [
  { id: 'lloyds', src: '/cass/bank-lloyds.svg', bg: '#3ea973', logoScale: 0.6, ratio: 35.1309 / 30.4395, slot: 0.0 },
  { id: 'hsbc', src: '/cass/bank-hsbc.svg', bg: '#ffffff', logoScale: 0.72, ratio: 37.8981 / 18.949, slot: 0.25 },
  { id: 'natwest', src: '/cass/bank-natwest.svg', bg: '#3c1053', logoScale: 0.56, ratio: 33.9423 / 29.3941, slot: 0.5 },
  { id: 'santander', src: '/cass/bank-santander.svg', bg: '#e61513', logoScale: 0.54, ratio: 35.1911 / 33.8376, slot: 0.75 },
];

// Wise conic rainbow — a 1:1 replacement for Apple's 4-stop gradient, anchored
// so t=slot lands each bank on its brand hue. Bridges (pink, amber) keep the
// purple→red and red→green transitions clean. All from the Wise palette:
//   green #9FE870 · teal #A0E1E1 · purple #485CC7 · pink #FFD7EF ·
//   red #E74848 · amber #FFB619.
const PALETTE: { t: number; rgb: RGB }[] = [
  { t: 0.0, rgb: [159, 232, 112] }, // bright-green  (lloyds)
  { t: 0.25, rgb: [160, 225, 225] }, // bright-blue   (hsbc / teal)
  { t: 0.5, rgb: [72, 92, 199] }, // brand-purple  (natwest)
  { t: 0.625, rgb: [255, 215, 239] }, // bright-pink   (purple→red bridge)
  { t: 0.75, rgb: [231, 72, 72] }, // red           (santander)
  { t: 0.875, rgb: [255, 182, 25] }, // brand-amber   (red→green bridge)
  { t: 1.0, rgb: [159, 232, 112] }, // wrap to green
];

// Concentric rings (radiusFactor of outer radius, dot radius @ ref r=120),
// replicating generateCircles() reversed (outer-first): sizes 4,3,3,2.
const RINGS = [
  { rf: 1.0, dot: 4 },
  { rf: 0.875, dot: 3 },
  { rf: 0.75, dot: 3 },
  { rf: 0.625, dot: 2 },
];
const DOTS_PER_RING = 23;
const RING_ANGLE_OFFSET = 0.4;

// Collision margin per dot (mirrors the reference's SKPhysicsBody radius = size + 3)
// and the number of relaxation passes used to separate shoved dots each frame.
const DOT_MARGIN = 2;
const SEPARATION_ITERS = 6;

// --- Timeline (ms), plays once ---
const BANK_POP = 600;
const BANK_STAGGER = 780;
const SHOWCASE_END = (BANKS.length - 1) * BANK_STAGGER + BANK_POP;
const DELIGHT = 980;
const T_LOGO = SHOWCASE_END + DELIGHT;
const LOGO_IN = 560;
const T_LOGO_DONE = T_LOGO + LOGO_IN;
const PRE_CONVERGE = 620;
const T_CONVERGE = T_LOGO_DONE + PRE_CONVERGE;
const CONVERGE = 820;
const T_CONVERGE_DONE = T_CONVERGE + CONVERGE;
const T_BADGE = T_CONVERGE_DONE + 120;
const T_END = T_BADGE + 520;

const ROT_PERIOD = 16000; // one shared rotation for the whole field

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const rgbStr = (c: RGB) => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`;
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function hexToRGB(hex: string): RGB {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Sample the conic gradient at gradient-position p (0..1), as RGB.
function samplePaletteRGB(p: number): RGB {
  let t = p % 1;
  if (t < 0) t += 1;
  for (let i = 0; i < PALETTE.length - 1; i += 1) {
    const a = PALETTE[i];
    const b = PALETTE[i + 1];
    if (t >= a.t && t <= b.t) {
      const k = (t - a.t) / (b.t - a.t);
      return [
        a.rgb[0] + (b.rgb[0] - a.rgb[0]) * k,
        a.rgb[1] + (b.rgb[1] - a.rgb[1]) * k,
        a.rgb[2] + (b.rgb[2] - a.rgb[2]) * k,
      ];
    }
  }
  return [159, 232, 112];
}
const samplePalette = (p: number): string => rgbStr(samplePaletteRGB(p));

type View = { logo: boolean; absorbing: boolean; badge: boolean };

export function CassSwitchGuaranteeOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ logo: false, absorbing: false, badge: false });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      setView({ logo: true, absorbing: false, badge: true });
      return;
    }
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images = BANKS.map((b) => {
      const img = new Image();
      img.src = b.src;
      return img;
    });

    // Build the dot field: 4 concentric rings, evenly spaced, ring offset 0.4.
    // gradientT (0..1) is each dot's fixed position on the conic gradient, so
    // the rainbow rotates rigidly with the field (banks stay over their hue).
    const dots: { rf: number; baseAngle: number; size: number; gradientT: number }[] = [];
    RINGS.forEach((ring, ri) => {
      const offset = RING_ANGLE_OFFSET * ri;
      for (let d = 0; d < DOTS_PER_RING; d += 1) {
        const baseAngle = (TAU * d) / DOTS_PER_RING + offset;
        dots.push({ rf: ring.rf, baseAngle, size: ring.dot, gradientT: (baseAngle % TAU) / TAU });
      }
    });

    // Reusable scratch buffer for the per-frame separation solver (avoids per-frame GC).
    // One entry per dot: resolved position, collision radius, draw radius, gradient stop.
    const solved = dots.map(() => ({ x: 0, y: 0, cr: 0, draw: 0, gradientT: 0 }));

    let cw = 0;
    let ch = 0;
    let cx = 0;
    let cy = 0;
    let outerR = 0;
    let containerR = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      cw = wrap.clientWidth;
      ch = wrap.clientHeight;
      cx = cw / 2;
      cy = ch / 2;
      outerR = Math.min(cw, ch) / 2 - 16;
      containerR = 71;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const dotScale = () => outerR / 120;

    const bankBg = BANKS.map((b) => hexToRGB(b.bg));

    // Upright bank bubble centred at (x, y) — never tilts.
    //   birth (0..1): 0 = still a coloured orbit particle (fill = its gradient
    //   hue, no logo), 1 = fully the brand bubble with logo. Lets a bank
    //   BALLOON out of one dot rather than popping from thin air.
    const drawBank = (
      x: number,
      y: number,
      diameter: number,
      bank: Bank,
      bi: number,
      img: HTMLImageElement,
      birth = 1,
    ) => {
      const rad = diameter / 2;
      const fill = birth >= 1 ? bankBg[bi] : mixRGB(samplePaletteRGB(bank.slot), bankBg[bi], clamp01(birth * 1.4));
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fillStyle = rgbStr(fill);
      ctx.fill();
      if (birth > 0.4) {
        ctx.globalAlpha *= clamp01((birth - 0.4) / 0.6);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(14, 15, 12, 0.10)';
        ctx.stroke();
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TAU);
        ctx.clip();
        if (img.complete && img.naturalWidth > 0) {
          const w = diameter * bank.logoScale;
          const h = w / bank.ratio;
          ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        }
        ctx.restore();
      }
    };

    let start = performance.now();
    let raf = 0;
    const last: View = { logo: false, absorbing: false, badge: false };

    const frame = (now: number) => {
      const t = now - start;
      const rot = (t / ROT_PERIOD) * TAU * -1;

      const next: View = {
        logo: t >= T_LOGO,
        absorbing: t >= T_CONVERGE && t < T_CONVERGE_DONE,
        badge: t >= T_BADGE,
      };
      if (next.logo !== last.logo || next.absorbing !== last.absorbing || next.badge !== last.badge) {
        last.logo = next.logo;
        last.absorbing = next.absorbing;
        last.badge = next.badge;
        setView({ ...next });
      }

      const dotAlpha = 1 - clamp01((t - T_LOGO) / LOGO_IN);
      const orbitR = outerR * 0.94;
      const bankD = outerR * 0.34;
      const seedD = Math.max(2, RINGS[0].dot * dotScale()) * 2; // one orbit particle

      // Live bank state: position (shared rotation) + balloon growth.
      //   birth: eased 0..1 — the bubble balloons from one orbit particle
      //   (seedD) up to the full bank bubble (bankD), smooth ease-out.
      const bankState = BANKS.map((bank, i) => {
        const popRaw = clamp01((t - i * BANK_STAGGER) / BANK_POP);
        const birth = easeOutCubic(popRaw);
        const angle = bank.slot * TAU + rot;
        const x = cx + orbitR * Math.cos(angle);
        const y = cy + orbitR * Math.sin(angle);
        const diameter = lerp(seedD, bankD, birth);
        return { bank, i, popRaw, birth, angle, x, y, diameter };
      });

      ctx.clearRect(0, 0, cw, ch);

      // --- Dot field (Apple iCloud halo, Wise palette) ---
      // Ported from the SpriteKit reference's physics: each dot is a soft body
      // with a collision radius; a ballooning bank is an immovable body. A small
      // positional relaxation solver pushes dots off the banks AND off each other,
      // so shoved dots part around the bubble instead of piling onto one ring.
      if (dotAlpha > 0.01) {
        const s = dotScale();

        // a. Base rest positions + collision/draw radii for every dot.
        for (let i = 0; i < dots.length; i += 1) {
          const dot = dots[i];
          const angle = dot.baseAngle + rot;
          const out = solved[i];
          out.x = cx + outerR * dot.rf * Math.cos(angle);
          out.y = cy + outerR * dot.rf * Math.sin(angle);
          out.draw = Math.max(0.5, dot.size * s);
          out.cr = out.draw + DOT_MARGIN;
          out.gradientT = dot.gradientT;
        }

        // b. Active set: dots within reach of any growing bank. Bank collision
        // radius keeps the existing gap; b.diameter already eases in via birth,
        // so displacement still grows smoothly with the bubble.
        const bankClear = (b: (typeof bankState)[number]) => b.diameter / 2 + outerR * 0.05;
        const maxDotR = RINGS[0].dot * s + DOT_MARGIN;
        const active: number[] = [];
        for (let i = 0; i < dots.length; i += 1) {
          const p = solved[i];
          for (const b of bankState) {
            if (b.birth <= 0) continue;
            if (Math.hypot(p.x - b.x, p.y - b.y) < bankClear(b) + maxDotR + p.cr) {
              active.push(i);
              break;
            }
          }
        }

        // c. Relax: separate dots from each other, then re-assert bank clearance
        // last so a bank always wins (a dot never ends up inside a bubble).
        for (let iter = 0; iter < SEPARATION_ITERS; iter += 1) {
          for (let a = 0; a < active.length; a += 1) {
            const pa = solved[active[a]];
            for (let b = a + 1; b < active.length; b += 1) {
              const pb = solved[active[b]];
              let dx = pb.x - pa.x;
              let dy = pb.y - pa.y;
              const min = pa.cr + pb.cr;
              let dist = Math.hypot(dx, dy);
              if (dist >= min) continue;
              if (dist < 1e-4) {
                // Coincident: nudge apart along a deterministic angle.
                const ang = (active[a] * 2.3999632) % TAU;
                dx = Math.cos(ang);
                dy = Math.sin(ang);
                dist = 1;
              }
              const push = (min - dist) / 2;
              const ux = (dx / dist) * push;
              const uy = (dy / dist) * push;
              pa.x -= ux;
              pa.y -= uy;
              pb.x += ux;
              pb.y += uy;
            }
          }
          for (const idx of active) {
            const p = solved[idx];
            for (const b of bankState) {
              if (b.birth <= 0) continue;
              const clear = bankClear(b) + p.cr;
              const dx = p.x - b.x;
              const dy = p.y - b.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 1e-4 && dist < clear) {
                p.x = b.x + (dx / dist) * clear;
                p.y = b.y + (dy / dist) * clear;
              }
            }
          }
        }

        // d. Draw.
        ctx.globalAlpha = dotAlpha * 0.92;
        for (let i = 0; i < dots.length; i += 1) {
          const p = solved[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.draw, 0, TAU);
          ctx.fillStyle = samplePalette(p.gradientT);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // --- Bank bubbles: pop in, orbit, then get sucked into the rim ---
      const converge = clamp01((t - T_CONVERGE) / CONVERGE);
      const pull = easeInCubic(converge);
      const rimTarget = containerR * 0.82;
      for (const b of bankState) {
        if (b.birth <= 0) continue;

        const r = orbitR + (rimTarget - orbitR) * pull;
        const x = cx + r * Math.cos(b.angle);
        const y = cy + r * Math.sin(b.angle);

        const dissolve = clamp01((converge - 0.32) / 0.6);
        const alpha = 1 - dissolve;
        if (alpha <= 0.01) continue;

        // Diameter follows the balloon while growing, then the convergence shrink.
        const d = b.diameter * (1 - 0.34 * pull);

        // "Sucked in" = upright bubble + faint motion-trail ghosts smeared back
        // along the radial path (no rotation → never tilts).
        if (pull > 0.04) {
          const dirX = Math.cos(b.angle);
          const dirY = Math.sin(b.angle);
          const trailLen = outerR * 0.16 * pull;
          const ghosts = 3;
          ctx.save();
          if (dissolve > 0) ctx.filter = `blur(${(dissolve * 5).toFixed(2)}px)`;
          for (let g = ghosts; g >= 1; g -= 1) {
            const back = (g / ghosts) * trailLen;
            ctx.globalAlpha = alpha * (0.16 * (1 - g / (ghosts + 1)) + 0.06);
            drawBank(x + dirX * back, y + dirY * back, d * (1 - 0.06 * g), b.bank, b.i, images[b.i]);
          }
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        if (dissolve > 0) ctx.filter = `blur(${(dissolve * 5).toFixed(2)}px)`;
        drawBank(x, y, d, b.bank, b.i, images[b.i], b.birth);
        ctx.restore();
      }

      if (t < T_END) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cw, ch);
      }
    };

    raf = requestAnimationFrame(frame);
    const onVis = () => {
      if (!document.hidden && !last.badge) start = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  const brandIn = reduced || view.logo;

  return (
    <div className="cass-orbit" ref={wrapRef} aria-hidden="true">
      {!reduced && <canvas ref={canvasRef} className="cass-orbit__canvas" />}
      <div className={`cass-orbit__brand${brandIn ? ' cass-orbit__brand--in' : ''}`}>
        <div className={`cass-orbit__disc${view.absorbing ? ' cass-orbit__disc--absorbing' : ''}`}>
          <span className="cass-orbit__wise" />
        </div>
        <img
          className={`cass-orbit__guarantee${view.badge ? ' cass-orbit__guarantee--in' : ''}`}
          src="/cass/cass-guarantee-badge.svg"
          alt=""
        />
      </div>
    </div>
  );
}
