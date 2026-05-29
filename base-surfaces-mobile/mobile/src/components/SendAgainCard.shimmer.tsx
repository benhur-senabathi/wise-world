import { ShimmerCircle, ShimmerBar, ShimmerButton } from './Shimmer';

/** SendAgainCard: avatar + name/handle/amount + dismiss + buttons */
export function ShimmerSendAgainCard() {
  return (
    <div className="shimmer-send-again-card">
      <div className="shimmer-send-again-card__header">
        <ShimmerCircle size={56} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <ShimmerBar width={80} height={12} />
          <ShimmerBar width={100} height={10} />
          <ShimmerBar width={64} height={10} />
        </div>
        <ShimmerCircle size={32} />
      </div>
      <div className="shimmer-send-again-card__actions">
        <ShimmerButton width={64} height={32} />
        <ShimmerButton width={56} height={32} />
      </div>
    </div>
  );
}

