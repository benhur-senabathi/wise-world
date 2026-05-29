import { ShimmerListItem } from '../components/Shimmer';

export function ShimmerMenuList({ count = 6 }: { count?: number } = {}) {
  return (
    <div className="shimmer-menu-list">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerListItem key={i} />
      ))}
    </div>
  );
}
