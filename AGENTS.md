<!-- Auto-generated from CLAUDE.md by scripts/sync-agents-md.sh — do not edit directly -->

# Base Surfaces

## Content & Writing

When the user asks you to write, review, or come up with content — UI copy, translations, button labels, error messages, snackbar text, modal copy, page descriptions, or any user-facing text — **read the writing guidelines first**:

1. Start with `shared-resources/content/writing-guidelines.md` — the master guide covering tone, grammar, vocabulary, and all component rules
2. For component-specific copy, also read the matching file in `shared-resources/content/components/` (e.g. `buttons.md` for button labels, `snackbars.md` for confirmation messages, `info-prompts.md` for error/warning/success text)
3. For vocabulary questions, check `shared-resources/content/vocabulary.md` for Wise-specific terminology and words to avoid

All content must follow Wise's tone of voice (concise, modern, energetic) and use British English spelling. See the guidelines for full rules.

## Universal Rules

1. **Verify Neptune components via MCP.** Before using any `@transferwise/components` component, call `list-all-documentation` then `get-documentation` from the Wise Design System MCP. Never guess props.
2. **shared-resources is the single source of truth** for data, account logic, and cross-platform design system docs.
3. **Import data via `@shared/data/`** (Vite alias). Only `src/data/nav.tsx` stays per-project.
4. **There are 2 projects**: `base-surfaces-web` (port 3002) and `base-surfaces-mobile` (port 3017).
5. **Everything must work with Account Registry and Datasets.** Never hardcode account types, navigation logic, or data structures. Use `getAccountBySubPageType()`, `getAccountById()`, `useVisibleAccounts()` from the registry. All data must respect the active dataset via `useActiveCurrencies()`, `useDatasetData()`. When building features, always check: "Does this work if I add a new account type?" and "Does this work if I switch datasets?"
