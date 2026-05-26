# Utilities

## Formatting

> Source: `@transferwise/formatting` v2.13.5
> npm: npmjs.com/package/@transferwise/formatting

```tsx
import {
  formatMoney,
  formatNumber,
  formatDate,
  formatRate,
  formatPercentage,
} from '@transferwise/formatting';
```

### formatMoney

```tsx
formatMoney(1234.56, 'GBP', 'en-GB');
// "£1,234.56"
```

| Param | Type | Description |
|-------|------|-------------|
| `amount` | `number` | The monetary value |
| `currency` | `string` | ISO 4217 currency code |
| `locale` | `string` | BCP 47 locale string |

### formatNumber

```tsx
formatNumber(1234567.89, 'en-GB');
// "1,234,567.89"
```

### formatDate

```tsx
formatDate(new Date('2024-03-15'), 'en-GB');
// "15 Mar 2024"
```

### formatRate

```tsx
formatRate(1.1523, 4);
// "1.1523"
```

| Param | Type | Description |
|-------|------|-------------|
| `rate` | `number` | Exchange rate value |
| `decimals` | `number` | Decimal places to show |

### formatPercentage

```tsx
formatPercentage(0.0456, 'en-GB');
// "4.56%"
```

### formatAmount

Formats a number with currency code (without currency symbol).

```tsx
import { formatAmount } from '@transferwise/formatting';

formatAmount(1234.56, 'GBP', 'en-GB');
// "1,234.56 GBP"

formatAmount(1000, 'JPY', 'en-GB', { alwaysShowDecimals: false });
// "1,000 JPY"
```

| Param | Type | Description |
|-------|------|-------------|
| `amount` | `number` | The monetary value |
| `currencyCode` | `string` | ISO 4217 currency code |
| `locale` | `string` | BCP 47 locale string |
| `options` | `{ alwaysShowDecimals: boolean }` | Optional formatting options |

### formatRelativeDate

Formats a date as a relative time string (e.g. "2 hours ago", "yesterday").

```tsx
import { formatRelativeDate } from '@transferwise/formatting';

formatRelativeDate(new Date('2024-03-14T10:00:00'), 'en-GB');
// "yesterday"
```

| Param | Type | Description |
|-------|------|-------------|
| `date` | `Date` | The date to format |
| `locale` | `string` | BCP 47 locale string (optional) |

### formatNumberToSignificantDigits

Rounds and formats a number to a specified number of significant digits.

```tsx
import { formatNumberToSignificantDigits } from '@transferwise/formatting';

formatNumberToSignificantDigits(1234.5678, 'en-GB', 4);
// "1,235"

formatNumberToSignificantDigits(0.001234, 'en-GB', 2);
// "0.0012"
```

| Param | Type | Description |
|-------|------|-------------|
| `number` | `number` | Value to format |
| `locale` | `string` | BCP 47 locale string (optional) |
| `significantDigits` | `number` | Number of significant digits (optional) |

### getDisplayRate

Returns a structured display-ready exchange rate object.

```tsx
import { getDisplayRate } from '@transferwise/formatting';

const rate = getDisplayRate({
  rate: 1.1523,
  sourceCurrency: 'GBP',
  targetCurrency: 'EUR',
  locale: 'en-GB',
});
// rate.decimal   → "1.1523"
// rate.equation  → "1 GBP = 1.1523 EUR"
// rate.inverted  → false
```

| Param | Type | Description |
|-------|------|-------------|
| `rate` | `number` | Exchange rate value |
| `sourceCurrency` | `string` | Source ISO 4217 code |
| `targetCurrency` | `string` | Target ISO 4217 code |
| `locale` | `string` | BCP 47 locale string |

Returns `{ decimal: string, equation: string, inverted: boolean }`.

---

## Validation

> Source: `@transferwise/neptune-validation` v3.3.3
> npm: npmjs.com/package/@transferwise/neptune-validation

```tsx
import { isRequired, isEmail, isPhoneNumber, isValidDate } from '@transferwise/neptune-validation';
```

### Rule Validators

| Validator | Description |
|-----------|-------------|
| `isRequired(value)` | Checks value is not empty |
| `isEmail(value)` | Validates email format |
| `isPhoneNumber(value)` | Validates phone number format |
| `isValidDate(value)` | Validates date string/object |
| `isMinLength(value, min)` | Minimum string length |
| `isMaxLength(value, max)` | Maximum string length |
| `isPattern(value, regex)` | Matches regex pattern |

### Type Validators

| Validator | Description |
|-----------|-------------|
| `isNumber(value)` | Checks value is numeric |
| `isString(value)` | Checks value is a string |
| `isBoolean(value)` | Checks value is boolean |

### Usage with Forms

```tsx
const errors = {};

if (!isRequired(formData.email)) {
  errors.email = 'Email is required';
} else if (!isEmail(formData.email)) {
  errors.email = 'Enter a valid email address';
}
```
