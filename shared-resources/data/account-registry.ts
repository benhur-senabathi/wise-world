import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';

export type AccountType = 'personal' | 'business';

export type AccountStyle = {
  color: string;
  textColor: string;
  iconName: string;
};

export type AccountFeatures = {
  hasCards: boolean;
  hasAccountDetails: boolean;
  hasSend: boolean;
  hasRequest: boolean;
  hasPaymentLink: boolean;
  hasConvert: boolean;
  moveOnly: boolean;
  hideAddCurrency: boolean;
  singleCurrency: boolean;
  hasParticipants: boolean;
  participantStyle: 'sharing' | 'team' | null;
};

export type CardDefinition = {
  type: 'physical' | 'digital';
  lastFour: string;
  image: string;
};

export type HomeCardConfig = {
  cardTopImage?: string;
  cardBottomImage?: string;
  cardInfoLight: boolean;
};

export type Participant = {
  name: string;
  imgSrc: string;
};

export type AccountDefinition = {
  id: string;
  subPageType: string;
  nameKey: string;
  style: AccountStyle;
  visibleFor: AccountType[];
  features: AccountFeatures;
  getCards: (accountType: AccountType) => CardDefinition[];
  homeCard: HomeCardConfig;
  participants: Participant[];
  getCurrencies: () => CurrencyData[];
  getTransactions: () => Transaction[];
  menuItemKeys: string[];
};

import { currencies } from './currencies';
import { groupCurrencies, groupTransactions } from './group-data';
import { sharedSpendingCurrencies, sharedSpendingTransactions } from './shared-spending-data';
import { jointCurrencies, jointTransactions } from './joint-account-data';
import { youngExplorerCurrencies, youngExplorerTransactions } from './young-explorer-data';
import { GROUP_IDS } from './jar-data';

export { GROUP_IDS };

export const accountRegistry: AccountDefinition[] = [
  {
    id: GROUP_IDS.currentAccount,
    subPageType: 'account',
    nameKey: 'home.currentAccount',
    style: { color: '#9FE870', textColor: '#163300', iconName: 'WiseLogo' },
    visibleFor: ['personal', 'business'],
    features: {
      hasCards: true,
      hasAccountDetails: true,
      hasSend: true,
      hasRequest: true,
      hasPaymentLink: true,
      hasConvert: true,
      moveOnly: false,
      hideAddCurrency: false,
      singleCurrency: false,
      hasParticipants: false,
      participantStyle: null,
    },
    getCards: (accountType) => accountType === 'business'
      ? [
          { type: 'physical', lastFour: '5271', image: '/wise-card-biz-physical.png' },
          { type: 'digital', lastFour: '9034', image: '/wise-card-biz-digital-aqua.png' },
        ]
      : [
          { type: 'physical', lastFour: '8130', image: '/wise-card-physical.png' },
          { type: 'digital', lastFour: '6663', image: '/wise-card-personal-digital-turquoise.png' },
        ],
    homeCard: { cardInfoLight: false },
    participants: [],
    getCurrencies: () => currencies,
    getTransactions: () => [],
    menuItemKeys: ['currentAccount.editCurrentAccount', 'common.statementsAndReports'],
  },
  {
    id: GROUP_IDS.group,
    subPageType: 'group-account',
    nameKey: 'home.taxes',
    style: { color: '#FFEB69', textColor: '#3a341c', iconName: 'Money' },
    visibleFor: ['business'],
    features: {
      hasCards: true,
      hasAccountDetails: false,
      hasSend: true,
      hasRequest: false,
      hasPaymentLink: false,
      hasConvert: true,
      moveOnly: false,
      hideAddCurrency: false,
      singleCurrency: false,
      hasParticipants: true,
      participantStyle: 'team',
    },
    getCards: () => [
      { type: 'digital', lastFour: '6841', image: '/wise-card-biz-digital-aqua.png' },
      { type: 'digital', lastFour: '2907', image: '/wise-card-biz-digital-yellow.png' },
    ],
    homeCard: { cardTopImage: '/card-tapestry-orange.jpg', cardBottomImage: '/card-tapestry-green.jpg', cardInfoLight: true },
    participants: [
      { name: 'Jamie Reynolds', imgSrc: 'https://www.tapback.co/api/avatar/jamie-reynolds.webp' },
    ],
    getCurrencies: () => groupCurrencies,
    getTransactions: () => groupTransactions,
    menuItemKeys: ['currentAccount.editGroup', 'common.statementsAndReports', 'currentAccount.closeGroup'],
  },
  {
    id: GROUP_IDS.sharedSpending,
    subPageType: 'shared-spending-account',
    nameKey: 'home.sharedSpending',
    style: { color: '#a0e1e1', textColor: '#21231d', iconName: 'People' },
    visibleFor: ['personal'],
    features: {
      hasCards: true,
      hasAccountDetails: false,
      hasSend: true,
      hasRequest: false,
      hasPaymentLink: false,
      hasConvert: true,
      moveOnly: false,
      hideAddCurrency: false,
      singleCurrency: false,
      hasParticipants: true,
      participantStyle: 'sharing',
    },
    getCards: () => [
      { type: 'digital', lastFour: '3491', image: '/wise-card-personal-digital-green.png' },
    ],
    homeCard: { cardBottomImage: '/wise-card-personal-digital-green-bg.png', cardInfoLight: true },
    participants: [
      { name: 'Jamie Reynolds', imgSrc: 'https://www.tapback.co/api/avatar/jamie-reynolds.webp' },
    ],
    getCurrencies: () => sharedSpendingCurrencies,
    getTransactions: () => sharedSpendingTransactions,
    menuItemKeys: ['currentAccount.editSharedSpending', 'common.statementsAndReports', 'currentAccount.closeSharedSpending'],
  },
  {
    id: GROUP_IDS.joint,
    subPageType: 'joint-account',
    nameKey: 'home.jointAccount',
    style: { color: '#FFD7EF', textColor: '#320707', iconName: 'Heart' },
    visibleFor: ['personal'],
    features: {
      hasCards: true,
      hasAccountDetails: true,
      hasSend: true,
      hasRequest: false,
      hasPaymentLink: false,
      hasConvert: true,
      moveOnly: false,
      hideAddCurrency: false,
      singleCurrency: false,
      hasParticipants: true,
      participantStyle: 'sharing',
    },
    getCards: () => [
      { type: 'digital', lastFour: '7215', image: '/wise-card-personal-digital-blue.png' },
    ],
    homeCard: { cardBottomImage: '/wise-card-personal-digital-blue-bg.png', cardInfoLight: true },
    participants: [
      { name: 'Sarah Chen', imgSrc: 'https://www.tapback.co/api/avatar/sarah-chen.webp' },
    ],
    getCurrencies: () => jointCurrencies,
    getTransactions: () => jointTransactions,
    menuItemKeys: ['currentAccount.editJointAccount', 'common.statementsAndReports'],
  },
  {
    id: GROUP_IDS.youngExplorer,
    subPageType: 'young-explorer-account',
    nameKey: 'home.youngExplorer',
    style: { color: '#FFC091', textColor: '#260A2F', iconName: 'Backpack' },
    visibleFor: ['personal'],
    features: {
      hasCards: true,
      hasAccountDetails: false,
      hasSend: false,
      hasRequest: false,
      hasPaymentLink: false,
      hasConvert: false,
      moveOnly: true,
      hideAddCurrency: true,
      singleCurrency: true,
      hasParticipants: true,
      participantStyle: 'sharing',
    },
    getCards: () => [
      { type: 'digital', lastFour: '5820', image: '/wise-card-personal-digital-fire.png' },
    ],
    homeCard: { cardBottomImage: '/wise-card-personal-digital-fire-bg.png', cardInfoLight: true },
    participants: [
      { name: 'Max Berry', imgSrc: 'https://www.tapback.co/api/avatar/max-berry.webp' },
    ],
    getCurrencies: () => youngExplorerCurrencies,
    getTransactions: () => youngExplorerTransactions,
    menuItemKeys: ['currentAccount.editYoungExplorer', 'common.statementsAndReports', 'currentAccount.closeYoungExplorer'],
  },
];

