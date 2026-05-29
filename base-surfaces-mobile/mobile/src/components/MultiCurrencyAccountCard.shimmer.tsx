import { ShimmerCircle, ShimmerBar, ShimmerRect, ShimmerButton } from './Shimmer';

/** MultiCurrencyAccountCard: card stack + header + balance grid + footer */
export function ShimmerAccountCard() {
  return (
    <div className="shimmer-account-card">
      <ShimmerRect width="100%" height={86} borderRadius={16} />
      <div className="shimmer-account-card__front">
        <div className="shimmer-list-item" style={{ padding: '8px 0' }}>
          <ShimmerBar width={120} height={14} />
          <div style={{ flex: 1 }} />
          <ShimmerBar width={16} height={16} />
        </div>
        <div className="shimmer-account-card__balances">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="shimmer-list-item" style={{ padding: '6px 0' }}>
              <ShimmerCircle size={24} />
              <ShimmerBar width={72 + i * 8} height={12} />
              <div style={{ flex: 1 }} />
              <ShimmerBar width={16} height={16} />
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 12 }}>
          <ShimmerButton width={140} height={32} />
        </div>
      </div>
    </div>
  );
}

