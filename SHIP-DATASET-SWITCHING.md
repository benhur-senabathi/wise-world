# Ship Dataset Switching to Base Surfaces

This document is a complete implementation prompt. It tells you exactly how to add **dataset switching** to both `base-surfaces-mobile` and `base-surfaces-web` — the ability to swap the prototype between multiple real customer accounts (currencies, balances, transactions, jars, cards) without reloading.

---

## What You're Building

A **DatasetProvider** context and **useDataset hooks** that let the prototype switch between multiple datasets:

| Dataset ID | Description |
|-----------|-------------|
| `power` | Default — feature-rich demo account (2 cards, jars, taxes group, joint) |
| `common` | Stripped-down single card, fewer currencies |
| `{name}-personal` | Real customer's personal account |
| `{name}-business` | Real customer's business account |

The dropdown lives in PrototypeSettings. Selecting a dataset instantly swaps all data (currencies, transactions, jars, cards, group/joint accounts, avatar, name) across every surface.

---

## Current Architecture (What Already Exists)

Both prototypes currently have:
- `AccountType = 'personal' | 'business'` toggle
- Static data imports: `currencies`, `businessCurrencies`, `buildTransactions()`, etc.
- One jar per account type: `savingsJar` (personal), `suppliesJar` (business)
- One group: `groupCurrencies` / `groupTransactions` (business taxes)
- No joint account support
- `PrototypeNamesProvider` for editable names and home currency
- `computeTotalBalance(accountType, homeCurrency, rates)` in `shared-resources/data/balances.ts`

All data files live in `shared-resources/data/` (shared between platforms). Platform-specific code is only in `src/`.

---

## Implementation Steps

### Phase 1: Shared Data Infrastructure

#### 1.1 Create `shared-resources/data/common-currencies.ts`

A minimal personal dataset (fewer currencies than `power`):

```typescript
import type { CurrencyData } from './currencies';
import { computeCurrencyBalance } from './transactions';
import { buildCommonTransactions } from './common-transactions';

const transactions = buildCommonTransactions('Connor Berry', 'Berry Design');

export const commonCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '30198274',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', transactions),
    accountDetails: '23-14-22 · 89016374',
    hasInterest: true,
    interestRate: '3.26%',
    totalReturns: '+2.18 GBP',
  },
  {
    code: 'EUR',
    balanceId: '30198301',
    name: 'Euro',
    symbol: '€',
    balance: computeCurrencyBalance('EUR', transactions),
    accountDetails: 'BE68 5390 0754 7034',
  },
];
```

#### 1.2 Create `shared-resources/data/common-transactions.tsx`

A minimal transaction list that nets to reasonable balances (GBP ~£500, EUR ~€50).

```typescript
import { Plus, Receive, Send } from '@transferwise/icons';
import type { Transaction, TxTranslator } from './transactions';
import { logoUrl } from './transactions';

const defaultLabels: TxTranslator = { sent: 'Sent', sentByYou: 'Sent by you', added: 'Added', addedByYou: 'Added by you', moved: 'Moved', movedByYou: 'Moved by you', spentByYou: 'Spent by you' };

export function buildCommonTransactions(_consumerName: string, _businessName: string, labels: TxTranslator = defaultLabels): Transaction[] {
  return [
    { name: 'Salary', amount: '+ 1,200.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '8 May', currency: 'GBP' },
    { name: 'Tesco', amount: '47.82 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '10 May', currency: 'GBP' },
    { name: 'Netflix', amount: '15.99 GBP', isPositive: false, imgSrc: logoUrl('netflix.com'), date: '9 May', currency: 'GBP' },
    { name: 'From GBP', subtitle: labels.movedByYou, amount: '+ 50.00 EUR', isPositive: true, icon: <Plus size={24} />, date: '6 May', currency: 'EUR' },
    // Add enough to reach target balances
  ];
}
```

#### 1.3 Create `shared-resources/data/common-business-currencies.ts` and `common-business-transactions.tsx`

Same pattern — a minimal business dataset.

