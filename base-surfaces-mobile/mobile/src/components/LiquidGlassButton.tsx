import type { ReactNode } from 'react';
import { useLiquidGlass } from '../hooks/useLiquidGlass';

interface LiquidGlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  priority?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export function LiquidGlassButton({ children, onClick, priority = 'secondary', className, disabled = false }: LiquidGlassButtonProps) {
  const glass = useLiquidGlass<HTMLButtonElement>();
  const accentClass = priority === 'primary' ? ' ios-glass-btn--accent' : '';
  const pressedClass = glass.isPressed ? ' ios-glass-btn--pressed' : '';

  return (
    <button
      ref={glass.ref}
      className={`ios-glass-btn ios-glass-btn--pill${accentClass}${pressedClass}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
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
      {children}
    </button>
  );
}
