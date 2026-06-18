# Proactive Interception & Audit Applied Practices — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the two remaining Grimoire meta-skill gaps: (1) proactive best-practice interception before any user action, and (2) inventory + persistent memory of a user's intentional practice choices so routing skills never override them.

**Architecture:** Five file changes across the grimoire meta domain — one new skill (`start-best-practice`), one new skill (`audit-applied-best-practices`), and Step 0 (preference-check) prepended to three routing skills. All skill files are plain Markdown following the Grimoire SKILL.md format.

**Tech Stack:** Markdown (SKILL.md format), grimoire skill standard (STANDARD.md)

---

## File Map

| File | Action |
|------|--------|
| `skills/meta/skills/suggest-best-practice/SKILL.md` | Modify — append to `description`, prepend Step 0 |
| `skills/meta/skills/start-best-practice/SKILL.md` | Create — full new skill |
| `skills/meta/skills/audit-applied-best-practices/SKILL.md` | Create — full new skill |
| `skills/meta/skills/review-best-practice-fit/SKILL.md` | Modify — prepend Step 0 |

---

## Task 1: Update `suggest-best-practice` Trigger

**Files:**
- Modify: `skills/meta/skills/suggest-best-practice/SKILL.md`

- [ ] **Step 1: Verify current description field**

Run:
```bash
grep -n "^description:" skills/meta/skills/suggest-best-practice/SKILL.md
```
Expected output:
```
2:description: Use when the user describes any situation, problem, goal, complaint, or question — including when they want to browse available best practices for a topic, don't know which domain applies, or don't know a best practice exists for their situation.
```

- [ ] **Step 2: Append action trigger to description**

In `skills/meta/skills/suggest-best-practice/SKILL.md`, change line 2 from:
```
description: Use when the user describes any situation, problem, goal, complaint, or question — including when they want to browse available best practices for a topic, don't know which domain applies, or don't know a best practice exists for their situation.
```
To:
```
description: Use when the user describes any situation, problem, goal, complaint, or question — including when they want to browse available best practices for a topic, don't know which domain applies, or don't know a best practice exists for their situation. Also use when the user starts any task or action without explicitly asking for guidance.
```

- [ ] **Step 3: Verify change**

Run:
```bash
grep "Also use when" skills/meta/skills/suggest-best-practice/SKILL.md
```
Expected: `Also use when the user starts any task or action without explicitly asking for guidance.`

- [ ] **Step 4: Commit**

```bash
git add skills/meta/skills/suggest-best-practice/SKILL.md
git commit -m "feat(grimoire): broaden suggest-best-practice trigger to cover silent action requests"
```

---

## Task 2: Create `start-best-practice` Skill

**Files:**
- Create: `skills/meta/skills/start-best-practice/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p skills/meta/skills/start-best-practice
```

- [ ] **Step 2: Write skill file**

Create `skills/meta/skills/start-best-practice/SKILL.md` with this exact content:

```markdown
---
name: start-best-practice
description: Use at the start of ANY user task, action, or request — before taking any other action. Proactively checks whether an applicable best practice exists and applies or offers it before proceeding.
source: Toyota Production System poka-yoke (Shingo, 1986) — error prevention before the action, not after
tags: [proactive, interception, pre-action, best-practice-discovery, guardian, poka-yoke, quality-gate]
---

# Intercept Best Practice

Before any task begins, silently check whether an applicable best practice exists — apply it proactively if confident, offer it if plausible, proceed silently if no match.

## Why This Is Best Practice

**Adopted by:** Toyota's poka-yoke principle (Shingo, 1986) is the foundation of error prevention in manufacturing — checking conditions *before* an action begins, not after defects appear. This principle is applied across aviation (pre-flight checklists), surgery (WHO Surgical Safety Checklist), and software (pre-commit hooks, CI gates).
**Impact:** The WHO Surgical Safety Checklist reduced surgical complications by 36% and deaths by 47% — not by changing technique, but by systematically intercepting the moment before each critical step (Haynes et al., 2009, NEJM). Pre-commit hooks catch an estimated 30–40% of common defects before they enter the codebase (GitHub internal data).
**Why best:** Reactive systems wait for the user to ask. Proactive interception closes the "I didn't know a best practice existed" gap — the most common reason practices aren't applied. The cost is minimal (a silent confidence check); the benefit is consistent practice application without requiring the user to know what to ask.

Sources: Shingo (1986) "Zero Quality Control: Source Inspection and the Poka-Yoke System"; Haynes et al. (2009) NEJM; GitHub Engineering blog

## Steps

### Step 0: Check preferences (silent)

Resolution order — first match wins:
1. `<project-root>/.grimoire/preferences.md` — project-level (highest precedence)
2. `~/.config/grimoire/preferences.md` OR `~/.grimoire/preferences.md` — global-level
3. `CLAUDE.md` `## Grimoire Preferences` section — legacy fallback

