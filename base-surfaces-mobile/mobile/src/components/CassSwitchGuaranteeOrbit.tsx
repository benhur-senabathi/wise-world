import { useEffect, useRef, useState } from 'react';
import './CassSwitchGuaranteeOrbit.css';

/**
 * Web translation of the SwiftUI/SpriteKit "Apple iCloud login" orbit
 * (wise-world/AppleLoginAnimation-main), reworked for CASS:
 *
 *  1. A rotating field of Wise-palette dots (the iCloud halo).
 *  2. UK bank logos pop in one-by-one — each over its matching halo colour —
 *     shoving the nearby dots aside, and PERSIST, orbiting the centre.
 *  3. After a delightful beat, the Wise logo settles into a faint circular
 *     container at the centre; the dot halo fades away.
 *  4. The Wise logo "sucks the banks in": they accelerate inward, stretch
 *     toward the centre and blur/dissolve into the container rim — never
 *     overlapping the wordmark.
 *  5. The Current Account Switch Guarantee badge rises in.
 *  Plays once, then rests on the end state.
 *
 * Canvas 2D + one rAF loop drives the dots + bank bubbles; the Wise disc,
 * logo and badge are a crisp DOM/CSS overlay (theme-aware via tokens + mask).
 */

type Bank = {
  id: string;
  src: string;
  bg: string;
  logoScale: number; // logo width as fraction of bubble diameter
  ratio: number; // logo aspect ratio (w/h) from its viewBox
  paletteT: number; // where on the halo gradient this bank sits (0..1)
};

// Brand circle fills + insets mirror the Figma bank marks (node 2077:2497).
// paletteT places each bank over its matching halo colour (see PALETTE):
//   lloyds → green, hsbc → teal, natwest → purple, santander → warm/red.
const BANKS: Bank[] = [
  { id: 'lloyds', src: '/cass/bank-lloyds.svg', bg: '#3ea973', logoScale: 0.6, ratio: 35.1309 / 30.4395, paletteT: 0.0 },
  { id: 'hsbc', src: '/cass/bank-hsbc.svg', bg: '#ffffff', logoScale: 0.72, ratio: 37.8981 / 18.949, paletteT: 0.18 },
  { id: 'natwest', src: '/cass/bank-natwest.svg', bg: '#3c1053', logoScale: 0.56, ratio: 33.9423 / 29.3941, paletteT: 0.54 },
  { id: 'santander', src: '/cass/bank-santander.svg', bg: '#e61513', logoScale: 0.54, ratio: 35.1911 / 33.8376, paletteT: 0.86 },
];

// Wise foundational palette as a conic sweep (green → teal → blue → brand
// purple → pink → orange → back), sampled by angle in the gradient frame.
const PALETTE: { t: number; rgb: [number, number, number] }[] = [
  { t: 0.0, rgb: [159, 232, 112] }, // bright-green  #9FE870
  { t: 0.18, rgb: [160, 225, 225] }, // bright-blue   #A0E1E1 (teal)
  { t: 0.36, rgb: [0, 185, 255] }, // blue          #00B9FF
  { t: 0.54, rgb: [72, 92, 199] }, // brand-purple  #485CC7
  { t: 0.72, rgb: [255, 215, 239] }, // bright-pink   #FFD7EF
  { t: 0.87, rgb: [255, 192, 145] }, // bright-orange #FFC091
  { t: 1.0, rgb: [159, 232, 112] }, // wrap to green
];

// Concentric rings (radiusFactor of outer radius, dot radius @ ref r=120).
// Replicates AnimatedLogoOrbitScene.generateCircles(), outer-first.
const RINGS = [
  { rf: 1.0, dot: 4 },
  { rf: 0.875, dot: 3 },
  { rf: 0.75, dot: 3 },
  { rf: 0.625, dot: 2 },
];
const DOTS_PER_RING = 23;
const RING_ANGLE_OFFSET = 0.4;

// --- Timeline (ms), plays once ---
const BANK_POP = 600; // each bank scales in (slower, delightful)
const BANK_STAGGER = 760; // gap between bank entrances
const SHOWCASE_END = (BANKS.length - 1) * BANK_STAGGER + BANK_POP;
const DELIGHT = 900; // all four orbit together
const T_LOGO = SHOWCASE_END + DELIGHT; // Wise logo appears / dots fade
const LOGO_IN = 560;
const T_LOGO_DONE = T_LOGO + LOGO_IN;
const PRE_CONVERGE = 640; // beat before the logo pulls them in
const T_CONVERGE = T_LOGO_DONE + PRE_CONVERGE;
const CONVERGE = 820; // banks accelerate + dissolve into the rim (snappy)
const T_CONVERGE_DONE = T_CONVERGE + CONVERGE;
const T_BADGE = T_CONVERGE_DONE + 120; // guarantee after everything settles
const T_END = T_BADGE + 520;

