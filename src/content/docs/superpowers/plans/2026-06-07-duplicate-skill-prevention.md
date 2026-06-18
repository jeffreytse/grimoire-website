# Duplicate Skill Prevention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three enforcement layers that prevent contributors from submitting near-duplicate SKILL.md files: contributor guidance in CONTRIBUTING.md, a PR checklist checkbox, and a CI script that fails on similarity ≥ 0.7.

**Architecture:** CONTRIBUTING.md and the PR template are documentation-layer gates (human-enforced). `scripts/check-duplicates.sh` is the automation gate — a bash wrapper around an inline Node.js script that scores new SKILL.md files against all existing ones using a weighted similarity formula, failing CI unless the contributor has acknowledged the overlap via `duplicate-reviewed: true` in frontmatter.

**Tech Stack:** Bash, Node.js 20 (inline via `node -e`), GitHub Actions

---

## File Map

| File | Change |
|------|--------|
| `CONTRIBUTING.md` | Insert dedup step + Self-Check checkbox |
| `.github/PULL_REQUEST_TEMPLATE.md` | Insert dedup checkbox before Frontmatter section |
| `scripts/check-duplicates.sh` | **Create** — similarity CI script |
| `.github/workflows/validate.yml` | Add `check-duplicates` job |

---

### Task 1: Add dedup step to CONTRIBUTING.md

**Files:**
- Modify: `CONTRIBUTING.md:24-29` (Adding a Skill steps)
- Modify: `CONTRIBUTING.md:76-101` (Self-Check checklist)

- [ ] **Step 1: Insert dedup step 0 into "Adding a Skill" steps**

Replace this block in `CONTRIBUTING.md`:
```
Steps:
1. Copy `SKILL_TEMPLATE.md` → `skills/<domain>/<subdomain>/skills/<skill-name>/SKILL.md`
2. Fill in all frontmatter fields: `name`, `description`, `source`, `tags`
3. Write content following [STANDARD.md](./STANDARD.md)
4. Run the review checklist in STANDARD.md
5. Test with at least one AI agent before submitting
```
With:
```
Steps:
0. Run `suggest-best-practice` with your topic — if any result scores ≥ 0.7, extend that skill instead of creating a new one.
1. Copy `SKILL_TEMPLATE.md` → `skills/<domain>/<subdomain>/skills/<skill-name>/SKILL.md`
2. Fill in all frontmatter fields: `name`, `description`, `source`, `tags`
3. Write content following [STANDARD.md](./STANDARD.md)
4. Run the review checklist in STANDARD.md
5. Test with at least one AI agent before submitting
```

- [ ] **Step 2: Add dedup checkbox to Self-Check section**

Find the `## Self-Check Before Submitting` section. The current first subsection is `### Frontmatter`. Insert a new `### Deduplication` subsection immediately before `### Frontmatter`:

```markdown
### Deduplication
- [ ] No near-duplicate: ran `suggest-best-practice`, top similarity < 0.7 — or added `duplicate-reviewed: true` to frontmatter with justification in PR body
```

- [ ] **Step 3: Verify the file looks correct**

Run:
```bash
grep -n "suggest-best-practice\|duplicate-reviewed\|Deduplication" CONTRIBUTING.md
```
Expected output (lines may differ):
```
25:0. Run `suggest-best-practice` with your topic — if any result scores ≥ 0.7, extend that skill instead of creating a new one.
78:### Deduplication
79:- [ ] No near-duplicate: ran `suggest-best-practice`, top similarity < 0.7 — or added `duplicate-reviewed: true` to frontmatter with justification in PR body
```

- [ ] **Step 4: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs(contributing): add dedup step and self-check checkbox"
```

---

### Task 2: Add dedup checkbox to PR template

**Files:**
- Modify: `.github/PULL_REQUEST_TEMPLATE.md:5-8`

- [ ] **Step 1: Insert dedup checkbox**

Find the `## Self-check` section in `.github/PULL_REQUEST_TEMPLATE.md`. It currently starts:

```markdown
## Self-check

Run `review-best-practice-skill` on every SKILL.md in this PR, then check each box.

### Frontmatter
```

Insert a new `### Deduplication` subsection between the instruction line and `### Frontmatter`:

