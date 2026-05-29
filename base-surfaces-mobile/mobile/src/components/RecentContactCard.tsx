import type { ReactNode } from 'react';
import { AvatarView } from '@transferwise/components';
import { useShimmer } from '../context/Shimmer';
import { ShimmerRecentContactCard } from './RecentContactCard.shimmer';
import './RecentContactCard.css';

type RecentContactCardProps = {
  name: string;
  subtitle?: string;
  imgSrc?: string;
  initials?: string;
  badge?: { icon?: ReactNode; type?: 'action'; flagCode?: string };
  onClick?: () => void;
};

export function RecentContactCard({ name, subtitle, imgSrc, initials, badge, onClick }: RecentContactCardProps) {
  const { shimmerMode } = useShimmer();

  if (shimmerMode) return <ShimmerRecentContactCard />;

  return (
    <button className="recent-contact-card" type="button" onClick={onClick}>
      <div className="recent-contact-card__avatar-wrapper">
        {imgSrc ? (
          <AvatarView size={72} imgSrc={imgSrc} badge={badge} />
        ) : (
          <AvatarView size={72} badge={badge} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
            {initials}
          </AvatarView>
        )}
      </div>
      <span className="recent-contact-card__name np-text-body-large" style={{ fontWeight: 600 }}>
        {name}
      </span>
      {subtitle && (
        <span className="recent-contact-card__subtitle np-text-body-default">
          {subtitle}
        </span>
      )}
    </button>
  );
}
