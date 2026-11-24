# Frequently Asked Questions

---

## Using grimoire

### How is grimoire different from a prompt library or AwesomePrompts?

Prompt libraries collect ad-hoc instructions — they tell an AI what to do, but don't verify that the instruction reflects what experts actually do. grimoire encodes practices adopted by top-tier organizations with cited evidence. Every skill must name specific adopters, cite measurable impact, and pass `review-best-practice-skill` before it enters the library.

The test: "Would this skill make an AI agent perform like a domain expert?" If not, it doesn't belong.

### How is grimoire different from other skill package managers or agents' plugin marketplaces?

They distribute skills: find, install, version and share them, and some evaluate them. That's a useful, solved layer, and grimoire does it too. grimoire's focus is the next step — getting the agent to *apply* the right practice. It routes each request to the practices that fit, serves a 1,300+ skill library on demand without filling the agent's context, shows its decisions so you can redirect them, respects your project's declared standards, and checks compliance in CI. Its skills are also plain `SKILL.md` folders, so they install through agents' native plugin commands as well.

### Which AI agents does grimoire support?

| Agent                     | Native plugin                                                                                         | grimoire CLI / MCP                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Claude Code               | `/plugin marketplace add jeffreytse/grimoire-core` then `/plugin install grimoire@grimoire`           | `--target claude` · MCP + hooks                     |
| GitHub Copilot CLI        | `copilot plugin marketplace add jeffreytse/grimoire-core` then `copilot plugin install grimoire@grimoire` | `--target copilot` · MCP                        |
| Codex                     | `codex plugin marketplace add jeffreytse/grimoire-core` then `codex plugin add grimoire@grimoire`     | `--target codex` · MCP + hooks                      |
| OpenCode                  | `opencode plugin 'github:jeffreytse/grimoire-core#main'`                                              | `--target opencode` · MCP + hooks                   |
| Pi                        | `pi install git:github.com/jeffreytse/grimoire-core`                                                  | `--target pi` · MCP                                 |
| Kimi Code                 | `/plugins install https://github.com/jeffreytse/grimoire-core`                                        | `--target kimi` · MCP                               |
| OMP (oh-my-pi)            | `omp plugin install --scope user grimoire@grimoire`                                                   | `--target omp` · MCP                                |
| Gemini CLI                | extension loads context only                                                                          | `--target gemini` · MCP + hooks                     |
| Antigravity (agy)         | not supported                                                                                         | `--target antigravity` · MCP + hooks                |
| OpenClaw                  | see `.openclaw/INSTALL.md`                                                                            | `--target openclaw`                                 |
| DeepSeek Harness          | —                                                                                                     | `--target dsh`                                      |
| Grok Build / Muse / MiniMax Code | —                                                                                              | `--target grok\|muse\|minimax --global`            |
| Claude Desktop            | —                                                                                                     | MCP: `grimoire mcp install --target claude-desktop` |
| Cursor / Windsurf / Cline | —                                                                                                     | MCP: `grimoire mcp config --target cursor`          |
| Any other agent           | —                                                                                                     | `--target agent` (`~/.agents/skills`)               |

CLI cells are `grimoire install --target <name>`; "MCP" means `grimoire mcp install --target <name>` works. Full details: [Agent Integration Guide](./agents.md).

### Skills mode or MCP mode — which should I use?

**MCP mode, wherever the agent supports it** (Claude Code, Codex, Gemini CLI, Copilot CLI, OpenCode, Pi, Kimi Code, OMP, Antigravity, Claude Desktop).

Agents put every installed skill's name and description into a fixed listing — about 8,000–16,000 characters in Claude Code and Codex — and silently truncate or drop what doesn't fit. grimoire-core's descriptions total ~320,000 characters, so a full skills-mode install leaves the agent able to discover only a few percent of it. MCP mode keeps the listing empty, finds skills by search when a task needs them, and adds grimoire's hooks and display. Every request is routed through `start-best-practice`.

