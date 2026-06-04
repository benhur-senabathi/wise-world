import { useState } from 'react';
import { Button, ListItem, StatusIcon, InfoPrompt, Section } from '@transferwise/components';
import { Illustration } from '@wise/art';
import { useLanguage } from '../context/Language';
import { useCass } from '../context/Cass';
import {
  oldBank,
  milestones,
  directDebits,
  standingOrders,
  transferredBalance,
  redirectionMonths,
  cashback,
  formatSwitchDate,
} from '../data/cass-switch-data';
import './CassProgress.css';

type Props = {
  onClose: () => void;
};

export function CassProgress({ onClose }: Props) {
  const { t } = useLanguage();
  const { cass } = useCass();
  const [view, setView] = useState<'progress' | 'result'>('progress');

  const isComplete = cass.status === 'complete';

  if (view === 'result') {
    return <SwitchResult onViewAccount={onClose} />;
  }

  return (
    <div className="cass-progress">
      <h1 className="np-text-title-screen cass-progress__title">{t('cass.progress.title', { bank: oldBank.name })}</h1>
      <p className="np-text-body-large cass-progress__lede">{t('cass.progress.estimate', { date: formatSwitchDate(cass.switchDate) })}</p>

      <ol className="cass-progress__milestones">
        {milestones.map((m, i) => {
          const done = cass.milestone > m.step;
          const current = cass.milestone === m.step;
          const isLast = i === milestones.length - 1;
          const sentiment = done ? 'positive' : current ? 'pending' : 'neutral';
          return (
            <li key={m.step} className={`cass-progress__milestone${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}>
              <div className="cass-progress__rail">
                <StatusIcon sentiment={sentiment} size={32} />
                {!isLast && <span className="cass-progress__connector" />}
              </div>
              <div className="cass-progress__content">
                <p className="np-text-body-large-bold cass-progress__milestone-label">{t(m.labelKey)}</p>
                <p className="np-text-body-default cass-progress__milestone-sub">{t(m.subCopyKey, { bank: oldBank.name })}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {isComplete && (
        <div className="cass-progress__cta">
          <Button v2 size="lg" priority="primary" block onClick={() => setView('result')}>
            {t('cass.progress.seeSummary')}
          </Button>
        </div>
      )}
    </div>
  );
}

function SwitchResult({ onViewAccount }: { onViewAccount: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="cass-result">
      <div className="cass-result__header">
        <Illustration name="confetti" size="large" />
        <h1 className="np-text-title-screen cass-result__title">{t('cass.result.title')}</h1>
        <p className="np-text-body-large cass-result__subtitle">{t('cass.result.subtitle')}</p>
      </div>

      <Section>
        <p className="np-text-title-group cass-result__section-title">{t('cass.result.balanceTitle')}</p>
        <ul className="wds-list list-unstyled m-y-0">
          <ListItem
            media={<ListItem.AvatarView size={40} style={{ backgroundColor: oldBank.brandColor, color: '#fff' }}>{oldBank.name.charAt(0)}</ListItem.AvatarView>}
            title={t('cass.result.balanceMoved', { bank: oldBank.name })}
            valueTitle={transferredBalance}
          />
        </ul>
      </Section>

      <Section>
        <p className="np-text-title-group cass-result__section-title">{t('cass.result.ddTitle', { count: String(directDebits.length) })}</p>
        <ul className="wds-list list-unstyled m-y-0">
          {directDebits.map((dd) => (
            <ListItem
              key={dd.name}
              media={<ListItem.AvatarView size={40}>{dd.name.charAt(0)}</ListItem.AvatarView>}
              title={dd.name}
              subtitle={dd.reference}
            />
          ))}
        </ul>
      </Section>

      <Section>
        <p className="np-text-title-group cass-result__section-title">{t('cass.result.soTitle', { count: String(standingOrders.length) })}</p>
        <ul className="wds-list list-unstyled m-y-0">
          {standingOrders.map((so) => (
            <ListItem
              key={so.name}
              media={<ListItem.AvatarView size={40}>{so.name.charAt(0)}</ListItem.AvatarView>}
              title={so.name}
              valueTitle={so.amount}
            />
          ))}
        </ul>
      </Section>

      <Section>
        <ul className="wds-list list-unstyled m-y-0">
          <ListItem
            media={<ListItem.AvatarView size={40}><StatusIcon sentiment="positive" size={24} /></ListItem.AvatarView>}
            title={t('cass.result.redirectionTitle')}
            subtitle={t('cass.result.redirectionSub', { months: String(redirectionMonths) })}
          />
        </ul>
      </Section>

      <div className="cass-result__cashback">
        <InfoPrompt
          sentiment="proposition"
          title={t('cass.result.cashbackTitle', { rate: cashback.rate })}
          description={t('cass.result.cashbackBody', { rate: cashback.rate, cap: cashback.capPerYear })}
        />
      </div>

      <div className="cass-result__card-reminder">
        <InfoPrompt
          sentiment="neutral"
          title={t('cass.result.cardReminderTitle')}
          description={t('cass.result.cardReminderBody')}
        />
      </div>

      <div className="cass-result__ctas">
        <Button v2 size="lg" priority="primary" block onClick={onViewAccount}>{t('cass.result.viewAccount')}</Button>
        {/* Card setup is out of scope for the happy-path prototype — closes to Home. */}
        <Button v2 size="lg" priority="secondary" block onClick={onViewAccount}>{t('cass.result.setupCard')}</Button>
      </div>
    </div>
  );
}
