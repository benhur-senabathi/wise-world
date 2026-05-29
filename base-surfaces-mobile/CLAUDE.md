# Base Surfaces Mobile Prototype

React + TypeScript + Vite prototype of the Wise mobile app. Runs inside a DeviceFrame iframe (iPhone 17 Pro / Air / Pro Max, switchable via SegmentedControl). Covers Home, Cards, Transactions, Payments, Recipients, Insights, Account, CurrentAccount, CurrencyPage for consumer and business account types.

## Rules

1. **Read before building.** Always read existing source files before modifying or creating components. Never guess at props, APIs, or patterns.
2. **Design system first.** Use `@transferwise/components` and `@transferwise/icons` for all UI. Before using any Neptune component, verify its props via the Wise Design System MCP (`list-all-documentation` → `get-documentation`). For custom prototype components, check `mobile/design-system/custom-components.md`.
3. **Use documented tokens only.** No hardcoded hex values, magic numbers, or ad-hoc CSS variables. Check `mobile/design-system/tokens.md` and `mobile/design-system/custom-tokens.md`.
4. **Check before creating.** Before building a new component or token, check `mobile/design-system/custom-components.md` and `mobile/design-system/custom-tokens.md` — it may already exist.
5. **Read design system docs on demand.** Detailed references live in `mobile/design-system/`. Read them when working on related areas — don't rely on memory.
6. **Commit message formatting.** No co-authored-by lines. Use `• ` (bullet character) for lists in commit bodies (renders in Slack notifications). Keep each bullet short and concise — no filler, just what changed.
7. **Shared data.** Balances, transactions, recipients, rates, jars, and account details live in `shared-resources/data/` at the repo root — edit data there, not locally. Import shared data via `@shared/data/` (Vite alias).
8. **Never guess component APIs.** Always verify `@transferwise/components` props via the Wise Design System MCP before writing JSX. If the MCP is unavailable, tell the user.
9. **CSS is per-component.** Every custom component, page, and flow has a co-located `.css` file imported at the top of the `.tsx`. Global tokens, resets, and shared layout live in `src/styles/global.css`; mobile standalone/DeviceFrame overrides in `src/styles/standalone.css`. When creating a new component: create `ComponentName.css` alongside the `.tsx` and add `import './ComponentName.css'`. When using another component's class names directly (e.g. `.ios-glass-btn`), import that component's CSS explicitly.

## Quick Start

```bash
npm update       # update all packages to latest compatible versions
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
```

## Architecture

### Mobile-Only Layout

This prototype is **mobile-only** — no tablet or desktop layouts, no responsive breakpoints. `.page-layout` is constrained to `max-width: 440px` so the content always renders at mobile width regardless of viewport. On desktop, `DeviceFrame` wraps the app in an iPhone shell iframe (Pro: 402px, Air: 420px, Pro Max: 440px) at 85% scale; on narrow viewports (≤460px) the frame is bypassed and content renders directly. `column-layout-main` is the sole layout container.

```
DeviceFrame (iPhone 17 Pro/Air/Pro Max shell, loads ?mode=app in iframe)
└── column-layout-main (sole layout container)
    ├── IOSTopBar (fixed top, liquid glass buttons)
    ├── container-content (main page area, scrolls)
    │   └── PageTransition (push/pop slide animations)
    │       └── Page content
    └── MobileNav (fixed bottom tab bar, liquid glass)
```

CSS custom properties on `.column-layout-main`:
- `--content-pad-top: 120px` (IOSTopBar clearance)
- `--content-pad-bottom: 80px` (MobileNav clearance)
- `--content-pad-x: 16px` (horizontal padding)

### Navigation Chrome

- **IOSTopBar** — Fixed top bar with Liquid Glass buttons. Contextual leading (avatar/back) and trailing (earn, eye, charts) based on current page. See `mobile/design-system/ios-components.md`.
- **MobileNav** — Fixed bottom tab bar (Home, Cards, Recipients, Payments) with animated highlight pill and WebGL liquid glass background.
- **PageTransition** — iOS-style push/pop slide transitions between pages. 380ms with spring easing. See `mobile/design-system/ios-components.md` for how to add transitions to new navigations.

### Flow Overlays

All money flows (Send, Request, Convert, Add Money, Payment Link) use full-viewport overlays that slide up from the bottom. Managed in App.tsx with `flowVisible`/`flowAnimating` state and `cubic-bezier(0.32, 0.72, 0, 1)` spring easing.

### Routing

State-driven navigation with History API URL sync (no router library). **Every page must have a URL.** All URLs use 8-digit numeric IDs — no slugs, currency codes, or query params. Read `shared-resources/account-logic/routing.md` for the full URL reference, ID system, and instructions for adding new routes.

