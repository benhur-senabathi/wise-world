# User Datasets — Real Customer Data in Prototypes

This document explains how real customer data (from the Ninjas CSV export) was integrated into the Base Surfaces prototypes. Use this as a guide when adding new user datasets or debugging existing ones.

## Overview

User datasets allow the prototype to display real account structures from actual Wise customers (team members). Each person has a personal and business account that can be selected from a dropdown in the DeviceFrame toolbar. When selected, all data throughout the app (balances, currencies, transactions, jars, cards, names, avatars) updates to reflect that person's real account.

## Architecture

### DatasetType

```typescript
type DatasetType = 'power' | 'common' | 'connor';
```

- `power` — the default richly-featured demo account (all features enabled)
- `common` — a simpler demo account (fewer features)
- `connor` — real user dataset (Connor Berry's personal + business accounts)

### File structure per user dataset

Each user dataset consists of 3-4 files in `shared-resources/data/`:

| File | Purpose | Pattern |
|------|---------|---------|
| `{name}-currencies.ts` | Currency array with computed balances | Exports `const {name}Currencies: CurrencyData[]` |
| `{name}-transactions.tsx` | Transaction list per currency | Exports `function build{Name}Transactions(...)` |
| `{name}-jar.tsx` or `{name}-jars.tsx` | Jar definitions (if account has jars) | Exports `const {name}Jar` or `const {name}Jars` |

### Hook layer

All dataset switching is handled in `src/hooks/useDatasetData.ts` (both web and mobile):

- `useActiveCurrencies(accountType)` — returns the correct `CurrencyData[]` for active dataset
- `useActiveTransactions(accountType, ...)` — returns the correct `Transaction[]`
- `useActiveCards(accountType)` — returns `CardInfo[]` (physical/digital cards)
- `useActiveJars(accountType)` — returns `JarDefinition[]`
- `useHasJars(accountType)` — whether jars section shows
- `useDatasetIdentity(accountType)` — returns names, avatars, paired dataset for switching
- `isUserDataset(dataset)` — true when not 'common' or 'power'
- `getDatasetCurrencies(dataset, accountType)` — non-hook version for use in callbacks

### Context

`DatasetContext` (in `src/context/Dataset.tsx` in both web and mobile) holds the active dataset. It reads the initial value from `?dataset=` URL param and posts `dataset-change` messages to the parent frame when changed.

## How to add a new user dataset

### Step 1: Create the currency file

```typescript
// shared-resources/data/{name}-currencies.ts
import type { CurrencyData } from './currencies';
import { build{Name}Transactions } from './{name}-transactions';
import { computeCurrencyBalance } from './transactions';

const transactions = build{Name}Transactions('FirstName', 'BusinessName');

export const {name}Currencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '12345678',    // unique 8-digit ID
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', transactions),
    accountDetails: '23-14-70 · 84920173',  // optional
    hasInterest: true,                       // optional
    interestRate: '3.26%',                   // if hasInterest
    totalReturns: '+0.04 GBP',              // if hasInterest
  },
  // ... more currencies
];
```

**Critical rules:**
- Always use `computeCurrencyBalance()` for the `balance` field — never hardcode
- The first currency in the array = the home currency (displayed as the main balance)
- `balanceId` must be unique across ALL datasets (use 8-digit numbers)
- Order currencies by importance/usage (home currency first)

### Step 2: Create the transaction file

```typescript
// shared-resources/data/{name}-transactions.tsx
import { Receive, Send, Plus } from '@transferwise/icons';
import type { Transaction, TxTranslator } from './transactions';
import { logoUrl } from './transactions';

const defaultLabels: TxTranslator = {
  sent: 'Sent', sentByYou: 'Sent by you',
  added: 'Added', addedByYou: 'Added by you',
  moved: 'Moved', movedByYou: 'Moved by you',
  spentByYou: 'Spent by you',
};

export function build{Name}Transactions(
  _consumerName: string,
  _businessName: string,
  labels: TxTranslator = defaultLabels
): Transaction[] {
  return [
    // Transactions must NET to the correct balance per currency
    { name: 'Merchant', amount: '4.60 GBP', isPositive: false, imgSrc: logoUrl('merchant.com'), date: 'Today', currency: 'GBP' },
    { name: 'Deposit', subtitle: labels.added, amount: '+ 20.00 GBP', isPositive: true, icon: <Plus size={24} />, date: 'Yesterday', currency: 'GBP' },
  ];
}
```

**Critical rules:**
- Transactions are displayed in array order (newest first)
- Every positive amount string starts with `'+ '` (space after plus)
- Negative amounts have no prefix (just `'4.60 GBP'`)
- `isPositive: true` for credits, `false` for debits
- The sum of all amounts for a currency must equal the desired balance
- Use `logoUrl('domain.com')` for merchant logos (loads from Clearbit)
- Business accounts use `buildX(consumerName, txLabels)` (2 params), personal use `buildX(consumerName, businessName, txLabels)` (3 params)

### Step 3: Create jar file (if applicable)

```typescript
// shared-resources/data/{name}-jar.tsx (singular for 1 jar, plural for multiple)
import type { JarDefinition } from './jar-data';

export const {name}Jar: JarDefinition = {
  id: '60192847',           // unique 8-digit GROUP ID
  nameKey: 'home.savings',  // translation key
  color: '#FFEB69',         // jar header color
  iconName: 'Savings',      // 'Savings' | 'UpwardGraph' | 'Suitcase' | 'Money' | 'Sun'
  currencies: [
    { code: 'GBP', balanceId: '151882670', name: 'British pound', symbol: '£', balance: 0 },
  ],
  transactions: [],         // jar-specific transactions (or [] for empty jars)
};
```

**Critical rules:**
- Jar IDs must be registered in `shared-resources/data/jar-data.tsx` → `GROUP_IDS`
- Jar balance IDs must be added to `balanceOwnerMap` in `App.tsx`
- Jar balances are hardcoded (not computed) — they're simple containers
- If a jar has transactions, the hardcoded balance must match the transaction sum

### Step 4: Wire up in useDataset.ts

Add imports and cases in each hook:
- `useActiveCurrencies` — add `case '{name}': return {name}Currencies;`
- `useActiveTransactions` — add `case '{name}': return build{Name}Transactions(...);`
- `useActiveCards` — add `case '{name}': return {name}Cards;` (define card array above)
- `useActiveJars` — add `case '{name}': return [{name}Jar];`
- `useHasJars` — add dataset ID to the array if it has jars

### Step 5: Register IDs

In `shared-resources/data/jar-data.tsx`:
- Add jar group IDs to `GROUP_IDS`
- Add jar to `allUserJars` array searched by `getJar()`

In `mobile/src/App.tsx`:
- Add jar balance IDs to `balanceOwnerMap` so currency page navigation works

### Step 6: Add identity

In `useDataset.ts` → `DATASET_IDENTITY`:
```typescript
'{name}-personal': {
  personalName: 'Full Name',
  businessName: 'Business Ltd',
  personalAvatar: '/avatar-name.png',
  businessAvatar: '/business-logo.png',  // or undefined
  pairedDataset: '{name}-business',
},
'{name}-business': { /* mirror with pairedDataset pointing back */ },
```

### Step 7: Add to DatasetType

In `mobile/src/context/Dataset.tsx`:
- Add the new IDs to the `DatasetType` union
- Add them to the URL param validation array

### Step 8: Translation keys

If jars use new name keys (e.g. `'home.marketing'`), add them to all translation files:
- `src/translations/en.ts`
- `src/translations/es.ts` (and other languages)

## Issues encountered and solutions

### 1. CSV `has_assets=True` is ambiguous

The CSV column `has_assets` does NOT always mean "is a jar". It can mean:
- The currency earns interest (e.g. Connor Personal GBP/EUR both have `has_assets=True` but are NOT jars — they're main currencies with interest enabled)
- The currency is in a jar (e.g. Connor Business Marketing/Supplies/Jar/Tax/Travel)

**Resolution:** You cannot derive the account structure from the CSV alone. You need user confirmation of which currencies are jars vs. interest-earning main currencies.

### 2. Currency order determines home currency

The first currency in the `CurrencyData[]` array becomes the "home currency" — it's displayed as the main balance on the Home page MCA card and used as the default in flows (send, convert, add money).

**Issue:** Connor Personal had EUR first (from the CSV order), but their actual home currency is GBP. Reordering the array fixed it.

### 3. Transactions must net exactly

Every currency's balance is `computeCurrencyBalance(code, transactions)` — the sum of all credits minus debits for that code. If you need a balance of £16.84:
- Sum all positive GBP amounts: e.g. +34.90 + 0.04 = +34.94
- Sum all negative GBP amounts: e.g. -4.60 -12.50 -1.00 = -18.10
- Net: 34.94 - 18.10 = 16.84

**Common mistake:** Adding a transaction without adjusting another, causing the balance to drift from the real value.

### 4. Zero-balance currencies need cancelling transactions

If a currency has $0 balance but should still appear in the account (and show in transaction history), create transactions that cancel out: e.g. `+250 USD` followed by `-54.99 -15 -7.25 -12 -10 -150.76 USD` = 0.

Don't just leave the transactions array empty — that gives $0 balance but no transaction history for that currency.

### 5. Empty card state (accounts with 0 cards)

Some accounts have no cards (e.g. Matías Business). This requires special handling:

**Home page (MultiCurrencyAccountCard):**
- Pass `emptyCardContent` prop with a dashed-border placeholder
- This adds `mca-wallet__body--no-cards` class that hides the wallet shadow

**CurrentAccount page:**
- Add `datasetCards.length === 0` branch in the card ternary
- Must include `paddingTop: 16` on `.mca-cards` and `marginTop: -60` on wallet (same as Holiday jar)
- Without these, there's too much vertical gap between the dashed card area and wallet body

### 6. Account switching (personal ↔ business)

Each person has a paired dataset. When they "switch account" from personal to business (or vice versa), it's not just flipping `accountType` — it must also change the active dataset:

```typescript
if (isUserDataset(dataset) && datasetIdentity.pairedDataset) {
  setDataset(datasetIdentity.pairedDataset);
  setAccountType(type);
}
```

### 7. "All accounts" button visibility

The "All accounts" overview toggle should only show when there are secondary accounts (jars, joint, holiday, taxes). Computed as:
```typescript
const hasSecondaryAccounts = hasJars || hasJoint || hasHoliday || hasTaxes;
```
Pass `hideOverviewToggle={!hasSecondaryAccounts}` to the Home page.

### 8. Profile images everywhere

Dataset-aware avatars must be used in ALL places where a profile image appears:
- Home page header (IOSTopBar)
- Account page
- Payments page (Wisetag)
- Recipients page
- SendFlow (sender avatar)
- Account switcher (both active and "other" account)

Use `useDatasetIdentity(accountType)` to get `activeAvatar` and `otherAvatar`.

### 9. Flag stack overflow logic

When displaying currency flags in the MCA card button:
- 1-3 currencies: show ALL flags (no overflow counter)
- 4+ currencies: show 2 flags + "+N" counter

```typescript
const maxVisibleFlags = balances.length <= 3 ? 3 : 2;
```

### 10. Negative balances are valid

Some real accounts have negative balances (overdrafts, fees charged to empty accounts). This is intentional:
- Mike Business GBP: -£13
- Mike Business Jar GBP: -£13
- Mike Personal Jar EUR: -€0.08

Don't "fix" these unless told to — they represent real account states.

### 11. Total balance includes jars

`computeTotalBalance()` in `shared-resources/data/balances.ts` must sum both main currencies AND jar currencies for user datasets. When adding a new jar, ensure its balance IDs are included in the total computation.

### 12. Transactions page must use dataset hook

The Transactions page must use `useActiveTransactions()` — not the hardcoded `buildTransactions`/`buildBusinessTransactions` imports. Otherwise it always shows the power dataset regardless of selection.

## Current user accounts

| Dataset | Home Currency | Currencies | Jars | Cards |
|---------|--------------|------------|------|-------|
| connor (personal) | GBP £16.84 | GBP, EUR (both with interest) | None | 2 (physical + digital) |
| connor (business) | GBP £5.01 | GBP, SGD, AUD, USD | 5 (Marketing, Supplies, Jar, Tax, Travel) — all GBP | 1 (digital) |

## Debugging checklist

If a user dataset isn't working:

1. **Wrong balance?** Check that transactions net correctly — add/remove amounts to match
2. **Wrong home currency?** Reorder the currencies array (first = home)
3. **Jars not showing?** Check `useHasJars` includes the dataset ID
4. **Can't navigate into jar currency?** Check jar balance IDs are in `balanceOwnerMap` (App.tsx) and jar group IDs are in `GROUP_IDS` (jar-data.tsx)
5. **Name/avatar wrong?** Check `DATASET_IDENTITY` in useDataset.ts
6. **Account switch broken?** Check `pairedDataset` is correct in both directions
7. **Transactions showing power data?** Ensure the page uses `useActiveTransactions()` not hardcoded imports
8. **Shadow on empty cards?** Ensure `mca-wallet__body--no-cards` class is applied
9. **Empty card gap too large?** Ensure `marginTop: -60` and `paddingTop: 16` match Holiday jar pattern
