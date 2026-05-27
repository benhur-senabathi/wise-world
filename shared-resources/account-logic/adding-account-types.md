# Adding a New Account Type

Step-by-step guide for adding a new account type using the **Account Registry** system.

**Architecture:** A single `AccountDefinition` in `shared-resources/data/account-registry.ts` drives everything. Once registered, the account automatically appears in: Home carousel, Cards page, Transactions page, Insights, Payments, Currency pages, Account pages, action buttons, colours, icons, flows, and total balance.

**Existing examples:** Current Account, Group (Taxes), Shared Spending, Joint Account, Young Explorer.

---

## What you need to create

| # | What | Purpose |
|---|------|---------|
| 1 | Data file | Currencies + transactions for the account |
| 2 | Registry entry | Single source of truth — drives all UI |
| 3 | Translation keys | `en.ts` + `es.ts` per project |
| 4 | Card images | Large PNG for Cards tab, medium PNG for thumbnail, tapestry JPG for MCA |

That's it. Everything else cascades automatically from the registry.

---

## Step 1: Create the data file

Create `shared-resources/data/<name>-data.tsx`:

```tsx
import { Plus } from '@transferwise/icons';
import type { CurrencyData } from './currencies';
import type { Transaction } from './transactions';
import { computeCurrencyBalance, logoUrl } from './transactions';

export const myAccountTransactions: Transaction[] = [
  // First tx MUST be positive (establishes balance)
  { name: 'From GBP', subtitle: 'Moved by you', amount: '+ 500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'GBP' },
  // Merchants: use imgSrc, NO subtitle, NO icon
  { name: 'Tesco', amount: '34.50 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '18 May', currency: 'GBP' },
];

export const myAccountCurrencies: CurrencyData[] = [
  {
    code: 'GBP',
    balanceId: '12345678',  // unique 8-digit number
    name: 'British pound',
    symbol: '£',
    balance: computeCurrencyBalance('GBP', myAccountTransactions),
    accountDetails: '23-14-70 · 12345678',  // optional — only if account has bank details
  },
];
```

### Transaction rules

| Category | `imgSrc` | `icon` | `subtitle` | Example |
|----------|----------|--------|-----------|---------|
| Card spend (merchants) | `logoUrl('domain.com')` | NO | NO | `{ name: 'Tesco', amount: '34.50 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '18 May', currency: 'GBP' }` |
| Money movement | NO | Yes (`<Plus>`, `<Send>`, etc) | Yes (`labels.added`, `labels.sent`, `labels.moved`) | `{ name: 'From GBP', subtitle: 'Moved by you', amount: '+ 500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 May', currency: 'GBP' }` |

**Amount format:** Never use `'- 34.50 GBP'`. Use `'34.50 GBP'` with `isPositive: false`. Positive amounts use `'+ 500.00 GBP'`.

---

## Step 2: Add registry entry

In `shared-resources/data/account-registry.ts`, add to the `accountRegistry` array:

```ts
{
  id: GROUP_IDS.myAccount,
  subPageType: 'my-account',
  nameKey: 'home.myAccount',
  style: { color: '#BACKGROUND', textColor: '#ICON_COLOR', iconName: 'IconName' },
  visibleFor: ['personal'],
  features: {
    hasCards: true,
    hasAccountDetails: false,
    hasSend: false,
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
    { type: 'digital', lastFour: '1234', image: '/wise-card-my-account.png' },
  ],
  homeCard: { cardBottomImage: '/wise-card-my-account-bg.png', cardInfoLight: true },
  participants: [
    { name: 'Person Name', imgSrc: 'https://www.tapback.co/api/avatar/name.webp' },
  ],
  getCurrencies: () => myAccountCurrencies,
  getTransactions: () => myAccountTransactions,
  menuItemKeys: ['currentAccount.editMyAccount', 'common.statementsAndReports', 'currentAccount.closeMyAccount'],
},
```

