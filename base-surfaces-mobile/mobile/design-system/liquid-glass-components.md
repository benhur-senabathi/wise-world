# Liquid Glass Components

Standalone liquid glass components for the mobile prototype. These go beyond the navigation chrome buttons documented in `ios-components.md` — they are reusable interactive surfaces with spring physics, blur, and layered glass effects.

## Component Inventory

| Component | File | Purpose |
|-----------|------|---------|
| `LiquidGlassButton` | `src/components/LiquidGlassButton.tsx` | Pill-shaped glass button (primary/secondary) |
| `LiquidGlassIconButton` | `src/components/LiquidGlassIconButton.tsx` | Circle or capsule icon button |
| `LiquidGlassSegmentedControl` | `src/components/LiquidGlassSegmentedControl.tsx` | Segmented control with glass thumb |
| `LiquidGlassSwitch` | `src/components/LiquidGlassSwitch.tsx` | Toggle switch with glass thumb |
| `LiquidGlassContainer` | `src/components/LiquidGlassContainer.tsx` | Interactive glass card/panel |
| `LiquidGlassTransform` | `src/components/LiquidGlassTransform.tsx` | Morphing glass surface (button → card) |
| `LiquidGlassTabBar` | `src/components/LiquidGlassTabBar.tsx` | Generic tab bar with sliding glass thumb |

---

## When to Use Liquid Glass vs Neptune Components

### Rules

1. **IOSTopBar and FlowHeader buttons** — always use `LiquidGlassButton` / `LiquidGlassIconButton`. Never use Neptune `<Button>` in the fixed navigation chrome.
2. **Segmented controls in the navigation chrome or glass surfaces** — use `LiquidGlassSegmentedControl`. Do NOT use the Neptune `<SegmentedControl>` from `@transferwise/components` in these contexts.
3. **Switches on glass surfaces or iOS-style settings** — use `LiquidGlassSwitch`. Do NOT use Neptune's built-in toggle/checkbox.
4. **Page content buttons, CTAs, form actions** — use Neptune `<Button>`. Never use liquid glass buttons inside scrollable page content.
5. **Segmented controls in page content (filters, tabs within a page)** — use Neptune `<SegmentedControl>`. Only use the liquid glass version when it's part of a glass surface or the navigation chrome.

### Decision Table

| Context | Component to Use |
|---------|-----------------|
| Top bar (IOSTopBar) | `LiquidGlassButton`, `LiquidGlassIconButton` |
| Flow headers (FlowHeader) | `LiquidGlassButton`, `LiquidGlassIconButton` |
| Bottom tab bar | `MobileNav` (has its own glass) or `LiquidGlassTabBar` |
| Glass container or overlay surface | `LiquidGlassSegmentedControl`, `LiquidGlassSwitch` |
| Showcase / demonstration page | Any liquid glass component |
| Page content (scrollable area) | Neptune `<Button>`, `<SegmentedControl>` |
| BottomSheet actions | Neptune `<Button>` |
| Form inputs and toggles in page content | Neptune components |

---

## Two Surface Recipes

There are two distinct glass surface treatments. Never mix them.

### Button Recipe (LiquidGlassButton, LiquidGlassIconButton, TabBar thumb)

- Surface fill: 65% white, no blend modes
- Backdrop blur: 4px
- Border: asymmetric — 0.75px top/left, 0.5px bottom/right at `rgba(255,255,255,0.75)`
- Inner glow: `inset 0 2px 10px rgba(255,255,255,0.65)`
- Shadow: `0 2px 28px rgba(0,0,0,0.065), 0 8px 44px rgba(0,0,0,0.045)`
- Spring physics: snappy (`pressScale: 0.11`, `pressSpring: 0.25`, `pressDamp: 0.55`)

### Container Recipe (LiquidGlassContainer, LiquidGlassTransform)

- Surface fill: 86% white (light), `rgba(42,44,41,0.55)` (dark)
- Blend layers: color-burn + darken on separate elements
- Backdrop blur: 8px
- Border: 1px solid `rgba(255,255,255,0.4)` with inset glow
- Shadow: `0 4px 16px rgba(0,0,0,0.1)` (light), `0 8px 40px rgba(0,0,0,0.25)` (dark)
- Spring physics: soft (`pressScale: 0.04`, `pressSpring: 0.05`, `pressDamp: 0.75`)
- Flash on press: `rgba(255,255,255,0.15)` radial gradient at touch point

---

## Keeping Container and Transform in Sync

Container and Transform MUST always share the same surface styles. The CSS uses combined selectors:

```css
.lg-container__surface,
.lg-transform__surface { ... }

.lg-container__surface-burn,
.lg-transform__surface-burn { ... }
```

When updating any surface property on one, it automatically applies to both. **Never create separate rules for container vs transform surfaces.** The same applies to dark mode overrides — always use the combined selector pattern.

---

## useLiquidGlass Hook

**File:** `src/hooks/useLiquidGlass.ts`

Shared spring-physics hook used by all liquid glass components. Returns `{ ref, isPressed, onPointerDown, onPointerMove, onPointerUp }`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `axis` | `'both' \| 'vertical'` | `'both'` | Constrain drag direction |
| `pressScale` | `number` | `0.11` | Scale change on press |
| `pressSpring` | `number` | `0.25` | Spring stiffness for press |
| `pressDamp` | `number` | `0.55` | Damping for press spring |

### Presets

- **Buttons/TabBar:** `{ pressScale: 0.11, pressSpring: 0.25, pressDamp: 0.55 }` — snappy, responsive
- **Containers/Transform:** `{ pressScale: 0.04, pressSpring: 0.05, pressDamp: 0.75 }` — soft, subtle

---

## Dark Mode

All liquid glass components support dark mode via CSS class selectors (e.g. `html.np-theme-personal--dark`). Key differences:

### Buttons (dark mode)
- Surface fill: 7%
- Border: 8% opacity
- Shadow: removed entirely (parent `box-shadow: none`)
- Flash on press: 50% white
- Text/icons: `color: #fff` (secondary), `var(--color-interactive-control)` (accent/primary)

### Containers (dark mode)
- Surface fill: `rgba(42,44,41,0.55)`
- Burn layer: `rgba(40,40,40,0.4)`
- Darken layer: `rgba(20,20,20,0.4)`
- Border: `rgba(255,255,255,0.10)` with reduced inset glow
- Shadow: `0 8px 40px rgba(0,0,0,0.25)`

---

## Design System Tokens Used

All components use design system tokens — no hardcoded colours except for press/flash effects.

| Token | Usage |
|-------|-------|
| `--color-interactive-primary` | Default icon/text colour in buttons, segmented control text |
| `--color-interactive-control` | Accent button text/icon colour (stays dark in both themes) |
| `--color-interactive-accent` | Accent button background |
| `--color-interactive-secondary` | Switch track (off state) |
| `--color-background-screen` | Segmented control thumb at rest |
| `--color-background-neutral` | Tab bar thumb at rest, transform close button bg |
| `--color-content-primary` | Container/transform text, close button icon |
| `--font-size-14` | Button label, container text |
| `--line-height-20` | Button label line height |
| `--font-weight-semi-bold` | Button labels |
| `--font-family` | All text in glass components |

