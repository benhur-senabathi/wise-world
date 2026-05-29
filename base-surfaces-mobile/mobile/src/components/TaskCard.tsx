import { type ReactNode } from 'react';
import { AvatarView, Badge, StatusIcon } from '@transferwise/components';
import { useShimmer } from '../context/Shimmer';
import { ShimmerTaskCard } from './TasksStack.shimmer';
import './TaskCard.css';

type Props = {
  icon: ReactNode;
  sentiment?: 'positive' | 'negative' | 'warning';
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
};

export function TaskCard({ icon, sentiment, title, description, actionLabel, actionHref }: Props) {
  const { shimmerMode } = useShimmer();

  if (shimmerMode) return <ShimmerTaskCard />;

  const avatar = (
    <AvatarView size={48} style={{ backgroundColor: 'var(--color-background-screen)', color: 'var(--color-content-primary)' }}>
      {icon}
    </AvatarView>
  );

  return (
    <div className="task-card">
      <div className="task-card__wrapper">
        {sentiment ? (
          <Badge badge={<StatusIcon sentiment={sentiment} size={16} />}>
            {avatar}
          </Badge>
        ) : (
          avatar
        )}
        <div className="task-card__content">
          <div className="task-card__text">
            <p className="np-text-body-large-bold m-b-0" style={{ color: 'var(--color-content-primary)' }}>{title}</p>
            <span className="np-text-body-default">{description}</span>
          </div>
          <div className="task-card__action">
            <a href={actionHref ?? '#'} className="wds-Button wds-Button--small wds-Button--primary" onClick={(e) => e.preventDefault()}>
              <span className="np-text-body-default-bold wds-Button-content">
                <span className="wds-Button-label"><span className="wds-Button-labelText">{actionLabel}</span></span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
