import { Plus } from '@transferwise/icons';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance } from './transactions';

// 8-digit numeric group IDs (matching production URL pattern)
export const GROUP_IDS = {
  currentAccount: '48291035',
  taxes: '73850214',
  savings: '61724089',
  supplies: '39058162',
} as const;

export type JarDefinition = {
  id: string;
  nameKey: string;
  color: string;
  iconName: string;
  currencies: CurrencyData[];
  transactions: Transaction[];
};

const savingsTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 75.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '6 April', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 100.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '23 March', currency: 'GBP' },
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 150.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '9 March', currency: 'GBP' },
];

const suppliesTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 200.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 April', currency: 'GBP' },
];

export const savingsJar: JarDefinition = {
  id: GROUP_IDS.savings,
  nameKey: 'home.savings',
  color: '#FFEB69',
  iconName: 'Savings',
  currencies: [
    {
      code: 'GBP',
      balanceId: '82047136',
      name: 'British pound',
      symbol: '£',
      balance: computeCurrencyBalance('GBP', savingsTransactions),
    },
  ],
  transactions: savingsTransactions,
};

export const suppliesJar: JarDefinition = {
  id: GROUP_IDS.supplies,
  nameKey: 'home.supplies',
  color: '#A0E1E1',
  iconName: 'Suitcase',
  currencies: [
    {
      code: 'GBP',
      balanceId: '59316028',
      name: 'British pound',
      symbol: '£',
      balance: computeCurrencyBalance('GBP', suppliesTransactions),
    },
  ],
  transactions: suppliesTransactions,
};

export function getJar(id: string): JarDefinition | undefined {
  if (id === GROUP_IDS.savings) return savingsJar;
  if (id === GROUP_IDS.supplies) return suppliesJar;
  return undefined;
}
