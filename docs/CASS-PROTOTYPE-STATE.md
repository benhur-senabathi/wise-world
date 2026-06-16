# CASS Prototype — Current State (for future agents)

> **Read this first if you're iterating on the CASS prototype.** It documents *what exists today*,
> *how it's wired*, and *what it was built from*. Last verified against the code on **2026-06-11**.
>
> **Three docs, three jobs:**
> - `CASS-INBOUND-PROTOTYPE-SPEC.md` — the *original build spec* (what was commissioned). The
>   prototype has since **diverged** from it (see §6). Treat the spec as historical intent, not
>   current truth.
> - **This doc** — the *current state* (what's actually in the code now). Source of truth for the
>   build as it stands.
> - `CASS-SWITCH-BEHAVIOURAL-RECOMMENDATIONS.md` — a *behavioural-design backlog* (proposed, mostly
>   not yet built). See §7 for which items have landed.
>
> Product background (the "why") lives in the root `wise-world/CLAUDE.md`. Prototype engineering
> conventions live in `base-surfaces-mobile/CLAUDE.md` and `base-surfaces-mobile/mobile/src/flows/structure.md`.

---

## 1. What this is

A clickable, **happy-path** prototype of the **CASS inbound full switch** — a customer switching
their UK current account *to* Wise — inside the `base-surfaces-mobile` React/TypeScript/Vite app.
Everything is **simulated**: no validation, no API calls, no error/cancellation branches. CoP, card
checks, modulus/EISCD all "succeed". English only (`en.ts`). Personal account only.

**Run it:**
```bash
cd base-surfaces-mobile/mobile
npm install
npm run dev          # http://localhost:3017
```
Open Home (default `power` dataset) → the switch is reachable from two Home entry points (§4).

> ⚠️ **Build caveat:** `npm run build` (full `tsc`) currently fails on a *pre-existing, unrelated*
> shared-resources import error. The prototype is **dev-server-only**. CASS files themselves
> transpile clean via esbuild/Vite. Don't chase the build error when changing CASS.

---

## 2. File map (everything CASS lives here)

| File | Role |
|------|------|
| `src/context/Cass.tsx` | `CassProvider` + `useCass()`. Holds switch state, exposes `initiateSwitch`, `advanceMilestone`, `resetSwitch`, `dismissEntry`. Mounted in `App.tsx` provider stack. |
| `src/data/cass-switch-data.ts` | All hardcoded fixtures + the `CassState`/`CassMilestone` types + date helpers (`getMinSwitchDate`, `getMaxSwitchDate`, `formatSwitchDate`). |
| `src/flows/CassSwitchFlow.tsx` (+ `.css`) | The **9-screen initiation flow** (full-screen overlay). The heart of the prototype. |
| `src/pages/CassProgress.tsx` (+ `.css`) | Post-initiation **progress tracker** (5 milestones) + **switch result** summary (two views in one file). |
| `src/components/CassEntryPrompt.tsx` (+ `.css`) | Home entry point #1 — state-aware `ActionPrompt` / progress `ProgressBar` card. |
| `src/components/CassNextSteps.tsx` (+ `.css`) | Home entry point #2 — "Your next steps" NBA card with a switch row. |
| `src/components/CassSwitchGuaranteeOrbit.tsx` (+ `.css`) | Canvas animation on the intro screen (banks orbit → absorbed into Wise → CASS Guarantee badge). |
| `src/components/BottomSheet.tsx` | Shared (not CASS-only) sheet; used by the flow's "not my address" sheet. |
| `public/cass/*.svg` | Bank logos (lloyds, hsbc, natwest, santander), `cass-guarantee-badge.svg`, `wise-wordmark.svg` — used by the orbit. |
| `src/translations/en.ts` | All `cass.*` copy keys (English only). |

Wiring touchpoints in **`src/App.tsx`**: `CassProvider` in the provider stack; `activeFlow`
variant `{ type: 'cass-switch' }` → renders `<CassSwitchFlow>`; `subPage` variant
`{ type: 'cass-progress' }` → renders `<CassProgress>`; routes `/switch-bank` and
`/switch-progress`; Home gets `onCassStart` / `onCassProgress` handlers.
Demo controls live in **`src/components/PrototypeSettings.tsx`** (advance/reset milestone).

---

## 3. The initiation flow (`CassSwitchFlow.tsx`)

**9 screens**, linear, driven by a `Screen` union + `ORDER` array. A single circular back
`IconButton` (top-left) is the only chrome — **there is no step indicator / `FlowNavigation`**
(removed in the redesign; see §6). Footer holds the primary action per screen.

| # | `Screen` | Content | Primary action |
|---|----------|---------|----------------|
| 1 | `intro` | `CassSwitchGuaranteeOrbit` animation, "Switch to Wise in 7 days", "What happens" 3-item list, `PromoCard` | Continue |
| 2 | `bank` | 3 inputs: full name (prefilled `oldBank.accountHolder`), sort code (auto-formats `00-00-00`), account number (8 digits) | "Check details" → runs simulated CoP (1.1s spinner) → `match` |
| 3 | `match` | `check-mark` illustration + 4 rows (holder / sort code / account no. / type) each with a positive `StatusIcon` | Continue |
| 4 | `address` | 3 editable inputs prefilled from `heldAddress` (line, city, postcode) | Continue **+** tertiary "This is not my current address" → opens `BottomSheet` |
| 5 | `card` | last-5-digits input + neutral `InfoPrompt` ("Why we ask for this") | Continue (disabled until 5 digits) |
| 6 | `date` | `DateLookup` (min = +7 working days, max = +2 months) + "first possible date" hint | Continue |
| 7 | `review` | 3 `ListItem`s w/ `Navigation` chevrons (guarantee / agreement / closure docs) | Continue |
| 8 | `finalise` | 3 summary rows (switching from / date / what moves), `valueColumnWidth={60}` | Continue → `initiateSwitch()` → `success` |
| 9 | `success` | `check-mark` + "Switch requested" + body; root gets `np-theme-personal--forest-green` theme; nav button becomes a close `Cross` | Done → `onClose` |

**Behaviour notes:**
- `runCoP` is a `setTimeout` fake (1100 ms) — there is no real check; it always advances to `match`.
- Submitting `finalise` calls `initiateSwitch(switchDate)` which sets `status:'initiated', milestone:1`.
- The "not my address" sheet is informational only — both its CTA and the screen's primary just continue.
- Validation is shallow: `bankValid` = non-empty name + 6-digit sort + 8-digit account; `cardValid` = 5 digits.

---

## 4. Home entry points (two, both live)

1. **`CassEntryPrompt`** — state-aware, sits above Transactions:
   - `status==='none'` & not dismissed → proposition `ActionPrompt` ("Switch your bank to Wise", dismissible).
   - `status==='initiated'` → tappable `ProgressBar` card → opens `CassProgress`.
   - `status==='complete'` → success `ActionPrompt` → opens result.
2. **`CassNextSteps`** — "Your next steps" NBA card, rendered **below Transactions, only when
   `status==='none'`**. SVG donut ring (2/3), two static "done" rows + a "Switch to Wise" row that
   calls `onStartSwitch`.

> Both entry points trigger the **same** flow. This redundancy is intentional/experimental — if you
> consolidate, update both `Home.tsx` render sites.

---

## 5. State model (`Cass.tsx` + `cass-switch-data.ts`)

```ts
type CassStatus = 'none' | 'initiated' | 'complete';
type CassMilestone = 0|1|2|3|4|5;   // 1 requested · 2 verified · 3 payments · 4 balance · 5 complete
type CassState = { status; milestone; switchDate: Date|null; entryDismissed: boolean };
```
- `initiateSwitch(date)` → `status:'initiated', milestone:1, switchDate`.
- `advanceMilestone()` → +1 (cap 5); at 5 → `status:'complete'`. **Driven manually from
  PrototypeSettings** (there's no real backend timeline).
- `resetSwitch()` → back to initial. `dismissEntry()` → hides the proposition prompt.
- React state only; **not persisted** — a refresh resets the switch.

**Key fixtures** (`cass-switch-data.ts`): old bank = **Monzo** (`displayName` "Monzo Bank UK",
holder **Benhur Senabathi**, sort `04-00-04`, `•••• 8742`); held address = 28 Hogganfield Street,
Glasgow, G33 1DE; 3 direct debits (Netflix, British Gas, Virgin Media); 2 standing orders (Rent
£950, Savings £200); balance £1,240.50; redirection 36 months; cashback 2% / £50 cap.

---

## 6. How the build diverged from the original spec

`CASS-INBOUND-PROTOTYPE-SPEC.md` was the starting brief. The prototype was then refactored against
refined Figma designs (file `UoRi8hQfXS2arz7nFAy0WG`). Material differences a future agent must know:

- **Stepper removed.** Spec said use `FlowNavigation` with a 4-group stepper; the current flow has
  **no step indicator** — just a back button. Don't "restore" it without checking the latest design.
- **CoP is its own screen** (`match`), not an inline row on the bank screen.
- **8 → 9 screens.** The old `agreement` + `closure` consent screens became `review` (a documents
  list) + `finalise` (a summary). Added a dedicated `match` screen.
- **Address is editable** (3 inputs) with a "not my address" bottom sheet, not a passed-check card.
- **Persona name is Benhur Senabathi** in fixtures (spec said Connor Berry).
- **Intro uses the `CassSwitchGuaranteeOrbit` canvas animation** + a `PromoCard` — neither was in the spec.
- **`ButtonCue` is not used** in the current flow (spec required it).
- Date picker is **`DateLookup`** (a couple of revisions briefly used `DateInput`; current = DateLookup).

If spec and code disagree, **the code (this doc) wins** for current state; the Figma file wins for
intended direction.

---

## 7. Behavioural recommendations — what's landed vs. pending

From `CASS-SWITCH-BEHAVIOURAL-RECOMMENDATIONS.md` (and the later flow-review). Already in the build:
- ✅ CASS Guarantee made prominent on intro (via the orbit → guarantee-badge animation).
- ✅ Card warning reframed toward "why we ask" (now a *neutral* `InfoPrompt`, not a threat).
- ✅ Sort-code auto-formatting; name prefilled to reduce mismatch friction.

Still **pending** (good candidates for next iterations):
- Bank badge on the `match` screen (recognition cue).
- Value-prop "one account" framing on intro / entry points (salary, multi-currency direct debits).
- Surfacing the 2% cashback as a reason to finish.
- The **name-mismatch branch** (a Figma design exists — `// Sheet - Name mismatch`, node 2171:2943
  — but is **not built**; the only sheet in code is the "not my address" one). The behavioural review
  flagged the mismatch sheet's default-to-abandon framing as the highest-leverage fix.
- Branch/error screens generally (no-card skip path, CoP no-match) exist **in Figma only**.

---

## 8. Conventions to honour when iterating

- **Verify DS component props via the Wise Design System MCP** before using any
  `@transferwise/components` component. Never guess props. (`list-all-documentation` → `get-documentation`.)
- **Co-located CSS** per component; use design tokens (`--color-*`, `--radius-*`), no hardcoded hex/magic numbers.
- **All UI copy via `t()`** with keys in `en.ts` (English only for this prototype). Follow Wise
  content guidelines in `shared-resources/content/` (British English; concise; reassurance pattern
  acknowledge → reassure → next step; never blame the user).
- Flow overlay conventions: `base-surfaces-mobile/mobile/src/flows/structure.md`.
- **Don't invent user-facing facts** (stats, guarantees, regulatory claims). Ground them in
  `CLAUDE.md` / PMM positioning, or label as placeholder.

## 9. Quick reference — relevant CASS facts (from `CLAUDE.md`)
7-day guaranteed switch; 36-month payment redirection; CASS Guarantee covers errors/charges/interest;
switch date ≥7 working days out, weekdays, ≤~2 months (v1 decision); **#1 failure = wrong/missing
card number**; **no joint accounts, no savings/ISAs**; can switch with a negative balance (liability
stays with customer); 2% cashback on DD spend (£50/yr cap) for 3+ direct debits; v1 = full switches
only, WPL-entity customers.
