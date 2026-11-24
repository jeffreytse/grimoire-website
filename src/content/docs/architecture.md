# grimoire Architecture

grimoire has three layers: **skills** (content), **meta skills** (framework logic), and **delivery** to AI agents — the MCP server (MCP mode, recommended), the grimoire CLI (skills mode), or native plugins. This document describes how each layer works and how they fit together.

---

## Overview

```
┌─────────────────────────────────────────────────┐
│                   AI Agent                      │
│  (Claude Code / Copilot / Codex / Pi / ...)     │
└──────────────────────┬──────────────────────────┘
                       │ plugin · grimoire install · MCP
┌──────────────────────▼──────────────────────────┐
│               Delivery                          │
│   native plugin manifests (.claude-plugin/,     │
│   .codex-plugin/, kimi.plugin.json, ...)        │
│   grimoire CLI → agent skills folder            │
│   grimoire mcp serve → skills on demand         │
└──────────────────────┬──────────────────────────┘
                       │ loads
┌──────────────────────▼──────────────────────────┐
│                  Skills                         │
│   skills/<domain>/<subdomain>/skills/           │
│   <skill-name>/SKILL.md                         │
└──────────────────────┬──────────────────────────┘
                       │ managed by
┌──────────────────────▼──────────────────────────┐
│               Meta Skills                       │
│   suggest-best-practice                         │
│   review-best-practice-skill                    │
│   write-best-practice-skill                     │
│   plan-best-practice-solution                   │
│   review-best-practice-fit                      │
│   ...                                           │
└─────────────────────────────────────────────────┘
```

---

## Skill format: SKILL.md

Every skill is a single `SKILL.md` file. The format is fixed:

```markdown
---
name: verb-first-kebab-case
description: Use when <triggering conditions>.
source: <institution, standard body, or top-tier companies>
tags: [problem-keyword, tool-method, role-context, outcome]
---

# Skill Title

One-sentence purpose.

## Why This Is Best Practice

**Adopted by:** [specific companies or institutions]
**Impact:** [measurable outcome — a number or named study]
**Why best:** [why this over the named alternative]

Sources: [verifiable citations]

## Steps

### 1. Step name

[concrete, immediately executable instruction]

...
```

**Frontmatter fields** are used by `suggest-best-practice` for automatic routing. The `tags` field is the primary matching signal — it must cover all four axes: problem keyword, tool/method, role/context, and outcome.

**"Why This Is Best Practice"** is grimoire's quality signal. Every skill must prove it belongs: named adopters, measurable impact with evidence, and an explicit comparison to alternatives. Vague claims ("many companies use this", "significantly improves quality") are rejected at review.

**Size target: 50–300 lines.** Under 50 is too shallow. Over 300 is two skills.

