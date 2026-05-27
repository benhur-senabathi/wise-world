import { CircularButton } from '@transferwise/components';
import { Plus, Convert, Send, Receive } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerAccountActionButtons } from './Shimmer';

export function AccountActionButtons({ accountType = 'personal', hideGetPaid = false, sendSecondary = false, moveOnly = false, onAdd, onConvert, onSend, onRequest, onPaymentLink }: { accountType?: AccountType; hideGetPaid?: boolean; sendSecondary?: boolean; moveOnly?: boolean; onAdd?: () => void; onConvert?: () => void; onSend?: () => void; onRequest?: () => void; onPaymentLink?: () => void }) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const isBusiness = accountType === 'business';
  const showSend = !moveOnly && !!onSend;
  const buttonCount = moveOnly ? 2 : ((showSend ? 1 : 0) + (hideGetPaid ? 0 : 1) + 2);

  if (shimmerMode) return (
    <div className="account-action-buttons">
      <ShimmerAccountActionButtons count={buttonCount} />
    </div>
  );

  return (
    <div className="account-action-buttons">
      <CircularButton icon={<Plus size={24} />} priority="primary" onClick={onAdd}>{t('common.add')}</CircularButton>
      {!moveOnly && <CircularButton icon={<Convert size={24} />} priority="primary" onClick={onConvert}>{t('common.convertOrMove')}</CircularButton>}
      {moveOnly && <CircularButton icon={<Convert size={24} />} priority="primary" onClick={onConvert}>{t('common.move')}</CircularButton>}
      {showSend && (
        <CircularButton icon={<Send size={24} />} priority={sendSecondary ? 'secondary' : 'primary'} onClick={sendSecondary ? undefined : onSend}>{t('common.send')}</CircularButton>
      )}
      {!hideGetPaid && !moveOnly && (
        <CircularButton icon={<Receive size={24} />} priority="primary" onClick={isBusiness ? onPaymentLink : onRequest}>{isBusiness ? t('common.getPaid') : t('common.request')}</CircularButton>
      )}
    </div>
  );
}
