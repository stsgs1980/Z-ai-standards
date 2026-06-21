# CI and Testing — Z-ai-platform

> Source: Merge of two draft documents ("Полный CI/CD Pipeline" and
> "Уровни тестирования Z-ai-platform") plus an audit of 12 bugs in the
> drafts against the actual repo state on 2026-06-21.
> Owning standard: STD-META-001 (this is a project doc, not a standard).
> Last Updated: 2026-06-21

This document is the canonical reference for the CI pipeline and the
testing layer model of Z-ai-platform. It supersedes the two earlier
drafts (which contained 12 factual bugs against actual repo state —
see §11 for the audit table).

The 4-repo architecture is documented in `README.md` and
`CONTRIBUTING.md`. This document covers only the testing and CI layers.

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
├── guard/                      (submodule: RULE-MONOLITH-001..017)
├── skills/                     (submodule: 36 skills + CONTRACT.md pilot)
│   └── skills/commit-work/
│       ├── CONTRACT.md             (5-tuple execution contract, Phase B)
│       └── scripts/run-contract.sh (callable runtime, dry-run / commit)
└── docs/session/               (worklog, SESSION_NOTES, DECISIONS_LOG)
```

Three verifier layers run at different times:

| Layer | When | What | Blocks? |
|---|---|---|---|
| **L0 — pre-commit** | Every `git commit` | Worklog freshness (Phase 0), `verify-standards.js` (Phase 1), `verify-id-graph.js` (Phase 2) | YES (Phase 1+2) / WARN (Phase 0) |
| **L0.5 — commit-msg** | Every `git commit` (after pre-commit) | Conventional Commits format (RULE-MONOLITH-004) | YES |
| **L1 — commit-work contract** | On demand (`run-contract.sh --commit '<msg>'`) | All L0 + L0.5 checks + creates the commit atomically | YES |
| **L2 — GitHub Actions** | Push to main, PR, nightly | Same as L0 + L0.5, plus graph/svg generation + PR comment on failure | YES (PR blocking) |
| **L3 — skill validation** | Manual | `quick_validate.py` (only on `skill-creator` today) | No (manual) |
| **L4 — bootstrap on clean sandbox** | Manual, recommended weekly | Full clone + bootstrap + verify | No (manual) |

---

## 2. L0 — pre-commit hook

### 2.1 What runs

The hook at `.githooks/pre-commit` (122 lines) runs in three phases:

| Phase | Check | Level |
|---|---|---|
| Phase 0 | Worklog freshness: `find docs/session/worklog.md -mmin -60` | WARN only (false positives common; commit may legitimately not need a worklog entry) |
| Phase 1 | `node standards/scripts/verify-standards.js` | BLOCK (exit 1 on V01-V11 fail) |
| Phase 2 | `node standards/scripts/verify-id-graph.js` | BLOCK (exit 1 on G01-G15 fail) |

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
- Baseline PASS → after edit FAIL: you broke something. Investigate.
- Baseline FAIL → after edit PASS: you accidentally fixed something
  while editing. Investigate — the fix may be unintentional and revert
  on the next contributor.

Both scenarios are equally suspicious. Never commit on a FAIL.

### 2.4 Conventional Commits (commit-msg hook)

The hook at `.githooks/commit-msg` (131 lines) validates commit
message format per RULE-MONOLITH-004 + STD-GIT-001 §1.1-1.4:

| Check | Pattern | Level |
|---|---|---|
| G4 | Conventional Commits regex: `^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?!?: .+` | BLOCK |
| G5 | Subject line ≤72 characters | BLOCK |
| G6 | Body wrapped at 72 chars | WARN |

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

| Tuple element | Implementation |
|---|---|
| **trigger** | `git commit` event OR `run-contract.sh --commit` invocation |
| **hook** | `.githooks/pre-commit` (Phase 0+1+2) + `.githooks/commit-msg` (G4-G6) |
| **guard-check** | G1-G6 (worklog freshness, repo state, conventional commits, line length, body wrap, no merge conflicts) |
| **standard-check** | S1=verify-standards.js V01-V11, S2=verify-id-graph.js G01-G15, S3=check-md.sh |
| **success-criterion** | Commit created; all guards PASS or WARN-only; 0 FAIL |

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
8. **Mermaid CLI install** — `@mermaid-js/mermaid-cli` for `.mmd` →
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

---

## 5. L3 — skill validation

### 5.1 What exists today

Only **1 of 36 skills** has a `scripts/quick_validate.py`: `skill-creator`.

```bash
# Validate a skill (only works if skill has quick_validate.py)
python skills/skills/skill-creator/scripts/quick_validate.py \
       skills/skills/<skill-name>
