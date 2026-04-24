import type { ReactNode } from 'react';
import {
  House, CardWise, List, Payments, Calendar,
  DirectDebits, Reload, RequestReceive, BillSplit,
  Bills, Batch, Document, QrCode, Team, Recipients, BarChart,
  Link as LinkIcon,
} from '@transferwise/icons';
import type { TranslationKey } from '../translations/en';

export type NavItem = {
  label: string;
  translationKey: TranslationKey;
  icon: ReactNode;
  href: string;
  children?: { label: string; translationKey: TranslationKey; icon: ReactNode; href: string }[];
};

export const personalNav: NavItem[] = [
  { label: 'Home', translationKey: 'nav.home', icon: <House size={24} />, href: '/home' },
  { label: 'Cards', translationKey: 'nav.cards', icon: <CardWise size={24} />, href: '/cards' },
  { label: 'Transactions', translationKey: 'nav.transactions', icon: <List size={24} />, href: '/all-transactions' },
  {
    label: 'Payments',
    translationKey: 'nav.payments',
    icon: <Payments size={24} />,
    href: '/payments',
    children: [
      { label: 'Scheduled', translationKey: 'nav.scheduled', icon: <Calendar size={16} />, href: '/payments/scheduled-transfers' },
      { label: 'Direct Debits', translationKey: 'nav.directDebits', icon: <DirectDebits size={16} />, href: '/payments/direct-debits' },
      { label: 'Recurring card payments', translationKey: 'nav.recurringCardPayments', icon: <Reload size={16} />, href: '/payments/recurring/cards' },
      { label: 'Payment requests', translationKey: 'nav.paymentRequests', icon: <RequestReceive size={16} />, href: '/payments/requests' },
      { label: 'Bill splits', translationKey: 'nav.billSplits', icon: <BillSplit size={16} />, href: '/payments/bill-splits' },
    ],
  },
  { label: 'Recipients', translationKey: 'nav.recipients', icon: <Recipients size={24} />, href: '/recipients' },
  { label: 'Insights', translationKey: 'nav.insights', icon: <BarChart size={24} />, href: '/account-summary' },
];

export const businessNav: NavItem[] = [
  { label: 'Home', translationKey: 'nav.home', icon: <House size={24} />, href: '/home' },
  { label: 'Cards', translationKey: 'nav.cards', icon: <CardWise size={24} />, href: '/cards' },
  { label: 'Transactions', translationKey: 'nav.transactions', icon: <List size={24} />, href: '/all-transactions' },
  {
    label: 'Payments',
    translationKey: 'nav.payments',
    icon: <Payments size={24} />,
    href: '/payments',
    children: [
      { label: 'Scheduled', translationKey: 'nav.scheduled', icon: <Calendar size={16} />, href: '/payments/scheduled-transfers' },
      { label: 'Direct Debits', translationKey: 'nav.directDebits', icon: <DirectDebits size={16} />, href: '/payments/direct-debits' },
      { label: 'Recurring card payments', translationKey: 'nav.recurringCardPayments', icon: <Reload size={16} />, href: '/payments/recurring/cards' },
      { label: 'Bills', translationKey: 'nav.bills', icon: <Bills size={16} />, href: '/bills' },
      { label: 'Batch', translationKey: 'nav.batch', icon: <Batch size={16} />, href: '/batch' },
      { label: 'Invoices', translationKey: 'nav.invoices', icon: <Document size={16} />, href: '/payments/invoices' },
      { label: 'Payment links', translationKey: 'nav.paymentLinks', icon: <LinkIcon size={16} />, href: '/payments/payment-links' },
      { label: 'QR codes', translationKey: 'nav.quickPay', icon: <QrCode size={16} />, href: '/payments' },
    ],
  },
  { label: 'Team', translationKey: 'nav.team', icon: <Team size={24} />, href: '/team' },
  { label: 'Recipients', translationKey: 'nav.recipients', icon: <Recipients size={24} />, href: '/recipients' },
  { label: 'Insights', translationKey: 'nav.insights', icon: <BarChart size={24} />, href: '/account-summary' },
];
