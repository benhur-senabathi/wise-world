import { useMemo } from 'react';
import {
  accountRegistry,
  getVisibleAccounts,
  getAccountBySubPageType,
  getAccountById,
  getAccountByBalanceId,
  buildBalanceOwnerMap,
  type AccountDefinition,
  type AccountType,
  type CardDefinition,
} from '@shared/data/account-registry';
import { useDataset } from '../context/Dataset';
import type { Transaction } from '@shared/data/transactions';
import type { CurrencyData } from '@shared/data/currencies';

export function useVisibleAccounts(accountType: AccountType): AccountDefinition[] {
  const { dataset } = useDataset();
  return useMemo(() => {
    const visible = getVisibleAccounts(accountType);
    if (dataset !== 'power') {
      return visible.filter((a) => a.subPageType === 'account');
    }
    return visible;
  }, [accountType, dataset]);
}

export function useAllTransactions(accountType: AccountType): Transaction[] {
  const accounts = useVisibleAccounts(accountType);
  return useMemo(
    () => accounts.filter((a) => a.subPageType !== 'account').flatMap((a) => a.getTransactions()),
    [accounts],
  );
}

export function useAllCurrencies(accountType: AccountType): CurrencyData[] {
  const accounts = useVisibleAccounts(accountType);
  return useMemo(
    () => accounts.filter((a) => a.subPageType !== 'account').flatMap((a) => a.getCurrencies()),
    [accounts],
  );
}

export function useAllCards(accountType: AccountType): (CardDefinition & { accountNameKey: string })[] {
  const { dataset } = useDataset();
  const accounts = useVisibleAccounts(accountType);
  return useMemo(() => {
    const result: (CardDefinition & { accountNameKey: string })[] = [];
    for (const account of accounts) {
      const allCards = account.getCards(accountType);
      if (!account.features.hasCards || allCards.length === 0) continue;
      let cards = allCards;
      if (account.subPageType === 'account') {
        if (dataset === 'common') {
          cards = cards.slice(0, 1);
        } else if (dataset === 'connor' && accountType === 'business') {
          cards = cards.slice(0, 1);
        }
      }
      for (const c of cards) {
        result.push({ ...c, accountNameKey: account.nameKey });
      }
    }
    return result;
  }, [accounts, dataset, accountType]);
}

export function useAccountForBalanceId(balanceId: string) {
  return getAccountByBalanceId(balanceId);
}

export { getAccountBySubPageType, getAccountById, getAccountByBalanceId, buildBalanceOwnerMap, accountRegistry };
export type { AccountDefinition };
