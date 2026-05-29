import { ShimmerCircle, ShimmerBar } from './Shimmer';

/** EmptyAccountCard: grey top area + centered title/description/circle button */
export function ShimmerEmptyAccountCard() {
  return (
    <div className="shimmer-account-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', paddingBottom: '20%' }}>
        <div className="shimmer-el" style={{ position: 'absolute', top: -8, left: -8, right: -8, height: 'calc(100% + 8px)', borderRadius: '20px 20px 0 0' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 24px', flex: 1 }}>
        <ShimmerBar width={180} height={16} />
        <div style={{ marginTop: 8 }}><ShimmerBar width={240} height={12} /></div>
        <div style={{ marginTop: 16 }}><ShimmerCircle size={56} /></div>
      </div>
    </div>
  );
}