```markdown
## Self-check

Run `review-best-practice-skill` on every SKILL.md in this PR, then check each box.

### Deduplication

- [ ] No near-duplicate: ran `suggest-best-practice`, top similarity < 0.7 — or added `duplicate-reviewed: true` to frontmatter with justification below

### Frontmatter
```

- [ ] **Step 2: Verify**

```bash
grep -n "Deduplication\|duplicate-reviewed" .github/PULL_REQUEST_TEMPLATE.md
```
Expected:
```
9:### Deduplication
11:- [ ] No near-duplicate: ran `suggest-best-practice`, top similarity < 0.7 — or added `duplicate-reviewed: true` to frontmatter with justification below
```

- [ ] **Step 3: Commit**

```bash
git add .github/PULL_REQUEST_TEMPLATE.md
git commit -m "ci(pr-template): add dedup checkbox"
```

---

### Task 3: Write check-duplicates.sh

**Files:**
- Create: `scripts/check-duplicates.sh`

- [ ] **Step 1: Create the script**

Create `scripts/check-duplicates.sh` with the following content:

```bash
#!/usr/bin/env bash
# Detects near-duplicate SKILL.md files added in a PR.
# Fails if similarity >= 0.7 unless duplicate-reviewed: true is set in frontmatter.
set -euo pipefail

# Detect new SKILL.md files vs origin/main (CI) or HEAD~1 (local)
if git rev-parse origin/main >/dev/null 2>&1; then
  BASE="origin/main"
else
  BASE="HEAD~1"
fi

NEW_SKILLS=$(git diff --name-only --diff-filter=A "$BASE" HEAD -- '*/SKILL.md' 2>/dev/null || true)

if [ -z "$NEW_SKILLS" ]; then
  echo "No new SKILL.md files found. Skipping duplicate check."
  exit 0
fi

COUNT=$(echo "$NEW_SKILLS" | wc -l | tr -d ' ')
echo "Checking $COUNT new SKILL.md file(s) for near-duplicates..."

export NEW_SKILLS

node -e "
const fs = require('fs');
const path = require('path');

const THRESHOLD = 0.7;

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayValues = [];

  for (const line of lines) {
    if (line.startsWith('- ') && inArray) {
      arrayValues.push(line.slice(2).trim().replace(/['\"\[\]]/g, ''));
      continue;
    }
    const kv = line.match(/^([\w-]+)\s*:\s*(.*)/);
    if (kv) {
      if (inArray) { fm[currentKey] = arrayValues; arrayValues = []; inArray = false; }
      const [, key, val] = kv;
      const trimVal = val.trim();
      if (trimVal === '' || trimVal === '[]') {
        inArray = true; arrayValues = []; currentKey = key;
      } else if (trimVal.startsWith('[')) {
        fm[key] = trimVal.replace(/[\[\]]/g, '').split(',').map(s => s.trim().replace(/['\"]/g, ''));
      } else {
        fm[key] = trimVal.replace(/^['\"]|['\"]$/g, '');
        currentKey = key; inArray = false;
      }
    }
  }
  if (inArray) fm[currentKey] = arrayValues;
  return fm;
}

function tagOverlap(tags1, tags2) {
  if (!tags1 || !tags2 || tags1.length === 0 || tags2.length === 0) return 0;
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));
  const intersection = [...set1].filter(t => set2.has(t)).length;
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

const STOP_WORDS = new Set(['use','when','a','an','the','is','are','for','to','in','of','and','or','with','that','this','as','by','on','at','from','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','it','its','not','but','if','you','your']);

function descOverlap(desc1, desc2) {
  if (!desc1 || !desc2) return 0;
  const tokenize = s => s.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const words1 = new Set(tokenize(desc1));
  const words2 = new Set(tokenize(desc2));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

function getDomain(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const idx = parts.indexOf('skills');
  return idx >= 0 ? (parts[idx + 1] || '') : '';
}

function computeScore(newPath, newFm, existingPath, existingFm) {
  const t = tagOverlap(newFm.tags, existingFm.tags);
  const d = descOverlap(newFm.description, existingFm.description);
  const dom = getDomain(newPath) === getDomain(existingPath) ? 1.0 : 0.0;
  return ((t * 2) + (d * 3) + (dom * 1)) / 6;
}

function findAllSkills(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findAllSkills(fullPath));
    else if (entry.name === 'SKILL.md') results.push(fullPath);
  }
  return results;
}

const newSkillPaths = process.env.NEW_SKILLS.trim().split('\n').filter(Boolean);
const allSkills = findAllSkills('skills');
let hasFailure = false;

for (const newSkillPath of newSkillPaths) {
  if (!fs.existsSync(newSkillPath)) {
    console.log('Skipping (not found on disk): ' + newSkillPath);
    continue;
  }

  const newContent = fs.readFileSync(newSkillPath, 'utf8');
  const newFm = parseFrontmatter(newContent);
  const isReviewed = String(newFm['duplicate-reviewed']).toLowerCase() === 'true';

  const scores = [];
  for (const existingPath of allSkills) {
    if (path.resolve(existingPath) === path.resolve(newSkillPath)) continue;
    const existingContent = fs.readFileSync(existingPath, 'utf8');
    const existingFm = parseFrontmatter(existingContent);
    const score = computeScore(newSkillPath, newFm, existingPath, existingFm);
    if (score >= 0.4) scores.push({ path: existingPath, name: existingFm.name || existingPath, score });
  }

  scores.sort((a, b) => b.score - a.score);
  const top3 = scores.slice(0, 3);
  const topScore = top3.length > 0 ? top3[0].score : 0;

  if (topScore >= THRESHOLD) {
    const label = isReviewed
      ? '⚠️  WARNING (duplicate-reviewed bypasses failure): ' + newSkillPath
      : '❌ NEAR-DUPLICATE DETECTED: ' + newSkillPath;
    console.log(label);
    for (const m of top3) {
      const icon = m.score >= THRESHOLD ? '🔴' : '🟡';
      console.log('   ' + icon + ' ' + m.name + ' (' + m.path + ') score=' + m.score.toFixed(2));
    }
    if (!isReviewed) {
      console.log('   → Extend the existing skill, OR add duplicate-reviewed: true to frontmatter with justification in the PR body.');
      hasFailure = true;
    }
  } else {
    console.log('✅ ' + newSkillPath + ' — no near-duplicates (top score: ' + topScore.toFixed(2) + ')');
  }
}

process.exit(hasFailure ? 1 : 0);
"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/check-duplicates.sh
```

