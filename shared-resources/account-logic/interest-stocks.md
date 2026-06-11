# Interest / Stocks Feature System

Currency objects in `shared-resources/data/currencies.ts` and `shared-resources/data/business-currencies.ts` have boolean flags that drive UI across multiple components.

## Flags

- **`hasInterest: true`** — currency is **eligible** for Interest. Shows "Earn a [rate]" promo on Account page for Group/Jar/Shared accounts. Alone, shows inactive "Earn a return" button on Currency page.
- **`hasStocks: true`** — currency is **actively invested** in Stocks (stocks are always opted-in, no separate eligibility state). Shows "Stocks • active" badge, MSCI World Index subtitle, and stocks rate card (available balance at 95% | total returns).
- **`assetsOptedIn: true`** — user has **opted into** Interest or Stocks (Wise Assets). Shows "Interest/Stocks • active" badge, rate card, disclaimer, and "Invested in Interest/Stocks" subtitle on Account page.
- **`interestRate?: string`** — displayed rate (e.g. "3.26%"). For stocks, this can be the index rate.
- **`totalReturns?: string`** — e.g. `'+4.80 EUR'`. Used by stocks rate card (cumulative) and interest disclaimer. Stocks returns come from this field (not transactions), since funds are actively invested.

## Three States per Currency

1. **Not eligible** — No flags → Shows inactive "Earn a return" button
2. **Eligible but not opted in** — `hasInterest: true` only → Shows "Earn a 3.26%" promo on Account page, inactive "Earn a return" button on Currency page
3. **Opted in / Active** — `assetsOptedIn: true` (Interest) OR `hasStocks: true` (Stocks) → Shows "Interest/Stocks • active" badge, rate card, "Invested in..." subtitle

**Stocks skip state 2** — If a currency has stocks, it's already active. There's no "eligible for stocks but not opted in" state.

**Interest has all 3 states** — Group/Jar/Shared accounts sit at state 2 (eligible, not opted in). Current Account GBP is at state 3 (opted in).

## Flag Combinations

| Flags | State | Account Page Subtitle | Currency Page | Rate Card |
|-------|-------|----------------------|---------------|-----------|
| `hasInterest: true`<br>`assetsOptedIn: true` | Interest active | "British pound • Invested in Interest" | "Interest • active" (green) | ✅ 3.26% \| Returns |
| `hasStocks: true`<br>`assetsOptedIn: true` | Stocks active | "Euro • Invested in Stocks" | "Stocks • active" (green) | ✅ Available \| Total returns |
| `hasInterest: true` | Interest eligible | "[name] • Earn a 3.26% variable rate" | "Earn a return" (grey) | ❌ No card |
| No flags | Not eligible | "[name]" | "Earn a return" (grey) | ❌ No card |

## Real-World Eligibility

Eligibility requires **BOTH** currency support **AND** account type support:

### Currency Eligibility

**Interest** — Only **GBP, EUR, USD** can earn interest (Wise Assets UK Ltd product)

**Stocks** — **Every currency** can invest in stocks (MSCI World Index)

**USD is special** — Can have EITHER interest OR stocks (user chooses), but not both simultaneously.

| Currency | Interest Available? | Stocks Available? | Notes |
|----------|---------------------|-------------------|-------|
| **GBP** | ✅ | ✅ | Choose one |
| **EUR** | ✅ | ✅ | Choose one |
| **USD** | ✅ | ✅ | Choose one |
| **All others** (CAD, AUD, JPY, etc.) | ❌ | ✅ | Stocks only |

### Account Type Eligibility

**Available on:** Current Account, Jars (Savings/Supplies), Group (Taxes), Joint Account

**NOT available on:** Young Explorer, Shared Spending

| Account Type | Interest/Stocks Available? | Notes |
|--------------|----------------------------|-------|
| **Current Account** | ✅ | Full access |
| **Jars** (Savings/Supplies) | ✅ | Full access |
| **Group** (Taxes) | ✅ | Full access |
| **Joint Account** | ✅ | Full access |
| **Young Explorer** | ❌ | Not available for kids |
| **Shared Spending** | ❌ | Not available |

### Complete Eligibility Check

For a currency to show interest/stocks UI, it must pass **BOTH** checks:

1. ✅ Currency is eligible (GBP/EUR/USD for interest, any currency for stocks)
2. ✅ Account type allows it (NOT Young Explorer, NOT Shared Spending)

**In prototype:** Most accounts show `hasInterest: true` for demo purposes. In production, the promo would only appear when both currency and account type are eligible.

## Rules

- **Interest vs Stocks are mutually exclusive per currency** — a currency has either `hasInterest` or `hasStocks`, not both. For USD, the user must choose one.
- **Stocks implies assetsOptedIn** — If `hasStocks: true`, the UI behaves as if `assetsOptedIn: true` (both trigger the "active" state).
- **The only UI difference between Interest eligible vs Stocks** — Interest-eligible currencies (state 2) show the "Earn a [rate]" promo on the Account page. Stocks never show this promo because they're always active (state 3).
- **Non-interest currencies (CAD, AUD, etc.) can only get Stocks** — No interest eligibility, but stocks available for all.

The Insights page separates them into distinct product rows (Interest, Cash, Stocks) with independent balances and avatar colors (Interest = default, Cash = dark green, Stocks = light green).

## Affected Components

`MultiCurrencyAccountCard`, `CurrencyPage` (sidebar, rate card, list item, disclaimer, options tab), `CurrentAccount` / `AccountPage` (subtitle text), and `Insights` page (product list, total returns).

The **"Set interest or stocks"** prompt in PrototypeSettings provides instructions for enabling these flags on any currency.
