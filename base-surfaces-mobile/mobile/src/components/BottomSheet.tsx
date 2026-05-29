import { useEffect, useRef, useCallback, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@transferwise/components';
import { Cross } from '@transferwise/icons';
import { triggerHaptic } from '../hooks/useHaptics';
import './BottomSheet.css';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export function BottomSheet({ open, onClose, title, subtitle, className, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dragRef = useRef({ startY: 0, currentY: 0, dragging: false });

  // Open: mount then animate in; lock body scroll while visible
  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
          triggerHaptic();
        });
      });
    } else if (visible) {
      setAnimating(false);
      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = '';
      }, 500);
      return () => { clearTimeout(timer); document.body.style.overflow = ''; };
    }
  }, [open]);

  // Pan gesture — only on the sheet header/background, not on interactive children
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't capture if target is inside close button or content
    if (closeRef.current?.contains(e.target as Node)) return;
    if (contentRef.current?.contains(e.target as Node)) return;

    const el = sheetRef.current;
    if (!el) return;
    dragRef.current = { startY: e.clientY, currentY: 0, dragging: true };
    el.setPointerCapture(e.pointerId);
    el.style.transition = 'none';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    const dy = Math.max(0, e.clientY - d.startY);
    d.currentY = dy;
    const el = sheetRef.current;
    if (el) {
      el.style.transform = `translateY(${dy}px)`;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    const el = sheetRef.current;
    if (!el) return;

    if (d.currentY > 100) {
      el.style.transition = 'transform 0.5s';
      el.style.transform = '';
      onClose();
    } else {
      el.style.transition = 'transform 0.5s';
      el.style.transform = '';
    }
    d.currentY = 0;
  }, [onClose]);

  if (!visible) return null;

  return createPortal(
    <div
      className={`wise-bottom-sheet__backdrop${animating ? ' wise-bottom-sheet__backdrop--visible' : ''}`}
      onMouseDown={onClose}
    >
      <div
        ref={sheetRef}
        className={`wise-bottom-sheet${animating ? ' wise-bottom-sheet--open' : ''}${className ? ` ${className}` : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {(title || subtitle) && (
          <div className="wise-bottom-sheet__header">
            {title && <h3 className="np-text-title-subsection">{title}</h3>}
            {subtitle && <p className="np-text-body-large" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>{subtitle}</p>}
          </div>
        )}
        <div className="wise-bottom-sheet__close" ref={closeRef}>
          <IconButton size={32} priority="tertiary" aria-label="Close" onClick={onClose}>
            <Cross size={16} />
          </IconButton>
        </div>
        <div className="wise-bottom-sheet__content" ref={contentRef}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
