# Routing & URL System

State-driven navigation with History API URL sync (no router library). All routing logic lives in `App.tsx` — `parseUrl()` (URL to state) and `stateToPath()` (state to URL).

## URL Reference

### Top-level pages

| Page | URL | Nav label |
|------|-----|-----------|
| Home | `/home` | `Home` |
| Cards | `/cards` | `Cards` |
| Transactions | `/all-transactions` | `Transactions` |
| Payments | `/payments` | `Payments` |
| Recipients | `/recipients` | `Recipients` |
| Insights | `/account-summary` | `Insights` |
| Team | `/team` | `Team` |
| Account settings | `/your-account` | `Account` |

### Groups, balances, and account details

| Page | URL | Example |
|------|-----|---------|
| Group (current account, jar, shared) | `/groups/:groupId` | `/groups/48291035` |
| Currency page | `/balances/:balanceId` | `/balances/50417283` |
| Account details list | `/account-details/:groupId` | `/account-details/48291035` |
| Account details (individual) | `/account-details/:balanceId` | `/account-details/28163950` |

### Flows

| Flow | URL | Steps |
|------|-----|-------|
| Send | `/send/:step` | `recipient`, `amount` |
| Request (personal) | `/request/:step` | `recipient`, `request` |
| Payment link (business) | `/request` | single step |
| Convert | `/convert` | single step |
| Add money | `/add` | single step |

Flows are fullscreen overlays. They push their own URL but can't be deep-linked (navigating directly to `/send/amount` falls back to `/home` since flow state can't be reconstructed from a URL).

## ID System

All IDs in URLs are **8-digit numeric codes**. No human-readable slugs, no currency codes, no query parameters.

### Group IDs

A group ID identifies an account container — the current account, a shared group, or a jar. Defined in `shared-resources/data/jar-data.tsx` as the `GROUP_IDS` constant:

| Group | ID |
|-------|----|
| Current account | `48291035` |
| Taxes (shared group) | `73850214` |
| Savings (jar) | `61724089` |
| Supplies (jar) | `39058162` |

### Balance IDs

A balance ID identifies a specific currency balance within a group. Defined as `balanceId` on each `CurrencyData` object. Every balance ID is globally unique — it maps to exactly one currency in exactly one group.

**Personal account balances:**

| Currency | Balance ID | Source file |
|----------|-----------|-------------|
| GBP | `50417283` | `currencies.ts` |
| EUR | `28163950` | `currencies.ts` |
| USD | `91735042` | `currencies.ts` |
| CAD | `63082714` | `currencies.ts` |

**Business account balances:**

| Currency | Balance ID | Source file |
|----------|-----------|-------------|
| GBP | `17480352` | `business-currencies.ts` |
| USD | `85230641` | `business-currencies.ts` |
| EUR | `40917263` | `business-currencies.ts` |
| SGD | `72604185` | `business-currencies.ts` |

**Taxes group:**

| Currency | Balance ID | Source file |
|----------|-----------|-------------|
| GBP | `35901847` | `group-data.tsx` |

**Jars:**

| Jar | Currency | Balance ID | Source file |
|-----|----------|-----------|-------------|
| Savings | GBP | `82047136` | `jar-data.tsx` |
| Supplies | GBP | `59316028` | `jar-data.tsx` |

### How balance IDs resolve to groups

`balanceOwnerMap` in `App.tsx` is a static lookup that maps every balance ID to its currency code and group context. This is built at module load from all currency lists.

When the app sees `/balances/50417283`, it looks up the map and gets `{ code: 'GBP', from: 'home' }` — meaning it's the GBP balance in the current account. Same for `/account-details/50417283`.

This means **no query parameters are ever needed** to identify which group a balance belongs to.

## Adding New Routes

### New top-level page

1. Add the URL to `parseUrl()` switch statement and `stateToPath()` in `App.tsx`
2. Add the nav item href in `src/data/nav.tsx`

### New group or jar

1. Add an 8-digit ID to `GROUP_IDS` in `jar-data.tsx`
2. Add `balanceId` (8-digit, unique) to each `CurrencyData` entry in the group
3. Register each balance in `balanceOwnerMap` in `App.tsx`
4. The existing `/groups/:id` route handles it automatically via `parseUrl()`

### New currency in an existing group

1. Add a unique 8-digit `balanceId` to the `CurrencyData` entry
2. Register it in `balanceOwnerMap` in `App.tsx`

### New flow

1. Add the flow type to `ActiveFlow` union in `App.tsx`
2. Add the URL to `flowToPath()` in `App.tsx`
3. If it has steps: add `onStepChange` prop, fire it on transitions, track `step` on the `ActiveFlow` type
4. Add a fallback case in `parseUrl()` so direct navigation doesn't break (flows can't be deep-linked)
