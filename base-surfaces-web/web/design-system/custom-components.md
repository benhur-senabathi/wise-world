# Custom Components

Experimental and iterative components built on top of the Wise Neptune Design System.
These are not part of the core design system — they are prototypes for iteration.

---

## Account Card (Multi-Currency Account)

### Description
Displays a user's multi-currency account overview including stacked card visuals, account summary, currency balances, and an account details action. Supports automatic stacking when currency amounts are too long for the 2-column layout.

### Structure
- **Card Stack** — Overlapping card images (physical/digital) with count label and Wise badge
- **Account Header** — Title ("Current account"), balance summary ("£9.95 · 7 currencies"), navigation chevron
- **Balance Grid** — 2-column grid of currency flag + formatted balance, each with navigation chevron
- **Footer** — "Account details" button (small, secondary-neutral) with bank icon

### Data

| Field | Type | Description |
|-------|------|-------------|
| title | `string` | Account name (e.g. "Current account") |
| totalAmount | `string` | Formatted total balance (e.g. "£9.95") |
| currencyCount | `number` | Number of currencies held |
| balances | `{ code: string, amount: string }[]` | Per-currency balances (`code` = ISO country code for flag) |
| hasCards | `boolean` | Whether to show card stack (default `true`) |
| cardCount | `number` | Number of cards to display in label (default `2`) |
| hideAccountDetails | `boolean` | Hide the footer button (default `false`) |
| businessCardStyle | `boolean` | Use dark green gradient card (default `false`) |
| cardInfoLight | `boolean` | Light text on card info overlay (default `false`) |

### Balance Stacking Behavior

The balance grid defaults to a **2-column layout**. When currency amounts are too long to fit comfortably in 2 columns, the component automatically switches to a **single-column stacked layout** showing a maximum of 3 currencies (hiding the 4th).

**Detection**: Uses canvas text measurement (`getMaxAmountWidth`) to calculate the rendered width of each amount string in `Inter 16px`. If any amount exceeds **85px** (the available body width in a 2-column cell), stacking is triggered.

**Threshold calculation**: Card is 346px → each column ~173px → ListItem padding (16px) + media (24px + 12px gap) + control (24px + 12px gap) = body gets ~85px.

| Layout | Condition | Max currencies shown |
|--------|-----------|---------------------|
| 2-column grid | All amounts ≤ 85px rendered width | All (typically 4) |
| 1-column stacked | Any amount > 85px rendered width | 3 (4th hidden) |

### Design System Components Used
- `ListItem` + `ListItem.AvatarView` + `ListItem.Navigation` — Balance rows and account header
- `AvatarLayout` (orientation="diagonal") — GBP row with Rewards icon overlay when `hasStocks` is true
- `Flag` (`@wise/art`) — Currency flag icons (24px circular)
- `Button v2` (size="sm", priority="secondary-neutral") — Account details action
- `Bank`, `ChevronRight`, `Rewards` (`@transferwise/icons`) — Icons

### CSS Classes
- `.mca` — Outer container (width: 346px, border-radius: 26px, padding: 8px)
- `.mca-cards__stack` — Relative container for overlapping card images (24% padding-bottom)
- `.mca-cards__fire` / `.mca-cards__green` — Back/front card images with hover animation
- `.mca-cards__info` — Flex row with "N cards" link and Wise badge
- `.mca-front` — Front panel with cutout arch SVG and content
- `.mca-balances` — 2-column grid for currency balance list (margin: 0 -8px)
- `.mca-balances--stacked` — Single-column override (grid-template-columns: 1fr)
- `.mca-footer` — Footer with action button (padding: 12px 0 0)

### Card Image URLs
- Green card: `https://wise.com/public-resources/assets/launchpad/mca/card/personal_green.jpg`
- Fire card: local asset `card-tapestry.jpg`

### Visual Alignment Rules

The MCA card and JarCard must sit side by side in the Home carousel with pixel-perfect alignment. These rules ensure the color-to-grey transition and heading baseline match exactly.

- **Stack/header height:** Both `.mca-cards__stack` and `.jar-card__header` use `padding-bottom: 24%` — this is the ONLY height driver. No top padding.
- **Cutout overlap:** `.mca-front__cutout` is positioned `top: -15px`, overlapping the card stack by 15px. This creates the wallet arch shape.
- **Cutout always renders:** The cutout SVG renders on ALL MCA cards (with or without `hasCards`), because the cutout represents the account TYPE supporting cards, not whether cards are currently connected.
- **Front panel shadow:** `.mca-front::before` adds `box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.12)` for depth at the transition.
- **Footer anchoring:** `.mca-footer` uses `padding: 12px 0 0`. In fixed-height contexts (component library), use `margin-top: auto` on `.mca-footer` with `.mca-front { display: flex; flex-direction: column; flex: 1; }` to anchor the Account details button to the bottom.

### Subtitle Rule

- **1 currency** — no subtitle, just the account name
- **2+ currencies** — subtitle shows total amount + "· N currencies"

### Notes
- The GBP balance row uses a diagonal `AvatarLayout` (flag + Rewards icon) when the currency `hasStocks` is true.
- Card stack uses absolute positioning with front card offset 25% from top, sliding to 0 on hover.
- The EmptyAccountCard variant uses `.mca--empty` with `flex: 1` to stretch and match the MCA height in a Carousel.

---

## JarCard

### Description
Displays a jar (savings/purpose container) account in the Home carousel. Uses a solid color header instead of card imagery. Must align pixel-perfectly with MCA cards in the same carousel.

### Structure
- **Color Header** — Solid background color matching the jar's icon color. Contains absolutely-positioned "Jar" label and icon.
- **Front Panel** — Account name heading, optional total amount subtitle, currency balance grid. Reuses `.mca-front` and `.mca-balances` classes from MCA for consistent sizing.

### Data

| Field | Type | Description |
|-------|------|-------------|
| name | `string` | Jar name (e.g. "Savings") |
| icon | `React.ReactNode` | Jar icon (e.g. `<Savings size={16} />`) |
| color | `string` | Header background color (Neptune expressive brand color) |
| totalAmount | `string` | Optional formatted total balance, shown as subtitle when 2+ currencies |
| balances | `{ code: string, amount: string }[]` | Per-currency balances |

### Visual Alignment Rules (Critical)

The JarCard header must align with the MCA stack area so cards sit evenly in the carousel:

- **Header height:** `padding-bottom: 24%` only (matches `.mca-cards__stack`). NO top padding — the label/icon are in an absolutely-positioned `.jar-card__header-content` wrapper so they don't add height.
- **Content overlap:** `.jar-card__front` uses `margin-top: -15px` + `padding-top: 15px`. The negative margin matches MCA's 15px cutout overlap (aligning the color-to-grey transition). The positive padding pushes the heading back down (aligning the heading baseline with MCA's heading).
- **No cutout:** JarCard has NO wallet arch cutout — the transition is a straight line. No rounded top corners on `.jar-card__front`.
- **No footer:** JarCard has no "Account details" button.

### Subtitle Rule

Same as MCA:
- **1 currency** — no subtitle
- **2+ currencies** — subtitle shows `totalAmount`

### CSS Classes
- `.jar-card` — Outer flex column container (also has `.mca` class for shared width/radius/padding)
- `.jar-card__header` — Color block with `border-radius: 20px 20px 0 0`, `padding-bottom: 24%`, `position: relative`
- `.jar-card__header-content` — Absolute-positioned flex row (`top: 14px`, `left: 20px`, `right: 16px`) containing label and icon
- `.jar-card__label` — "Jar" text label (`color: #121511`, uses `np-text-body-default-bold`)
- `.jar-card__icon` — 32x32 icon container (`color: #121511`)
- `.jar-card__front` — Front panel with overlap (`margin-top: -15px`, `padding-top: 15px`, `background: var(--color-mca-background)`)

### Jar Colors (Neptune Expressive Brand)

| Jar Icon | Color |
|----------|-------|
| Savings | `#FFEB69` (yellow) |
| Suitcase | `#FFC091` (orange) |
| Blue variant | `#A0E1E1` |
| Pink variant | `#FFD7EF` |
| Green variant | `#9FE870` |

### Design System Components Used
- `ListItem` + `ListItem.AvatarView` + `ListItem.Navigation` — Balance rows and account header
- `Flag` — Currency flag icons (24px circular)
- `ChevronRight` (`@transferwise/icons`)

---

## SideNav (Sidebar Navigation)

### Description
Sticky sidebar navigation menu with expandable submenus, matching the production Wise web app. Renders inside a 280px left column.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `NavItem[]` | Navigation items to render |
| `activeItem` | `string` | Currently active item label |
| `onSelect` | `(label: string) => void` | Called when an item is selected |

### NavItem Type

```tsx
type NavItem = {
  label: string;
  icon: ReactNode;
  href: string;
  children?: { label: string; icon: ReactNode; href: string }[];
};
```

### Structure
- **Nav sidebar** — Sticky container (`position: sticky; top: 0; height: 100vh`)
  - **Brand** — Centered Wise `<Logo />` (135px tall)
  - **Menu** — Vertical list of nav items (232px wide, 48px tall, 24px border-radius)
    - **Expandable items** — Chevron toggle button, submenu with 16px icons
    - **Active state** — Neutral background + link color + bold weight

