import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { Button, ExpressiveMoneyInput, Chips, ListItem } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, Search, Plus, ScanSparkle, Savings, Suitcase } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { FlowHeader, GlassPill, GlassCircle } from '../components/FlowHeader';
import { ButtonCue } from '../components/ButtonCue';
import { RecentContactCard } from '../components/RecentContactCard';
import { RecipientSearchEmpty } from '../components/RecipientSearchEmpty';
import { CurrencySheet } from '../components/CurrencySheet';
import { useLanguage } from '../context/Language';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLiveRates } from '../context/LiveRates';
import { convertToHomeCurrency } from '@shared/data/currency-rates';
import { formatBalance } from '@shared/data/balances';
import { recipients, businessRecipients, recentContacts, businessRecentContacts, getAvatarSrc, getBadge, type Recipient } from '@shared/data/recipients';
import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { groupCurrencies } from '@shared/data/taxes-data';
import type { AccountType } from '../App';

function WiseLogoIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.875 15.28 7.35 8.838h-.002L4.02 3h18.105l-7.008 19.375h-3.97L16.95 6.3H9.463l1.665 2.883-.008.08-2.56 2.979h4.188l-1.098 3.037z" />
    </svg>
  );
}

type ButtonState = 'disabled' | 'loading' | 'active';

type RecipientInfo = {
  name: string;
  subtitle: string;
  avatarUrl?: string;
  initials?: string;
  hasFastFlag: boolean;
  badgeFlagCode?: string;
};

export type AccountStyle = { color: string; textColor: string; iconName: string };

type Props = {
  defaultCurrency: string;
  accountLabel: string;
  jar?: 'taxes';
  accountStyle: AccountStyle;
  onClose: () => void;
  onStepChange?: (step: string) => void;
  accountType: AccountType;
  avatarUrl: string;
  initials: string;
  recipient?: RecipientInfo;
  prefillAmount?: number;
  prefillReceiveAmount?: number;
  startStep?: 'recipient' | 'amount';
  forcedReceiveCurrency?: string;
  forceClose?: boolean;
};

