import { useState, useEffect, useRef, useCallback } from 'react';
import { SelectInput, SelectInputOptionContent, SegmentedControl, Field, Input, ListItem } from '@transferwise/components';
import { Cross, Sun, Moon } from '@transferwise/icons';
import { BottomSheet } from './BottomSheet';



import { useTheme } from '@wise/components-theming';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, type Language } from '../context/Language';
import { currencyMeta } from '@shared/data/currency-rates';
import { Flag } from '@wise/art';
import { useLiquidGlass } from '../hooks/useLiquidGlass';

export function PrototypeSettings() {
  const { isScreenModeDark, setScreenMode } = useTheme();
  const { consumerName, setConsumerName, businessName, setBusinessName, consumerHomeCurrency, setConsumerHomeCurrency, businessHomeCurrency, setBusinessHomeCurrency } = usePrototypeNames();
  const { language, setLanguage, t } = useLanguage();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAnimating, setSheetAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Drag-to-dismiss state
  const [dragY, setDragY] = useState(0);
  const dragState = useRef({ startY: 0, down: false, active: false });

  const openSheet = useCallback(() => {
    setSheetOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSheetAnimating(true));
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheetAnimating(false);
    setTimeout(() => {
      setSheetOpen(false);
      setDragY(0);
    }, 500);
  }, []);

  // Drag-to-dismiss — from header bar, with pointer capture to track outside moves
  const handleSheetPointerDown = useCallback((e: React.PointerEvent) => {
    dragState.current = { startY: e.clientY, down: true, active: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleSheetPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.down) return;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.active && dy > 10) {
      dragState.current.active = true;
    }
    if (dragState.current.active && dy > 0) {
      setDragY(dy);
    }
  }, []);

  const handleSheetPointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragState.current.active) {
      if (dragY > 120) {
        closeSheet();
      } else {
        setDragY(0);
      }
    }
    dragState.current = { startY: 0, down: false, active: false };
  }, [dragY, closeSheet]);

  // Listen for open/close-settings messages from DeviceFrame
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'open-settings') openSheet();
      if (e.data?.type === 'close-settings') closeSheet();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [openSheet, closeSheet]);

  const currentValue = isScreenModeDark ? 'dark' : 'light';
  const [accountType, setAccountType] = useState('consumer');
  const [showAppearanceSheet, setShowAppearanceSheet] = useState(false);
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);

  const glass = useLiquidGlass<HTMLButtonElement>();
  const [titleVisible, setTitleVisible] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sheetOpen || !headingRef.current || !bodyRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleVisible(entry.isIntersecting),
      { root: bodyRef.current, threshold: 0 }
    );
    observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, [sheetOpen]);

  if (!sheetOpen) return null;

  return (
    <>
      <div
        className={`fs-sheet__backdrop${sheetAnimating ? ' fs-sheet__backdrop--visible' : ''}`}
        onClick={closeSheet}
      />
      <div
        ref={sheetRef}
        className={`fs-sheet${sheetAnimating ? ' fs-sheet--open' : ''}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <header className="fs-sheet__header">
          <div
            className="fs-sheet__header-bar"
            onPointerDown={handleSheetPointerDown}
            onPointerMove={handleSheetPointerMove}
            onPointerUp={handleSheetPointerUp}
            onPointerCancel={handleSheetPointerUp}
          >
            <button
              ref={glass.ref}
              className="ios-glass-btn ios-glass-btn--circle"
              onClick={closeSheet}
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
              {t('settings.title')}
            </span>
            <div style={{ width: 32 }} />
          </div>
        </header>

        <div ref={bodyRef} className="fs-sheet__body">
            <h1 ref={headingRef} className="np-text-title-screen" style={{ margin: '12px 0 24px' }}>{t('settings.title')}</h1>

            {/* Visual */}
            <div className="fs-sheet__section">
              <h3 className="np-text-title-body" style={{ margin: '0 0 16px' }}>{t('settings.visual')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>
                    {t('settings.appearance')}
                  </label>
                  {/* Intercept clicks to open BottomSheet instead of native dropdown */}
                  <div className="wise-sheet-select-wrap" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAppearanceSheet(true); }}>
                    <SelectInput
                      size="md"
                      placeholder="Choose theme..."
                      value={currentValue}
                      onChange={() => {}}
                      items={[
                        { type: 'option', value: 'light' },
                        { type: 'option', value: 'dark' },
                      ]}
                      renderValue={(val) => (
                        <SelectInputOptionContent title={val === 'light' ? t('settings.light') : t('settings.dark')} />
                      )}
                    />
                  </div>
                  <BottomSheet
                    open={showAppearanceSheet}
                    onClose={() => setShowAppearanceSheet(false)}
                    title={t('settings.appearance')}
                  >
                    <div style={{ padding: '0 16px' }}>
                      {(['light', 'dark'] as const).map((val) => (
                        <ListItem
                          key={val}
                          title={val === 'light' ? t('settings.light') : t('settings.dark')}
                          media={
                            <ListItem.AvatarView size={40}>
                              {val === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                            </ListItem.AvatarView>
                          }
                          control={
                            <ListItem.Radio
                              name="appearance"
                              value={val}
                              checked={currentValue === val}
                              onChange={() => { setScreenMode(val); setShowAppearanceSheet(false); }}
                            />
                          }
                        />
                      ))}
                    </div>
                  </BottomSheet>
                </div>
                <div>
                  <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>
                    {t('settings.language')}
                  </label>
                  <div className="wise-sheet-select-wrap" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLanguageSheet(true); }}>
                    <SelectInput
                      size="md"
                      placeholder="Choose language..."
                      value={language}
                      onChange={() => {}}
                      items={[
                        { type: 'option', value: 'en' },
                        { type: 'option', value: 'es' },
                        { type: 'option', value: 'de' },
                        { type: 'option', value: 'fr' },
                      ]}
                      renderValue={(val) => (
                        <SelectInputOptionContent title={
                          { en: 'English', es: 'Español', de: 'Deutsch', fr: 'Français' }[val] ?? val
                        } />
                      )}
                    />
                  </div>
                  <BottomSheet
                    open={showLanguageSheet}
                    onClose={() => setShowLanguageSheet(false)}
                    title={t('settings.language')}
                  >
                    <div style={{ padding: '0 16px' }}>
                      {([
                        { code: 'en' as Language, label: 'English', flag: 'gb' },
                        { code: 'es' as Language, label: 'Español', flag: 'es' },
                        { code: 'de' as Language, label: 'Deutsch', flag: 'de' },
                        { code: 'fr' as Language, label: 'Français', flag: 'fr' },
                      ]).map((lang) => (
                        <ListItem
                          key={lang.code}
                          title={lang.label}
                          media={
                            <ListItem.AvatarView size={40}>
                              <Flag code={lang.flag} intrinsicSize={24} />
                            </ListItem.AvatarView>
                          }
                          control={
                            <ListItem.Radio
                              name="language"
                              value={lang.code}
                              checked={language === lang.code}
                              onChange={() => { setLanguage(lang.code); setShowLanguageSheet(false); }}
                            />
                          }
                        />
                      ))}
                    </div>
                  </BottomSheet>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-neutral)', margin: '24px 0' }} />

            {/* Accounts */}
            <div className="fs-sheet__section">
              <h3 className="np-text-title-body" style={{ margin: '0 0 16px' }}>{t('settings.accounts')}</h3>
              <SegmentedControl
                name="account-type"
                value={accountType}
                mode="input"
                segments={[
                  { id: 'consumer', label: t('settings.consumer'), value: 'consumer' },
                  { id: 'business', label: t('settings.business'), value: 'business' },
                ]}
                onChange={setAccountType}
              />
              <div style={{ marginTop: 16 }}>
                {accountType === 'consumer' ? (
                  <Field label={t('settings.name')}>
                    <Input
                      value={consumerName}
                      onChange={(e) => setConsumerName(e.target.value)}
                    />
                  </Field>
                ) : (
                  <Field label={t('settings.name')}>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </Field>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>
                  {t('settings.homeCurrency')}
                </label>
                <div className="wise-sheet-select-wrap" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCurrencySheet(true); }}>
                  <SelectInput
                    size="md"
                    placeholder="Choose currency..."
                    value={accountType === 'consumer' ? consumerHomeCurrency : businessHomeCurrency}
                    onChange={() => {}}
                    items={Object.keys(currencyMeta).map((code) => ({
                      type: 'option' as const,
                      value: code,
                    }))}
                    renderValue={(val) => {
                      const meta = currencyMeta[val];
                      if (!meta) return <SelectInputOptionContent title={val} />;
                      return (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Flag code={meta.code} intrinsicSize={20} />
                          <span>{meta.name} · {meta.code}</span>
                        </span>
                      );
                    }}
                  />
                </div>
                <BottomSheet
                  open={showCurrencySheet}
                  onClose={() => setShowCurrencySheet(false)}
                  title={t('settings.homeCurrency')}
                >
                  <div style={{ padding: '0 16px' }}>
                    {Object.entries(currencyMeta).map(([code, meta]) => (
                      <ListItem
                        key={code}
                        title={meta.name}
                        subtitle={meta.code}
                        media={
                          <ListItem.AvatarView size={40}>
                            <Flag code={meta.code} intrinsicSize={24} />
                          </ListItem.AvatarView>
                        }
                        control={
                          <ListItem.Radio
                            name="home-currency"
                            value={code}
                            checked={(accountType === 'consumer' ? consumerHomeCurrency : businessHomeCurrency) === code}
                            onChange={() => {
                              if (accountType === 'consumer') setConsumerHomeCurrency(code);
                              else setBusinessHomeCurrency(code);
                              setShowCurrencySheet(false);
                            }}
                          />
                        }
                      />
                    ))}
                  </div>
                </BottomSheet>
              </div>
            </div>

          </div>
        </div>
    </>
  );
}