### Behavior

- Items with `children` show a chevron toggle button
- Clicking a parent item with children toggles its submenu and selects it
- **All submenus are collapsed by default** (`new Set()`)
- Active state applies to both the selected item and its parent when a child is active

### Design System Components Used
- `Logo` (`@transferwise/components`) — Brand mark
- `IconButton` (`@transferwise/components`) — Chevron toggle
- `ChevronDown` (`@transferwise/icons`) — Submenu toggle icon
- Nav item icons: `House`, `CardWise`, `List`, `Payments`, `Calendar`, `DirectDebits`, `Reload`, `RequestReceive`, `BillSplit`, `Bills`, `Batch`, `Document`, `QrCode`, `Team`, `Recipients`, `BarChart` (`@transferwise/icons`)


### CSS Classes
- `.nav-sidebar` — Sticky sidebar container (100vh)
- `.nav-sidebar__top` / `.nav-sidebar-brand` — Logo area
- `.nav-sidebar__body` — Menu container (padding: 0 32px 24px)
- `.nav-menu` — Flex column list
- `.menu-item` — Top-level item wrapper (232px)
- `.generic-menu-item` / `.main-menu-item` — Item link (48px, border-radius: 24px)
- `.icon-container` / `.icon-container-small` — 24px / 16px icon wrappers
- `.generic-menu-item__chevron-button-container` / `.generic-menu-item__chevron-button` — Chevron toggle
- `.chevron-icon` / `.chevron-icon--expanded` — Rotate animation
- `.menu-submenu` / `.menu-submenu__expandable-container` — Submenu list

### Notes
- The sidebar sits inside `.column-layout-left` (280px) in the page layout shell.
- See `page-structure.md` for the layout container CSS and App.tsx scaffold.

---

## Navigation Data — Personal & Business

Two predefined nav configurations. Import from `data/nav.tsx`.

### Personal (6 items)

| Label | Icon | Submenu |
|-------|------|---------|
| Home | `House` | — |
| Cards | `CardWise` | — |
| Transactions | `List` | — |
| Payments | `Payments` | Scheduled, Direct Debits, Recurring card payments, Payment requests, Bill splits |
| Recipients | `Recipients` | — |
| Insights | `BarChart` | — |

### Business (7 items)

| Label | Icon | Submenu |
|-------|------|---------|
| Home | `House` | — |
| Cards | `CardWise` | — |
| Transactions | `List` | — |
| Payments | `Payments` | Scheduled, Direct Debits, Recurring card payments, Bills, Batch, Invoices, Payment links, Quick Pay |
| Team | `Team` | — |
| Recipients | `Recipients` | — |
| Insights | `BarChart` | — |

### Source
`src/data/nav.tsx` — exports `personalNav` and `businessNav` arrays of `NavItem`. Read the file for the full nav structure and icon mappings.

---

## TopBar (Top Navigation Bar)

### Description
Right-aligned top bar with a CTA button, account switcher, and optional hamburger menu toggle. Sits at the top of the main content column.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | User or business name displayed in the switcher |
| `initials` | `string` | Initials fallback for avatar circle |
| `avatarUrl` | `string?` | Avatar image URL (e.g. tapback memoji) |
| `onMenuToggle` | `() => void` (optional) | Called when the hamburger is clicked |

### Structure
- **Header** — Flex container, right-aligned, 136px tall
  - **Hamburger** — `IconButton` (tertiary) with `Menu` icon, hidden on desktop via CSS
  - **CTA Button** — Primary small button (e.g. "Earn £75")
  - **Account Switcher** — `AvatarView`(48) with `imgSrc` + name + chevron right, 8px gap from button
    - Name uses Inter Medium (font-weight: 500)

### Design System Components Used
- `Button v2` (size="sm", priority="primary") — CTA action
- `AvatarView` (size={48}, imgSrc) — User avatar with image support
- `IconButton` (`@transferwise/components`) — Hamburger toggle
- `ChevronRight`, `Menu` (`@transferwise/icons`) — Icons


### CSS Classes
- `.top-bar` — Flex container (height: 136px, justify-content: flex-end)
- `.top-bar__hamburger` — Hamburger wrapper (hidden on desktop, shown on tablet)
- `.top-bar__actions` — Inner flex row (gap: 12px)
- `.account-switcher` — Pill-shaped link (border-radius: 36px, hover: neutral background)
- `.account-switcher__name` — Name label (14px, font-weight: 500 / Inter Medium)

### Notes
- The top bar has no left-side content on desktop; everything is right-aligned.
- On tablet (768–991px), the hamburger appears at the left and the top bar switches to `justify-content: space-between`.
- On mobile (<768px), the hamburger is hidden again (MobileNav replaces it), and only the avatar is shown.
- Account switcher is an `<a>` tag styled as a pill, not a button.

---

## MobileNav (Bottom Tab Bar)

### Description
Bottom tab bar for mobile viewports (<768px). 4 items matching production: Home, Cards, Recipients, Payments. Uses semantic `ul > li > a` structure. Hidden on desktop and tablet via CSS.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `activeItem` | `string` | Currently active tab label |
| `onSelect` | `(label: string) => void` | Called when a tab is tapped |

### Items

| Label | Icon | Href |
|-------|------|------|
| Home | `House` | `/home` |
| Cards | `CardWise` | `/cards` |
| Recipients | `Recipients` | `/recipients` |
| Payments | `Payments` | `/account/payments` |

### Design System Components Used
- `House`, `CardWise`, `Recipients`, `Payments` (`@transferwise/icons`) — Tab icons


### CSS Classes
- `.mobile-nav` — Fixed bottom container (hidden by default, shown on mobile)
- `.mobile-nav__items` — Flex row of tabs
- `.mobile-nav-item__link` — Tab link (82×62px, flex column)
- `.mobile-nav-item__link--active` — Active state (color change only)
- `.mobile-nav-item__label` — Custom Inter 10px typography

### Notes
- The mobile nav becomes visible via responsive CSS in `page-structure.md` at `<768px`.
- Container content gets extra `padding-bottom: 80px` on mobile to avoid overlap with the fixed nav.

---

## SidebarOverlay (Responsive Sidebar Panel)

### Description
Overlay sidebar triggered by the hamburger button on tablet viewports. Panel slides in from the left with a scrim backdrop and close button.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether the overlay is visible |
| `onClose` | `() => void` | Called when scrim or close button is clicked |
| `children` | `ReactNode` | Content to render inside the panel (typically SideNav) |

### Behavior

- Panel slides in from the left with a `0.35s ease-out` transition
- Scrim fades in with `0.3s ease`
- Close button fades in with `0.15s ease` after a `0.35s` delay (waits for panel to finish)
- Close button wrapper is positioned at `top: 20px; left: 298px` — on top of the scrim, just outside the panel edge
- Close button is a custom circular `<button>` (40px, border-radius 50%, `background: var(--color-background-screen)`) matching production's `tw-avatar__content` pattern — not an `IconButton`
- Cross icon is an inline SVG (16px wide, 24px viewBox) matching production's cross icon exactly
- Uses `visibility: hidden` + `pointer-events: none` instead of `display: none` to allow CSS transitions


### CSS Classes
- `.sidebar-overlay` — Fixed full-screen container (visibility-based toggling)
- `.sidebar-overlay--open` — Open state modifier
- `.sidebar-overlay__scrim` — Full-viewport dimmer (rgba(0,0,0,0.6))
- `.sidebar-overlay__panel` — 280px sliding panel from left
- `.sidebar-overlay__close-wrapper` — Positioned circle for close button
- `.sidebar-overlay__close` — Neutral circular close button (48px)

### Notes
- Hidden on desktop (≥992px) via `display: none !important` in responsive CSS (see `page-structure.md`).
- The overlay renders the same SideNav content as the static sidebar — extract into a shared variable in App.tsx.

---

## TotalBalanceHeader

### Description
Displays the user's total balance with a label, large formatted amount, and a circular bar chart icon button for breakdown navigation.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `amount` | `string` | Formatted balance amount (e.g. "24.66") |
| `currency` | `string` | Currency code (e.g. "GBP") |

### Structure
- **Label** — "Total balance" (`np-text-body-large`)
- **Amount row** — Flex row with amount heading + icon button
  - **Amount** — `np-text-title-subsection` heading
  - **Icon button** — `IconButton`(32, tertiary) with `BarChart`(16) icon

### Design System Components Used
- `IconButton` (`@transferwise/components`) — 32px tertiary icon button
- `BarChart` (`@transferwise/icons`) — Balance breakdown icon (16px)


### CSS Classes
- `.total-balance-header` — Outer container (16px top padding)
- `.total-balance-header__amount` — Flex row for amount + icon button

### Notes
- The icon is `BarChart` (not `InfoCircle`) matching the production circular chart button.
- AvatarView background is `--color-background-neutral` (not screen).

---

## ActionButtonRow

### Description
Horizontally scrollable row of primary action buttons: Send (primary), Add money (secondary), and Request (secondary with chevron dropdown indicator).

### Structure
- **Scroll container** — Flex row with `overflow-x: auto`, hidden scrollbar
  - **Send** — `Button v2` md primary, block
  - **Add money** — `Button v2` md secondary, block
  - **Request** — `Button v2` md secondary, block, with `ChevronDown`(16) icon