#### 1.4 Create `shared-resources/data/joint-account-data.tsx`

Joint/shared account for the `power` dataset:

```typescript
import { Plus, Receive, Send, Convert } from '@transferwise/icons';
import { logoUrl } from './transactions';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance } from './transactions';

export const jointTransactions: Transaction[] = [
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 April', currency: 'GBP' },
  { name: 'British Gas', amount: '87.40 GBP', isPositive: false, imgSrc: logoUrl('britishgas.co.uk'), date: '7 April', currency: 'GBP' },
  // ...more transactions
];

export const jointCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '91234567',
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', jointTransactions),
    accountDetails: '23-08-01 · 70291845',
    hasInterest: true,
    interestRate: '3.26%',
    totalReturns: '+0.85 GBP',
  },
  {
    code: 'USD',
    balanceId: '91234890',
    name: 'US dollar',
    symbol: '$',
    balance: computeCurrencyBalance('USD', jointTransactions),
    accountDetails: '021000021 · 894012673',
  },
];
```

#### 1.5 Add a `holidayJar` to `shared-resources/data/jar-data.tsx`

The `power` personal dataset should have 2 jars (savings + holiday) for richer demo. Add a `holidayJar: JarDefinition` alongside the existing `savingsJar` and `suppliesJar`. Also add a `growthJar` for `power` business (so business also has 2 jars).

#### 1.6 Update `shared-resources/data/jar-data.tsx` — add `GROUP_IDS`

Add a `GROUP_IDS` constant mapping logical names to 8-digit string IDs:

```typescript
export const GROUP_IDS = {
  currentAccount: '48291035',
  taxes: '73850214',
  savings: '61724089',
  supplies: '39058162',
  growth: '85413076',
  joint: '27461830',
  holiday: '52937184',
} as const;
```

Every jar/group/joint needs a unique 8-digit ID. This is used for URL routing (`/groups/:id`).

#### 1.7 Update `shared-resources/data/balances.ts`

Add `dataset` parameter and handle per-dataset totals:

```typescript
export function computeTotalBalance(accountType: AccountType, homeCurrency: string, rates = usdBaseRates, dataset: DatasetType = 'power'): number {
  // ... switch on dataset, sum all accounts for that dataset
}
```

For `power`: include current account + group (business) + jar + joint (personal) + holiday (personal).
For `common`: just current account currencies (no jars, no group).

---

### Phase 2: Mobile Dataset Switching

#### 2.1 Create `mobile/src/context/Dataset.tsx`

```typescript
import { createContext, useContext, useState, useCallback } from 'react';

export type DatasetType = 'common' | 'power';
// When adding real users later, extend: | 'sarah-personal' | 'sarah-business'

type DatasetContextValue = {
  dataset: DatasetType;
  setDataset: (d: DatasetType) => void;
};

const DatasetContext = createContext<DatasetContextValue>({ dataset: 'power', setDataset: () => {} });

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDatasetRaw] = useState<DatasetType>(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get('dataset');
    if (val && ['common', 'power'].includes(val)) {
      return val as DatasetType;
    }
    return 'power';
  });

  const setDataset = useCallback((d: DatasetType) => {
    setDatasetRaw(d);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'dataset-change', dataset: d }, '*');
    }
  }, []);

  return (
    <DatasetContext.Provider value={{ dataset, setDataset }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
```

#### 2.2 Create `mobile/src/hooks/useDataset.ts`

This is the **central data routing file**. Every hook returns different data based on the active dataset.

