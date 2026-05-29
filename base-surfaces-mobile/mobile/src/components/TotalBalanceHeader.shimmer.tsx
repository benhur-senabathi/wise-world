import { ShimmerCircle, ShimmerBar } from './Shimmer';

/** TotalBalanceHeader: label bar + large amount bar + icon button */
export function ShimmerTotalBalanceHeader() {
  return (
    <div className="shimmer-total-balance-header">
      <ShimmerBar width={96} height={14} />
      <div className="shimmer-total-balance-header__row">
        <ShimmerBar width={180} height={24} />
        <ShimmerCircle size={32} />
      </div>
    </div>
  );
}

