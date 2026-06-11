import { useState, useEffect, useRef, useCallback } from 'react';
import { FlowNavigation, Logo, Button, AvatarView, ExpressiveMoneyInput } from '@transferwise/components';
import { InfoCircle, ChevronDown } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { ButtonCue } from '../components/ButtonCue';
import { WiseLogoIcon, resolveIcon } from '../components/WiseLogoIcon';
import { useLanguage } from '../context/Language';
import type { AccountType } from '@shared/data/account-registry';
import './AddMoneyFlow.css';

/* ---- AddMoneyFlow ---- */

type ButtonState = 'disabled' | 'loading' | 'active';

export type AccountStyle = { color: string; textColor: string; iconName: string };

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
  const [amount, setAmount] = useState<number | null>(null);
  const [cueVisible, setCueVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>('disabled');
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accountAvatarStyle = { backgroundColor: accountStyle.color, color: accountStyle.textColor };
  const accountAvatarIcon = resolveIcon(accountStyle.iconName, 24);

  const steps = [
    { label: t('addMoney.amount') },
    { label: t('addMoney.verification') },
    { label: t('addMoney.payment') },
  ] as const;

  const avatar = avatarUrl ? (
    <AvatarView size={48} imgSrc={avatarUrl} />
  ) : (
    <AvatarView size={48}>
      {initials}
    </AvatarView>
  );

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
    } else if (nowEmpty && !wasEmpty) {
      setButtonState('loading');
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
    };
  }, []);

  // Delay focus so the user sees the inactive→active transition,
  // then show the cue after the input animation completes
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
    <div className="add-money-flow">
      <FlowNavigation
        activeStep={0}
        steps={steps}
        onClose={onClose}
        avatar={avatar}
        logo={<Logo />}
      />

      <div className="add-money-flow__body" ref={bodyRef}>
        <ExpressiveMoneyInput
          label={<span style={{ whiteSpace: 'nowrap' }}>{t('addMoney.title')} <strong>{accountLabel}</strong></span>}
          currency={defaultCurrency}
          amount={amount}
          onAmountChange={handleAmountChange}
          currencySelector={{
            customRender: ({ id, labelId }) => (
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
      </div>
    </div>
  );
}