Key rules:
- `activeNavItem` (English label like `'Home'`) + `subPage` union type drive navigation state
- `parseUrl()` and `stateToPath()` in `App.tsx` sync URLs <-> state
- Group IDs in `GROUP_IDS` (`src/data/jar-data.tsx`), balance IDs on `CurrencyData.balanceId`
- `balanceOwnerMap` in `App.tsx` resolves any balance ID to its group automatically

### Context Providers (outermost first)

1. **`DatasetProvider`** (`src/context/Dataset.tsx`) — manages active dataset selection for switching between customer data sets.
2. **`LanguageProvider`** (`src/context/Language.tsx`) — holds current language, exposes `t(key, vars?)`. Supports `{var}` interpolation and `{count, plural, one {x} other {y}}` syntax.
3. **`PrototypeNamesProvider`** (`src/context/PrototypeNames.tsx`) — holds editable consumer/business names.
4. **`LiveRatesProvider`** (`src/context/LiveRates.tsx`) — simulates live exchange rate fluctuations, updates every 10 seconds. Exposes `useLiveRates()` returning `Record<string, number>`.
5. **`ShimmerProvider`** (`src/context/Shimmer.tsx`) — controls shimmer/skeleton loading mode for components. Exposes `useShimmer()` returning `{ shimmerMode, setShimmerMode }`.

### Account Types

`AccountType = 'personal' | 'business'` — toggled via PrototypeSettings or Account page. Mobile has a fixed 4-tab bottom nav (Home, Cards, Recipients, Payments) for both account types. Each type has its own currency data and transaction data.

### Account Types & Balances

See `shared-resources/account-logic/` for the authoritative reference. Key rules:
- `AccountType = 'personal' | 'business'` — 3 account categories: Current Account, Jar, Group
- Total balance = current + group + jar. Use `computeTotalBalance()` from `@shared/data/balances`
- Balances auto-computed from transactions — never hardcode
- "Taxes" is just the display name for the Group account — code uses `groupCurrencies` / `isGroup`

### Account Registry

The **Account Registry** (`shared-resources/data/account-registry.ts`) is the single source of truth for all account definitions. Everything is data-driven from this one file.

**What it contains:** Each `AccountDefinition` has: `id`, `subPageType`, `nameKey`, `style` (color/textColor/iconName), `visibleFor`, `features` (hasCards, hasSend, hasConvert, moveOnly, etc.), `getCards`, `homeCard`, `participants`, `getCurrencies`, `getTransactions`, `menuItemKeys`.

**Lookup helpers** (exported from the same file):
- `getAccountBySubPageType(type)` — find account by route type
- `getAccountById(groupId)` — find account by GROUP_ID
- `getAccountByBalanceId(balanceId)` — resolve any balance ID to its parent account + currency
- `getVisibleAccounts(accountType)` — all accounts visible for personal/business
- `getAllCards(accountType)` / `getAllCurrencies(accountType)` / `getAllTransactions(accountType)` — flat aggregated lists
- `buildBalanceOwnerMap()` — Map of all balance IDs for routing resolution

**Hook layer** (`mobile/src/hooks/useAccountRegistry.ts`):
- `useVisibleAccounts(accountType)` — dataset-aware visible accounts
- `useAllCards(accountType)` — all cards across visible accounts
- `useAllCurrencies(accountType)` — all currencies (excluding Current Account)
- `useAllTransactions(accountType)` — all transactions (excluding Current Account)

**What it drives automatically:** Home carousel, Cards page, Transactions page, Insights, Payments, Currency pages, Account pages, action buttons, colours, icons, flows, total balance, URL routing, balance owner map.

**Adding a new account type** (4 steps):
1. Create a data file (`shared-resources/data/<name>-data.tsx`) with currencies + transactions
2. Add one entry to `shared-resources/data/account-registry.ts` (+ GROUP_ID in `jar-data.tsx`)
3. Add translation keys (`en.ts` + `es.ts`)
4. Add card images: large (1192x752 PNG in `/public/`), medium (256x168 PNG for thumbnails), tapestry (1000x416 JPG in `src/assets/` for MCA)

See `shared-resources/account-logic/adding-account-types.md` for the full guide.

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
- `web-haptics` — haptic feedback (vibration on touch interactions)
- `agentation` — dev-only annotation toolbar
- React 18 + TypeScript + Vite

## Haptic Feedback

`triggerHaptic()` from `src/hooks/useHaptics.ts` provides vibration feedback on touch interactions via the `web-haptics` library.

**Where haptics fire:**
- **BottomSheet** — on open (inside `requestAnimationFrame` chain)
- **IOSTopBar more button** — on click (`onMore` callback in App.tsx)
- **PromotionBanner** — on click (inner container onClick)
- **Cards carousel** — on card tap (onClick) and swipe (touchmove when card changes)
- **TransferCalculator** — on currency selection

