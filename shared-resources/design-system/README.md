# Shared Design System Documentation

This directory contains design system documentation shared across both Base Surfaces prototypes (web and mobile).

## What's Shared

These docs are platform-agnostic or common enough to be referenced by both projects:

| Doc | Contents |
|-----|----------|
| `icons.md` | Icon usage, sizes, color contexts, @transferwise/icons reference |
| `flags-and-art.md` | @wise/art Flag and Illustration usage (CDN-based) |
| `components.md` | Neptune component inventory and usage patterns (React) |
| `tokens.md` | Neptune color, typography, spacing tokens (CSS variables) |
| `neptune-css.md` | Neptune CSS utilities, modifiers, and patterns |
| `figma-references.md` | Figma file references and design tokens |
| `illustration-3d.md` | 3D illustration usage and available names |
| `utilities.md` | CSS utility classes |
| `setup.md` | Project setup reference |

## What's Project-Specific

Each project maintains its own `design-system/` directory for platform-specific overrides and custom components:

### base-surfaces-web
- `custom-tokens.md` — web-specific token extensions
- `custom-components.md` — web custom components
- `page-structure.md` — web layout shell and CSS custom properties

### base-surfaces-mobile
- `tokens.md` — **DIFFERENT from shared** (mobile has additional tokens)
- `custom-tokens.md` — mobile-specific tokens
- `custom-components.md` — mobile home page components
- `custom-components-account.md` — account & currency page components
- `custom-components-flows.md` — flow overlays and patterns
- `ios-components.md` — iOS-specific components (liquid glass, DeviceFrame)
- `ios-context.md` — iOS-specific context
- `neptune-css.md` — **DIFFERENT from shared** (includes MAKE_OVERRIDES)
- `page-structure.md` — mobile layout specifics

## Routing Pattern

Each project's `CLAUDE.md` references this shared directory using relative paths:

```markdown
## Design System Reference

Shared cross-platform docs in `../shared-resources/design-system/`:
- `icons.md`, `flags-and-art.md`, `components.md`, etc.

[Platform]-specific design system docs in `[path]/design-system/`:
- Custom tokens, custom components, platform-specific patterns
```

## Benefits

- **Single source of truth** for Neptune core docs (icons, flags, components, tokens)
- **-780 lines** of duplication removed
- **Easier maintenance** — update once, affects all projects
- **Clear separation** — shared vs. platform-specific is explicit
- **Mirrors data structure** — same pattern as `shared-resources/data/` and `shared-resources/account-logic/`
