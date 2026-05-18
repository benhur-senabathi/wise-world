import { Plus } from '@transferwise/icons';
import type { Transaction } from './transactions';
import { computeCurrencyBalance } from './transactions';
import type { JarDefinition } from './jar-data';

const jarTransaction: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 1,200.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '2 May', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 800.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '15 April', currency: 'GBP' },
];

export const connorBusinessJars: JarDefinition[] = [
  {
    id: '67335737',
    nameKey: 'home.jar',
    color: '#FFEB69',
    iconName: 'Savings',
    currencies: [{ code: 'GBP', balanceId: '150655777', name: 'British pound', symbol: '£', balance: computeCurrencyBalance('GBP', jarTransaction) }],
    transactions: jarTransaction,
  },
];
