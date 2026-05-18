import type { CurrencyData } from './currencies';
import { currencies } from './currencies';
import { businessCurrencies } from './business-currencies';
import { commonCurrencies, commonBusinessCurrencies } from './common-currencies';
import { groupCurrencies } from './taxes-data';
import { savingsJar, suppliesJar } from './jar-data';
import { connorPersonalCurrencies } from './connor-personal-currencies';
import { connorBusinessCurrencies } from './connor-business-currencies';
import { connorPersonalJars } from './connor-personal-jars';
import { connorBusinessJars } from './connor-business-jars';
import { convertToHomeCurrency, usdBaseRates } from './currency-rates';

type AccountType = 'personal' | 'business';
type DatasetType = 'power' | 'common' | 'connor';

export function computeTotalBalance(accountType: AccountType, homeCurrency: string, rates = usdBaseRates, dataset: DatasetType = 'power'): number {
  let activeCurrencies: CurrencyData[];
  let groupBalance = 0;
  let jarBalance = 0;

  if (dataset === 'connor') {
    activeCurrencies = accountType === 'business' ? connorBusinessCurrencies : connorPersonalCurrencies;
    const jars = accountType === 'business' ? connorBusinessJars : connorPersonalJars;
    jarBalance = jars.reduce((sum, j) => sum + j.currencies.reduce((s, c) => s + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0), 0);
  } else if (dataset === 'common') {
    activeCurrencies = accountType === 'business' ? commonBusinessCurrencies : commonCurrencies;
  } else {
    activeCurrencies = accountType === 'business' ? businessCurrencies : currencies;
    groupBalance = accountType === 'business'
      ? groupCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0)
      : 0;
    const jar = accountType === 'business' ? suppliesJar : savingsJar;
    jarBalance = jar.currencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0);
  }

  const currenciesBalance = activeCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0);
  return currenciesBalance + groupBalance + jarBalance;
}

/**
 * Format a currency balance for display.
 * 'symbol' → £948.70 (for card totals, balance rows)
 * 'code'   → 948.70 GBP (for available balance, currency page headers)
 */
export function formatBalance(currency: CurrencyData, style: 'symbol' | 'code' = 'code'): string {
  const formatted = currency.balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return style === 'symbol' ? `${currency.symbol}${formatted}` : `${formatted} ${currency.code}`;
}
