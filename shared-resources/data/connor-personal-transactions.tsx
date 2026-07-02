import { Receive, Plus } from '@transferwise/icons';
import type { Transaction, TxTranslator } from './transactions';
import { logoUrl } from './transactions';

const defaultLabels: TxTranslator = {
  sent: 'Sent',
  sentByYou: 'Sent by you',
  added: 'Added',
  addedByYou: 'Added by you',
  moved: 'Moved',
  movedByYou: 'Moved by you',
  spentByYou: 'Spent by you',
};

export function buildConnorPersonalTransactions(_consumerName: string, _businessName: string, labels: TxTranslator = defaultLabels): Transaction[] {
  return [
    // Today — GBP: -4.60
    { name: 'Pret A Manger', amount: '4.60 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: 'Today', currency: 'GBP' },

    // Yesterday — GBP: +0.04, EUR: +0.04
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: 'Yesterday', currency: 'GBP' },
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 EUR', isPositive: true, icon: <Plus size={24} />, date: 'Yesterday', currency: 'EUR' },

    // 10 May — GBP: -12.50
    { name: 'Deliveroo', amount: '12.50 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '10 May', currency: 'GBP' },

    // 9 May — EUR: +10.94, GBP: +27.87
    { name: 'Benhur Design', amount: '+ 10.94 EUR', isPositive: true, icon: <Receive size={24} />, date: '9 May', currency: 'EUR' },
    { name: 'Benhur Design', amount: '+ 27.87 GBP', isPositive: true, icon: <Receive size={24} />, date: '9 May', currency: 'GBP' },

    // 8 May — EUR: -10.00, GBP: -1.00
    { name: 'Spotify', amount: '10.00 EUR', isPositive: false, imgSrc: logoUrl('spotify.com'), date: '8 May', currency: 'EUR' },
    { name: 'TfL', amount: '1.00 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '8 May', currency: 'GBP' },

    // 1 May — opening balances
    { name: 'Added by you', subtitle: labels.addedByYou, amount: '+ 2,400.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'GBP' },
    { name: 'Added by you', subtitle: labels.addedByYou, amount: '+ 850.00 EUR', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'EUR' },
  ];
}
