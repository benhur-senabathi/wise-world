import type { ReactNode } from 'react';
import { useLiquidGlass } from '../hooks/useLiquidGlass';
import './LiquidGlassButton.css';

interface LiquidGlassIconButtonProps {
  icon: ReactNode;
  secondaryIcon?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  priority?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function LiquidGlassIconButton({ icon, secondaryIcon, onClick, ariaLabel, priority = 'secondary', disabled = false }: LiquidGlassIconButtonProps) {
  const glass = useLiquidGlass<HTMLButtonElement>();
  const isCapsule = !!secondaryIcon;
  const accentClass = priority === 'primary' ? ' ios-glass-btn--accent' : '';
  const pressedClass = glass.isPressed ? ' ios-glass-btn--pressed' : '';
  const shapeClass = isCapsule ? ' ios-glass-btn--capsule' : ' ios-glass-btn--circle';

  return (
    <button
      ref={glass.ref}
      className={`ios-glass-btn${shapeClass}${accentClass}${pressedClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onPointerDown={glass.onPointerDown}
      onPointerMove={glass.onPointerMove}
      onPointerUp={glass.onPointerUp}
      onPointerCancel={glass.onPointerUp}
    >
      <div className="ios-glass-btn__surface">
        <div className="ios-glass-btn__surface-burn" />
        <div className="ios-glass-btn__surface-darken" />
      </div>
      <div className="ios-glass-btn__flash" />
      <span className="ios-glass-btn__icon">{icon}</span>
      {secondaryIcon && <span className="ios-glass-btn__icon">{secondaryIcon}</span>}
    </button>
  );
}
