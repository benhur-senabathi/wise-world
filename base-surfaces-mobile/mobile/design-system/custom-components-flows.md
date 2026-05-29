# Custom Components — Flows & System

Flow overlay architecture, shared utilities, page-level components, and system infrastructure.

See also: [Home page components](custom-components.md) · [Account & currency components](custom-components-account.md)

---

## i18n System (Language Context)

### Description
Internationalisation system supporting English, Spanish, French, and German. A React context holds the current language and provides a `t()` translation function.

### Files
- `src/context/Language.tsx` — `LanguageProvider`, `useLanguage()`, `useTxLabels()`
- `src/translations/en.ts` — English dictionary (~540 keys), exports `TranslationKey` and `Translations` types
- `src/translations/es.ts`, `fr.ts`, `de.ts` — Typed as `Translations` (compiler enforces matching keys)

### API

| Export | Type | Description |
|--------|------|-------------|
| `LanguageProvider` | Component | Wraps the app (outermost provider) |
| `useLanguage()` | Hook | Returns `{ language, setLanguage, t }` |
| `useTxLabels()` | Hook | Returns translated transaction subtitle labels |

### Translation Function — `t(key, vars?)`
- Simple `{var}` interpolation
- ICU-like `{count, plural, one {x} other {y}}` syntax

### Key Conventions
- `nav.*` — Navigation labels
- `common.*` — Shared UI strings
- `home.*`, `account.*`, `cards.*`, etc. — Page-specific strings
- `tx.*` — Transaction subtitle labels

### What Is NOT Translated
Names, currency codes, amounts, brand terms ("Wise"), merchant names, membership numbers.

---

## Button Cue

### Description
Animated spotlight container that wraps a primary action button across all money flows.

### File
`src/components/ButtonCue.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `visible` | `boolean` | Whether the cue surface and hint are visible |
| `hint` | `ReactNode` | Optional hint content above the button |
| `children` | `ReactNode` | The button element to wrap |

### Behavior
- Surface appears with `scaleY(0.4) → scaleY(1)` spring animation
- Hint fades in with 100ms delay
- Typically shown after 500ms delay on flow mount
- Hides when button enters loading state

### Button State Machine
```
User enters amount → disabled → loading (2s) → active
User clears amount → active → loading (2s) → disabled → cue re-appears
```

### Disabled Button Styling
Overrides DS default: `background-color: var(--color-background-neutral)`, `color: var(--color-content-secondary)`, `pointer-events: none`.

### CSS Classes
- `.button-cue` — Relative container
- `.button-cue__surface` — Absolute background, grows from bottom
- `.button-cue__hint` — Flex row centered, icon + text
- `.button-cue--visible` — Triggers animations

---

## Recipient Search Empty State

### Description
Empty state when recipient search returns no results. Shows tips and "Add new recipient" link.

### File
`src/components/RecipientSearchEmpty.tsx`

### CSS Classes
- `.recipient-search-empty` — Container (24px top padding)
- `.recipient-search-empty__add-link` — Underlined button styled as link

---

## Flow Overlay (Shared Architecture)

### Description
All money flows (Add Money, Convert, Send, Request, Payment Link) share a common full-viewport overlay that slides up from the bottom.

### Files
- `src/flows/AddMoneyFlow.tsx`, `ConvertFlow.tsx`, `SendFlow.tsx`, `RequestFlow.tsx`, `PaymentLinkFlow.tsx`
- `src/flows/structure.md` — Architecture reference

### Slide-Up Transition (App.tsx)

**State:** `flowVisible` (mounts overlay), `flowAnimating` (triggers CSS transition)

**Opening:** `setActiveFlow(...)` → mount at `translateY(100%)` → double rAF → `translateY(0)`
**Closing:** `flowAnimating = false` → after 500ms → unmount

**From BottomSheet:** 350ms delay between sheet close and flow open to prevent z-index conflict.

### CSS
```css
.flow-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: var(--color-background-screen);
  transform: translateY(100%);
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}
.flow-overlay--open { transform: translateY(0); }
```

### Account Avatar Styles (`AccountStyle`)

All flows receive an `accountStyle: AccountStyle` prop from `App.tsx` that drives currency selector icon + color for any account type. No hardcoded avatar styling in flow components.

```ts
type AccountStyle = { color: string; textColor: string; iconName: string };
```

| Account | `color` | `textColor` | `iconName` |
|---------|---------|-------------|------------|
| Personal | `var(--color-interactive-accent)` | `var(--color-interactive-control)` | `Wise` |
| Business | `#163300` | `#9fe870` | `Wise` |
| Taxes (Group) | `#FFEB69` | `#3a341c` | `Money` |
| Jar | jar's own color | `#121511` | jar's own icon (e.g. `Savings`, `Suitcase`) |

Style constants live in `AppInner` (`currentAccountStyle`, `taxesGroupStyle`, `jarStyle(jar)`). ConvertFlow also accepts `toAccountStyle` for cross-account conversions.

### Multi-Step Flow Track (Send & Request)