### Design System Components Used
- `Button v2` (`@transferwise/components`) — Action buttons (md size, block width)
- `ChevronDown` (`@transferwise/icons`) — Dropdown indicator on Request button


### CSS Classes
- `.action-button-row` — Outer wrapper
- `.action-button-row__scroll` — Flex row (8px gap) with hidden overflow scrollbar

### Notes
- Buttons use `addonEnd` prop for the chevron icon rather than manual icon placement.
- No wrapper divs needed — buttons size naturally in the flex row.
- Scrollbar is hidden but horizontal scroll is preserved for overflow on narrow viewports.

---

## Carousel

### Description
Horizontal snap-scroll carousel with bidirectional navigation arrows. The **next** (right) arrow shows when content overflows. The **prev** (left) arrow appears when scrolled past 50% of the first card width. Both arrows appear on hover and have box shadows.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Cards to render in the carousel track |

### Structure
- **Track** — Flex container with `scroll-snap-type: x mandatory`
- **Prev button** — 48px primary circle, left side, hidden until scrolled past 50% of first card
- **Next button** — 48px primary circle, right side, shown when track has overflow

### Design System Components Used
- `IconButton` (`@transferwise/components`) — 48px primary circular navigation buttons
- `ChevronLeft`, `ChevronRight` (`@transferwise/icons`) — Navigation arrows (24px)

### Behavior
- Scroll detection via `scroll` event listener (passive) on the track element
- `checkScroll` callback: `setShowPrev(el.scrollLeft > cardWidth * 0.5)`
- Overflow detection via `scrollWidth > clientWidth` on mount and resize
- Both arrows scroll by 360px (≈ one card width + gap) with `behavior: 'smooth'`
- Both arrows fade in on carousel hover via CSS `opacity` transition


### CSS Classes
- `.carousel` — Relative container with `overflow: hidden`
- `.carousel__track` — Snap-scroll flex row (24px gap) with hidden scrollbar
- `.carousel__nav` — Absolute-positioned arrow wrapper (opacity 0, fades in on hover)
- `.carousel__nav--next` — Right-positioned (16px from right edge)
- `.carousel__nav--prev` — Left-positioned (16px from left edge)

### Notes
- Both arrows use `IconButton` (size=48, priority="primary") with box shadow on the `.np-circle`.
- The prev arrow conditionally renders based on scroll position state (`showPrev`).
- The next arrow conditionally renders based on overflow detection (`hasOverflow`).
- Both arrows scroll 360px (approximately one card width + gap).

---

## EmptyAccountCard

### Description
Placeholder card prompting the user to open a new account. Displays an empty card header strip, descriptive text, and a green plus circle icon.

### Structure
- **Card container** — `.mca.mca--empty` wrapper (same border-radius as account cards)
  - **Empty header** — `.mca-cards__stack--empty` with grey `.mca-cards__empty-card` fill
  - **Content** — Centered text + plus icon
    - **Title** — "Do more with your money" (`np-text-title-subsection`)
    - **Description** — "Manage it, share it with others, and earn a return." (`np-text-body-large`)
    - **Plus icon** — `AvatarView`(56) with bright-green bg + `Plus`(24) icon

### Design System Components Used
- `AvatarView` (`@transferwise/components`) — 56px circle with green background
- `Plus` (`@transferwise/icons`) — Add icon (24px)


### CSS Classes
- `.mca.mca--empty` — Flex-column card container reusing account card base
- `.mca-cards__stack--empty` — Shorter header strip (12% padding-bottom vs 24%)
- `.mca-cards__empty-card` — Absolute grey fill for empty header
- `.empty-account-card__content` — Centered column for text and icon

### Notes
- Reuses `.mca` and `.mca-front` classes from MultiCurrencyAccountCard for consistent sizing.
- The plus icon uses `--color-bright-green` with `#9fe870` fallback.

---

## TaskCard

### Description
Displays an actionable task notification with an icon, title/description, and action button. Optionally wraps the icon in a Badge with a sentiment StatusIcon overlay (e.g. warning alert).

### Props

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `ReactNode` | Icon to render inside the avatar (e.g. `<RequestReceive size={24} />`) |
| `sentiment` | `'positive' \| 'negative' \| 'warning'?` | Optional — adds a Badge with StatusIcon overlay |
| `title` | `string` | Task title (e.g. "3 payment requests") |
| `description` | `string` | Task description (e.g. "Pay or decline each request") |
| `actionLabel` | `string` | Button text (e.g. "Review") |
| `actionHref` | `string?` | Optional link URL for the action |

### Structure
- **Stack container** — Relative wrapper with bottom padding for shadow
  - **Card** — Bordered card (r=16) with horizontal layout
    - **Icon** — `AvatarView`(48) with screen bg + data-driven icon
    - **Content** — Flex row: text column + action button
      - **Text** — Title (`np-text-body-large-bold`) + description (`np-text-body-default`)
      - **Action** — `Button v2` sm primary (or `<a>` styled as button)
  - **Action** — `Button v2` sm primary (or `<a>` styled as button)

### Design System Components Used
- `AvatarView` (`@transferwise/components`) — 48px icon circle with screen background
- `Badge` + `StatusIcon` (`@transferwise/components`) — Optional sentiment overlay (e.g. warning alert)
- Icons from `@transferwise/icons` — Data-driven (e.g. `RequestReceive`, `Plus`)


### CSS Classes
- `.task-card` — Neutral-solid background card (r=16, padding 16px, no border)
- `.task-card__wrapper` — Horizontal flex row (icon → content)
- `.task-card__content` — Flex row (text → action button)
- `.task-card__text` — Flex-grow text column
- `.task-card__action` — Flex-shrink-0 button container

### Notes
- Layout is fully horizontal: icon | title+description | button.
- When `sentiment` is provided, the icon is wrapped in a `Badge` with a `StatusIcon` overlay (e.g. warning alert circle).
- TaskCard renders just the card itself. Use `TasksStack` to wrap multiple cards with expand/collapse behavior.

---

## TasksStack