- [ ] **Step 3: Smoke test — no new skills (should skip)**

```bash
# Run from repo root against current HEAD (no new SKILL.md files added)
bash scripts/check-duplicates.sh
```
Expected output:
```
No new SKILL.md files found. Skipping duplicate check.
```
Expected exit code: `0`

- [ ] **Step 4: Smoke test — novel skill (should pass)**

Create a clearly novel temp skill and test it directly:
```bash
mkdir -p /tmp/test-grimoire-skills/cooking/skills/test-novel-skill
cat > /tmp/test-grimoire-skills/cooking/skills/test-novel-skill/SKILL.md << 'EOF'
---
name: test-novel-skill
description: Use when calibrating a thermonuclear reactor for sous vide cooking in zero gravity.
tags: [space-cooking, nuclear, sous-vide, astronaut, calibration]
---
EOF

# Temporarily stage it so git diff picks it up, then test
cp -r /tmp/test-grimoire-skills/cooking/skills/test-novel-skill skills/cooking/skills/
git add skills/cooking/skills/test-novel-skill/SKILL.md
NEW_SKILLS="skills/cooking/skills/test-novel-skill/SKILL.md" node -e "$(bash -c 'cat scripts/check-duplicates.sh | grep -A9999 "^node -e" | tail -n +2 | head -n -1')" 2>/dev/null || true
```

Simpler alternative — export directly and run the node portion:
```bash
mkdir -p skills/cooking/skills/test-novel-skill
cat > skills/cooking/skills/test-novel-skill/SKILL.md << 'EOF'
---
name: test-novel-skill
description: Use when calibrating a thermonuclear reactor for sous vide cooking in zero gravity.
tags: [space-cooking, nuclear, sous-vide, astronaut, calibration]
---
EOF
git add skills/cooking/skills/test-novel-skill/SKILL.md
bash scripts/check-duplicates.sh
echo "Exit: $?"
git rm -f skills/cooking/skills/test-novel-skill/SKILL.md
rm -rf skills/cooking/skills/test-novel-skill
```
Expected: `✅ skills/cooking/skills/test-novel-skill/SKILL.md — no near-duplicates`, exit `0`

