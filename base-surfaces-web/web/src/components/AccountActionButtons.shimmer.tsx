import { ShimmerCircularButton } from './Shimmer';

export function ShimmerAccountActionButtons({ count = 4 }: { count?: number } = {}) {
  return (
    <div className="shimmer-account-action-buttons">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerCircularButton key={i} />
      ))}
    </div>
  );
}