Horizontal track with two panels. CSS `transform: translateX(-50%)` slides between steps. `isAnimating` state hides scrollbars during transition.

---

## Spotlight Card (Request Flow)

### Description
Custom bordered card buttons in the Request flow's "Someone else" section. Features animated SVG border.

### CSS Classes
- `.request-flow__spotlight-card` — Flex row button, 16px radius
- `.request-flow__spotlight-card--active` — Green border variant

---

## Live Currency Rates

### Description
Context provider simulating live exchange rate fluctuations. Updates every 10 seconds with small random deltas.

### File
`src/context/LiveRates.tsx`

### Usage
```tsx
const rates = useLiveRates();
// Record<string, number> e.g. { GBP: 1, EUR: 1.17, USD: 1.275 }
```

---

## AccountDetailsList

### Description
Interstitial page listing receivable currencies. Selecting a currency navigates to AccountDetailsPage.

### File
`src/pages/AccountDetailsList.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `accountType` | `AccountType` | `'personal'` \| `'business'` |
| `onSelectCurrency` | `(code: string) => void` | Currency row tap handler |
| `accountCurrencyCodes` | `string[]?` | Filters to held currencies only |

---

## AccountDetailsPage

### Description
Full account details view for a specific currency with bank details, copy-to-clipboard, share dropdown, and Quick Facts section.

### File
`src/pages/AccountDetailsPage.tsx`

### Structure
- **Header** — Flag avatar + currency code + subtitle
- **Receive section** — Heading + region subtitle + Share dropdown
- **Details card** — Grey card with copyable `DetailRow` components
- **Quick Facts** — Chip tabs (Fees/Speed/Limits) + FactCards + Availability cards

### Data Layer
`src/data/account-details-data.ts` — Per-currency, per-account-type data.

Supported currencies: GBP, EUR, USD (personal/business), CAD (personal), SGD (business).

### CSS Classes
- `.account-details-page` — Container
- `.account-details__card` — Grey card (neutral bg, 24px radius)
- `.account-details__row` — Detail row with copy button
- `.account-details__quick-facts` — Quick facts section
- `.account-details__fee-card` — Bordered card for facts
- `.account-details__availability-card` — Bordered card for availability items

---

## Success Screen (Theme-Switched)

### Description
Full-screen success pattern at the end of flows. Switches to `np-theme-personal--forest-green` theme.

### Key Implementation
Apply theme class to the flow's root element (not just success panel) so FlowNavigation inherits theme colors.

```tsx
<div className={`my-flow${step === 'success' ? ' np-theme-personal--forest-green' : ''}`}>
```

### Layout
- Content centered vertically, max-width 480px
- Heading: `np-text-display-medium` (64px bold), uppercase, `letter-spacing: 0.02em`
- Single primary large "Done" button

### Theme Tokens (forest-green)
| Token | Value |
|-------|-------|
| `--color-content-primary` | `#9fe870` |
| `--color-background-screen` | `#163300` |
| `--color-interactive-accent` | `#9fe870` |

---

## Shimmer System (Skeleton Loaders)

### Description
Skeleton loading placeholders mirroring real component layouts. Uses `.shimmer-el` base class with translating gradient animation.

### Files
- `src/components/Shimmer.tsx` — Primitives + DS composites (ShimmerCircle, ShimmerBar, ShimmerRect, ShimmerListItem, etc.)
- `src/components/ComponentName.shimmer.tsx` — Co-located shimmer composites per component (e.g. `MultiCurrencyAccountCard.shimmer.tsx`)
- `src/context/Shimmer.tsx` — `ShimmerProvider` + `useShimmer()` hook

### Primitives (in `Shimmer.tsx`)

| Component | Props | Description |
|-----------|-------|-------------|
| `ShimmerCircle` | `size?: number` (48) | Round placeholder |
| `ShimmerBar` | `width?, height?` (120, 12) | Rounded bar |
| `ShimmerRect` | `width?, height?, borderRadius?` | Rectangle |

### Component Composites (co-located `.shimmer.tsx` files)

| Component | File | Mirrors |
|-----------|------|---------|
| `ShimmerAccountCard` | `MultiCurrencyAccountCard.shimmer.tsx` | `MultiCurrencyAccountCard` |
| `ShimmerAccountPageHeader` | `AccountPageHeader.shimmer.tsx` | `AccountPageHeader` |
| `ShimmerTransferCalculator` | `TransferCalculator.shimmer.tsx` | `TransferCalculator` |
| `ShimmerTransactionList` | `pages/Transactions.shimmer.tsx` | Transaction list section |
| `ShimmerTaskCard` | `TasksStack.shimmer.tsx` | `TaskCard` |

### Usage
```tsx
import { ShimmerAccountPageHeader } from './AccountPageHeader.shimmer';

const { shimmerMode } = useShimmer();
if (shimmerMode) return <ShimmerAccountPageHeader />;
```

### CSS Classes
- `.shimmer-el` — Base: neutral bg, `::after` gradient animation (1.6s infinite)
- `.shimmer-account-card` — Matches MCA dimensions (346px, 26px radius)
