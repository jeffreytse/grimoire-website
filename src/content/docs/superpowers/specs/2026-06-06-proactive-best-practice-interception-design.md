# Design: Proactive Best Practice Interception

**Date:** 2026-06-06
**Status:** Approved

## Problem

Grimoire's meta skills are reactive. They fire only when a user explicitly describes a problem or seeks guidance. The core mission — "intercept the moment someone starts solving a problem and inject the right expert workflow" — is not met when users silently start doing something (e.g., "write me a migration", "help me design this API") without framing it as a problem.

Two gaps identified:
1. `suggest-best-practice` trigger misses imperative action requests
2. No proactive layer exists to intercept any action before it begins

## Approach

Two changes — clean separation of concerns:

1. **Broaden `suggest-best-practice` trigger** — covers imperative tasks, not just problem descriptions
2. **New `start-best-practice` skill** — proactive guardian that fires at the start of any action

## Change 1: Update `suggest-best-practice` Trigger

**File:** `skills/meta/skills/suggest-best-practice/SKILL.md`

**Change:** Append to `description` frontmatter field:

> "Also use when the user starts any task or action without explicitly asking for guidance."

No other changes to this skill.

## Change 2: New `start-best-practice` Skill

**File:** `skills/meta/skills/start-best-practice/SKILL.md`

### Frontmatter

```yaml
name: start-best-practice
description: Use at the start of ANY user task, action, or request — before taking any other action. Proactively checks whether an applicable best practice exists and applies or offers it before proceeding.
source: Toyota Production System poka-yoke (Shingo, 1986) — error prevention before the action, not after
tags: [proactive, interception, pre-action, best-practice-discovery, guardian, poka-yoke, quality-gate]
```

### Behavior

| Confidence | Action |
|---|---|
| ≥ 0.7 | Announce + apply the skill, then complete the original task |
| 0.4–0.69 | Brief offer: "A best practice exists for this: [skill]. Apply it first? [y/n]" |
| < 0.4 | Proceed silently — no announcement, no interruption |

### Steps

1. **Extract intent** (silent) — identify: task type, domain, operation (create/review/fix/design/write)
2. **Score candidates** (silent) — same model as `suggest-best-practice`:
   `(tag_overlap × 2) + (description_match × 3) + (domain_plausibility × 1)` — cap at top 3
3. **Route by confidence** — see table above
4. **Complete original task** — after skill applies, always complete the user's original request using skill output as context

### Rules

- Never block or announce when confidence < 0.4 — proceed silently
- Never apply two skills back-to-back without user confirmation
- Always complete the original request after skill application — don't abandon the task
- No browse mode — this is interception only, not discovery
- Don't announce "checking for best practices..." on every action — only announce on match

### Key Differences from `suggest-best-practice`

| | `suggest-best-practice` | `start-best-practice` |
|---|---|---|
| Trigger | User describes a problem | User starts any action |
| Low confidence | Asks clarifying question | Proceeds silently |
| After skill | Routes to skill | Applies skill, THEN completes original task |
| Browse mode | Supported | Not supported |
| Interrupts flow | Yes (it IS the flow) | Only at ≥ 0.4 confidence |

## Files to Create / Modify

| File | Change |
|---|---|
| `skills/meta/skills/suggest-best-practice/SKILL.md` | Append one sentence to `description` field |
| `skills/meta/skills/start-best-practice/SKILL.md` | Create new skill file |

## Verification

1. `suggest-best-practice` description includes "Also use when the user starts any task or action without explicitly asking for guidance."
2. `start-best-practice/SKILL.md` exists with correct frontmatter, steps, rules, and comparison table
3. Skill passes `review-best-practice-skill` criteria: actionable, scoped, industry-proven (poka-yoke), specific, complete
4. Both skills are listed in the grimoire domain — confirm `audit-best-practice-domain` sees the new skill