```typescript
import { useMemo } from 'react';
import { useDataset, type DatasetType } from '../context/Dataset';
import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { commonCurrencies } from '@shared/data/common-currencies';
import { commonBusinessCurrencies } from '@shared/data/common-business-currencies';
import { buildTransactions, type Transaction, type TxTranslator } from '@shared/data/transactions';
import { buildBusinessTransactions } from '@shared/data/business-transactions';
import { buildCommonTransactions } from '@shared/data/common-transactions';
import { buildCommonBusinessTransactions } from '@shared/data/common-business-transactions';
import { savingsJar, suppliesJar, growthJar, holidayJar, type JarDefinition } from '@shared/data/jar-data';
import { jointCurrencies, jointTransactions } from '@shared/data/joint-account-data';
import { groupCurrencies, groupTransactions } from '@shared/data/taxes-data';
import type { CurrencyData } from '@shared/data/currencies';
import type { AccountType } from '../App';

type CardInfo = {
  type: 'physical' | 'digital';
  lastFour: string;
  image: string;
};

// Card arrays per dataset
const personalPowerCards: CardInfo[] = [
  { type: 'physical', lastFour: '8130', image: '/wise-card-physical.png' },
  { type: 'digital', lastFour: '6663', image: '/wise-card-personal-digital-turquoise.png' },
];
const personalCommonCards: CardInfo[] = [
  { type: 'physical', lastFour: '8130', image: '/wise-card-physical.png' },
];
const businessPowerCards: CardInfo[] = [
  { type: 'physical', lastFour: '5271', image: '/wise-card-biz-physical.png' },
  { type: 'digital', lastFour: '9034', image: '/wise-card-biz-digital-aqua.png' },
];
const businessCommonCards: CardInfo[] = [
  { type: 'physical', lastFour: '5271', image: '/wise-card-biz-physical.png' },
];
const businessTaxesCards: CardInfo[] = [
  { type: 'digital', lastFour: '4219', image: '/wise-card-biz-digital-yellow.png' },
  { type: 'digital', lastFour: '7803', image: '/wise-card-biz-digital-orange.png' },
];
const jointPowerCards: CardInfo[] = [
  { type: 'digital', lastFour: '1847', image: '/wise-card-personal-digital-green.png' },
];

export function useActiveCards(accountType: AccountType): CardInfo[] {
  const { dataset } = useDataset();
  if (accountType === 'business') {
    return dataset === 'common' ? businessCommonCards : businessPowerCards;
  }
  return dataset === 'common' ? personalCommonCards : personalPowerCards;
}

export function useActiveGroupCards(accountType: AccountType): CardInfo[] {
  const { dataset } = useDataset();
  if (dataset === 'power' && accountType === 'business') return businessTaxesCards;
  return [];
}

export function useActiveJointCards(): CardInfo[] {
  const { dataset } = useDataset();
  if (dataset === 'power') return jointPowerCards;
  return [];
}

export function useActiveCurrencies(accountType: AccountType): CurrencyData[] {
  const { dataset } = useDataset();
  if (accountType === 'business') {
    return dataset === 'common' ? commonBusinessCurrencies : businessCurrencies;
  }
  return dataset === 'common' ? commonCurrencies : currencies;
}

export function useActiveTransactions(
  accountType: AccountType,
  consumerName: string,
  businessName: string,
  txLabels: TxTranslator,
): Transaction[] {
  const { dataset } = useDataset();
  return useMemo(() => {
    if (accountType === 'business') {
      return dataset === 'common'
        ? buildCommonBusinessTransactions(consumerName, txLabels)
        : buildBusinessTransactions(consumerName, txLabels);
    }
    return dataset === 'common'
      ? buildCommonTransactions(consumerName, businessName, txLabels)
      : buildTransactions(consumerName, businessName, txLabels);
  }, [accountType, dataset, consumerName, businessName, txLabels]);
}

export function useHasJars(accountType: AccountType): boolean {
  const { dataset } = useDataset();
  return dataset === 'power';
}

export function useActiveJars(accountType: AccountType): JarDefinition[] {
  const { dataset } = useDataset();
  if (dataset !== 'power') return [];
  return accountType === 'business' ? [suppliesJar, growthJar] : [savingsJar, holidayJar];
}

export function useHasJoint(): boolean {
  const { dataset } = useDataset();
  return dataset === 'power';
}

export function useHasTaxes(accountType: AccountType): boolean {
  const { dataset } = useDataset();
  return dataset === 'power' && accountType === 'business';
}

export function useActiveJointCurrencies(): CurrencyData[] {
  return jointCurrencies;
}

export function useActiveJointTransactions(): Transaction[] {
  return jointTransactions;
}

export function useActiveGroupCurrencies(accountType: AccountType): CurrencyData[] {
  return groupCurrencies;
}

export function useActiveGroupTransactions(accountType: AccountType): Transaction[] {
  return groupTransactions;
}

export function isUserDataset(dataset: DatasetType): boolean {
  return !['common', 'power'].includes(dataset);
}

type DatasetIdentity = {
  personalName: string;
  businessName: string;
  personalAvatar: string | undefined;
  businessAvatar: string | undefined;
  pairedDataset: DatasetType | null;
};

const DATASET_IDENTITY: Record<string, DatasetIdentity> = {};

export function useDatasetIdentity(accountType: AccountType): { activeName: string; activeAvatar: string | undefined; otherName: string; otherAvatar: string | undefined; pairedDataset: DatasetType | null } {
  const { dataset } = useDataset();
  const identity = DATASET_IDENTITY[dataset];
  if (identity) {
    const isBusiness = accountType === 'business';
    return {
      activeName: isBusiness ? identity.businessName : identity.personalName,
      activeAvatar: isBusiness ? identity.businessAvatar : identity.personalAvatar,
      otherName: isBusiness ? identity.personalName : identity.businessName,
      otherAvatar: isBusiness ? identity.personalAvatar : identity.businessAvatar,
      pairedDataset: identity.pairedDataset,
    };
  }
  return { activeName: '', activeAvatar: undefined, otherName: '', otherAvatar: undefined, pairedDataset: null };
}
```

