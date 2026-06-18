# Duplicate Skill Prevention Design

**Date:** 2026-06-07
**Status:** Approved

## Context

New contributors can unknowingly submit skills that duplicate or near-duplicate existing ones. The `write-best-practice-skill` skill already mandates running `suggest-best-practice` first, but contributors who bypass that skill (or miss the Rules section) have no other safety net. This adds three enforcement layers: contributor guidance, PR checklist, and automated CI gating.

## Scope

- CONTRIBUTING.md — add dedup step and self-check checkbox
- .github/PULL_REQUEST_TEMPLATE.md — add dedup checkbox
- scripts/check-duplicates.sh — new CI script for similarity detection
- .github/workflows/validate.yml — add `check-duplicates` job

## Design

### Similarity Scoring

All three layers reference the same scoring model used by grimoire's routing skills:

```
raw   = (tag_overlap × 2) + (desc_overlap × 3) + (domain_match × 1)
score = raw / 6        # normalized 0–1
```

- `tag_overlap`: Jaccard similarity of `tags` arrays from frontmatter (0–1)
- `desc_overlap`: normalized word overlap of `description` fields, stop-words stripped (0–1)
- `domain_match`: 1.0 same domain directory (e.g., both in `skills/engineering/`), 0.0 otherwise

**Threshold:** score ≥ 0.7 → near-duplicate. score < 0.4 → safe.

### Escape Hatch

Add `duplicate-reviewed: true` to the new skill's frontmatter after reviewing similar skills and confirming the new skill is genuinely distinct. PR body must include a justification comment. CI passes with a warning listing the matched skills.

### Layer 1 — CONTRIBUTING.md

**"Adding a Skill" steps:** Insert new step 0:
> 0. Run `suggest-best-practice` with your topic — if any result scores ≥ 0.7, extend that skill instead of creating a new one.

**Self-Check checklist:** Add checkbox before Frontmatter section:
> `[ ] No near-duplicate: ran suggest-best-practice, top similarity < 0.7 — or added duplicate-reviewed: true to frontmatter with justification in PR body`

### Layer 2 — PR Template

Add checkbox in the self-check block (before Frontmatter section):
```
- [ ] No near-duplicate: ran `suggest-best-practice`, top similarity < 0.7 — or added `duplicate-reviewed: true` to frontmatter with justification below
```

### Layer 3 — CI Script

**File:** `scripts/check-duplicates.sh`

**Behavior:**
1. Detect new SKILL.md files added in the PR vs `origin/main` using `git diff --name-only --diff-filter=A`
2. Skip if no new SKILL.md files found (exits 0)
3. For each new SKILL.md: parse frontmatter (`name`, `description`, `tags`, `duplicate-reviewed`)
4. Compare against all existing SKILL.md files (excluding itself) using similarity formula
5. Collect top 3 matches per new skill
6. If top score ≥ 0.7 and `duplicate-reviewed: true` absent → print matches with scores, exit 1
7. If `duplicate-reviewed: true` present → print warning with matches, exit 0

**Implementation:** Node.js inline script (`node -e`) for text processing. Consistent with existing batch-execute usage in project.

**validate.yml addition:**
```yaml
check-duplicates:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Check for duplicate skills
      run: bash scripts/check-duplicates.sh
```

## Verification

1. Add a new skill with tags/description heavily overlapping an existing skill → CI fails, lists matches
2. Add same skill with `duplicate-reviewed: true` in frontmatter → CI passes with warning
3. Add a genuinely novel skill → CI passes silently
4. PR with no new SKILL.md files → CI passes silently (skip path)
5. CONTRIBUTING.md checklist visible in contributor docs
6. PR template checkbox present in new PR UI on GitHub
