# verify-id-graph.js — Specification v1.0

> ID: TOOL-VERIFY-004
> Version: 1.0.0
> Layer: L1 Standards (lives in `Z-ai-standards/scripts/`)
> Owning repo: Z-ai-standards
> Last Updated: 2026-06-17
> Effective Date: 2026-06-17
> Status: **APPROVED**
> Related: STD-META-001 v2.0, STD-SKILL-001 v1.0, TOOL-VERIFY-002 (verify-standards.js)
> Implements invariants: G01–G15 from STD-META-001 §10.2 and STD-SKILL-001 §13.2

> **Status: APPROVED.** This specification defines the cross-repo ID graph
> validator that enforces DAG invariants, layer-edge rules, compatibility
> constraints, and bidirectional `Aligned_with:` symmetry across the four
> Z-ai repositories.
>
> **Key principle:** Two-level strictness — HARD checks (G01-G15) apply
> always to STD/RULE/PROC/TOOL and only to ZAI skills that declare an `id`;
> SOFT warnings (W01-W10) report issues without failing the build.

---

## Chapters

| Chapter                                                                       | Contents                                                                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [1. Purpose, Location & Inputs](chapters/01-purpose-location-inputs.md)       | Purpose, file location, invocation, CLI flags, exit codes, repo discovery, file globs, migrations, config                |
| [2. Algorithm & Check Catalog](chapters/02-algorithm-checks.md)               | 11-phase extraction/validation algorithm, G01–G15 hard errors, W01–W10 soft warnings, strictness model                   |
| [3. Output, Integration & Roadmap](chapters/03-output-integration-roadmap.md) | Human-readable and JSON output formats, pre-commit/CI integration, implementation notes, open questions, version roadmap |

---

## Quick Reference

### Repos scanned

| Repo           | Layer | ID prefixes                          |
| -------------- | ----- | ------------------------------------ |
| Z-ai-platform  | meta  | (none — scanned for references only) |
| Z-ai-standards | L1    | `STD-*`                              |
| Z-ai-guard     | L2    | `RULE-*`, `PROC-*`, `TOOL-*`         |
| Z-ai-skills    | L3    | `ZAI-*`                              |

### Exit codes

| Code | Meaning                     |
| ---- | --------------------------- |
| 0    | All G01–G15 pass            |
| 1    | At least one G-check failed |
| 2    | Configuration error         |

### CLI flags

```bash
node standards/scripts/verify-id-graph.js [--ci] [--json] [--verbose] [--fail-on-warnings] [--only=standards,guard] [--root=<path>]
```

### Strictness model

| Level              | Behavior                                                   | Applies to                                                   |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ |
| **HARD** (G01–G15) | Fails the build (exit 1)                                   | STD/RULE/PROC/TOOL always; ZAI skills only when `id` present |
| **SOFT** (W01–W10) | Reports warning, does not fail unless `--fail-on-warnings` | All artifacts                                                |

---

_End of verify-id-graph.js specification v1.0 — APPROVED 2026-06-17._
