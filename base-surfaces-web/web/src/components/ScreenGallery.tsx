import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, SegmentedControl } from '@transferwise/components';
import { ChevronDown, Check, Slider, Laptop, General } from '@transferwise/icons';
import { useDataset, type DatasetType } from '../context/Dataset';

type ViewMode = 'focused' | 'all';
type AccountType = 'personal' | 'business';
type Viewport = 'desktop' | 'tablet' | 'mobile';

type ScreenDef = {
  label: string;
  path: string;
  section?: string;
  steps?: { label: string; path: string }[];
};

type GalleryEntry = { type: 'divider'; label: string } | { type: 'screen'; screen: ScreenDef };

const VIEWPORT_CONFIG: Record<Viewport, { w: number; h: number; scale: number; radius: number }> = {
  desktop: { w: 1440, h: 900, scale: 0.6, radius: 24 },
  tablet: { w: 820, h: 1180, scale: 0.4, radius: 24 },
  mobile: { w: 410, h: 844, scale: 0.55, radius: 24 },
};

const VIEWPORT_LABELS: Record<Viewport, string> = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
const VIEWPORT_KEYS: Viewport[] = ['desktop', 'tablet', 'mobile'];

const FLOW_LABELS: Record<string, string> = { send: 'Send', request: 'Request', convert: 'Convert', 'add-money': 'Add', 'payment-link': 'Payment Link' };

// Screen types:
//   Pages:     { label, path, section: 'Pages' }      — standalone pages
//   Sub-pages: { label, path, section: 'Sub-pages' }   — drill-down pages
//   Flows:     { label, path, section: 'Flows', steps: [{ label, path }] } — overlay flows with expandable steps
function getScreens(accountType: AccountType): ScreenDef[] {
  const isPersonal = accountType === 'personal';
  const currencyBalanceId = isPersonal ? '50417283' : '17480352';

  return [
    { label: 'Home', path: '/home', section: 'Pages' },
    { label: 'Cards', path: '/cards', section: 'Pages' },
    { label: 'Recipients', path: '/recipients', section: 'Pages' },
    { label: 'Payments', path: '/payments', section: 'Pages' },
    { label: 'Transactions', path: '/all-transactions', section: 'Pages' },
    ...(!isPersonal ? [
      { label: 'Team', path: '/team', section: 'Pages' },
    ] : []),
    { label: 'Insights', path: '/account-summary', section: 'Pages' },
    { label: 'Account', path: '/your-account', section: 'Pages' },
    { label: 'Current Account', path: '/groups/48291035', section: 'Sub-pages' },
    { label: 'Currency', path: `/balances/${currencyBalanceId}`, section: 'Sub-pages' },
    ...(isPersonal ? [
      { label: 'Jar', path: '/groups/61724089', section: 'Sub-pages' },
    ] : [
      { label: 'Jar', path: '/groups/39058162', section: 'Sub-pages' },
      { label: 'Group', path: '/groups/73850214', section: 'Sub-pages' },
    ]),
    { label: 'Detail Selector', path: '/account-details/48291035', section: 'Sub-pages' },
    { label: 'Account Details', path: `/account-details/${currencyBalanceId}`, section: 'Sub-pages' },
    { label: 'Travel Hub', path: '/cards/travel-hub', section: 'Sub-pages' },
    {
      label: 'Open Plus', path: '/home', section: 'Flows',
      steps: [{ label: 'Open', path: '/home?gallery=1&flow=open-plus' }],
    },
    {
      label: 'Send', path: '/home', section: 'Flows',
      steps: [
        { label: 'Recipient', path: '/home?gallery=1&flow=send&step=recipient' },
        { label: 'Amount', path: '/home?gallery=1&flow=send&step=amount' },
      ],
    },
    ...(isPersonal ? [{
      label: 'Request', path: '/home', section: 'Flows',
      steps: [
        { label: 'Recipient', path: '/home?gallery=1&flow=request&step=recipient' },
        { label: 'Amount', path: '/home?gallery=1&flow=request&step=request' },
      ],
    }] : [{
      label: 'Payment Link', path: '/home', section: 'Flows',
      steps: [{ label: 'Amount', path: '/home?gallery=1&flow=payment-link' }],
    }]),
    {
      label: 'Convert', path: '/home', section: 'Flows',
      steps: [{ label: 'Amount', path: '/home?gallery=1&flow=convert' }],
    },
    {
      label: 'Add', path: '/home', section: 'Flows',
      steps: [{ label: 'Amount', path: '/home?gallery=1&flow=add-money' }],
    },
  ];
}

