---
title: 'CLI Reference'
description: 'Every grimoire CLI command — install, check, profiles, packages, settings, and MCP server integration.'
---

# CLI Reference

`grimoire` — best practice enforcement for AI assistants. Every top-level command, one line each.

---

## Setup

| Command                               | What it does                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `grimoire init`                       | Initialize `.grimoire/` in the current project                                 |
| `grimoire install [<grimoire-ref>]`   | Install skills from `grimoire.toml` or a grimoire-ref                          |
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

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `grimoire mcp`        | MCP server integration                              |
| `grimoire mcp serve`  | Start the grimoire MCP server (stdio transport)     |
| `grimoire mcp config` | Print MCP configuration snippet for an AI assistant |

`grimoire mcp serve` exposes the CLI as MCP tools, so an AI assistant can call grimoire natively without slash commands.

## Editor Integration

| Command        | What it does                                                    |
| -------------- | --------------------------------------------------------------- |
| `grimoire lsp` | Start the grimoire Language Server (LSP) for editor integration |

Runs over stdio and pushes `grimoire check` diagnostics into your editor on save — supports Neovim, VS Code, and Helix.
