# Linting, Verifier Improvements, and Known Limitations (Part 2)

> Part of [CI-AND-TESTING.md](../CI-AND-TESTING.md) -- Chapters: linting (continued).

---

#### 9.4.3 `--help` flag for verifiers

Add `--help` to `verify-standards.js` and `verify-id-graph.js` so
contributors can discover usage without reading the full doc:

```bash
node standards/scripts/verify-standards.js --help
# Usage: node verify-standards.js [mode]
#   mode: 'strict' (default) | 'permissive' | 'ci'
```

Low effort, high UX. **Owner:** @backend. **Target:** Q1 2027.

#### 9.4.4 `verify-id-graph.js` modularization — IMPLEMENTED (2026-06-21, O-018)

**Status:** [OK] COMPLETE — `verify-id-graph.js` v1.1.5 -> v1.1.6.

**What was done:**

Previous O-018 attempt (2026-06-21) extracted 4 lib/ files (constants, graph-algorithms, parsers, snapshot — 500 lines), reducing main file from 1593 -> 1354 lines. This continuation extracted 4 more blocks:

| New lib/ file            | Lines | Content                                                                                                          |
| ------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------- |
| `lib/health-warnings.js` | 349   | Phase 10 W11-W15 (size anomaly, missing section-XA, broken refs, OPEN issues, naming drift) + W13 root-cause fix |
| `lib/declarations.js`    | 251   | extractDeclaration (3 header formats) + parseMigrations (YAML blocks)                                            |
| `lib/output.js`          | 152   | emitHumanReadable + emitJSON (pure functions, take results as param)                                             |
| `lib/file-scanner.js`    | 138   | listFiles + globFiles + matchesPattern (zero-dep glob)                                                           |

**Main file size:** 1355 -> 829 lines (-526 lines, -39%). Under 1000-line target.

**W13 root-cause fix (LESSON-001 applied):**

Previous W13 implementation maintained a whitelist of ~30 known false-positive references — every new prose mention of a skills/ file path in a standards/ doc required a new whitelist entry (unbounded growth, LESSON-001 anti-pattern).

Root-cause fix in this iteration:

1. **Expanded candidates list** to include `path.join(platformRoot, 'skills', 'skills', refPath)` — resolves path-like refs (`commit-work/CONTRACT.md`, `session-handoff/CONTRACT.md`, `gepetto/README.md`, `react-dev/README.md`) to actual files in skills/skills/ tree.
2. **Fixed submodule path resolution** — submodules are mounted INSIDE `Z-ai-platform/` (per `.gitmodules`: skills/ at `Z-ai-platform/skills/`, guard/ at `Z-ai-platform/guard/`), NOT as siblings at `../Z-ai-skills/` or `../Z-ai-guard/`. Original candidates list used `../Z-ai-skills/` which never resolved. Added correct paths `path.join(platformRoot, 'skills', ...)` and `path.join(platformRoot, 'guard', ...)`.

**W13 false-positive count: 11 -> 0.** All 11 prior false positives now resolve correctly through the candidates list. Whitelist kept small (~15 entries) for genuinely planned/historical/generic refs (planned scripts like `validate.sh`, `install.sh`; historical extraction sources like `AGENT_RULES.md`; generic file-type names like `SKILL.md`, `CONTRACT.md`).

**Honest finding:** Total code footprint grew slightly (verify-id-graph.js 829 + lib/ 1390 = 2219 lines vs previous 1354 + lib/ 500 = 1854 lines, +365 lines / +20%). This is because new lib/ files have comprehensive JSDoc docstrings (every function gets a block explaining semantics + edge cases + dependencies). The docstrings are the test plan for future unit tests. Pure line-count reduction was NOT the goal — modularization for testability and isolation was. The main file being under 1000 lines means a reader can scan it end-to-end in one sitting.

**Verification:**

```
verify-standards.js: 8/8 PASS
verify-id-graph.js: 13/13 HARD + 0 warnings + snapshot OK
  (was: 13/13 HARD + 11 warnings before W13 fix)
verify-skills.js --strict: 8/8 HARD PASS
Snapshot baseline: 61 IDs, 115 edges, 0 warnings (was 11)
```

