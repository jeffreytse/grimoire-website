---
title: 'CLI Reference'
description: 'Every grimoire CLI command — install, check, profiles, packages, settings, MCP mode, and the prompt hook.'
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
| `grimoire install --no-load-optimize` | Skip the per-agent load-performance cap (some agents truncate to top-N skills by default; this installs all of them anyway) |
| `grimoire uninstall [<grimoire-ref>]` | Remove grimoire skills from agent directories                                  |
| `grimoire update`                     | Update all packages to latest                                                  |
| `grimoire clean`                      | Remove stale grimoire-managed skills from agent directories                    |
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
| `grimoire doctor`      | Run a health check on the grimoire installation      |
| `grimoire wizard`      | Open the interactive TUI wizard                      |
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
| `grimoire mcp install`                    | Set up MCP mode: register the server, write the agent instruction, add the Claude Code prompt hook |
| `grimoire mcp install --target <list>`    | Agents to configure — `claude` (default), a comma list (`codex,gemini`), or `all`              |
| `grimoire mcp install --scope project`    | Configure the current project instead of the user (`user` is the default)                       |
| `grimoire mcp install --no-hook`          | Skip the Claude Code `UserPromptSubmit` prompt hook                                            |
| `grimoire mcp install --no-configure`     | Register the server only — write no instruction and no hook                                    |
| `grimoire mcp uninstall [--target <list>]` | Unregister the server and remove the grimoire instruction and hook                           |
| `grimoire mcp serve`                      | Start the grimoire MCP server (stdio transport)                                                |
| `grimoire mcp config --target <client>`   | Print an MCP config snippet for other clients (`cursor`, `windsurf`, `cline`)                  |
| `grimoire hook prompt`                    | Claude Code `UserPromptSubmit` hook: suggest skills matching the prompt (installed by `mcp install`) |

`grimoire mcp serve` exposes the CLI as MCP tools, so an AI assistant can call grimoire natively without slash commands. The skill tools are `grimoire_search_skills` (BM25-ranked search with stopword removal, stemming, and hyphen/underscore token expansion; reports the terms that matched), `grimoire_get_skill` (fetch one skill's full SKILL.md by exact name; unknown names return "did you mean" matches), and `grimoire_list_skills` (domain index). Config, package, profile, install, and check commands are exposed too (`grimoire_config_add`, `grimoire_package_add`, `grimoire_check`, …).

Every skills-mode install also writes a `_GRIMOIRE_INDEX.md` alongside the skill symlinks, so an agent can discover what's available without scanning every SKILL.md.

See [MCP Mode](./mcp-mode.md) for which files each agent gets and how the prompt hook works.

## Editor Integration

| Command        | What it does                                                    |
| -------------- | --------------------------------------------------------------- |
| `grimoire lsp` | Start the grimoire Language Server (LSP) for editor integration |

Runs over stdio and pushes `grimoire check` diagnostics into your editor on save — supports Neovim, VS Code, and Helix.
