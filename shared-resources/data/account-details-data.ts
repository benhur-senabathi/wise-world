export type AccountDetailField = {
  labelKey: string;
  value: string;
  helperKey?: string;
  helperLinkKey?: string;
  copySnackbarKey: string;
};

export type QuickFactFee = {
  labelKey: string;
  valueKey: string;
  helperKey?: string;
};

export type AvailabilityItem = {
  type: 'positive' | 'negative';
  titleKey: string;
  subtitleKey?: string;
};

export type CurrencyAccountDetailsData = {
  receiveSubtitleKey: string;
  countriesLinkKey: string;
  fields: (name: string) => AccountDetailField[];
  fees: QuickFactFee[];
  speeds: QuickFactFee[];
  limits: QuickFactFee[];
  availability: AvailabilityItem[];
};

const WISE_BANK_ADDRESS_UK = 'Wise Payments Limited, 1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom';
const WISE_BANK_ADDRESS_EU = 'Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium';
const WISE_BANK_ADDRESS_US = 'Community Federal Savings Bank, 89-16 Jamaica Ave, Woodhaven, NY, 11421, United States';
const WISE_BANK_ADDRESS_CA = 'Wise Payments Canada Inc., 99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada';
const WISE_BANK_ADDRESS_SG = 'Wise Asia-Pacific Pte. Ltd., 2 Tanjong Katong Road, #07-01, PLQ3, Singapore, 437161, Singapore';

type AccountDetailsMap = Record<string, {
  personal?: CurrencyAccountDetailsData;
  business?: CurrencyAccountDetailsData;
  [subPageType: string]: CurrencyAccountDetailsData | undefined;
}>;

