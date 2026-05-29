import { ShimmerCircle, ShimmerBar, ShimmerButton } from './Shimmer';
import { ShimmerAccountActionButtons } from './AccountActionButtons.shimmer';

/** AccountPageHeader: avatar + breadcrumb + balance + buttons */
export function ShimmerAccountPageHeader() {
  return (
    <div className="shimmer-account-page-header">
      <div className="shimmer-account-page-header__top">
        <ShimmerCircle size={32} />
        <ShimmerBar width={160} height={14} />
      </div>
      <div className="shimmer-account-page-header__bottom">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ShimmerBar width={200} height={28} />
          <ShimmerButton width={160} height={32} />
        </div>
        <ShimmerAccountActionButtons count={4} />
      </div>
    </div>
  );
}