### Description
Animated container for multiple TaskCards. When collapsed, shows only the first task with a stacked shadow placeholder behind it and an expand `Button v2` with count + chevron. When expanded, the count animates out (slide right + fade), the button collapses to icon-button size, and all tasks animate in.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode[]` | Array of TaskCard elements |

### Structure
- **Header row** — "Tasks" title (`np-text-title-subsection`) + expand/collapse button
  - **Expand button** — `Button v2` (sm, secondary-neutral) with animated count label + `ChevronDown` addonEnd
  - **Count animation** — `max-width` + `opacity` transition; label gap collapses via `:has()` selector
- **Animated container** — Height transitions between single-card (100px) and all-cards (92px each)
  - **Placeholder** — `--color-background-neutral-solid-secondary` card peeking behind first card
  - **Cards** — First card always visible, extra cards animate in opacity + translateY

### Design System Components Used
- `Button v2` (`@transferwise/components`) — Expand/collapse button (sm, secondary-neutral)
- `ChevronDown` (`@transferwise/icons`) — Expand/collapse chevron (16px), rotates 180deg

### Dark Mode Override
The count label text is green (`--color-interactive-primary`) in dark mode via scoped CSS override.


### CSS Classes
- `.tasks-stack` — Outer container
- `.tasks-stack__count` — Animated count label (max-width + opacity transition)
- `.tasks-stack__count--hidden` — Collapses count to 0 width with fade
- `.tasks-stack__chevron` — Chevron icon with rotation transition
- `.tasks-stack__animated` — Height-animated container (100px collapsed, 92px per card expanded)
- `.tasks-stack__placeholder` — Stacked shadow behind first card (`--color-background-neutral-solid-secondary`, inset 8px, scaled down)
- `.tasks-stack__cards` — Z-indexed card container above placeholder
- `.tasks-stack__extra-card` — Animated opacity + translate for additional cards

### Notes
- Uses `Button v2` (sm, secondary-neutral) with `addonEnd` for the chevron — no custom button needed.
- The count label animates out using `max-width: 0` + `opacity: 0` with CSS transitions.
- The `:has(.tasks-stack__count--hidden)` selector collapses the button's internal label gap to 0 and makes padding symmetric, centering the chevron when collapsed to icon-only state.
- Dark mode override scoped precisely to `.tasks-stack > .d-flex > .wds-Button` to avoid affecting TaskCard buttons.
- Each card takes 92px height (card + 8px padding). Collapsed height is 100px (card + placeholder peek).
- When only 1 task exists, the expand button and placeholder are hidden.

---

## ActivitySummary

### Description
Thin wrapper around the `ListItem` design system component for transaction rows. Displays icon, name/date, right-aligned amount (green if positive), and a navigation chevron. The parent `<ul>` uses negative margins for hover padding expansion.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `ReactNode` | Transaction icon (e.g. `<Send size={24} />` or `<Receive size={24} />`) |
| `name` | `string` | Recipient/sender name |
| `subtitle` | `string` | Date and context (e.g. "Sent · Tuesday") |
| `amount` | `string` | Formatted amount (e.g. "+ 204.64 GBP") |
| `isPositive` | `boolean?` | Whether to apply green sentiment color |

### Structure
- **ListItem** — DS component handles layout, hover, typography
  - **media** — `ListItem.AvatarView`(48) with icon
  - **title** — Name
  - **subtitle** — Date
  - **valueTitle** — Amount (wrapped in green span if positive)
  - **control** — `ListItem.Navigation` for chevron

### Design System Components Used
- `ListItem` + `ListItem.AvatarView` + `ListItem.Navigation` (`@transferwise/components`) — Full row layout, avatar, and navigation chevron
- `Send`, `Receive` (`@transferwise/icons`) — Transaction direction icons (24px)


### CSS Classes
- `.transactions-list` — Parent `<ul>` with negative margin so `ListItem` hover backgrounds extend 16px beyond content area

### Notes
- No custom row CSS needed — `ListItem` handles layout, hover, and typography.
- The `control` prop (not children) must be used for `ListItem.Navigation` — passing it as children causes a TypeScript error.
- Positive amounts use `--color-sentiment-positive` (green) via inline style on `valueTitle`.
- The parent list needs `margin: 0 -16px; padding: 0 16px` so the ListItem hover background extends to the edges.

---

## SendAgainCard

### Description
Displays a past recipient with avatar, optional FastFlag badge (via `AvatarView` badge prop), name/handle/amount, dismiss IconButton, and Repeat/Edit action buttons. Fixed width 320px with solid neutral background.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Recipient name |
| `handle` | `string` | Recipient handle (e.g. "@christied25") |
| `amount` | `string` | Last sent amount (e.g. "0.01 GBP") |
| `avatarUrl` | `string?` | Profile photo URL (e.g. tapback memoji) |
| `showFastFlag` | `boolean?` | Show Wise FastFlag badge on avatar |

### Structure
- **Card** — Solid neutral container (r=16, 320px wide)
  - **Header** — Flex row: recipient info + dismiss IconButton
    - **Avatar** — `AvatarView`(56) with `badge={{ icon: <FastFlag />, type: 'action' }}` for green circle badge
    - **Details** — Name (`np-text-body-default-bold`) + handle + amount (both `np-text-body-default`, secondary)
    - **Dismiss** — `IconButton` size 32, tertiary + `Cross`(16)
  - **Actions** — Flex row: buttons share width equally via `flex: 1`

### Design System Components Used
- `AvatarView` (`@transferwise/components`) — 56px avatar with `badge` prop for FastFlag overlay
- `FastFlag` (`@transferwise/icons`) — Wise speed badge icon (16px), always `--color-forest-green`
- `IconButton` (`@transferwise/components`) — Dismiss button (32px, tertiary)
- `Button v2` (`@transferwise/components`) — "Repeat" (sm primary) + "Edit" (sm secondary-neutral)
- `Cross` (`@transferwise/icons`) — Dismiss icon (16px)


### CSS Classes
- `.send-again-card` — Solid neutral card (r=16, 320px, no border)
- `.send-again-card__header` — Flex row: recipient + dismiss IconButton
- `.send-again-card__recipient` — Flex row: avatar + details
- `.send-again-card__details` — Vertical stack: name, handle, amount
- `.send-again-card__actions` — Flex row, children flex equally

### Notes
- Uses `AvatarView` `badge` prop with `{ icon: <FastFlag />, type: 'action' }` for green circle FastFlag badge. The deprecated `Badge` wrapper component should not be used.
- FastFlag icon is forced to `--color-forest-green` in all themes via `.tw-icon-fast-flag` override.
- "Edit" button uses `secondary-neutral` priority (outlined, not filled).
- Avatar URLs: use `https://www.tapback.co/api/avatar/{name}.webp` for memoji placeholders.

---

## PromotionBanner

### Description
Promotional banner (max-width 380px, 385px tall) with background image, CSS grid layout, gradient overlay, display typography, and dismissible close button. Matches production `Promotion` component.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Display title (e.g. "Young explorer") |
| `subtitle` | `string` | Description text |
| `backgroundImage` | `string` | Background image URL |
| `backgroundColor` | `string?` | Background color (default: `var(--color-forest-green, #163300)`) |
| `href` | `string?` | Link URL (default: "#") |

### Structure
- **Banner wrapper** — `max-width: 380px`, relative positioned
  - **Image container** — Background image + color, r=16, overflow hidden, clickable (role="button")
    - **Gradient grid** — CSS Grid (`auto 1fr 72px`), 385px tall, `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, transparent 60%)`
      - **Text (grid: top)** — Title (`np-display np-text-display-small`, white) + subtitle (`np-text-body-large-bold`, white), padding `24px 64px 24px 24px`
      - **Foreground (grid: middle→bottom)** — Spacer area, flexes to bottom
      - **Actions (grid: bottom)** — 56px bright-green circle + `ArrowRight`(24) icon, self-end, 8px margin
  - **Dismiss** — 32px circle, `rgba(219,224,217,0.7)` bg, `backdrop-filter: blur(48px)`, `Cross`(16) icon, top-right 16px inset

### Design System Components Used
- `ArrowRight` (`@transferwise/icons`) — CTA arrow (24px)
- `Cross` (`@transferwise/icons`) — Dismiss icon (16px)


### CSS Classes
- `.promotion-banner` — Relative outer container (max-width 380px)
- `.promotion-banner__container` — Background image container (r=16, covers, clickable, focus-visible outline)
- `.promotion-banner__gradient` — CSS Grid (385px tall, 3 rows: auto/1fr/72px) with dark gradient overlay
- `.promotion-banner__text` — Grid area "top", white text with 24px padding (64px right for dismiss button clearance)
- `.promotion-banner__title` — Display title (forced white, text-wrap: pretty)
- `.promotion-banner__foreground` — Grid area spanning middle→bottom, spacer
- `.promotion-banner__actions` — Grid area "bottom", self-end aligned, 8px right margin
- `.promotion-banner__arrow` — 56px bright-green circle CTA, hover darkens via container hover
- `.promotion-banner__dismiss` — 32px frosted close button (`rgba(219,224,217,0.7)`, blur 48px), top-right 16px

### Notes
- Production height is 385px with CSS Grid layout — not a fixed card like other components.
- Young Explorer uses `backgroundColor: var(--color-dark-purple)` and backpack image URL.
- The title uses `np-display np-text-display-small` (Wise Sans display font).
- Gradient overlay ensures text readability regardless of background image.
- Arrow button uses `--color-interactive-accent` (not bright-green) which changes on hover.
- Dismiss button uses neutral grey `rgba(219,224,217)` — not white — matching production.

---

## TransferCalculator

### Description
Interactive transfer calculator with a 25-day rate chart (Recharts), currency input group with dropdown selectors, fee details with info modal, send button, and a rate alert ListItem. Chart and inputs sit side-by-side (50/50) on desktop and stack vertically on tablet/mobile.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSend` | `(sourceCurrency: string, targetCurrency: string, sourceAmount?: string, targetAmount?: string) => void` (optional) | Called when the Send button is clicked |

### Structure
- **Shimmer state** — When `shimmerMode` is active (via `useShimmer`), renders a `ShimmerTransferCalculator` skeleton placeholder instead of the full component.
- **Calculator card** — Solid neutral container (r=16, padding 24px, no border)
  - **Rate heading** — "1 USD = 0.7434 GBP" (`np-text-title-subsection`)
  - **Body** — Flex row (desktop) / column (mobile), 50/50 split
    - **Chart section** — `ResponsiveContainer` + `LineChart` with gradient hover split, custom XAxis ticks
    - **Inputs column** — `CurrencyInputGroup` + fee details + Send button
- **Rate alert** — `ListItem` with bell icon and navigation chevron (below calculator card)
- **Fee modal** — `Modal` with bullet list explaining fee factors

### Key Behaviors
- **Rate generation** — Brownian motion random walk with seeded PRNG per currency pair. Uses `usdBaseRates` lookup (24 currencies) with per-currency volatility profiles (e.g. ARS/TRY high volatility, AED/SGD stable). Rates are sourced from `useLiveRates()` context, which updates every 10 seconds, causing the chart data (`RatePoint[]` — `{ date: string; rate: number }`) to recompute via `useMemo`.
- **Hover line split** — SVG `<linearGradient>` splits the line at the hover point: solid color before, neutral after. Avoids line shape distortion that occurs with conditional rendering of multiple `<Line>` components.
- **Currency conversion** — `target = (source - fee) * rate`. Fee is fixed at 7.23 in source currency.
- **Chart animation** — `isAnimationActive={true}` with `animationDuration={600}` and `animationEasing="ease-out"`. No `key` prop on `<Line>` — Recharts animates data transitions naturally.
- **Custom XAxis ticks** — Dynamic date labels: first tick shows one-month-ago date (e.g. "26 Jan"), last tick shows "Today". Uses `x == null` guard (not `!x`) because first tick has `x=0`.
- **Theme-aware line color** — CSS variable `--transfer-chart-line-color` maps to `--color-content-primary` in light mode and `--color-interactive-primary` in dark mode.

### Design System Components Used
- `Button v2` (`@transferwise/components`) — Send button (lg, primary, block)
- `IconButton` (`@transferwise/components`) — Fee info button (24px, tertiary)
- `ListItem` + `ListItem.AvatarView` + `ListItem.Navigation` (`@transferwise/components`) — Rate alert row
- `Modal` (`@transferwise/components`) — Fee info modal
- `NotificationActive`, `QuestionMarkCircle` (`@transferwise/icons`) — Icons
- `LineChart`, `Line`, `CartesianGrid`, `XAxis`, `YAxis`, `ResponsiveContainer`, `Tooltip` (`recharts`) — Rate chart

### Custom Token

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--transfer-chart-line-color` | `var(--color-content-primary)` | `var(--color-interactive-primary)` | Chart line stroke color |


