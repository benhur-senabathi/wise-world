import { ShimmerBar, ShimmerButton, ShimmerBadge } from './Shimmer';

/** TaskCard: badge avatar + title + description + action button */
export function ShimmerTaskCard() {
  return (
    <div className="shimmer-task-card">
      <ShimmerBadge size={48} />
      <div className="shimmer-task-card__content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ShimmerBar width={140} height={14} />
          <ShimmerBar width={200} height={10} />
        </div>
        <ShimmerButton width={72} height={32} />
      </div>
    </div>
  );
}

