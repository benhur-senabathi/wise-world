# CASS Inbound Switch — v1 Prototype Build Spec (happy path)

> **For the building agent.** This is a self-contained spec to build a clickable happy-path
> prototype of the **CASS inbound full switch** (a customer switching their UK current account
> *to* Wise) in the `base-surfaces-mobile` app. Product background lives in the root `CLAUDE.md`
> ("CASS — Current Account Switch Service"). This doc covers *what to build*; `CLAUDE.md` covers
> *why*. Read both.
>
> **Before using any `@transferwise/components` component, verify its props via the Wise Design
> System MCP** (`list-all-documentation` → `get-documentation`). Component APIs cited here were
> checked on 2026-06-03 but confirm before coding. Never guess props.

---

## 0. Scope & ground rules

**In scope (happy path only):**
1. **Entry point** — dismissible ActionPrompt on Home.
2. **Initiation flow** — 8 steps, full-screen overlay, ending in a "request sent" success screen.
3. **Progress surface** — a dedicated progress card on Home + a detail screen with 5 milestones.
4. **Demo control** — manual "advance milestone" control inside PrototypeSettings.
5. **Switch result** — completion success screen summarising everything that moved.

**Out of scope (do NOT build):** partial switches; outbound switches; any real validation
(modulus/EISCD/CoP/card checks all "succeed"); error/rejection/cancellation branches; non-English
translations; backend/API calls; notifications/push/email.

**Locked decisions (from product owner, do not re-litigate):**
| # | Decision |
|---|----------|
| Persona | `power` dataset (the default). Consumer name: **Connor Berry**. Entry shows on default Home. |
| Old bank | **Monzo** (CoP "succeeds", shows Monzo badge + green tick). |
| What transfers | 3 Direct Debits, 2 Standing Orders, 1 balance (values in §6). |
| Address step | Kept, but happy-path success only (no real check). |
| Demo control | Manual tap-to-advance milestones, lives in PrototypeSettings. |
| Translations | `t()` keys, **English only** (`en.ts`). Do not populate es/de/fr. |
| Consent | Two separate screens, short summarised placeholder copy. |

---

## 1. Architecture — follow the existing flow pattern

Read `base-surfaces-mobile/mobile/src/flows/structure.md` first — it is the binding convention.
Key points this build must honour:

- **Overlay flow**: `position: fixed; inset: 0; z-index: 100;` full-screen, replaces page layout.
- **`activeFlow` union in `App.tsx`**: add a new variant `{ type: 'cass-switch' }`. When set, render
  `<CassSwitchFlow .../>` instead of the page. `onClose` sets `activeFlow = null`.
- **Header with steps**: use **`FlowNavigation`** from `@transferwise/components` (verified props:
  `steps: {label, onClick?}[]`, `activeStep: number`, `avatar`, `logo`, `onClose`, `onGoBack`).
  Internal step state is managed in the flow component (see SendFlow for the pattern: a `step`
  state union + animated track).
- **Primary action**: wrap in `ButtonCue` (`src/components/ButtonCue.tsx`) per the button state
  machine in structure.md.
- **Body column**: `padding: 132px 16px 48px; width: 100%;`.
- **Translations**: every string via `t()` from the Language context; add keys to `en.ts` only.
- **Focus**: delay primary-input focus 400ms.

New files (mirror existing naming):
```
src/flows/CassSwitchFlow.tsx        + CassSwitchFlow.css   ← the 8-step initiation flow
src/pages/CassProgress.tsx          + CassProgress.css     ← progress detail + milestones + result
src/components/CassEntryPrompt.tsx  (+ css if needed)      ← ActionPrompt wrapper for Home
src/data/cass-switch-data.ts  (or @shared/data) — hardcoded Monzo / DD / SO / balance fixtures
```
Export the flow from `src/flows/index.ts`. Wire the entry on `src/pages/Home.tsx` (near the
existing `TasksStack` / `PromotionBanner` block, ~line 239–348).

---

## 2. State model

A single piece of switch state, lifted to `App.tsx` (or a small `CassContext`) so Home, the flow,
PrototypeSettings, and the progress page all share it:

