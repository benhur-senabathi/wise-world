import type { CurrencyData } from './currencies';
import { computeCurrencyBalance } from './transactions';
import { businessTransactions } from './business-transactions';

export const businessCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '17480352',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', businessTransactions),
    accountDetails: '23-14-70 · 81204736',
  },
  {
    code: 'USD',
    balanceId: '85230641',
    name: 'United States dollar',
    symbol: '$',
    balance: computeCurrencyBalance('USD', businessTransactions),
    accountDetails: '9402718365',
  },
  {
    code: 'EUR',
    balanceId: '40917263',
    name: 'Euro',
    symbol: '€',
    balance: computeCurrencyBalance('EUR', businessTransactions),
    accountDetails: 'BE42 9670 5519 3847',
  },
  {
    code: 'SGD',
    balanceId: '72604185',
    name: 'Singapore dollar',
    symbol: 'S$',
    balance: computeCurrencyBalance('SGD', businessTransactions),
    accountDetails: '2048193756',
  },
];
