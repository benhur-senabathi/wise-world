import { useState } from 'react';
import { IconButton, Modal } from '@transferwise/components';
import { BarChart, InfoCircle } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerTotalBalanceHeader } from './TotalBalanceHeader.shimmer';
import './TotalBalanceHeader.css';

export function TotalBalanceHeader({ amount, currency, onInsightsClick, variant = 'personal' }: { amount: string; currency: string; onInsightsClick?: () => void; variant?: 'personal' | 'business' }) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false);

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
          {amount} {currency}
        </h2>
        {variant === 'business' ? (
          <IconButton
            size={24}
            priority="minimal"
            aria-label={t('balance.balanceInfo')}
            onClick={() => setIsBalanceInfoOpen(true)}
          >
            <InfoCircle size={16} />
          </IconButton>
        ) : (
          <IconButton
            size={32}
            priority="tertiary"
            aria-label={t('balance.balanceBreakdown')}
            onClick={onInsightsClick}
          >
            <BarChart size={16} />
          </IconButton>
        )}
      </div>

      {variant === 'business' && (
        <Modal
          open={isBalanceInfoOpen}
          onClose={() => setIsBalanceInfoOpen(false)}
          title={t('balance.totalBalance')}
          body={
            <>
              <p className="np-text-body-large" style={{ margin: 0 }}>
                {t('balance.modalBody1')}
              </p>
              <p className="np-text-body-large" style={{ margin: '12px 0 0' }}>
                {t('balance.modalBody2')}
              </p>
            </>
          }
        />
      )}
    </div>
  );
}
