# Account Types

Shared reference for all Wise prototypes (web + iOS). Defines the account type hierarchy, what features each type supports, and the UI differences between them.

## Overview

The Wise app has a launchpad (Home) showing "All accounts" with a total balance. Below that, accounts appear in a horizontal carousel. Each account is one of these types:

| Account Type | Consumer | Business | Status |
|-------------|----------|----------|--------|
| Current Account | Yes | Yes | Build now |
| Jar | Yes | Yes | Build now |
| Group | No | Yes | Build now |
| Shared Spending | Yes | No | Build now |
| Joint Account | Yes | No | Build now |
| Young Explorer | Yes | No | Build now |

- **Group** (business) and **Shared Spending** (consumer) are the same concept with different branding
- The existing "Taxes" account in the prototype is a Group (business) account

## Hard Rules

1. **Icon + color consistency.** An account's icon and color on the Home card MUST be carried through to every subpage (account page avatar, currency page avatar, breadcrumb) AND into all flow currency selectors. Never substitute a different icon (e.g. Wise logo or Money icon) for the account's actual icon. Use `AccountStyle` to thread styling into flows — see below.
2. **Empty transactions state.** When an account or currency has zero transactions, show "Nothing to show here yet / Your transactions will show here." — same component everywhere. Never show search/filter/download controls on an empty list.
3. **Account details only on Current Account.** Hide the "Account details" button on all non-Current Account pages (Jar, Group/Shared Spending). Check both the account page header AND the currency page header.
4. **Request only on Current Account.** The Request/Get Paid button only appears on Current Account contexts. Use `hideGetPaid={true}` for Jars, Groups, and Shared Spending.

## AccountStyle (Flow Avatar Styling)

All money flows (Add Money, Convert, Send) use an `AccountStyle` prop to render the correct icon and color in currency selectors. This is the mechanism that enforces Rule 1 inside flows.

```ts
type AccountStyle = { color: string; textColor: string; iconName: string };
```

**Style constants** (defined in each App.tsx `AppInner`):

| Account | `color` | `textColor` | `iconName` |
|---------|---------|-------------|------------|
| Current Account (Personal) | `var(--color-interactive-accent)` | `var(--color-interactive-control)` | `Wise` |
| Current Account (Business) | `#163300` | `#9fe870` | `Wise` |
| Group (Taxes) | `#FFEB69` | `#3a341c` | `Money` |
| Jar | jar's own `color` field | `#121511` | jar's own `iconName` field |

**Threading:** `App.tsx` computes the style → stores it in `ActiveFlow` → passes it as a prop to the flow component. Flows call `resolveIcon(iconName)` to render the icon. ConvertFlow also accepts `toAccountStyle` for cross-account conversions (e.g. jar → current account).

**When adding a new account type:** Define its `AccountStyle` constant in `AppInner`, then pass it through all handler call sites that open flows from that account's pages.

## Feature Matrix

| Feature | Current Account | Jar | Group (biz) | Shared Spending (consumer) | Joint (consumer) | Young Explorer (consumer) |
|---------|----------------|-----|-------------|---------------------------|-----------------|--------------------------|
| Currencies | Yes | Yes | Yes | Yes | Yes | Single only |
| Cash / Stocks / Interest per currency | Yes | Yes | Yes | Yes | Yes | No |
| Account details (IBAN, routing number) | Yes | No | No | No | Yes | No |
| Cards | Yes | No | Yes | Yes | Yes | Yes |
| Card design | Light green physical (personal) or dark green physical (business) + tapestry digitals | None | Tapestry | Tapestry | Bright pink physical + tapestry digitals | Tapestry |
| Transactions | Yes | Yes | Yes | Yes | Yes | Yes |
| Participants | No | Biz only | Yes | Yes | Yes | Yes (parent + child) |
| Request / Get Paid | Yes | No | No | No | No | No |
| Send | Yes | Yes | Yes | Yes | Yes | No |
| Home card style | Wallet cutout | Solid color | Wallet cutout | Wallet cutout | Wallet cutout | Wallet cutout |
| More menu | Account details, Manage cards | Edit jar, Statements, Close jar | Edit group, Statements, Close group | Edit shared spending, Statements, Close shared spending | Account details, Manage cards | Edit account, Statements, Close account |

