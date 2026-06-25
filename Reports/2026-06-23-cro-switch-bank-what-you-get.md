# Design CRO Analysis: /switch-bank intro — "What you get" section

> Date: 2026-06-23 · Author: Benhur (with Claude) · Method: `/design-cro`
> Figma: [United Kingdom — node 2171-3073](https://www.figma.com/design/UoRi8hQfXS2arz7nFAy0WG/United-Kingdom?node-id=2171-3073)

**Primary metric**: Switch-flow initiation rate (intro → "Switch to Wise" tap → first data-entry step).
Secondary: net switch ratio (PRFAQ targets 5,280–11,600 switch-ins/mo against a ~50% switch-out rate).

**Current baseline**: Not provided — CASS is pre-launch (go-live Feb 2027). All findings are
**directional**, grounded in analogous internal research, not this flow's own funnel data.

**Journey context**: Step 1 (Intro) of the inbound full switch — highest-funnel, lowest-commitment
screen. The only conversion action is the sticky "Switch to Wise" CTA. After it:
old bank details → identity → switch date → consent → confirmation.

---

## Design observations

The intro now stacks four persuasion blocks above the CTA:
1. **"Switch to Wise in 7 days"** hero + CASS Guarantee badge (speed + safety)
2. **"What happens"** — balance / direct debits / redirect payments (mechanics)
3. **"Get 2% cashback"** promo + cashback info (extrinsic incentive)
4. **"One GBP account" flag card + "What you get"** — Jars, multi-currency, interest (intrinsic value)

The designer's instinct — pre-empt *"why move to Wise when my bank already does pots?"* — is the
right question. Blocks 1–3 explain **how switching works** plus a **bribe**; nothing explained
**why Wise is a better daily account** until block 4. That "why" is the actual switching decision.

---

## Research insights (each links to source)

- **Interest is the single most appealing account feature in qualitative research.** US prospect
  sessions found "interest being the most appealing aspect of the account." The "Earn interest on
  your everyday money" line maps to the strongest pull factor we have evidence for.
  → [US Personal Customer Deep-Dive](https://transferwise.atlassian.net/wiki/spaces/Disco/pages/3594335551/US+Personal+Customer-Deep+Dive)

- **Wise frames the account as a *current-account alternative*, and the winning frame is "everyday
  money grows."** The ISA CVP hammers "Forget the noise of traditional banks that offer close to
  zero interest" / "everyday money grows while remaining protected." Exactly this narrative.
  → [Customer Value Proposition (Investments)](https://transferwise.atlassian.net/wiki/spaces/Investment/pages/4060476217/Customer+Value+Proposition)

- **"All-in-one, don't juggle apps" is a validated convenience frame.** "Customers no longer need
  to juggle different apps for everyday spending, transfers, and investing." The "one GBP account
  that does it all" card rides this. → [same CVP page]

- **Jars boost holdings + engagement, but adoption is low and it's a discoverability/comprehension
  problem, not a desire problem.** Account Structure Phase 1: +12.5% customers using jars, +0.75%
  holding >£50, yet jar adoption still only 3.4%. Surfacing jars earlier is a proven lever.
  → [Account Structure non-EDA impact](https://transferwise.atlassian.net/wiki/spaces/IAS/pages/3995862689/Consumer+Account+Structure+non-EDA+impact+analysis)

- **"Jars" is NOT a self-evident concept — lead with the benefit, treat "Jars" as the label.**
  "Jars are not an immediately understood concept… customers were interested in separating a bit
  of money, whether or not this was a jar was not important."
  → [MVP segment & jars experience](https://transferwise.atlassian.net/wiki/spaces/Assets/pages/1760962114/Research+Plan+MVP+segment+and+jars+experience+Q1+2021)

- **Comprehension is the documented #1 reason customers don't convert** — "~16% could not
  understand how to use the product… ~40% claim they don't need it right now / aren't convinced the
  product is good enough." A "why Wise is better" block attacks the unconvinced 40%.
  → [Consumer onboarding in 2026](https://transferwise.atlassian.net/wiki/spaces/C20/pages/3923611480/Consumer+onboarding+in+2026)

- **Current-account customers convert slower but carry higher LTV — so a longer, value-heavy intro
  is acceptable.** "May take longer to switch and get set up… but still have higher long-term LTV."
  Validates *adding* persuasion content here rather than stripping to a single CTA.
  → [Current Account Onboarding Testing & KPIs](https://transferwise.atlassian.net/wiki/spaces/IAS/pages/4019397355/Current+Account+Onboarding+Testing+KPIs+Launch+Scope)

- **The official UK proof points already exist** — multi-currency interest, multiple account
  details, 3× currency direct debits, "earn while you spend." Pull copy from these canonical lists.
  → [Logged Out Brief Phase 2](https://transferwise.atlassian.net/wiki/spaces/IAS/pages/4012380128/Logged+Out+Brief+Phase+2)
  · [UK messaging house](https://transferwise.atlassian.net/wiki/spaces/PMM/pages/1561373388/2021+03+Wise+account+positioning+messaging)

---

## Verdict on the hypothesis

**Yes — highlighting one GBP account with jars + multi-currency + interest is the right call, and
it's better-evidenced than the cashback bribe above it.** Research consistently shows (a) interest
is the top appeal, (b) "everyday money grows / one account, don't juggle apps" is Wise's validated
winning frame, and (c) the real conversion blocker is "not convinced it's better," not "didn't get
a reward." This answers the actual objection a pot-having Monzo/Barclays customer raises.

Two refinements the research demands:
1. **Lead each line with the benefit, not the Wise jargon.** "Organise your savings…" out-comprehends
   "Jars" as a hook.
2. **Watch ordering.** Cashback (extrinsic) currently sits *above* the product value (intrinsic).
   Intrinsic value converts the unconvinced 40%; the bribe converts people already on the fence.

---

## Ranked ideas (ICE)

| # | Idea | Hypothesis | ICE | Confidence basis |
|---|------|-----------|-----|------------------|
| 1 | Keep & sharpen "What you get": benefit-led copy — interest + Jars + (optional) multi-currency, pulled from UK messaging house | H1 | **8.0** | Research (interest = top appeal; CVP frame) |
| 2 | Lead the Jars line with the benefit, demote "Jars" to the label | H2 | **7.7** | Research (jars comprehension) |
| 3 | Reorder: product value ("why Wise is better") above the cashback block | H3 | 6.7 | Research (unconvinced 40% > incentive) — directional |
| 4 | Animated flag on "One GBP account" card as the visual anchor (built) | H4 | 6.3 | Heuristic + design intent |
| 5 | Add a "vs your bank" micro-frame — "Most banks pay you nothing on your everyday balance" | H5 | 5.5 | Research (CVP "banks offer close to zero") — directional; copy/legal risk |

---

## Top 3 recommendations (detail)

**1. Keep the "What you get" section — make it benefit-led and give interest prominence.**
- *Change*: Items, research-optimal order: Earn interest on your everyday money → Spend in 40+
  currencies, one account → Organise your savings into Jars. (Design currently ships Jars first,
  interest second — fine; revisit if testing shows interest should lead.)
- *Why*: answers "why switch from a bank that does pots" with the one feature research says beats
  everything, plus the validated "one account, don't juggle" frame.
- *Measure*: scroll-depth to section, initiation rate, and (post-launch) 90-day holdings / jar
  adoption of the switched cohort.
- *Risk*: low. Keep interest qualitative — no rate % unless Content/Legal sign off (FCA).

**2. Lead the Jars line with the benefit, not the brand term.**
- *Change*: "Organise your savings into Jars" (✓ shipped) — keep the benefit verb first.
- *Why*: five years of research says "Jars" alone doesn't land; the separation benefit does.
- *Measure*: comprehension in the Spain/UK prototype-testing track.

**3. Consider moving the intrinsic value block above cashback.**
- *Change*: order → What happens → What you get (value) → Cashback → Guarantee/CTA.
- *Why*: the unconvinced 40% convert on "genuinely better account," not a £50 bribe.
- *Risk*: cashback is a strong scannable hook — A/B this once live, don't default-ship.

---

## Gaps & caveats

- **No funnel data** — pre-launch. Everything is directional, grounded in analogous research.
- **Interest-rate claims carry FCA/legal risk** — keep interest messaging qualitative on this screen
  unless Content/Legal sign off a figure. (The shipped subtitle "x.xx% interest rates" is placeholder
  copy and must be finalised with Legal before launch.)
- **Jar adoption is genuinely low (3.4%)** — surfacing it is a lever; don't over-index. Interest and
  multi-currency are stronger leads.
- **Searches that returned little**: no CASS-specific switching-motivation *survey* exists internally
  yet (the Market Report is WIP). The strongest "why switch" evidence is borrowed from US/account-
  positioning research → UK-specific validation is an open gap worth a usertest.