export function SendFlow({ defaultCurrency, accountLabel, jar, accountStyle, onClose, onStepChange, accountType, avatarUrl, initials, recipient: initialRecipient, prefillAmount, prefillReceiveAmount, startStep = 'recipient', forcedReceiveCurrency, forceClose }: Props) {
  const { t } = useLanguage();
  const { consumerName } = usePrototypeNames();
  const rates = useLiveRates();

  const isBusiness = accountType === 'business';
  const isGroup = jar === 'taxes';

  const [step, setStep] = useState<'recipient' | 'amount'>(initialRecipient ? 'amount' : startStep);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientInfo | null>(initialRecipient ?? null);
  const [currency, setCurrency] = useState(initialRecipient?.badgeFlagCode ?? defaultCurrency);
  const [sendCurrency, setSendCurrency] = useState(defaultCurrency);
  const [currencySheetTarget, setCurrencySheetTarget] = useState<'send' | 'receive' | null>(null);
  const [userOverrodeReceiveCurrency, setUserOverrodeReceiveCurrency] = useState(false);
  const [crossTransition, setCrossTransition] = useState<'idle' | 'shimmer' | 'revealing' | 'collapsing'>('idle');
  const reverseShimmerRef = useRef(false);
  const pendingSendCurrencyRef = useRef<string | null>(null);
  const sameCurrencyBottomRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState<number | null>(prefillAmount ?? null);
  const [receiveAmount, setReceiveAmount] = useState<number | null>(prefillReceiveAmount ?? null);
  const [activeInput, setActiveInput] = useState<'send' | 'receive'>('send');
  const [buttonState, setButtonState] = useState<ButtonState>(prefillAmount ? 'active' : 'disabled');
  const [cueVisible, setCueVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [sendInputFocused, setSendInputFocused] = useState(false);
  const [searchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hasAmountRef = useRef(false);
  const crossTopRef = useRef<HTMLDivElement>(null);
  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const slideAnimRef = useRef<Animation | null>(null);

  // Open currency sheet
  const openCurrencySheet = useCallback((target: 'send' | 'receive') => {
    setCurrencySheetTarget(target);
  }, []);

  // Determine if we are in cross-currency mode
  // Compare what the user sends vs what the recipient gets
  const recipientCurrency = (forcedReceiveCurrency && !userOverrodeReceiveCurrency) ? forcedReceiveCurrency : currency;
  const isCrossCurrency = sendCurrency !== recipientCurrency;
  const crossRate = isCrossCurrency ? convertToHomeCurrency(1, sendCurrency, recipientCurrency, rates).toFixed(4) : '';

  // Dynamic business recipients with consumer name
  const dynamicBusinessRecipients = useMemo(() =>
    businessRecipients.map((r) => r.id === 104 ? { ...r, name: consumerName } : r),
    [consumerName],
  );
  const dynamicBusinessRecentContacts = useMemo(() =>
    businessRecentContacts.map((c) => c.name === 'Connor Berry' ? { ...c, name: consumerName } : c),
    [consumerName],
  );

  const activeRecipients = isBusiness ? dynamicBusinessRecipients : recipients;
  const activeRecentContacts = isBusiness ? dynamicBusinessRecentContacts : recentContacts;
  const PROFILE_AVATAR = isBusiness ? '/berry-design-logo.png' : 'https://www.tapback.co/api/avatar/connor-berry.webp';

  const filterChips = useMemo(() => [
    { value: 'all', label: t('recipients.filterAll') },
    { value: 'my-accounts', label: t('recipients.filterMyAccounts') },
  ], [t]);

  const filteredRecipients = useMemo(() => {
    let filtered = activeRecipients;
    if (selectedFilter === 'my-accounts') {
      filtered = filtered.filter((r) => r.isMyAccount);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) => r.name.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [searchQuery, selectedFilter, activeRecipients]);

  const isSearching = searchQuery.trim().length > 0;

  // Find balance for the sending currency
  const allCurrencies = [...(isGroup ? groupCurrencies : []), ...(isBusiness ? businessCurrencies : currencies)];
  const sendCurrencyData = allCurrencies.find((c) => c.code === sendCurrency);
  const availableBalance = sendCurrencyData ? formatBalance(sendCurrencyData) : `0.00 ${sendCurrency}`;

  // Currency name for "You send" section
  const sendCurrencyName = sendCurrencyData?.name ?? sendCurrency;

  // Account avatar style for currency selector — driven by props
  const accountAvatarStyle = { backgroundColor: accountStyle.color, color: accountStyle.textColor };

  // Select a recipient and transition to amount step
  const handleSelectRecipient = useCallback((r: Recipient) => {
    const info: RecipientInfo = {
      name: r.name,
      subtitle: r.subtitle,
      avatarUrl: r.isMyAccount ? PROFILE_AVATAR : getAvatarSrc(r),
      initials: r.initials,
      hasFastFlag: r.hasFastFlag,
      badgeFlagCode: r.badgeFlagCode,
    };
    setSelectedRecipient(info);
    setSendCurrency(defaultCurrency);
    setCurrency(forcedReceiveCurrency ?? r.badgeFlagCode ?? defaultCurrency);
    setCurrencySheetTarget(null);
    setCrossTransition('idle');
    // Preserve prefilled amounts from calculator; otherwise reset for fresh entry
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    const hasPrefill = prefillAmount != null || prefillReceiveAmount != null;
    if (hasPrefill) {
      setAmount(prefillAmount ?? null);
      setReceiveAmount(prefillReceiveAmount ?? null);
      hasAmountRef.current = true;
      setButtonState('active');
    } else {
      setAmount(null);
      setReceiveAmount(null);
      setActiveInput('send');
      hasAmountRef.current = false;
      setButtonState('disabled');
    }
    setCueVisible(false);
    setStep('amount');
    onStepChange?.('amount');
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    // Focus input after transition
    setTimeout(() => {
      const input = bodyRef.current?.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
      input?.focus();
    }, 700);
  }, [defaultCurrency, forcedReceiveCurrency, prefillAmount, prefillReceiveAmount]);

  const handleSelectRecentContact = useCallback((contact: { name: string; subtitle: string }) => {
    const match = activeRecipients.find((r) => r.name === contact.name && r.subtitle.includes(contact.subtitle));
    if (match) {
      handleSelectRecipient(match);
    }
  }, [activeRecipients, handleSelectRecipient]);

  // Button state machine helper
  const updateButtonState = useCallback((hasAmount: boolean) => {
    const hadAmount = hasAmountRef.current;
    hasAmountRef.current = hasAmount;

    if (hasAmount && !hadAmount) {
      setButtonState('loading');
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => setButtonState('active'), 2000);
    } else if (!hasAmount && hadAmount) {
      setButtonState('loading');
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => setButtonState('disabled'), 2000);
    }
  }, []);

  // Same-currency: single amount handler
  const handleAmountChange = useCallback((newAmount: number | null) => {
    setAmount(newAmount);
    updateButtonState(newAmount !== null && newAmount !== 0);
  }, [updateButtonState]);

  // Cross-currency: "You send" amount handler
  const handleSendAmountChange = useCallback((newAmount: number | null) => {
    setAmount(newAmount);
    setActiveInput('send');
    const hasVal = newAmount !== null && newAmount !== 0;
    if (hasVal) {
      setReceiveAmount(Math.round(convertToHomeCurrency(newAmount!, sendCurrency, recipientCurrency, rates) * 100) / 100);
    } else {
      setReceiveAmount(null);
    }
    updateButtonState(hasVal);
  }, [sendCurrency, recipientCurrency, rates, updateButtonState]);

  // Cross-currency: "{Name} gets" amount handler
  const handleReceiveAmountChange = useCallback((newAmount: number | null) => {
    setReceiveAmount(newAmount);
    setActiveInput('receive');
    const hasVal = newAmount !== null && newAmount !== 0;
    if (hasVal) {
      setAmount(Math.round(convertToHomeCurrency(newAmount!, recipientCurrency, sendCurrency, rates) * 100) / 100);
    } else {
      setAmount(null);
    }
    updateButtonState(hasVal);
  }, [sendCurrency, recipientCurrency, rates, updateButtonState]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  // Animate the slide-down of gets input + button when cross-top appears (and reverse on collapse)
  useEffect(() => {
    if (crossTransition === 'revealing' && crossTopRef.current && slideWrapperRef.current) {
      // Focus the gets input to trigger its active/expressive state while sliding
      const getsInput = slideWrapperRef.current.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
      getsInput?.focus();

      // Measure the cross-top's natural height — this is how far everything slides down
      const height = crossTopRef.current.offsetHeight;
      slideAnimRef.current = slideWrapperRef.current.animate(
        [
          { transform: `translateY(-${height}px)` },
          { transform: 'translateY(0)' },
        ],
        {
          duration: 550,
          easing: 'cubic-bezier(0.4, 0, 0.1, 1.08)',
          fill: 'forwards',
        },
      );
    } else if (crossTransition === 'collapsing' && crossTopRef.current && slideWrapperRef.current) {
      // Focus the gets input to trigger its active/expressive state while the cross-top collapses
      const getsInput = slideWrapperRef.current.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
      getsInput?.focus();

      // Animate the cross-top's height to 0
      const crossHeight = crossTopRef.current.offsetHeight;
      crossTopRef.current.style.overflow = 'hidden';
      slideAnimRef.current = crossTopRef.current.animate(
        [
          { height: `${crossHeight}px`, opacity: 1 },
          { height: '0px', opacity: 0 },
        ],
        {
          duration: 480,
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          fill: 'forwards',
        },
      );

      // Simultaneously expand the same-bottom section (shimmer) from 0
      if (reverseShimmerRef.current && sameCurrencyBottomRef.current) {
        const el = sameCurrencyBottomRef.current;
        el.style.overflow = 'hidden';
        const targetHeight = el.scrollHeight;
        el.animate(
          [
            { height: '0px', opacity: 0 },
            { height: `${targetHeight}px`, opacity: 1 },
          ],
          {
            duration: 480,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            fill: 'forwards',
          },
        ).onfinish = () => {
          el.style.overflow = '';
          el.style.height = '';
        };
      }
    } else if ((crossTransition === 'idle' || crossTransition === 'shimmer') && slideAnimRef.current) {
      slideAnimRef.current.cancel();
      slideAnimRef.current = null;
    }
  }, [crossTransition]);

  // Clean up same-bottom styles when transitioning from collapsing to shimmer/idle
  useLayoutEffect(() => {
    if ((crossTransition === 'shimmer' || crossTransition === 'idle') && sameCurrencyBottomRef.current) {
      const el = sameCurrencyBottomRef.current;
      el.style.overflow = '';
      el.style.height = '';
    }
  }, [crossTransition]);

  // Recent = account currencies (ones the user has)
  const recentCurrencyCodes = useMemo(() =>
    allCurrencies.map((c) => c.code),
  [allCurrencies]);

  const handleSelectSendCurrency = useCallback((code: string) => {
    const wasCross = sendCurrency !== recipientCurrency;
    const wasNotCross = !wasCross;
    const willBeCross = code !== recipientCurrency;

    // Recalculate amounts with new send currency
    if (amount !== null && amount !== 0 && willBeCross) {
      setReceiveAmount(Math.round(convertToHomeCurrency(amount, code, recipientCurrency, rates) * 100) / 100);
    }

    // Transition: same → cross (shimmer → reveal)
    if (wasNotCross && willBeCross) {
      setSendCurrency(code);
      setCrossTransition('shimmer');
      setTimeout(() => setCrossTransition('revealing'), 1200);
      setTimeout(() => setCrossTransition('idle'), 2000);
    }
    // Transition: cross → same (collapse cross-top + expand same-bottom simultaneously)
    else if (wasCross && !willBeCross) {
      reverseShimmerRef.current = true;
      pendingSendCurrencyRef.current = code;
      setCrossTransition('collapsing');
      // After both animations complete, switch to shimmer briefly then idle
      setTimeout(() => {
        setSendCurrency(code);
        if (amount !== null && amount !== 0) {
          setReceiveAmount(null);
        }
        pendingSendCurrencyRef.current = null;
        reverseShimmerRef.current = false;
        setCrossTransition('shimmer');
        setTimeout(() => {
          setCrossTransition('idle');
          setTimeout(() => {
            const input = bodyRef.current?.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
            input?.focus();
          }, 100);
        }, 600);
      }, 500);
    }
    // Same currency change (cross → different cross, or same → same)
    else {
      setSendCurrency(code);
      if (wasCross && willBeCross && amount !== null && amount !== 0) {
        setReceiveAmount(Math.round(convertToHomeCurrency(amount, code, recipientCurrency, rates) * 100) / 100);
      }
    }
  }, [amount, recipientCurrency, rates, sendCurrency]);

  // Handle selecting a receive currency (from the gets input currency selector)
  const handleSelectReceiveCurrency = useCallback((code: string) => {
    const wasCross = sendCurrency !== recipientCurrency;
    const willBeCross = sendCurrency !== code;

    setUserOverrodeReceiveCurrency(true);

    // Same → cross: recipient gets a different currency now
    if (!wasCross && willBeCross) {
      setCurrency(code);
      setCrossTransition('shimmer');
      if (amount !== null && amount !== 0) {
        setReceiveAmount(Math.round(convertToHomeCurrency(amount, sendCurrency, code, rates) * 100) / 100);
      }
      setTimeout(() => setCrossTransition('revealing'), 1200);
      setTimeout(() => setCrossTransition('idle'), 2000);
    }
    // Cross → same: recipient now gets the same currency as send
    else if (wasCross && !willBeCross) {
      reverseShimmerRef.current = true;
      pendingSendCurrencyRef.current = sendCurrency; // keep same send currency, just change receive
      setCrossTransition('collapsing');
      setTimeout(() => {
        setCurrency(code);
        setReceiveAmount(null);
        pendingSendCurrencyRef.current = null;
        reverseShimmerRef.current = false;
        setCrossTransition('shimmer');
        setTimeout(() => {
          setCrossTransition('idle');
          setTimeout(() => {
            const input = bodyRef.current?.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
            input?.focus();
          }, 100);
        }, 600);
      }, 500);
    }
    // Cross → different cross
    else {
      setCurrency(code);
      if (amount !== null && amount !== 0) {
        setReceiveAmount(Math.round(convertToHomeCurrency(amount, sendCurrency, code, rates) * 100) / 100);
      }
    }
  }, [amount, sendCurrency, recipientCurrency, rates]);

  // Show cue after mount when on amount step
  useEffect(() => {
    if (step === 'amount' && !prefillAmount) {
      const focusTimer = setTimeout(() => {
        const input = bodyRef.current?.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
        input?.focus();
      }, 400);

      const cueTimer = setTimeout(() => {
        setCueVisible(true);
      }, 500);

      return () => {
        clearTimeout(focusTimer);
        clearTimeout(cueTimer);
      };
    }
  }, [step, prefillAmount]);

  // Handle back button — slide first, then clean up after animation
  const handleBack = useCallback(() => {
    if (step === 'amount') {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      // Start the slide animation
      setStep('recipient');
      onStepChange?.('recipient');
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      setCueVisible(false);

      // Scroll recipient panel back to top
      const panel = document.querySelector('.send-flow__panel:first-child');
      if (panel) panel.scrollTop = 0;

      // Clear amount step state after the slide animation completes
      setTimeout(() => {
        setSelectedRecipient(null);
        setAmount(null);
        setReceiveAmount(null);
        setSendCurrency(defaultCurrency);
        setCurrencySheetTarget(null);
        setCrossTransition('idle');
        setButtonState('disabled');
      }, 600);
    }
  }, [step]);

  return (
    <div className={`send-flow${isSearching ? ' send-flow--searching' : ''}`}>
      <FlowHeader
        onClose={onClose}
        onBack={step === 'amount' ? handleBack : undefined}
        forceClose={forceClose}
        trailing={step === 'recipient' ? (
          <>
            <GlassPill className="ios-glass-btn--accent">
              <span className="ios-glass-btn__icon"><Plus size={16} /></span>
              <span className="ios-glass-btn__label">{t('common.add')}</span>
            </GlassPill>
            <GlassCircle ariaLabel="Scan">
              <span className="ios-glass-btn__icon"><ScanSparkle size={24} /></span>
            </GlassCircle>
          </>
        ) : step === 'amount' && isCrossCurrency ? (
          <GlassPill>
            <span className="flow-header__rate-clip">
              <span className="flow-header__rate-flipper">
                <span className="flow-header__rate-line">
                  <span className="ios-glass-btn__label" style={{ fontSize: 14 }}>
                    {t('send.rate', { from: sendCurrency, rate: crossRate, to: recipientCurrency })}
                  </span>
                </span>
                <span className="flow-header__rate-line">
                  <span className="ios-glass-btn__label" style={{ fontSize: 14 }}>
                    Guaranteed for 3h
                  </span>
                </span>
              </span>
            </span>
            <span className="ios-glass-btn__icon" style={{ transform: 'scale(0.75)' }}><ChevronRight size={16} /></span>
          </GlassPill>
        ) : undefined}
      />

      <div className={`send-flow__track${step === 'amount' ? ' send-flow__track--step-amount' : ''}${isAnimating ? ' send-flow__track--animating' : ''}`}>
        {/* Step 1: Recipient */}
        <div className="send-flow__panel">
        <div className="send-flow__body" ref={step === 'recipient' ? bodyRef : undefined}>
          <>
            {/* Title */}
            <h1 className="send-flow__title np-display np-text-display-small">Who are you<br />sending to?</h1>

            {/* Recents */}
            <div className="send-flow__recents-section">
              <p className="np-text-title-group" style={{ margin: '0 0 8px' }}>{t('send.recents')}</p>
              <div className="send-flow__recents">
                {activeRecentContacts.slice(0, 6).map((contact, i) => {
                  const isMyAccount = activeRecipients.some((r) => r.name === contact.name && r.isMyAccount);
                  const contactImg = isMyAccount ? PROFILE_AVATAR : contact.imgSrc;
                  return (
                    <RecentContactCard
                      key={i}
                      name={contact.name}
                      subtitle={contact.subtitle}
                      imgSrc={contactImg}
                      initials={contact.initials}
                      badge={contact.badge}
                      onClick={() => handleSelectRecentContact(contact)}

                    />
                  );
                })}
              </div>
            </div>

            {/* Filter + Search */}
            <div className="send-flow__all-section">
            <div className="send-flow__filters">
              <Chips
                chips={filterChips}
                selected={selectedFilter}
                onChange={({ selectedValue }: { isEnabled: boolean; selectedValue: string | number }) => setSelectedFilter(String(selectedValue))}
              />
              <div className="send-flow__filter-spacer" />
              <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Search size={16} /> }}>{t('recipients.search')}</Button>
            </div>

            {/* Recipient list or empty state */}
            {filteredRecipients.length > 0 ? (
              <ul className="send-flow__list">
                {filteredRecipients.map((r) => {
                  const badge = getBadge(r);
                  let imgSrc: string | undefined;
                  let avatarChildren: string | undefined;

                  if (r.isMyAccount) {
                    imgSrc = PROFILE_AVATAR;
                  } else if (r.avatarType === 'photo') {
                    imgSrc = getAvatarSrc(r);
                  } else {
                    avatarChildren = r.initials;
                  }

                  const avatarMedia = avatarChildren !== undefined ? (
                    <ListItem.AvatarView key={r.id} size={48} badge={badge} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                      {avatarChildren}
                    </ListItem.AvatarView>
                  ) : (
                    <ListItem.AvatarView key={r.id} size={48} imgSrc={imgSrc} profileName={r.name} badge={badge} />
                  );

                  return (
                    <ListItem
                      key={r.id}
                      title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{r.name}</span>}
                      subtitle={r.subtitle}
                      media={avatarMedia}
                      control={<ListItem.Navigation onClick={() => handleSelectRecipient(r)} />}
                    />
                  );
                })}
              </ul>
            ) : searchQuery.trim() ? (
              <RecipientSearchEmpty query={searchQuery.trim()} />
            ) : null}
            </div>
          </>
        </div>
        </div>

        {/* Step 2: Amount */}
        <div className="send-flow__panel">
        <div className="send-flow__body" ref={step === 'amount' ? bodyRef : undefined}>
          {/* === CROSS-TOP: rate pill + send input + divider === */}
          {/* Expands from 0 height during revealing, pushing the gets input down with bounce */}
          {selectedRecipient && (crossTransition === 'revealing' || crossTransition === 'collapsing' || (isCrossCurrency && crossTransition === 'idle')) && (
            <div ref={crossTopRef} className={`send-flow__cross-top${crossTransition === 'revealing' ? ' send-flow__cross-top--revealing' : crossTransition === 'collapsing' ? ' send-flow__cross-top--collapsing' : ' send-flow__cross-top--expanded'}`}>
              {/* You send input */}
              <div className="send-flow__send-input">
                <ExpressiveMoneyInput
                  label={<span style={{ whiteSpace: 'nowrap' }}>{t('send.youSend')}</span>}
                  currency={sendCurrency}
                  amount={amount}
                  onAmountChange={handleSendAmountChange}
                  currencySelector={{
                    customRender: ({ id, labelId }) => (
                      <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                        <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setCurrencySheetTarget(currencySheetTarget === 'send' ? null : 'send');
                          }}
                          addonStart={{ type: 'avatar', value: [{ asset: <Flag code={sendCurrency} loading="eager" /> }] }}
                          addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                        >
                          {sendCurrency}
                        </Button>
                      </div>
                    ),
                  }}
                  showChevron={!sendInputFocused && !inputFocused && !amount && !receiveAmount}
                  onFocusChange={setSendInputFocused}
                />
                <p className="convert-flow__available np-text-body-default">
                  Amount available: <button type="button" className="convert-flow__available-link" onClick={() => handleSendAmountChange(sendCurrencyData?.balance ?? 0)}>{availableBalance}</button>
                </p>
              </div>

              {/* Cross divider */}
              <div className={`send-flow__cross-divider${sendInputFocused || inputFocused ? ' send-flow__cross-divider--visible' : ''}`} />
            </div>
          )}

          {/* === SLIDE WRAPPER: gets + bottom section + button — slides down via Web Animations API === */}
          <div ref={slideWrapperRef} className="send-flow__slide-wrapper">

          {/* Gets input — always visible, physically slides down when cross-top appears */}
          {selectedRecipient && (
          <div className="send-flow__gets-wrapper">
            <ExpressiveMoneyInput
              label={<span style={{ whiteSpace: 'nowrap' }}>{t(inputFocused ? 'send.recipientGetsExactly' : 'send.recipientGets', { name: selectedRecipient.name })}</span>}
              currency={recipientCurrency}
              amount={isCrossCurrency && crossTransition !== 'shimmer' ? receiveAmount : amount}
              onAmountChange={isCrossCurrency && crossTransition !== 'shimmer' ? handleReceiveAmountChange : handleAmountChange}
              currencySelector={{
                customRender: ({ id, labelId }) => (
                  <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                    <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setCurrencySheetTarget(currencySheetTarget === 'receive' ? null : 'receive');
                      }}
                      addonStart={{
                        type: 'avatar',
                        value: selectedRecipient.avatarUrl
                          ? [{ imgSrc: selectedRecipient.avatarUrl }, { asset: <Flag code={recipientCurrency} loading="eager" /> }]
                          : [{ style: selectedRecipient.initials ? { backgroundColor: 'transparent' } as React.CSSProperties : accountAvatarStyle, asset: selectedRecipient.initials ? <span style={{ fontSize: 10, fontWeight: 600 }}>{selectedRecipient.initials}</span> : <WiseLogoIcon /> }, { asset: <Flag code={recipientCurrency} loading="eager" /> }],
                      }}
                      addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                    >
                      {recipientCurrency}
                    </Button>
                  </div>
                ),
              }}
              showChevron={!inputFocused && !sendInputFocused && !amount && !receiveAmount}
              onFocusChange={setInputFocused}
            />

            {/* Amount available — show below gets input in same-currency mode, shimmer, and reverse-collapsing */}
            {(!isCrossCurrency || crossTransition === 'shimmer' || (crossTransition === 'collapsing' && reverseShimmerRef.current)) && (
              <p className="convert-flow__available np-text-body-default">
                Amount available: <button type="button" className="convert-flow__available-link" onClick={() => {
                  const bal = allCurrencies.find((c) => c.code === recipientCurrency)?.balance ?? 0;
                  if (isCrossCurrency && crossTransition !== 'shimmer') {
                    handleReceiveAmountChange(bal);
                  } else {
                    handleAmountChange(bal);
                  }
                }}>{ (() => { const c = allCurrencies.find((c) => c.code === recipientCurrency); return c ? formatBalance(c) : `0.00 ${recipientCurrency}`; })() }</button>
              </p>
            )}
          </div>
          )}

          {/* === SAME-CURRENCY BOTTOM: divider + list item / shimmer === */}
          {selectedRecipient && ((!isCrossCurrency && crossTransition === 'idle') || crossTransition === 'shimmer' || (crossTransition === 'collapsing' && reverseShimmerRef.current)) && (
            <div ref={sameCurrencyBottomRef} className="send-flow__same-bottom">
              {/* List item — same-currency idle only */}
              {!isCrossCurrency && crossTransition === 'idle' && (
                <div className="send-flow__you-send" onClick={() => setCurrencySheetTarget(currencySheetTarget === 'send' ? null : 'send')} style={{ cursor: 'pointer' }}>
                  <ListItem
                    title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('send.youSend')}</span>}
                    subtitle={<span className="np-text-body-large" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{sendCurrencyName}</span>}
                    media={
                      <ListItem.AvatarView size={40}>
                        <Flag code={sendCurrency} loading="eager" />
                      </ListItem.AvatarView>
                    }
                    control={
                      <Button v2 size="sm" priority="secondary">{t('send.change')}</Button>
                    }
                  />
                </div>
              )}

              {/* Shimmer skeleton — visible during shimmer phase and reverse-collapsing */}
              {(crossTransition === 'shimmer' || (crossTransition === 'collapsing' && reverseShimmerRef.current)) && (
                <div className="send-flow__shimmer-row">
                  <div className="send-flow__shimmer-el send-flow__shimmer-circle" />
                  <div className="send-flow__shimmer-bars">
                    <div className="send-flow__shimmer-el send-flow__shimmer-bar send-flow__shimmer-bar--sm" />
                    <div className="send-flow__shimmer-el send-flow__shimmer-bar send-flow__shimmer-bar--lg" />
                  </div>
                  <div className="send-flow__shimmer-el send-flow__shimmer-pill" />
                </div>
              )}
            </div>
          )}

          </div>{/* end slide-wrapper */}

          {/* Continue button — outside slide-wrapper so it doesn't move during cross-currency transition */}
          {selectedRecipient && (
            <div className="send-flow__continue" style={isCrossCurrency ? { marginTop: 40 } : undefined}>
              <ButtonCue
                visible={cueVisible && buttonState === 'disabled' && crossTransition === 'idle'}
                hint={
                  <>
                    <InfoCircle size={16} />
                    <span className="np-text-body-default">
                      {isCrossCurrency ? (() => {
                        const text = t('send.enterEitherAmount');
                        const idx = text.indexOf('either amount');
                        if (idx === -1) return text;
                        return <>{text.slice(0, idx)}<span style={{ fontWeight: 600 }}>either amount</span>{text.slice(idx + 'either amount'.length)}</>;
                      })() : t('send.enterAmount')}
                    </span>
                  </>
                }
              >
                <Button
                  v2
                  size="lg"
                  priority="primary"
                  disabled={buttonState !== 'active' || crossTransition !== 'idle'}
                  loading={buttonState === 'loading' || crossTransition === 'shimmer'}
                  className={(buttonState === 'loading' || crossTransition === 'shimmer') ? 'send-flow__btn-loading' : undefined}
                  block
                >
                  {t('send.continue')}
                </Button>
              </ButtonCue>
            </div>
          )}

        </div>
        </div>
      </div>

      {/* Currency sheet — full screen sheet for send/receive currency selection */}
      <CurrencySheet
        open={currencySheetTarget !== null}
        onClose={() => setCurrencySheetTarget(null)}
        onSelect={(code) => currencySheetTarget === 'send' ? handleSelectSendCurrency(code) : handleSelectReceiveCurrency(code)}
        selectedCode={currencySheetTarget === 'send' ? sendCurrency : recipientCurrency}
        recentCodes={recentCurrencyCodes}
      />
    </div>
  );
}
