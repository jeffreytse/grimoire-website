# CUPID Skills — Design Spec

**Date:** 2026-06-09
**Status:** Implemented

## Problem

Grimoire has SOLID, Law of Demeter, and Composition-over-Inheritance but nothing that frames code quality from the *consumer's* perspective — as properties of the experience of working with the code rather than structural rules for authors.

## Solution

Add 5 atomic CUPID skills, one per property, split by nature across two subdomains.

## Design Decisions

### 1. Atomic skills (not one composite skill)
Each CUPID property is its own skill. Aligns with grimoire's atomicity principle: the LLM composes skills at runtime; grimoire does not pre-compose them.

### 2. Split by subdomain
- `engineering/architecture/` — Composable, Unix philosophy, Domain-based (structural/design concerns)
- `engineering/development/` — Predictable, Idiomatic (coding-level concerns)

### 3. emerging: true on all 5
Dan North published CUPID in February 2022. The 2-year promotion window applies. Mark `emerging: true` until majority adoption is demonstrated.

### 4. Cross-links via related:
Each skill's `related:` field links all 4 CUPID siblings plus domain overlaps:
- `apply-composable-design` → SOLID, composition-over-inheritance
- `apply-unix-philosophy` → SOLID (SRP overlap)
- `apply-domain-based-naming` → apply-domain-driven-design
- `apply-predictable-code` → apply-dry-principle
- `apply-idiomatic-code` → review-code-style

## Skills Created

| Skill | Path | CUPID |
|---|---|---|
| apply-composable-design | engineering/architecture | C |
| apply-unix-philosophy | engineering/architecture | U |
| apply-domain-based-naming | engineering/architecture | D |
| apply-predictable-code | engineering/development | P |
| apply-idiomatic-code | engineering/development | I |

## Source

Dan North, "CUPID—for joyful coding" (Feb 2022), https://dannorth.net/2022/02/10/cupid-for-joyful-coding/
