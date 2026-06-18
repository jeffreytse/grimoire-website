# Agent Interactive UI Reference

Canonical mapping of AI agent platform → interactive prompt tool.
Skill authors use this table to write platform-aware choice prompts.

## Platform Tool Map

| Platform | Tool | Schema |
|----------|------|--------|
| Claude Code | `AskUserQuestion` | `questions: [{question, header, options: [{label, description}], multiSelect}]` |
| Gemini CLI | `ask_user` | `type: "select"`, `options: [{label, value}]`, `default` |
| OpenCode | `question` | same schema as `AskUserQuestion`; users can also type a custom answer |
| Codex | *(none)* | plain numbered list + wait for user input |
| Cursor | *(none)* | plain numbered list + wait for user input |
| Copilot CLI | *(none)* | plain numbered list + wait for user input |
| OpenClaw | *(none)* | plain numbered list via chat message + wait for user reply |
| Other | *(none)* | plain numbered list + wait for user input |

## Canonical Template

Copy this block verbatim into SKILL.md wherever a skill presents choices to the user:

```markdown
**Platform-aware prompt:**
- **Claude Code**: use `AskUserQuestion` — mark top option with `(Recommended)` suffix, `multiSelect: false`
- **OpenCode**: use `question` — same schema as `AskUserQuestion`
- **Gemini CLI**: use `ask_user` — `type: "select"`, recommended option first
- **All other platforms** (Codex, Copilot, OpenClaw, etc.): plain numbered list, wait for user to type number or name:
  ```
  Options:
    1. [top option] ★ (recommended)
    2. [second option]
  Which? (Enter number or name)
  ```
```

## Single Yes/No Confirm

For binary confirm/skip prompts:

```markdown
**Platform-aware confirm:**
- **Claude Code**: `AskUserQuestion` with two options: `"[action]"` and `"Skip — continue without"`
- **OpenCode**: `question` with two options
- **Gemini CLI**: `ask_user` with `type: "confirm"`
- **Other**: `Apply [X]? [y/n — or just continue]`
```

## Rules for Skill Authors

1. **Never hardcode `[y/n]`** on Claude Code or Gemini CLI — use the native tool.
2. **Recommended option goes first** with `(Recommended)` in the label.
3. **Always include a skip option** — never force users to apply a practice.
4. **No multiSelect** for ordered skill sequences — one choice per step.
5. **Other platforms** get plain text fallback — no tool, no special formatting.
6. **`AskUserQuestion` max 4 options** — for choices with >4 options, use plain numbered list on ALL platforms, including Claude Code. Do not merge semantically distinct choices just to fit the cap.

## Quick Reference (for SKILL.md inline use)

When space is tight, use the short form:

```markdown
Collect choice via:
- Claude Code: `AskUserQuestion`
- OpenCode: `question`
- Gemini CLI: `ask_user`
- Other (Codex, Copilot, OpenClaw, etc.): numbered list, wait for input
```
