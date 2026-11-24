---
title: 'CLI Reference'
description: 'Every grimoire CLI command — install, check, profiles, packages, settings, on/off, MCP mode, hooks and the status line badge.'
---

# CLI Reference

`grimoire` — best practice enforcement for AI assistants. Every top-level command, one line each.

---

## Setup

| Command                               | What it does                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `grimoire init`                       | Initialize `.grimoire/` in the current project                                 |
| `grimoire install [<grimoire-ref>]`   | Install skills from `grimoire.toml` or a grimoire-ref                          |
| `grimoire install --target <agent>`   | Install into one agent: `claude`, `codex`, `gemini`, `antigravity`, `openclaw`, `opencode`, `copilot`, `pi`, `kimi`, `omp`, `dsh`, `grok`, `muse`, `minimax`, `agent`, `all`, or `auto` (detected agents) — see [Agents](./agents.md) |
| `grimoire install --global`           | User-wide install (shorthand for `--scope global`); required for `grok`, `muse`, `minimax` |
| `grimoire install --target agent`     | Install to the generic `agent` target (`~/.agents/skills`) — fallback for any AGENTS.md-reading agent with no dedicated integration |
| `grimoire install --no-load-optimize` | Install everything and silence the listing-budget warning. Agents load only ~8,000–16,000 characters of skill names and descriptions; without this flag, install says how many linked skills each agent will actually see and points to MCP mode or a smaller `--domain`/`--subdomain` |
| `grimoire install --no-hook`          | Skip grimoire's skills-mode session and prompt hooks (Claude Code, Codex, Gemini CLI) |
| `grimoire install --statusline` / `--no-statusline` | Chain an existing Claude Code status line with the `GRIMOIRE` badge / skip the badge |
| `grimoire uninstall [<grimoire-ref>]` | Remove grimoire skills from agent directories                                  |
| `grimoire update`                     | Update all packages to latest; clones the project's missing `[dependencies]` packages and relinks only agents that already have grimoire skills |
| `grimoire clean`                      | Remove stale grimoire-managed skills from agent directories                    |
| `grimoire enable`                     | Turn grimoire on for all sessions: route every request through its workflows (writes `core.active`) |
| `grimoire disable`                    | Turn grimoire off for all sessions: stop routing (named `grimoire:<skill>` still loads; nothing uninstalled) |
| `grimoire lock`                       | Regenerate `grimoire.lock` from the current `grimoire.toml` without installing |

## Discovery

| Command                   | What it does                                          |
| ------------------------- | ----------------------------------------------------- |
| `grimoire list`           | List available domains, sub-domains, and skills       |
| `grimoire search <query>` | Search installed packages for skills matching a query |
| `grimoire info <skill>`   | Show metadata for an installed skill                  |
| `grimoire context`        | Show grimoire context for AI assistants               |

## Compliance (BPDD)

| Command                                | What it does                                          |
| -------------------------------------- | ----------------------------------------------------- |
| `grimoire check [files/dirs/globs...]` | Run independent AI compliance check                   |
| `grimoire status`                      | Show project compliance health at a glance            |
| `grimoire watch`                       | Re-run compliance check whenever project files change |

`grimoire check` prints a `N passed · N failed · exit N` summary, a `└─ missing:` list of failing criteria per practice, and a diff-style code context block (±3 lines, `→` marker on the flagged line, `file:line` header) for each failing diagnostic.

See [BPDD](/bpdd) for the full methodology behind `grimoire check`.

## Validation

| Command | What it does |
|---------|-------------|
| `grimoire validate [<skill-path>...]` | Validate skill files against the grimoire STANDARD |

Not to be confused with `grimoire package validate` above, which checks a package's directory structure. `grimoire validate` lints individual SKILL.md files for STANDARD.md conformance — flags include `--strict`, `--json`, `--no-duplicates`, `--test-schema <dir>`, and an AI-powered `--fix` (via a local agent or API key — see `--via`/`--prefer-api`).

## Diagnostics

| Command                | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `grimoire doctor`      | Run a health check: per-agent MCP or skills mode, instruction line, hooks, status badge, duplicate installs, and skill-listing overflow |
| `grimoire wizard`      | Open the interactive TUI wizard — asks MCP or skills mode first (MCP recommended) |
| `grimoire statusline`  | Claude Code status line badge for grimoire (`--then '<command>'` chains another status line) |
| `grimoire version`     | Show grimoire version information                    |
| `grimoire self-update` | Update the grimoire CLI binary to the latest release |

## Configuration

| Command                                  | What it does                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `grimoire config`                        | Get or set grimoire configuration values                                          |
| `grimoire config get <key>`              | Print a config value and its source                                               |
| `grimoire config set <key> <value>`      | Set a config value                                                                |
| `grimoire config unset <key>`            | Clear a config value                                                              |
| `grimoire config add <key> <value>`      | Append a value to a list config key (idempotent)                                  |
| `grimoire config remove <key> <value>`   | Remove a value from a list config key                                             |
| `grimoire config show`                   | Show resolved grimoire config for the current project — see [Config](./config.md) |
| `grimoire config show --domain <prefix>` | Show only sections matching this domain prefix                                    |
| `grimoire config show --json`            | Output the resolved config as JSON                                                |