function buildGalleryUrl(path: string, accountType: AccountType): string {
  const acctParam = accountType === 'business' ? '&account=business' : '';
  if (path.includes('?')) return path + acctParam;
  return `${path}?gallery=1${acctParam}`;
}

const COMPACT_BREAKPOINT = 1100;

function useCompact() {
  const [compact, setCompact] = useState(() => window.innerWidth <= COMPACT_BREAKPOINT);
  useEffect(() => {
    const check = () => setCompact(window.innerWidth <= COMPACT_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return compact;
}

const PRESET_DATASETS: { id: DatasetType; label: string }[] = [
  { id: 'power', label: 'Power' },
  { id: 'common', label: 'Common' },
];
const REAL_DATASETS: { id: DatasetType; label: string }[] = [
  { id: 'connor', label: 'Connor Berry' },
];

export function ScreenGallery({ accountType, activeFlowType, activeFlowStep }: { accountType: AccountType; activeFlowType?: string; activeFlowStep?: string }) {
  const { dataset, setDataset } = useDataset();
  const [viewMode, setViewMode] = useState<ViewMode>('focused');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [viewportPickerOpen, setViewportPickerOpen] = useState(false);
  const [datasetPickerOpen, setDatasetPickerOpen] = useState(false);
  const viewportPickerRef = useRef<HTMLDivElement>(null);
  const datasetPickerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [controlVisible, setControlVisible] = useState(false);
  const [expandedFlows, setExpandedFlows] = useState<Set<string>>(new Set());
  const galleryLoadedRef = useRef(false);
  const compact = useCompact();

  const overlayRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef<Set<string>>(new Set());
  const [loadedScreens, setLoadedScreens] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const showAllScreens = viewMode === 'all';
  if (showAllScreens) galleryLoadedRef.current = true;
  const galleryLoaded = galleryLoadedRef.current;

  const handleSetViewMode = useCallback((v: ViewMode) => {
    setViewMode(v);
    if (v === 'focused') {
      setExpandedFlows(new Set());
      setViewportPickerOpen(false);
    }
  }, []);

  const toggleFlowExpanded = useCallback((label: string) => {
    setExpandedFlows(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  // Ctrl+H / Cmd+H to toggle gallery visibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setVisible(prev => {
          if (prev && controlVisible) {
            setControlVisible(false);
            setViewMode('focused');
            setExpandedFlows(new Set());
            return false;
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setControlVisible(true), 50);
          return true;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [controlVisible]);

  const lastScrollY = useRef(window.scrollY);
  useEffect(() => {
    if (!visible || showAllScreens) return;
    lastScrollY.current = window.scrollY;
    const handler = () => {
      const delta = window.scrollY - lastScrollY.current;
      lastScrollY.current = window.scrollY;
      if (controlVisible && delta > 3) {
        setControlVisible(false);
      } else if (!controlVisible && window.scrollY === 0) {
        setControlVisible(true);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [visible, showAllScreens, controlVisible]);

  // Staggered lazy-loading for gallery iframes
  const staggerQueueRef = useRef<string[]>([]);
  const staggerTimerRef = useRef(0);
  useEffect(() => {
    if (!showAllScreens) return;
    const flushQueue = () => {
      if (staggerQueueRef.current.length === 0) { staggerTimerRef.current = 0; return; }
      const next = staggerQueueRef.current.shift()!;
      loadedRef.current.add(next);
      setLoadedScreens(new Set(loadedRef.current));
      if (staggerQueueRef.current.length > 0) {
        staggerTimerRef.current = window.setTimeout(flushQueue, 120);
      } else {
        staggerTimerRef.current = 0;
      }
    };
    observerRef.current = new IntersectionObserver(
      (entries) => {
        let added = false;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = (entry.target as HTMLElement).dataset.galleryKey;
            if (key && !loadedRef.current.has(key) && !staggerQueueRef.current.includes(key)) {
              staggerQueueRef.current.push(key);
              added = true;
            }
          }
        }
        if (added && staggerTimerRef.current === 0) {
          staggerTimerRef.current = window.setTimeout(flushQueue, 80);
        }
      },
      { root: overlayRef.current, rootMargin: '0px 2000px 0px 2000px' }
    );
    itemRefs.current.forEach((el) => observerRef.current!.observe(el));
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      clearTimeout(staggerTimerRef.current);
      staggerTimerRef.current = 0;
      staggerQueueRef.current = [];
    };
  }, [showAllScreens, accountType]);

  const setItemRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(key, el);
      observerRef.current?.observe(el);
    } else {
      const prev = itemRefs.current.get(key);
      if (prev) observerRef.current?.unobserve(prev);
      itemRefs.current.delete(key);
    }
  }, []);

  const wasAllRef = useRef(false);
  useEffect(() => {
    if (controlVisible && !showAllScreens) {
      if (wasAllRef.current) {
        document.body.classList.add('sg-no-transition');
        document.body.classList.add('sg-controls-open');
        requestAnimationFrame(() => {
          document.body.classList.remove('sg-no-transition');
        });
      } else {
        document.body.classList.add('sg-controls-open');
      }
    } else {
      document.body.classList.remove('sg-controls-open');
    }
    wasAllRef.current = showAllScreens;
    return () => document.body.classList.remove('sg-controls-open');
  }, [controlVisible, showAllScreens]);

  useEffect(() => {
    if (!viewportPickerOpen && !datasetPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (viewportPickerOpen && viewportPickerRef.current && !viewportPickerRef.current.contains(e.target as Node)) {
        setViewportPickerOpen(false);
      }
      if (datasetPickerOpen && datasetPickerRef.current && !datasetPickerRef.current.contains(e.target as Node)) {
        setDatasetPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [viewportPickerOpen, datasetPickerOpen]);

  if (!visible) return null;

  const currentPath = window.location.pathname;
  const allScreens = getScreens(accountType);

  const activeFlowLabel = activeFlowType ? FLOW_LABELS[activeFlowType] : undefined;
  const activeFlowScreen = activeFlowLabel ? allScreens.find(s => s.label === activeFlowLabel) : undefined;
  const activeFlowStepDef = activeFlowScreen?.steps?.find(s => activeFlowStep && s.path.includes(`step=${activeFlowStep}`));
  const activeScreenUrl = (activeFlowStepDef ?? activeFlowScreen?.steps?.[0])?.path ?? buildGalleryUrl(currentPath, accountType);

  const galleryItems: GalleryEntry[] = [];
  let lastSection = '';
  for (const screen of allScreens) {
    if (screen.section && screen.section !== lastSection) {
      galleryItems.push({ type: 'divider', label: screen.section });
      lastSection = screen.section;
    }
    galleryItems.push({ type: 'screen', screen });
  }

  const vp = VIEWPORT_CONFIG[viewport];
  const scaledW = vp.w * vp.scale;
  const scaledH = vp.h * vp.scale;

  return (
    <>
      {/* Top bar */}
      <div className={`sg-top-bar${showAllScreens ? ' sg-top-bar--all' : ''}${!showAllScreens && !controlVisible ? ' sg-top-bar--hidden' : ''}`}>
        <div className="sg-top-bar__viewport" style={{ display: 'flex', gap: 8 }}>
          <div ref={viewportPickerRef} style={{ position: 'relative' }}>
            <Button
              v2
              size="sm"
              priority="primary"
              addonEnd={{ type: 'icon', value: (
                <span className={`sg-viewport__chevron${viewportPickerOpen ? ' sg-viewport__chevron--open' : ''}`}>
                  <ChevronDown size={16} />
                </span>
              )}}
              disabled={!showAllScreens}
              onClick={() => setViewportPickerOpen(!viewportPickerOpen)}
            >
              {VIEWPORT_LABELS[viewport]}
            </Button>
            {viewportPickerOpen && (
              <div className="sg-viewport__panel">
                <div className="np-panel__content">
                  <ul className="sg-viewport__dropdown">
                    {VIEWPORT_KEYS.map((key) => (
                      <li key={key}>
                        <button
                          className="sg-viewport__dropdown-item"
                          onClick={() => { setViewport(key); setViewportPickerOpen(false); }}
                        >
                          <span>{VIEWPORT_LABELS[key]}</span>
                          {key === viewport && <Check size={16} />}
                        </button>
                      </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          </div>
          <div ref={datasetPickerRef} style={{ position: 'relative' }}>
            <Button
              v2
              size="sm"
              priority="secondary"
              addonEnd={{ type: 'icon', value: (
                <span className={`sg-viewport__chevron${datasetPickerOpen ? ' sg-viewport__chevron--open' : ''}`}>
                  <ChevronDown size={16} />
                </span>
              )}}
              onClick={() => setDatasetPickerOpen(!datasetPickerOpen)}
            >
              {[...PRESET_DATASETS, ...REAL_DATASETS].find(d => d.id === dataset)?.label ?? dataset}
            </Button>
            {datasetPickerOpen && (
              <div className="sg-viewport__panel">
                <div className="np-panel__content">
                  <ul className="sg-viewport__dropdown">
                    <li className="sg-viewport__dropdown-heading">Presets</li>
                    {PRESET_DATASETS.map((d) => (
                      <li key={d.id}>
                        <button
                          className="sg-viewport__dropdown-item"
                          onClick={() => { setDataset(d.id); setDatasetPickerOpen(false); }}
                        >
                          <span>{d.label}</span>
                          {d.id === dataset && <Check size={16} />}
                        </button>
                      </li>
                    ))}
                    <li className="sg-viewport__dropdown-heading">Real users</li>
                    {REAL_DATASETS.map((d) => (
                      <li key={d.id}>
                        <button
                          className="sg-viewport__dropdown-item"
                          onClick={() => { setDataset(d.id); setDatasetPickerOpen(false); }}
                        >
                          <span>{d.label}</span>
                          {d.id === dataset && <Check size={16} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="sg-top-bar__control">
          <SegmentedControl
            name="gallery-view-mode"
            value={viewMode}
            mode="input"
            segments={compact ? [
              { id: 'focused', label: (<span className="sg-icon-seg"><Laptop size={16} /></span>) as any, value: 'focused' },
              { id: 'all', label: (<span className="sg-icon-seg"><General size={16} /></span>) as any, value: 'all' },
            ] : [
              { id: 'focused', label: 'Focused', value: 'focused' },
              { id: 'all', label: 'All', value: 'all' },
            ]}
            onChange={(val) => handleSetViewMode(val as ViewMode)}
          />
        </div>
        <div className="sg-top-bar__settings">
          <Button
            v2
            size="sm"
            priority="primary"
            addonStart={{ type: 'icon', value: <Slider size={16} /> }}
            onClick={() => {
              setVisible(false);
              setViewMode('focused');
              setExpandedFlows(new Set());
              setViewportPickerOpen(false);
              setControlVisible(false);
              document.body.classList.remove('sg-controls-open', 'sg-no-transition');
              window.dispatchEvent(new CustomEvent('open-settings'));
            }}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Gallery overlay */}
      <div ref={overlayRef} className={`sg-overlay${showAllScreens ? ' sg-overlay--visible' : ''}`}>
        <div className="sg-scroll">
          <div className="sg-item">
            <div className="sg-label">Current</div>
            <div className="sg-frame" style={{ width: scaledW, height: scaledH, borderRadius: vp.radius }} onClick={() => handleSetViewMode('focused')}>
              <iframe
                src={activeScreenUrl}
                className="sg-iframe"
                style={{ width: vp.w, height: vp.h, transform: `scale(${vp.scale})` }}
                title="Current Preview"
              />
            </div>
          </div>

          {galleryLoaded && galleryItems.map((entry) => {
            if (entry.type === 'divider') {
              return (
                <div className="sg-divider" key={`divider-${entry.label}`}>
                  <div className="sg-divider__line" />
                  <span className="sg-divider__label">{entry.label}</span>
                </div>
              );
            }

            const screen = entry.screen;
            const isFlow = !!screen.steps && screen.steps.length > 0;
            const isExpanded = expandedFlows.has(screen.label);
            const stepCount = screen.steps?.length ?? 0;

            if (isFlow) {
              const hasMultipleSteps = stepCount > 1;
              const flowKey = `flow-${screen.label}${accountType === 'business' ? '-biz' : ''}`;
              const isFlowLoaded = loadedScreens.has(flowKey);
              return (
                <div className="sg-item" key={screen.label} data-gallery-key={flowKey} ref={(el) => setItemRef(flowKey, el)}>
                  <div
                    className="sg-label"
                    style={{ cursor: hasMultipleSteps ? 'pointer' : undefined }}
                    onClick={hasMultipleSteps ? () => toggleFlowExpanded(screen.label) : undefined}
                  >
                    {screen.label}{activeFlowLabel === screen.label ? ' · Active' : isExpanded ? ' · Collapse' : hasMultipleSteps ? ` · ${stepCount}` : ''}
                  </div>
                  <div className="sg-flow-steps" style={{ gap: isExpanded ? 24 : 0 }}>
                    {screen.steps!.map((step, i) => {
                      const showStep = isExpanded || i === 0;
                      return (
                        <div
                          className="sg-flow-step"
                          key={step.path + (accountType === 'business' ? '&account=business' : '')}
                          style={{
                            width: showStep ? scaledW : 0,
                            opacity: showStep ? 1 : 0,
                          }}
                        >
                          {showStep && (
                            <div
                              className="sg-frame"
                              style={{ width: scaledW, height: scaledH, borderRadius: vp.radius }}
                              onClick={() => {
                                if (hasMultipleSteps && !isExpanded) {
                                  toggleFlowExpanded(screen.label);
                                } else {
                                  window.postMessage({ type: 'navigate', path: step.path }, '*');
                                  handleSetViewMode('focused');
                                }
                              }}
                            >
                              {isFlowLoaded ? (
                                <iframe
                                  src={buildGalleryUrl(step.path, accountType)}
                                  className="sg-iframe"
                                  style={{ width: vp.w, height: vp.h, transform: `scale(${vp.scale})` }}
                                  title={`${screen.label} – ${step.label}`}
                                />
                              ) : (
                                <div className="sg-iframe-placeholder" style={{ width: scaledW, height: scaledH }} />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const screenKey = screen.path + (accountType === 'business' ? '-biz' : '');
            const isLoaded = loadedScreens.has(screenKey);
            const isActive = !screen.steps && currentPath.startsWith(screen.path);
            return (
              <div className="sg-item" key={screenKey} data-gallery-key={screenKey} ref={(el) => setItemRef(screenKey, el)}>
                <div className="sg-label">{screen.label}{isActive ? ' · Active' : ''}</div>
                <div
                  className="sg-frame"
                  style={{ width: scaledW, height: scaledH, borderRadius: vp.radius }}
                  onClick={() => {
                    window.postMessage({ type: 'navigate', path: screen.path }, '*');
                    window.history.pushState(null, '', screen.path);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    handleSetViewMode('focused');
                  }}
                >
                  {isLoaded ? (
                    <iframe
                      src={buildGalleryUrl(screen.path, accountType)}
                      className="sg-iframe"
                      style={{ width: vp.w, height: vp.h, transform: `scale(${vp.scale})` }}
                      title={`${screen.label} Preview`}
                    />
                  ) : (
                    <div className="sg-iframe-placeholder" style={{ width: scaledW, height: scaledH }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const GALLERY_CSS = `
/* ===== Screen Gallery Control ===== */
.sg-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
  padding: 0 24px;
  background: var(--color-background-screen);
  transition: opacity 0.5s 0.4s ease;
}

/* In all mode, top bar floats above the overlay */
.sg-top-bar--all {
  z-index: 10002;
}

/* Hidden state — fade out */
.sg-top-bar--hidden {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

/* Page slides down to reveal controls, shadow on top edge */
body.sg-controls-open .page-layout {
  transform: translateY(88px);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  position: relative;
  z-index: 9999;
}

body.sg-controls-open .page-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: -9999px;
  right: -9999px;
  height: 16px;
  box-shadow: 0 -8px 16px rgba(0,0,0,0.08);
  pointer-events: none;
}

body:not(.sg-controls-open) .page-layout {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

body.sg-no-transition .page-layout {
  transition: none !important;
}

.sg-top-bar__viewport {
  position: absolute;
  left: 24px;
}

.sg-viewport__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.sg-viewport__chevron--open {
  transform: rotate(180deg);
}

.sg-viewport__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  animation: sg-popout 0.15s ease-out;
}

.sg-viewport__panel .np-panel__content {
  opacity: 1;
  visibility: visible;
  transform: none;
  padding: 0;
  border-radius: 10px;
}

.sg-viewport__dropdown {
  list-style: none;
  margin: 0;
  padding: 8px;
  width: 200px;
}

.sg-viewport__dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  color: var(--color-content-primary);
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}

.sg-viewport__dropdown-heading {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-content-secondary);
  padding: 12px 8px 4px;
}

.sg-viewport__dropdown-heading:first-child {
  padding-top: 4px;
}

.sg-viewport__dropdown-item:hover {
  background: var(--color-background-neutral);
}

@keyframes sg-popout {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.sg-top-bar__control {
  min-width: 320px;
}

@media (max-width: 1100px) {
  .sg-top-bar__control {
    min-width: 0;
  }
}

.sg-icon-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-interactive-primary);
}

.sg-icon-seg svg {
  display: block;
}

.sg-top-bar__settings {
  position: absolute;
  right: 24px;
}

/* ===== Gallery Overlay ===== */
.sg-overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: var(--color-background-screen);
  overflow-x: auto;
  overflow-y: hidden;
  pointer-events: none;
  opacity: 0;
}

.sg-overlay--visible {
  z-index: 10001;
  pointer-events: auto;
  opacity: 1;
}

.sg-scroll {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 80px 40px 40px;
  min-height: 100%;
}

.sg-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.sg-label {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 28px;
  text-align: center;
  color: var(--color-content-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== Screen Frame ===== */
.sg-frame {
  position: relative;
  overflow: hidden;
  background: var(--color-background-screen);
  box-shadow: 0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10);
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sg-frame:hover {
  transform: scale(1.02);
}

.sg-iframe {
  display: block;
  border: none;
  transform-origin: top left;
  pointer-events: none;
}

/* ===== Flow Steps ===== */
.sg-flow-steps {
  display: flex;
  align-items: flex-start;
  transition: gap 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.sg-flow-step {
  flex-shrink: 0;
  transition: width 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sg-flow-step:first-child {
  z-index: 2;
  position: relative;
}

/* ===== Section Dividers ===== */
.sg-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  flex-shrink: 0;
  gap: 0;
  padding: 80px 0 0;
}

.sg-divider__line {
  width: 1px;
  flex: 1;
  background: var(--color-border-neutral);
}

.sg-divider__label {
  font-family: var(--font-family);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 12px 0;
  color: var(--color-content-secondary);
}

/* ===== Lazy loading placeholder ===== */
.sg-iframe-placeholder {
  background: var(--color-background-neutral);
  border-radius: 8px;
  animation: sg-placeholder-pulse 1.5s ease-in-out infinite;
}

@keyframes sg-placeholder-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* ===== Ensure Drawer + dimmer render above gallery toolbar ===== */
.dimmer {
  z-index: 10003 !important;
}
`;