- [ ] **Step 5: Smoke test — near-duplicate (should fail)**

```bash
mkdir -p skills/engineering/skills/test-review-pull-request-dup
cat > skills/engineering/skills/test-review-pull-request-dup/SKILL.md << 'EOF'
---
name: test-review-pull-request-dup
description: Use when reviewing a pull request to ensure code quality meets standards.
tags: [code-review, pull-request, quality, reviewer, feedback]
---
EOF
git add skills/engineering/skills/test-review-pull-request-dup/SKILL.md
bash scripts/check-duplicates.sh
echo "Exit: $?"
git rm -f skills/engineering/skills/test-review-pull-request-dup/SKILL.md
rm -rf skills/engineering/skills/test-review-pull-request-dup
```
Expected: `❌ NEAR-DUPLICATE DETECTED`, lists `review-pull-request` as top match, exit `1`

- [ ] **Step 6: Smoke test — duplicate with escape hatch (should warn, pass)**

```bash
mkdir -p skills/engineering/skills/test-review-pull-request-dup
cat > skills/engineering/skills/test-review-pull-request-dup/SKILL.md << 'EOF'
---
name: test-review-pull-request-dup
description: Use when reviewing a pull request to ensure code quality meets standards.
tags: [code-review, pull-request, quality, reviewer, feedback]
duplicate-reviewed: true
---
EOF
git add skills/engineering/skills/test-review-pull-request-dup/SKILL.md
bash scripts/check-duplicates.sh
echo "Exit: $?"
git rm -f skills/engineering/skills/test-review-pull-request-dup/SKILL.md
rm -rf skills/engineering/skills/test-review-pull-request-dup
```
Expected: `⚠️  WARNING (duplicate-reviewed bypasses failure)`, exit `0`

- [ ] **Step 7: Commit**

```bash
git add scripts/check-duplicates.sh
git commit -m "feat(ci): add check-duplicates script for near-duplicate skill detection"
```

---

### Task 4: Add check-duplicates job to validate.yml

**Files:**
- Modify: `.github/workflows/validate.yml`

- [ ] **Step 1: Add the job**

Append the following to `.github/workflows/validate.yml` after the `conformance` job:

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
      - name: Check for near-duplicate skills
        run: bash scripts/check-duplicates.sh
```

The full file after edit:

```yaml
name: Validate Skills

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate-skills:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate all SKILL.md files
        run: bash scripts/validate-skill.sh --all

  conformance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run conformance test suite
        run: bash scripts/test-schema.sh

  check-duplicates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Check for near-duplicate skills
        run: bash scripts/check-duplicates.sh
```

Note: `fetch-depth: 0` is required so `git diff origin/main HEAD` has full history to compare against.

- [ ] **Step 2: Verify YAML is valid**

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.github/workflows/validate.yml', 'utf8');
// Basic structure check — all three jobs present
['validate-skills', 'conformance', 'check-duplicates'].forEach(job => {
  if (!content.includes(job + ':')) { console.error('Missing job: ' + job); process.exit(1); }
});
console.log('OK — all 3 jobs present');
"
```
Expected: `OK — all 3 jobs present`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/validate.yml
git commit -m "ci: add check-duplicates job to validate workflow"
```

---

## Verification

End-to-end test after all tasks complete:

1. `bash scripts/check-duplicates.sh` on clean main — exits 0, prints "No new SKILL.md files found"
2. PR with novel skill → `check-duplicates` job passes
3. PR with near-duplicate (no escape hatch) → `check-duplicates` job fails, lists matches
4. PR with near-duplicate + `duplicate-reviewed: true` → job passes with warning
5. `grep "Deduplication\|suggest-best-practice" CONTRIBUTING.md` — both present
6. `grep "Deduplication\|duplicate-reviewed" .github/PULL_REQUEST_TEMPLATE.md` — both present
