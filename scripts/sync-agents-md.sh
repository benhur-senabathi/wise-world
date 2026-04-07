#!/bin/bash
# Generates AGENTS.md files from CLAUDE.md files.
# Strips Claude-specific sections (MCP servers, Figma Make converter, On First Message)
# and keeps everything else — rules, architecture, data conventions, design system refs.
#
# Run manually:  bash scripts/sync-agents-md.sh
# Runs automatically via pre-commit hook when any CLAUDE.md changes.

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

HEADER="<!-- Auto-generated from CLAUDE.md by scripts/sync-agents-md.sh — do not edit directly -->"

# Sections to strip entirely (matched by ## heading text).
# Add new Claude-specific headings here as needed.
STRIP_SECTIONS=(
  "On First Message"
  "Figma Make (.make)"
  "Haptic Feedback"
)

strip_sections() {
  local input="$1"
  local result="$input"

  for heading in "${STRIP_SECTIONS[@]}"; do
    # Remove from "## <heading>" up to (but not including) the next "## " or EOF
    result=$(echo "$result" | awk -v h="## $heading" '
      BEGIN { skip=0 }
      $0 == h || index($0, h"\n") == 1 { skip=1; next }
      skip && /^## / { skip=0 }
      !skip { print }
    ')
  done

  echo "$result"
}

generate() {
  local claude_md="$1"
  local agents_md="$(dirname "$claude_md")/AGENTS.md"

  if [ ! -f "$claude_md" ]; then
    return
  fi

  local content
  content=$(cat "$claude_md")

  # Strip Claude-specific sections
  content=$(strip_sections "$content")

  # Remove any remaining references to claude/mcp that are inline
  # (keep the line but remove MCP install commands)
  content=$(echo "$content" | sed '/^claude mcp add/d')
  content=$(echo "$content" | sed '/^   claude mcp add/d')

  # Remove trailing blank lines
  content=$(echo "$content" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')

  # Write with header
  printf '%s\n\n%s\n' "$HEADER" "$content" > "$agents_md"
}

# All CLAUDE.md locations
CLAUDE_FILES=(
  "$REPO_ROOT/CLAUDE.md"
  "$REPO_ROOT/base-surfaces-mobile/CLAUDE.md"
  "$REPO_ROOT/base-surfaces-web/CLAUDE.md"
  "$REPO_ROOT/shared-resources/CLAUDE.md"
)

changed=0
for f in "${CLAUDE_FILES[@]}"; do
  if [ -f "$f" ]; then
    agents="$(dirname "$f")/AGENTS.md"
    old=""
    if [ -f "$agents" ]; then
      old=$(cat "$agents")
    fi

    generate "$f"

    new=$(cat "$agents")
    if [ "$old" != "$new" ]; then
      changed=1
      echo "Updated $(realpath --relative-to="$REPO_ROOT" "$agents" 2>/dev/null || echo "$agents")"
    fi
  fi
done

if [ "$changed" -eq 0 ]; then
  echo "All AGENTS.md files are up to date."
fi
