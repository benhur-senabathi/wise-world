import type { ReactNode } from 'react';
import './ButtonCue.css';

export function ButtonCue({ visible, hint, children }: { visible: boolean; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className={`button-cue${visible ? ' button-cue--visible' : ''}`}>
      <div className="button-cue__surface" />
      <div className="button-cue__content">
        {hint && <div className="button-cue__hint">{hint}</div>}
        {children}
      </div>
    </div>
  );
}