### CSS Classes
- `.transfer-calculator` — Solid neutral card (r=16, padding 24px, no border)
- `.transfer-calculator__body` — Flex row (desktop, 50/50) / column (≤991px)
- `.transfer-calculator__chart-section` — Flex-grow chart container (max-width 50%)
- `.transfer-calculator__inputs-col` — Flex-grow inputs column (max-width 50%)
- `.transfer-calculator__details` — Bordered pill container for fee + arrival info
- `.transfer-calculator__detail` — Individual detail cell (centered text, divided by border-left)
- `.transfer-calculator__info-btn` — Inline wrapper to size down the `IconButton` for fee info
- `.transfer-calculator__rate-alert` — Rate alert ListItem below card

### Notes
- Chart uses Recharts library (`recharts`). Y-axis on right side, dashed horizontal grid lines.
- Line type is `"natural"` for organic-looking curves.
- Custom tooltip shows date + rate + dynamic target currency code.
- Custom active dot: grey halo (r=10, 0.6 opacity) + white ring (r=6) + dark center (r=3).
- Rate alert is a standard `ListItem` with `ListItem.Navigation` — no custom component needed.
- On tablet/mobile (≤991px), body stacks vertically — same layout for both breakpoints.
- Fee modal uses `np-text-body-large` (16px) with `np-text-link-large` for the learn more link.

---

## CurrencyInputGroup

### Description
Paired currency input fields with a swap button and currency selector dropdown. Each input has an amount field and a currency selector button (flag + code + chevron). Clicking a selector opens a `CurrencyDropdown` overlay. The swap button uses `SwitchVertical` icon with custom brand colors.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `sourceAmount` | `string` | Source input value |
| `sourceCurrency` | `string` | Source currency code (e.g. "USD") |
| `targetAmount` | `string` | Target input value |
| `targetCurrency` | `string` | Target currency code (e.g. "GBP") |
| `onSourceAmountChange` | `(val: string) => void?` | Source input change handler |
| `onTargetAmountChange` | `(val: string) => void?` | Target input change handler |
| `onSourceCurrencyChange` | `(code: string) => void?` | Source currency selection handler |
| `onTargetCurrencyChange` | `(code: string) => void?` | Target currency selection handler |
| `onSwap` | `() => void?` | Swap currencies handler |

### Structure
- **Group** — Flex column with `position: relative` (dropdown anchor)
  - **Source input** — Amount `<input>` + currency selector (`Flag` + code + `ChevronDown`)
  - **Swap button** — 32px circle between inputs (negative margin overlap) + `SwitchVertical`(16) icon
  - **Target input** — Same structure as source
  - **Dropdown** — `CurrencyDropdown` rendered at group level (avoids `overflow: hidden` clipping)

### Design System Components Used
- `Flag` (`@wise/art`) — Currency flag icons (24px circular)
- `SwitchVertical`, `ChevronDown` (`@transferwise/icons`) — Swap and dropdown icons


