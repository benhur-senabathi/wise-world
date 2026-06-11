import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FlowNavigation, Logo, Button, AvatarView, ExpressiveMoneyInput, Chips, ListItem, InputGroup, Input, Size } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, Search, CrossCircleFill, Plus, ScanSparkle, Check, Padlock } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { ButtonCue } from '../components/ButtonCue';
import { RecentContactCard } from '../components/RecentContactCard';
import { RecipientSearchEmpty } from '../components/RecipientSearchEmpty';
import { WiseLogoIcon } from '../components/WiseLogoIcon';
import { useLanguage } from '../context/Language';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLiveRates } from '../context/LiveRates';
import { convertToHomeCurrency, currencyMeta } from '@shared/data/currency-rates';
import { formatBalance } from '@shared/data/balances';
import { recipients, businessRecipients, recentContacts, businessRecentContacts, getAvatarSrc, getBadge, type Recipient } from '@shared/data/recipients';
import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { accountRegistry } from '@shared/data/account-registry';
import type { AccountType } from '@shared/data/account-registry';
import './SendFlow.css';

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
  group?: string;
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

export function SendFlow({ defaultCurrency, accountLabel, group, accountStyle, onClose, onStepChange, accountType, avatarUrl, initials, recipient: initialRecipient, prefillAmount, prefillReceiveAmount, startStep = 'recipient', forcedReceiveCurrency, forceClose }: Props) {
  const { t } = useLanguage();
  const { consumerName } = usePrototypeNames();
  const rates = useLiveRates();

  const isBusiness = accountType === 'business';
  const isGroup = !!group;

  const [step, setStep] = useState<'recipient' | 'amount'>(initialRecipient ? 'amount' : startStep);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientInfo | null>(initialRecipient ?? null);
  const [currency, setCurrency] = useState(initialRecipient?.badgeFlagCode ?? defaultCurrency);
  const [sendCurrency, setSendCurrency] = useState(defaultCurrency);
  const [currencyDropdownTarget, setCurrencyDropdownTarget] = useState<'send' | 'receive' | null>(null);
  const [userOverrodeReceiveCurrency, setUserOverrodeReceiveCurrency] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownOpen = currencyDropdownTarget !== null;
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [amount, setAmount] = useState<number | null>(prefillAmount ?? null);
  const [receiveAmount, setReceiveAmount] = useState<number | null>(prefillReceiveAmount ?? null);
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

  // Open currency dropdown positioned below the trigger button
  const openCurrencyDropdown = useCallback((target: 'send' | 'receive', triggerEl: HTMLElement) => {
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    const bodyRect = bodyEl.getBoundingClientRect();
    const triggerRect = triggerEl.getBoundingClientRect();
    setDropdownPos({
      top: triggerRect.bottom - bodyRect.top + 4,
      right: bodyRect.right - triggerRect.right,
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
  const PROFILE_AVATAR = isBusiness ? '/berry-design-logo.png' : avatarUrl;

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

  // Find balance for the sending currency — resolve from registry
  const resolveAccountCurrencies = () => {
    if (group) {
      const match = accountRegistry.find((a) => a.subPageType === `${group}-account`);
      if (match) return match.getCurrencies();
    }
    const matchByStyle = accountRegistry.find((a) => a.style.iconName === accountStyle.iconName && a.style.color === accountStyle.color);
    if (matchByStyle && matchByStyle.subPageType !== 'account') return matchByStyle.getCurrencies();
    return isBusiness ? businessCurrencies : currencies;
  };
  const allCurrencies = resolveAccountCurrencies();

  // Currency name for "You send" section

  const avatar = avatarUrl ? (
    <AvatarView size={48} imgSrc={avatarUrl} />
  ) : (
    <AvatarView size={48}>
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
    const willBeCross = code !== recipientCurrency;

    setCurrencyDropdownTarget(null);
    setCurrencySearchQuery('');
    setSendCurrency(code);

    if (!wasCross && willBeCross && amount !== null && amount !== 0) {
      // Same → cross: user's typed value stays in "To" (receiveAmount), compute "From"
      setReceiveAmount(amount);
      setAmount(Math.round(convertToHomeCurrency(amount, recipientCurrency, code, rates) * 100) / 100);
    } else if (wasCross && willBeCross && amount !== null && amount !== 0) {
      // Cross → different cross: recalculate "To" from "From" value
      setReceiveAmount(Math.round(convertToHomeCurrency(amount, code, recipientCurrency, rates) * 100) / 100);
    } else if (!willBeCross) {
      // Cross → same: keep amount in "To", clear receiveAmount
      if (receiveAmount !== null && receiveAmount !== 0) {
        setAmount(receiveAmount);
      }
      setReceiveAmount(null);
    }
  }, [amount, receiveAmount, sendCurrency, recipientCurrency, rates]);

  // Handle selecting a receive currency (from the gets input currency selector)
  const handleSelectReceiveCurrency = useCallback((code: string) => {
    const wasCross = sendCurrency !== recipientCurrency;
    const willBeCross = sendCurrency !== code;

    setUserOverrodeReceiveCurrency(true);
    setCurrencyDropdownTarget(null);
    setCurrencySearchQuery('');
    setCurrency(code);

    if (!wasCross && willBeCross && amount !== null && amount !== 0) {
      // Same → cross: user's typed value stays in "To" (receiveAmount), compute "From"
      setReceiveAmount(amount);
      setAmount(Math.round(convertToHomeCurrency(amount, code, sendCurrency, rates) * 100) / 100);
    } else if (willBeCross && amount !== null && amount !== 0) {
      // Cross → different cross: recalculate receiveAmount from the From value
      setReceiveAmount(Math.round(convertToHomeCurrency(amount, sendCurrency, code, rates) * 100) / 100);
    } else if (!willBeCross) {
      setReceiveAmount(null);
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
        logo={
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Go to home"
          >
            <Logo />
          </button>
        }
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
          {/* === FROM section: always rendered, amount input fades in/out for cross-currency === */}
          {selectedRecipient && (
            <>
              {/* Rate pill — always rendered for layout, fades in/out */}
              <div className={`send-flow__rate-pill${isCrossCurrency ? '' : ' send-flow__rate-pill--hidden'}`}>
                <button type="button" className="send-flow__rate-btn">
                  <Padlock size={16} />
                  <span className="send-flow__rate-divider" />
                  <span className="send-flow__rate-clip">
                    <span className="send-flow__rate-flipper">
                      <span className="send-flow__rate-line">{t('send.rate', { from: sendCurrency, rate: crossRate, to: recipientCurrency })}</span>
                      <span className="send-flow__rate-line">Guaranteed for 3h</span>
                    </span>
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* From label + currency pill row */}
              <div className="send-flow__from-row" style={{ position: 'relative', zIndex: currencyDropdownTarget === 'send' ? 10 : undefined }}>
                <span className="send-flow__from-label">{t('send.from')}</span>
                <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (currencyDropdownTarget === 'send') { setCurrencyDropdownTarget(null); } else { openCurrencyDropdown('send', e.currentTarget as HTMLElement); } }}
                  addonStart={{ type: 'avatar', value: [{ asset: <Flag code={sendCurrency} loading="eager" /> }] }}
                  addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                >
                  <span style={{ color: 'var(--color-content-secondary)' }}>{sendCurrency}</span>
                </Button>
              </div>

              {/* From amount input — fades in/out when switching to/from cross-currency */}
              <div className={`send-flow__from-amount${isCrossCurrency ? ' send-flow__from-amount--visible' : ''}`}>
                <ExpressiveMoneyInput
                  label={undefined}
                  currency={sendCurrency}
                  amount={amount}
                  onAmountChange={handleSendAmountChange}
                  currencySelector={{ customRender: () => <></> }}
                  showChevron={!sendInputFocused && !inputFocused && !amount && !receiveAmount}
                  onFocusChange={setSendInputFocused}
                />
              </div>
            </>
          )}

          <div className="send-flow__slide-wrapper">

          {/* To input — always visible, physically slides down when cross-top appears */}
          {selectedRecipient && (
          <div className="send-flow__gets-wrapper">
            <ExpressiveMoneyInput
              label={<span style={{ whiteSpace: 'nowrap' }}>{t('send.to')}</span>}
              currency={recipientCurrency}
              amount={isCrossCurrency ? receiveAmount : amount}
              onAmountChange={isCrossCurrency ? handleReceiveAmountChange : handleAmountChange}
              currencySelector={{
                customRender: ({ id, labelId }) => (
                  <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                    <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (currencyDropdownTarget === 'receive') { setCurrencyDropdownTarget(null); } else { openCurrencyDropdown('receive', e.currentTarget as HTMLElement); } }}
                      addonStart={{
                        type: 'avatar',
                        value: selectedRecipient.avatarUrl
                          ? [{ imgSrc: selectedRecipient.avatarUrl }, { asset: <Flag code={recipientCurrency} loading="eager" /> }]
                          : [{ style: selectedRecipient.initials ? { backgroundColor: 'transparent' } as React.CSSProperties : accountAvatarStyle, asset: selectedRecipient.initials ? <span style={{ fontSize: 10, fontWeight: 600 }}>{selectedRecipient.initials}</span> : <WiseLogoIcon size={24} /> }, { asset: <Flag code={recipientCurrency} loading="eager" /> }],
                      }}
                      addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                    >
                      <span style={{ color: 'var(--color-content-primary)' }}>{selectedRecipient.name}</span>
                      <span style={{ color: 'var(--color-content-secondary)' }}> · {recipientCurrency}</span>
                    </Button>
                  </div>
                ),
              }}
              showChevron={!inputFocused && !sendInputFocused && !amount && !receiveAmount}
              onFocusChange={setInputFocused}
            />

            {/* Amount available — show below gets input in same-currency mode, shimmer, and reverse-collapsing */}
            {!isCrossCurrency && (
              <p className="convert-flow__available np-text-body-default">
                Amount available: <button type="button" className="convert-flow__available-link" onClick={() => {
                  handleAmountChange(allCurrencies.find((c) => c.code === recipientCurrency)?.balance ?? 0);
                }}>{ (() => { const c = allCurrencies.find((c) => c.code === recipientCurrency); return c ? formatBalance(c) : `0.00 ${recipientCurrency}`; })() }</button>
              </p>
            )}
          </div>
          )}

          {/* === SAME-CURRENCY BOTTOM: shimmer only (during cross transition) === */}

          {/* Continue button — persists across all transition phases */}
          {selectedRecipient && (
            <div className="send-flow__continue" style={isCrossCurrency ? { marginTop: 40 } : undefined}>
              <ButtonCue
                visible={cueVisible && buttonState === 'disabled'}
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
                  disabled={buttonState !== 'active'}
                  loading={buttonState === 'loading'}
                  className={buttonState === 'loading' ? 'send-flow__btn-loading' : undefined}
                  block
                >
                  {t('send.continue')}
                </Button>
              </ButtonCue>
            </div>
          )}
          </div>{/* end slide-wrapper */}

          {/* Currency dropdown popover — for currency selector buttons */}
          {selectedRecipient && currencyDropdownOpen && dropdownPos && (
            <div className="send-flow__currency-popover" ref={currencyDropdownRef} onClick={(e) => e.stopPropagation()} style={{ top: dropdownPos.top, right: dropdownPos.right }}>
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
