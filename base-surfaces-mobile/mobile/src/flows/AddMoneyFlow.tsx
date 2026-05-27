import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, ExpressiveMoneyInput, ListItem, Divider, SegmentedControl, Field, Input, InlinePrompt, InfoPrompt } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, LightningBolt, Receipt, Money, Savings, Suitcase, Check } from '@transferwise/icons';
import { Flag, Illustration } from '@wise/art';
import { FlowHeader } from '../components/FlowHeader';
import { BottomSheet } from '../components/BottomSheet';
import { ButtonCue } from '../components/ButtonCue';
import { useLanguage } from '../context/Language';
import { usePrototypeNames } from '../context/PrototypeNames';
import type { AccountType } from '../App';

function WiseLogoIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.875 15.28 7.35 8.838h-.002L4.02 3h18.105l-7.008 19.375h-3.97L16.95 6.3H9.463l1.665 2.883-.008.08-2.56 2.979h4.188l-1.098 3.037z" />
    </svg>
  );
}

type ButtonState = 'disabled' | 'loading' | 'active';

export type AccountStyle = { color: string; textColor: string; iconName: string };

function resolveIcon(iconName: string) {
  switch (iconName) {
    case 'Savings': return <Savings size={16} />;
    case 'Suitcase': return <Suitcase size={16} />;
    case 'Money': return <Money size={16} />;
    default: return <WiseLogoIcon />;
  }
}