For the relevant domain, check if a practice is already pinned:
- **Pinned match** → apply the pinned practice directly; skip scoring entirely.
- **Pinned conflict** → warn before suggesting an alternative:
  `"You have [X] pinned for [domain]. Suggest changing it? [y/n]"`
- **No pin** → proceed to Step 1.

### Step 1: Extract intent (silent)

From the user's request, identify:

| Signal | Extract |
|--------|---------|
| **Task type** | What operation? (create, review, fix, design, write, calculate, plan…) |
| **Domain** | Which field? (engineering, law, finance, health, cooking…) |
| **Subject** | What specifically? (unit test, contract, retirement plan, training program…) |
| **Maturity** | Starting fresh, or improving existing work? |

Do not ask the user anything — infer from the request.

### Step 2: Score candidates (silent)

Score installed grimoire skills using the same model as `suggest-best-practice`:

```
score = (tag_overlap × 2) + (description_match × 3) + (domain_plausibility × 1)
```

Cap at top 3 matches. Compute silently — do not announce scoring is happening.

### Step 3: Route by confidence

| Score | Action |
|-------|--------|
| ≥ 0.7 | Announce match + apply skill, then complete original task |
| 0.4–0.69 | Brief offer: `"A best practice exists for this: [skill-name]. Apply it first? [y/n]"` |
| < 0.4 | Proceed silently with original task — no announcement, no interruption |

**High confidence (≥ 0.7):**
```
Best practice detected: [skill-name] ([domain/subdomain])
Applying before proceeding...
```

**Medium confidence (0.4–0.69):**
```
A best practice exists for this: [skill-name] ([domain/subdomain]).
Apply it first? [y/n — or just continue and I'll proceed with your request]
```

**Low confidence (< 0.4):** No output. Proceed with original request.

### Step 4: Complete original task

After the matched skill applies (or if no match), always complete the user's original request. The skill output becomes context for fulfilling the request — never abandon the task.

If the skill redirects significantly, state:
```
Best practice applied. Proceeding with your original request using the above framework.
```

## Rules

- Never block or announce when confidence < 0.4 — proceed silently
- Never apply two skills back-to-back without user confirmation between each
- Always complete the original request after skill application — don't abandon the task
- No browse mode — this is interception only, not discovery
- No clarifying questions — route on what's available, or pass through silently
- If user explicitly invoked a skill by name, don't intercept — they already know what they want

## Key Differences from `suggest-best-practice`

| | `suggest-best-practice` | `start-best-practice` |
|---|---|---|
| Trigger | User describes a problem | User starts any action |
| Low confidence | Asks clarifying question | Proceeds silently |
| After skill | Routes to skill | Applies skill, THEN completes original task |
| Browse mode | Supported | Not supported |
| Interrupts flow | Yes (it IS the flow) | Only at ≥ 0.4 confidence |

## Common Mistakes

**Blocking low-confidence tasks**: if score < 0.4, say nothing and proceed. Interrupting the user for uncertain matches destroys trust.

**Abandoning the original task**: always complete what the user asked for after applying a skill.

**Intercepting explicit skill invocations**: if the user said `/write-unit-test`, they already know what they want. Don't re-intercept.

