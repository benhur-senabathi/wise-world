# Balances and Accounts

What updates when balances change, and the full checklist for adding new accounts. Read this before modifying any balance data or adding a jar/group.

## How balances work

Balances are never hardcoded. Every currency's `balance` field is computed from its transaction array using `computeCurrencyBalance(code, txList)`. Change the transactions and the balance updates automatically.

The total balance shown on Home and Insights is computed by `computeTotalBalance()` in `balances.ts`. It sums across current account + group + active jar for the given account type (personal or business).

```
Transaction arrays (source of truth)
    ↓  computeCurrencyBalance()
Currency balance fields
    ↓  .reduce() / computeTotalBalance()
Total balances (Home, Insights, account cards)
```

## What updates when a balance changes

When you add, remove, or edit transactions in a currency, the following pages display that balance and will reflect the change:

| What changed | Pages that update |
|---|---|
| **Transaction added/removed/edited** | Currency page (available balance), Account page (currency list), Home card (balance grid), Home total balance, Insights total + breakdown |
| **New currency added to existing account** | Account page (new row in currencies), Home card (new balance in grid), Home total balance, Insights breakdown |
| **Currency removed** | Same as above in reverse — remove from all surfaces |
| **Interest/stocks flag changed** | Currency page (sidebar), Insights (cash/interest/stocks breakdown) |

### Pages that show balances

| Page | What it shows | Source |
|---|---|---|
| **Home** (TotalBalanceHeader) | Total across all accounts | `computeTotalBalance()` |
| **Home** (account cards) | Per-currency balances in grid | `CurrencyData.balance` via card props |
| **Account page** | Currency list with balances | `CurrencyData.balance` |
| **Currency page** | "Available balance" header | `formatBalance(currency)` |
| **Insights** | Total balance + cash/interest/stocks breakdown | `computeTotalBalance()` + per-currency reduce |
| **Send flow** | "Available balance" on amount step | `formatBalance()` |
| **Convert flow** | "Available balance" on amount step | `formatBalance()` |

### Checklist: editing a balance

1. Edit the transaction array (add/remove/change transactions)
2. Verify the first transaction establishes a positive starting balance — if balance goes negative, adjust the first transaction's amount
3. Check `computeTotalBalance()` still includes this currency's account (it should automatically if the account is already registered)
4. No other files need changing — balances propagate through the computation chain

## Adding a new jar

Everything needed, in order. Steps 1-5 are shared data, steps 6-8 are per-project.

### Shared data (`shared-resources/data/`)

**1. Define transactions** in `jar-data.tsx` (or a new file if large)

```ts
const myJarTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 500.00 GBP',
    isPositive: true, icon: <Plus size={24} />, date: '1 April', currency: 'GBP' },
];
```

The first transaction must be positive to establish the starting balance. Vary amounts and merchants — see realism rules in `CLAUDE.md`.

**2. Register a group ID** in `GROUP_IDS` (`jar-data.tsx`)

```ts
export const GROUP_IDS = {
  currentAccount: '48291035',
  taxes: '73850214',
  savings: '61724089',
  supplies: '39058162',
  myJar: '12345678',        // ← new, unique 8-digit number
} as const;
```

**3. Create the JarDefinition** with computed balances

```ts
export const myJar: JarDefinition = {
  id: GROUP_IDS.myJar,
  nameKey: 'home.myJar',       // i18n key — add to translations later
  color: '#C3FFE8',            // Neptune expressive brand token
  iconName: 'TrendingUp',     // @transferwise/icons name
  currencies: [
    {
      code: 'GBP',
      balanceId: '99887766',   // unique 8-digit ID — check all files for conflicts
      name: 'British pound',
      symbol: '£',
      balance: computeCurrencyBalance('GBP', myJarTransactions),
    },
  ],
  transactions: myJarTransactions,
};
```

**4. Add to `getJar()` lookup** (`jar-data.tsx`)

```ts
export function getJar(id: string): JarDefinition | undefined {
  if (id === GROUP_IDS.savings) return savingsJar;
  if (id === GROUP_IDS.supplies) return suppliesJar;
  if (id === GROUP_IDS.myJar) return myJar;   // ← add
  return undefined;
}
```

**5. Update `computeTotalBalance()`** (`balances.ts`)

The function currently picks one jar per account type. Update it to include the new jar:

```ts
// Before:
const jar = accountType === 'business' ? suppliesJar : savingsJar;
const jarBalance = jar.currencies.reduce(...);

// After: include new jar for whichever account type it belongs to
```

Import the new jar and add its currencies to the jar balance calculation.

### Per-project (web + mobile)

**6. Register balance IDs in `balanceOwnerMap`** (`App.tsx`)

```ts
for (const c of myJar.currencies)
  balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'jar-account', jarId: myJar.id });
```

**7. Add i18n keys** (`translations/en.ts`, `es.ts`, etc.)

```ts
'home.myJar': 'My Jar',
```

**8. Thread into Home carousel**

The jar needs to appear in the Home page's account carousel. Add it to the jar array that feeds into the carousel rendering (in `Home.tsx` or equivalent). Pass the jar's `AccountStyle` (color + iconName) through to any flows opened from this jar's pages.

## Adding a new group account

Groups are like jars but with cards and participants. Follow the same shared data steps (1-5), with these differences:

### Shared data differences

- **Data file**: Create a new file like `taxes-data.tsx` (or add to it). Export `groupCurrencies`, `groupTransactions`, and `groupTotalBalance`.
- **No `JarDefinition`**: Groups use plain exports, not the `JarDefinition` type.
- **`computeTotalBalance()`**: Add the new group's currencies to the group balance calculation. Currently only `groupCurrencies` (Taxes) is included for business accounts.

### Per-project differences

- **`balanceOwnerMap`**: Register with `from: 'my-group-account'` (not `'jar-account'`).
- **`parseUrl()`**: The existing `/groups/:id` route handles it automatically if the ID is in `GROUP_IDS`.
- **Home card**: Groups use `MultiCurrencyAccountCard` with wallet cutout (not `JarCard`), because they have cards.
- **`AccountStyle`**: Define a style constant with the group's color, textColor, and iconName. Pass it through flows.
- **Account page**: Groups show cards section and participants — unlike jars.

## Adding a new currency to an existing account

1. Add a unique 8-digit `balanceId` to the new `CurrencyData` entry
2. Create transactions for the new currency (first transaction positive)
3. Use `computeCurrencyBalance()` for the balance
4. Register the balance ID in `balanceOwnerMap` in each project's `App.tsx`
5. No changes needed to `computeTotalBalance()` — it iterates the full currency array

## ID rules

- All IDs are **8-digit numeric strings** — no slugs, UUIDs, or currency codes
- `GROUP_IDS` holds account container IDs (current account, jars, groups)
- `balanceId` on `CurrencyData` identifies individual currency balances within an account
- Every `balanceId` must be **globally unique** across all accounts and all files
- Check all currency arrays before assigning a new ID to avoid collisions

## Realism rules for transactions

- First transaction establishes the starting balance (consumer: `Plus` icon, business: `Receive` icon)
- Vary merchants — max 2 appearances per currency
- Vary amount endings — not all `.00`, `.50`, or `.99`
- Mix transaction types: card spend, sends, receives, conversions
- Order by descending date (most recent first)
- If balance goes negative after editing, adjust the first transaction's amount
