# iOS Mobile Context

This prototype imitates the native Wise iOS app experience inside a mobile web viewport (393x852, iPhone 17 Pro). When the viewport is wider than 393px, a device frame wraps the app in an iPhone shell with a rendered status bar.

## Goals

- Match the Wise iOS app's navigation, layout, and interaction patterns as closely as possible using React + CSS
- Use Apple's iOS 26 "Liquid Glass" design language for navigation chrome (top bar buttons, tab bar)
- Keep all page content built with Neptune Design System components — only the navigation shell is custom iOS-style
- Support light and dark mode with correct glass, fade, and scrim treatments

## Mobile Detection

- `isAppMode()` returns `true` when the URL has `?mode=app` (inside the device frame iframe) or the viewport is <= 393px
- Components use this to detect app mode for layout adjustments

## Navigation Model

iOS uses a flat tab bar (Home, Cards, Recipients, Payments) with drill-down push navigation — no sidebar. The top bar changes contextually per page:

| Page | Leading | Trailing | Scroll title |
|------|---------|----------|-------------|
| Home | Avatar | Earn pill (accent) + Eye circle | "Total balance" on scroll |
| Cards | Travel hub pill | Order a card pill (accent) | "Cards" on scroll |
| Recipients | Back circle | Invite pill | "Recipients" on scroll |
| Payments | Back circle | — | "Payments" on scroll |
| Transactions | Back circle | BarChart circle | "Transactions" on scroll |
| Account | Back circle | Open an account pill | — |
| Currency/Account detail | Back circle | More circle | Centered heading + subtitle |

## Dark Mode Strategy

Neptune tokens handle most dark mode automatically via theme classes (`np-theme-personal--dark`, `np-theme-dark`, `np-theme-business--dark`). Custom iOS elements use hardcoded rgba values because glass/frosted effects don't exist in the Neptune token system.

### Tokens used in iOS elements

| Token | Usage |
|-------|-------|
| `--color-interactive-accent` | Accent pill background (green) |
| `--color-interactive-control` | Text/icon color on accent pills (dark green in dark mode) |
| `--color-content-primary` | Scroll title text, center heading |
| `--color-content-secondary` | Center subtitle |
| `--color-background-screen` | Solid header backgrounds (e.g., Transactions fixed header) |
| `--color-background-overlay` | Bottom sheet scrim in dark mode |
| `--color-border-neutral` | Dividers |

### Custom glass values (not tokenized)

**Light mode:**
| Value | Usage |
|-------|-------|
| `rgba(255, 255, 255, 0.65)` | Circle + pill button background |
| `rgba(255, 255, 255, 0.85)` | Tab bar active highlight (glass phase) |
| `rgba(255, 255, 255, 0.8)` | Tab bar background |
| `rgba(220, 220, 220, 0.25)` | Base glass button background |
| `rgba(0, 0, 0, 0.06)` | Tab bar inactive highlight |
| `rgba(0, 0, 0, 0.4)` | Bottom sheet scrim |

**Dark mode:**
| Value | Usage |
|-------|-------|
| `rgba(255, 255, 255, 0.12)` | Circle + pill button background |
| `rgba(255, 255, 255, 0.15)` | Tab bar active highlight (glass phase) |
| `rgba(80, 80, 80, 0.3)` | Base glass button background |
| `rgba(40, 40, 40, 0.75)` | Tab bar background |
| `rgba(255, 255, 255, 0.1)` | Tab bar inactive highlight |

### Dark mode selectors

Use `html[class*="dark"]` for broad dark mode targeting. For theme-specific overrides, use the full selectors:
```css
html.np-theme-personal--dark .my-element,
html.np-theme-dark .my-element,
html.np-theme-business--dark .my-element { ... }
```

## Top Bar Fade

The iOS top bar has a gradient fade that dims content scrolling behind it. It uses two pseudo-elements on `.ios-top-bar__fade`:
- `::before` — color gradient (white-to-transparent in light, black-to-transparent in dark)
- `::after` — blur layer with mask fade

For pages that need a solid header (e.g., Transactions with fixed search), override both pseudo-elements:
```css
.column-layout-main:has(.my-page) .ios-top-bar__fade { background: var(--color-background-screen); mask-image: none; }
.column-layout-main:has(.my-page) .ios-top-bar__fade::before { background: var(--color-background-screen); }
.column-layout-main:has(.my-page) .ios-top-bar__fade::after { display: none; }
```

## Full-Bleed Scroll Pattern

To make a horizontal scroll container break out of the 16px page padding:
```css
.my-scroll-container {
  overflow-x: auto;
  margin: 0 -16px;
  padding: 0 16px;
  scrollbar-width: none;
}
```

The key rules:
- `overflow-x: auto`, `margin: 0 -16px`, and `padding` must all be on the **same element**
- Do NOT use the class name `.carousel` — it conflicts with `@transferwise/components` built-in carousel styles
- Use `::after` pseudo-element for right scroll padding on flex containers (padding-right doesn't work reliably)

## Device Frame

When the viewport exceeds iPhone width, `DeviceFrame` renders:
- An iPhone 17 Pro frame image overlay
- A `StatusBar` component showing real time, cellular, wifi, and battery icons
- The app content in an iframe at `?mode=app`
- Status bar adapts to dark mode (white text + inverted icons)

The frame scales to fit the browser viewport height with 48px top/bottom padding.
