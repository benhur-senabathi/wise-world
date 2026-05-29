import { useMemo } from 'react';
import { ListItem } from '@transferwise/components';
import { Plus } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { useLanguage } from '../context/Language';
import { useVisibleAccounts } from '../hooks/useAccountRegistry';
import { useActiveCurrencies } from '../hooks/useDatasetData';
import type { AccountType } from '@shared/data/account-registry';
import type { TranslationKey } from '../translations/en';
import '../components/AccountDetailsList.css';

const currencyNameKeys: Record<string, TranslationKey> = {
  GBP: 'accountDetailsList.britishPound',
  EUR: 'accountDetailsList.euro',
  USD: 'accountDetailsList.usDollar',
  CAD: 'accountDetailsList.canadianDollar',
  TRY: 'accountDetailsList.turkishLira',
  HUF: 'accountDetailsList.hungarianForint',
  SGD: 'accountDetailsList.singaporeDollar',
};

type Props = {
  accountType?: AccountType;
  onSelectCurrency: (code: string) => void;
  from?: string;
};

export function AccountDetailsList({ accountType = 'personal', onSelectCurrency, from }: Props) {
  const { t } = useLanguage();
  const visibleAccounts = useVisibleAccounts(accountType);
  const currentAccountCurrencies = useActiveCurrencies(accountType);

  const allDetails = useMemo(() => {
    const details: { code: string; nameKey: TranslationKey; subtitle: string; accountLabel?: string }[] = [];

    const showAll = from === 'payments';
    const fromSubAccount = !!from && !['account', 'payments', 'home'].includes(from);

    if (fromSubAccount) {
      const account = visibleAccounts.find((a) => a.subPageType === from);
      if (account) {
        for (const c of account.getCurrencies()) {
          if (c.accountDetails) {
            details.push({
              code: c.code,
              nameKey: currencyNameKeys[c.code] || 'accountDetailsList.britishPound',
              subtitle: c.accountDetails,
            });
          }
        }
      }
      return details;
    }

    for (const c of currentAccountCurrencies) {
      if (c.accountDetails) {
        details.push({
          code: c.code,
          nameKey: currencyNameKeys[c.code] || 'accountDetailsList.britishPound',
          subtitle: c.accountDetails,
        });
      }
    }

    if (showAll) {
      const subAccounts = visibleAccounts.filter((a) => a.subPageType !== 'account' && a.features.hasAccountDetails);
      for (const account of subAccounts) {
        for (const c of account.getCurrencies()) {
          if (c.accountDetails) {
            details.push({
              code: c.code,
              nameKey: currencyNameKeys[c.code] || 'accountDetailsList.britishPound',
              subtitle: c.accountDetails,
              accountLabel: account.nameKey,
            });
          }
        }
      }
    }

    return details;
  }, [visibleAccounts, currentAccountCurrencies, from]);

  return (
    <div className="account-details-list">
      <h1 className="np-text-title-screen" style={{ margin: '0 0 8px' }}>
        {t('accountDetailsList.title')}
      </h1>
      <p className="np-text-body-large" style={{ margin: '0 0 32px', color: 'var(--color-content-secondary)' }}>
        {t('accountDetailsList.subtitle')}{' '}
        <a href="#" className="np-text-link-default" onClick={(e) => e.preventDefault()}>
          {t('common.learnMore')}.
        </a>
      </p>

      <div className="account-details-list__items">
        {allDetails.map((detail, i) => (
          <ListItem
            key={`${detail.code}-${i}`}
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t(detail.nameKey)}</span>}
            subtitle={detail.subtitle}
            media={
              <ListItem.AvatarView size={48}>
                <Flag code={detail.code} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => onSelectCurrency(detail.code)} />}
          />
        ))}

        <ListItem
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('accountDetailsList.receiveOther')}</span>}
          media={
            <ListItem.AvatarView size={48} style={{ backgroundColor: 'transparent' }}>
              <Plus size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      </div>
    </div>
  );
}
