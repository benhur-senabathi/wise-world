# Figma References

Links to Wise design system Figma libraries for visual reference.
These are secondary to the npm package source — use for visual browsing and design specs only.

## Libraries

| Library | Figma URL |
|---------|-----------|
| Colours | https://figma.com/design/wBcGTDx784k5j7DRdZtKnJ |
| Interaction | https://figma.com/design/FzBRLc9xAzmuGILr22ANT9 |
| Primitives | https://figma.com/design/7k73K6Ek86Q0j7swCovYXq |
| Global tokens | https://figma.com/design/EoexTw3BqfylHgPclM4CoK |
| Components | https://figma.com/design/m5DkwaGFvqd44KsyXhb4ng |
| Custom components | https://figma.com/design/ygaLIN2SAMrzNGAOhRuZ1u |

## Custom Components Detail

The **Custom components** library includes:
- Balance card (Mobile and Desktop variants)
- Hover states
- Additional Wise-specific patterns not in the core DS

## Usage with Claude Code

1. Copy a Figma frame URL (with `node-id` parameter)
2. Claude Code uses Figma MCP `get_design_context` to pull the design
3. Components are mapped to `@transferwise/components` imports
4. Code generated in the prototype project using real DS components
