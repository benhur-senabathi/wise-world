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

## On First Message

Before doing anything else, check that the following MCP servers are available. If any are missing, tell the user which ones are missing and offer to help install them:

1. **Figma MCP** — required for reading Figma designs. Look for `figma` in the MCP server list.
2. **GitHub MCP** — required for pushing code, creating branches, and managing repos. Look for `github` in the MCP server list.
3. **Wise Design System (Storybook) MCP** — required for accessing Neptune component docs and props. Should be auto-configured via `.mcp.json` in this repo. If missing, install with:
   ```
   claude mcp add --transport http --client-id cdf3737dff9d485485968e50b63fd8b4 wise-design-system https://storybook.wise.design/mcp --scope project
   ```
