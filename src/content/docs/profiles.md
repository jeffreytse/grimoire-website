# Practice Profiles

Grimoire maintains skills and standards. Profiles are yours to own and share.

A profile is a named, curated set of skills. Set `profiles = ["oop"]` under `[standards]` in `grimoire.toml` and grimoire resolves it — no list to maintain unless you want one.

---

## How It Works

```toml
# grimoire.toml
[standards]
profiles = ["oop"]
```

Each profile name resolves using **depth-anywhere glob matching**, not a fixed path:

1. **Project first** — checked against `.grimoire/` in your project root. A name like `"engineering"` matches `.grimoire/engineering.toml` _or_ any `.toml` file nested under a `.grimoire/**/engineering/` directory, at any depth.
2. **Then every installed package**, in priority order (highest first — see [Config](./config.md#package-user-level-table-array)), same depth-anywhere matching against each package's tree.
3. **Qualified refs** — `<package>/<name>` (e.g. `acmecorp/engineering`) or a full package URL (`owner/repo@version:path`) scope the search to that one package instead of walking all of them.
4. **No file match anywhere** — grimoire falls back to matching skills by tag (`tags` in a skill's frontmatter containing `<name>`), then by domain path (`<name>` matching a domain/subdomain directory), when the caller has package context to search.

A bare name with no file anywhere still works via the tag/domain fallback — `profiles = ["oop"]` is usable immediately without creating any file, as long as skills are tagged `oop`.

---

## Multiple Profiles

Combine paradigms by listing multiple profiles:

```toml
[standards]
profiles = ["clean-architecture", "tdd"]  # clean-architecture wins conflicts
```

**Array order = conflict priority.** When two profiles include skills with conflicting guidance, the first profile in the array wins.

**Duplicate skills** (same skill name resolved by two profiles) are deduplicated — activated once, keeping the first-listed profile's priority.

---

## Profile File Schema

Create a file to curate exactly which skills activate — useful when the tag set is too broad, or you want a team-specific subset. Subdirectories are supported; nest profile files however you like under `.grimoire/`.

```toml
# .grimoire/my-team.toml
name = "my-team"
description = "Our backend team's default practices"
tags = ["backend"]                # optional: also bulk-activate anything tagged "backend"
extends = ["clean-architecture"]  # optional: inherit another profile's resolved skills first

[[skills]]
name = "apply-solid-principles"
priority = 10                     # optional, default 50 — lower runs/ranks first

[[skills]]
name = "apply-domain-driven-design"

exclude = ["apply-kiss-principle"]  # optional: remove a skill even if extends/tags included it

compliance-threshold = 80           # optional: BPDD threshold this profile recommends
compliance-threshold-error = 0
```

### Fields

| Field                                                 | Type     | Required        | Description                                                                                                                               |
| ----------------------------------------------------- | -------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                                | string   | no              | Profile identifier — defaults to the filename if omitted                                                                                  |
| `description`                                         | string   | no              | One sentence, when to use this profile                                                                                                    |
| `extends`                                             | string[] | no              | Other profile names to inherit skills from first (recursive, cycle-safe)                                                                  |
| `tags`                                                | string[] | no              | Bulk-activate every skill whose frontmatter `tags` includes any of these, falling back to a domain-path match if no tagged skill is found |
| `skills[].name`                                       | string   | yes (per entry) | Skill name (matches frontmatter `name:`)                                                                                                  |
| `skills[].priority`                                   | number   | no              | Lower number = higher priority; unset defaults to 50                                                                                      |
| `exclude`                                             | string[] | no              | Skill names removed from the final resolved list, even if `extends`/`tags`/`skills` included them                                         |
| `compliance-threshold` / `compliance-threshold-error` | number   | no              | BPDD thresholds this profile recommends                                                                                                   |

**Resolution order inside one profile**: `extends` (inherited skills first) → `tags` (bulk additions) → explicit `[[skills]]` (can override priority of an already-included skill) → `exclude` (final removal pass). After all listed profiles resolve this way, `[standards.<domain>].practices` and `.disabled` from your settings are applied on top — `practices` re-prioritizes or adds matching skills, `disabled` removes them unconditionally.

---

## Inline Profiles

A profile can also be embedded directly in `grimoire.toml` instead of its own file — same fields as above:

```toml
# grimoire.toml
[profiles.my-team]
description = "Our backend team's default practices"

[[profiles.my-team.skills]]
name = "apply-solid-principles"

[[profiles.my-team.skills]]
name = "apply-domain-driven-design"
```

Grimoire checks for a file-based profile first; if none exists, it falls back to a matching `[profiles.<name>]` block.

---

## The Ecosystem

Grimoire ships no built-in profiles — the tag system covers the common cases. But you can:

- **Share your team profile** — commit `.grimoire/` to your repo
- **Publish a community profile** — ship it as an installable package (see [Config](./config.md#package-user-level-table-array)) so others can `extends` or reference it with a qualified `<package>/<name>` ref

This mirrors how `eslint-config-airbnb` or VS Code profiles work: the tool ships primitives, the community ships bundles.

---

## Profiles vs Practices

Two complementary keys, both under `[standards]` in `grimoire.toml`:

|             | `profiles`                                       | `practices`                                      |
| ----------- | ------------------------------------------------ | ------------------------------------------------ |
| Where       | `[standards]` top-level                          | Inside a `[standards.<domain>]` section          |
| Scope       | Global — activates skills across all domains     | Scoped — applies to one domain only              |
| Granularity | Bulk — a full resolved profile's worth of skills | Explicit ordered list of specific skills         |
| Use when    | Declaring paradigm intent for the project        | Fine-tuning skill priority for a specific domain |

```toml
# grimoire.toml
[standards]
profiles = ["oop"]              # load all oop-tagged skills globally

[standards.engineering.architecture]
practices = [                   # override: in architecture, prefer these specific skills in this order
  "apply-solid-principles",
  "apply-law-of-demeter"
]
```

`profiles` sets the baseline. `practices` overrides per domain.

**Can I use `practices = ["OOP"]` instead of `profiles`?**

Yes — it works as a loose hint. The AI will lean toward OOP conventions based on its training. But it's less precise than `profiles = ["oop"]`:

- No guaranteed skill steps — depends on the AI's interpretation of "OOP"
- No dedup or conflict logic between skills
- Not scoped to specific installed SKILL.md files

For best results, use both:

```toml
[standards]
profiles = ["oop"]                          # activate oop skill bundle (specific skills)

[standards.engineering.architecture]
practices = ["OOP"]                         # also pin as explicit preference for this domain
```

---

## Examples

| What you write                             | What happens                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `profiles = ["oop"]`                       | Checked as a file first (project, then packages); falls back to a tag query for `oop`                         |
| `profiles = ["functional"]`                | Same — file lookup first, then tag query                                                                      |
| `profiles = ["clean-architecture", "tdd"]` | Both resolved and merged; `clean-architecture` wins conflicts                                                 |
| `profiles = ["my-team"]`                   | Matches `.grimoire/my-team.toml` (or nested under a `my-team/` dir) — activates its fully resolved skill list |
| `profiles = ["acmecorp/engineering"]`      | Qualified ref — resolves only within the `acmecorp` package                                                   |
