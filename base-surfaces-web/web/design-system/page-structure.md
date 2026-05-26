# Web App Shell & Navigation

The canonical page structure for Wise web prototypes. Every prototype should follow this layout to match production.

> **Component implementations:** See `custom-components.md` for SideNav, TopBar, MobileNav, and SidebarOverlay TSX + CSS.

---

## Page Layout Shell

The outer skeleton uses a max-width centered container with a two-column flex layout:

```
page-layout (max-width: 1440px, centered)
└── column-layout (flex row, min-height: 100vh)
    ├── column-layout-left (280px sidebar)
    │   └── nav-sidebar (sticky, 100vh)
    │       ├── nav-sidebar__top → Logo
    │       └── nav-sidebar__body → SideNav
    └── column-layout-main (flex: 1, margins)
        ├── TopBar (136px, right-aligned actions)
        └── container-content (main page area)
```

**Content starting point:** The first section inside `container-content` (e.g. TotalBalanceHeader) is the starting point for all page content. It has 16px top padding only, 0px bottom — this aligns it directly below the TopBar. All subsequent sections use `padding: 24px 0 16px` by default. This origin point is consistent across all surface types.

### CSS

```css
/* ===== Page Layout (matches production) ===== */

.page-layout {
  max-width: 1440px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--color-background-screen);
}

.column-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.column-layout-left {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.column-layout-main {
  flex: 1;
  min-width: 0;
  margin: 0 92px;
  padding: 0 44px;
  display: flex;
  flex-direction: column;
}

.container-content {
  flex: 1;
  padding-bottom: 64px;
}
```

---

## Responsive Layouts

The page shell adapts across three breakpoints matching production (`transferwise/navigation-web`).

### Breakpoints

| Viewport | Range | Layout |
|----------|-------|--------|
| Desktop | ≥992px | Static 280px sidebar + main content |
| Tablet | 768–991px | Sidebar hidden, hamburger in top bar triggers overlay sidebar + scrim |
| Mobile | <768px | Bottom tab bar (fixed), hamburger hidden, avatar-only account switcher, reduced padding |

### Layout Diagrams

**Desktop (≥992px)**
```
┌──────────────────────────────────────────────┐
│ page-layout (max-width: 1440px)              │
│ ┌──────────┬─────────────────────────────────┐│
│ │ sidebar  │ column-layout-main              ││
│ │ 280px    │ ┌─────────────── TopBar ───────┐││
│ │ (static) │ │ [hamburger hidden]    actions │││
│ │          │ └──────────────────────────────┘││
│ │  Logo    │ ┌──── container-content ───────┐││
│ │  SideNav │ │                              │││
│ │          │ │  Page content                │││
│ │          │ └──────────────────────────────┘││
│ └──────────┴─────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

**Tablet (768–991px)**
```
┌──────────────────────────────────┐
│ page-layout                      │
│ ┌────────────────────────────────┐
│ │ column-layout-main (full width)│
│ │ ┌──────────── TopBar ─────────┐│
│ │ │ [☰]                 actions ││
│ │ └─────────────────────────────┘│
│ │ ┌── container-content ────────┐│
│ │ │ Page content (padding: 24px)││
│ │ └─────────────────────────────┘│
│ └────────────────────────────────┘
│                                  │
│  Overlay (when hamburger tapped):│
│  ┌────────┬──────────────────────┐
│  │ 280px  │ scrim (click=close)  │
│  │ panel  │ rgba(0,0,0,0.6)     │
│  │ SideNav│                      │
│  └────────┴──────────────────────┘
└──────────────────────────────────┘
```

**Mobile (<768px)**
```
┌──────────────────────────┐
│ TopBar (88px height)     │
│                  actions │
├──────────────────────────┤
│                          │
│ container-content        │
│ (padding: 0 16px)        │
│ (padding-bottom: 80px)   │
│                          │
├──────────────────────────┤
│ MobileNav (fixed bottom) │
│ Home Cards [Send] Recip… │
└──────────────────────────┘
```

### Responsive CSS

```css
/* ===== Responsive: Desktop (≥992px) ===== */

@media (min-width: 992px) {
  .top-bar__hamburger { display: none; }
  .sidebar-overlay { display: none !important; }
  .mobile-nav { display: none !important; }
}

/* ===== Responsive: Tablet (768–991px) ===== */

