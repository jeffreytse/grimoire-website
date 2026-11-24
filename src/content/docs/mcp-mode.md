---
title: 'MCP Mode'
description: 'The recommended way to run grimoire: the whole skill library served on demand over MCP, nothing copied into your agent. Setup per agent, hooks, display levels, on/off controls, and project standards.'
---

# MCP Mode

grimoire can deliver skills three ways:

| Mode                        | How                                                                     | What lands in your agent                                                     |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **MCP mode** (recommended)  | `grimoire mcp install`                                                  | An MCP server registration, a one-line instruction, hooks and a status badge |
| **Skills mode**             | `grimoire install --target <agent>`                                     | Skills linked into the agent's skills folder + `start-best-practice` trigger |
| **Native plugin**           | The agent's own plugin command (`/plugin install grimoire@grimoire`, …) | Every skill, as agent slash commands                                         |

In MCP mode the agent does not preload any skill. It asks grimoire for one when a task needs it — `grimoire_search_skills` to find candidates, `grimoire_get_skill` to load the full SKILL.md — so 1,300+ skills cost no context until one is used.

---

## Why MCP Mode Is Recommended

Agents put every installed skill's name and description into a fixed listing — about **8,000–16,000 characters** in Claude Code and Codex — and silently truncate or drop what doesn't fit. grimoire-core's descriptions total **~320,000 characters**, so a full skills-mode install leaves the agent able to discover only a few percent of the library. About 30 skills fit Claude Code's or Codex's listing; even one subdomain such as `engineering/development` (44 skills) does not.

MCP mode keeps that listing empty and finds skills by search when a task needs them, and adds grimoire's hooks and [display](#what-you-see). Use skills mode only for agents without MCP support (OpenClaw, DeepSeek Harness, Grok, Muse, MiniMax, generic `agent`) or for a deliberately small subset.

`grimoire install` warns when the skills you link exceed an agent's listing budget — it says how many the agent will actually see and suggests MCP mode or a smaller `--domain`/`--subdomain`. `grimoire doctor` reports the same for existing installs; `--no-load-optimize` silences it.

---

## Install

```bash
grimoire mcp install                          # Claude Code: register the server, add the CLAUDE.md instruction, hooks + status line badge
grimoire mcp install --target all             # every supported agent on your PATH
grimoire mcp install --target codex,gemini
grimoire mcp install --scope project          # this repo only (commit the files to share)
grimoire mcp install --target claude-desktop  # Claude Desktop — no terminal agent needed
grimoire mcp uninstall --target all           # undo
```

`grimoire wizard` asks the same question first: how should agents get skills? MCP mode is the recommended option. Agents without MCP support fall back to skills mode, and user-scope-only agents are set up user-wide with a note. The installer scripts also suggest `grimoire mcp install --target all`.

| Flag              | Default  | Meaning                                                                                       |
| ----------------- | -------- | --------------------------------------------------------------------------------------------- |
| `--target`        | `claude` | One agent, a comma list, or `all` (agents on your `PATH`; `claude-desktop` must be named)    |
| `--scope`         | `user`   | `user` (all projects) or `project` (current project)                                          |
| `--no-hook`       | off      | Don't add the session and prompt hooks                                                        |
| `--no-allow`      | off      | Don't pre-approve grimoire's read-only tools (Claude Code, Antigravity)                       |
| `--statusline`    | off      | Chain an existing Claude Code status line so the `GRIMOIRE` badge shows after it              |
| `--no-statusline` | off      | Don't add the `GRIMOIRE` badge to the Claude Code status line                                 |
| `--no-configure`  | off      | Register the server only — write no instruction and no hook                                   |

Re-running is safe: existing registrations and instructions are detected, nothing is duplicated, and an older `start-best-practice` trigger is replaced. Start a new agent session afterwards — in Claude Code, `/mcp` lists grimoire as connected. Run `grimoire update` to refresh the skills the server serves.

