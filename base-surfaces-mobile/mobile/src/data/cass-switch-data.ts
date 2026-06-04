// CASS inbound full-switch prototype fixtures.
// Hardcoded happy-path data: old bank (Monzo), direct debits, standing orders,
// balance, address, and the 5 progress milestones. See CASS-INBOUND-PROTOTYPE-SPEC.md.

import type { TranslationKey } from '../translations/en';

export type CassMilestone = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = not started, 1 = requested, 2 = verified, 3 = payments moving,
// 4 = balance transferring, 5 = complete

export type CassStatus = 'none' | 'initiated' | 'complete';

export type CassState = {
  status: CassStatus;
  milestone: CassMilestone;
  switchDate: Date | null;
  entryDismissed: boolean;
};

export const initialCassState: CassState = {
  status: 'none',
  milestone: 0,
  switchDate: null,
  entryDismissed: false,
};

// Old bank — CoP "succeeds" against Monzo.
export const oldBank = {
  name: 'Monzo',
  // Full legal name shown on the finalise summary row.
  displayName: 'Monzo Bank UK',
  // Monzo brand coral, used for the bank badge tint.
  brandColor: '#ff4f40',
  accountHolder: 'Benhur Senabathi',
  // Plausible masked details shown on the verified confirmation row.
  sortCode: '04-00-04',
  accountNumberMasked: '•••• 8742',
  accountType: 'Personal current account',
};

// Address "we hold" — shown pre-filled on the confirm-address step.
export const heldAddress = {
  line1: '28 Hogganfield Street',
  line2: '',
  city: 'Glasgow',
  postcode: 'G33 1DE',
  country: 'United Kingdom',
};

export type DirectDebit = {
  name: string;
  // Service-user style reference shown under the name.
  reference: string;
};

export const directDebits: DirectDebit[] = [
  { name: 'Netflix', reference: 'Netflix.com' },
  { name: 'British Gas', reference: 'British Gas Energy' },
  { name: 'Virgin Media', reference: 'Virgin Media Ltd' },
];

export type StandingOrder = {
  name: string;
  amount: string; // formatted GBP
};

export const standingOrders: StandingOrder[] = [
  { name: 'Rent', amount: '£950.00' },
  { name: 'Savings', amount: '£200.00' },
];

// Balance transferred at completion.
export const transferredBalance = '£1,240.50';

// Central redirection duration (CASS scheme: 36 months).
export const redirectionMonths = 36;

// Wise switching incentive — 2% cashback unlocked for 3+ direct debits.
export const cashback = {
  rate: '2%',
  capPerYear: '£50',
};

export type Milestone = {
  // milestone number this step represents (1–5)
  step: CassMilestone;
  labelKey: TranslationKey;
  subCopyKey: TranslationKey;
};

export const milestones: Milestone[] = [
  { step: 1, labelKey: 'cass.milestone.requested.label', subCopyKey: 'cass.milestone.requested.sub' },
  { step: 2, labelKey: 'cass.milestone.verified.label', subCopyKey: 'cass.milestone.verified.sub' },
  { step: 3, labelKey: 'cass.milestone.payments.label', subCopyKey: 'cass.milestone.payments.sub' },
  { step: 4, labelKey: 'cass.milestone.balance.label', subCopyKey: 'cass.milestone.balance.sub' },
  { step: 5, labelKey: 'cass.milestone.complete.label', subCopyKey: 'cass.milestone.complete.sub' },
];

// Switch-date window: min = today + 7 working days, max = today + ~2 months
// (per v1 scope decision). Weekdays only.

function addWorkingDays(start: Date, days: number): Date {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}

export function getMinSwitchDate(from: Date = new Date()): Date {
  const d = addWorkingDays(from, 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMaxSwitchDate(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 2);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatSwitchDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
