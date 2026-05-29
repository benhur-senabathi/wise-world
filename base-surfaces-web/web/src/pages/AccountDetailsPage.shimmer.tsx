import { ShimmerBar, ShimmerCircle, ShimmerListItem } from '../components/Shimmer';

export function ShimmerAccountDetailsList() {
  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ShimmerBar width={200} height={24} />
      <ShimmerBar width={320} height={14} />
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <ShimmerListItem key={i} />
        ))}
      </div>
    </div>
  );
}

export function ShimmerAccountDetailsCard({ rows = 5 }: { rows?: number } = {}) {
  return (
    <div style={{ background: 'var(--color-background-neutral)', borderRadius: 24, padding: '8px 4px' }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ShimmerBar width={60 + i * 15} height={14} />
            <ShimmerBar width={100 + i * 25} height={16} />
            {i >= 2 && <ShimmerBar width={140 + i * 10} height={11} />}
          </div>
          <ShimmerCircle size={24} />
        </div>
      ))}
    </div>
  );
}