`grimoire doctor` detects MCP mode per agent and checks the instruction line, session hook, prompt hook and status badge. It warns when grimoire skills are *also* linked into the same agent (duplicates) or a piece is missing.

### What each agent gets

| Agent              | Scopes        | Server registered via                           | Instruction written to                         | Hooks                                                                                     |
| ------------------ | ------------- | ----------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Claude Code        | user, project | `claude mcp add`                                | `~/.claude/CLAUDE.md` / `./CLAUDE.md`          | `SessionStart` + `UserPromptSubmit` (+ `PostToolUse` for the badge) in `.claude/settings.json` |
| Codex              | user          | `codex mcp add`                                 | `~/.codex/AGENTS.md`                           | `SessionStart` + `UserPromptSubmit` in `~/.codex/hooks.json` (trust them in `/hooks`)     |
| Gemini CLI         | user, project | `gemini mcp add`                                | `~/.gemini/GEMINI.md` / `./GEMINI.md`          | `SessionStart` + `BeforeAgent` in `.gemini/settings.json`                                 |
| GitHub Copilot CLI | user          | `copilot mcp add`                               | `~/.copilot/copilot-instructions.md`           | — (Copilot drops command-hook output for `userPromptSubmitted`)                           |
| OpenCode           | user, project | `opencode.json` (`mcp.grimoire`)                | `~/.config/opencode/AGENTS.md` / `./AGENTS.md` | plugin `plugins/grimoire.js` (`chat.message` + system transform, toasts)                  |
| Pi                 | user, project | `~/.pi/agent/mcp.json` / `.pi/mcp.json`         | `~/.pi/agent/AGENTS.md` / `./AGENTS.md`        | —                                                                                         |
| Kimi Code          | user, project | `~/.kimi-code/mcp.json` / `.kimi-code/mcp.json` | `~/.kimi-code/AGENTS.md` / `./AGENTS.md`       | —                                                                                         |
| OMP                | user, project | `~/.omp/agent/mcp.json` / `.omp/mcp.json`       | `~/.omp/agent/AGENTS.md` / `.omp/AGENTS.md`    | —                                                                                         |
| Antigravity        | user          | `~/.gemini/config/mcp_config.json`              | injected by the `SessionStart` hook (agy has no user-level instruction file) | `PreInvocation` in `~/.gemini/config/hooks.json`, once per new prompt |
| Claude Desktop     | user          | `claude_desktop_config.json` (absolute path)    | none — grimoire's server instructions say when to use it | none                                                            |

Gemini keeps MCP servers disabled in folders you haven't trusted — trust the folder first.

The instruction is one line:

> Before responding to any user request, run grimoire's `start-best-practice` routing — load it with the grimoire MCP tool `grimoire_get_skill` if it is not already in context — and follow the workflow it routes to (it asks clarifying questions when needed and loads the specific best-practice skills). If the user writes `grimoire:<skill-name>`, call `grimoire_get_skill` with that exact name first, without searching, and follow it.

Re-running `grimoire mcp install` replaces older versions of this line (including the earlier "for a multi-step or unclear problem" wording), so upgrading grimoire and re-running picks up the new routing.

### Claude Desktop

For people who don't use a terminal agent:

```bash
grimoire mcp install --target claude-desktop   # write claude_desktop_config.json
grimoire mcp config  --target claude-desktop   # or just print the snippet
```

grimoire writes the macOS, Windows or Linux config path the MCP docs specify. The command is an **absolute path**, because desktop apps don't inherit your shell's `PATH`. Claude Desktop has no hooks or instruction file — grimoire's server instructions tell the model when to use it. It is left out of `--target all` (there is no CLI to detect), so name it explicitly. Restart Claude Desktop afterwards.

### Other MCP clients

For clients grimoire doesn't configure itself, print a config snippet and paste it in:

```bash
grimoire mcp config --target cursor      # or windsurf, cline
```

The server itself is `grimoire mcp serve` (stdio transport).

---

## Run a Specific Skill

In MCP mode skills are not agent slash commands. Name the skill instead:

```
grimoire:propose-conventional-commit
grimoire:suggest-best-practice my team is losing confidence
```

Write `grimoire:<skill-name> [task]` in any agent, or type `/grimoire:skill <skill-name>` in Claude Code. A mistyped name comes back with "did you mean" suggestions. A named skill always loads — even while grimoire is [turned off](#turn-grimoire-on-or-off).

---

## Hooks

The instruction line is advisory — the model decides whether a task "needs" a skill and often skips the lookup. So wherever the agent supports them, `grimoire mcp install` also adds hooks that make MCP mode route like skills mode:

- **Session hook** (`grimoire hook session` — Claude Code, Codex, Gemini CLI `SessionStart`): injects the `start-best-practice` routing table, its rules and its Display section once per session, and again after `/clear` or compaction where the agent fires it. It also carries your resolved preferences, so workflows read them without a tool call. Every request is then routed to the workflow that fits — `suggest-best-practice`, `plan-best-practice-solution`, `apply-best-practice-tree`, … — which ask clarifying questions when needed and load the specific best practices.
- **Prompt hook** (`grimoire hook prompt`, ~0.1 s): on every new request, a one-line reminder to apply that routing — direct tasks (write, fix, refactor, test, commit, review) included — plus keyword-matched skills offered as *unverified* candidates. `grimoire:<name>` inlines that skill instead. Small talk ("ok", "thanks") and slash commands get nothing.
- **Skill-used hook** (`grimoire hook skill-used`, Claude Code `PostToolUse`): records each grimoire skill loaded in the session, for the [status badge](#status-line-badge-claude-code).

**Antigravity** gets the instruction through `grimoire hook antigravity-session` (`SessionStart`) and the prompt hook through `grimoire hook antigravity-prompt` (`PreInvocation`). **OpenCode** has no session-start hook, so its plugin keeps the router in every turn's system prompt and shows the session status once as a toast.

**Agents without hooks** (Copilot CLI, Pi, Kimi, OMP, Claude Desktop) still route: the routing directive opens the `grimoire_get_skill` and `grimoire_search_skills` tool descriptions, which every MCP client shows the model, and the server instructions repeat it.

If the router would push the session context past its budget, it degrades in steps — full, then without examples, then without Display — instead of falling back to a one-line directive; the routing table itself is never dropped. Package authors: `grimoire package validate` fails when the router's Display section would not fit.

**Codex:** new hooks run only after you trust them — open `/hooks` in Codex once after installing.

Other hooks in the agent's settings (e.g. caveman) are kept. `--no-hook` skips grimoire's; `grimoire mcp uninstall` removes them. A failing hook never blocks a prompt — it exits silently.

### Matching and search quality

Prompt-hook candidates and `grimoire_search_skills` use **hybrid search**: field-weighted BM25F (name ×3, tags ×2, description and domain ×1, each normalized by its own length) fused by reciprocal rank with a ranking over each skill's full text. Stopwords are dropped and terms stemmed, so "commit" / "commits" / "committing" match the same skills; short slash acronyms (`A/B`, `CI/CD`) stay one token. On grimoire's 54 labeled prompts this lifted hit@10 from 49 to 52 and top-1 from 39 to 40.

Package authors can measure accuracy against their own skills:

```bash
GRIMOIRE_HOOK_EVAL=1 go test ./cmd -run TestHookEval -v              # does the hook surface the right candidates?
GRIMOIRE_SELECTION_EVAL=1 go test ./cmd -run TestSelectionEval -v    # does the assistant end up applying the right practice? (API credits)
```

---

## What You See

grimoire shows its work so you can follow its decisions and redirect them. How much is a **display level** — `grimoire config set core.trace <level>`, or `GRIMOIRE_TRACE=<level>` for one run:

| Level             | Shows                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brief` (default) | The decisions: route, plan (confirmed once), each skill as it's applied, outcome                                                                              |
| `full`            | Brief plus the evidence: workflow names, each skill's domain (copied from the package, never guessed), candidate skills and why, 🔴/🟡/⚪ severity, ⚠ risks, the applied skill's _Source_ |
| `hidden`          | No notes — grimoire still routes and applies silently (`off` is accepted as an alias)                                                                         |

In a session, say any of these — no setup needed:

| Say                            | Effect                                         |
| ------------------------------ | ---------------------------------------------- |
| "grimoire help"                | Lists these controls (works even while off)    |
| "show grimoire details"        | `full` level                                   |
| "quiet grimoire"               | `hidden` level — notes hidden, routing continues |
| "plain grimoire"               | Words instead of glyphs (screen readers)       |
| "skip grimoire"                | Skip it for this request                       |
| "grimoire off" / "grimoire on" | Stop or resume routing in this session         |

The first time grimoire acts on a request after install, a one-time tip points to "grimoire help" — the one phrase to remember.

### The format

The format is defined once, as exact templates, in `start-best-practice`'s **Display** section; grimoire's hooks and MCP server only say which level is on. A question, a choice or "Apply this plan?" always ends the reply — nothing runs until you answer:

```
❯ We're launching our SaaS in 48 hours. I'm terrified something will break.

⏺ grimoire ▸ planning several skills — launch readiness needs them in order

  **Plan** — 2 steps
  ⎿  Step 1  apply-premortem — find the likeliest failures first
  ⎿  Step 2  plan-incident-response — decide who acts when one happens
  Apply this plan? Steps that change files or run commands ask first.
```

- **One route line per request** (`grimoire ▸ …`), plain lowercase words, never restated after a tool call. At `full` it also names the workflow (`· plan-best-practice-solution`).
- **Choices:** at most 4, numbered, one `★ recommended` (at `full`, a `⎿  Why ★` row says why). The question is `Reply 1–N, "all", or "skip".`
- **Plans** are confirmed once. A step where several skills fit shows lettered choices (`2a`, `2b` — at most 3, one ★); reply "yes" to take every ★, or name another ("2b"). One level of nested sub-plans is allowed. grimoire pauses again only before a step with side effects (files, commands, external actions), or after every step if you ask to go step by step.
- **Progress:** plan steps show where you are — `**design-slo** — step 2 of 4`.
- **No match:** when no installed skill fits, grimoire says so with the need it searched for and how to add coverage (`⎿  No match  no installed skill covers "…" — add a package: grimoire package add <repo>`).
- **Skills are named by id** — the name you can type back as `grimoire:<id>`. Meta workflows are never offered as choices.
- **Hierarchy:** the answer is primary; a skill block's name is the only bold; route lines, row labels and domains are plain. Structure uses one text-glyph family (`▸ ⎿ → ✓ ★ ⚠`); colored emoji appear only for severity, always with the word.

**Plain style.** For screen readers, `grimoire config set core.display-style plain` (also on whenever `NO_COLOR` is set; `GRIMOIRE_DISPLAY_STYLE=plain` for one run; say "plain grimoire" for one session) asks for words instead of glyphs — `Step 1:`, `Risk (high):`, `Done:`.

Skill packages without a Display section get a built-in one-line-per-decision fallback.

### Status lines

Status lines (hook `systemMessage` in Claude Code, Codex and Gemini CLI; toasts in OpenCode) state only facts grimoire knows — never a guess about what the model will do. Agents render them as warnings, so they're kept for things worth one:

- **At `brief`, silent on success.** A routine "ready" would dull real warnings; the badge and the first route line show grimoire is on.
- **On a problem, always** — e.g. `grimoire ▸ no skills package with start-best-practice — run grimoire update`.
- **When you name a skill** — `grimoire ▸ loading skill <name>` (or `unknown skill <ref>`).
- **At `full`, also the details** — `grimoire ▸ ready · full view — …` and the keyword candidates passed to the model, labeled unverified.

| Agent                               | Status lines                                     | Display level reaches the model via                          |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Claude Code, Codex, Gemini CLI      | hook `systemMessage` (Codex: shown as a warning) | hooks                                                        |
| OpenCode                            | toast from the grimoire plugin                   | plugin                                                       |
| Antigravity                         | — (its hooks have no user-visible output)        | hooks                                                        |
| Copilot CLI, Pi, Kimi, OMP, Claude Desktop | — (no hooks)                              | server instructions and every `grimoire_get_skill` result    |

### Status line badge (Claude Code)

Install shows a ` GRIMOIRE ` chip in Claude Code's status line: the book's ink (`#1a0d06`) on grimoire's brand gold (`#c9933a`) — 7.0:1 contrast on light and dark themes alike. With `NO_COLOR` or `TERM=dumb` it reads plain `[GRIMOIRE]`. It names the current session's last grimoire skill and workflow — `[GRIMOIRE:<workflow> › <skill>]` — recorded per session, so concurrent sessions never show each other's skills. While grimoire is off it reads `[GRIMOIRE off]`.

Claude Code has one status line slot, so grimoire only takes an empty one. If another tool already owns it, install leaves it alone and says so; `--statusline` chains it (`grimoire statusline --then '<their command>'`, badge after their output), and uninstall restores the original. `--no-statusline` skips the badge.

---

## Turn grimoire On or Off

Active (the default), grimoire routes every request through its workflows. Inactive, it stays out of the way — no router, no reminders — while a skill you name with `grimoire:<name>` still loads and nothing is uninstalled.

| Scope                 | Off                                                          | On                   |
| --------------------- | ------------------------------------------------------------ | -------------------- |
| All sessions          | `grimoire disable`                                           | `grimoire enable`    |
| This session          | say "grimoire off" (or "disable grimoire", "turn off grimoire") | say "grimoire on" |
| One run (CI, scripts) | `GRIMOIRE_ACTIVE=0`                                          | `GRIMOIRE_ACTIVE=1`  |

The first one set wins: `GRIMOIRE_ACTIVE`, then the session, then `core.active` (written by `grimoire enable`/`disable`). Only a whole-prompt phrase toggles; a session toggle is confirmed in the assistant's own reply (and the badge), not as a hook warning, and doesn't touch other sessions. While off, a new session says `grimoire ▸ off … — say "grimoire on" to resume` at most once a day at `brief`.

Agents without hooks (Copilot CLI, Pi, Kimi, OMP) follow `grimoire disable` through the MCP server; the in-session phrases need a prompt hook.

This is separate from the display level: `core.trace hidden` hides grimoire's notes, but it still routes.

---

## Project Standards in MCP Mode

A project's `grimoire.toml` declares practices through its `[dependencies]` packages, its `[standards] profiles` and its pinned `[standards.<domain>] practices`. In MCP mode these are **preferred, not a fence**:

- The whole library stays available for solving problems.
- Declared practices rank first among comparable matches in search and hook candidates, and get the ★ when they fit.
- Each is labeled with the layer that declared it — `standard: "project"`, `"user"` or `"org"`, nearest wins (see [Config layers](./config.md#what-each-layer-can-declare)). A recommended skill outside them is labeled `not a declared standard`.
- BPDD and compliance workflows (`apply-best-practice-driven-development`, `check-best-practice-compliance`) search with `scope: "project"`, so only declared practices are binding there.

Teams that want a hard boundary set:

```toml
[standards]
scope = "strict"
```

MCP mode then serves only declared practices. Meta workflows still load by name (routing needs them), and any skill named with `grimoire:<name>` still loads, with a note.

The server reads `grimoire.toml` from the project the agent runs in and never fetches on its own. `grimoire update` or `grimoire mcp install` in the project clones dependency packages it lacks; until then the session shows `grimoire ▸ this project needs <package> — run grimoire update`.

---

## Workflows in MCP Mode

The meta workflows — `suggest-best-practice`, `plan-best-practice-solution`, `audit-applied-best-practices`, … — chain other skills. In MCP mode they find and load those skills through `grimoire_search_skills` / `grimoire_get_skill` instead of the agent's Skill tool, so they behave the same as in skills mode. Start one with `grimoire:<workflow-name> [task]`.

The instruction line, server instructions and session hook route **every** request through `start-best-practice`; the prompt hook re-applies it per request. Route explicitly with `grimoire:start-best-practice`.

`grimoire_get_skill` accepts a `names` list (up to 20), so a plan that chains several skills can load them all in one call.

Practice pins live in `grimoire.toml` in both modes — see [Config](./config.md#skills-mode-and-mcp-mode).

Skill authors: a skill that loads or scores other skills must include the [Skill Access](./authoring-skills.md#skill-access-for-meta-skills) section so it works in both modes.

---

## MCP Tools

Every tool carries a readable title (e.g. "Load grimoire skill") and read-only / destructive / idempotent / open-world hints, so clients can group lookups and decide what needs approval.

| Tool                                                       | Purpose                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `grimoire_search_skills`                                   | Hybrid skill search. Takes several phrasings at once (`queries`), `domain` / `subdomain` / `tags` filters and `offset` paging; results carry rank, matched terms and `related` skills, with declared standards first |
| `grimoire_get_skill`                                       | Full SKILL.md by exact name, or up to 20 at once via `names`; returns `related` skills; unknown names return close matches |
| `grimoire_list_skills`                                     | Domain index of available skills                                |
| `grimoire_context`, `grimoire_info`, `grimoire_search`     | Context, skill metadata and catalog search for routed workflows |
| `grimoire_config_get` / `_set` / `_unset` / `_add` / `_remove`, `grimoire_get_config` | Read and write `grimoire.toml` pins |
| `grimoire_package_add` / `_list` / `_update` / …           | Manage skill packages                                           |
| `grimoire_check`, `grimoire_run_rules`                     | Run compliance checks                                           |
| `grimoire_install`, `grimoire_update`, `grimoire_doctor`, `grimoire_status`, … | Mirror the CLI commands                     |

### Search and retrieve freely

On install, grimoire **pre-approves every tool that only reads** — skill search, retrieval and browsing, plus context, info, status, check, config and profile reads — in Claude Code's and Antigravity's `permissions.allow`. An assistant can then look up as much as a task needs without approval prompts (Antigravity's headless mode refuses unapproved MCP tools outright). Tools that change config or packages still ask. `--no-allow` skips this; uninstall removes exactly those entries.

---

## Skills Mode or MCP Mode?

| You want                                                                  | Use                                           |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| The whole library, discoverable; hooks, display and project standards     | **MCP mode**                                  |
| One server for many agents, minimal context cost                          | MCP mode                                      |
| Claude Desktop, Cursor, Windsurf, Cline                                   | MCP mode (`--target claude-desktop`, `grimoire mcp config`) |
| An agent without MCP (OpenClaw, DeepSeek Harness, Grok, Muse, MiniMax)    | Skills mode                                   |
| A small curated subset (~30 skills) as slash commands                     | Skills mode (`grimoire install --subdomain`)  |

Skills mode has the same display: `grimoire install` adds a session hook (`grimoire hook skills-session`), a prompt hook (`grimoire hook skills-prompt`) and, in Claude Code, the skill-used hook and status badge. They replace any MCP-mode hooks on the same events, so each agent runs one mode.

You can switch any time — `grimoire mcp install` replaces the skills-mode trigger, and `grimoire mcp uninstall` removes everything it added. **Don't run both modes in the same agent:** linked skills would fill the agent's listing anyway, defeating MCP mode (`grimoire doctor` flags this). Uninstall them first (`grimoire uninstall`), or let `grimoire:install-grimoire` walk you through it.

---

## Related

- [Agent Integration Guide](./agents.md) — native plugin and skills-mode install per agent
- [CLI Reference](./cli-reference.md#mcp-server) — every `grimoire mcp` flag
- [Config](./config.md) — `grimoire.toml` keys and layers
