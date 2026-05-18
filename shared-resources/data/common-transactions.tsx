import { Plus, Receive } from '@transferwise/icons';
import { logoUrl, type Transaction, type TxTranslator } from './transactions';

const defaultLabels: TxTranslator = {
  sent: 'Sent',
  sentByYou: 'Sent by you',
  added: 'Added',
  addedByYou: 'Added by you',
  moved: 'Moved',
  movedByYou: 'Moved by you',
  spentByYou: 'Spent by you',
};

export function buildCommonTransactions(consumerName: string, businessName: string, labels: TxTranslator = defaultLabels): Transaction[] {
  return [
    { name: 'Added by you', subtitle: labels.addedByYou, amount: '+ 1,500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: 'Today', currency: 'GBP' },
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: 'Yesterday', currency: 'GBP' },
    { name: 'Pret A Manger', amount: '6.40 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: 'Yesterday', currency: 'GBP' },
    { name: 'Deliveroo', amount: '18.90 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '8 April', currency: 'GBP' },
    { name: 'Sainsburys', amount: '32.50 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '7 April', currency: 'GBP' },
  ];
}

export function buildCommonBusinessTransactions(consumerName: string, labels: TxTranslator = defaultLabels): Transaction[] {
  return [
    { name: 'Added by you', subtitle: labels.addedByYou, amount: '+ 5,000.00 GBP', isPositive: true, icon: <Plus size={24} />, date: 'Today', currency: 'GBP' },
    { name: consumerName, amount: '+ 1,200.00 GBP', isPositive: true, icon: <Receive size={24} />, date: 'Yesterday', currency: 'GBP' },
    { name: 'Figma', amount: '12.00 GBP', isPositive: false, imgSrc: logoUrl('figma.com'), date: 'Yesterday', currency: 'GBP' },
    { name: 'Google Workspace', amount: '9.40 GBP', isPositive: false, imgSrc: logoUrl('google.com'), date: '8 April', currency: 'GBP' },
  ];
}