**Announcing scoring**: "Checking for best practices..." on every action is disruptive. Only speak when there is a match.
```

- [ ] **Step 3: Verify skill file structure**

Run:
```bash
grep -c "^###\|^##\|^---" skills/meta/skills/start-best-practice/SKILL.md
```
Expected: at least 15 (frontmatter delimiters + section headers)

Run:
```bash
grep "Step 0\|Step 1\|Step 2\|Step 3\|Step 4" skills/meta/skills/start-best-practice/SKILL.md | wc -l
```
Expected: 5

- [ ] **Step 4: Commit**

```bash
git add skills/meta/skills/start-best-practice/SKILL.md
git commit -m "feat(grimoire): add start-best-practice proactive guardian skill"
```

---

## Task 3: Add Step 0 to `suggest-best-practice`

**Files:**
- Modify: `skills/meta/skills/suggest-best-practice/SKILL.md`

- [ ] **Step 1: Locate the Steps section**

Run:
```bash
grep -n "^## Steps\|### 1\. Extract intent" skills/meta/skills/suggest-best-practice/SKILL.md
```
Expected: shows line numbers for `## Steps` and `### 1. Extract intent signals`

- [ ] **Step 2: Prepend Step 0 before Step 1**

In `skills/meta/skills/suggest-best-practice/SKILL.md`, insert the following block immediately before `### 1. Extract intent signals (no clarifying questions yet)`:

```markdown
### Step 0: Check preferences (silent)

Resolution order — first match wins:
1. `<project-root>/.grimoire/preferences.md` — project-level (highest precedence)
2. `~/.config/grimoire/preferences.md` OR `~/.grimoire/preferences.md` — global-level
3. `CLAUDE.md` `## Grimoire Preferences` section — legacy fallback

For the relevant domain, check if a practice is already pinned:
- **Pinned match** → apply the pinned practice directly; skip scoring entirely.
- **Pinned conflict** → warn before suggesting an alternative:
  `"You have [X] pinned for [domain]. Suggest changing it? [y/n]"`
- **No pin** → proceed to Step 1.

```

- [ ] **Step 3: Verify Step 0 is present and before Step 1**

Run:
```bash
grep -n "Step 0\|### 1\. Extract" skills/meta/skills/suggest-best-practice/SKILL.md | head -4
```
Expected: Step 0 line number is lower than Step 1 line number.

- [ ] **Step 4: Commit**

```bash
git add skills/meta/skills/suggest-best-practice/SKILL.md
git commit -m "feat(grimoire): add preference-check Step 0 to suggest-best-practice"
```

---

## Task 4: Add Step 0 to `review-best-practice-fit`

**Files:**
- Modify: `skills/meta/skills/review-best-practice-fit/SKILL.md`

- [ ] **Step 1: Locate the Steps section**

Run:
```bash
grep -n "^## Steps\|### 1\. Extract the solution" skills/meta/skills/review-best-practice-fit/SKILL.md
```
Expected: shows line numbers for `## Steps` and `### 1. Extract the solution`

- [ ] **Step 2: Prepend Step 0 before Step 1**

In `skills/meta/skills/review-best-practice-fit/SKILL.md`, insert the following block immediately before `### 1. Extract the solution`:

```markdown
### Step 0: Check preferences (silent)

Resolution order — first match wins:
1. `<project-root>/.grimoire/preferences.md` — project-level (highest precedence)
2. `~/.config/grimoire/preferences.md` OR `~/.grimoire/preferences.md` — global-level
3. `CLAUDE.md` `## Grimoire Preferences` section — legacy fallback

For the relevant domain, check if a practice is already pinned:
- **Pinned match** → apply the pinned practice directly; skip scoring entirely.
- **Pinned conflict** → warn before suggesting an alternative:
  `"You have [X] pinned for [domain]. Suggest changing it? [y/n]"`
- **No pin** → proceed to Step 1.

```

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "Step 0\|### 1\. Extract the solution" skills/meta/skills/review-best-practice-fit/SKILL.md | head -4
```
Expected: Step 0 line number is lower than Step 1 line number.

- [ ] **Step 4: Commit**

```bash
git add skills/meta/skills/review-best-practice-fit/SKILL.md
git commit -m "feat(grimoire): add preference-check Step 0 to review-best-practice-fit"
```

---

## Task 5: Create `audit-applied-best-practices` Skill

**Files:**
- Create: `skills/meta/skills/audit-applied-best-practices/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p skills/meta/skills/audit-applied-best-practices
```

- [ ] **Step 2: Write skill file**

Create `skills/meta/skills/audit-applied-best-practices/SKILL.md` with this exact content:

```markdown
---
name: audit-applied-best-practices
description: Use when the user wants to inventory which best practices are already applied in their existing work — codebase, document, design, or any artifact — and pin intentional choices as preferences that routing skills will respect.
source: ISO 9001 gap audit standards (ISO 9001:2015 §4.1); Nielsen Norman Group contextual inquiry methodology
tags: [audit, inventory, applied-practices, preference, existing-work, context-awareness, onboarding]
---

# Audit Applied Practices

Scan existing work to map which best practices are already in use, then let the user pin intentional choices as preferences that all routing skills respect.

## Why This Is Best Practice

**Adopted by:** ISO 9001 mandates formal context-of-organization audits before any quality initiative — organizations must document current practices before assessing gaps (ISO 9001:2015 §4.1). McKinsey's as-is mapping precedes every strategy engagement. Nielsen Norman Group's contextual inquiry methodology requires observing what users *actually do* before designing interventions.
**Impact:** Skipping the as-is audit is the primary cause of process improvement failure — organizations apply new practices that conflict with established workflows, creating resistance rather than improvement (Kotter, "Leading Change", 1996). ISO 9001 organizations that conduct thorough current-state audits have 60% higher implementation success rates than those that skip this step (BSI Group, 2019).
**Why best:** You cannot improve what you haven't mapped. Without an applied-practice inventory, routing skills suggest changes to things the user deliberately chose — destroying trust. Pinning preferences converts noise into signal: the user tells the system "I know, and I chose this intentionally."

Sources: ISO 9001:2015 §4.1; Kotter (1996) "Leading Change"; BSI Group (2019) ISO certification outcomes study; Nielsen Norman Group contextual inquiry guidelines

## Steps

### Step 1: Detect work type (silent)

Auto-classify the artifact from available signals:

| Signal | Detected type |
|--------|--------------|
| `.git` directory present in working directory | Codebase |
| User pastes text or describes a single document | Document |
| Multiple heterogeneous file types | Mixed artifact |
| User describes their domain verbally without files | Verbal description |

For Codebase and Mixed: proceed automatically.
For Document and Verbal: ask ONE targeted question to confirm scope before proceeding.

### Step 2: Extract signals

Gather evidence of existing practices:

| Work type | Where to look |
|-----------|--------------|
| **Codebase** | `package.json` / `Gemfile` / `go.mod` / `requirements.txt` (dependencies → infer testing framework, linter, formatter); CI config (`.github/workflows/`, `.gitlab-ci.yml`); test file structure (co-located vs. `tests/`); `git log --oneline -50` (commit message style); linter configs (`.eslintrc`, `.rubocop.yml`, `pyproject.toml`); folder structure and naming conventions |
| **Document** | Section headings, citation format, terminology, structural conventions (executive summary, appendices), voice and tense |
| **Mixed / verbal** | Ask one targeted question per ambiguous area — maximum 3 questions total |

### Step 3: Match signals to grimoire skills

Score each detected pattern against installed skills:

```
score = (tag_overlap × 2) + (description_match × 3) + (domain_plausibility × 1)
```

Surface only matches scoring ≥ 0.5. Group by domain.

### Step 4: Report applied practices

Present findings:

```
Applied practices detected in [project/artifact name]:

Domain                     Practice                        Evidence
───────────────────────────────────────────────────────────────────────────
✓ engineering/testing      write-unit-test                 Jest, co-located tests
✓ engineering/development  propose-conventional-commit     detected in git log
✓ engineering/devops       design-ci-pipeline              GitHub Actions workflow
? engineering/architecture                                 no clear pattern found
? engineering/security                                     no clear pattern found
```

### Step 5: Interactive preference pinning

For each ✓ result, ask in sequence:

```
Pin "propose-conventional-commit" as your intentional choice for engineering/development?
[y] pin  [n] skip  [r] pin with reason
```

If user selects `[r]`, ask: "Reason? (e.g. 'required by semantic-release')"

For `?` results, after all `✓` items are processed, offer once:

```
3 domains have no detected practice. Want to specify preferences for any of them?
[y] go through each  [n] skip
```

If yes, for each undetected domain, ask: "Which practice do you use for [domain]? (skill name or describe it)"

### Step 6: Write preferences file

Ask where to save:

```
Save preferences to:
  [1] This project only  → <project-root>/.grimoire/preferences.md
  [2] All my projects    → ~/.grimoire/preferences.md
                           (uses ~/.config/grimoire/preferences.md if XDG_CONFIG_HOME is set)
  [3] Both
