---
name: add-dataset
description: Add a real customer dataset to the Base Surfaces prototypes from a Wise CSV export
argument-hint: [person's first name, e.g. "sarah"]
---

Add a real customer's Wise account data to both the web and mobile prototypes. This creates all shared data files, wires hooks on both platforms, registers routes, and ensures every surface (Home, Cards, Account pages) renders correctly.

## Before You Start — Gather Information

**Ask the user for ALL of the following before writing any code:**

1. **CSV data** — "Please share the CSV export for this person. If you need a fresh pull, your analyst can run the Snowflake query (see `shared-resources/data/USER-DATASETS.md` § How to Get Fresh Data) with their user_id."
2. **Person's name** — "What display name should this person have in the prototype?" (e.g. "Sarah Chen")
3. **Business name** — "What's the business name?" (if they have a business account — usually visible in the CSV `business_name` column)
4. **Profile picture** — "Do you have a profile picture/avatar for this person? Please share the file or a URL." Save it as `base-surfaces-mobile/mobile/public/avatar-{firstname}.png` and `base-surfaces-web/web/public/avatar-{firstname}.png`.
5. **Group/Joint cards** — The CSV gives us card count and type per profile (physical+digital, digital only, or neither), but NOT whether group/team or joint/shared accounts have their own cards. Ask: "Do any of the group or joint accounts have their own cards? If so, how many and what type?" (If the user isn't sure, default to: joint gets 1 digital card, groups get 0.)
6. **Dataset slug** — Confirm the slug will be `{firstname}` (lowercase, e.g. `sarah`). The DatasetType value is just the slug (e.g. `'sarah'`), not `sarah-personal`/`sarah-business` — personal/business is determined by the accountType toggle.

**Do NOT proceed until you have the CSV, name, and card info.** The profile picture can come later but flag it as needed.

---

## Reference Docs

Read these before implementing:
- `shared-resources/data/USER-DATASETS.md` — Full CSV field reference, Snowflake query, parsing rules, issues encountered
- `SHIP-DATASET-SWITCHING.md` — Architecture overview of the dataset system

---

## CSV Fields Reference

The CSV has one row per currency per balance group. Key columns:

| Field | Purpose | Example |
|-------|---------|---------|
| `user_id` | Groups profiles for the same human | `662338` |
| `profile_id` | Identifies a single profile (personal or business) | `453923` |
| `profile_type` | `personal` or `business` | `personal` |
| `business_name` | Business name or "Personal profile" | `Berry Design` |
| `amount_value` | Current balance in the currency | `3009.34` |
| `balance_id` | Unique ID per currency balance (used for URL routing) | `177.0` (strip `.0`) |
| `currency` | ISO code | `GBP` |
| `group_id` | Account group ID (becomes jar/group ID) | `52546803.0` (strip `.0`) |
| `product_name` | `MAIN`, `SAVINGS`, `SHARED`, `TEAM` | `MAIN` |
| `group_name` | Display name for jars/groups (empty for MAIN) | `Fantasy Football` |
| `has_assets` | Whether interest/stocks is enabled | `True` / `False` |
| `has_ads` | Whether account details exist (IBAN, sort code) | `True` / `False` |
| `cards` | Number of active cards on this profile | `2` |
| `card_type` | `digital only`, `digital and physical`, or `neither` | `digital and physical` |

**Parsing notes:**
- `balance_id` and `group_id` come as floats (e.g. `177.0`) — strip the `.0`
- Multiple rows with the same `group_id` = multiple currencies in one account
- `cards` and `card_type` are per-profile (same value on every row)

---

## Filtering Rules

1. **Show a MAIN currency if:** `has_ads=True` OR `amount > 0`
2. **Show a jar/group currency if:** it exists in the CSV (even 0 balance — empty jars are valid)
3. **Account details:** only add `accountDetails` field if `has_ads=True`
4. **Interest/stocks:** only add `hasInterest: true` if `has_assets=True`
5. **Jars never have account details** — even if `has_ads=True` on a SAVINGS row

---

## File Structure

All data files go in `shared-resources/data/`. Use this exact naming:

### Required files:

| File | Exports |
|------|---------|
| `{name}-personal-currencies.ts` | `{name}PersonalCurrencies: CurrencyData[]` |
| `{name}-personal-transactions.tsx` | `build{Name}PersonalTransactions(consumer, business, labels): Transaction[]` |
| `{name}-business-currencies.ts` | `{name}BusinessCurrencies: CurrencyData[]` |
| `{name}-business-transactions.tsx` | `build{Name}BusinessTransactions(consumer, labels): Transaction[]` |

### Optional files (if account has jars/joint/group):

| File | When | Exports |
|------|------|---------|
| `{name}-personal-jars.tsx` | Personal has SAVINGS accounts | `{name}PersonalJars: JarDefinition[]` |
| `{name}-business-jars.tsx` | Business has SAVINGS accounts | `{name}BusinessJars: JarDefinition[]` |

---

## Transaction Rules

**The CSV only gives final balances — NOT real transaction history.** Invent realistic transactions that net to EXACTLY the CSV balance for each currency.

`computeCurrencyBalance(code, transactions)` sums positives minus negatives. Your invented transactions must satisfy:
`sum(positive amounts) - sum(negative amounts) = CSV balance`

Guidelines:
- Start with a large deposit (salary, transfer received, payout)
- Add 3-6 realistic debits spread across recent dates
- Use `logoUrl('domain.com')` for merchant logos
- Dates should be recent (Today, Yesterday, specific dates in last 2 weeks)
- Verify your math: positive minus negative MUST equal CSV `amount_value`

---

## Card Rules

### Physical vs Digital
- **Personal physical:** `/wise-card-physical.png` — LIGHT GREEN
- **Business physical:** `/wise-card-biz-physical.png` — DARK GREEN
- **Digital cards:** tapestry background images

### Physical card MUST always be first in array

### Available digital tapestries:
Personal: `/wise-card-personal-digital-turquoise.png`, `/wise-card-personal-digital-green.png`
Business: `/wise-card-biz-digital-aqua.png`, `/wise-card-biz-digital-orange.png`, `/wise-card-biz-digital-yellow.png`

---

## Jar Colour Rules

Only these 5 brand colours are allowed:

| Colour | Hex |
|--------|-----|
| bright-green | `#9FE870` |
| bright-yellow | `#FFEB69` |
| bright-blue | `#A0E1E1` |
| bright-pink | `#FFD7EF` |
| bright-orange | `#FFC091` |

---

## Account Detail Formats

Generate unique, realistic numbers. Never reuse across datasets.

| Currency | Format | Example |
|----------|--------|---------|
| GBP | `'XX-XX-XX · XXXXXXXX'` | `'23-14-70 · 62048193'` |
| EUR | IBAN | `'BE68 5390 0754 7034'` |
| USD | `'XXXXXXXXX · XXXXXXXXX'` | `'021000021 · 729401835'` |
| SGD | `'XXXX · XXX-XXX-XXX'` | `'7171 · 683-421-095'` |
| AUD | `'BSB XXX-XXX · XXXXXXXX'` | `'BSB 062-000 · 12345678'` |

---

## Wiring Checklist (BOTH platforms)

After creating data files, update these files on **both** web and mobile:

### 1. `shared-resources/data/jar-data.tsx`

- Add all jar/group IDs to `GROUP_IDS`
- Import jar exports and add to `allUserJars` array

### 2. `{platform}/src/hooks/useDatasetData.ts` (BOTH web and mobile)

Both files are identical in structure. Add:
- Imports for the new data files
- `registerJarResolver` call for the new jars
- Case in `useActiveCurrencies()` returning the correct currencies
- Case in `useActiveTransactions()` calling the transaction builder
- Case in `useActiveJars()` returning jar array (or `[]`)
- Update `useHasTaxes()` if business has a TEAM account
- Update `useCardCount()` with correct card counts
- Update `isUserDataset()` to include new dataset slug

### 3. `{platform}/src/context/Dataset.tsx` (BOTH)

- Add to `DatasetType` union
- Add to `VALID_DATASETS` array

### 4. `{platform}/src/App.tsx` (BOTH)

- Register ALL balance IDs in `balanceOwnerMap`
- Import currency/jar files needed for the map

### 5. `shared-resources/data/balances.ts`

- Add dataset case in `computeTotalBalance()`

### 6. Avatar files

- Copy to `base-surfaces-mobile/mobile/public/avatar-{name}.png`
- Copy to `base-surfaces-web/web/public/avatar-{name}.png`

### 7. Translations (BOTH `src/translations/en.ts` and `es.ts`)

- Add translation keys for any new jar names

---

## Verification Checklist

1. `cd base-surfaces-web/web && npm run build` — no errors
2. `cd base-surfaces-mobile/mobile && npm run build` — no errors
3. Select the new dataset in prototype settings dropdown
4. **Home page:** Total balance correct, MCA card count/imagery correct, jars render
5. **Cards tab:** All cards appear, physical first, distinct tapestry per digital
6. **CurrentAccount page:** Card stack matches, account details button correct
7. **Jar pages:** No account details button, correct balance
8. **Account switching:** personal <-> business works correctly
9. Navigate into currencies and back — no broken routes

---

## Common Mistakes to Avoid

1. Non-brand hex colours for jars — only the 5 listed above
2. Business card images on personal accounts (or vice versa for physical)
3. Duplicate tapestry images on same account
4. Physical cards not first in array
5. Account details on jars — jars never show this
6. Hardcoding balances instead of `computeCurrencyBalance()`
7. Missing hook cases — check EVERY function in `useDatasetData.ts`
8. Forgetting `balanceOwnerMap` entries — breaks navigation
9. Only updating one platform — BOTH web and mobile must be wired
