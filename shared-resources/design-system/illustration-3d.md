# 3D Illustrations in Base Surfaces

## Summary

Base Surfaces **SUPPORTS** 3D animated illustrations via `<Illustration3D>` from `@wise/art`. Use them freely in your prototypes!

3D animations work in:
• ✅ Localhost development
• ✅ Production builds
• ❌ Figma Make (automatically falls back to static)

## How to Use 3D Illustrations

```tsx
import { Illustration3D } from '@wise/art';

<Illustration3D name="confetti" size="large" />
<Illustration3D name="marble-card" size="medium" />
<Illustration3D name="interest" size="large" />
```

Available 3D names: `lock`, `globe`, `confetti`, `check-mark`, `flower`, `graph`, `jars`, `magnifying-glass`, `marble`, `marble-card`, `multi-currency`, `plane`, `interest`

## Dependencies (Already Installed)

The three.js dependencies are already installed as dev dependencies:
• `three@0.164.0`
• `@react-three/fiber@8.18.0` (React 18) or `@9.5.0` (React 19)
• `@react-three/drei@9.122.0` (React 18) or `@10.7.7` (React 19)

The Vite config includes `optimizeDeps` to ensure proper module loading.

## Figma Make Conversion

When converting to Figma Make, 3D illustrations **automatically fall back to static**:
• The make-converter strips `Illustration3D` imports → replaces with `Illustration`
• Converts `<Illustration3D name="confetti">` → `<Illustration name="confetti">`
• This ensures Make files work without WebGL/Canvas errors

### Why 3D Doesn't Work in Make

Figma Make's sandboxed environment cannot support WebGL Canvas context:
• "R3F: Hooks can only be used within the Canvas component"
• "Multiple instances of Three.js being imported"
• "THREE.WebGLRenderer: Context Lost"

The automatic fallback solves this transparently.

## Static Illustrations

You can also use static 2D illustrations directly:
```tsx
import { Illustration } from '@wise/art';

<Illustration name="briefcase" size="large" />
```

Check `node_modules/@wise/art/src/illustrations/metadata.ts` for 100+ static illustration names.

## Recommendation

**Use `<Illustration3D>` for celebration/success moments** where animation adds delight. The make-converter ensures it works everywhere.
