import type { CurrencyData } from './currencies';
import { buildConnorBusinessTransactions } from './connor-business-transactions';
import { computeCurrencyBalance } from './transactions';

const transactions = buildConnorBusinessTransactions('Benhur');

export const connorBusinessCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '25047932',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', transactions),
    accountDetails: '23-14-70 · 50291836',
  },
  {
    code: 'SGD',
    balanceId: '28450427',
    name: 'Singapore dollar',
    symbol: 'S$',
    balance: computeCurrencyBalance('SGD', transactions),
    accountDetails: '7171 · 038-291-847',
  },
];
