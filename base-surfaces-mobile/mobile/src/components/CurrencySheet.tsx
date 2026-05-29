import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ListItem, SearchInput } from '@transferwise/components';
import { Cross, Check } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { currencyMeta } from '@shared/data/currency-rates';
import { useLiquidGlass } from '../hooks/useLiquidGlass';
import { useLanguage } from '../context/Language';
import './LiquidGlassButton.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  selectedCode: string;
  recentCodes: string[];
  title?: string;
  excludeCode?: string;
};

const allCurrencies = Object.values(currencyMeta).sort((a, b) => a.code.localeCompare(b.code));

export function CurrencySheet({ open, onClose, onSelect, selectedCode, recentCodes, title, excludeCode }: Props) {
  const { t } = useLanguage();
  const [animating, setAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragY, setDragY] = useState(0);
  const dragState = useRef({ startY: 0, down: false, active: false });
  const glass = useLiquidGlass<HTMLButtonElement>();
  const [titleVisible, setTitleVisible] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open || !headingRef.current || !bodyRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleVisible(entry.isIntersecting),
      { root: bodyRef.current, threshold: 0 }
    );
    observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, [open]);

  const close = useCallback(() => {
    setAnimating(false);
    setTimeout(() => {
      onClose();
      setDragY(0);
    }, 500);
  }, [onClose]);

  const handleSelect = useCallback((code: string) => {
    onSelect(code);
    close();
  }, [onSelect, close]);

  // Drag-to-dismiss — from header bar, with pointer capture to track outside moves
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragState.current = { startY: e.clientY, down: true, active: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.down) return;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.active && dy > 10) dragState.current.active = true;
    if (dragState.current.active && dy > 0) setDragY(dy);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragState.current.active) {
      if (dragY > 120) close();
      else setDragY(0);
    }
    dragState.current = { startY: 0, down: false, active: false };
  }, [dragY, close]);

  // Filter currencies
  const q = searchQuery.toLowerCase().trim();
  const isSearching = q.length > 0;
  const recentSet = new Set(recentCodes);

  // When searching: combine all results into one flat list
  const searchResults = isSearching
    ? allCurrencies.filter((c) =>
        c.code !== excludeCode &&
        (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      )
    : [];

  // When not searching: split into recent and all (excluding recents)
  const filteredRecent = isSearching ? [] : recentCodes.filter((code) => code !== excludeCode);
  const filteredAll = isSearching ? [] : allCurrencies.filter((c) =>
    !recentSet.has(c.code) && c.code !== excludeCode
  );

  if (!open) return null;

  const sheetTitle = title ?? t('send.chooseCurrency');

  // Portal target — render at document body to escape stacking contexts (flow overlays, transforms)
  const portalTarget = document.body;

  const renderItem = (code: string) => {
    const meta = currencyMeta[code];
    if (!meta) return null;
    return (
      <ListItem
        key={code}
        title={meta.code}
        subtitle={meta.name}
        media={<ListItem.AvatarView size={48}><Flag code={code} loading="eager" /></ListItem.AvatarView>}
        control={
          <>
            {selectedCode === code && <Check size={20} />}
            <ListItem.Navigation onClick={() => handleSelect(code)} />
          </>
        }
      />
    );
  };

  return createPortal(
    <>
      <div
        className={`fs-sheet__backdrop${animating ? ' fs-sheet__backdrop--visible' : ''}`}
        onClick={close}
      />
      <div
        className={`fs-sheet${animating ? ' fs-sheet--open' : ''}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <header className="fs-sheet__header">
          <div
            className="fs-sheet__header-bar"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <button
              ref={glass.ref}
              className="ios-glass-btn ios-glass-btn--circle"
              onClick={close}
              onPointerDown={(e) => { e.stopPropagation(); glass.onPointerDown(e); }}
              onPointerMove={glass.onPointerMove}
              onPointerUp={glass.onPointerUp}
              onPointerCancel={glass.onPointerUp}
              aria-label="Close"
            >
              <span className="ios-glass-btn__icon">
                <Cross size={24} />
              </span>
            </button>
            <span className={`fs-sheet__inline-title${titleVisible ? '' : ' fs-sheet__inline-title--visible'}`}>
              {sheetTitle}
            </span>
            <div style={{ width: 32 }} />
          </div>
        </header>

        <div ref={bodyRef} className="fs-sheet__body">
          <h1 ref={headingRef} className="np-text-title-screen" style={{ margin: '12px 0 16px' }}>{sheetTitle}</h1>

          <div style={{ marginBottom: 24 }}>
            <SearchInput
              size="md"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Search results — single combined section */}
          {isSearching && (
            <div className="np-section">
              <h5 className="np-text-title-group np-header np-header--group p-y-2" style={{ margin: 0, paddingTop: 4, paddingBottom: 0 }}>
                {t('common.searchResults')}
              </h5>
              <ul className="wds-list list-unstyled m-y-0" style={{ paddingTop: 8 }}>
                {searchResults.map((c) => renderItem(c.code))}
              </ul>
            </div>
          )}

          {/* Default view — recent + all sections */}
          {!isSearching && (
            <>
              {filteredRecent.length > 0 && (
                <div className="np-section">
                  <h5 className="np-text-title-group np-header np-header--group p-y-2" style={{ margin: 0, paddingTop: 4, paddingBottom: 0 }}>
                    {t('send.recentCurrencies')}
                  </h5>
                  <ul className="wds-list list-unstyled m-y-0" style={{ paddingTop: 8 }}>
                    {filteredRecent.map((code) => renderItem(code))}
                  </ul>
                </div>
              )}

              <div className="np-section" style={filteredRecent.length > 0 ? { marginTop: 16 } : undefined}>
                <h5 className="np-text-title-group np-header np-header--group p-y-2" style={{ margin: 0, paddingTop: 4, paddingBottom: 0 }}>
                  {t('send.allCurrencies')}
                </h5>
                <ul className="wds-list list-unstyled m-y-0" style={{ paddingTop: 8 }}>
                  {filteredAll.map((c) => renderItem(c.code))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    portalTarget,
  );
}
