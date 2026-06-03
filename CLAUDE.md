# CASS — Current Account Switch Service (Wise UK)

> Every section links to its source. When I synthesise, I keep the source link attached so you
> can always verify against the original. Confluence space: **GBP** (cloudId
> `6c85b940-0f26-4355-9ba6-61ca2d0ce603`, site `transferwise.atlassian.net`).

## What this project is

Wise is enrolling in the UK's **Current Account Switch Service (CASS)** — the regulated,
Pay.UK-run scheme that lets people and SMEs move their current account (balance + all payment
arrangements) from one bank to another within a guaranteed **7 working days**. Wise acts as
**both** the New Bank (customer switches *to* Wise = inbound) and the Old Bank (customer switches
*away* = outbound).

Two drivers:
1. **Regulatory** — calling the Wise Account a "current account" scopes Wise into PSR regulations
   that mandate CASS participation.
2. **Growth** — ~80% of UK Wise account holders hold <£500, suggesting Wise isn't their primary
   account. CASS is a frictionless way to migrate a customer's primary account to Wise.

Target go-live: **Feb 2027**. First testing wave targeted: **Sep 2026** (backend must be ready).

## My role and how we work together

I'm a **product designer** kickstarting this project. I own the **customer-facing experience** —
which the engineering RFC explicitly defers to design. I rely on Claude to:
- **Synthesise** scattered context into clear artifacts — **always keeping source links** so I can
  verify. I want all the detail, not a lossy summary.
- **Verify** claims against source material (CASS has strict regulatory rules; errors are costly).
- **Review** flows, copy, and decisions critically — a design partner, not a yes-machine.
- **Design-partner & prototype** — wireframes, flows, edge-case mapping, content.

Flag ambiguity and source conflicts rather than papering over them.

---

## My Product Design Brief (the design north star)

