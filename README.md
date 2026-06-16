# Z.ai Standards Corpus

A versioned corpus of engineering standards for Z.ai projects, protected by
permanent invariant verifiers and a two-layer CI gate (local pre-commit hook +
GitHub Actions).

## What's in this repo

```
upload/standards-v2/standards/*.md   20 standards (canonical)
upload/*.md                          5 top-level docs (Hooks guide, Sandbox guide, SKILL, MARKDOWN_STANDARD, UNICODE_POLICY)
scripts/verify-standards.js          Permanent invariants V01-V10
scripts/verify-cascade.js            Cascade integration verifier (47 checks)
scripts/cascade-tasks.js             5-level cascade task plan (17 tasks)
scripts/install-hooks.sh             One-time hook bootstrap
scripts/scan-plain-fences.py         Debug helper: scans for untagged code fences
scripts/cross_test_report.py         Generates cross-test report (xlsx)
eslint-demo/                         Example ESLint plugin demonstrating STD-DOC-003 enforcement
.githooks/pre-commit                 Local pre-commit hook
.github/workflows/standards.yml      Remote CI gate
STANDARDS.md                         Maintenance protocol for the corpus
worklog.md                           Append-only multi-agent work log
```

## Quick start (5 commands)

```bash
# 1. Clone
git clone <your-repo-url> z-ai-standards
cd z-ai-standards

# 2. Install pre-commit hook
bash scripts/install-hooks.sh

# 3. Verify all invariants hold (10 permanent + 47 cascade = 57 checks)
node scripts/verify-standards.js
node scripts/verify-cascade.js

# 4. (Optional) Run ESLint demo
cd eslint-demo && npm install && npm run lint && cd ..

# 5. Start editing standards. See STANDARDS.md for the maintenance protocol.
```

## Invariant inventory

| ID | Description | Standard |
|----|-------------|----------|
| V01 | Startup uses `init-fullstack`, not `npx next dev` | STD-ENV-002 §5 |
| V02 | Log path uses `.zscripts/dev.log`, not `/tmp/zdev.log` | STD-ENV-002 §3+§5 |
| V03 | Hooks Guide API routes use Zod `safeParse` | Hooks Guide |
| V04 | No emoji/Unicode graphic chars in `.md` files | STD-DOC-003 |
| V05 | Registry includes STD-DESIGN-001 + STD-FE-001 v2.5+ | STD-META-001 |
| V06 | STD-FE-001 §11/§12 delegate to STD-DESIGN-001 | STD-FE-001 |
| V07 | STD-FE-001 §2 anti-monolith thresholds present | STD-FE-001 §2 |
| V08 | All 3-backtick code fences have a language tag | STD-DOC-002 §4.3 |
| V09 | All `.md` files in `upload/` are English-only (<2% Cyrillic) | corpus-wide |
| V10 | STD-DOC-004 mandates badges for public repos (>=3 shields.io badges) | STD-DOC-004 v2.2+ |

## Two-layer CI gate

| Layer | Where | When | What |
|-------|-------|------|------|
| Pre-commit hook | `.githooks/pre-commit` | local, before each `git commit` | Runs `verify-standards.js` if any `.md` or `verify-*.js` is staged |
| GitHub Action | `.github/workflows/standards.yml` | remote, on push to main + every PR | Runs both `verify-standards.js` and `verify-cascade.js` |

See `STANDARDS.md` for the full maintenance protocol.

## Status

- 20 standards (all English-only)
- 2 guides (Hooks, Sandbox) — translated from Russian to English
- 57/57 invariant checks passing (10 permanent + 47 cascade)
- Two-layer CI gate active

---

Built with: Standards corpus + Node.js 20 + GitHub Actions
