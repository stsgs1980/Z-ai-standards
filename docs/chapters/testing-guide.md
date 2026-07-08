# Testing Guide

> Part of [CI-AND-TESTING.md](../CI-AND-TESTING.md) -- Chapters: testing-guide.

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
This is the same trap as `git reset --hard` wiping uncommitted work.

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