#### 2.3 Wire DatasetProvider into `mobile/src/App.tsx`

1. Import `DatasetProvider` and wrap it around the existing provider tree (inside `LanguageProvider`, outside `PrototypeNamesProvider`):
   ```typescript
   import { DatasetProvider } from './context/Dataset';
   // In render:
   <LanguageProvider>
     <DatasetProvider>
       <PrototypeNamesProvider>
         ...
       </PrototypeNamesProvider>
     </DatasetProvider>
   </LanguageProvider>
   ```

2. In `AppInner`, replace all direct data imports with hooks:
   - Replace `currencies` / `businessCurrencies` with `useActiveCurrencies(accountType)`
   - Replace `buildTransactions()` / `buildBusinessTransactions()` with `useActiveTransactions(...)`
   - Replace hardcoded jar rendering with `useActiveJars(accountType)`
   - Add `useHasJoint()` / `useActiveJointCurrencies()` for joint account rendering
   - Add `useHasTaxes(accountType)` / `useActiveGroupCurrencies()` for group rendering

3. Update `balanceOwnerMap` — it needs to be dynamic based on active dataset currencies. Move it inside the component and recalculate when dataset changes, or use a `useMemo` that depends on the dataset hooks.

4. Add joint account `SubPage` type if not present:
   ```typescript
   | { type: 'joint-account' }
   ```
   With corresponding navigation callbacks and URL routing.

#### 2.4 Wire into `mobile/src/pages/Home.tsx`

Replace static data with hooks:
```typescript
const activeCurrencies = useActiveCurrencies(accountType);
const activeTransactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);
const jars = useActiveJars(accountType);
const hasJoint = useHasJoint();
const hasTaxes = useHasTaxes(accountType);
const jointCurrencies = useActiveJointCurrencies();
const groupCurrencies = useActiveGroupCurrencies(accountType);
```

Render jars dynamically:
```typescript
{jars.map((jar) => (
  <JarCard key={jar.id} name={t(jar.nameKey)} icon={...} color={jar.color} ... />
))}
```

Conditionally render joint card:
```typescript
{hasJoint && accountType === 'personal' && (
  <MultiCurrencyAccountCard title={t('home.joint')} ... />
)}
```

Conditionally render taxes/group card:
```typescript
{hasTaxes && (
  <MultiCurrencyAccountCard title={t('home.taxes')} ... />
)}
```