Full format specification: [STANDARD.md](https://github.com/jeffreytse/grimoire-core/blob/main/STANDARD.md).

---

## Directory layout

```
skills/
  <domain>/
    .claude-plugin/
      plugin.json               ← domain-level manifest
    <subdomain>/
      .claude-plugin/
        plugin.json             ← subdomain-level manifest
      skills/
        <skill-name>/
          SKILL.md
```

Example — the meta domain:

```
skills/
│   ├── meta/                             # Meta skills (the framework's nervous system)
│   │   └── skills/
│   │       ├── analyze-best-practice-problem/
│   │       ├── discover-best-practices/
│   │       ├── start-best-practice/
│   │       ├── suggest-best-practice/
│   │       ├── plan-best-practice-solution/
│   │       ├── apply-best-practice-tree/
│   │       ├── review-best-practice-fit/
│   │       ├── compare-best-practices/
│   │       ├── audit-applied-best-practices/
│   │       ├── explain-best-practice/
│   │       ├── adapt-best-practice/
│   │       ├── teach-best-practice/
│   │       ├── pin-best-practice-preference/
│   │       ├── resolve-best-practice-conflict/
│   │       ├── configure-grimoire/
│   │       ├── install-grimoire/
│   │       ├── apply-best-practice-driven-development/
│   │       ├── check-best-practice-compliance/
│   │       ├── fix-best-practice-finding/
│   │       ├── apply-best-practice-profile/
│   │       ├── write-best-practice-profile/
│   │       ├── review-best-practice-profile/
│   │       ├── share-best-practice-profile/
│   │       ├── write-best-practice-skill/
│   │       ├── review-best-practice-skill/  # Quality gate
│   │       ├── revise-best-practice-skill/
│   │       ├── audit-best-practice-domain/
│   │       ├── deprecate-best-practice-skill/
│   │       └── design-best-practice-domain/
```

Example — the reference skill:

```
skills/
  engineering/
    .claude-plugin/plugin.json
    development/
      .claude-plugin/plugin.json
      skills/
        propose-conventional-commit/
          SKILL.md
```

**Domain plugin.json** (`skills/<domain>/.claude-plugin/plugin.json`):

```json
{
  "name": "grimoire-engineering",
  "description": "Engineering skills: development, testing, architecture, ...",
  "version": "0.1.0",
  "author": { "name": "Jeffrey Tse", "email": "jeffreytse.mail@gmail.com" },
  "homepage": "https://github.com/jeffreytse/grimoire-core",
  "repository": "https://github.com/jeffreytse/grimoire-core",
  "license": "MIT",
  "skills": [
    "./development/skills",
    "./testing/skills",
    "./architecture/skills"
  ]
}
```

`skills` is an array of paths — each pointing to a subdomain's `skills/` directory. The agent auto-discovers all `SKILL.md` files under each path.

**Subdomain plugin.json** (`skills/<domain>/<subdomain>/.claude-plugin/plugin.json`):

```json
{
  "name": "grimoire-engineering-development",
  "description": "Development skills: coding, implementation, code review, debugging.",
  "version": "0.1.0",
  "author": { "name": "Jeffrey Tse", "email": "jeffreytse.mail@gmail.com" },
  "homepage": "https://github.com/jeffreytse/grimoire-core",
  "repository": "https://github.com/jeffreytse/grimoire-core",
  "license": "MIT",
  "skills": "./skills"
}
```

`skills` is a string (not an array) pointing to the `skills/` directory. The agent auto-discovers all `SKILL.md` files in that directory.

---

## Plugin system

### Claude Code

Claude Code uses the marketplace system. First add the marketplace catalog, then install individual plugins. Skills installed via plugins are **namespaced** (e.g., `/grimoire-engineering:propose-conventional-commit`); skills installed via `grimoire` are not.

Install commands:

```bash
# Step 1: register the catalog
/plugin marketplace add jeffreytse/grimoire-core

# Step 2: install
/plugin install grimoire@grimoire                    # all domains
/plugin install grimoire-engineering@grimoire        # one domain
```

The marketplace is named `grimoire`, so plugins are `<plugin>@grimoire`. For sub-domain installs, use `grimoire install --domain <d> --subdomain <s>`.

### Marketplace

`.claude-plugin/marketplace.json` is the registry of all installable units. Each entry has a `name`, `source`, and `description`. Subdirectory plugins use the `git-subdir` source type for sparse checkout:

```json
{
  "name": "grimoire-engineering-development",
  "source": {
    "source": "git-subdir",
    "url": "jeffreytse/grimoire-core",
    "path": "skills/engineering/development"
  },
  "description": "Software development: coding, implementation, review, debugging"
}
```

---

## Multi-agent support

grimoire-core ships native plugin manifests for every agent that has a plugin system. All of them are **generated** from `skills/` and `VERSION` by `scripts/gen-manifests.py` (`make update-plugin-manifest`); `make check-manifest` fails CI when any is stale.

| Agent              | Manifest                                                   | Loading mechanism                                                                    |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Claude Code        | `.claude-plugin/plugin.json` + `marketplace.json`          | `/plugin marketplace add` + `/plugin install grimoire@grimoire`                      |
| GitHub Copilot CLI | `.claude-plugin/` (shared)                                 | `copilot plugin marketplace add` + `copilot plugin install`                          |
| Codex              | `.codex-plugin/plugin.json` + `.agents/plugins/marketplace.json` | `codex plugin marketplace add` + `codex plugin add`                            |
| OpenCode           | `.opencode/plugins/grimoire.js`                            | ESM module — registers every nested `skills` folder; injects `AGENTS.md` as context  |
| Pi                 | `package.json` (`pi.skills`)                               | `pi install git:github.com/jeffreytse/grimoire-core`                                 |
| Kimi Code          | `kimi.plugin.json`                                         | `/plugins install <repo>`                                                            |
| OMP                | `.claude-plugin/` marketplace                              | `omp plugin marketplace add` + `omp plugin install`                                  |
| Grok Build         | `.grok-plugin/plugin.json`                                 | Plugin bundle built and registered by `grimoire install --target grok --global`      |
| Muse               | `.muse-plugin/plugin.json`                                 | Plugin bundle built and registered by `grimoire install --target muse --global`      |
| Gemini CLI         | `gemini-extension.json` → `GEMINI.md`                      | Context only — skills via `grimoire install --target gemini`                         |
| Antigravity, OpenClaw, DeepSeek Harness, MiniMax, generic | — | `grimoire install --target <name>` links skills into the agent's folder |

Manifests list nested skill folders explicitly, so skill names must match their folder, be lowercase-hyphen, ≤ 64 characters, and unique across all domains.

All agent-facing content (CLAUDE.md, AGENTS.md, GEMINI.md) describes grimoire's available skills and how to invoke them. Agent-specific docs live at the repo root. Per-agent install details: [Agent Integration Guide](./agents.md).

### MCP mode

`grimoire mcp install` takes a different path, and is the recommended one: nothing is copied into the agent. It registers `grimoire mcp serve` (stdio) as an MCP server, writes one instruction line to the agent's instruction file, adds hooks, pre-approves the read-only tools, and (Claude Code) adds a status line badge.

Why it matters: agents load only a fixed listing of installed skills' names and descriptions — ~8,000–16,000 characters in Claude Code and Codex — while grimoire-core's descriptions total ~320,000. Linked skills beyond the listing are invisible to the agent. MCP mode replaces the listing with search.

```
session start ──▶ grimoire hook session ──▶ start-best-practice router + Display + preferences
each prompt   ──▶ grimoire hook prompt  ──▶ routing reminder + unverified candidates
agent ──"grimoire_search_skills(queries)"──▶ grimoire mcp serve ──▶ hybrid index over installed packages
      ◀── ranked names + descriptions + related, declared standards first ──┘
agent ──"grimoire_get_skill(names)"──────▶ full SKILL.md (up to 20)
```

- **Search** is hybrid: field-weighted BM25F (name ×3, tags ×2, description and domain ×1) fused by reciprocal rank with a ranking over each skill's full text, with stopword removal, stemming and hyphen/underscore token expansion. It takes several phrasings at once, `domain`/`subdomain`/`tags` filters and `offset` paging.
- **Session hook:** `grimoire hook session` injects the `start-best-practice` routing table, its Display section and resolved preferences once per session (`SessionStart` in Claude Code, Codex, Gemini CLI). Under a size budget it degrades in steps — examples first, then Display — but never drops the routing table.
- **Prompt hook:** `grimoire hook prompt` (~0.1 s) adds a routing reminder to every request plus keyword-matched candidates labeled unverified, or inlines the skill named by `grimoire:<name>`. It stays silent on small talk and never blocks a prompt. Installed as `UserPromptSubmit` (Claude Code, Codex), `BeforeAgent` (Gemini CLI), `PreInvocation` (Antigravity), or an OpenCode plugin; Copilot CLI has no usable hook.
- **Hookless agents:** the routing directive opens the `grimoire_get_skill` and `grimoire_search_skills` tool descriptions and the server instructions, so every MCP client routes.
- **Project scope:** the server reads the project's `grimoire.toml`; declared practices rank first and are labeled `standard: project|user|org`, and `[standards] scope = "strict"` limits search to them.
- **Display and activation:** `core.trace` (`brief`/`full`/`hidden`) and `core.active` reach the model through hooks, server instructions and every `grimoire_get_skill` result.
- **Routing and batch loading:** every request routes through `start-best-practice`, and `grimoire_get_skill` accepts a `names` list so a plan loads all its skills in one call.
- **Meta skills** chain other skills through `grimoire_search_skills` / `grimoire_get_skill` in MCP mode, via the [Skill Access](./authoring-skills.md#skill-access-for-meta-skills) section of STANDARD.md.

Skills mode gets the same display through its own hooks (`grimoire hook skills-session`, `skills-prompt`, and `skill-used` for the badge); each agent runs one mode.

See [MCP Mode](./mcp-mode.md).

---

## Meta skills: the framework's nervous system

grimoire is self-managing. The meta skills in `skills/meta/` run the framework itself:

**User-facing meta skills** — help users find and apply practices:

| Skill                                    | What it does                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `analyze-best-practice-problem`          | Clarifies an ill-defined problem through structured questioning, then maps the problem space and surfaces possible routes |
| `discover-best-practices`                | Surfaces available practices for a domain before the user has a specific problem — grouped by subdomain, framed as gaps   |
| `start-best-practice`                    | Entry point for every request — routes it to the matching workflow; defines grimoire's Display format                    |
| `suggest-best-practice`                  | Universal entry point — classifies any situation and routes to the matching skill or install command                      |
| `plan-best-practice-solution`            | Decomposes multi-domain problems into sequenced skill applications (MECE methodology)                                     |
| `apply-best-practice-tree`               | Recursively decomposes a complex single-domain problem into sub-problems, matching each to the best installed skill       |
| `review-best-practice-fit`               | Evaluates an existing solution against best practices — ALIGNED/PARTIAL/MISSING per practice, prioritized fix list        |
| `compare-best-practices`                 | Side-by-side comparison when multiple practices apply — produces a table and a clear recommendation                       |
| `audit-applied-best-practices`           | Audits existing work for which practices were applied, which are missing, and what gaps to close                          |
| `explain-best-practice`                  | Educational deep-dive: problem → origin → evidence → mechanism → failure modes → misconceptions                           |
| `learn-best-practice`                    | Builds durable, independent recall of one practice — active-recall testing, spaced review, a portable memory aid          |
| `learn-grimoire`                         | Onboards a user to grimoire itself — what it is, why it exists, core concepts, and how to use it day to day               |
| `adapt-best-practice`                    | Adapts a practice for specific constraints, classifying each step as Core/Adjustable/Optional                             |
| `teach-best-practice`                    | Produces audience-tailored talking points, brief, or slide outline for sharing a practice with others                     |
| `pin-best-practice-preference`           | Saves a practice preference at session, project, or global level for a domain or subdomain                                |
| `resolve-best-practice-conflict`         | Resolves contradictory guidance between installed skills, or proactively ranks conflicts                                  |
| `configure-grimoire`                     | Views, edits, removes, or validates grimoire settings (`grimoire.toml`)                                                   |
| `install-grimoire`                       | Installs/uninstalls skills by domain or skill, upgrades grimoire, cleans broken symlinks, health-checks                   |
| `apply-best-practice-driven-development` | Systematically aligns any project/artifact to your stated best-practice preferences (BPDD)                                |
| `check-best-practice-compliance`         | Checks whether an artifact aligns with your pinned preferences — the "linter for best practices"                          |
| `fix-best-practice-finding`              | Fixes a specific compliance finding from a `check-best-practice-compliance` report                                        |
| `apply-best-practice-profile`            | Activates a named set of best practices for a paradigm/methodology (e.g. "use OOP")                                       |
| `write-best-practice-profile`            | Creates a new practice profile                                                                                            |
| `review-best-practice-profile`           | Validates a practice profile before using or sharing it                                                                   |
| `share-best-practice-profile`            | Publishes/shares a practice profile                                                                                       |

**Contributor meta skills** — manage the library itself:

| Skill                           | What it does                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `write-best-practice-skill`     | Guides authoring a new SKILL.md from scratch                                                 |
| `review-best-practice-skill`    | Evaluates a SKILL.md — PASS/NEEDS-REVISION/REJECT with specific findings                     |
| `revise-best-practice-skill`    | Applies review findings to an existing skill without touching passing sections               |
| `audit-best-practice-domain`    | Batch-evaluates all skills in a domain, calls review-best-practice-skill per file            |
| `deprecate-best-practice-skill` | Marks an outdated skill for removal with migration guidance                                  |
| `design-best-practice-domain`   | Architects a new domain: directory structure, plugin files, marketplace entries, seed skills |

**Why this matters:** `review-best-practice-skill` runs the exact same criteria as `STANDARD.md`. As long as both are maintained together, the quality standard is self-enforcing — it cannot drift between the written standard and what's actually checked. Any agent using grimoire's meta skills applies the same bar every time.

---

## Quality gate

The contribution pipeline is:

```
write-best-practice-skill  →  review-best-practice-skill  →  revise-best-practice-skill  →  review-best-practice-skill  →  PR merge
                    ↑                                    |
                    └────────────── loop ────────────────┘
```

For new domains:

```
design-best-practice-domain  →  write-best-practice-skill (seed skills)  →  audit-best-practice-domain  →  PR merge
```

`review-best-practice-skill` uses the Fagan Inspection method (IBM 1976) — a deterministic checklist that produces consistent verdicts regardless of which agent applies it. PASS requires all criteria to be ✅. A REJECT on any frontmatter field blocks merge.

The full criteria and checklist are in [STANDARD.md](https://github.com/jeffreytse/grimoire-core/blob/main/STANDARD.md).
