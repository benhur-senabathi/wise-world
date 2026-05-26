# Interest / Stocks Feature System

Currency objects in `shared-resources/data/currencies.ts` and `shared-resources/data/business-currencies.ts` have boolean flags that drive UI across multiple components.

## Flags

- **`hasInterest: true`** — shows "Interest - active" badge with variable rate card (rate % on left, returns this month on right), interest disclaimer, and "Invested in Interest" row on CurrentAccount.
- **`hasStocks: true`** — shows "Stocks - active" badge with "MSCI World Index" subtitle, stocks-specific rate card (available balance at 95% on left, total returns on right — both sides clickable/hoverable), stocks disclaimer, and diagonal "Invested" avatar on MultiCurrencyAccountCard. Stocks returns come from the `totalReturns` field on the currency (not from transactions, since funds are actively invested).
- **`interestRate?: string`** — displayed rate on the interest rate card (defaults to "3.26%" if not set).
- **`totalReturns?: string`** — e.g. `'+4.80 EUR'`. Used by stocks rate card and Insights total returns.

## Rules

**Interest vs Stocks are mutually exclusive per currency** — a currency has either `hasInterest` or `hasStocks`, not both.

The Insights page separates them into distinct product rows (Interest, Cash, Stocks) with independent balances and avatar colors (Interest = default, Cash = dark green, Stocks = light green).

## Affected Components

`MultiCurrencyAccountCard`, `CurrencyPage` (sidebar, rate card, list item, disclaimer, options tab), `CurrentAccount` (subtitle text), and `Insights` page (product list, total returns).

The **"Set interest or stocks"** prompt in PrototypeSettings provides instructions for enabling these flags on any currency.