#### 2.5 Wire into `mobile/src/pages/CurrentAccount.tsx`

Replace static currency/transaction imports with the hooks. The page already supports `jar` and `jarConfig` props — add similar support for `joint` via a new prop or by treating joint as another account variant.

#### 2.6 Add dataset selector to `mobile/src/components/PrototypeSettings.tsx`

Add a SelectInput dropdown below the appearance settings:

```typescript
import { useDataset, type DatasetType } from '../context/Dataset';

// Inside component:
const { dataset, setDataset } = useDataset();

// In the drawer:
<div>
  <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>Dataset</label>
  <SelectInput
    size="md"
    value={dataset}
    onChange={(val) => setDataset(val as DatasetType)}
    items={[
      { type: 'option', value: 'power' },
      { type: 'option', value: 'common' },
    ]}
    renderValue={(val) => (
      <SelectInputOptionContent title={{ power: 'Power (full features)', common: 'Common (minimal)' }[val] ?? val} />
    )}
  />
</div>
```

When a user-dataset is selected (via future `/add-dataset` skill), the dropdown auto-includes it.

#### 2.7 Update `computeTotalBalance` call sites

Every place that calls `computeTotalBalance(accountType, homeCurrency, rates)` now needs to pass the dataset:
```typescript
const { dataset } = useDataset();
computeTotalBalance(accountType, homeCurrency, rates, dataset);
```

---

### Phase 3: Web Dataset Switching

The web prototype follows the same pattern. Key differences from mobile:
- No `IOSTopBar` / participant avatars — web uses `TopBar` with a simpler avatar
- No `DeviceFrame` parent messaging
- `ScreenGallery` needs to respect the dataset

#### 3.1 Create `web/src/context/Dataset.tsx`

Same as mobile but without the parent postMessage:

```typescript
import { createContext, useContext, useState, useCallback } from 'react';

export type DatasetType = 'common' | 'power';

type DatasetContextValue = {
  dataset: DatasetType;
  setDataset: (d: DatasetType) => void;
};

const DatasetContext = createContext<DatasetContextValue>({ dataset: 'power', setDataset: () => {} });

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDatasetRaw] = useState<DatasetType>(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get('dataset');
    if (val && ['common', 'power'].includes(val)) return val as DatasetType;
    return 'power';
  });

  const setDataset = useCallback((d: DatasetType) => setDatasetRaw(d), []);

  return (
    <DatasetContext.Provider value={{ dataset, setDataset }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
```

#### 3.2 Create `web/src/hooks/useDataset.ts`

Identical to mobile's version (same imports from `@shared/data/`, same hooks). Web doesn't use `useActiveCards` / card-related hooks (web handles cards differently via static images in the CSS), but include them anyway for consistency.

#### 3.3 Wire `DatasetProvider` into `web/src/App.tsx`

Same provider wrapping pattern. Replace static imports with hooks in `AppInner`:
- `currencies` → `useActiveCurrencies(accountType)`
- `buildTransactions()` → `useActiveTransactions(...)`
- Single jar → `useActiveJars(accountType)` (render all jars dynamically)
- `groupCurrencies` → conditional on `useHasTaxes(accountType)`
- Add joint account support (new SubPage type `'joint-account'`)
- Make `balanceOwnerMap` dynamic

#### 3.4 Wire into `web/src/pages/Home.tsx`

Replace:
```typescript
import { currencies } from '../data/currencies';
import { businessCurrencies } from '../data/business-currencies';
import { buildTransactions } from '../data/transactions';
import { buildBusinessTransactions } from '../data/business-transactions';
import { savingsJar, suppliesJar } from '../data/jar-data';
```

With:
```typescript
import { useActiveCurrencies, useActiveTransactions, useActiveJars, useHasJoint, useHasTaxes, useActiveJointCurrencies, useActiveGroupCurrencies } from '../hooks/useDataset';
```

Then render jars in a loop, conditionally render joint/taxes cards.

