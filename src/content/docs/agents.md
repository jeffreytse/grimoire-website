# Agent Integration Guide

grimoire works with fourteen named AI agents, plus a generic `agent` fallback target for anything that reads `~/.agents/skills`. There are three ways to get skills into an agent:

1. **Native plugin** — the agent's own plugin/marketplace command.
2. **grimoire CLI (skills mode)** — `grimoire install --target <name>` links skills into the agent's skills folder. Works for every agent below.
3. **MCP mode** — `grimoire mcp install --target <name>` installs nothing into the agent; skills are served on demand over MCP. See [MCP Mode](./mcp-mode.md).

---

## Supported agents

| Agent              | Native plugin install                                                                                       | grimoire CLI                    | MCP mode |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------- | -------- |
| Claude Code        | `/plugin marketplace add jeffreytse/grimoire-core`<br>`/plugin install grimoire@grimoire`                   | `--target claude`               | ✓ (+ prompt hook) |
| GitHub Copilot CLI | `copilot plugin marketplace add jeffreytse/grimoire-core`<br>`copilot plugin install grimoire@grimoire`     | `--target copilot`              | ✓        |
| Codex              | `codex plugin marketplace add jeffreytse/grimoire-core`<br>`codex plugin add grimoire@grimoire`             | `--target codex`                | ✓ (+ prompt hook) |
| OpenCode           | `opencode plugin 'github:jeffreytse/grimoire-core#main'`                                                    | `--target opencode`             | ✓ (+ prompt hook) |
| Pi                 | `pi install git:github.com/jeffreytse/grimoire-core`                                                        | `--target pi`                   | ✓        |
| Kimi Code          | `/plugins install https://github.com/jeffreytse/grimoire-core`                                              | `--target kimi`                 | ✓        |
| OMP (oh-my-pi)     | `omp plugin marketplace add jeffreytse/grimoire-core`<br>`omp plugin install --scope user grimoire@grimoire` | `--target omp`                  | ✓        |
| Gemini CLI         | `gemini extensions install https://github.com/jeffreytse/grimoire-core` (context only)                      | `--target gemini`               | ✓ (+ prompt hook) |
| Antigravity (agy)  | not supported — use the CLI                                                                                 | `--target antigravity`          | ✓ (+ prompt hook) |
| OpenClaw           | see [`.openclaw/INSTALL.md`](https://github.com/jeffreytse/grimoire-core/blob/main/.openclaw/INSTALL.md)    | `--target openclaw`             | —        |
| DeepSeek Harness   | —                                                                                                           | `--target dsh`                  | —        |
| Grok Build         | —                                                                                                           | `--target grok --global`        | —        |
| Muse               | —                                                                                                           | `--target muse --global`        | —        |
| MiniMax Code       | —                                                                                                           | `--target minimax --global`     | —        |
| Cursor / Windsurf / Cline | —                                                                                                    | —                               | `grimoire mcp config` |
| Any other agent    | —                                                                                                           | `--target agent` (`~/.agents/skills`) | —  |

Every CLI cell is `grimoire install --target <name>`. Add `--global` for a user-wide install; without it, skills go into the current project. Grok, Muse, and MiniMax are global-only because they load skills from a plugin bundle, which grimoire builds and registers for you. `--target all` installs to every agent, detected or not; with no `--target`, grimoire auto-detects agents on your `PATH`.

**Domain plugins:** native marketplaces also offer one plugin per domain, e.g. `grimoire-engineering@grimoire`. Skills are namespaced (`/grimoire-engineering:propose-conventional-commit`). For subdomain-level installs, use the grimoire CLI.

**Verification status:** native installs for Claude Code, Copilot, Codex, and OpenCode are tested end to end. Pi, Kimi, and OMP native installs follow each agent's documented format but are untested. Gemini's extension loads `GEMINI.md` context only — use the CLI for its skills. Antigravity's plugin installer ignores declared skill paths, so it cannot find grimoire's nested skills.

---

## Claude Code

**Native plugin:**

```
/plugin marketplace add jeffreytse/grimoire-core
/plugin install grimoire@grimoire                  # all domains
/plugin install grimoire-engineering@grimoire      # one domain
```

**grimoire CLI:** `grimoire install --target claude` — skills go to `.claude/skills` (project) or `~/.claude/skills` (`--global`), and the `start-best-practice` trigger is written to `CLAUDE.md`.

**MCP mode:** `grimoire mcp install` — registers the server with `claude mcp add`, writes the instruction to `~/.claude/CLAUDE.md` (or `./CLAUDE.md` with `--scope project`), and adds the `UserPromptSubmit` [prompt hook](./mcp-mode.md#the-prompt-hook).

**Using skills:**

```
/suggest-best-practice
/write-best-practice-skill
/grimoire-engineering:propose-conventional-commit     # namespaced, native plugin
grimoire:propose-conventional-commit                  # MCP mode
/grimoire:skill propose-conventional-commit           # MCP mode slash command
```

For domain skills, describe your situation and `suggest-best-practice` routes automatically.

**Tool names:** native Claude Code tool names (Read, Write, Edit, Bash, Skill, TodoWrite).

---

## GitHub Copilot CLI

**Native plugin:**

```
copilot plugin marketplace add jeffreytse/grimoire-core
copilot plugin install grimoire@grimoire
```

Copilot CLI reads the shared `.claude-plugin/` manifests. Skills are namespaced by plugin name, e.g. `grimoire-engineering:propose-conventional-commit`.

**grimoire CLI:** `grimoire install --target copilot` — skills go to `.github/skills` (project) or `~/.copilot/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target copilot` — `copilot mcp add`, instruction in `~/.copilot/copilot-instructions.md` (user scope only).

**Using skills:** describe your task. Copilot activates the matching skill from its `description` triggering conditions.

---

## Codex

**Native plugin:**

```
codex plugin marketplace add jeffreytse/grimoire-core
codex plugin add grimoire@grimoire
```

Uses the generated `.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json`.

**grimoire CLI:** `grimoire install --target codex` — skills go to `.agents/skills` (project) or `~/.agents/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target codex` — `codex mcp add`, instruction in `~/.codex/AGENTS.md` (user scope only), and a `UserPromptSubmit` [prompt hook](./mcp-mode.md#the-prompt-hook) in `~/.codex/hooks.json`. Codex runs new hooks only after you trust them — open `/hooks` once after installing.

**Using skills:** describe your task and Codex routes to the matching skill, or run `/plugins` inside `codex` to browse the marketplace.

---

## OpenCode

**Native plugin:**

```bash
opencode plugin 'github:jeffreytse/grimoire-core#main'
```

See [`.opencode/INSTALL.md`](https://github.com/jeffreytse/grimoire-core/blob/main/.opencode/INSTALL.md) for pinning a release. The plugin (`.opencode/plugins/grimoire.js`, an ESM module):

1. Registers grimoire's nested skill folders with OpenCode
2. Injects `AGENTS.md` as bootstrap context
3. Maps Claude Code tool references to OpenCode native equivalents

**grimoire CLI:** `grimoire install --target opencode` — skills go to `.opencode/skills` (project) or `~/.config/opencode/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target opencode` — adds `mcp.grimoire` to `opencode.json`, instruction in `~/.config/opencode/AGENTS.md` / `./AGENTS.md`, and a [prompt hook](./mcp-mode.md#the-prompt-hook) as an OpenCode plugin (`plugins/grimoire.js`, using `chat.message` and a system transform).

**Using skills:**

```
use skill tool to load propose-conventional-commit
use skill tool to list skills
```

**Tool mapping:**

| Claude Code tool                | OpenCode equivalent |
| ------------------------------- | ------------------- |
| `Skill`                         | `skill` (native)    |
| `Read`, `Write`, `Edit`, `Bash` | native tools        |
| `TodoWrite`                     | `todowrite`         |

**Troubleshooting — skills not found:**

```bash
opencode run --print-logs "hello" 2>&1 | grep -i grimoire
```

---

## Pi

**Native plugin:** grimoire-core is a [Pi package](https://pi.dev/packages) — its `package.json` lists every skill folder under `pi.skills`.

```bash
pi install git:github.com/jeffreytse/grimoire-core
pi install git:github.com/jeffreytse/grimoire-core@v0.1.0    # pin a release
```

**grimoire CLI:** `grimoire install --target pi` — skills go to `.pi/skills` (project) or `~/.pi/agent/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target pi` — `~/.pi/agent/mcp.json` / `.pi/mcp.json`, instruction in `~/.pi/agent/AGENTS.md` / `./AGENTS.md`.

**Using skills:** Pi lists each skill by name and description and loads it on demand. Invoke one explicitly with `/skill:<name>`, e.g. `/skill:propose-conventional-commit`. The package ships skills only — tools a skill names (`Skill`, `Agent`, `TodoWrite`) map to Pi's native equivalents or are skipped. See [`.pi/INSTALL.md`](https://github.com/jeffreytse/grimoire-core/blob/main/.pi/INSTALL.md).

---

## Kimi Code

**Native plugin:**

```
/plugins install https://github.com/jeffreytse/grimoire-core
```

Uses the generated `kimi.plugin.json`.

**grimoire CLI:** `grimoire install --target kimi` — skills go to `.kimi-code/skills` (project) or `~/.kimi-code/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target kimi` — `~/.kimi-code/mcp.json` / `.kimi-code/mcp.json`, instruction in `~/.kimi-code/AGENTS.md` / `./AGENTS.md`.

---

## OMP (oh-my-pi)

**Native plugin:**

```
omp plugin marketplace add jeffreytse/grimoire-core
omp plugin install --scope user grimoire@grimoire
```

**grimoire CLI:** `grimoire install --target omp` — skills go to `.omp/skills` (project) or `~/.omp/agent/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target omp` — `~/.omp/agent/mcp.json` / `.omp/mcp.json`, instruction in `~/.omp/agent/AGENTS.md` / `.omp/AGENTS.md`.

---

## Gemini CLI

> **Note:** As of June 18, 2026, free/individual Gemini CLI access (Google AI Pro/Ultra, free Gemini Code Assist for individuals) was retired in favor of [Antigravity CLI](http://antigravity.google/blog/introducing-google-antigravity-cli). Paid Gemini Code Assist Standard/Enterprise and Google Cloud users keep Gemini CLI access via paid API keys. See the [migration announcement](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli).

**Extension (context only):**

```
gemini extensions install https://github.com/jeffreytse/grimoire-core
```

`gemini-extension.json` points to `GEMINI.md` via `contextFileName`, so the extension loads grimoire's routing context — skill path convention and domain list — but **not the skills themselves**. For skills, use the CLI or MCP mode.

**grimoire CLI:** `grimoire install --target gemini` — skills go to `.gemini/skills` (project) or `~/.gemini/skills` (`--global`).

**MCP mode:** `grimoire mcp install --target gemini` — `gemini mcp add`, instruction in `~/.gemini/GEMINI.md` / `./GEMINI.md`, and a `BeforeAgent` [prompt hook](./mcp-mode.md#the-prompt-hook) in `.gemini/settings.json`. Gemini keeps MCP servers disabled in folders you haven't trusted.

**Using skills:** describe your task, or activate one explicitly:

```
activate skill: propose-conventional-commit
```

---

## Antigravity CLI (agy)

Google's successor to Gemini CLI — grimoire treats it as its own target, binary name `agy`.

**Native plugin: not supported.** `agy plugin install` ignores declared skill paths, so it cannot find grimoire's nested skills. Use the CLI:

```bash
grimoire install --target antigravity
```

Skills go to `.gemini/antigravity-cli/skills` (project) or `~/.gemini/antigravity-cli/skills` (`--global`); the trigger line is written to `~/.gemini/AGENTS.md`.

**MCP mode:** `grimoire mcp install --target antigravity` — registers the server in `~/.gemini/config/mcp_config.json` (user scope). agy has no user-level instruction file, so grimoire injects the instruction with a `SessionStart` hook and adds a `PreInvocation` [prompt hook](./mcp-mode.md#the-prompt-hook) in `~/.gemini/config/hooks.json` that runs once per new prompt.

---

## OpenClaw

```bash
grimoire install --target openclaw
```

Skills go to `~/.openclaw/skills`; the trigger is written to `~/.openclaw/workspace/AGENTS.md`. See [`.openclaw/INSTALL.md`](https://github.com/jeffreytse/grimoire-core/blob/main/.openclaw/INSTALL.md) for plugin configuration.

---

## DeepSeek Harness

```bash
grimoire install --target dsh
```

Uses the shared `~/.agents/skills` folder (project: `.agents/skills`) and `~/.agents/AGENTS.md`.

---

## Grok Build, Muse, MiniMax Code

```bash
grimoire install --target grok --global
grimoire install --target muse --global
grimoire install --target minimax --global
```

These agents load skills from a plugin bundle rather than a skills folder, so they are **global-only**: grimoire builds the bundle (e.g. under `~/.minimax/plugins/` for MiniMax) and registers it with the agent for you.

---

## Cursor, Windsurf, Cline — via MCP

grimoire does not install skills into these editors. Serve them over MCP instead — print a config snippet and paste it into the client's MCP settings:

```bash
grimoire mcp config --target cursor      # or windsurf, cline
```

Then use skills by name: `grimoire:<skill-name> [task]`. See [MCP Mode](./mcp-mode.md#other-mcp-clients).

---

## Generic Agent (anything else)

Any agent that reads `~/.agents/skills` or `AGENTS.md` gets grimoire through the `agent` target — a built-in fallback not tied to a vendor. `grimoire install` selects it automatically when no supported agent is detected on `PATH`.

```bash
grimoire install --target agent
```

Skills go to `.agents/skills` (project) or `~/.agents/skills` (`--global`); bootstrap context to `~/.agents/AGENTS.md`. The `wizard` always offers "Generic Agent" alongside whatever agents it auto-detects.

Install to every agent at once:

```bash
grimoire install --target all
grimoire mcp install --target all     # or MCP mode for every supported agent
```

---

## Adding grimoire to a new agent

If you're integrating grimoire with an agent not listed here:

1. **Try MCP first.** If the agent speaks MCP, `grimoire mcp serve` plus a one-line instruction is all it needs — no skill files to manage.

2. **Check for a plugin format.** Most agents use either a JSON manifest (`plugin.json`) or a context file (markdown loaded at startup).

3. **Point to `./skills/`** — all SKILL.md files live under this path in a consistent structure (`<domain>/<subdomain>/skills/<name>/SKILL.md`). Manifests must list the nested skill folders explicitly.

4. **Inject bootstrap context** — copy `AGENTS.md` or `GEMINI.md` content into whatever context mechanism your agent supports.

5. **Map tool names** — SKILL.md files reference Claude Code tool names (Read, Write, Edit, Bash, Skill, TodoWrite). Document the equivalents for your agent.

6. **Open a PR** — add the manifest to `scripts/gen-manifests.py` so `make update-plugin-manifest` generates it, and update the supported agents table in this document.

---

## Keeping plugins in sync

Every agent manifest is generated from `skills/` and `VERSION` by one script. After adding, moving, or renaming a skill or domain:

```bash
make update-plugin-manifest   # .claude-plugin, .codex-plugin, .grok-plugin, .muse-plugin,
                              #   kimi.plugin.json, package.json (pi.skills)
make check-manifest           # CI gate: fails if any manifest is stale or a skill name is invalid
```

When a new domain is added (via `design-best-practice-domain`), also add its row to the domains table in `GEMINI.md` and `AGENTS.md`. `.opencode/plugins/grimoire.js` needs no update.
