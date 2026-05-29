import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState, useId } from 'react';
import { House, CardWise, Recipients, Payments } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import { GlassFilter } from './GlassFilter';
import type { TranslationKey } from '../translations/en';
import './MobileNav.css';

const items: { label: string; translationKey: TranslationKey; icon: React.ReactNode }[] = [
  { label: 'Home', translationKey: 'nav.home', icon: <House size={24} /> },
  { label: 'Cards', translationKey: 'nav.cards', icon: <CardWise size={24} /> },
  { label: 'Recipients', translationKey: 'nav.recipients', icon: <Recipients size={24} /> },
  { label: 'Payments', translationKey: 'nav.payments', icon: <Payments size={24} /> },
];

const SLIDER_HEIGHT = 57;
const ITEM_WIDTH = 86;
const THUMB_WIDTH = 110;
const THUMB_HEIGHT = 75;
const THUMB_REST_RADIUS = 34;
const THUMB_GLASS_RADIUS = 42;
const BEZEL_WIDTH = 14;
const GLASS_THICKNESS = 15;
const PADDING = -8;
const ITEMS_PAD = 12;

export type MobileNavHandle = {
  animateTo: (label: string) => void;
};

export const MobileNav = forwardRef<MobileNavHandle, {
  activeItem: string;
  onSelect: (label: string) => void;
}>(function MobileNav({ activeItem, onSelect }, ref) {
  const filterId = useId().replace(/:/g, '-');
  const barRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const [measuredItemWidth, setMeasuredItemWidth] = useState(ITEM_WIDTH);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      if (itemsRef.current) {
        const w = (itemsRef.current.offsetWidth - ITEMS_PAD * 2) / items.length;
        if (w > 0) setMeasuredItemWidth(w);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const [internalChecked, setInternalChecked] = useState(() => {
    const idx = items.findIndex(i => i.label === activeItem);
    return idx === -1 ? 0 : idx;
  });
  const [pointerDown, setPointerDown] = useState(false);
  const [pressPos, setPressPos] = useState({ x: 50, y: 50 });
  const [transitioning, setTransitioning] = useState(false);
  const [xDragRatio, setXDragRatio] = useState(() => {
    const idx = items.findIndex(i => i.label === activeItem);
    return idx === -1 ? 0 : idx / (items.length - 1);
  });
  const initialPointerX = useRef(0);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const idx = items.findIndex(i => i.label === activeItem);
    if (idx !== -1) {
      setInternalChecked(idx);
      if (!pointerDown) setXDragRatio(idx / (items.length - 1));
    }
  }, [activeItem, pointerDown]);

  const TRAVEL = (items.length - 1) * measuredItemWidth;
  const REST_SCALE_X = (measuredItemWidth - PADDING * 2) / THUMB_WIDTH;
  const REST_SCALE_Y = (SLIDER_HEIGHT - 4) / THUMB_HEIGHT;
  const ACTIVE_SCALE = 1.0;

  const isActive = pointerDown || transitioning;
  const thumbRadius = isActive ? THUMB_GLASS_RADIUS : THUMB_REST_RADIUS;
  const thumbScaleX = REST_SCALE_X + (ACTIVE_SCALE - REST_SCALE_X) * (isActive ? 1 : 0);
  const thumbScaleY = REST_SCALE_Y + (ACTIVE_SCALE - REST_SCALE_Y) * (isActive ? 1 : 0);
  const scaleRatio = 0.4 + 0.5 * (isActive ? 1 : 0);
  const thumbOffset = (measuredItemWidth - THUMB_WIDTH) / 2;
  const thumbX = ITEMS_PAD + thumbOffset + xDragRatio * TRAVEL;

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setPointerDown(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    initialPointerX.current = clientX;
    const rect = barRef.current?.getBoundingClientRect();
    if (rect) {
      setPressPos({
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      });
    }
  }, []);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!pointerDown) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const baseRatio = internalChecked / (items.length - 1);
    const displacementX = clientX - initialPointerX.current;
    const ratio = baseRatio + displacementX / TRAVEL;
    const overflow = ratio < 0 ? -ratio : ratio > 1 ? ratio - 1 : 0;
    const overflowSign = ratio < 0 ? -1 : 1;
    const dampedOverflow = (overflowSign * overflow) / 22;
    setXDragRatio(Math.min(1, Math.max(0, ratio)) + dampedOverflow);
  }, [pointerDown, internalChecked, TRAVEL]);

  const handlePointerUp = useCallback((e: MouseEvent | TouchEvent) => {
    if (!pointerDown) return;
    setPointerDown(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
    const distance = clientX - initialPointerX.current;

    let newIndex: number;
    if (Math.abs(distance) > 4) {
      newIndex = Math.round(xDragRatio * (items.length - 1));
      newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    } else {
      const rect = barRef.current?.getBoundingClientRect();
      if (rect) {
        const localX = clientX - rect.left - ITEMS_PAD;
        newIndex = Math.floor(localX / measuredItemWidth);
        newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
      } else {
        newIndex = internalChecked;
      }
    }

    if (newIndex !== internalChecked) {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      setTransitioning(true);
      setXDragRatio(newIndex / (items.length - 1));
      setInternalChecked(newIndex);
      onSelect(items[newIndex].label);
      transitionTimeoutRef.current = setTimeout(() => setTransitioning(false), 200);
    } else {
      setXDragRatio(newIndex / (items.length - 1));
    }
  }, [pointerDown, internalChecked, xDragRatio, onSelect]);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    return () => { if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current); };
  }, []);

  const animateTo = useCallback((label: string) => {
    const idx = items.findIndex(i => i.label === label);
    if (idx === -1 || idx === internalChecked) return;
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setTransitioning(true);
    setXDragRatio(idx / (items.length - 1));
    setInternalChecked(idx);
    onSelect(label);
    transitionTimeoutRef.current = setTimeout(() => setTransitioning(false), 200);
  }, [internalChecked, onSelect]);

  useImperativeHandle(ref, () => ({ animateTo }), [animateTo]);

  return (
    <div className="mobile-nav__wrapper">
      <div
        ref={barRef}
        className="mobile-nav"
        style={{
          height: SLIDER_HEIGHT,
          transform: `scale(${pointerDown ? 1.03 : 1})`,
          transition: 'transform 150ms ease-out',
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Track surface */}
        <div className="mobile-nav__track">
          <div className="mobile-nav__track-burn" />
          <div className="mobile-nav__track-darken" />
          <div className="mobile-nav__track-border" />
          <div
            className="mobile-nav__track-flash"
            style={{
              background: `radial-gradient(circle at ${pressPos.x}% ${pressPos.y}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 90%)`,
              opacity: pointerDown ? 1 : 0,
            }}
          />
        </div>

        {/* Glass filter for thumb */}
        <GlassFilter
          id={`glass-nav${filterId}`}
          width={THUMB_WIDTH}
          height={THUMB_HEIGHT}
          radius={thumbRadius}
          bezelWidth={BEZEL_WIDTH}
          glassThickness={GLASS_THICKNESS}
          refractiveIndex={1.5}
          bezelType="lip"
          shape="pill"
          blur={0.2}
          scaleRatio={scaleRatio}
          specularOpacity={0.5}
          specularSaturation={6}
        />

        {/* Thumb */}
        <div
          className="mobile-nav__thumb"
          style={{
            height: THUMB_HEIGHT,
            width: THUMB_WIDTH,
            transform: `translateX(${thumbX}px) translateY(-50%) scaleX(${thumbScaleX}) scaleY(${thumbScaleY})`,
            borderRadius: thumbRadius,
            backdropFilter: isActive ? `url(#glass-nav${filterId})` : 'none',
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0)' : 'var(--color-background-neutral)',
            boxShadow: isActive
              ? '0 4px 22px rgba(0,0,0,0.1), inset 2px 7px 24px rgba(0,0,0,0.09), inset -2px -7px 24px rgba(255,255,255,0.09)'
              : 'none',
          }}
        />

        {/* Items */}
        <div className="mobile-nav__items" ref={itemsRef}>
          {items.map((item) => (
            <div
              key={item.label}
              className={`mobile-nav-item${activeItem === item.label ? ' mobile-nav-item--active' : ''}`}
            >
              <span className="mobile-nav-item__icon">{item.icon}</span>
              <span className="mobile-nav-item__label">{t(item.translationKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