#### 3.5 Wire into `web/src/pages/CurrentAccount.tsx`

Same pattern — replace static imports with hook calls.

#### 3.6 Add dataset selector to `web/src/components/PrototypeSettings.tsx`

Same dropdown as mobile, placed in the "Visual" settings section.

#### 3.7 Add joint account SubPage and routing

In `web/src/App.tsx`:
- Add `{ type: 'joint-account' }` to `SubPage` union
- Add `GROUP_IDS.joint` handling in `parseUrl()` and `stateToPath()`
- Add navigation callbacks: `handleNavigateJointAccount`, `handleNavigateCurrencyFromJoint`
- Register joint balance IDs in `balanceOwnerMap`

---

### Phase 4: Translation Keys

Add to all 4 language files (en, es, de, fr) in both mobile and web:

```typescript
// en.ts additions:
'home.joint': 'Joint',
'home.holiday': 'Holiday',
'home.growth': 'Growth',
'settings.dataset': 'Dataset',
'settings.datasetPower': 'Power (full features)',
'settings.datasetCommon': 'Common (minimal)',
```

---

## Card Image Reference

These images should already exist in `mobile/public/` and `web/public/`:

| File | Use |
|------|-----|
| `/wise-card-physical.png` | Personal physical (light green) |
| `/wise-card-biz-physical.png` | Business physical (dark green) |
| `/wise-card-personal-digital-turquoise.png` | Personal digital tapestry |
| `/wise-card-personal-digital-green.png` | Personal digital tapestry (alt) |
| `/wise-card-biz-digital-aqua.png` | Business digital tapestry |
| `/wise-card-biz-digital-orange.png` | Business digital tapestry |
| `/wise-card-biz-digital-yellow.png` | Business digital tapestry |

If any are missing, source them from the account-structure-2.0 fork at `/Users/connor.berry/Documents/Developer/design-prototypes/account-structure-2.0/base-surfaces-mobile/mobile/public/`.

---

## Card Rules

- **Physical cards ALWAYS first** in the array
- **Personal physical** = light green card, dark text overlay (`cardInfoLight: false`)
- **Business physical** = dark green card, white text overlay (`businessCardStyle: true`)
- **Digital cards** = tapestry backgrounds, white text overlay (`cardInfoLight: true`)
- **No duplicate tapestry images** within the same account
- **3-card stack**: same total height as 2-card (CSS uses tighter overlap via `.mca-cards__back + .mca-cards__fire { top: 14px }`)

---

## Jar Colour Rules

Only use Wise brand bright colours:

| Hex | Name |
|-----|------|
| `#9FE870` | bright-green |
| `#FFEB69` | bright-yellow |
| `#A0E1E1` | bright-blue |
| `#FFD7EF` | bright-pink |
| `#FFC091` | bright-orange |

---

## Verification Checklist

After implementation, verify for EACH dataset (`power` and `common`):

1. `npm run build` passes in both mobile and web
2. **Home page**: correct total balance, correct number of account cards, correct jars
3. **Power dataset**: shows 2 cards, 2 jars, taxes (business), joint (personal)
4. **Common dataset**: shows 1 card, no jars, no taxes, no joint
5. **Card stacks**: physical first, correct colours, correct `cardInfoLight`
6. **Account switching** (personal ↔ business): data swaps cleanly
7. **Navigate into accounts/currencies**: no broken routes, correct data
8. **Transactions**: correct per dataset
9. **Total balance**: includes all sub-accounts (jars + group + joint for power)

---

## Future Extension

Once the infrastructure is in, real customer datasets can be added via the `/add-dataset` skill (see `~/.claude/skills/add-dataset/SKILL.md` in account-structure-2.0). Each new person adds:
- Currency + transaction files in `shared-resources/data/`
- Jar/joint/group files if applicable
- Cases in every `useDataset.ts` hook
- Entry in `DATASET_IDENTITY`
- New `DatasetType` union member
- Balance IDs in `balanceOwnerMap`
- Avatar in `public/`

The infrastructure you're building here is what makes all that possible.
