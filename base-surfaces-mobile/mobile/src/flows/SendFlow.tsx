import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, ExpressiveMoneyInput, Chips, ListItem } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, Search, Plus, ScanSparkle, Padlock } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { FlowHeader, GlassPill, GlassCircle } from '../components/FlowHeader';
import { ButtonCue } from '../components/ButtonCue';
import { RecentContactCard } from '../components/RecentContactCard';
import { RecipientSearchEmpty } from '../components/RecipientSearchEmpty';
import { CurrencySheet } from '../components/CurrencySheet';
import { WiseLogoIcon } from '../components/WiseLogoIcon';
import { useLanguage } from '../context/Language';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLiveRates } from '../context/LiveRates';
import { convertToHomeCurrency } from '@shared/data/currency-rates';
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

  const [step, setStep] = useState<'recipient' | 'amount'>(initialRecipient ? 'amount' : startStep);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientInfo | null>(initialRecipient ?? null);
  const [currency, setCurrency] = useState(initialRecipient?.badgeFlagCode ?? defaultCurrency);
  const [sendCurrency, setSendCurrency] = useState(defaultCurrency);
  const [currencySheetTarget, setCurrencySheetTarget] = useState<'send' | 'receive' | null>(null);
  const [userOverrodeReceiveCurrency, setUserOverrodeReceiveCurrency] = useState(false);
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
  const hasAmountRef = useRef(false);


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
      const input = bodyRef.current?.querySelector<HTMLInputElement>('.send-flow__gets-wrapper .wds-expressive-money-input input');
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


  // Recent = account currencies (ones the user has)
  const recentCurrencyCodes = useMemo(() =>
    allCurrencies.map((c) => c.code),
  [allCurrencies]);

  const handleSelectSendCurrency = useCallback((code: string) => {
    const wasCross = sendCurrency !== recipientCurrency;
    const willBeCross = code !== recipientCurrency;

    setSendCurrency(code);

    if (!wasCross && willBeCross && amount !== null && amount !== 0) {
      setReceiveAmount(amount);
      setAmount(Math.round(convertToHomeCurrency(amount, recipientCurrency, code, rates) * 100) / 100);
    } else if (wasCross && willBeCross && amount !== null && amount !== 0) {
      setReceiveAmount(Math.round(convertToHomeCurrency(amount, code, recipientCurrency, rates) * 100) / 100);
    } else if (!willBeCross) {
      if (receiveAmount !== null && receiveAmount !== 0) {
        setAmount(receiveAmount);
      }
      setReceiveAmount(null);
    }
  }, [amount, receiveAmount, sendCurrency, recipientCurrency, rates]);

  const handleSelectReceiveCurrency = useCallback((code: string) => {
    const wasCross = sendCurrency !== recipientCurrency;
    const willBeCross = sendCurrency !== code;

    setUserOverrodeReceiveCurrency(true);
    setCurrency(code);

    if (!wasCross && willBeCross && amount !== null && amount !== 0) {
      setReceiveAmount(amount);
      setAmount(Math.round(convertToHomeCurrency(amount, code, sendCurrency, rates) * 100) / 100);
    } else if (willBeCross && amount !== null && amount !== 0) {
      setReceiveAmount(Math.round(convertToHomeCurrency(amount, sendCurrency, code, rates) * 100) / 100);
    } else if (!willBeCross) {
      setReceiveAmount(null);
    }
  }, [amount, sendCurrency, recipientCurrency, rates]);

  // Show cue after mount when on amount step
  useEffect(() => {
    if (step === 'amount' && !prefillAmount) {
      const focusTimer = setTimeout(() => {
        const input = bodyRef.current?.querySelector<HTMLInputElement>('.send-flow__gets-wrapper .wds-expressive-money-input input');
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
          <GlassPill className="send-flow__rate-btn">
            <span className="ios-glass-btn__icon"><Padlock size={16} /></span>
            <span className="send-flow__rate-divider" />
            <span className="flow-header__rate-clip">
              <span className="flow-header__rate-flipper flow-header__rate-flipper--fast">
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
              <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Search size={16} /> }} onClick={() => setSearchActive(true)}>{t('recipients.search')}</Button>
            </div>

            {searchActive && (
              <div className="send-flow__search-input" style={{ padding: '8px 0' }}>
                <input
                  type="search"
                  className="np-text-body-default"
                  placeholder={t('recipients.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 50, border: '1px solid var(--color-border-neutral)', outline: 'none', fontSize: 16, background: 'var(--color-background-screen)' }}
                />
              </div>
            )}

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
              {/* From label + currency pill row */}
              <div className="send-flow__from-row">
                <span className="send-flow__from-label">{t('send.from')}</span>
                <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setCurrencySheetTarget('send'); }}
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

          {/* To input */}
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
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setCurrencySheetTarget('receive');
                      }}
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

            {!isCrossCurrency && (
              <p className="convert-flow__available np-text-body-default">
                Amount available: <button type="button" className="convert-flow__available-link" onClick={() => {
                  handleAmountChange(allCurrencies.find((c) => c.code === recipientCurrency)?.balance ?? 0);
                }}>{ (() => { const c = allCurrencies.find((c) => c.code === recipientCurrency); return c ? formatBalance(c) : `0.00 ${recipientCurrency}`; })() }</button>
              </p>
            )}
          </div>
          )}

          {/* Continue button */}
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
