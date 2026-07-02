import { FastFlag } from '@transferwise/icons';

export type Recipient = {
  id: number;
  name: string;
  subtitle: string;
  avatarType: 'photo' | 'initials' | 'logo';
  avatarSlug?: string;
  avatarUrl?: string;
  initials?: string;
  hasFastFlag: boolean;
  isMyAccount?: boolean;
  badgeFlagCode?: string;
};

// Sorted alphabetically by name
export const recipients: Recipient[] = [
  { id: 1, name: 'Aiden Nakamura', subtitle: '@aidenn482', avatarType: 'photo', avatarSlug: 'aiden-nakamura', hasFastFlag: true },
  { id: 2, name: 'Amara Diallo', subtitle: '@amarad104', avatarType: 'photo', avatarSlug: 'amara-diallo', hasFastFlag: true },
  { id: 3, name: 'Barclays', subtitle: 'Barclays Bank Plc ending ·· 4821', avatarType: 'logo', initials: 'B', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'GBP' },
  { id: 4, name: 'Christie Davis', subtitle: '@christied25', avatarType: 'photo', avatarSlug: 'christie-davis', hasFastFlag: true },
  { id: 5, name: 'Declan Murphy', subtitle: 'Wise account', avatarType: 'initials', initials: 'DM', hasFastFlag: true },
  { id: 6, name: 'Elena Vasquez-Torres', subtitle: '@elenav203', avatarType: 'photo', avatarSlug: 'elena-vasquez', hasFastFlag: true },
  { id: 7, name: 'Emeka Obi', subtitle: '@emekao773', avatarType: 'photo', avatarSlug: 'emeka-obi', hasFastFlag: true },
  { id: 8, name: 'Ingrid Svensson', subtitle: '@ingris315', avatarType: 'initials', initials: 'IS', hasFastFlag: true },
  { id: 9, name: 'Kenji Oduya', subtitle: '@kenjio362', avatarType: 'photo', avatarSlug: 'kenji-oduya', hasFastFlag: true },
  { id: 10, name: 'Leo Papageorgiou', subtitle: '@leop1248', avatarType: 'initials', initials: 'LP', hasFastFlag: true },
  { id: 11, name: 'Lucia Fernandez', subtitle: '@lucief891', avatarType: 'photo', avatarSlug: 'lucia-fernandez', hasFastFlag: true },
  { id: 12, name: 'Marcus Chen-Williams', subtitle: '@marcuc558', avatarType: 'initials', initials: 'MC', hasFastFlag: true },
  { id: 13, name: 'Nadia Kowalski', subtitle: '@nadiak085', avatarType: 'photo', avatarSlug: 'nadia-kowalski', hasFastFlag: true },
  { id: 14, name: 'Priya Okonkwo', subtitle: '@priyao917', avatarType: 'photo', avatarSlug: 'priya-okonkwo', hasFastFlag: true },
  { id: 15, name: 'Rashid Al-Farsi', subtitle: 'HSBC Bank ending ·· 2947', avatarType: 'initials', initials: 'RA', hasFastFlag: false, badgeFlagCode: 'EUR' },
  { id: 16, name: 'Revolut', subtitle: 'Revolut Ltd ending ·· 6339', avatarType: 'logo', initials: 'R', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'GBP' },
  { id: 17, name: 'Revolut', subtitle: 'Metropolitan Commercial Bank ending ·· 3738', avatarType: 'logo', initials: 'R', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'USD' },
  { id: 18, name: 'Sofia Lindqvist', subtitle: '@sofial741', avatarType: 'photo', avatarSlug: 'sofia-lindqvist', hasFastFlag: true },
  { id: 19, name: 'Sofia Lindqvist', subtitle: 'Interac · sofia.lind@gmail.com', avatarType: 'initials', initials: 'SL', hasFastFlag: false, badgeFlagCode: 'CAD' },
  { id: 20, name: 'Tobias Hartmann', subtitle: 'Wise account', avatarType: 'photo', avatarSlug: 'tobias-hartmann', hasFastFlag: true },
  { id: 21, name: 'Yuki Petersen', subtitle: '@yukip629', avatarType: 'photo', avatarSlug: 'yuki-petersen', hasFastFlag: true },
];

