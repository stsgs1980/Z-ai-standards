# Linting, Verifier Improvements, and Known Limitations

> Part of [CI-AND-TESTING.md](../CI-AND-TESTING.md) -- Chapters: linting.

See also: [linting-part2.md](./linting-part2.md) for sections 9.4.3-12.

---

## 9. Recommended additions (not yet implemented)

### 9.1 Implementation priority matrix

| Test                                             | Priority | Owner      | Target  | Dependencies     |
| ------------------------------------------------ | -------- | ---------- | ------- | ---------------- |
| Snapshot test for `verify-id-graph.js`           | **P0**   | @tech-lead | Q3 2026 | Phase D1         |
| End-to-end test: modify standard -> verify -> CI | **P0**   | @devops    | Q3 2026 | Phase D2         |
| `verify-skills.js`                               | **P0**   | @backend   | Q3 2026 | Phase D1 (O-017) |
| Symlink integrity check in CI                    | **P1**   | @devops    | Q4 2026 | Phase D2         |
| `run-contract.sh` in CI                          | **P1**   | @devops    | Q4 2026 | Phase C          |
| `registry.json` consistency test                 | **P2**   | @backend   | Q1 2027 | Phase E          |
| Version-bump detection                           | **P2**   | @tech-lead | Q1 2027 | Phase D1         |
| `--help` flag for verifiers                      | **P2**   | @backend   | Q1 2027 | Phase D1         |

Priority semantics:

| Priority | Meaning                        | Action                            |
| -------- | ------------------------------ | --------------------------------- |
| **P0**   | Critical — blocks next release | Must be implemented before v2.5.0 |
| **P1**   | Important — Q4 2026            | Scheduled for Phase D2            |
| **P2**   | Nice to have — Q1 2027         | Roadmap backlog                   |

### 9.2 P0 — Critical (blocks v2.5.0 release)

> **Status as of 2026-06-21:** All three P0 items below are
> **IMPLEMENTED**. See per-item status badges. The remaining
> remediation work (flip `verify-skills.js` from soft-default to
> `--strict` mode) is tracked in section 9.2.2 below.

#### 9.2.1 Snapshot test for `verify-id-graph.js` — IMPLEMENTED

**Status:** [OK] IMPLEMENTED in `verify-id-graph.js` v1.1.4 + CI step
in `.github/workflows/verify-id-graph.yml`.

**Why:** Without this, refactoring `verify-id-graph.js` risks silent
regressions. The graph structure is deterministic — same input must
produce same output. A snapshot test makes any change in the output
loud and reviewable.

**Implementation (shipped):**

- Added `--snapshot=<file>`, `--compare=<file>`, `--update-snapshot`
  flags to `verify-id-graph.js` (v1.1.4).
- Snapshot file format: same JSON structure as `--json` output, plus
  `snapshot_meta` block with `script_version` and `created_at`.
- Comparison is structural: summary block (exact match), checks block
  (id+status+description+details-as-sorted-set), warnings block
  (sorted set of `{code, message}` pairs).
- Baseline file: `standards/_snapshots/id-graph-baseline.json`
  (committed, 61 IDs / 115 edges / 2 warnings as of 2026-06-21).
- CI step added to `.github/workflows/verify-id-graph.yml` after the
  `verify-id-graph.js` run.
- Smoke-tested locally: self-compare PASS, modified baseline FAIL
  with 4-diff output, `--update-snapshot` round-trips.

**Workflow:**

```bash
# Create baseline (one-time, or after intentional graph change)
node standards/scripts/verify-id-graph.js --snapshot=standards/_snapshots/id-graph-baseline.json

# CI check (every push — automatic)
node standards/scripts/verify-id-graph.js --compare=standards/_snapshots/id-graph-baseline.json
# Exits 1 if current graph differs from baseline.

# Update baseline (after intentional change, reviewed in PR)
node standards/scripts/verify-id-graph.js --update-snapshot \
  --compare=standards/_snapshots/id-graph-baseline.json
```

**Acceptance:** CI fails if current graph differs from baseline
unless `--update-snapshot` is explicitly passed (and the diff is
reviewed in the PR).

#### 9.2.2 `verify-skills.js` — IMPLEMENTED + REMEDIATED (`--strict` since 2026-06-21)

