# Config

There is one config file: `grimoire.toml`. The same filename is used at every level — project, global, and system — and it holds everything: which packages/skills to install, and how you want them applied. Sections inside the file separate the concerns: `[[package]]` and `[dependencies]` declare what's installed, `[standards]` holds your preferences and compliance thresholds, `[core]` holds machine-level settings, and `[profiles.*]` can embed named skill bundles directly in the file.

---

## Override Hierarchy

Grimoire reads three files, in this order. First value found per key wins.

| Priority | Level   | File                                                                              | Scope                        |
| -------- | ------- | --------------------------------------------------------------------------------- | ---------------------------- |
| 1st      | Project | `<project-root>/grimoire.toml`                                                    | this project                 |
| 2nd      | Global  | `~/.config/grimoire/grimoire.toml` (respects `$XDG_CONFIG_HOME`)                  | all projects on this machine |
| 3rd      | System  | `/etc/grimoire/grimoire.toml` (`%PROGRAMDATA%\grimoire\grimoire.toml` on Windows) | all users on this machine    |

Each key resolves independently — a project file can set `standards.engineering.practices` while the global file supplies `standards.profiles`, and both apply without conflict.

**A project can't add a skill source.** If a project `grimoire.toml` sets `[[package]]` or `core.home`, they're silently stripped and ignored: a cloned repository must not decide what your agent loads. It names the libraries it needs in `[dependencies]` instead, which `grimoire update`, `grimoire install` or `grimoire mcp install` fetch when you run them. Everything else (`[standards]`, `[dependencies]`, `[profiles.*]`, other `[core]` keys) is read normally from the project file.

`GRIMOIRE_SYSTEM_CONFIG` moves the system file — for containers, managed machines and tests.

### What each layer can declare

Libraries first, then the people and teams that use them: an organization lists its libraries and standards in the system file, each user adds their own, and each project adds its standards on top.

|                                                   | System (org) | Global (user)                                       | Project                     |
| ------------------------------------------------- | ------------ | --------------------------------------------------- | --------------------------- |
| Libraries (`[[package]]`)                         | ✓            | ✓ (wins per name — e.g. to disable an org library)  | — via `[dependencies]` only |
| `[dependencies]`                                  | ✓            | ✓                                                   | ✓                           |
| Pinned practices `[standards.<domain>] practices` | ✓            | ✓                                                   | ✓ (nearest wins per domain) |
| `[standards] profiles`, `extends`                 | ✓            | ✓                                                   | ✓                           |
| `[standards] scope = "strict"`                    | —            | —                                                   | ✓                           |
| `[core]` settings                                 | ✓            | ✓                                                   | ✓ except `home`             |

Libraries from all three layers are unioned by name, user over system. Declared practices are labeled with the layer they came from — `standard: "project"`, `"user"` or `"org"`, nearest wins — so a user's own preference never shows as a project standard. See [Project standards in MCP mode](./mcp-mode.md#project-standards-in-mcp-mode).

There's no separate "personal, gitignored" file — one project file, committed. If you want a preference that only applies to you, set it in your own global `grimoire.toml` (`~/.config/grimoire/grimoire.toml`), or ask your AI assistant to pin it for the current conversation only (see [Session Pin](#session-pin-conversational-only) below — this is a convention some skills follow, not something the `grimoire` binary itself reads).

---

## Key Reference

### `[standards]` — top-level