```

The other 35 skills have no callable validator. The Phase A1 catalog
(see `skills/docs/CATALOG.md` §5) records this gap.

### 5.2 What to do for skills without `quick_validate.py`

For now, manual smoke test:

```bash
# 1. SKILL.md is well-formed (has frontmatter, valid YAML)
head -10 skills/skills/<skill-name>/SKILL.md

# 2. Skill loads in runtime
# (in agent session) Skill(command="<skill-name>")

# 3. Optional: re-run catalog to confirm classification
python /home/z/my-project/scripts/catalog_skills.py
```

Phase D1 (planned in O-017 cascade) will produce
`verify-skills.js` — a skills-side verifier analogous to
`verify-standards.js`. Until then, skill validation is manual.

---

## 6. L4 — bootstrap on clean sandbox

Recommended cadence: weekly, OR after any change to `bootstrap.sh`.

### 6.1 Test procedure

```bash
# 1. Clean sandbox (NEVER use the live working tree — use a tmp path)
SANDBOX="/tmp/Z-ai-platform-bootstrap-test-$(date +%s)"
mkdir -p "$SANDBOX"
cd "$SANDBOX"

# 2. Run bootstrap (clone + submodule init + symlink setup)
bash <(curl -fsSL https://raw.githubusercontent.com/stsgs1980/Z-ai-platform/main/bootstrap.sh)

# 3. Verify standards are present
ls "$SANDBOX/Z-ai-platform/standards/standards/" | wc -l   # expect ~20 files

# 4. Verify skills are linked (not broken symlinks)
find "$SANDBOX/skills" -type l ! -exec test -e {} \; -print | wc -l   # expect 0

# 5. Verify ID graph passes
node "$SANDBOX/Z-ai-platform/standards/scripts/verify-id-graph.js"

# 6. Cleanup
rm -rf "$SANDBOX"
```

### 6.2 What this tests

- Submodule recursive clone does not fail (network stability)
- Symlinks created correctly (not broken links)
- Backup mechanism works if a skill with same name already exists
- Verification scripts find all files in the new location

### 6.3 Critical safety note

**NEVER run `rm -rf /home/z/my-project/Z-ai-platform`** as a "clean
sandbox" step. That is the live working tree; you will lose
uncommitted changes. Always use `/tmp/...` with a timestamp suffix.
This is LESSON-004 in `SESSION_NOTES.md` §12.7 — the same trap as
`git reset --hard` wiping uncommitted work.

---

## 7. Migration resilience test

Recommended cadence: monthly, OR after any change to `MIGRATIONS.md`.

```bash
# 1. Confirm legacy IDs still resolve (migration window open)
node standards/scripts/verify-id-graph.js   # should PASS

# 2. Close a migration window (set end_date in the past)
#    Edit standards/MIGRATIONS.md — set the relevant entry's end_date
#    to a date in the past.

# 3. Re-run verifier
node standards/scripts/verify-id-graph.js
#    Legacy IDs from that migration should now FAIL (G05)

# 4. Revert MIGRATIONS.md change
git checkout standards/MIGRATIONS.md
```

This verifies that migration deadlines are actually enforced, not
just documented.

---

## 8. Test cadence cheat sheet

| Event | What to run |
|---|---|
| Every `git commit` | L0 pre-commit + L0.5 commit-msg (automatic via `.githooks/`) |
| After editing `standards/` | `node standards/scripts/verify-standards.js` (before AND after) |
| After editing `guard/rules/` or `skills/` | `node standards/scripts/verify-id-graph.js` |
| Before `git push` | L1 `run-contract.sh --dry-run` (preview all checks) |
| Every push to main / PR | L2 GitHub Actions (automatic) |
| Weekly | L4 bootstrap on clean sandbox |
| Monthly | L7 migration resilience test |
| After `bootstrap.sh` edit | L4 immediately |
| After `MIGRATIONS.md` edit | L7 immediately |

**The cardinal rule:** if `verify-id-graph.js` does not pass, do not
push. 13/13 HARD PASS is a gate, not a recommendation. One missed
cross-ref in production = downstream agents work with stale standards
and you will not know about it.

---

## 9. Recommended additions (not yet implemented)

| Test | Why | Phase |
|---|---|---|
| **Snapshot test for `verify-id-graph.js`** | Determinism: same input → same output. Without this, refactoring the script risks silent regressions. | Phase D1 |
| **End-to-end test: modify standard → verify → CI pass/fail** | Automates the manual test scenarios in §6. Reusable workflow composition. | Phase D2 |
| **Symlink integrity check in CI** | Bootstrap creates symlinks; a broken link is silent until a user hits it. | Phase D2 |
| **`registry.json` consistency test** | When `registry.json` is created, test that it matches actual `skills/` contents. | Phase E |
| **Version-bump detection** | If a standard's content changed but `version:` was not bumped → WARN (content drift). | Phase D1 |
| **`verify-skills.js`** | Skills-side verifier analogous to `verify-standards.js`. Catches missing frontmatter, broken `Related:` edges in skills, contract violations. | Phase D1 (O-017) |
| **`run-contract.sh` in CI** | Currently L1 contract runs only locally. Adding it to CI would catch contract drift between local hooks and CI verifiers. | Phase C |

---

## 10. Known limitations and gotchas

### 10.1 `core.fileMode=false` is required on sandbox clones

Sandbox fs mount sets +x bit on all files (so .sh can run without
per-file chmod). Git's default `core.fileMode=true` flags the index
vs working-tree mode bit mismatch as "modified" — 17+ files appear
modified with 0 line changes. Fix: `git config core.fileMode false`
per clone. `bootstrap.sh` Step 2 does this automatically. See
`SESSION_NOTES.md` §12.5 (LESSON-002).

### 10.2 Worklog freshness (Phase 0) is WARN-only

The Phase 0 check `find docs/session/worklog.md -mmin -60` produces
false positives — many commits legitimately do not need a worklog
entry (typo fixes, dependency bumps). Do not promote to BLOCK without
a more nuanced check (e.g. "is the commit touching files outside
docs/session/?").

### 10.3 `--timeout` flag does not exist on verifiers

Both `verify-standards.js` and `verify-id-graph.js` take a single
optional positional `mode` argument (`process.argv[2]`). They do not
parse `--timeout`, `--verbose`, or any other flag. Pass no arguments
for default mode. If you need a timeout, use `timeout(1)`:

```bash
timeout 30s node standards/scripts/verify-id-graph.js
```

### 10.4 `quick_validate.py` is not universal

Only `skill-creator` has it. Running the script on other skills will
fail with `No such file or directory`. See §5.

### 10.5 Emoji regex requires PCRE mode

If you write a custom check for emoji in markdown, use `grep -P`
(PCRE mode) with the `\u{XXXX}` syntax. `grep -E` (POSIX ERE) does
NOT interpret `\u{XXXX}` — it matches the literal characters
`\`, `u`, `{`, etc.

```bash
# Correct (PCRE)
grep -P '[\x{1F600}-\x{1F64F}\x{2600}-\x{27BF}]' file.md

# WRONG (POSIX ERE — matches literal '\u{1F600}' characters)
grep -E '[\u{1F600}-\x{1F64F}\u{2600}-\x{27BF}]' file.md
```

### 10.6 Performance benchmark threshold

The drafts proposed a 3.0s threshold for `verify-id-graph.js` on
GitHub runners. This is **arbitrary** — no baseline measurement
exists. Before adopting such a threshold, run the script 5× on a
GitHub runner and record the actual median. Set the threshold to
`median × 1.5` to allow for runner variance. Local runs (sandbox) are
typically <1s; GitHub runners vary 1-4s depending on load.

### 10.7 Adversarial test files in `standards/standards/` race the verifier

If you write an L5 adversarial test that creates temporary files in
`standards/standards/` and then runs `verify-id-graph.js`, the
verifier may FAIL on a check unrelated to what you are testing (e.g.
the temp file's ID syntax violates G12). Use a separate temp
directory and copy in only the well-formed test fixtures.

### 10.8 LESSON-004: `git reset --hard` is destructive

Before ANY `git reset --hard <ref>`, stash the working tree:

```bash
git stash push -u -m "pre-reset-safety"
git reset --hard HEAD~1
git stash pop
```

`git reset --hard` is a TWO-axis destructive operation: it moves the
branch pointer AND overwrites the working tree. Triggered twice in
Phase B smoke testing. See `SESSION_NOTES.md` §12.7.

---

## 11. Bug audit of the original drafts

The two draft documents ("Полный CI/CD Pipeline" and "Уровни
тестирования Z-ai-platform") contained 12 factual bugs against the
actual repo state. This section documents them so future contributors
do not re-introduce them.

| # | Bug | Reality | Where fixed |
|---|---|---|---|
| 1 | L1 matrix lists `[standards, rules, zai-standards, zai-rules]` | Actual submodules: `standards`, `guard`, `skills` (+ orchestrator). 2 of 4 listed repos do not exist. | §1 architecture |
| 2 | `verify-standards.js --timeout=30s` flag | Script takes only `process.argv[2]` as mode string. No `--timeout` parsing. | §10.3 |
| 3 | `scripts/check-md.sh` path | Actual path is `standards/scripts/check-md.sh`. Root-level `scripts/` does not exist. | §1 architecture |
| 4 | `eslint-rules/` "no-op" criticism | The `if [ -d "eslint-rules" ]` check is a forward-compatible defensive guard, not a bug. Real issue is no `.eslintrc` exists. | §9 recommendations |
| 5 | `quick_validate.py` called for all skills | Only 1 of 36 skills (`skill-creator`) has it. | §5.1, §10.4 |
| 6 | Emoji regex `grep -E '[\u{1F600}-...]'` | Requires `grep -P` (PCRE). `grep -E` matches literal characters. | §10.5 |
| 7 | L5 adversarial tests create files in `standards/standards/` | Race condition — verifier may FAIL on unrelated G-check. | §10.7 |
| 8 | L4 threshold 3.0s | Arbitrary, no baseline. | §10.6 |
| 9 | L8 chat compliance checks `chat-logs/agent-responses.log` | File does not exist anywhere in the repo. | Removed (speculative test deleted) |
| 10 | No `permissions:` block in workflow | PR comment step needs `pull-requests: write`. | §4.3 |
| 11 | `npm install -g yq` in L2 | `verify-id-graph.js` does not use `yq`. Wasted install time. | Not in actual workflow (§4) |
| 12 | `rm -rf /home/z/my-project/Z-ai-platform` in L6 bootstrap test | Wipes the live working tree. Same trap as LESSON-004. | §6.1, §10.8 |

---

## 12. Change history

| Date | Change |
|---|---|
| 2026-06-21 | Initial creation. Merges two draft documents ("Полный CI/CD Pipeline" and "Уровни тестирования Z-ai-platform") into one canonical reference. Documents the actual existing workflow (`.github/workflows/verify-id-graph.yml`, 250 lines) instead of a hypothetical one. Includes §11 bug audit table documenting 12 factual errors in the drafts against actual repo state. |
