import { ShimmerSectionHeader, ShimmerActivitySummary } from '../components/Shimmer';

export function ShimmerTransactionList({ count = 5 }: { count?: number } = {}) {
  return (
    <div className="shimmer-transaction-list">
      <ShimmerSectionHeader />
      {Array.from({ length: count }, (_, i) => (
        <ShimmerActivitySummary key={i} />
      ))}
    </div>
  );
}