@media (max-width: 991px) {
  .column-layout-left { display: none; }
  .column-layout-main { margin: 0; padding: 0 24px; }
  .top-bar { justify-content: space-between; }
  .top-bar__hamburger { display: flex; }
}

/* ===== Responsive: Mobile (<768px) ===== */

@media (max-width: 767px) {
  .column-layout-main { margin: 0; padding: 0 16px; }
  .top-bar { height: 88px; justify-content: flex-end; padding: 0 8px; }
  .top-bar__hamburger { display: none !important; }
  .account-switcher__name,
  .account-switcher .tw-icon,
  .account-switcher svg:not(.tw-avatar svg) { display: none; }
  .account-switcher { padding: 0; }
  .mobile-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 68px; z-index: 50;
    display: flex; justify-content: center;
    background: var(--color-background-screen);
    bottom: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .container-content { padding-bottom: 80px; }
}
```

---

## Sub-Page Desktop Layout

Inside `container-content`, drill-down pages (CurrentAccount, CurrencyPage, AccountDetailsPage) use a shared **two-column desktop layout** pattern. On mobile, this collapses to tabbed single-column with a `SegmentedControl`.

### Pattern

```
container-content
└── [PageComponent]
    ├── __desktop (hidden <768px)
    │   ├── __desktop-main (flex: 1, min-width: 0)
    │   │   └── Currencies + Transactions / Details card
    │   └── __desktop-sidebar (fixed width, flex-shrink: 0)
    │       └── Cards section / Quick Facts / Feedback
    └── __mobile (hidden ≥768px)
        ├── SegmentedControl tabs
        └── Tab panels (currencies / transactions / options)
```

### Dimensions

| Page | Sidebar Width | Gap | Breakpoint |
|------|--------------|-----|------------|
| CurrentAccount | 340px | 40px | 768px |
| CurrencyPage | 340px | 40px | 768px |
| AccountDetailsPage | 356px | 48px | 768px |

### CSS Pattern

```css
.{page}__desktop { display: none; }
.{page}__mobile { display: block; }

@media (min-width: 768px) {
  .{page}__desktop {
    display: flex;
    gap: 40px; /* or 48px for account details */
    align-items: flex-start;
  }
  .{page}__desktop-main { flex: 1; min-width: 0; }
  .{page}__desktop-sidebar { width: 340px; flex-shrink: 0; }
  .{page}__mobile { display: none; }
}
```

### Key Rules
- Desktop sidebar content (cards, feedback, quick facts) moves into the mobile **Options** tab
- The main column always contains currencies + transactions (or details card)
- Jar account pages use the same 2-column layout but with a simplified sidebar (feedback footer only)
- `align-items: flex-start` prevents the sidebar from stretching to match main column height

---

## App.tsx Scaffold

Minimal App.tsx assembling the shell with all components. See `custom-components.md` for the full TSX + CSS of each component.

```tsx
import { useState } from 'react';
import { Logo } from '@transferwise/components';
import { Agentation } from 'agentation';
import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';
import { SidebarOverlay } from './components/SidebarOverlay';
import { personalNav } from './data/nav';

function App() {
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Extract sidebar content for reuse in both static sidebar and overlay
  const sideNavContent = (
    <>
      <div className="nav-sidebar__top">
        <div className="nav-sidebar-brand">
          <a href="/home" onClick={(e) => e.preventDefault()}><Logo /></a>
        </div>
      </div>
      <div className="nav-sidebar__body">
        <SideNav items={personalNav} activeItem={activeNavItem}
          onSelect={(label) => { setActiveNavItem(label); setIsMobileMenuOpen(false); }} />
      </div>
    </>
  );

  return (
    <div className="page-layout">
      {import.meta.env.DEV && <Agentation />}
      <div className="column-layout">
        <div className="sidebar-container column-layout-left">
          <div className="nav-sidebar">
            {sideNavContent}
          </div>
        </div>

        <div className="column-layout-main">
          <TopBar name="Connor Berry" initials="CB" onMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="container-content" id="main">
            {/* Page content goes here */}
          </main>
        </div>
      </div>

      <SidebarOverlay isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
        <div className="nav-sidebar">{sideNavContent}</div>
      </SidebarOverlay>

      <MobileNav activeItem={activeNavItem} onSelect={setActiveNavItem} />
    </div>
  );
}

export default App;
```
