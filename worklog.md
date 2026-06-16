---
Task ID: L1-L5
Agent: main (Super Z)
Task: Execute all 16 cascade tasks for Z.ai standards integration

Work Log:
- L1-001: Fixed STD-ENV-002 (ZAI_INTEGRATION_STANDARD.md) Section 5 — replaced manual `npx next dev` startup with sandbox-managed `init-fullstack` protocol. Updated Version 1.1 -> 1.2.
- L1-002: Fixed STD-ENV-002 log path — `/tmp/zdev.log` -> `/home/z/my-project/.zscripts/dev.log`. Added `.zscripts/` to path exceptions (Section 3.1).
- L1-003: Added Zod validation to all 3 API routes in Hooks Guide (chat, image, search). Each route now uses `safeParse` and returns `{ success, data? / error? }` format per STD-FE-001 Section 10.2/10.3.
- L2-001: Cleaned Hooks Guide from 11 Unicode violations (6 [OK] + 5 [FAIL] emoji replaced with text markers).
- L2-002: Cleaned Sandbox Guide from 4 Unicode violations ([FAIL] markers replaced).
- L3-001: Added Section 12 (AI Hook Patterns) to STD-FE-001 with useAI, useChat, useImage hooks, composition rules, error handling, token integration, pre-merge checklist. Version 2.3 -> 2.4.
- L3-002: Added Section 12 (Sandbox Troubleshooting) to STD-ENV-002 — diagnostic table, 3-level recovery procedures, health check codes, forbidden manual operations.
- L3-003: Added Section 13 (Git Submodule Integration) to STD-ENV-002 — adding, updating, rollback, workflow rules.
- L3-004: Added Section 9.2 (Canonical Client-Side Pattern) to STD-ENV-002 — useAI hook flow: client -> hook -> API route -> SDK -> chat.z.ai.
- L4-001: Updated STD-META-001 registry: added DESIGN domain (Section 3), added Section 4.12 with STD-DESIGN-001 v3.0.0, updated STD-FE-001 to 2.5, STD-ENV-002 to 1.3, STD-DOC-003 to 2.2.0, STD-META-001 to 1.2.
- L4-002: Added cross-references: STD-DOC-003 -> STD-DESIGN-001 (Section 16); STD-ARCH-001 -> STD-DESIGN-001 + ZAI-ARCH-002 (Section 7).
- L4-003: Added remaining anti-monolith thresholds to STD-FE-001: Function 50/80 lines, 4+ inline sub-sections [W] (Section 2.1); useEffect 3+ deps [I] / 4+ [W] (new Section 2.3). Version 2.4 -> 2.5.
- L4-004: Unified terminology "uniform severity principle" in STD-DOC-003, added lint-md.js reference.
- L5: Created and ran verify-cascade.js — 47/47 checks PASSED.

Stage Summary:
- 16 cascade tasks completed across 5 levels (L1-L5)
- 7 standards files modified:
  - STD-ENV-002 (ZAI_INTEGRATION_STANDARD.md): v1.1 -> v1.3
  - STD-FE-001 (FRONTEND_STANDARD.md): v2.3 -> v2.5
  - STD-META-001 (STANDARD_ID_SYSTEM.md): v1.1 -> v1.2
  - STD-DOC-003 (UNICODE_POLICY.md): cross-refs + terminology
  - STD-ARCH-001 (IMPLEMENTATION_ORDER.md): cross-refs
  - Hooks Guide: Zod validation + Unicode cleanup
  - Sandbox Guide: Unicode cleanup
- Verification script: /home/z/my-project/scripts/verify-cascade.js (47 checks, all pass)
- Key architectural decisions:
  - STD-DESIGN-001 NOT modified — it is mature (v3.0.0, 28 sections) and cascade tasks only add cross-references TO it
  - Anti-monolith skill rules integrated into STD-FE-001 as normative thresholds (Section 2.1, 2.3) with cross-ref to ZAI-ARCH-002 for decomposition procedure
  - AI Hook Patterns (Section 12 in STD-FE-001) delegate to STD-ENV-002 Section 9.2 for backend SDK flow and to STD-DESIGN-001 P12/P13 for animation/breakpoint tokens