Also add a GROUP_ID in `jar-data.tsx`:

```ts
export const GROUP_IDS = {
  // ... existing IDs
  myAccount: '12345678',  // unique 8-digit number
} as const;
```

### Brand colour sets

| Name | Background (`color`) | Icon (`textColor`) | Use for |
|------|---------------------|-------------------|---------|
| Green | `#9FE870` | `#163300` | Current Account ONLY |
| Yellow | `#FFEB69` | `#3a341c` | Group/Taxes |
| Blue | `#a0e1e1` | `#21231d` | Shared Spending |
| Orange | `#FFC091` | `#260A2F` | Young Explorer |
| Pink | `#FFD7EF` | `#320707` | Joint Account |

Pick an unused colour set. Lighter = always background, darker = always icon.

### Feature flags reference

| Flag | Effect |
|------|--------|
| `hasCards` | Cards page includes this account's cards |
| `hasAccountDetails` | Shows "Account details" button on account + currency pages |
| `hasSend` | Shows Send action button |
| `hasRequest` / `hasPaymentLink` | Shows Request/Get Paid action |
| `hasConvert` | Shows Convert button (false = hidden entirely) |
| `moveOnly` | Replaces "Convert or move" with just "Move", hides Send |
| `hideAddCurrency` | Hides "Add new currency" in Currencies tab |
| `singleCurrency` | Defaults tab to 'transactions' on account page |
| `hasParticipants` | Shows Sharing/Team section in Options tab |
| `participantStyle` | `'sharing'` (consumer) or `'team'` (business) |

---

## Step 3: Add translation keys

Add to `en.ts` and `es.ts` in each project:

```ts
'home.myAccount': 'My Account',
'currentAccount.editMyAccount': 'Edit account',
'currentAccount.closeMyAccount': 'Close account',
```

---

## Step 4: Add card images

| Image type | Size | Format | Location | Used by |
|-----------|------|--------|----------|---------|
| Large | 1192x752 | PNG | `/public/` | Cards tab carousel |
| Medium | 256x168 | PNG | `/public/` | Card thumbnails |
| Tapestry | 1000x416 | JPG | `src/assets/` | MCA home card (`homeCard.cardBottomImage`) |

---

## What cascades automatically

Once the registry entry exists, these all work without additional code:

- Home carousel card (MCA with tapestry image)
- Account page (colours, icons, action buttons, menu items, currencies tab, transactions tab)
- Currency page (colours, icons, breadcrumb label, action buttons)
- Cards page (cards appear if `hasCards: true`)
- Transactions page (merged transaction list)
- Insights page (balance breakdown)
- Payments page (account details if `hasAccountDetails: true`)
- Action button visibility (Add, Move, Send, Convert, Request)
- "Move only" mode (single button relabelled)
- URL routing (`parseUrl` resolves via registry)
- Path generation (`stateToPath` resolves via registry)
- Balance owner map (`buildBalanceOwnerMap` includes all registry accounts)
- Total balance (`computeTotalBalance` aggregates from registry-visible accounts)

---

## File checklist

### Must create/modify
- [ ] `shared-resources/data/<name>-data.tsx` — currencies + transactions
- [ ] `shared-resources/data/jar-data.tsx` — GROUP_ID entry
- [ ] `shared-resources/data/account-registry.ts` — `AccountDefinition` entry
- [ ] `src/translations/en.ts` + `es.ts` (per project) — i18n keys
- [ ] Card images — large, medium, and tapestry

### Automatic (verify visually, no code changes)
- [ ] Home carousel — MCA card appears
- [ ] Account page — features, colours, icons, menu from registry
- [ ] Currency page — data, features, colours, icons from registry
- [ ] Cards page — cards listed
- [ ] Transactions page — merged into all-accounts list
- [ ] Insights — balance breakdown includes new account
- [ ] Total balance — aggregated correctly
- [ ] URL routing — resolves via registry