**Status:** [OK] IMPLEMENTED in `standards/scripts/verify-skills.js`
v1.0.0 + Phase 3 in `.githooks/pre-commit` (HARD, `--strict`) + CI
step in `.github/workflows/verify-id-graph.yml` (HARD, `--strict`).
**All 15 pre-existing violations closed** in the same patch that
clarified STD-SKILL-001 section 3.3 (name must match folder name exactly,
including `_sts` suffix) and section 10.1 V11c (STS-suffix rule is
author+folder driven, not folder-only).

**Why:** 35 of 36 skills had no validator. `SKILL.md` files could
have broken frontmatter, invalid `Related:` edges, or contract
violations without any automated check. The only existing validator
(`skill-creator/scripts/quick_validate.py`) was skill-specific and
not pluggable.

**Scope (shipped):**

9 checks (S01-S09), mapping to STD-SKILL-001 section 10.1 V11a-V14b:

| Check | Source | Strictness                                 | Description                                                        |
| ----- | ------ | ------------------------------------------ | ------------------------------------------------------------------ |
| S01   | V11a   | HARD                                       | SKILL.md exists in every skills/skills/{name}/ folder              |
| S02   | V11b   | HARD (`--strict` default since 2026-06-21) | frontmatter name matches folder name exactly (incl. `_sts` suffix) |
| S03   | V11c   | HARD (`--strict` default since 2026-06-21) | STS skills (with `author: STS`) have `_sts` folder suffix          |
| S04   | V13a   | HARD                                       | YAML frontmatter parses                                            |
| S05   | V13b   | HARD (`--strict` default since 2026-06-21) | Required fields: name, description, version                        |
| S06   | V05a   | SOFT                                       | id format: ZAI-<DOMAIN>-<NNN>                                      |
| S07   | V13c   | SOFT                                       | compatibility: both\|sandbox\|ade                                  |
| S08   | V14a   | SOFT                                       | frontmatter id matches blockquote ID:                              |
| S09   | V14b   | HARD                                       | frontmatter version matches blockquote Version:                    |

**Remediation log (closed 2026-06-21, all 15 violations):**

| #   | Skill                            | Was                                        | Now                               |
| --- | -------------------------------- | ------------------------------------------ | --------------------------------- |
| 1   | `phi-layout`                     | `name: golden-grid`                        | `name: phi-layout` (v2.2 -> v2.3) |
| 2   | `frontend-styling-expert_sts`    | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 3   | `performance-code-generator_sts` | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 4   | `phi-layout_sts`                 | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 5   | `prompt-engineering_sts`         | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 6   | `sync-toolkit_sts`               | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 7   | `workflow-discipline_sts`        | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 8   | `zai-ui-composer_sts`            | (false-positive due to verifier bug)       | unchanged; verifier fixed         |
| 9   | `anti-monolith`                  | `author: STS` (system skill, not personal) | `author:` field removed           |
| 10  | `session-experience`             | `author: STS` (system skill, not personal) | `author:` field removed           |
| 11  | `session-log`                    | `author: STS` (system skill, not personal) | `author:` field removed           |
| 12  | `gepetto`                        | missing `version:`                         | `version: 1.0` added              |
| 13  | `reducing-entropy`               | missing `version:`                         | `version: 1.0` added              |
| 14  | `session-handoff`                | missing `version:`                         | `version: 1.0` added              |
| 15  | `skill-creator`                  | missing `version:`                         | `version: 1.0` added              |

**Root-cause finding (verifier bug, not data bug):**