```

Write to selected location(s) in this format:

```markdown
# Grimoire Practice Preferences

<!-- Intentional choices. Routing skills will not suggest alternatives for pinned practices. -->

## engineering/development
- propose-conventional-commit: conventional commits format
  reason: required by semantic-release

## engineering/testing
- write-unit-test: Jest, co-located test files
  reason: team standard, enforced in CI
```

If file already exists at the target path: append new domain sections only. Never silently overwrite existing pins. If a domain conflict exists, ask:
```
You already have [existing-skill] pinned for [domain]. Replace it with [new-skill]? [y/n]
```

After writing, confirm:
```
Preferences saved to [path]. Routing skills will now respect these choices.
```

## Rules

- Never overwrite existing preferences without explicit confirmation
- Pin only what the user confirms as intentional — never auto-pin detected practices
- Project-level file takes precedence over global for any domain where both exist
- XDG compliance: use `$XDG_CONFIG_HOME/grimoire/preferences.md` if `XDG_CONFIG_HOME` is set, else `~/.grimoire/preferences.md`
- If no `.git` directory and no files are accessible, ask the user to describe their domain and practices verbally — maximum 3 questions
- After writing, always confirm the path and what was saved

## Common Mistakes

**Auto-pinning without asking**: always ask the user to confirm each pin. Detected ≠ intentional.

**Overwriting silently**: existing preference files may have carefully chosen entries. Append only, never overwrite without confirmation.

**Skipping undetected domains**: `?` domains are often the most important — the user may have strong preferences for architecture or security that don't show up in file scans.

**Forgetting to confirm write**: after writing the file, always confirm the path and what was saved.
```

- [ ] **Step 3: Verify skill file**

Run:
```bash
grep "Step 1\|Step 2\|Step 3\|Step 4\|Step 5\|Step 6" skills/meta/skills/audit-applied-best-practices/SKILL.md | wc -l
```
Expected: 6

Run:
```bash
grep "XDG_CONFIG_HOME\|\.grimoire/preferences" skills/meta/skills/audit-applied-best-practices/SKILL.md | wc -l
```
Expected: at least 3 (XDG reference + both path variants)

- [ ] **Step 4: Commit**

```bash
git add skills/meta/skills/audit-applied-best-practices/SKILL.md
git commit -m "feat(grimoire): add audit-applied-best-practices skill with multi-level preference persistence"
```

---

## Task 6: Final Verification

- [ ] **Step 1: Check all 4 skill files exist or are modified**

```bash
ls skills/meta/skills/start-best-practice/SKILL.md \
   skills/meta/skills/audit-applied-best-practices/SKILL.md
```
Expected: both paths print without error.

```bash
grep "Also use when the user starts any task" skills/meta/skills/suggest-best-practice/SKILL.md
grep "Step 0" skills/meta/skills/suggest-best-practice/SKILL.md
grep "Step 0" skills/meta/skills/review-best-practice-fit/SKILL.md
```
Expected: each grep returns a match.

- [ ] **Step 2: Verify preference resolution order in all Step 0 blocks**

```bash
grep -l "Step 0" skills/meta/skills/*/SKILL.md
```
Expected: 3 files — `start-best-practice`, `suggest-best-practice`, `review-best-practice-fit`

```bash
grep "project-root\|XDG_CONFIG_HOME\|CLAUDE.md" skills/meta/skills/suggest-best-practice/SKILL.md | wc -l
```
Expected: at least 3 (one per level)

- [ ] **Step 3: Verify domain listing includes new skills**

```bash
ls skills/meta/skills/
```
Expected: `audit-applied-best-practices/` and `start-best-practice/` both appear.

- [ ] **Step 4: Run grimoire's own quality check on new skills (if available)**

```bash
# If review-best-practice-skill is installed:
# /review-best-practice-skill on start-best-practice/SKILL.md
# /review-best-practice-skill on audit-applied-best-practices/SKILL.md
echo "Manual review: verify each new skill passes the 5-criteria standard in STANDARD.md"
```
