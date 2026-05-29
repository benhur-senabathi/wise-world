import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import './PageTransition.css';

function resetScroll(top = 0) {
  window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
  document.getElementById('main')?.scrollTo(0, top);
  document.querySelector('.df-screen-content')?.scrollTo(0, top);
}

type PageTransitionProps = {
  children: ReactNode;
  direction: 'push' | 'pop' | null;
  onComplete: () => void;
};

export function PageTransition({ children, direction, onComplete }: PageTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'ready' | 'animating'>('idle');
  const prevChildrenRef = useRef<ReactNode>(null);
  const prevScrollRef = useRef(0);
  const newLayerRef = useRef<HTMLDivElement>(null);
  const oldLayerRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef(children);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track current children for snapshot — only when no transition is pending
  if (phase === 'idle' && !direction) {
    childrenRef.current = children;
  }

  // Detect navigation: direction goes from null → push/pop
  useEffect(() => {
    if (!direction || phase !== 'idle') return;

    // Snapshot the old content and scroll
    prevChildrenRef.current = childrenRef.current;
    prevScrollRef.current = document.querySelector('.df-screen-content')?.scrollTop ?? window.scrollY;

    setPhase('ready');
  }, [direction, phase, onComplete]);

  // When 'ready', both layers are in DOM → trigger animation next frame
  useEffect(() => {
    if (phase !== 'ready') return;

    // Scroll to top for push, keep for pop
    if (direction === 'push') {
      resetScroll();
    }

    // Double-rAF to ensure layout is painted before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('animating');
      });
    });
  }, [phase, direction]);

  // Listen for transition end
  useEffect(() => {
    if (phase !== 'animating') return;

    const newLayer = newLayerRef.current;
    if (!newLayer) return;

    const handleEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform') return;
      cleanup();
    };

    newLayer.addEventListener('transitionend', handleEnd);

    // Safety timeout
    timeoutRef.current = setTimeout(cleanup, 500);

    return () => {
      newLayer.removeEventListener('transitionend', handleEnd);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Restore scroll for pop
    if (direction === 'pop') {
      resetScroll(prevScrollRef.current);
    }

    prevChildrenRef.current = null;
    setPhase('idle');
    onComplete();
  }, [direction, onComplete]);

  // During transition, render both layers
  if (phase !== 'idle' && direction && prevChildrenRef.current) {
    const isPush = direction === 'push';
    const animate = phase === 'animating';

    // Old layer = page we're leaving (always the snapshot)
    // New layer = page we're going to (always current children)
    // For push: old page was scrolled — offset content up to freeze at scroll position
    // For pop: new page (going back) needs content offset to show at saved scroll
    const scrollOffset = prevScrollRef.current;
    const oldInnerStyle: React.CSSProperties = isPush && scrollOffset
      ? { marginTop: -scrollOffset }
      : {};
    const newInnerStyle: React.CSSProperties = !isPush && scrollOffset
      ? { marginTop: -scrollOffset }
      : {};

    return (
      <>
        <div
          ref={oldLayerRef}
          className={`page-layer page-layer--old--${direction}${animate ? ' page-layer--animate' : ''}`}
        >
          <div style={oldInnerStyle}>{prevChildrenRef.current}</div>
        </div>
        <div
          ref={newLayerRef}
          className={`page-layer page-layer--new--${direction}${animate ? ' page-layer--animate' : ''}`}
        >
          <div style={newInnerStyle}>{children}</div>
        </div>
      </>
    );
  }

  // Direction just set but effect hasn't fired yet — show old content to avoid flash
  if (direction && childrenRef.current) {
    return <>{childrenRef.current}</>;
  }

  return <>{children}</>;
}
