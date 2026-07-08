# CI Pipeline and Hooks Setup

> Part of [CI-AND-TESTING.md](../CI-AND-TESTING.md) -- Chapters: ci-setup.

---

## 1. Architecture overview

Z-ai-platform is an orchestrator repo with 3 submodules:

```
Z-ai-platform/                  (orchestrator)
├── .github/workflows/          (CI pipelines)
├── .githooks/                  (pre-commit, commit-msg)
├── standards/                  (submodule: STD-* standards + verifiers)
│   └── scripts/
│       ├── verify-standards.js     (V01-V11, content-level invariants)
│       ├── verify-id-graph.js      (G01-G15, cross-repo ID graph)
│       ├── check-md.sh             (3-layer markdown compliance)
│       └── graph-deps.sh           (dot/svg graph generator)
├── guard/                      (submodule: RULE-*)
├── skills/                     (submodule: 36 skills + CONTRACT.md pilot)
│   └── skills/commit-work/
│       ├── CONTRACT.md             (5-tuple execution contract, Phase B)
│       └── scripts/run-contract.sh (callable runtime, dry-run / commit)
└── worklog.md                  (append-only session log)
```

Three verifier layers run at different times:

| Layer                               | When                                           | What                                                                                         | Blocks?                          |
| ----------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| **L0 — pre-commit**                 | Every `git commit`                             | Worklog freshness (Phase 0), `verify-standards.js` (Phase 1), `verify-id-graph.js` (Phase 2) | YES (Phase 1+2) / WARN (Phase 0) |
| **L0.5 — commit-msg**               | Every `git commit` (after pre-commit)          | Conventional Commits format (RULE-COMMIT-004)                                                | YES                              |
| **L1 — commit-work contract**       | On demand (`run-contract.sh --commit '<msg>'`) | All L0 + L0.5 checks + creates the commit atomically                                         | YES                              |
| **L2 — GitHub Actions**             | Push to main, PR, nightly                      | Same as L0 + L0.5, plus graph/svg generation + PR comment on failure                         | YES (PR blocking)                |
| **L3 — skill validation**           | Manual                                         | `quick_validate.py` (only on `skill-creator` today)                                          | No (manual)                      |
| **L4 — bootstrap on clean sandbox** | Manual, recommended weekly                     | Full clone + bootstrap + verify                                                              | No (manual)                      |

---

## 2. L0 — pre-commit hook

### 2.1 What runs

The hook at `.githooks/pre-commit` (122 lines) runs in three phases:

| Phase   | Check                                          | Level                                                                                |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 0 | Worklog freshness: `find worklog.md -mmin -60` | WARN only (false positives common; commit may legitimately not need a worklog entry) |
| Phase 1 | `node standards/scripts/verify-standards.js`   | BLOCK (exit 1 on V01-V11 fail)                                                       |
| Phase 2 | `node standards/scripts/verify-id-graph.js`    | BLOCK (exit 1 on G01-G15 fail)                                                       |

Phase 1 verifies **content-level invariants** (V01-V11, currently 8
active checks after V11 was promoted from W11 soft warning on
2026-06-21):

- V04: All standards have frontmatter `ID:` field
- V05: All standards have `version:` field
- V06: All standards have `level:` field
- V07: STD-FE-001 §2 anti-monolith thresholds present
- V08: All 3-backtick code fences have a language tag
- V09: All `.md` files in `upload/` are English-only
- V10: STD-DOC-004 README_TEMPLATE has Badges guidance
- V11: No `.md` file in `standards/` + `docs/sandbox/` + `templates/` exceeds 1000 lines (HARD, since 2026-06-21 — was W11 soft warning)

Phase 2 verifies **cross-repo ID graph invariants** (G01-G15, 13 HARD
checks + 2 soft warnings). The 2 soft warnings (W01-W15 family) do NOT
block commits; they are reported but exit 0.

### 2.2 Installation

```bash
cd /home/z/my-project/Z-ai-platform
./install-hooks.sh
```

This sets `core.hooksPath = .githooks` (git config, local to this
clone). The same script must be re-run after any fresh clone.

### 2.3 Recommended workflow

Run verifiers **before AND after** every change to `standards/`:

```bash
# Before edit (establish baseline)
node standards/scripts/verify-standards.js
node standards/scripts/verify-id-graph.js

# ... edit a standard ...

# After edit (catch regressions)
node standards/scripts/verify-standards.js
node standards/scripts/verify-id-graph.js
```

**Red flags:**

- Baseline PASS -> after edit FAIL: you broke something. Investigate.
- Baseline FAIL -> after edit PASS: you accidentally fixed something
  while editing. Investigate — the fix may be unintentional and revert
  on the next contributor.