| Key              | Type       | Description                                                                                                                  |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `profiles`       | `string[]` | Activate skill bundles by name — resolved via [profile lookup](./profiles.md#how-it-works)                                   |
| `extends`        | `string[]` | Inherit `[standards]` config from an installed package or one of its presets (`<package-name>` or `<package-name>/<preset>`) |
| `report-path`    | `string`   | Where `grimoire check` writes its report                                                                                     |
| `staleness-days` | `number`   | How many days before a compliance report is considered stale                                                                 |
| `exclude`        | `string[]` | Glob patterns for files `grimoire check` should skip                                                                         |
| `scope`          | `"strict"` | Project file only. In MCP mode, serve **only** the declared practices (dependencies, profiles, pins). Unset, declared practices are preferred but the whole library stays available |

`profiles` must sit under `[standards]` — a top-level `profiles = [...]` is not read.

### `[standards.<domain>]` / `[standards.<domain>.<subdomain>]`

| Key                          | Type                | Description                                                                                             |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `practices`                  | `string[]`          | Ordered skill/practice hints for this domain — first entry wins conflicts                               |
| `disabled`                   | `string[]`          | Skill names to suppress unconditionally, even if a profile would include them                           |
| `fallback`                   | `"ask"` \| `"skip"` | Behavior when no matching skill is found: `"ask"` prompts for clarification, `"skip"` silently moves on |
| `compliance-threshold`       | `number`            | Minimum overall criteria coverage % to pass `grimoire check`                                            |
| `compliance-threshold-error` | `number`            | Maximum allowed error-severity violations — `0` means none allowed                                      |
| `note`                       | `string`            | Optional reason for the pin (e.g. `"agreed in ADR-014"`), shown when the pin is applied                 |

Only one level of subdomain nesting is supported. A subdomain overlays its parent domain **per key** — `[standards.engineering.architecture]` replaces `practices` for architecture work specifically, while any key it doesn't set (e.g. `fallback`) still inherits from `[standards.engineering]`.

### `[core]`

| Key                  | Type                    | Description                                                     |
| -------------------- | ----------------------- | --------------------------------------------------------------- |
| `home`               | `string`                | Override where grimoire stores its data (default `~/.grimoire`) — not read from a project file |
| `active`             | `boolean`               | `true` (default): route every request through grimoire's workflows. `false`: stay out of the way (named skills still load). Written by `grimoire enable` / `disable` |
| `trace`              | `"brief"` \| `"full"` \| `"hidden"` | How much grimoire shows (default `brief`; `off` = `hidden`, `on` = `brief`) |
| `display-style`      | `"rich"` \| `"plain"`   | `plain`: words instead of glyphs, for screen readers (implied by `NO_COLOR`) |
| `agents`             | `string[]`              | Pin specific agent targets instead of auto-detecting            |
| `install-mode`       | `"symlink"` \| `"copy"` | How skill files are placed into agent directories               |
| `update-concurrency` | `number`                | Max concurrent package updates (default 8; `0` = unlimited)     |

### `[[package]]` (system or user file, table array)

| Key        | Type      | Description                                                                             |
| ---------- | --------- | --------------------------------------------------------------------------------------- |
| `name`     | `string`  | Your identifier for this package, e.g. `"official"`, `"my-team"`                        |
| `url`      | `string`  | Git URL, `owner/repo[@version]` shorthand, or a local path                              |
| `official` | `boolean` | Marks the STANDARD.md-compliant official package — exactly one entry should set this    |
| `priority` | `number`  | Higher resolves first; unset defaults to `100` for the official package, `50` otherwise |
| `enabled`  | `boolean` | `false` skips this package in resolution without removing the entry                     |

`registry` is accepted as a legacy alias for the same table — if you have an older `[[registry]]` block it still works, but `[[package]]` is the current name. Each enabled package can ship its own `grimoire.toml` with its own `[standards]` — those are loaded as a base layer beneath yours, which is how `standards.extends` reaches into an installed package's defaults.

### `[dependencies]`

The packages (or single skills) this file needs, as `"<grimoire-ref>" = "<version>"` keys. The older `skills = ["<ref>", …]` list is still read.

```toml
[dependencies]
"jeffreytse/grimoire-core"             = "*"   # official package
"jeffreytse/grimoire-core:engineering" = "*"   # one domain only
"jeffreytse/grimoire-core@0.1.0"       = "*"   # pinned to a release
"mycompany/internal-skills"            = "*"   # private company package
```

This is the only way a project names a library. Each dependency becomes a low-priority package; its skills count as declared practices in MCP mode.

### `[profiles.<name>]` (inline profiles)

A profile can be embedded directly in `grimoire.toml` instead of living in its own file — same fields as a standalone profile (`description`, `tags`, `extends`, `skills`, `exclude`, `compliance-threshold`, `compliance-threshold-error`; see [Practice Profiles](./profiles.md#profile-file-schema) for the full field reference). Grimoire checks for a file-based profile first and falls back to an inline `[profiles.<name>]` definition if none exists.

---

## Examples

### Global defaults

Applies to every project on this machine.

```toml
# ~/.config/grimoire/grimoire.toml
[standards]
profiles = ["oop"]

[standards.engineering]
practices = ["Google Engineering Practices"]

[standards.engineering.testing]
practices = ["apply-tdd"]

[standards.law]
practices = ["ABA Model Rules"]
fallback = "ask"            # always ask before applying a law skill — don't guess jurisdiction
```

### Project config

Committed to the repo. Every team member gets the same baseline.

```toml
# grimoire.toml (project root)
[standards]
profiles = ["clean-architecture", "tdd"]   # two profiles — clean-architecture wins conflicts

[standards.engineering]
practices = ["Google Engineering Practices"]
compliance-threshold = 75           # 75% overall coverage to pass CI

[standards.engineering.architecture]
practices = [
  "apply-solid-principles",
  "apply-law-of-demeter",
  "apply-domain-driven-design"
]
note = "agreed in ADR-014"          # optional — shown when the pin is applied
compliance-threshold = 80           # architecture held to a higher bar
compliance-threshold-error = 0      # zero tolerance for error-severity findings

[standards.engineering.testing]
practices = ["apply-tdd"]
fallback = "skip"                   # if no exact test skill matches, skip silently
```

### Multi-domain project (startup)

A project spanning engineering, legal, and finance — each domain has its own standard:

```toml
# grimoire.toml (project root)
[standards]
profiles = ["lean-startup"]

[standards.engineering]
practices = ["Google Engineering Practices"]
compliance-threshold = 70           # early-stage: 70% is the bar

[standards.law.contracts]
practices = ["review-saas-contract", "audit-gdpr-compliance"]
compliance-threshold-error = 0      # legal errors are always blocking

[standards.finance.personal-finance]
practices = ["CFA Institute standards"]

[standards.writing.copywriting]
practices = ["apply-aida-framework", "write-value-proposition"]
```

---

## Display and Activation

```bash
grimoire config set core.trace full            # brief (default) · full · hidden
grimoire config set core.display-style plain   # words instead of glyphs
grimoire disable                               # core.active = false, all sessions
grimoire enable                                # core.active = true
```

Environment variables override the files for one run: `GRIMOIRE_TRACE`, `GRIMOIRE_DISPLAY_STYLE`, `GRIMOIRE_ACTIVE=0|1`. In a session you can also say "show grimoire details", "quiet grimoire", "plain grimoire" or "grimoire off" — see [What You See](./mcp-mode.md#what-you-see). For activation the order is `GRIMOIRE_ACTIVE`, then the session toggle, then `core.active`.

---

## Session Pin (conversational-only)

Some meta skills (like `pin-best-practice-preference`) can agree to prefer a practice for the rest of the current conversation without writing to any file — a purely conversational convention, not a mechanism `grimoire.toml`'s loader participates in:

```
User: For this session, use Facebook's engineering practices instead of Google's.

Claude: Using Facebook Engineering Standards for this conversation.
        Want this saved permanently? [y] global  [p] project
```

If you confirm, the AI assistant writes it to your global or project `grimoire.toml` — nothing is persisted until then.

---

## How Layers Compose

Given this setup:

```
~/.config/grimoire/grimoire.toml          [standards] profiles = ["oop"]
                                          [standards.engineering] practices = ["Google"]

grimoire.toml (project root)              [standards.engineering.architecture] practices = ["SOLID", "LoD"]
                                          [standards.engineering.architecture] compliance-threshold = 80
                                          [standards.engineering] fallback = "ask"
```

The resolved spec for `engineering.architecture` work:

| Key                                                       | Value              | Source                                    |
| --------------------------------------------------------- | ------------------ | ----------------------------------------- |
| `standards.profiles`                                      | `["oop"]`          | global                                    |
| `standards.engineering.practices`                         | `["Google"]`       | global (no project override for this key) |
| `standards.engineering.architecture.practices`            | `["SOLID", "LoD"]` | project                                   |
| `standards.engineering.architecture.compliance-threshold` | `80`               | project                                   |
| `standards.engineering.fallback`                          | `"ask"`            | project                                   |

`standards.engineering.architecture` practices do not fall back to `standards.engineering` practices — they replace them for architecture-scoped work. Other keys not set at the subdomain level do inherit from the domain level.

---

## From the Shell

Edit pins without opening the TOML file:

```bash
grimoire config add standards.engineering.practices "Google Engineering Practices" -g   # global file
grimoire config add standards.engineering.practices "Google Engineering Practices"      # project file
grimoire config get standards.engineering.practices   # resolved value + which file it came from
```

`set`, `unset`, and `remove` work the same way — see [CLI Reference](./cli-reference.md#configuration).

---

## Skills Mode and MCP Mode

Every skill that reads or saves a preference — `pin-best-practice-preference`, `suggest-best-practice`, `audit-applied-best-practices`, … — reads and writes these same `grimoire.toml` files and `[standards.<domain>.<subdomain>]` keys, whether skills are installed into your agent or served over [MCP](./mcp-mode.md). In MCP mode the agent writes them through the `grimoire_config_*` tools. There is never a separate preferences file. grimoire's session hook passes your resolved preferences into the session, so workflows read them without a shell command or tool call.

In MCP mode a project's declared practices rank first in skill search and are labeled with their layer; `suggest-best-practice` gives a matching declared standard the ★ ahead of higher-scoring matches.

---

## Guided Management

Use skills instead of editing TOML directly:

- `/configure-grimoire` — view, edit, and validate your `grimoire.toml` settings
- `/pin-best-practice-preference` — pin a preference when two practices conflict; choose session, project, or global scope
- `/resolve-best-practice-conflict` — resolve contradictions between two installed skills and record the priority automatically

---

## Related

- [profiles.md](./profiles.md) — how `profiles` resolves via depth-anywhere glob matching, the profile file schema, inline `[profiles.*]` definitions
- [bpdd.md](./bpdd.md) — compliance thresholds in the BPDD cycle, CI gating, incremental mode
