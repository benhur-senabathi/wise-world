import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { FlowNavigation, Logo, Button, AvatarView, ExpressiveMoneyInput, Chips, ListItem, InputGroup, Input, Size } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, Search, CrossCircleFill, Plus, ScanSparkle, Check, Savings, Suitcase } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { ButtonCue } from '../components/ButtonCue';
import { RecentContactCard } from '../components/RecentContactCard';
import { RecipientSearchEmpty } from '../components/RecipientSearchEmpty';
import { useLanguage } from '../context/Language';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLiveRates } from '../context/LiveRates';
import { convertToHomeCurrency, currencyMeta } from '../data/currency-rates';
import { formatBalance } from '../data/balances';
import { recipients, businessRecipients, recentContacts, businessRecentContacts, getAvatarSrc, getBadge, type Recipient } from '../data/recipients';
import { currencies } from '../data/currencies';
import { businessCurrencies } from '../data/business-currencies';
import { groupCurrencies } from '../data/taxes-data';
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
};

export function SendFlow({ defaultCurrency, accountLabel, jar, accountStyle, onClose, onStepChange, accountType, avatarUrl, initials, recipient: initialRecipient, prefillAmount, prefillReceiveAmount, startStep = 'recipient', forcedReceiveCurrency }: Props) {
  const { t } = useLanguage();
  const { consumerName } = usePrototypeNames();
  const rates = useLiveRates();

  const isBusiness = accountType === 'business';
  const isGroup = jar === 'taxes';
  const avatarStyle = isBusiness
    ? { backgroundColor: '#163300', color: '#9fe870' }
    : undefined;

  const [step, setStep] = useState<'recipient' | 'amount'>(initialRecipient ? 'amount' : startStep);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientInfo | null>(initialRecipient ?? null);
  const [currency, setCurrency] = useState(initialRecipient?.badgeFlagCode ?? defaultCurrency);
  const [sendCurrency, setSendCurrency] = useState(defaultCurrency);
  const [currencyDropdownTarget, setCurrencyDropdownTarget] = useState<'send' | 'receive' | null>(null);
  const [userOverrodeReceiveCurrency, setUserOverrodeReceiveCurrency] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const [crossTransition, setCrossTransition] = useState<'idle' | 'shimmer' | 'revealing' | 'collapsing'>('idle');
  const reverseShimmerRef = useRef(false);
  const pendingSendCurrencyRef = useRef<string | null>(null);
  const sameCurrencyBottomRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const currencyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const currencyDropdownOpen = currencyDropdownTarget !== null;
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [amount, setAmount] = useState<number | null>(prefillAmount ?? null);
  const [receiveAmount, setReceiveAmount] = useState<number | null>(prefillReceiveAmount ?? null);
  const [activeInput, setActiveInput] = useState<'send' | 'receive'>('send');
  const [buttonState, setButtonState] = useState<ButtonState>(prefillAmount ? 'active' : 'disabled');
  const [cueVisible, setCueVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [sendInputFocused, setSendInputFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const hasAmountRef = useRef(false);
  const crossTopRef = useRef<HTMLDivElement>(null);
  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const slideAnimRef = useRef<Animation | null>(null);

  // Open currency dropdown positioned below the trigger button
  const openCurrencyDropdown = useCallback((target: 'send' | 'receive', triggerEl: HTMLElement) => {
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    const bodyRect = bodyEl.getBoundingClientRect();
    const triggerRect = triggerEl.getBoundingClientRect();
    setDropdownPos({
      top: triggerRect.bottom - bodyRect.top + 4,
      left: triggerRect.left - bodyRect.left,
    });
    setCurrencyDropdownTarget(target);
    setCurrencySearchQuery('');
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

  const handleClearSearch = () => {
    if (searchQuery) {
      setSearchQuery('');
      searchRef.current?.focus();
    } else {
      setSearchQuery('');
      setSearchActive(false);
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  // Find balance for the sending currency
  const allCurrencies = [...(isGroup ? groupCurrencies : []), ...(isBusiness ? businessCurrencies : currencies)];
  const sendCurrencyData = allCurrencies.find((c) => c.code === sendCurrency);
  const availableBalance = sendCurrencyData ? formatBalance(sendCurrencyData) : `0.00 ${sendCurrency}`;

  // Currency name for "You send" section
  const sendCurrencyName = sendCurrencyData?.name ?? sendCurrency;

  const avatar = avatarUrl ? (
    <AvatarView size={48} imgSrc={avatarUrl} />
  ) : (
    <AvatarView size={48} style={avatarStyle}>
      {initials}
    </AvatarView>
  );

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
    setCurrencyDropdownTarget(null);
    setCurrencySearchQuery('');
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

  // Close currency dropdown on click outside
  useEffect(() => {
    if (!currencyDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target as Node)) {
        setCurrencyDropdownTarget(null);
        setCurrencySearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [currencyDropdownOpen]);

  // All supported currencies for the popover
  const allSupportedCurrencies = useMemo(() =>
    Object.values(currencyMeta).sort((a, b) => a.code.localeCompare(b.code)),
  []);

  // Recent = account currencies (ones the user has)
  const recentCurrencyCodes = useMemo(() =>
    allCurrencies.map((c) => c.code),
  [allCurrencies]);

  // Filtered by search — exclude currencies already in recents
  const filteredAllCurrencies = useMemo(() => {
    const recentSet = new Set(recentCurrencyCodes);
    const q = currencySearchQuery.toLowerCase().trim();
    if (!q) return allSupportedCurrencies.filter((c) => !recentSet.has(c.code));
    return allSupportedCurrencies.filter(
      (c) => !recentSet.has(c.code) && (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    );
  }, [currencySearchQuery, allSupportedCurrencies, recentCurrencyCodes]);

  const filteredRecentCurrencies = useMemo(() => {
    const q = currencySearchQuery.toLowerCase().trim();
    if (!q) return recentCurrencyCodes;
    return recentCurrencyCodes.filter((code) => {
      const meta = currencyMeta[code];
      return meta && (meta.code.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q));
    });
  }, [currencySearchQuery, recentCurrencyCodes]);

  const handleSelectSendCurrency = useCallback((code: string) => {
    const wasCross = sendCurrency !== recipientCurrency;
    const wasNotCross = !wasCross;
    const willBeCross = code !== recipientCurrency;

    setCurrencyDropdownTarget(null);
    setCurrencySearchQuery('');

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
    setCurrencyDropdownTarget(null);
    setCurrencySearchQuery('');

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
      setSearchQuery('');
      setSearchActive(false);

      // Scroll recipient panel back to top
      const panel = document.querySelector('.send-flow__panel:first-child');
      if (panel) panel.scrollTop = 0;

      // Clear amount step state after the slide animation completes
      setTimeout(() => {
        setSelectedRecipient(null);
        setAmount(null);
        setReceiveAmount(null);
        setSendCurrency(defaultCurrency);
        setCurrencyDropdownTarget(null);
        setCurrencySearchQuery('');
        setCrossTransition('idle');
        setButtonState('disabled');
      }, 600);
    }
  }, [step]);

  const steps = [
    { label: t('send.recipient'), ...(step === 'amount' ? { onClick: handleBack } : {}) },
    { label: t('send.amount') },
    { label: t('send.review') },
    { label: t('send.pay') },
  ];

  return (
    <div className={`send-flow${isSearching ? ' send-flow--searching' : ''}`}>
      <FlowNavigation
        activeStep={step === 'recipient' ? 0 : 1}
        steps={steps}
        onClose={onClose}
        onGoBack={step === 'amount' ? handleBack : undefined}
        avatar={avatar}
        logo={<Logo />}
      />

      <div className={`send-flow__track${step === 'amount' ? ' send-flow__track--step-amount' : ''}${isAnimating ? ' send-flow__track--animating' : ''}`}>
        {/* Step 1: Recipient */}
        <div className="send-flow__panel">
        <div className="send-flow__body send-flow__body--wide" ref={step === 'recipient' ? bodyRef : undefined}>
          <>
            {/* Title */}
            <h1 className="send-flow__title np-display np-text-display-small">{t('send.whoSendingTo')}</h1>

            {/* Add and Upload buttons */}
            <div className="send-flow__add-recipient">
              <Button v2 size="md" priority="primary" addonStart={{ type: 'icon', value: <Plus size={16} /> }}>{t('common.add')}</Button>
              <Button v2 size="md" priority="secondary" addonStart={{ type: 'icon', value: <ScanSparkle size={16} /> }}>{t('recipients.upload')}</Button>
            </div>

            {/* Recents */}
            <div className="send-flow__recents-section">
              <p className="send-flow__recents-label np-text-body-large" style={{ fontWeight: 600, margin: 0, color: 'var(--color-content-secondary)' }}>{t('send.recents')}</p>
              <div className="send-flow__recents">
                {activeRecentContacts.slice(0, 5).map((contact, i) => {
                  const isMyAccount = activeRecipients.some((r) => r.name === contact.name && r.isMyAccount);
                  const contactImg = isMyAccount ? PROFILE_AVATAR : (contact as any).imgSrc;
                  return (
                    <RecentContactCard
                      key={i}
                      name={contact.name}
                      subtitle={contact.subtitle}
                      imgSrc={contactImg}
                      initials={(contact as any).initials}
                      badge={contact.badge}
                      onClick={() => handleSelectRecentContact(contact)}
                      tooltipPosition="top"
                    />
                  );
                })}
              </div>
            </div>

            {/* All accounts */}
            <div className="send-flow__all-section">
              <p className="send-flow__all-label np-text-body-large" style={{ fontWeight: 600, margin: '0 0 8px', color: 'var(--color-content-secondary)' }}>{t('send.allAccounts')}</p>

            <div className="send-flow__search">
              <InputGroup
                addonStart={{
                  content: <Search size={24} />,
                  initialContentWidth: 24,
                }}
                addonEnd={isSearching ? {
                  content: (
                    <button
                      type="button"
                      className="recipients-page__search-clear"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                    >
                      <CrossCircleFill size={16} />
                    </button>
                  ),
                  initialContentWidth: 16,
                  interactive: true,
                } : undefined}
              >
                <Input
                  ref={searchRef}
                  role="searchbox"
                  inputMode="search"
                  shape="pill"
                  size={Size.MEDIUM}
                  placeholder={t('recipients.searchPlaceholder')}
                  value={searchQuery}
                  onFocus={() => setSearchActive(true)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length > 0) setSearchActive(true);
                  }}
                />
              </InputGroup>
            </div>

            <div className="send-flow__filters">
              <Chips
                chips={filterChips}
                selected={selectedFilter}
                onChange={({ selectedValue }: { isEnabled: boolean; selectedValue: string | number }) => setSelectedFilter(String(selectedValue))}
              />
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
              {/* Rate pill — fades in with extra delay */}
              <div className={`send-flow__rate-pill${crossTransition === 'revealing' ? ' send-flow__rate-pill--fadein' : ''}`}>
                <Button v2 size="md" priority="secondary-neutral" className="convert-flow__rate-btn" addonEnd={{ type: 'icon', value: <span style={{ color: 'var(--color-content-primary)' }}><ChevronRight size={16} /></span> }}>
                  {t('send.rate', { from: sendCurrency, rate: crossRate, to: recipientCurrency })}
                </Button>
              </div>

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
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (currencyDropdownTarget === 'send') { setCurrencyDropdownTarget(null); } else { openCurrencyDropdown('send', e.currentTarget as HTMLElement); } }}
                          addonStart={{ type: 'avatar', value: [{ asset: <Flag code={sendCurrency} loading="eager" /> }] }}
                          addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                        >
                          {sendCurrency}
                        </Button>
                      </div>
                    ),
                  }}
                  showChevron={!sendInputFocused}
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
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (currencyDropdownTarget === 'receive') { setCurrencyDropdownTarget(null); } else { openCurrencyDropdown('receive', e.currentTarget as HTMLElement); } }}
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
              showChevron={!inputFocused}
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
              <div className="send-flow__divider" />

              {/* List item — same-currency idle only */}
              {!isCrossCurrency && crossTransition === 'idle' && (
                <div className="send-flow__you-send" style={{ position: 'relative', zIndex: currencyDropdownTarget === 'send' ? 10 : undefined }} onClick={() => { setCurrencyDropdownTarget(currencyDropdownTarget === 'send' ? null : 'send'); setCurrencySearchQuery(''); }}>
                  <ListItem
                    title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('send.youSend')}</span>}
                    subtitle={<span className="np-text-body-large" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{sendCurrencyName}</span>}
                    media={
                      <ListItem.AvatarView size={48}>
                        <Flag code={sendCurrency} loading="eager" />
                      </ListItem.AvatarView>
                    }
                    control={
                      <Button v2 size="sm" priority="secondary">{t('send.change')}</Button>
                    }
                  />
                  {currencyDropdownTarget === 'send' && (
                    <div className="send-flow__currency-popover send-flow__currency-popover--inline" ref={currencyDropdownRef} onClick={(e) => e.stopPropagation()}>
                      <div className="currency-dropdown__search">
                        <Search size={16} />
                        <input
                          type="text"
                          className="currency-dropdown__search-input"
                          placeholder={t('send.currencySearchPlaceholder')}
                          value={currencySearchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrencySearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="send-flow__currency-popover-list">
                        {filteredRecentCurrencies.length > 0 && (
                          <>
                            <p className="send-flow__currency-section-label np-text-body-default">{t('send.recentCurrencies')}</p>
                            <div className="send-flow__currency-section-divider" />
                            {filteredRecentCurrencies.map((code) => {
                              const meta = currencyMeta[code];
                              if (!meta) return null;
                              return (
                                <button key={code} type="button" className="send-flow__currency-option" onClick={() => handleSelectSendCurrency(code)}>
                                  <AvatarView size={24}><Flag code={code} intrinsicSize={24} loading="eager" /></AvatarView>
                                  <span className="send-flow__currency-option-code np-text-body-large">{code}</span>
                                  <span className="send-flow__currency-option-name np-text-body-default">{meta.name}</span>
                                  {sendCurrency === code && <Check size={16} className="send-flow__currency-option-check" />}
                                </button>
                              );
                            })}
                          </>
                        )}
                        <p className="send-flow__currency-section-label np-text-body-default">{t('send.allCurrencies')}</p>
                        <div className="send-flow__currency-section-divider" />
                        {filteredAllCurrencies.map((meta) => (
                          <button key={meta.code} type="button" className="send-flow__currency-option" onClick={() => handleSelectSendCurrency(meta.code)}>
                            <AvatarView size={24}><Flag code={meta.code} intrinsicSize={24} loading="eager" /></AvatarView>
                            <span className="send-flow__currency-option-code np-text-body-large">{meta.code}</span>
                            <span className="send-flow__currency-option-name np-text-body-default">{meta.name}</span>
                            {sendCurrency === meta.code && <Check size={16} className="send-flow__currency-option-check" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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

          {/* Continue button — persists across all transition phases */}
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
          </div>{/* end slide-wrapper */}

          {/* Currency dropdown popover — for currency selector buttons (not the Change button which uses inline dropdown) */}
          {selectedRecipient && currencyDropdownOpen && dropdownPos && (currencyDropdownTarget === 'receive' || (currencyDropdownTarget === 'send' && isCrossCurrency)) && (
            <div className="send-flow__currency-popover" ref={currencyDropdownRef} onClick={(e) => e.stopPropagation()} style={{ top: dropdownPos.top, left: dropdownPos.left }}>
              <div className="currency-dropdown__search">
                <Search size={16} />
                <input
                  type="text"
                  className="currency-dropdown__search-input"
                  placeholder={t('send.currencySearchPlaceholder')}
                  value={currencySearchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrencySearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="send-flow__currency-popover-list">
                {filteredRecentCurrencies.length > 0 && (
                  <>
                    <p className="send-flow__currency-section-label np-text-body-default">{t('send.recentCurrencies')}</p>
                    <div className="send-flow__currency-section-divider" />
                    {filteredRecentCurrencies.map((code) => {
                      const meta = currencyMeta[code];
                      if (!meta) return null;
                      const isSelected = currencyDropdownTarget === 'send' ? sendCurrency === code : recipientCurrency === code;
                      return (
                        <button key={code} type="button" className="send-flow__currency-option" onClick={() => currencyDropdownTarget === 'receive' ? handleSelectReceiveCurrency(code) : handleSelectSendCurrency(code)}>
                          <AvatarView size={24}><Flag code={code} intrinsicSize={24} loading="eager" /></AvatarView>
                          <span className="send-flow__currency-option-code np-text-body-large">{code}</span>
                          <span className="send-flow__currency-option-name np-text-body-default">{meta.name}</span>
                          {isSelected && <Check size={16} className="send-flow__currency-option-check" />}
                        </button>
                      );
                    })}
                  </>
                )}

                <p className="send-flow__currency-section-label np-text-body-default">{t('send.allCurrencies')}</p>
                <div className="send-flow__currency-section-divider" />
                {filteredAllCurrencies.map((meta) => {
                  const isSelected = currencyDropdownTarget === 'send' ? sendCurrency === meta.code : recipientCurrency === meta.code;
                  return (
                    <button key={meta.code} type="button" className="send-flow__currency-option" onClick={() => currencyDropdownTarget === 'receive' ? handleSelectReceiveCurrency(meta.code) : handleSelectSendCurrency(meta.code)}>
                      <AvatarView size={24}><Flag code={meta.code} intrinsicSize={24} loading="eager" /></AvatarView>
                      <span className="send-flow__currency-option-code np-text-body-large">{meta.code}</span>
                      <span className="send-flow__currency-option-name np-text-body-default">{meta.name}</span>
                      {isSelected && <Check size={16} className="send-flow__currency-option-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