**Jar participants:** Jars can have participants on business accounts only, not personal.

## Account Type Details

### Current Account

The main account. One per profile (consumer or business). This is the primary account that holds bank details and connected cards.

**Has:**
- Multiple currencies (each can be Cash, Stocks, or Interest — mutually exclusive per currency)
- Account details per currency (IBAN, routing numbers, bank address)
- Connected cards (physical and digital)
- Full transaction history
- All action buttons: Send, Add money, Request

**Home card:** Full MCA card with **wallet cutout** arch shape, stacked card images (physical/digital), total balance, multi-currency balance grid, "Account details" footer button. The cutout represents a wallet — it exists because the account has cards.

**Account page:** Currencies tab, Transactions tab, Options tab. Shows account details, cards section.

**Currency page:** Full action buttons (Add, Convert, Send, Request). More menu includes account details for that currency.

**Data:** `shared-resources/data/currencies.ts`, `shared-resources/data/transactions.tsx`

### Jar

A lightweight savings/purpose container. No bank details, no cards. Money moves in and out via the Current Account.

**Has:**
- Multiple currencies (each can be Cash, Stocks, or Interest)
- Transaction history
- Custom name and icon (user-editable)
- Custom color derived from the jar's icon

**Does NOT have:**
- Account details (no IBAN, no routing numbers)
- Cards
- Request action button

**Home card:** Simpler card with **solid color background** matching the jar's icon color (e.g. yellow for Savings, orange for Bills). Shows "Jar" label, custom icon, jar name, single currency + balance. **No wallet cutout** — no card stack, no "Account details" footer. The visual rule: if an account has cards, it gets the wallet cutout; if not, it gets the solid color fill.

**Account page:**
- Header: Jar icon + jar color avatar, jar name. Icon and color MUST match the Home card exactly.
- Action buttons: Add, Convert or move, Send (NO Request — use `hideGetPaid`)
- Desktop: 2-column layout (same sizing as other account pages). Left = Currencies + Transactions. Right = feedback footer only.
- Currencies section with "Add a currency"
- Transactions section (when empty, show "Nothing to show here yet" — same empty state as CurrencyPage)
- More menu: "Edit jar", "Statements and reports", "Close jar"
- NO cards section, NO account details, NO Options tab on mobile
- Interest/Stocks should show as "inactive" (not active) — jar currencies don't inherit the main account's interest status

**Currency page:**
- Breadcrumb: JarIcon + Flag > "JarName > CurrencyCode" (shows parent jar context). Avatar uses jar color + jar icon, NOT the Wise logo.
- Action buttons: Add, Convert or move, Send (NO Request — use `hideGetPaid`)
- More menu: "Statements and reports", "Remove currency"
- Sidebar: "Earn a return" promo (always inactive for jars), "Auto conversions"
- NO account details button (hide when `onAccountDetailsClick` is undefined)

**Data:** `shared-resources/data/jar-data.tsx` (`JarDefinition` type), individual jar exports (`savingsJar`, `suppliesJar`)

**Jar colors** use Neptune expressive brand tokens (e.g. `#FFEB69` yellow, `#C3FFE8` green)

### Group (Business) / Shared Spending (Consumer)

An organizational account that multiple people can access. Business calls it "Group", Consumer calls it "Shared Spending". Like a Current Account but with participants and without account details.

**Has:**
- Multiple currencies (each can be Cash, Stocks, or Interest)
- Connected cards
- Transaction history
- Participants (team members on business, shared members on consumer)