// Christie first, then random order
export const recentContacts = [
  { name: 'Christie Davis', subtitle: '@christied25', imgSrc: 'https://www.tapback.co/api/avatar/christie-davis.webp', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
  { name: 'Kenji Oduya', subtitle: '@kenjio362', imgSrc: 'https://www.tapback.co/api/avatar/kenji-oduya.webp', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
  { name: 'Revolut', subtitle: 'Revolut Ltd', imgSrc: 'https://www.tapback.co/api/avatar/connor-berry.webp', badge: { flagCode: 'GBP' } },
  { name: 'Nadia Kowalski', subtitle: '@nadiak085', imgSrc: 'https://www.tapback.co/api/avatar/nadia-kowalski.webp', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
  { name: 'Rashid Al-Farsi', subtitle: 'HSBC Bank', initials: 'RA', badge: { flagCode: 'EUR' } },
  { name: 'Amara Diallo', subtitle: '@amarad104', imgSrc: 'https://www.tapback.co/api/avatar/amara-diallo.webp', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
  { name: 'Elena Vasquez-Torres', subtitle: '@elenav203', imgSrc: 'https://www.tapback.co/api/avatar/elena-vasquez.webp', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
];

// Business recipients
export const businessRecipients: Recipient[] = [
  { id: 101, name: 'Acme Corp', subtitle: 'Barclays Bank ending ·· 7821', avatarType: 'initials', initials: 'AC', hasFastFlag: false, badgeFlagCode: 'GBP' },
  { id: 102, name: 'Adobe', subtitle: 'Adobe Inc.', avatarType: 'logo', initials: 'A', hasFastFlag: false, badgeFlagCode: 'USD' },
  { id: 120, name: 'BNP Paribas', subtitle: 'BNP Paribas SA ending ·· 3847', avatarType: 'logo', initials: 'B', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'EUR' },
  { id: 103, name: 'Bright Ideas Agency', subtitle: 'NatWest ending ·· 3901', avatarType: 'initials', initials: 'BI', hasFastFlag: false, badgeFlagCode: 'GBP' },
  { id: 121, name: 'Chase', subtitle: 'JPMorgan Chase Bank ending ·· 8365', avatarType: 'logo', initials: 'C', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'USD' },
  { id: 104, name: 'Benhur Senabathi', subtitle: 'Wise account', avatarType: 'photo', avatarUrl: '/avatar-benhur.png', hasFastFlag: true },
  { id: 122, name: 'DBS', subtitle: 'DBS Bank Ltd ending ·· 3756', avatarType: 'logo', initials: 'D', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'SGD' },
  { id: 105, name: 'Figma', subtitle: 'Figma Inc.', avatarType: 'logo', initials: 'F', hasFastFlag: false, badgeFlagCode: 'USD' },
  { id: 106, name: 'HMRC', subtitle: 'Coutts & Co ending ·· 0842', avatarType: 'initials', initials: 'HM', hasFastFlag: false, badgeFlagCode: 'GBP' },
  { id: 123, name: 'HSBC', subtitle: 'HSBC UK Bank Plc ending ·· 4736', avatarType: 'logo', initials: 'H', hasFastFlag: false, isMyAccount: true, badgeFlagCode: 'GBP' },
  { id: 107, name: 'Marco Rossi', subtitle: 'Deutsche Bank ending ·· 4829', avatarType: 'initials', initials: 'MR', hasFastFlag: false, badgeFlagCode: 'EUR' },
  { id: 108, name: 'Meridian Studios', subtitle: 'Lloyds Bank ending ·· 5513', avatarType: 'initials', initials: 'MS', hasFastFlag: false, badgeFlagCode: 'GBP' },
  { id: 109, name: 'MOO Print', subtitle: 'IBAN ending ·· 9174', avatarType: 'logo', initials: 'M', hasFastFlag: false, badgeFlagCode: 'EUR' },
  { id: 110, name: 'Printful', subtitle: 'Printful Inc ending ·· 6038', avatarType: 'logo', initials: 'P', hasFastFlag: false, badgeFlagCode: 'GBP' },
  { id: 111, name: 'Sarah Chen', subtitle: 'Wise account', avatarType: 'photo', avatarSlug: 'sarah-chen', hasFastFlag: true },
  { id: 112, name: 'Shutterstock', subtitle: 'Shutterstock Inc ending ·· 2741', avatarType: 'logo', initials: 'S', hasFastFlag: false, badgeFlagCode: 'USD' },
  { id: 113, name: 'TechStart Singapore', subtitle: 'DBS Bank ending ·· 8193', avatarType: 'initials', initials: 'TS', hasFastFlag: false, badgeFlagCode: 'SGD' },
];

export const businessRecentContacts = [
  { name: 'Acme Corp', subtitle: 'Barclays Bank', initials: 'AC', badge: { flagCode: 'GBP' } },
  { name: 'Sarah Chen', subtitle: 'Wise account', imgSrc: 'https://www.tapback.co/api/avatar/sarah-chen.webp', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
  { name: 'HMRC', subtitle: 'Coutts & Co', initials: 'HM', badge: { flagCode: 'GBP' } },
  { name: 'Meridian Studios', subtitle: 'Lloyds Bank', initials: 'MS', badge: { flagCode: 'GBP' } },
  { name: 'Marco Rossi', subtitle: 'Deutsche Bank', initials: 'MR', badge: { flagCode: 'EUR' } },
  { name: 'Benhur Senabathi', subtitle: 'Wise account', imgSrc: '/avatar-benhur.png', badge: { icon: <FastFlag size={16} />, type: 'action' as const } },
];

export function getAvatarSrc(r: Recipient): string | undefined {
  if (r.avatarType === 'photo' && r.avatarUrl) {
    return r.avatarUrl;
  }
  if (r.avatarType === 'photo' && r.avatarSlug) {
    return `https://www.tapback.co/api/avatar/${r.avatarSlug}.webp`;
  }
  return undefined;
}

export function getBadge(r: Recipient) {
  if (r.hasFastFlag) {
    return { icon: <FastFlag size={16} />, type: 'action' as const };
  }
  if (r.badgeFlagCode) {
    return { flagCode: r.badgeFlagCode };
  }
  return undefined;
}
