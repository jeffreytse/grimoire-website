# Design: Audit Applied Practices + Preference Persistence

**Date:** 2026-06-06
**Status:** Approved

## Problem

Grimoire's routing skills (`suggest-best-practice`, `start-best-practice`, `review-best-practice-fit`) have no awareness of practices already in use or intentionally chosen by the user. They will suggest alternatives even for practices the user has deliberately adopted. This breaks trust and creates noise.

Two missing capabilities:
1. **Applied practice inventory** — scan existing work to map which practices are already in use
2. **Preference memory** — persist user's intentional choices so routing skills respect them

## Approach: Integrated Audit + Live Preference Pinning

Single skill (`audit-applied-best-practices`) handles both: scan → report → interactive pinning → write preferences file. Routing skills check preferences before scoring.

---

## New Skill: `audit-applied-best-practices`

**File:** `skills/meta/skills/audit-applied-best-practices/SKILL.md`

### Frontmatter

```yaml
name: audit-applied-best-practices
description: Use when the user wants to inventory which best practices are already applied in their existing work — codebase, document, design, or any artifact — and pin intentional choices as preferences that routing skills will respect.
source: ISO 9001 gap audit standards; Nielsen Norman Group contextual inquiry methodology
tags: [audit, inventory, applied-practices, preference, existing-work, context-awareness, onboarding]
```

### Steps

**1. Detect work type** (silent)
Auto-classify the artifact:

| Signal | Type |
|---|---|
| `.git` directory present | Codebase |
| Single document / paste | Document |
| Multiple heterogeneous files | Mixed artifact |
| User describes domain verbally | Verbal description |

**2. Extract signals**

| Work type | Where to look |
|---|---|
| Codebase | File structure, package.json / Gemfile / go.mod, CI config, test patterns, commit messages (last 50), linter configs, folder conventions |
| Document | Structure, section headings, terminology, citation style, formatting conventions |
| Mixed / verbal | Ask one targeted question per ambiguous area |

**3. Match signals to grimoire skills**

Score each detected pattern using the `suggest-best-practice` scoring model:
`(tag_overlap × 2) + (description_match × 3) + (domain_plausibility × 1)`

Only surface matches scoring ≥ 0.5. Group by domain.

**4. Report applied practices**

Present findings grouped by domain with confidence marker:

```
Applied practices detected:

✓ engineering/testing      write-unit-test             Jest, co-located test files
✓ engineering/development  propose-conventional-commit  detected in git log (last 50 commits)
✓ engineering/devops       design-ci-pipeline           GitHub Actions workflow detected
? engineering/architecture no clear pattern found
? engineering/security     no clear pattern found
```

**5. Interactive preference pinning**

For each ✓ result, ask:
```
Pin "write-unit-test (Jest)" as your intentional choice for engineering/testing?
[y] pin it  [n] skip  [r] add a reason
```

For ? results, optionally ask:
```
engineering/architecture has no detected practice. Want to specify one now?
[y] choose  [n] skip
```

**6. Write preferences file**

Ask user where to write pinned preferences:
```
Save preferences to:
  [1] This project only  → <project-root>/.grimoire/preferences.md
  [2] All my projects    → ~/.grimoire/preferences.md (global)
  [3] Both
```

Write to selected location(s). Append if file exists — never overwrite existing pins without confirmation.

---

## Preference Files: Multi-Level Hierarchy

### Levels (precedence: project > global)

| Level | Path | Scope |
|---|---|---|
| **Project** | `<project-root>/.grimoire/preferences.md` | Overrides global for same domain |
| **Global** | `~/.grimoire/preferences.md` OR `~/.config/grimoire/preferences.md` | Applies to all projects |

Resolution order for any domain:
1. Check project-level file — if pin exists, use it
2. Check global-level file — if pin exists, use it
3. No pin → proceed with normal scoring

XDG compliance: prefer `~/.config/grimoire/preferences.md` if `XDG_CONFIG_HOME` is set; fall back to `~/.grimoire/preferences.md`.

### Format (identical at both levels)

```markdown
# Grimoire Practice Preferences

<!-- Intentional choices. Routing skills will not suggest alternatives for pinned practices. -->

## engineering/testing
- write-unit-test: Jest, co-located test files
  reason: team standard, enforced in CI

## engineering/development
- propose-conventional-commit: enforced in CI
  reason: required for semantic-release

## finance/personal-finance
- calculate-fire-number: 3.5% withdrawal rate
  reason: conservative preference
```

**Global fallback:** Add a `## Grimoire Preferences` section in CLAUDE.md as a legacy fallback. Prefer the dedicated `~/.grimoire/preferences.md` or `~/.config/grimoire/preferences.md` for global preferences — the file-based approach works across all AI agents, not just Claude Code.

---

## Updates to Routing Skills

Three skills get a new **Step 0** prepended before any scoring logic:

**Files to update:**
- `skills/meta/skills/suggest-best-practice/SKILL.md`
- `skills/meta/skills/start-best-practice/SKILL.md` *(new skill from prior spec)*
- `skills/meta/skills/review-best-practice-fit/SKILL.md`

**Step 0 text (identical in all three):**

```
### Step 0: Check preferences (silent)

Resolution order — first match wins:
1. `<project-root>/.grimoire/preferences.md` — project-level (highest precedence)
2. `~/.config/grimoire/preferences.md` OR `~/.grimoire/preferences.md` — global-level
3. `CLAUDE.md` `## Grimoire Preferences` section — legacy fallback

For the relevant domain, check if a practice is already pinned:
- **Pinned match** → apply the pinned practice directly; skip scoring entirely.
- **Pinned conflict** → warn before suggesting an alternative:
  `"You have [X] pinned for [domain]. Suggest changing it? [y/n]"`
- **No pin** → proceed with normal scoring.
```

---

## Files to Create / Modify

| File | Change |
|---|---|
| `skills/meta/skills/audit-applied-best-practices/SKILL.md` | Create new skill |
| `skills/meta/skills/suggest-best-practice/SKILL.md` | Add Step 0 (preference check) |
| `skills/meta/skills/start-best-practice/SKILL.md` | Add Step 0 when created (see prior spec) |
| `skills/meta/skills/review-best-practice-fit/SKILL.md` | Add Step 0 (preference check) |
| `.grimoire/preferences.md` | Created at runtime by the skill, not committed to grimoire repo |

---

## Verification

1. `audit-applied-best-practices` skill exists with correct frontmatter, all 6 steps, detection table, and report format
2. Running `/audit-applied-best-practices` on a test codebase produces a grouped report with ✓/? markers
3. After pinning, `.grimoire/preferences.md` is written with correct format
4. `suggest-best-practice` Step 0 exists — skips scoring for pinned domains
5. `review-best-practice-fit` Step 0 exists — warns on conflict before suggesting alternatives
6. CLAUDE.md global fallback documented in the preference file format
