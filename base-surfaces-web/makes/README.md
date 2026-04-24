<img width="80" height="80" alt="Icon" src="https://github.com/user-attachments/assets/9f43052e-cb33-4061-a1c6-8c718f79e684" />

# Web Make Builds

Figma Make builds of the Base Surfaces Web prototype. Open `.make` files in [Figma](https://www.figma.com) to run the interactive prototype.

**Figma project:** [Base Surfaces — Make Builds](https://www.figma.com/files/826948582432925732/project/579451617?fuid=1009076293124464990)

## Versions

| Version | Date | Download |
|---------|------|----------|
| V1.02 | 2026-04-21 | [Web V1.02.make](Web%20V1.02.make) |
| V1.01 | 2026-04-01 | [Web V1.01.make](Web%20V1.01.make) |
| V1.0 | 2026-03-30 | [Web V1.0.make](Web%20V1.0.make) |

<details>
<summary><strong>V1.02</strong> — Fresh exchange rates</summary>

• Fresh exchange rates from Wise API

</details>

<details>
<summary><strong>V1.01</strong> — Gallery lazy loading and performance optimisations</summary>

• Lazy-loaded gallery iframes via IntersectionObserver — only mount when scrolled near
• Collapsed flow steps skip iframe mounting entirely until expanded
• Batched observer updates via requestAnimationFrame
• Toolbar fade on scroll with Ctrl+H scroll-to-top
• Full-width shadow on toolbar reveal
• Active flow screen tracking in gallery (shows correct label + step)
• Icon fix: compact segmented control icons render at size 16

</details>

<details>
<summary><strong>V1.0</strong> — Initial build with bug fixes</summary>

- Full web prototype: Home, Cards, Transactions, Payments, Recipients, Insights, Account
- Consumer and business account types with current accounts, jars, and group accounts
- Send, Request, Convert, Add Money, Payment Link flows
- Transfer calculator with live rate chart and same-currency filtering
- Account details with multi-currency support
- Shimmer loading states
- i18n (English + Spanish)
- Dark mode support

**Bug fixes:**
• Fixed Taxes GBP routing to navigate directly from Home
• Fixed Transfer Calculator same-currency filtering
• Fixed Learn More button styling
• Fixed account details navigation from Home
• Fixed Send flow currency selection from Transfer Calculator

</details>
