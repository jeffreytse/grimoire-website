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

**`[core]` and `[[package]]` are user-level only.** If a project `grimoire.toml` sets either, they're silently stripped and ignored — set them in the global file instead. Everything else (`[standards]`, `[dependencies]`, `[profiles.*]`) is read normally from the project file.

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

### `[standards.<domain>]` / `[standards.<domain>.<subdomain>]`

| Key                          | Type                | Description                                                                                             |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `practices`                  | `string[]`          | Ordered skill/practice hints for this domain — first entry wins conflicts                               |
| `disabled`                   | `string[]`          | Skill names to suppress unconditionally, even if a profile would include them                           |
| `fallback`                   | `"ask"` \| `"skip"` | Behavior when no matching skill is found: `"ask"` prompts for clarification, `"skip"` silently moves on |
| `compliance-threshold`       | `number`            | Minimum overall criteria coverage % to pass `grimoire check`                                            |
| `compliance-threshold-error` | `number`            | Maximum allowed error-severity violations — `0` means none allowed                                      |

Only one level of subdomain nesting is supported. A subdomain overlays its parent domain **per key** — `[standards.engineering.architecture]` replaces `practices` for architecture work specifically, while any key it doesn't set (e.g. `fallback`) still inherits from `[standards.engineering]`.

### `[core]` (user-level — set in your global file, not the project file)

| Key                  | Type                    | Description                                                     |
| -------------------- | ----------------------- | --------------------------------------------------------------- |
| `home`               | `string`                | Override where grimoire stores its data (default `~/.grimoire`) |
| `agents`             | `string[]`              | Pin specific agent targets instead of auto-detecting            |
| `install-mode`       | `"symlink"` \| `"copy"` | How skill files are placed into agent directories               |
| `update-concurrency` | `number`                | Max concurrent package updates (default 8; `0` = unlimited)     |

### `[[package]]` (user-level, table array)

| Key        | Type      | Description                                                                             |
| ---------- | --------- | --------------------------------------------------------------------------------------- |
| `name`     | `string`  | Your identifier for this package, e.g. `"official"`, `"my-team"`                        |
| `url`      | `string`  | Git URL, `owner/repo[@version]` shorthand, or a local path                              |
| `official` | `boolean` | Marks the STANDARD.md-compliant official package — exactly one entry should set this    |
| `priority` | `number`  | Higher resolves first; unset defaults to `100` for the official package, `50` otherwise |
| `enabled`  | `boolean` | `false` skips this package in resolution without removing the entry                     |

`registry` is accepted as a legacy alias for the same table — if you have an older `[[registry]]` block it still works, but `[[package]]` is the current name. Each enabled package can ship its own `grimoire.toml` with its own `[standards]` — those are loaded as a base layer beneath yours, which is how `standards.extends` reaches into an installed package's defaults.

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

## Guided Management

Use skills instead of editing TOML directly:

- `/configure-grimoire` — view, edit, and validate your `grimoire.toml` settings
- `/pin-best-practice-preference` — pin a preference when two practices conflict; choose session, project, or global scope
- `/resolve-best-practice-conflict` — resolve contradictions between two installed skills and record the priority automatically

---

## Related

- [profiles.md](./profiles.md) — how `profiles` resolves via depth-anywhere glob matching, the profile file schema, inline `[profiles.*]` definitions
- [bpdd.md](./bpdd.md) — compliance thresholds in the BPDD cycle, CI gating, incremental mode
