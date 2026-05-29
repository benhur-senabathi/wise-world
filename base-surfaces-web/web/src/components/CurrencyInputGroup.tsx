import { useState, useRef } from 'react';
import { SwitchVertical, ChevronDown } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { CurrencyDropdown } from './CurrencyDropdown';
import { useShimmer } from '../context/Shimmer';
import { ShimmerCurrencyInputGroup } from './CurrencyInputGroup.shimmer';
import './CurrencyInputGroup.css';

type CurrencyInputProps = {
  label: string;
  amount: string;
  currencyCode: string;
  onAmountChange?: (val: string) => void;
  onSelectorClick?: () => void;
};

function CurrencyInput({ label, amount, currencyCode, onAmountChange, onSelectorClick }: CurrencyInputProps) {
  return (
    <fieldset className="currency-input">
      <input
        className="currency-input__amount"
        aria-label={label}
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => onAmountChange?.(e.target.value)}
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
  const [openDropdown, setOpenDropdown] = useState<'source' | 'target' | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  if (shimmerMode) return (
    <div className="currency-input-group">
      <ShimmerCurrencyInputGroup />
    </div>
  );

  return (
    <div className="currency-input-group" ref={groupRef}>
      <CurrencyInput
        label="Amount you're sending."
        amount={sourceAmount}
        currencyCode={sourceCurrency}
        onAmountChange={onSourceAmountChange}
        onSelectorClick={() => setOpenDropdown(openDropdown === 'source' ? null : 'source')}
      />
      <div className="currency-input-group__swap">
        <button
          className="currency-input-group__swap-btn"
          type="button"
          aria-label="Swap currencies"
          onClick={onSwap}
        >
          <SwitchVertical size={16} />
        </button>
      </div>
      <CurrencyInput
        label="Amount recipient is getting."
        amount={targetAmount}
        currencyCode={targetCurrency}
        onAmountChange={onTargetAmountChange}
        onSelectorClick={() => setOpenDropdown(openDropdown === 'target' ? null : 'target')}
      />
      {openDropdown && (
        <div className={`currency-input-group__dropdown currency-input-group__dropdown--${openDropdown}`}>
          <CurrencyDropdown
            selectedCode={openDropdown === 'source' ? sourceCurrency : targetCurrency}
            onSelect={(code) => {
              if (openDropdown === 'source') {
                onSourceCurrencyChange?.(code);
              } else {
                onTargetCurrencyChange?.(code);
              }
              setOpenDropdown(null);
            }}
            onClose={() => setOpenDropdown(null)}
            excludeCode={openDropdown === 'source' ? targetCurrency : sourceCurrency}
          />
        </div>
      )}
    </div>
  );
}
