import { transactions, computeCurrencyBalance } from './transactions';

export type CurrencyData = {
  code: string;
  balanceId: string;
  name: string;
  symbol: string;
  balance: number;
  accountDetails?: string;
  hasStocks?: boolean;
  hasInterest?: boolean;
  interestRate?: string;
  availableBalance?: number;
  totalReturns?: string;
};

export const currencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '50417283',
    name: 'British pound',
    symbol: '\u00A3',
    balance: computeCurrencyBalance('GBP', transactions),
    accountDetails: '23-14-70 \u00B7 46839215',
    hasInterest: true,
    interestRate: '3.26%',
    totalReturns: '+1.45 GBP',
  },
  {
    code: 'EUR',
    balanceId: '28163950',
    name: 'Euro',
    symbol: '\u20AC',
    balance: computeCurrencyBalance('EUR', transactions),
    accountDetails: 'BE68 9670 3781 7624',
    hasStocks: true,
    interestRate: '2.45%',
    totalReturns: '+4.80 EUR',
  },
  {
    code: 'USD',
    balanceId: '91735042',
    name: 'United States dollar',
    symbol: '$',
    balance: computeCurrencyBalance('USD', transactions),
    accountDetails: '8311094826',
  },
  {
    code: 'CAD',
    balanceId: '63082714',
    name: 'Canadian dollar',
    symbol: 'C$',
    balance: computeCurrencyBalance('CAD', transactions),
    accountDetails: '200110083474',
  },
];

