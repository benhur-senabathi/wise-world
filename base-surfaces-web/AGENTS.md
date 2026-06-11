<!-- Auto-generated from CLAUDE.md by scripts/sync-agents-md.sh — do not edit directly -->

# Base Surfaces Prototype

React + TypeScript + Vite prototype of the Wise app. Covers Home, Cards, Transactions, Payments, Recipients, Team, Insights, Account, CurrentAccount, CurrencyPage for consumer and business account types.

## Rules

1. **Read before building.** Always read existing source files before modifying or creating components. Never guess at props, APIs, or patterns.
2. **Design system first.** Use `@transferwise/components` and `@transferwise/icons` for all UI. Before using any Neptune component, verify its props via the Wise Design System MCP (`list-all-documentation` → `get-documentation`). For custom prototype components, check `web/design-system/custom-components.md`.
3. **Use documented tokens only.** No hardcoded hex values, magic numbers, or ad-hoc CSS variables. Check `shared-resources/design-system/tokens.md` and `web/design-system/custom-tokens.md`.
4. **Check before creating.** Before building a new component or token, check `web/design-system/custom-components.md` and `web/design-system/custom-tokens.md` — it may already exist.
5. **Read design system docs on demand.** Detailed references live in `web/design-system/`. Read them when working on related areas — don't rely on memory.
6. **Commit message formatting.** No co-authored-by lines. Use `• ` (bullet character) for lists in commit bodies (renders in Slack notifications). Keep each bullet short and concise — no filler, just what changed.
7. **Shared data.** Balances, transactions, recipients, rates, jars, and account details live in `shared-resources/data/` — import via `@shared/data/` (Vite alias). Only `src/data/nav.tsx` is platform-specific.
8. **Never guess component APIs.** Always verify `@transferwise/components` props via the Wise Design System MCP before writing JSX. If the MCP is unavailable, tell the user.
9. **CSS is per-component.** Every custom component, page, and flow has a co-located `.css` file imported at the top of the `.tsx`. Global tokens, resets, and shared layout live in `src/styles/global.css` only. When creating a new component: create `ComponentName.css` alongside the `.tsx` and add `import './ComponentName.css'`. When using another component's class names directly, import that component's CSS explicitly.
10. **Registry-driven and dataset-aware.** Never hardcode account types or navigation logic. Use `getAccountBySubPageType()`, `getAccountById()`, `getVisibleAccounts()` from the account registry. All data must respect the active dataset — never directly import currency data, use dataset-aware hooks like `useActiveCurrencies()`. When building features, always ask: "Does this work if I add a new account type?" and "Does this work with different datasets?"

## Quick Start

```bash
npm update       # update all packages to latest compatible versions
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
```

## Architecture

### Routing

State-driven navigation with History API URL sync (no router library). **Every page must have a URL.** All URLs use 8-digit numeric IDs — no slugs, currency codes, or query params. Read `shared-resources/account-logic/routing.md` for the full URL reference, ID system, and instructions for adding new routes.

Key rules:
- `activeNavItem` (English label like `'Home'`) + `subPage` union type drive navigation state
- `parseUrl()` and `stateToPath()` in `App.tsx` sync URLs ↔ state
- Group IDs in `GROUP_IDS` (`src/data/jar-data.tsx`), balance IDs on `CurrencyData.balanceId`
- `balanceOwnerMap` in `App.tsx` resolves any balance ID to its group automatically

### Context Providers (outermost first)

1. **`LanguageProvider`** (`src/context/Language.tsx`) — holds current language, exposes `t(key, vars?)`. Supports `{var}` interpolation and `{count, plural, one {x} other {y}}` syntax.
2. **`PrototypeNamesProvider`** (`src/context/PrototypeNames.tsx`) — holds editable consumer/business names.
3. **`LiveRatesProvider`** (`src/context/LiveRates.tsx`) — simulates live exchange rate fluctuations, updates every 10 seconds. Exposes `useLiveRates()` returning `Record<string, number>`.
4. **`ShimmerProvider`** (`src/context/Shimmer.tsx`) — controls shimmer/skeleton loading mode for components. Exposes `useShimmer()` returning `{ shimmerMode, setShimmerMode }`.

### Account Types

`AccountType = 'personal' | 'business'` — toggled via PrototypeSettings or Account page. Each type has its own nav items (`personalNav` / `businessNav`), currency data, and transaction data.