---
Task ID: L1-004
Agent: main (Super Z)
Task: Create permanent verify-standards.js — invariants for future standard changes

Work Log:
- Added L1-004 task object to /home/z/my-project/scripts/cascade-tasks.js (now 17 tasks across 5 levels).
- Created /home/z/my-project/scripts/verify-standards.js (294 lines) — permanent invariant checker with 7 checks:
  - V01: STD-ENV-002 §5.1 startup uses init-fullstack, not `npx next dev`
  - V02: STD-ENV-002 §3+§5 use .zscripts/dev.log, not /tmp/zdev.log
  - V03: Hooks Guide API routes use Zod safeParse
  - V04: No emoji/Unicode graphic chars in 22 .md files (STD-DOC-003)
  - V05: STD-META-001 registry includes STD-DESIGN-001 + STD-FE-001 v2.5+
  - V06: STD-FE-001 §11/§12 delegate to STD-DESIGN-001 (no hardcoded hex tokens)
  - V07: STD-FE-001 §2 anti-monolith thresholds (Function 50/80, useEffect 3+/4+, inline 4+)
- Implemented extractSection() that skips fenced code blocks (so shell comments `# foo` inside ```bash blocks are NOT mistaken for markdown headings).
- First run: 5/7 PASS, 2 FAIL — both due to bugs in checker logic (not in standards):
  - V01 false negative: extractSection returned only 368 chars because `# Check if dev server` was misidentified as a level-1 heading.
  - V07 false negative: regex too strict — expected `useEffect ... 4+` on same line, but the standard uses table row `| 4+ | [W] Warning |`.
- Fixed both: rewrote extractSection with proper code-fence awareness, relaxed V07 to accept both inline and table formats.
- Second run: 7/7 PASS, exit 0.
- Added `verified_by: scripts/verify-standards.js#V##` header to 5 standards:
  - STD-ENV-002 (ZAI_INTEGRATION_STANDARD.md) → V01, V02
  - STD-FE-001 (FRONTEND_STANDARD.md) → V06, V07
  - STD-META-001 (STANDARD_ID_SYSTEM.md) → V05
  - STD-DOC-003 (UNICODE_POLICY.md) → V04
  - Hooks Guide → V03, V04
- Final run after headers: 7/7 PASS, exit 0.

Stage Summary:
- Permanent verifier now lives at /home/z/my-project/scripts/verify-standards.js
- Contract for future changes: whenever ANY standard is modified, the developer MUST
  (1) re-read verify-standards.js, (2) verify the relevant V## check still applies,
  (3) adjust or add a check if the invariant changed, (4) run `node scripts/verify-standards.js`
  and confirm exit code is 0.
- verified_by header in each .md standard creates a mechanical, discoverable link
  between standard and checker — changing a standard surfaces its verifier immediately.
- verify-standards.js is distinct from verify-cascade.js:
  - verify-cascade.js = one-shot, 47 checks tied to the 16 cascade tasks (L5-001..003)
  - verify-standards.js = permanent, 7 invariant checks, updated alongside standards
- CLI: `node scripts/verify-standards.js` (human-readable) or `--json` for CI.

---
Task ID: V08
Agent: main (Super Z)
Task: Add syntax-highlighting invariant V08 to verify-standards.js + fix real plain-fence violations

Work Log:
- Audited all 22 .md files in upload/standards-v2/standards/ + upload/ for code fence compliance with STD-DOC-002 §4.3 (Code block must use ```language) and §5.4 (Unknown Languages Rule — use `text` or `bash`).
- Created /home/z/my-project/scripts/scan-plain-fences.py — Python scanner with proper CommonMark fence-aware logic (distinguishes 3-backtick vs 4+ backtick containers, doesn't confuse closing fences with openings).
- First scan with naive approach: 13 apparent violations — investigated all, found they were either closing fences or 4-backtick containers (e.g. ````markdown containing nested ```typescript). Real violations: 0 in standards/, 6 in guides.
- Added V08 to verify-standards.js (~45 lines): same CommonMark fence-aware logic in JS. Scans all 22 .md files. Reports each plain ``` opening with file:line.
- V08 first run: 6 violations detected:
  - Hooks Guide L876 — "[OK]/[FAIL]" text example → ```text
  - Hooks Guide L982 — project/ tree structure → ```text
  - Sandbox Guide L221 — EADDRINUSE error log → ```text
  - Sandbox Guide L248 — "GET / 500" error log → ```text
  - Sandbox Guide L279 — "Module not found" error → ```text
  - Sandbox Guide L484 — /home/z/my-project/ tree → ```text
- Fixed all 6 by adding `text` language tag (appropriate for non-code output: tree structures, error messages, status markers).
- Added verified_by: scripts/verify-standards.js#V08 to STD-DOC-002 (MARKDOWN_STANDARD.md) header.
- Updated Hooks Guide verified_by to include V08 alongside V03, V04.
- Final run: 8/8 PASS, exit 0.

Stage Summary:
- verify-standards.js now has 8 invariant checks (V01-V08), all PASS.
- V08 prevents future regressions: any PR that adds a plain ``` code fence to a standard or guide will fail CI immediately.
- CommonMark-aware fence logic correctly handles 4-backtick containers (used in STD-DOC-002 §5.4 to show nested ```language examples) — these are NOT flagged.
- All 22 .md files now fully compliant with STD-DOC-002 §4.3 + §5.4.
- Syntax highlighting is therefore guaranteed to render correctly on GitHub, VS Code, Docusaurus, and any other CommonMark-compliant renderer.

---
Task ID: V09 + i18n
Agent: main (Super Z)
Task: Translate all .md files in upload/ to English + add V09 (English-only invariant)

Work Log:
- Audited all 25 .md files in upload/ for Cyrillic content:
  - 20 standards in upload/standards-v2/standards/ — already EN (0% cyr)
  - upload/MARKDOWN_STANDARD.md + upload/UNICODE_POLICY.md — already EN (duplicates of standards/)
  - upload/SKILL.md — already EN
  - upload/Hooks в Z.ai Полное Руководство.md — MIXED (17% cyr)
  - upload/Z.ai-Sandbox-Guide.md — RU (52% cyr)
- Translated Z.ai-Sandbox-Guide.md from RU to EN in-place (kept same filename).
  Translated all section headings, prose, table content, comments in bash blocks.
  Kept all code/commands/paths/identifiers verbatim.
- Deleted upload/Hooks в Z.ai Полное Руководство.md (RU filename).
- Created upload/Hooks-in-Z.ai-Guide.md — full English translation.
  Translated TOC, all section prose, table content, in-code comments (Russian "Печатает..." -> "Typing...", "Отправить" -> "Send", etc.), system prompts ("Ты полезный ассистент." -> "You are a helpful assistant."), button labels, error messages, "Хорошо"/"Плохо" -> "Good"/"Bad".
- Updated all script references to the renamed Hooks file:
  - scripts/verify-standards.js (HOOKS_GUIDE path)
  - scripts/verify-cascade.js (hooksGuide path)
  - scripts/scan-plain-fences.py (EXTRA_FILES list)
- Added V09 invariant to verify-standards.js (~40 lines):
  - Scans all 25 .md files in upload/
  - Strips fenced code blocks (so code samples do not skew the ratio)
  - Computes Cyrillic vs Latin letter ratio
  - Fails if any file has >= 2% Cyrillic (tolerates incidental names/citations)
- Added `verified_by: scripts/verify-standards.js#V09 (English-only)` to:
  - upload/Hooks-in-Z.ai-Guide.md header
  - upload/Z.ai-Sandbox-Guide.md header
- Final verification:
  - verify-standards.js: 9/9 PASS (V01-V09)
  - verify-cascade.js: 47/47 PASS

Stage Summary:
- All 25 .md files in upload/ are now English-only (0% Cyrillic in prose).
- V09 invariant locks this in: any future PR that introduces Russian (or other Cyrillic) content into a standard or guide will fail CI immediately.
- Renamed file: "Hooks в Z.ai Полное Руководство.md" -> "Hooks-in-Z.ai-Guide.md" (filename also English, no spaces — friendlier for shells and URLs).
- All references to old filename updated in 3 scripts (verify-standards.js, verify-cascade.js, scan-plain-fences.py).
- Total verify-standards.js checks: 9 (V01-V09). Total verify-cascade.js checks: 47. Grand total: 56 checks, all PASS.

---
Task ID: V10 + Badges
Agent: main (Super Z)
Task: Make README badges mandatory for public repos (Option B + C from user feedback)

Work Log:
- User feedback: README files pushed to GitHub should have badges; current STD-DOC-004 v2.1 only marks Badges as "Optional" with a single example, so agents skip them.
- User chose combined Option B (template update: Required + checklist item) + Option C (new V## invariant).
- Updated /home/z/my-project/upload/standards-v2/standards/README_TEMPLATE.md (STD-DOC-004 v2.1 -> v2.2):
  - Header: bumped version to 2.2, added `verified_by: scripts/verify-standards.js#V10 (§1 Badges Required, §2 >=3 badge examples, §3 checklist item)`.
  - §1 mandatory-sections table: row #2 changed from `Optional | Technology badges (SVG only)` to `Yes (public repos) | Technology badges (SVG only). Mandatory for public repos. Minimum 3 badges: tech stack, license, build/status.`
  - §1 added a Note block: badges remain optional for private repos, mandatory for public repos, see §4 for canonical set.
  - §2 template block: replaced single `![Badge](...)` line with 6 canonical shields.io badges (Next.js, TypeScript, Tailwind CSS, License MIT, Build Status, PRs Welcome). All use `style=flat-square` per the convention defined in new §4.
  - §3 checklist: added item `[ ] At least 3 badges present (tech stack + license + build/status) - required for public repos`.
  - New §4 "Canonical Badge Set": table declaring which 3 badges are Mandatory (tech, language, license) vs Recommended (CI status, PRs welcome, secondary tech). Plus a "Badge Style Convention" subsection (flat-square style, shields.io URLs only, prefer logos from simpleicons.org, no raster PNGs, no animated badges).
  - Renumbered downstream sections: §4 Example Compliance -> §5, §5 Cross-References -> §6.
  - File was CRLF; converted to LF as part of the same edit pass (consistent with other standards files which are LF).
- Added V10 invariant to /home/z/my-project/scripts/verify-standards.js (~46 lines, inserted before the Output section):
  - Sub-check (a): §1 table row #2 must contain "Yes" and NOT contain "Optional".
  - Sub-check (b): §2 template block (extracted from 4-backtick fence) must contain >= 3 `![...](https://img.shields.io/...)` lines. Counts 6 currently.
  - Sub-check (c): §3 checklist must contain both the word "badge" and the phrase "public repos".
  - Detail string reports all three sub-check booleans for fast debugging.
- Re-ran verify-standards.js: 10/10 PASS (V01-V10), exit 0.

Stage Summary:
- STD-DOC-004 is now v2.2. Badges are mandatory for public repos; agents using this template will produce GitHub-ready READMEs from day one.
- V10 locks in three structural properties: §1 says "Yes (public repos)", §2 has >=3 shields.io badges, §3 checklist has a badge item. Any future PR that removes badges from the template (or weakens the wording back to Optional) will fail CI immediately.
- Total verify-standards.js checks: 10 (V01-V10). All PASS.
- The canonical badge set in §4 gives agents concrete URLs to copy-paste; they only need to substitute `<owner>/<repo>` for the Build Status badge and pick the correct license string.

---
Task ID: CI + Hooks
Agent: main (Super Z)
Task: Two-layer CI gate for standards (GitHub Action + pre-commit hook) + delete obsolete snapshot

Work Log:
- Confirmed upload/standards-extracted/ is an obsolete snapshot:
  - Missing DESIGN_SYSTEM_STANDARD.md (added in cascade L4-001)
  - All 7 modified files (FRONTEND_STANDARD, IMPLEMENTATION_ORDER, MARKDOWN_STANDARD, README_TEMPLATE, STANDARD_ID_SYSTEM, UNICODE_POLICY, ZAI_INTEGRATION_STANDARD) are stale versions without cascade/V10 changes
  - rm -rf upload/standards-extracted/
- Created /home/z/my-project/.github/workflows/standards.yml (~60 lines):
  - Triggers: push to main/master on paths upload/**, scripts/verify-*.js, .github/workflows/standards.yml; same for pull_request; plus workflow_dispatch
  - Job: ubuntu-latest, Node 20, npm cache, 5-minute timeout
  - Steps: checkout -> setup-node -> run verify-standards.js -> run verify-cascade.js -> GitHub step summary
  - concurrency group: standards-${{ github.ref }} with cancel-in-progress
  - Permissions: contents: read (least privilege)
- Created /home/z/my-project/.githooks/pre-commit (executable, ~50 lines):
  - Resolves repo root via git rev-parse
  - Skips silently if scripts/verify-standards.js doesn't exist yet
  - Skips if no staged .md / verify-*.js / standards.yml files (saves time on unrelated commits)
  - Runs node scripts/verify-standards.js; on failure prints actionable message + reminds about --no-verify escape hatch
- Created /home/z/my-project/scripts/install-hooks.sh (executable, ~40 lines):
  - One-time bootstrap: git config core.hooksPath .githooks + chmod +x .githooks/*
  - Refuses to run if .git is missing
  - Prints the active hook path and lists installed hooks
  - Designed to be re-runnable and idempotent
  - Chose pure bash + git config over Husky/lefthook to avoid npm dependency
- Ran install-hooks.sh successfully: core.hooksPath now .githooks, pre-commit active
- Created /home/z/my-project/STANDARDS.md (~90 lines):
  - Documents the two-layer CI gate (local hook + remote action)
  - Maintenance protocol for changing an invariant (5 steps)
  - Bypass policy (--no-verify discouraged, escape hatch documented)
  - Verifier inventory table (verify-standards.js + verify-cascade.js)
  - File tree of relevant paths
- Final verify run: 10/10 PASS (V01-V10), exit 0.

Stage Summary:
- Standards corpus now protected by two complementary layers:
  1. Local pre-commit hook (instant feedback, runs only when .md/verify-*.js is staged)
  2. Remote GitHub Action (blocks PR merge, runs both verifiers)
- Pure-bash implementation; no npm dependency added.
- Bootstrap is one command: bash scripts/install-hooks.sh
- The only way to bypass both layers is `git commit --no-verify` AND someone reviewing the PR ignores a red CI check. That is the documented escape hatch.
- Total artifacts added: 4 (workflows/standards.yml, .githooks/pre-commit, scripts/install-hooks.sh, STANDARDS.md)
- Total artifacts deleted: 1 (upload/standards-extracted/ — entire obsolete directory)
- verify-standards.js: still 10/10 PASS. verify-cascade.js: still 47/47 PASS. No regression.

---
Task ID: Submodule Portability
Agent: main (Super Z)
Task: Make corpus portable for git-submodule consumption + document protection layers

Work Log:
- User question: can this corpus be used as a submodule (in new vs existing projects)? Is there protection against host projects pushing back into the corpus repo?
- Answer: yes to both. Designed 3-layer protection (branch protection + git submodule design + corpus CI).
- But found a BLOCKER: scripts/verify-standards.js, verify-cascade.js, scan-plain-fences.py, cross_test_report.py all had hardcoded `/home/z/my-project/...` paths. They would fail in any other location (submodule, CI checkout, fork clone).
- Fixed verify-standards.js (lines 36-47):
  - Replaced `const STANDARDS_DIR = '/home/z/my-project/upload/standards-v2/standards';` and `UPLOAD_DIR` with `path.resolve(__dirname, '..')`-based relative paths.
  - Added comment block explaining the 3 contexts: standalone / submodule / CI.
- Fixed verify-cascade.js (lines 6-13 + 226-244):
  - Same relative-path pattern for STANDARDS_DIR and UPLOAD_DIR.
  - Skill path lookup (L5-001): was hardcoded `/home/z/my-project/upload/SKILL.md` with `/home/z/my-project/skills/SKILL.md` fallbacks. Replaced with `path.join(UPLOAD_DIR, 'SKILL.md')` + `path.join(REPO_ROOT, 'skills', ...)` fallbacks.
- Fixed scan-plain-fences.py (lines 18-29):
  - Replaced hardcoded STANDARDS_DIR and EXTRA_FILES with `os.path.dirname(__file__)`-relative paths.
- Fixed cross_test_report.py (lines 8-23 + 747-753):
  - XLSX_SKILL_DIR now env-overridable (`XLSX_SKILL_DIR=...`) with default `os.path.dirname(REPO_ROOT)/skills/xlsx`.
  - Output path now env-overridable (`REPORT_OUTPUT_PATH=...`) with default `<REPO_ROOT>/download/standards_cross_test_report.xlsx`.
  - Added `os.makedirs(..., exist_ok=True)` so the output dir is auto-created.
- Submodule simulation test (in /tmp/submodule-test/host-repo/standards/):
  - Copied only upload/ and scripts/ to a fresh location (no /home/z/my-project).
  - Ran verify-standards.js: 10/10 PASS.
  - Ran verify-cascade.js: 47/47 PASS.
  - Confirmed full portability.
- Updated STANDARDS.md:
  - Added "Using as a submodule" section with 7 subsections:
    * Adding to a new host project
    * Adding to an existing project
    * Cloning a host project that uses this submodule
    * Running verifiers from the host project
    * Wiring the host project's CI to the submodule's invariants
    * Updating the submodule in a host project
    * Pinning to a specific release
  - Added "Protection: preventing host projects from pushing back" section with 4 subsections:
    * Layer 1: GitHub branch protection (configure on corpus repo)
    * Layer 2: Submodule design (default git behavior — host push never includes submodule contents)
    * Layer 3: CI on the corpus repo (already active, runs on every PR)
    * Escape hatch: fork -> branch -> PR -> maintainer review -> bump submodule pointer
  - Updated "Files of interest" to note that verify-*.js paths are now relative to __dirname.
- Rebuilt /home/z/my-project/download/z-ai-standards.zip:
  - Same 77 files, 246K (was 244K — +2K for the expanded STANDARDS.md).
  - All path-fixed scripts included.

Stage Summary:
- Corpus is now fully portable — works standalone, as submodule, or in CI without any environment-specific configuration.
- Three-layer protection documented: (1) branch protection on corpus repo, (2) git submodule push semantics, (3) active CI on corpus repo.
- Host projects can integrate the corpus via `git submodule add` (new or existing projects) and pin to specific tags for production stability.
- 57/57 invariants still pass after the path migration — no regression.
- Archive z-ai-standards.zip refreshed at /home/z/my-project/download/z-ai-standards.zip, ready to push to GitHub.

---
Task ID: Version Management
Agent: main (Super Z)
Task: Add full version management system (VERSION + CHANGELOG + check-updates + CI template + playbook)

Work Log:
- User question: do host projects auto-check for corpus updates? Is there version control / blocking / update management? Instructions?
- Answer before this task: NO — only manual `git submodule update --remote`. No VERSION file, no tags, no auto-check, no playbook.
- Designed and implemented 5-component system:
  1. VERSION file (single-line semver "2.2.0")
  2. CHANGELOG.md (Keep a Changelog 1.1.0 format, entries for 2.0.0 / 2.1.0 / 2.2.0)
  3. scripts/check-updates.sh (host helper)
  4. host-project-templates/.github/workflows/standards-version-check.yml (CI template)
  5. STANDARDS.md sections: Versioning, Release procedure, Host project: checking for updates, Host project: update playbook

- Created /home/z/my-project/VERSION (3 bytes): single line "2.2.0".
- Created /home/z/my-project/CHANGELOG.md (~80 lines):
  - Header: Keep a Changelog 1.1.0 + SemVer 2.0.0 references
  - [2.2.0] - 2026-06-16: Added (V10, badges, CI workflow, hooks, STANDARDS.md, REPO-README, .env.example), Changed (README_TEMPLATE v2.1->v2.2, all scripts portable, Hooks filename), Removed (standards-extracted), Fixed (V09 EN-only lock, V08 CommonMark fence handling)
  - [2.1.0] - 2026-06-16: Added (V08, V09, English translations of both guides, permanent verifier)
  - [2.0.0] - 2026-06-16: Added (initial 20 standards + 5 docs + 17 cascade tasks + cascade verifier), Changed (STD-ENV-002 v1.1->v1.3, STD-FE-001 v2.3->v2.5, STD-META-001 v1.1->v1.2, STD-DOC-003 v2.1->v2.2)

- Created /home/z/my-project/scripts/check-updates.sh (~135 lines, executable):
  - Reads VERSION from corpus root
  - Auto-detects upstream URL from host project's .gitmodules (matches corpus dir path)
  - Falls back to canonical git@github.com:z-ai/z-ai-standards.git if .gitmodules absent
  - Override via STANDARDS_CORPUS_URL env var
  - Fetches tags via `git ls-remote --tags` (does NOT modify local checkout)
  - Filters to semver-only tags ( strips ^{} dereference entries)
  - Compares using `sort -V`
  - Exit codes: 0=up-to-date/ahead, 1=behind, 2=could-not-determine
  - STANDARDS_BEHIND_OK=1 makes "behind" advisory-only (exit 0 with warning)
  - Prints actionable update instructions on failure

- Created /home/z/my-project/host-project-templates/.github/workflows/standards-version-check.yml (~65 lines):
  - Triggers: weekly cron (Mon 09:00 UTC), push to main on standards/** paths, workflow_dispatch
  - Steps: checkout with submodules -> setup-node 20 -> verify-standards.js -> verify-cascade.js -> check-updates.sh -> GitHub Step Summary
  - Two env vars for tuning: STANDARDS_CORPUS_URL, STANDARDS_BEHIND_OK
  - Documented setup: copy to host's .github/workflows/, replace <owner>, optionally flip BEHIND_OK

- Created /home/z/my-project/host-project-templates/README.md (~50 lines):
  - Explains what the template is for
  - 4-step usage (submodule add, copy workflow, edit URL/BEHIND_OK, commit+push)
  - What the workflow does (5 steps)
  - Cross-reference to STANDARDS.md and CHANGELOG.md

- Updated /home/z/my-project/STANDARDS.md:
  - "Files of interest" table extended with VERSION, CHANGELOG.md, check-updates.sh, host-project-templates/
  - New section "Versioning": SemVer policy table (MAJOR/MINOR/PATCH), where version lives, release procedure (6-step maintainer playbook)
  - New section "Host project: checking for updates": manual check (with example output for both up-to-date and behind cases), exit codes table, automatic check in CI (what the workflow does, how to make it advisory-only)
  - New section "Host project: update playbook": when to update (per-bump-type urgency), how to update (8-step safe procedure with branch+PR), how to roll back (with example commit message), how to pin to specific version (production strategy)
  - All commands are copy-pasteable; placeholders use real version v2.2.0

- Final verification:
  - verify-standards.js: 10/10 PASS
  - verify-cascade.js: 47/47 PASS
  - check-updates.sh: runs correctly, gracefully handles missing upstream (exit 0 with warning, since no tags yet)
- Rebuilt /home/z/my-project/download/z-ai-standards.zip:
  - 258K (was 246K, +12K for VERSION + CHANGELOG + check-updates + workflow template + README)
  - 85 files (was 77, +8: VERSION, CHANGELOG.md, check-updates.sh, host-project-templates/.github/workflows/standards-version-check.yml, host-project-templates/README.md)

Stage Summary:
- Corpus now has a complete version management system: VERSION file, CHANGELOG, check-updates script, CI template for host projects, and a full maintainer + host playbook in STANDARDS.md.
- Host projects can: (1) auto-check weekly via CI, (2) manually check via `bash standards/scripts/check-updates.sh`, (3) see exactly which version is behind, (4) follow a documented 8-step update procedure, (5) roll back if needed, (6) pin to a specific tag for production stability.
- Corpus maintainers have a 6-step release procedure: update VERSION, edit CHANGELOG, commit, tag, push, CI auto-runs.
- Three layers of version-blocking protection: (1) submodule pins to a commit/tag, (2) CI workflow fails when host is behind upstream (advisory mode optional), (3) branch protection on corpus repo prevents bad releases from being tagged.
- 57/57 invariants still pass — no regression from the new files.
- Archive refreshed at /home/z/my-project/download/z-ai-standards.zip, ready for GitHub push.
