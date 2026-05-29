import { useState } from 'react';
import { Button, ListItem, IconButton } from '@transferwise/components';
import { ScanSparkle, ChevronDown } from '@transferwise/icons';
import type { AccountType } from '@shared/data/account-registry';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerActionButtonRow } from './ActionButtonRow.shimmer';
import { BottomSheet } from './BottomSheet';
import './ActionButtonRow.css';

export function ActionButtonRow({ accountType = 'personal', onAddMoney, onSend, onRequest, onPaymentLink, onScan }: { accountType?: AccountType; onAddMoney?: () => void; onSend?: () => void; onRequest?: () => void; onPaymentLink?: () => void; onScan?: () => void } = {}) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const [showRequestSheet, setShowRequestSheet] = useState(false);

  if (shimmerMode) return (
    <div className="action-button-row">
      <div className="action-button-row__scroll">
        <ShimmerActionButtonRow />
      </div>
    </div>
  );

  const isBusiness = accountType === 'business';

  return (
    <>
      <div className="action-button-row">
        <div className="action-button-row__scroll">
          <Button v2 size="md" priority="primary" onClick={onSend}>{t('common.send')}</Button>
          <Button v2 size="md" priority="secondary" onClick={onAddMoney}>{t('common.addMoney')}</Button>
          <Button
            v2
            size="md"
            priority="secondary"
            onClick={() => setShowRequestSheet(true)}
            addonEnd={!isBusiness ? { type: 'icon', value: <ChevronDown size={16} /> } : undefined}
          >
            {isBusiness ? t('common.getPaid') : t('common.request')}
          </Button>
          <Button v2 size="md" priority="secondary" onClick={onScan} addonStart={{ type: 'icon', value: <ScanSparkle size={16} /> }}>{t('common.scan' as any)}</Button>
        </div>
      </div>
      <BottomSheet
        open={showRequestSheet}
        onClose={() => setShowRequestSheet(false)}
        title={isBusiness ? t('common.getPaid') : t('common.request')}
        className="wise-bottom-sheet--compact-list"
      >
        <div style={{ padding: '0 16px' }}>
          {isBusiness ? (
            <>
              <ListItem as="div" title={t('request.sharePaymentLink')} control={<ListItem.Navigation onClick={() => { setShowRequestSheet(false); setTimeout(() => onPaymentLink?.(), 350); }} />} />
              <ListItem as="div" title={t('request.createInvoice')} control={<ListItem.Navigation onClick={() => setShowRequestSheet(false)} />} />
            </>
          ) : (
            <>
              <ListItem as="div" title={t('request.requestPayment')} control={<ListItem.Navigation onClick={() => { setShowRequestSheet(false); setTimeout(() => onRequest?.(), 350); }} />} />
              <ListItem as="div" title={t('request.splitBill')} control={<ListItem.Navigation onClick={() => setShowRequestSheet(false)} />} />
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
