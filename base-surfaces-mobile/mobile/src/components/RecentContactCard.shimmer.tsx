import { ShimmerCircle, ShimmerBar } from './Shimmer';

/** RecentContactCard: 72px circle + name bar */
export function ShimmerRecentContactCard() {
  return (
    <div className="shimmer-recent-contact">
      <ShimmerCircle size={72} />
      <ShimmerBar width={56} height={12} />
    </div>
  );
}

/** Row of recent contact cards */
export function ShimmerRecentContacts({ count = 5 }: { count?: number } = {}) {
  return (
    <div className="shimmer-recent-contacts">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerRecentContactCard key={i} />
      ))}
    </div>
  );
}
