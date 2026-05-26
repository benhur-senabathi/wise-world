import { useRef, useCallback, useEffect, useState } from 'react';

const SPRING = 0.14;
const DAMP = 0.65;
const PRESS_SPRING = 0.25;
const PRESS_DAMP = 0.55;
const MAX_PULL = 16;
const SETTLE_THRESHOLD = 0.04;
const VELOCITY_THRESHOLD = 0.006;

interface UseLiquidGlassOptions {
  axis?: 'both' | 'vertical';
  pressScale?: number;
  pressSpring?: number;
  pressDamp?: number;
}

interface SpringState {
  down: boolean;
  sx: number; sy: number;
  cx: number; cy: number;
  vx: number; vy: number;
  tx: number; ty: number;
  pressed: number; vPressed: number;
  raf: number;
}

export function useLiquidGlass<T extends HTMLElement = HTMLElement>(options?: UseLiquidGlassOptions) {
  const axis = options?.axis ?? 'both';
  const pressScale = options?.pressScale ?? 0.11;
  const pressSpring = options?.pressSpring ?? PRESS_SPRING;
  const pressDamp = options?.pressDamp ?? PRESS_DAMP;
  const ref = useRef<T>(null);
  const [isPressed, setIsPressed] = useState(false);
  const s = useRef<SpringState>({
    down: false,
    sx: 0, sy: 0,
    cx: 0, cy: 0,
    vx: 0, vy: 0,
    tx: 0, ty: 0,
    pressed: 0, vPressed: 0,
    raf: 0,
  });

  const tick = useCallback(() => {
    const st = s.current;
    const el = ref.current;
    if (!el) return;

    st.vx = (st.vx + (st.tx - st.cx) * SPRING) * DAMP;
    st.vy = (st.vy + (st.ty - st.cy) * SPRING) * DAMP;
    st.cx += st.vx;
    st.cy += st.vy;

    const tP = st.down ? 1 : 0;
    st.vPressed = (st.vPressed + (tP - st.pressed) * pressSpring) * pressDamp;
    st.pressed += st.vPressed;

    const absX = Math.abs(st.cx);
    const absY = Math.abs(st.cy);
    const pullMagnitude = Math.sqrt(st.cx * st.cx + st.cy * st.cy);
    const normalizedPull = pullMagnitude / MAX_PULL;

    const stretchAmount = normalizedPull * 0.09;
    const ratioX = absX / (absX + absY + 0.001);
    const ratioY = absY / (absX + absY + 0.001);

    const sx = 1 + stretchAmount * ratioX - stretchAmount * ratioY * 0.35;
    const sy = 1 + stretchAmount * ratioY - stretchAmount * ratioX * 0.35;

    const ps = 1 + st.pressed * pressScale;
    const finalSx = sx * ps;
    const finalSy = sy * ps;

    const moveX = st.cx * 0.45;
    const moveY = st.cy * 0.45;

    const originX = st.cx > 1 ? '20%' : st.cx < -1 ? '80%' : '50%';
    const originY = st.cy > 1 ? '20%' : st.cy < -1 ? '80%' : '50%';
    el.style.transformOrigin = `${originX} ${originY}`;
    el.style.transform = `translate(${moveX}px, ${moveY}px) scale(${finalSx}, ${finalSy})`;

    const settled = !st.down
      && Math.abs(st.cx) < SETTLE_THRESHOLD
      && Math.abs(st.cy) < SETTLE_THRESHOLD
      && Math.abs(st.vx) < VELOCITY_THRESHOLD
      && Math.abs(st.vy) < VELOCITY_THRESHOLD
      && Math.abs(st.pressed) < 0.002
      && Math.abs(st.vPressed) < 0.002;

    if (!settled) {
      st.raf = requestAnimationFrame(tick);
    } else {
      st.cx = st.cy = st.vx = st.vy = 0;
      st.pressed = 0;
      st.vPressed = 0;
      el.style.transform = 'translate(0px, 0px) scale(1, 1)';
      el.style.transformOrigin = '50% 50%';
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const st = s.current;
    st.down = true;
    st.sx = e.clientX;
    st.sy = e.clientY;
    st.tx = 0;
    st.ty = 0;
    setIsPressed(true);
    cancelAnimationFrame(st.raf);
    st.raf = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const st = s.current;
    if (!st.down) return;
    const rx = e.clientX - st.sx;
    const ry = e.clientY - st.sy;
    st.tx = axis === 'vertical' ? 0 : Math.max(-MAX_PULL, Math.min(MAX_PULL, rx));
    st.ty = Math.max(-MAX_PULL, Math.min(MAX_PULL, ry));
  }, [axis]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const st = s.current;
    st.down = false;
    st.tx = 0;
    st.ty = 0;
    setIsPressed(false);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(s.current.raf);
  }, []);

  return { ref, isPressed, onPointerDown, onPointerMove, onPointerUp };
}