7 of the 8 S02 violations were false-positives caused by an
ambiguity in STD-SKILL-001 section 3.3 vs section 9.1. section 3.3 said "name must match
folder name (without `_sts` suffix for STS skills)" while section 9.1 and
the section 11 checklist said "name matches folder name (with `_sts`
suffix for STS)". The verifier v1.0.0 implemented the section 3.3 wording
literally — `expected = folder.replace(/_sts$/, '')` — which
contradicted section 9.1. The same patch that closes the violations
clarifies section 3.3 ("name must match folder name exactly, including
`_sts` suffix for STS skills; see section 9.1") and fixes the verifier to
compare without stripping the suffix. Only 1 of 8 S02 violations
(`phi-layout` -> `name: golden-grid`) was a real data bug.

The 3 S03 violations (`anti-monolith`, `session-experience`,
`session-log`) were genuine semantic errors: these skills had
`author: STS` set despite being system skills (with ZAI-ARCH/SESSION
IDs, not ZAI-STS-XXX). Per section 9, the `author: STS` field is the marker
that triggers the `_sts` folder-suffix requirement; system skills
must not set it. Fix: drop the `author:` field — git history
preserves attribution.

The 4 S05 violations were genuine missing-`version` fields; added
`version: 1.0` to each (these skills predate the v1.1 requirement).

**Integration (shipped):**

- `.githooks/pre-commit` Phase 3: runs `verify-skills.js --strict`.
  HARD failures (any of S01/S02/S03/S04/S05/S09) block the commit.
- `.github/workflows/verify-id-graph.yml`: runs `verify-skills.js
--strict`. HARD failures block CI.
- `.github/workflows/e2e-verifiers.yml` Test 3+4: validates that
  `--strict` mode catches S02 violations, and that cleanup restores
  PASS.

#### 9.2.3 End-to-end test: modify standard -> verify -> CI — IMPLEMENTED

**Status:** [OK] IMPLEMENTED in
`.github/workflows/e2e-verifiers.yml` (5 tests, smoke-tested
locally).

**Why:** The manual test scenarios in section 6 should be automated to
catch regressions before they reach production. Without this, each
verifier change is reviewed by hand, which does not scale.

**Implementation (shipped):**

Reusable workflow in `.github/workflows/e2e-verifiers.yml` with 5
tests:

1. **Test 1**: creates a 1004-line `_e2e_test_v11.md` in
   `standards/standards/`, runs `verify-standards.js`, expects exit
   1 with V11 in output. Cleans up.
2. **Test 2**: runs `verify-standards.js` after cleanup, expects
   PASS.
3. **Test 3**: creates a `_e2e-test-skill/` folder with a SKILL.md
   whose `name` field does not match the folder name, runs
   `verify-skills.js --strict`, expects exit 1 with S02 in output.
   Cleans up.
4. **Test 4**: runs `verify-skills.js` after cleanup, expects PASS.
5. **Test 5**: modifies `id-graph-baseline.json` (in-memory, not
   committed), runs `verify-id-graph.js --compare`, expects exit 1
   with MISMATCH in output. Restores baseline, re-runs, expects
   PASS.

**Triggers:** `workflow_dispatch` (manual), `pull_request` to main
(only when `standards/scripts/**` or the e2e workflow itself
changes — avoids wasted runner minutes on unrelated PRs).

**Local smoke test:** all 5 tests verified PASS in the development
session before commit.

### 9.3 P1 — Important (Q4 2026)

#### 9.3.1 Symlink integrity check in CI

**Why:** `bootstrap.sh` creates symlinks from `skills/` into the
sandbox runtime. A broken link is silent until a user hits it at
runtime, at which point the failure mode is confusing ("skill not
found" rather than "symlink broken").

**Implementation:** Add to `verify-id-graph.yml`:

```bash
find skills -type l ! -exec test -e {} \; -print | wc -l   # expect 0
```

If count != 0, fail the workflow with a list of broken links.

**Owner:** @devops. **Target:** Q4 2026.

#### 9.3.2 `run-contract.sh` in CI

**Why:** Local hooks may diverge from CI checks. A developer who runs
`git commit --no-verify` bypasses L0/L0.5 locally; L2 CI catches
verifier regressions but NOT contract-layer drift. Running
`run-contract.sh --dry-run` in CI ensures the two stay in sync.

**Implementation:** Add to `verify-id-graph.yml`:

```bash
- name: L1 contract check (Phase B)
  run: |
    skills/skills/commit-work/scripts/run-contract.sh --dry-run
```

The `--dry-run` flag is already implemented (run-contract.sh section 1, modes
block) and performs no mutation — it only runs the guard and standard
checks. Safe to run in CI without side effects.

**Owner:** @devops. **Target:** Q4 2026.

#### 9.3.3 Tiered hard caps for skills/ (V12) — IMPLEMENTED + EXTENDED (2026-06-21, O-017 Phase D2; S10c added 2026-06-22)

**Status:** [OK] IMPLEMENTED in `verify-skills.js` v1.1.1 (S10a + S10b + S10c checks).

**What was added:**

| Check       | Cap                      | Scope                     | Rationale                                                                         |
| ----------- | ------------------------ | ------------------------- | --------------------------------------------------------------------------------- |
| S10a (V12a) | SKILL.md <= 800 lines    | all 36 skill folders      | META-001 section 4.18.1 SKILL.md row (existing ceiling, NEW runtime enforcement)  |
| S10b (V12b) | CONTRACT.md <= 500 lines | 2 skills with CONTRACT.md | META-001 section 4.18.1 CONTRACT.md row (added 2026-06-21)                        |
| S10c (V12c) | README.md <= 400 lines   | 10 skills with README.md  | META-001 section 4.18.1 README.md row (existing ceiling, NEW runtime enforcement) |

**Why tiered, not flat (per O-015 + LESSON-001):** A flat 1000-line cap
(like V11 in `verify-standards.js`) doesn't fit the heterogeneous skills/
corpus. SKILL.md is a trigger surface (must load in one read, 800 cap).
CONTRACT.md is a structural document (10 mandatory sections per
`skills/docs/CONTRACT-TEMPLATE.md`, 500 cap). README.md is an
onboarding/overview document (400 cap — detailed examples belong in
`references/`). References are loaded on demand and exempt per section 4.18.1 —
no cap.

**Why 500 for CONTRACT.md (not 200 as O-017 originally proposed):** The
original O-017 proposal suggested 200 lines, but both pilot contracts
violate a 200-line cap by 1.8x–2.3x (`commit-work/CONTRACT.md` 368 lines,
`session-handoff/CONTRACT.md` 466 lines). Per LESSON-001 (root-cause fix
scales as O(1), symptom/whitelist fix scales as O(N)), the cap was
adjusted to fit measured reality rather than compressing the structural
10-section shape. The 500-line cap gives ~7% headroom over the largest
pilot. See `META-001 section 4.18.6` for the full rationale.

**Why S10c was activated on 2026-06-22 (not 2026-06-21 with S10a/S10b):**
The 400-line README.md cap existed in section 4.18.1 since 2026-06-21, but 2
pre-existing violations blocked HARD enforcement from day 1
(`gepetto/README.md` 485 lines, `react-dev/README.md` 404 lines). Both
were remediated on 2026-06-22 (gepetto 485->302 via consolidating 3
overlapping integration sections; react-dev 404->392 via condensing one
multi-item bullet list into a paragraph), unblocking S10c as HARD from
day 1. See `META-001 section 4.18.7` for the full rationale.

**What was NOT added:**

- **References cap.** References are exempt per section 4.18.1 — no cap. The
  O-017 proposal's "references <= 2000" was wrong (contradicts section 4.18.1);
  corrected in this implementation.

**Companion standard changes:**

- `META-001 section 4.18.1` — README.md row pre-existing; CONTRACT.md row added 2026-06-21
- `META-001 section 4.18.5` — added cross-links to STD-SKILL-001 section 8.2 for CONTRACT.md (2026-06-21) and README.md (2026-06-22)
- `META-001 section 4.18.6` — CONTRACT.md cap rationale (added 2026-06-21)
- `META-001 section 4.18.7` — README.md cap rationale (added 2026-06-22)
- `STD-SKILL-001 section 8.2` — added CONTRACT.md ceiling line (2026-06-21) + README.md ceiling line (2026-06-22)
- `STD-SKILL-001 section 10.1` — replaced deferred `PROC-LINECOUNT-004` row with active `verify-skills.js S10a/S10b/S10c` rows
- `verify-skills.js` — v1.0.0 -> v1.1.0 (2026-06-21, S10a+S10b) -> v1.1.1 (2026-06-22, +S10c)

**Verification (post-S10c implementation, 2026-06-22):**

```
verify-skills.js --strict: 9/9 HARD PASS (incl. S10a + S10b + S10c)
  S10a: all 36 SKILL.md files <= 800 lines
  S10b: all 2 CONTRACT.md files <= 500 lines
  S10c: all 10 README.md files <= 400 lines (max: 392, react-dev)
verify-standards.js: 8/8 PASS (META-001 = 962 lines after section 4.18.7 addition + section 4.18.4 exempt-list compression)
verify-id-graph.js: 13/13 HARD + snapshot OK
```

**Owner:** @tech-lead. **Status:** COMPLETE 2026-06-22 (S10a+S10b on 2026-06-21, S10c on 2026-06-22).

### 9.4 P2 — Nice to have (Q1 2027)

#### 9.4.1 `registry.json` consistency test

When `registry.json` is created (Phase E), test that it matches actual
`skills/` contents. Prevents drift between catalog and filesystem.

**Owner:** @backend. **Target:** Q1 2027.

#### 9.4.2 Version-bump detection

If a standard's content changed but `version:` was not bumped, emit a
WARN. Catches content drift without version tracking. This is the
soft-warning counterpart to V05 (which only checks that `version:` is
present, not that it is current).

**Owner:** @tech-lead. **Target:** Q1 2027.
