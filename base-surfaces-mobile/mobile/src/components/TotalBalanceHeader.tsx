import { IconButton } from '@transferwise/components';
import { BarChart } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerTotalBalanceHeader } from './Shimmer';

const EyeShutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12.348 14.4c3.286-.178 5.52-2.854 6.859-4.6l1.586 1.218c-.286.373-.645.836-1.078 1.333l.429.428.849.849.424.424-1.414 1.415-.425-.425-.848-.848-.416-.416a12 12 0 0 1-1.802 1.34l.166.288.562.974.281.487-1.732 1-.28-.487-.563-.974-.254-.44A8.4 8.4 0 0 1 13 16.35v1.988h-2V16.35a8.4 8.4 0 0 1-1.928-.467l-.302.523-.563.974-.281.487-1.732-1 .281-.487.563-.974.24-.417a12 12 0 0 1-1.627-1.241l-.365.365-.796.796-.397.398-1.415-1.415.398-.397.796-.796.383-.383c-.42-.483-.769-.933-1.048-1.298l1.586-1.217c1.34 1.745 3.573 4.42 6.859 4.6z" clipRule="evenodd"/>
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.843 13.607C6.222 11.799 8.55 9 12 9s5.778 2.8 7.157 4.607l1.59-1.213C19.428 10.664 16.55 7 12 7s-7.428 3.665-8.747 5.393zM10 15a2 2 0 1 1 4 0 2 2 0 0 1-4 0m2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clipRule="evenodd"/>
  </svg>
);

export function TotalBalanceHeader({ amount, currency, onInsightsClick, variant = 'personal', balanceHidden, onToggleBalance }: { amount: string; currency: string; onInsightsClick?: () => void; variant?: 'personal' | 'business'; balanceHidden?: boolean; onToggleBalance?: () => void }) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();

  if (shimmerMode) return (
    <div className="total-balance-header">
      <ShimmerTotalBalanceHeader />
    </div>
  );

  return (
    <div className="total-balance-header">
      <div className="np-text-body-large" style={{ marginBottom: 0 }}>{t('balance.totalBalance')}</div>
      <div className="total-balance-header__amount">
        <h2 className="np-text-title-subsection" style={{ margin: 0 }}>
          {balanceHidden ? `**** ${currency}` : `${amount} ${currency}`}
        </h2>
        {variant === 'business' ? (
          <IconButton
            size={32}
            priority="tertiary"
            aria-label={balanceHidden ? t('balance.showBalance') : t('balance.hideBalance')}
            onClick={onToggleBalance}
            style={{ background: 'var(--color-background-neutral)', border: 'none' }}
          >
            {balanceHidden ? <EyeShutIcon /> : <EyeOpenIcon />}
          </IconButton>
        ) : (
          <IconButton
            size={32}
            priority="tertiary"
            aria-label={t('balance.balanceBreakdown')}
            onClick={onInsightsClick}
            style={{ background: 'var(--color-background-neutral)', border: 'none' }}
          >
            <BarChart size={16} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
