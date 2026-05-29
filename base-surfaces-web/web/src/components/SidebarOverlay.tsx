import type { ReactNode } from 'react';
import './SidebarOverlay.css';

export function SidebarOverlay({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`sidebar-overlay${isOpen ? ' sidebar-overlay--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <div className="sidebar-overlay__panel">
        {children}
      </div>
      <div className="sidebar-overlay__scrim" onClick={onClose} aria-hidden="true" />
      <div className="sidebar-overlay__close-wrapper">
        <button className="sidebar-overlay__close" onClick={onClose} aria-label="Close menu">
          <svg aria-hidden="true" focusable="false" role="none" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="m12 13.414-7.293 7.293-1.414-1.414L10.586 12 3.293 4.707l1.414-1.414L12 10.586l7.293-7.293 1.414 1.414L13.414 12l7.293 7.293-1.414 1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
