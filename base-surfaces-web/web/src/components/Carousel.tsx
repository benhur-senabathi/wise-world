import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { IconButton } from '@transferwise/components';
import { ChevronLeft, ChevronRight } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import './Carousel.css';

export function Carousel({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkOverflow = useCallback(() => {
    if (scrollRef.current) {
      setHasOverflow(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  }, []);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    // Show back arrow when scrolled past 50% of first card width
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const cardWidth = firstChild.offsetWidth;
      setShowPrev(el.scrollLeft > cardWidth * 0.5);
    }

    // Touch: show nav arrows while scrolling
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', checkScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [checkScroll]);

  const scrollNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  return (
    <div className={`carousel${isScrolling ? ' carousel--scrolling' : ''}`}>
      <div className="carousel__track" ref={scrollRef}>
        {children}
      </div>
      {showPrev && (
        <div className="carousel__nav carousel__nav--prev">
          <IconButton
            size={48}
            priority="primary"
            aria-label={t('carousel.previous')}
            onClick={scrollPrev}
          >
            <ChevronLeft size={24} />
          </IconButton>
        </div>
      )}
      {hasOverflow && (
        <div className="carousel__nav carousel__nav--next">
          <IconButton
            size={48}
            priority="primary"
            aria-label={t('carousel.next')}
            onClick={scrollNext}
          >
            <ChevronRight size={24} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
