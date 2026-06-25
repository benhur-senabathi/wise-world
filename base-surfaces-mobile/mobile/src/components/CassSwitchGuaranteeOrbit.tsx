import { useEffect, useRef, useState } from 'react';
import './CassSwitchGuaranteeOrbit.css';

/**
 * CASS "bring your banks to Wise" orbit — a cinematic, play-once hero animation.
 * A web port of the SwiftUI/SpriteKit iCloud orbit (wise-world/Animation), re-skinned
 * to Wise and extended into a 7-act sequence driven by one continuous rAF loop:
 *
 *  0. Singularity pre-roll — the Wise FastFlag mark blooms in at centre, alone.
 *  1. Big-bang genesis — 92 dots erupt from the core and curve out onto 4 rings.
 *  2. Spin-up — the field eases up to cruise rotation.
 *  c. Banks — one at a time a bank logo balloons (overshoot), holds, then shrinks
 *     back to a plain coloured dot; shoved neighbours glide exactly home (Apple parity,
 *     no permanent scatter, no persisting logos).
 *  d. Dock — the whole stage FLIP-shrinks from full panel to its inline 260px slot
 *     while the page content reveals below. R_live drives every radius so the canvas
 *     is re-drawn smaller at native pixels (never bitmap-scaled).
 *  e. Cruise — steady docked orbit.
 *  f. Charge + spiral — a short inhale, then every dot spirals concentrically into the
 *     FastFlag from the top, like a black hole.
 *  g. Guarantee — disc + Current Account Switch Guarantee badge rise in (end state).
 *
 * reduced-motion: skips the canvas, renders the static end state in the docked slot.
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

// --- Timeline (ms), plays once. See the choreography spec. ---
const T_GENESIS_START = 200;
const EMANATE = 820;
// The ENTIRE bank showcase plays at full/max size, BEFORE the dock — so each logo
// is emphasised large, and once the orbit scales down no bank ever appears again.
// bankD = 0.34·rLive and rLive = rFull until the dock, so banks pop big. Long hold
// per logo. One at a time, lightly overlapping (next pops as the previous shrinks).
// Last bank ends: 1300 + 3·1050 + (220+950+480) = 6100 < T_DOCK_START.
const T_BANKS = 1300;
const BANK_CYCLE = 1050;
const BANK_POP = 220;
const BANK_HOLD = 950; // long hold to emphasise each bank at max size
const BANK_SHRINK = 480;
const T_DOCK_START = 6250; // dock begins only after every bank has gone
const DOCK = 1000;
const T_DOCK_END = T_DOCK_START + DOCK; // 7250
// Page content reveals only AFTER the orbit has fully landed + a 300ms beat, so it
// staggers in cleanly (like every other screen) rather than rising mid-dock.
const T_REVEAL = T_DOCK_END + 300; // 7550
const T_CHARGE = 8500; // a docked cruise beat (+ content settle) before the inhale
const CHARGE = 460;
const T_SPIRAL = 8960;
const SPIRAL = 1200;
const T_BADGE = 10100;
const T_END = 10720;

const ROT_PERIOD = 16000; // one shared rotation for the whole field
const R_DOCK = 114; // 260/2 - 16, the docked outer radius (CSS px)

// The canvas bleeds past the visible stage by this much on every side, so dots
// shoved off a ballooning bank (and the genesis overshoot) aren't clipped.
const BLEED = 48;

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInQuad = (t: number) => t * t;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
// easeOutBack-lite — ~6% overshoot then settle (gentler than the standard back curve).
const easeOutBackLite = (t: number) => {
  const c1 = 0.9;
  const c3 = c1 + 1;
  const u = t - 1;
  return 1 + c3 * u * u * u + c1 * u * u;
};
// Deterministic per-index hash → 0..1 (jitter without Math.random, which is unavailable).
const hash01 = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

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

type View = { genesis: boolean; docked: boolean; badge: boolean };

type Props = {
  // Fired once the dock has progressed far enough to reveal the page content.
  onDockReady?: () => void;
};

export function CassSwitchGuaranteeOrbit({ onDockReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null); // the inline 260px slot
  const stageRef = useRef<HTMLDivElement>(null); // absolutely-positioned during dock
  const backdropRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLSpanElement>(null);
  const [view, setView] = useState<View>({ genesis: false, docked: false, badge: false });
  const [reduced, setReduced] = useState(false);
  const dockReadyRef = useRef(false);
  const onDockReadyRef = useRef(onDockReady);
  onDockReadyRef.current = onDockReady;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      setView({ genesis: true, docked: true, badge: true });
      // Page content must still reveal even when the animation is skipped.
      if (!dockReadyRef.current) {
        dockReadyRef.current = true;
        onDockReadyRef.current?.();
      }
      return;
    }
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const backdrop = backdropRef.current;
    if (!canvas || !wrap || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const flow = wrap.closest('.cass-flow') as HTMLElement | null;

    const images = BANKS.map((b) => {
      const img = new Image();
      img.src = b.src;
      return img;
    });

    // Build the dot field: 4 concentric rings, evenly spaced, ring offset 0.4.
    // gradientT (0..1) is each dot's fixed position on the conic gradient, so
    // the rainbow rotates rigidly with the field (banks stay over their hue).
    // ri = ring index (0 = outer ... 3 = inner). rfNorm: 1 outer → 0 inner.
    const dots: { rf: number; baseAngle: number; size: number; gradientT: number; ri: number; rfNorm: number }[] = [];
    RINGS.forEach((ring, ri) => {
      const offset = RING_ANGLE_OFFSET * ri;
      const rfNorm = (ring.rf - RINGS[RINGS.length - 1].rf) / (RINGS[0].rf - RINGS[RINGS.length - 1].rf);
      for (let d = 0; d < DOTS_PER_RING; d += 1) {
        const baseAngle = (TAU * d) / DOTS_PER_RING + offset;
        dots.push({ rf: ring.rf, baseAngle, size: ring.dot, gradientT: (baseAngle % TAU) / TAU, ri, rfNorm });
      }
    });

    // Reusable scratch buffer for the per-frame separation solver (avoids per-frame GC).
    const solved = dots.map(() => ({ x: 0, y: 0, cr: 0, draw: 0, gradientT: 0, alpha: 1 }));

    // Stage box geometry. Two layouts: full panel (undocked) and the inline slot.
    let cw = 0; // canvas CSS width  (incl. bleed)
    let ch = 0; // canvas CSS height (incl. bleed)
    let cx = 0; // canvas-space centre x
    let cy = 0; // canvas-space centre y
    let dpr = 1;
    let rFull = R_DOCK; // outer radius at full-screen
    let panelRect = { left: 0, top: 0, width: 260, height: 260 };
    let slotRect = { left: 0, top: 0, width: 260, height: 260 };

    // The fixed stage is positioned in its containing block's coordinate space.
    // In both shipping modes that space coincides with .cass-flow's box: the live
    // app runs inside the DeviceFrame iframe where .cass-flow sits at the viewport
    // origin (fr.left/top ≈ 0), and Make adds transform to df-screen-area which makes
    // .cass-flow itself the containing block (so the fr-subtraction is exact). Hence
    // measuring relative to .cass-flow is correct in both; revisit if the flow is
    // ever nested under a transformed ancestor in the live (non-Make) build.
    const measure = () => {
      const sr = wrap.getBoundingClientRect();
      if (flow) {
        const fr = flow.getBoundingClientRect();
        panelRect = { left: 0, top: 0, width: fr.width, height: fr.height };
        slotRect = { left: sr.left - fr.left, top: sr.top - fr.top, width: sr.width, height: sr.height };
      } else {
        panelRect = { left: 0, top: 0, width: sr.width, height: sr.height };
        slotRect = { left: 0, top: 0, width: sr.width, height: sr.height };
      }
      // Full-screen radius leaves generous margin; docked radius is fixed.
      rFull = Math.max(R_DOCK, Math.min(panelRect.width, panelRect.height) / 2 - 36);
    };

    // Allocate the canvas backing store for a given CSS box (w,h) at a dpr.
    // Bleed is added on every side so overshoot/scatter is never clipped.
    const allocCanvas = (boxW: number, boxH: number, ratio: number) => {
      dpr = ratio;
      cw = boxW + BLEED * 2;
      ch = boxH + BLEED * 2;
      cx = cw / 2;
      cy = ch / 2;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Position the fixed stage box (the canvas + brand centre inside it). Coords
    // are in the containing-block space (= relative to .cass-flow, which is the
    // device screen inside DeviceFrame, or the viewport in narrow browsers).
    const placeStage = (left: number, top: number, w: number, h: number) => {
      stage.style.left = `${left}px`;
      stage.style.top = `${top}px`;
      stage.style.width = `${w}px`;
      stage.style.height = `${h}px`;
      stage.style.right = 'auto';
      stage.style.bottom = 'auto';
    };

    measure();
    // Pre-roll + genesis + dock all happen at the full-panel resolution. Cap dpr at
    // 2.0 here for fill-rate headroom over the large surface; bump to 2.5 once docked.
    const DPR_FULL = Math.min(window.devicePixelRatio || 1, 2.0);
    const DPR_DOCK = Math.min(window.devicePixelRatio || 1, 2.5);
    allocCanvas(panelRect.width, panelRect.height, DPR_FULL);
    placeStage(panelRect.left, panelRect.top, panelRect.width, panelRect.height);

    let docked = false; // becomes true once we swap to the static inline slot
    const ro = new ResizeObserver(() => {
      measure();
      if (docked) {
        allocCanvas(slotRect.width, slotRect.height, DPR_DOCK);
      } else {
        allocCanvas(panelRect.width, panelRect.height, DPR_FULL);
        placeStage(panelRect.left, panelRect.top, panelRect.width, panelRect.height);
      }
    });
    ro.observe(wrap);
    if (flow) ro.observe(flow);

    const bankBg = BANKS.map((b) => hexToRGB(b.bg));

    // Draw the radial bloom behind the FastFlag mark (genesis glow + intake pulse).
    const drawBloom = (rLive: number, alpha: number) => {
      if (alpha <= 0.01) return;
      const r = rLive * 0.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(159, 232, 112, ${(alpha * 0.5).toFixed(3)})`);
      g.addColorStop(0.5, `rgba(159, 232, 112, ${(alpha * 0.16).toFixed(3)})`);
      g.addColorStop(1, 'rgba(159, 232, 112, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();
    };

    // Upright bank bubble centred at (x, y) — never tilts.
    //   birth (0..1): 0 = still a coloured orbit particle (fill = its gradient
    //   hue, no logo), 1 = fully the brand bubble with logo.
    const drawBank = (x: number, y: number, diameter: number, bank: Bank, bi: number, img: HTMLImageElement, birth: number, logoAlpha: number) => {
      const rad = diameter / 2;
      const fill = birth >= 1 ? bankBg[bi] : mixRGB(samplePaletteRGB(bank.slot), bankBg[bi], clamp01(birth * 1.4));
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fillStyle = rgbStr(fill);
      ctx.fill();
      if (birth > 0.4 && logoAlpha > 0.01) {
        const a0 = ctx.globalAlpha;
        ctx.globalAlpha = a0 * clamp01((birth - 0.4) / 0.6);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(14, 15, 12, 0.10)';
        ctx.stroke();
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TAU);
        ctx.clip();
        ctx.globalAlpha = a0 * logoAlpha;
        if (img.complete && img.naturalWidth > 0) {
          const w = diameter * bank.logoScale;
          const h = w / bank.ratio;
          ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        }
        ctx.restore();
        ctx.globalAlpha = a0;
      }
    };

    let start = performance.now();
    let raf = 0;
    // Rotation is INTEGRATED from angular velocity (not angle = -k·t·mul), so the
    // perceived speed equals the velocity directly. The old angle-scaling form made
    // speed ∝ (mul + t·mul′); with t large, any change in mul became a huge spike —
    // a hump at the charge, a dead valley, a second hump at the spiral ("spin, slow,
    // spin"). Integrating velocity gives one smooth, monotonic acceleration instead.
    let rotAccum = 0;
    let prevT = 0;
    const last: View = { genesis: false, docked: false, badge: false };

    const frame = (now: number) => {
      const t = now - start;

      // --- Dock progress drives R_live and the stage CSS box. ---
      const dockP = easeInOutCubicBezier(clamp01((t - T_DOCK_START) / DOCK));
      const rLive = lerp(rFull, R_DOCK, dockP);

      // Swap to the static inline slot exactly when the dock completes, inside this
      // frame before drawing — R_live and the rect already equal docked values, so
      // the pre/post-swap frames are pixel-identical (no jump, no flash).
      if (!docked && t >= T_DOCK_END) {
        docked = true;
        allocCanvas(slotRect.width, slotRect.height, DPR_DOCK);
        // Clear EVERY inline box prop (incl. right/bottom set by placeStage) so the
        // --docked class's `inset:0` fully governs and the stage fills the 260px slot.
        // Leaving right/bottom/width set would shrink-wrap the absolute stage to its
        // content at top-left, jumping the orbit up-left.
        stage.style.left = '';
        stage.style.top = '';
        stage.style.right = '';
        stage.style.bottom = '';
        stage.style.width = '';
        stage.style.height = '';
        stage.classList.add('cass-orbit__stage--docked');
      }
      if (!docked) {
        // Animate the absolute stage box from full-panel to the slot rect.
        const left = lerp(panelRect.left, slotRect.left, dockP);
        const top = lerp(panelRect.top, slotRect.top, dockP);
        const w = lerp(panelRect.width, slotRect.width, dockP);
        const h = lerp(panelRect.height, slotRect.height, dockP);
        placeStage(left, top, w, h);
      }

      // Backdrop (full-screen takeover) fades out as the dock reveals the page.
      if (backdrop) {
        const bd = 1 - easeOutCubic(clamp01((t - T_DOCK_START) / 700));
        backdrop.style.opacity = `${bd.toFixed(3)}`;
        if (bd <= 0.01 && backdrop.style.display !== 'none') backdrop.style.display = 'none';
      }

      // Reveal the page content only after the orbit has fully landed + a 300ms beat,
      // so it animates in top-to-bottom (like other screens) instead of rising mid-dock.
      if (!dockReadyRef.current && t >= T_REVEAL) {
        dockReadyRef.current = true;
        onDockReadyRef.current?.();
      }

      // --- Rotation: integrate angular velocity each frame (CCW = negative). The speed
      // multiplier ramps monotonically — spin-up over genesis, then a smooth, continuous
      // acceleration from cruise (1×) up to ~2.4× as the dots wind into the logo. Because
      // we integrate VELOCITY, the on-screen speed is exactly this multiplier (no t·mul′
      // amplification), so there is one single accelerating swoop — no spike-then-valley.
      const spinUp = easeOutQuad(clamp01((t - T_GENESIS_START) / 600));
      const chargeP = clamp01((t - T_CHARGE) / CHARGE);
      const spiralSpin = clamp01((t - T_SPIRAL) / SPIRAL);
      const speedMul = 1 + 0.5 * easeInOutSine(chargeP) + 0.9 * easeInCubic(spiralSpin);
      const baseOmega = (TAU / ROT_PERIOD) * -1; // rad/ms, counter-clockwise
      const dt = Math.min(64, Math.max(0, t - prevT)); // clamp dt across tab stalls
      prevT = t;
      rotAccum += baseOmega * spinUp * speedMul * dt;
      const rot = rotAccum;

      // FastFlag size tracks the live radius; written to a CSS var on the DOM mark.
      const flagPx = 0.3 * rLive;
      if (flagRef.current) flagRef.current.style.setProperty('--flag-px', `${flagPx.toFixed(1)}px`);

      // View state — boolean transitions only (drives the DOM brand overlay reveal).
      const next: View = { genesis: t >= T_GENESIS_START, docked: t >= T_DOCK_END, badge: t >= T_BADGE };
      if (next.genesis !== last.genesis || next.docked !== last.docked || next.badge !== last.badge) {
        last.genesis = next.genesis;
        last.docked = next.docked;
        last.badge = next.badge;
        setView({ ...next });
      }

      ctx.clearRect(0, 0, cw, ch);

      // The orbit dissolves into the FastFlag during the spiral; fully gone by badge.
      const spiralP = clamp01((t - T_SPIRAL) / SPIRAL);
      const fieldGone = t >= T_BADGE;

      // Bloom: builds in pre-roll, holds, brightens through charge + spiral intake.
      const bloomBase = 0.5 * easeOutCubic(clamp01(t / T_GENESIS_START));
      const bloomCharge = 0.25 * chargeP;
      const bloomSpiral = 0.25 * Math.sin(Math.PI * clamp01((spiralP - 0.2) / 0.5));
      drawBloom(rLive, fieldGone ? 0 : bloomBase + bloomCharge + Math.max(0, bloomSpiral));

      if (!fieldGone) {
        const s = rLive / 120; // dot draw scale relative to the ref radius

        // a. Rest positions, genesis emanation, spiral collapse.
        for (let i = 0; i < dots.length; i += 1) {
          const dot = dots[i];
          const out = solved[i];

          // Genesis: dots are born at the core and curve outward to ring rest.
          const ringDelay = (RINGS.length - 1 - dot.ri) * 70; // inner rings lead
          const birth = clamp01((t - T_GENESIS_START - ringDelay - hash01(i) * 120) / EMANATE);
          const travel = easeOutBackLite(birth);

          const rfLive = dot.rf;
          let ang = dot.baseAngle + rot + 0.9 * (1 - travel); // SPIRAL_LEAD curve-in
          let radius = rLive * rfLive * travel;
          let drawAlpha = easeOutCubic(clamp01(birth * 1.4));

          // Spiral absorption: the radius collapses while the field keeps spinning via
          // the integrated `rot` (already accelerating via speedMul). We add only a SMALL
          // extra CCW wind near the core (negative = same direction) so the tail tightens
          // as it sinks — kept low so it doesn't read as a second, separate surge on top
          // of the main spin. One unified accelerating swoop.
          if (spiralP > 0) {
            const stagger = (1 - dot.rfNorm) * 0.12; // outer ring leads
            const a = clamp01(spiralP - stagger);
            const collapse = easeInCubic(a);
            radius = rLive * rfLive * (1 - collapse);
            ang = dot.baseAngle + rot - 1.2 * collapse * collapse;
            drawAlpha = 1 - easeInCubic(clamp01((a - 0.3) / 0.7));
          }

          out.x = cx + radius * Math.cos(ang);
          out.y = cy + radius * Math.sin(ang);
          out.draw = Math.max(0.5, dot.size * s) * (spiralP > 0 ? 1 - 0.85 * easeInCubic(clamp01(spiralP - (1 - dot.rfNorm) * 0.12)) : 1);
          out.cr = out.draw + DOT_MARGIN;
          out.gradientT = dot.gradientT;
          out.alpha = drawAlpha;
        }

        // --- Banks: pop (overshoot) → hold → shrink-to-dot, on the outer ring. ---
        // No persisting logos; clearance eases to 0 over the shrink so shoved dots
        // glide exactly home (Apple's moveDots, via a stateless solver).
        const bankD = rLive * 0.34;
        const seedD = Math.max(2, RINGS[0].dot * s) * 2;
        const orbitR = rLive * 0.94;
        const bankState = BANKS.map((bank, i) => {
          const localStart = T_BANKS + i * BANK_CYCLE;
          const local = t - localStart;
          let birth = 0;
          let diameter = seedD;
          let logoAlpha = 0;
          let shrinkG = 0;
          let active = false;
          // Banks only ever exist before the dock starts — once the orbit scales
          // down, no bank logo appears again (the showcase is a full-size-only beat).
          if (local >= 0 && t < T_DOCK_START && spiralP <= 0) {
            active = true;
            if (local < BANK_POP) {
              // POP: balloon out with a 1.1× overshoot then settle.
              const p = local / BANK_POP;
              const grow = local < BANK_POP / 2 ? easeOutCubic(local / (BANK_POP / 2)) : 1;
              const overshoot = local < BANK_POP / 2 ? 1 + 0.1 * (local / (BANK_POP / 2)) : 1.1 - 0.1 * ((local - BANK_POP / 2) / (BANK_POP / 2));
              birth = grow;
              diameter = lerp(seedD, bankD, grow) * overshoot;
              logoAlpha = clamp01(p * 2);
            } else if (local < BANK_POP + BANK_HOLD) {
              birth = 1;
              diameter = bankD;
              logoAlpha = 1;
            } else if (local < BANK_POP + BANK_HOLD + BANK_SHRINK) {
              // SHRINK: deflate back to a plain dot; logo fades at 45% in.
              shrinkG = clamp01((local - BANK_POP - BANK_HOLD) / BANK_SHRINK);
              const g = easeInQuad(shrinkG);
              birth = 1 - g;
              diameter = lerp(bankD, seedD, g);
              logoAlpha = 1 - clamp01((shrinkG - 0.45) / 0.55);
            } else {
              active = false; // fully returned to a dot — handled by the dot field
            }
          }
          const angle = bank.slot * TAU + rot;
          const x = cx + orbitR * Math.cos(angle);
          const y = cy + orbitR * Math.sin(angle);
          return { bank, i, birth, diameter, logoAlpha, shrinkG, active, angle, x, y };
        });

        // b. Active set: dots within reach of any live bank bubble.
        const bankClear = (b: (typeof bankState)[number]) => (b.diameter / 2 + rLive * 0.05) * (1 - easeInQuad(b.shrinkG));
        const maxDotR = RINGS[0].dot * s + DOT_MARGIN;
        const active: number[] = [];
        if (spiralP <= 0) {
          for (let i = 0; i < dots.length; i += 1) {
            const p = solved[i];
            for (const b of bankState) {
              if (!b.active) continue;
              const clear = bankClear(b);
              if (clear > 0.5 && Math.hypot(p.x - b.x, p.y - b.y) < clear + maxDotR + p.cr) {
                active.push(i);
                break;
              }
            }
          }
        }

        // c. Relax: separate dots from each other, then re-assert bank clearance.
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
              if (!b.active) continue;
              const clear = bankClear(b) + p.cr;
              if (clear <= p.cr) continue;
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

        // d. Draw dots.
        for (let i = 0; i < dots.length; i += 1) {
          const p = solved[i];
          if (p.alpha <= 0.01) continue;
          ctx.globalAlpha = p.alpha * 0.92;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.draw, 0, TAU);
          ctx.fillStyle = samplePalette(p.gradientT);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // e. Draw banks (over the dots).
        for (const b of bankState) {
          if (!b.active || b.birth <= 0) continue;
          drawBank(b.x, b.y, b.diameter, b.bank, b.i, images[b.i], b.birth, b.logoAlpha);
        }
      }

      if (t < T_END) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cw, ch);
      }
    };

    raf = requestAnimationFrame(frame);
    // Resync after a backgrounded tab: advance `start` forward so `t` stays monotonic
    // (never replays genesis). Only meaningful before the badge lands.
    let hiddenAt = 0;
    const onVis = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
      } else if (hiddenAt && !last.badge) {
        start += performance.now() - hiddenAt;
        hiddenAt = 0;
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // Tap to skip — fast-forward to the docked cruise (or near the end if past dock).
    const onSkip = () => {
      const t = performance.now() - start;
      if (t < T_DOCK_END) start = performance.now() - T_DOCK_END;
    };
    stage.addEventListener('pointerdown', onSkip);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      stage.removeEventListener('pointerdown', onSkip);
    };
  }, [reduced]);

  // The disc halo + flag-size lock + badge all reveal together at the end. Until
  // then the flag tracks the live orbit radius via --flag-px (rAF-driven).
  const brandIn = reduced || view.badge;

  return (
    <div className="cass-orbit" ref={wrapRef} aria-hidden="true">
      {!reduced && <div className="cass-orbit__backdrop" ref={backdropRef} />}
      <div className="cass-orbit__stage" ref={stageRef}>
        {!reduced && <canvas ref={canvasRef} className="cass-orbit__canvas" />}
        <div className={`cass-orbit__brand${brandIn ? ' cass-orbit__brand--in' : ''}`}>
          <div className="cass-orbit__disc">
            <span className="cass-orbit__flag" ref={flagRef} />
          </div>
          <img
            className={`cass-orbit__guarantee${view.badge ? ' cass-orbit__guarantee--in' : ''}`}
            src="/cass/cass-guarantee-badge.svg"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

// dockEase = cubic-bezier(0.32, 0.72, 0, 1) — the project's flow-overlay curve.
// Evaluated numerically (Newton's method on x) for use inside the rAF loop.
function easeInOutCubicBezier(x: number): number {
  return cubicBezier(0.32, 0.72, 0, 1, x);
}
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const fx = (tt: number) => ((ax * tt + bx) * tt + cx) * tt;
  const dfx = (tt: number) => (3 * ax * tt + 2 * bx) * tt + cx;
  let tt = x;
  for (let i = 0; i < 6; i += 1) {
    const e = fx(tt) - x;
    if (Math.abs(e) < 1e-4) break;
    const d = dfx(tt);
    if (Math.abs(d) < 1e-6) break;
    tt -= e / d;
  }
  return ((ay * tt + by) * tt + cy) * tt;
}
