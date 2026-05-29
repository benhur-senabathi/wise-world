import { ShimmerBar, ShimmerRect } from '../components/Shimmer';

export function ShimmerQuickFacts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ShimmerBar width={100} height={18} />
      <div style={{ display: 'flex', gap: 8 }}>
        <ShimmerRect width={64} height={32} borderRadius={16} />
        <ShimmerRect width={72} height={32} borderRadius={16} />
        <ShimmerRect width={64} height={32} borderRadius={16} />
      </div>
      <ShimmerBar width={200} height={12} />
      <ShimmerRect width="100%" height={120} borderRadius={16} />
    </div>
  );
}

export function ShimmerAvailabilityCards({ count = 2 }: { count?: number } = {}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <ShimmerRect key={i} width="100%" height={64} borderRadius={16} />
      ))}
    </div>
  );
}
