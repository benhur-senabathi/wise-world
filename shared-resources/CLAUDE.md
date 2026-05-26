# Shared Resources

Shared data and business rules consumed by both prototype projects (web and mobile).

## Rules

1. **This is the single source of truth.** Edit data here — not in individual project `src/data/` directories. Web re-exports from here; mobile imports directly via `@shared` Vite alias.
2. **No project-specific imports.** Shared data files must not import from any project's `src/` directory (e.g. no `../translations/en`). Use `string` for translation keys — projects narrow the types locally.
3. **npm dependencies resolve via symlink.** `node_modules` symlinks to `base-surfaces-web/web/node_modules`. After running `npm install` in any project, shared-resources can resolve `@transferwise/icons`, `react`, etc.

## Structure

```
shared-resources/
├── data/                    # TypeScript data files
│   ├── currencies.ts        # Personal account currencies, balances, CurrencyData type
│   ├── business-currencies.ts
│   ├── balances.ts          # computeTotalBalance(), formatBalance() — single source of truth
│   ├── transactions.tsx     # Transaction history, utilities
│   ├── business-transactions.tsx
│   ├── recipients.tsx       # Contacts and recipients
│   ├── currency-rates.ts    # Exchange rates and currency metadata
│   ├── group-data.tsx        # Group account (exports: groupCurrencies, groupTotalBalance, groupTransactions)
│   ├── jar-data.tsx         # Savings/supplies jars, GROUP_IDS
│   └── account-details-data.ts  # Bank details per currency
├── account-logic/           # Platform-agnostic business rules
│   ├── account-types.md     # Account hierarchy, feature matrix
│   ├── interest-stocks.md   # Interest/stocks flag system
│   ├── balances-and-accounts.md  # Adding/editing accounts checklist
│   └── routing.md           # Full URL reference, ID system
├── design-system/           # Cross-platform Neptune reference docs
│   ├── icons.md, flags-and-art.md, components.md, tokens.md, neptune-css.md
│   └── figma-references.md, illustration-3d.md, utilities.md, setup.md
├── content/                 # Writing & content guidelines (Wise tone, grammar, vocabulary)
│   ├── writing-guidelines.md    # Master guide — start here for all content work
│   ├── tone-of-voice.md         # Brand principles, context-specific tone, localization
│   ├── grammar-and-style.md     # A-Z grammar rules and style reference
│   ├── vocabulary.md            # Product terminology, words to use/avoid
│   └── components/              # Component-specific writing rules
│       ├── buttons.md
│       ├── critical-banners.md
│       ├── info-prompts.md
│       ├── list-items.md
│       ├── modals.md
│       ├── snackbars.md
│       └── text-inputs.md
└── node_modules → ../base-surfaces-web/web/node_modules (symlink)
```

## Balance rules

- **Total balance = current account + group account + jar.** Use `computeTotalBalance()` from `data/balances.ts` — never hand-roll the sum. This includes all accounts for the given account type.
- **No `formattedBalance` field.** Use `formatBalance(currency, 'symbol')` for `£948.70` or `formatBalance(currency)` for `948.70 GBP`. Display formatting derives from the `balance` number — never hardcode formatted strings.
- **All totals must be computed.** `groupTotalBalance` and `totalAccountBalance` use `.reduce()`. Never hardcode a balance total.
- **Balances are auto-computed from transactions.** Every currency's `balance` field uses `computeCurrencyBalance(code, txList)` from `transactions.tsx`. Never hardcode a balance number — change transactions and the balance updates automatically. The first transaction for each currency should be an "Add" (consumer) or "Receive" (business) that establishes the starting balance. If a balance goes negative after editing transactions, adjust the first transaction's amount.
- **"Taxes" is a group name, not an account type.** Code uses `groupCurrencies` / `isGroup` / `onNavigateGroupAccount`. Translation keys keep `'home.taxes'` etc. for the display name.

## Adding or editing accounts

For the full guide on what updates when balances change, and the step-by-step checklist for adding a new jar, group, or currency, read `account-logic/balances-and-accounts.md`.

## What stays per-project

- `nav.tsx` — navigation structure differs per platform
- Platform-specific design system docs — custom tokens, custom components, CSS overrides
- Translations — each project has its own i18n strings
