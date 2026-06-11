import { useState, useEffect, useRef, useCallback } from 'react';
import { OverlayHeader, Logo, Button, AvatarView, ExpressiveMoneyInput, ListItem } from '@transferwise/components';
import { InfoCircle, ChevronDown, ChevronRight, SwitchVertical, AutoConvert } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { ButtonCue } from '../components/ButtonCue';
import { WiseLogoIcon, resolveIcon } from '../components/WiseLogoIcon';
import { useLanguage } from '../context/Language';
import { useLiveRates } from '../context/LiveRates';
import { convertToHomeCurrency } from '@shared/data/currency-rates';
import { formatBalance } from '@shared/data/balances';
import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { accountRegistry } from '@shared/data/account-registry';
import { getJar } from '@shared/data/jar-data';
import type { AccountType } from '@shared/data/account-registry';
import './ConvertFlow.css';

type ButtonState = 'disabled' | 'loading' | 'active';

export type AccountStyle = { color: string; textColor: string; iconName: string };

type Props = {
  fromCurrency: string;
  toCurrency: string;
  accountLabel: string;
  toAccountLabel?: string;
  group?: string;
  jarId?: string;
  accountStyle: AccountStyle;
  toAccountStyle?: AccountStyle;
  onClose: () => void;
  accountType: AccountType;
  avatarUrl: string;
  initials: string;
};

