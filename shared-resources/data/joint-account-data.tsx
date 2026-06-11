import { Plus } from '@transferwise/icons';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance, logoUrl } from './transactions';

export const jointTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 2,500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'GBP' },
  { name: 'From USD', subtitle: 'Moved by you', amount: '+ 500.00 USD', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'USD' },
  { name: 'British Gas', amount: '94.00 GBP', isPositive: false, imgSrc: logoUrl('britishgas.co.uk'), date: '20 May', currency: 'GBP' },
  { name: 'Council Tax', amount: '187.00 GBP', isPositive: false, imgSrc: logoUrl('gov.uk'), date: '18 May', currency: 'GBP' },
  { name: 'Mortgage payment', amount: '1,250.00 GBP', isPositive: false, imgSrc: logoUrl('nationwide.co.uk'), date: '15 May', currency: 'GBP' },
  { name: 'Waitrose', amount: '89.43 GBP', isPositive: false, imgSrc: logoUrl('waitrose.com'), date: '14 May', currency: 'GBP' },
  { name: 'Netflix', amount: '17.99 USD', isPositive: false, imgSrc: logoUrl('netflix.com'), date: '12 May', currency: 'USD' },
  { name: 'Amazon', amount: '42.50 USD', isPositive: false, imgSrc: logoUrl('amazon.com'), date: '10 May', currency: 'USD' },
  { name: 'Thames Water', amount: '38.00 GBP', isPositive: false, imgSrc: logoUrl('thameswater.co.uk'), date: '8 May', currency: 'GBP' },
  { name: 'Ocado', amount: '112.60 GBP', isPositive: false, imgSrc: logoUrl('ocado.com'), date: '6 May', currency: 'GBP' },
  { name: 'Spotify Family', amount: '16.99 USD', isPositive: false, imgSrc: logoUrl('spotify.com'), date: '4 May', currency: 'USD' },
  { name: 'John Lewis', amount: '65.00 GBP', isPositive: false, imgSrc: logoUrl('johnlewis.com'), date: '2 May', currency: 'GBP' },
];

export const jointCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '76502831',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', jointTransactions),
    accountDetails: '23-14-70 · 81052943',
    hasInterest: true,
    interestRate: '3.26%',
    totalReturns: '+1.12 GBP',
  },
  {
    code: 'USD',
    balanceId: '29481057',
    name: 'United States dollar',
    symbol: '$',
    balance: computeCurrencyBalance('USD', jointTransactions),
    accountDetails: '9402184763',
    hasInterest: true,
    interestRate: '4.50%',
    totalReturns: '+2.34 USD',
  },
];

export const jointTotalBalance = jointCurrencies.reduce((sum, c) => sum + c.balance, 0);
