import { useState } from 'react';
import { CircularButton, ListItem } from '@transferwise/components';
import { Plus, Convert, Send, Receive } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerAccountActionButtons } from './Shimmer';
import { BottomSheet } from './BottomSheet';

export function AccountActionButtons({ accountType = 'personal', hideGetPaid = false, sendSecondary = false, onAdd, onConvert, onSend, onRequest, onPaymentLink }: { accountType?: AccountType; hideGetPaid?: boolean; sendSecondary?: boolean; onAdd?: () => void; onConvert?: () => void; onSend?: () => void; onRequest?: () => void; onPaymentLink?: () => void }) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const isBusiness = accountType === 'business';
  const [showRequestSheet, setShowRequestSheet] = useState(false);

  if (shimmerMode) return (
    <div className="account-action-buttons">
      <ShimmerAccountActionButtons count={hideGetPaid ? 3 : 4} />
    </div>
  );

  return (
    <>
      <div className="account-action-buttons">
        <CircularButton icon={<Plus size={24} />} priority="primary" onClick={onAdd}>{t('common.add')}</CircularButton>
        <CircularButton icon={<Convert size={24} />} priority="primary" onClick={onConvert}>{t('common.convertOrMove')}</CircularButton>
        <CircularButton icon={<Send size={24} />} priority={sendSecondary ? 'secondary' : 'primary'} onClick={sendSecondary ? undefined : onSend}>{t('common.send')}</CircularButton>
        {!hideGetPaid && (
          <CircularButton icon={<Receive size={24} />} priority="primary" onClick={() => setShowRequestSheet(true)}>{isBusiness ? t('common.getPaid') : t('common.request')}</CircularButton>
        )}
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
