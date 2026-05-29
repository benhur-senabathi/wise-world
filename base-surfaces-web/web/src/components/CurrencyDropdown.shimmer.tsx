import { ShimmerCircle, ShimmerBar, ShimmerRect } from './Shimmer';

/** CurrencyDropdown: search + sections with rows */
export function ShimmerCurrencyDropdown() {
  return (
    <div className="shimmer-currency-dropdown">
      <ShimmerRect width="100%" height={44} borderRadius={12} />
      <ShimmerBar width={120} height={12} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="shimmer-list-item" style={{ padding: '8px 0' }}>
            <ShimmerCircle size={24} />
            <ShimmerBar width={40} height={12} />
            <ShimmerBar width={100 + i * 16} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

