import { AvatarView, Badge, StatusIcon, Button } from '@transferwise/components';
import { FastFlag } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import { oldBank } from '../data/cass-switch-data';
import './CassSwitchTask.css';

type Props = {
  onContinue: () => void;
  onCancel: () => void;
};

export function CassSwitchTask({ onContinue, onCancel }: Props) {
  const { t } = useLanguage();

  return (
    <div className="cass-switch-task">
      <div className="cass-switch-task__wrapper">
        <Badge badge={<StatusIcon sentiment="warning" size={16} />}>
          <AvatarView size={48} style={{ backgroundColor: 'var(--color-background-screen)', color: 'var(--color-content-primary)' }}>
            <FastFlag size={24} />
          </AvatarView>
        </Badge>
        <div className="cass-switch-task__content">
          <div className="cass-switch-task__text">
            <p className="np-text-body-large-bold m-b-0" style={{ color: 'var(--color-content-primary)' }}>{t('cass.task.title')}</p>
            <span className="np-text-body-default">{t('cass.task.description', { bank: oldBank.name })}</span>
          </div>
          <div className="cass-switch-task__actions">
            <Button v2 size="sm" priority="primary" onClick={onContinue}>{t('common.continue')}</Button>
            <Button v2 size="sm" priority="secondary" onClick={onCancel}>{t('common.cancel')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
