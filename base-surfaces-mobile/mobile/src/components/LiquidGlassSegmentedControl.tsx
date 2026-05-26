import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { GlassFilter } from './GlassFilter';

export interface SegmentItem {
  id: string;
  label: string;
  value: string;
}

interface LiquidGlassSegmentedControlProps {
  name: string;
  value: string;
  segments: readonly SegmentItem[];
  onChange: (value: string) => void;
}

const TRACK_HEIGHT = 48;
const THUMB_REST_HEIGHT = 40;
const THUMB_ACTIVE_HEIGHT = 60;
const THUMB_BEZEL = 10;
const GLASS_THICKNESS = 12;
const THUMB_REST_RADIUS = 20;
const THUMB_GLASS_RADIUS = 28;
const THUMB_WIDTH_EXTRA = 24;
const PADDING = 4;

export function LiquidGlassSegmentedControl({ name, value, segments, onChange }: LiquidGlassSegmentedControlProps) {
  const filterId = useId().replace(/:/g, '-');
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLLabelElement | null)[]>([]);

  const [segmentWidths, setSegmentWidths] = useState<number[]>([]);
  const [segmentOffsets, setSegmentOffsets] = useState<number[]>([]);
  const [animate, setAnimate] = useState(false);
  const [pointerDown, setPointerDown] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [dragX, setDragX] = useState<number | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isMountedRef = useRef(false);
  const initialPointerX = useRef(0);
  const initialThumbX = useRef(0);

  const selectedIndex = segments.findIndex(seg => seg.value === value);
  const isActive = pointerDown || transitioning;

  const measureSegments = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const widths: number[] = [];
    const offsets: number[] = [];
    segmentRefs.current.forEach((el) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        widths.push(rect.width);
        offsets.push(rect.left - containerRect.left);
      }
    });
    setSegmentWidths(widths);
    setSegmentOffsets(offsets);
  }, []);

  useEffect(() => {
    if (isMountedRef.current) {
      setAnimate(true);
    } else {
      isMountedRef.current = true;
    }
    measureSegments();

    const handleResize = () => {
      setAnimate(false);
      measureSegments();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [value, segments, measureSegments]);

  const thumbX = dragX !== null ? dragX : (segmentOffsets[selectedIndex] ?? 0);
  const thumbWidth = segmentWidths[selectedIndex] ?? 120;
  const thumbRadius = isActive ? THUMB_GLASS_RADIUS : THUMB_REST_RADIUS;
  const thumbHeight = isActive ? THUMB_ACTIVE_HEIGHT : THUMB_REST_HEIGHT;
  const activeThumbWidth = thumbWidth + THUMB_WIDTH_EXTRA;
  const activeThumbOffset = THUMB_WIDTH_EXTRA / 2;
  const displayThumbWidth = isActive ? activeThumbWidth : thumbWidth;
  const displayThumbX = isActive ? thumbX - activeThumbOffset : thumbX;
  const scaleRatio = isActive ? 0.9 : 0.4;

  const triggerTransition = useCallback((segmentValue: string) => {
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setTransitioning(true);
    setAnimate(true);
    setDragX(null);
    onChange(segmentValue);
    transitionTimeoutRef.current = setTimeout(() => setTransitioning(false), 300);
  }, [onChange]);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setPointerDown(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    initialPointerX.current = clientX;
    initialThumbX.current = segmentOffsets[selectedIndex] ?? 0;
  }, [selectedIndex, segmentOffsets]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!pointerDown) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const dx = clientX - initialPointerX.current;
    const newX = initialThumbX.current + dx;
    const minX = segmentOffsets[0] ?? 0;
    const maxX = segmentOffsets[segments.length - 1] ?? 0;
    const overflow = newX < minX ? (newX - minX) : newX > maxX ? (newX - maxX) : 0;
    const dampedOverflow = overflow / 22;
    const clamped = Math.max(minX, Math.min(maxX, newX));
    setDragX(clamped + dampedOverflow);
  }, [pointerDown, segments.length, segmentOffsets]);

  const handlePointerUp = useCallback((e: MouseEvent | TouchEvent) => {
    if (!pointerDown) return;
    setPointerDown(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
    const distance = clientX - initialPointerX.current;

    let newIndex: number;
    if (Math.abs(distance) > 4 && dragX !== null) {
      let closestIdx = 0;
      let closestDist = Infinity;
      segmentOffsets.forEach((offset, idx) => {
        const dist = Math.abs(dragX - offset);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });
      newIndex = closestIdx;
    } else {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const localX = clientX - rect.left;
        let clickedIdx = 0;
        for (let i = 0; i < segmentOffsets.length; i++) {
          const segEnd = segmentOffsets[i] + segmentWidths[i];
          if (localX >= segmentOffsets[i] && localX < segEnd) {
            clickedIdx = i;
            break;
          }
        }
        newIndex = clickedIdx;
      } else {
        newIndex = selectedIndex;
      }
    }

    setDragX(null);
    if (newIndex !== selectedIndex) {
      triggerTransition(segments[newIndex].value);
    }
  }, [pointerDown, dragX, segmentOffsets, segmentWidths, selectedIndex, segments, triggerTransition]);

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

  function handleSegmentClick(segValue: string) {
    if (segValue === value) return;
    triggerTransition(segValue);
  }

  return (
    <div style={{ width: '100%', userSelect: 'none', touchAction: 'none' }}>
      <GlassFilter
        id={`glass-seg${filterId}`}
        width={(thumbWidth || 120) + THUMB_WIDTH_EXTRA}
        height={THUMB_ACTIVE_HEIGHT}
        radius={thumbRadius}
        bezelWidth={THUMB_BEZEL}
        glassThickness={GLASS_THICKNESS}
        refractiveIndex={1.5}
        bezelType="lip"
        shape="pill"
        blur={0.2}
        scaleRatio={scaleRatio}
        specularOpacity={0.5}
        specularSaturation={6}
      />

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'inline-flex',
          padding: PADDING,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 24,
          overflow: 'visible',
          cursor: 'pointer',
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          background: 'var(--color-background-neutral)',
        }} />

        {thumbWidth > 0 && (
          <div
            style={{
              position: 'absolute',
              height: thumbHeight,
              width: displayThumbWidth,
              left: 0,
              top: '50%',
              transform: `translate3d(${displayThumbX}px, -50%, 0)`,
              willChange: 'transform, width, height',
              borderRadius: thumbRadius,
              backdropFilter: isActive ? `url(#glass-seg${filterId})` : 'none',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'var(--color-background-screen)',
              boxShadow: isActive
                ? '0 4px 22px rgba(0,0,0,0.1), inset 2px 7px 24px rgba(0,0,0,0.09), inset -2px -7px 24px rgba(255,255,255,0.09)'
                : 'none',
              transition: [
                animate ? 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' : null,
                animate ? 'width 300ms cubic-bezier(0.32, 0.72, 0, 1)' : null,
                'height 200ms cubic-bezier(0.32, 0.72, 0, 1)',
                'border-radius 200ms cubic-bezier(0.32, 0.72, 0, 1)',
                'background-color 200ms ease-out',
                'box-shadow 200ms ease-out',
                'backdrop-filter 200ms ease-out',
              ].filter(Boolean).join(', '),
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {segments.map((segment, idx) => (
          <label
            ref={el => { segmentRefs.current[idx] = el; }}
            key={segment.id}
            htmlFor={segment.id}
            style={{
              position: 'relative',
              flex: '1 1 100%',
              padding: '8px 16px',
              margin: idx === 0 ? 0 : '0 0 0 4px',
              textAlign: 'center',
              cursor: 'pointer',
              zIndex: 1,
              borderRadius: 24,
            }}
          >
            <input
              type="radio"
              id={segment.id}
              name={name}
              value={segment.value}
              checked={value === segment.value}
              onChange={() => handleSegmentClick(segment.value)}
              style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }}
            />
            <span style={{
              fontWeight: value === segment.value ? 'var(--font-weight-semi-bold)' : 'var(--font-weight-regular)',
              fontSize: 'var(--font-size-14)',
              lineHeight: 'var(--line-height-20)',
              fontFamily: 'var(--font-family)',
              color: 'var(--color-interactive-primary)',
              transition: 'font-weight 300ms',
              whiteSpace: 'nowrap',
            } as React.CSSProperties}>
              {segment.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
