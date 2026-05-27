import { useMemo } from 'react';
import { useDataset, type DatasetType } from '../context/Dataset';
import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { commonCurrencies, commonBusinessCurrencies } from '@shared/data/common-currencies';
import { buildTransactions, type Transaction, type TxTranslator } from '@shared/data/transactions';
import { buildBusinessTransactions } from '@shared/data/business-transactions';
import { buildCommonTransactions, buildCommonBusinessTransactions } from '@shared/data/common-transactions';
import { savingsJar, suppliesJar, registerJarResolver, type JarDefinition } from '@shared/data/jar-data';
import { connorPersonalCurrencies } from '@shared/data/connor-personal-currencies';
import { connorBusinessCurrencies } from '@shared/data/connor-business-currencies';
import { buildConnorPersonalTransactions } from '@shared/data/connor-personal-transactions';
import { buildConnorBusinessTransactions } from '@shared/data/connor-business-transactions';
import { connorPersonalJars } from '@shared/data/connor-personal-jars';
import { connorBusinessJars } from '@shared/data/connor-business-jars';
import type { CurrencyData } from '@shared/data/currencies';
import type { AccountType } from '../App';

const allConnorJars = [...connorPersonalJars, ...connorBusinessJars];
registerJarResolver((id) => allConnorJars.find((j) => j.id === id));

export function useActiveCurrencies(accountType: AccountType): CurrencyData[] {
  const { dataset } = useDataset();
  if (dataset === 'connor') {
    return accountType === 'business' ? connorBusinessCurrencies : connorPersonalCurrencies;
  }
  if (dataset === 'common') {
    return accountType === 'business' ? commonBusinessCurrencies : commonCurrencies;
  }
  return accountType === 'business' ? businessCurrencies : currencies;
}

export function useActiveTransactions(
  accountType: AccountType,
  consumerName: string,
  businessName: string,
  txLabels: TxTranslator,
): Transaction[] {
  const { dataset } = useDataset();
  return useMemo(() => {
    if (dataset === 'connor') {
      return accountType === 'business'
        ? buildConnorBusinessTransactions(consumerName, txLabels)
        : buildConnorPersonalTransactions(consumerName, businessName, txLabels);
    }
    if (dataset === 'common') {
      return accountType === 'business'
        ? buildCommonBusinessTransactions(consumerName, txLabels)
        : buildCommonTransactions(consumerName, businessName, txLabels);
    }
    if (accountType === 'business') return buildBusinessTransactions(consumerName, txLabels);
    return buildTransactions(consumerName, businessName, txLabels);
  }, [accountType, dataset, consumerName, businessName, txLabels]);
}

export function useActiveJars(accountType: AccountType): JarDefinition[] {
  const { dataset } = useDataset();
  if (dataset === 'connor') {
    return accountType === 'business' ? connorBusinessJars : connorPersonalJars;
  }
  if (dataset === 'common') return [];
  return accountType === 'business' ? [suppliesJar] : [savingsJar];
}

export type { DatasetType };
