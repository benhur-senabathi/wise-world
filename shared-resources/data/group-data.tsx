import { Plus } from '@transferwise/icons';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance } from './transactions';

export const groupTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 400.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '8 April', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 600.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '22 March', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '6 March', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 800.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '21 February', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 5,000.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '11 February', currency: 'GBP' },
];

export const groupCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '35901847',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', groupTransactions),
  },
];

export const groupTotalBalance = groupCurrencies.reduce((sum, c) => sum + c.balance, 0);
