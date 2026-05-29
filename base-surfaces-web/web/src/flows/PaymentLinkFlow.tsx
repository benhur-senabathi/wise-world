import { useState, useEffect, useRef, useCallback } from 'react';
import { FlowNavigation, Logo, Button, AvatarView, ExpressiveMoneyInput, Chips } from '@transferwise/components';
import { InfoCircle, ChevronDown, Money } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { ButtonCue } from '../components/ButtonCue';
import { WiseLogoIcon, resolveIcon } from '../components/WiseLogoIcon';
import { useLanguage } from '../context/Language';
import { getAccountBySubPageType } from '@shared/data/account-registry';
import type { AccountType } from '@shared/data/account-registry';
import type { AccountStyle } from './RequestFlow';
import './PaymentLinkFlow.css';

type ButtonState = 'disabled' | 'loading' | 'active';

type Props = {
  defaultCurrency: string;
  accountLabel: string;
  group?: string;
  accountStyle?: AccountStyle;
  onClose: () => void;
  accountType: AccountType;
  avatarUrl: string;
  initials: string;
};

export function PaymentLinkFlow({ defaultCurrency, accountLabel, group, accountStyle, onClose, accountType, avatarUrl, initials }: Props) {
  const { t } = useLanguage();

  const isBusiness = accountType === 'business';
  const isGroup = !!group;

  const [currency] = useState(defaultCurrency);
  const [amount, setAmount] = useState<number | null>(null);
  const [quickAmountsVisible, setQuickAmountsVisible] = useState(true);
  const [buttonState, setButtonState] = useState<ButtonState>('disabled');
  const [cueVisible, setCueVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hasAmountRef = useRef(false);

  const avatar = avatarUrl ? (
    <AvatarView size={48} imgSrc={avatarUrl} />
  ) : (
    <AvatarView size={48} style={{ backgroundColor: 'var(--color-background-elevated)', border: 'none' }}>
      {initials}
    </AvatarView>
  );

  const caStyle = getAccountBySubPageType('account')!.style;
  const accountAvatarStyle = accountStyle
    ? { backgroundColor: accountStyle.color, color: accountStyle.textColor }
    : isBusiness
      ? { backgroundColor: caStyle.textColor, color: caStyle.color }
      : { backgroundColor: 'var(--color-interactive-accent)', color: 'var(--color-interactive-control)' };
  const accountAvatarIcon = accountStyle ? resolveIcon(accountStyle.iconName) : (isGroup ? <Money size={16} /> : <WiseLogoIcon />);

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

  // Focus input and show cue on mount
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

  return (
    <div className="payment-link-flow">
      <FlowNavigation
        activeStep={0}
        steps={[]}
        onClose={onClose}
        avatar={avatar}
        logo={<Logo />}
      />

      <div className="payment-link-flow__scroll">
        <div className="payment-link-flow__body" ref={bodyRef}>
          <ExpressiveMoneyInput
            label={<span style={{ whiteSpace: 'nowrap' }}>{t('paymentLink.getPaidTo')} <strong>{accountLabel}</strong></span>}
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
            <div className="payment-link-flow__quick-amounts">
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

          {/* ButtonCue + Create payment link button */}
          <div className="payment-link-flow__continue">
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
                className={buttonState === 'loading' ? 'payment-link-flow__btn-loading' : undefined}
                block
              >
                {t('paymentLink.createPaymentLink')}
              </Button>
            </ButtonCue>
          </div>
        </div>
      </div>
    </div>
  );
}
