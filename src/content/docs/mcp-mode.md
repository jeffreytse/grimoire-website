---
title: 'MCP Mode'
description: 'Serve grimoire skills on demand over MCP — nothing copied into your agent. Setup per agent, the Claude Code prompt hook, and running a specific skill with grimoire:<name>.'
---

# MCP Mode

grimoire can deliver skills three ways:

| Mode              | How                                                        | What lands in your agent                                          |
| ----------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| **Native plugin** | The agent's own plugin command (`/plugin install grimoire@grimoire`, …) | Every skill, as agent slash commands                    |
| **Skills mode**   | `grimoire install --target <agent>`                        | Skills linked into the agent's skills folder + `start-best-practice` trigger |
| **MCP mode**      | `grimoire mcp install`                                     | Nothing but an MCP server registration and a one-line instruction |

In MCP mode the agent does not preload any skill. It asks grimoire for one when a task needs it — `grimoire_search_skills` to find candidates, `grimoire_get_skill` to load the full SKILL.md — so 1000+ skills cost no context until one is used.

---

## Install

```bash
grimoire mcp install                      # Claude Code: register the server, add the CLAUDE.md instruction + prompt hook
grimoire mcp install --target all         # every supported agent on your PATH
grimoire mcp install --target codex,gemini
grimoire mcp install --scope project      # this repo only (commit the files to share)
grimoire mcp uninstall --target all       # undo
```

| Flag             | Default  | Meaning                                                          |
| ---------------- | -------- | ---------------------------------------------------------------- |
| `--target`       | `claude` | One agent, a comma list, or `all`                                |
| `--scope`        | `user`   | `user` (all projects) or `project` (current project)             |
| `--no-hook`      | off      | Don't add the Claude Code prompt hook                            |
| `--no-configure` | off      | Register the server only — write no instruction and no hook      |

Re-running is safe: existing registrations and instructions are detected, nothing is duplicated, and an older `start-best-practice` trigger from skills mode is replaced. Start a new agent session afterwards — in Claude Code, `/mcp` lists grimoire as connected. Run `grimoire update` to refresh the skills the server serves.

### What each agent gets

| Agent              | Scopes        | Server registered via                           | Instruction written to                                   |
| ------------------ | ------------- | ----------------------------------------------- | -------------------------------------------------------- |
| Claude Code        | user, project | `claude mcp add`                                | `~/.claude/CLAUDE.md` / `./CLAUDE.md`                    |
| Codex              | user          | `codex mcp add`                                 | `~/.codex/AGENTS.md`                                     |
| Gemini CLI         | user, project | `gemini mcp add`                                | `~/.gemini/GEMINI.md` / `./GEMINI.md`                    |
| GitHub Copilot CLI | user          | `copilot mcp add`                               | `~/.copilot/copilot-instructions.md`                     |
| OpenCode           | user, project | `opencode.json` (`mcp.grimoire`)                | `~/.config/opencode/AGENTS.md` / `./AGENTS.md`           |
| Pi                 | user, project | `~/.pi/agent/mcp.json` / `.pi/mcp.json`         | `~/.pi/agent/AGENTS.md` / `./AGENTS.md`                  |
| Kimi Code          | user, project | `~/.kimi-code/mcp.json` / `.kimi-code/mcp.json` | `~/.kimi-code/AGENTS.md` / `./AGENTS.md`                 |
| OMP                | user, project | `~/.omp/agent/mcp.json` / `.omp/mcp.json`       | `~/.omp/agent/AGENTS.md` / `.omp/AGENTS.md`              |
| Antigravity        | user          | `~/.gemini/config/mcp_config.json`              | — agy has no user-level instruction file; add the line to a project `AGENTS.md` |

Gemini keeps MCP servers disabled in folders you haven't trusted — trust the folder first.

The instruction is one line:

> For any task, first use the grimoire MCP tools: `grimoire_search_skills` to find a relevant best-practice skill, then `grimoire_get_skill` to load and follow it. If the user writes `grimoire:<skill-name>`, call `grimoire_get_skill` with that exact name first, without searching, and follow it.

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

Write `grimoire:<skill-name> [task]` in any agent, or type `/grimoire:skill <skill-name>` in Claude Code. A mistyped name comes back with "did you mean" suggestions.

---

## The Prompt Hook (Claude Code)

The instruction file is advisory — the model decides whether a task "needs" a skill and often skips the lookup. So in Claude Code, `grimoire mcp install` also adds a `UserPromptSubmit` hook to `settings.json`:

```
grimoire hook prompt
```

It runs on every prompt (~0.1 s):

- `grimoire:<name>` in the prompt → that skill is inlined directly.
- Otherwise → the top matching skills (up to three, name + description) are listed for the model to load.
- Small talk ("ok", "thanks") → nothing. Suggestions need a minimum BM25 score and at least two matching prompt terms, so short replies cost no tokens.

Other hooks in `settings.json` are kept. `--no-hook` skips it; `grimoire mcp uninstall` removes it. A failing hook never blocks a prompt — it exits silently. Other agents rely on the instruction file alone.

Matching is lexical BM25 with stopword removal and stemming, so word forms like "commit" / "commits" / "committing" match the same skills. Package authors can measure hook accuracy against their own skills:

```bash
GRIMOIRE_HOOK_EVAL=1 go test ./cmd -run TestHookEval -v
```

---

## Workflows in MCP Mode

The meta workflows — `suggest-best-practice`, `plan-best-practice-solution`, `audit-applied-best-practices`, … — chain other skills. In MCP mode they find and load those skills through `grimoire_search_skills` / `grimoire_get_skill` instead of the agent's Skill tool, so they behave the same as in skills mode. Start one with `grimoire:<workflow-name> [task]`.

`start-best-practice` runs automatically before every request only in skills mode (the trigger `grimoire install` writes). In MCP mode the prompt hook plays that role; route explicitly with `grimoire:start-best-practice`.

Practice pins live in `grimoire.toml` in both modes — see [Config](./config.md#skills-mode-and-mcp-mode).

Skill authors: a skill that loads or scores other skills must include the [Skill Access](./authoring-skills.md#skill-access-for-meta-skills) section so it works in both modes.

---

## MCP Tools

| Tool                                                       | Purpose                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `grimoire_search_skills`                                   | BM25-ranked skill search; reports matched terms                 |
| `grimoire_get_skill`                                       | Full SKILL.md by exact name; unknown names return close matches |
| `grimoire_list_skills`                                     | Domain index of available skills                                |
| `grimoire_config_get` / `_set` / `_unset` / `_add` / `_remove` | Read and write `grimoire.toml` pins                         |
| `grimoire_package_add` / `_list` / `_update` / …           | Manage skill packages                                           |
| `grimoire_check`, `grimoire_run_rules`                     | Run compliance checks                                           |
| `grimoire_install`, `grimoire_update`, `grimoire_doctor`, `grimoire_status`, … | Mirror the CLI commands                     |

---

## Skills Mode or MCP Mode?

| You want                                                        | Use          |
| --------------------------------------------------------------- | ------------ |
| Slash commands for every skill; `start-best-practice` auto-runs | Skills mode  |
| Minimal context cost; one server for many agents                | MCP mode     |
| An agent grimoire can't install skills into (Cursor, Windsurf, Cline) | MCP mode (`grimoire mcp config`) |
| Subdomain-level installs                                        | Skills mode (`grimoire install --subdomain`) |

You can switch any time — `grimoire mcp install` replaces the skills-mode trigger, and `grimoire mcp uninstall` removes everything it added.

---

## Related

- [Agent Integration Guide](./agents.md) — native plugin and skills-mode install per agent
- [CLI Reference](./cli-reference.md#mcp-server) — every `grimoire mcp` flag
- [Config](./config.md) — `grimoire.toml` keys