**Make compatibility:** In Make's WKWebView, `triggerHaptic()` only works from direct user gesture handlers (`onClick`, `touchmove`). It does NOT work from async callbacks (`rAF`, `useEffect`, `setTimeout`, `scroll` events). When adding new haptics, always trigger from a direct event handler.

## Figma Make (.make)

The `.make` file is generated by the converter at `~/.claude/make-converter/convert.js`. Run:
```bash
node ~/.claude/make-converter/convert.js mobile --name "Mobile V1.0"
```

**Versioning:** Builds live in `makes/` with a version README. Versions increment as V1.0, V1.01, V1.02, etc. Only push a new version when the build is confirmed working. See `makes/README.md` for the version history and download links.

Key Make-specific behaviors:
- **Portal stripping** — `createPortal` is removed, so BottomSheet renders inline inside parent containers (not at `document.body`). CSS overrides in `MAKE_OVERRIDES` fix cascade conflicts.
- **DeviceFrame** — iframe replaced with direct `<div className="df-screen-content">{children}</div>`. The `df-screen-area` has `transform: translate3d(0,0,0)` creating a new containing block for `position: fixed`.
- **Scroll forwarding** — In frame mode, `.page-layout` scrolls (not `window`), so the converter overrides `window.scrollY` to forward `.page-layout.scrollTop`.
- **Fixed positioning** — Use CSS `left: 50%` with `translateX(-50%)` for centering, not JS `getBoundingClientRect()` (which returns viewport coords, wrong inside the transformed container).
- **Flow overlays** — `inset: 0` replaced with longhand `top: 0; left: 0; right: 0; height: 100vh` to prevent keyboard push on mobile.

## Design System Reference

Account logic docs in `shared-resources/account-logic/` — platform-agnostic business rules shared across prototypes:

| Doc | Contents |
|-----|----------|
| `account-types.md` | Account type hierarchy (Current, Jar, Group/Shared), feature matrix, action button logic, more menu logic, visual alignment rules |
| `adding-account-types.md` | **Full step-by-step guide for adding a new account type** — data, routing, navigation, pages, translations, cross-page impact, file checklist |
| `balances-and-accounts.md` | What updates when balances change, full checklist for adding jars/groups/currencies, ID rules, realism rules |
| `interest-stocks.md` | Interest/stocks feature flag system (hasInterest, hasStocks, interestRate, totalReturns) |
| `routing.md` | Full URL reference, ID system (group IDs + balance IDs), and how to add new routes |

Shared design system docs in `shared-resources/design-system/` — cross-platform Neptune reference:

| Doc | Contents |
|-----|----------|
| `icons.md` | Icon usage, sizes, color contexts, @transferwise/icons reference |
| `flags-and-art.md` | @wise/art Flag and Illustration usage (CDN-based) |
| `components.md` | Neptune component inventory and usage patterns (React) |

Content & writing docs in `shared-resources/content/` — read when writing or reviewing UI copy:

| Doc | Contents |
|-----|----------|
| `writing-guidelines.md` | Master guide — tone, grammar, vocabulary, all component rules |
| `tone-of-voice.md` | Brand principles, context-specific tone, localization |
| `grammar-and-style.md` | A-Z grammar rules and style reference |
| `vocabulary.md` | Product terminology, words to use/avoid |
| `components/*.md` | Writing rules per UI component (buttons, modals, snackbars, inputs, etc.) |

Mobile-specific design system docs in `mobile/design-system/` — read these when working on related areas:

| Doc | Contents |
|-----|----------|
| `tokens.md` | Neptune color, typography, spacing tokens (mobile has additional tokens vs web) |
| `custom-tokens.md` | Prototype-specific extended tokens |
| `custom-components.md` | Home page components (MCA, JarCard, Carousel, Tasks, etc.) |
| `custom-components-account.md` | Account & currency page components (header, actions, calculator, etc.) |
| `custom-components-flows.md` | Flow overlays, i18n, ButtonCue, shimmer system, success screens |
| `ios-components.md` | iOS-specific components (IOSTopBar, MobileNav, PageTransition, BottomSheet, DeviceFrame, Liquid Glass) |
| `liquid-glass-components.md` | Standalone liquid glass components (Button, IconButton, SegmentedControl, Switch, Container, Transform, TabBar) — when to use vs Neptune, surface recipes, dark mode |
| `neptune-css.md` | Neptune CSS utilities (includes MAKE_OVERRIDES for portal stripping) |
| `page-structure.md` | Mobile layout shell, navigation chrome, CSS custom properties |
| `src/flows/structure.md` | Flow overlay architecture, ButtonCue pattern, avatar styles, button state machine |
