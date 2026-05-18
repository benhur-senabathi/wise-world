import { Receive, Send } from '@transferwise/icons';
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

export function buildConnorBusinessTransactions(_consumerName: string, labels: TxTranslator = defaultLabels): Transaction[] {
  return [
    // Today — GBP: -14.99
    { name: 'Figma', amount: '14.99 GBP', isPositive: false, imgSrc: logoUrl('figma.com'), date: 'Today', currency: 'GBP' },

    // Yesterday — GBP: +250.00
    { name: 'Invoice #089', amount: '+ 250.00 GBP', isPositive: true, icon: <Receive size={24} />, date: 'Yesterday', currency: 'GBP' },

    // 10 May — GBP: -220.00, SGD: +180.00
    { name: 'Contractor', subtitle: labels.sent, amount: '150.00 GBP', isPositive: false, icon: <Send size={24} />, date: '10 May', currency: 'GBP' },
    { name: 'Google Workspace', amount: '11.50 GBP', isPositive: false, imgSrc: logoUrl('google.com'), date: '10 May', currency: 'GBP' },
    { name: 'Notion', amount: '8.00 GBP', isPositive: false, imgSrc: logoUrl('notion.so'), date: '10 May', currency: 'GBP' },
    { name: 'Linear', amount: '8.00 GBP', isPositive: false, imgSrc: logoUrl('linear.app'), date: '10 May', currency: 'GBP' },
    { name: 'Vercel', amount: '20.00 GBP', isPositive: false, imgSrc: logoUrl('vercel.com'), date: '10 May', currency: 'GBP' },
    { name: 'HMRC', amount: '22.50 GBP', isPositive: false, imgSrc: logoUrl('gov.uk'), date: '10 May', currency: 'GBP' },
    { name: 'Client payment', amount: '+ 180.00 SGD', isPositive: true, icon: <Receive size={24} />, date: '10 May', currency: 'SGD' },

    // 9 May — SGD: -180.00
    { name: 'Supplier', subtitle: labels.sent, amount: '180.00 SGD', isPositive: false, icon: <Send size={24} />, date: '9 May', currency: 'SGD' },

    // 8 May — GBP: -10.00
    { name: 'Wise fee', amount: '10.00 GBP', isPositive: false, imgSrc: logoUrl('wise.com'), date: '8 May', currency: 'GBP' },

    // 1 May — opening balances
    { name: 'Client payment', amount: '+ 4,800.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '1 May', currency: 'GBP' },
    { name: 'Client payment', amount: '+ 1,250.00 SGD', isPositive: true, icon: <Receive size={24} />, date: '1 May', currency: 'SGD' },
  ];
}
