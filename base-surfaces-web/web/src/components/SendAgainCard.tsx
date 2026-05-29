import { AvatarView, Button, IconButton } from '@transferwise/components';
import { Cross, FastFlag } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerSendAgainCard } from './SendAgainCard.shimmer';
import './SendAgainCard.css';

type Props = {
  name: string;
  handle: string;
  amount: string;
  avatarUrl?: string;
  showFastFlag?: boolean;
  onDismiss?: () => void;
  onRepeat?: () => void;
  onEdit?: () => void;
};

export function SendAgainCard({ name, handle, amount, avatarUrl, showFastFlag, onDismiss, onRepeat, onEdit }: Props) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();

  if (shimmerMode) return <ShimmerSendAgainCard />;

  return (
    <div className="send-again-card">
      <div className="send-again-card__header">
        <div className="send-again-card__recipient">
          <AvatarView
            size={56}
            profileName={name}
            imgSrc={avatarUrl}
            badge={showFastFlag ? { icon: <FastFlag size={16} />, type: 'action' } : undefined}
          />
          <div className="send-again-card__details">
            <span className="np-text-body-default-bold" style={{ color: 'var(--color-content-primary)' }}>{name}</span>
            <span style={{ fontSize: 12, color: 'var(--color-content-secondary)' }}>
              {handle}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-content-secondary)' }}>
              {amount}
            </span>
          </div>
        </div>
        <IconButton size={32} priority="tertiary" aria-label={`Dismiss "${name}"`} onClick={onDismiss}>
          <Cross size={16} />
        </IconButton>
      </div>
      <div className="send-again-card__actions">
        <Button v2 size="sm" priority="primary" onClick={onRepeat}>{t('common.repeat')}</Button>
        <Button v2 size="sm" priority="secondary-neutral" onClick={onEdit}>{t('common.edit')}</Button>
      </div>
    </div>
  );
}
