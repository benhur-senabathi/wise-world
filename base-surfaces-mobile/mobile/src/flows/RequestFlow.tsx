import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, AvatarView, ExpressiveMoneyInput, ListItem, Chips, Input, Size } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, Search, GiftBox, Link, FastFlag, Money } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { FlowHeader, GlassPill } from '../components/FlowHeader';
import { ButtonCue } from '../components/ButtonCue';
import { RecentContactCard } from '../components/RecentContactCard';
import { RecipientSearchEmpty } from '../components/RecipientSearchEmpty';
import { WiseLogoIcon, resolveIcon } from '../components/WiseLogoIcon';
import { useLanguage } from '../context/Language';
import { recipients, recentContacts, getAvatarSrc, getBadge, type Recipient } from '@shared/data/recipients';
import type { AccountType } from '@shared/data/account-registry';
import { getAccountBySubPageType } from '@shared/data/account-registry';
import './RequestFlow.css';

export type AccountStyle = { color: string; textColor: string; iconName: string };

type ButtonState = 'disabled' | 'loading' | 'active';

type RecipientInfo = {
  name: string;
  subtitle: string;
  avatarUrl?: string;
  initials?: string;
  hasFastFlag: boolean;
  badgeFlagCode?: string;
};

type Props = {
  defaultCurrency: string;
  accountLabel: string;
  group?: string;
  accountStyle?: AccountStyle;
  onClose: () => void;
  onStepChange?: (step: string) => void;
  accountType: AccountType;
  avatarUrl: string;
  initials: string;
  startStep?: 'recipient' | 'request';
  recipient?: RecipientInfo;
};

