import { Plus } from '@transferwise/icons';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance, logoUrl } from './transactions';

export const youngExplorerTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Added by Connor Berry', amount: '+ 50.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'GBP' },
  { name: 'Roblox', amount: '4.99 GBP', isPositive: false, imgSrc: logoUrl('roblox.com'), date: '22 May', currency: 'GBP' },
  { name: 'McDonald\'s', amount: '7.80 GBP', isPositive: false, imgSrc: logoUrl('mcdonalds.com'), date: '19 May', currency: 'GBP' },
  { name: 'WHSmith', amount: '3.50 GBP', isPositive: false, imgSrc: logoUrl('whsmith.co.uk'), date: '16 May', currency: 'GBP' },
  { name: 'Vue Cinema', amount: '8.50 GBP', isPositive: false, imgSrc: logoUrl('myvue.com'), date: '13 May', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Added by Connor Berry', amount: '+ 20.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '10 May', currency: 'GBP' },
  { name: 'Greggs', amount: '4.25 GBP', isPositive: false, imgSrc: logoUrl('greggs.co.uk'), date: '8 May', currency: 'GBP' },
  { name: 'Nintendo eShop', amount: '12.99 GBP', isPositive: false, imgSrc: logoUrl('nintendo.com'), date: '5 May', currency: 'GBP' },
];

export const youngExplorerCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '64819273',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', youngExplorerTransactions),
  },
];

export const youngExplorerTotalBalance = youngExplorerCurrencies[0].balance;