Display and activation keys: `core.trace` (`brief` · `full` · `hidden`), `core.display-style` (`plain`), `core.active` (`true`/`false`, set by `grimoire enable`/`disable`). See [Config](./config.md#display-and-activation).

## Profiles

| Command                        | What it does                                   |
| ------------------------------ | ---------------------------------------------- |
| `grimoire profile`             | Manage grimoire profiles                       |
| `grimoire profile list`        | List available profiles                        |
| `grimoire profile show <name>` | Show skills in a named profile                 |
| `grimoire profile init <name>` | Create a profile file in `.grimoire/profiles/` |

See [Practice Profiles](./profiles.md) for how profiles resolve.

## Packages

| Command                                      | What it does                                                      |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `grimoire package`                           | Manage grimoire skill packages                                    |
| `grimoire package list`                      | List all configured packages                                      |
| `grimoire package set <grimoire-ref>`        | Set the official package URL (`owner/repo[@version]` or full URL) |
| `grimoire package reset`                     | Clear `core.package` (revert to built-in default)                 |
| `grimoire package add <name> <grimoire-ref>` | Add a named package and clone it                                  |
| `grimoire package remove <name>`             | Remove a package by name                                          |
| `grimoire package enable <name>`             | Enable a previously disabled package                              |
| `grimoire package disable <name>`            | Disable a package without removing it                             |
| `grimoire package update [<name>]`           | Pull latest from all (or one named) package                       |
| `grimoire package validate [<path-or-name>]` | Validate a package's structure (for package authors)              |
| `grimoire package publish`                   | Guide for publishing a grimoire package to the community          |

## Authoring

| Command                           | What it does                                 |
| --------------------------------- | -------------------------------------------- |
| `grimoire generate <type> <name>` | Scaffold grimoire artifacts (skill, profile) |

## MCP server

| Command                                   | What it does                                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `grimoire mcp`                            | MCP server integration                                                                         |
| `grimoire mcp install`                    | Set up MCP mode: register the server, write the agent instruction, add hooks, pre-approve read-only tools, add the status badge |
| `grimoire mcp install --target <list>`    | Agents to configure — `claude` (default), a comma list (`codex,gemini`), `all` (on `PATH`), or `claude-desktop` (never in `all`) |
| `grimoire mcp install --scope project`    | Configure the current project instead of the user (`user` is the default)                       |
| `grimoire mcp install --no-hook`          | Skip the session and prompt hooks                                                              |
| `grimoire mcp install --no-allow`         | Don't pre-approve grimoire's read-only tools (Claude Code, Antigravity)                        |
| `grimoire mcp install --statusline`       | Chain an existing Claude Code status line so the `GRIMOIRE` badge shows after it               |
| `grimoire mcp install --no-statusline`    | Skip the `GRIMOIRE` status line badge                                                          |
| `grimoire mcp install --no-configure`     | Register the server only — write no instruction and no hook                                    |
| `grimoire mcp uninstall [--target <list>]` | Unregister the server; remove the instruction, hooks, tool pre-approvals and badge (restores a chained status line) |
| `grimoire mcp serve`                      | Start the grimoire MCP server (stdio transport)                                                |
| `grimoire mcp config --target <client>`   | Print an MCP config snippet (`claude`, `claude-desktop`, `cursor`, `windsurf`, `cline`)        |

## Hooks

Installed for you by `grimoire mcp install` or `grimoire install`; you never run them by hand.

| Command                               | What it does                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `grimoire hook session`               | MCP-mode session-start hook (Claude Code, Codex, Gemini CLI): inject the `start-best-practice` router, Display section and resolved preferences |
| `grimoire hook prompt`                | MCP-mode prompt hook (Claude Code, Codex, Gemini CLI, OpenCode): routing reminder plus unverified keyword-matched candidates; inlines `grimoire:<name>` |
| `grimoire hook antigravity-session`   | Antigravity `SessionStart`: inject the grimoire instruction                                        |
| `grimoire hook antigravity-prompt`    | Antigravity `PreInvocation`: suggest skills matching the prompt                                    |
| `grimoire hook skills-session`        | Skills-mode session hook: grimoire's display format                                                |
| `grimoire hook skills-prompt`         | Skills-mode prompt hook: routing reminder and status line                                          |
| `grimoire hook skill-used`            | Claude Code `PostToolUse`: record each skill loaded, per session, for the status badge             |

`grimoire mcp serve` exposes the CLI as MCP tools, so an AI assistant can call grimoire natively without slash commands. The skill tools are `grimoire_search_skills` (hybrid search — field-weighted BM25F fused with a full-text ranking; takes several `queries`, `domain`/`subdomain`/`tags` filters and `offset` paging; results carry rank, matched terms and `related` skills), `grimoire_get_skill` (fetch a skill's full SKILL.md by exact name, or up to 20 at once with `names`; unknown names return "did you mean" matches), and `grimoire_list_skills` (domain index). Every tool carries a title and read-only/destructive hints. Config, package, profile, install, and check commands are exposed too (`grimoire_config_add`, `grimoire_package_add`, `grimoire_check`, …).

Every skills-mode install also writes a `_GRIMOIRE_INDEX.md` alongside the skill symlinks, so an agent can discover what's available without scanning every SKILL.md.

See [MCP Mode](./mcp-mode.md) for which files each agent gets, how the hooks work, and the display levels.

## Editor Integration

| Command        | What it does                                                    |
| -------------- | --------------------------------------------------------------- |
| `grimoire lsp` | Start the grimoire Language Server (LSP) for editor integration |

Runs over stdio and pushes `grimoire check` diagnostics into your editor on save — supports Neovim, VS Code, and Helix.