### Account Types & Balances

See `shared-resources/account-logic/` for the authoritative reference. Key rules:
- `AccountType = 'personal' | 'business'` — 3 account categories: Current Account, Jar, Group
- Total balance = current + group + jar. Use `computeTotalBalance()` from `@shared/data/balances`
- Balances auto-computed from transactions — never hardcode
- "Taxes" is just the display name for the Group account — code uses `groupCurrencies` / `isGroup`

## i18n

- `src/translations/en.ts` — English strings, exported `as const`
- `src/translations/es.ts` — Spanish strings, typed as `Translations`
- **Translate**: UI chrome (labels, buttons, headers, descriptions, modals)
- **Don't translate**: names, currency codes, amounts, brand terms ("Wise"), Claude prompt strings
- **Writing guidelines**: When writing or reviewing any UI copy, follow the Wise content guidelines in `shared-resources/content/` — see `writing-guidelines.md` for the master reference

## Illustrations & Flags (`@wise/art`)

Use `@wise/art` for all illustrations and flags — they load from the Wise CDN, no local files needed.

**Flags** — use for currency/country indicators:
```tsx
import { Flag } from '@wise/art';
<Flag code="GBP" />
```

**Static illustrations** — 100+ options, use for promo banners, empty states, success screens:
```tsx
import { Illustration } from '@wise/art';
<Illustration name="confetti" size="large" />
```

**Animated 3D illustrations** — 13 options, use for celebration/success moments:
```tsx
import { Illustration3D } from '@wise/art';
<Illustration3D name="confetti" size="medium" />
```

Available 3D names: `lock`, `globe`, `confetti`, `check-mark`, `flower`, `graph`, `jars`, `magnifying-glass`, `marble`, `marble-card`, `multi-currency`, `plane`, `interest`

For the full list of static illustration names, check `node_modules/@wise/art/src/illustrations/metadata.ts`.

## Key Dependencies

- `@transferwise/components` — DS component library (Button, ListItem, SearchInput, SegmentedControl, etc.)
- `@transferwise/icons` — icon set
- `@wise/art` — flags, illustrations (static + animated 3D), loaded from Wise CDN
- `recharts` — charting library (used by TransferCalculator for rate chart)
- `agentation` — dev-only annotation toolbar
- React 18 + TypeScript + Vite

## Design System Reference

Account logic docs in `shared-resources/account-logic/` — platform-agnostic business rules shared across prototypes:

| Doc | Contents |
|-----|----------|
| `account-types.md` | Account type hierarchy (Current, Jar, Group/Shared), feature matrix, action button logic, more menu logic, visual alignment rules |
| `balances-and-accounts.md` | What updates when balances change, full checklist for adding jars/groups/currencies, ID rules, realism rules |
| `interest-stocks.md` | Interest/stocks feature flag system (hasInterest, hasStocks, interestRate, totalReturns) |
| `routing.md` | Full URL reference, ID system (group IDs + balance IDs), and how to add new routes |

Shared design system docs in `shared-resources/design-system/` — cross-platform Neptune reference:

| Doc | Contents |
|-----|----------|
| `icons.md` | Icon usage, sizes, color contexts, @transferwise/icons reference |
| `flags-and-art.md` | @wise/art Flag and Illustration usage (CDN-based) |
| `components.md` | Neptune component inventory and usage patterns (React) |
| `tokens.md` | Neptune color, typography, spacing tokens (CSS variables) |
| `neptune-css.md` | Neptune CSS utilities, modifiers, and patterns |

Content & writing docs in `shared-resources/content/` — read when writing or reviewing UI copy:

| Doc | Contents |
|-----|----------|
| `writing-guidelines.md` | Master guide — tone, grammar, vocabulary, all component rules |
| `tone-of-voice.md` | Brand principles, context-specific tone, localization |
| `grammar-and-style.md` | A-Z grammar rules and style reference |
| `vocabulary.md` | Product terminology, words to use/avoid |
| `components/*.md` | Writing rules per UI component (buttons, modals, snackbars, inputs, etc.) |

Web-specific design system docs in `web/design-system/` — read these when working on related areas:

| Doc | Contents |
|-----|----------|
| `custom-tokens.md` | Prototype-specific extended tokens |
| `custom-components.md` | Custom components built for this prototype |
