import { ShimmerAccountCard } from './MultiCurrencyAccountCard.shimmer';

export function ShimmerCarousel({ count = 2 }: { count?: number } = {}) {
  return (
    <div className="shimmer-carousel">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerAccountCard key={i} />
      ))}
    </div>
  );
}
