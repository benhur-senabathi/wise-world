/**
 * Wise Assets (Interest & Stocks) Eligibility Rules
 *
 * Determines which currencies and account types are eligible for Interest and Stocks.
 * See shared-resources/account-logic/interest-stocks.md for full documentation.
 */

export type SubPageType =
  | 'account'
  | 'group-account'
  | 'joint-account'
  | 'young-explorer-account'
  | 'shared-spending-account';

/**
 * Currencies eligible for Interest
 * Only GBP, EUR, USD support interest (Wise Assets UK Ltd product)
 */
const INTEREST_ELIGIBLE_CURRENCIES = ['GBP', 'EUR', 'USD'] as const;

/**
 * Account types that support Wise Assets (Interest & Stocks)
 * NOT available on Young Explorer or Shared Spending
 */
const ASSETS_ELIGIBLE_ACCOUNT_TYPES: SubPageType[] = [
  'account',           // Current Account
  'group-account',     // Group (Taxes), Jars (via group-account)
  'joint-account',     // Joint Account
];

/**
 * Check if a currency is eligible for Interest
 * @param currencyCode - e.g. 'GBP', 'EUR', 'USD', 'CAD'
 */
export function isInterestEligibleCurrency(currencyCode: string): boolean {
  return INTEREST_ELIGIBLE_CURRENCIES.includes(currencyCode as any);
}

/**
 * Check if a currency is eligible for Stocks
 * @param currencyCode - ALL currencies can invest in stocks (MSCI World Index)
 */
export function isStocksEligibleCurrency(currencyCode: string): boolean {
  return true; // All currencies support stocks
}

/**
 * Check if an account type supports Wise Assets (Interest & Stocks)
 * @param subPageType - Account type identifier from the registry
 */
export function isAssetsEligibleAccount(subPageType: SubPageType): boolean {
  return ASSETS_ELIGIBLE_ACCOUNT_TYPES.includes(subPageType);
}

/**
 * Check if Interest should be shown for a currency on a given account type
 * Requires BOTH currency eligibility AND account type eligibility
 */
export function canShowInterest(currencyCode: string, subPageType: SubPageType): boolean {
  return isInterestEligibleCurrency(currencyCode) && isAssetsEligibleAccount(subPageType);
}

/**
 * Check if Stocks should be shown for a currency on a given account type
 * Requires BOTH currency eligibility (all) AND account type eligibility
 */
export function canShowStocks(currencyCode: string, subPageType: SubPageType): boolean {
  return isStocksEligibleCurrency(currencyCode) && isAssetsEligibleAccount(subPageType);
}

/**
 * Check if ANY assets products (Interest or Stocks) should be shown
 */
export function canShowAssets(subPageType: SubPageType): boolean {
  return isAssetsEligibleAccount(subPageType);
}
