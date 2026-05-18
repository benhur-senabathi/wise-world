import type { CurrencyData } from './currencies';
import { computeCurrencyBalance } from './transactions';
import { buildCommonTransactions } from './common-transactions';
import { buildCommonBusinessTransactions } from './common-transactions';

const commonTxList = buildCommonTransactions('User', 'Business');
const commonBusinessTxList = buildCommonBusinessTransactions('User');

export const commonCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '80000001',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', commonTxList),
    accountDetails: '23-14-70 · 46839215',
  },
];

export const commonBusinessCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '80000002',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', commonBusinessTxList),
    accountDetails: '23-14-70 · 91827364',
  },
];
