import { useState, useCallback } from 'react';
import { SwitchVertical, ChevronDown } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { CurrencySheet } from './CurrencySheet';
import { useShimmer } from '../context/Shimmer';
import { ShimmerCurrencyInputGroup } from './CurrencyInputGroup.shimmer';
import { currencies } from '@shared/data/currencies';
import './CurrencyInputGroup.css';

type CurrencyInputProps = {
  label: string;
  amount: string;
  currencyCode: string;
  onAmountChange?: (val: string) => void;
  onSelectorClick?: () => void;
};

function CurrencyInput({ label, amount, currencyCode, onAmountChange, onSelectorClick }: CurrencyInputProps) {
  const handleInputClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    // Explicitly focus to trigger mobile keyboard in Make
    setTimeout(() => {
      target.focus({ preventScroll: false });
    }, 0);
  }, []);

  return (
    <fieldset className="currency-input">
      <input
        className="currency-input__amount"
        aria-label={label}
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => onAmountChange?.(e.target.value)}
        onClick={handleInputClick}
        autoComplete="off"
      />
      <span className="currency-input__selector">
        <button
          className="currency-input__selector-btn"
          type="button"
          aria-label={`Choose currency. Currently ${currencyCode}`}
          onClick={onSelectorClick}
        >
          <Flag code={currencyCode} loading="eager" />
          <span className="currency-input__code">{currencyCode}</span>
          <ChevronDown size={16} />
        </button>
      </span>
    </fieldset>
  );
}

type Props = {
  sourceAmount: string;
  sourceCurrency: string;
  targetAmount: string;
  targetCurrency: string;
  onSourceAmountChange?: (val: string) => void;
  onTargetAmountChange?: (val: string) => void;
  onSourceCurrencyChange?: (code: string) => void;
  onTargetCurrencyChange?: (code: string) => void;
  onSwap?: () => void;
};

export function CurrencyInputGroup({
  sourceAmount,
  sourceCurrency,
  targetAmount,
  targetCurrency,
  onSourceAmountChange,
  onTargetAmountChange,
  onSourceCurrencyChange,
  onTargetCurrencyChange,
  onSwap,
}: Props) {
  const { shimmerMode } = useShimmer();
  const [openSheet, setOpenSheet] = useState<'source' | 'target' | null>(null);
  const [swapping, setSwapping] = useState(false);

  const recentCodes = currencies.map((c) => c.code);

  const handleSwap = useCallback(() => {
    setSwapping(true);
    onSwap?.();
    setTimeout(() => setSwapping(false), 300);
  }, [onSwap]);

  if (shimmerMode) return (
    <div className="currency-input-group">
      <ShimmerCurrencyInputGroup />
    </div>
  );

  return (
    <>
      <div className={`currency-input-group${swapping ? ' currency-input-group--swapping' : ''}`}>
        <CurrencyInput
          label="Amount you're sending."
          amount={sourceAmount}
          currencyCode={sourceCurrency}
          onAmountChange={onSourceAmountChange}
          onSelectorClick={() => setOpenSheet('source')}
        />
        <div className="currency-input-group__swap">
          <button
            className="currency-input-group__swap-btn"
            type="button"
            aria-label="Swap currencies"
            onClick={handleSwap}
          >
            <SwitchVertical size={16} />
          </button>
        </div>
        <CurrencyInput
          label="Amount recipient is getting."
          amount={targetAmount}
          currencyCode={targetCurrency}
          onAmountChange={onTargetAmountChange}
          onSelectorClick={() => setOpenSheet('target')}
        />
      </div>
      <CurrencySheet
        open={openSheet !== null}
        onClose={() => setOpenSheet(null)}
        onSelect={(code) => {
          if (openSheet === 'source') {
            onSourceCurrencyChange?.(code);
          } else {
            onTargetCurrencyChange?.(code);
          }
        }}
        selectedCode={openSheet === 'source' ? sourceCurrency : targetCurrency}
        recentCodes={recentCodes}
        excludeCode={openSheet === 'source' ? targetCurrency : sourceCurrency}
      />
    </>
  );
}
