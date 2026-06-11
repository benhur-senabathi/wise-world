# Card Images Reference

## Three Separate Card Image Systems

**CRITICAL:** There are **THREE** card image systems — confusing them breaks the UI.

---

### 1. Cards Tab Images (`getCards()` → `CardDefinition.image`)

**Purpose:** Full card images for the **Cards page/tab** (mobile + web)

**Location:** `getCards()` in `account-registry.ts` returns `CardDefinition[]`

**Image paths:** `/wise-card-*.png` in `/public/` (1192×752px)

**ONLY used on:** The Cards tab/page. NEVER in MCA, NEVER in homeCard.

**Types:**
- Physical: `/wise-card-physical.png`, `/wise-card-biz-physical.png`
- Digital: `/wise-card-personal-digital-{color}.png`, `/wise-card-biz-digital-{color}.png`

---

### 2. MCA Top Image (tapestry strip) — `homeCard.cardTopImage`

**Purpose:** The **narrow card strip** at the top of the MCA card on Home (shows card pattern/tapestry)

**Location:** `homeCard.cardTopImage` in `account-registry.ts`

**Image source:** `src/assets/card-tapestry-*.jpg` files (small cropped patterns)

**Resolution flow:**
1. Registry stores a key like `/card-tapestry.jpg`
2. `resolveAsset()` in `Home.tsx` maps it to the actual Vite asset import
3. MCA component renders it as the top strip

**Default (if NOT specified):**
- Business accounts → `card-tapestry.jpg` (physical/iridescent)
- Personal accounts → `card-tapestry-turquoise.jpg` (digital turquoise)

**Available tapestry assets:**
```
card-tapestry.jpg            ← physical card (iridescent green/blue pattern)
card-tapestry-turquoise.jpg  ← digital turquoise
card-tapestry-fire.jpg       ← digital orange/fire
card-tapestry-orange.jpg     ← digital orange
card-tapestry-green.jpg      ← digital green
card-tapestry-green-new.jpg  ← digital green (new)
card-tapestry-blue.jpg       ← digital blue
card-tapestry-pink-blue.jpg  ← digital pink/blue
card-tapestry-pink-yellow.jpg
card-tapestry-red-blue.jpg
card-tapestry-biz-aqua.jpg   ← business aqua
card-tapestry-biz-green.jpg  ← business green
card-tapestry-biz-yellow.jpg ← business yellow
```

---

### 3. MCA Bottom Image (card face) — `homeCard.cardBottomImage`

**Purpose:** The **card face** shown below the tapestry strip in MCA

**Location:** `homeCard.cardBottomImage` in `account-registry.ts`

**Image source:** `src/assets/card-green.jpg` (default) or public `-bg.png` files

**Default (if NOT specified):** `card-green.jpg` — the standard Wise green card face

---

### Asset Map (`resolveAsset` in Home.tsx)

**CRITICAL:** When adding a new `homeCard.cardTopImage` or `homeCard.cardBottomImage` path that references an asset in `src/assets/`, you MUST also add it to the `assetMap` in `Home.tsx`:

```typescript
const assetMap: Record<string, string> = {
  '/card-tapestry.jpg': new URL('../assets/card-tapestry.jpg', import.meta.url).href,
  '/card-tapestry-orange.jpg': new URL('../assets/card-tapestry-orange.jpg', import.meta.url).href,
  '/card-tapestry-green.jpg': new URL('../assets/card-tapestry-green.jpg', import.meta.url).href,
  // ADD NEW ENTRIES HERE when using new asset paths in registry
};
```

Without this mapping, the path string is passed directly as `src` — which won't resolve for Vite-bundled assets.

---

## Rules

1. **NEVER use Cards tab images (`/wise-card-*.png`) in `homeCard`** — wrong size, wrong purpose
2. **Physical cards use the MCA DEFAULT** — don't set `cardBottomImage` at all. The component default `card-green.jpg` IS the correct physical card appearance in MCA.
3. **Digital cards use their matching `card-tapestry-{color}.jpg`** for the top strip
4. **Default `cardBottomImage` is `card-green.jpg`** — only override for non-green card faces (digital cards)
5. **`cardInfoLight: true`** for dark/colorful backgrounds, `false` for light/green backgrounds
6. **Always add new asset paths to `assetMap`** in Home.tsx (both mobile and web)
7. **Derivation logic in Home.tsx** only falls back to `getCards()` images for DIGITAL cards. Physical cards let MCA use its built-in defaults. This prevents Cards tab PNGs from leaking into MCA.

---

## Current Account Types

| Account | Cards Tab Image | MCA Top (tapestry) | MCA Bottom (face) | Info Light |
|---------|----------------|--------------------|--------------------|------------|
| **Current Account** | `/wise-card-physical.png` | Default (turquoise) | Default (`card-green.jpg`) | `false` |
| **Young Explorer** | `/wise-card-physical.png` | `/card-tapestry.jpg` (physical) | Default (`card-green.jpg`) | `false` |
| **Shared Spending** | digital fire | `/card-tapestry-orange.jpg` | `/card-tapestry-green.jpg` | `true` |
| **Joint Account** | physical | Default | Custom `-bg.png` | varies |
| **Group (Taxes)** | digital green-yellow | varies | Custom `-bg.png` | `true` |

---

## Adding a New Account with Cards

1. **Choose Cards tab image** (`getCards()`)
   - Physical? → `/wise-card-physical.png`
   - Digital? → `/wise-card-personal-digital-{color}.png`

2. **Choose MCA top tapestry** (`homeCard.cardTopImage`)
   - Physical? → `/card-tapestry.jpg`
   - Digital? → `/card-tapestry-{color}.jpg`
   - Or omit to use the default (turquoise for personal, physical for business)

3. **Choose MCA bottom face** (`homeCard.cardBottomImage`)
   - Usually omit (uses default green card face)
   - Override only for custom backgrounds

4. **Add to `assetMap`** in Home.tsx if using a new asset path

5. **Set `cardInfoLight`** based on background brightness