Source: [CASS — High-level Product Design Brief](https://transferwise.atlassian.net/wiki/spaces/~71202064fef706ff0e4df084812a1cb6dbd965/pages/4135545143)
(my own page).

**Goal:** Design v1 of the CASS customer experience — a simple, trusted switching journey that
explains what's happening, what the customer must do, and how their money, payments and account
details (jars, scheduled payments) are affected.

First-release focus areas:
| Focus | What to solve |
| --- | --- |
| Inbound switching | Help customers move their current account to Wise |
| Outbound switching | Clearly explain what happens when customers leave Wise |
| Balances and jars | Clarify what happens to GBP, non-GBP balances and jars |
| Customer updates | Keep customers informed across app, email, other comms |
| Payment changes | Explain direct debits, standing orders, account closure, statements |

Design activities: understand CASS rules → define MVP scope → map inbound/outbound journeys →
define customer-facing switch states → review competitors (Monzo, Revolut) → wireframes →
prototype core flow → define comms → support build (final designs, handoff, QA, launch).

**Design milestones:**
| Timing | Milestone |
| --- | --- |
| Late May 2026 | UX kick-off completed |
| Early June 2026 | Confirm rules, constraints, open questions |
| Mid June 2026 | Align on MVP scope and journeys |
| Late June 2026 | First-pass prototype ready (wireframes by last week of June) |
| Jul–Aug 2026 | Refine designs, content, API needs, service states |
| Sep 2026 | Backend ready for Pay.UK testing |
| Q4 2026 | Build front-end, comms, support processes |
| Dec 2026 | Target front-end readiness |
| Feb 2027 | Planned go-live |

**Open questions I still need to resolve:**
- Outbound closure — what exactly closes when a customer switches away?
- Balances/jars — what happens to jars and non-GBP balances?
- Customer action — should customers move/convert funds themselves, or should Wise automate it?
  Can we nudge them to move other currencies to Jars and give them the option?
- Entry points — where do customers discover the flow? Must they already have current-account
  details? What if they did a send flow via intent picker and haven't completed account-detail
  verification?
- Validation — what checks reduce failed/rejected switches?
- Communications — which updates are mandatory, and on which channels?

---

## UX Product Spec (the detailed solution)

Source: [CASS UX | Product Spec](https://transferwise.atlassian.net/wiki/spaces/~7120201ff0ec5f6faa4eeeae00180eaaaba38c/pages/4128559162)
(Matías Lumainsky). This is the most detailed design-facing doc — full screen-by-screen flows
below.

**Success metrics** (targets TBD): monthly inbound switches, net switch ratio (in vs out), switch
completion rate, CASS support contacts, median balance post-switch (baseline £25).

**Scope.** In: inbound + outbound, full + partial switches; entry points (onboarding + in-app);
progress tracking, notifications, success/error states, edge cases. Out: backend scheme
integration (Sid's team), Samurai ops tooling, incentive business case (Mo/Shiv), joint accounts,
business switching (phase 2), card-based payment migration.

### Inbound Full Switch

**Entry points:**
- **A) Launchpad card** — dismissable, appears once GBP current account is activated; persists 72h
  unless dismissed. Copy: "Switch your bank to Wise / Move your direct debits, standing orders and
  balance in 7 days." CTA: "Start switch."
- **B) Open screen** — "Switch your bank to Wise" lives alongside currency accounts in the Open
  list (top-right of launchpad). Always available for UK CA holders who haven't switched.
  Deep-linkable for marketing.

**Initiation flow:**
| Step | Screen | Details |
| --- | --- | --- |
| 1 | Intro | What CASS does, 7-day guarantee, what gets moved. Link to switch guide. |
| 2 | Old bank details | Sort code + account number + name. Validate via modulus check + EISCD lookup. |
| 3 | Identity | Last 5 digits of debit card on old account. Explain why. |
| 4 | Switch date | Min: today + 7 working days. Max: today + 1 month. Weekdays only. Default to earliest. |
| 5 | Consent | Two mandatory agreements (Pay.UK wording, fixed): Switch Agreement + Closure Instruction. |
| 6 | Confirmation | Summary + CTA "Start my switch". |

**Progress tracking** — persistent launchpad card, 5 milestones tied to backend messages:
| # | Label | Trigger |
| --- | --- | --- |
| 1 | Switch requested | MSG01 sent |
| 2 | Verified by your old bank | MSG02 received (accepted) |
| 3 | Payments being moved | MSG04 sent |
| 4 | Balance transferring | MSG06 received |
| 5 | Switch complete | MSG07 sent |

**Success screen** (on MSG07): confirmation, balance transferred, list of DDs moved (with service
user names), list of SOs moved, redirection active 36 months, card reminder ("Update card details
with subscription services — these don't transfer"), CTA to view account / set up Wise card.

**Notifications:**
| Event | Push | In-app | Email |
| --- | --- | --- | --- |
| Switch initiated | Yes | Status update | Confirmation |
| Verified by old bank | Yes | Status update | No |
| Switch complete | Yes (with £ amount) | Success card | Completion summary |
| Redirected payment received | Yes | Transaction annotation | No |

### Inbound Partial Switch
Same entry point; choice screen after intro. Choice screen makes tradeoffs explicit (full switch
recommended; partial = no guarantee, no redirection, no balance transfer).
| Aspect | Full | Partial |
| --- | --- | --- |
| Old account | Closed | Stays open |
| Balance transfer | Yes | No |
| Redirection (36 months) | Yes | No |
| CASS guarantee | Yes | No |
| Consent forms | Switch + Closure | Switch only |
| Success screen | Balance + DDs + SOs | DDs + SOs only |

### Outbound Full Switch (customer leaves Wise)
Customer doesn't initiate in our app — the new bank sends MSG01 to us.
| Day | What happens | Customer sees |
| --- | --- | --- |
| 1 | We receive MSG01 | Push + email + in-app banner with switch date |
| 1–6 | Processing | In-app status with milestone indicators |
| 7 | Account disabled, balance transferred | Push + email confirming amount and destination |

**Asset warning** (shown when MSG01 lands, if customer has non-GBP balances, Interest, Assets, or
active card subscriptions): "Your GBP account closes on [date]. These won't transfer
automatically: [list]. You can withdraw or convert before [date]." CTA: "Manage my balances."

**Post-switch state:** GBP sort code/account closed; other currencies, Interest, Assets still
accessible; card disabled for GBP; account stays open for non-GBP features.

### Outbound Partial Switch (payments moved away)
New bank sends partial request; Wise account stays open. Push + in-app: "[New bank] has requested
to move some of your payments. Your account will stay open." List DDs/SOs being moved. No customer
action needed; moved DDs/SOs cancelled on Wise, everything else unaffected.

### Errors and failures (with exact copy + cause)

**Inbound — initiation:**
| Error | Cause | Customer sees |
| --- | --- | --- |
| Invalid sort code | Modulus check fails | "Check your sort code — it doesn't match a UK bank code." |
| Bank not in CASS | EISCD lookup | "Your bank doesn't participate in switching. You can still move payments manually." |
| Already switching | Old bank rejects (R320) | "This account is already being switched. Please wait for it to complete." |
| Identity mismatch | MSG02 rejection | "Your old bank couldn't verify your details. Check your account number and card details." Allow retry. |
| Fraud flag | R317 | "Your old bank flagged a concern. Please contact them directly." |

**Inbound — mid-switch:**
| Failure | Cause | Customer sees |
| --- | --- | --- |
| Bank holiday delay | W401 in MSG02 | "Your switch date has moved to [date] due to a bank holiday. Everything else is on track." |
| Non-transferable DD | DDI040 in MSG02 | "Some payments couldn't be moved: [list]. Set these up directly with the provider." |
| Unsupported SO frequency | Wise doesn't support schedule | "We can't match the schedule for [SO]. We'll reach out to agree a new one." |
| Balance transfer timeout | MSG06 missing by Day 7 | "There's a delay with your balance transfer. We're chasing your old bank." |
| Switch terminated | MSG10 | "Your switch has been cancelled. [Reason]. Contact us if you didn't request this." |

**Outbound — edge cases:**
| Scenario | Handling |
| --- | --- |
| Negative GBP balance | Cannot block switch. Notify customer. Debt recovery handled separately. |
| Pending card auths | Settled via MSG08/MSG09 post-switch. Customer notified if debit hits new account. |
| Internal jar-to-jar transfers | Cancelled on disable. Not included in MSG02. |
| Funds in Interest/Assets | Remain accessible after GBP sort code closes. |

### Cancellation
- **Pre-MSG01:** "Cancel switch" in-app, no consequences.
- **Post-MSG01:** Not customer-cancellable. CS can trigger MSG10 in specific cases (fraud,
  deceased, customer requests after risk explainer).
- **Cooling off:** 14 days from signing. If switch completes within window, customer can cancel
  *future redirection only*.

### Risks (from spec)
Backend not ready for build; Samurai not ready (manual PSW fallback for low launch volume); status
confusion drives support (mitigate with milestones + proactive notifications); **wrong card number
is the #1 failure** (clear copy, format hint, easy retry); old banks slow to respond (surface
"waiting" state, escalate via Pay.UK).

### Dependencies (from spec)
| Dependency | Owner |
| --- | --- |
| MSG01–MSG07 endpoints | Sid's team |
| EISCD lookup API | Sid's team |
| Modulus check service | Payments infra (existing) |
| Samurai ops tooling | Ops engineering |
| Pay.UK participation agreement | Caroline Clare / Legal |
| PKI test cards from NatWest | Anastasiia Yaryhina |
| Consent form wording (Pay.UK) | Sid / Legal |
| Switch guide content | Content / Legal |

---

## Workshop #1 — User Flow & Edge Cases (whiteboards)

Source: [Workshop #1 page](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4114163062)
(Sid Ram). The two whiteboards are saved locally as `docs/Inbound Switch Flow.pdf` and
`docs/Outbound Switch Flow.pdf` (the Confluence whiteboard objects can't be pulled via API).
Legend used on both: solid = switch progression; dashed = customer-facing UX consideration; red =
cancellation path; orange = warning path; yellow diamond = customer decision point; blue rounded =
activity requires manual (Ops) action.

> **v1 scope decisions (settled with Benhur, 2026-05-29):**
> 1. **Full switches only.** Partial switches (in *and* out) are **de-scoped from v1** — they're
>    ~1% of switch volume. This overrides the [UX Product Spec](#ux-product-spec-the-detailed-solution),
>    which had listed partial in-scope. *(Note: Pay.UK rules require Wise to support partial
>    switch-**out** eventually as Old Bank — so it's a post-v1 obligation, not abandoned.)*
> 2. **Switch-date window: max ~2 months** (working assumption). Splits the difference between the
>    inbound board's "up to 3 months" and Pay.UK's suggested 1-month max — revisit before
>    finalising the date picker.
> 3. **Audience: WPL customers.** **WPL = Wise Payments Limited**, the UK-regulated legal entity
>    (not "Wise Platform", which is "WP"). v1 is gated to customers held under the WPL licence —
>    **not** restricted to UK residents (the board is explicit on this). The gate is the licensing
>    entity, not country of residence. Other Wise entities (Wise Europe SA; India/NZ from Q2 2026)
>    are out of scope.

### Inbound Switch (Wise = New Bank)

**Entry & eligibility.** Customer shows switch intent → display Account Switch Option CTA →
customer decision to proceed. Eligibility note: currently show only to WPL customers. CTA page
should carry value prop + CASS Guarantee + a "Learn more" linkout to CASS web pages (guide/FAQs).

**Progressive data collection** (UX notes on the board):
- Start with only **old account sort code + account number → CoP check** to confirm match (pull
  name & account type from our records).
- Display the **address we hold** for the customer to confirm it matches the old bank (nudge to
  update if stale at either bank). **Business customers:** also confirm all **UBOs** on the account.
- Ask for **last 5 digits of card number** — offer a "no card" option but show a warning screen
  first that the switch could be rejected without it.
- **Date calculator** — default to earliest feasible date; allow change (up to 3 months *per board*
  — see conflict #2). Hint: pick a date with low DD/bill activity.
- Once date confirmed → **Switch Agreement** screen → **Account Closure Agreement** screen.
- **Success screen** ("request sent to your old bank") + next-steps screen. Email: switch
  agreement + account closure agreement + links to the brochure (FAQs/help).

**Validation → MSG01.** Pass → Send MSG01 (gets New URN). Fail → show error in UI. Possible
errors: modulus check fails on account number; old bank doesn't support CASS; CoP check. A
technical reject returns **MSG11**.

**MSG02 from old bank** (three branches):
- **Accepts** → switch progresses; send redirect request **MSG04** + set up new payments.
- **Rejects** → switch terminated → trigger customer communication.
- **Sends warning** → **manual review of warning** (Ops): warning acceptable → continue; warning
  outside risk appetite → cancel.
- *Customer-facing UX **Update #1** at this point:* push + email — (i) accepts: confirm switch
  date; (ii) old bank updates date: confirm new date; (iii) rejects: *[for discussion]* provide
  reason code + suggest fixing before retry. Include next-step breakdown.

**Days 4–6.** Payments setup & **MSG04 sent**. *UX **Update #2**:* push + email — switch
proceeding, still expected to conclude on [switch date]; payments continue from old account until
then. **Note:** ideally don't expose the new payment arrangements in-app yet (avoids confusion over
where payments originate). Redirection & payments setup → no errors → **MSG05** (balance transfer
request) at Day 6. Validation error → MSG11.

**Day 7 completion.**
- No customer cancellation → Send MSG05 → Receive **MSG06** (acknowledge) → Send **MSG07** (switch
  completion).
- Customer cancels balance transfer → Send MSG05 **w/ zero closing balance** → Receive MSG06 w/
  zero closing balance → (manual) contact old bank: customer cancelled balance transfer.
- *UX **Update #3** (success moment):* push + email — switch completed, payments now originate from
  Wise Account; summary of balance & arrangements transferred; redirection active 36 months;
  support contact. *For discussion: what reconciliation do we build to check transferred funds
  match?*

**Cancellation / termination paths (inbound):**
- Wise-initiated terminate (reason codes **R317, R392** only per board): any cancellation reason →
  Send **MSG10** (terminate, any time) → no errors → switch terminated by scheme → **manual
  repatriation** activities + report. Validation error → MSG11. *UX:* push + email that Wise
  terminated; customer can contact us.
- Customer cancels (must be within **cooling-off**): (manual) contact old bank → *for discussion:
  do we skip MSG04 if customer cancels before we send it?* → Send MSG05 → Receive MSG06 w/ zero
  closing balance → Send MSG07 → **R319** → Send MSG10. Send switch-cancellation notification (all
  payments cancelled) → manual repatriation with old bank + report. *UX:* push + email that switch
  was cancelled at their request.

**Inbound parking lot:** DD created mid-switch (exception handling); linking & reconciliation
flows; alarming; which onboarding flow precedes showing the switch button; v2 dedicated tracker on
launchpad.

**Inbound action items:** review reconciliation approach for balance-transfer payments (look at
**AS015** as a starting point); ensure UI can issue **MSG10** (for Ops); decide whether to skip
MSG04 on early cancel; add CS ownership flows to the schematic; investigate persisting rejection
error codes through to **Ninjas** so CS can self-serve; build the warning-code list with follow-up
actions (acceptable vs not); risk-mitigation plan for missing/late messages or service downtime;
run a separate session on alarming, monitoring & reports. *(Struck through on board, i.e. resolved:
handling DDs created mid-switch; the balance-transfer-cancellation question to Pay.UK.)*

### Outbound Switch (Wise = Old Bank)

Customer doesn't initiate in-app — the **new bank sends MSG01**. Board covers full + partial.

**Full outbound.** Receive MSG01 → run validation checks → Respond **MSG02** (successful / with
warning code "if old bank proceeds" / unsuccessful with reject codes) → Receive **MSG05** (Day 6) →
calculate balance transfer, Send **MSG06** → *immediately* transfer funds to new bank (using
received account info + payment reference, Day 7) → close account & cancel all arrangements →
redirect any payments received for the closed sort code/account number.
- *UX (Day 1):* push + email confirming a switch request from [bank name]. Email content: if you
  didn't request this, contact us immediately; sorry to see you go (capture **why they're
  leaving**); switch date; **only current-account GBP balance transfers and the account closes —
  Jars, Interest, Stock balances stay as-is**; non-GBP balances are converted at standard rates the
  working day before switch; to include non-current-account balances they must move them themselves
  **before [switch date − 1 working day]**.
- **Disable account:** after MSG05, disable card spend via **card freeze** functionality. *UX: "We
  have frozen your card."*
- *For discussion (balance calc):* identify which balances are in-scope; convert at current rate;
  which service owns this (Balance service / Hold team?). On automation failure → **manual
  transfers**.
- *UX (Day 7):* email that switch is complete and account closed; they can still log in and re-open
  an account any time and use remaining accounts as normal.
- *For discussion (redirect):* do we already have a way to do this or build new? Likely need to
  persist the customer's new account details somewhere (question for Pay.UK?). Options: flag an
  alert when funds arrive for a switched account → Ops sends to new details; if CHAPS, return to
  sender and inform of new account.

**Full outbound — cancellation:** customer cancels (cooling-off) → receive notification from new
bank and/or customer → (manual) contact customer on how to handle balance when account closes →
Receive MSG05 → set balance transfer to zero, Send MSG06 → transfer funds per customer, close
account → manual repatriation with new bank (receive + process repatriation form). If customer
notifies us → notify new bank. *For discussion: best options? Can we auto-open a new GBP LAD on
their existing account and route balance there (temporary GBP LAD → if kept, send ADDACS;
roll back to original details when possible)?* *UX:* push + email that cancellation processed.

**Full outbound — termination:** new bank terminates → Receive **MSG10** → switch terminated → if
after arrangements cancelled and/or balance transfer → manual repatriation with new bank. *UX:*
push + email that we terminated per new provider's request.

**Partial outbound** (Wise = Old Bank): Receive MSG01 → validation (successful → Respond MSG02 →
Receive **MSG03** (cancel payment arrangements) → cancel arrangements; with warning → MSG02 +
warning code; unsuccessful → MSG02 + reject codes). Cancellation: customer cancels (cooling-off) →
notification from new bank/customer → if after arrangements cancelled → contact customer to work
through which payments to reinstate; if customer notifies us → notify old bank. Termination: new
bank terminates → Receive MSG10 → payment transfer terminated → manual repatriation if needed.
*UX:* push + email confirming a payment-transfer request from [bank name]; explains new provider
shares the arrangement list, we cancel those, and they'll be paid from the new provider.

**Outbound parking lot:** switch payout should appear in the switch dashboard; v1 restricts CASS
visibility to WPL customers (not UK-residents-only); how to reinstate DD mandates on cancellation;
current-account balance perimeter — move all currencies into Jars before switching?; how to handle
customers trying to re-activate old account details.

**Outbound action items:** if we close the current account, what's the mechanism/account structure
to keep Jars/Interest open (implications for arrangements in those domestic currencies) — **owner
Sid** [open Q: can we keep an account open if there's no main current account?]; initiate Hold-team
discussion on balance-conversion steps — **owner Rini**; add post-switch debit/credit flows —
**owner Sid** (Ops-triggered).

---

## Product Vision (PRFAQ)

Source: [CASS Product Vision](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4026651679)
(Sid Ram). PR + external/internal FAQs.

- **Full vs partial:** Wise offers **full switches** (~99% of market switches are full). Full =
  closure + balance transfer + all arrangements + 36-month redirection + CASS Guarantee.
- **New sort code/account number** issued by Wise (customer doesn't keep old details); old-account
  payments redirected 36 months.
- **Cost to Wise:** first onboarding free; failed first attempt costs £50k–70k. Per switch: £9.25
  +VAT (full or partial), split 50/50 old/new bank → ~£4.63 each; 50% discount for ~5 years or
  until 1,000 inbound switches in 3 consecutive months.
- **Incentive:** customers moving **3+ Direct Debits** get **2% cashback on DD spend, capped
  £50/year**, paid as **Wise Card statement credit** (drives card adoption + interchange). Chosen
  cutoff (3 DDs/month ≈ 36/yr) is hard to game; £50 buffers the median 12-month LTV of a 3+ DD
  customer (£62.68). 2% (not 3.75%) so the median customer exhausts the cap ~month 12.
- **Business case** (WIP — incremental-account and NPV figures still blank): base case assumes
  100k market switches/month, 8% Wise share = 8,000 switch-ins/month; LTV £62.68; CASS cost
  £4.63/acc; incentive £50/acc.
- Key external-FAQ rules: free to customer; switch date ≥7 working days out, not weekend/bank
  holiday; can switch with negative balance (account opens at zero, old liability stays with you);
  must complete KYC before switch initiates; no joint accounts; no savings/ISAs; card-based
  subscriptions NOT switched; 14-day cooling-off; CASS Guarantee covers errors/charges/interest.

---

## How CASS works (the mechanics)

Sources: [CASS overview](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/3935113784)
(Mattias Lõiv), [RFC Draft](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4087463159)
(Rini Jain), [Technical Scoping](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4028923905)
(Sid Ram).

**Three actors**, all communication via a central hub (banks never talk directly): **New Bank**,
**Old Bank**, **Central switching service** (Pay.UK). Messages are **ISO 20022 XML** files
exchanged via **PSW (Payment Services Website)**. Wise's sort code: **231470**.

### The 7-day full-switch timeline
| Day | Msg | New Bank (inbound) | Old Bank (outbound) |
| --- | --- | --- | --- |
| Before 1 | — | Customer signs Switch Agreement + Closure Instruction | — |
| 1 | **MSG01** | Generate + send Information Request; new account must be active | Receive + validate; verify account parties (3-of-4 match) |
| 2 | **MSG02** | Receive + validate Information Response | Send by 23:30: all live DDIs, SOs, bill payments — or reject (must list *all* reasons) |
| 3 | — | Bacs copies AUDDIS DDIs | — |
| 4 | **MSG04** | Send Request Redirection; ADDACS reason code 3 for AUDDIS DDIs | — |
| 5 | — | Set up SOs, bill payments, future-dated payments | — |
| 6 | **MSG05** | Send Request Balance Transfer (12:00–23:30); set up non-AUDDIS DDIs | — |
| 7 | **MSG06** | Receive Acknowledge Balance Transfer | Disable account, calc closing balance, send MSG06 (06:00–07:00 or 09:00–11:00); transfer balance via FPS/CHAPS; cancel arrangements; close account |
| 7 | **MSG07** | Send Notify Switch Complete after balance confirmed | — |
| 8+ | — | Arrangements active; central redirection begins (36 months) | — |
| Post | **MSG08/09** | Respond to post-closure debit requests (Pay/No-Pay) | Send Request Payment for post-closure debits |

**Partial switch (Payment Transfer Service):** moves only selected arrangements; old account stays
open; no 7-day guarantee, no balance transfer, no closure, no redirection. **MSG03** cancels
specific arrangements (timing: 2 working days for SOs, 1 for DDIs). Old Bank records complete after
3 months if no MSG07. Wise **must** support partial switch-*out*; *may* choose to support partial
switch-*in* (open design question). At other banks, partial is often a paper form, not self-serve.

### Key product/operational rules (from Pay.UK meetings)
- Switch date: customer chooses, ≤1 month out, weekdays only, ≥7 working days ahead. Don't trigger
  MSG01 earlier than 7 days before switch date. Can set cutoffs (e.g. no initiation after 16:00 for
  next day).
- The 7-day clock starts only when the **new Wise account is open + active** and MSG01 is sent.
- **Keep customers constantly updated** — most CASS complaints stem from status confusion. Min:
  notify start + completion.
- **Hide FDPs/SOPs** from customer profile until MSG07 processed (payments may still leave old
  account until then).
- **#1 failure: wrong/missing card number** → old bank rejects.
- Set **funding limit = 0** on MSG01–MSG05 (handle overdrafts via separate CHAPS/SEPA cover).
- Can't stop a customer switching *away* even with negative balance.
- **No joint accounts; no savings/ISAs**; for outbound, Wise Assets/Interest stay (convert to cash
  before switch date to move them). Currency accounts: likely keep open.
- Business: SMEs only (turnover ≤£6.5M, <50 employees); also small charities (income <£6.5M); New
  Bank checks + may reject.
- Card-based payments/subscriptions NOT switched; card updater scheme out of scope.
- **AWACS** — used by receiving bank of Bacs credits to notify senders of new details; must
  accommodate for Bacs credits.

### Onboarding & operating model
Source: [CASS Discovery](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/3963620767).
- Eligibility to *offer* CASS: must provide a sterling current account to consumers / SMEs (≤£6.5M,
  <50 staff) / small charities (<£6.5M income).
- 9-week testing period; ~32 weeks total from initiation to end of testing. Withdraw before
  **Jul 2026** (Q4 slot) or **Oct 2026** (Q1-27 slot) to avoid losing the free onboarding.
- **PKI sponsor: NatWest (RBS)** — provides CASS SUN + testing SUN + live & testing smartcards.
  Request testing SUN/cards first, then live. Sort codes auto-set as full+partial in EISCD a day
  after registration. Each bank code = one SUN; full licence can't be downgraded, partial can be
  upgraded; per-sort-code account switch flag controls participation + full/partial.
- Input/output model: **manual file upload/download to PSW** (same as Bacs today). STS/ETS
  automation has ~12-month lead time — **not** in launch scope.
- Assurance: 11-question statement signed by Internal Audit at onboarding, then yearly.

---

## Backend architecture (engineering-owned — design context)

Sources: [RFC Draft](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4087463159) (Rini
Jain), [CASS backend service](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4058306647)
(Olavi Ojamaa).

`cass-service` is a **state-machine orchestration platform** between the customer UI, the internal
ledger, and PSW. Clean split: region-agnostic `core/` + UK-specific `uk/` (Adapter pattern — ISO
20022 XML parsing lives entirely in `uk/`; core knows nothing about file formats). Inbound and
outbound each have their own state flow.

- **Task–Report–Item hierarchy:** a Task = time-critical Ops action (e.g. "Evening Batch Upload"),
  linked to a Report (e.g. MSG01), containing Items (one per customer switch).
- **State machine** (RFC recommends event-driven to reduce state count). Customer-facing states
  map to the 5 progress milestones above; internal states are far more granular (INITIATED →
  VALIDATED → SCHEDULED → INFORMATION_EXCHANGE → ARRANGEMENTS_SETUP → BALANCE_TRANSFER → COMPLETE →
  REDIRECTION_ACTIVE → FINALIZED, plus TERMINATED/CANCELLED/MANUAL_REVIEW/MANUAL_INTERVENTION).
- **Scheduled state:** a future-dated switch waits in SCHEDULED until `workflow_start_date`
  (= 6 working days before switch date), then activates.
- **Validation:** inbound = UK Modulus check (`tw-bank-utils`) + EISCD lookup (`bank-details-service`,
  ticket UK-5682); outbound = "fuzzy" 3-of-4 match on name/address against Wise records.
- **Day 7:** account moves to **frozen** to calc final balance; if negative, auto FPS/CHAPS to Old
  Bank before **14:00**.
- **Standing Orders caveat:** Wise's system doesn't yet support SOs as a product — backend parses +
  stores SO data from MSG02 into a holding store, full implementation later.
- **Retention:** all XML + digital signatures stored **7 years** (non-repudiation; enables AS001
  case-history report). Key tables: `cass_switch` (PK = 23-char URN), `cass_item`,
  `cass_message_audit`, `tw_task`.
- JIRA epics: UK-5634 (service setup), UK-5635 (DB/file processing), UK-5636 (ops dashboard),
  UK-5638 (cross-service integration). RFC status: **Draft**.

### Information Request flow detail (Day 1)
Source: [Information Request Flow Requirements](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4100302790)
(Rini Jain). Prereqs: KYC complete + Wise account (sort code + number) allocated. Inbound:
customer initiates → immediate validation → SCHEDULED → hourly jobs (09:00–16:00) move ready
switches to PENDING_BATCH → 16:00 single MSG01 batch generated → Ops upload to PSW before deadline
(four-eye) → optionally validate via **AS002** next morning (08:00). Outbound: one MSG01 file may
contain many switches (e.g. 50 leaving Wise); each validated independently → build MSG02.
**AS002 monitoring** runs daily 09:00: flags Wise late sending MSG02 (CRITICAL, `#cass-critical`)
and old banks late sending MSG02 (HIGH, `#cass-ops`; escalate >3 days overdue).

---

## CASS messages & codes (reference)

Source: [Draft CASS MESSAGE Requirements](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4087517876)
(Rini Jain). ISO 20022 data elements per message; full field lists on the page.

| Msg | Name | Direction | Notes |
| --- | --- | --- | --- |
| MSG01 | Information Request | New → Old | Starts switch (full + PTS). Carries new/old account, account party, org, last-5-PAN |
| MSG02 | Information Response | Old → New | Accept/reject + DDIs, credit payment arrangements, schedules |
| MSG03 | Cancel Payment Arrangements | New → Old | PTS only; cancels specific arrangements |
| MSG04 | Request Redirection | New → Central | Full switch only; sets up 36-month redirection |
| MSG05 | Request Balance Transfer | New → Old | Full switch only |
| MSG06 | Acknowledge Balance Transfer | Old → New | Full only; omits Transfer Payment if balance zero / negative-with-zero-limit |
| MSG07 | Notify Switch Complete | New → Central | Full (and optionally PTS) |
| MSG08 | Request Payment | Old → New | Post-switch; reasons: SD/SX/RP/CC/AD |
| MSG09 | Pay/No-Pay Response | New → Old | Values: IPAY, NREC, DREQ, IFUN, NFOL, FTRA, ABLO, ACLO |
| MSG10 | Terminate Switch | New → Central | Any time after MSG01 while redirection active; status "TERM" |
| MSG11 | Technical Rejection | Central → sender | Validation failure; reason in response code |

**Rejection/warning code families** (used directly in error-state UX copy):
- **R-codes** (old bank rejections): e.g. R300/R301/R302 account mismatch; R305 DOB; R321/R322/R323
  name; R334/R335 debit card / PAN mismatch. (R317 fraud flag, R320 already-switching are
  referenced in the UX spec.)
- **T-codes** (central service technical): e.g. T101 invalid URN, T118 duplicate URN, T121 balance
  transfer too early, T201/T207 invalid sort code.
- **W-codes** (warnings): **W401 = switch date postponed one working day** (bank holiday — system
  auto-shifts switch_date), W403 missing second name, W411 future DOB, etc.

---

## Operations (Samurai) — context for customer-facing design

Source: [CASS Operational flow (WIP)](https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4063232002)
(Mattias Lõiv). Decision: **Ops UI built in Samurai** for both file processing and case
monitoring. Initially **manual** file generation + PSW upload (STS/ETS deferred, 12-month lead).
Ops works in TLN time; GBP payment ops 08:00–20:00 TLN. Daily blocks (morning ~09:00 /
day ~14:00 / evening; or a two-block alt) move files between Wise internal service and PSW.
Per-message who-sends/who-monitors table and edge-case handling (terminate switch / MSG10,
pay-no-pay MSG08-09, pending credit on closed account, partial-switch flow questions) live on the
page. Four-eye approval required on every PSW upload; **MSG02 deadline 23:30 Day 2**;
**balance transfer FPS/CHAPS by 14:00 Day 7**. Daily reports: **AS002** (outstanding work),
**AS015** (redirection extract — manual forwarding of CHAPS/international hits to closed accounts),
**AS003** (technical rejections), **AS001** (case history on request).

---

## Competitive / design references

Source: [CASS FigJam board](https://www.figma.com/board/lncyZUjjTta1n7YZCIcTGu/CASS?node-id=0-1) —
annotated **Monzo** and **Revolut** switch-flow screenshots. Sid Ram's takeaways:
- Make the **CASS Guarantee prominent** (mandatory to show during the journey; strong money-
  protection social proof).
- Lead with **ease**; show key points up front.
- **CoP checks with green ticks** are reassuring; show bank badge immediately after sort-code entry.
- **Clearly state what can and can't be switched.**
- Good summary screen before submit; add switch date + tips on what *not* to do near switch date.
- Revolut dropped its payment-switching service between Apr and May 2026.

**Incentive benchmarks:** Nationwide £175 (2+ DDs), Lloyds £200 (3+ DDs), NatWest £175, TSB
£160–310, Barclays/HSBC nothing. Wise's £50 is the highest from a branchless provider.

---

## Source documents (catalogue)

| Doc | Owner | Link |
| --- | --- | --- |
| Product Design Brief (mine) | Benhur Senabathi | https://transferwise.atlassian.net/wiki/spaces/~71202064fef706ff0e4df084812a1cb6dbd965/pages/4135545143 |
| UX Product Spec | Matías Lumainsky | https://transferwise.atlassian.net/wiki/spaces/~7120201ff0ec5f6faa4eeeae00180eaaaba38c/pages/4128559162 |
| Product Vision (PRFAQ) | Sid Ram | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4026651679 |
| RFC Draft (technical) | Rini Jain | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4087463159 |
| CASS backend service | Olavi Ojamaa | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4058306647 |
| Information Request Flow Requirements | Rini Jain | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4100302790 |
| CASS MESSAGE Requirements | Rini Jain | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4087517876 |
| Technical Scoping | Sid Ram | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4028923905 |
| Operational Flow (WIP) | Mattias Lõiv | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4063232002 |
| CASS overview / project | Mattias Lõiv | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/3935113784 |
| CASS Discovery | Mattias Lõiv | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/3963620767 |
| Workshop #1 — User Flow & Edge Cases | Sid Ram | https://transferwise.atlassian.net/wiki/spaces/GBP/pages/4114163062 |
| ↳ Inbound switch whiteboard | — | page `4114103320` · local: `docs/Inbound Switch Flow.pdf` |
| ↳ Outbound switch whiteboard | — | page `4114522798` · local: `docs/Outbound Switch Flow.pdf` |
| Figma board (competitive teardown) | Sid Ram | https://www.figma.com/board/lncyZUjjTta1n7YZCIcTGu/CASS |

> Note: the two Workshop whiteboards are Confluence *whiteboard* objects (not API-fetchable
> pages). They're exported to `docs/` and synthesised in the
> [Workshop #1 section](#workshop-1--user-flow--edge-cases-whiteboards) above.

External: [CASS participants list](https://www.currentaccountswitch.co.uk/banks-building-societies/) ·
[Pay.UK switch data](https://www.wearepay.uk/what-we-do/switching-services/current-account-switch-service/) ·
contact `CASS@wearepay.uk`.

## Glossary

- **MSG01–MSG11 / AS001–AS015** — ISO 20022 switch messages / Pay.UK reports (see tables above).
- **AUDDIS** — automated DD instruction service; **ADDACS** — Bacs advice service (reason code 3 =
  account switched); **AWACS** — advises Bacs-credit senders of new account details.
- **DDI** Direct Debit Instruction · **SO/SOP** Standing Order (Payment) · **FDP** Future-Dated
  Payment · **CPA** Credit Payment Arrangement.
- **EISCD** — Extended Industry Sort Code Directory (is a sort code CASS-enabled?). **Modulus check**
  — account-number validation algorithm. **CoP** — Confirmation of Payee.
- **PSW** — Payment Services Website (Pay.UK file-exchange portal). **PKI / SUN / smartcard** —
  auth to upload to PSW; sponsored by NatWest. **Four-eye** — second Ops approver on every upload.
- **STS/ETS** — automated PSW file channels (~12-month lead; deferred). **URN** — 23-char Unique
  Reference Number. **PTS** — Payment Transfer Service (= partial switch). **TLN** — Tallinn time.
- **3-of-4 match** — outbound identity verification: first initial, family name, DOB, address.

---

# Prototype environment (Base Surfaces)

This repo is a copy of Wise's **Base Surfaces** prototyping template (`wise-world`), used to build
the CASS customer-facing prototype. The Vite + React mobile app lives at
`base-surfaces-mobile/mobile/`. Remotes: `origin` →
`github.com/benhur-senabathi/wise-world`, `upstream` → `github.com/transferwise/base-surfaces`.

## Content & Writing

When asked to write, review, or come up with content — UI copy, translations, button labels, error
messages, snackbar text, modal copy, page descriptions, or any user-facing text — **read the
writing guidelines first**:

1. Start with `shared-resources/content/writing-guidelines.md` — the master guide covering tone,
   grammar, vocabulary, and all component rules.
2. For component-specific copy, also read the matching file in `shared-resources/content/components/`
   (e.g. `buttons.md` for button labels, `snackbars.md` for confirmation messages, `info-prompts.md`
   for error/warning/success text).
3. For vocabulary questions, check `shared-resources/content/vocabulary.md` for Wise-specific
   terminology and words to avoid.

All content must follow Wise's tone of voice (concise, modern, energetic) and use British English
spelling.

## Universal Rules

1. **Verify Neptune components via MCP.** Before using any `@transferwise/components` component,
   call `list-all-documentation` then `get-documentation` from the Wise Design System MCP. Never
   guess props.
2. **shared-resources is the single source of truth** for data, account logic, and cross-platform
   design system docs.
3. **Import data via `@shared/data/`** (Vite alias). Only `src/data/nav.tsx` stays per-project.
4. **There are 2 projects**: `base-surfaces-web` (port 3002) and `base-surfaces-mobile` (port 3017).

## On First Message

Before doing anything else, check that the following MCP servers are available. If any are missing,
tell the user which ones are missing and offer to help install them:

1. **Figma MCP** — required for reading Figma designs. Look for `figma` in the MCP server list.
2. **GitHub MCP** — required for pushing code, creating branches, and managing repos. Look for
   `github` in the MCP server list.
3. **Wise Design System (Storybook) MCP** — required for accessing Neptune component docs and props.
   Should be auto-configured via `.mcp.json` in this repo. If missing, install with:
   ```
   claude mcp add --transport http --client-id cdf3737dff9d485485968e50b63fd8b4 wise-design-system https://storybook.wise.design/mcp --scope project
   ```

## Project context docs

- `docs/` — Workshop whiteboards (`Inbound Switch Flow.pdf`, `Outbound Switch Flow.pdf`).
- `meeting notes/` — CASS UX workshop notes.
