# CI and Testing — Z-ai-platform

> Source: Merge of two draft documents ("Полный CI/CD Pipeline" and
> "Уровни тестирования Z-ai-platform") plus an audit of 12 bugs in the
> drafts against the actual repo state on 2026-06-21.
> Owning standard: STD-META-001 (this is a project doc, not a standard).
> Last Updated: 2026-06-21

This document is the canonical reference for the CI pipeline and the
testing layer model of Z-ai-platform. It supersedes the two earlier
drafts (which contained 12 factual bugs against actual repo state —
see the Bug Audit chapter).

The 4-repo architecture is documented in `README.md` and
`CONTRIBUTING.md`. This document covers only the testing and CI layers.

---

## Chapters

| Chapter                                       | What it covers                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [ci-setup.md](chapters/ci-setup.md)           | Architecture overview, pre-commit hook (L0), commit-work contract (L1), GitHub Actions workflow (L2)          |
| [testing-guide.md](chapters/testing-guide.md) | Skill validation (L3), bootstrap on clean sandbox (L4), migration resilience test, test cadence cheat sheet   |
| [linting.md](chapters/linting.md)             | Recommended additions (P0/P1/P2), known limitations and gotchas, bug audit of original drafts, change history |

---

## Quick reference: verifier commands

```bash
# Content-level invariants (V01-V11)
node standards/scripts/verify-standards.js

# Cross-repo ID graph (G01-G15)
node standards/scripts/verify-id-graph.js

# Skills verifier (S01-S10c, --strict mode)
node standards/scripts/verify-skills.js --strict

# Commit contract (dry-run)
skills/skills/commit-work/scripts/run-contract.sh --dry-run

# Snapshot comparison
node standards/scripts/verify-id-graph.js --compare=standards/_snapshots/id-graph-baseline.json
```

---

## Quick reference: test cadence

| Event                                     | What to run                                                     |
| ----------------------------------------- | --------------------------------------------------------------- |
| Every `git commit`                        | L0 pre-commit + L0.5 commit-msg (automatic via `.githooks/`)    |
| After editing `standards/`                | `node standards/scripts/verify-standards.js` (before AND after) |
| After editing `guard/rules/` or `skills/` | `node standards/scripts/verify-id-graph.js`                     |
| Before `git push`                         | L1 `run-contract.sh --dry-run` (preview all checks)             |
| Every push to main / PR                   | L2 GitHub Actions (automatic)                                   |
| Weekly                                    | L4 bootstrap on clean sandbox                                   |
| Monthly                                   | L7 migration resilience test                                    |
| After `bootstrap.sh` edit                 | L4 immediately                                                  |
| After `MIGRATIONS.md` edit                | L7 immediately                                                  |

**The cardinal rule:** if `verify-id-graph.js` does not pass, do not
push. 13/13 HARD PASS is a gate, not a recommendation. One missed
cross-ref in production = downstream agents work with stale standards
and you will not know about it.