```ts
type CassMilestone = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = not started, 1 = requested, 2 = verified, 3 = payments moving,
// 4 = balance transferring, 5 = complete
type CassState = {
  status: 'none' | 'initiated' | 'complete';
  milestone: CassMilestone;
  switchDate: Date | null;
  entryDismissed: boolean;
};
```
- After initiation submit → `status: 'initiated'`, `milestone: 1`.
- PrototypeSettings "Advance switch" increments `milestone` (cap at 5). At 5 → `status: 'complete'`.
- Persist in React state only (no storage needed for a demo).

---

## 3. Entry point (Home)

**Component:** `ActionPrompt` (`prompts-actionprompt`). Verified props: `title`, `description`,
`action: {label, onClick}`, `actionSecondary?`, `media?`, `sentiment?`, `onDismiss?` (presence of
`onDismiss` is what renders the close button).

**Render logic on Home:**
- `status === 'none'` and `!entryDismissed` → show entry ActionPrompt.
- `status === 'initiated'` → show the **progress card** (see §5) instead.
- `status === 'complete'` → show a "Switch complete" ActionPrompt linking to the result screen
  (or hide — product owner to decide later; default: show, links to result).

**Entry ActionPrompt content:**
- `sentiment="proposition"`
- `title`: "Switch your bank to Wise"
- `description`: "Move your direct debits, standing orders and balance in 7 days."
- `action`: { label: "Start switch", onClick: open the flow }
- `onDismiss`: sets `entryDismissed = true`

---

## 4. Initiation flow — `CassSwitchFlow.tsx` (8 steps)

`FlowNavigation` step grouping (the stepper needn't show all 8 sub-screens as separate labels —
group into ~3–4 logical labels like the SendFlow does, e.g. **Details · Verify · Date · Confirm**;
your call, keep it clean). Each screen below has a single primary CTA unless noted.

| # | Screen | What the user sees | CTA |
|---|--------|--------------------|-----|
| 1 | **Intro / value prop** | Headline, the 7-day promise, **CASS Guarantee trustmark/strapline** (mandatory to show), short "what moves" list (balance, direct debits, standing orders), a non-functional "Learn more" link. | "Start switch" |
| 2 | **Old bank details** | Two inputs (DS `Field` + `Input`): **Sort code**, **Account number**. On submit → simulate CoP success: reveal a confirmation row showing **Monzo** bank badge + account holder name (Connor Berry) + a **green tick** (`StatusIcon sentiment="positive"`). This is the reassurance moment. | "Continue" (enabled after the success state shows) |
| 3 | **Confirm address** | Show the address "we hold" (hardcode a plausible UK address). Present as a passed check — DS `StatusIcon sentiment="positive"` + "This matches your records." No editing needed on happy path. | "Looks right" |
| 4 | **Card identity** | Input for **last 5 digits** of the old debit card. Clear "why we need this" helper copy (it's how your old bank confirms it's you). A secondary, low-emphasis "I don't have my card" link is present but NOT wired for the happy path (or routes nowhere). Any 5 digits accepted. | "Continue" |
| 5 | **Switch date** | DS `Calendar` (verified props: `value`, `min`, `max`, `onChange`). `min` = today + 7 working days; `max` = today + ~2 months. Default-select the `min` date. Helper: "Pick a day with few bills due." | "Confirm date" |
| 6 | **Switch Agreement** | Short summarised consent copy (placeholder, clearly not final legal text) + a non-functional "View full terms" link. Agreement via primary button (treat tapping it as consent). | "Agree and continue" |
| 7 | **Account Closure Instruction** | Separate screen. Short copy explaining the old account will close on the switch date. Same consent pattern. | "Agree and continue" |
| 8 | **Confirm & submit** | Summary list (DS `ListItem`s): Old bank (Monzo), Switch date, What moves (balance + DDs + SOs), **What won't move** (card payments/subscriptions — you'll need to update these). | "Start my switch" |

**On submit (after step 8):** set `status:'initiated', milestone:1`, close the flow, and show a
brief **"Request sent to your old bank"** confirmation. Two options — pick the simpler:
(a) a final in-flow success screen before close, or (b) close the flow and surface the progress
card on Home with a snackbar "Switch requested." Either is fine; (a) gives a cleaner moment.

---

## 5. Progress surface

