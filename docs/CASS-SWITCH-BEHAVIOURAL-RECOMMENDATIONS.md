# CASS Switch Flow — Behavioural Design Recommendations

> **Report, not a build spec.** This is a behavioural-psychology audit of the "Switch your bank to
> Wise" (CASS inbound) flow in `base-surfaces-mobile`. It lists prioritised, evidence-grounded UX
> improvements to raise switch-completion probability. Product background lives in the root
> `CLAUDE.md`; the build spec lives in `docs/CASS-INBOUND-PROTOTYPE-SPEC.md`. Intended to be
> implemented **one item at a time** later — nothing here has been built.
>
> **Scope of this audit (set with product owner):** two levers only — **(1) Trust & Guarantee**
> and **(2) Value-proposition landing** (framing Wise as *one account* for salary + multi-currency
> direct debits). Progress/momentum and invented social-proof stats were deliberately excluded.
>
> **If/when building:** before using any `@transferwise/components` component, verify props via the
> Wise Design System MCP. All copy must follow `shared-resources/content/` (British English,
> benefit-led, concise, no invented stats).

---

## Context — the behavioural problem

Switching a primary bank account is one of the highest-inertia decisions in personal finance.
People don't stay with their bank because it's good — they stay because switching *feels* risky,
effortful, and irreversible (**status-quo bias + loss aversion**). ~80% of UK Wise holders keep
<£500 with Wise, i.e. Wise is their *secondary* account.

The job of this flow is therefore not "collect details" — it is to **dismantle perceived risk**
and **make the upside concrete**, so the customer reclassifies Wise as their *main* account.

The current flow (9 screens: intro → bank → match → address → card → date → review → finalise →
success) is functionally complete and visually clean, but during the recent visual refactor it
**dropped two of its strongest persuasive assets**: the CASS Guarantee trust strapline, and any
"why Wise" value proposition. It currently reads as a neutral data-collection form.

---

## Lever 1 — Trust & Guarantee (dismantle perceived risk)

The dominant blocker is fear, not apathy. Every screen should quietly answer "what if this goes
wrong?" before the user thinks to ask. All facts below are real and already in the project.

### 1.1 Make the CASS Guarantee the emotional anchor of the intro — **HIGH**
- **Where:** intro screen (`screen === 'intro'`), framing the "What happens" list.
- **What:** restore a prominent **Current Account Switch Guarantee** strapline; lead with
  protection, not mechanics.
- **Copy direction:** *"Protected by the Current Account Switch Guarantee. If anything goes wrong,
  you'll get back any charges or interest — guaranteed."*
- **Why:** **Loss aversion.** The perceived downside is "my bills break / I lose money / my salary
  goes missing." The Guarantee is a regulated, third-party promise that removes exactly that
  downside. Naming a *scheme bigger than Wise* also borrows institutional trust (**authority
  bias**). Single highest-leverage change.
- **Evidence:** competitive teardown (CLAUDE.md) explicitly flags "make the CASS Guarantee
  prominent" as a reassuring element Monzo/Revolut lean on.

### 1.2 Show the bank badge + "details match" the instant CoP passes — **HIGH**
- **Where:** `match` screen.
- **What:** render the **old bank's badge/name** alongside the green ticks (data already exists:
  `oldBank.name`, `brandColor`, `displayName`). Today the match screen shows ticks but not the
  recognisable bank identity.
- **Why:** **Recognition + competence signal.** Seeing *their own bank* recognised correctly and
  immediately tells the user "Wise understands my situation and is talking to the right place."
- **Evidence:** competitive research called out "show bank badge immediately after sort-code entry."

### 1.3 Reframe the card-number warning from fear to reassurance — **HIGH**
- **Where:** `card` screen warning prompt.
- **What:** current copy is pure threat (*"…Your switch will not go through…"*). Keep the stakes
  clear but **lead with the why and a safety net** (Wise tone: acknowledge → reassure → next step,
  never blame). Add a format hint in the input.
- **Copy direction:** title *"Why we ask for this"* / body *"It's how your old bank checks it's
  really you. Use the card for the account you're switching from — if you get it wrong, we'll let
  you know so you can fix it before anything happens."*
- **Why:** the card number is the **#1 documented cause of switch failure**. A bare threat raises
  anxiety at the exact friction point where people abandon. Reframing to *explained + recoverable*
  lowers the perceived cost of a mistake while still driving accuracy.

### 1.4 Add a quiet trust footer of regulated-scheme signals — **MEDIUM**
- **Where:** intro and/or finalise screen (low emphasis).
- **What:** a small reassurance line using Wise's real proofs: trusted by **9M+ customers**,
  **regulated**, money **ring-fenced / FSCS protected up to £85k**, **24/7 real-human support**.
- **Why:** **Social proof + safety.** A primary-account decision needs "lots of people trust this
  and my money is safe." Factual Wise positioning (PMM messaging house), not fluff.

### 1.5 Strengthen the peak-end on success + show ongoing protection — **MEDIUM**
- **Where:** `success` screen.
- **What:** reinforce the guarantee, the **7-day timeline**, the **we'll-keep-you-updated** promise,
  and preview that payments stay protected by **36-month redirection**.
- **Why:** **Peak–end rule** — the final moment disproportionately shapes memory and word-of-mouth.
  "Most CASS complaints stem from status confusion," so promising proactive updates here pre-empts
  the anxiety that drives support contacts. (A restored progress indicator / milestone preview is
  the natural companion but was out of scope this round.)

