import { Plus } from '@transferwise/icons';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance, logoUrl } from './transactions';

export const sharedSpendingTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 1,200.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '10 May', currency: 'GBP' },
  { name: 'From EUR', subtitle: 'Moved by you', amount: '+ 300.00 EUR', isPositive: true, icon: <Plus size={24} />, date: '10 May', currency: 'EUR' },
  { name: 'Deliveroo', amount: '34.50 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '18 May', currency: 'GBP' },
  { name: 'Sainsbury\'s', amount: '67.82 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '16 May', currency: 'GBP' },
  { name: 'TfL', amount: '42.00 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '14 May', currency: 'GBP' },
  { name: 'Uber Eats', amount: '22.90 GBP', isPositive: false, imgSrc: logoUrl('ubereats.com'), date: '12 May', currency: 'GBP' },
  { name: 'Tesco', amount: '53.20 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '8 May', currency: 'GBP' },
  { name: 'Carrefour', amount: '45.60 EUR', isPositive: false, imgSrc: logoUrl('carrefour.com'), date: '6 May', currency: 'EUR' },
  { name: 'SNCF', amount: '78.00 EUR', isPositive: false, imgSrc: logoUrl('sncf.com'), date: '2 May', currency: 'EUR' },
  { name: 'Netflix', amount: '15.99 GBP', isPositive: false, imgSrc: logoUrl('netflix.com'), date: '1 May', currency: 'GBP' },
];

export const sharedSpendingCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '41927068',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', sharedSpendingTransactions),
    hasInterest: true,
    interestRate: '3.26%',
    totalReturns: '+0.62 GBP',
  },
  {
    code: 'EUR',
    balanceId: '58304912',
    name: 'Euro',
    symbol: '€',
    balance: computeCurrencyBalance('EUR', sharedSpendingTransactions),
  },
];

export const sharedSpendingTotalBalance = sharedSpendingCurrencies.reduce((sum, c) => sum + c.balance, 0);