export function ConvertFlow({ fromCurrency: initFrom, toCurrency: initTo, accountLabel, toAccountLabel, group, jarId, accountStyle, toAccountStyle, onClose, accountType, avatarUrl, initials }: Props) {
  const { t } = useLanguage();
  const rates = useLiveRates();

  const [fromCurrency, setFromCurrency] = useState(initFrom);
  const [toCurrency, setToCurrency] = useState(initTo);
  const [fromAmount, setFromAmount] = useState<number | null>(null);
  const [toAmount, setToAmount] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<'from' | 'to'>('from');
  const [cueVisible, setCueVisible] = useState(false);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>('disabled');
  const [hasInteracted, setHasInteracted] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBusiness = accountType === 'business';

  // Track swap state so labels and avatar styles follow currency positions
  const [labelsSwapped, setLabelsSwapped] = useState(false);
  const fromLabel = labelsSwapped ? (toAccountLabel ?? accountLabel) : accountLabel;
  const toLabel = labelsSwapped ? accountLabel : (toAccountLabel ?? accountLabel);

  // Account avatar styles — driven entirely by props
  const resolvedToStyle = toAccountStyle ?? accountStyle;
  const fromStyle = labelsSwapped ? resolvedToStyle : accountStyle;
  const toStyle = labelsSwapped ? accountStyle : resolvedToStyle;
  const fromAvatarStyle = { backgroundColor: fromStyle.color, color: fromStyle.textColor };
  const fromAvatarIcon = resolveIcon(fromStyle.iconName, 24);
  const toAvatarStyle = { backgroundColor: toStyle.color, color: toStyle.textColor };
  const toAvatarIcon = resolveIcon(toStyle.iconName, 24);

  // Find the balance for the "from" currency — resolve from registry by matching style
  const jarDef = jarId ? getJar(jarId) : undefined;
  const resolveAccountCurrencies = () => {
    if (jarDef) return jarDef.currencies;
    if (group) {
      const match = accountRegistry.find((a) => a.subPageType === `${group}-account`);
      if (match) return match.getCurrencies();
    }
    const matchByStyle = accountRegistry.find((a) => a.style.iconName === accountStyle.iconName && a.style.color === accountStyle.color);
    if (matchByStyle && matchByStyle.subPageType !== 'account') return matchByStyle.getCurrencies();
    return isBusiness ? businessCurrencies : currencies;
  };
  const fromAccountCurrencies = resolveAccountCurrencies();
  const fromCurrencyData = fromAccountCurrencies.find((c) => c.code === fromCurrency);
  const availableBalance = fromCurrencyData ? formatBalance(fromCurrencyData) : `0.00 ${fromCurrency}`;

  // Compute exchange rate for the rate pill
  const rateValue = convertToHomeCurrency(1, fromCurrency, toCurrency, rates);
  const rateDisplay = rateValue.toFixed(4);

  const avatar = avatarUrl ? (
    <AvatarView size={48} imgSrc={avatarUrl} />
  ) : (
    <AvatarView size={48}>
      {initials}
    </AvatarView>
  );

  const bodyRef = useRef<HTMLDivElement>(null);
  const hasAmountRef = useRef(false);

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

  const handleFromAmountChange = useCallback((newAmount: number | null) => {
    setFromAmount(newAmount);
    setActiveInput('from');
    if (!hasInteracted) setHasInteracted(true);
    const hasVal = newAmount !== null && newAmount !== 0;
    if (hasVal) {
      setToAmount(Math.round(convertToHomeCurrency(newAmount!, fromCurrency, toCurrency, rates) * 100) / 100);
    } else {
      setToAmount(null);
    }
    updateButtonState(hasVal);
  }, [fromCurrency, toCurrency, rates, updateButtonState, hasInteracted]);

  const handleToAmountChange = useCallback((newAmount: number | null) => {
    setToAmount(newAmount);
    setActiveInput('to');
    if (!hasInteracted) setHasInteracted(true);
    const hasVal = newAmount !== null && newAmount !== 0;
    if (hasVal) {
      setFromAmount(Math.round(convertToHomeCurrency(newAmount!, toCurrency, fromCurrency, rates) * 100) / 100);
    } else {
      setFromAmount(null);
    }
    updateButtonState(hasVal);
  }, [fromCurrency, toCurrency, rates, updateButtonState, hasInteracted]);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setLabelsSwapped((prev) => !prev);
    if (activeInput === 'from' && fromAmount !== null && fromAmount !== 0) {
      setToAmount(Math.round(convertToHomeCurrency(fromAmount, toCurrency, fromCurrency, rates) * 100) / 100);
    } else if (activeInput === 'to' && toAmount !== null && toAmount !== 0) {
      setFromAmount(Math.round(convertToHomeCurrency(toAmount, fromCurrency, toCurrency, rates) * 100) / 100);
    }
  }, [fromCurrency, toCurrency, fromAmount, toAmount, activeInput, rates]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  // Delay focus and show cue
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      const input = bodyRef.current?.querySelector<HTMLInputElement>('.convert-flow__from-input .wds-expressive-money-input input');
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

  // Dividers expand when either input is focused, collapse when neither is
  const dividersExpanded = fromFocused || toFocused;

  return (
    <div className="convert-flow">
      <OverlayHeader
        onClose={onClose}
        avatar={avatar}
        logo={<Logo />}
      />

      <div className="convert-flow__body" ref={bodyRef}>
        {/* Rate pill */}
        {fromCurrency !== toCurrency && (
          <div className="convert-flow__rate-pill">
            <Button v2 size="md" priority="secondary-neutral" className="convert-flow__rate-btn" addonEnd={{ type: 'icon', value: <span style={{ color: 'var(--color-content-primary)' }}><ChevronRight size={16} /></span> }}>
              {t('convert.rate', { from: fromCurrency, rate: rateDisplay, to: toCurrency })}
            </Button>
          </div>
        )}

        {/* From section */}
        <div className="convert-flow__from-input">
          <ExpressiveMoneyInput
            label={<span style={{ whiteSpace: 'nowrap' }}>{t('convert.from')} <strong>{fromLabel}</strong></span>}
            currency={fromCurrency}
            amount={fromAmount}
            onAmountChange={handleFromAmountChange}
            currencySelector={{
              customRender: ({ id, labelId }) => (
                <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                  <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                    addonStart={{ type: 'avatar', value: [{ style: fromAvatarStyle, asset: fromAvatarIcon }, { asset: <Flag code={fromCurrency} loading="eager" /> }] }}
                    addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                  >
                    {fromCurrency}
                  </Button>
                </div>
              ),
            }}
            showChevron={!fromFocused && !toFocused && !fromAmount && !toAmount}
            onFocusChange={setFromFocused}
          />
          <p className="convert-flow__available np-text-body-default">
            Available: <button type="button" className="convert-flow__available-link" onClick={() => handleFromAmountChange(fromCurrencyData?.balance ?? 0)}>{availableBalance}</button>
          </p>
        </div>

        {/* Swap divider */}
        <div className="convert-flow__swap">
          <div className={`convert-flow__swap-line${dividersExpanded ? ' convert-flow__swap-line--expanded' : ''}`} />
          <button
            type="button"
            className="convert-flow__swap-btn"
            onClick={handleSwap}
            aria-label={t('common.convert')}
          >
            <SwitchVertical size={24} />
          </button>
          <div className={`convert-flow__swap-line${dividersExpanded ? ' convert-flow__swap-line--expanded' : ''}`} />
        </div>

        {/* To section */}
        <div className="convert-flow__to-input">
          <ExpressiveMoneyInput
            label={<span style={{ whiteSpace: 'nowrap' }}>{t('convert.to')} <strong>{toLabel}</strong></span>}
            currency={toCurrency}
            amount={toAmount}
            onAmountChange={handleToAmountChange}
            currencySelector={{
              customRender: ({ id, labelId }) => (
                <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
                  <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
                    addonStart={{ type: 'avatar', value: [{ style: toAvatarStyle, asset: toAvatarIcon }, { asset: <Flag code={toCurrency} loading="eager" /> }] }}
                    addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
                  >
                    {toCurrency}
                  </Button>
                </div>
              ),
            }}
            showChevron={!fromFocused && !toFocused && !fromAmount && !toAmount}
            onFocusChange={setToFocused}
          />
          {/* Static divider below the "To" input */}
          <div className="convert-flow__to-divider" />
        </div>

        {/* Auto conversion list item */}
        <div className="convert-flow__auto-convert">
          <ListItem
            title={t('convert.autoConvert')}
            subtitle={t('convert.autoConvertSub')}
            media={
              <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                <AutoConvert size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </div>

        {/* ButtonCue + Review button */}
        <div className={`convert-flow__review${buttonState === 'active' ? ' convert-flow__review--active' : ''}`}>
          <ButtonCue
            visible={cueVisible && buttonState === 'disabled'}
            hint={
              <>
                <InfoCircle size={16} />
                <span className="np-text-body-default">
                  {(() => {
                    const text = t('convert.enterAmount');
                    const idx = text.indexOf('either amount');
                    if (idx === -1) return text;
                    return <>{text.slice(0, idx)}<span style={{ fontWeight: 600 }}>either amount</span>{text.slice(idx + 'either amount'.length)}</>;
                  })()}
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
              className={buttonState === 'loading' ? 'convert-flow__btn-loading' : undefined}
              block
            >
              {t('convert.review')}
            </Button>
          </ButtonCue>
        </div>
      </div>
    </div>
  );
}