---

## Lever 2 — Value-proposition landing ("one account for everything")

The flow currently never says *why Wise* — it asks for data but sells nothing. Strategic frame:
switching isn't "moving away from my bank" (loss) — it's **upgrading to one account that does what
your bank can't** (gain). Grounded in Wise's real positioning: *"the world's most international
account — all the features of a global bank in one extraordinary account."*

### 2.1 Add a value-proposition moment to the intro — **HIGH**
- **Where:** intro screen, before/with the "What happens" list.
- **What:** a short benefit-led block framing the upside of making Wise the **main** account. Lead
  with benefit, not features.
- **Copy direction (anchored to real Wise positioning):**
  - *"One account for your whole life — at home and abroad."*
  - *"Get your salary, pay your bills, and spend in 40+ currencies — all from one account."*
  - *"Set up direct debits in **GBP, EUR and USD**, get paid like a local in 30 countries, and earn
    interest on your balance (FSCS protected up to £85k)."*
- **Why:** **Reframing loss → gain.** Status-quo bias holds when staying feels free and switching
  feels like pure cost. Concrete, differentiated upside (multi-currency direct debits, salary,
  interest) reweighs the decision toward action. These are Wise's documented value props
  (cheap / convenient / trustworthy / transparent / easy) — not invented.

### 2.2 Tie the "what moves" items to a benefit, not just a mechanic — **MEDIUM**
- **Where:** intro list items (balance / direct debits / redirect payments).
- **What:** add a half-line of *why it's good* — e.g. direct debits → *"and you can run them across
  GBP, EUR and USD"*; balance → *"start earning interest on it from day one."*
- **Why:** **Concreteness + benefit framing.** Specifics are more persuasive and memorable than
  abstractions; every mechanical step doubles as a reason to switch.

### 2.3 Reframe the finalise screen as "what you're gaining" — **MEDIUM**
- **Where:** `finalise` screen (the commitment moment).
- **What:** alongside the summary rows, add one forward-looking benefit line — what life looks like
  *after*: e.g. *"After 7 days, Wise is your main account: one place for your salary, bills and
  spending — anywhere in the world."*
- **Why:** **Goal visualisation at the point of commitment** counteracts last-second cold feet by
  making the reward vivid right before the irreversible tap.

### 2.4 Carry the value prop into the Home entry points — **MEDIUM**
- **Where:** `CassNextSteps` "Switch to Wise" row and `CassEntryPrompt`.
- **What:** today both say "Bring your balance, direct debits and standing orders to Wise"
  (mechanical). Add the *why*: *"Make Wise your main account — one account for your salary, bills
  and spending across currencies."*
- **Why:** the **decision to start** happens here, before the flow. The entry point should sell the
  destination, not describe the plumbing. **Consistent framing** entry → intro → finalise compounds.

---

## Priority summary (recommended order)

| # | Recommendation | Lever | Impact | Effort |
|---|----------------|-------|--------|--------|
| 1 | CASS Guarantee anchor on intro | Trust | High | Low |
| 2 | Value-prop block on intro (one account: salary, multi-ccy DDs, interest) | Value | High | Low |
| 3 | Reframe card-number warning to reassurance + format hint | Trust | High | Low |
| 4 | Bank badge on CoP match screen | Trust | High | Low |
| 5 | Value prop in Home entry points (consistent framing) | Value | Med | Low |
| 6 | Benefit-led "what moves" list items | Value | Med | Low |
| 7 | Forward-looking benefit line on finalise | Value | Med | Low |
| 8 | Regulated-scheme trust footer (9M, FSCS, ring-fenced, 24/7) | Trust | Med | Low |
| 9 | Strengthen peak-end + update promise on success | Trust | Med | Low |

---

## Files each item would touch (for implementation later)

- Intro / match / card / finalise / success screens → `mobile/src/flows/CassSwitchFlow.tsx`
  (+ `CassSwitchFlow.css` for any new strapline/footer styling).
- Copy → `mobile/src/translations/en.ts` (`cass.*` keys; mirror to es/de/fr if required).
- Home entry points → `mobile/src/components/CassNextSteps.tsx` and
  `mobile/src/components/CassEntryPrompt.tsx`.
- Bank/brand data already present → `mobile/src/data/cass-switch-data.ts`.

## Guardrails (Wise content rules)
- British English; concise, human, to-the-point; no humour in reassurance contexts.
- Lead with customer benefit; cut ruthlessly; max 1–2 short sentences per prompt.
- Use only **real, verifiable** Wise facts. Safe to use: "9M customers", "regulated", FSCS £85k,
  money ring-fenced, multi-currency direct debits (GBP/EUR/USD), get paid like a local in 30
  countries — all from PMM positioning. Do **not** invent switch-count stats.
- Reassurance pattern: acknowledge → reassure → clear next step; never blame the user.

## Source grounding
- Wise positioning / value props: PMM *"Wise account positioning & messaging"* (messaging house);
  *"Wise Account Basics"* (WISGN); *"Purpose feature groupings"* (Disco).
- CASS Guarantee, 2% cashback, #1 card-number failure, "status confusion", competitor benchmarks:
  root `CLAUDE.md`.
- Tone & content rules: `shared-resources/content/` (writing-guidelines, tone-of-voice,
  info-prompts).
