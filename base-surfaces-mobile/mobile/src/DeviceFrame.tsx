import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, SegmentedControl } from '@transferwise/components';
import { ChevronDown, Check, Slider, Mobile, General } from '@transferwise/icons';

type ViewMode = 'single' | 'all';

type DeviceConfig = {
  label: string;
  frameW: number;
  frameH: number;
  screenW: number;
  screenH: number;
  screenX: number;
  screenY: number;
  frameImage: string;
  screenRadius?: number;
  hasNotch?: boolean;
};

const DEVICES: Record<string, DeviceConfig> = {
  'iphone-17-pro': {
    label: 'iPhone 17 Pro',
    frameW: 450, frameH: 920,
    screenW: 402, screenH: 874,
    screenX: 24, screenY: 23,
    frameImage: '/iphone17pro-frame.png',
  },
  'iphone-air': {
    label: 'iPhone Air',
    frameW: 460, frameH: 960,
    screenW: 420, screenH: 912,
    screenX: 20, screenY: 24,
    frameImage: '/iphoneair-frame.png',
  },
  'iphone-17-pro-max': {
    label: 'iPhone 17 Pro Max',
    frameW: 490, frameH: 1000,
    screenW: 440, screenH: 956,
    screenX: 25, screenY: 22,
    frameImage: '/iphone17promax-frame.png',
  },
  'iphone-x': {
    label: 'iPhone X',
    frameW: 429, frameH: 860,
    screenW: 375, screenH: 812,
    screenX: 27, screenY: 24,
    frameImage: '/iphonex-frame.png',
    screenRadius: 40,
    hasNotch: true,
  },
};

const DEVICE_KEYS = Object.keys(DEVICES);
const DEFAULT_DEVICE = 'iphone-17-pro';
const MOBILE_BREAKPOINT = 460;
const COMPACT_BREAKPOINT = 900;

