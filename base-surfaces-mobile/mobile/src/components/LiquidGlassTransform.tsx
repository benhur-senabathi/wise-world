import { useCallback, useRef, useState } from 'react';
import { Plus, Cross } from '@transferwise/icons';
import { useLiquidGlass } from '../hooks/useLiquidGlass';
import './LiquidGlassTransform.css';

const COLLAPSED = { width: 56, height: 56, borderRadius: 28 };
const EXPANDED = { width: 280, height: 160, borderRadius: 24 };

export function LiquidGlassTransform() {
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [pressPos, setPressPos] = useState({ x: 50, y: 50 });
  const elementRef = useRef<HTMLDivElement | null>(null);
  const { ref: glassRef, isPressed, onPointerDown, onPointerMove, onPointerUp } = useLiquidGlass<HTMLDivElement>({
    pressScale: 0.04,
    pressSpring: 0.05,
    pressDamp: 0.75,
  });

  const handleToggle = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setExpanded(prev => !prev);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const current = expanded ? EXPANDED : COLLAPSED;

  return (
    <div className="lg-transform">
      <div
        ref={(el) => {
          elementRef.current = el;
          (glassRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={`lg-transform__body${expanded ? ' lg-transform__body--expanded' : ''}`}
        style={{
          width: current.width,
          height: current.height,
          borderRadius: current.borderRadius,
        }}
        onClick={!expanded ? handleToggle : undefined}
        onPointerDown={(e) => {
          const rect = elementRef.current?.getBoundingClientRect();
          if (rect) setPressPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
          onPointerDown(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="lg-transform__surface">
          <div className="lg-transform__surface-burn" />
          <div className="lg-transform__surface-darken" />
        </div>
        <div className="lg-transform__border" />
        <div
          className="lg-transform__flash"
          style={{
            background: `radial-gradient(circle at ${pressPos.x}% ${pressPos.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 90%)`,
            opacity: isPressed ? 1 : 0,
          }}
        />

        <div className={`lg-transform__icon${expanded ? ' lg-transform__icon--hidden' : ''}`}>
          <Plus size={24} />
        </div>

        <div className={`lg-transform__content${expanded ? ' lg-transform__content--visible' : ''}`}>
          <div className="lg-transform__content-header">
            <button className="lg-transform__close" onClick={handleToggle}>
              <Cross size={16} />
            </button>
          </div>
          <p className="lg-transform__text">
            This container morphed from the button. Any component can transform into a liquid glass surface.
          </p>
        </div>
      </div>
    </div>
  );
}