const accountDetailsMap: AccountDetailsMap = {
  GBP: {
    personal: {
      receiveSubtitleKey: 'accountDetails.receiveFromUK',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '73868918', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.sortCode', value: '23-08-01', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.sortCodeCopied' },
        { labelKey: 'accountDetails.iban', value: 'GB08 TRWI 2308 0173 8689 18', helperKey: 'accountDetails.ibanHelper', helperLinkKey: 'accountDetails.ibanHelperLink', copySnackbarKey: 'accountDetails.ibanCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWIGB2LXXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_UK, helperKey: 'accountDetails.bankHelper', helperLinkKey: 'common.learnMore', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromDomestic', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwift', valueKey: 'accountDetails.gbpSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromDomestic', valueKey: 'accountDetails.speedFewMinutes', helperKey: 'accountDetails.speedUpTo1Day' },
        { labelKey: 'accountDetails.feeFromSwift', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.from150Countries', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.directDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
    business: {
      receiveSubtitleKey: 'accountDetails.receiveFromUK',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '81204736', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.sortCode', value: '23-08-01', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.sortCodeCopied' },
        { labelKey: 'accountDetails.iban', value: 'GB62 TRWI 2308 0181 2047 36', helperKey: 'accountDetails.ibanHelper', helperLinkKey: 'accountDetails.ibanHelperLink', copySnackbarKey: 'accountDetails.ibanCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWIGB2LXXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_UK, helperKey: 'accountDetails.bankHelper', helperLinkKey: 'common.learnMore', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromDomestic', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwift', valueKey: 'accountDetails.gbpSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromDomestic', valueKey: 'accountDetails.speedFewMinutes', helperKey: 'accountDetails.speedUpTo1Day' },
        { labelKey: 'accountDetails.feeFromSwift', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.from150Countries', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.directDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
    'joint-account': {
      receiveSubtitleKey: 'accountDetails.receiveFromUK',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '81052943', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.sortCode', value: '23-14-70', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.sortCodeCopied' },
        { labelKey: 'accountDetails.iban', value: 'GB29 TRWI 2314 7081 0529 43', helperKey: 'accountDetails.ibanHelper', helperLinkKey: 'accountDetails.ibanHelperLink', copySnackbarKey: 'accountDetails.ibanCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWIGB2LXXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_UK, helperKey: 'accountDetails.bankHelper', helperLinkKey: 'common.learnMore', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromDomestic', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwift', valueKey: 'accountDetails.gbpSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromDomestic', valueKey: 'accountDetails.speedFewMinutes', helperKey: 'accountDetails.speedUpTo1Day' },
        { labelKey: 'accountDetails.feeFromSwift', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.from150Countries', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.directDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
  },
  EUR: {
    personal: {
      receiveSubtitleKey: 'accountDetails.receiveFromEurope',
      countriesLinkKey: 'accountDetails.countriesLink100',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.iban', value: 'BE68 9670 3781 7624', helperKey: 'accountDetails.ibanHelperEur', helperLinkKey: 'accountDetails.ibanHelperLink', copySnackbarKey: 'accountDetails.ibanCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWIBEB1XXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_EU, helperKey: 'accountDetails.bankHelper', helperLinkKey: 'common.learnMore', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromSEPA', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwiftEUR', valueKey: 'accountDetails.eurSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromSEPA', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo2Days' },
        { labelKey: 'accountDetails.feeFromSwiftEUR', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.from100Countries', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.sepaDirectDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
    business: {
      receiveSubtitleKey: 'accountDetails.receiveFromEurope',
      countriesLinkKey: 'accountDetails.countriesLink100',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.iban', value: 'BE42 9670 5519 3847', helperKey: 'accountDetails.ibanHelperEur', helperLinkKey: 'accountDetails.ibanHelperLink', copySnackbarKey: 'accountDetails.ibanCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWIBEB1XXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_EU, helperKey: 'accountDetails.bankHelper', helperLinkKey: 'common.learnMore', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromSEPA', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwiftEUR', valueKey: 'accountDetails.eurSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromSEPA', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo2Days' },
        { labelKey: 'accountDetails.feeFromSwiftEUR', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.from100Countries', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.sepaDirectDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
  },
  USD: {
    personal: {
      receiveSubtitleKey: 'accountDetails.receiveFromUS',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '8311094826', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.accountType', value: 'Checking', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.accountTypeCopied' },
        { labelKey: 'accountDetails.routingNumber', value: '026073150', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.routingCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'CMFGUS33', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_US, helperKey: 'accountDetails.bankHelperUS', helperLinkKey: 'accountDetails.bankHelperUSLink', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromACH', valueKey: 'accountDetails.usdAchFree', helperKey: 'accountDetails.usdWireTransfersCost' },
        { labelKey: 'accountDetails.feeFromWire', valueKey: 'accountDetails.usdSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromUSDomestic', valueKey: 'accountDetails.speed1to3daysShort' },
        { labelKey: 'accountDetails.feeFromOutsideUS', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.fromTheUS', valueKey: 'accountDetails.usdLimit50m' },
        { labelKey: 'accountDetails.maxRollingYear', valueKey: 'accountDetails.usdLimit100m' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.achDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
    business: {
      receiveSubtitleKey: 'accountDetails.receiveFromUS',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '9402718365', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.accountType', value: 'Checking', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.accountTypeCopied' },
        { labelKey: 'accountDetails.routingNumber', value: '026073150', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.routingCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'CMFGUS33', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_US, helperKey: 'accountDetails.bankHelperUS', helperLinkKey: 'accountDetails.bankHelperUSLink', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromACH', valueKey: 'accountDetails.usdAchFree', helperKey: 'accountDetails.usdWireTransfersCost' },
        { labelKey: 'accountDetails.feeFromWire', valueKey: 'accountDetails.usdSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromUSDomestic', valueKey: 'accountDetails.speed1to3daysShort' },
        { labelKey: 'accountDetails.feeFromOutsideUS', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.fromTheUS', valueKey: 'accountDetails.usdLimit50m' },
        { labelKey: 'accountDetails.maxRollingYear', valueKey: 'accountDetails.usdLimit100m' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.achDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
    'joint-account': {
      receiveSubtitleKey: 'accountDetails.receiveFromUS',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '9402184763', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.accountType', value: 'Checking', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.accountTypeCopied' },
        { labelKey: 'accountDetails.routingNumber', value: '026073150', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.routingCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'CMFGUS33', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_US, helperKey: 'accountDetails.bankHelperUS', helperLinkKey: 'accountDetails.bankHelperUSLink', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromACH', valueKey: 'accountDetails.usdAchFree', helperKey: 'accountDetails.usdWireTransfersCost' },
        { labelKey: 'accountDetails.feeFromWire', valueKey: 'accountDetails.usdSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromUSDomestic', valueKey: 'accountDetails.speed1to3daysShort' },
        { labelKey: 'accountDetails.feeFromOutsideUS', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.fromTheUS', valueKey: 'accountDetails.usdLimit50m' },
        { labelKey: 'accountDetails.maxRollingYear', valueKey: 'accountDetails.usdLimit100m' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.achDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
      ],
    },
  },
  CAD: {
    personal: {
      receiveSubtitleKey: 'accountDetails.receiveFromCanada',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '200110083474', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.institutionNumber', value: '621', helperKey: 'accountDetails.institutionHelper', helperLinkKey: 'accountDetails.institutionHelperLink', copySnackbarKey: 'accountDetails.institutionCopied' },
        { labelKey: 'accountDetails.transitNumber', value: '16001', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.transitCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWICAW1XXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_CA, helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromDomesticCA', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwiftCA', valueKey: 'accountDetails.cadSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromDomesticCA', valueKey: 'accountDetails.speedFewHours', helperKey: 'accountDetails.speedUpTo1Day' },
        { labelKey: 'accountDetails.feeFromSwiftCA', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.from150Countries', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'positive', titleKey: 'accountDetails.preAuthorizedDebitsAvailable', subtitleKey: 'accountDetails.directDebitsSub' },
        { type: 'negative', titleKey: 'accountDetails.wireTransfersNotAvailable', subtitleKey: 'accountDetails.wireTransfersNotAvailableSub' },
        { type: 'negative', titleKey: 'accountDetails.obtNotAvailable', subtitleKey: 'accountDetails.obtNotAvailableSub' },
      ],
    },
  },
  SGD: {
    business: {
      receiveSubtitleKey: 'accountDetails.receiveFromSingapore',
      countriesLinkKey: 'accountDetails.countriesLink150',
      fields: (name) => [
        { labelKey: 'accountDetails.name', value: name, copySnackbarKey: 'accountDetails.nameCopied' },
        { labelKey: 'accountDetails.accountNumber', value: '292-032-0', copySnackbarKey: 'accountDetails.accountNumberCopied' },
        { labelKey: 'accountDetails.bankCode', value: '0516', helperKey: 'accountDetails.sortCodeHelper', copySnackbarKey: 'accountDetails.bankCodeCopied' },
        { labelKey: 'accountDetails.swiftBic', value: 'TRWISGSGXXX', helperKey: 'accountDetails.swiftHelper', copySnackbarKey: 'accountDetails.swiftCopied' },
        { labelKey: 'accountDetails.bankNameAndAddress', value: WISE_BANK_ADDRESS_SG, helperKey: 'accountDetails.bankHelper', helperLinkKey: 'common.learnMore', copySnackbarKey: 'accountDetails.bankCopied' },
      ],
      fees: [
        { labelKey: 'accountDetails.feeFromDomesticSG', valueKey: 'accountDetails.noFees' },
        { labelKey: 'accountDetails.feeFromSwiftSG', valueKey: 'accountDetails.sgdSwiftFee', helperKey: 'accountDetails.bankFeesMayApply' },
      ],
      speeds: [
        { labelKey: 'accountDetails.feeFromDomesticSG', valueKey: 'accountDetails.speedFewMinutes', helperKey: 'accountDetails.speedUpTo1Day' },
        { labelKey: 'accountDetails.feeFromSwiftSG', valueKey: 'accountDetails.speed1WorkingDay', helperKey: 'accountDetails.speedUpTo5Days' },
      ],
      limits: [
        { labelKey: 'accountDetails.fromSingapore', valueKey: 'accountDetails.sgdLimit200k' },
        { labelKey: 'accountDetails.fromOutsideSingapore', valueKey: 'accountDetails.noReceivingLimits' },
      ],
      availability: [
        { type: 'negative', titleKey: 'accountDetails.sgdNoDirectDebits' },
      ],
    },
  },
};

export function getAccountDetails(code: string, accountType: 'personal' | 'business', subPageType?: string): CurrencyAccountDetailsData | null {
  const entry = accountDetailsMap[code];
  if (!entry) return null;
  if (subPageType && entry[subPageType]) return entry[subPageType]!;
  return entry[accountType] ?? entry.personal ?? entry.business ?? null;
}
