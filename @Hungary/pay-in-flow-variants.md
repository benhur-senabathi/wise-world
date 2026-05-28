# Hungary Pay-In Flow — Two Variants

## Context

Hungarian customers add money to their Wise account via **Qvik (request-to-pay)** — a local payment rail where Wise sends a payment request to the customer's Hungarian bank account. Unlike card top-ups or standard bank transfers, this requires the customer to provide their Hungarian bank account number (24 digits, formatted as `12345678-12345678-12345678`) so Wise knows where to send the request.

This creates a UX challenge: how do we collect bank details without adding friction that causes drop-off, especially for returning customers?

---

## What was built

**File:** `base-surfaces-mobile/mobile/src/flows/AddMoneyFlow.tsx`
**Branch:** `hungary-qvik-UX`

Two variants of the pay-in flow, switchable via a dev bar (triple-tap to access):

---

### Variant 1 — "Save once, skip next time"

**Behaviour:**
1. First time: customer enters amount → sees "Request details" screen → enters account number → completes
2. Second time onwards: customer enters amount → skips straight to success (account already saved)

**Key UX decisions:**
- Account number is saved after first successful pay-in
- Returning customers see a summary with masked account ending (`****1234`) on the amount screen
- The "Request details" step is completely bypassed on repeat usage
- Warning InfoPrompt about "only pay from an account in your name" shown on the details screen

**Hypothesis:** Removing an entire step for returning customers reduces friction and increases repeat usage. The trade-off is less visibility — customers can't easily change their linked account without resetting.

---

### Variant 2 — "Always show details, pre-filled"

**Behaviour:**
1. First time: customer enters amount → sees "Request details" screen → enters account number → completes
2. Second time onwards: customer enters amount → sees "Request details" screen with account pre-filled → confirms → completes

**Key UX decisions:**
- Account number is pre-filled but always shown
- InlinePrompt with positive sentiment ("Last used details") confirms the pre-filled number matches what was saved
- Customer can still edit the account number if needed
- Warning InfoPrompt shown on every visit (compliance requirement)

**Hypothesis:** Showing the details screen every time gives customers confidence and control — they can verify or change their account. The extra tap is minimal friction since the field is pre-filled.

---

## Shared UX patterns (both variants)

| Pattern | Implementation | Design system component |
|---------|---------------|------------------------|
| Account number auto-formatting | Dashes inserted after every 8 digits as user types | Custom `formatHungarianAccount()` helper |
| Numeric keyboard | `inputMode="numeric"` on the account input | Native HTML attribute |
| Validation gate | Continue button disabled until exactly 24 digits entered | Button `disabled` prop |
| Compliance warning | Yellow InfoPrompt below form fields | `InfoPrompt` with `sentiment="warning"` |
| Saved account confirmation | Green InlinePrompt below input | `InlinePrompt` with `sentiment="positive"` |
| Amount summary | ListItem-based breakdown showing fees, arrival time | `ListItem` component |

---

## Spacing (per Figma spec)

| Area | Token | Value |
|------|-------|-------|
| Title → description | `--vertical/between-text` | 8px |
| Header section bottom | margin | 16px |
| Tabs → Divider | margin | 16px |
| Divider → Form fields | `padding-top` on body | 24px |
| Between form fields | `--product/space/vertical/component-default` | 16px |
| Form → InfoPrompt | `--vertical/between-sections` (adjusted) | 24px |
| Footer button horizontal padding | `--size/24` | 24px |

---

## Research pointers and PM insights

### Why Qvik / request-to-pay?

- Hungary's instant payment infrastructure supports request-to-pay natively
- Significantly lower cost vs card top-ups (interchange fees avoided)
- Faster settlement than SEPA/international wire
- Growing adoption among Hungarian banks — most major banks now support it

### Key friction points identified

1. **Account number entry** — Hungarian account numbers are 24 digits (3 groups of 8). Without formatting, this is error-prone and intimidating. Auto-formatting with dashes was added to reduce cognitive load.
2. **"Why do you need my bank account?"** — Customers unfamiliar with request-to-pay don't understand why Wise needs their account. The description text and warning prompt explain the mechanism.
3. **Repeat usage drop-off** — Hypothesis: if customers have to re-enter details every time, they'll switch to card (higher cost for Wise). Both variants address this differently.
4. **Compliance constraint** — Regulatory requirement to warn customers to only pay from accounts in their own name. This warning must appear whenever account details are shown (both variants show it).

### Open questions for testing

- Does skipping the details screen entirely (V1) cause confusion when customers check their bank app and see an unexpected payment request?
- Does showing the screen every time (V2) feel repetitive after 3+ uses?
- Should we show a confirmation bottom sheet summarising the request before sending (currently not implemented)?
- What's the right moment to offer account switching for customers with multiple Hungarian bank accounts?

### Success metrics to watch

- **Pay-in completion rate** — % of customers who start the flow and complete it
- **Repeat usage rate** — % of customers who use Qvik again within 30 days
- **Time to complete** — seconds from "Add money" tap to success screen
- **Support tickets** — "unexpected payment request" or "wrong account" complaints

---

## Technical notes for future agents

- The flow is gated to Hungary only (`defaultCurrency === 'HUF'`)
- Account persistence uses module-level variables (`savedQvikAccount`) — survives within session, resets on page reload
- Variant switching is via a hidden dev bar (triple-tap top-right area of amount screen)
- The `activeVariant` variable persists the selection across flow open/close cycles
- Figma source: `https://www.figma.com/design/PlBgFDqbYtV1DOHSXAeoxM/Hungary` — node `76:4946` for the request details screen
