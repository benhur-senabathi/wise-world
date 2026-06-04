import { useState } from 'react';
import { AvatarView } from '@transferwise/components';
import { Card, Receive, Bank, Check, Plus, ChevronUp, ChevronDown } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import './CassNextSteps.css';

type Props = {
  onStartSwitch: () => void;
};

const DONE = 2;
const TOTAL = 3;

// Donut geometry — no circular-progress exists in the DS, so we draw a small SVG ring.
const RING_SIZE = 56;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

export function CassNextSteps({ onStartSwitch }: Props) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="cass-next-steps">
      <div className="cass-next-steps__header">
        <div className="cass-next-steps__ring">
          <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} aria-hidden>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="var(--color-background-screen)"
              strokeWidth={RING_STROKE}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="var(--color-interactive-accent)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={RING_CIRC * (1 - DONE / TOTAL)}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>
          <span className="np-text-body-default-bold cass-next-steps__ring-label">{DONE}/{TOTAL}</span>
        </div>
        <div className="cass-next-steps__heading">
          <p className="np-text-body-large-bold cass-next-steps__title">{t('cass.nextSteps.title')}</p>
          <p className="np-text-body-default cass-next-steps__desc">{t('cass.nextSteps.description')}</p>
        </div>
        <button
          type="button"
          className="cass-next-steps__collapse"
          aria-label={t('cass.nextSteps.title')}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="cass-next-steps__actions">
          <div className="cass-next-steps__action cass-next-steps__action--done">
            <AvatarView
              size={40}
              badge={{ asset: <Check />, type: 'reference', 'aria-label': 'Done' }}
            >
              <Card size={24} />
            </AvatarView>
            <p className="np-text-body-default-bold cass-next-steps__action-title">{t('cass.nextSteps.orderCard')}</p>
          </div>

          <div className="cass-next-steps__action cass-next-steps__action--done">
            <AvatarView
              size={40}
              badge={{ asset: <Check />, type: 'reference', 'aria-label': 'Done' }}
            >
              <Receive size={24} />
            </AvatarView>
            <p className="np-text-body-default-bold cass-next-steps__action-title">{t('cass.nextSteps.receiveMoney')}</p>
          </div>

          <button type="button" className="cass-next-steps__action cass-next-steps__action--switch" onClick={onStartSwitch}>
            <AvatarView
              size={40}
              badge={{ asset: <Plus />, type: 'action', 'aria-label': 'Start' }}
            >
              <Bank size={24} />
            </AvatarView>
            <span className="cass-next-steps__action-text">
              <span className="np-text-body-default-bold cass-next-steps__action-title">{t('cass.nextSteps.switchTitle')}</span>
              <span className="np-text-body-default cass-next-steps__action-sub">{t('cass.nextSteps.switchDescription')}</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
