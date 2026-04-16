import { useState } from 'react';
import { ListItem, Button } from '@transferwise/components';
import {
  DirectDebits, RequestReceive, BillSplit, Calendar, Reload, Plus, AutoConvert, FastFlag, Upload,
  Bills, Batch, Document, Link as LinkIcon, QrCode, ShoppingBag,
} from '@transferwise/icons';
import { Flag } from '@wise/art';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import type { TranslationKey } from '../translations/en';
import { BottomSheet } from '../components/BottomSheet';

type SpotlightItem = { titleKey: TranslationKey; subtitleKey: TranslationKey; icon: React.ReactNode };

const personalSpotlightItems: SpotlightItem[] = [
  { titleKey: 'payments.scheduledTransfers', subtitleKey: 'payments.scheduledTransfersSub', icon: <Calendar size={24} /> },
  { titleKey: 'payments.directDebits', subtitleKey: 'payments.directDebitsSub', icon: <DirectDebits size={24} /> },
  { titleKey: 'payments.recurringCardPayments', subtitleKey: 'payments.recurringCardPaymentsSub', icon: <Reload size={24} /> },
  { titleKey: 'payments.paymentRequests', subtitleKey: 'payments.paymentRequestsSub', icon: <RequestReceive size={24} /> },
  { titleKey: 'payments.billSplits', subtitleKey: 'payments.billSplitsSub', icon: <BillSplit size={24} /> },
];

const businessOutgoingItems: SpotlightItem[] = [
  { titleKey: 'payments.scheduledTransfers', subtitleKey: 'payments.scheduledTransfersSub', icon: <Calendar size={24} /> },
  { titleKey: 'payments.directDebits', subtitleKey: 'payments.directDebitsSub', icon: <DirectDebits size={24} /> },
  { titleKey: 'payments.bills', subtitleKey: 'payments.billsSub', icon: <Bills size={24} /> },
  { titleKey: 'payments.recurringCardPayments', subtitleKey: 'payments.recurringCardPaymentsSub', icon: <Reload size={24} /> },
  { titleKey: 'payments.batchPayments', subtitleKey: 'payments.batchPaymentsSub', icon: <Batch size={24} /> },
];

const businessIncomingItems: SpotlightItem[] = [
  { titleKey: 'payments.invoices', subtitleKey: 'payments.invoicesSub', icon: <Document size={24} /> },
  { titleKey: 'payments.paymentLinks', subtitleKey: 'payments.paymentLinksSub', icon: <LinkIcon size={24} /> },
  { titleKey: 'payments.quickPay', subtitleKey: 'payments.quickPaySub', icon: <QrCode size={24} /> },
  { titleKey: 'payments.ecommerce', subtitleKey: 'payments.ecommerceSub', icon: <ShoppingBag size={24} /> },
];

const personalAccountDetails = [
  { currency: 'GBP', titleKey: 'payments.britishPound' as TranslationKey, number: '39215' },
  { currency: 'USD', titleKey: 'payments.usDollar' as TranslationKey, number: '94826' },
  { currency: 'EUR', titleKey: 'payments.euro' as TranslationKey, number: '17624' },
];

const businessAccountDetails = [
  { currency: 'GBP', titleKey: 'payments.britishPound' as TranslationKey, number: '04736' },
  { currency: 'USD', titleKey: 'payments.usDollar' as TranslationKey, number: '18365' },
  { currency: 'EUR', titleKey: 'payments.euro' as TranslationKey, number: '93847' },
];

function SpotlightGrid({ items }: { items: SpotlightItem[] }) {
  const { t } = useLanguage();
  return (
    <div className="payments-page__grid">
      {items.map((item) => (
        <ListItem
          key={item.titleKey}
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t(item.titleKey)}</span>}
          subtitle={t(item.subtitleKey)}
          spotlight="inactive"
          media={
            <ListItem.AvatarView
              size={48}
              badge={{ icon: <Plus size={16} />, type: 'action' as const }}
            >
              {item.icon}
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      ))}
    </div>
  );
}

