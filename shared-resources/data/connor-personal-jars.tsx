import { Plus } from '@transferwise/icons';
import type { Transaction } from './transactions';
import { computeCurrencyBalance } from './transactions';
import type { JarDefinition } from './jar-data';

const savingsTx: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '5 May', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 250.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '20 April', currency: 'GBP' },
];

const spareChangeTx: Transaction[] = [
  { name: 'Round-up', subtitle: 'Moved by you', amount: '+ 12.40 GBP', isPositive: true, icon: <Plus size={24} />, date: '8 May', currency: 'GBP' },
  { name: 'Round-up', subtitle: 'Moved by you', amount: '+ 8.65 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'GBP' },
];

export const connorPersonalJars: JarDefinition[] = [
  {
    id: '67433115',
    nameKey: 'home.savings',
    color: '#FFEB69',
    iconName: 'Savings',
    currencies: [{ code: 'GBP', balanceId: '150848683', name: 'British pound', symbol: '£', balance: computeCurrencyBalance('GBP', savingsTx) }],
    transactions: savingsTx,
  },
  {
    id: '43068327',
    nameKey: 'home.spareChange',
    color: '#A0E1E1',
    iconName: 'Savings',
    currencies: [{ code: 'GBP', balanceId: '59517723', name: 'British pound', symbol: '£', balance: computeCurrencyBalance('GBP', spareChangeTx) }],
    transactions: spareChangeTx,
  },
];
