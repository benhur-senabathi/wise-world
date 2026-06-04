import { ActionPrompt, ProgressBar } from '@transferwise/components';
import { useLanguage } from '../context/Language';
import { useCass } from '../context/Cass';
import { oldBank, formatSwitchDate } from '../data/cass-switch-data';
import './CassEntryPrompt.css';

type Props = {
  onStartSwitch: () => void;
  onOpenProgress: () => void;
};

export function CassEntryPrompt({ onStartSwitch, onOpenProgress }: Props) {
  const { t } = useLanguage();
  const { cass, dismissEntry } = useCass();

  // Progress card — replaces the entry prompt once a switch is under way.
  if (cass.status === 'initiated') {
    return (
      <button type="button" className="cass-progress-card" onClick={onOpenProgress}>
        <ProgressBar
          id="cass-progress"
          title={t('cass.progress.cardTitle', { bank: oldBank.name })}
          description={t('cass.progress.cardEstimate', { date: formatSwitchDate(cass.switchDate) })}
          progress={{ value: cass.milestone, max: 5 }}
          textEnd={t('cass.progress.cardStep', { step: String(cass.milestone) })}
        />
      </button>
    );
  }

  // Completed — link to the result summary.
  if (cass.status === 'complete') {
    return (
      <ActionPrompt
        sentiment="success"
        title={t('cass.complete.title')}
        description={t('cass.complete.description', { bank: oldBank.name })}
        action={{ label: t('cass.complete.action'), onClick: onOpenProgress }}
      />
    );
  }

  // Entry — dismissible proposition prompt.
  if (cass.entryDismissed) return null;
  return (
    <ActionPrompt
      sentiment="proposition"
      title={t('cass.entry.title')}
      description={t('cass.entry.description')}
      action={{ label: t('cass.entry.action'), onClick: onStartSwitch }}
      onDismiss={dismissEntry}
    />
  );
}