// Apple parity: dots AND bank icons are children of ONE rotating container,
// so they share a single angular speed. (Swift: container.run(repeatForever
// rotate by -2π over 10s); the active icon counter-rotates to stay upright.)
const ROT_PERIOD = 16000;

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInCubic = (t: number) => t * t * t;
const easeOutBack = (t: number) => {
  const c1 = 1.9; // a touch springier than default for delight
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

function samplePalette(angle: number): string {
  let t = (angle / TAU) % 1;
  if (t < 0) t += 1;
  for (let i = 0; i < PALETTE.length - 1; i += 1) {
    const a = PALETTE[i];
    const b = PALETTE[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = (t - a.t) / (b.t - a.t);
      const r = Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * p);
      const g = Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * p);
      const bl = Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * p);
      return `rgb(${r}, ${g}, ${bl})`;
    }
  }
  return '#9FE870';
}

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

    // Ambient dot field.
    const dots: { rf: number; baseAngle: number; size: number }[] = [];
    RINGS.forEach((ring, ri) => {
      const offset = RING_ANGLE_OFFSET * ri;
      for (let d = 0; d < DOTS_PER_RING; d += 1) {
        dots.push({ rf: ring.rf, baseAngle: (TAU * d) / DOTS_PER_RING + offset, size: ring.dot });
      }
    });

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
      containerR = 71; // disc radius (142px) — the rim banks dissolve into
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

    // Draw an upright bank bubble centred at (x, y). Always axis-aligned so the
    // logo never tilts (Swift keeps the icon upright via -container.zRotation).
    const drawBank = (x: number, y: number, diameter: number, bank: Bank, img: HTMLImageElement) => {
      const rad = diameter / 2;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fillStyle = bank.bg;
      ctx.fill();
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
    };

    let start = performance.now();
    let raf = 0;
    const last: View = { logo: false, absorbing: false, badge: false };

    const frame = (now: number) => {
      const t = now - start;
      // ONE rotation drives the whole container — dots and banks alike — so
      // they orbit at exactly the same angular speed (Apple parity).
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

      // Bank live state (position + pop), reused for dot shove + drawing.
      // Banks ride the SAME rotation as the dots → identical orbit speed.
      const bankState = BANKS.map((bank, i) => {
        const popRaw = clamp01((t - i * BANK_STAGGER) / BANK_POP);
        const worldAngle = bank.paletteT * TAU + rot;
        const x = cx + orbitR * Math.cos(worldAngle);
        const y = cy + orbitR * Math.sin(worldAngle);
        return { bank, i, popRaw, worldAngle, x, y };
      });

      ctx.clearRect(0, 0, cw, ch);

      // --- Dot halo (fades as the logo lands), shoved by popping banks ---
      if (dotAlpha > 0.01) {
        const s = dotScale();
        const influence = bankD * 1.7;
        const maxPush = outerR * 0.07; // light real-world shove
        ctx.globalAlpha = dotAlpha * 0.92;
        for (const dot of dots) {
          const angle = dot.baseAngle + rot;
          let x = cx + outerR * dot.rf * Math.cos(angle);
          let y = cy + outerR * dot.rf * Math.sin(angle);

          // Each bank's pop sends a brief outward ripple (rise then settle).
          for (const b of bankState) {
            if (b.popRaw <= 0 || b.popRaw >= 1) continue;
            const pulse = Math.sin(b.popRaw * Math.PI); // 0 → 1 → 0 across the pop
            const dx = x - b.x;
            const dy = y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0.001 && dist < influence) {
              const push = ((influence - dist) / influence) * pulse * maxPush;
              x += (dx / dist) * push;
              y += (dy / dist) * push;
            }
          }

          // Colour by base angle so the rainbow ring rotates rigidly with the
          // container — each bank stays locked over its matching hue.
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, dot.size * s), 0, TAU);
          ctx.fillStyle = samplePalette(dot.baseAngle);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // --- Bank bubbles: pop in, orbit, then get sucked into the rim ---
      const converge = clamp01((t - T_CONVERGE) / CONVERGE);
      const pull = easeInCubic(converge); // accelerate inward = "sucked in"
      const rimTarget = containerR * 0.82;
      for (const b of bankState) {
        if (b.popRaw <= 0) continue;
        const popScale = Math.min(1, easeOutBack(b.popRaw));

        const r = orbitR + (rimTarget - orbitR) * pull;
        const x = cx + r * Math.cos(b.worldAngle);
        const y = cy + r * Math.sin(b.worldAngle);

        // Dissolve in the back half of the pull; fully gone before the logo.
        const dissolve = clamp01((converge - 0.32) / 0.6);
        const alpha = (1 - dissolve) * popScale;
        if (alpha <= 0.01) continue;

        const d = bankD * (1 - 0.34 * pull) * popScale;

        // "Sucked in" = an UPRIGHT bubble plus a few faint motion-trail ghosts
        // smeared back along the radial path (no rotation → never tilts).
        if (pull > 0.04) {
          const dirX = Math.cos(b.worldAngle);
          const dirY = Math.sin(b.worldAngle);
          const trailLen = outerR * 0.16 * pull; // grows as it speeds up
          const ghosts = 3;
          ctx.save();
          if (dissolve > 0) ctx.filter = `blur(${(dissolve * 5).toFixed(2)}px)`;
          for (let g = ghosts; g >= 1; g -= 1) {
            const back = (g / ghosts) * trailLen; // outward = where it came from
            ctx.globalAlpha = alpha * (0.16 * (1 - g / (ghosts + 1)) + 0.06);
            drawBank(x + dirX * back, y + dirY * back, d * (1 - 0.06 * g), b.bank, images[b.i]);
          }
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        if (dissolve > 0) ctx.filter = `blur(${(dissolve * 5).toFixed(2)}px)`;
        drawBank(x, y, d, b.bank, images[b.i]);
        ctx.restore();
      }

      if (t < T_END) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cw, ch); // settle: halo + banks gone, overlay remains
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
