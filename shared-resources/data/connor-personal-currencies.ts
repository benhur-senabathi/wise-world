import type { CurrencyData } from './currencies';
import { buildConnorPersonalTransactions } from './connor-personal-transactions';
import { computeCurrencyBalance } from './transactions';

const transactions = buildConnorPersonalTransactions('Connor', 'Berry Design');

export const connorPersonalCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '19979296',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', transactions),
    accountDetails: '23-14-70 · 84920173',
    hasInterest: true,
    interestRate: '3.26%',
    totalReturns: '+0.08 GBP',
  },
  {
    code: 'EUR',
    balanceId: '20538898',
    name: 'Euro',
    symbol: '€',
    balance: computeCurrencyBalance('EUR', transactions),
    accountDetails: 'BE68 5390 0754 3091',
    hasInterest: true,
    interestRate: '2.73%',
    totalReturns: '+0.04 EUR',
  },
];