**Does NOT have:**
- Account details (no IBAN, no routing numbers — uses Current Account's details)
- Request / Get Paid button

**Home card:** Should use the **wallet cutout** style (like Current Account) because it has cards connected. Not the solid color jar style.

**Key difference from Current Account:** Adds participants, removes account details and Request.
**Key difference from Jar:** Adds cards and participants, has different management options.

**Data:** The existing "Taxes" account lives in `shared-resources/data/group-data.tsx` (exports: `groupCurrencies`, `groupTotalBalance`, `groupTransactions`). Code uses `isGroup` / `onNavigateGroupAccount` — "Taxes" is just the display name, not an account type.

## Home Card Subtitle Rule

All account cards (MCA and Jar) follow the same subtitle logic:
- **1 currency** — show only the account name, NO subtitle
- **2+ currencies** — show the account name + total amount subtitle (MCA also shows "· N currencies")

This applies to both `MultiCurrencyAccountCard` and `JarCard`.

## Home Card Visual Rule

The Home carousel card style is driven by account type:

- **Current Account, Group/Shared Spending** — Always uses the **wallet cutout** arch shape. If cards are connected, shows card stack imagery. If no cards yet, shows empty grey background with cutout (like the "Do more with your money" empty card style).
- **Jar** — **Solid color fill** from the jar's icon color. No cutout, no card stack. Uses the `JarCard` component, not `MultiCurrencyAccountCard`.

The cutout represents a wallet — it exists because the account TYPE supports cards, regardless of whether cards are currently connected. **Code rule:** The cutout SVG in `MultiCurrencyAccountCard` must NOT be gated behind `hasCards` — it always renders.

### Stacked Balances

When currency amounts are too wide for the 2-column grid (>85px rendered width), the balance grid switches to single-column "stacked" mode. In stacked mode, only a limited number of currencies are shown:
- **Main prototype:** max 3 currencies shown (`balances.slice(0, 3)`)
- **Component library:** max 2 currencies shown (`balances.slice(0, 2)`) due to fixed card height

### Footer Anchoring

The "Account details" footer button should anchor to the bottom of the card. In flexible-height contexts this happens naturally. In fixed-height contexts (component library at 346x318px), use:
- `.mca-front { display: flex; flex-direction: column; flex: 1; }`
- `.mca-footer { margin-top: auto; }`

### Jar Card Alignment (Web)

The `JarCard` header must align pixel-perfectly with the `MultiCurrencyAccountCard` stack area:

- **Header height:** Use only `padding-bottom: 24%` (same as `.mca-cards__stack`). NO top padding — label/icon are absolutely positioned inside a `.jar-card__header-content` wrapper.
- **Content overlap:** `.jar-card__front` uses `margin-top: -15px` (matching MCA's 15px cutout overlap) and `padding-top: 15px` to push the heading back down. This ensures: (a) the color-to-grey transition aligns, (b) the heading text aligns.
- **No rounded corners** on `.jar-card__front` top edge — the transition is a straight line, not an arch.

## Action Button Logic

| Context | Current Account | Jar | Group / Shared Spending | Joint | Young Explorer |
|---------|----------------|-----|------------------------|-------|---------------|
| Home page buttons | Send, Add money, Request | — | Send, Add money | Send, Add money | Add money |
| Account page | Send, Add money, Request | Add, Convert or move, Send | Add, Convert or move, Send | Add, Convert or move, Send | Add, Convert |
| Currency page | Add, Convert, Send, Request | Add, Convert or move, Send | Add, Convert or move, Send | Add, Convert or move, Send | Add, Convert |

- **Request** is only available on Current Account contexts.
- **Send** is not available on Young Explorer — child can only add and convert.

## More Menu Logic

| Context | Current Account | Jar Account | Jar Currency |
|---------|----------------|-------------|-------------|
| Account page | Account details, Manage cards, ... | Edit jar, Statements and reports, Close jar | — |
| Currency page | Statements and reports, Account details, ... | — | Statements and reports, Remove currency |

## Navigation / Breadcrumb

- **Current Account currency:** Flag + "CurrencyCode" (e.g. "GBP")
- **Jar currency:** JarIcon + Flag > "JarName > CurrencyCode" (e.g. "Savings > GBP")
- **Group/Shared Spending currency:** TBD (likely similar to jar breadcrumb pattern)

## Account Type Notes

- **Young Explorer** is also referred to as child/kids/u18 account. Single currency, no interest/stocks, no send — parent manages the account.
  - Default icon: `Backpack`
  - Default colour set: "Orange" — `bright-orange` (`#FFC091`) background, `dark-purple` (`#260A2F`) text
