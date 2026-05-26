import { useState, useEffect, useRef } from 'react';
import { Search, Check } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { usdBaseRates, currencyMeta } from '@shared/data/currency-rates';
import { useShimmer } from '../context/Shimmer';
import { ShimmerCurrencyDropdown } from './Shimmer';

type Currency = {
  code: string;
  name: string;
};

const recentCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro' },
  { code: 'HUF', name: 'Hungarian forint' },
];

// Derive available currencies from the rates API data — only currencies with a conversion rate are shown
const allCurrencies: Currency[] = Object.keys(usdBaseRates)
  .sort()
  .map((code) => ({ code, name: currencyMeta[code]?.name ?? code }));

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  onClose: () => void;
  excludeCode?: string;
};

export function CurrencyDropdown({ selectedCode, onSelect, onClose, excludeCode }: Props) {
  const { shimmerMode } = useShimmer();
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (shimmerMode) return <ShimmerCurrencyDropdown />;

  const query = search.toLowerCase();
  const filteredRecent = recentCurrencies.filter(
    (c) => c.code !== excludeCode && (c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query))
  );
  const recentCodes = new Set(recentCurrencies.map((c) => c.code));
  const filteredAll = allCurrencies.filter(
    (c) => c.code !== excludeCode && !recentCodes.has(c.code) && (c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query))
  );

  const handleSelect = (code: string) => {
    onSelect(code);
    onClose();
  };

  return (
    <div className="currency-dropdown" ref={ref}>
      <div className="currency-dropdown__search">
        <Search size={16} />
        <input
          ref={inputRef}
          type="text"
          className="currency-dropdown__search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder=""
        />
      </div>

      {filteredRecent.length > 0 && (
        <div className="currency-dropdown__section">
          <div className="currency-dropdown__section-header np-text-body-default">Recent currencies</div>
          <div className="currency-dropdown__divider" />
          {filteredRecent.map((c) => (
            <button
              key={`recent-${c.code}`}
              type="button"
              className={`currency-dropdown__row${selectedCode === c.code ? ' currency-dropdown__row--selected' : ''}`}
              onClick={() => handleSelect(c.code)}
            >
              <span className="currency-dropdown__flag">
                <Flag code={c.code} loading="eager" />
              </span>
              <span className="currency-dropdown__code np-text-body-large">{c.code}</span>
              <span className="currency-dropdown__name np-text-body-default">{c.name}</span>
              {selectedCode === c.code && <Check size={16} className="currency-dropdown__check" />}
            </button>
          ))}
        </div>
      )}

      {filteredAll.length > 0 && (
        <div className="currency-dropdown__section">
          <div className="currency-dropdown__section-header np-text-body-default">All currencies</div>
          <div className="currency-dropdown__divider" />
          {filteredAll.map((c) => (
            <button
              key={`all-${c.code}`}
              type="button"
              className={`currency-dropdown__row${selectedCode === c.code ? ' currency-dropdown__row--selected' : ''}`}
              onClick={() => handleSelect(c.code)}
            >
              <span className="currency-dropdown__flag">
                <Flag code={c.code} loading="eager" />
              </span>
              <span className="currency-dropdown__code np-text-body-large">{c.code}</span>
              <span className="currency-dropdown__name np-text-body-default">{c.name}</span>
              {selectedCode === c.code && <Check size={16} className="currency-dropdown__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
