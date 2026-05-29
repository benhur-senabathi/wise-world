import { ShimmerBar, ShimmerRect } from './Shimmer';

/** TransferCalculator: rate title + chart area + inputs + details + button */
export function ShimmerTransferCalculator() {
  return (
    <div className="shimmer-transfer-calculator">
      <ShimmerBar width={240} height={20} />
      <div className="shimmer-transfer-calculator__body">
        <ShimmerRect width="100%" height={220} borderRadius={8} />
        <div className="shimmer-transfer-calculator__inputs">
          <ShimmerRect width="100%" height={72} borderRadius={12} />
          <ShimmerRect width="100%" height={72} borderRadius={12} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
            <ShimmerBar width={200} height={12} />
            <ShimmerBar width={160} height={12} />
          </div>
          <ShimmerRect width="100%" height={48} borderRadius={24} />
        </div>
      </div>
    </div>
  );
}