Both scenarios are equally suspicious. Never commit on a FAIL.

### 2.4 Conventional Commits (commit-msg hook)

The hook at `.githooks/commit-msg` (131 lines) validates commit
message format per RULE-COMMIT-004 + STD-GIT-001 §1.1-1.4:

| Check | Pattern                             | Level |
| ----- | ----------------------------------- | ----- |
| G4    | Conventional Commits regex: `^(feat | fix   | docs | style | refactor | test | chore | build | ci  | perf | revert)(\(.+\))?!?: .+` | BLOCK |
| G5    | Subject line <=72 characters        | BLOCK |
| G6    | Body wrapped at 72 chars            | WARN  |

**Skipped automatically:** merge commits, revert commits, squash
commits, fixup commits — git generates these messages and they cannot
be made to conform.

---

## 3. L1 — commit-work contract runtime (Phase B)

The contract layer wraps L0 + L0.5 into a single callable command:

```bash
# Preview all checks without committing
skills/skills/commit-work/scripts/run-contract.sh --dry-run

# Validate message + create commit (atomic — commits only if 0 FAIL)
skills/skills/commit-work/scripts/run-contract.sh --commit 'feat(scope): description'

# Help
skills/skills/commit-work/scripts/run-contract.sh --help
```

The runtime implements the 5-tuple contract from
`skills/skills/commit-work/CONTRACT.md`:

| Tuple element         | Implementation                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **trigger**           | `git commit` event OR `run-contract.sh --commit` invocation                                             |
| **hook**              | `.githooks/pre-commit` (Phase 0+1+2) + `.githooks/commit-msg` (G4-G6)                                   |
| **guard-check**       | G1-G6 (worklog freshness, repo state, conventional commits, line length, body wrap, no merge conflicts) |
| **standard-check**    | S1=verify-standards.js V01-V11, S2=verify-id-graph.js G01-G15, S3=check-md.sh                           |
| **success-criterion** | Commit created; all guards PASS or WARN-only; 0 FAIL                                                    |

The contract layer is the **dogfood consumer** of Phase B. Every
commit on Z-ai-platform itself runs through it. The runtime logs to
stderr and exits non-zero on any FAIL.

---

## 4. L2 — GitHub Actions workflow

The workflow at `.github/workflows/verify-id-graph.yml` (250 lines)
runs on:

- Push to `main` (covers submodule pointer bumps)
- Pull request to `main`
- Nightly schedule: `0 3 * * *` UTC (= 06:00 Europe/Moscow)
- Manual `workflow_dispatch`

### 4.1 What it runs

1. **Checkout** with `fetch-depth: 0` (full history needed for graph
   generation).
2. **Submodule init** — `git submodule update --init --recursive`.
3. **Node.js 20** setup.
4. **verify-standards.js** — captured to `$GITHUB_STEP_SUMMARY` for
   the PR review UI. Exits non-zero on V01-V11 failure.
5. **verify-id-graph.js** — same. Exits non-zero on G01-G15 failure.
6. **Graphviz install** — apt first, conda-forge fallback (added
   2026-06-19 after apt-mirror degradation caused a 10m timeout).
7. **Puppeteer Chrome cache** — keyed by mermaid-cli + puppeteer-core
   versions. Saves ~7 minutes on cache hit.
8. **Mermaid CLI install** — `@mermaid-js/mermaid-cli` for `.mmd` ->
   `.svg` rendering.
9. **Graph generation** — `standards/scripts/graph-deps.sh` produces
   `docs/_graph/id-graph.{svg,png,dot}`.
10. **Diagram generation** — `standards/scripts/render-diagrams.sh`
    renders `.mmd` process diagrams to `.svg`.
11. **Artifact upload** — graph + diagrams, 30-day retention.
12. **Failure artifact** — verifier output, 7-day retention.
13. **PR comment** — on failure only, lists which verifier(s) failed
    and the local command to reproduce.

### 4.2 Concurrency control

```yaml
concurrency:
  group: verify-id-graph-${{ github.ref }}
  cancel-in-progress: true
```

A new push to the same ref cancels any in-progress run. Cancelled
runs are marked "cancelled", not "failure" — they do NOT block PR
merge.

### 4.3 Permissions

```yaml
permissions:
  contents: read
```

The workflow has read-only content access by default. The PR comment
step uses the implicit `GITHUB_TOKEN` with `pull-requests: write`
inherited from the workflow's `permissions` block (GitHub Actions
auto-grants write to issues/PRs for `GITHUB_TOKEN` when the workflow
runs on a PR).

**Note:** if you add a step that needs to push commits, create
releases, or modify protected branches, you must explicitly add
`contents: write` or `packages: write` to the `permissions` block.