function useCompact() {
  const [compact, setCompact] = useState(() => window.innerWidth <= COMPACT_BREAKPOINT);
  useEffect(() => {
    const check = () => setCompact(window.innerWidth <= COMPACT_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return compact;
}

type ScreenDef = {
  label: string;
  path: string;
  iframePath?: string;
  section?: string;
  steps?: { label: string; iframePath: string }[];
};

type AccountType = 'personal' | 'business';

type GalleryEntry = { type: 'divider'; label: string } | { type: 'screen'; screen: ScreenDef };

const FLOW_LABELS: Record<string, string> = { send: 'Send', request: 'Request', convert: 'Convert', 'add-money': 'Add', 'payment-link': 'Payment Link' };

// Screen types:
// - Pages: { label, path, section: 'Pages' } — standalone pages
// - Sub-pages: { label, path, section: 'Sub-pages' } — drill-down pages
// - Flows: { label, path, iframePath, section: 'Flows', steps: [{ label, iframePath }] }
//     Overlay flows with expandable steps. iframePath loads the flow inside the iframe with ?mode=app&flow=...
function getScreens(accountType: AccountType): ScreenDef[] {
  const isPersonal = accountType === 'personal';

  // Balance IDs: personal GBP=50417283, business GBP=17480352
  const currencyBalanceId = isPersonal ? '50417283' : '17480352';

  return [
    // Pages
    { label: 'Home', path: '/home', section: 'Pages' },
    { label: 'Cards', path: '/cards', section: 'Pages' },
    { label: 'Recipients', path: '/recipients', section: 'Pages' },
    { label: 'Payments', path: '/payments', section: 'Pages' },
    { label: 'Transactions', path: '/all-transactions', section: 'Pages' },
    { label: 'Insights', path: '/account-summary', section: 'Pages' },
    { label: 'Account', path: '/your-account', section: 'Pages' },
    // Sub-pages
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
    // Flows
    {
      label: 'Send', path: '/home', iframePath: '/home?mode=app&flow=send', section: 'Flows',
      steps: [
        { label: 'Recipient', iframePath: '/home?mode=app&flow=send&step=recipient' },
        { label: 'Amount', iframePath: '/home?mode=app&flow=send&step=amount' },
      ],
    },
    ...(isPersonal ? [{
      label: 'Request', path: '/home', iframePath: '/home?mode=app&flow=request', section: 'Flows',
      steps: [
        { label: 'Recipient', iframePath: '/home?mode=app&flow=request&step=recipient' },
        { label: 'Amount', iframePath: '/home?mode=app&flow=request&step=request' },
      ],
    }] : [{
      label: 'Payment Link', path: '/home', iframePath: '/home?mode=app&flow=payment-link', section: 'Flows',
      steps: [{ label: 'Amount', iframePath: '/home?mode=app&flow=payment-link' }],
    }]),
    {
      label: 'Convert', path: '/home', iframePath: '/home?mode=app&flow=convert', section: 'Flows',
      steps: [{ label: 'Amount', iframePath: '/home?mode=app&flow=convert' }],
    },
    {
      label: 'Add', path: '/home', iframePath: '/home?mode=app&flow=add-money', section: 'Flows',
      steps: [{ label: 'Amount', iframePath: '/home?mode=app&flow=add-money' }],
    },
  ];
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function isAppMode() {
  return new URLSearchParams(window.location.search).has('mode');
}

export function isMakeMode() {
  return false;
}

function useCurrentTime() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  });
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function StatusBar({ device }: { device: DeviceConfig }) {
  const time = useCurrentTime();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'theme-change') setDark(e.data.dark);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const variantClass = device.hasNotch ? ' df-status-bar--notch' : '';

  return (
    <div
      className={`df-status-bar${dark ? ' df-status-bar--dark' : ''}${variantClass}`}
      style={{
        top: device.screenY,
        left: device.screenX,
        width: device.screenW,
      }}
    >
      <div className="df-status-bar__time">{time}</div>
      <div className="df-status-bar__island-spacer" />
      <div className="df-status-bar__icons">
        <img src="/cellular.svg" className="df-status-bar__cellular" alt="" />
        <img src="/wifi.svg" className="df-status-bar__wifi" alt="" />
        <img src="/battery.svg" className="df-status-bar__battery" alt="" />
      </div>
    </div>
  );
}

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'theme-change') setDark(e.data.dark);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return dark;
}

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const compact = useCompact();
  const dark = useDarkMode();
  const isDevice = !isAppMode() && !isMobile;

  const [deviceKey, setDeviceKey] = useState(DEFAULT_DEVICE);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [viewMode, setViewModeRaw] = useState<ViewMode>('single');
  const [expandedFlows, setExpandedFlows] = useState<Set<string>>(new Set());
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [activeFlowType, setActiveFlowType] = useState<string | null>(null);
  const [controlsHidden, setControlsHidden] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLIFrameElement>(null);
  const galleryLoadedRef = useRef(false);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef<Set<string>>(new Set());
  const [loadedScreens, setLoadedScreens] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const showAllScreens = viewMode === 'all';
  const device = DEVICES[deviceKey];
  const setViewMode = (v: ViewMode) => {
    setViewModeRaw(v);
    if (v === 'single') setExpandedFlows(new Set());
    if (v === 'all') screenRef.current?.contentWindow?.postMessage({ type: 'close-settings' }, '*');
  };

  const toggleFlowExpanded = (label: string) => {
    setExpandedFlows(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  // Listen for account type and flow changes from main iframe only
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const isMainIframe = screenRef.current && e.source === screenRef.current.contentWindow;
      if (e.data?.type === 'account-type-change' && isMainIframe) setAccountType(e.data.accountType);
      if (e.data?.type === 'flow-change' && isMainIframe) setActiveFlowType(e.data.flowType);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (showAllScreens) galleryLoadedRef.current = true;
  const galleryLoaded = galleryLoadedRef.current;

  // IntersectionObserver for lazy-loading gallery iframes (staggered to avoid main-thread jank)
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
      { root: scrollRootRef.current, rootMargin: '0px 2000px 0px 2000px' }
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

  // Sync outer <html> dark class so Neptune Button gets dark styles
  useEffect(() => {
    document.documentElement.classList.toggle('np-theme-personal--dark', dark);
    return () => document.documentElement.classList.remove('np-theme-personal--dark');
  }, [dark]);

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  // Ctrl+H / Cmd+H to toggle control bar visibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setControlsHidden(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock outer page scroll when device frame is active
  useEffect(() => {
    if (!isDevice) return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isDevice]);

  if (!isDevice) {
    return <>{children}</>;
  }

  const pagePath = window.location.pathname;
  const acctParam = accountType === 'business' ? '&account=business' : '';
  const appSrc = `${pagePath}?mode=app${acctParam}`;
  const GALLERY_SCALE = 0.55;
  const SINGLE_SCALE = 0.80;
  const FOCUSED_SCALE = 0.88;
  const singleScale = controlsHidden ? FOCUSED_SCALE : SINGLE_SCALE;
  const galleryScale = showAllScreens ? GALLERY_SCALE : singleScale;

  const allScreens = getScreens(accountType);

  const activeFlowLabel = activeFlowType ? FLOW_LABELS[activeFlowType] : undefined;

  const galleryItems: GalleryEntry[] = [];
  let lastSection = '';
  for (const screen of allScreens) {
    if (screen.section && screen.section !== lastSection) {
      galleryItems.push({ type: 'divider', label: screen.section });
      lastSection = screen.section;
    }
    galleryItems.push({ type: 'screen', screen });
  }

  // Helper to render a phone frame
  const makeMode = isMakeMode();
  const renderPhone = (src: string, title: string, scale: number, opts?: { onClick?: () => void; interactive?: boolean; isMain?: boolean; className?: string; style?: React.CSSProperties; loaded?: boolean }) => {
    const shouldLoad = opts?.loaded !== false;
    // In Make mode, the main phone renders {children} directly (no iframe needed).
    // Gallery phones use real iframes to load separate app instances at each route.
    const useChildren = makeMode && opts?.isMain;
    return (
      <div
        className={`df-phone${opts?.className ? ` ${opts.className}` : ''}`}
        style={{
          width: device.frameW * scale,
          height: device.frameH * scale,
          cursor: opts?.onClick ? 'pointer' : undefined,
          ...opts?.style,
        }}
        onClick={opts?.onClick}
      >
        <div className="df-phone__inner" style={{
          width: device.frameW,
          height: device.frameH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <div className="df-screen-area" style={{
            top: device.screenY, left: device.screenX,
            width: device.screenW, height: device.screenH,
            borderRadius: device.screenRadius ?? 55,
          }}>
            {useChildren ? (
              <div className="df-screen-content" style={{ width: device.screenW, height: device.screenH, overflow: 'hidden' }}>{children}</div>
            ) : shouldLoad ? (
              <iframe
                ref={opts?.interactive ? screenRef : undefined}
                src={src}
                className="df-screen"
                style={{ width: device.screenW, height: device.screenH, pointerEvents: opts?.interactive ? undefined : 'none' }}
                title={title}
              />
            ) : (
              <div className="df-screen-placeholder" style={{ width: device.screenW, height: device.screenH }} />
            )}
          </div>
          {!shouldLoad ? (
            <div className="df-frame-outline" style={{ width: device.frameW, height: device.frameH, borderRadius: 60 }} />
          ) : (
            <img src={device.frameImage} className="df-frame-img" style={{ width: device.frameW, height: device.frameH }} alt="" draggable={false} />
          )}
          {shouldLoad && <StatusBar device={device} />}
        </div>
      </div>
    );
  };

  return (
    <div ref={scrollRootRef} className={`df-wrap${dark ? ' df-wrap--dark' : ''}${showAllScreens ? ' df-wrap--gallery' : ''}${controlsHidden ? ' df-wrap--controls-hidden' : ''}`}>
      <div className={`df-top-bar${controlsHidden ? ' df-top-bar--hidden' : ''}`}>
        <div className="df-top-bar__picker" ref={pickerRef}>
          <Button
            v2
            size="sm"
            priority="primary"
            addonEnd={{ type: 'icon', value: (
              <span className={`df-picker__chevron${pickerOpen ? ' df-picker__chevron--open' : ''}`}>
                <ChevronDown size={16} />
              </span>
            )}}
            onClick={() => setPickerOpen(!pickerOpen)}
          >
            {device.label}
          </Button>
          {pickerOpen && (
            <div className="df-picker__panel">
              <div className="np-panel__content">
                <ul className="df-picker__dropdown">
                  {DEVICE_KEYS.map((key) => (
                    <li key={key}>
                      <button
                        className="df-picker__dropdown-item"
                        onClick={() => { setDeviceKey(key); setPickerOpen(false); }}
                      >
                        <span>{DEVICES[key].label}</span>
                        {key === deviceKey && <Check size={16} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="df-top-bar__control">
          <SegmentedControl
            name="view-mode"
            value={viewMode}
            mode="input"
            segments={compact ? [
              { id: 'single', label: (<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mobile size={16} /></span>) as any, value: 'single' },
              { id: 'all', label: (<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><General size={16} /></span>) as any, value: 'all' },
            ] : [
              { id: 'single', label: 'Focused', value: 'single' },
              { id: 'all', label: 'All', value: 'all' },
            ]}
            onChange={(val: ViewMode) => setViewMode(val)}
          />
        </div>
        <div className="df-top-bar__settings">
          <Button
            v2
            size="sm"
            priority="primary"
            addonStart={{ type: 'icon', value: <Slider size={16} /> }}
            onClick={() => {
              setViewMode('single');
              setTimeout(() => {
                screenRef.current?.contentWindow?.postMessage({ type: 'open-settings' }, '*');
              }, 100);
            }}
          >
            Settings
          </Button>
        </div>
      </div>
      <div className="df-gallery-scroll">
        {/* Main / current screen */}
        <div className="df-gallery-item">
          {showAllScreens && <div className="df-gallery-label">Current</div>}
          {renderPhone(appSrc, 'Mobile App Preview', galleryScale, {
            interactive: !showAllScreens,
            isMain: true,
            className: showAllScreens ? 'df-phone--gallery' : undefined,
            onClick: showAllScreens ? () => setViewMode('single') : undefined,
          })}
        </div>
        {/* Gallery screens with section dividers — retained once loaded */}
        {galleryLoaded && galleryItems.map((entry) => {
          if (entry.type === 'divider') {
            return (
              <div className="df-gallery-divider" key={`divider-${entry.label}`}>
                <div className="df-gallery-divider__line" />
                <span className="df-gallery-divider__label">{entry.label}</span>
              </div>
            );
          }
          const screen = entry.screen;
          const isFlow = !!screen.steps && screen.steps.length > 0;
          const isExpanded = expandedFlows.has(screen.label);
          const stepCount = screen.steps?.length ?? 0;

          if (isFlow) {
            const hasMultipleSteps = stepCount > 1;
            const flowKey = `flow-${screen.label}${acctParam}`;
            const isFlowLoaded = loadedScreens.has(flowKey);
            return (
              <div className="df-gallery-item" key={screen.label} data-gallery-key={flowKey} ref={(el) => setItemRef(flowKey, el)}>
                <div
                  className="df-gallery-label"
                  style={{ cursor: hasMultipleSteps ? 'pointer' : undefined }}
                  onClick={hasMultipleSteps ? () => toggleFlowExpanded(screen.label) : undefined}
                >
                  {screen.label}{activeFlowLabel === screen.label ? ' · Active' : isExpanded ? ' · Collapse' : hasMultipleSteps ? ` · ${stepCount}` : ''}
                </div>
                <div className="df-flow-steps" style={{ gap: isExpanded ? 24 : 0 }}>
                  {screen.steps!.map((step, i) => {
                    const showStep = isExpanded || i === 0;
                    return (
                      <div
                        className="df-flow-step"
                        key={step.iframePath + acctParam}
                        style={{
                          width: showStep ? device.frameW * GALLERY_SCALE : 0,
                          opacity: showStep ? 1 : 0,
                        }}
                      >
                        {showStep && renderPhone(step.iframePath + acctParam, `${screen.label} – ${step.label}`, GALLERY_SCALE, {
                          className: 'df-phone--gallery',
                          loaded: isFlowLoaded,
                          onClick: () => {
                            if (hasMultipleSteps && !isExpanded) {
                              toggleFlowExpanded(screen.label);
                            } else {
                              screenRef.current?.contentWindow?.postMessage({ type: 'navigate', path: step.iframePath + acctParam }, '*');
                              requestAnimationFrame(() => requestAnimationFrame(() => setViewMode('single')));
                            }
                          },
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Regular screen (non-flow)
          const screenKey = (screen.iframePath ?? screen.path) + acctParam;
          const isScreenLoaded = loadedScreens.has(screenKey);
          const isActive = !screen.iframePath && pagePath.startsWith(screen.path);
          return (
            <div className="df-gallery-item" key={screenKey} data-gallery-key={screenKey} ref={(el) => setItemRef(screenKey, el)}>
              <div className="df-gallery-label">{screen.label}{isActive ? ' · Active' : ''}</div>
              {renderPhone((screen.iframePath ?? `${screen.path}?mode=app`) + acctParam, `${screen.label} Preview`, GALLERY_SCALE, {
                className: 'df-phone--gallery',
                loaded: isScreenLoaded,
                onClick: () => {
                  const navPath = screen.iframePath ?? screen.path;
                  screenRef.current?.contentWindow?.postMessage({ type: 'navigate', path: navPath + (screen.iframePath ? acctParam : '') }, '*');
                  if (!screen.iframePath) {
                    window.history.pushState(null, '', screen.path);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                  requestAnimationFrame(() => requestAnimationFrame(() => setViewMode('single')));
                },
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const DEVICE_CSS = `
/* ===== Prevent outer page scroll when device frame is active ===== */
html:has(.df-wrap), html:has(.df-wrap) body {
  overflow: hidden;
  height: 100%;
}

/* ===== Background — adapts to light/dark ===== */
.df-wrap {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-screen);
  padding: 24px 20px;
  overflow: auto;
}

/* ===== Device Picker (inside top bar) ===== */
.df-top-bar__picker {
  position: absolute;
  left: 24px;
}

/* ===== Top Bar (segmented control + settings) ===== */
.df-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
}

.df-top-bar__control {
  min-width: 320px;
}

@media (max-width: 900px) {
  .df-top-bar__control {
    min-width: 0;
  }
}

.df-top-bar__settings {
  position: absolute;
  right: 24px;
}

/* Hide controls via Ctrl+H */
.df-top-bar--hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease;
}

.df-top-bar:not(.df-top-bar--hidden) {
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease;
}

.df-wrap--controls-hidden .df-gallery-scroll {
  padding-top: 0;
}

/* ===== Gallery scroll container ===== */
.df-gallery-scroll {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding-top: 64px;
}

.df-wrap--gallery .df-gallery-scroll {
  align-items: flex-start;
  justify-content: flex-start;
  gap: 32px;
  padding: 80px 40px 40px;
}

/* Hide gallery items when in focused mode (but keep iframes alive) */
.df-gallery-scroll > :not(:first-child) {
  display: none;
}

.df-wrap--gallery .df-gallery-scroll > :not(:first-child) {
  display: flex;
}

.df-gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.df-gallery-label {
  font-family: Inter, -apple-system, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a1a1a;
}

.df-wrap--dark .df-gallery-label {
  color: #fff;
}

.df-phone--gallery {
  transition: transform 0.2s ease;
}

.df-phone--gallery:hover {
  transform: scale(1.02);
}

/* ===== Flow steps (animated expand/collapse) ===== */
.df-flow-steps {
  display: flex;
  align-items: flex-start;
  transition: gap 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.df-flow-step {
  flex-shrink: 0;
  transition: width 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.df-flow-step:first-child {
  z-index: 2;
  position: relative;
}

/* ===== Gallery mode wrap ===== */
.df-wrap--gallery {
  overflow-x: auto;
  overflow-y: hidden;
  align-items: center;
  justify-content: flex-start;
}

/* ===== Section dividers ===== */
.df-gallery-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  justify-content: center;
  flex-shrink: 0;
  gap: 0;
  padding: 80px 0 0;
}

.df-gallery-divider__line {
  width: 1px;
  flex: 1;
  background: rgba(0,0,0,0.1);
}

.df-wrap--dark .df-gallery-divider__line {
  background: rgba(255,255,255,0.15);
}

.df-gallery-divider__label {
  font-family: Inter, -apple-system, system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 12px 0;
  color: rgba(0,0,0,0.4);
}

.df-wrap--dark .df-gallery-divider__label {
  color: rgba(255,255,255,0.5);
}

.df-picker__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.df-picker__chevron--open {
  transform: rotate(180deg);
}

.df-picker__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  animation: df-popout 0.15s ease-out;
}

.df-picker__panel .np-panel__content {
  opacity: 1;
  visibility: visible;
  transform: none;
  padding: 0;
  border-radius: 10px;
}

.df-picker__dropdown {
  list-style: none;
  margin: 0;
  padding: 8px;
  width: 200px;
}

.df-picker__dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 8px;
  color: var(--color-content-primary);
  font-family: Inter, -apple-system, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}

.df-picker__dropdown-item:hover {
  background: var(--color-background-neutral);
}

@keyframes df-popout {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* ===== Phone body — rendered at exact real-life size ===== */
.df-phone {
  position: relative;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.06)) drop-shadow(0 12px 32px rgba(0,0,0,0.10));
}

/* ===== Frame image overlay ===== */
.df-frame-img {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

/* ===== Screen area ===== */
.df-screen-area {
  position: absolute;
  overflow: hidden;
  background: #fff;
}

/* ===== iframe ===== */
.df-screen {
  display: block;
  border: none;
}

/* ===== iOS Status Bar ===== */
.df-status-bar {
  position: absolute;
  height: 54px;
  z-index: 20;
  pointer-events: none;
  font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, system-ui, sans-serif;
}

.df-status-bar__time {
  position: absolute;
  top: 23px;
  left: 6px;
  width: 138px;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.4px;
  color: #000;
  text-align: center;
}

.df-status-bar__icons {
  position: absolute;
  top: 26px;
  right: 37px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.df-status-bar__cellular {
  width: 19.2px;
  height: 12.23px;
}

.df-status-bar__wifi {
  width: 17.14px;
  height: 12.33px;
}

.df-status-bar__battery {
  width: 27.33px;
  height: 13px;
}

/* Dark mode outer background */
.df-wrap--dark {
  background: #1a1a1a;
}

/* Dark mode screen area */
.df-wrap--dark .df-screen-area {
  background: #000;
}

/* Dark mode dropdown */
.df-wrap--dark .df-picker__panel .np-panel__content {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
}

.df-wrap--dark .df-picker__dropdown-item {
  color: #fff;
}

.df-wrap--dark .df-picker__dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ===== Notch-style status bar (iPhone X) ===== */
.df-status-bar--notch .df-status-bar__time {
  top: 16px;
  left: 20px;
  width: 54px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
}

.df-status-bar--notch .df-status-bar__icons {
  top: 18px;
  right: 14px;
  gap: 4px;
}

.df-status-bar--notch .df-status-bar__cellular {
  width: 17px;
  height: 10.7px;
}

.df-status-bar--notch .df-status-bar__wifi {
  width: 15.3px;
  height: 11px;
}

.df-status-bar--notch .df-status-bar__battery {
  width: 24.3px;
  height: 11.5px;
}

.df-status-bar--notch .df-status-bar__island-spacer {
  display: none;
}

/* Dark mode status bar */
.df-status-bar--dark .df-status-bar__time {
  color: #fff;
}

.df-status-bar--dark .df-status-bar__icons img {
  filter: invert(1);
}

/* ===== Lazy loading placeholder ===== */
.df-screen-placeholder {
  background: rgba(0,0,0,0.05);
  animation: df-placeholder-pulse 1.5s ease-in-out infinite;
}

.df-wrap--dark .df-screen-placeholder {
  background: rgba(255,255,255,0.05);
}

.df-frame-outline {
  position: absolute;
  top: 0;
  left: 0;
  border: 2px solid rgba(0,0,0,0.08);
  pointer-events: none;
  box-sizing: border-box;
}

.df-wrap--dark .df-frame-outline {
  border-color: rgba(255,255,255,0.1);
}

@keyframes df-placeholder-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
`;