**Skills mode** (`grimoire install` or a native plugin) is for agents without MCP support (OpenClaw, DeepSeek Harness, Grok, Muse, MiniMax), or a deliberately small subset that fits the listing — about 30 skills — as slash commands. `grimoire install` warns when you link more than the agent will see. Switching is safe either way — see [MCP Mode](./mcp-mode.md#skills-mode-or-mcp-mode).

### How do I run a specific skill in MCP mode?

Skills aren't slash commands in MCP mode. Write `grimoire:<skill-name>` followed by your task in any agent — e.g. `grimoire:negotiate-salary I have an offer at $140k` — or type `/grimoire:skill <skill-name>` in Claude Code. A mistyped name returns "did you mean" suggestions. Meta workflows work the same way: `grimoire:suggest-best-practice my team is losing confidence`.

### How do I turn grimoire off, or make it quieter?

- **Quieter:** say "quiet grimoire" (notes hidden, routing continues) or set `grimoire config set core.trace hidden`. "show grimoire details" or `core.trace full` shows more.
- **Off for this session:** say "grimoire off"; "grimoire on" resumes.
- **Off everywhere:** `grimoire disable` (`grimoire enable` to undo). `GRIMOIRE_ACTIVE=0` for one run.

While off, a skill you name with `grimoire:<name>` still loads and nothing is uninstalled. Say "grimoire help" for every control. See [MCP Mode](./mcp-mode.md#turn-grimoire-on-or-off).

### Can my team require specific practices?

Yes. Declare them in the project's `grimoire.toml` — `[dependencies]`, `[standards] profiles`, or pinned `[standards.<domain>] practices`. In MCP mode the assistant then prefers them for everyone, labeled as project standards; `[standards] scope = "strict"` serves only those; and `grimoire check --ci` fails the build when they aren't followed. An organization can set libraries and standards for every user in the system file. See [Config](./config.md#what-each-layer-can-declare).

### Can grimoire be used offline?

Yes. In skills mode, skills are installed locally at install time — no network access is needed during use. In MCP mode, the grimoire server runs locally and serves skills from your local package clone; only `grimoire update` needs the network.

### What if no grimoire skill covers my situation?

`suggest-best-practice` will say "No installed skills closely match this situation." Three options:

1. Install a domain that likely covers it: `suggest-best-practice` tells you what to install
2. Open a [new skill request](https://github.com/jeffreytse/grimoire-core/blob/main/.github/ISSUE_TEMPLATE/new-skill.md) — describe the practice and its evidence
3. Write the skill yourself — see [Authoring Skills](./authoring-skills.md)

### How do I find the right skill without knowing its name?

Invoke `suggest-best-practice` (or just describe your problem). It auto-classifies any situation and routes to the best match. You never need to know skill names in advance.

---

## Contributing skills

### What if I can't find a study or number for the Impact section?

Keep the causal argument and remove the specific number. A well-reasoned causal argument passes; "significantly improves" without data fails. The rule:

```
❌ "Significantly improves code quality"
❌ "Studies show 60% improvement"    ← which studies? this fails
✅ "Teams that skip problem definition produce solutions targeting the wrong problem,
    requiring full redesign (IDEO Human-Centered Design Field Guide, 2015)"
✅ "Reduces post-ship defects by ~50% (Google Engineering Practices documentation)"
```

If you're not certain a specific number is in a specific document, remove the number and keep the argument.

### Can I contribute practices from my company that aren't publicly documented?

If the practice is majority-adopted across top-tier organizations and you can name them, yes — cite the organizations. The standard is majority adoption at the top tier, not public documentation.

If it's your company's proprietary approach not adopted elsewhere, no. One organization's internal convention is not a best practice.

### What if a practice is contested among experts?

Two cases:

**Clear majority position**: encode it, acknowledge the minority argument. State which top-tier professionals hold each position and what evidence underlies the majority view.

**Genuine 50/50 split**: no consensus = no best practice. Skip it. If the split resolves over time (one side accumulates significantly more evidence), use `revise-best-practice-skill` to update.

### What happens if my PR doesn't pass review-best-practice-skill?

Maintainers apply `review-best-practice-skill` to every incoming skill PR. Three outcomes:

- **PASS** → merged
- **NEEDS-REVISION** → maintainer comments with specific findings; use `revise-best-practice-skill` to fix each one
- **REJECT** → a required field is missing or a core criterion fails; PR is closed with explanation; fix and re-open

Use `review-best-practice-skill` on your own file before opening a PR — it runs the same checklist. A skill that passes your self-review will pass the maintainer's review.

### How many skills do I need to write to add a new domain?

Minimum 2 seed skills. A domain with 1 skill signals an abandoned stub. Use `design-best-practice-domain` to set up the full domain structure, then `write-best-practice-skill` for each seed skill, then `audit-best-practice-domain` to verify all pass before opening the PR.

### Can I use grimoire for proprietary knowledge that can't be publicly cited?

No. Every skill requires a verifiable source — an institution, standard body, or named top-tier companies whose practices are at least publicly known (even if not fully documented). Skills that can't be verified by a reviewer fail the source criterion.

---

## Quality standards

### Why does every skill require "Why This Is Best Practice"?

Without it, there's no way for a reviewer — human or AI — to verify the skill belongs in grimoire. The section is the quality signal: it's how maintainers distinguish a proven best practice from an opinion, a company convention, or an interesting technique.

The section makes grimoire's quality claim self-enforcing: any agent that applies `review-best-practice-skill` checks the same criteria, producing a consistent verdict.

### How do I know if a skill is outdated?

Use the `deprecate-best-practice-skill` staleness criteria:

- The source institution revised its position → use `revise-best-practice-skill` (fix, not deprecate)
- The tool or API referenced no longer exists at scale → use `revise-best-practice-skill` (update reference)
- A newer practice has achieved majority top-tier adoption that directly supersedes this one → use `deprecate-best-practice-skill`
- The "Adopted by" claim is no longer accurate → use `revise-best-practice-skill` to update, or `deprecate-best-practice-skill` if the claim was always wrong

### What's the difference between revise-best-practice-skill and deprecate-best-practice-skill?

`revise-best-practice-skill`: the practice is still valid — something in the skill file is wrong or outdated. Fix specific findings without rewriting the whole skill.

`deprecate-best-practice-skill`: the practice itself has been superseded, or the skill never qualified. Mark for removal and point to the replacement.

### Why is the scope limit "one concept per skill"?

A skill covering two separable concepts produces ambiguous routing in `suggest-best-practice`, makes `review-best-practice-skill` harder to apply consistently, and prevents contributors from updating one concept independently. If you're unsure, split — two clean skills are always better than one overloaded skill.
