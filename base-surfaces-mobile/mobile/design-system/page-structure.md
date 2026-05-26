# Mobile App Shell & Navigation

The canonical page structure for the Wise mobile prototype. Runs at 393px viewport inside a DeviceFrame iframe.

---

## Page Layout Shell

The app uses a single-column layout with fixed navigation chrome at top and bottom:

```
DeviceFrame (iPhone 17 Pro shell, ?mode=app iframe)
└── column-layout-main
    ├── IOSTopBar (fixed top, z-index 200)
    │   ├── Leading: avatar (Home) or back button (drill-down)
    │   ├── Center: scroll title (when scrolled)
    │   └── Trailing: contextual actions (Earn, eye, charts, etc.)
    ├── container-content (scrollable page area)
    │   └── PageTransition (push/pop slide animations)
    │       └── Page content (sections with --content-pad-x padding)
    └── MobileNav (fixed bottom, z-index 50)
        └── Home | Cards | Recipients | Payments
```

### CSS

```css
.column-layout-main {
  --content-pad-top: 120px;
  --content-pad-bottom: 80px;
  --content-pad-x: 16px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.container-content {
  flex: 1;
  padding: var(--content-pad-top) var(--content-pad-x) var(--content-pad-bottom);
}
```

### CSS Custom Properties

| Variable | Value | Purpose |
|----------|-------|---------|
| `--content-pad-top` | `112px` | Clearance for IOSTopBar |
| `--content-pad-bottom` | `80px` | Clearance for MobileNav |
| `--content-pad-x` | `16px` | Horizontal page padding |

These are also read by `.page-layer` during push/pop transitions so padding stays in sync automatically.

---

## Navigation Chrome

### IOSTopBar

Fixed header with Liquid Glass buttons. Contextual content changes per page:

| Page | Leading | Trailing |
|------|---------|----------|
| Home | Avatar | Earn pill + Eye toggle (personal) or Earn + Capsule[Graph\|Eye] (business) |
| Cards | Travel hub pill | Order a card pill |
| Recipients | — | Invite pill |
| Payments | — | — |
| Transactions (drill) | Back | Bar chart |
| Account (drill) | Back | Open an account pill |
| Currency/Account (drill) | Back | More menu |
| Account Details (drill) | Back | Flag |

See `ios-components.md` for full IOSTopBar component reference.

### MobileNav

Fixed bottom tab bar with 4 items. Animated highlight pill slides between tabs with liquid glass animation phases (glass up → slide → arrive → shrink).

Hidden on certain drill-down pages (Transactions, Insights) via conditional rendering in `App.tsx`.

See `ios-components.md` for full MobileNav component reference.

---

## Page Transitions

### Push/Pop (PageTransition)

iOS-style slide transitions when navigating between pages. Managed by `PageTransition` component wrapping content inside `container-content`.

During transition, two absolutely-positioned layers animate:
- **Push:** old page slides left 30% + dims, new page slides in from right
- **Pop:** reverse of push

During transition, `.column-layout-main` gets `overflow: hidden` and `padding-left/right: 0` via `:has(.page-layer)` selector. Layers provide their own horizontal padding.

See `ios-components.md` for full PageTransition component reference and how to add transitions to new navigations.

### Flow Overlays

All money flows slide up from the bottom as fixed overlays:

```css
.flow-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}
.flow-overlay--open {
  transform: translateY(0);
}
```

Managed in App.tsx with `flowVisible`/`flowAnimating` state. See `custom-components.md` for the full Flow Overlay architecture.

---

## Sub-Page Layout

Drill-down pages (CurrentAccount, CurrencyPage, AccountDetailsPage) use a single-column layout with a `SegmentedControl` for tab switching between content sections (e.g., Transactions/Options).

Content sections stack vertically. The Options tab contains cards, feedback, and quick facts.

---

## App.tsx Scaffold

```tsx
function App() {
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [subPage, setSubPage] = useState<SubPage | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'push' | 'pop' | null>(null);

  return (
    <div className="column-layout-main">
      <IOSTopBar
        name={name} initials={initials} avatarUrl={avatarUrl}
        showBack={!!subPage} onBack={handleSubPageBack}
        activeNavItem={activeNavItem} accountType={accountType}
        subPageType={subPage?.type} scrollTitle={scrollTitle}
      />
      <main className="container-content" id="main">
        <PageTransition
          direction={transitionDirection}
          onComplete={() => setTransitionDirection(null)}
        >
          {renderContent()}
        </PageTransition>
      </main>
      <MobileNav activeItem={activeNavItem} onSelect={handleNavSelect} />
    </div>
  );
}
```
