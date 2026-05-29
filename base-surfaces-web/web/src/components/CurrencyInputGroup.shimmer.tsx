import { ShimmerCircle, ShimmerRect } from './Shimmer';

/** CurrencyInputGroup: source input + swap + target input */
export function ShimmerCurrencyInputGroup() {
  return (
    <div className="shimmer-currency-input-group">
      <ShimmerRect width="100%" height={56} borderRadius={12} />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
        <ShimmerCircle size={32} />
      </div>
      <ShimmerRect width="100%" height={56} borderRadius={12} />
    </div>
  );
}