### CSS Classes
- `.currency-input-group` — Flex column container with `position: relative`
- `.currency-input` — Borderless input row (r=16, screen background)
- `.currency-input__amount` — Styled text input (18px bold, 56px height)
- `.currency-input__code` — Currency code label (16px bold)
- `.currency-input__selector-btn` — Currency picker button with flag + code + chevron
- `.currency-input-group__swap` — Centered swap button with negative margin overlap (-20px)
- `.currency-input-group__swap-btn` — 32px circle (#EDEFEC light / #2B2D29 dark, interactive-primary icon)
- `.currency-input-group__dropdown` — Absolute-positioned dropdown container

### Notes
- Inputs have **no border** — they use screen background on a neutral-solid card.
- Swap button uses `SwitchVertical` icon (not `Convert`), with custom hex backgrounds that don't match any DS token.
- Dropdown renders at `.currency-input-group` level (not inside `.currency-input`) to avoid `overflow: hidden` clipping.
- `CurrencyInput` is a private sub-component, not exported.

---

## CurrencyDropdown

### Description
Searchable currency selector dropdown with "Recent currencies" and "All currencies" sections. Supports 24 currencies with flag + code + name rows. Closes on click outside.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSelect` | `(code: string) => void` | Called when a currency row is clicked |
| `onClose` | `() => void` | Called when clicking outside or after selection |

### Structure
- **Container** — Scrollable card (320px wide, max 400px tall)
  - **Search** — Bordered input with `Search` icon, auto-focused
  - **Recent currencies** — Section header + divider + filtered rows (EUR, HUF)
  - **All currencies** — Section header + divider + filtered rows (24 currencies)
  - **Each row** — 32px flag + bold code + secondary name

### Design System Components Used
- `Flag` (`@wise/art`) — Currency flag icons (32px circular)
- `Search` (`@transferwise/icons`) — Search input icon (16px)

### Currencies
Recent: EUR, HUF. All: AED, ARS, AUD, BDT, BRL, CAD, CHF, CNY, EUR, GBP, HUF, IDR, INR, JPY, MXN, NGN, PHP, PLN, SEK, SGD, THB, TRY, USD, ZAR.


### Notes
- Search input uses `box-shadow: none` and `-webkit-appearance: none` to remove browser default focus ring/border.
- Click-outside detection uses `mousedown` event listener with `ref.contains()` check.
- Auto-focuses the search input on mount via `useEffect` + `inputRef.current?.focus()`.

---

## PageFooter

### Description
Page-level footer with shield icon, protection message, description text, and a "Learn more" action button. Centered layout. Title row uses `--color-interactive-primary` — dark green in light mode, light green in dark mode.

### Structure
- **Footer** — Centered text container
  - **Title row** — Shield icon (24px) + "Your money, protected" (`np-text-body-large-bold`), colored `--color-interactive-primary`
  - **Description** — Protection promise text (`np-text-body-default`, secondary)
  - **Action** — "Learn more" (`Button v2` sm secondary-neutral)

### Design System Components Used
- `Shield` (`@transferwise/icons`) — Protection icon (24px)
- `Button v2` (`@transferwise/components`) — "Learn more" button (sm, secondary-neutral)


### CSS Classes
- `.page-footer` — Centered container with top padding
- `.page-footer__title` — Flex row centering shield icon + title
- `.page-footer__description` — Secondary color, max-width 400px, auto-centered

### Notes
- This is a simple informational footer, not a site-wide footer.
- Description text is constrained to 400px for readability.

---

## AccountActionButtons

### Description
Row of 4 `CircularButton`s for primary account actions: Add, Convert, Send, Request. Used within `AccountPageHeader` and shown on CurrentAccount and CurrencyPage.

### Props
None — stateless presentational component.

### Structure
- **Container** — Flex row (`.account-action-buttons`)
  - **CircularButton** × 4 — `priority="primary"`, 24px icons, 100px width each

### Design System Components Used
- `CircularButton` (`@transferwise/components`) — Green circular action buttons
- `Plus`, `Convert`, `Send`, `Receive` (`@transferwise/icons`) — 24px action icons


### CSS Classes
- `.account-action-buttons` — Flex row container with no gap (buttons handle spacing internally)
- `.account-action-buttons .np-circular-btn` — Each button fixed at 100px width

### Notes
- On mobile (≤767px), the container switches to `width: 100%; justify-content: space-between` and each button uses `flex: 1`.
- The "Request" button uses the `Receive` icon from `@transferwise/icons`.

---

## AccountPageHeader

### Description
Shared header for CurrentAccount and CurrencyPage. Contains Wise logo avatar (or logo + flag `AvatarLayout` for currency), breadcrumb navigation, balance display, account details button, action buttons, and a `MoreMenu`.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'account' \| 'currency'` | Determines avatar and label style |
| `currencyCode` | `string?` | ISO currency code for flag (currency type only) |
| `label` | `string` | Account label (account type only) |
| `balance` | `string` | Formatted balance string |
| `accountDetails` | `string?` | Button label (defaults to "Account details") |
| `menuItems` | `{ label: string; onClick?: () => void }[]` | Items for MoreMenu |
| `onAccountDetailsClick` | `() => void?` | Account details button handler |
| `onBreadcrumbClick` | `() => void?` | Breadcrumb navigation handler |

### Structure
- **Header** (`.account-header`)
  - **Top row** — Avatar + label/breadcrumb (left), MoreMenu (right)
    - Account type: `AvatarView` (32px desktop / 48px mobile) with Wise logo SVG
    - Currency type: `AvatarLayout` (diagonal) with Wise logo + `Flag`
  - **Bottom row** — Balance (`h1`, 40px) + "Account details" `Button` (left), `AccountActionButtons` desktop (right)
  - **Mobile actions** — `AccountActionButtons` centered below (shown ≤767px)

### Design System Components Used
- `Button v2` (`@transferwise/components`) — Account details button (sm, secondary, with Bank + ChevronRight addons)
- `AvatarView` (`@transferwise/components`) — Wise logo avatar (32px desktop, 48px mobile)
- `AvatarLayout` (`@transferwise/components`) — Diagonal avatar for currency variant
- `IconButton` (`@transferwise/components`) — via `MoreMenu`
- `Flag` (`@wise/art`) — Currency flag
- `Bank`, `ChevronRight` (`@transferwise/icons`) — Button addon icons


### CSS Classes
- `.account-header` — Outer container, `padding-bottom: 32px`
- `.account-header__top-row` — Flex row: identity left, more menu right
- `.account-header__identity` — Flex row: avatar + label/breadcrumb, `gap: 16px`
- `.account-header__avatar-desktop` / `__avatar-mobile` — Responsive avatar wrappers (32px / 48px)
- `.account-header__label` — Secondary color label for account type
- `.account-header__breadcrumb` — Breadcrumb for currency type (secondary link → chevron → bold code)
- `.account-header__bottom-row` — Flex row: balance group left, action buttons right
- `.account-header__balance` — 40px bold heading
- `.account-header__actions-desktop` — Desktop action buttons (hidden ≤767px)
- `.account-header__actions-mobile` — Mobile action buttons (shown ≤767px)

### Notes
- Avatar size switches between 32px (desktop) and 48px (mobile) using responsive wrapper classes.
- On mobile, the header becomes vertically stacked and centered, with the MoreMenu positioned absolutely top-right.
- Balance uses a 40px font with -0.5px letter-spacing.
- Contains a private `WiseLogoIcon` SVG component (Wise "W" glyph).

---

## MoreMenu

### Description
Kebab "···" `IconButton` trigger with a positioned dropdown panel for additional actions. Used inside `AccountPageHeader`.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `{ label: string; onClick?: () => void }[]` | Menu items to display |

### Structure
- **Container** (`.more-menu`, relative positioned) — `ref` for click-outside
  - **Trigger** — `IconButton` (32px, tertiary) with `More` icon (16px)
  - **Dropdown** (`.more-menu__dropdown`, conditional) — Elevated panel, absolute positioned
    - **List** — `<ul>` of `<button>` items (14px bold, 8px border-radius)

### Behavior
- Toggle open/closed on trigger click
- Click-outside closes via `mousedown` event listener with `ref.contains()` check
- Clicking an item fires `onClick` and closes the menu

### Design System Components Used
- `IconButton` (`@transferwise/components`) — 32px tertiary trigger
- `More` (`@transferwise/icons`) — Kebab icon (16px)


### CSS Classes
- `.more-menu` — Relative container for dropdown positioning
- `.more-menu__dropdown` — Elevated panel (16px radius, 240px min-width, shadow in light mode)
- `.more-menu__list` — Unstyled list
- `.more-menu__item` — Full-width button with hover background

### Notes
- On mobile, the trigger `IconButton` scales to 40px with 24px icon via CSS overrides.
- Dark mode removes box-shadow from the dropdown.
- Uses `var(--color-background-elevated)` for the dropdown background.

---

## RecentContactCard

### Description
Contact card with a scaled 72px `AvatarView`, optional badge, name, and subtitle. Wrapped in a `Tooltip`. Used in the Recipients page recent contacts row and in the `Carousel` component.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Contact name (displayed + tooltip label) |
| `subtitle` | `string?` | Secondary text below name |
| `imgSrc` | `string?` | Avatar image URL |
| `initials` | `string?` | Fallback initials when no image |
| `badge` | `{ icon?: ReactNode; type?: 'action'; flagCode?: string }?` | AvatarView badge config |

### Structure
- **Tooltip** — `position="bottom"`, label = name
  - **Button** (`.recent-contact-card`) — 120×172px, rounded, hover bg
    - **Avatar wrapper** — `scale(1.222)` to render 72px avatar at ~88px visual size
      - `AvatarView` (72px) with optional badge
    - **Name** — `np-text-body-large`, 600 weight, ellipsis overflow
    - **Subtitle** — `np-text-body-default`, secondary color, ellipsis overflow

### Design System Components Used
- `Tooltip` (`@transferwise/components`) — Hover tooltip with contact name
- `AvatarView` (`@transferwise/components`) — 72px avatar with image or initials


### CSS Classes
- `.recent-contact-card` — Fixed 120×172px button, centered flex column, 16px border-radius
- `.recent-contact-card__avatar-wrapper` — `scale(1.222)` makes 72px avatar appear ~88px
- `.recent-contact-card__name` — Single-line ellipsis, 600 weight
- `.recent-contact-card__subtitle` — Single-line ellipsis, secondary color

### Notes
- The `scale(1.222)` on the avatar wrapper requires counter-scaling badge vars (`--badge-size: 19.6px`, `--badge-mask: 2.5px`) and badge icon (`scale(0.716)`) so they render at correct sizes after the parent scale.
- Cards are fixed-width (120px) — the parent layout (grid or flexbox) handles spacing.

---

## ThemeToggle

### Description
Fixed-position Sun/Moon `IconButton` for toggling between light and dark themes. Uses the `useTheme` hook from `@wise/components-theming`. Development utility, not a production component.

### Props
None — reads and writes theme state via `useTheme` hook.

### Structure
- **Container** (`.theme-toggle`) — Fixed position, bottom-right corner
  - `IconButton` (40px, secondary) — Sun icon (dark mode) or Moon icon (light mode)

### Design System Components Used
- `IconButton` (`@transferwise/components`) — 40px secondary toggle button
- `Sun`, `Moon` (`@transferwise/icons`) — 24px theme icons
- `useTheme` (`@wise/components-theming`) — Theme state management hook


### CSS Classes
- `.theme-toggle` — Fixed bottom-right (24px inset), z-index 999
- On mobile (≤767px), shifts to `bottom: 88px` to avoid overlap with `MobileNav`

### Notes
- Shows Sun when dark mode is active (toggle to light), Moon when light mode is active (toggle to dark).
- This is a development/prototype utility — not present in production Wise.

---

## InterestRateCard

### Description
Two-column card showing a currency's variable interest rate and returns amount. Displayed on the currency page sidebar (desktop) and above the segmented control (mobile) for currencies with active interest or stocks.

### Structure
- **Card** (`.interest-rate-card`) — Bordered container with 16px radius, two cells separated by a vertical divider
  - **Rate Cell** — Variable rate percentage (e.g. "3.26%") with "Variable rate" label below
  - **Divider** — 1px vertical line, 8px inset from top/bottom edges
  - **Returns Cell** — Returns amount with chevron (e.g. "+0.05 GBP >") with "Returns this month" label below. Clickable with hover state. Sentiment-positive color when positive, sentiment-negative when negative.
- **Disclaimer** — Small text below the card with interest provider details

### Data

| Field | Type | Description |
|-------|------|-------------|
| currency | `CurrencyData` | Currency object with `code`, `interestRate`, `hasStocks`, `hasInterest` |
| interestReturns | `number` (optional) | Interest returns amount, calculated from "Wise Interest" transactions |

### Visibility
- Shows when `currency.hasStocks || currency.hasInterest` is true AND `accountType === 'personal'`
- On desktop: in the sidebar, above the InterestListItem
- On mobile: above the segmented control, below action buttons

### Design System Components Used
- `ChevronRight` (`@transferwise/icons`) — 16px, inline with returns value
- DS typography: `np-text-body-default` for labels


### CSS Classes
- `.interest-rate-card` — Flex container, 1px neutral border, 16px radius. 82px fixed height on desktop/tablet.
- `.interest-rate-card__cell` — Flex column, centered content. Rate cell is flex: 45 (45% width).
- `.interest-rate-card__cell--clickable` — Returns cell, flex: 55 (55% width). Hover shows neutral bg.
- `.interest-rate-card__divider` — 1px vertical separator, 8px inset from top/bottom.
- `.interest-rate-card__value` — 18px/600 title style with -0.01em letter-spacing.
- `.interest-rate-card__chevron` — Inline flex wrapper for ChevronRight icon.
- `.currency-page__mobile-rate-card` — 40px bottom margin when card appears above segmented control on mobile.

### Notes
- The returns amount is computed from "Wise Interest" transactions in the data, matching the Insights page calculation.
- On mobile, the card and disclaimer sit above the segmented control (Transactions/Options), not inside the Options tab.
- On desktop, the card sits in the sidebar above the InterestListItem.
- The InterestListItem below the card uses `#9fe870` (brand light green) avatar background when interest is active.

---

## i18n System (Language Context)

### Description
Internationalisation system supporting English and Spanish. A React context holds the current language and provides a `t()` translation function. Two flat dictionaries (`en.ts`, `es.ts`) contain all UI strings keyed by `section.name` convention.

### Files
- `src/context/Language.tsx` — `LanguageProvider`, `useLanguage()`, `useTxLabels()`
- `src/translations/en.ts` — English dictionary (~280 keys), exports `TranslationKey` and `Translations` types
- `src/translations/es.ts` — Spanish dictionary, typed as `Translations` (compiler enforces matching keys)

### API

| Export | Type | Description |
|--------|------|-------------|
| `LanguageProvider` | Component | Wraps the app (outermost provider in App.tsx) |
| `useLanguage()` | Hook | Returns `{ language, setLanguage, t }` |
| `useTxLabels()` | Hook | Returns translated transaction subtitle labels for passing to `buildTransactions()` |
| `Language` | Type | `'en' \| 'es'` |

### Translation Function — `t(key, vars?)`

```ts
t('recipients.title')                           // → "Recipients"
t('accountCard.currency', { count: 4 })         // → "currencies" (plural)
t('accountCard.currency', { count: 1 })         // → "currency" (singular)
t('account.closeBusinessSub', { businessName }) // → "Close the business account for Berry Design."
```

Supports:
- Simple `{var}` interpolation
- ICU-like `{count, plural, one {x} other {y}}` syntax

### Key Conventions
- `nav.*` — Navigation labels
- `common.*` — Shared UI strings (Send, Add, Edit, etc.)
- `home.*`, `account.*`, `cards.*`, etc. — Page-specific strings
- `tx.*` — Transaction subtitle labels (Sent, Added, Moved, etc.)
- `settings.*` — Prototype settings drawer labels

### What Is NOT Translated
- Person/business names, recipient names, Wisetags, emails
- Transaction merchant names (Tesco, Amazon, Netflix)
- Currency codes (GBP, USD, EUR) and formatted amounts
- Brand terms ("Wise", "Wisetag")
- Membership numbers

### Notes
- Nav routing uses the English `label` field on `NavItem` for matching. A separate `translationKey` field is used for display only.
- Static menu item arrays store `TranslationKey` references (e.g. `titleKey`, `subtitleKey`) resolved with `t()` at render time.
- Transaction data builder functions accept a `TxTranslator` labels object to translate subtitles like "Sent", "Added by you".

---

## Button Cue

### Description
An animated spotlight container that wraps a primary action button. Provides a growing surface behind the button with an optional hint message above it. Used across all money flows (Add Money, Convert, Send, Request, Payment Link) to guide users toward the primary action.

### File
`src/components/ButtonCue.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `visible` | `boolean` | Whether the cue surface and hint are visible |
| `hint` | `ReactNode` | Optional hint content displayed above the button (typically an icon + text) |
| `children` | `ReactNode` | The button element to wrap |

### Structure
- **Surface** — Animated background that grows from bottom center (24px border-radius, 5px inset from edges)
- **Content** — Positioned above the surface, contains hint + button
- **Hint** — Centered row with icon + text, fades in with upward translate

### Behavior
- Surface appears with `scaleY(0.4) → scaleY(1)` spring animation when `visible` becomes true
- Hint text fades in with 100ms delay after surface
- Typically shown after 500ms delay on flow mount
- Hides when button enters loading state
- Re-appears when button returns to disabled state

### Button State Machine (used with ButtonCue)

```
User enters amount → disabled → loading (2s timer) → active
User clears amount → active → loading (2s timer) → disabled → cue re-appears
```

### Disabled Button Styling

When a button inside ButtonCue is disabled, it receives:
- `background-color: var(--color-background-neutral)` (grey, not green)
- `color: var(--color-content-secondary)`
- `border-color: transparent`
- `pointer-events: none`

This overrides the DS default disabled style.


### CSS Classes
- `.button-cue` — Relative container
- `.button-cue__surface` — Absolute background, grows from bottom with spring easing
- `.button-cue__content` — Relative z-index layer above surface
- `.button-cue__hint` — Flex row centered, icon + text
- `.button-cue--visible` — Triggers surface and hint animations

### Design System Components Used
- `Button v2` (size="lg", priority="primary", block) — The wrapped action button
- `InfoCircle` (`@transferwise/icons`) — Hint icon

---

## Recipient Search Empty State

### Description
Displays a helpful empty state when a recipient search returns no results. Shows the search query, search tips, and an "Add new recipient" action link. Used in Send and Request flows.

### File
`src/components/RecipientSearchEmpty.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `query` | `string` | The search query that returned no results |

### Structure
- **Title** — "We couldn't find '{query}'" (`np-text-title-subsection`)
- **Tips header** — DS `Header` with "Here are some tips"
- **Full details tip** — `ListItem` with Search icon, suggesting full name/email/phone
- **Add new tip** — `ListItem` with Recipients icon, suggesting adding a new recipient with an underlined link

### Design System Components Used
- `ListItem` + `ListItem.AvatarView` — Tip rows
- `Header` (`@transferwise/components`) — "Tips" section header
- `Search`, `Recipients` (`@transferwise/icons`) — Tip icons

### CSS Classes
- `.recipient-search-empty` — Container (24px top padding)
- `.recipient-search-empty__title` — Title with 24px top / 28px bottom margin
- `.recipient-search-empty__add-link` — Underlined button styled as link, uses `--color-interactive-primary`
- `.recipient-search-empty .np-avatar-view-content.np-circle` — Transparent background (outline style avatars)

---

## Flow Overlay (Shared Architecture)

### Description
All money flows (Add Money, Convert, Send, Request, Payment Link) share a common overlay architecture. Each flow takes over the full viewport as a fixed overlay.

### Files
- `src/flows/AddMoneyFlow.tsx`
- `src/flows/ConvertFlow.tsx`
- `src/flows/SendFlow.tsx`
- `src/flows/RequestFlow.tsx`
- `src/flows/PaymentLinkFlow.tsx`
- `src/flows/structure.md` — Architecture reference

### Shared Overlay CSS Pattern

```css
.{flow-name} {
  position: fixed;
  inset: 0;
  z-index: 100;         /* 1000 for request/payment-link */
  background: var(--color-background-screen);
  display: flex;
  flex-direction: column;
  overflow-y: auto;      /* or overflow: hidden for multi-step flows */
}

.{flow-name}__body {
  display: flex;
  flex-direction: column;
  max-width: 522px;      /* 668px for --wide variant */
  width: 100%;
  margin: 0 auto;
  padding: 40px 0 64px;
  flex: 1;
}

@media (max-width: 554px) {
  .{flow-name}__body {
    max-width: none;
    padding: 40px 16px 48px;
  }
}
```

### Header
- **With steps**: `FlowNavigation` from DS with step labels + avatar + close
- **Without steps**: `FlowNavigation` with empty `steps={[]}` (logo + avatar + close only)

### Account Avatar Styles (`AccountStyle`)

All flows receive an `accountStyle: AccountStyle` prop from `App.tsx` that drives currency selector icon + color for any account type. No hardcoded avatar styling in flow components.

```ts
type AccountStyle = { color: string; textColor: string; iconName: string };
```

| Account | `color` | `textColor` | `iconName` |
|---------|---------|-------------|------------|
| Personal | `var(--color-interactive-accent)` | `var(--color-interactive-control)` | `Wise` |
| Business | `#163300` | `#9fe870` | `Wise` |
| Taxes (Group) | `#FFEB69` | `#3a341c` | `Money` |
| Jar | jar's own color | `#121511` | jar's own icon (e.g. `Savings`, `Suitcase`) |

Style constants live in `AppInner` (`currentAccountStyle`, `taxesGroupStyle`, `jarStyle(jar)`). ConvertFlow also accepts `toAccountStyle` for cross-account conversions.

### Currency Selector Pattern

All flows use the same `ExpressiveMoneyInput.currencySelector.customRender` pattern:

```tsx
currencySelector={{
  customRender: ({ id, labelId }) => (
    <div id={id} aria-labelledby={labelId} className="wds-expressive-money-input-currency-selector">
      <Button v2 size="md" priority="secondary-neutral" className="wds-currency-selector"
        addonStart={{
          type: 'avatar',
          value: [
            { style: accountAvatarStyle, asset: accountIcon },
            { asset: <Flag code={currency} loading="eager" /> },
          ],
        }}
        addonEnd={{ type: 'icon', value: <ChevronDown size={16} /> }}
      >
        {currency}
      </Button>
    </div>
  ),
}}
```

### Props Pattern

All flows receive:
```ts
{
  defaultCurrency: string;
  accountLabel: string;
  jar?: 'taxes';
  onClose: () => void;
  accountType: AccountType;
  avatarUrl: string;
  initials: string;
  // ...flow-specific props
}
```

### Multi-Step Flow Track (Send & Request)

Send and Request flows use a horizontal track with two panels side by side. CSS `transform: translateX(-100%)` slides between steps:

```css
.{flow}__track {
  display: flex;
  flex: 1;
  width: 200%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.{flow}__track--step-{second} {
  transform: translateX(-50%);
}

.{flow}__panel {
  width: 50%;
  overflow-y: auto;
}
```

An `isAnimating` state hides scrollbars during the slide transition to prevent visual artifacts.

---

## Spotlight Card (Request Flow)

### Description
Custom bordered card buttons used in the Request flow's "Someone else" section. Two variants: default (Get a Wisetag) and active (Share a payment link). Features an animated SVG border with rounded corners.

### Structure
- **SVG Border** — `<rect>` with `rx="16"`, stroked with `--color-border-neutral` (1px) or `--color-interactive-primary` (active)
- **Avatar** — 32px `AvatarView` with icon
- **Label** — Bold body-large text
- **Chevron** — Right chevron for navigation

### CSS Classes
- `.request-flow__spotlight-card` — Flex row button, 16px border-radius, transparent background
- `.request-flow__spotlight-card--active` — Green border variant, uses `--color-interactive-primary` stroke
- `.request-flow__spotlight-border` — Absolute SVG overlay for the animated border

### Responsive
At `max-width: 768px`, the cards stack vertically instead of sitting side by side.

---

## Live Currency Rates

### Description
Context provider that simulates live exchange rate fluctuations for the prototype. Wraps the app and provides rates that update every 10 seconds with small random deltas.

### File
`src/context/LiveRates.tsx`

### Usage
```tsx
const rates = useLiveRates();
// rates is Record<string, number> e.g. { GBP: 1, EUR: 1.17, USD: 1.275, ... }
```

### Related
- `src/data/currency-rates.ts` — Base rates and `convertToHomeCurrency()` utility
- Used by `CurrentAccount` and `Home` to calculate total balances across currencies

---

## AccountDetailsList

### Description
Interstitial page showing a list of receivable currencies for the user's account. Each currency displays a flag avatar, translated name, and account identifier subtitle. Selecting a currency navigates to the AccountDetailsPage for that currency.

### File
`src/pages/AccountDetailsList.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `accountType` | `AccountType` | `'personal'` \| `'business'` (default `'personal'`) |
| `onSelectCurrency` | `(code: string) => void` | Called when a currency row is tapped |
| `accountCurrencyCodes` | `string[]` (optional) | Filters the list to only currencies the user holds |

### Structure
- **Title** — "Choose a currency to view your details"
- **Subtitle** — "Receive bank transfers from around the world. Learn more."
- **Currency rows** — `ListItem` with `ListItem.AvatarView` (48px flag), translated currency name, account number subtitle
- **"Receive other currencies"** — Plus icon row at the bottom (transparent avatar bg)

### Data
Two static arrays (`personalReceivableCurrencies`, `businessReceivableCurrencies`) define the available currencies with `code`, `nameKey`, `subtitle`, and optional `subtitleKey` for Swift-only currencies.

### Design System Components Used
- `ListItem` + `ListItem.AvatarView` + `ListItem.Navigation`
- `Plus` (`@transferwise/icons`)
- `Flag` (`@wise/art`)

---

## AccountDetailsPage

### Description
Full account details view for a specific currency showing bank details, copy-to-clipboard functionality, a share dropdown, and a Quick Facts sidebar with fees/speed/limits tabs and availability cards.

### File
`src/pages/AccountDetailsPage.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `code` | `string` | ISO currency code (e.g. `'GBP'`, `'EUR'`) |
| `accountType` | `AccountType` | `'personal'` \| `'business'` (default `'personal'`) |

### Structure
- **Header** — `AvatarView` (48px flag, transparent bg) + currency code + "Account details" subtitle
- **Desktop layout** — Two columns: main (flex) + sidebar (356px)
- **Mobile layout** — Single column: main → sidebar → footer

#### Main Column
- **Receive section** — "Receive {code}" heading + "From {region} and {N}+ countries" subtitle + Share dropdown
- **Details card** — Grey rounded card (24px radius) with `DetailRow` components for each field
- **Footer** — "Details not accepted? Tell us where or give us feedback"

#### DetailRow Component
Each row shows label, value (copyable), optional helper text with optional linked text. Copy button uses `Documents` icon (24px).

| Field | Description |
|-------|-------------|
| `labelKey` | Translation key for the field label |
| `value` | The account detail value string |
| `helperKey` | Optional helper text below the value |
| `helperLinkKey` | Optional linked text appended to helper |
| `copySnackbarKey` | Snackbar message shown after copy |

#### ShareDropdown Component
Split button with `Button v2` (primary, sm) + `ChevronDown`. Opens a dropdown panel with "Copy all details" and "Get proof of ownership" options. Uses `mousedown` event with `stopPropagation` for toggle behavior. Outside click dismisses via `useEffect` + `mousedown` listener.

#### QuickFacts Sidebar
- **Heading** — "Quick facts" (`np-text-title-body`, 18px)
- **Chip tabs** — Native `<div>` elements with `np-chip` / `np-chip--selected` DS CSS classes for Fees/Speed/Limits
- **FactCard** — Bordered card (16px radius, 16px 20px padding) with label (secondary color), bold value, optional helper (tertiary color, 12px `np-text-caption`). Clickable variant shows chevron + hover bg.
- **Availability section** — "Availability" heading (`np-text-title-body`) + array of availability cards

#### AvailabilityCard
Bordered card (16px radius, 12px 20px padding) with icon + title + optional subtitle:
- **Positive** — `CheckCircleFill` (16px, green `--color-sentiment-positive`)
- **Negative** — `CrossCircleFill` (16px, red `--color-sentiment-negative`)

Multiple cards stack with 8px gap.

### Data Layer
`src/data/account-details-data.ts` — Provides per-currency, per-account-type data:

```tsx
type CurrencyAccountDetailsData = {
  receiveSubtitleKey: TranslationKey;
  countriesLinkKey: TranslationKey;
  fields: (name: string) => AccountDetailField[];
  fees: QuickFactFee[];
  speeds: QuickFactFee[];
  limits: QuickFactFee[];
  availability: AvailabilityItem[];
};

type AvailabilityItem = {
  type: 'positive' | 'negative';
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
};
```

Supported currencies: GBP (personal/business), EUR (personal/business), USD (personal/business), CAD (personal), SGD (business).

### Currency-Specific Content

| Currency | Fees | Speed | Limits | Availability |
|----------|------|-------|--------|-------------|
| GBP | No fees (domestic) / 2.16 GBP (Swift) | Few minutes / 1 working day | No limits (150+ countries) | Direct Debits available |
| EUR | No fees (SEPA) / 2.39 EUR (Swift) | 1 working day / 1 working day | No limits (100+ countries) | SEPA Direct Debits available |
| USD | ACH is free / 6.11 USD (Swift) | 1-3 days / 1 working day | 50M USD / 100M rolling year | ACH debits available |
| CAD | No fees (domestic) / 6.16 CAD (Swift) | Few hours / 1 working day | No limits (150+ countries) | Pre-authorized debits ✓, Wire transfers ✗, OBT ✗ |
| SGD | No fees (domestic) / 5.34 SGD (Swift) | Few minutes / 1 working day | 200K SGD / No limits (outside) | No direct debits (FAST only) |

### CSS Classes
- `.account-details-page` — Container (padding-top: 8px)
- `.account-details-page__header` — Flex row, gap 8px, margin-bottom 24px
- `.account-details-page__desktop` — Two-column flex layout (gap 48px, hidden below 768px)
- `.account-details-page__mobile` — Single-column layout (hidden above 768px)
- `.account-details-page__main` — Flex 1, min-width 0
- `.account-details__card` — Grey card (neutral bg, 24px radius, padding 8px 4px)
- `.account-details__row` — Detail row (padding 12px 20px, flex between content and copy btn)
- `.account-details__copy-btn` — Transparent button, primary color, no hover bg
- `.account-details__sidebar` — Quick facts column (width 356px, 100% on mobile)
- `.account-details__fee-card` — Bordered card (16px radius, 16px 20px padding)
- `.account-details__fee-card--clickable` — Pointer cursor + neutral hover bg
- `.account-details__availability-card` — Bordered card (16px radius, 12px 20px padding)
- `.account-details__availability-card + card` — 8px margin-top gap

### Design System Components Used
- `Button v2` (primary, sm) — Share button
- `AvatarView` — Header flag avatar
- `useSnackbar` — Copy confirmation toasts
- `Documents`, `ChevronDown`, `ChevronRight`, `Download`, `CheckCircleFill`, `CrossCircleFill` (`@transferwise/icons`)
- DS Chip CSS classes (`np-chip`, `np-chip--selected`) — Tab selection
- `np-text-title-body` — Section headings (18px)
- `np-text-caption` (custom 12px token) — Helper text

---

## Success Screen (Theme-Switched)

### Description
A full-screen success/confirmation pattern used at the end of flows. Switches the entire flow to the `np-theme-personal--forest-green` Neptune theme for a distinctive celebratory feel.

### Key Implementation Details

**Theme switching:** Apply `np-theme-personal--forest-green` class to the flow's root element (not just the success panel) so the FlowNavigation bar also inherits the theme colors. Toggle it conditionally based on the current step.

```tsx
<div className={`my-flow${currentStep === successStep ? ' np-theme-personal--forest-green' : ''}`}>
  <FlowNavigation ... />
  ...
</div>
```

**Required CSS import** (add to `src/styles/global.css` theme imports):
```css
@import '@transferwise/neptune-tokens/themes/personal--forest-green/tokens.css';
```


### Layout
- Content centered vertically and horizontally in viewport
- Max-width 480px column
- Heading: `np-text-display-medium` (Wise Sans, 64px bold), uppercase with `letter-spacing: 0.02em`
- Subheading: 16px content default, `color: var(--color-content-secondary)`, 24px margin-bottom to button
- Single primary large button ("Done")
- No secondary button needed

### Theme Token Reference (forest-green)
| Token | Value |
|-------|-------|
| `--color-content-primary` | `#9fe870` (bright green) |
| `--color-content-secondary` | `#e8ebe6` |
| `--color-background-screen` | `#163300` (forest green) |
| `--color-interactive-accent` | `#9fe870` |

### Other Available Themes
- `personal--bright-green` — bright green background
- `business--forest-green` — business variant
- `platform--forest-green` — platform variant
