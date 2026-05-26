import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { GlassFilter } from './GlassFilter';

interface LiquidGlassSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const SLIDER_WIDTH = 56;
const SLIDER_HEIGHT = 28;
const THUMB_WIDTH = 48;
const THUMB_HEIGHT = 36;
const BEZEL_WIDTH = 8;
const GLASS_THICKNESS = 10;
const THUMB_REST_SCALE = 0.65;
const THUMB_ACTIVE_SCALE = 0.9;

export function LiquidGlassSwitch({ checked = false, onChange, disabled = false }: LiquidGlassSwitchProps) {
  const filterId = useId().replace(/:/g, '-');

  const [internalChecked, setInternalChecked] = useState(checked);
  const [pointerDown, setPointerDown] = useState(false);
  const [xDragRatio, setXDragRatio] = useState(checked ? 1 : 0);
  const initialPointerX = useRef(0);

  useEffect(() => {
    setInternalChecked(checked);
    if (!pointerDown) setXDragRatio(checked ? 1 : 0);
  }, [checked, pointerDown]);

  const thumbRadius = THUMB_HEIGHT / 2;
  const THUMB_REST_OFFSET = ((1 - THUMB_REST_SCALE) * THUMB_WIDTH) / 2;
  const TRAVEL = SLIDER_WIDTH - SLIDER_HEIGHT - (THUMB_WIDTH - THUMB_HEIGHT) * THUMB_REST_SCALE;

  const thumbScale = pointerDown ? THUMB_ACTIVE_SCALE : THUMB_REST_SCALE;
  const backgroundOpacity = pointerDown ? 0.1 : 1;
  const scaleRatio = pointerDown ? 0.9 : 0.4;
  const thumbX = xDragRatio * TRAVEL;
  const thumbMarginLeft = -THUMB_REST_OFFSET + (SLIDER_HEIGHT - THUMB_HEIGHT * THUMB_REST_SCALE) / 2;

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setPointerDown(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    initialPointerX.current = clientX;
  }, [disabled]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!pointerDown || disabled) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const baseRatio = internalChecked ? 1 : 0;
    const displacementX = clientX - initialPointerX.current;
    const ratio = baseRatio + displacementX / TRAVEL;
    const overflow = ratio < 0 ? -ratio : ratio > 1 ? ratio - 1 : 0;
    const overflowSign = ratio < 0 ? -1 : 1;
    const dampedOverflow = (overflowSign * overflow) / 22;
    setXDragRatio(Math.min(1, Math.max(0, ratio)) + dampedOverflow);
  }, [pointerDown, disabled, internalChecked, TRAVEL]);

  const handlePointerUp = useCallback((e: MouseEvent | TouchEvent) => {
    if (!pointerDown) return;
    setPointerDown(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
    const distance = clientX - initialPointerX.current;

    let newValue: boolean;
    if (Math.abs(distance) > 4) {
      newValue = xDragRatio > 0.5;
    } else {
      newValue = !internalChecked;
    }
    setInternalChecked(newValue);
    setXDragRatio(newValue ? 1 : 0);
    onChange?.(newValue);
  }, [pointerDown, internalChecked, xDragRatio, onChange]);

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

  return (
    <div className={`lg-switch${disabled ? ' lg-switch--disabled' : ''}`}>
      <div
        className={`lg-switch__track${internalChecked ? ' lg-switch__track--on' : ''}`}
        style={{
          width: SLIDER_WIDTH,
          height: SLIDER_HEIGHT,
          borderRadius: SLIDER_HEIGHT / 2,
        }}
      >
        <GlassFilter
          id={`glass-switch${filterId}`}
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

        <div
          className="lg-switch__thumb"
          style={{
            height: THUMB_HEIGHT,
            width: THUMB_WIDTH,
            marginLeft: thumbMarginLeft,
            transform: `translateX(${thumbX}px) translateY(-50%) scale(${thumbScale})`,
            top: SLIDER_HEIGHT / 2,
            borderRadius: thumbRadius,
            backdropFilter: `url(#glass-switch${filterId})`,
            backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
            boxShadow: pointerDown
              ? '0 4px 22px rgba(0,0,0,0.1), inset 2px 7px 24px rgba(0,0,0,0.09), inset -2px -7px 24px rgba(255,255,255,0.09)'
              : '0 4px 22px rgba(0,0,0,0.1)',
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>
    </div>
  );
}