**Owner:** @tech-lead. **Status:** COMPLETE 2026-06-21.

---

## 10. Known limitations and gotchas

### 10.1 `core.fileMode=false` is required on sandbox clones

Sandbox fs mount sets +x bit on all files (so .sh can run without
per-file chmod). Git's default `core.fileMode=true` flags the index
vs working-tree mode bit mismatch as "modified" — 17+ files appear
modified with 0 line changes. Fix: `git config core.fileMode false`
per clone. `bootstrap.sh` Step 2 does this automatically.

### 10.2 Worklog freshness (Phase 0) is WARN-only

The Phase 0 check `find worklog.md -mmin -60` produces
false positives — many commits legitimately do not need a worklog
entry (typo fixes, dependency bumps). Do not promote to BLOCK without
a more nuanced check.

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
fail with `No such file or directory`. See section 5.

### 10.5 Emoji regex requires PCRE mode

If you write a custom check for emoji in markdown, use `grep -P`
(PCRE mode) with the `\u{XXXX}` syntax. `grep -E` (POSIX ERE) does
NOT interpret `\u{XXXX}` — it matches the literal characters
`\`, `u`, `{`, etc.

```bash
# Correct (PCRE)
grep -P '[\x{1F600}-\x{1F64F}\x{2600}-\x{27BF}]' file.md

# WRONG (POSIX ERE — matches literal '\u{1F600}' characters)
grep -E '[\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]' file.md
```

### 10.5.1 W13 false positive on cross-submodule references

`verify-id-graph.js` W13 (broken cross-doc reference) scans only the
`standards/` tree. References to files in `skills/` or `guard/`
submodules (e.g. `` `run-contract.sh` ``, `` `CONTRACT.md` ``) fire
W13 even when the file exists in its submodule. This is a known
architectural limitation of the verifier, not a bug in the document.

Workaround options (in order of preference):

1. **Reference by full submodule-relative path** (e.g.
   `` `skills/skills/commit-work/scripts/run-contract.sh` ``) — W13
   still fires because the path does not exist in `standards/`, but
   the reader can follow the path manually.
2. **Add to `W13_WHITELIST`** in `verify-id-graph.js` (see lines
   ~1130-1169 for the existing whitelist) — O(N) fix, acceptable for
   stable cross-submodule paths.
3. **Extend W13 to scan all submodules** — proper root-cause fix,
   scheduled for Phase D1 when `verify-skills.js` is built (the two
   verifiers will share a common path-resolution module).

This document currently uses option 1 (full submodule-relative
paths) where practical, and accepts W13 warnings for short basename
references in narrative text.

### 10.6 Performance benchmark threshold

The drafts proposed a 3.0s threshold for `verify-id-graph.js` on
GitHub runners. This is **arbitrary** — no baseline measurement
exists. Before adopting such a threshold, run the script 5x on a
GitHub runner and record the actual median. Set the threshold to
`median x 1.5` to allow for runner variance. Local runs (sandbox) are
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
Phase B smoke testing.

### 10.8.1 LESSON-004a: automated guard layer for destructive scripts

LESSON-004's stash-then-reset recipe depends on operator discipline.
For scripts in the repo that perform destructive operations
(`bootstrap.sh`, `run-contract.sh`, future CI workflows), the safety
should be **encoded in the script itself**, not relied upon as a
manual habit.

**Two-layer guard (refined from the CI/CD audit):**

```bash
# Layer 1 (root cause): refuse if uncommitted changes exist.
# Catches the actual failure mode — losing work the operator
# did not realise was uncommitted.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[ERROR] Uncommitted changes detected. Stash or commit first." >&2
  exit 1
fi

# Layer 2 (defense in depth): require explicit --force flag for
# any rm -rf on tracked or top-level paths. Converts accidental
# invocation from 'silent catastrophe' to 'loud refusal'.
if [[ "$1" != "--force" ]]; then
  echo "[ERROR] Destructive operations require --force flag." >&2
  exit 1
fi
```

The two layers are independent and complementary:

- Layer 1 catches the common case (forgot to commit).
- Layer 2 catches the rare case (wrong working directory or wrong
  script invoked).
- Either alone is insufficient: Layer 1 without Layer 2 still allows
  `--force` workflows to wipe a clean tree; Layer 2 without Layer 1
  still allows a `--force` invocation to wipe uncommitted work.

**What this is NOT:** This is not a `$PWD`-prefix check (the initial
audit proposal). `$PWD` matching is fragile — clone paths vary across
machines and sandboxes, and any prefix that matches the live tree also
matches legitimately similar sandbox paths (e.g.
`/home/z/sandbox/Z-ai-platform-test`). The uncommitted-state check is
path-independent and catches the root cause directly.

**Candidate for promotion:** Phase C may encode this as guard check G0
in `skills/skills/commit-work/CONTRACT.md`, subsuming the manual
stash-then-reset recipe from LESSON-004 into automated enforcement.

---

## 11. Bug audit of the original drafts

The two draft documents ("Full CI/CD Pipeline" and "Testing Levels
Z-ai-platform") contained 12 factual bugs against the
actual repo state. This section documents them so future contributors
do not re-introduce them.

| #   | Bug                                                            | Reality                                                                                                                       | Where fixed                               |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | L1 matrix lists `[standards, rules, zai-standards, zai-rules]` | Actual submodules: `standards`, `guard`, `skills` (+ orchestrator). 2 of 4 listed repos do not exist.                         | section 1 architecture                    |
| 2   | `verify-standards.js --timeout=30s` flag                       | Script takes only `process.argv[2]` as mode string. No `--timeout` parsing.                                                   | section 10.3                              |
| 3   | `scripts/check-md.sh` path                                     | Actual path is `standards/scripts/check-md.sh`. Root-level `scripts/` does not exist.                                         | section 1 architecture                    |
| 4   | `eslint-rules/` "no-op" criticism                              | The `if [ -d "eslint-rules" ]` check is a forward-compatible defensive guard, not a bug. Real issue is no `.eslintrc` exists. | section 9 recommendations                 |
| 5   | `quick_validate.py` called for all skills                      | Only 1 of 36 skills (`skill-creator`) has it.                                                                                 | section 5.1, section 10.4                 |
| 6   | Emoji regex `grep -E '[\u{1F600}-...]'`                        | Requires `grep -P` (PCRE). `grep -E` matches literal characters.                                                              | section 10.5                              |
| 7   | L5 adversarial tests create files in `standards/standards/`    | Race condition — verifier may FAIL on unrelated G-check.                                                                      | section 10.7                              |
| 8   | L4 threshold 3.0s                                              | Arbitrary, no baseline.                                                                                                       | section 10.6                              |
| 9   | L8 chat compliance checks `chat-logs/agent-responses.log`      | File does not exist anywhere in the repo.                                                                                     | Removed (speculative test deleted)        |
| 10  | No `permissions:` block in workflow                            | PR comment step needs `pull-requests: write`.                                                                                 | section 4.3                               |
| 11  | `npm install -g yq` in L2                                      | `verify-id-graph.js` does not use `yq`. Wasted install time.                                                                  | Not in actual workflow (section 4)        |
| 12  | `rm -rf /home/z/my-project/Z-ai-platform` in L6 bootstrap test | Wipes the live working tree. Same trap as LESSON-004. Automated two-layer guard proposed in section 10.8.1 (LESSON-004a).     | section 6.1, section 10.8, section 10.8.1 |

---

## 12. Change history

| Date       | Change                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| 2026-06-21 | Initial creation. Merges two draft documents into one canonical reference. |
| 2026-06-21 | Rewrite of section 9 with priority matrix and P0/P1/P2 sections.           |
| 2026-06-21 | All three P0 items marked IMPLEMENTED.                                     |
| 2026-06-21 | verify-skills.js flipped to --strict default. All 15 violations closed.    |