function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('hu-HU')} ${currency}`;
}

let savedQvikAccount: string | null = null;
let activeVariant: 'variant1' | 'variant2' = 'variant1';

// Clear any old persisted values and reset on HMR
try { localStorage.removeItem('qvik-account-number'); sessionStorage.removeItem('qvik-account-number'); } catch { /* noop */ }
if (import.meta.hot) {
  import.meta.hot.accept(() => { savedQvikAccount = null; });
}

function getSavedAccount(): string | null {
  return savedQvikAccount;
}
function saveAccount(value: string) {
  savedQvikAccount = value;
}
function maskAccount(value: string): string {
  const digits = value.replace(/[^0-9]/g, '');
  return `****${digits.slice(-4)}`;
}

function formatHungarianAccount(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 24);
  const parts = [digits.slice(0, 8), digits.slice(8, 16), digits.slice(16, 24)];
  return parts.filter(Boolean).join('-');
}

type Props = {
  defaultCurrency: string;
  accountLabel: string;
  accountStyle: AccountStyle;
  onClose: () => void;
  accountType: AccountType;
  avatarUrl: string;
  initials: string;
};

export function AddMoneyFlow({ defaultCurrency, accountLabel, accountStyle, onClose, accountType, avatarUrl, initials }: Props) {
  const { t } = useLanguage();
  const { consumerName } = usePrototypeNames();
  const [amount, setAmount] = useState<number | null>(null);
  const [cueVisible, setCueVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>('disabled');
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [step, setStep] = useState<'amount' | 'request-details' | 'success'>('amount');

  // Request details form state
  const [accountHolder, setAccountHolder] = useState(consumerName);
  const [accountNumber, setAccountNumber] = useState('');
  const [detailsTab, setDetailsTab] = useState('local');
  const [savedAccount] = useState<string | null>(getSavedAccount);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);

  // Dev bar
  const [devBarOpen, setDevBarOpen] = useState(false);
  const [variant, setVariant] = useState<'variant1' | 'variant2'>(activeVariant);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDevTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      setDevBarOpen(true);
    } else {
      tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 500);
    }
  }, []);

  const handleVariantChange = useCallback((v: 'variant1' | 'variant2') => {
    activeVariant = v;
    setVariant(v);
    setDevBarOpen(false);
  }, []);

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHungary = defaultCurrency === 'HUF';
  const accountAvatarStyle = { backgroundColor: accountStyle.color, color: accountStyle.textColor };
  const accountAvatarIcon = resolveIcon(accountStyle.iconName);

  const bodyRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef(amount);
  amountRef.current = amount;

  const handleAmountChange = useCallback((newAmount: number | null) => {
    const wasEmpty = amountRef.current === null || amountRef.current === 0;
    const nowEmpty = newAmount === null || newAmount === 0;

    if (!nowEmpty && wasEmpty) {
      setButtonState('loading');
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => {
        setButtonState('active');
      }, 2000);
      if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
      summaryTimerRef.current = setTimeout(() => {
        setSummaryVisible(true);
      }, 2000);
    } else if (nowEmpty && !wasEmpty) {
      setButtonState('loading');
      setSummaryVisible(false);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => {
        setButtonState('disabled');
      }, 2000);
    }

    setAmount(newAmount);
  }, []);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
    };
  }, []);

  useEffect(() => {
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
  }, []);

  const handleContinue = useCallback(() => {
    if (!isHungary) {
      setStep('success');
      return;
    }
    if (variant === 'variant1') {
      if (!savedAccount) {
        setStep('request-details');
      } else {
        setStep('success');
      }
    } else {
      // Variant 2: always go to request-details, pre-fill if saved
      if (savedAccount) {
        setAccountNumber(savedAccount);
      }
      setStep('request-details');
    }
  }, [isHungary, savedAccount, variant]);

  const handleRequestDetailsContinue = useCallback(() => {
    if (accountNumber.length >= 16) {
      saveAccount(accountNumber);
      setStep('success');
    }
  }, [accountNumber]);

  // Success screen
  if (step === 'success') {
    return (
      <div className="add-money-flow">
        <FlowHeader onClose={onClose} />

        <div className="add-money-flow__success">
          <div className="add-money-flow__success-illustration">
            <Illustration name="confetti" size="large" />
          </div>

          <div className="add-money-flow__success-text">
            <h1 className="np-text-display-small" style={{ textTransform: 'uppercase', textAlign: 'center' }}>
              {t('addMoney.requestSent')}
            </h1>
            <p className="np-text-body-large" style={{ color: 'var(--color-content-secondary)', textAlign: 'center', marginTop: 16 }}>
              {t('addMoney.requestSentDesc')}
            </p>
          </div>
        </div>

        <div className="add-money-flow__success-footer">
          <Button v2 size="lg" priority="primary" block onClick={onClose}>
            {t('addMoney.approvedRequest')}
          </Button>
          <Button v2 size="lg" priority="secondary" block onClick={onClose}>
            {t('addMoney.approveLater')}
          </Button>
        </div>
      </div>
    );
  }

  // Request details screen (step 2)
  if (step === 'request-details') {
    const isValid = accountHolder.trim().length > 0 && accountNumber.replace(/[^0-9]/g, '').length === 24;
    return (
      <div className="add-money-flow">
        <FlowHeader onClose={onClose} onBack={() => setStep('amount')} />

        <div className="add-money-flow__details">
          <div className="add-money-flow__details-header">
            <h1 className="np-text-title-screen">{t('addMoney.requestDetails')}</h1>
            <p className="np-text-body-large" style={{ color: 'var(--color-content-secondary)' }}>
              {t('addMoney.requestDetailsDesc')}
            </p>
          </div>

          <div className="add-money-flow__details-tabs">
            <SegmentedControl
              name="account-type"
              mode="input"
              value={detailsTab}
              segments={[
                { id: 'local', label: t('addMoney.localBankDetails'), value: 'local' },
                { id: 'iban', label: t('addMoney.iban'), value: 'iban' },
              ]}
              onChange={setDetailsTab}
            />
          </div>

          <Divider />

          <div className="add-money-flow__details-body">
            <div className="add-money-flow__details-form">
              <Field label={t('addMoney.accountHolder')}>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  disabled
                  placeholder={t('addMoney.accountHolderPlaceholder')}
                />
              </Field>
              <div>
                <Field label={t('addMoney.accountNumber')}>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(formatHungarianAccount(e.target.value))}
                    placeholder="12345678-12345678-12345678"
                    inputMode="numeric"
                  />
                </Field>
                {variant === 'variant2' && savedAccount && accountNumber === savedAccount && (
                  <div style={{ marginTop: 8 }}>
                    <InlinePrompt sentiment="positive" width="full">
                      {t('addMoney.lastUsedDetails')}
                    </InlinePrompt>
                  </div>
                )}
              </div>
            </div>
            <InfoPrompt sentiment="warning" description={t('addMoney.accountWarning')} />
          </div>

          <div className="add-money-flow__continue">
            <Button
              v2
              size="lg"
              priority="primary"
              disabled={!isValid}
              block
              onClick={handleRequestDetailsContinue}
            >
              {t('addMoney.continue')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Amount screen (step 1) with inline summary
  return (
    <div className="add-money-flow">
      <FlowHeader onClose={onClose} trailing={<div className="add-money-flow__dev-tap" onClick={handleDevTap} />} />

      <div className="add-money-flow__body" ref={bodyRef}>
        <ExpressiveMoneyInput
          label={<span style={{ whiteSpace: 'nowrap' }}>{t('addMoney.title')} <strong>{accountLabel}</strong></span>}
          currency={defaultCurrency}
          amount={amount}
          onAmountChange={handleAmountChange}
          currencySelector={{
            customRender: ({ id, labelId }: { id: string; labelId: string }) => (
              <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                  addonStart={{ type: 'avatar', value: [{ style: accountAvatarStyle, asset: accountAvatarIcon }, { asset: <Flag code={defaultCurrency} loading="eager" /> }] }}
                  addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                >
                  {defaultCurrency}
                </Button>
              </div>
            ),
          }}
          showChevron={!inputFocused && !amount}
          onFocusChange={setInputFocused}
        />

        {/* Summary section — appears 2s after entering amount (Hungary only) */}
        {isHungary && summaryVisible && (
          <div className="add-money-flow__summary">
            <Divider level="content" />

            <div className="add-money-flow__summary-list">
              {/* Paying in */}
              <ListItem
                title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('addMoney.payingIn')}</span>}
                subtitle={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Hungarian Forint</span>}
                media={
                  <ListItem.AvatarView size={40}>
                    <Flag code="HUF" loading="eager" />
                  </ListItem.AvatarView>
                }
                control={
                  <Button v2 size="sm" priority="secondary">{t('addMoney.change')}</Button>
                }
              />

              {/* Paying with — Qvik */}
              <ListItem
                title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('addMoney.payingWith')}</span>}
                subtitle={
                  <>
                    <span className="np-text-body-large" style={{ fontWeight: 600 }}>
                      {t('addMoney.qvikRequest')}
                    </span>
                    {savedAccount && (
                      <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)', display: 'block' }}>
                        {t('addMoney.accountEnding', { digits: savedAccount.replace(/[^0-9]/g, '').slice(-4) })}
                      </span>
                    )}
                  </>
                }
                media={
                  <ListItem.AvatarView size={40}>
                    <img src="/qvik-logo.png" alt="Qvik" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  </ListItem.AvatarView>
                }
                control={
                  <Button v2 size="sm" priority="secondary" onClick={() => setPaymentSheetOpen(true)}>{t('addMoney.change')}</Button>
                }
              />

              <Divider level="content" />

              {/* Arrives */}
              <ListItem
                title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('addMoney.arrives')}</span>}
                subtitle={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('addMoney.arrivesToday')}</span>}
                media={
                  <ListItem.AvatarView size={40} style={{ backgroundColor: 'var(--color-background-neutral)' }}>
                    <LightningBolt size={24} />
                  </ListItem.AvatarView>
                }
              />

              {/* You pay */}
              <ListItem
                title={<span className="np-text-body-default" style={{ fontWeight: 400, color: 'var(--color-content-secondary)' }}>{t('addMoney.youPay')}</span>}
                subtitle={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('addMoney.totalNoFees')}</span>}
                media={
                  <ListItem.AvatarView size={40} style={{ backgroundColor: 'var(--color-background-neutral)' }}>
                    <Receipt size={24} />
                  </ListItem.AvatarView>
                }
                control={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="np-text-body-default">{amount ? formatAmount(amount, 'HUF') : ''}</span>
                    <ChevronRight size={16} />
                  </span>
                }
              />
            </div>
          </div>
        )}

        {/* Non-Hungary: keep the original simple continue button */}
        {!isHungary && (
          <div className="add-money-flow__continue">
            <ButtonCue
              visible={cueVisible && buttonState === 'disabled'}
              hint={
                <>
                  <InfoCircle size={16} />
                  <span className="np-text-body-default">{t('addMoney.enterAmount')}</span>
                </>
              }
            >
              <Button
                v2
                size="lg"
                priority="primary"
                disabled={buttonState !== 'active'}
                loading={buttonState === 'loading'}
                className={buttonState === 'loading' ? 'add-money-flow__btn-loading' : undefined}
                block
              >
                {t('addMoney.continue')}
              </Button>
            </ButtonCue>
          </div>
        )}

        {/* Hungary: footer continue button */}
        {isHungary && (
          <div className="add-money-flow__continue">
            {!summaryVisible ? (
              <ButtonCue
                visible={cueVisible && buttonState === 'disabled'}
                hint={
                  <>
                    <InfoCircle size={16} />
                    <span className="np-text-body-default">{t('addMoney.enterAmount')}</span>
                  </>
                }
              >
                <Button
                  v2
                  size="lg"
                  priority="primary"
                  disabled={buttonState !== 'active'}
                  loading={buttonState === 'loading'}
                  className={buttonState === 'loading' ? 'add-money-flow__btn-loading' : undefined}
                  block
                >
                  {t('addMoney.continue')}
                </Button>
              </ButtonCue>
            ) : (
              <Button
                v2
                size="lg"
                priority="primary"
                block
                onClick={handleContinue}
              >
                {t('addMoney.continue')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Payment method sheet */}
      <BottomSheet open={paymentSheetOpen} onClose={() => setPaymentSheetOpen(false)} title={t('addMoney.chooseHowToPay')}>
        <div className="add-money-flow__payment-sheet">
          {savedAccount && (
            <div className="add-money-flow__payment-section">
              <h4 className="np-text-title-body">{t('addMoney.savedForHuf')}</h4>
              <ListItem
                title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{`${t('addMoney.qvikRequest')} *${savedAccount.replace(/[^0-9]/g, '').slice(-4)}`}</span>}
                subtitle={<span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>0 HUF fee · Arrives in seconds</span>}
                media={
                  <ListItem.AvatarView size={40}>
                    <img src="/qvik-logo.png" alt="Qvik" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  </ListItem.AvatarView>
                }
                control={<ListItem.Navigation onClick={() => setPaymentSheetOpen(false)} />}
              />
            </div>
          )}
          <div className="add-money-flow__payment-section">
            <h4 className="np-text-title-body">{t('addMoney.availableForHuf')}</h4>
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('addMoney.newQvikRequest')}</span>}
              subtitle={<span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>0 HUF fee · Arrives in seconds</span>}
              media={
                <ListItem.AvatarView size={40}>
                  <img src="/qvik-logo.png" alt="Qvik" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => { setPaymentSheetOpen(false); setStep('request-details'); }} />}
            />
          </div>
        </div>
      </BottomSheet>

      {/* Dev bar */}
      <BottomSheet open={devBarOpen} onClose={() => setDevBarOpen(false)} title="Hungary flow variant">
        <div className="add-money-flow__payment-sheet">
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Variant 1</span>}
            subtitle={<span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>Save once, skip next time</span>}
            media={
              <ListItem.AvatarView size={40} style={{ backgroundColor: variant === 'variant1' ? 'var(--color-background-positive-subtle)' : 'var(--color-background-neutral)' }}>
                {variant === 'variant1' ? <Check size={16} /> : <span className="np-text-body-default" style={{ fontWeight: 600 }}>1</span>}
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => handleVariantChange('variant1')} />}
          />
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Variant 2</span>}
            subtitle={<span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>Always show details, pre-filled</span>}
            media={
              <ListItem.AvatarView size={40} style={{ backgroundColor: variant === 'variant2' ? 'var(--color-background-positive-subtle)' : 'var(--color-background-neutral)' }}>
                {variant === 'variant2' ? <Check size={16} /> : <span className="np-text-body-default" style={{ fontWeight: 600 }}>2</span>}
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => handleVariantChange('variant2')} />}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
