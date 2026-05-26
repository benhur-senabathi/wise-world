import { useState, type ReactNode } from 'react';
import { useLiquidGlass } from '../hooks/useLiquidGlass';

interface LiquidGlassContainerProps {
  children: ReactNode;
  padding?: number;
  borderRadius?: number;
  disabled?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LiquidGlassContainer({ children, padding = 16, borderRadius = 24, disabled = false, interactive = true, onClick, className }: LiquidGlassContainerProps) {
  const [pressPos, setPressPos] = useState({ x: 50, y: 50 });
  const { ref, isPressed, onPointerDown, onPointerMove, onPointerUp } = useLiquidGlass<HTMLDivElement>({
    axis: 'vertical',
    pressScale: 0.04,
    pressSpring: 0.05,
    pressDamp: 0.75,
  });

  return (
    <div
      ref={ref}
      className={`lg-container${isPressed ? ' lg-container--pressed' : ''}${className ? ` ${className}` : ''}`}
      style={{ padding, borderRadius }}
      onPointerDown={(e) => {
        if (disabled || !interactive) return;
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          setPressPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }
        onPointerDown(e);
      }}
      onPointerMove={(e) => { if (interactive) onPointerMove(e); }}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      <div className="lg-container__surface" style={{ borderRadius }} />
      <div className="lg-container__surface-burn" style={{ borderRadius }} />
      <div className="lg-container__surface-darken" style={{ borderRadius }} />
      <div className="lg-container__border" style={{ borderRadius }} />
      {interactive && (
        <div
          className="lg-container__flash"
          style={{
            borderRadius,
            background: `radial-gradient(circle at ${pressPos.x}% ${pressPos.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 90%)`,
            opacity: isPressed ? 1 : 0,
          }}
        />
      )}
      <div className="lg-container__content">
        {children}
      </div>
    </div>
  );
}