export function Payments({ accountType = 'personal', onSend, onRequest, onPaymentLink, onAccountDetails, onAccountDetailsList }: { accountType?: AccountType; onSend?: () => void; onRequest?: () => void; onPaymentLink?: () => void; onAccountDetails?: (code: string) => void; onAccountDetailsList?: () => void }) {
  const { t } = useLanguage();
  const isBusiness = accountType === 'business';
  const accountDetails = isBusiness ? businessAccountDetails : personalAccountDetails;
  const [getPaidOpen, setGetPaidOpen] = useState(false);

  return (
    <>
    <div className="payments-page">
      {/* Header */}
      <div className="payments-page__header">
        <h1 className="np-text-title-screen" style={{ margin: 0 }}>{t('payments.title')}</h1>
        <div className="payments-page__header-actions">
          <Button v2 size="md" priority="primary" onClick={onSend}>{t('common.send')}</Button>
          {isBusiness ? (
            <Button v2 size="md" priority="secondary" onClick={() => setGetPaidOpen(true)}>{t('common.getPaid')}</Button>
          ) : (
            <Button v2 size="md" priority="secondary" onClick={() => onRequest?.()}>{t('common.request')}</Button>
          )}
        </div>
      </div>

      {/* Business: Outgoing / Incoming split */}
      {isBusiness ? (
        <>
          <div className="payments-page__section">
            <h3 className="np-text-title-subsection" style={{ margin: '0 0 12px' }}>{t('payments.outgoing')}</h3>
            <SpotlightGrid items={businessOutgoingItems} />
          </div>
          <div className="payments-page__section">
            <h3 className="np-text-title-subsection" style={{ margin: '0 0 12px' }}>{t('payments.incoming')}</h3>
            <SpotlightGrid items={businessIncomingItems} />
          </div>
        </>
      ) : (
        <div className="payments-page__grid">
          {personalSpotlightItems.map((item) => (
            <ListItem
              key={item.titleKey}
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t(item.titleKey)}</span>}
              subtitle={t(item.subtitleKey)}
              spotlight="inactive"
              media={
                <ListItem.AvatarView
                  size={48}
                  badge={{ icon: <Plus size={16} />, type: 'action' as const }}
                >
                  {item.icon}
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          ))}
        </div>
      )}

      {/* Payment Tools */}
      <div className="payments-page__section">
        <h3 className="np-text-title-subsection" style={{ margin: '0 0 12px' }}>
          {t('payments.paymentTools')}
        </h3>
        <div className="payments-page__tools-grid">
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('payments.yourWisetag')}</span>}
            subtitle={t('payments.wisetagSub')}
            spotlight="inactive"
            media={
              <ListItem.AvatarView
                size={48}
                imgSrc={isBusiness ? '/berry-design-logo.png' : 'https://www.tapback.co/api/avatar/connor-berry.webp'}
                badge={{ icon: <FastFlag size={16} />, type: 'action' as const }}
              />
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
          {!isBusiness && (
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('payments.sendViaLink')}</span>}
              subtitle={t('payments.sendViaLinkSub')}
              spotlight="inactive"
              media={
                <ListItem.AvatarView
                  size={48}
                  badge={{ icon: <Plus size={16} />, type: 'action' as const }}
                >
                  <LinkIcon size={24} />
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          )}
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('payments.autoConversions')}</span>}
            subtitle={t('payments.autoConversionsSub')}
            spotlight="inactive"
            media={
              <ListItem.AvatarView
                size={48}
                badge={{ icon: <Plus size={16} />, type: 'action' as const }}
              >
                <AutoConvert size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
          {!isBusiness && (
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('payments.autoTopups')}</span>}
              subtitle={t('payments.autoTopupsSub')}
              spotlight="inactive"
              media={
                <ListItem.AvatarView
                  size={48}
                  badge={{ icon: <Plus size={16} />, type: 'action' as const }}
                >
                  <Upload size={24} />
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          )}
        </div>
      </div>

      {/* Account Details */}
      <div className="payments-page__section">
        <div className="section-header" style={{ margin: '0 0 12px' }}>
          <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('common.accountDetails')}</h3>
          <Button v2 size="sm" priority="tertiary" onClick={() => onAccountDetailsList?.()}>{t('common.seeAll')}</Button>
        </div>
        <div className="payments-page__accounts-grid">
          {accountDetails.map((account) => (
            <ListItem
              key={account.currency}
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t(account.titleKey)}</span>}
              subtitle={t('payments.accountNumberEnding', { number: account.number })}
              spotlight="active"
              media={
                <ListItem.AvatarView size={48}>
                  <Flag code={account.currency} />
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => onAccountDetails?.(account.currency)} />}
            />
          ))}
        </div>
      </div>

    </div>
    {isBusiness && (
      <BottomSheet
        open={getPaidOpen}
        onClose={() => setGetPaidOpen(false)}
        title={t('common.getPaid')}
        className="wise-bottom-sheet--compact-list"
      >
        <div style={{ padding: '0 16px' }}>
          <ListItem as="div" title={t('request.sharePaymentLink')} control={<ListItem.Navigation onClick={() => { setGetPaidOpen(false); setTimeout(() => onPaymentLink?.(), 350); }} />} />
          <ListItem as="div" title={t('request.createInvoice')} control={<ListItem.Navigation onClick={() => setGetPaidOpen(false)} />} />
        </div>
      </BottomSheet>
    )}
    </>
  );
}