### 5a. Progress card on Home (replaces the entry prompt when `status==='initiated'`)
A compact card using DS **`ProgressBar`** (verified props: `id`, `title`, `description`,
`progress:{value,max}`, `textEnd`). Example: `title="Switching from Monzo"`,
`progress={{ value: milestone, max: 5 }}`, `textEnd="Step {milestone} of 5"`,
`description="Estimated complete by {switchDate}"`. Tapping the card opens the progress detail
page (`CassProgress`).

### 5b. Progress detail page — `CassProgress.tsx`
Renders the **5 milestones** as a vertical list. Each milestone has a state: done / current /
upcoming. Use `StatusIcon` + DS list styling: `sentiment="positive"` for done, `sentiment="pending"`
for the current step, muted/neutral for upcoming. (`StatusIcon` sentiments verified: positive,
pending, neutral, warning, negative, info, success, error.)

| # | Milestone label | Sub-copy |
|---|-----------------|----------|
| 1 | Switch requested | We've asked Monzo to start your switch. |
| 2 | Verified by your old bank | Monzo confirmed your details. |
| 3 | Payments being moved | Setting up your direct debits and standing orders. |
| 4 | Balance transferring | Moving your money to Wise. |
| 5 | Switch complete | All done — see what moved. |

The page reflects `milestone` from state. When `milestone === 5` (`status==='complete'`), show a
primary CTA **"See switch summary"** that opens the **Switch result** screen (§6). Do NOT expose
the moved payment arrangements anywhere in-app until milestone 5 (per CASS guidance — avoids
confusion about where payments originate mid-switch).

---

## 6. Switch result (completion success screen)

Reached from the progress page CTA at milestone 5. The emotional payoff. Layout: success header,
then grouped summary sections.

**Header:** big success moment — "Your switch is complete" / "Welcome to your new current account."

**Summary sections (use DS `ListItem` / `Section`):**
- **Balance transferred:** **£1,240.50** moved from Monzo.
- **Direct Debits moved (3):**
  - Netflix
  - British Gas
  - Virgin Media
  *(show with service-user-style naming; reuse recipient/transaction avatar styling if easy)*
- **Standing Orders moved (2):**
  - Rent — £950.00
  - Savings — £200.00
- **Payment redirection:** active for 36 months — payments to your old account come to Wise.
- **2% cashback unlocked** (proposition/positive accent): "You moved 3+ direct debits — you've
  unlocked 2% cashback on direct debit spend (up to £50/year), paid to your Wise card." *(This is
  the Wise switching incentive — see CLAUDE.md Product Vision.)*
- **Card reminder** (informational, `InfoPrompt` or similar): "Card payments and subscriptions
  don't transfer. Update your card details with those providers." (These are NOT in the switch.)

**CTAs:** primary "View account" (closes to Home), secondary "Set up Wise card".

Fixtures for all the above live in `cass-switch-data.ts` so they're easy to tweak.

---

## 7. Demo control (PrototypeSettings)

Add a CASS section to `src/components/PrototypeSettings.tsx` (the existing bottom-sheet of
prototype-only controls). Requirements:
- Only meaningful when `status !== 'none'`.
- A button **"Advance switch step"** → increments `milestone` (1→5). At 5, sets `status:'complete'`.
- A button **"Reset CASS switch"** → resets `CassState` to initial (`status:'none', milestone:0,
  switchDate:null, entryDismissed:false`). Lets you re-run the demo cleanly.
- (Optional) a label showing current milestone for the presenter.

This keeps all time-simulation controls out of the customer-facing UI.

---

## 8. Content / copy rules

- British English, Wise tone (concise, modern, energetic) — see
  `shared-resources/content/writing-guidelines.md` and the `components/` copy files.
- All consent/legal text is **placeholder**, clearly not final (Pay.UK supplies fixed wording
  later). A short comment in the code noting this is enough.
- Numbers/dates formatted GBP / UK style.

## 9. Definition of done

- From default Home (`power`), the ActionPrompt entry is visible and dismissible.
- "Start switch" opens the 8-step flow; every step advances to a "request sent" moment.
- Home then shows the progress card; tapping opens the milestone page.
- In PrototypeSettings, "Advance switch step" walks milestones 1→5; "Reset" returns to start.
- At milestone 5, the Switch result screen shows balance + 3 DDs + 2 SOs + redirection + cashback
  + card reminder.
- App builds and runs (`base-surfaces-mobile`, port 3017); no TypeScript errors; English strings
  via `t()`.
```
```