export function RequestFlow({ defaultCurrency, accountLabel, group, accountStyle, onClose, onStepChange, accountType, avatarUrl, initials, startStep = 'recipient', recipient: initialRecipient }: Props) {
  const { t } = useLanguage();

  const isBusiness = accountType === 'business';
  const isGroup = !!group;

  const [step, setStep] = useState<'recipient' | 'request'>(initialRecipient ? 'request' : startStep);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientInfo | null>(initialRecipient ?? null);
  const [isPaymentLink, setIsPaymentLink] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [amount, setAmount] = useState<number | null>(null);
  const [quickAmountsVisible, setQuickAmountsVisible] = useState(true);
  const [buttonState, setButtonState] = useState<ButtonState>('disabled');
  const [cueVisible, setCueVisible] = useState(false);
  const [searchQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hasAmountRef = useRef(false);

  // Only show Wise users (hasFastFlag: true)
  const wiseRecipients = useMemo(() => recipients.filter((r) => r.hasFastFlag), []);

  // Filter recent contacts to only those with a matching Wise recipient
  const activeRecentContacts = useMemo(() =>
    recentContacts.filter((contact) =>
      recipients.some((r) => r.name === contact.name && r.subtitle.includes(contact.subtitle) && r.hasFastFlag)
    ),
  []);

  const filteredRecipients = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return wiseRecipients.filter(
        (r) => r.name.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
      );
    }
    return wiseRecipients;
  }, [searchQuery, wiseRecipients]);

  const isSearching = searchQuery.trim().length > 0;

  const caStyle = getAccountBySubPageType('account')!.style;
  const accountAvatarStyle = accountStyle
    ? { backgroundColor: accountStyle.color, color: accountStyle.textColor }
    : isBusiness
      ? { backgroundColor: caStyle.textColor, color: caStyle.color }
      : { backgroundColor: 'var(--color-interactive-accent)', color: 'var(--color-interactive-control)' };
  const accountAvatarIcon = accountStyle ? resolveIcon(accountStyle.iconName, 24) : (isGroup ? <Money size={16} /> : <WiseLogoIcon size={24} />);

  // Select a recipient and transition to request step
  const handleSelectRecipient = useCallback((r: Recipient) => {
    const info: RecipientInfo = {
      name: r.name,
      subtitle: r.subtitle,
      avatarUrl: getAvatarSrc(r),
      initials: r.initials,
      hasFastFlag: r.hasFastFlag,
      badgeFlagCode: r.badgeFlagCode,
    };
    setSelectedRecipient(info);
    setIsPaymentLink(false);
    setCurrency(defaultCurrency);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setAmount(null);
    setQuickAmountsVisible(true);
    hasAmountRef.current = false;
    setButtonState('disabled');
    setCueVisible(false);
    setStep('request');
    onStepChange?.('request');
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 450);

    setTimeout(() => {
      const input = bodyRef.current?.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
      input?.focus();
    }, 700);
  }, [defaultCurrency, onStepChange]);

  // Handle "Share a payment link" click — go to simplified request step
  const handlePaymentLink = useCallback(() => {
    setSelectedRecipient(null);
    setIsPaymentLink(true);
    setCurrency(defaultCurrency);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setAmount(null);
    setQuickAmountsVisible(true);
    hasAmountRef.current = false;
    setButtonState('disabled');
    setCueVisible(false);
    setStep('request');
    onStepChange?.('request');
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 450);

    setTimeout(() => {
      const input = bodyRef.current?.querySelector<HTMLInputElement>('.wds-expressive-money-input input');
      input?.focus();
    }, 700);
  }, [defaultCurrency, onStepChange]);

  const handleSelectRecentContact = useCallback((contact: { name: string; subtitle: string }) => {
    const match = recipients.find((r) => r.name === contact.name && r.subtitle.includes(contact.subtitle));
    if (match) {
      handleSelectRecipient(match);
    }
  }, [handleSelectRecipient]);

  // Button state machine
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

  const handleAmountChange = useCallback((newAmount: number | null) => {
    setAmount(newAmount);
    const hasVal = newAmount !== null && newAmount !== 0;
    updateButtonState(hasVal);
    if (hasVal) {
      setQuickAmountsVisible(false);
    } else {
      setQuickAmountsVisible(true);
    }
  }, [updateButtonState]);

  const handleQuickAmount = useCallback((quickAmount: number) => {
    setAmount(quickAmount);
    updateButtonState(true);
  }, [updateButtonState]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  // Show cue after mount when on request step
  useEffect(() => {
    if (step === 'request') {
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
  }, [step]);

  // Handle back button
  const handleBack = useCallback(() => {
    if (step === 'request') {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setStep('recipient');
      onStepChange?.('recipient');
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 450);
      setCueVisible(false);

      // Scroll recipient panel back to top
      const panel = document.querySelector('.request-flow__panel:first-child');
      if (panel) panel.scrollTop = 0;

      setTimeout(() => {
        setSelectedRecipient(null);
        setIsPaymentLink(false);
        setAmount(null);
        setButtonState('disabled');
      }, 600);
    }
  }, [step]);

  return (
    <div className={`request-flow${isSearching ? ' request-flow--searching' : ''}`}>
      <FlowHeader
        onClose={onClose}
        onBack={step === 'request' ? handleBack : undefined}
        trailing={step === 'recipient' ? (
          <GlassPill>
            <span className="ios-glass-btn__icon"><GiftBox size={16} /></span>
            <span className="ios-glass-btn__label">{t('request.invite')}</span>
          </GlassPill>
        ) : undefined}
      />

      <div className={`request-flow__track${step === 'request' ? ' request-flow__track--step-request' : ''}${isAnimating ? ' request-flow__track--animating' : ''}`}>
        {/* Step 1: Recipient */}
        <div className="request-flow__panel">
        <div className="request-flow__body" ref={step === 'recipient' ? bodyRef : undefined}>
          <>
            {/* Title */}
            <h1 className="request-flow__title np-display np-text-display-small">{t('request.whoRequestingFrom')}</h1>

            {/* Recents */}
            <div className="request-flow__recents-section">
              <p className="np-text-title-group" style={{ margin: '0 0 8px' }}>{t('request.recent')}</p>
              <div className="request-flow__recents">
                {activeRecentContacts.slice(0, 3).map((contact, i) => (
                  <RecentContactCard
                    key={i}
                    name={contact.name}
                    subtitle={contact.subtitle}
                    imgSrc={contact.imgSrc}
                    initials={contact.initials}
                    badge={contact.badge}
                    onClick={() => handleSelectRecentContact(contact)}

                  />
                ))}
              </div>
            </div>

            {/* Someone else */}
            <div className="request-flow__someone-else-section">
              <p className="np-text-title-group" style={{ margin: '0 0 8px' }}>{t('request.someoneElse')}</p>
              <div className="request-flow__someone-else">
                <button type="button" className="request-flow__spotlight-card">
                  <svg className="request-flow__spotlight-border" aria-hidden="true"><rect /></svg>
                  <AvatarView size={32} style={{ backgroundColor: 'var(--color-interactive-accent)', color: 'var(--color-interactive-control)' }}>
                    <WiseLogoIcon size={24} />
                  </AvatarView>
                  <span className="np-text-body-large" style={{ fontWeight: 600, flex: 1 }}>{t('request.getWisetag')}</span>
                  <span style={{ color: 'var(--color-content-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 0 }}><ChevronRight size={16} /></span>
                </button>
                <button type="button" className="request-flow__spotlight-card request-flow__spotlight-card--active" onClick={handlePaymentLink}>
                  <svg className="request-flow__spotlight-border" aria-hidden="true"><rect /></svg>
                  <AvatarView size={32} style={{ backgroundColor: 'var(--color-background-elevated)', border: 'none' }}>
                    <Link size={16} />
                  </AvatarView>
                  <span className="np-text-body-large" style={{ fontWeight: 600, flex: 1 }}>{t('request.sharePaymentLink')}</span>
                  <span style={{ color: 'var(--color-content-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 0 }}><ChevronRight size={16} /></span>
                </button>
              </div>
            </div>

            {/* Filter + list */}
            <div className="request-flow__all-section">
              <div className="request-flow__filters">
                <p className="np-text-title-group" style={{ margin: 0 }}>{t('recipients.filterAll')}</p>
                <div className="request-flow__filter-spacer" />
                <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Search size={16} /> }}>{t('recipients.search')}</Button>
              </div>

              {/* Recipient list */}
              {filteredRecipients.length > 0 ? (
                <ul className="request-flow__list">
                  {filteredRecipients.map((r) => {
                    const badge = getBadge(r);
                    let imgSrc: string | undefined;
                    let avatarChildren: string | undefined;

                    if (r.avatarType === 'photo') {
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
                <RecipientSearchEmpty query={searchQuery.trim()} onPaymentLink={handlePaymentLink} />
              ) : null}
            </div>
          </>
        </div>
        </div>

        {/* Step 2: Request */}
        <div className="request-flow__panel">
        <div className="request-flow__body" ref={step === 'request' ? bodyRef : undefined}>
          {(selectedRecipient || isPaymentLink) && (
          <>
            <ExpressiveMoneyInput
              label={<span style={{ whiteSpace: 'nowrap' }}>{t('request.requestPaymentTo')} <strong>{accountLabel}</strong></span>}
              currency={currency}
              amount={amount}
              onAmountChange={handleAmountChange}
              currencySelector={{
                customRender: ({ id, labelId }) => (
                  <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                    <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                      addonStart={{
                        type: 'avatar',
                        value: [{ style: accountAvatarStyle, asset: accountAvatarIcon }, { asset: <Flag code={currency} loading="eager" /> }],
                      }}
                      addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                    >
                      {currency}
                    </Button>
                  </div>
                ),
              }}
              showChevron={!inputFocused && !amount}
              onFocusChange={setInputFocused}
            />

            {/* Quick amount chips */}
            {quickAmountsVisible && (
              <div className="request-flow__quick-amounts">
                <Chips
                  chips={[
                    { value: '1000', label: t('request.quickAmount1') },
                    { value: '400', label: t('request.quickAmount2') },
                    { value: '200', label: t('request.quickAmount3') },
                  ]}
                  selected=""
                  onChange={({ selectedValue }: { isEnabled: boolean; selectedValue: string | number }) => {
                    handleQuickAmount(Number(selectedValue));
                    setQuickAmountsVisible(false);
                  }}
                />
              </div>
            )}

            {/* Divider */}
            <div className="request-flow__divider" />

            {/* From section — only shown when a specific recipient is selected */}
            {selectedRecipient && !isPaymentLink && (
              <>
                <div className="request-flow__from">
                  <ListItem
                    title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('request.from')}</span>}
                    subtitle={
                      <>
                        <span className="np-text-body-large" style={{ fontWeight: 600, color: 'var(--color-content-primary)', display: 'block' }}>{selectedRecipient.name}</span>
                        <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{selectedRecipient.subtitle}</span>
                      </>
                    }
                    media={
                      selectedRecipient.avatarUrl ? (
                        <ListItem.AvatarView size={48} imgSrc={selectedRecipient.avatarUrl} profileName={selectedRecipient.name} badge={{ icon: <FastFlag size={16} />, type: 'action' as const }} />
                      ) : (
                        <ListItem.AvatarView size={48} badge={{ icon: <FastFlag size={16} />, type: 'action' as const }} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                          {selectedRecipient.initials}
                        </ListItem.AvatarView>
                      )
                    }
                  />
                </div>

                {/* Divider */}
                <div className="request-flow__divider" />
              </>
            )}

            {/* Add a note section */}
            <div className="request-flow__note">
              <p className="request-flow__note-label np-text-body-default" style={{ margin: '0 0 8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('request.addNote')}</span>{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('request.optional')}</span>
              </p>
              <Input
                size={Size.MEDIUM}
              />
            </div>

            {/* ButtonCue + Send request button */}
            <div className="request-flow__continue">
              <ButtonCue
                visible={cueVisible && buttonState === 'disabled'}
                hint={
                  <>
                    <InfoCircle size={16} />
                    <span className="np-text-body-default">{t('request.enterAmount')}</span>
                  </>
                }
              >
                <Button
                  v2
                  size="lg"
                  priority="primary"
                  disabled={buttonState !== 'active'}
                  loading={buttonState === 'loading'}
                  className={buttonState === 'loading' ? 'request-flow__btn-loading' : undefined}
                  block
                >
                  {isPaymentLink ? t('request.createRequest') : t('request.sendRequest')}
                </Button>
              </ButtonCue>
            </div>
          </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