// --- Lookup helpers ---

export function getAccountBySubPageType(type: string): AccountDefinition | undefined {
  return accountRegistry.find((a) => a.subPageType === type);
}

export function getAccountById(groupId: string): AccountDefinition | undefined {
  return accountRegistry.find((a) => a.id === groupId);
}

export function getAccountByBalanceId(balanceId: string): { account: AccountDefinition; currencyCode: string } | undefined {
  for (const account of accountRegistry) {
    const currency = account.getCurrencies().find((c) => c.balanceId === balanceId);
    if (currency) return { account, currencyCode: currency.code };
  }
  return undefined;
}

export function getVisibleAccounts(accountType: AccountType): AccountDefinition[] {
  return accountRegistry.filter((a) => a.visibleFor.includes(accountType));
}

export function getAllTransactions(accountType: AccountType): Transaction[] {
  return getVisibleAccounts(accountType)
    .flatMap((a) => a.getTransactions());
}

export function getAllCurrencies(accountType: AccountType): CurrencyData[] {
  return getVisibleAccounts(accountType)
    .flatMap((a) => a.getCurrencies());
}

export function getAllCards(accountType: AccountType): (CardDefinition & { accountNameKey: string })[] {
  return getVisibleAccounts(accountType).flatMap((a) => {
    if (!a.features.hasCards) return [];
    return a.getCards(accountType).map((c) => ({ ...c, accountNameKey: a.nameKey }));
  });
}

export type BalanceOwnerFrom = 'home' | 'account' | 'group-account' | 'jar-account' | 'shared-spending-account' | 'joint-account' | 'young-explorer-account';

type BalanceOwnerEntry = {
  code: string;
  from: BalanceOwnerFrom;
  group?: string;
  jarId?: string;
  joint?: boolean;
  youngExplorer?: boolean;
};

export function buildBalanceOwnerMap(): Map<string, BalanceOwnerEntry> {
  const map = new Map<string, BalanceOwnerEntry>();
  for (const account of accountRegistry) {
    const from: BalanceOwnerFrom = account.subPageType === 'account' ? 'home' : account.subPageType as BalanceOwnerFrom;
    const group = account.subPageType === 'group-account' ? 'group'
      : account.subPageType === 'shared-spending-account' ? 'shared-spending'
      : undefined;
    const joint = account.subPageType === 'joint-account' || undefined;
    const youngExplorer = account.subPageType === 'young-explorer-account' || undefined;

    for (const c of account.getCurrencies()) {
      map.set(c.balanceId, { code: c.code, from, group, joint, youngExplorer });
    }
  }
  return map;
}
